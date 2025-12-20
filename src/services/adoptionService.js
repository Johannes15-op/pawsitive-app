import { collection, addDoc, Timestamp, query, where, getDocs, updateDoc, doc, getDoc } from 'firebase/firestore';
import { db } from '../config/firebaseConfig';

// Use environment variable for API URL
const API_URL = process.env.REACT_APP_API_URL || 'https://taara-backend.vercel.app';

const adoptionService = {
  submitAdoption: async (adoptionData) => {
    try {
      console.log('📝 Submitting adoption to Firestore:', adoptionData);
      
      // STEP 1: FETCH PET DATA TO GET OWNER ID
      const petDocRef = doc(db, 'pets', adoptionData.petId);
      const petSnap = await getDoc(petDocRef);
      
      if (!petSnap.exists()) {
        throw new Error('Pet not found');
      }
      
      const petData = petSnap.data();
      const ownerId = petData.ownerId;
      
      // STEP 2: FETCH OWNER'S PHONE NUMBER FROM USERS COLLECTION
      let ownerPhone = petData.ownerPhone; // Try direct phone first
      
      if (!ownerPhone && ownerId) {
        console.log('📞 Fetching owner phone from users collection...');
        const userDocRef = doc(db, 'users', ownerId);
        const userSnap = await getDoc(userDocRef);
        
        if (userSnap.exists()) {
          const userData = userSnap.data();
          ownerPhone = userData.phoneNumber;
          console.log('✅ Found owner phone:', ownerPhone);
        } else {
          console.warn('⚠️ Owner user document not found');
        }
      }
      
      // STEP 3: CREATE ADOPTION DOCUMENT
      const adoptionsRef = collection(db, 'adoptions');
      
      const docRef = await addDoc(adoptionsRef, {
        // User info
        userId: adoptionData.userId,
        userEmail: adoptionData.userEmail,
        fullName: adoptionData.fullName,
        phoneNumber: adoptionData.phoneNumber,
        
        // Pet info
        petId: adoptionData.petId,
        petName: adoptionData.petName,
        petBreed: adoptionData.petBreed,
        petAge: adoptionData.petAge,
        
        // Owner info (fetched from Firestore)
        ownerId: ownerId,
        ownerPhone: ownerPhone,
        
        // Adoption details
        address: adoptionData.address,
        reason: adoptionData.reason,
        hasExperience: adoptionData.hasExperience,
        hasOtherPets: adoptionData.hasOtherPets,
        
        // Status
        status: 'pending',
        createdAt: Timestamp.fromDate(new Date()),
        updatedAt: Timestamp.fromDate(new Date())
      });
      
      console.log('✅ Adoption submitted successfully with ID:', docRef.id);
      
      // 🆕 STEP 4: UPDATE PET STATUS TO PENDING
      try {
        await updateDoc(petDocRef, {
          status: 'pending',
          updatedAt: Timestamp.fromDate(new Date())
        });
        console.log('✅ Pet status updated to PENDING');
      } catch (petError) {
        console.error('⚠️ Error updating pet status to pending:', petError);
      }
      
      // STEP 5: SEND SMS NOTIFICATION TO OWNER
      try {
        console.log('📱 Notifying backend to send SMS...');
        
        if (!ownerPhone) {
          console.warn('⚠️ Owner phone number not found, SMS not sent');
        } else {
          const response = await fetch(`${API_URL}/api/sms/adoption-notification`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              ownerPhone: ownerPhone,
              petName: adoptionData.petName,
              adopterName: adoptionData.fullName,
              adopterContact: adoptionData.phoneNumber,
              adoptionId: docRef.id
            })
          });
          
          const result = await response.json();
          
          if (result.success) {
            console.log('✅ SMS notification sent to owner successfully');
          } else {
            console.warn('⚠️ SMS notification failed:', result.message);
          }
        }
      } catch (smsError) {
        console.error('⚠️ SMS notification error (non-critical):', smsError.message);
      }
      
      return {
        success: true,
        adoptionId: docRef.id,
        message: 'Adoption application submitted successfully'
      };
    } catch (error) {
      console.error('❌ Error submitting adoption:', error);
      return {
        success: false,
        error: error.message || 'Failed to submit adoption application'
      };
    }
  },

  getUserAdoptions: async (userId) => {
    try {
      const adoptionsRef = collection(db, 'adoptions');
      const q = query(adoptionsRef, where('userId', '==', userId));
      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    } catch (error) {
      console.error('Error fetching adoptions:', error);
      return [];
    }
  },

  getApprovedAdoptionsCount: async (userId) => {
    try {
      const adoptionsRef = collection(db, 'adoptions');
      const q = query(
        adoptionsRef,
        where('userId', '==', userId),
        where('status', '==', 'approved')
      );
      const snapshot = await getDocs(q);
      return snapshot.size;
    } catch (error) {
      console.error('Error fetching approved adoptions:', error);
      return 0;
    }
  },

  getPendingAdoptionsCount: async (userId) => {
    try {
      const adoptionsRef = collection(db, 'adoptions');
      const q = query(
        adoptionsRef,
        where('userId', '==', userId),
        where('status', '==', 'pending')
      );
      const snapshot = await getDocs(q);
      return snapshot.size;
    } catch (error) {
      console.error('Error fetching pending adoptions:', error);
      return 0;
    }
  },

  getAllAdoptionRequests: async () => {
    try {
      const adoptionsRef = collection(db, 'adoptions');
      const snapshot = await getDocs(adoptionsRef);
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      return {
        success: true,
        data: data
      };
    } catch (error) {
      console.error('Error fetching all adoption requests:', error);
      return {
        success: false,
        data: [],
        error: error.message
      };
    }
  },

  getPendingRequestsCount: async () => {
    try {
      const adoptionsRef = collection(db, 'adoptions');
      const q = query(adoptionsRef, where('status', '==', 'pending'));
      const snapshot = await getDocs(q);
      return { count: snapshot.size };
    } catch (error) {
      console.error('Error fetching pending requests count:', error);
      return { count: 0 };
    }
  },

  updateAdoptionStatus: async (adoptionId, newStatus, adminNotes = '') => {
    try {
      console.log('🔄 Updating adoption status:', { adoptionId, newStatus });

      const adoptionDocRef = doc(db, 'adoptions', adoptionId);
      const adoptionSnap = await getDoc(adoptionDocRef);
      
      if (!adoptionSnap.exists()) {
        throw new Error('Adoption request not found');
      }

      const adoptionData = adoptionSnap.data();
      const petId = adoptionData.petId;

      console.log('📋 Adoption data:', { petId, petName: adoptionData.petName });

      // Update adoption document
      await updateDoc(adoptionDocRef, {
        status: newStatus,
        updatedAt: Timestamp.fromDate(new Date()),
        adminNotes: adminNotes,
        reviewedAt: Timestamp.fromDate(new Date())
      });

      console.log('✅ Adoption status updated to:', newStatus);

      // Send SMS to adopter
      try {
        const adopterPhone = adoptionData.phoneNumber;
        
        if (adopterPhone) {
          console.log(`📱 Sending ${newStatus} notification via backend...`);
          
          const endpoint = newStatus === 'approved' 
            ? '/api/sms/approval-notification' 
            : '/api/sms/rejection-notification';
          
          const response = await fetch(`${API_URL}${endpoint}`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(
              newStatus === 'approved' 
                ? {
                    adopterPhone: adopterPhone,
                    petName: adoptionData.petName,
                    ownerName: 'TAARA Pet Adoption',
                    ownerContact: adoptionData.ownerPhone || 'N/A'
                  }
                : {
                    adopterPhone: adopterPhone,
                    petName: adoptionData.petName,
                    reason: adminNotes || 'Please contact us for more information'
                  }
            )
          });
          
          const result = await response.json();
          
          if (result.success) {
            console.log('✅ SMS sent to adopter successfully');
          } else {
            console.warn('⚠️ SMS to adopter failed:', result.message);
          }
        }
      } catch (smsError) {
        console.error('⚠️ SMS notification error (non-critical):', smsError.message);
      }
  
      // Update pet status based on adoption status
      if (newStatus === 'approved' && petId) {
        try {
          const petDocRef = doc(db, 'pets', petId);
          await updateDoc(petDocRef, {
            status: 'adopted',
            adoptedAt: Timestamp.fromDate(new Date()),
            updatedAt: Timestamp.fromDate(new Date())
          });
          console.log('✅ Pet status updated to ADOPTED for petId:', petId);
        } catch (petError) {
          console.error('⚠️ Error updating pet status to adopted:', petError);
        }
      }

      if (newStatus === 'rejected' && petId) {
        try {
          const petDocRef = doc(db, 'pets', petId);
          await updateDoc(petDocRef, {
            status: 'available',
            updatedAt: Timestamp.fromDate(new Date())
          });
          console.log('✅ Pet status updated to AVAILABLE for petId:', petId);
        } catch (petError) {
          console.error('⚠️ Error updating pet status to available:', petError);
        }
      }
      
      return {
        success: true,
        message: 'Adoption status updated successfully'
      };
    } catch (error) {
      console.error('❌ Error updating adoption status:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }
};

export default adoptionService;