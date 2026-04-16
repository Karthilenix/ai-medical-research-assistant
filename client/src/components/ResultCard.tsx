import React from 'react';

export interface ResultItem {
  id: string;
  title: string;
  source: string;
  date: string;
  summary: string;
  url: string;
  type: 'publication' | 'trial';
  metadata?: {
    status?: string;
    eligibility?: string;
    location?: string;
    contact?: string;
  };
}

const ResultCard: React.FC<{ result: ResultItem }> = ({ result }) => {
  return (
    <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-all flex flex-col h-full relative overflow-hidden group">
      <div className={`absolute top-0 left-0 w-full h-1 ${result.type === 'trial' ? 'bg-emerald-400' : 'bg-transparent'}`}></div>
      <div className="flex justify-between items-start mb-3 gap-2">
        <span className={`text-[10px] uppercase tracking-wider font-semibold px-2.5 py-1 rounded-full flex items-center gap-1.5 ${result.type === 'publication' ? 'bg-indigo-50 text-indigo-700' : 'bg-emerald-50 text-emerald-800'}`}>
          {result.type === 'trial' && <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>}
          {result.type === 'publication' ? 'Research Paper' : 'Clinical Trial'}
        </span>
        <span className="text-xs text-gray-400 font-medium">{result.date}</span>
      </div>
      <h3 className="font-bold text-gray-900 leading-snug mb-2 line-clamp-2">{result.title}</h3>
      <p className="text-sm text-gray-500 mb-3 line-clamp-3 flex-grow">{result.summary}</p>
      
      {result.type === 'trial' && result.metadata && (
        <div className="bg-emerald-50/50 p-3 rounded-xl border border-emerald-100 mb-4 space-y-2 mt-auto">
           <div className="flex justify-between items-center text-xs">
              <span className="font-semibold text-emerald-800">Status:</span>
              <span className="text-emerald-700 font-medium px-2 py-0.5 bg-white rounded-md border border-emerald-200">{result.metadata.status}</span>
           </div>
           <div className="flex flex-col text-xs pt-1 border-t border-emerald-100/50 gap-1">
              <span className="font-semibold text-emerald-800 truncate">📍 Location: <span className="font-normal text-emerald-700">{result.metadata.location}</span></span>
              <span className="font-semibold text-emerald-800 truncate">📞 Contact: <span className="font-normal text-emerald-700">{result.metadata.contact}</span></span>
           </div>
           <div className="pt-2">
             <span className="text-xs font-semibold text-emerald-800 block mb-1">Eligibility snippets:</span>
             <p className="text-[11px] text-emerald-700 line-clamp-2 leading-relaxed italic">{result.metadata.eligibility}</p>
           </div>
        </div>
      )}

      <div className={`${result.type !== 'trial' ? 'mt-auto' : ''} flex items-center justify-between pt-4 border-t border-gray-100`}>
        <span className="text-[11px] font-bold uppercase tracking-widest text-gray-400 truncate max-w-[60%]">{result.source}</span>
        <a href={result.url} target="_blank" rel="noopener noreferrer" className="text-sm font-bold text-blue-600 hover:text-blue-800 flex items-center gap-1 transition-colors">
          Full Details
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" /></svg>
        </a>
      </div>
    </div>
  );
};

export default ResultCard;
