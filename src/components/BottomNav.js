import React from 'react';
import { Home, Heart, FileText, User } from 'lucide-react';

const BottomNav = ({ currentScreen, setCurrentScreen }) => {
  const navItems = [
    { id: 'home', icon: Home, label: 'Home' },
    { id: 'favorites', icon: Heart, label: 'Favorites' },
    { id: 'forms', icon: FileText, label: 'Forms' },
    { id: 'profile', icon: User, label: 'Profile' }
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-lg z-50">
      <div className="flex justify-around items-center h-16">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentScreen === item.id;
          
          return (
            <button
              key={item.id}
              onClick={() => setCurrentScreen(item.id)}
              className={`flex flex-col items-center justify-center flex-1 h-full ${
                isActive ? 'text-pink-500' : 'text-gray-400'
              }`}
            >
              <Icon size={24} />
              <span className="text-xs font-medium mt-1">{item.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
};


export default BottomNav;