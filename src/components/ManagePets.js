import React, { useState, useEffect } from 'react';
import { Trash2, Eye, CheckCircle, PawPrint } from 'lucide-react';
import { collection, getDocs, updateDoc, doc, deleteDoc } from 'firebase/firestore';
import { ref, deleteObject } from 'firebase/storage';
import { db, storage } from '../config/firebaseConfig';

const ManagePets = ({ setCurrentScreen, setSelectedPet }) => {
  const [pets, setPets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    loadPets();
  }, []);

  const loadPets = async () => {
    try {
      setLoading(true);
      console.log('📋 Loading pets...');
      const querySnapshot = await getDocs(collection(db, 'pets'));
      const petsData = [];
      
      querySnapshot.forEach((doc) => {
        const petData = doc.data();
        petsData.push({
          id: doc.id,
          ...petData
        });
        console.log('🐾 Loaded pet:', petData.name, 'Image:', petData.imageUrl);
      });
      
      console.log(`✅ Loaded ${petsData.length} pets`);
      setPets(petsData);
    } catch (error) {
      console.error('❌ Error loading pets:', error);
      alert('Error loading pets: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const updatePetStatus = async (petId, newStatus) => {
    try {
      console.log('🔄 Updating pet status:', { petId, newStatus });
      const petRef = doc(db, 'pets', petId);
      await updateDoc(petRef, {
        status: newStatus,
        updatedAt: new Date()
      });
      
     
      setPets(pets.map(pet => 
        pet.id === petId ? { ...pet, status: newStatus } : pet
      ));
      
      console.log('✅ Pet status updated successfully');
      alert(`Pet status updated to ${newStatus}!`);
    } catch (error) {
      console.error('❌ Error updating pet status:', error);
      alert('Error updating pet status: ' + error.message);
    }
  };

  const deletePet = async (petId, imageUrl) => {
    if (!window.confirm('Are you sure you want to delete this pet? This action cannot be undone.')) {
      return;
    }

    try {
      console.log('🗑️ Deleting pet:', petId);
      
     
      if (imageUrl && imageUrl.includes('firebasestorage.googleapis.com')) {
        try {
          const imageRef = ref(storage, imageUrl);
          await deleteObject(imageRef);
          console.log('✅ Image deleted from storage');
        } catch (imgError) {
          console.warn('⚠️ Could not delete image:', imgError);
         
        }
      }

      
      await deleteDoc(doc(db, 'pets', petId));
      
  
      setPets(pets.filter(pet => pet.id !== petId));
      
      console.log('✅ Pet deleted successfully');
      alert('Pet deleted successfully!');
    } catch (error) {
      console.error('❌ Error deleting pet:', error);
      alert('Error deleting pet: ' + error.message);
    }
  };

  const filteredPets = pets.filter(pet => {
    if (filter === 'all') return true;
    return pet.status === filter;
  });

  const getStatusBadge = (status) => {
    const statusConfig = {
      available: { color: 'bg-green-100 text-green-800', text: 'Available' },
      pending: { color: 'bg-yellow-100 text-yellow-800', text: 'Pending' },
      adopted: { color: 'bg-blue-100 text-blue-800', text: 'Adopted' }
    };
    
    const config = statusConfig[status] || statusConfig.available;
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${config.color}`}>
        {config.text}
      </span>
    );
  };

  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow-md p-6">
        <div className="flex items-center justify-center h-32">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-pink-500"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-md p-4 md:p-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Manage Pets</h2>
          <p className="text-gray-600">View and manage all pets in the system ({pets.length} total)</p>
        </div>
        <button
          onClick={() => setCurrentScreen('addPet')}
          className="bg-gradient-to-r from-pink-500 to-purple-500 text-white px-6 py-3 rounded-lg font-semibold hover:shadow-lg transition-all mt-4 md:mt-0"
        >
          + Add New Pet
        </button>
      </div>

      {}
      <div className="flex flex-wrap gap-2 mb-6">
        {['all', 'available', 'pending', 'adopted'].map((status) => (
          <button
            key={status}
            onClick={() => setFilter(status)}
            className={`px-4 py-2 rounded-lg font-medium transition-all ${
              filter === status
                ? 'bg-pink-500 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            {status.charAt(0).toUpperCase() + status.slice(1)}
            {status !== 'all' && ` (${pets.filter(p => p.status === status).length})`}
          </button>
        ))}
      </div>

     {}
      {filteredPets.length === 0 ? (
        <div className="text-center py-12">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <PawPrint className="text-gray-400" size={24} />
          </div>
          <h3 className="text-lg font-semibold text-gray-600 mb-2">No pets found</h3>
          <p className="text-gray-500">
            {filter === 'all' 
              ? 'No pets in the system yet. Click "Add New Pet" to get started.' 
              : `No pets with status "${filter}".`}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredPets.map((pet) => (
            <div key={pet.id} className="bg-gray-50 rounded-lg overflow-hidden border border-gray-200 hover:shadow-lg transition-shadow">
              {}
              <div className="relative h-48 bg-gray-200">
                {pet.imageUrl && pet.imageUrl.trim() !== '' ? (
                  <img 
                    src={pet.imageUrl} 
                    alt={pet.name || 'Pet'}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      console.warn('⚠️ Image failed to load:', pet.imageUrl);
                      e.target.onerror = null; 
                      e.target.style.display = 'none';
                      e.target.parentElement.innerHTML = `
                        <div class="w-full h-full flex flex-col items-center justify-center bg-gray-300">
                          <svg class="w-12 h-12 text-gray-400 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
                          </svg>
                          <span class="text-gray-500 text-sm">Image not available</span>
                        </div>
                      `;
                    }}
                  />
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center bg-gray-300">
                    <PawPrint size={48} className="text-gray-400 mb-2" />
                    <span className="text-gray-500 text-sm">No Image</span>
                  </div>
                )}
                <div className="absolute top-2 right-2">
                  {getStatusBadge(pet.status)}
                </div>
              </div>

             {}
              <div className="p-4">
                <div className="flex items-start justify-between mb-2">
                  <h3 className="font-bold text-lg text-gray-800">{pet.name || 'Unnamed Pet'}</h3>
                  <span className="text-pink-500 text-sm font-bold">
                    {pet.gender === 'male' ? '♂' : pet.gender === 'female' ? '♀' : '?'}
                  </span>
                </div>
                
                <div className="space-y-1 text-sm text-gray-600 mb-4">
                  <p><strong>Breed:</strong> {pet.breed || 'Unknown'}</p>
                  <p><strong>Age:</strong> {pet.age || 'Unknown'}</p>
                  <p><strong>Size:</strong> {pet.size || 'Unknown'}</p>
                  <p><strong>Color:</strong> {pet.color || 'Unknown'}</p>
                  {pet.vaccinated && <p className="text-green-600">✓ Vaccinated</p>}
                  {pet.neutered && <p className="text-purple-600">✓ Spayed/Neutered</p>}
                </div>

                {}
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => {
                      if (setSelectedPet) {
                        setSelectedPet(pet);
                        setCurrentScreen('petDetail');
                      } else {
                        console.log('View pet:', pet);
                        alert(`Viewing details for ${pet.name}`);
                      }
                    }}
                    className="flex-1 bg-blue-500 text-white py-2 px-3 rounded text-sm hover:bg-blue-600 transition-colors flex items-center justify-center gap-1"
                  >
                    <Eye size={14} />
                    View
                  </button>
                  
                  <button
                    onClick={() => updatePetStatus(pet.id, 'adopted')}
                    disabled={pet.status === 'adopted'}
                    className="flex-1 bg-green-500 text-white py-2 px-3 rounded text-sm hover:bg-green-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-1"
                  >
                    <CheckCircle size={14} />
                    {pet.status === 'adopted' ? 'Adopted' : 'Mark Adopted'}
                  </button>
                  
                  <button
                    onClick={() => deletePet(pet.id, pet.imageUrl)}
                    className="bg-red-500 text-white py-2 px-3 rounded text-sm hover:bg-red-600 transition-colors flex items-center justify-center gap-1"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ManagePets;