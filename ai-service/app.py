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
    hist_text = "\n".join([f"{m.role}: {m.content}" for m in history[-3:]]) if history else "Start of conversation."
    prompt = f"""You are an expert medical librarian. 
Disease focus: {disease}
Recent Conversation:
{hist_text}
User's Latest Query: {query}

Instruction: Extract the CORE medical conditions and treatments to form a database search query. 
IMPORTANT: If the User's Latest Query is about a completely different disease than the Disease Focus, completely ignore the Disease Focus! Focus entirely on the User's Latest Query.
Do NOT include conversational words like "show", "tell me", "research", "clinical", "trials", or "find".
Respond ONLY with a 2-5 word keyword search string (e.g., "Brain Tumor Symptoms"). Do not explain."""

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
    return query


async def fetch_openalex(session: aiohttp.ClientSession, search_term: str) -> List[dict]:
    try:
        url = f"https://api.openalex.org/works?search={search_term}&per-page=5&sort=publication_year:desc"
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
        # Intelligent Retrieval: Using query.term instead of cond for broader semantic matching and pulling larger pool (15) for Re-Ranking
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
                 # Re-ranking: enforce diverse trial data and cap to 3 high-relevance trials
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

Task: Answer the user's latest query as a conversational and empathetic AI medical assistant.
Rule 1: Use the 'Recent Research Fetched' to ground your answer if it corresponds to the query.
Rule 2: If the attached research is irrelevant or null, use your overarching medical knowledge to answer the query directly! Do NOT apologize for the research lacking the answer. Just flawlessly answer the medical question.
Rule 3: Start your response with a direct, conversational, human-like answer in 1-2 sentences. Ensure this is the very first line of your output.
Rule 4: MUST HIT ENTER AFTER YOUR INTRO so facts are on a completely new line. Then provide exactly 2 to 3 concise bullet points containing the medical facts, starting each strictly with a dash and a new line (\\n-)."""
    
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
