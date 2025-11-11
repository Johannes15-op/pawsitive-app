import React, { useState } from 'react';
import { ArrowLeft, Bell, Send } from 'lucide-react';
import { addAnnouncement } from '../services/announcementService';
import notificationService from '../services/notificationService';

const CreateAnnouncement = ({ setCurrentScreen, currentUser }) => {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [publishImmediately, setPublishImmediately] = useState(true);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const validateForm = () => {
    const newErrors = {};
    
    if (!title.trim()) {
      newErrors.title = 'Title is required';
    }
    
    if (!content.trim()) {
      newErrors.content = 'Content is required';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      return;
    }
    
    setLoading(true);
    
    const announcementData = {
      title: title.trim(),
      content: content.trim(),
      isActive: publishImmediately,
      authorId: currentUser?.uid || 'admin',
      authorName: currentUser?.displayName || currentUser?.email || 'TAARA Admin'
    };
    
    try {
      console.log('Creating announcement with data:', announcementData);
      const result = await addAnnouncement(announcementData);
      
      console.log('Announcement result:', result);
      
      if (result.success) {
      
        if (!result.data || !result.data.id) {
          console.error('Announcement created but no ID returned:', result);
          alert('⚠️ Announcement created but there was an issue with the response');
          setCurrentScreen('adminDashboard');
          return;
        }

        try {
        
          const notificationData = notificationService.templates.newAnnouncement(title.trim());
          
          
          notificationData.data = {
            announcementId: result.data.id,
            title: title.trim(),
            content: content.trim().substring(0, 100) + (content.trim().length > 100 ? '...' : ''),
            authorName: announcementData.authorName
          };
          
          console.log('Sending notifications with data:', notificationData);
          
      
          const notifResult = await notificationService.createNotificationForAllUsers(notificationData);
          
          console.log('Notification result:', notifResult);
          
          if (notifResult.success) {
            alert('✅ Announcement created successfully and users have been notified!');
          } else {
            alert('✅ Announcement created successfully! (Note: Some notifications may not have been sent)');
          }
        } catch (notifError) {
          console.error('Error sending notifications:', notifError);
          alert('✅ Announcement created successfully! (Note: Notifications could not be sent)');
        }
        
        setCurrentScreen('adminDashboard');
      } else {
        console.error('Failed to create announcement:', result);
        alert('❌ Error: ' + (result.error || 'Unknown error occurred'));
      }
    } catch (error) {
      console.error('Error creating announcement:', error);
      alert('❌ Failed to create announcement: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    if (title || content) {
      if (window.confirm('Discard announcement? Your changes will be lost.')) {
        setCurrentScreen('adminDashboard');
      }
    } else {
      setCurrentScreen('adminDashboard');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-purple-50 to-blue-50">
      <div className="bg-gradient-to-r from-pink-500 to-purple-500 text-white p-6 shadow-lg">
        <button 
          onClick={handleCancel}
          className="flex items-center space-x-2 mb-4 hover:bg-white hover:bg-opacity-20 rounded-lg px-3 py-2 transition-all"
        >
          <ArrowLeft size={20} />
          <span className="text-sm font-medium">Back to Dashboard</span>
        </button>
        
        <div className="flex items-center space-x-3">
          <div className="w-12 h-12 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
            <Bell size={24} />
          </div>
          <div>
            <h1 className="text-2xl font-bold">New Announcement</h1>
            <p className="text-sm opacity-90">Create announcement for users</p>
          </div>
        </div>
      </div>

      <div className="max-w-2xl mx-auto p-6">
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
          <div className="p-6 space-y-6">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Announcement Title <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => {
                  setTitle(e.target.value);
                  if (errors.title) setErrors(prev => ({ ...prev, title: '' }));
                }}
                placeholder="e.g., Adoption Drive This Weekend!"
                className={`w-full px-4 py-3 border-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500 transition-all ${
                  errors.title ? 'border-red-300 bg-red-50' : 'border-gray-200'
                }`}
              />
              {errors.title && (
                <p className="text-red-500 text-xs mt-1">{errors.title}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Announcement Content <span className="text-red-500">*</span>
              </label>
              <textarea
                value={content}
                onChange={(e) => {
                  setContent(e.target.value);
                  if (errors.content) setErrors(prev => ({ ...prev, content: '' }));
                }}
                placeholder="Write your announcement details here..."
                rows={8}
                className={`w-full px-4 py-3 border-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500 transition-all resize-none ${
                  errors.content ? 'border-red-300 bg-red-50' : 'border-gray-200'
                }`}
              />
              {errors.content && (
                <p className="text-red-500 text-xs mt-1">{errors.content}</p>
              )}
              <p className="text-xs text-gray-500 mt-2">
                This will be visible to all users on the home screen
              </p>
            </div>

            <div className="bg-purple-50 border-2 border-purple-200 rounded-lg p-4">
              <label className="flex items-start space-x-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={publishImmediately}
                  onChange={(e) => setPublishImmediately(e.target.checked)}
                  className="mt-1 w-5 h-5 text-purple-600 border-purple-300 rounded focus:ring-2 focus:ring-purple-500"
                />
                <div className="flex-1">
                  <p className="font-semibold text-gray-800">Publish Immediately</p>
                  <p className="text-xs text-gray-600 mt-1">
                    Make this announcement visible to users right away
                  </p>
                </div>
              </label>
            </div>

            <div className="bg-yellow-50 border-l-4 border-yellow-500 p-4 rounded-lg">
              <p className="text-sm text-yellow-800">
                <strong>📢 Note:</strong> All users will receive a notification about this announcement.
              </p>
            </div>

            <div className="border-2 border-blue-200 rounded-lg p-4 bg-blue-50">
              <div className="flex items-center space-x-2 mb-3">
                <Bell size={16} className="text-blue-600" />
                <p className="text-sm font-semibold text-blue-800">Preview:</p>
              </div>
              
              <div className="bg-white rounded-lg p-4 shadow-sm">
                <h3 className="font-bold text-gray-800 mb-2">
                  {title || 'Title will appear here'}
                </h3>
                <p className="text-sm text-gray-600 whitespace-pre-wrap">
                  {content || 'Content will appear here'}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-gray-50 px-6 py-4 flex items-center justify-between border-t">
            <button
              onClick={handleCancel}
              className="px-6 py-2 text-gray-600 font-medium hover:bg-gray-200 rounded-lg transition-all"
            >
              Cancel
            </button>
            
            <button
              onClick={handleSubmit}
              disabled={loading}
              className="bg-gradient-to-r from-pink-500 to-purple-500 text-white px-6 py-3 rounded-lg font-semibold hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
            >
              <Send size={18} />
              <span>{loading ? 'Creating...' : 'Publish & Notify Users'}</span>
            </button>
          </div>

          {currentUser && (
            <div className="bg-green-50 border-t-2 border-green-200 px-6 py-3">
              <p className="text-xs text-green-800 text-center">
                ✅ Logged in as: {currentUser.email}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CreateAnnouncement;