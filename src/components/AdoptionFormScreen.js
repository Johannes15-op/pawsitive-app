import React, { useState, useEffect } from 'react';
import { Heart, ArrowLeft, CheckCircle } from 'lucide-react';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../config/firebaseConfig';
import adoptionService from '../services/adoptionService';

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

const AdoptionFormScreen = ({ pet, setCurrentScreen, currentUser }) => {
  const [formData, setFormData] = useState({
    address: '',
    reason: '',
    hasExperience: false,
    hasOtherPets: false
  });
  const [userData, setUserData] = useState(null);
  const [ownerData, setOwnerData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [adoptionResult, setAdoptionResult] = useState(null);

  useEffect(() => {
    const fetchUserData = async () => {
      if (currentUser) {
        try {
          const userDoc = await getDoc(doc(db, 'users', currentUser.uid));
          if (userDoc.exists()) {
            setUserData(userDoc.data());
          }
        } catch (error) {
          console.error('Error fetching user data:', error);
        }
      }
    };
    fetchUserData();
  }, [currentUser]);

 
  useEffect(() => {
    const fetchOwnerData = async () => {
      if (pet.ownerId) {
        try {
          console.log('🔍 Fetching owner data for ownerId:', pet.ownerId);
          const ownerDoc = await getDoc(doc(db, 'users', pet.ownerId));
          if (ownerDoc.exists()) {
            const owner = ownerDoc.data();
            console.log('✅ Owner data fetched:', owner);
            setOwnerData(owner);
          } else {
            console.warn('⚠️ Owner document not found for:', pet.ownerId);
          }
        } catch (error) {
          console.error('❌ Error fetching owner data:', error);
        }
      } else {
        console.warn('⚠️ Pet has no ownerId:', pet);
      }
    };
    fetchOwnerData();
  }, [pet]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    if (!formData.address || !formData.reason) {
      setError('Please fill in all required fields');
      setLoading(false);
      return;
    }

    if (!currentUser) {
      setError('You must be logged in to submit an adoption request');
      setLoading(false);
      return;
    }

    try {
      const adoptionData = {
        
        petId: pet.id,
        petName: pet.name,
        petBreed: pet.breed || '',
        petAge: pet.age || '',
        
        userId: currentUser.uid,
        userEmail: currentUser.email,
        fullName: userData?.fullName || currentUser.displayName || currentUser.email?.split('@')[0] || 'User',
        phoneNumber: userData?.phoneNumber || '',
        
  
        ownerId: pet.ownerId || '',
        ownerPhone: ownerData?.phoneNumber || pet.ownerPhone || '',
        
       
        address: formData.address,
        reason: formData.reason,
        hasExperience: formData.hasExperience,
        hasOtherPets: formData.hasOtherPets,
        
        
        status: 'pending'
      };
      
      console.log('📤 Submitting adoption with data:', adoptionData);
      
      
      if (!adoptionData.ownerPhone) {
        console.warn('⚠️ Owner phone number not available - SMS notification may fail');
      }
      
      const result = await adoptionService.submitAdoption(adoptionData);
      
      if (result.success) {
        setAdoptionResult({
          petName: pet.name,
          adoptionId: result.adoptionId,
          userEmail: currentUser.email
        });
        setShowSuccessModal(true);
      } else {
        setError(result.error || 'Failed to submit request. Please try again.');
      }
    } catch (err) {
      console.error('Adoption submission error:', err);
      setError('An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleCloseModal = () => {
    setShowSuccessModal(false);
    setCurrentScreen('home');
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {}
      {showSuccessModal && adoptionResult && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 max-w-md w-full shadow-xl">
            <div className="text-center">
              <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-gray-800 mb-2">
                Application Submitted!
              </h2>
              <p className="text-gray-600 mb-4">
                Your adoption request has been successfully submitted.
              </p>
              
              <div className="bg-gray-50 rounded-lg p-4 mb-4 text-left">
                <div className="mb-2">
                  <span className="text-sm font-semibold text-gray-700">Pet:</span>
                  <p className="text-gray-800">{adoptionResult.petName}</p>
                </div>
                <div className="mb-2">
                  <span className="text-sm font-semibold text-gray-700">Request ID:</span>
                  <p className="text-gray-800 text-xs">{adoptionResult.adoptionId}</p>
                </div>
                <div>
                  <span className="text-sm font-semibold text-gray-700">Contact Email:</span>
                  <p className="text-gray-800 text-sm">{adoptionResult.userEmail}</p>
                </div>
              </div>
              
              <p className="text-sm text-gray-600 mb-6">
                The pet owner has been notified via SMS and will review your application soon!
              </p>
              
              <button
                onClick={handleCloseModal}
                className="w-full bg-gradient-to-r from-pink-500 to-purple-500 text-white py-3 rounded-lg font-semibold hover:shadow-lg transition-all"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}

      {}
      <div className="bg-gradient-to-r from-pink-500 to-purple-500 p-4 text-white sticky top-0 z-50">
        <button 
          onClick={() => setCurrentScreen('petDetail')}
          className="mb-4 flex items-center space-x-2 hover:opacity-80"
        >
          <ArrowLeft size={20} />
          <span className="text-sm">Back</span>
        </button>
        <div className="flex items-center space-x-3">
          <Heart className="fill-white" size={32} />
          <div>
            <h1 className="text-2xl font-bold">Adoption Application</h1>
            <p className="text-pink-100">For {pet.name}</p>
          </div>
        </div>
      </div>

      {}
      <div className="bg-white m-4 rounded-lg shadow-sm p-4 flex items-center space-x-4">
        <img 
          src={getPetImage(pet.imageUrl || pet.image)} 
          alt={pet.name}
          className="w-20 h-20 rounded-lg object-cover"
        />
        <div>
          <h3 className="font-bold text-gray-800">{pet.name}</h3>
          <p className="text-sm text-gray-600">{pet.breed} • {pet.age}</p>
          {(pet.isVaccinated || pet.vaccinated) && (
            <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full mt-1 inline-block">
              ✓ Vaccinated
            </span>
          )}
        </div>
      </div>

      {}
      <form onSubmit={handleSubmit} className="p-4">
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4">
            <p className="text-sm">{error}</p>
          </div>
        )}

        {}
        <div className="mb-4">
          <label className="block text-gray-700 text-sm font-semibold mb-2">
            Complete Address *
          </label>
          <textarea
            name="address"
            value={formData.address}
            onChange={handleChange}
            placeholder="Street, Barangay, City, Province"
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500"
            rows="3"
            required
          />
        </div>

        {}
        <div className="mb-4">
          <label className="block text-gray-700 text-sm font-semibold mb-2">
            Why do you want to adopt {pet.name}? *
          </label>
          <textarea
            name="reason"
            value={formData.reason}
            onChange={handleChange}
            placeholder="Tell us why you want to give this pet a home..."
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500"
            rows="4"
            required
          />
        </div>

        {}
        <div className="mb-4">
          <label className="flex items-center space-x-3">
            <input
              type="checkbox"
              name="hasExperience"
              checked={formData.hasExperience}
              onChange={handleChange}
              className="w-5 h-5 text-pink-500 rounded focus:ring-pink-500"
            />
            <span className="text-gray-700">I have experience caring for pets</span>
          </label>
        </div>

        {}
        <div className="mb-6">
          <label className="flex items-center space-x-3">
            <input
              type="checkbox"
              name="hasOtherPets"
              checked={formData.hasOtherPets}
              onChange={handleChange}
              className="w-5 h-5 text-pink-500 rounded focus:ring-pink-500"
            />
            <span className="text-gray-700">I have other pets at home</span>
          </label>
        </div>

        {}
        <button
          type="submit"
          disabled={loading || !currentUser}
          className="w-full bg-gradient-to-r from-pink-500 to-purple-500 text-white py-4 rounded-lg font-semibold hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? 'Submitting...' : 'Submit Application'}
        </button>

        {!currentUser && (
          <p className="text-xs text-red-500 text-center mt-2">
            You must be logged in to submit an adoption request
          </p>
        )}

        <p className="text-xs text-gray-500 text-center mt-4">
          By submitting, you agree to our adoption terms and conditions.
        </p>
      </form>
    </div>
  );
};

export default AdoptionFormScreen;