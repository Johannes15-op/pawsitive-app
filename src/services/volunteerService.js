import { collection, addDoc, Timestamp, query, where, getDocs, updateDoc, doc } from 'firebase/firestore';
import { db, auth } from '../config/firebaseConfig';

const volunteerService = {
  
  submitApplication: async (formData) => {
    try {
      const currentUser = auth.currentUser;
      
      if (!currentUser) {
        throw new Error('User must be logged in to submit volunteer application');
      }

      console.log('📝 Submitting volunteer application to Firestore:', formData);
      
      const volunteerRef = collection(db, 'volunteerRequests');
      
      const docRef = await addDoc(volunteerRef, {
       
        userId: currentUser.uid,
        userEmail: currentUser.email || formData.email,
        userName: `${formData.firstName} ${formData.lastName}`,
        firstName: formData.firstName,
        lastName: formData.lastName,
        

        email: formData.email,
        phone: formData.phone,
        dateOfBirth: formData.dateOfBirth || null,
        
       
        motivation: formData.motivation,
        volunteerType: formData.volunteerType || 'General', 
        
        
        status: 'pending', 
        createdAt: Timestamp.fromDate(new Date()),
        updatedAt: Timestamp.fromDate(new Date()),
        
       
        totalHoursCompleted: 0,
        isVerified: false
      });
      
      console.log('✅ Volunteer application submitted successfully with ID:', docRef.id);
      
      return {
        success: true,
        volunteerId: docRef.id,
        message: 'Volunteer application submitted successfully'
      };
    } catch (error) {
      console.error('❌ Error submitting volunteer application:', error);
      return {
        success: false,
        error: error.message || 'Failed to submit volunteer application'
      };
    }
  },

  
  getUserVolunteerRequests: async (userId) => {
    try {
      const volunteerRef = collection(db, 'volunteerRequests');
      const q = query(volunteerRef, where('userId', '==', userId));
      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    } catch (error) {
      console.error('Error fetching volunteer requests:', error);
      return [];
    }
  },


  getPendingVolunteerCount: async (userId) => {
    try {
      const volunteerRef = collection(db, 'volunteerRequests');
      const q = query(
        volunteerRef,
        where('userId', '==', userId),
        where('status', '==', 'pending')
      );
      const snapshot = await getDocs(q);
      return snapshot.size;
    } catch (error) {
      console.error('Error fetching pending volunteer requests:', error);
      return 0;
    }
  },

 
  getApprovedVolunteerCount: async (userId) => {
    try {
      const volunteerRef = collection(db, 'volunteerRequests');
      const q = query(
        volunteerRef,
        where('userId', '==', userId),
        where('status', '==', 'approved')
      );
      const snapshot = await getDocs(q);
      return snapshot.size;
    } catch (error) {
      console.error('Error fetching approved volunteer requests:', error);
      return 0;
    }
  },


  updateVolunteerStatus: async (volunteerId, newStatus, adminNotes = '') => {
    try {
      const volunteerDoc = doc(db, 'volunteerRequests', volunteerId);
      
      await updateDoc(volunteerDoc, {
        status: newStatus,
        updatedAt: Timestamp.fromDate(new Date()),
        adminNotes: adminNotes,
        reviewedAt: Timestamp.fromDate(new Date())
      });

      console.log('✅ Volunteer status updated to:', newStatus);
      
      return {
        success: true,
        message: 'Volunteer status updated successfully'
      };
    } catch (error) {
      console.error('❌ Error updating volunteer status:', error);
      return {
        success: false,
        error: error.message
      };
    }
  },

 
  getAllApplications: async () => {
    try {
      const volunteerRef = collection(db, 'volunteerRequests');
      const snapshot = await getDocs(volunteerRef);
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      return {
        success: true,
        data: data
      };
    } catch (error) {
      console.error('Error fetching all volunteer applications:', error);
      return {
        success: false,
        data: [],
        error: error.message
      };
    }
  },

 
  updateStatus: async (volunteerId, newStatus, adminNotes = '') => {
    try {
      const volunteerDoc = doc(db, 'volunteerRequests', volunteerId);
      
      await updateDoc(volunteerDoc, {
        status: newStatus,
        updatedAt: Timestamp.fromDate(new Date()),
        adminNotes: adminNotes,
        reviewedAt: Timestamp.fromDate(new Date())
      });

      console.log('✅ Volunteer status updated to:', newStatus);
      
      return {
        success: true,
        message: `Application ${newStatus} successfully`
      };
    } catch (error) {
      console.error('❌ Error updating volunteer status:', error);
      return {
        success: false,
        error: error.message
      };
    }
  },

 
  getPendingCount: async () => {
    try {
      const volunteerRef = collection(db, 'volunteerRequests');
      const q = query(volunteerRef, where('status', '==', 'pending'));
      const snapshot = await getDocs(q);
      return { count: snapshot.size };
    } catch (error) {
      console.error('Error fetching pending volunteer count:', error);
      return { count: 0 };
    }
  }
};

export default volunteerService;