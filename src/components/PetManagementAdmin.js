import React, { useState, useEffect } from 'react';
import { PawPrint, Edit2, Trash2, Eye, Search, Filter, Plus, X, Check, AlertCircle } from 'lucide-react';
import { collection, getDocs, doc, updateDoc, deleteDoc, query, orderBy } from 'firebase/firestore';
import { ref, deleteObject } from 'firebase/storage';
import { db, storage } from '../config/firebaseConfig';


const PetManagementAdmin = ({ setCurrentScreen }) => {
  const [pets, setPets] = useState([]);
  const [filteredPets, setFilteredPets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterType, setFilterType] = useState('all');
  const [selectedPet, setSelectedPet] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [editFormData, setEditFormData] = useState({});
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    loadPets();
  }, []);

  useEffect(() => {
    filterPets();
  }, [searchQuery, filterStatus, filterType, pets]);

  const loadPets = async () => {
    try {
      setLoading(true);
      const q = query(collection(db, 'pets'), orderBy('createdAt', 'desc'));
      const querySnapshot = await getDocs(q);
      
      const petsData = [];
      querySnapshot.forEach((doc) => {
        petsData.push({
          id: doc.id,
          ...doc.data()
        });
      });
      
      setPets(petsData);
      setFilteredPets(petsData);
    } catch (error) {
      console.error('Error loading pets:', error);
      alert('Failed to load pets. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const filterPets = () => {
    let filtered = [...pets];

    if (searchQuery.trim()) {
      filtered = filtered.filter(pet => 
        pet.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        pet.breed?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        pet.color?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }


    if (filterStatus !== 'all') {
      filtered = filtered.filter(pet => pet.status === filterStatus);
    }


    if (filterType !== 'all') {
      filtered = filtered.filter(pet => pet.type === filterType);
    }

    setFilteredPets(filtered);
  };

  const handleEditClick = (pet) => {
    setSelectedPet(pet);
    setEditFormData({
      name: pet.name || '',
      type: pet.type || 'dog',
      breed: pet.breed || '',
      age: pet.age || '',
      gender: pet.gender || 'male',
      size: pet.size || 'medium',
      color: pet.color || '',
      description: pet.description || '',
      healthStatus: pet.healthStatus || '',
      vaccinated: pet.vaccinated || false,
      neutered: pet.neutered || false,
      status: pet.status || 'available',
      location: pet.location || ''
    });
    setShowEditModal(true);
  };

  const handleUpdatePet = async () => {
    if (!selectedPet) return;

    try {
      setUpdating(true);
      const petRef = doc(db, 'pets', selectedPet.id);
      
      await updateDoc(petRef, {
        ...editFormData,
        updatedAt: new Date()
      });

    
      setPets(pets.map(pet => 
        pet.id === selectedPet.id 
          ? { ...pet, ...editFormData, updatedAt: new Date() }
          : pet
      ));

      setShowEditModal(false);
      alert('Pet updated successfully!');
    } catch (error) {
      console.error('Error updating pet:', error);
      alert('Failed to update pet. Please try again.');
    } finally {
      setUpdating(false);
    }
  };

  const handleDeletePet = async () => {
    if (!selectedPet) return;

    try {
      setUpdating(true);

      
      await deleteDoc(doc(db, 'pets', selectedPet.id));

     
      if (selectedPet.imageUrl && selectedPet.imageUrl.includes('firebasestorage')) {
        try {
          const imageRef = ref(storage, selectedPet.imageUrl);
          await deleteObject(imageRef);
        } catch (error) {
          console.warn('Could not delete image from storage:', error);
        }
      }

      
      setPets(pets.filter(pet => pet.id !== selectedPet.id));

      setShowDeleteModal(false);
      alert('Pet deleted successfully!');
    } catch (error) {
      console.error('Error deleting pet:', error);
      alert('Failed to delete pet. Please try again.');
    } finally {
      setUpdating(false);
    }
  };

  const getStatusBadge = (status) => {
    const badges = {
      available: { color: 'bg-green-100 text-green-700', text: '✅ Available' },
      pending: { color: 'bg-yellow-100 text-yellow-700', text: '⏳ Pending' },
      adopted: { color: 'bg-purple-100 text-purple-700', text: '🏠 Adopted' }
    };
    const badge = badges[status] || badges.available;
    return (
      <span className={`${badge.color} px-3 py-1 rounded-full text-xs font-semibold`}>
        {badge.text}
      </span>
    );
  };

  const formatDate = (timestamp) => {
    if (!timestamp) return 'N/A';
    try {
      const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
    } catch (e) {
      return 'N/A';
    }
  };


  const EditModal = () => (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl p-6 max-w-2xl w-full my-8">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-2xl font-bold text-gray-800">Edit Pet</h3>
          <button onClick={() => setShowEditModal(false)} className="text-gray-500 hover:text-gray-700">
            <X size={24} />
          </button>
        </div>

        <div className="space-y-4 max-h-[60vh] overflow-y-auto">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Pet Name</label>
              <input
                type="text"
                value={editFormData.name}
                onChange={(e) => setEditFormData({...editFormData, name: e.target.value})}
                className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Type</label>
              <select
                value={editFormData.type}
                onChange={(e) => setEditFormData({...editFormData, type: e.target.value})}
                className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500"
              >
                <option value="dog">Dog</option>
                <option value="cat">Cat</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Breed</label>
              <input
                type="text"
                value={editFormData.breed}
                onChange={(e) => setEditFormData({...editFormData, breed: e.target.value})}
                className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Age</label>
              <input
                type="text"
                value={editFormData.age}
                onChange={(e) => setEditFormData({...editFormData, age: e.target.value})}
                className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Gender</label>
              <select
                value={editFormData.gender}
                onChange={(e) => setEditFormData({...editFormData, gender: e.target.value})}
                className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500"
              >
                <option value="male">Male</option>
                <option value="female">Female</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Size</label>
              <select
                value={editFormData.size}
                onChange={(e) => setEditFormData({...editFormData, size: e.target.value})}
                className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500"
              >
                <option value="small">Small</option>
                <option value="medium">Medium</option>
                <option value="large">Large</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Color</label>
              <input
                type="text"
                value={editFormData.color}
                onChange={(e) => setEditFormData({...editFormData, color: e.target.value})}
                className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Status</label>
              <select
                value={editFormData.status}
                onChange={(e) => setEditFormData({...editFormData, status: e.target.value})}
                className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500"
              >
                <option value="available">Available</option>
                <option value="pending">Pending</option>
                <option value="adopted">Adopted</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Description</label>
            <textarea
              value={editFormData.description}
              onChange={(e) => setEditFormData({...editFormData, description: e.target.value})}
              rows={3}
              className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Health Status</label>
            <input
              type="text"
              value={editFormData.healthStatus}
              onChange={(e) => setEditFormData({...editFormData, healthStatus: e.target.value})}
              className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500"
            />
          </div>

          <div className="flex items-center space-x-6">
            <label className="flex items-center space-x-2 cursor-pointer">
              <input
                type="checkbox"
                checked={editFormData.vaccinated}
                onChange={(e) => setEditFormData({...editFormData, vaccinated: e.target.checked})}
                className="w-5 h-5 text-blue-600"
              />
              <span className="text-sm font-medium">Vaccinated</span>
            </label>

            <label className="flex items-center space-x-2 cursor-pointer">
              <input
                type="checkbox"
                checked={editFormData.neutered}
                onChange={(e) => setEditFormData({...editFormData, neutered: e.target.checked})}
                className="w-5 h-5 text-purple-600"
              />
              <span className="text-sm font-medium">Spayed/Neutered</span>
            </label>
          </div>
        </div>

        <div className="flex space-x-3 mt-6 pt-4 border-t">
          <button
            onClick={() => setShowEditModal(false)}
            className="flex-1 bg-gray-200 text-gray-700 py-3 rounded-lg font-semibold hover:bg-gray-300"
          >
            Cancel
          </button>
          <button
            onClick={handleUpdatePet}
            disabled={updating}
            className="flex-1 bg-gradient-to-r from-pink-500 to-purple-500 text-white py-3 rounded-lg font-semibold hover:shadow-lg disabled:opacity-50"
          >
            {updating ? 'Updating...' : 'Update Pet'}
          </button>
        </div>
      </div>
    </div>
  );


  const DeleteModal = () => (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl p-6 max-w-md w-full">
        <div className="text-center mb-6">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertCircle className="text-red-500" size={32} />
          </div>
          <h3 className="text-2xl font-bold text-gray-800 mb-2">Delete Pet?</h3>
          <p className="text-gray-600">
            Are you sure you want to delete <strong>{selectedPet?.name}</strong>? This action cannot be undone.
          </p>
        </div>

        <div className="flex space-x-3">
          <button
            onClick={() => setShowDeleteModal(false)}
            className="flex-1 bg-gray-200 text-gray-700 py-3 rounded-lg font-semibold hover:bg-gray-300"
          >
            Cancel
          </button>
          <button
            onClick={handleDeletePet}
            disabled={updating}
            className="flex-1 bg-red-500 text-white py-3 rounded-lg font-semibold hover:bg-red-600 disabled:opacity-50"
          >
            {updating ? 'Deleting...' : 'Delete'}
          </button>
        </div>
      </div>
    </div>
  );

 
  const ViewModal = () => (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl p-6 max-w-2xl w-full my-8">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-2xl font-bold text-gray-800">Pet Details</h3>
          <button onClick={() => setShowViewModal(false)} className="text-gray-500 hover:text-gray-700">
            <X size={24} />
          </button>
        </div>

        {selectedPet && (
          <div className="space-y-4">
            <div className="flex justify-center mb-4">
              <img 
                src={selectedPet.imageUrl} 
                alt={selectedPet.name}
                className="w-64 h-64 object-cover rounded-lg"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-semibold text-gray-500">Name</label>
                <p className="text-lg text-gray-800">{selectedPet.name}</p>
              </div>
              <div>
                <label className="text-sm font-semibold text-gray-500">Type</label>
                <p className="text-lg text-gray-800 capitalize">{selectedPet.type}</p>
              </div>
              <div>
                <label className="text-sm font-semibold text-gray-500">Breed</label>
                <p className="text-lg text-gray-800">{selectedPet.breed}</p>
              </div>
              <div>
                <label className="text-sm font-semibold text-gray-500">Age</label>
                <p className="text-lg text-gray-800">{selectedPet.age}</p>
              </div>
              <div>
                <label className="text-sm font-semibold text-gray-500">Gender</label>
                <p className="text-lg text-gray-800 capitalize">{selectedPet.gender}</p>
              </div>
              <div>
                <label className="text-sm font-semibold text-gray-500">Size</label>
                <p className="text-lg text-gray-800 capitalize">{selectedPet.size}</p>
              </div>
              <div>
                <label className="text-sm font-semibold text-gray-500">Color</label>
                <p className="text-lg text-gray-800">{selectedPet.color}</p>
              </div>
              <div>
                <label className="text-sm font-semibold text-gray-500">Status</label>
                <div className="mt-1">{getStatusBadge(selectedPet.status)}</div>
              </div>
            </div>

            <div>
              <label className="text-sm font-semibold text-gray-500">Description</label>
              <p className="text-gray-800">{selectedPet.description || 'N/A'}</p>
            </div>

            <div>
              <label className="text-sm font-semibold text-gray-500">Health Status</label>
              <p className="text-gray-800">{selectedPet.healthStatus || 'N/A'}</p>
            </div>

            <div className="flex space-x-4">
              <div>
                <label className="text-sm font-semibold text-gray-500">Vaccinated</label>
                <p className="text-gray-800">{selectedPet.vaccinated ? '✅ Yes' : '❌ No'}</p>
              </div>
              <div>
                <label className="text-sm font-semibold text-gray-500">Spayed/Neutered</label>
                <p className="text-gray-800">{selectedPet.neutered ? '✅ Yes' : '❌ No'}</p>
              </div>
            </div>

            <div>
              <label className="text-sm font-semibold text-gray-500">Added On</label>
              <p className="text-gray-800">{formatDate(selectedPet.createdAt)}</p>
            </div>
          </div>
        )}

        <button
          onClick={() => setShowViewModal(false)}
          className="w-full mt-6 bg-gray-200 text-gray-700 py-3 rounded-lg font-semibold hover:bg-gray-300"
        >
          Close
        </button>
      </div>
    </div>
  );

  return (
    <div className="bg-white rounded-xl shadow-md">
      {showEditModal && <EditModal />}
      {showDeleteModal && <DeleteModal />}
      {showViewModal && <ViewModal />}

      {}
      <div className="p-6 border-b border-gray-200">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold text-gray-800">Manage Pets</h2>
          <button
            onClick={() => setCurrentScreen('addPet')}
            className="bg-gradient-to-r from-pink-500 to-purple-500 text-white px-4 py-2 rounded-lg font-semibold hover:shadow-lg transition-all flex items-center space-x-2"
          >
            <Plus size={20} />
            <span>Add New Pet</span>
          </button>
        </div>

        {}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Search pets..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500"
            />
          </div>

          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-4 py-2 border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500"
          >
            <option value="all">All Status</option>
            <option value="available">Available</option>
            <option value="pending">Pending</option>
            <option value="adopted">Adopted</option>
          </select>

          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="px-4 py-2 border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500"
          >
            <option value="all">All Types</option>
            <option value="dog">Dogs</option>
            <option value="cat">Cats</option>
          </select>
        </div>

        <div className="mt-4 text-sm text-gray-600">
          Showing {filteredPets.length} of {pets.length} pets
        </div>
      </div>

        {}
      <div className="p-6">
        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-500 mx-auto"></div>
            <p className="text-gray-500 mt-4">Loading pets...</p>
          </div>
        ) : filteredPets.length === 0 ? (
          <div className="text-center py-12">
            <PawPrint className="text-gray-300 mx-auto mb-4" size={48} />
            <p className="text-gray-500">No pets found</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredPets.map((pet) => (
              <div key={pet.id} className="bg-white border-2 border-gray-200 rounded-lg overflow-hidden hover:shadow-lg transition-shadow">
                <div className="relative">
                  <img 
                    src={pet.imageUrl} 
                    alt={pet.name}
                    className="w-full h-48 object-cover"
                  />
                  <div className="absolute top-2 right-2">
                    {getStatusBadge(pet.status)}
                  </div>
                  {pet.vaccinated && (
                    <div className="absolute top-2 left-2 bg-green-500 text-white text-xs px-2 py-1 rounded-full">
                      ✓ Vaccinated
                    </div>
                  )}
                </div>

                <div className="p-4">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="text-lg font-bold text-gray-800">{pet.name}</h3>
                    <span className="text-gray-500">{pet.gender === 'male' ? '♂️' : '♀️'}</span>
                  </div>
                  <p className="text-sm text-gray-600 mb-3">
                    {pet.breed} • {pet.age} • {pet.color}
                  </p>
                  <p className="text-xs text-gray-500 mb-4 line-clamp-2">{pet.description}</p>

                  <div className="flex space-x-2">
                    <button
                      onClick={() => {
                        setSelectedPet(pet);
                        setShowViewModal(true);
                      }}
                      className="flex-1 bg-blue-100 text-blue-700 py-2 rounded-lg text-sm font-semibold hover:bg-blue-200 flex items-center justify-center space-x-1"
                    >
                      <Eye size={16} />
                      <span>View</span>
                    </button>
                    <button
                      onClick={() => handleEditClick(pet)}
                      className="flex-1 bg-green-100 text-green-700 py-2 rounded-lg text-sm font-semibold hover:bg-green-200 flex items-center justify-center space-x-1"
                    >
                      <Edit2 size={16} />
                      <span>Edit</span>
                    </button>
                    <button
                      onClick={() => {
                        setSelectedPet(pet);
                        setShowDeleteModal(true);
                      }}
                      className="flex-1 bg-red-100 text-red-700 py-2 rounded-lg text-sm font-semibold hover:bg-red-200 flex items-center justify-center space-x-1"
                    >
                      <Trash2 size={16} />
                      <span>Delete</span>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default PetManagementAdmin;