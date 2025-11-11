import React, { useState, useEffect, useCallback } from 'react';
import { Heart, ArrowLeft, Trash2 } from 'lucide-react';
import BottomNav from './BottomNav';
import petService from '../services/petService';

// Import images for local assets
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
  'poknat.jpg': poknatImg,
  'Netnet.jpg': netnetImg,
  'Natnat.jpg': natnatImg,
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

const FavoritesScreen = ({ 
  currentScreen, 
  setCurrentScreen, 
  favorites = [], 
  setFavorites = () => {},
  setSelectedPet
}) => {
  const [favoritePets, setFavoritePets] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadFavoritePets = useCallback(async () => {
    if (favorites.length === 0) {
      setFavoritePets([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const result = await petService.getAvailablePets();
      
      if (result.success) {
        const filtered = result.data.filter(pet => favorites.includes(pet.id));
        setFavoritePets(filtered);
      }
    } catch (error) {
      console.error('Error loading favorite pets:', error);
    } finally {
      setLoading(false);
    }
  }, [favorites]);

  useEffect(() => {
    loadFavoritePets();
  }, [loadFavoritePets]);

  const removeFavorite = (petId) => {
    setFavorites(favorites.filter(id => id !== petId));
  };

  const handlePetClick = (pet) => {
    setSelectedPet(pet);
    setCurrentScreen('petDetail');
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {}
      <div className="bg-gradient-to-r from-pink-500 to-purple-500 px-4 py-6 text-white sticky top-0 z-40">
        <button
          onClick={() => setCurrentScreen('home')}
          className="mb-4 flex items-center space-x-2 hover:opacity-80"
        >
          <ArrowLeft size={20} />
          <span className="text-sm">Back</span>
        </button>
        
        <div className="flex items-center space-x-3">
          <Heart size={32} className="fill-white" />
          <div>
            <h1 className="text-2xl font-bold">Favorites</h1>
            <p className="text-pink-100 text-sm">{favoritePets.length} saved pets</p>
          </div>
        </div>
      </div>

      {}
      <div className="p-4">
        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-500 mx-auto"></div>
            <p className="text-gray-500 mt-4">Loading favorites...</p>
          </div>
        ) : favoritePets.length === 0 ? (
          <div className="text-center py-16">
            <Heart className="text-gray-300 mx-auto mb-4" size={64} />
            <h2 className="text-xl font-bold text-gray-800 mb-2">No Favorites Yet</h2>
            <p className="text-gray-600 mb-6">Start adding pets to your favorites!</p>
            <button
              onClick={() => setCurrentScreen('home')}
              className="bg-pink-500 text-white px-6 py-3 rounded-lg font-semibold hover:bg-pink-600"
            >
              Browse Pets
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-4">
            {favoritePets.map((pet) => (
              <div key={pet.id} className="bg-white rounded-lg shadow-sm overflow-hidden">
                <div className="relative" onClick={() => handlePetClick(pet)}>
                  <img 
                    src={getPetImage(pet.imageUrl)} 
                    alt={pet.name}
                    className="aspect-square w-full object-cover cursor-pointer"
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
                    <button 
                      onClick={() => removeFavorite(pet.id)}
                      className="text-red-500 hover:text-red-600"
                      title="Remove from favorites"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                  <p className="text-xs text-gray-500 mb-2">{pet.age} • {pet.breed}</p>
                  <button 
                    onClick={() => handlePetClick(pet)}
                    className="w-full bg-pink-500 text-white py-2 rounded text-xs hover:bg-pink-600"
                  >
                    View Details
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <BottomNav currentScreen={currentScreen} setCurrentScreen={setCurrentScreen} />
    </div>
  );
};

export default FavoritesScreen;