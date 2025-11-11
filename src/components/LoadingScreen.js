import React from 'react';
import { Heart } from 'lucide-react';

const LoadingScreen = () => {
  
  let logoSrc;
  try {
    logoSrc = require('../assets/image.jpg');
  } catch (error) {
    console.log('Logo image not found, using fallback');
    logoSrc = null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-pink-50 to-white flex flex-col items-center justify-center p-6">
      <div className="text-center">
        {}
        <div className="mb-8">
          <div className="w-24 h-24 mx-auto mb-4 relative">
            {logoSrc ? (
            
              <img 
                src={logoSrc} 
                alt="TAARA Logo" 
                className="w-full h-full object-contain animate-pulse rounded-full shadow-lg"
                onError={(e) => {
                  
                  e.target.style.display = 'none';
                  e.target.nextSibling.style.display = 'flex';
                }}
              />
            ) : null}
            
            {}
            <div 
              className={`w-24 h-24 bg-pink-100 rounded-full flex items-center justify-center animate-pulse ${logoSrc ? 'hidden' : 'flex'}`}
              style={{ display: logoSrc ? 'none' : 'flex' }}
            >
              <Heart className="text-pink-500 fill-current animate-bounce" size={40} />
            </div>
          </div>
          <h1 className="text-2xl font-bold text-gray-800 mb-2">TAARA</h1>
          <p className="text-sm text-gray-600">The Albay Animal Rescue Alliance</p>
        </div>
        
        {}
        <div className="flex justify-center space-x-2 mb-8">
          <div className="w-3 h-3 bg-pink-400 rounded-full animate-bounce"></div>
          <div className="w-3 h-3 bg-pink-400 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
          <div className="w-3 h-3 bg-pink-400 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
        </div>
        
        <p className="text-gray-500 text-sm">Finding your new best friend...</p>
      </div>
    </div>
  );
};

export default LoadingScreen;