import React, { useState } from 'react';
import Header from './Header';
import BottomNav from './BottomNav';
import volunteerService from '../services/volunteerService';

const VolunteerScreen = ({ currentScreen, setCurrentScreen, setShowSidebar, currentUser }) => {
  const [formData, setFormData] = useState({
    hasVolunteerExperience: '',
    volunteerExperienceDescription: '',
    hasAnimalExperience: '',
    specialSkills: '',
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
    const { name, value, type } = e.target;
    
 
    if (type === 'radio' && name === 'hasVolunteerExperience' && value === 'no') {
      setFormData(prev => ({
        ...prev,
        [name]: value,
        volunteerExperienceDescription: ''
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    
    if (!currentUser) {
      setError('You must be logged in to submit a volunteer application');
      alert('Please login to submit a volunteer application');
      return;
    }
    
   
    if (!formData.hasVolunteerExperience || !formData.hasAnimalExperience || !formData.motivation) {
      setError('Please fill in all required fields');
      alert('Please fill in all required fields');
      return;
    }

    setSubmitting(true);


    const applicationData = {
  
      firstName: currentUser.firstName || '',
      lastName: currentUser.lastName || '',
      email: currentUser.email || '',
      phone: currentUser.phone || '',
      dateOfBirth: currentUser.dateOfBirth || '',
  
      ...formData
    };

    console.log('📝 Submitting application data:', applicationData);

    const result = await volunteerService.submitApplication(applicationData);

    if (result.success) {
      alert('Thank you for applying! Your application has been submitted successfully. Our volunteer coordinator will contact you soon.');
      
      
      setFormData({
        hasVolunteerExperience: '',
        volunteerExperienceDescription: '',
        hasAnimalExperience: '',
        specialSkills: '',
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
            {}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                Do you have previous volunteer experience? *
              </label>
              <div className="flex gap-4">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="hasVolunteerExperience"
                    value="yes"
                    checked={formData.hasVolunteerExperience === 'yes'}
                    onChange={handleInputChange}
                    required
                    disabled={!currentUser || submitting}
                    className="w-4 h-4 text-pink-500 focus:ring-pink-400 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                  />
                  <span className="text-sm text-gray-700">Yes</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="hasVolunteerExperience"
                    value="no"
                    checked={formData.hasVolunteerExperience === 'no'}
                    onChange={handleInputChange}
                    required
                    disabled={!currentUser || submitting}
                    className="w-4 h-4 text-pink-500 focus:ring-pink-400 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                  />
                  <span className="text-sm text-gray-700">No</span>
                </label>
              </div>
              {formData.hasVolunteerExperience === 'yes' && (
                <textarea
                  name="volunteerExperienceDescription"
                  value={formData.volunteerExperienceDescription}
                  onChange={handleInputChange}
                  placeholder="Please describe your volunteer experience"
                  rows="3"
                  disabled={!currentUser || submitting}
                  className="w-full p-3 bg-gray-50 border border-gray-200 rounded-lg resize-none focus:ring-2 focus:ring-pink-400 focus:bg-white focus:outline-none transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                />
              )}
            </div>

            {}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                Do you have experience handling animals? *
              </label>
              <div className="flex gap-4">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="hasAnimalExperience"
                    value="yes"
                    checked={formData.hasAnimalExperience === 'yes'}
                    onChange={handleInputChange}
                    required
                    disabled={!currentUser || submitting}
                    className="w-4 h-4 text-pink-500 focus:ring-pink-400 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                  />
                  <span className="text-sm text-gray-700">Yes</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="hasAnimalExperience"
                    value="no"
                    checked={formData.hasAnimalExperience === 'no'}
                    onChange={handleInputChange}
                    required
                    disabled={!currentUser || submitting}
                    className="w-4 h-4 text-pink-500 focus:ring-pink-400 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                  />
                  <span className="text-sm text-gray-700">No</span>
                </label>
              </div>
            </div>

            {}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                Special skills (e.g., graphic design, writing, first aid, etc.)
              </label>
              <input
                name="specialSkills"
                value={formData.specialSkills}
                onChange={handleInputChange}
                placeholder="List any special skills you have"
                disabled={!currentUser || submitting}
                className="w-full p-3 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-pink-400 focus:bg-white focus:outline-none transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              />
            </div>

            {}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                Why do you want to volunteer with us? *
              </label>
              <textarea 
                name="motivation"
                value={formData.motivation}
                onChange={handleInputChange}
                placeholder="Share your motivation for volunteering" 
                rows="4"
                required
                disabled={!currentUser || submitting}
                className="w-full p-3 bg-gray-50 border border-gray-200 rounded-lg resize-none focus:ring-2 focus:ring-pink-400 focus:bg-white focus:outline-none transition-colors disabled:opacity-50 disabled:cursor-not-allowed" 
              />
            </div>
            
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