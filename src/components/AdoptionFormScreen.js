import React, { useState, useEffect } from 'react';
import { Heart, ArrowLeft, CheckCircle, Upload, AlertCircle, FileText, Info } from 'lucide-react';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../config/firebaseConfig';
import adoptionService from '../services/adoptionService';

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

const AdoptionFormScreen = ({ pet, setCurrentScreen, currentUser }) => {
  const [showRequirements, setShowRequirements] = useState(true);
  const [hasReadRequirements, setHasReadRequirements] = useState(false);
  const [formData, setFormData] = useState({
    validIdFile: null,
    reason: '',
    hasCurrentPets: '',
    currentPetsDetails: '',
    arePetsVaccinated: '',
    hasAdoptedBefore: '',
    previousPetsHistory: '',
    homeInspectionConsent: false
  });
  const [userData, setUserData] = useState(null);
  const [ownerData, setOwnerData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState('');
  const [error, setError] = useState('');
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [adoptionResult, setAdoptionResult] = useState(null);
  const [idPreview, setIdPreview] = useState(null);
  const [validIdBase64, setValidIdBase64] = useState(null);
  const [proofOfResidenceFile, setProofOfResidenceFile] = useState(null);
  const [proofOfResidencePreview, setProofOfResidencePreview] = useState(null);
  const [proofOfResidenceBase64, setProofOfResidenceBase64] = useState(null);

  useEffect(() => {
    const fetchUserData = async () => {
      if (currentUser) {
        try {
          const userDoc = await getDoc(doc(db, 'users', currentUser.uid));
          if (userDoc.exists()) {
            setUserData(userDoc.data());
          }
        } catch (error) {
          console.error('Error fetching user data:', error);
        }
      }
    };
    fetchUserData();
  }, [currentUser]);

  useEffect(() => {
    const fetchOwnerData = async () => {
      if (pet.ownerId) {
        try {
          console.log('🔍 Fetching owner data for ownerId:', pet.ownerId);
          const ownerDoc = await getDoc(doc(db, 'users', pet.ownerId));
          if (ownerDoc.exists()) {
            const owner = ownerDoc.data();
            console.log('✅ Owner data fetched:', owner);
            setOwnerData(owner);
          } else {
            console.warn('⚠️ Owner document not found for:', pet.ownerId);
          }
        } catch (error) {
          console.error('❌ Error fetching owner data:', error);
        }
      } else {
        console.warn('⚠️ Pet has no ownerId:', pet);
      }
    };
    fetchOwnerData();
  }, [pet]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value
    });
  };
