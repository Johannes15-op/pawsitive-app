import React, { useState, useEffect } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { auth, db } from './config/firebaseConfig';

import donationService from './services/donationService';

import LoadingScreen from './components/LoadingScreen';
import WelcomeScreen from './components/WelcomeScreen';
import HomeScreen from './components/HomeScreen';
import FavoritesScreen from './components/FavoritesScreen';
import PetDetailScreen from './components/PetDetailScreen';
import LoginScreen from './components/LoginScreen';
import RegisterScreen from './components/RegisterScreen';
import AdoptionFormScreen from './components/AdoptionFormScreen';
import ProfileScreen from './components/ProfileScreen';
import AddPet from './components/AddPet';
import FormsScreen from './components/FormsScreen';
import DonationScreen from './components/DonationScreen';
import VolunteerScreen from './components/VolunteerScreen';
import AboutScreen from './components/AboutScreen';
import InstallPrompt from './components/InstallPrompt';
import AdminDashboard from './components/ModernAdminDashboard';
import CreateAnnouncementScreen from './components/CreateAnnouncementScreen';
import Sidebar from './components/Sidebar';
import KaponSchedule from './components/KaponSchedule';
import KaponForm from './components/KaponForm';
import TestSMS from './components/TestSMS';
import NotificationsScreen from './components/NotificationsScreen';

