import React, { useState, useEffect } from 'react';
import { Bell, X, ChevronRight } from 'lucide-react';
import { getAllAnnouncements } from '../services/announcementService';

const AnnouncementBanner = () => {
  const [announcements, setAnnouncements] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showModal, setShowModal] = useState(false);
  const [hasNew, setHasNew] = useState(false);

  useEffect(() => {
    loadAnnouncements();
  }, []);

  const loadAnnouncements = async () => {
    try {
      const result = await getAllAnnouncements();
      
      if (result.success && result.data) {
        
        const activeAnnouncements = result.data.filter(a => a.isActive !== false);
        setAnnouncements(activeAnnouncements);
        
        
        if (activeAnnouncements.length > 0) {
          const lastSeenId = localStorage.getItem('lastSeenAnnouncement');
          if (lastSeenId !== activeAnnouncements[0].id) {
            setHasNew(true);
          }
        }
      }
    } catch (error) {
      console.error('Error loading announcements:', error);
    }
  };

  const handleClick = () => {
    setShowModal(true);
    setHasNew(false);
    if (announcements.length > 0) {
      localStorage.setItem('lastSeenAnnouncement', announcements[0].id);
    }
  };

  const handleClose = () => {
    setShowModal(false);
  };

  const handleNext = () => {
    setCurrentIndex((prev) => (prev + 1) % announcements.length);
  };

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev - 1 + announcements.length) % announcements.length);
  };

  const formatDate = (timestamp) => {
    if (!timestamp) return '';
    try {
      const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
      return date.toLocaleDateString('en-PH', {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
      });
    } catch (e) {
      return '';
    }
  };

  if (announcements.length === 0) return null;

  const currentAnnouncement = announcements[currentIndex];

  return (
    <>
      {}
      {!showModal && (
        <button
          onClick={handleClick}
          className="w-full bg-gradient-to-r from-pink-500 to-purple-500 text-white p-4 rounded-lg mb-4 relative overflow-hidden shadow-lg hover:shadow-xl transition-all"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="relative">
                <Bell size={24} className="text-white" />
                {hasNew && (
                  <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full animate-pulse"></span>
                )}
              </div>
              <div className="text-left">
                <p className="font-bold text-sm">📢 Announcement</p>
                <p className="text-xs opacity-90 truncate max-w-[200px]">
                  {currentAnnouncement.title}
                </p>
              </div>
            </div>
            <ChevronRight size={20} />
          </div>
          
          {hasNew && (
            <div className="absolute top-2 right-2 bg-red-500 text-white text-xs px-2 py-1 rounded-full font-bold">
              NEW
            </div>
          )}
        </button>
      )}

      {}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl max-h-[80vh] overflow-hidden">
            {}
            <div className="bg-gradient-to-r from-pink-500 to-purple-500 p-6 relative">
              <button
                onClick={handleClose}
                className="absolute top-4 right-4 text-white hover:bg-white hover:bg-opacity-20 rounded-full p-1"
              >
                <X size={24} />
              </button>
              <div className="flex items-center space-x-3 text-white">
                <Bell size={32} />
                <div>
                  <p className="text-sm opacity-90">Announcement</p>
                  <h2 className="text-xl font-bold">{currentAnnouncement.title}</h2>
                </div>
              </div>
            </div>
            
            {}
            <div className="p-6 overflow-y-auto max-h-[50vh]">
              <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
                {currentAnnouncement.content}
              </p>
              
              {currentAnnouncement.createdAt && (
                <p className="text-xs text-gray-400 mt-4">
                  Posted: {formatDate(currentAnnouncement.createdAt)}
                </p>
              )}
            </div>

            {}
            {announcements.length > 1 && (
              <div className="border-t px-6 py-3 flex items-center justify-between">
                <button
                  onClick={handlePrev}
                  className="text-pink-500 text-sm font-semibold hover:text-pink-600"
                >
                  ← Previous
                </button>
                <span className="text-xs text-gray-500">
                  {currentIndex + 1} of {announcements.length}
                </span>
                <button
                  onClick={handleNext}
                  className="text-pink-500 text-sm font-semibold hover:text-pink-600"
                >
                  Next →
                </button>
              </div>
            )}

            {}
            <div className="border-t px-6 py-4">
              <button
                onClick={handleClose}
                className="w-full bg-pink-500 text-white py-3 rounded-lg font-semibold hover:bg-pink-600"
              >
                Got it!
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
  
export default AnnouncementBanner;