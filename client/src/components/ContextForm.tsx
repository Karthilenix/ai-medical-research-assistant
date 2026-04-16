import React, { useState } from 'react';

interface ContextFormProps {
  onSearch: (data: { disease: string; query: string; location: string }) => void;
  isLoading: boolean;
}

const ContextForm: React.FC<ContextFormProps> = ({ onSearch, isLoading }) => {
  const [disease, setDisease] = useState('');
  const [query, setQuery] = useState('');
  const [location, setLocation] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch({ disease, query, location });
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col gap-4 hover:shadow-md transition-shadow">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Disease / Condition</label>
          <input type="text" value={disease} onChange={(e) => setDisease(e.target.value)} placeholder="e.g., Type 2 Diabetes" className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all text-sm" required />
        </div>
         <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Target Location (Optional)</label>
          <input type="text" value={location} onChange={(e) => setLocation(e.target.value)} placeholder="e.g., United States" className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all text-sm" />
        </div>
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Specific Query</label>
        <textarea value={query} onChange={(e) => setQuery(e.target.value)} placeholder="What are the latest treatments or clinical trials available?" className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all h-24 resize-none text-sm" required></textarea>
      </div>
      <button disabled={isLoading} type="submit" className="mt-2 w-full md:w-auto md:ml-auto bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-8 rounded-xl transition-all shadow-lg shadow-blue-500/30 hover:shadow-blue-500/50 disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2">
        {isLoading ? (
          <>
            <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
            Analyzing...
          </>
        ) : 'Analyze Research'}
      </button>
    </form>
  );
};

export default ContextForm;
