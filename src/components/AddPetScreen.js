import React, { useState } from 'react';
import { ArrowLeft, Heart, Upload, X, Check } from 'lucide-react';

const AddPetScreen = ({ setCurrentScreen, onPetAdded }) => {
  const [formData, setFormData] = useState({
    name: '',
    type: 'dog',
    breed: '',
    age: '',
    gender: 'male',
    description: '',
    isVaccinated: false,
    isDewormed: false,
    status: 'available',
    imageUrl: ''
  });
  const [imagePreview, setImagePreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value
    });
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
        setFormData({ ...formData, imageUrl: reader.result });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

   
    if (!formData.name.trim() || !formData.breed.trim() || !formData.age.trim()) {
      setError('Please fill in all required fields');
      setLoading(false);
      return;
    }

    try {
      
      
      console.log('Pet data to save:', formData);
      
      setTimeout(() => {
        alert('Pet added successfully!');
        if (onPetAdded) onPetAdded();
        setCurrentScreen('adminDashboard');
      }, 1000);
    } catch (err) {
      setError('An error occurred. Please try again.');
      console.error('Add pet error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {}
      <div className="bg-gradient-to-r from-pink-500 to-purple-500 p-4 text-white sticky top-0 z-50">
        <button 
          onClick={() => setCurrentScreen('adminDashboard')}
          className="mb-4 flex items-center space-x-2 hover:opacity-80"
        >
          <ArrowLeft size={20} />
          <span className="text-sm">Back to Dashboard</span>
        </button>
        
        <div className="flex items-center space-x-3">
          <Heart className="fill-white" size={32} />
          <div>
            <h1 className="text-2xl font-bold">Add New Pet</h1>
            <p className="text-pink-100 text-sm">Register a pet for adoption</p>
          </div>
        </div>
      </div>

      {}
      <form onSubmit={handleSubmit} className="p-4 space-y-4">
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
            <p className="text-sm">{error}</p>
          </div>
        )}

        {}
        <div className="bg-white rounded-lg p-4 shadow-sm">
          <label className="block text-gray-700 text-sm font-semibold mb-2">
            Pet Photo
          </label>
          <div className="flex flex-col items-center">
            {imagePreview ? (
              <div className="relative w-48 h-48 mb-3">
                <img 
                  src={imagePreview} 
                  alt="Preview" 
                  className="w-full h-full object-cover rounded-lg"
                />
                <button
                  type="button"
                  onClick={() => {
                    setImagePreview(null);
                    setFormData({ ...formData, imageUrl: '' });
                  }}
                  className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                >
                  <X size={16} />
                </button>
              </div>
            ) : (
              <div className="w-48 h-48 bg-gray-100 rounded-lg flex items-center justify-center mb-3 border-2 border-dashed border-gray-300">
                <Upload className="text-gray-400" size={48} />
              </div>
            )}
            <input
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              className="hidden"
              id="pet-image"
            />
            <label
              htmlFor="pet-image"
              className="bg-pink-500 text-white px-4 py-2 rounded-lg cursor-pointer hover:bg-pink-600 text-sm font-semibold"
            >
              {imagePreview ? 'Change Photo' : 'Upload Photo'}
            </label>
          </div>
        </div>

        {}
        <div className="bg-white rounded-lg p-4 shadow-sm space-y-4">
          <h3 className="font-semibold text-gray-800 text-sm">Basic Information</h3>
          
          <div>
            <label className="block text-gray-700 text-sm font-medium mb-1">
              Pet Name *
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="e.g., Max, Luna, Brownie"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-gray-700 text-sm font-medium mb-1">
                Type *
              </label>
              <select
                name="type"
                value={formData.type}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500"
              >
                <option value="dog">Dog</option>
                <option value="cat">Cat</option>
              </select>
            </div>

            <div>
              <label className="block text-gray-700 text-sm font-medium mb-1">
                Gender *
              </label>
              <select
                name="gender"
                value={formData.gender}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500"
              >
                <option value="male">Male</option>
                <option value="female">Female</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-gray-700 text-sm font-medium mb-1">
                Breed *
              </label>
              <input
                type="text"
                name="breed"
                value={formData.breed}
                onChange={handleChange}
                placeholder="e.g., Aspin, Puspin"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500"
                required
              />
            </div>

            <div>
              <label className="block text-gray-700 text-sm font-medium mb-1">
                Age *
              </label>
              <input
                type="text"
                name="age"
                value={formData.age}
                onChange={handleChange}
                placeholder="e.g., 3 months, 1 year"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-gray-700 text-sm font-medium mb-1">
              Description
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="Tell us about this pet's personality, behavior, etc."
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500"
              rows="4"
            />
          </div>
        </div>

        {}
        <div className="bg-white rounded-lg p-4 shadow-sm space-y-3">
          <h3 className="font-semibold text-gray-800 text-sm mb-3">Health Status</h3>
          
          <label className="flex items-center justify-between p-3 bg-green-50 rounded-lg cursor-pointer">
            <div className="flex items-center space-x-3">
              <div className={`w-6 h-6 rounded border-2 flex items-center justify-center ${
                formData.isVaccinated ? 'bg-green-500 border-green-500' : 'border-gray-300'
              }`}>
                {formData.isVaccinated && <Check className="text-white" size={16} />}
              </div>
              <div>
                <p className="font-medium text-gray-800">Vaccinated</p>
                <p className="text-xs text-gray-500">Pet has received vaccinations</p>
              </div>
            </div>
            <input
              type="checkbox"
              name="isVaccinated"
              checked={formData.isVaccinated}
              onChange={handleChange}
              className="hidden"
            />
          </label>

          <label className="flex items-center justify-between p-3 bg-blue-50 rounded-lg cursor-pointer">
            <div className="flex items-center space-x-3">
              <div className={`w-6 h-6 rounded border-2 flex items-center justify-center ${
                formData.isDewormed ? 'bg-blue-500 border-blue-500' : 'border-gray-300'
              }`}>
                {formData.isDewormed && <Check className="text-white" size={16} />}
              </div>
              <div>
                <p className="font-medium text-gray-800">Dewormed</p>
                <p className="text-xs text-gray-500">Pet has been dewormed</p>
              </div>
            </div>
            <input
              type="checkbox"
              name="isDewormed"
              checked={formData.isDewormed}
              onChange={handleChange}
              className="hidden"
            />
          </label>
        </div>

        {}
        <div className="bg-white rounded-lg p-4 shadow-sm">
          <label className="block text-gray-700 text-sm font-medium mb-2">
            Availability Status
          </label>
          <select
            name="status"
            value={formData.status}
            onChange={handleChange}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500"
          >
            <option value="available">Available for Adoption</option>
            <option value="pending">Pending Adoption</option>
            <option value="adopted">Already Adopted</option>
          </select>
        </div>

        {}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <p className="text-xs text-blue-600 font-semibold mb-2">📱 Preview:</p>
          <div className="bg-white rounded-lg overflow-hidden shadow-sm">
            {imagePreview && (
              <img src={imagePreview} alt="Preview" className="w-full h-48 object-cover" />
            )}
            <div className="p-3">
              <div className="flex items-center justify-between mb-1">
                <h4 className="font-semibold text-gray-800">
                  {formData.name || 'Pet Name'}
                </h4>
                <span className="text-pink-500">
                  {formData.gender === 'male' ? '♂' : '♀'}
                </span>
              </div>
              <p className="text-xs text-gray-500 mb-2">
                {formData.age || 'Age'} • {formData.breed || 'Breed'}
              </p>
              <div className="flex gap-1 flex-wrap">
                {formData.isVaccinated && (
                  <span className="bg-green-100 text-green-600 text-xs px-2 py-1 rounded">
                    ✓ Vaccinated
                  </span>
                )}
                {formData.isDewormed && (
                  <span className="bg-blue-100 text-blue-600 text-xs px-2 py-1 rounded">
                    ✓ Dewormed
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>

        {}
        <div className="flex gap-3">
          <button
            type="button"
            onClick={() => setCurrentScreen('adminDashboard')}
            className="flex-1 bg-gray-200 text-gray-700 py-4 rounded-lg font-semibold hover:bg-gray-300 transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="flex-1 bg-gradient-to-r from-pink-500 to-purple-500 text-white py-4 rounded-lg font-semibold hover:shadow-lg transition-all disabled:opacity-50 flex items-center justify-center space-x-2"
          >
            <Heart size={20} />
            <span>{loading ? 'Adding...' : 'Add Pet'}</span>
          </button>
        </div>
      </form>
    </div>
  );
};

export default AddPetScreen;