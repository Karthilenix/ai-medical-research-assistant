import React, { useEffect, useState } from 'react';
import Navbar from '../components/Navbar';
import api from '../services/api';

const Dashboard: React.FC = () => {
  const [history, setHistory] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const res = await api.get('/history');
        setHistory(res.data || []);
      } catch (err) {
        console.error('Failed to fetch history', err);
      } finally {
        setLoading(false);
      }
    };
    fetchHistory();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50/50 flex flex-col font-sans">
      <Navbar />
      <main className="flex-grow max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 w-full">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Your Research Dashboard</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
            <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-2">Total Queries</h3>
            <span className="text-4xl font-extrabold text-blue-600">{history.length}</span>
          </div>
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 opacity-50">
            <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-2">Saved Papers</h3>
            <span className="text-4xl font-extrabold text-indigo-600">--</span>
          </div>
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 opacity-50">
            <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-2">Tracked Trials</h3>
            <span className="text-4xl font-extrabold text-emerald-600">--</span>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
          <h2 className="text-xl font-bold text-gray-900 mb-4 border-b pb-2">Recent History</h2>
          {loading ? (
            <p className="text-gray-500 text-center py-4">Loading history...</p>
          ) : history.length === 0 ? (
            <div className="text-center">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
              </div>
              <p className="text-gray-500 max-w-md mx-auto">Your recent research queries will appear here. Start a new search from the home page to begin.</p>
            </div>
          ) : (
            <ul className="space-y-4">
              {history.map((record, idx) => (
                <li key={idx} className="bg-gray-50 p-4 rounded-xl border border-gray-100 flex justify-between items-center hover:bg-gray-100 transition">
                  <div>
                    <h4 className="font-bold text-gray-800">{record.disease}</h4>
                    <span className="text-sm text-gray-500">{record.query}</span>
                  </div>
                  <span className="text-xs font-semibold bg-white px-3 py-1 rounded-full border shadow-sm">
                    {new Date(record.createdAt).toLocaleDateString()}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
