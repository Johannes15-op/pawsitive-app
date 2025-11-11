import { 
  collection, 
  addDoc, 
  getDocs, 
  query, 
  where, 
  doc, 
  updateDoc, 
  Timestamp, 
  orderBy,
  onSnapshot
} from 'firebase/firestore';
import { db } from '../config/firebaseConfig';

const notificationService = {
 
  createNotification: async (notificationData) => {
    try {
      console.log('📢 Creating notification for user:', notificationData.userId);
      
      const notificationsRef = collection(db, 'notifications');
      
      const docRef = await addDoc(notificationsRef, {
        userId: notificationData.userId,
        type: notificationData.type,
        title: notificationData.title,
        message: notificationData.message,
        read: false,
        createdAt: Timestamp.fromDate(new Date()),
        relatedId: notificationData.relatedId || null,
        metadata: notificationData.metadata || {}
      });
      
      console.log('✅ Notification created successfully:', docRef.id);
      
      return {
        success: true,
        notificationId: docRef.id
      };
    } catch (error) {
      console.error('❌ Error creating notification:', error);
      return {
        success: false,
        error: error.message
      };
    }
  },

  getUserNotifications: async (userId) => {
    try {
      const notificationsRef = collection(db, 'notifications');
      const q = query(
        notificationsRef,
        where('userId', '==', userId),
        orderBy('createdAt', 'desc')
      );
      
      const snapshot = await getDocs(q);
      const notifications = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate?.() || new Date()
      }));
      
      console.log('📬 Fetched notifications:', notifications.length);
      
      return {
        success: true,
        data: notifications
      };
    } catch (error) {
      console.error('Error fetching notifications:', error);
      return {
        success: false,
        data: [],
        error: error.message
      };
    }
  },


  subscribeToNotifications: (userId, callback) => {
    try {
      const notificationsRef = collection(db, 'notifications');
      const q = query(
        notificationsRef,
        where('userId', '==', userId),
        orderBy('createdAt', 'desc')
      );
      
      console.log('🔔 Setting up real-time listener for user:', userId);
      
     
      const unsubscribe = onSnapshot(q, (snapshot) => {
        const notifications = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
          createdAt: doc.data().createdAt?.toDate?.() || new Date()
        }));
        
        console.log('📬 Real-time notifications update:', notifications.length);
        callback(notifications);
      }, (error) => {
        console.error('Error in notification listener:', error);
      });
      
      return unsubscribe;
    } catch (error) {
      console.error('Error setting up notification listener:', error);
      return () => {};
    }
  },

 
  getUnreadCount: async (userId) => {
    try {
      const notificationsRef = collection(db, 'notifications');
      const q = query(
        notificationsRef,
        where('userId', '==', userId),
        where('read', '==', false)
      );
      
      const snapshot = await getDocs(q);
      
      return {
        success: true,
        count: snapshot.size
      };
    } catch (error) {
      console.error('Error fetching unread count:', error);
      return {
        success: true,
        count: 0
      };
    }
  },

 
  subscribeToUnreadCount: (userId, callback) => {
    try {
      const notificationsRef = collection(db, 'notifications');
      const q = query(
        notificationsRef,
        where('userId', '==', userId),
        where('read', '==', false)
      );
      
      console.log('🔔 Setting up unread count listener for user:', userId);
      
      const unsubscribe = onSnapshot(q, (snapshot) => {
        console.log('📊 Unread count updated:', snapshot.size);
        callback(snapshot.size);
      }, (error) => {
        console.error('Error in unread count listener:', error);
      });
      
      return unsubscribe;
    } catch (error) {
      console.error('Error setting up unread count listener:', error);
      return () => {};
    }
  },

  
  markAsRead: async (notificationId) => {
    try {
      const notificationDoc = doc(db, 'notifications', notificationId);
      await updateDoc(notificationDoc, {
        read: true,
        readAt: Timestamp.fromDate(new Date())
      });
      
      return {
        success: true
      };
    } catch (error) {
      console.error('Error marking notification as read:', error);
      return {
        success: false,
        error: error.message
      };
    }
  },


  markAllAsRead: async (userId) => {
    try {
      const notificationsRef = collection(db, 'notifications');
      const q = query(
        notificationsRef,
        where('userId', '==', userId),
        where('read', '==', false)
      );
      
      const snapshot = await getDocs(q);
      
      const updatePromises = snapshot.docs.map(docSnapshot => {
        const notificationDoc = doc(db, 'notifications', docSnapshot.id);
        return updateDoc(notificationDoc, {
          read: true,
          readAt: Timestamp.fromDate(new Date())
        });
      });
      
      await Promise.all(updatePromises);
      
      return {
        success: true
      };
    } catch (error) {
      console.error('Error marking all as read:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }
};

export default notificationService;