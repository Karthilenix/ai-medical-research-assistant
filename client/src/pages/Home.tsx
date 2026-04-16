import React, { useState, useContext, useEffect } from 'react';
import Navbar from '../components/Navbar';
import ContextForm from '../components/ContextForm';
import ResultCard, { ResultItem } from '../components/ResultCard';
import InsightsPanel from '../components/InsightsPanel';
import Loader from '../components/Loader';
import api from '../services/api';
import { AuthContext } from '../context/AuthContext';

export interface Turn {
    query: string;
    results: ResultItem[];
    insights: string[];
    isFollowUp: boolean;
}

const Home: React.FC = () => {
  const { user } = useContext(AuthContext);
  const [isLoading, setIsLoading] = useState(false);
  const [conversation, setConversation] = useState<Turn[]>([]);
  const [diseaseContext, setDiseaseContext] = useState('');
  
  // ChatGPT-like History State
  const [sessionId, setSessionId] = useState<string>('new');
  const [sessionList, setSessionList] = useState<any[]>([]);

  // Fetch past sessions when user logs in
  useEffect(() => {
     if (user) {
         api.get(`/sessions/user/${user._id}`).then(res => {
             setSessionList(res.data);
         }).catch(err => console.error("Failed to load sessions", err));
     }
  }, [user]);

  // Load a specific session from sidebar
  const loadSession = async (id: string) => {
      setIsLoading(true);
      try {
          const res = await api.get(`/sessions/${id}`);
          setSessionId(res.data._id);
          setDiseaseContext(res.data.diseaseContext);
          setConversation(res.data.conversation || []);
      } catch (err) {
          console.error("Failed to load session", err);
      }
      setIsLoading(false);
  };

  // Start perfectly fresh
  const startNewSession = () => {
      setSessionId('new');
      setConversation([]);
      setDiseaseContext('');
  };

  const deleteSession = async (e: React.MouseEvent, id: string) => {
      e.stopPropagation();
      try {
          await api.delete(`/sessions/${id}`);
          setSessionList(prev => prev.filter(s => s._id !== id));
          if (sessionId === id) {
              startNewSession();
          }
      } catch (err) {
          console.error("Failed to delete session", err);
      }
  };

  const handleSearch = async (data: { disease: string; query: string; location: string }, isFollowUp: boolean = false) => {
    setIsLoading(true);
    const currentDisease = isFollowUp ? diseaseContext : data.disease;
    
    if (!isFollowUp) {
       setDiseaseContext(currentDisease);
    }
    
    const history = conversation.map(turn => [
        { role: 'user', content: turn.query },
        { role: 'assistant', content: turn.insights.join(' ') }
    ]).flat();

    try {
      const response = await api.post('/query', {
          disease: currentDisease,
          query: data.query,
          location: data.location,
          userId: user?._id || undefined,
          history: history
      });
      
      const newTurn = {
          query: data.query,
          results: response.data.results || [],
          insights: response.data.insights || [],
          isFollowUp
      };
      
      const updatedConversation = [...conversation, newTurn];
      setConversation(updatedConversation);
      
      // Auto-save the session immediately like ChatGPT
      if (user) {
          const title = isFollowUp ? undefined : data.query.substring(0, 30) + '...';
          const sessionRes = await api.post(`/sessions/${sessionId}`, {
              userId: user._id,
              title: title,
              conversation: updatedConversation,
              diseaseContext: currentDisease
          });
          
          if (sessionId === 'new') {
              setSessionId(sessionRes.data._id);
              // Refresh sidebar to show new session
              api.get(`/sessions/user/${user._id}`).then(r => setSessionList(r.data));
          }
      }

      setIsLoading(false);
    } catch (error: any) {
      console.error(error);
      const errorTurn = {
          query: data.query,
          results: [],
          insights: [`System Error: Unable to reach the AI Engine. Please check if your FastAPI service is awake and running properly! (${error?.message || 'Timeout'})`],
          isFollowUp
      };
      setConversation(prev => [...prev, errorTurn]);
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex font-sans">
      
      {/* Sidebar: ChatGPT Style Memory */}
      {user && (
        <aside className="w-64 bg-gray-900 text-white flex flex-col h-screen sticky top-0 flex-shrink-0 shadow-2xl z-40 hidden md:flex">
           <div className="p-4 flex-shrink-0">
              <button onClick={startNewSession} className="w-full flex items-center gap-2 justify-center bg-gray-800 hover:bg-gray-700 text-sm font-bold py-3 rounded-xl border border-gray-700 transition-colors">
                 <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"/></svg>
                 New Research
              </button>
           </div>
           
           <div className="flex-grow overflow-y-auto custom-scrollbar px-3 overflow-x-hidden">
              <span className="text-xs font-bold text-gray-500 uppercase tracking-widest px-2 mb-2 block">History</span>
              {sessionList.map(session => (
                 <div key={session._id} className={`w-full flex justify-between items-center p-3 rounded-lg mb-1 transition-all group ${sessionId === session._id ? 'bg-gray-800 text-white font-bold' : 'text-gray-400 hover:bg-gray-800 hover:text-gray-200'}`}>
                    <button onClick={() => loadSession(session._id)} className="text-sm truncate flex-grow text-left">
                       {session.title || "Untitled Research"}
                    </button>
                    <button onClick={(e) => deleteSession(e, session._id)} className="text-gray-500 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity p-1">
                       <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                    </button>
                 </div>
              ))}
              {sessionList.length === 0 && <p className="text-xs text-gray-500 p-2 italic">No past sessions.</p>}
           </div>
        </aside>
      )}

      {/* Main Content Area */}
      <div className="flex-grow flex flex-col h-screen overflow-y-auto">
        <Navbar />
        <main className="flex-grow max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 w-full flex flex-col gap-10 pb-32">
          
          {conversation.length === 0 && (
            <header className="text-center max-w-2xl mx-auto mt-8">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 text-blue-700 text-xs font-bold mb-4 border border-blue-100">
                <span className="w-2 h-2 rounded-full bg-blue-600 animate-pulse"></span>
                Context Memory Enabled
              </div>
              <h1 className="text-4xl sm:text-5xl font-extrabold text-gray-900 tracking-tight mb-4 leading-tight">
                Accelerate Your <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">Medical Research</span>
              </h1>
              <p className="text-base text-gray-500 mb-4">
                Harness the power of AI to synthesize clinical trials and medical insights.
              </p>
            </header>
          )}

          <section className="max-w-3xl mx-auto w-full relative z-10 transition-all duration-500 ease-in-out transform">
            {conversation.length === 0 ? (
               <ContextForm onSearch={(data) => handleSearch(data, false)} isLoading={isLoading} />
            ) : null}
          </section>

          {conversation.map((turn, index) => (
            <section key={index} className="mt-2 flex flex-col gap-6 animate-fade-in-up border-b border-gray-200 pb-12">
               {/* User Chat Bubble */}
               <div className="flex justify-end w-full">
                 <div className="bg-indigo-600 text-white p-4 rounded-2xl rounded-tr-sm shadow-md max-w-xl">
                    <span className="font-bold block mb-1 text-xs uppercase tracking-wider text-indigo-200">You:</span>
                    <span className="font-medium text-lg leading-relaxed">{turn.query}</span>
                 </div>
               </div>

               <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start mt-4">
                  {/* Main Priority: AI Chatbot Insights & Trials */}
                  <div className="col-span-1 lg:col-span-2 flex flex-col gap-8">
                     <div className="flex items-start gap-4">
                        <div className="bg-white border-2 border-indigo-100 p-2 rounded-full shadow-sm flex-shrink-0 mt-1">
                           <svg className="w-8 h-8 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                        </div>
                        <div className="flex-grow">
                           <InsightsPanel insights={turn.insights} />
                        </div>
                     </div>

                     {turn.results.some(r => r.type === 'trial') && (
                        <div className="ml-14 bg-emerald-50/50 p-6 rounded-2xl border border-emerald-100 shadow-sm">
                           <h3 className="font-bold text-emerald-800 uppercase tracking-widest text-xs mb-4 flex items-center gap-2">
                               <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                               Found Clinical Trials
                           </h3>
                           <div className="grid grid-cols-1 gap-4">
                               {turn.results.filter(r => r.type === 'trial').map(trial => (
                                  <ResultCard key={trial.id} result={trial} />
                               ))}
                           </div>
                        </div>
                     )}
                  </div>

                  {/* Secondary Priority: Research Papers Context Sidebar */}
                  <div className="col-span-1 bg-gray-50/80 p-5 rounded-2xl border border-gray-100 shadow-inner h-[600px] overflow-y-auto custom-scrollbar">
                    <div className="flex justify-between items-center border-b border-gray-200 pb-3 mb-4 sticky top-0 bg-gray-50/90 backdrop-blur-sm z-10 pt-1">
                      <h2 className="text-sm font-bold text-gray-700 uppercase tracking-widest flex items-center gap-2">
                        <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                        Research Papers
                      </h2>
                      <span className="text-xs font-bold text-white bg-gray-400 px-2 py-0.5 rounded-full">
                         {turn.results.filter(r => r.type === 'publication').length}
                      </span>
                    </div>
                    <div className="flex flex-col gap-4">
                      {turn.results.filter(r => r.type === 'publication').map((result) => (
                        <ResultCard key={result.id} result={result} />
                      ))}
                      {turn.results.filter(r => r.type === 'publication').length === 0 && (
                          <p className="text-xs text-gray-500 italic text-center mt-10">No specific research papers associated with this reply.</p>
                      )}
                    </div>
                  </div>
                  
                </div>
            </section>
          ))}

          {isLoading && (
              <div className="max-w-3xl mx-auto w-full"><Loader /></div>
          )}

          {/* Embedded Follow-up bar */}
          {conversation.length > 0 && !isLoading && (
              <div className="max-w-4xl mx-auto w-full mt-4">
                 <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200">
                     <div className="text-xs text-indigo-600 mb-3 font-bold tracking-widest uppercase flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse"></span>
                        Context Preserved: {diseaseContext}
                     </div>
                     <form onSubmit={(e) => {
                         e.preventDefault();
                         const input = (e.target as any).followup.value;
                         if (input.trim()) {
                             handleSearch({ disease: diseaseContext, query: input, location: '' }, true);
                             (e.target as any).followup.value = '';
                         }
                     }} className="flex gap-3">
                        <input name="followup" type="text" placeholder="Ask a follow-up (e.g. Can I take Vitamin D?)" className="w-full px-5 py-4 bg-gray-50/50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none text-base text-gray-800 placeholder-gray-400 transition-all"/>
                        <button type="submit" className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-4 px-8 rounded-xl transition-all shadow-md shadow-indigo-500/20 flex-shrink-0">Ask AI</button>
                     </form>
                 </div>
              </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default Home;
