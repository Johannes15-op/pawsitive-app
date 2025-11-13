import React, { useState, useEffect, useCallback } from 'react';
import { User, Mail, Phone, MapPin, LogOut, Heart, FileText, Shield, ArrowLeft } from 'lucide-react';
import { logoutUser, getCurrentUserData } from '../services/authService';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../config/firebaseConfig';
import BottomNav from './BottomNav';
import ProfilePictureUpload from './ProfilePictureUpload';
import { uploadProfilePicture, deleteProfilePicture } from '../services/imageUploadService';

const ProfileScreen = ({ 
  currentScreen, 
  setCurrentScreen, 
  currentUser, 
  setCurrentUser, 
  userRole,
  previousScreen = 'home' // Default to home if not provided
}) => {
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [adoptionCount, setAdoptionCount] = useState(0);
  const [pendingVolunteerCount, setPendingVolunteerCount] = useState(0);
  const [isUploadingPhoto, setIsUploadingPhoto] = useState(false);

  const loadUserData = useCallback(async () => {
    try {
      setLoading(true);
      
      if (currentUser) {
        const data = await getCurrentUserData();
        setUserData(data);

        // Fetch adoption count
        try {
          const adoptionsRef = collection(db, 'adoptions');
          const adoptionQuery = query(adoptionsRef, where('userId', '==', currentUser.uid), where('status', '==', 'approved'));
          const adoptionSnapshot = await getDocs(adoptionQuery);
          setAdoptionCount(adoptionSnapshot.size);
        } catch (error) {
          console.error('Error fetching adoptions:', error);
        }

        // Fetch pending volunteer requests count
        try {
          const volunteerRef = collection(db, 'volunteerRequests');
          const volunteerQuery = query(volunteerRef, where('userId', '==', currentUser.uid), where('status', '==', 'pending'));
          const volunteerSnapshot = await getDocs(volunteerQuery);
          setPendingVolunteerCount(volunteerSnapshot.size);
        } catch (error) {
          console.error('Error fetching volunteer requests:', error);
        }
      }
    } catch (error) {
      console.error('Error loading user data:', error);
    } finally {
      setLoading(false);
    }
  }, [currentUser]);

  useEffect(() => {
    loadUserData();
  }, [loadUserData]);

  const handlePhotoUpdate = async (file) => {
    if (!file) {
      // Remove photo
      if (window.confirm('Remove profile picture?')) {
        setIsUploadingPhoto(true);
        const result = await deleteProfilePicture(currentUser.uid);
        if (result.success) {
          await loadUserData(); 
          alert('Profile picture removed successfully!');
        } else {
          alert('Failed to remove photo: ' + result.error);
        }
        setIsUploadingPhoto(false);
      }
      return;
    }

    // Upload new photo
    setIsUploadingPhoto(true);
    const result = await uploadProfilePicture(currentUser.uid, file);
    
    if (result.success) {
      await loadUserData(); 
      alert('Profile picture updated successfully!');
    } else {
      alert('Failed to upload photo: ' + result.error);
    }
    setIsUploadingPhoto(false);
  };

  const handleLogout = async () => {
    if (window.confirm('Are you sure you want to logout?')) {
      try {
        const result = await logoutUser();
        
        if (result.success) {
          setCurrentUser(null);
          setCurrentScreen('welcome');
        } else {
          alert('Logout failed: ' + result.error);
        }
      } catch (error) {
        alert('Error during logout');
        console.error('Logout error:', error);
      }
    }
  };

  const handleBackClick = () => {
    setCurrentScreen(previousScreen);
  };

  if (!currentUser) {
    return (
      <div className="min-h-screen bg-gray-50 pb-20">
        {/* Header with Back Button for Guests */}
        <div className="bg-gradient-to-r from-pink-500 to-purple-500 px-4 py-6 text-white">
          <button
            onClick={handleBackClick}
            className="mb-4 flex items-center space-x-2 hover:opacity-80 transition-opacity"
          >
            <ArrowLeft size={20} />
            <span className="text-sm">Back to Browse</span>
          </button>
          <div className="flex items-center space-x-2">
            <User className="text-white" size={24} />
            <span className="font-semibold text-lg text-white">Profile</span>
          </div>
        </div>

        <div className="flex items-center justify-center p-4 pt-12">
          <div className="bg-white rounded-2xl shadow-lg p-8 text-center max-w-md w-full">
            <User className="text-gray-300 mx-auto mb-4" size={64} />
            <h2 className="text-2xl font-bold text-gray-800 mb-2">Not Logged In</h2>
            <p className="text-gray-600 mb-6">Please login to view your profile</p>
            <button
              onClick={() => setCurrentScreen('login')}
              className="w-full bg-pink-500 text-white py-3 rounded-lg font-semibold hover:bg-pink-600"
            >
              Login
            </button>
          </div>
        </div>
        
        <BottomNav currentScreen={currentScreen} setCurrentScreen={setCurrentScreen} />
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-500"></div>
      </div>
    );
  }

  const isAdmin = userRole === 'admin';

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Header with Back Button */}
      <div className="bg-gradient-to-r from-pink-500 to-purple-500 px-4 py-6 text-white">
        <button
          onClick={handleBackClick}
          className="mb-4 flex items-center space-x-2 hover:opacity-80 transition-opacity"
        >
          <ArrowLeft size={20} />
          <span className="text-sm">Back to {previousScreen === 'home' ? 'Home' : previousScreen === 'favorites' ? 'Favorites' : 'Browse'}</span>
        </button>
        
        <div className="flex items-center space-x-4">
          <ProfilePictureUpload
            currentPhotoURL={userData?.photoURL}
            onPhotoUpdate={handlePhotoUpdate}
            isUploading={isUploadingPhoto}
          />
          <div className="flex-1 min-w-0">
            <h1 className="text-2xl font-bold truncate">{userData?.fullName || 'User'}</h1>
            <p className="text-pink-100 text-sm truncate">{userData?.email}</p>
            {isAdmin && (
              <span className="inline-block mt-1 bg-yellow-400 text-gray-800 text-xs px-3 py-1 rounded-full font-semibold">
                ⭐ ADMIN
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="p-4">
        {/* Personal Information Card */}
        <div className="bg-white rounded-lg shadow-sm p-4 mb-4">
          <h2 className="text-lg font-bold text-gray-800 mb-4">Personal Information</h2>
          
          <div className="space-y-4">
           {/* Email */}
            <div className="flex items-start space-x-3">
              <div className="w-10 h-10 bg-pink-100 rounded-full flex items-center justify-center flex-shrink-0">
                <Mail className="text-pink-500" size={20} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs text-gray-500">Email</p>
                <p className="text-gray-800 font-medium break-words">{userData?.email}</p>
              </div>
            </div>

           {/* Phone */}
            <div className="flex items-start space-x-3">
              <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                <Phone className="text-blue-500" size={20} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs text-gray-500">Phone Number</p>
                <p className="text-gray-800 font-medium break-words">{userData?.phoneNumber || 'Not provided'}</p>
              </div>
            </div>

           {/* Address */}
            <div className="flex items-start space-x-3">
              <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                <MapPin className="text-green-500" size={20} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs text-gray-500">Address</p>
                <p className="text-gray-800 font-medium break-words">{userData?.address || 'Not provided'}</p>
              </div>
            </div>
          </div>
        </div>

      {/* Statistics Cards */}
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div className="bg-white rounded-lg shadow-sm p-4 text-center">
            <Heart className="text-pink-500 mx-auto mb-2" size={32} />
            <p className="text-2xl font-bold text-gray-800">{adoptionCount}</p>
            <p className="text-xs text-gray-500">Adoptions</p>
          </div>
          <div className="bg-white rounded-lg shadow-sm p-4 text-center">
            <FileText className="text-blue-500 mx-auto mb-2" size={32} />
            <p className="text-2xl font-bold text-gray-800">{pendingVolunteerCount}</p>
            <p className="text-xs text-gray-500">Pending Volunteer</p>
          </div>
        </div>

       {/* Admin Dashboard Button */}
        {isAdmin && (
          <button
            onClick={() => setCurrentScreen('adminDashboard')}
            className="w-full bg-gradient-to-r from-purple-500 to-pink-500 text-white py-4 rounded-lg font-semibold flex items-center justify-center space-x-2 mb-4 hover:shadow-lg transition-all"
          >
            <Shield size={20} />
            <span>Admin Dashboard</span>
          </button>
        )}

       {/* Logout Button */}
        <button
          onClick={handleLogout}
          className="w-full bg-red-500 text-white py-4 rounded-lg font-semibold flex items-center justify-center space-x-2 hover:bg-red-600 transition-colors"
        >
          <LogOut size={20} />
          <span>Logout</span>
        </button>

         {/* Member Since Info */}
        <div className="mt-4 bg-gray-100 rounded-lg p-4">
          <p className="text-xs text-gray-600 text-center">
            Member since {userData?.createdAt ? new Date(userData.createdAt.toDate()).toLocaleDateString() : 'Unknown'}
          </p>
        </div>
      </div>

      <BottomNav currentScreen={currentScreen} setCurrentScreen={setCurrentScreen} />
    </div>
  );
};

export default ProfileScreen;