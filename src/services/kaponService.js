import { collection, addDoc, getDocs, query, where, doc, updateDoc, deleteDoc, Timestamp, getDoc, increment } from 'firebase/firestore';
import { db } from '../config/firebaseConfig';
import notificationService from './notificationService';

const kaponService = {

  createSchedule: async (scheduleData) => {
    try {
      console.log('📅 Creating Kapon schedule:', scheduleData);
      
      const schedulesRef = collection(db, 'kapon_schedules'); 
      
      const docRef = await addDoc(schedulesRef, {
        title: scheduleData.title,
        date: Timestamp.fromDate(new Date(scheduleData.date)),
        startTime: scheduleData.startTime || scheduleData.time,
        endTime: scheduleData.endTime || '',
        time: scheduleData.time,
        location: scheduleData.location,
        description: scheduleData.description || '',
        capacity: scheduleData.capacity || 50,
        requirements: scheduleData.requirements || '',
        status: 'active',
        createdAt: Timestamp.fromDate(new Date()),
        updatedAt: Timestamp.fromDate(new Date()),
        registeredCount: 0
      });
      
      console.log('✅ Kapon schedule created successfully with ID:', docRef.id);
      
      return {
        success: true,
        scheduleId: docRef.id,
        message: 'Kapon schedule created successfully'
      };
    } catch (error) {
      console.error('❌ Error creating Kapon schedule:', error);
      return {
        success: false,
        error: error.message || 'Failed to create Kapon schedule'
      };
    }
  },

 
  getAllSchedules: async () => {
    try {
      const schedulesRef = collection(db, 'kapon_schedules'); 
      const snapshot = await getDocs(schedulesRef);
      const data = snapshot.docs.map(doc => {
        const docData = doc.data();
        return {
          id: doc.id,
          ...docData,
          date: docData.date?.toDate?.() || new Date(docData.date),
          startTime: docData.startTime || docData.time,
          endTime: docData.endTime || '',
          registeredCount: docData.registeredCount || 0,
          capacity: docData.capacity || 50
        };
      });
      return {
        success: true,
        data: data
      };
    } catch (error) {
      console.error('Error fetching Kapon schedules:', error);
      return {
        success: false,
        data: [],
        error: error.message
      };
    }
  },

 
  getActiveSchedules: async () => {
    try {
      const schedulesRef = collection(db, 'kapon_schedules'); 
      const q = query(schedulesRef, where('status', '==', 'active'));
      const snapshot = await getDocs(q);
      const data = snapshot.docs.map(doc => {
        const docData = doc.data();
        return {
          id: doc.id,
          ...docData,
          date: docData.date?.toDate?.() || new Date(docData.date),
          startTime: docData.startTime || docData.time,
          endTime: docData.endTime || '',
          registeredCount: docData.registeredCount || 0,
          capacity: docData.capacity || 50
        };
      });
      return {
        success: true,
        data: data
      };
    } catch (error) {
      console.error('Error fetching active Kapon schedules:', error);
      return {
        success: false,
        data: [],
        error: error.message
      };
    }
  },

  getActiveKapons: async () => {
    return kaponService.getActiveSchedules();
  },

  
  getPendingSchedulesCount: async () => {
    try {
      const requestsRef = collection(db, 'kapon_requests');
      const q = query(requestsRef, where('status', '==', 'pending'));
      const snapshot = await getDocs(q);
      return { count: snapshot.size };
    } catch (error) {
      console.error('Error fetching pending schedules count:', error);
      return { count: 0 };
    }
  },

  
  createKaponRequest: async (requestData) => {
    try {
      console.log('📝 Creating Kapon request:', requestData);
      
      const requestsRef = collection(db, 'kapon_requests'); 
      
      const docRef = await addDoc(requestsRef, {
        scheduleId: requestData.scheduleId,
        userId: requestData.userId,
        userEmail: requestData.userEmail,
        ownerName: requestData.ownerName,
        contactNumber: requestData.contactNumber,
        petName: requestData.petName,
        petType: requestData.petType,
        gender: requestData.gender,
        breed: requestData.breed,
        age: requestData.age,
        notes: requestData.notes || '',
        status: 'pending',
        createdAt: Timestamp.fromDate(new Date()),
        updatedAt: Timestamp.fromDate(new Date())
      });
      
      
      if (requestData.scheduleId) {
        try {
          const scheduleDoc = doc(db, 'kapon_schedules', requestData.scheduleId);
          await updateDoc(scheduleDoc, {
            registeredCount: increment(1),
            updatedAt: Timestamp.fromDate(new Date())
          });
          console.log('✅ Schedule registered count updated');
        } catch (updateError) {
          console.warn('⚠️ Could not update schedule count (non-critical):', updateError.message);
        }
      }
      
      console.log('✅ Kapon request created successfully with ID:', docRef.id);
      
      return {
        success: true,
        requestId: docRef.id,
        message: 'Kapon request submitted successfully'
      };
    } catch (error) {
      console.error('❌ Error creating Kapon request:', error);
      return {
        success: false,
        error: error.message || 'Failed to create Kapon request'
      };
    }
  },

 
  getAllKaponRequests: async () => {
    try {
      const requestsRef = collection(db, 'kapon_requests');
      const snapshot = await getDocs(requestsRef);
      return {
        success: true,
        data: snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))
      };
    } catch (error) {
      console.error('Error fetching all kapon requests:', error);
      return {
        success: false,
        data: [],
        error: error.message
      };
    }
  },

  
  getUserKaponRequests: async (userId) => {
    try {
      const requestsRef = collection(db, 'kapon_requests'); 
      const q = query(requestsRef, where('userId', '==', userId));
      const snapshot = await getDocs(q);
      return {
        success: true,
        data: snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))
      };
    } catch (error) {
      console.error('Error fetching user kapon requests:', error);
      return {
        success: false,
        data: [],
        error: error.message
      };
    }
  },

 
  getScheduleRegistrations: async (scheduleId) => {
    try {
      const requestsRef = collection(db, 'kapon_requests'); 
      const q = query(requestsRef, where('scheduleId', '==', scheduleId));
      const snapshot = await getDocs(q);
      return {
        success: true,
        data: snapshot.docs.map(doc => {
          const docData = doc.data();
          return {
            id: doc.id,
            ...docData,
            createdAt: docData.createdAt?.toDate?.() || new Date(docData.createdAt)
          };
        })
      };
    } catch (error) {
      console.error('Error fetching schedule registrations:', error);
      return {
        success: false,
        data: [],
        error: error.message
      };
    }
  },

  
  updateScheduleStatus: async (scheduleId, newStatus, notes = '') => {
    try {
      const scheduleDoc = doc(db, 'kapon_schedules', scheduleId); 
      
      await updateDoc(scheduleDoc, {
        status: newStatus,
        updatedAt: Timestamp.fromDate(new Date()),
        adminNotes: notes,
        reviewedAt: Timestamp.fromDate(new Date())
      });

      return {
        success: true,
        message: `Schedule ${newStatus} successfully`
      };
    } catch (error) {
      console.error('Error updating schedule status:', error);
      return {
        success: false,
        error: error.message
      };
    }
  },

 
  updateRequestStatus: async (requestId, newStatus, notes = '') => {
    try {
      const requestDoc = doc(db, 'kapon_requests', requestId);
      
     
      const requestSnapshot = await getDoc(requestDoc);
      if (!requestSnapshot.exists()) {
        return {
          success: false,
          error: 'Request not found'
        };
      }
      
      const requestData = requestSnapshot.data();
      
    
      await updateDoc(requestDoc, {
        status: newStatus,
        updatedAt: Timestamp.fromDate(new Date()),
        adminNotes: notes,
        reviewedAt: Timestamp.fromDate(new Date())
      });

     
      if (requestData.userId) {
        let notificationTitle = '';
        let notificationMessage = '';
        let notificationType = '';

        if (newStatus === 'approved') {
          notificationTitle = '✅ Kapon Request Approved';
          notificationMessage = `Your Kapon request for ${requestData.petName} has been approved!`;
          notificationType = 'kapon_approved';
        } else if (newStatus === 'rejected') {
          notificationTitle = '❌ Kapon Request Rejected';
          notificationMessage = `Your Kapon request for ${requestData.petName} has been rejected. ${notes ? 'Reason: ' + notes : ''}`;
          notificationType = 'kapon_rejected';
        } else if (newStatus === 'completed') {
          notificationTitle = '🎉 Kapon Completed';
          notificationMessage = `The Kapon procedure for ${requestData.petName} has been completed successfully!`;
          notificationType = 'kapon_completed';
        }

        if (notificationTitle) {
          await notificationService.createNotification({
            userId: requestData.userId,
            type: notificationType,
            title: notificationTitle,
            message: notificationMessage,
            relatedId: requestId,
            metadata: {
              petName: requestData.petName,
              scheduleId: requestData.scheduleId,
              adminNotes: notes
            }
          });
        }
      }

      return {
        success: true,
        message: `Request ${newStatus} successfully`
      };
    } catch (error) {
      console.error('Error updating request status:', error);
      return {
        success: false,
        error: error.message
      };
    }
  },

  
  deleteSchedule: async (scheduleId) => {
    try {
      await deleteDoc(doc(db, 'kapon_schedules', scheduleId)); 
      
      return {
        success: true,
        message: 'Schedule deleted successfully'
      };
    } catch (error) {
      console.error('Error deleting schedule:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }
};

export default kaponService;