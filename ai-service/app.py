import asyncio
import aiohttp
import os
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional

app = FastAPI(title="MedAssist AI Engine")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class Message(BaseModel):
    role: str
    content: str
    
class QueryRequest(BaseModel):
    disease: str
    query: str
    location: Optional[str] = None
    history: List[Message] = []

class ResultItem(BaseModel):
    id: str
    title: str
    source: str
    date: str
    summary: str
    url: str
    type: str
    metadata: Optional[dict] = {}

class AnalysisResponse(BaseModel):
    results: List[ResultItem]
    insights: List[str]

OLLAMA_URL = os.getenv("OLLAMA_URL", "http://127.0.0.1:11434")
OLLAMA_MODEL = os.getenv("OLLAMA_MODEL", "phi3")

async def expand_query_with_llm(session: aiohttp.ClientSession, disease: str, query: str, history: List[Message]) -> str:
    prompt = f"""You are a rigid medical search formatter.
Context Disease: {disease}
Latest User Query: {query}

Instruction: You must translate the user's query into a strict 2-3 word search phrase.
Format: [Disease] [Specific Topic]
Example 1: Query="Can we prevent it?", Disease="Cardiovascular" -> "Cardiovascular Prevention"
Example 2: Query="What are the symptoms?", Disease="Brain Tumor" -> "Brain Tumor Symptoms"
Example 3: Query="How is it treated?", Disease="Diabetes" -> "Diabetes Treatment"

Output EXACTLY AND ONLY the translated search phrase. No conversational words, no quotes, no period."""

    try:
        headers = { "ngrok-skip-browser-warning": "true" }
        async with session.post(f"{OLLAMA_URL}/api/generate", json={
            "model": OLLAMA_MODEL,
            "prompt": prompt,
            "stream": False
        }, headers=headers, timeout=10) as response:
            if response.status == 200:
                data = await response.json()
                s_query = data.get("response", "").strip(' \n"\'')
                if len(s_query) < 60 and s_query: 
                    return s_query
    except Exception as e:
        print("Query expansion failed", e)
    return f"{disease} {query}".strip()


import urllib.parse

async def fetch_openalex(session: aiohttp.ClientSession, search_term: str) -> List[dict]:
    try:
        safe_term = urllib.parse.quote_plus(search_term)
        url = f"https://api.openalex.org/works?search={safe_term}&per-page=5"
        async with session.get(url, timeout=10) as response:
            if response.status == 200:
                data = await response.json()
                results = []
                for work in data.get('results', [])[:3]:
                    abstract_index = work.get('abstract_inverted_index')
                    summary = "Abstract not available."
                    if abstract_index:
                        words = sorted(abstract_index.items(), key=lambda x: x[1][0])
                        summary = " ".join([word[0] for word in words])[:250] + "..."
                    
                    results.append({
                        "id": work.get('id', '').split('/')[-1],
                        "title": work.get('display_name') or 'Unknown Title',
                        "source": "OpenAlex Repository",
                        "date": str(work.get('publication_year', '')),
                        "summary": summary,
                        "url": work.get('id', '#'),
                        "type": "publication",
                        "metadata": {}
                    })
                return results
    except Exception as e:
        print(f"OpenAlex Error: {e}")
    return []

