import React, { useState, useEffect, useCallback } from 'react';
import { LogOut, PawPrint, Heart, MessageSquare, Users, BarChart3, Bell, UserCheck, Calendar, Menu, X, DollarSign, User, Eye, CheckCircle, Trash2 } from 'lucide-react';
import { signOut } from 'firebase/auth';
import { auth } from '../config/firebaseConfig';
import { collection, getDocs, updateDoc, doc, deleteDoc } from 'firebase/firestore';
import { ref, deleteObject } from 'firebase/storage';
import { db, storage } from '../config/firebaseConfig';
import petService from '../services/petService';
import adoptionService from '../services/adoptionService';
import volunteerService from '../services/volunteerService';
import kaponService from '../services/kaponService';
import donationService from '../services/donationService';
import AdoptionRequestsAdmin from './AdoptionRequestsAdmin';
import VolunteerRequestsAdmin from './VolunteerRequestsAdmin';
import KaponScheduleAdmin from './KaponScheduleAdmin';
import DonationManagementAdmin from './DonationManagementAdmin';
import UserManagementAdmin from './UserManagementAdmin';

import logo from '../assets/image.jpg'; 
import headerBg from '../assets/top.jpg';
import adminProfileImg from '../assets/Maam Edna.jpg';

import poknatImg from '../assets/pets/poknat.jpg';
import netnetImg from '../assets/pets/Netnet.jpg';
import natnatImg from '../assets/pets/Natnat.jpg';
import mateaImg from '../assets/pets/Matea.jpg';
import joniImg from '../assets/pets/Joni.jpg';
import jonaImg from '../assets/pets/Jona.jpg';
import pepitaImg from '../assets/pets/Pepita.jpg';
import lebronImg from '../assets/pets/Lebron.jpg';
import rondaImg from '../assets/pets/Ronda.jpg';
import boydogImg from '../assets/pets/Boydog.jpg';
import kajoImg from '../assets/pets/Kajo.jpg';
import deltaImg from '../assets/pets/Delta.jpg';
import charlieImg from '../assets/pets/Charlie.jpg';
import hugoImg from '../assets/pets/Hugo.jpg';
import dogdogImg from '../assets/pets/Dogdog.jpg';
import snowImg from '../assets/pets/Snow.jpg';
import dutchImg from '../assets/pets/Dutch.jpg';

const petImages = {
  'poknat.jpg': poknatImg,
  'Netnet.jpg': netnetImg,
  'Natnat.jpg': natnatImg,
  'Matea.jpg': mateaImg,
  'Joni.jpg': joniImg,
  'Jona.jpg': jonaImg,
  'Pepita.jpg': pepitaImg,
  'Lebron.jpg': lebronImg,
  'Ronda.jpg': rondaImg,
  'Boydog.jpg': boydogImg,
  'Kajo.jpg': kajoImg,
  'Delta.jpg': deltaImg,
  'Charlie.jpg': charlieImg,
  'Hugo.jpg': hugoImg,
  'Dogdog.jpg': dogdogImg,
  'Snow.jpg': snowImg,
  'Dutch.jpg': dutchImg
};

const getPetImage = (imageUrl) => {
  if (!imageUrl) return null;

  if (imageUrl.startsWith('assets/')) {
    const filename = imageUrl.split('/').pop();
    return petImages[filename] || null;
  }
  
  return imageUrl;
};

