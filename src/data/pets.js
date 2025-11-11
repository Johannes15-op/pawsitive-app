import React, { useState, useEffect } from 'react';
import petService from '../services/petService';

const AboutScreen = ({ currentScreen, setCurrentScreen }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [showResults, setShowResults] = useState(false);
  const [pets, setPets] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadPets();
  }, []);

  const loadPets = async () => {
    setLoading(true);
    try {
      const result = await petService.getAvailablePets();
      if (result.success) {
        setPets(result.data);
      }
    } catch (error) {
      console.error('Error loading pets:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (query) => {
    setSearchQuery(query);
    
    if (query.trim() === '') {
      setSearchResults([]);
      setShowResults(false);
      return;
    }

    const filtered = pets.filter(pet => 
      pet.name?.toLowerCase().includes(query.toLowerCase()) ||
      pet.type?.toLowerCase().includes(query.toLowerCase()) ||
      pet.breed?.toLowerCase().includes(query.toLowerCase()) ||
      pet.gender?.toLowerCase().includes(query.toLowerCase())
    );
    
    setSearchResults(filtered);
    setShowResults(true);
  };

  const getPetImage = (imageUrl) => {
    if (!imageUrl) return null;
    return imageUrl;
  };

  return (
    <div className="bg-gray-50 min-h-screen pb-20">
      {}
      <div className="bg-white px-4 py-3 shadow-sm">
        <div className="flex items-center justify-between mb-3">
          <button onClick={() => setCurrentScreen('home')} className="text-gray-600">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <h1 className="text-lg font-semibold">About Us</h1>
          <div className="w-6"></div>
        </div>

        {}
        <div className="flex items-center space-x-3">
          <div className="flex-1 relative">
            <input
              type="text"
              placeholder="Search pets..."
              value={searchQuery}
              onChange={(e) => handleSearch(e.target.value)}
              className="w-full bg-gray-100 rounded-full py-2 pl-4 pr-10 text-sm focus:outline-none focus:ring-2 focus:ring-pink-300"
            />
            <button className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </button>
          </div>
          <button className="relative">
            <svg className="w-6 h-6 text-purple-400" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 22c1.1 0 2-.9 2-2h-4c0 1.1.89 2 2 2zm6-6v-5c0-3.07-1.64-5.64-4.5-6.32V4c0-.83-.67-1.5-1.5-1.5s-1.5.67-1.5 1.5v.68C7.63 5.36 6 7.92 6 11v5l-2 2v1h16v-1l-2-2z"/>
            </svg>
            <span className="absolute top-0 right-0 w-2 h-2 bg-pink-400 rounded-full"></span>
          </button>
          <button className="text-gray-400">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
          </button>
        </div>
      </div>

      {}
      {showResults && (
        <div className="bg-white mx-4 mt-2 rounded-lg shadow-lg max-h-96 overflow-y-auto z-50 absolute left-0 right-0">
          {loading ? (
            <div className="p-8 text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-pink-500 mx-auto"></div>
            </div>
          ) : searchResults.length > 0 ? (
            <div className="p-2">
              {searchResults.map((pet) => (
                <div 
                  key={pet.id} 
                  className="p-3 hover:bg-gray-50 rounded-lg cursor-pointer border-b last:border-b-0"
                  onClick={() => {
                    setShowResults(false);
                    setSearchQuery('');
                  }}
                >
                  <div className="flex items-center space-x-3">
                    {getPetImage(pet.imageUrl) ? (
                      <img 
                        src={getPetImage(pet.imageUrl)} 
                        alt={pet.name}
                        className="w-12 h-12 rounded-full object-cover"
                      />
                    ) : (
                      <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center text-2xl">
                        {pet.type === 'dog' ? '🐕' : '🐱'}
                      </div>
                    )}
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-800">{pet.name}</h3>
                      <p className="text-xs text-gray-500">
                        {pet.breed} • {pet.age} • {pet.gender}
                      </p>
                    </div>
                    <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-8 text-center text-gray-500">
              <p>No pets found matching "{searchQuery}"</p>
            </div>
          )}
        </div>
      )}
      
      <div className="p-4">
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex justify-center space-x-4 mb-6">
            <div className="text-4xl">👨‍🦰</div>
            <div className="text-4xl">🐕</div>
            <div className="text-4xl">👩‍🦱</div>
            <div className="text-4xl">🐱</div>
            <div className="text-4xl">👨‍🦲</div>
            <div className="text-4xl">🐱</div>
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