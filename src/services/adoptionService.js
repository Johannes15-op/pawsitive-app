import { collection, addDoc, Timestamp, query, where, getDocs, updateDoc, doc, getDoc } from 'firebase/firestore';
import { db } from '../config/firebaseConfig';


const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

const adoptionService = {
  submitAdoption: async (adoptionData) => {
    try {
      console.log('📝 Submitting adoption to Firestore:', adoptionData);
      
      const adoptionsRef = collection(db, 'adoptions');
      
      const docRef = await addDoc(adoptionsRef, {
      
        userId: adoptionData.userId,
        userEmail: adoptionData.userEmail,
        fullName: adoptionData.fullName,
        phoneNumber: adoptionData.phoneNumber,
        
      
        petId: adoptionData.petId,
        petName: adoptionData.petName,
        petBreed: adoptionData.petBreed,
        petAge: adoptionData.petAge,
        

        address: adoptionData.address,
        reason: adoptionData.reason,
        hasExperience: adoptionData.hasExperience,
        hasOtherPets: adoptionData.hasOtherPets,
        
     
        status: 'pending', 
        createdAt: Timestamp.fromDate(new Date()),
        updatedAt: Timestamp.fromDate(new Date())
      });
      
      console.log('✅ Adoption submitted successfully with ID:', docRef.id);
      
   
try {
  console.log('📱 Notifying backend to send SMS...');
  
  const response = await fetch(`${API_URL}/api/sms/adoption-notification`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      ownerPhone: '09936639774', 
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
    console.warn('⚠️ SMS notification failed:', result.error);
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

   
      await updateDoc(adoptionDocRef, {
        status: newStatus,
        updatedAt: Timestamp.fromDate(new Date()),
        adminNotes: adminNotes,
        reviewedAt: Timestamp.fromDate(new Date())
      });

      console.log('✅ Adoption status updated to:', newStatus);

      
      try {
        const adopterPhone = adoptionData.phoneNumber;
        
        if (adopterPhone) {
          console.log(`📱 Sending ${newStatus} notification via backend...`);
          
          const endpoint = newStatus === 'approved' 
            ? '/api/sms/adoption-approval' 
            : '/api/sms/adoption-rejection';
          
          const response = await fetch(`${API_URL}${endpoint}`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              phoneNumber: adopterPhone,
              petName: adoptionData.petName,
              organizationName: 'TAARA Pet Adoption',
              reason: adminNotes || 'Thank you for your interest'
            })
          });
          
          const result = await response.json();
          
          if (result.success) {
            console.log('✅ SMS sent to adopter successfully');
          } else {
            console.warn('⚠️ SMS to adopter failed:', result.error);
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