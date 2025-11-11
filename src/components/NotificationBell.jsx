import React, { useState, useEffect, useRef } from 'react';
import { Bell, CheckCheck } from 'lucide-react';
import notificationService from '../services/notificationService';
import { auth } from '../config/firebaseConfig';

const NotificationBell = () => {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isOpen, setIsOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const dropdownRef = useRef(null);
  const unsubscribeRef = useRef(null);
  const unsubscribeUnreadRef = useRef(null);

  
  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(user => {
      setCurrentUser(user);
    });
    return () => unsubscribe();
  }, []);

  
  useEffect(() => {
    if (!currentUser) return;

    console.log('🔔 Setting up notification listeners for user:', currentUser.uid);

    
    unsubscribeRef.current = notificationService.subscribeToNotifications(
      currentUser.uid,
      (notifications) => {
        setNotifications(notifications);
      }
    );

    
    unsubscribeUnreadRef.current = notificationService.subscribeToUnreadCount(
      currentUser.uid,
      (count) => {
        setUnreadCount(count);
      }
    );

    
    return () => {
      if (unsubscribeRef.current) unsubscribeRef.current();
      if (unsubscribeUnreadRef.current) unsubscribeUnreadRef.current();
    };
  }, [currentUser]);

  
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleNotificationClick = async (notification) => {
    if (!notification.read) {
      await notificationService.markAsRead(notification.id);
    }
  };

  const handleMarkAllAsRead = async () => {
    if (!currentUser) return;
    await notificationService.markAllAsRead(currentUser.uid);
  };

  const toggleDropdown = () => {
    setIsOpen(!isOpen);
  };

  const getNotificationIcon = (type) => {
    if (type === 'kapon_approved' || type === 'adoption_approved') {
      return '✅';
    } else if (type === 'kapon_rejected' || type === 'adoption_rejected') {
      return '❌';
    } else if (type === 'kapon_completed') {
      return '🎉';
    }
    return '🔔';
  };

  const formatTimeAgo = (date) => {
    if (!date) return 'Just now';
    
    const dateObj = date instanceof Date ? date : new Date(date);
    const seconds = Math.floor((new Date() - dateObj) / 1000);
    
    let interval = seconds / 31536000;
    if (interval > 1) return Math.floor(interval) + ' years ago';
    
    interval = seconds / 2592000;
    if (interval > 1) return Math.floor(interval) + ' months ago';
    
    interval = seconds / 86400;
    if (interval > 1) return Math.floor(interval) + ' days ago';
    
    interval = seconds / 3600;
    if (interval > 1) return Math.floor(interval) + ' hours ago';
    
    interval = seconds / 60;
    if (interval > 1) return Math.floor(interval) + ' minutes ago';
    
    return 'Just now';
  };

  if (!currentUser) {
    return null;
  }

  return (
    <div className="relative" ref={dropdownRef}>
      {}
      <button
        onClick={toggleDropdown}
        className="relative p-2 hover:bg-white/20 rounded-lg transition-colors"
      >
        <Bell size={24} className="text-white" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center animate-pulse">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-xl shadow-2xl z-50 max-h-[80vh] overflow-hidden flex flex-col">
          {}
          <div className="p-4 border-b border-gray-200 flex items-center justify-between bg-gradient-to-r from-pink-500 to-purple-500">
            <h3 className="font-bold text-white text-lg">Notifications</h3>
            {unreadCount > 0 && (
              <button
                onClick={handleMarkAllAsRead}
                className="text-xs text-white hover:text-gray-100 flex items-center gap-1 bg-white/20 px-2 py-1 rounded"
              >
                <CheckCheck size={14} />
                <span>Mark all read</span>
              </button>
            )}
          </div>

          {}
          <div className="overflow-y-auto flex-1">
            {notifications.length === 0 ? (
              <div className="p-8 text-center text-gray-500">
                <Bell size={48} className="mx-auto mb-3 text-gray-300" />
                <p>No notifications yet</p>
              </div>
            ) : (
              <div className="divide-y divide-gray-100">
                {notifications.map((notification) => (
                  <div
                    key={notification.id}
                    onClick={() => handleNotificationClick(notification)}
                    className={`p-4 hover:bg-gray-50 cursor-pointer transition-colors ${
                      !notification.read ? 'bg-blue-50' : ''
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div className="text-2xl flex-shrink-0">
                        {getNotificationIcon(notification.type)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2 mb-1">
                          <h4 className={`text-sm font-semibold ${
                            !notification.read ? 'text-gray-900' : 'text-gray-700'
                          }`}>
                            {notification.title}
                          </h4>
                          {!notification.read && (
                            <div className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0 mt-1"></div>
                          )}
                        </div>
                        <p className="text-sm text-gray-600 mb-2">
                          {notification.message}
                        </p>
                        <p className="text-xs text-gray-400">
                          {formatTimeAgo(notification.createdAt)}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {}
          {notifications.length > 0 && (
            <div className="p-3 border-t border-gray-200 bg-gray-50 text-center">
              <button
                onClick={() => setIsOpen(false)}
                className="text-sm text-pink-500 hover:text-pink-600 font-medium"
              >
                Close
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default NotificationBell;