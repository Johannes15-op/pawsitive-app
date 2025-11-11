import React, { useState, useEffect } from 'react';
import { Calendar, MapPin, Clock, ArrowLeft, Check, AlertCircle } from 'lucide-react';
import { auth, db } from '../config/firebaseConfig';
import { doc, updateDoc, increment } from 'firebase/firestore';
import kaponService from '../services/kaponService';
import Header from './Header';
import BottomNav from './BottomNav';

const KaponForm = ({ 
  currentScreen, 
  setCurrentScreen, 
  setShowSidebar,
  selectedSchedule 
}) => {
  const [formData, setFormData] = useState({
    ownerName: '',
    contactNumber: '',
    petName: '',
    petType: 'dog',
    gender: 'male',
    breed: '',
    age: '',
    notes: ''
  });
  const [loading, setLoading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [scheduleIsFull, setScheduleIsFull] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const user = auth.currentUser;
    if (user) {
      setCurrentUser(user);
      setFormData(prev => ({
        ...prev,
        ownerName: user.displayName || ''
      }));
    } else {
      alert('Please login to register for Kapon events');
      setCurrentScreen('login');
    }
  }, [setCurrentScreen]);

  useEffect(() => {
    
    if (selectedSchedule) {
      const remaining = selectedSchedule.capacity - (selectedSchedule.registeredCount || 0);
      setScheduleIsFull(remaining <= 0);
    }
  }, [selectedSchedule]);

  const formatDate = (timestamp) => {
    if (!timestamp) return 'N/A';
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return date.toLocaleDateString('en-US', { 
      weekday: 'long',
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!currentUser) {
      alert('You must be logged in to register');
      return;
    }

    if (!selectedSchedule) {
      alert('No schedule selected. Please go back and select a schedule.');
      return;
    }

    
    if (selectedSchedule.registeredCount >= selectedSchedule.capacity) {
      setError('Sorry, this schedule is now full. Please choose another date.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const requestData = {
        scheduleId: selectedSchedule.id,
        scheduleName: selectedSchedule.title,
        scheduleDate: selectedSchedule.date,
        userId: currentUser.uid,
        userEmail: currentUser.email,
        ownerName: formData.ownerName,
        contactNumber: formData.contactNumber,
        petName: formData.petName,
        petType: formData.petType,
        gender: formData.gender,
        breed: formData.breed,
        age: formData.age,
        notes: formData.notes,
        registeredAt: new Date(),
        status: 'pending'
      };

      console.log('Submitting registration:', requestData);

      
      const result = await kaponService.createKaponRequest(requestData);
      
      console.log('Service result:', result);

      if (result.success) {
        
        await updateDoc(doc(db, 'kapon_schedules', selectedSchedule.id), {
          registeredCount: increment(1)
        });

        setShowSuccess(true);
        
        setFormData({
          ownerName: currentUser.displayName || '',
          contactNumber: '',
          petName: '',
          petType: 'dog',
          gender: 'male',
          breed: '',
          age: '',
          notes: ''
        });
      } else {
        setError('Error submitting request: ' + (result.error || 'Unknown error'));
      }
    } catch (err) {
      console.error('Registration error:', err);
      console.error('Error details:', err.message);
      setError('Failed to submit registration: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  if (showSuccess) {
    return (
      <div className="bg-gray-50 min-h-screen pb-20">
        <Header 
          title="Registration Successful" 
          setCurrentScreen={setCurrentScreen}
          setShowSidebar={setShowSidebar}
        />
        <div className="pt-16 p-4 flex items-center justify-center min-h-screen">
          <div className="bg-white rounded-xl shadow-lg p-8 max-w-md w-full text-center">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <Check className="text-green-500" size={48} />
            </div>
            <h2 className="text-2xl font-bold text-gray-800 mb-4">Registration Successful!</h2>
            <p className="text-gray-600 mb-6">
              Your Kapon registration has been submitted. You will receive a confirmation once the admin reviews your request.
            </p>
            <div className="space-y-3">
              <button
                onClick={() => {
                  setShowSuccess(false);
                  setCurrentScreen('kapon');
                }}
                className="w-full bg-pink-500 text-white py-3 rounded-lg font-semibold hover:bg-pink-600 transition-colors"
              >
                View Schedule
              </button>
              <button
                onClick={() => {
                  setShowSuccess(false);
                  setCurrentScreen('home');
                }}
                className="w-full bg-gray-100 text-gray-700 py-3 rounded-lg font-semibold hover:bg-gray-200 transition-colors"
              >
                Go to Home
              </button>
            </div>
          </div>
        </div>
        <BottomNav currentScreen={currentScreen} setCurrentScreen={setCurrentScreen} />
      </div>
    );
  }

  if (!selectedSchedule) {
    return (
      <div className="bg-gray-50 min-h-screen pb-20">
        <Header 
          title="Kapon Registration" 
          setCurrentScreen={setCurrentScreen}
          setShowSidebar={setShowSidebar}
        />
        <div className="pt-16 p-4">
          <div className="bg-white rounded-lg shadow-md p-6 text-center">
            <p className="text-gray-600 mb-4">No schedule selected. Please select a schedule first.</p>
            <button
              onClick={() => setCurrentScreen('kapon')}
              className="bg-pink-500 text-white px-6 py-2 rounded-lg hover:bg-pink-600"
            >
              Go to Schedule
            </button>
          </div>
        </div>
        <BottomNav currentScreen={currentScreen} setCurrentScreen={setCurrentScreen} />
      </div>
    );
  }

  return (
    <div className="bg-gray-50 min-h-screen pb-20">
      <Header 
        title="Kapon Registration" 
        setCurrentScreen={setCurrentScreen}
        setShowSidebar={setShowSidebar}
      />
      
      <div className="pt-16 p-4">
        <button
          onClick={() => setCurrentScreen('kapon')}
          className="flex items-center text-pink-500 mb-4 hover:text-pink-600"
        >
          <ArrowLeft size={20} className="mr-2" />
          Back to Schedule
        </button>

        {}
        {scheduleIsFull && (
          <div className="bg-red-50 border-l-4 border-red-500 rounded-lg p-4 mb-6 flex items-start gap-3">
            <AlertCircle className="text-red-500 flex-shrink-0 mt-0.5" size={20} />
            <div>
              <h3 className="font-semibold text-red-800 mb-1">Schedule Full</h3>
              <p className="text-sm text-red-700">
                Unfortunately, this Kapon event is now fully booked. Please wait for the next schedule or choose another date.
              </p>
              <button
                onClick={() => setCurrentScreen('kapon')}
                className="mt-3 text-sm text-red-600 hover:text-red-800 font-semibold"
              >
                View Other Schedules
              </button>
            </div>
          </div>
        )}

        {}
        <div className="bg-gradient-to-br from-pink-50 to-purple-50 rounded-xl p-6 mb-6 border border-pink-200">
          <h3 className="text-lg font-bold text-pink-600 mb-4">Selected Event</h3>
          <h4 className="text-xl font-bold text-gray-800 mb-3">{selectedSchedule.title}</h4>
          <div className="space-y-2 text-sm">
            <div className="flex items-center text-gray-700">
              <Calendar size={18} className="text-pink-500 mr-2 flex-shrink-0" />
              <span>{formatDate(selectedSchedule.date)}</span>
            </div>
            <div className="flex items-center text-gray-700">
              <Clock size={18} className="text-pink-500 mr-2 flex-shrink-0" />
              <span>{selectedSchedule.time || 'TBA'}</span>
            </div>
            <div className="flex items-center text-gray-700">
              <MapPin size={18} className="text-pink-500 mr-2 flex-shrink-0" />
              <span>{selectedSchedule.location || 'TBA'}</span>
            </div>
          </div>
          <div className="mt-4 pt-4 border-t border-pink-200">
            <p className="text-xs text-gray-600">
              Slots Available: <span className={`font-semibold ${scheduleIsFull ? 'text-red-600' : 'text-pink-600'}`}>
                {Math.max(0, selectedSchedule.capacity - (selectedSchedule.registeredCount || 0))} / {selectedSchedule.capacity}
              </span>
            </p>
          {}
            <div className="mt-2 w-full bg-gray-200 rounded-full h-2">
              <div
                className={`h-2 rounded-full transition-all ${scheduleIsFull ? 'bg-red-500' : 'bg-pink-500'}`}
                style={{
                  width: `${Math.min(((selectedSchedule.registeredCount || 0) / selectedSchedule.capacity) * 100, 100)}%`
                }}
              ></div>
            </div>
          </div>
          {selectedSchedule.requirements && (
            <div className="mt-4 p-3 bg-blue-50 rounded-lg">
              <p className="text-xs font-semibold text-blue-800 mb-1">📋 Requirements:</p>
              <p className="text-xs text-gray-700 whitespace-pre-line">{selectedSchedule.requirements}</p>
            </div>
          )}
        </div>

        {}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <p className="text-red-700 text-sm">{error}</p>
          </div>
        )}

        {}
        {!scheduleIsFull ? (
          <div className="bg-white rounded-xl shadow-md p-6">
            <h3 className="text-xl font-bold text-gray-800 mb-6">Pet Owner Information</h3>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              {}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Your Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="ownerName"
                  required
                  value={formData.ownerName}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                  placeholder="Enter your full name"
                />
              </div>

              {}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Contact Number <span className="text-red-500">*</span>
                </label>
                <input
                  type="tel"
                  name="contactNumber"
                  required
                  value={formData.contactNumber}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                  placeholder="09XX XXX XXXX"
                />
              </div>

              <div className="pt-4 border-t border-gray-200">
                <h4 className="text-lg font-bold text-gray-800 mb-4">Pet Information</h4>
              </div>

              {}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Pet Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="petName"
                  required
                  value={formData.petName}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                  placeholder="Enter pet's name"
                />
              </div>

               {}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Pet Type <span className="text-red-500">*</span>
                </label>
                <select
                  name="petType"
                  required
                  value={formData.petType}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                >
                  <option value="dog">Dog</option>
                  <option value="cat">Cat</option>
                </select>
              </div>

              {}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Gender <span className="text-red-500">*</span>
                </label>
                <select
                  name="gender"
                  required
                  value={formData.gender}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                >
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                </select>
              </div>

              {}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Breed <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="breed"
                  required
                  value={formData.breed}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                  placeholder="e.g., Aspin, Persian, etc."
                />
              </div>

              {}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Age <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="age"
                  required
                  value={formData.age}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                  placeholder="e.g., 6 months, 2 years, etc."
                />
              </div>

              {}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Additional Notes (Optional)
                </label>
                <textarea
                  name="notes"
                  value={formData.notes}
                  onChange={handleChange}
                  rows="3"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                  placeholder="Any special considerations or medical conditions we should know about?"
                />
              </div>

              {}
              <div className="pt-4">
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-gradient-to-r from-pink-500 to-purple-500 text-white py-3 rounded-lg font-semibold hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? 'Submitting...' : 'Submit Registration'}
                </button>
              </div>

              {}
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <p className="text-xs text-gray-700">
                  <span className="font-semibold">Important:</span> Your registration is subject to admin approval. 
                  You will be notified via email once your request has been reviewed. 
                  Please ensure all information provided is accurate.
                </p>
              </div>
            </form>
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow-md p-8 text-center">
            <AlertCircle className="mx-auto mb-4 text-red-500" size={48} />
            <h3 className="text-xl font-bold text-gray-800 mb-2">Kapon Event is Full</h3>
            <p className="text-gray-600 mb-6">
              This event has reached its maximum capacity. Please check back for future Kapon schedules.
            </p>
            <button
              onClick={() => setCurrentScreen('kapon')}
              className="bg-pink-500 text-white px-6 py-3 rounded-lg hover:bg-pink-600 font-semibold"
            >
              View All Schedules
            </button>
          </div>
        )}
      </div>
      
      <BottomNav currentScreen={currentScreen} setCurrentScreen={setCurrentScreen} />
    </div>
  );
};

export default KaponForm;