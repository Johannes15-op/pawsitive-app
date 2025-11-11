import React from 'react';

const AboutScreen = ({ currentScreen, setCurrentScreen }) => {

  return (
    <div className="bg-gray-50 min-h-screen pb-20">
      {}
      <div className="bg-white px-4 py-3 shadow-sm">
        <div className="flex items-center justify-between">
          <button onClick={() => setCurrentScreen('home')} className="text-gray-600">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <h1 className="text-lg font-semibold">About Us</h1>
          <div className="w-6"></div>
        </div>
      </div>

      {}
      <div className="p-4">
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex justify-center mb-6">
            <img 
              src={require('../assets/top.jpg')} 
              alt="About Us" 
              className="w-full max-w-md h-auto rounded-lg object-cover"
              onError={(e) => {
                e.target.style.display = 'none';
                console.error('Image failed to load');
              }}
            />
          </div>
          
          <p className="text-sm text-gray-700 leading-relaxed mb-6">
            Tabaco Shelter is managed by Tabaco Animal Rescue and Adoption organization. TAARA is officially recognized by the Securities and Exchange Commission (SEC) in the Philippines as legitimate organization that complies with specific legal and regulatory standards. A volunteer-based, not (for) accredited organization dedicated to responsible pet ownership, recognizing that it has been community rescue registration from local government units (LGUs) for its commitment to animal welfare and rescue operations. They work actively to place awareness about responsible pet ownership and the importance of animal welfare in the local community.
          </p>
          
          <div className="flex space-x-4">
            <button 
              onClick={() => setCurrentScreen('volunteer')}
              className="flex-1 bg-pink-100 text-pink-600 py-3 rounded-lg font-medium hover:bg-pink-200 transition-colors"
            >
              Volunteer Now
            </button>
            <button 
              onClick={() => setCurrentScreen('donation')}
              className="flex-1 bg-pink-400 text-white py-3 rounded-lg font-medium hover:bg-pink-500 transition-colors"
            >
              Donate
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AboutScreen;