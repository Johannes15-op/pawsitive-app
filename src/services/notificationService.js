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


const activeListeners = new Map();

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
        deleted: false,
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
        where('deleted', '==', false),
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
      if (!userId) {
        console.error('❌ subscribeToNotifications: userId is required');
        return () => {};
      }

      const listenerKey = `notifications_${userId}`;
      

      if (activeListeners.has(listenerKey)) {
        console.warn('⚠️ Listener already exists for user:', userId, '- Reusing existing listener');
        return activeListeners.get(listenerKey);
      }

      const notificationsRef = collection(db, 'notifications');
      const q = query(
        notificationsRef,
        where('userId', '==', userId),
        where('deleted', '==', false), 
        orderBy('createdAt', 'desc')
      );
      
      console.log('🔔 Setting up SINGLE notification listener for user:', userId);

      const unsubscribe = onSnapshot(q, 
        (snapshot) => {
          const notifications = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data(),
            createdAt: doc.data().createdAt?.toDate?.() || new Date()
          }));
        
          console.log('📬 Real-time notifications update:', notifications.length);
          callback(notifications);
        }, 
        (error) => {
          console.error('❌ Error in notification listener:', error);
          callback([]);
        }
      );

      const wrappedUnsubscribe = () => {
        unsubscribe();
        activeListeners.delete(listenerKey);
        console.log('🧹 Cleaned up notification listener for user:', userId);
      };

     
      activeListeners.set(listenerKey, wrappedUnsubscribe);
      
      return wrappedUnsubscribe;
    } catch (error) {
      console.error('❌ Error setting up notification listener:', error);
      return () => {};
    }
  },

  getUnreadCount: async (userId) => {
    try {
      if (!userId) {
        return { success: true, count: 0 };
      }

      const notificationsRef = collection(db, 'notifications');
      const q = query(
        notificationsRef,
        where('userId', '==', userId),
        where('read', '==', false),
        where('deleted', '==', false)
      );
      
      const snapshot = await getDocs(q);
      
      return {
        success: true,
        count: snapshot.size
      };
    } catch (error) {
      console.error('❌ Error fetching unread count:', error);
      return {
        success: true,
        count: 0
      };
    }
  },

 
  subscribeToUnreadCount: (userId, callback) => {
    try {
      if (!userId) {
        console.error('❌ subscribeToUnreadCount: userId is required');
        return () => {};
      }

      const listenerKey = `unread_${userId}`;
      
  
      if (activeListeners.has(listenerKey)) {
        console.warn('⚠️ Unread listener already exists for user:', userId, '- Reusing existing listener');
        return activeListeners.get(listenerKey);
      }

      const notificationsRef = collection(db, 'notifications');
      const q = query(
        notificationsRef,
        where('userId', '==', userId),
        where('read', '==', false),
        where('deleted', '==', false)
      );
      
      console.log('🔔 Setting up SINGLE unread count listener for user:', userId);
      
      const unsubscribe = onSnapshot(q, 
        (snapshot) => {
          const count = snapshot.size;
          console.log('📊 Unread count updated:', count);
          callback(count);
        }, 
        (error) => {
          console.error('❌ Error in unread count listener:', error);
          callback(0);
        }
      );

      const wrappedUnsubscribe = () => {
        unsubscribe();
        activeListeners.delete(listenerKey);
        console.log('🧹 Cleaned up unread count listener for user:', userId);
      };

    
      activeListeners.set(listenerKey, wrappedUnsubscribe);
      
      return wrappedUnsubscribe;
    } catch (error) {
      console.error('❌ Error setting up unread count listener:', error);
      return () => {};
    }
  },

  markAsRead: async (notificationId) => {
    try {
      if (!notificationId) {
        throw new Error('Notification ID is required');
      }

      const notificationDoc = doc(db, 'notifications', notificationId);
      await updateDoc(notificationDoc, {
        read: true,
        readAt: Timestamp.fromDate(new Date())
      });
      
      console.log('✅ Notification marked as read:', notificationId);
      
      return {
        success: true
      };
    } catch (error) {
      console.error('❌ Error marking notification as read:', error);
      return {
        success: false,
        error: error.message
      };
    }
  },

  markAllAsRead: async (userId) => {
    try {
      if (!userId) {
        throw new Error('User ID is required');
      }

      const notificationsRef = collection(db, 'notifications');
      const q = query(
        notificationsRef,
        where('userId', '==', userId),
        where('read', '==', false),
        where('deleted', '==', false) 
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
      
      console.log('✅ All notifications marked as read for user:', userId, `(${updatePromises.length} notifications)`);
      
      return {
        success: true,
        count: updatePromises.length
      };
    } catch (error) {
      console.error('❌ Error marking all as read:', error);
      return {
        success: false,
        error: error.message
      };
    }
  },

 
  clearAllNotifications: async (userId) => {
    try {
      if (!userId) {
        throw new Error('User ID is required');
      }

      const notificationsRef = collection(db, 'notifications');
      const q = query(
        notificationsRef,
        where('userId', '==', userId),
        where('deleted', '==', false) 
      );
      
      const snapshot = await getDocs(q);
      

      const deletePromises = snapshot.docs.map(docSnapshot => {
        const notificationDoc = doc(db, 'notifications', docSnapshot.id);
        return updateDoc(notificationDoc, {
          deleted: true,
          deletedAt: Timestamp.fromDate(new Date())
        });
      });
      
      await Promise.all(deletePromises);
      
      console.log('✅ All notifications cleared for user:', userId, `(${deletePromises.length} notifications)`);
      
      return {
        success: true,
        message: 'All notifications cleared successfully',
        count: deletePromises.length
      };
    } catch (error) {
      console.error('❌ Error clearing notifications:', error);
      return {
        success: false,
        error: error.message
      };
    }
  },


  cleanupAllListeners: () => {
    console.log('🧹 Cleaning up all active listeners:', activeListeners.size);
    activeListeners.forEach((unsubscribe, key) => {
      console.log('  - Cleaning up:', key);
      unsubscribe();
    });
    activeListeners.clear();
  }
};

export default notificationService;