async def fetch_clinicaltrials(session: aiohttp.ClientSession, search_term: str) -> List[dict]:
    try:
        url = f"https://clinicaltrials.gov/api/v2/studies?query.term={search_term}&pageSize=15&sort=@Relevance"
        async with session.get(url, timeout=10) as response:
             if response.status == 200:
                 data = await response.json()
                 results = []
                 for study in data.get('studies', []):
                     protocol = study.get('protocolSection', {})
                     id_module = protocol.get('identificationModule', {})
                     status = protocol.get('statusModule', {})
                     desc = protocol.get('descriptionModule', {})
                     eligibility = protocol.get('eligibilityModule', {})
                     contacts = protocol.get('contactsLocationsModule', {})
                     
                     nct_id = id_module.get('nctId', '')
                     title = id_module.get('briefTitle', 'Unknown Trial')
                     summary = desc.get('briefSummary', 'Trial summary not available.')[:250] + '...'
                     overall_status = status.get('overallStatus', 'Unknown Status')
                     criteria = eligibility.get('eligibilityCriteria', 'Criteria not specified.')[:150] + '...'
                     
                     location_detail = f"{len(contacts.get('locations', []))} listed locations"
                     if contacts.get('locations'):
                         loc = contacts['locations'][0]
                         location_detail = f"{loc.get('facility', '')}, {loc.get('city', '')}, {loc.get('country', '')}".strip(', ')
                         
                     contact_info = "Contact info available on site."
                     if contacts.get('centralContacts'):
                         ct = contacts['centralContacts'][0]
                         contact_info = f"{ct.get('name', '')} | {ct.get('phone', ct.get('email', 'No immediate contact details'))}"
                     
                     results.append({
                         "id": nct_id,
                         "title": title,
                         "source": "ClinicalTrials.gov",
                         "date": status.get('startDateStruct', {}).get('date', 'Unknown Date'),
                         "summary": summary.replace('\n', ' '),
                         "url": f"https://clinicaltrials.gov/study/{nct_id}",
                         "type": "trial",
                         "metadata": {
                             "status": overall_status,
                             "eligibility": criteria,
                             "location": location_detail,
                             "contact": contact_info
                         }
                     })
                 return results[:3]
    except Exception as e:
        print(f"ClinicalTrials Error: {e}")
    return []


async def generate_insights(session: aiohttp.ClientSession, disease: str, query: str, context_texts: str, history: List[Message]) -> List[str]:
    hist_text = "\n".join([f"{m.role}: {m.content}" for m in history[-3:]]) if history else "No previous history."
    
    prompt = f"""You are an advanced clinical and medical AI.
Context Focus: {disease}
Previous Conversation:
{hist_text}

New User Query: {query}
Recent Research Fetched:
{context_texts}

Task: Answer the user's latest query using highly accurate medical facts.
Rule 1: Use the 'Recent Research Fetched' to ground your answer if it corresponds to the query.
Rule 2: If the attached research is irrelevant, use your overarching medical knowledge.
Rule 3: YOU MUST ONLY OUTPUT BULLET POINTS. No introductory sentences, no greetings, no conclusions.
Rule 4: Output exactly 3 medical facts. Each fact must start with a "-" and be pushed to a brand new line. Do not combine them.
"""
    
    try:
        headers = { "ngrok-skip-browser-warning": "true" }
        async with session.post(f"{OLLAMA_URL}/api/generate", json={
            "model": OLLAMA_MODEL,
            "prompt": prompt,
            "stream": False
        }, headers=headers, timeout=25) as response:
            if response.status == 200:
                data = await response.json()
                text = data.get("response", "")
                
                # Enforce clean separation even if LLM slightly messes up newlines
                text = text.replace(' - ', '\n- ')
                
                insights = [line.strip('- *') for line in text.split('\n') if len(line.strip()) > 10]
                return insights[:5]
    except Exception as e:
        print(f"Ollama Error: {e}")
        return [
            f"Local AI Model ({OLLAMA_MODEL}) is not reachable on {OLLAMA_URL}.",
            "Ensure Ollama is installed and run: `ollama run phi3`",
            f"Your context {disease} + {query} was noted, but local inference is down."
        ]
    return ["Failed to synthesize AI insights."]

@app.post("/api/analyze")
async def analyze_query(req: QueryRequest) -> AnalysisResponse:
    async with aiohttp.ClientSession() as session:
        # LLM Reasoning: Context aware query expansion
        search_engine_term = await expand_query_with_llm(session, req.disease, req.query, req.history)
        
        openalex_task = fetch_openalex(session, search_engine_term)
        clinical_task = fetch_clinicaltrials(session, search_engine_term)
        
        results_nested = await asyncio.gather(openalex_task, clinical_task)
        
        combined_results = []
        for r in results_nested:
            combined_results.extend(r)
        
        combined_results = combined_results[:8]

        if not combined_results:
             context_texts = "No literature found matching criteria."
             insights = [f"No recent data available matching '{search_engine_term}'."]
        else:
             context_texts = " | ".join([f"{r['title']}: {r['summary']}" for r in combined_results])
             insights = await generate_insights(session, req.disease, req.query, context_texts, req.history)
        
        return AnalysisResponse(
            results=combined_results,
            insights=insights
        )
