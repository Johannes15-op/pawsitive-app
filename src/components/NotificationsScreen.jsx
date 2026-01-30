import React, { useState } from 'react';
import { Bell, Check, CheckCheck, Trash2 } from 'lucide-react';
import Header from './Header';
import BottomNav from './BottomNav';
import { useNotifications } from '../contexts/NotificationContext';

const NotificationsScreen = ({ currentScreen, setCurrentScreen, setShowSidebar }) => {
  const [filter, setFilter] = useState('all');
  

  const { 
    notifications, 
    unreadCount, 
    loading,
    markAsRead, 
    markAllAsRead, 
    clearAll,
    currentUser 
  } = useNotifications();


  const handleMarkAsRead = async (notificationId) => {
    try {
      await markAsRead(notificationId);
      console.log('✅ [NotificationsScreen] Notification marked as read');
    } catch (err) {
      console.error('❌ [NotificationsScreen] Error marking as read:', err);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await markAllAsRead();
      console.log('✅ [NotificationsScreen] All notifications marked as read');
    } catch (err) {
      console.error('❌ [NotificationsScreen] Error marking all as read:', err);
    }
  };

  const handleClearAll = async () => {
    if (!window.confirm('Are you sure you want to clear all notifications? This cannot be undone.')) {
      return;
    }

    try {
      await clearAll();
      console.log('✅ [NotificationsScreen] All notifications cleared');
    } catch (err) {
      console.error('❌ [NotificationsScreen] Error clearing notifications:', err);
      alert('Failed to clear notifications. Please try again.');
    }
  };

  const formatDate = (timestamp) => {
    if (!timestamp) return 'N/A';
    
    try {
      const date = timestamp instanceof Date ? timestamp : new Date(timestamp);
      const now = new Date();
      const diffMs = now - date;
      const diffMins = Math.floor(diffMs / 60000);
      const diffHours = Math.floor(diffMs / 3600000);
      const diffDays = Math.floor(diffMs / 86400000);
      
      if (diffMins < 1) return 'Just now';
      if (diffMins < 60) return `${diffMins} min ago`;
      if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
      if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
      
      return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined
      });
    } catch (error) {
      return 'N/A';
    }
  };

  const getNotificationIcon = (type) => {
    const icons = {
      volunteer: '🤝',
      adoption: '🐾',
      donation: '💝',
      general: '📢',
      alert: '⚠️',
      success: '✅',
      kapon_approved: '✅',
      kapon_rejected: '❌',
      kapon_completed: '🎉',
      adoption_approved: '✅',
      adoption_rejected: '❌'
    };
    return icons[type] || '📬';
  };

  const filteredNotifications = notifications.filter(notif => {
    if (filter === 'unread') {
      return !notif.read;
    }
    return true;
  });

  if (!currentUser) {
    return (
      <div className="bg-gray-50 min-h-screen pb-20">
        <Header 
          title="Notifications" 
          setCurrentScreen={setCurrentScreen}
          setShowSidebar={setShowSidebar}
        />
        <div className="p-4">
          <div className="bg-white rounded-lg shadow-sm p-8 text-center">
            <Bell size={48} className="mx-auto text-gray-400 mb-4" />
            <p className="text-gray-600">Please login to view notifications</p>
          </div>
        </div>
        <BottomNav currentScreen={currentScreen} setCurrentScreen={setCurrentScreen} />
      </div>
    );
  }

  return (
    <div className="bg-gray-50 min-h-screen pb-20">
      <Header 
        title="Notifications" 
        setCurrentScreen={setCurrentScreen}
        setShowSidebar={setShowSidebar}
      />
      
      <div className="p-4">
        {}
        <div className="bg-white rounded-xl shadow-sm p-4 mb-4">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Bell className="text-pink-500" size={24} />
              <h2 className="text-lg font-semibold text-gray-800">
                Notifications
                {unreadCount > 0 && (
                  <span className="ml-2 bg-pink-500 text-white text-xs px-2 py-1 rounded-full">
                    {unreadCount}
                  </span>
                )}
              </h2>
            </div>
            
            <div className="flex items-center gap-2">
              {unreadCount > 0 && (
                <button
                  onClick={handleMarkAllAsRead}
                  className="flex items-center gap-1 text-sm text-pink-600 hover:text-pink-700 font-medium"
                >
                  <CheckCheck size={16} />
                  <span className="hidden sm:inline">Mark all read</span>
                </button>
              )}
              {notifications.length > 0 && (
                <button
                  onClick={handleClearAll}
                  className="flex items-center gap-1 text-sm text-red-600 hover:text-red-700 font-medium"
                >
                  <Trash2 size={16} />
                  <span className="hidden sm:inline">Clear all</span>
                </button>
              )}
            </div>
          </div>
          
          {}
          <div className="flex gap-2">
            <button
              onClick={() => setFilter('all')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                filter === 'all'
                  ? 'bg-pink-500 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              All ({notifications.length})
            </button>
            <button
              onClick={() => setFilter('unread')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                filter === 'unread'
                  ? 'bg-pink-500 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Unread ({unreadCount})
            </button>
          </div>
        </div>

        {}
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-500"></div>
          </div>
        ) : filteredNotifications.length === 0 ? (
       
          <div className="bg-white rounded-xl shadow-sm p-8 text-center">
            <Bell size={48} className="mx-auto text-gray-300 mb-4" />
            <p className="text-gray-500 font-medium mb-1">No notifications</p>
            <p className="text-gray-400 text-sm">
              {filter === 'unread' ? "You're all caught up!" : "You don't have any notifications yet"}
            </p>
          </div>
        ) : (
         
          <div className="space-y-3">
            {filteredNotifications.map((notification) => (
              <div
                key={notification.id}
                onClick={() => !notification.read && handleMarkAsRead(notification.id)}
                className={`bg-white rounded-xl shadow-sm p-4 transition-all ${
                  !notification.read 
                    ? 'border-l-4 border-pink-500 hover:shadow-md cursor-pointer' 
                    : 'hover:shadow-md opacity-75'
                }`}
              >
                <div className="flex gap-3">
                  <div className="flex-shrink-0">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center text-xl ${
                      !notification.read ? 'bg-pink-100' : 'bg-gray-100'
                    }`}>
                      {getNotificationIcon(notification.type)}
                    </div>
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2 mb-1">
                      <h3 className={`font-semibold text-sm ${
                        !notification.read ? 'text-gray-900' : 'text-gray-700'
                      }`}>
                        {notification.title}
                      </h3>
                      {!notification.read && (
                        <div className="w-2 h-2 bg-pink-500 rounded-full flex-shrink-0 mt-1"></div>
                      )}
                    </div>
                    
                    <p className="text-sm text-gray-600 mb-2 leading-relaxed">
                      {notification.message}
                    </p>
                    
                    <div className="flex items-center justify-between">
                      <p className="text-xs text-gray-400">
                        {formatDate(notification.createdAt)}
                      </p>
                      
                      {!notification.read && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleMarkAsRead(notification.id);
                          }}
                          className="text-xs text-pink-600 hover:text-pink-700 font-medium flex items-center gap-1"
                        >
                          <Check size={12} />
                          <span className="hidden sm:inline">Mark read</span>
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      
      <BottomNav currentScreen={currentScreen} setCurrentScreen={setCurrentScreen} />
    </div>
  );
};

export default NotificationsScreen;