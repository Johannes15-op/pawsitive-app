import React from 'react';
import { PawPrint } from 'lucide-react';

const UpdatedWelcomeScreen = ({ setCurrentScreen }) => (
  <div className="min-h-screen bg-gradient-to-b from-pink-50 to-white flex flex-col items-center justify-center p-6">
    <div className="bg-white rounded-3xl shadow-lg p-8 max-w-sm w-full text-center">
      <div className="mb-8">
        <div className="flex justify-center mb-4">
          <img 
            src={require('../assets/image.jpg')} 
            alt="TAARA Logo" 
            className="w-32 h-32 object-cover rounded-full shadow-lg"
          />
        </div>
        <div className="flex items-center justify-center space-x-2 mb-4">
          <PawPrint className="text-pink-400 fill-current" size={24} />
        </div>
      </div>
      
      <h1 className="text-xl font-bold text-gray-800 mb-2">
        Find Your <span className="text-pink-500">New Friends</span> Here
      </h1>
      
      <p className="text-sm text-gray-600 mb-6">
        Connect loving pets with caring families in Tabaco City
      </p>
      
      <div className="space-y-3">
        <button 
          onClick={() => setCurrentScreen('login')}
          className="w-full bg-pink-400 text-white py-3 px-6 rounded-full font-medium hover:bg-pink-500 transition-colors"
        >
          Get Started
        </button>
        
        <button 
          onClick={() => setCurrentScreen('home')}
          className="w-full bg-gray-100 text-gray-600 py-3 px-6 rounded-full font-medium hover:bg-gray-200 transition-colors"
        >
          Browse as Guest
        </button>
      </div>
      
      <p className="text-xs text-gray-400 mt-4">
        Join TAARA community to adopt, volunteer, or donate
      </p>
    </div>
  </div>
);

export default UpdatedWelcomeScreen;