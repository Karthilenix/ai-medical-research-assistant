import React, { useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

const Navbar: React.FC = () => {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLogout = () => {
      logout();
      navigate('/login');
  };
  
  return (
    <nav className="bg-white/80 backdrop-blur-md sticky top-0 z-50 border-b border-gray-100 shadow-sm transition-all duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          <Link to="/" className="flex items-center gap-3">
            <div className="bg-gradient-to-tr from-blue-600 to-indigo-600 p-2.5 rounded-xl shadow-blue-500/30 shadow-md transform hover:scale-105 transition-transform">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" /></svg>
            </div>
            <span className="font-extrabold text-xl text-gray-900 tracking-tight">Med<span className="text-blue-600">Assist</span> AI</span>
          </Link>
          <div className="flex gap-6 items-center">
            <Link to="/" className="text-sm font-semibold text-gray-600 hover:text-blue-600 transition-colors">Home</Link>
            <Link to="/dashboard" className="text-sm font-semibold text-gray-600 hover:text-blue-600 transition-colors">Dashboard</Link>
            {user ? (
               <div className="flex items-center gap-4 ml-2 border-l border-gray-200 pl-4">
                 <span className="text-sm font-bold text-gray-800">Hello, {user.username}! ✨</span>
                 <button onClick={handleLogout} className="text-sm font-bold text-red-600 bg-red-50 hover:bg-red-100 px-4 py-2 rounded-lg transition-all">Logout</button>
               </div>
            ) : (
               <>
                 <Link to="/login" className="text-sm font-semibold text-gray-600 hover:text-blue-600 transition-colors">Login</Link>
                 <Link to="/register" className="text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 px-5 py-2 rounded-xl transition-all shadow-md shadow-blue-500/20">Sign Up</Link>
               </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
