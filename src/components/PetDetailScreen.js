import React from 'react';
import { ArrowLeft, Heart } from 'lucide-react';
import BottomNav from './BottomNav';


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

const PetDetailScreen = ({ 
  pet, 
  setCurrentScreen, 
  currentUser, 
  favorites = [], 
  setFavorites = () => {}
}) => {
  const isFavorite = favorites.includes(pet?.id);

  const toggleFavorite = () => {
    if (!pet) return;
    
    if (isFavorite) {
      setFavorites(favorites.filter(id => id !== pet.id));
    } else {
      setFavorites([...favorites, pet.id]);
    }
  };

  const handleAdoptNow = () => {
    if (!currentUser) {
      setCurrentScreen('login');
    } else {
      setCurrentScreen('adoptionForm');
    }
  };

  if (!pet) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600 mb-4">No pet selected</p>
          <button
            onClick={() => setCurrentScreen('home')}
            className="bg-pink-500 text-white px-6 py-3 rounded-lg"
          >
            Browse Pets
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 min-h-screen pb-20">
      {}
      <div className="bg-gradient-to-r from-pink-500 to-purple-500 px-4 py-6 text-white sticky top-0 z-40">
        <div className="flex items-center justify-between mb-4">
          <button
            onClick={() => setCurrentScreen('home')}
            className="flex items-center space-x-2 hover:opacity-80"
          >
            <ArrowLeft size={20} />
            <span className="text-sm">Back</span>
          </button>
          
          <button
            onClick={toggleFavorite}
            className="hover:opacity-80 transition-all"
          >
            <Heart 
              size={24} 
              className={isFavorite ? 'fill-white' : ''} 
            />
          </button>
        </div>
        
        <h1 className="text-2xl font-bold">{pet.name}</h1>
      </div>
      
      <div className="p-4">
        <div className="bg-pink-50 rounded-lg p-4 mb-4">
          <p className="text-sm text-gray-700 mb-4">
            <span className="text-pink-600 font-semibold">Adopting a pet is a lifelong commitment</span> to providing care, love, and attention. Before adopting, ensure your lifestyle and home align with the pet's needs. It's a chance to save a life and gain a loyal companion.
          </p>

          {}
          <div className="aspect-square bg-gray-100 rounded-lg overflow-hidden mb-4">
            <img 
              src={getPetImage(pet.imageUrl || pet.image)} 
              alt={pet.name} 
              className="w-full h-full object-cover" 
            />
          </div>

           {}
          <div className="bg-white rounded-lg p-4">
            <h3 className="font-bold text-gray-800 text-lg mb-2">{pet.name}</h3>
            <p className="text-gray-600 mb-1">Age: {pet.age}</p>
            <p className="text-gray-600 mb-1">Gender: {pet.gender}</p>
            <p className="text-gray-600 mb-1">Breed: {pet.breed}</p>
            
            {(pet.isVaccinated || pet.vaccinated) && (
              <div className="mt-2">
                <span className="inline-block bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">
                  ✓ Vaccinated
                </span>
              </div>
            )}

            <p className="text-sm text-gray-700 mt-4 mb-4">
              {pet.description || pet.story || `${pet.name} is looking for a loving home. This adorable pet has so much love to give and would make a wonderful companion.`}
            </p>

            <button 
              onClick={handleAdoptNow}
              className="w-full bg-pink-500 text-white py-3 px-6 rounded-lg font-medium hover:bg-pink-600 transition-colors"
            >
              Adopt Now
            </button>
          </div>
        </div>
      </div>

      <BottomNav 
        currentScreen="petDetail" 
        setCurrentScreen={setCurrentScreen} 
      />
    </div>
  );
};

export default PetDetailScreen;