import React, { useState } from 'react';
import { MapPin, Menu, Heart, Home, User, DollarSign, Users, Calendar, FileText, Info, X, Upload, CheckCircle, AlertCircle } from 'lucide-react';

const DonationScreen = ({ currentScreen, setCurrentScreen, currentUser, onSubmitDonation }) => {
  const [showSidebarLocal, setShowSidebarLocal] = useState(false);
  const [showDonationForm, setShowDonationForm] = useState(false);
  const [formData, setFormData] = useState({
    amount: '',
    paymentMethod: 'GCash',
    message: '',
    phoneNumber: '',
    receiptUrl: ''
  });
  const [receipt, setReceipt] = useState(null);
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const handleNavigation = (screen) => {
    setCurrentScreen(screen);
    setShowSidebarLocal(false);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      
      if (!file.type.startsWith('image/')) {
        setErrors(prev => ({ ...prev, receipt: 'Please upload an image file' }));
        return;
      }
      
     
      if (file.size > 5 * 1024 * 1024) {
        setErrors(prev => ({ ...prev, receipt: 'Image size should be less than 5MB' }));
        return;
      }

      setReceipt(file);
      setFormData(prev => ({
        ...prev,
        receiptUrl: URL.createObjectURL(file)
      }));
     
      setErrors(prev => ({ ...prev, receipt: '' }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.amount || parseFloat(formData.amount) <= 0) {
      newErrors.amount = 'Please enter a valid donation amount';
    }

    if (!receipt || !formData.receiptUrl) {
      newErrors.receipt = 'Please upload your payment receipt/proof';
    }

    if (!formData.phoneNumber.trim()) {
      newErrors.phoneNumber = 'Phone number is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
   
    if (!validateForm()) {
      
      const errorMessages = Object.values(errors).join('\n');
      alert('Please complete all required fields:\n\n' + errorMessages);
      return;
    }

    setLoading(true);

    try {
      
      const donationData = {
        userId: currentUser?.uid || '',
        userEmail: currentUser?.email || '',
        userName: currentUser?.displayName || '',
        amount: parseFloat(formData.amount),
        paymentMethod: formData.paymentMethod,
        message: formData.message,
        phoneNumber: formData.phoneNumber,
        receiptUrl: formData.receiptUrl,
        timestamp: new Date().toISOString()
      };

      
      if (onSubmitDonation) {
        const result = await onSubmitDonation(donationData);
        
        if (result.success) {
          setSubmitted(true);
          setTimeout(() => {
            setShowDonationForm(false);
            setSubmitted(false);
            setFormData({
              amount: '',
              paymentMethod: 'GCash',
              message: '',
              phoneNumber: '',
              receiptUrl: ''
            });
            setReceipt(null);
            setErrors({});
          }, 3000);
        } else {
          alert('Failed to submit donation. Please try again.');
        }
      }
    } catch (error) {
      console.error('Error submitting donation:', error);
      alert('An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-gray-50 min-h-screen pb-20">
      {}
      <div 
        className={`fixed inset-0 bg-black z-40 transition-opacity duration-300 ${
          showSidebarLocal ? 'opacity-50 visible' : 'opacity-0 invisible'
        }`}
        onClick={() => setShowSidebarLocal(false)}
      />
      
      {}
      <div 
        className={`fixed left-0 top-0 h-full w-72 bg-white shadow-2xl z-50 transform transition-transform duration-300 ease-in-out ${
          showSidebarLocal ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="p-6 border-b border-gray-200 bg-gradient-to-r from-pink-50 to-purple-50">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-gradient-to-br from-pink-500 to-purple-500 rounded-full flex items-center justify-center">
                <Heart className="text-white fill-white" size={24} />
              </div>
              <div>
                <span className="font-bold text-lg text-gray-800">TAARA</span>
                <p className="text-xs text-gray-600">Animal Rescue</p>
              </div>
            </div>
            <button 
              onClick={() => setShowSidebarLocal(false)}
              className="p-2 hover:bg-white rounded-lg transition-colors"
            >
              <X size={20} className="text-gray-600" />
            </button>
          </div>
        </div>

        <nav className="p-4 space-y-1">
          <button 
            onClick={() => handleNavigation('home')}
            className="flex items-center w-full p-3 text-gray-700 hover:bg-pink-50 hover:text-pink-600 rounded-lg transition-colors group"
          >
            <Home size={20} className="mr-3 text-pink-500 group-hover:text-pink-600" />
            <span className="font-medium">Home</span>
          </button>

          <button 
            onClick={() => handleNavigation('profile')}
            className="flex items-center w-full p-3 text-gray-700 hover:bg-pink-50 hover:text-pink-600 rounded-lg transition-colors group"
          >
            <User size={20} className="mr-3 text-purple-500 group-hover:text-purple-600" />
            <span className="font-medium">Profile</span>
          </button>

          <button 
            onClick={() => handleNavigation('donation')}
            className="flex items-center w-full p-3 bg-pink-50 text-pink-600 rounded-lg transition-colors group"
          >
            <DollarSign size={20} className="mr-3 text-green-500" />
            <span className="font-medium">Donation</span>
          </button>

          <button 
            onClick={() => handleNavigation('volunteer')}
            className="flex items-center w-full p-3 text-gray-700 hover:bg-pink-50 hover:text-pink-600 rounded-lg transition-colors group"
          >
            <Users size={20} className="mr-3 text-blue-500 group-hover:text-blue-600" />
            <span className="font-medium">Volunteer</span>
          </button>

          <button 
            onClick={() => handleNavigation('kapon')}
            className="flex items-center w-full p-3 text-gray-700 hover:bg-pink-50 hover:text-pink-600 rounded-lg transition-colors group"
          >
            <Calendar size={20} className="mr-3 text-orange-500 group-hover:text-orange-600" />
            <span className="font-medium">Kapon Schedule</span>
          </button>

          <button 
            onClick={() => handleNavigation('forms')}
            className="flex items-center w-full p-3 text-gray-700 hover:bg-pink-50 hover:text-pink-600 rounded-lg transition-colors group"
          >
            <FileText size={20} className="mr-3 text-indigo-500 group-hover:text-indigo-600" />
            <span className="font-medium">Forms</span>
          </button>

          <button 
            onClick={() => handleNavigation('about')}
            className="flex items-center w-full p-3 text-gray-700 hover:bg-pink-50 hover:text-pink-600 rounded-lg transition-colors group"
          >
            <Info size={20} className="mr-3 text-gray-500 group-hover:text-gray-600" />
            <span className="font-medium">About Us</span>
          </button>
        </nav>

        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-200 bg-gray-50">
          <div className="text-center">
            <p className="text-xs text-gray-600">Tabaco Animal Rescue</p>
            <p className="text-xs text-gray-500">& Adoption</p>
          </div>
        </div>
      </div>

      {}
      <div className="bg-white shadow-sm sticky top-0 z-10">
        <div className="flex items-center justify-between p-4">
          <button 
            onClick={() => setShowSidebarLocal(!showSidebarLocal)}
            className="text-gray-600 hover:text-gray-900"
          >
            <Menu size={24} />
          </button>
          <div className="flex items-center gap-2">
            <Heart size={20} className="text-pink-500 fill-pink-500" />
            <span className="font-semibold text-gray-800">Donation</span>
          </div>
          <div className="w-6" />
        </div>
      </div>

      {}
      <div className="p-4">
        <div className="bg-white rounded-lg shadow-sm p-6">
          {}
          <div className="bg-pink-50 rounded-lg p-4 mb-6">
            <p className="text-sm font-semibold text-pink-600 mb-2">SUPPORT TAARA and Rescued Pets</p>
            <p className="text-sm text-gray-700">
              JOIN us in caring for abandoned and rescued animals by contributing towards their food, medical care, and shelter needs. Your donation brings hope and the life they deserve.
            </p>
          </div>

          {}
          <div className="p-6 bg-gradient-to-br from-blue-400 to-blue-600 rounded-lg mb-6">
            <div className="flex flex-col items-center">
              {}
              <div className="mb-4">
                <svg viewBox="0 0 200 60" className="w-40 h-auto">
                  <text x="50%" y="50%" dominantBaseline="middle" textAnchor="middle" fill="white" fontSize="32" fontWeight="bold" fontFamily="Arial">
                    <tspan fontSize="40">(G)</tspan> GCash
                  </text>
                </svg>
              </div>
              
             {}
              <div className="w-72 bg-white rounded-2xl shadow-2xl p-6 mb-4">
                <div className="w-full aspect-square bg-white rounded-lg flex items-center justify-center mb-4 overflow-hidden">
                  <img 
                    src={require('../assets/gcash.jpg')}
                    alt="GCash QR Code"
                    className="w-full h-full object-contain"
                    onError={(e) => {
                      e.target.src = 'https://via.placeholder.com/300x300?text=QR+Code';
                    }}
                  />
                </div>
                
                <div className="text-center text-gray-500 text-sm mb-4">
                  <p>Transfer fees may apply.</p>
                </div>
                
                <div className="text-center">
                  <p className="text-xl font-bold text-blue-600 mb-1">SA***L C.</p>
                  <p className="text-sm text-gray-600 mb-1">Mobile No.: <span className="font-semibold">+63 916 643 ••••</span></p>
                  <p className="text-xs text-gray-500">User ID: <span className="font-mono">••••••••••WE4N39</span></p>
                </div>
              </div>
              
              <button
                onClick={() => setShowDonationForm(true)}
                className="w-full max-w-xs bg-gradient-to-r from-green-500 to-green-600 text-white py-3 rounded-xl font-semibold hover:shadow-lg transition-all flex items-center justify-center gap-2"
              >
                <DollarSign size={20} />
                I've Donated - Submit Receipt
              </button>
            </div>
          </div>

          {}
          <div className="space-y-3 mb-6">
            <h3 className="font-semibold text-gray-800 mb-3">Other Payment Methods</h3>
            
            <div className="p-4 bg-gray-50 rounded-lg">
              <h4 className="font-semibold text-gray-800 mb-2 flex items-center">
                <span className="text-blue-600 mr-2">💳</span> GCash (Alternative)
              </h4>
              <p className="text-sm text-gray-600">0919 643 7555 - Samuel C.</p>
              <p className="text-sm text-gray-600">0906 553 8116 - Samuel C.</p>
            </div>

            <div className="p-4 bg-gray-50 rounded-lg">
              <h4 className="font-semibold text-gray-800 mb-2 flex items-center">
                <span className="text-red-600 mr-2">🏦</span> BPI
              </h4>
              <p className="text-sm text-gray-600">3557 5556553 - Calapag Erwin</p>
            </div>

            <div className="p-4 bg-gray-50 rounded-lg">
              <h4 className="font-semibold text-gray-800 mb-2 flex items-center">
                <span className="text-green-600 mr-2">🏦</span> LANDBANK
              </h4>
              <p className="text-sm text-gray-600">0702 111 159 - Samuel C.</p>
            </div>

            <div className="p-4 bg-gray-50 rounded-lg">
              <h4 className="font-semibold text-gray-800 mb-2 flex items-center">
                <span className="text-green-500 mr-2">💳</span> PayMaya
              </h4>
              <p className="text-sm text-gray-600">calapagerwin@gmail.com</p>
            </div>

            <div className="p-4 bg-gray-50 rounded-lg">
              <h4 className="font-semibold text-gray-800 mb-2 flex items-center">
                <span className="text-orange-600 mr-2">🛒</span> PalMall
              </h4>
              <p className="text-sm text-gray-600">0956 353 2987</p>
            </div>
          </div>

         {}
          <div className="mt-4 p-3 bg-blue-50 rounded-lg flex items-start">
            <MapPin className="text-blue-500 mt-1 flex-shrink-0" size={18} />
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-800">Visit Us</p>
              <p className="text-xs text-gray-600">P3 Burak Street Tabaco City, Albay</p>
            </div>
          </div>
        </div>
      </div>

      {}
      {showDonationForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
            {submitted ? (
              <div className="p-6 text-center">
                <CheckCircle size={64} className="text-green-500 mx-auto mb-4" />
                <h3 className="text-2xl font-bold text-gray-800 mb-2">Thank You!</h3>
                <p className="text-gray-600 mb-4">
                  Your donation has been submitted successfully. The admin will review it shortly.
                </p>
                <p className="text-sm text-gray-500">
                  You'll be redirected in a moment...
                </p>
              </div>
            ) : (
              <>
                <div className="p-6 border-b border-gray-200 bg-gradient-to-r from-pink-50 to-purple-50">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xl font-bold text-gray-800">Submit Donation</h3>
                    <button
                      onClick={() => {
                        setShowDonationForm(false);
                        setErrors({});
                      }}
                      className="text-gray-500 hover:text-gray-700"
                    >
                      <X size={24} />
                    </button>
                  </div>
                  <p className="text-xs text-gray-600 mt-2">* Required fields</p>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                 {}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Donation Amount (₱) <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="number"
                      name="amount"
                      value={formData.amount}
                      onChange={handleInputChange}
                      className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent ${
                        errors.amount ? 'border-red-500' : 'border-gray-300'
                      }`}
                      placeholder="Enter amount"
                      min="1"
                      step="0.01"
                    />
                    {errors.amount && (
                      <p className="mt-1 text-xs text-red-500 flex items-center gap-1">
                        <AlertCircle size={12} />
                        {errors.amount}
                      </p>
                    )}
                  </div>

                  {}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Payment Method <span className="text-red-500">*</span>
                    </label>
                    <select
                      name="paymentMethod"
                      value={formData.paymentMethod}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                    >
                      <option value="GCash">GCash</option>
                      <option value="BPI">BPI</option>
                      <option value="LandBank">LandBank</option>
                      <option value="PayMaya">PayMaya</option>
                      <option value="PalMall">PalMall</option>
                      <option value="Cash">Cash</option>
                    </select>
                  </div>

                  {}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Phone Number <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="tel"
                      name="phoneNumber"
                      value={formData.phoneNumber}
                      onChange={handleInputChange}
                      className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent ${
                        errors.phoneNumber ? 'border-red-500' : 'border-gray-300'
                      }`}
                      placeholder="0912 345 6789"
                    />
                    {errors.phoneNumber && (
                      <p className="mt-1 text-xs text-red-500 flex items-center gap-1">
                        <AlertCircle size={12} />
                        {errors.phoneNumber}
                      </p>
                    )}
                  </div>

                  {}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Upload Receipt/Proof <span className="text-red-500">*</span>
                    </label>
                    <div className="flex items-center space-x-2">
                      <label className="flex-1 cursor-pointer">
                        <div className={`border-2 border-dashed rounded-lg p-4 text-center transition-colors ${
                          errors.receipt 
                            ? 'border-red-500 bg-red-50' 
                            : receipt 
                            ? 'border-green-500 bg-green-50' 
                            : 'border-gray-300 hover:border-pink-500'
                        }`}>
                          {receipt ? (
                            <div className="space-y-2">
                              <CheckCircle size={24} className="mx-auto text-green-500" />
                              <p className="text-sm text-gray-600 font-medium truncate">{receipt.name}</p>
                              <p className="text-xs text-gray-500">Click to change</p>
                            </div>
                          ) : (
                            <div className="text-sm text-gray-500">
                              <Upload size={24} className="mx-auto mb-2" />
                              <p className="font-medium">Click to upload</p>
                              <p className="text-xs mt-1">PNG, JPG up to 5MB</p>
                            </div>
                          )}
                        </div>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleFileChange}
                          className="hidden"
                        />
                      </label>
                    </div>
                    {errors.receipt && (
                      <p className="mt-1 text-xs text-red-500 flex items-center gap-1">
                        <AlertCircle size={12} />
                        {errors.receipt}
                      </p>
                    )}
                    {receipt && formData.receiptUrl && (
                      <div className="mt-2 border rounded-lg overflow-hidden">
                        <img 
                          src={formData.receiptUrl} 
                          alt="Receipt preview" 
                          className="w-full h-32 object-cover"
                        />
                      </div>
                    )}
                  </div>

                  {}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Message (Optional)
                    </label>
                    <textarea
                      name="message"
                      value={formData.message}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                      rows="3"
                      placeholder="Leave a message..."
                    />
                  </div>

                  {}
                  <div className="flex space-x-3 pt-4">
                    <button
                      type="button"
                      onClick={() => {
                        setShowDonationForm(false);
                        setErrors({});
                      }}
                      className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                      disabled={loading}
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="flex-1 bg-gradient-to-r from-pink-500 to-purple-500 text-white px-4 py-2 rounded-lg font-semibold hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                      disabled={loading}
                    >
                      {loading ? 'Submitting...' : 'Submit Donation'}
                    </button>
                  </div>
                </form>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default DonationScreen;