const ManagePets = ({ setCurrentScreen }) => {
  const [pets, setPets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [selectedPet, setSelectedPet] = useState(null);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    loadPets();
  }, []);

  const loadPets = async () => {
    try {
      setLoading(true);
      const querySnapshot = await getDocs(collection(db, 'pets'));
      const petsData = [];
      
      querySnapshot.forEach((doc) => {
        petsData.push({
          id: doc.id,
          ...doc.data()
        });
      });
      
      setPets(petsData);
    } catch (error) {
      console.error('Error loading pets:', error);
    } finally {
      setLoading(false);
    }
  };

  const updatePetStatus = async (petId, newStatus) => {
    try {
      const petRef = doc(db, 'pets', petId);
      await updateDoc(petRef, {
        status: newStatus,
        updatedAt: new Date()
      });
      
      setPets(pets.map(pet => 
        pet.id === petId ? { ...pet, status: newStatus } : pet
      ));
    } catch (error) {
      console.error('Error updating pet status:', error);
    }
  };

  const deletePet = async (petId, imageUrl) => {
    if (!window.confirm('Are you sure you want to delete this pet?')) {
      return;
    }

    try {
      if (imageUrl && imageUrl.includes('firebasestorage.googleapis.com')) {
        const imageRef = ref(storage, imageUrl);
        await deleteObject(imageRef);
      }

      await deleteDoc(doc(db, 'pets', petId));
      setPets(pets.filter(pet => pet.id !== petId));
    } catch (error) {
      console.error('Error deleting pet:', error);
    }
  };

  const filteredPets = pets.filter(pet => {
    if (filter === 'all') return true;
    return pet.status === filter;
  });

  const getStatusBadge = (status) => {
    const statusConfig = {
      available: { color: 'bg-green-100 text-green-800', text: 'Available' },
      pending: { color: 'bg-yellow-100 text-yellow-800', text: 'Pending' },
      adopted: { color: 'bg-blue-100 text-blue-800', text: 'Adopted' }
    };
    
    const config = statusConfig[status] || statusConfig.available;
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${config.color}`}>
        {config.text}
      </span>
    );
  };

  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow-md p-6">
        <div className="flex items-center justify-center h-32">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-pink-500"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-md p-4 md:p-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Manage Pets</h2>
          <p className="text-gray-600">View and manage all pets in the system</p>
        </div>
        <button
          onClick={() => setCurrentScreen('addPet')}
          className="bg-gradient-to-r from-pink-500 to-purple-500 text-white px-6 py-3 rounded-lg font-semibold hover:shadow-lg transition-all mt-4 md:mt-0"
        >
          + Add New Pet
        </button>
      </div>
      
      {}
      <div className="flex flex-wrap gap-2 mb-6">
        {['all', 'available', 'pending', 'adopted'].map((status) => (
          <button
            key={status}
            onClick={() => setFilter(status)}
            className={`px-4 py-2 rounded-lg font-medium transition-all ${
              filter === status
                ? 'bg-pink-500 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            {status.charAt(0).toUpperCase() + status.slice(1)}
          </button>
        ))}
      </div>

      {}
      {filteredPets.length === 0 ? (
        <div className="text-center py-12">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Eye className="text-gray-400" size={24} />
          </div>
          <h3 className="text-lg font-semibold text-gray-600 mb-2">No pets found</h3>
          <p className="text-gray-500">
            {filter === 'all' 
              ? 'No pets in the system yet.' 
              : `No pets with status "${filter}".`}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredPets.map((pet) => {
            const petImageSrc = getPetImage(pet.imageUrl);
            
            return (
              <div key={pet.id} className="bg-gray-50 rounded-lg overflow-hidden border border-gray-200">
                {}
                <div className="relative h-48 bg-gray-200">
                  {petImageSrc ? (
                    <img 
                      src={petImageSrc} 
                      alt={pet.name}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.style.display = 'none';
                        e.target.nextElementSibling.style.display = 'flex';
                      }}
                    />
                  ) : null}
                  <div className="w-full h-full flex items-center justify-center bg-gray-300" style={{ display: petImageSrc ? 'none' : 'flex' }}>
                    <PawPrint size={48} className="text-gray-400" />
                  </div>
                  <div className="absolute top-2 right-2">
                    {getStatusBadge(pet.status)}
                  </div>
                </div>

                {}
                <div className="p-4">
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="font-bold text-lg text-gray-800">{pet.name}</h3>
                    <span className="text-pink-500 text-sm">
                      {pet.gender === 'male' ? '♂' : '♀'}
                    </span>
                  </div>
                  
                  <div className="space-y-1 text-sm text-gray-600 mb-4">
                    <p><strong>Breed:</strong> {pet.breed || 'Not specified'}</p>
                    <p><strong>Age:</strong> {pet.age || 'Not specified'}</p>
                    {pet.size && <p><strong>Size:</strong> {pet.size}</p>}
                    {pet.color && <p><strong>Color:</strong> {pet.color}</p>}
                    {pet.vaccinated && <p className="text-green-600">✓ Vaccinated</p>}
                    {pet.neutered && <p className="text-purple-600">✓ Spayed/Neutered</p>}
                  </div>

                 {}
                  <div className="flex flex-wrap gap-2">
                    <button
                      onClick={() => {
                        setSelectedPet(pet);
                        setShowModal(true);
                      }}
                      className="flex-1 bg-blue-500 text-white py-2 px-3 rounded text-sm hover:bg-blue-600 transition-colors flex items-center justify-center gap-1"
                    >
                      <Eye size={14} />
                      View
                    </button>
                    
                    <button
                      onClick={() => updatePetStatus(pet.id, 'adopted')}
                      disabled={pet.status === 'adopted'}
                      className="flex-1 bg-green-500 text-white py-2 px-3 rounded text-sm hover:bg-green-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-1"
                    >
                      <CheckCircle size={14} />
                      Adopted
                    </button>
                    
                    <button
                      onClick={() => deletePet(pet.id, pet.imageUrl)}
                      className="bg-red-500 text-white py-2 px-3 rounded text-sm hover:bg-red-600 transition-colors flex items-center justify-center gap-1"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {}
      {showModal && selectedPet && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 p-4 flex justify-between items-center">
              <h3 className="text-xl font-bold text-gray-800">Pet Details</h3>
              <button
                onClick={() => {
                  setShowModal(false);
                  setSelectedPet(null);
                }}
                className="text-gray-500 hover:text-gray-700"
              >
                <X size={24} />
              </button>
            </div>
            
            <div className="p-6">
              {}
              <div className="relative h-64 bg-gray-200 rounded-lg overflow-hidden mb-6">
                {getPetImage(selectedPet.imageUrl) ? (
                  <img 
                    src={getPetImage(selectedPet.imageUrl)} 
                    alt={selectedPet.name}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.style.display = 'none';
                      e.target.nextElementSibling.style.display = 'flex';
                    }}
                  />
                ) : null}
                <div className="w-full h-full flex items-center justify-center bg-gray-300" style={{ display: getPetImage(selectedPet.imageUrl) ? 'none' : 'flex' }}>
                  <PawPrint size={64} className="text-gray-400" />
                </div>
                <div className="absolute top-2 right-2">
                  {getStatusBadge(selectedPet.status)}
                </div>
              </div>

              {}
              <div className="space-y-4">
                <div className="flex items-start justify-between">
                  <div>
                    <h4 className="text-2xl font-bold text-gray-800">{selectedPet.name}</h4>
                    <p className="text-gray-600">{selectedPet.breed || 'Not specified'}</p>
                  </div>
                  <span className="text-3xl">
                    {selectedPet.gender === 'male' ? '♂' : '♀'}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-4 py-4 border-y border-gray-200">
                  <div>
                    <p className="text-sm text-gray-500">Age</p>
                    <p className="font-semibold text-gray-800">{selectedPet.age || 'Not specified'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Size</p>
                    <p className="font-semibold text-gray-800">{selectedPet.size || 'Not specified'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Color</p>
                    <p className="font-semibold text-gray-800">{selectedPet.color || 'Not specified'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Gender</p>
                    <p className="font-semibold text-gray-800 capitalize">{selectedPet.gender || 'Not specified'}</p>
                  </div>
                </div>

                {selectedPet.description && (
                  <div>
                    <p className="text-sm text-gray-500 mb-2">Description</p>
                    <p className="text-gray-700">{selectedPet.description}</p>
                  </div>
                )}

                <div className="flex flex-wrap gap-2">
                  {selectedPet.vaccinated && (
                    <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-sm font-medium">
                      ✓ Vaccinated
                    </span>
                  )}
                  {selectedPet.neutered && (
                    <span className="bg-purple-100 text-purple-700 px-3 py-1 rounded-full text-sm font-medium">
                      ✓ Spayed/Neutered
                    </span>
                  )}
                </div>

                {selectedPet.createdAt && (
                  <div className="text-sm text-gray-500 pt-4 border-t border-gray-200">
                    Added on {new Date(selectedPet.createdAt.seconds * 1000).toLocaleDateString()}
                  </div>
                )}
              </div>

             {}
              <div className="flex gap-2 mt-6 pt-4 border-t border-gray-200">
                <button
                  onClick={() => {
                    updatePetStatus(selectedPet.id, 'adopted');
                    setShowModal(false);
                  }}
                  disabled={selectedPet.status === 'adopted'}
                  className="flex-1 bg-green-500 text-white py-3 rounded-lg hover:bg-green-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
                >
                  <CheckCircle size={18} />
                  Mark as Adopted
                </button>
                
                <button
                  onClick={() => {
                    if (window.confirm('Are you sure you want to delete this pet?')) {
                      deletePet(selectedPet.id, selectedPet.imageUrl);
                      setShowModal(false);
                    }
                  }}
                  className="bg-red-500 text-white py-3 px-6 rounded-lg hover:bg-red-600 transition-colors flex items-center justify-center gap-2"
                >
                  <Trash2 size={18} />
                  Delete
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const ModernAdminDashboard = ({ setCurrentScreen, currentUser, userRole }) => {
  const [activeTab, setActiveTab] = useState('overview');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [stats, setStats] = useState({
    totalPets: 0,
    availablePets: 0,
    adoptedPets: 0,
    pendingAdoptions: 0,
    pendingVolunteers: 0,
    pendingKaponSchedules: 0,
    totalDonations: 0,
    donationsCount: 0
  });
  const [loading, setLoading] = useState(true);

  const loadDashboardStats = useCallback(async () => {
    console.log('📊 Loading dashboard stats...');
    setLoading(true);

    try {
      const petsCountResult = await petService.getPetsCountByStatus();
      const pendingResult = await adoptionService.getPendingRequestsCount();
      const volunteerResult = await volunteerService.getPendingCount();
      const kaponResult = await kaponService.getPendingSchedulesCount();
      
      const donationsResult = await donationService.getAllDonations();
      const totalDonationsResult = await donationService.getTotalDonations();
      const pendingDonationsResult = await donationService.getPendingDonationsCount();
      
      if (petsCountResult.success) {
        const counts = petsCountResult.data;
        const donations = donationsResult.success ? donationsResult.data : [];
        
        setStats({
          totalPets: counts.total,
          availablePets: counts.available,
          adoptedPets: counts.adopted,
          pendingAdoptions: pendingResult.count || 0,
          pendingVolunteers: volunteerResult.count || 0,
          pendingKaponSchedules: kaponResult.count || 0,
          pendingDonations: pendingDonationsResult.count || 0,
          totalDonations: totalDonationsResult.total || 0,
          recentDonations: donations.slice(0, 10)
        });
        
        console.log('✅ Stats loaded:', counts);
      } else {
        console.log('⚠️ Using fallback stats method');
        const petsResult = await petService.getAllPets();
        if (petsResult.success) {
          const pets = petsResult.data;
          const donations = donationsResult.success ? donationsResult.data : [];
          
          setStats({
            totalPets: pets.length,
            availablePets: pets.filter(p => p.status === 'available').length,
            adoptedPets: pets.filter(p => p.status === 'adopted').length,
            pendingAdoptions: pendingResult.count || 0,
            pendingVolunteers: volunteerResult.count || 0,
            pendingKaponSchedules: kaponResult.count || 0,
            pendingDonations: pendingDonationsResult.count || 0,
            totalDonations: totalDonationsResult.total || 0,
            recentDonations: donations.slice(0, 10)
          });
        }
      }
    } catch (error) {
      console.error('❌ Error loading stats:', error);
    }
    
    setLoading(false);
  }, []);

  useEffect(() => {
    loadDashboardStats();
  }, [loadDashboardStats]);

  const handleLogout = async () => {
    if (window.confirm('Are you sure you want to logout?')) {
      try {
        await signOut(auth);
        setCurrentScreen('welcome');
      } catch (error) {
        console.error('Logout error:', error);
        alert('Error logging out. Please try again.');
      }
    }
  };

  const StatCard = ({ icon: Icon, title, value, color, badge, onClick }) => (
    <div 
      onClick={onClick}
      className={`bg-white rounded-xl shadow-md p-6 transition-all relative ${
        onClick ? 'hover:shadow-xl hover:scale-105 cursor-pointer' : 'hover:shadow-lg'
      }`}
    >
      <div className="flex items-start justify-between mb-3">
        <div className={`p-3 rounded-lg ${color} flex-shrink-0`}>
          <Icon size={24} className="text-white" />
        </div>
        {badge && (
          <span className="bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full flex-shrink-0">
            {badge}
          </span>
        )}
      </div>
      <h3 className="text-gray-600 text-sm font-medium mb-2 leading-tight min-h-[2.5rem]">{title}</h3>
      <p className="text-4xl font-bold text-gray-800">{value}</p>
      {onClick && (
        <div className="absolute bottom-2 right-2 text-xs text-gray-400">
          Click to view →
        </div>
      )}
    </div>
  );

  const NavButton = ({ icon: Icon, label, tabName, badge }) => {
    const iconColors = {
      overview: 'text-purple-500',
      adoptions: 'text-pink-500',
      volunteers: 'text-blue-500',
      kapon: 'text-orange-500',
      'donation-management': 'text-green-500',
      pets: 'text-indigo-500',
      announcements: 'text-gray-500',
      users: 'text-teal-500'
    };
    
    const iconColor = iconColors[tabName] || 'text-gray-400';
    
    return (
      <button
        onClick={() => {
          setActiveTab(tabName);
          setSidebarOpen(false);
        }}
        className={`flex items-center w-full p-3 rounded-lg transition-colors group ${
          activeTab === tabName
            ? 'bg-pink-50 text-pink-600'
            : 'text-gray-700 hover:bg-pink-50 hover:text-pink-600'
        }`}
      >
        <Icon size={20} className={`mr-3 flex-shrink-0 ${iconColor} group-hover:${iconColor.replace('500', '600')}`} />
        <span className="font-medium flex-1 text-left">{label}</span>
        {badge && (
          <span className="ml-auto bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full flex-shrink-0">
            {badge}
          </span>
        )}
      </button>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {}
      <div 
        className="text-white px-6 py-8 shadow-lg relative"
        style={{
          backgroundImage: `url(${headerBg})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-r from-pink-500/85 to-purple-500/85"></div>
        
        <div className="max-w-7xl mx-auto flex items-center justify-between relative z-10 gap-4">
          <div className="flex items-center space-x-3 min-w-0 flex-1">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="p-2 hover:bg-white/20 rounded-lg transition-colors"
            >
              {sidebarOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
            
            <img 
              src={logo} 
              alt="TAARA Logo" 
              className="w-10 h-10 object-contain flex-shrink-0"
            />
            <div className="min-w-0">
              <h1 className="text-2xl font-bold text-white truncate drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]">Ednalyn Cristo</h1>
              <p className="text-white text-sm truncate drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]">Welcome, {currentUser?.displayName || 'Admin'}</p>
            </div>
          </div>
          <button
            onClick={() => {
              setActiveTab('profile');
              setSidebarOpen(false);
            }}
            className="flex items-center space-x-2 bg-white/30 hover:bg-white/40 px-4 py-2 rounded-lg transition-colors flex-shrink-0 backdrop-blur-sm border border-pink/20"
          >
            <User size={20} />
            <span className="hidden sm:inline font-semibold">Profile</span>
          </button>
        </div>
      </div>

      <div className="flex">
        {}
        <div 
          className={`fixed inset-0 bg-black z-[60] transition-opacity duration-300 ${
            sidebarOpen ? 'opacity-50 visible' : 'opacity-0 invisible pointer-events-none'
          }`}
          onClick={() => setSidebarOpen(false)}
        />
        
       {}
        <div className={`
          fixed left-0 top-0 h-full w-72 bg-white shadow-2xl z-[70] transform transition-transform duration-300 ease-in-out
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
        `}>
          <div className="h-full overflow-y-auto flex flex-col">
            {}
            <div className="p-6 border-b border-gray-200 bg-gradient-to-r from-pink-50 to-purple-50">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 rounded-full overflow-hidden flex items-center justify-center bg-white shadow-sm">
                    <img 
                      src={logo} 
                      alt="TAARA Logo" 
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div>
                    <span className="font-bold text-lg text-gray-800">TAARA</span>
                    <p className="text-xs text-gray-600">Animal Rescue</p>
                  </div>
                </div>
                <button
                  onClick={() => setSidebarOpen(false)}
                  className="p-2 hover:bg-white rounded-lg transition-colors"
                >
                  <X size={20} className="text-gray-600" />
                </button>
              </div>
            </div>
            
            {}
            <nav className="p-4 space-y-1 flex-1" style={{ maxHeight: 'calc(100vh - 180px)' }}>
              <NavButton icon={BarChart3} label="Overview" tabName="overview" />
              <NavButton 
                icon={UserCheck} 
                label="Volunteer Requests" 
                tabName="volunteers"
                badge={stats.pendingVolunteers > 0 ? stats.pendingVolunteers : null}
              />
              <NavButton 
                icon={Calendar} 
                label="Kapon Schedule" 
                tabName="kapon"
                badge={stats.pendingKaponSchedules > 0 ? stats.pendingKaponSchedules : null}
              />
              <NavButton 
                icon={DollarSign} 
                label="Donation Management" 
                tabName="donation-management"
                badge={stats.pendingDonations > 0 ? stats.pendingDonations : null}
              />
              <NavButton icon={PawPrint} label="Manage Pets" tabName="pets" />
              <NavButton icon={MessageSquare} label="Announcements" tabName="announcements" />
              <NavButton icon={Users} label="Users" tabName="users" />
            </nav>

           {}
            {sidebarOpen && (
              <div className="p-4 border-t border-gray-200 bg-gray-50">
                <div className="text-center">
                  <p className="text-xs text-gray-600">Tabaco Animal Rescue</p>
                  <p className="text-xs text-gray-500">& Adoption</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {}
        <div className="flex-1 p-3 md:p-4 transition-all duration-300 overflow-x-hidden">
          <div className="max-w-full">
            {activeTab === 'overview' && (
              <div>
                <div className="flex items-center gap-3 mb-6">
                  <h2 className="text-2xl font-bold text-gray-800">Dashboard Overview</h2>
                </div>
                
                {loading ? (
                  <div className="flex items-center justify-center h-64">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-500"></div>
                  </div>
                ) : (
                  <>
                    {}
                    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 md:gap-6 mb-8">
                      <StatCard
                        icon={PawPrint}
                        title="Total Pets"
                        value={stats.totalPets}
                        color="bg-gradient-to-r from-blue-500 to-blue-600"
                        onClick={() => setActiveTab('pets')}
                      />
                      <StatCard
                        icon={Heart}
                        title="Available for Adoption"
                        value={stats.availablePets}
                        color="bg-gradient-to-r from-green-500 to-green-600"
                        onClick={() => setActiveTab('pets')}
                      />
                      <StatCard
                        icon={Users}
                        title="Successfully Adopted"
                        value={stats.adoptedPets}
                        color="bg-gradient-to-r from-purple-500 to-purple-600"
                        onClick={() => setActiveTab('pets')}
                      />
                      <StatCard
                        icon={Bell}
                        title="Pending Adoptions"
                        value={stats.pendingAdoptions}
                        color="bg-gradient-to-r from-orange-500 to-orange-600"
                        badge={stats.pendingAdoptions > 0 ? 'New' : null}
                        onClick={() => setActiveTab('adoptions')}
                      />
                      <StatCard
                        icon={UserCheck}
                        title="Pending Volunteers"
                        value={stats.pendingVolunteers}
                        color="bg-gradient-to-r from-teal-500 to-teal-600"
                        badge={stats.pendingVolunteers > 0 ? 'New' : null}
                        onClick={() => setActiveTab('volunteers')}
                      />
                      <StatCard
                        icon={Calendar}
                        title="Pending Kapon Schedules"
                        value={stats.pendingKaponSchedules}
                        color="bg-gradient-to-r from-indigo-500 to-indigo-600"
                        badge={stats.pendingKaponSchedules > 0 ? 'New' : null}
                        onClick={() => setActiveTab('kapon')}
                      />
                      <StatCard
                        icon={Bell}
                        title="Pending Donations"
                        value={stats.pendingDonations}
                        color="bg-gradient-to-r from-yellow-500 to-yellow-600"
                        badge={stats.pendingDonations > 0 ? 'New' : null}
                        onClick={() => setActiveTab('donation-management')}
                      />
                      <StatCard
                        icon={DollarSign}
                        title="Total Confirmed Donations"
                        value={`₱${stats.totalDonations.toLocaleString()}`}
                        color="bg-gradient-to-r from-green-500 to-green-600"
                        onClick={() => setActiveTab('donation-management')}
                      />
                    </div>
   
                   {}
                    <div className="bg-white rounded-xl shadow-md p-4 md:p-6 mb-8">
                      <h3 className="text-xl font-bold text-gray-800 mb-6 text-center">Quick Actions</h3>
                      <div className="flex justify-center">
                        <div className="grid grid-cols-3 gap-4 max-w-3xl">
                          <button
                            onClick={() => setCurrentScreen('addPet')}
                            className="bg-gradient-to-r from-pink-500 to-purple-500 text-white px-6 py-4 rounded-lg font-semibold hover:shadow-lg transition-all text-sm flex flex-col items-center justify-center gap-2 min-h-[100px]"
                          >
                            <span className="text-2xl">+</span>
                            <span>Add Pet</span>
                          </button>
                          <button
                            onClick={() => setActiveTab('adoptions')}
                            className="bg-gradient-to-r from-orange-500 to-orange-600 text-white px-6 py-4 rounded-lg font-semibold hover:shadow-lg transition-all text-sm flex flex-col items-center justify-center gap-2 min-h-[100px]"
                          >
                            <span className="text-xl">📋</span>
                            <span>Adoptions</span>
                            {stats.pendingAdoptions > 0 && (
                              <span className="text-xs bg-white/20 px-2 py-1 rounded-full">({stats.pendingAdoptions})</span>
                            )}
                          </button>
                          <button
                            onClick={() => setActiveTab('volunteers')}
                            className="bg-gradient-to-r from-teal-500 to-teal-600 text-white px-6 py-4 rounded-lg font-semibold hover:shadow-lg transition-all text-sm flex flex-col items-center justify-center gap-2 min-h-[100px]"
                          >
                            <span className="text-xl">👥</span>
                            <span>Volunteers</span>
                            {stats.pendingVolunteers > 0 && (
                              <span className="text-xs bg-white/20 px-2 py-1 rounded-full">({stats.pendingVolunteers})</span>
                            )}
                          </button>
                          
                          <button
                            onClick={() => setActiveTab('kapon')}
                            className="bg-gradient-to-r from-indigo-500 to-indigo-600 text-white px-6 py-4 rounded-lg font-semibold hover:shadow-lg transition-all text-sm flex flex-col items-center justify-center gap-2 min-h-[100px]"
                          >
                            <span className="text-xl">📅</span>
                            <span>Kapon</span>
                            {stats.pendingKaponSchedules > 0 && (
                              <span className="text-xs bg-white/20 px-2 py-1 rounded-full">({stats.pendingKaponSchedules})</span>
                            )}
                          </button>
                          <button
                            onClick={() => setActiveTab('donation-management')}
                            className="bg-gradient-to-r from-yellow-500 to-yellow-600 text-white px-6 py-4 rounded-lg font-semibold hover:shadow-lg transition-all text-sm flex flex-col items-center justify-center gap-2 min-h-[100px]"
                          >
                            <span className="text-xl">💰</span>
                            <span>Donations</span>
                            {stats.pendingDonations > 0 && (
                              <span className="text-xs bg-white/20 px-2 py-1 rounded-full">({stats.pendingDonations})</span>
                            )}
                          </button>
                          <button
                            onClick={() => setActiveTab('announcements')}
                            className="bg-gradient-to-r from-blue-500 to-blue-600 text-white px-6 py-4 rounded-lg font-semibold hover:shadow-lg transition-all text-sm flex flex-col items-center justify-center gap-2 min-h-[100px]"
                          >
                            <span className="text-xl">📢</span>
                            <span>Announcements</span>
                          </button>
                        </div>
                      </div>
                    </div>

                    {}
                    <div className="space-y-4">
                      {stats.pendingAdoptions > 0 && (
                        <div className="bg-orange-50 border-l-4 border-orange-500 p-4 rounded-lg">
                          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                            <Bell className="text-orange-500 flex-shrink-0" size={24} />
                            <div className="flex-1 min-w-0">
                              <h4 className="font-bold text-orange-800">New Adoption Requests!</h4>
                              <p className="text-orange-700 text-sm">
                                You have {stats.pendingAdoptions} pending adoption request{stats.pendingAdoptions > 1 ? 's' : ''} waiting for review.
                              </p>
                            </div>
                            <button
                              onClick={() => setActiveTab('adoptions')}
                              className="bg-orange-500 text-white px-4 py-2 rounded-lg hover:bg-orange-600 transition-colors flex-shrink-0 whitespace-nowrap text-sm"
                            >
                              Review Now
                            </button>
                          </div>
                        </div>
                      )}

                      {stats.pendingVolunteers > 0 && (
                        <div className="bg-teal-50 border-l-4 border-teal-500 p-4 rounded-lg">
                          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                            <UserCheck className="text-teal-500 flex-shrink-0" size={24} />
                            <div className="flex-1 min-w-0">
                              <h4 className="font-bold text-teal-800">New Volunteer Applications!</h4>
                              <p className="text-teal-700 text-sm">
                                You have {stats.pendingVolunteers} pending volunteer application{stats.pendingVolunteers > 1 ? 's' : ''} waiting for review.
                              </p>
                            </div>
                            <button
                              onClick={() => setActiveTab('volunteers')}
                              className="bg-teal-500 text-white px-4 py-2 rounded-lg hover:bg-teal-600 transition-colors flex-shrink-0 whitespace-nowrap text-sm"
                            >
                              Review Now
                            </button>
                          </div>
                        </div>
                      )}

                      {stats.pendingKaponSchedules > 0 && (
                        <div className="bg-indigo-50 border-l-4 border-indigo-500 p-4 rounded-lg">
                          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                            <Calendar className="text-indigo-500 flex-shrink-0" size={24} />
                            <div className="flex-1 min-w-0">
                              <h4 className="font-bold text-indigo-800">Pending Kapon Schedules!</h4>
                              <p className="text-indigo-700 text-sm">
                                You have {stats.pendingKaponSchedules} pending Kapon schedule{stats.pendingKaponSchedules > 1 ? 's' : ''} waiting for approval.
                              </p>
                            </div>
                            <button
                              onClick={() => setActiveTab('kapon')}
                              className="bg-indigo-500 text-white px-4 py-2 rounded-lg hover:bg-indigo-600 transition-colors flex-shrink-0 whitespace-nowrap text-sm"
                            >
                              Review Now
                            </button>
                          </div>
                        </div>
                      )}

                      {stats.pendingDonations > 0 && (
                        <div className="bg-yellow-50 border-l-4 border-yellow-500 p-4 rounded-lg">
                          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                            <DollarSign className="text-yellow-500 flex-shrink-0" size={24} />
                            <div className="flex-1 min-w-0">
                              <h4 className="font-bold text-yellow-800">New Donations!</h4>
                              <p className="text-yellow-700 text-sm">
                                You have {stats.pendingDonations} pending donation{stats.pendingDonations > 1 ? 's' : ''} waiting for review.
                              </p>
                            </div>
                            <button
                              onClick={() => setActiveTab('donation-management')}
                              className="bg-yellow-500 text-white px-4 py-2 rounded-lg hover:bg-yellow-600 transition-colors flex-shrink-0 whitespace-nowrap text-sm"
                            >
                              Review Now
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  </>
                )}
              </div>
            )}

            {activeTab === 'adoptions' && (
              <>
                <div className="flex items-center gap-3 mb-6">
                  <button
                    onClick={() => setActiveTab('overview')}
                    className="p-2 hover:bg-gray-100 rounded-lg transition-colors flex items-center gap-2 text-gray-600 hover:text-gray-800"
                    title="Back to Overview"
                  >
                    <svg 
                      width="20" 
                      height="20" 
                      viewBox="0 0 24 24" 
                      fill="none" 
                      stroke="currentColor" 
                      strokeWidth="2" 
                      strokeLinecap="round" 
                      strokeLinejoin="round"
                    >
                      <path d="M19 12H5M12 19l-7-7 7-7"/>
                    </svg>
                  </button>
                  <h2 className="text-2xl font-bold text-gray-800">Adoption Requests</h2>
                </div>
                <AdoptionRequestsAdmin />
              </>
            )}

            {activeTab === 'volunteers' && (
              <>
                <div className="flex items-center gap-3 mb-6">
                  <button
                    onClick={() => setActiveTab('overview')}
                    className="p-2 hover:bg-gray-100 rounded-lg transition-colors flex items-center gap-2 text-gray-600 hover:text-gray-800"
                    title="Back to Overview"
                  >
                    <svg 
                      width="20" 
                      height="20" 
                      viewBox="0 0 24 24" 
                      fill="none" 
                      stroke="currentColor" 
                      strokeWidth="2" 
                      strokeLinecap="round" 
                      strokeLinejoin="round"
                    >
                      <path d="M19 12H5M12 19l-7-7 7-7"/>
                    </svg>
                  </button>
                  <h2 className="text-2xl font-bold text-gray-800">Volunteer Requests</h2>
                </div>
                <VolunteerRequestsAdmin />
              </>
            )}

            {activeTab === 'kapon' && (
              <>
                <div className="flex items-center gap-3 mb-6">
                  <button
                    onClick={() => setActiveTab('overview')}
                    className="p-2 hover:bg-gray-100 rounded-lg transition-colors flex items-center gap-2 text-gray-600 hover:text-gray-800"
                    title="Back to Overview"
                  >
                    <svg 
                      width="20" 
                      height="20" 
                      viewBox="0 0 24 24" 
                      fill="none" 
                      stroke="currentColor" 
                      strokeWidth="2" 
                      strokeLinecap="round" 
                      strokeLinejoin="round"
                    >
                      <path d="M19 12H5M12 19l-7-7 7-7"/>
                    </svg>
                  </button>
                  <h2 className="text-2xl font-bold text-gray-800">Kapon Schedule</h2>
                </div>
                <KaponScheduleAdmin />
              </>
            )}

            {activeTab === 'donation-management' && (
              <>
                <div className="flex items-center gap-3 mb-6">
                  <button
                    onClick={() => setActiveTab('overview')}
                    className="p-2 hover:bg-gray-100 rounded-lg transition-colors flex items-center gap-2 text-gray-600 hover:text-gray-800"
                    title="Back to Overview"
                  >
                    <svg 
                      width="20" 
                      height="20" 
                      viewBox="0 0 24 24" 
                      fill="none" 
                      stroke="currentColor" 
                      strokeWidth="2" 
                      strokeLinecap="round" 
                      strokeLinejoin="round"
                    >
                      <path d="M19 12H5M12 19l-7-7 7-7"/>
                    </svg>
                  </button>
                  <h2 className="text-2xl font-bold text-gray-800">Donation Management</h2>
                </div>
                <DonationManagementAdmin onUpdate={loadDashboardStats} />
              </>
            )}

            {activeTab === 'users' && (
              <>
                <div className="flex items-center gap-3 mb-6">
                  <button
                    onClick={() => setActiveTab('overview')}
                    className="p-2 hover:bg-gray-100 rounded-lg transition-colors flex items-center gap-2 text-gray-600 hover:text-gray-800"
                    title="Back to Overview"
                  >
                    <svg 
                      width="20" 
                      height="20" 
                      viewBox="0 0 24 24" 
                      fill="none" 
                      stroke="currentColor" 
                      strokeWidth="2" 
                      strokeLinecap="round" 
                      strokeLinejoin="round"
                    >
                      <path d="M19 12H5M12 19l-7-7 7-7"/>
                    </svg>
                  </button>
                  <h2 className="text-2xl font-bold text-gray-800">User Management</h2>
                </div>
                <UserManagementAdmin />
              </>
            )}

            {activeTab === 'pets' && (
              <>
                <div className="flex items-center gap-3 mb-6">
                  <button
                    onClick={() => setActiveTab('overview')}
                    className="p-2 hover:bg-gray-100 rounded-lg transition-colors flex items-center gap-2 text-gray-600 hover:text-gray-800"
                    title="Back to Overview"
                  >
                    <svg 
                      width="20" 
                      height="20" 
                      viewBox="0 0 24 24" 
                      fill="none" 
                      stroke="currentColor" 
                      strokeWidth="2" 
                      strokeLinecap="round" 
                      strokeLinejoin="round"
                    >
                      <path d="M19 12H5M12 19l-7-7 7-7"/>
                    </svg>
                  </button>
                </div>
                <ManagePets setCurrentScreen={setCurrentScreen} />
              </>
            )}

            {activeTab === 'announcements' && (
              <div className="bg-white rounded-xl shadow-md p-4 md:p-6">
                <div className="flex items-center gap-3 mb-4">
                  <button
                    onClick={() => setActiveTab('overview')}
                    className="p-2 hover:bg-gray-100 rounded-lg transition-colors flex items-center gap-2 text-gray-600 hover:text-gray-800"
                    title="Back to Overview"
                  >
                    <svg 
                      width="20" 
                      height="20" 
                      viewBox="0 0 24 24" 
                      fill="none" 
                      stroke="currentColor" 
                      strokeWidth="2" 
                      strokeLinecap="round" 
                      strokeLinejoin="round"
                    >
                      <path d="M19 12H5M12 19l-7-7 7-7"/>
                    </svg>
                  </button>
                  <h2 className="text-2xl font-bold text-gray-800">Announcements</h2>
                </div>
                <p className="text-gray-600 mb-4">Create and manage announcements.</p>
                <button
                  onClick={() => setCurrentScreen('createAnnouncement')}
                  className="bg-gradient-to-r from-pink-500 to-purple-500 text-white px-6 py-3 rounded-lg font-semibold hover:shadow-lg transition-all"
                >
                  + Create Announcement
                </button>
              </div>
            )}

            {activeTab === 'profile' && (
              <div className="bg-white rounded-xl shadow-md p-4 md:p-6">
                <div className="flex items-center gap-3 mb-6">
                  <button
                    onClick={() => setActiveTab('overview')}
                    className="p-2 hover:bg-gray-100 rounded-lg transition-colors flex items-center gap-2 text-gray-600 hover:text-gray-800"
                    title="Back to Overview"
                  >
                    <svg 
                      width="20" 
                      height="20" 
                      viewBox="0 0 24 24" 
                      fill="none" 
                      stroke="currentColor" 
                      strokeWidth="2" 
                      strokeLinecap="round" 
                      strokeLinejoin="round"
                    >
                      <path d="M19 12H5M12 19l-7-7 7-7"/>
                    </svg>
                  </button>
                  <h2 className="text-2xl font-bold text-gray-800">Admin Profile</h2>
                </div>
                
                <div className="max-w-2xl mx-auto">
                  <div className="flex items-center justify-center mb-8">
                    <div className="bg-gradient-to-r from-pink-500 to-purple-500 rounded-full p-1">
                      <img 
                        src={adminProfileImg} 
                        alt="Admin Profile"
                        className="w-32 h-32 rounded-full object-cover"
                      />
                    </div>
                  </div>

                  <div className="space-y-6">
                    <div className="border-b border-gray-200 pb-4">
                      <label className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-2 block">
                        Full Name
                      </label>
                      <p className="text-lg text-gray-800 font-medium">
                        {currentUser?.displayName || 'Ednalyn Cristo'}
                      </p>
                    </div>

                    <div className="border-b border-gray-200 pb-4">
                      <label className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-2 block">
                        Email Address
                      </label>
                      <p className="text-lg text-gray-800 font-medium">
                        {currentUser?.email || 'ednalyncristo84@gmail.com'}
                      </p>
                    </div>

                    <div className="border-b border-gray-200 pb-4">
                      <label className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-2 block">
                        Phone Number
                      </label>
                      <p className="text-lg text-gray-800 font-medium">
                        {currentUser?.phoneNumber || '09936639774'}
                      </p>
                    </div>

                    <div className="border-b border-gray-200 pb-4">
                      <label className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-2 block">
                        Role
                      </label>
                      <span className="inline-block bg-gradient-to-r from-pink-500 to-purple-500 text-white px-4 py-2 rounded-full text-sm font-semibold">
                        {userRole || 'Administrator'}
                      </span>
                    </div>

                    <div className="border-b border-gray-200 pb-4">
                      <label className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-2 block">
                        Account Created
                      </label>
                      <p className="text-lg text-gray-800 font-medium">
                        {currentUser?.metadata?.creationTime 
                          ? new Date(currentUser.metadata.creationTime).toLocaleDateString('en-US', {
                              year: 'numeric',
                              month: 'long',
                              day: 'numeric'
                            })
                          : 'N/A'}
                      </p>
                    </div>

                    <div className="pb-4">
                      <label className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-2 block">
                        Last Sign In
                      </label>
                      <p className="text-lg text-gray-800 font-medium">
                        {currentUser?.metadata?.lastSignInTime 
                          ? new Date(currentUser.metadata.lastSignInTime).toLocaleString('en-US', {
                              year: 'numeric',
                              month: 'long',
                              day: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit'
                            })
                          : 'N/A'}
                      </p>
                    </div>
                  </div>

                  <div className="mt-8 pt-6 border-t border-gray-200 flex flex-col sm:flex-row gap-4">
                    <button
                      onClick={handleLogout}
                      className="flex items-center justify-center space-x-2 bg-gradient-to-r from-red-500 to-red-600 text-white px-6 py-3 rounded-lg font-semibold hover:shadow-lg transition-all flex-1"
                    >
                      <LogOut size={20} />
                      <span>Logout</span>
                    </button>
                    <button
                      onClick={() => setActiveTab('overview')}
                      className="flex items-center justify-center space-x-2 bg-gray-100 text-gray-700 px-6 py-3 rounded-lg font-semibold hover:bg-gray-200 transition-all flex-1"
                    >
                      <span>Back to Dashboard</span>
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ModernAdminDashboard;

