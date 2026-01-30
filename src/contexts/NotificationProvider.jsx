import React, { createContext, useContext, useState, useEffect } from 'react';
import { auth } from '../config/firebaseConfig';
import notificationService from '../services/notificationService';

const NotificationContext = createContext();

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotifications must be used within NotificationProvider');
  }
  return context;
};

export const NotificationProvider = ({ children }) => {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);

 
  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(user => {
      console.log('👤 [NotificationProvider] Auth state changed:', user?.uid || 'No user');
      setCurrentUser(user);
      if (!user) {
        setNotifications([]);
        setUnreadCount(0);
      }
    });
    return () => unsubscribe();
  }, []);


  useEffect(() => {
    if (!currentUser) {
      setLoading(false);
      return;
    }

    console.log('🔔 [NotificationProvider] Setting up SINGLE notification listener for:', currentUser.uid);

  
    const unsubscribeNotifications = notificationService.subscribeToNotifications(
      currentUser.uid,
      (newNotifications) => {
        console.log('📬 [NotificationProvider] Received notifications:', newNotifications.length);
        setNotifications(newNotifications);
        setLoading(false);
      }
    );

 
    const unsubscribeUnreadCount = notificationService.subscribeToUnreadCount(
      currentUser.uid,
      (count) => {
        console.log('📊 [NotificationProvider] Unread count:', count);
        setUnreadCount(count);
      }
    );

    return () => {
      console.log('🧹 [NotificationProvider] Cleaning up notification listeners');
      unsubscribeNotifications();
      unsubscribeUnreadCount();
    };
  }, [currentUser]);

  const markAsRead = async (notificationId) => {
    const result = await notificationService.markAsRead(notificationId);
    if (result.success) {
      console.log('✅ [NotificationProvider] Notification marked as read');
    }
    return result;
  };

  const markAllAsRead = async () => {
    if (!currentUser) return;
    const result = await notificationService.markAllAsRead(currentUser.uid);
    if (result.success) {
      console.log('✅ [NotificationProvider] All notifications marked as read');
    }
    return result;
  };

  const clearAll = async () => {
    if (!currentUser) return;
    const result = await notificationService.clearAllNotifications(currentUser.uid);
    if (result.success) {
      console.log('✅ [NotificationProvider] All notifications cleared');
    }
    return result;
  };

  const value = {
    notifications,
    unreadCount,
    loading,
    currentUser,
    markAsRead,
    markAllAsRead,
    clearAll
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
};