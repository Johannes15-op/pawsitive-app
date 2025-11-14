import React, { useState, useEffect } from 'react';
import { Heart, User } from 'lucide-react';
import BottomNav from './BottomNav';
import Sidebar from './Sidebar';
import AnnouncementBanner from './AnnouncementBanner';
import NotificationBell from './NotificationBell';
import petService from '../services/petService';
import kaponService from '../services/kaponService';
import { auth, db } from '../config/firebaseConfig';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';

import poknatImg from '../assets/pets/poknat.jpg';  
import netnetImg from '../assets/pets/Netnet.jpg';
import natnatImg from '../assets/pets/Natnat.jpg';
import mateaImg from '../assets/pets/Matea.jpg';
import joniImg from '../assets/pets/Joni.jpg';
import jonaImg from '../assets/pets/Jona.jpg';  
import pepitaImg from '../assets/pets/Pepita.jpg';
import lebronImg from '../assets/pets/Lebron.jpg';
import rondaImg from '../assets/pets/Ronda.jpg';
import boydogImg from '../assets/pets/Boydog.jpg';
import kajoImg from '../assets/pets/Kajo.jpg';
import deltaImg from '../assets/pets/Delta.jpg';
import charlieImg from '../assets/pets/Charlie.jpg';
import hugoImg from '../assets/pets/Hugo.jpg';
import dogdogImg from '../assets/pets/Dogdog.jpg';
import snowImg from '../assets/pets/Snow.jpg';
import dutchImg from '../assets/pets/Dutch.jpg';

const petImages = {
  'Poknat.jpg': poknatImg,
  'poknat.jpg': poknatImg,
  'Netnet.jpg': netnetImg,
  'netnet.jpg': netnetImg,
  'Natnat.jpg': natnatImg,
  'natnat.jpg': natnatImg, 
  'Matea.jpg': mateaImg,
  'Joni.jpg': joniImg,
  'Jona.jpg': jonaImg,
  'Pepita.jpg': pepitaImg,
  'Lebron.jpg': lebronImg,
  'Ronda.jpg': rondaImg,
  'Boydog.jpg': boydogImg,
  'Kajo.jpg': kajoImg,
  'Delta.jpg': deltaImg,
  'Charlie.jpg': charlieImg,
  'Hugo.jpg': hugoImg,
  'Dogdog.jpg': dogdogImg,
  'Snow.jpg': snowImg,
  'Dutch.jpg': dutchImg
};

const getPetImage = (imageUrl) => {
  if (!imageUrl) return null;
  if (imageUrl.startsWith('assets/')) {
    const filename = imageUrl.split('/').pop();
    return petImages[filename] || null;
  }
  return imageUrl;
};

