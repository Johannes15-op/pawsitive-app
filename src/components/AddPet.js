import React, { useState } from 'react';
import { ArrowLeft, Heart, Upload, X, CheckCircle, } from 'lucide-react';
import { collection, addDoc, serverTimestamp, getDocs } from 'firebase/firestore';
import { db } from '../config/firebaseConfig';

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
    medicalHistory: '',
    vaccinated: false,
    neutered: false,
    status: 'available',
    location: 'Tabaco City Shelter'
  });

  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [imageBase64, setImageBase64] = useState(null);
  const [loading, setLoading] = useState(false);
  const [processing, setProcessing] = useState(false);
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

  const compressImage = (file, maxWidth = 1200, quality = 0.8) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = (event) => {
        const img = new Image();
        img.src = event.target.result;
        img.onload = () => {
          const canvas = document.createElement('canvas');
          let width = img.width;
          let height = img.height;

          if (width > maxWidth) {
            height = (height * maxWidth) / width;
            width = maxWidth;
          }

          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          ctx.drawImage(img, 0, 0, width, height);

          canvas.toBlob(
            (blob) => {
              resolve(blob);
            },
            'image/jpeg',
            quality
          );
        };
        img.onerror = reject;
      };
      reader.onerror = reject;
    });
  };

  const handleImageChange = async (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 10 * 1024 * 1024) {
        setErrors(prev => ({ ...prev, image: 'Image size should be less than 10MB' }));
        return;
      }

      if (!file.type.startsWith('image/')) {
        setErrors(prev => ({ ...prev, image: 'Please select a valid image file' }));
        return;
      }

      try {
        setProcessing(true);
        setErrors(prev => ({ ...prev, image: '' }));

        const compressedBlob = await compressImage(file, 1200, 0.8);
    
        const reader = new FileReader();
        reader.readAsDataURL(compressedBlob);
        reader.onloadend = () => {
          const base64String = reader.result;
          setImageBase64(base64String);
          setImagePreview(base64String);
          setImageFile(file);
          setProcessing(false);
        };
        reader.onerror = () => {
          setErrors(prev => ({ ...prev, image: 'Failed to process image' }));
          setProcessing(false);
        };
      } catch (err) {
        console.error('Error processing image:', err);
        setErrors(prev => ({ ...prev, image: 'Failed to process image. Please try again.' }));
        setProcessing(false);
      }
    }
  };

  const removeImage = () => {
    setImageFile(null);
    setImagePreview(null);
    setImageBase64(null);
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
    
    if (!imageBase64) {
      newErrors.image = 'Pet image is required';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
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
            petAge: petData.age
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
      const petData = {
        ...formData,
        imageUrl: imageBase64,
        imageFileName: imageFile?.name || 'pet-image.jpg',
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        addedBy: currentUser?.uid || 'admin'
      };

      console.log('📝 Adding pet to Firestore...');
      const docRef = await addDoc(collection(db, 'pets'), petData);
      const petId = docRef.id;
      console.log('✅ Pet added with ID:', petId);

      console.log('📢 Creating notifications...');
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
      console.error('❌ Error adding pet:', error);
      setErrors({ submit: 'Failed to add pet: ' + error.message });
      alert('Failed to add pet: ' + error.message);
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
                  <p className="text-xs text-gray-400 mb-2">PNG, JPG up to 10MB</p>
                  <p className="text-xs text-blue-600 mb-4">📌 Image will be compressed automatically</p>
                  <label className="bg-pink-500 text-white px-4 py-2 rounded-lg font-semibold cursor-pointer hover:bg-pink-600 inline-block">
                    {processing ? 'Processing...' : 'Choose File'}
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageChange}
                      disabled={processing}
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
                    disabled={processing}
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
                Current Health Status
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
            <div className="space-y-3">
              <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                Medical Records & History
              </label>
              
              <textarea
                name="medicalHistory"
                value={formData.medicalHistory}
                onChange={handleInputChange}
                placeholder="Enter medical history, vaccinations, treatments, medications, veterinary visits, etc. Example:
- 2024-01-15: Vaccinated (Rabies, Distemper)
- 2024-02-20: Treated for ear infection
- 2024-03-10: Spayed/Neutered
- Medications: Currently on heartworm prevention"
                rows={6}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500 resize-none font-mono text-sm"
              />
              
              <p className="text-xs text-gray-500">
                💡 Record all medical history including vaccinations, treatments, surgeries, and ongoing medications
              </p>

              {}
              {formData.medicalHistory && (
                <div className="mt-4 bg-blue-50 border-2 border-blue-200 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-3">
                    <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                    <h4 className="text-sm font-semibold text-blue-900">Preview: How This Will Appear</h4>
                  </div>
                  
                  <div className="bg-white rounded-lg p-4 border border-blue-200">
                    <div className="space-y-2">
                      {formData.medicalHistory.split('\n').map((line, index) => {
                        if (!line.trim()) return null;
                        
                      
                        const isBullet = line.trim().startsWith('-') || line.trim().startsWith('•');
                        const cleanLine = isBullet ? line.trim().substring(1).trim() : line.trim();
                        
                        return (
                          <div key={index} className="flex items-start gap-2">
                            {isBullet && (
                              <span className="text-blue-600 mt-1">•</span>
                            )}
                            <p className="text-sm text-gray-700 leading-relaxed">
                              {cleanLine}
                            </p>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              )}
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
                <option value="undertreatment">🏥 Under Treatment</option>
              </select>
              <p className="text-xs text-gray-500 mt-2">
                💡 Select "Under Treatment" for pets that need medical care before adoption. 
                You can change this to "Available" once they're ready.
              </p>
            </div>

            {}
            <div className="bg-yellow-50 border-l-4 border-yellow-500 p-4 rounded-lg">
              <p className="text-sm text-yellow-800">
                <strong>📢 Note:</strong> All users will be notified about this new pet available for adoption. Medical history will help adopters understand the pet's health background.
              </p>
            </div>
          </div>

          {}
          <div className="bg-gray-50 px-6 py-4 flex items-center justify-between border-t">
            <button
              onClick={handleCancel}
              disabled={loading || processing}
              className="px-6 py-2 text-gray-600 font-medium hover:bg-gray-200 rounded-lg transition-all disabled:opacity-50"
            >
              Cancel
            </button>
            
            <button
              onClick={handleSubmit}
              disabled={loading || processing}
              className="bg-gradient-to-r from-orange-500 to-pink-500 text-white px-6 py-3 rounded-lg font-semibold hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
            >
              <Heart size={18} />
              <span>{loading ? 'Adding Pet...' : processing ? 'Processing Image...' : 'Add Pet & Notify Users'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddPet;