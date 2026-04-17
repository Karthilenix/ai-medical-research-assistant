import React from 'react';
import Navbar from '../components/Navbar';

const Dashboard: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50/50 flex flex-col font-sans">
      <Navbar />
      <main className="flex-grow max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 w-full">
        
        <div className="text-center mb-12">
          <h1 className="text-4xl font-extrabold text-gray-900 tracking-tight mb-4">About MedAssist AI</h1>
          <p className="text-lg text-gray-500">Your secure, intelligent, and private medical research companion.</p>
        </div>

        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="p-8 sm:p-10">
            <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-3">
              <span className="bg-blue-100 text-blue-600 p-2 rounded-xl">
                 <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 002-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" /></svg>
              </span>
              Our Mission
            </h2>
            <p className="text-gray-600 mb-8 leading-relaxed">
              MedAssist AI was built to bridge the gap between complex clinical research and accessible, conversational intelligence. By utilizing advanced local Large Language Models (LLMs) and seamlessly connecting to real-time databases like ClinicalTrials.gov and OpenAlex, we ensure that every user receives mathematically grounded, hallucination-free medical insights.
            </p>

            <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-3">
              <span className="bg-emerald-100 text-emerald-600 p-2 rounded-xl">
                 <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
              </span>
              Strict Data Privacy
            </h2>
            <p className="text-gray-600 mb-8 leading-relaxed">
              Your health queries are profoundly personal. We adhere to a strict structural privacy policy. Your conversational history is bound exclusively to your encrypted session and stored securely. We purposefully disabled global search histories so that your medical inquiries remain 100% confidential and invisible to other users on the platform.
            </p>

            <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-3">
              <span className="bg-indigo-100 text-indigo-600 p-2 rounded-xl">
                 <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
              </span>
              The Technology
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
               <div className="bg-gray-50 border border-gray-100 p-4 rounded-xl">
                 <h4 className="font-bold text-gray-800 mb-1">Local AI Engine</h4>
                 <p className="text-sm text-gray-500">Secure, offline inference ensuring query data doesn't leak to public AI APIs.</p>
               </div>
               <div className="bg-gray-50 border border-gray-100 p-4 rounded-xl">
                 <h4 className="font-bold text-gray-800 mb-1">Hybrid RAG Pipeline</h4>
                 <p className="text-sm text-gray-500">Semantic searches cross-referenced dynamically against 250M+ research papers.</p>
               </div>
            </div>
          </div>
        </div>

      </main>
    </div>
  );
};

export default Dashboard;
