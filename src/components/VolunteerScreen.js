import React, { useState } from 'react';
import Header from './Header';
import BottomNav from './BottomNav';
import volunteerService from '../services/volunteerService';

const VolunteerScreen = ({ currentScreen, setCurrentScreen, setShowSidebar, currentUser }) => {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    dateOfBirth: '',
    email: '',
    phone: '',
    motivation: ''
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const getImage = (imagePath) => {
    try {
      return require(`../assets/${imagePath}`);
    } catch (error) {
      return null;
    }
  };

  const medicalImage = getImage('image1.jpg');   
  const communityImage = getImage('image2.jpg');    
  const shelterImage = getImage('image3.jpg');      
  const foodImage = getImage('image4.jpg');         
  
  const volunteerTypes = [
    { 
      image: medicalImage,
      fallback: '👨‍⚕️',
      title: 'Medical Care',
      alt: 'Medical volunteer caring for animals'
    },
    { 
      image: communityImage,
      fallback: '👥',
      title: 'Community Outreach',
      alt: 'Volunteers doing community outreach'
    },
    { 
      image: shelterImage,
      fallback: '🏠',
      title: 'Shelter Care',
      alt: 'Volunteer caring for animals at shelter'
    },
    { 
      image: foodImage,
      fallback: '👨‍🍳',
      title: 'Food Preparation',
      alt: 'Volunteer preparing food for animals'
    }
  ];

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    
    if (!currentUser) {
      setError('You must be logged in to submit a volunteer application');
      alert('Please login to submit a volunteer application');
      return;
    }
    
   
    if (!formData.firstName || !formData.lastName || !formData.email || !formData.phone || !formData.motivation) {
      setError('Please fill in all required fields');
      alert('Please fill in all required fields');
      return;
    }

   
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      setError('Please enter a valid email address');
      alert('Please enter a valid email address');
      return;
    }

    setSubmitting(true);

    const result = await volunteerService.submitApplication(formData);

    if (result.success) {
      alert('Thank you for applying! Your application has been submitted successfully. Our volunteer coordinator will contact you soon.');
      
      
      setFormData({
        firstName: '',
        lastName: '',
        dateOfBirth: '',
        email: '',
        phone: '',
        motivation: ''
      });
      
      
      setTimeout(() => {
        setCurrentScreen('home');
      }, 1500);
    } else {
      setError('Error submitting application: ' + result.error);
      alert('Error submitting application: ' + result.error);
    }

    setSubmitting(false);
  };

  return (
    <div className="bg-gray-50 min-h-screen pb-20">
      <Header 
        title="Volunteer" 
        setCurrentScreen={setCurrentScreen}
        setShowSidebar={setShowSidebar}
      />
      
      <div className="p-4">
        <div className="bg-white rounded-lg shadow-sm p-6">
          {}
          {!currentUser && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4">
              <p className="text-sm font-semibold">Login Required</p>
              <p className="text-xs">You need to be logged in to submit a volunteer application.</p>
            </div>
          )}

             {}   
          <div className="mb-6">
            <div className="w-full h-48 bg-gradient-to-br from-pink-100 to-purple-200 flex items-center justify-center rounded-lg mb-4 shadow-sm">
              <div className="text-center">
                <div className="text-6xl mb-2">🤝</div>
                <p className="text-pink-600 font-semibold text-lg">Join Our Volunteer Team</p>
              </div>
            </div>
          </div>

          {}
          <div className="grid grid-cols-2 gap-4 mb-6">
            {volunteerTypes.map((type, index) => (
              <div key={index} className="text-center p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                <div className="w-16 h-16 mx-auto mb-3 rounded-full overflow-hidden shadow-md">
                  {type.image ? (
                    <img 
                      src={type.image} 
                      alt={type.alt} 
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-16 h-16 flex items-center justify-center bg-pink-100 rounded-full">
                      <span className="text-2xl">{type.fallback}</span>
                    </div>
                  )}
                </div>
                <p className="text-sm text-gray-700 font-medium">{type.title}</p>
              </div>
            ))}
          </div>
          
          {}
          <div className="bg-blue-50 border-l-4 border-blue-400 rounded-lg p-4 mb-6">
            <p className="text-sm text-gray-700 leading-relaxed">
              <span className="font-semibold text-blue-700">Note:</span> One of our volunteer coordinators will contact you soon to provide additional details, clarify your role, and address any questions you may have to ensure you're fully prepared for your volunteer work. We appreciate your support and look forward to having you join our team!
            </p>
          </div>
          
          <h3 className="font-semibold text-gray-800 mb-4 text-center text-lg">Volunteer Sign Up</h3>
          
          {}
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4">
              <p className="text-sm">{error}</p>
            </div>
          )}
          
          {}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <input 
                name="firstName"
                value={formData.firstName}
                onChange={handleInputChange}
                placeholder="First Name *" 
                required
                disabled={!currentUser || submitting}
                className="p-3 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-pink-400 focus:bg-white focus:outline-none transition-colors disabled:opacity-50 disabled:cursor-not-allowed" 
              />
              <input 
                name="lastName"
                value={formData.lastName}
                onChange={handleInputChange}
                placeholder="Last Name *" 
                required
                disabled={!currentUser || submitting}
                className="p-3 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-pink-400 focus:bg-white focus:outline-none transition-colors disabled:opacity-50 disabled:cursor-not-allowed" 
              />
            </div>
            <input 
              name="dateOfBirth"
              value={formData.dateOfBirth}
              onChange={handleInputChange}
              placeholder="Date of Birth" 
              type="date"
              disabled={!currentUser || submitting}
              className="w-full p-3 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-pink-400 focus:bg-white focus:outline-none transition-colors disabled:opacity-50 disabled:cursor-not-allowed" 
            />
            <input 
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              placeholder="Email Address *" 
              type="email"
              required
              disabled={!currentUser || submitting}
              className="w-full p-3 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-pink-400 focus:bg-white focus:outline-none transition-colors disabled:opacity-50 disabled:cursor-not-allowed" 
            />
            <input 
              name="phone"
              value={formData.phone}
              onChange={handleInputChange}
              placeholder="Phone Number *" 
              type="tel"
              required
              disabled={!currentUser || submitting}
              className="w-full p-3 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-pink-400 focus:bg-white focus:outline-none transition-colors disabled:opacity-50 disabled:cursor-not-allowed" 
            />
            <textarea 
              name="motivation"
              value={formData.motivation}
              onChange={handleInputChange}
              placeholder="Why do you want to volunteer with us? *" 
              rows="4"
              required
              disabled={!currentUser || submitting}
              className="w-full p-3 bg-gray-50 border border-gray-200 rounded-lg resize-none focus:ring-2 focus:ring-pink-400 focus:bg-white focus:outline-none transition-colors disabled:opacity-50 disabled:cursor-not-allowed" 
            />
            
            <button 
              type="submit"
              disabled={!currentUser || submitting}
              className="w-full bg-pink-500 text-white py-3 rounded-lg font-medium hover:bg-pink-600 transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {submitting ? 'Submitting...' : 'Submit Application'}
            </button>
          </form>
        </div>
      </div>
      
      <BottomNav currentScreen={currentScreen} setCurrentScreen={setCurrentScreen} />
    </div>
  );
};

export default VolunteerScreen;