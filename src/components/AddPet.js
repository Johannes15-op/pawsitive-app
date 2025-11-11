import React, { useState } from 'react';
import { ArrowLeft, Heart, Upload, X, CheckCircle } from 'lucide-react';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { collection, addDoc, serverTimestamp, getDocs } from 'firebase/firestore';
import { db, storage } from '../config/firebaseConfig';

const AddPet = ({ setCurrentScreen, currentUser }) => {
  const [formData, setFormData] = useState({
    name: '',
    type: 'dog',
    breed: '',
    age: '',
    gender: 'male',
    size: 'medium',
    color: '',
    description: '',
    healthStatus: '',
    vaccinated: false,
    neutered: false,
    status: 'available',
    location: 'Tabaco City Shelter'
  });

  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [successData, setSuccessData] = useState(null);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setErrors(prev => ({ ...prev, image: 'Image size should be less than 5MB' }));
        return;
      }

      if (!file.type.startsWith('image/')) {
        setErrors(prev => ({ ...prev, image: 'Please select a valid image file' }));
        return;
      }

      setImageFile(file);
      setErrors(prev => ({ ...prev, image: '' }));
      
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeImage = () => {
    setImageFile(null);
    setImagePreview(null);
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.name.trim()) {
      newErrors.name = 'Pet name is required';
    }
    
    if (!formData.breed.trim()) {
      newErrors.breed = 'Breed is required';
    }
    
    if (!formData.age.trim()) {
      newErrors.age = 'Age is required';
    }
    
    if (!formData.color.trim()) {
      newErrors.color = 'Color is required';
    }
    
    if (!formData.description.trim()) {
      newErrors.description = 'Description is required';
    }
    
    if (!imageFile) {
      newErrors.image = 'Pet image is required';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const uploadImageToStorage = async (file) => {
    try {
      const timestamp = Date.now();
      const filename = `pets/${timestamp}_${file.name}`;
      const storageRef = ref(storage, filename);
      
      await uploadBytes(storageRef, file);
      const downloadURL = await getDownloadURL(storageRef);
      
      return { success: true, url: downloadURL };
    } catch (error) {
      console.error('Error uploading image:', error);
      return { success: false, error: error.message };
    }
  };

  const createNotificationsForAllUsers = async (petData) => {
    try {
      const usersSnapshot = await getDocs(collection(db, 'users'));
      const notificationPromises = [];

      usersSnapshot.forEach((userDoc) => {
        const notificationData = {
          userId: userDoc.id,
          type: 'new_pet',
          title: '🐾 New Pet Available!',
          message: `${petData.name}, a ${petData.type}, is now available for adoption!`,
          data: {
            petId: petData.id,
            petName: petData.name,
            petType: petData.type,
            petBreed: petData.breed,
            petAge: petData.age,
            petImage: petData.imageUrl
          },
          read: false,
          createdAt: serverTimestamp()
        };

        notificationPromises.push(
          addDoc(collection(db, 'notifications'), notificationData)
        );
      });

      await Promise.all(notificationPromises);
      return { success: true, count: notificationPromises.length };
    } catch (error) {
      console.error('Error creating notifications:', error);
      return { success: false, error: error.message };
    }
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      return;
    }
    
    setLoading(true);
    
    try {
     
      const uploadResult = await uploadImageToStorage(imageFile);
      
      if (!uploadResult.success) {
        setErrors({ submit: 'Failed to upload image. Please try again.' });
        setLoading(false);
        return;
      }

      
      const petData = {
        ...formData,
        imageUrl: uploadResult.url,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        addedBy: currentUser?.uid || 'admin'
      };

      const docRef = await addDoc(collection(db, 'pets'), petData);
      const petId = docRef.id;

     
      const notifResult = await createNotificationsForAllUsers({
        id: petId,
        ...petData
      });

      setSuccessData({
        petName: formData.name,
        notificationsSent: notifResult.success,
        notificationCount: notifResult.count || 0,
        petId: petId
      });
      
      setShowSuccessModal(true);
    } catch (error) {
      console.error('Error adding pet:', error);
      setErrors({ submit: 'Failed to add pet. Please try again.' });
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    if (formData.name || formData.breed || imageFile) {
      if (window.confirm('Discard pet information? Your changes will be lost.')) {
        setCurrentScreen('adminDashboard');
      }
    } else {
      setCurrentScreen('adminDashboard');
    }
  };

  const handleCloseModal = () => {
    setShowSuccessModal(false);
    setCurrentScreen('adminDashboard');
  };

  const SuccessModal = () => (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg p-6 max-w-md w-full shadow-xl">
        <div className="text-center">
          <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-800 mb-2">
            Pet Added Successfully!
          </h2>
          <p className="text-gray-600 mb-4">
            {successData?.petName} has been added to the adoption system.
          </p>
          
          <div className="bg-gray-50 rounded-lg p-4 mb-4 text-left">
            <div className="mb-2">
              <span className="text-sm font-semibold text-gray-700">Pet Name:</span>
              <p className="text-gray-800">{successData?.petName}</p>
            </div>
            <div className="mb-2">
              <span className="text-sm font-semibold text-gray-700">Pet ID:</span>
              <p className="text-gray-800 text-xs">{successData?.petId}</p>
            </div>
            <div>
              <span className="text-sm font-semibold text-gray-700">Notifications:</span>
              <p className="text-gray-800">
                {successData?.notificationsSent 
                  ? `✅ ${successData.notificationCount} users have been notified` 
                  : '⚠️ Some notifications may not have been sent'}
              </p>
            </div>
          </div>
          
          <button
            onClick={handleCloseModal}
            className="w-full bg-gradient-to-r from-orange-500 to-pink-500 text-white py-3 rounded-lg font-semibold hover:shadow-lg transition-all"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-pink-50 to-purple-50">
      {showSuccessModal && successData && <SuccessModal />}

     {}
      <div className="bg-gradient-to-r from-orange-500 to-pink-500 text-white p-6 shadow-lg">
        <button 
          onClick={handleCancel}
          className="flex items-center space-x-2 mb-4 hover:bg-white hover:bg-opacity-20 rounded-lg px-3 py-2 transition-all"
        >
          <ArrowLeft size={20} />
          <span className="text-sm font-medium">Back to Dashboard</span>
        </button>
        
        <div className="flex items-center space-x-3">
          <div className="w-12 h-12 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
            <Heart size={24} />
          </div>
          <div>
            <h1 className="text-2xl font-bold">Add New Pet</h1>
            <p className="text-sm opacity-90">Add a pet to the adoption system</p>
          </div>
        </div>
      </div>

      {}
      <div className="max-w-4xl mx-auto p-6">
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
          <div className="p-6 space-y-6">
           {}
            {errors.submit && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
                <p className="text-sm">{errors.submit}</p>
              </div>
            )}

            {}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Pet Photo <span className="text-red-500">*</span>
              </label>
              
              {!imagePreview ? (
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-pink-500 transition-all">
                  <Upload size={48} className="mx-auto text-gray-400 mb-3" />
                  <p className="text-sm text-gray-600 mb-2">Click to upload pet photo</p>
                  <p className="text-xs text-gray-400 mb-4">PNG, JPG up to 5MB</p>
                  <label className="bg-pink-500 text-white px-4 py-2 rounded-lg font-semibold cursor-pointer hover:bg-pink-600 inline-block">
                    Choose File
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageChange}
                      className="hidden"
                    />
                  </label>
                </div>
              ) : (
                <div className="relative">
                  <img 
                    src={imagePreview} 
                    alt="Preview" 
                    className="w-full h-64 object-cover rounded-lg"
                  />
                  <button
                    onClick={removeImage}
                    className="absolute top-2 right-2 bg-red-500 text-white p-2 rounded-full hover:bg-red-600"
                  >
                    <X size={20} />
                  </button>
                </div>
              )}
              {errors.image && (
                <p className="text-red-500 text-xs mt-1">{errors.image}</p>
              )}
            </div>

           {}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
             {}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Pet Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  placeholder="e.g., Max"
                  className={`w-full px-4 py-3 border-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500 ${
                    errors.name ? 'border-red-300' : 'border-gray-200'
                  }`}
                />
                {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
              </div>

              {}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Type <span className="text-red-500">*</span>
                </label>
                <select
                  name="type"
                  value={formData.type}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500"
                >
                  <option value="dog">🐕 Dog</option>
                  <option value="cat">🐱 Cat</option>
                </select>
              </div>

             {}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Breed <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="breed"
                  value={formData.breed}
                  onChange={handleInputChange}
                  placeholder="e.g., Labrador, Persian"
                  className={`w-full px-4 py-3 border-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500 ${
                    errors.breed ? 'border-red-300' : 'border-gray-200'
                  }`}
                />
                {errors.breed && <p className="text-red-500 text-xs mt-1">{errors.breed}</p>}
              </div>

             {}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Age <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="age"
                  value={formData.age}
                  onChange={handleInputChange}
                  placeholder="e.g., 2 years, 6 months"
                  className={`w-full px-4 py-3 border-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500 ${
                    errors.age ? 'border-red-300' : 'border-gray-200'
                  }`}
                />
                {errors.age && <p className="text-red-500 text-xs mt-1">{errors.age}</p>}
              </div>

            {}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Gender <span className="text-red-500">*</span>
                </label>
                <select
                  name="gender"
                  value={formData.gender}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500"
                >
                  <option value="male">♂️ Male</option>
                  <option value="female">♀️ Female</option>
                </select>
              </div>

              {}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Size <span className="text-red-500">*</span>
                </label>
                <select
                  name="size"
                  value={formData.size}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500"
                >
                  <option value="small">Small</option>
                  <option value="medium">Medium</option>
                  <option value="large">Large</option>
                </select>
              </div>

             {}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Color <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="color"
                  value={formData.color}
                  onChange={handleInputChange}
                  placeholder="e.g., Brown, White"
                  className={`w-full px-4 py-3 border-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500 ${
                    errors.color ? 'border-red-300' : 'border-gray-200'
                  }`}
                />
                {errors.color && <p className="text-red-500 text-xs mt-1">{errors.color}</p>}
              </div>

              {}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Location
                </label>
                <input
                  type="text"
                  name="location"
                  value={formData.location}
                  onChange={handleInputChange}
                  placeholder="Shelter location"
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500"
                />
              </div>
            </div>

            {}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Description <span className="text-red-500">*</span>
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                placeholder="Tell us about this pet's personality, behavior, and special needs..."
                rows={4}
                className={`w-full px-4 py-3 border-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500 resize-none ${
                  errors.description ? 'border-red-300' : 'border-gray-200'
                }`}
              />
              {errors.description && <p className="text-red-500 text-xs mt-1">{errors.description}</p>}
            </div>

            {}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Health Status
              </label>
              <input
                type="text"
                name="healthStatus"
                value={formData.healthStatus}
                onChange={handleInputChange}
                placeholder="e.g., Healthy, Under treatment"
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500"
              />
            </div>

           {}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-4">
                <label className="flex items-center space-x-3 cursor-pointer">
                  <input
                    type="checkbox"
                    name="vaccinated"
                    checked={formData.vaccinated}
                    onChange={handleInputChange}
                    className="w-5 h-5 text-blue-600 border-blue-300 rounded focus:ring-2 focus:ring-blue-500"
                  />
                  <div>
                    <p className="font-semibold text-gray-800">Vaccinated</p>
                    <p className="text-xs text-gray-600">Pet has received vaccinations</p>
                  </div>
                </label>
              </div>

              <div className="bg-purple-50 border-2 border-purple-200 rounded-lg p-4">
                <label className="flex items-center space-x-3 cursor-pointer">
                  <input
                    type="checkbox"
                    name="neutered"
                    checked={formData.neutered}
                    onChange={handleInputChange}
                    className="w-5 h-5 text-purple-600 border-purple-300 rounded focus:ring-2 focus:ring-purple-500"
                  />
                  <div>
                    <p className="font-semibold text-gray-800">Spayed/Neutered</p>
                    <p className="text-xs text-gray-600">Pet is spayed or neutered</p>
                  </div>
                </label>
              </div>
            </div>

            {}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Adoption Status
              </label>
              <select
                name="status"
                value={formData.status}
                onChange={handleInputChange}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500"
              >
                <option value="available">✅ Available for Adoption</option>
                <option value="pending">⏳ Pending</option>
                <option value="adopted">🏠 Adopted</option>
              </select>
            </div>

            {}
            <div className="bg-yellow-50 border-l-4 border-yellow-500 p-4 rounded-lg">
              <p className="text-sm text-yellow-800">
                <strong>📢 Note:</strong> All users will be notified about this new pet available for adoption.
              </p>
            </div>
          </div>

          {}
          <div className="bg-gray-50 px-6 py-4 flex items-center justify-between border-t">
            <button
              onClick={handleCancel}
              className="px-6 py-2 text-gray-600 font-medium hover:bg-gray-200 rounded-lg transition-all"
            >
              Cancel
            </button>
            
            <button
              onClick={handleSubmit}
              disabled={loading}
              className="bg-gradient-to-r from-orange-500 to-pink-500 text-white px-6 py-3 rounded-lg font-semibold hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
            >
              <Heart size={18} />
              <span>{loading ? 'Adding Pet...' : 'Add Pet & Notify Users'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddPet;