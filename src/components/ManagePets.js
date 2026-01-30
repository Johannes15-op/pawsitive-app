import React, { useState, useEffect } from 'react';
import { Eye, Edit, Trash2, PawPrint, X, AlertCircle, FileText, Save } from 'lucide-react';
import { collection, getDocs, doc, updateDoc, deleteDoc, query, orderBy, serverTimestamp } from 'firebase/firestore';
import { db } from '../config/firebaseConfig';
import { getPetImage } from '../utils/getPetImage';

const ManagePets = ({ setCurrentScreen }) => {
  const [pets, setPets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [selectedPet, setSelectedPet] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingPet, setEditingPet] = useState(null);
  const [editFormData, setEditFormData] = useState({});
  const [updating, setUpdating] = useState(false);
  const [validationErrors, setValidationErrors] = useState({});
  const [searchTerm, setSearchTerm] = useState('');

  
  const loadPets = async () => {
    try {
      setLoading(true);
      const q = query(collection(db, 'pets'), orderBy('createdAt', 'desc'));
      const snapshot = await getDocs(q);
      const petsData = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
      setPets(petsData);
    } catch (error) {
      console.error('Error loading pets:', error);
      alert('Failed to load pets: ' + (error?.message || error));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPets();
  }, []);

  const validateForm = () => {
    const errors = {};
    
    if (!editFormData.name?.trim()) {
      errors.name = 'Pet name is required';
    }
    
    if (!editFormData.breed?.trim()) {
      errors.breed = 'Breed is required';
    }
    
    if (!editFormData.age?.trim()) {
      errors.age = 'Age is required';
    }
    
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleEditClick = (pet) => {
    console.log('📝 Opening edit modal for pet:', pet.name);
    console.log('🔍 Pet data:', pet);
    
    setEditingPet(pet);
    setEditFormData({
      name: pet.name || '',
      type: pet.type || 'dog',
      breed: pet.breed || '',
      age: pet.age || '',
      gender: pet.gender || 'male',
      size: pet.size || '',
      color: pet.color || '',
      description: pet.description || '',
      healthStatus: pet.healthStatus || '',
      medicalHistory: pet.medicalHistory || pet.medicalRecords || pet.medicalRecord || '',
      vaccinated: pet.vaccinated || false,
      neutered: pet.neutered || false,
      status: pet.status || 'available'
    });
    setValidationErrors({});
    setShowEditModal(true);
    setShowModal(false);
  };

  const handleDeletePet = async (petId) => {
    if (!window.confirm('Are you sure you want to delete this pet? This action cannot be undone.')) {
      return;
    }

    try {
      console.log('🗑️ Deleting pet:', petId);
      await deleteDoc(doc(db, 'pets', petId));

      await loadPets();
      setShowModal(false);
      setSelectedPet(null);
      
      console.log('✅ Pet deleted successfully');
      alert('Pet deleted successfully! ✅');
    } catch (error) {
      console.error('❌ Error deleting pet:', error);
      alert('Error deleting pet: ' + (error?.message || error));
    }
  };

  const handleUpdatePet = async () => {
    if (!editingPet) return;
    
    if (!validateForm()) {
      alert('Please fill in all required fields');
      return;
    }

    try {
      setUpdating(true);
      
      console.log('💾 Updating pet:', editingPet.id);
      console.log('📝 New data:', editFormData);
      
      const petRef = doc(db, 'pets', editingPet.id);
      
      await updateDoc(petRef, { 
        ...editFormData, 
        updatedAt: serverTimestamp() 
      });
 
      await loadPets();
  
      if (selectedPet?.id === editingPet.id) {
        setSelectedPet({ ...selectedPet, ...editFormData });
      }
      
      setShowEditModal(false);
      setEditingPet(null);
      
      console.log('✅ Pet updated successfully');
      alert('Pet information updated successfully! ✅');
      
    } catch (error) {
      console.error('❌ Error updating pet:', error);
      alert('Error updating pet: ' + (error?.message || error));
    } finally {
      setUpdating(false);
    }
  };

  const filteredPets = pets.filter(pet => {
    const matchesFilter = filter === 'all' || pet.status === filter;
    const matchesSearch = !searchTerm || 
      pet.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (pet.breed && pet.breed.toLowerCase().includes(searchTerm.toLowerCase()));
    return matchesFilter && matchesSearch;
  });

  const getStatusBadge = (status) => {
    const statusConfig = {
      available: { color: 'bg-green-100 text-green-800', text: 'Available' },
      pending: { color: 'bg-yellow-100 text-yellow-800', text: 'Pending' },
      adopted: { color: 'bg-blue-100 text-blue-800', text: 'Adopted' },
      undertreatment: { color: 'bg-orange-100 text-orange-800', text: 'Under Treatment' }
    };
    
    const config = statusConfig[status] || statusConfig.available;
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${config.color}`}>
        {config.text}
      </span>
    );
  };

  const statusCounts = {
    all: pets.length,
    available: pets.filter(p => p.status === 'available').length,
    pending: pets.filter(p => p.status === 'pending').length,
    adopted: pets.filter(p => p.status === 'adopted').length,
    undertreatment: pets.filter(p => p.status === 'undertreatment').length
  };

  const formatTimestamp = (timestamp) => {
    if (!timestamp) return 'N/A';
    try {
      const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
      return date.toLocaleDateString();
    } catch (e) {
      return 'N/A';
    }
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
    {}
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Manage Pets</h2>
          <p className="text-gray-600">View and manage all pets in the system</p>
        </div>
        <button
          onClick={() => setCurrentScreen?.('addPet')}
          className="bg-gradient-to-r from-pink-500 to-purple-500 text-white px-6 py-3 rounded-lg font-semibold hover:shadow-lg transition-all"
        >
          + Add New Pet
        </button>
      </div>

     {}
      <div className="mb-4">
        <input
          type="text"
          placeholder="Search by name or breed..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500"
        />
      </div>
      
    {}
      <div className="flex flex-wrap gap-2 mb-6">
        {['all', 'available', 'pending', 'adopted', 'undertreatment'].map((status) => (
          <button
            key={status}
            onClick={() => setFilter(status)}
            className={`px-4 py-2 rounded-lg font-medium transition-all ${
              filter === status
                ? 'bg-pink-500 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            {status === 'all' ? 'All' : 
             status === 'undertreatment' ? 'Under Treatment' :
             status.charAt(0).toUpperCase() + status.slice(1)}
            {` (${statusCounts[status]})`}
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
            {searchTerm 
              ? `No pets match "${searchTerm}"`
              : filter === 'all' 
                ? 'No pets in the system yet.' 
                : `No pets with status "${filter === 'undertreatment' ? 'Under Treatment' : filter}".`}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredPets.map((pet) => (
            <div key={pet.id} className="bg-gray-50 rounded-lg overflow-hidden border border-gray-200 hover:shadow-lg transition-shadow">
              {}
              <div className="relative h-48 bg-gray-200">
                {getPetImage(pet.imageUrl) ? (
                  <img 
                    src={getPetImage(pet.imageUrl)}
                    alt={pet.name}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.style.display = 'none';
                      e.target.nextElementSibling.style.display = 'flex';
                    }}
                  />
                ) : null}
                <div className="w-full h-full flex items-center justify-center bg-gray-300" style={{ display: getPetImage(pet.imageUrl) ? 'none' : 'flex' }}>
                  <PawPrint size={48} className="text-gray-400" />
                </div>
                <div className="absolute top-2 right-2">
                  {getStatusBadge(pet.status)}
                </div>
              </div>

           {}
              <div className="p-4">
                <div className="flex items-start justify-between mb-2">
                  <h3 className="font-bold text-lg text-gray-800">{pet.name}</h3>
                  <span className="text-pink-500 text-xl">
                    {pet.gender === 'male' ? '♂' : '♀'}
                  </span>
                </div>
                
                <div className="space-y-1 text-sm text-gray-600 mb-4">
                  <p><strong>Breed:</strong> {pet.breed || 'Not specified'}</p>
                  <p><strong>Age:</strong> {pet.age || 'Not specified'}</p>
                  {pet.size && <p><strong>Size:</strong> {pet.size}</p>}
                  {pet.color && <p><strong>Color:</strong> {pet.color}</p>}
                  <div className="flex flex-wrap gap-1 mt-2">
                    {pet.vaccinated && (
                      <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded">✓ Vaccinated</span>
                    )}
                    {pet.neutered && (
                      <span className="text-xs bg-purple-100 text-purple-700 px-2 py-0.5 rounded">✓ Neutered</span>
                    )}
                    {(pet.medicalHistory || pet.medicalRecords || pet.medicalRecord) && (
                      <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded flex items-center gap-1">
                        <FileText size={10} /> Records
                      </span>
                    )}
                  </div>
                </div>

              {}
                <div className="flex flex-col gap-2">
                  <button
                    onClick={() => {
                      setSelectedPet(pet);
                      setShowModal(true);
                    }}
                    className="w-full bg-blue-500 text-white py-2.5 px-3 rounded-lg text-sm hover:bg-blue-600 transition-colors flex items-center justify-center gap-2 font-medium"
                  >
                    <Eye size={16} />
                    View Details
                  </button>
                  
                  <button
                    onClick={() => handleEditClick(pet)}
                    className="w-full bg-orange-500 text-white py-2.5 px-3 rounded-lg text-sm hover:bg-orange-600 transition-colors flex items-center justify-center gap-2 font-medium"
                  >
                    <Edit size={16} />
                    Edit Pet
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {}
      {showModal && selectedPet && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 p-4 flex justify-between items-center rounded-t-xl z-10">
              <h3 className="text-xl font-bold text-gray-800">Pet Details</h3>
              <button
                onClick={() => {
                  setShowModal(false);
                  setSelectedPet(null);
                }}
                className="text-gray-500 hover:text-gray-700 p-1 rounded-lg hover:bg-gray-100"
              >
                <X size={24} />
              </button>
            </div>
            
            <div className="p-6">
             {}
              <div className="relative h-64 bg-gray-200 rounded-lg overflow-hidden mb-6">
                {getPetImage(selectedPet.imageUrl) ? (
                  <img 
                    src={getPetImage(selectedPet.imageUrl)}
                    alt={selectedPet.name}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.style.display = 'none';
                      e.target.nextElementSibling.style.display = 'flex';
                    }}
                  />
                ) : null}
                <div className="w-full h-full flex items-center justify-center bg-gray-300" style={{ display: getPetImage(selectedPet.imageUrl) ? 'none' : 'flex' }}>
                  <PawPrint size={64} className="text-gray-400" />
                </div>
                <div className="absolute top-2 right-2">
                  {getStatusBadge(selectedPet.status)}
                </div>
              </div>

              {}
              <div className="space-y-4">
                <div className="flex items-start justify-between">
                  <div>
                    <h4 className="text-2xl font-bold text-gray-800">{selectedPet.name}</h4>
                    <p className="text-gray-600">{selectedPet.breed || 'Not specified'}</p>
                  </div>
                  <span className="text-4xl">
                    {selectedPet.gender === 'male' ? '♂' : '♀'}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-4 py-4 border-y border-gray-200">
                  <div>
                    <p className="text-sm text-gray-500">Age</p>
                    <p className="font-semibold text-gray-800">{selectedPet.age || 'Not specified'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Size</p>
                    <p className="font-semibold text-gray-800 capitalize">{selectedPet.size || 'Not specified'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Color</p>
                    <p className="font-semibold text-gray-800">{selectedPet.color || 'Not specified'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Type</p>
                    <p className="font-semibold text-gray-800 capitalize">{selectedPet.type || 'Not specified'}</p>
                  </div>
                </div>

                {selectedPet.description && (
                  <div>
                    <p className="text-sm font-semibold text-gray-700 mb-2">Description</p>
                    <p className="text-gray-700 bg-gray-50 p-3 rounded-lg">{selectedPet.description}</p>
                  </div>
                )}

                {selectedPet.healthStatus && (
                  <div>
                    <p className="text-sm font-semibold text-gray-700 mb-2">Health Status</p>
                    <p className="text-gray-700 bg-gray-50 p-3 rounded-lg">{selectedPet.healthStatus}</p>
                  </div>
                )}

                {}
                {(selectedPet.medicalHistory || selectedPet.medicalRecords || selectedPet.medicalRecord) && (
                  <div>
                    <p className="text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                      <FileText size={16} className="text-blue-500" />
                      Medical Records & History
                    </p>
                    <div className="text-gray-700 bg-blue-50 p-4 rounded-lg border border-blue-200 whitespace-pre-wrap text-sm">
                      {selectedPet.medicalHistory || selectedPet.medicalRecords || selectedPet.medicalRecord}
                    </div>
                  </div>
                )}

                <div className="flex flex-wrap gap-2">
                  {selectedPet.vaccinated && (
                    <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-sm font-medium">
                      ✓ Vaccinated
                    </span>
                  )}
                  {selectedPet.neutered && (
                    <span className="bg-purple-100 text-purple-700 px-3 py-1 rounded-full text-sm font-medium">
                      ✓ Spayed/Neutered
                    </span>
                  )}
                </div>

                {selectedPet.createdAt && (
                  <div className="text-sm text-gray-500 pt-4 border-t border-gray-200">
                    Added on {formatTimestamp(selectedPet.createdAt)}
                  </div>
                )}
              </div>

              {}
              <div className="flex gap-2 mt-6 pt-4 border-t border-gray-200">
                <button
                  onClick={() => {
                    setShowModal(false);
                    handleEditClick(selectedPet);
                  }}
                  className="flex-1 bg-orange-500 text-white py-3 rounded-lg hover:bg-orange-600 transition-colors flex items-center justify-center gap-2 font-semibold"
                >
                  <Edit size={18} />
                  Edit Pet
                </button>
                
                <button
                  onClick={() => handleDeletePet(selectedPet.id)}
                  className="bg-red-500 text-white py-3 px-6 rounded-lg hover:bg-red-600 transition-colors flex items-center justify-center gap-2 font-semibold"
                >
                  <Trash2 size={18} />
                  Delete
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

     {}
      {showEditModal && editingPet && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 p-4 flex justify-between items-center rounded-t-xl z-10">
              <h3 className="text-xl font-bold text-gray-800">Edit Pet Information</h3>
              <button
                onClick={() => {
                  setShowEditModal(false);
                  setEditingPet(null);
                  setValidationErrors({});
                }}
                className="text-gray-500 hover:text-gray-700 p-1 rounded-lg hover:bg-gray-100"
                disabled={updating}
              >
                <X size={24} />
              </button>
            </div>
            
            <div className="p-6">
           {}
              {Object.keys(validationErrors).length > 0 && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-start gap-2">
                  <AlertCircle size={20} className="text-red-500 flex-shrink-0 mt-0.5" />
                  <div className="text-sm text-red-700">
                    <p className="font-semibold mb-1">Please fix the following errors:</p>
                    <ul className="list-disc list-inside">
                      {Object.values(validationErrors).map((error, idx) => (
                        <li key={idx}>{error}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Pet Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={editFormData.name}
                    onChange={(e) => setEditFormData({...editFormData, name: e.target.value})}
                    className={`w-full px-4 py-2 border-2 rounded-lg focus:outline-none focus:ring-2 ${
                      validationErrors.name 
                        ? 'border-red-300 focus:ring-red-500' 
                        : 'border-gray-200 focus:ring-pink-500'
                    }`}
                    placeholder="Enter pet name"
                    disabled={updating}
                  />
                  {validationErrors.name && (
                    <p className="text-xs text-red-500 mt-1">{validationErrors.name}</p>
                  )}
                </div>

                {}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Type <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={editFormData.type}
                    onChange={(e) => setEditFormData({...editFormData, type: e.target.value})}
                    className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500"
                    disabled={updating}
                  >
                    <option value="dog">Dog</option>
                    <option value="cat">Cat</option>
                  </select>
                </div>

               {}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Breed <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={editFormData.breed}
                    onChange={(e) => setEditFormData({...editFormData, breed: e.target.value})}
                    className={`w-full px-4 py-2 border-2 rounded-lg focus:outline-none focus:ring-2 ${
                      validationErrors.breed 
                        ? 'border-red-300 focus:ring-red-500' 
                        : 'border-gray-200 focus:ring-pink-500'
                    }`}
                    placeholder="Enter breed"
                    disabled={updating}
                  />
                  {validationErrors.breed && (
                    <p className="text-xs text-red-500 mt-1">{validationErrors.breed}</p>
                  )}
                </div>

                {}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Age <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={editFormData.age}
                    onChange={(e) => setEditFormData({...editFormData, age: e.target.value})}
                    className={`w-full px-4 py-2 border-2 rounded-lg focus:outline-none focus:ring-2 ${
                      validationErrors.age 
                        ? 'border-red-300 focus:ring-red-500' 
                        : 'border-gray-200 focus:ring-pink-500'
                    }`}
                    placeholder="e.g., 2 years, 6 months"
                    disabled={updating}
                  />
                  {validationErrors.age && (
                    <p className="text-xs text-red-500 mt-1">{validationErrors.age}</p>
                  )}
                </div>

              {}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Gender <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={editFormData.gender}
                    onChange={(e) => setEditFormData({...editFormData, gender: e.target.value})}
                    className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500"
                    disabled={updating}
                  >
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                  </select>
                </div>

               {}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Size
                  </label>
                  <select
                    value={editFormData.size}
                    onChange={(e) => setEditFormData({...editFormData, size: e.target.value})}
                    className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500"
                    disabled={updating}
                  >
                    <option value="">Select size</option>
                    <option value="small">Small</option>
                    <option value="medium">Medium</option>
                    <option value="large">Large</option>
                  </select>
                </div>

              {}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Color
                  </label>
                  <input
                    type="text"
                    value={editFormData.color}
                    onChange={(e) => setEditFormData({...editFormData, color: e.target.value})}
                    className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500"
                    placeholder="Enter color"
                    disabled={updating}
                  />
                </div>

              {}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Status <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={editFormData.status}
                    onChange={(e) => setEditFormData({...editFormData, status: e.target.value})}
                    className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500"
                    disabled={updating}
                  >
                    <option value="undertreatment">🏥 Under Treatment</option>
                    <option value="available">✅ Available for Adoption</option>
                    <option value="pending">⏳ Pending</option>
                    <option value="adopted">🏠 Adopted</option>
                  </select>
                </div>

               {}
                <div className="md:col-span-2">
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Health Status
                  </label>
                  <input
                    type="text"
                    value={editFormData.healthStatus}
                    onChange={(e) => setEditFormData({...editFormData, healthStatus: e.target.value})}
                    className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500"
                    placeholder="e.g., Healthy, Recovering"
                    disabled={updating}
                  />
                </div>
              </div>

             {}
              <div className="mt-4">
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Description
                </label>
                <textarea
                  value={editFormData.description}
                  onChange={(e) => setEditFormData({...editFormData, description: e.target.value})}
                  rows={3}
                  className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500"
                  placeholder="Describe the pet's personality and behavior"
                  disabled={updating}
                />
              </div>

             {}
              <div className="mt-4">
                <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                  <FileText size={16} className="text-blue-500" />
                  Medical Records & History
                </label>
                <textarea
                  value={editFormData.medicalHistory}
                  onChange={(e) => setEditFormData({...editFormData, medicalHistory: e.target.value})}
                  rows={5}
                  className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500 font-mono text-sm"
                  placeholder="Enter medical history, vaccinations, treatments, medications, veterinary visits, etc.&#10;&#10;Example:&#10;- 2024-01-15: Vaccinated (Rabies, Distemper)&#10;- 2024-02-20: Treated for ear infection&#10;- 2024-03-10: Spayed/Neutered&#10;- Medications: Currently on heartworm prevention"
                  disabled={updating}
                />
                <p className="text-xs text-gray-500 mt-1">
                  💡 Record all medical history including vaccinations, treatments, surgeries, and ongoing medications
                </p>
              </div>

             {}
              <div className="mt-4 flex flex-wrap gap-6">
                <label className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={editFormData.vaccinated}
                    onChange={(e) => setEditFormData({...editFormData, vaccinated: e.target.checked})}
                    className="w-5 h-5 text-green-600 rounded focus:ring-2 focus:ring-green-500"
                    disabled={updating}
                  />
                  <span className="text-sm font-medium text-gray-700">Vaccinated</span>
                </label>

                <label className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={editFormData.neutered}
                    onChange={(e) => setEditFormData({...editFormData, neutered: e.target.checked})}
                    className="w-5 h-5 text-purple-600 rounded focus:ring-2 focus:ring-purple-500"
                    disabled={updating}
                  />
                  <span className="text-sm font-medium text-gray-700">Spayed/Neutered</span>
                </label>
              </div>
            </div>
            
            <div className="sticky bottom-0 bg-white border-t border-gray-200 p-4 flex gap-2 rounded-b-xl">
              <button
                onClick={() => {
                  setShowEditModal(false);
                  setEditingPet(null);
                }}
                className="flex-1 bg-gray-200 text-gray-700 py-3 rounded-lg hover:bg-gray-300 transition-colors font-semibold"
                disabled={updating}
              >
                Cancel
              </button>
              <button
                onClick={handleUpdatePet}
                disabled={updating}
                className="flex-1 bg-gradient-to-r from-pink-500 to-purple-500 text-white py-3 rounded-lg hover:shadow-lg transition-all font-semibold disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {updating ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    Saving...
                  </>
                ) : (
                  <>
                    <Save size={18} />
                    Save Changes
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManagePets;