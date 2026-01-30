import { collection, addDoc, Timestamp, query, where, getDocs, updateDoc, doc, getDoc, orderBy } from 'firebase/firestore';
import { db } from '../config/firebaseConfig';

const API_URL = process.env.REACT_APP_API_URL || 'https://taara-backend.vercel.app';

const createNotification = async (notificationData) => {
  try {
    await addDoc(collection(db, 'notifications'), {
      ...notificationData,
      read: false,
      createdAt: Timestamp.fromDate(new Date())
    });
    console.log('✅ Notification created successfully');
    return { success: true };
  } catch (error) {
    console.error('❌ Error creating notification:', error);
    return { success: false, error: error.message };
  }
};

const adoptionService = {
  submitAdoption: async (adoptionData) => {
    try {
      console.log('📝 Submitting adoption to Firestore:', adoptionData);
      
      const petDocRef = doc(db, 'pets', adoptionData.petId);
      const petSnap = await getDoc(petDocRef);
      
      if (!petSnap.exists()) {
        throw new Error('Pet not found');
      }
      
      const petData = petSnap.data();
      const ownerId = petData.ownerId || null;
      
      let ownerPhone = petData.ownerPhone || null;
      
      if (!ownerPhone && ownerId) {
        console.log('📞 Fetching owner phone from users collection...');
        const userDocRef = doc(db, 'users', ownerId);
        const userSnap = await getDoc(userDocRef);
        
        if (userSnap.exists()) {
          const userData = userSnap.data();
          ownerPhone = userData.phoneNumber || null;
          console.log('✅ Found owner phone:', ownerPhone);
        } else {
          console.warn('⚠️ Owner user document not found');
        }
      }
  
      const adoptionsRef = collection(db, 'adoptions');
      
      const firestoreData = {
        userId: adoptionData.userId,
        userEmail: adoptionData.userEmail,
        fullName: adoptionData.fullName,
        phoneNumber: adoptionData.phoneNumber || '',
        
        petId: adoptionData.petId,
        petName: adoptionData.petName,
        petBreed: adoptionData.petBreed || '',
        petAge: adoptionData.petAge || '',
        
        ...(ownerId && { ownerId: ownerId }),
        ...(ownerPhone && { ownerPhone: ownerPhone }),
            
        validIdUrl: adoptionData.validIdUrl,
        validIdFileName: adoptionData.validIdFileName || 'id-image.jpg',

        proofOfResidenceUrl: adoptionData.proofOfResidenceUrl,
        proofOfResidenceFileName: adoptionData.proofOfResidenceFileName || 'proof-of-residence.jpg',
        
        reason: adoptionData.reason,
        
        hasCurrentPets: adoptionData.hasCurrentPets,
        currentPetsDetails: adoptionData.currentPetsDetails || '',
        arePetsVaccinated: adoptionData.arePetsVaccinated || '',
        hasAdoptedBefore: adoptionData.hasAdoptedBefore,
        previousPetsHistory: adoptionData.previousPetsHistory || '',
        homeInspectionConsent: adoptionData.homeInspectionConsent,
        
        status: 'pending',
        createdAt: Timestamp.fromDate(new Date()),
        updatedAt: Timestamp.fromDate(new Date())
      };
      
      console.log('💾 Saving to Firestore:', firestoreData);
      
      const docRef = await addDoc(adoptionsRef, firestoreData);
      
      console.log('✅ Adoption submitted successfully with ID:', docRef.id);
  
      try {
        await updateDoc(petDocRef, {
          status: 'pending',
          updatedAt: Timestamp.fromDate(new Date())
        });
        console.log('✅ Pet status updated to PENDING');
      } catch (petError) {
        console.error('⚠️ Error updating pet status to pending:', petError);
      }
      
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
      const q = query(
        adoptionsRef, 
        where('userId', '==', userId),
        orderBy('createdAt', 'desc') 
      );
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
      const q = query(
        adoptionsRef,
        orderBy('createdAt', 'desc') 
      );
      const snapshot = await getDocs(q);
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

      await updateDoc(adoptionDocRef, {
        status: newStatus,
        updatedAt: Timestamp.fromDate(new Date()),
        adminNotes: adminNotes,
        reviewedAt: Timestamp.fromDate(new Date())
      });

      console.log('✅ Adoption status updated to:', newStatus);

      if (newStatus === 'approved') {
        await createNotification({
          userId: adoptionData.userId,
          type: 'adoption_approved',
          title: '✅ Verified – For Home Visit',
          message: `Your adoption application for ${adoptionData.petName} has successfully passed the verification stage. It is now approved for a pre-adoption home inspection. Further details will be communicated shortly.`,
          data: {
            adoptionId: adoptionId,
            petId: adoptionData.petId,
            petName: adoptionData.petName,
            status: 'approved_for_home_visit'
          }
        });
        console.log('✅ Approval notification created for user');
      } else if (newStatus === 'rejected') {
        await createNotification({
          userId: adoptionData.userId,
          type: 'adoption_rejected',
          title: '❌ Adoption Application Update',
          message: `We regret to inform you that your adoption application for ${adoptionData.petName} has been declined. ${adminNotes ? 'Reason: ' + adminNotes : 'Please contact us for more information.'}`,
          data: {
            adoptionId: adoptionId,
            petId: adoptionData.petId,
            petName: adoptionData.petName,
            status: 'rejected',
            reason: adminNotes || ''
          }
        });
        console.log('✅ Rejection notification created for user');
      }

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