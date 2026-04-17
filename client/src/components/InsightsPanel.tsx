import React from 'react';

const InsightsPanel: React.FC<{ insights: string[] }> = ({ insights }) => {
  if (!insights || insights.length === 0) return null;

  return (
    <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-6 border border-blue-100 shadow-inner">
      <div className="flex items-center gap-3 mb-4">
        <div className="bg-blue-600 p-2 rounded-xl shadow-md">
          <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
        </div>
        <h2 className="text-lg font-bold text-gray-900">AI-Generated Insights</h2>
      </div>

      <p className="text-gray-800 text-sm font-medium mb-4 leading-relaxed bg-white/60 p-4 rounded-xl border border-white/40 shadow-sm relative">
         <span className="absolute -left-2 top-4 w-1 h-6 bg-blue-500 rounded-r-full"></span>
         {insights[0]}
      </p>

      {insights.length > 1 && (
        <ul className="space-y-3">
          {insights.slice(1).map((insight, index) => (
            <li key={index} className="flex items-start gap-3 text-sm text-gray-700 bg-white/40 p-3 rounded-lg border border-white/20">
              <span className="min-w-[20px] max-w-[20px] h-5 w-5 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center text-xs font-bold mt-0.5">{index + 1}</span>
              <span className="leading-relaxed">{insight}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default InsightsPanel;
