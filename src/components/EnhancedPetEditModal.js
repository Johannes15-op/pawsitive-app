import React, { useState } from 'react';
import { X, Save, AlertCircle, FileText, PawPrint, Edit } from 'lucide-react';

const EnhancedPetEditModal = () => {
  const [showEditModal, setShowEditModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [validationErrors, setValidationErrors] = useState({});
  
  const samplePet = {
    id: '1',
    name: 'Nala',
    type: 'dog',
    breed: 'puspin',
    age: '1year',
    gender: 'male',
    size: 'medium',
    color: 'gray',
    description: 'asdasfas',
    healthStatus: 'Healthy',
    medicalRecords: '',
    vaccinated: true,
    neutered: true,
    status: 'undertreatment',
    imageUrl: 'https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=400',
    createdAt: { seconds: 1734825600 }
  };

  const [editFormData, setEditFormData] = useState({
    name: samplePet.name,
    type: samplePet.type,
    breed: samplePet.breed,
    age: samplePet.age,
    gender: samplePet.gender,
    size: samplePet.size,
    color: samplePet.color,
    description: samplePet.description,
    healthStatus: samplePet.healthStatus || '',
    medicalRecords: samplePet.medicalRecords || '',
    vaccinated: samplePet.vaccinated,
    neutered: samplePet.neutered,
    status: samplePet.status
  });

  const validateForm = () => {
    const errors = {};
    
    if (!editFormData.name || editFormData.name.trim() === '') {
      errors.name = 'Pet name is required';
    }
    
    if (!editFormData.breed || editFormData.breed.trim() === '') {
      errors.breed = 'Breed is required';
    }
    
    if (!editFormData.age || editFormData.age.trim() === '') {
      errors.age = 'Age is required';
    }
    
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleUpdatePet = async () => {
    if (!validateForm()) {
      alert('Please fill in all required fields');
      return;
    }

    try {
      setUpdating(true);
      
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      alert('Pet information updated successfully! ✅');
      setShowEditModal(false);
      setShowViewModal(true);
    } catch (error) {
      console.error('Error updating pet:', error);
      alert('Error updating pet: ' + error.message);
    } finally {
      setUpdating(false);
    }
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      available: { color: 'bg-green-100 text-green-800', text: 'Available' },
      pending: { color: 'bg-yellow-100 text-yellow-800', text: 'Pending' },
      adopted: { color: 'bg-blue-100 text-blue-800', text: 'Adopted' },
      undertreatment: { color: 'bg-orange-100 text-orange-800', text: 'Under Treatment' }
    };
    
    const config = statusConfig[status] || statusConfig.available;
    return (
      <span className={`px-3 py-1 rounded-full text-xs font-medium ${config.color}`}>
        {config.text}
      </span>
    );
  };

 
  if (showViewModal && !showEditModal) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
          <div className="sticky top-0 bg-white border-b border-gray-200 p-4 flex justify-between items-center rounded-t-xl">
            <h3 className="text-xl font-bold text-gray-800">Pet Details</h3>
            <button
              onClick={() => setShowViewModal(false)}
              className="text-gray-500 hover:text-gray-700"
            >
              <X size={24} />
            </button>
          </div>
          
          <div className="p-6">
            {}
            <div className="relative h-64 bg-gray-200 rounded-lg overflow-hidden mb-6">
              <img 
                src={samplePet.imageUrl} 
                alt={samplePet.name}
                className="w-full h-full object-cover"
              />
              <div className="absolute top-2 right-2">
                {getStatusBadge(samplePet.status)}
              </div>
            </div>

            {}
            <div className="mb-6">
              <div className="flex items-center justify-between mb-2">
                <h2 className="text-3xl font-bold text-gray-800">{samplePet.name}</h2>
                <span className="text-3xl">
                  {samplePet.gender === 'male' ? '♂' : '♀'}
                </span>
              </div>
              <p className="text-lg text-gray-600">{samplePet.breed}</p>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-6 pb-6 border-b border-gray-200">
              <div>
                <p className="text-sm text-gray-500 mb-1">Age</p>
                <p className="font-semibold text-gray-800">{samplePet.age}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500 mb-1">Size</p>
                <p className="font-semibold text-gray-800 capitalize">{samplePet.size}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500 mb-1">Color</p>
                <p className="font-semibold text-gray-800">{samplePet.color}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500 mb-1">Gender</p>
                <p className="font-semibold text-gray-800 capitalize">{samplePet.gender}</p>
              </div>
            </div>

            {samplePet.description && (
              <div className="mb-6">
                <p className="text-sm font-semibold text-gray-700 mb-2">Description</p>
                <p className="text-gray-700 bg-gray-50 p-3 rounded-lg">{samplePet.description}</p>
              </div>
            )}

            <div className="flex flex-wrap gap-2 mb-6">
              {samplePet.vaccinated && (
                <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-sm font-medium">
                  ✓ Vaccinated
                </span>
              )}
              {samplePet.neutered && (
                <span className="bg-purple-100 text-purple-700 px-3 py-1 rounded-full text-sm font-medium">
                  ✓ Spayed/Neutered
                </span>
              )}
            </div>

            <div className="text-sm text-gray-500 pt-4 border-t border-gray-200">
              Added on {new Date(samplePet.createdAt.seconds * 1000).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              })}
            </div>
          </div>
          
          {}
          <div className="sticky bottom-0 bg-white border-t border-gray-200 p-4 flex gap-2 rounded-b-xl">
            <button
              onClick={() => {
                setShowViewModal(false);
                setShowEditModal(true);
              }}
              className="flex-1 bg-orange-500 text-white py-3 rounded-lg hover:bg-orange-600 transition-colors font-semibold flex items-center justify-center gap-2"
            >
              <Edit size={18} />
              Edit Status
            </button>
            <button
              onClick={() => alert('Delete functionality')}
              className="bg-red-500 text-white py-3 px-6 rounded-lg hover:bg-red-600 transition-colors font-semibold"
            >
              Delete
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!showEditModal) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="text-center">
          <PawPrint size={64} className="text-gray-300 mx-auto mb-4" />
          <p className="text-gray-600">Click a button to open modal</p>
          <button
            onClick={() => setShowViewModal(true)}
            className="mt-4 bg-blue-500 text-white px-6 py-2 rounded-lg hover:bg-blue-600"
          >
            View Pet Details
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-200 p-4 flex justify-between items-center rounded-t-xl z-10">
          <h3 className="text-xl font-bold text-gray-800">Edit Pet Information</h3>
          <button
            onClick={() => setShowEditModal(false)}
            className="text-gray-500 hover:text-gray-700"
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
              >
                <option value="undertreatment">🏥 Under Treatment</option>
                <option value="available">✅ Available for Adoption</option>
                <option value="pending">⏳ Pending</option>
                <option value="adopted">🏠 Adopted</option>
              </select>
            </div>

            {}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Health Status
              </label>
              <input
                type="text"
                value={editFormData.healthStatus}
                onChange={(e) => setEditFormData({...editFormData, healthStatus: e.target.value})}
                className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500"
                placeholder="e.g., Healthy, Recovering"
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
            />
          </div>

          {}
          <div className="mt-4">
            <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
              <FileText size={16} className="text-blue-500" />
              Medical Records & History
            </label>
            <textarea
              value={editFormData.medicalRecords}
              onChange={(e) => setEditFormData({...editFormData, medicalRecords: e.target.value})}
              rows={5}
              className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500 font-mono text-sm"
              placeholder="Enter medical history, vaccinations, treatments, medications, veterinary visits, etc.&#10;&#10;Example:&#10;2024-01-15: Vaccinated (Rabies, Distemper)&#10;2024-02-20: Treated for ear infection&#10;2024-03-10: Spayed/Neutered&#10;Medications: Currently on heartworm prevention"
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
              />
              <span className="text-sm font-medium text-gray-700">Vaccinated</span>
            </label>

            <label className="flex items-center space-x-2 cursor-pointer">
              <input
                type="checkbox"
                checked={editFormData.neutered}
                onChange={(e) => setEditFormData({...editFormData, neutered: e.target.checked})}
                className="w-5 h-5 text-purple-600 rounded focus:ring-2 focus:ring-purple-500"
              />
              <span className="text-sm font-medium text-gray-700">Spayed/Neutered</span>
            </label>
          </div>
        </div>
        
        <div className="sticky bottom-0 bg-white border-t border-gray-200 p-4 flex gap-2 rounded-b-xl">
          <button
            onClick={() => setShowEditModal(false)}
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
  );
};

export default EnhancedPetEditModal;