const HomeScreen = ({ 
  currentScreen, 
  setCurrentScreen, 
  showSidebar, 
  setShowSidebar, 
  setSelectedPet,
  setSelectedSchedule,
  favorites = [],
  setFavorites = () => {},
  previousScreen,
  setPreviousScreen = () => {} 
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [showResults, setShowResults] = useState(false);
  const [pets, setPets] = useState([]);
  const [kapons, setKapons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [kaponLoading, setKaponLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);
  const [userPhotoURL, setUserPhotoURL] = useState(null);
  const [showAuthModal, setShowAuthModal] = useState(false);

  useEffect(() => {
    loadPets();
    loadKapons();
  }, []);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user);
      if (user) {
        loadUserPhoto(user.uid);
      } else {
        setUserPhotoURL(null);
      }
    });
    return () => unsubscribe();
  }, []);

  const loadUserPhoto = async (userId) => {
    try {
      const userRef = doc(db, 'users', userId);
      const userDoc = await getDoc(userRef);
      if (userDoc.exists()) {
        const userData = userDoc.data();
        setUserPhotoURL(userData.photoURL || null);
      }
    } catch (error) {
      console.error('Error loading user photo:', error);
    }
  };

  const loadPets = async () => {
    try {
      setLoading(true);
      setError(null);
      console.log('🏠 HomeScreen: Loading pets...');
      
      const result = await petService.getAvailablePets();
      
      if (result.success) {
        console.log('🏠 HomeScreen: Received', result.data.length, 'pets');
        console.log('🏠 Pet names:', result.data.map(p => p.name).join(', '));
        setPets(result.data);
      } else {
        setError(result.error);
        console.error('❌ Error loading pets:', result.error);
      }
    } catch (error) {
      setError('Failed to load pets. Please try again.');
      console.error('❌ Error loading pets:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadKapons = async () => {
    try {
      setKaponLoading(true);
      const result = await kaponService.getActiveKapons();
      if (result.success) {
        setKapons(result.data);
      } else {
        console.error('Error loading kapons:', result.error);
        setKapons([]);
      }
    } catch (error) {
      console.error('Error loading kapons:', error);
      setKapons([]);
    } finally {
      setKaponLoading(false);
    }
  };

  const handleSearch = async (query) => {
    setSearchQuery(query);
    if (query.trim() === '') {
      setSearchResults([]);
      setShowResults(false);
      return;
    }
    const result = await petService.filterPets({
      search: query,
      status: 'available'
    });
    if (result.success) {
      setSearchResults(result.data);
      setShowResults(true);
    } else {
      console.error('Search error:', result.error);
      setSearchResults([]);
      setShowResults(true);
    }
  };

  const handlePetClick = (pet) => {
    setSelectedPet(pet);
    setPreviousScreen('home');
    setCurrentScreen('petDetail');
    setShowResults(false);
    setSearchQuery('');
  };

  const handleAdoptClick = (e, pet) => {
    e.stopPropagation();
    if (!currentUser) {
      setShowAuthModal(true);
    } else {
      setSelectedPet(pet);
      setPreviousScreen('home');
      setCurrentScreen('adoptionForm');
    }
  };

  const handleProfileClick = () => {
    setPreviousScreen('home');
    setCurrentScreen('profile');
  };

  const toggleFavorite = (e, petId) => {
    e.stopPropagation(); 
    if (favorites.includes(petId)) {
      setFavorites(favorites.filter(id => id !== petId));
    } else {
      setFavorites([...favorites, petId]);
    }
  };

  const isFavorite = (petId) => favorites.includes(petId);

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    try {
      const date = dateString.toDate ? dateString.toDate() : new Date(dateString);
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    } catch (e) {
      return 'N/A';
    }
  };

  const AuthModal = () => (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-2xl">
        <div className="text-center mb-6">
          <div className="w-16 h-16 bg-pink-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Heart className="text-pink-500 fill-pink-500" size={32} />
          </div>
          <h3 className="text-xl font-bold text-gray-800 mb-2">Login Required</h3>
          <p className="text-gray-600 text-sm">
            Kailangan muna mag-register o mag-login para makapag-adopt ng pet.
          </p>
        </div>
        <div className="space-y-3">
          <button
            onClick={() => {
              setShowAuthModal(false);
              setCurrentScreen('register');
            }}
            className="w-full bg-pink-500 text-white py-3 rounded-lg font-semibold hover:bg-pink-600 transition-colors"
          >
            Create Account
          </button>
          <button
            onClick={() => {
              setShowAuthModal(false);
              setCurrentScreen('login');
            }}
            className="w-full bg-white text-pink-500 py-3 rounded-lg font-semibold border-2 border-pink-500 hover:bg-pink-50 transition-colors"
          >
            Login
          </button>
          <button
            onClick={() => setShowAuthModal(false)}
            className="w-full text-gray-500 py-2 text-sm hover:text-gray-700"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="bg-gray-50 min-h-screen pb-24">
      {showAuthModal && <AuthModal />}

      {}
      <div className="bg-gradient-to-r from-pink-500 to-purple-500 px-4 py-3 flex items-center justify-between shadow-lg sticky top-0 z-50">
        <button onClick={() => setShowSidebar(true)} className="p-2">
          <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
        
        <div className="flex items-center space-x-2">
          <Heart className="text-white fill-white" size={24} />
          <span className="font-semibold text-lg text-white">Home</span>
        </div>

        <div className="flex items-center space-x-2">
          {currentUser && (
            <NotificationBell userId={currentUser.uid} />
          )}
          
          {currentUser ? (
            <button 
              onClick={handleProfileClick}
              className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center hover:bg-white/30 transition-colors overflow-hidden border-2 border-white"
            >
              {userPhotoURL ? (
                <img 
                  src={userPhotoURL} 
                  alt="Profile" 
                  className="w-full h-full object-cover"
                />
              ) : (
                <User className="text-white" size={20} />
              )}
            </button>
          ) : (
            <button 
              onClick={() => setCurrentScreen('login')}
              className="text-sm text-white font-semibold bg-white/20 px-4 py-2 rounded-lg hover:bg-white/30 transition-colors"
            >
              Login
            </button>
          )}
        </div>
      </div>
      
     {}
      <div className="relative w-full h-72 overflow-hidden">
        <img 
          src={require('../assets/top.jpg')} 
          alt="Tabaco Animal Rescue"
          className="w-full h-full object-cover object-center"
          style={{ imageRendering: '-webkit-optimize-contrast' }}
        />
      </div>

    {}
      <div className="bg-white px-4 py-3 shadow-sm">
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
      </div>

      {}
      {showResults && (
        <div className="bg-white mx-4 mt-2 rounded-lg shadow-lg max-h-96 overflow-y-auto z-50 absolute left-0 right-0">
          {searchResults.length > 0 ? (
            <div className="p-2">
              {searchResults.map((pet) => (
                <div 
                  key={pet.id} 
                  className="p-3 hover:bg-gray-50 rounded-lg cursor-pointer border-b last:border-b-0"
                  onClick={() => handlePetClick(pet)}
                >
                  <div className="flex items-center space-x-3">
                    <img 
                      src={getPetImage(pet.imageUrl)} 
                      alt={pet.name}
                      className="w-12 h-12 rounded-full object-cover"
                    />
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-800">{pet.name}</h3>
                      <p className="text-xs text-gray-500">{pet.breed} • {pet.age} • {pet.gender}</p>
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
      
    {}
      <div className="p-4">
        {}
        <AnnouncementBanner />

        <div className="bg-pink-100 rounded-lg p-4 mb-4 relative overflow-hidden">
          <div className="absolute right-2 top-2 w-16 h-16 bg-pink-200 rounded-full flex items-center justify-center">
            <Heart className="text-pink-500 fill-current" size={24} />
          </div>
          <h3 className="font-bold text-gray-800 mb-1">The Albay Animal Rescue Alliance</h3>
          <p className="text-sm text-gray-600 mb-2">Bicolandia's Voice for the Voiceless</p>
        </div>

       {}
       <div className="mb-6">
         <h2 className="text-lg font-bold text-gray-800 mb-3">Upcoming Kapon Schedule</h2>
          {kaponLoading ? (
            <div className="text-center py-6">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-pink-500 mx-auto"></div>
            </div>
          ) : kapons.length === 0 ? (
            <div className="bg-gray-100 rounded-lg p-4 text-center text-gray-500 text-sm">
              <p>No upcoming kapon schedules</p>
            </div>
          ) : (
            <div className="space-y-3">
              {kapons.map((kapon) => (
                <div key={kapon.id} className="bg-white rounded-lg p-4 shadow-sm border-l-4 border-pink-500">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-800">{kapon.title}</h3>
                      <p className="text-sm text-gray-600 mt-1">{kapon.description}</p>
                      <div className="flex items-center space-x-4 mt-2 text-sm text-gray-500">
                        <span>📅 {formatDate(kapon.date)}</span>
                        <span>🕐 {kapon.startTime} - {kapon.endTime}</span>
                        <span>📍 {kapon.location}</span>
                      </div>
                      <div className="mt-2 text-sm">
                        <span className="inline-block bg-pink-100 text-pink-700 px-2 py-1 rounded">
                          {kapon.registeredCount}/{kapon.capacity} registered
                        </span>
                      </div>
                    </div>
                  </div>
                  {!currentUser ? (
                    <button 
                      onClick={() => setCurrentScreen('login')}
                      className="mt-3 w-full bg-pink-500 text-white py-2 rounded text-sm font-semibold hover:bg-pink-600"
                    >
                      Login to Register
                    </button>
                  ) : (
                    <button 
                      onClick={() => {
                        setSelectedSchedule(kapon);
                        setPreviousScreen('home');
                        setCurrentScreen('kaponForm');
                      }}
                      className="mt-3 w-full bg-pink-500 text-white py-2 rounded text-sm font-semibold hover:bg-pink-600"
                    >
                      Register
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
            <p className="text-red-600 text-sm">{error}</p>
            <button 
              onClick={loadPets}
              className="mt-2 text-red-600 text-sm font-semibold underline"
            >
              Try Again
            </button>
          </div>
        )}

        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-500 mx-auto"></div>
            <p className="text-gray-500 mt-4">Loading pets...</p>
          </div>
        ) : pets.length === 0 ? (
          <div className="text-center py-12">
            <Heart className="text-gray-300 mx-auto mb-4" size={48} />
            <p className="text-gray-500">No pets available for adoption at the moment.</p>
            <button 
              onClick={loadPets}
              className="mt-4 text-pink-500 text-sm font-semibold"
            >
              Refresh
            </button>
          </div>
        ) : (
          <>
            <h2 className="text-lg font-bold text-gray-800 mb-3">Available Pets</h2>
            <div className="grid grid-cols-2 gap-4">
              {pets.map((pet) => (
                <div key={pet.id} className="bg-white rounded-lg shadow-sm overflow-hidden">
                  <div className="relative">
                    <img 
                      src={getPetImage(pet.imageUrl)} 
                      alt={pet.name}
                      className="aspect-square w-full object-cover"
                    />
                    {pet.isVaccinated && (
                      <div className="absolute top-2 left-2 bg-green-500 text-white text-xs px-2 py-1 rounded-full">
                        ✓ Vaccinated
                      </div>
                    )}
                  </div>
                  <div className="p-3">
                    <div className="flex items-center justify-between mb-1">
                      <h4 className="font-semibold text-gray-800">{pet.name}</h4>
                      <div className="flex space-x-1 items-center">
                        <button 
                          onClick={(e) => toggleFavorite(e, pet.id)}
                          className="focus:outline-none relative group"
                          title={isFavorite(pet.id) ? "Remove from favorites" : "Add to favorites"}
                        >
                          <Heart 
                            size={16} 
                            className={isFavorite(pet.id) ? "text-pink-500 fill-pink-500" : "text-gray-300"} 
                          />
                        </button>
                        <span className="text-pink-500" style={{ fontSize: '14px' }}>
                          {pet.gender === 'male' ? '♂️' : '♀️'}
                        </span>
                      </div>
                    </div>
                    <p className="text-xs text-gray-500 mb-1">{pet.age} • {pet.breed}</p>
                    <div className="flex space-x-2">
                      <button 
                        onClick={() => handlePetClick(pet)}
                        className="flex-1 bg-gray-100 text-gray-700 py-1 px-2 rounded text-xs hover:bg-gray-200"
                      >
                        View
                      </button>
                      <button 
                        onClick={(e) => handleAdoptClick(e, pet)}
                        className="flex-1 bg-pink-500 text-white py-1 px-2 rounded text-xs hover:bg-pink-600"
                      >
                        Adopt
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
      
      <Sidebar 
        showSidebar={showSidebar} 
        setShowSidebar={setShowSidebar} 
        setCurrentScreen={setCurrentScreen} 
      />
      <BottomNav currentScreen={currentScreen} setCurrentScreen={setCurrentScreen} />
    </div>
  );
};

export default HomeScreen;