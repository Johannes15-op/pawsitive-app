import React from 'react';
import {Home, User, DollarSign, Users, Calendar, FileText, Info, X } from 'lucide-react';


import logoImg from '../assets/image.jpg'; 

const Sidebar = ({ showSidebar, setShowSidebar, setCurrentScreen }) => {
  const handleNavigation = (screen) => {
    setCurrentScreen(screen);
    setShowSidebar(false);
  };

  return (
    <>
      {}
      <div 
        className={`fixed inset-0 bg-black z-[60] transition-opacity duration-300 ${
          showSidebar ? 'opacity-50 visible' : 'opacity-0 invisible pointer-events-none'
        }`}
        onClick={() => setShowSidebar(false)}
      />
      
      {}
      <div 
        className={`fixed left-0 top-0 h-full w-72 bg-white shadow-2xl z-[70] transform transition-transform duration-300 ease-in-out ${
          showSidebar ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {}
        <div className="p-6 border-b border-gray-200 bg-gradient-to-r from-pink-50 to-purple-50">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
             {}
              <div className="w-12 h-12 rounded-full overflow-hidden flex items-center justify-center bg-white shadow-sm">
                <img 
                  src={logoImg} 
                  alt="TAARA Logo" 
                  className="w-full h-full object-cover"
                />
              </div>
              <div>
                <span className="font-bold text-lg text-gray-800">TAARA</span>
                <p className="text-xs text-gray-600">Animal Rescue</p>
              </div>
            </div>
            <button 
              onClick={() => setShowSidebar(false)}
              className="p-2 hover:bg-white rounded-lg transition-colors"
            >
              <X size={20} className="text-gray-600" />
            </button>
          </div>
        </div>

        {}
        <nav className="p-4 space-y-1 overflow-y-auto" style={{ maxHeight: 'calc(100vh - 180px)' }}>
          <button 
            onClick={() => handleNavigation('home')}
            className="flex items-center w-full p-3 text-gray-700 hover:bg-pink-50 hover:text-pink-600 rounded-lg transition-colors group"
          >
            <Home size={20} className="mr-3 text-pink-500 group-hover:text-pink-600" />
            <span className="font-medium">Home</span>
          </button>

          <button 
            onClick={() => handleNavigation('profile')}
            className="flex items-center w-full p-3 text-gray-700 hover:bg-pink-50 hover:text-pink-600 rounded-lg transition-colors group"
          >
            <User size={20} className="mr-3 text-purple-500 group-hover:text-purple-600" />
            <span className="font-medium">Profile</span>
          </button>

          <button 
            onClick={() => handleNavigation('donation')}
            className="flex items-center w-full p-3 text-gray-700 hover:bg-pink-50 hover:text-pink-600 rounded-lg transition-colors group"
          >
            <DollarSign size={20} className="mr-3 text-green-500 group-hover:text-green-600" />
            <span className="font-medium">Donation</span>
          </button>

          <button 
            onClick={() => handleNavigation('volunteer')}
            className="flex items-center w-full p-3 text-gray-700 hover:bg-pink-50 hover:text-pink-600 rounded-lg transition-colors group"
          >
            <Users size={20} className="mr-3 text-blue-500 group-hover:text-blue-600" />
            <span className="font-medium">Volunteer</span>
          </button>

          <button 
            onClick={() => handleNavigation('kapon')}
            className="flex items-center w-full p-3 text-gray-700 hover:bg-pink-50 hover:text-pink-600 rounded-lg transition-colors group"
          >
            <Calendar size={20} className="mr-3 text-orange-500 group-hover:text-orange-600" />
            <span className="font-medium">Kapon Schedule</span>
          </button>

          <button 
            onClick={() => handleNavigation('forms')}
            className="flex items-center w-full p-3 text-gray-700 hover:bg-pink-50 hover:text-pink-600 rounded-lg transition-colors group"
          >
            <FileText size={20} className="mr-3 text-indigo-500 group-hover:text-indigo-600" />
            <span className="font-medium">Forms</span>
          </button>

          <button 
            onClick={() => handleNavigation('about')}
            className="flex items-center w-full p-3 text-gray-700 hover:bg-pink-50 hover:text-pink-600 rounded-lg transition-colors group"
          >
            <Info size={20} className="mr-3 text-gray-500 group-hover:text-gray-600" />
            <span className="font-medium">About Us</span>
          </button>
        </nav>

        {}
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-200 bg-gray-50">
          <div className="text-center">
            <p className="text-xs text-gray-600">Tabaco Animal Rescue</p>
            <p className="text-xs text-gray-500">& Adoption</p>
          </div>
        </div>
      </div>
    </>
  );
};

export default Sidebar;