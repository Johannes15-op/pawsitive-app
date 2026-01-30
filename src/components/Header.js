import React from 'react';
import { Heart } from 'lucide-react';
import NotificationBell from './NotificationBell';

const Header = ({ title, setCurrentScreen, setShowSidebar }) => {
  return (
    <div className="bg-white px-4 py-3 flex items-center justify-between shadow-sm sticky top-0 z-50">
      {}
      <button 
        onClick={() => setShowSidebar(true)} 
        className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
      >
        <svg className="w-6 h-6 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
        </svg>
      </button>
      
      {}
      <div className="flex items-center space-x-2">
        <Heart className="text-pink-500 fill-pink-500" size={24} />
        <span className="font-semibold text-lg text-gray-800">{title}</span>
      </div>

      {}
      <NotificationBell setCurrentScreen={setCurrentScreen} />
    </div>
  );
};

export default Header;