const compressImage = (file, maxWidth = 600, quality = 0.6) => {
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
     
            console.log('📊 Compressed image size:', (blob.size / 1024).toFixed(2), 'KB');
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
  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (file) {
      const validTypes = ['image/jpeg', 'image/jpg', 'image/png'];
      if (!validTypes.includes(file.type)) {
        setError('Please upload a valid ID image (JPEG or PNG only)');
        return;
      }
      
      if (file.size > 5 * 1024 * 1024) {
        setError('File size must be less than 5MB');
        return;
      }
      
      try {
        setUploading(true);
        setUploadProgress('Compressing image...');
        
        const compressedBlob = await compressImage(file, 800, 0.7);
        
        setUploadProgress('Converting to base64...');
        
        const reader = new FileReader();
        reader.readAsDataURL(compressedBlob);
        reader.onloadend = () => {
          const base64String = reader.result;
          setValidIdBase64(base64String);
          setIdPreview(base64String);
          setFormData({ ...formData, validIdFile: file });
          setError('');
          setUploading(false);
          setUploadProgress('');
        };
        reader.onerror = () => {
          setError('Failed to process image. Please try again.');
          setUploading(false);
          setUploadProgress('');
        };
      } catch (err) {
        console.error('Error processing image:', err);
        setError('Failed to process image. Please try again.');
        setUploading(false);
        setUploadProgress('');
      }
    }
  };

  const handleProofOfResidenceChange = async (e) => {
    const file = e.target.files[0];
    if (file) {
      const validTypes = ['image/jpeg', 'image/jpg', 'image/png'];
      if (!validTypes.includes(file.type)) {
        setError('Please upload a valid proof of residence image (JPEG or PNG only)');
        return;
      }
      
      if (file.size > 5 * 1024 * 1024) {
        setError('File size must be less than 5MB');
        return;
      }
      
      try {
        setUploading(true);
        setUploadProgress('Compressing proof of residence...');
        
        const compressedBlob = await compressImage(file, 800, 0.7);
        
        setUploadProgress('Converting to base64...');
        
        const reader = new FileReader();
        reader.readAsDataURL(compressedBlob);
        reader.onloadend = () => {
          const base64String = reader.result;
          setProofOfResidenceBase64(base64String);
          setProofOfResidencePreview(base64String);
          setProofOfResidenceFile(file);
          setError('');
          setUploading(false);
          setUploadProgress('');
        };
        reader.onerror = () => {
          setError('Failed to process proof of residence. Please try again.');
          setUploading(false);
          setUploadProgress('');
        };
      } catch (err) {
        console.error('Error processing proof of residence:', err);
        setError('Failed to process proof of residence. Please try again.');
        setUploading(false);
        setUploadProgress('');
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    if (!formData.validIdFile || !validIdBase64) {
      setError('Please upload your valid ID');
      setLoading(false);
      return;
    }

    if (!proofOfResidenceFile || !proofOfResidenceBase64) {
      setError('Please upload your proof of residence');
      setLoading(false);
      return;
    }

    if (!formData.reason || !formData.hasCurrentPets || !formData.hasAdoptedBefore) {
      setError('Please fill in all required fields');
      setLoading(false);
      return;
    }

    if (formData.hasCurrentPets === 'yes' && !formData.currentPetsDetails) {
      setError('Please specify type and number of your current pets');
      setLoading(false);
      return;
    }

    if (formData.hasCurrentPets === 'yes' && !formData.arePetsVaccinated) {
      setError('Please indicate if your current pets are vaccinated');
      setLoading(false);
      return;
    }

    if (!formData.homeInspectionConsent) {
      setError('You must consent to a pre-adoption home inspection');
      setLoading(false);
      return;
    }

    if (!currentUser) {
      setError('You must be logged in to submit an adoption request');
      setLoading(false);
      return;
    }

    try {
      console.log('📝 Preparing adoption data...');
      const adoptionData = {
        petId: pet.id,
        petName: pet.name,
        petBreed: pet.breed || '',
        petAge: pet.age || '',
        
        userId: currentUser.uid,
        userEmail: currentUser.email,
        fullName: userData?.fullName || currentUser.displayName || currentUser.email?.split('@')[0] || 'User',
        phoneNumber: userData?.phoneNumber || '',
        
        ownerId: pet.ownerId || '',
        ownerPhone: ownerData?.phoneNumber || pet.ownerPhone || '',
        
        validIdUrl: validIdBase64,
        validIdFileName: formData.validIdFile.name,
        
        proofOfResidenceUrl: proofOfResidenceBase64,
        proofOfResidenceFileName: proofOfResidenceFile.name,
        
        reason: formData.reason,
        hasCurrentPets: formData.hasCurrentPets,
        currentPetsDetails: formData.currentPetsDetails || '',
        arePetsVaccinated: formData.arePetsVaccinated || '',
        hasAdoptedBefore: formData.hasAdoptedBefore,
        previousPetsHistory: formData.previousPetsHistory || '',
        homeInspectionConsent: formData.homeInspectionConsent,
        
        status: 'pending'
      };
      
      console.log('📤 Submitting adoption...');
      
      if (!adoptionData.ownerPhone) {
        console.warn('⚠️ Owner phone number not available - SMS notification may fail');
      }
      
      const result = await adoptionService.submitAdoption(adoptionData);
      
      if (result.success) {
        setAdoptionResult({
          petName: pet.name,
          adoptionId: result.adoptionId,
          userEmail: currentUser.email
        });
        setShowSuccessModal(true);
        
        setFormData({
          validIdFile: null,
          reason: '',
          hasCurrentPets: '',
          currentPetsDetails: '',
          arePetsVaccinated: '',
          hasAdoptedBefore: '',
          previousPetsHistory: '',
          homeInspectionConsent: false
        });
        setIdPreview(null);
        setValidIdBase64(null);
        setProofOfResidenceFile(null);
        setProofOfResidencePreview(null);
        setProofOfResidenceBase64(null);
      } else {
        setError(result.error || 'Failed to submit request. Please try again.');
      }
    } catch (err) {
      console.error('❌ Adoption submission error:', err);
      const errorMsg = err.message || 'An error occurred. Please try again.';
      setError(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const handleCloseModal = () => {
    setShowSuccessModal(false);
    setCurrentScreen('home');
  };

  const handleProceedToForm = () => {
    if (hasReadRequirements) {
      setShowRequirements(false);
    }
  };

 
  if (showRequirements) {
    return (
      <div className="min-h-screen bg-gray-50 pb-20">
        {}
        {showSuccessModal && adoptionResult && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg p-6 max-w-md w-full shadow-xl">
              <div className="text-center">
                <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
                <h2 className="text-2xl font-bold text-gray-800 mb-2">
                  Application Submitted!
                </h2>
                <p className="text-gray-600 mb-4">
                  Your adoption request has been successfully submitted.
                </p>
                
                <div className="bg-gray-50 rounded-lg p-4 mb-4 text-left">
                  <div className="mb-2">
                    <span className="text-sm font-semibold text-gray-700">Pet:</span>
                    <p className="text-gray-800">{adoptionResult.petName}</p>
                  </div>
                  <div className="mb-2">
                    <span className="text-sm font-semibold text-gray-700">Request ID:</span>
                    <p className="text-gray-800 text-xs">{adoptionResult.adoptionId}</p>
                  </div>
                  <div>
                    <span className="text-sm font-semibold text-gray-700">Contact Email:</span>
                    <p className="text-gray-800 text-sm">{adoptionResult.userEmail}</p>
                  </div>
                </div>
                
                <p className="text-sm text-gray-600 mb-6">
                  The pet owner has been notified and will review your application soon!
                </p>
                
                <button
                  onClick={handleCloseModal}
                  className="w-full bg-gradient-to-r from-pink-500 to-purple-500 text-white py-3 rounded-lg font-semibold hover:shadow-lg transition-all"
                >
                  Done
                </button>
              </div>
            </div>
          </div>
        )}

        {}
        <div className="bg-gradient-to-r from-pink-500 to-purple-500 p-4 text-white sticky top-0 z-50">
          <button 
            onClick={() => setCurrentScreen('petDetail')}
            className="mb-4 flex items-center space-x-2 hover:opacity-80"
          >
            <ArrowLeft size={20} />
            <span className="text-sm">Back</span>
          </button>
          <div className="flex items-center space-x-3">
            <FileText className="fill-white" size={32} />
            <div>
              <h1 className="text-2xl font-bold">Adoption Requirements</h1>
              <p className="text-pink-100">Please read carefully before applying</p>
            </div>
          </div>
        </div>

        {}
        <div className="bg-white m-4 rounded-lg shadow-sm p-4 flex items-center space-x-4">
          <img 
            src={getPetImage(pet.imageUrl || pet.image)} 
            alt={pet.name}
            className="w-20 h-20 rounded-lg object-cover"
          />
          <div>
            <h3 className="font-bold text-gray-800">{pet.name}</h3>
            <p className="text-sm text-gray-600">{pet.breed} • {pet.age}</p>
            {(pet.isVaccinated || pet.vaccinated) && (
              <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full mt-1 inline-block">
                ✓ Vaccinated
              </span>
            )}
          </div>
        </div>

        {}
        <div className="p-4 space-y-4">
          {}
          <div className="bg-blue-50 border-l-4 border-blue-500 rounded-lg p-4 flex items-start space-x-3">
            <Info className="text-blue-600 flex-shrink-0 mt-0.5" size={24} />
            <div>
              <h3 className="font-bold text-blue-900 mb-1">Important Notice</h3>
              <p className="text-sm text-blue-800">
                Please read all requirements carefully before proceeding with your adoption application.
              </p>
            </div>
          </div>

          {}
          <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
            <h3 className="font-bold text-gray-800 text-lg mb-4 flex items-center gap-2">
              <FileText className="w-5 h-5 text-pink-500" />
              Required Documents & Information
            </h3>
            <div className="space-y-3">
              <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold text-gray-800">Valid Government-Issued ID</p>
                  <p className="text-sm text-gray-600">Required for identity verification (Driver's License, Passport, National ID, etc.)</p>
                </div>
              </div>
              <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold text-gray-800">Proof of Residence</p>
                  <p className="text-sm text-gray-600">Utility bill, lease agreement, or barangay certificate showing your current address</p>
                </div>
              </div>
              <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold text-gray-800">Complete Personal Information</p>
                  <p className="text-sm text-gray-600">Full name, contact number, email address, and current address</p>
                </div>
              </div>
              <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold text-gray-800">Pet Ownership History</p>
                  <p className="text-sm text-gray-600">Information about current and previous pets (if any)</p>
                </div>
              </div>
              <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold text-gray-800">Reason for Adoption</p>
                  <p className="text-sm text-gray-600">Detailed explanation of why you want to adopt this pet</p>
                </div>
              </div>
            </div>
          </div>

          {}
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <h3 className="font-bold text-yellow-900 mb-2 flex items-center gap-2">
              <AlertCircle className="w-5 h-5" />
              Pre-Adoption Home Inspection Required
            </h3>
            <p className="text-sm text-yellow-800 mb-3">
              All approved applicants must consent to a pre-adoption home inspection to ensure a safe and suitable environment for the pet.
            </p>
            <ul className="text-sm text-yellow-800 space-y-1 ml-6 list-disc">
              <li>The inspection will be scheduled after initial approval</li>
              <li>Our team will assess the living space and environment</li>
              <li>This ensures the pet's safety and well-being</li>
            </ul>
          </div>

          {}
          <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
            <h3 className="font-bold text-gray-800 text-lg mb-4">Adoption Process Timeline</h3>
            <div className="space-y-3">
              <div className="flex gap-3">
                <div className="flex-shrink-0 w-8 h-8 bg-pink-500 text-white rounded-full flex items-center justify-center font-bold text-sm">
                  1
                </div>
                <div>
                  <p className="font-semibold text-gray-800">Submit Application</p>
                  <p className="text-sm text-gray-600">Complete the form with all required information</p>
                </div>
              </div>
              <div className="flex gap-3">
                <div className="flex-shrink-0 w-8 h-8 bg-pink-500 text-white rounded-full flex items-center justify-center font-bold text-sm">
                  2
                </div>
                <div>
                  <p className="font-semibold text-gray-800">Application Review</p>
                  <p className="text-sm text-gray-600">Our team will review your application (1-3 days)</p>
                </div>
              </div>
              <div className="flex gap-3">
                <div className="flex-shrink-0 w-8 h-8 bg-pink-500 text-white rounded-full flex items-center justify-center font-bold text-sm">
                  3
                </div>
                <div>
                  <p className="font-semibold text-gray-800">Home Inspection</p>
                  <p className="text-sm text-gray-600">Schedule and conduct home visit if approved</p>
                </div>
              </div>
              <div className="flex gap-3">
                <div className="flex-shrink-0 w-8 h-8 bg-pink-500 text-white rounded-full flex items-center justify-center font-bold text-sm">
                  4
                </div>
                <div>
                  <p className="font-semibold text-gray-800">Final Approval</p>
                  <p className="text-sm text-gray-600">Receive confirmation and arrange pet pickup</p>
                </div>
              </div>
            </div>
          </div>

          {}
          <div className="bg-white rounded-lg shadow-sm p-6 border-2 border-pink-200">
            <label className="flex items-start space-x-3 cursor-pointer">
              <input
                type="checkbox"
                checked={hasReadRequirements}
                onChange={(e) => setHasReadRequirements(e.target.checked)}
                className="w-5 h-5 text-pink-500 rounded focus:ring-pink-500 mt-1 cursor-pointer"
              />
              <span className="text-sm text-gray-700">
                <strong className="text-pink-600">*</strong> I have read and understood all the adoption requirements and agree to comply with the adoption process, including the mandatory pre-adoption home inspection.
              </span>
            </label>
          </div>

          {}
          <div className="space-y-3">
            <button
              onClick={handleProceedToForm}
              disabled={!hasReadRequirements}
              className="w-full bg-gradient-to-r from-pink-500 to-purple-500 text-white py-4 rounded-lg font-semibold hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
            >
              <span>Proceed to Application Form</span>
            </button>
            
            <button
              onClick={() => setCurrentScreen('petDetail')}
              className="w-full bg-gray-200 text-gray-700 py-3 rounded-lg font-semibold hover:bg-gray-300 transition-all"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    );
  }

  
  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {}
      {showSuccessModal && adoptionResult && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 max-w-md w-full shadow-xl">
            <div className="text-center">
              <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-gray-800 mb-2">
                Application Submitted!
              </h2>
              <p className="text-gray-600 mb-4">
                Your adoption request has been successfully submitted.
              </p>
              
              <div className="bg-gray-50 rounded-lg p-4 mb-4 text-left">
                <div className="mb-2">
                  <span className="text-sm font-semibold text-gray-700">Pet:</span>
                  <p className="text-gray-800">{adoptionResult.petName}</p>
                </div>
                <div className="mb-2">
                  <span className="text-sm font-semibold text-gray-700">Request ID:</span>
                  <p className="text-gray-800 text-xs">{adoptionResult.adoptionId}</p>
                </div>
                <div>
                  <span className="text-sm font-semibold text-gray-700">Contact Email:</span>
                  <p className="text-gray-800 text-sm">{adoptionResult.userEmail}</p>
                </div>
              </div>
              
              <p className="text-sm text-gray-600 mb-6">
                The pet owner has been notified and will review your application soon!
              </p>
              
              <button
                onClick={handleCloseModal}
                className="w-full bg-gradient-to-r from-pink-500 to-purple-500 text-white py-3 rounded-lg font-semibold hover:shadow-lg transition-all"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}

      {}
      <div className="bg-gradient-to-r from-pink-500 to-purple-500 p-4 text-white sticky top-0 z-50">
        <button 
          onClick={() => setShowRequirements(true)}
          className="mb-4 flex items-center space-x-2 hover:opacity-80"
        >
          <ArrowLeft size={20} />
          <span className="text-sm">Back to Requirements</span>
        </button>
        <div className="flex items-center space-x-3">
          <Heart className="fill-white" size={32} />
          <div>
            <h1 className="text-2xl font-bold">Adoption Application</h1>
            <p className="text-pink-100">For {pet.name}</p>
          </div>
        </div>
      </div>

      {}
      <div className="bg-white m-4 rounded-lg shadow-sm p-4 flex items-center space-x-4">
        <img 
          src={getPetImage(pet.imageUrl || pet.image)} 
          alt={pet.name}
          className="w-20 h-20 rounded-lg object-cover"
        />
        <div>
          <h3 className="font-bold text-gray-800">{pet.name}</h3>
          <p className="text-sm text-gray-600">{pet.breed} • {pet.age}</p>
          {(pet.isVaccinated || pet.vaccinated) && (
            <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full mt-1 inline-block">
              ✓ Vaccinated
            </span>
          )}
        </div>
      </div>

      {}
      <form onSubmit={handleSubmit} className="p-4">
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4 flex items-start space-x-2">
            <AlertCircle size={20} className="flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="text-sm font-semibold mb-1">Error</p>
              <p className="text-sm">{error}</p>
            </div>
          </div>
        )}

        {}
        {uploading && uploadProgress && (
          <div className="bg-blue-50 border border-blue-200 text-blue-700 px-4 py-3 rounded-lg mb-4">
            <div className="flex items-center space-x-3">
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-700"></div>
              <div className="flex-1">
                <p className="text-sm font-medium">{uploadProgress}</p>
              </div>
            </div>
          </div>
        )}

        {}
        <div className="mb-4">
          <label className="block text-gray-700 text-sm font-semibold mb-2">
            Upload Valid ID *
          </label>
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center hover:border-pink-400 transition-colors">
            <input
              type="file"
              accept="image/jpeg,image/jpg,image/png"
              onChange={handleFileChange}
              className="hidden"
              id="validId"
              required
              disabled={uploading || loading}
            />
            <label htmlFor="validId" className={`cursor-pointer ${(uploading || loading) ? 'opacity-50 cursor-not-allowed' : ''}`}>
              {idPreview ? (
                <div className="space-y-2">
                  <img src={idPreview} alt="ID Preview" className="max-h-40 mx-auto rounded" />
                  <p className="text-sm text-green-600">✓ ID uploaded and ready</p>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.preventDefault();
                      setFormData({ ...formData, validIdFile: null });
                      setIdPreview(null);
                      setValidIdBase64(null);
                    }}
                    className="text-xs text-red-600 hover:text-red-800"
                    disabled={uploading || loading}
                  >
                    Remove
                  </button>
                </div>
              ) : (
                <div className="space-y-2">
                  <Upload className="mx-auto text-gray-400" size={40} />
                  <p className="text-sm text-gray-600">Click to upload your valid ID</p>
                  <p className="text-xs text-gray-500">(JPEG or PNG - Max 5MB)</p>
                  <p className="text-xs text-blue-600 mt-2">📌 Image will be compressed automatically</p>
                </div>
              )}
            </label>
          </div>
          <p className="text-xs text-gray-500 mt-2">
            📸 Accepted formats: JPG, PNG • Maximum size: 5MB • No Firebase Storage needed!
          </p>
        </div>

        {}
        <div className="mb-4">
          <label className="block text-gray-700 text-sm font-semibold mb-2">
            Upload Proof of Residence *
          </label>
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center hover:border-pink-400 transition-colors">
            <input
              type="file"
              accept="image/jpeg,image/jpg,image/png"
              onChange={handleProofOfResidenceChange}
              className="hidden"
              id="proofOfResidence"
              required
              disabled={uploading || loading}
            />
            <label htmlFor="proofOfResidence" className={`cursor-pointer ${(uploading || loading) ? 'opacity-50 cursor-not-allowed' : ''}`}>
              {proofOfResidencePreview ? (
                <div className="space-y-2">
                  <img src={proofOfResidencePreview} alt="Proof of Residence Preview" className="max-h-40 mx-auto rounded" />
                  <p className="text-sm text-green-600">✓ Proof of residence uploaded and ready</p>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.preventDefault();
                      setProofOfResidenceFile(null);
                      setProofOfResidencePreview(null);
                      setProofOfResidenceBase64(null);
                    }}
                    className="text-xs text-red-600 hover:text-red-800"
                    disabled={uploading || loading}
                  >
                    Remove
                  </button>
                </div>
              ) : (
                <div className="space-y-2">
                  <Upload className="mx-auto text-gray-400" size={40} />
                  <p className="text-sm text-gray-600">Click to upload proof of residence</p>
                  <p className="text-xs text-gray-500">(Utility bill, lease agreement, or barangay certificate)</p>
                  <p className="text-xs text-gray-500">(JPEG or PNG - Max 5MB)</p>
                  <p className="text-xs text-blue-600 mt-2">📌 Image will be compressed automatically</p>
                </div>
              )}
            </label>
          </div>
          <p className="text-xs text-gray-500 mt-2">
            📄 Accepted: Utility bill, lease agreement, barangay certificate • Formats: JPG, PNG • Max: 5MB
          </p>
        </div>

        {}
        <div className="mb-4">
          <label className="block text-gray-700 text-sm font-semibold mb-2">
            Why do you want to adopt {pet.name}? *
          </label>
          <textarea
            name="reason"
            value={formData.reason}
            onChange={handleChange}
            placeholder="Tell us why you want to give this pet a home..."
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500"
            rows="4"
            required
            disabled={uploading || loading}
          />
        </div>

        {}
        <div className="bg-gray-100 rounded-lg p-4 mb-4">
          <h3 className="font-bold text-gray-800 mb-3">Pet Ownership History</h3>
          
          {}
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-semibold mb-2">
              Do you currently have pets? *
            </label>
            <div className="flex gap-4">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="hasCurrentPets"
                  value="yes"
                  checked={formData.hasCurrentPets === 'yes'}
                  onChange={handleChange}
                  required
                  disabled={uploading || loading}
                  className="w-4 h-4 text-pink-500 focus:ring-pink-400 cursor-pointer"
                />
                <span className="text-sm text-gray-700">Yes</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="hasCurrentPets"
                  value="no"
                  checked={formData.hasCurrentPets === 'no'}
                  onChange={handleChange}
                  required
                  disabled={uploading || loading}
                  className="w-4 h-4 text-pink-500 focus:ring-pink-400 cursor-pointer"
                />
                <span className="text-sm text-gray-700">No</span>
              </label>
            </div>
            
            {formData.hasCurrentPets === 'yes' && (
              <div className="mt-3">
                <input
                  type="text"
                  name="currentPetsDetails"
                  value={formData.currentPetsDetails}
                  onChange={handleChange}
                  placeholder="Specify type and number (e.g., 2 dogs, 1 cat)"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500"
                  required={formData.hasCurrentPets === 'yes'}
                  disabled={uploading || loading}
                />
              </div>
            )}
          </div>

          {}
          {formData.hasCurrentPets === 'yes' && (
            <div className="mb-4">
              <label className="block text-gray-700 text-sm font-semibold mb-2">
                Are your current pets vaccinated? *
              </label>
              <div className="flex gap-4">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="arePetsVaccinated"
                    value="yes"
                    checked={formData.arePetsVaccinated === 'yes'}
                    onChange={handleChange}
                    required={formData.hasCurrentPets === 'yes'}
                    disabled={uploading || loading}
                    className="w-4 h-4 text-pink-500 focus:ring-pink-400 cursor-pointer"
                  />
                  <span className="text-sm text-gray-700">Yes</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="arePetsVaccinated"
                    value="no"
                    checked={formData.arePetsVaccinated === 'no'}
                    onChange={handleChange}
                    required={formData.hasCurrentPets === 'yes'}
                    disabled={uploading || loading}
                    className="w-4 h-4 text-pink-500 focus:ring-pink-400 cursor-pointer"
                  />
                  <span className="text-sm text-gray-700">No</span>
                </label>
              </div>
            </div>
          )}

          {}
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-semibold mb-2">
              Have you adopted a pet before? *
            </label>
            <div className="flex gap-4">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="hasAdoptedBefore"
                  value="yes"
                  checked={formData.hasAdoptedBefore === 'yes'}
                  onChange={handleChange}
                  required
                  disabled={uploading || loading}
                  className="w-4 h-4 text-pink-500 focus:ring-pink-400 cursor-pointer"
                />
                <span className="text-sm text-gray-700">Yes</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="hasAdoptedBefore"
                  value="no"
                  checked={formData.hasAdoptedBefore === 'no'}
                  onChange={handleChange}
                  required
                  disabled={uploading || loading}
                  className="w-4 h-4 text-pink-500 focus:ring-pink-400 cursor-pointer"
                />
                <span className="text-sm text-gray-700">No</span>
              </label>
            </div>
          </div>

          {}
          <div className="mb-0">
            <label className="block text-gray-700 text-sm font-semibold mb-2">
              What happened to your previous pets (if any)?
            </label>
            <textarea
              name="previousPetsHistory"
              value={formData.previousPetsHistory}
              onChange={handleChange}
              placeholder="Please share what happened to your previous pets..."
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500"
              rows="3"
              disabled={uploading || loading}
            />
          </div>
        </div>

        {}
        <div className="mb-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
          <label className="flex items-start space-x-3 cursor-pointer">
            <input
              type="checkbox"
              name="homeInspectionConsent"
              checked={formData.homeInspectionConsent}
              onChange={handleChange}
              required
              disabled={uploading || loading}
              className="w-5 h-5 text-pink-500 rounded focus:ring-pink-500 mt-0.5 cursor-pointer"
            />
            <span className="text-sm text-gray-700">
              <strong className="text-blue-800">*</strong> I consent to a pre-adoption home inspection in accordance with the adoption guidelines.
            </span>
          </label>
        </div>

        {}
        <button
          type="submit"
          disabled={loading || uploading || !currentUser}
          className="w-full bg-gradient-to-r from-pink-500 to-purple-500 text-white py-4 rounded-lg font-semibold hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
        >
          {uploading ? (
            <>
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
              <span>Processing...</span>
            </>
          ) : loading ? (
            <>
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
              <span>Submitting...</span>
            </>
          ) : (
            <span>Submit Application</span>
          )}
        </button>

        {!currentUser && (
          <p className="text-xs text-red-500 text-center mt-2">
            You must be logged in to submit an adoption request
          </p>
        )}

        <p className="text-xs text-gray-500 text-center mt-4">
          By submitting, you agree to our adoption terms and conditions.
        </p>
      </form>
    </div>
  );
};

export default AdoptionFormScreen;