const App = () => {
  const [currentScreen, setCurrentScreen] = useState('loading');
  const [currentUser, setCurrentUser] = useState(null);
  const [userRole, setUserRole] = useState(null);
  const [selectedPet, setSelectedPet] = useState(() => {
    const saved = localStorage.getItem('taara_selectedPet');
    return saved ? JSON.parse(saved) : null;
  });
  const [selectedSchedule, setSelectedSchedule] = useState(() => {
    const saved = localStorage.getItem('taara_selectedSchedule');
    return saved ? JSON.parse(saved) : null;
  });
  const [showSidebar, setShowSidebar] = useState(false);
  const [favorites, setFavorites] = useState([]);
  const [authChecked, setAuthChecked] = useState(false);

 
  useEffect(() => {
    console.log('🔄 Setting up auth listener...');
    
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      console.log('👤 Auth state changed:', user ? user.email : 'No user');
      setCurrentUser(user);
      
      if (user) {
        try {
          console.log('📄 Fetching user role for UID:', user.uid);
          const userDoc = await getDoc(doc(db, 'users', user.uid));
          if (userDoc.exists()) {
            const userData = userDoc.data();
            const role = userData.role ? userData.role.toLowerCase() : 'user';
            setUserRole(role);
            console.log('✅ User role loaded:', role);
          } else {
            console.log('⚠️ User document not found, defaulting to user role');
            setUserRole('user');
          }
        } catch (error) {
          console.error('❌ Error fetching user role:', error);
          setUserRole('user');
        }
      } else {
        console.log('👋 No user logged in');
        setUserRole(null);
      }
      
      setAuthChecked(true);
    });

    return () => unsubscribe();
  }, []);


  useEffect(() => {
    if (!authChecked) {
      console.log('⏳ Waiting for auth check...');
      return;
    }

    console.log('✅ Auth checked, setting up redirect...');
    
    const loadingTimer = setTimeout(() => {
      console.log('🚀 Loading complete, redirecting...');
      

      const savedScreen = localStorage.getItem('taara_currentScreen');
      const nonPersistentScreens = ['loading', 'welcome', 'login', 'register'];
      
 
      if (savedScreen && !nonPersistentScreens.includes(savedScreen)) {
        console.log('📍 Restoring saved screen:', savedScreen);
        
  
        if (['adminDashboard', 'admin', 'createAnnouncement', 'addPet'].includes(savedScreen)) {
          if (userRole === 'admin') {
            setCurrentScreen(savedScreen);
          } else {
            console.log('⛔ Saved admin screen but user is not admin, going to home');
            setCurrentScreen('home');
          }
        } else if (!currentUser && savedScreen !== 'home') {
         
          console.log('⛔ Saved screen requires auth but no user, going to welcome');
          setCurrentScreen('welcome');
        } else {
          setCurrentScreen(savedScreen);
        }
      } else {

        if (!currentUser) {
          console.log('➡️ No user, going to welcome screen');
          setCurrentScreen('welcome');
        } else if (userRole === 'admin') {
          console.log('➡️ Admin detected, going to admin dashboard');
          setCurrentScreen('adminDashboard');
        } else {
          console.log('➡️ Regular user, going to home screen');
          setCurrentScreen('home');
        }
      }
    }, 2000);

    return () => clearTimeout(loadingTimer);
  }, [authChecked, currentUser, userRole]);


  useEffect(() => {
    if (currentScreen !== 'loading') {
      localStorage.setItem('taara_currentScreen', currentScreen);
      console.log('💾 Saved current screen:', currentScreen);
    }
  }, [currentScreen]);


  useEffect(() => {
    if (selectedPet) {
      localStorage.setItem('taara_selectedPet', JSON.stringify(selectedPet));
    } else {
      localStorage.removeItem('taara_selectedPet');
    }
  }, [selectedPet]);


  useEffect(() => {
    if (selectedSchedule) {
      localStorage.setItem('taara_selectedSchedule', JSON.stringify(selectedSchedule));
    } else {
      localStorage.removeItem('taara_selectedSchedule');
    }
  }, [selectedSchedule]);


  useEffect(() => {
    const savedFavorites = localStorage.getItem('taara_favorites');
    if (savedFavorites) {
      setFavorites(JSON.parse(savedFavorites));
    }
  }, []);


  useEffect(() => {
    localStorage.setItem('taara_favorites', JSON.stringify(favorites));
  }, [favorites]);


  useEffect(() => {
    if (currentScreen === 'adminDashboard' || currentScreen === 'admin' || currentScreen === 'createAnnouncement' || currentScreen === 'addPet') {
      if (userRole !== 'admin') {
        console.log('⛔ Access denied: User is not admin');
        setCurrentScreen('home');
      }
    }
  }, [currentScreen, userRole]);
  
  const handleDonationSubmit = async (donationData) => {
    console.log('=== APP.JS: handleDonationSubmit START ===');
    console.log('📤 Received donation data:', donationData);
    
    try {
      if (!currentUser) {
        console.error('❌ User not logged in');
        alert('Please log in to make a donation');
        return { success: false, error: 'User not authenticated' };
      }

      console.log('✅ User authenticated:', currentUser.email);
      console.log('👤 User ID:', currentUser.uid);

      const completeData = {
        ...donationData,
        userId: currentUser.uid,
        userEmail: currentUser.email,
        userName: currentUser.displayName || donationData.userName || 'Anonymous Donor'
      };

      console.log('📝 Complete donation data:', completeData);

      console.log('🔄 Calling donationService.createDonation...');
      const result = await donationService.createDonation(completeData);
      
      console.log('📨 Service result:', result);

      if (result.success) {
        console.log('✅ Donation submitted successfully!');
        alert('Thank you for your donation! Our admin will review it shortly.');
      } else {
        console.error('❌ Donation failed:', result.error);
        alert(`Failed to submit donation: ${result.error}`);
      }

      console.log('=== APP.JS: handleDonationSubmit END ===');
      return result;
      
    } catch (error) {
      console.error('=== APP.JS: handleDonationSubmit ERROR ===');
      console.error('❌ Error:', error);
      alert(`An error occurred: ${error.message}`);
      return { success: false, error: error.message };
    }
  };

  const renderScreen = () => {
    switch (currentScreen) {
      case 'loading':
        return <LoadingScreen />;
        
      case 'welcome':
        return (
          <WelcomeScreen 
            currentScreen={currentScreen}
            setCurrentScreen={setCurrentScreen}
            currentUser={currentUser}
            setCurrentUser={setCurrentUser}
            userRole={userRole}
            setUserRole={setUserRole}
            selectedPet={selectedPet}
            setSelectedPet={setSelectedPet}
            showSidebar={showSidebar}
            setShowSidebar={setShowSidebar}
            favorites={favorites}
            setFavorites={setFavorites}
          />
        );
        
      case 'login':
        return (
          <LoginScreen 
            setCurrentScreen={setCurrentScreen}
            setCurrentUser={setCurrentUser}
            setUserRole={setUserRole}
          />
        );
        
      case 'register':
        return (
          <RegisterScreen 
            setCurrentScreen={setCurrentScreen}
            setCurrentUser={setCurrentUser}
          />
        );
        
      case 'home':
        return (
          <HomeScreen 
            currentScreen={currentScreen}
            setCurrentScreen={setCurrentScreen}
            showSidebar={showSidebar}
            setShowSidebar={setShowSidebar}
            setSelectedPet={setSelectedPet}
            setSelectedSchedule={setSelectedSchedule}
            favorites={favorites}
            setFavorites={setFavorites}
          />
        );
        
      case 'favorites':
        return (
          <FavoritesScreen 
            currentScreen={currentScreen}
            setCurrentScreen={setCurrentScreen}
            favorites={favorites}
            setFavorites={setFavorites}
            setSelectedPet={setSelectedPet}
          />
        );
        
      case 'petDetail':
        return selectedPet ? (
          <PetDetailScreen 
            pet={selectedPet}
            setCurrentScreen={setCurrentScreen}
            currentUser={currentUser}
            favorites={favorites}
            setFavorites={setFavorites}
          />
        ) : (
          <HomeScreen 
            currentScreen={currentScreen}
            setCurrentScreen={setCurrentScreen}
            showSidebar={showSidebar}
            setShowSidebar={setShowSidebar}
            setSelectedPet={setSelectedPet}
            setSelectedSchedule={setSelectedSchedule}
            favorites={favorites}
            setFavorites={setFavorites}
          />
        );
        
      case 'adoptionForm':
        return selectedPet ? (
          <AdoptionFormScreen 
            pet={selectedPet}
            setCurrentScreen={setCurrentScreen}
            currentUser={currentUser}
          />
        ) : (
          <HomeScreen 
            currentScreen={currentScreen}
            setCurrentScreen={setCurrentScreen}
            showSidebar={showSidebar}
            setShowSidebar={setShowSidebar}
            setSelectedPet={setSelectedPet}
            setSelectedSchedule={setSelectedSchedule}
            favorites={favorites}
            setFavorites={setFavorites}
          />
        );
        
      case 'kapon':
        return (
          <KaponSchedule 
            currentScreen={currentScreen}
            setCurrentScreen={setCurrentScreen}
            showSidebar={showSidebar}
            setShowSidebar={setShowSidebar}
            setSelectedSchedule={setSelectedSchedule}
          />
        );

      case 'kaponForm':
        return (
          <KaponForm 
            currentScreen={currentScreen}
            setCurrentScreen={setCurrentScreen}
            setShowSidebar={setShowSidebar}
            selectedSchedule={selectedSchedule}
          />
        );
        
      case 'profile':
        return (
          <ProfileScreen 
            currentScreen={currentScreen}
            setCurrentScreen={setCurrentScreen}
            currentUser={currentUser}
            setCurrentUser={setCurrentUser}
            userRole={userRole}
          />
        );
        
      case 'forms':
        return (
          <FormsScreen 
            currentScreen={currentScreen}
            setCurrentScreen={setCurrentScreen}
            setShowSidebar={setShowSidebar}
            selectedPet={selectedPet}
          />
        );
        
      case 'donation':
        return (
          <DonationScreen 
            currentScreen={currentScreen}
            setCurrentScreen={setCurrentScreen}
            setShowSidebar={setShowSidebar}
            currentUser={currentUser} 
            onSubmitDonation={handleDonationSubmit}
          />
        );
        
      case 'volunteer':
        return (
          <VolunteerScreen 
            currentScreen={currentScreen}
            setCurrentScreen={setCurrentScreen}
            setShowSidebar={setShowSidebar}
            currentUser={currentUser}
          />
        );
        
      case 'about':
        return (
          <AboutScreen 
            currentScreen={currentScreen}
            setCurrentScreen={setCurrentScreen}
            showSidebar={showSidebar}
            setShowSidebar={setShowSidebar}
            selectedPet={selectedPet}
            setSelectedPet={setSelectedPet}
            favorites={favorites}
            setFavorites={setFavorites}
          />
        );

      case 'notifications':
        return (
          <NotificationsScreen 
            currentScreen={currentScreen}
            setCurrentScreen={setCurrentScreen}
            setShowSidebar={setShowSidebar}
            currentUser={currentUser}
          />
        );
        
      case 'testSMS':
        return (
          <TestSMS 
            setCurrentScreen={setCurrentScreen}
          />
        );
        
      case 'adminDashboard':
      case 'admin':
        if (userRole === 'admin') {
          return (
            <AdminDashboard 
              setCurrentScreen={setCurrentScreen}
              currentUser={currentUser}
              userRole={userRole}
            />
          );
        } else {
          console.log('⛔ Unauthorized access attempt to admin dashboard');
          setCurrentScreen('home');
          return <LoadingScreen />;
        }
        
      case 'createAnnouncement':
        if (userRole === 'admin') {
          return (
            <CreateAnnouncementScreen 
              setCurrentScreen={setCurrentScreen}
            />
          );
        } else {
          console.log('⛔ Unauthorized access attempt to create announcement');
          setCurrentScreen('home');
          return <LoadingScreen />;
        }
        
      case 'addPet':
        if (userRole === 'admin' && currentUser) {
          return (
            <AddPet 
              setCurrentScreen={setCurrentScreen}
              currentUser={currentUser}
            />
          );
        } else {
          console.log('⛔ Unauthorized access to add pet');
          setCurrentScreen('adminDashboard');
          return <LoadingScreen />;
        }
        
      default:
        return (
          <HomeScreen 
            currentScreen={currentScreen}
            setCurrentScreen={setCurrentScreen}
            showSidebar={showSidebar}
            setShowSidebar={setShowSidebar}
            setSelectedPet={setSelectedPet}
            setSelectedSchedule={setSelectedSchedule}
            favorites={favorites}
            setFavorites={setFavorites}
          />
        );
    }
  };

  return (
    <div className="app">
      {renderScreen()}
      <Sidebar 
        showSidebar={showSidebar}
        setShowSidebar={setShowSidebar}
        setCurrentScreen={setCurrentScreen}
      />
      <InstallPrompt />
    </div>
  );
};

export default App;