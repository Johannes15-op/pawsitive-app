import React, { useState, useEffect } from 'react';

const InstallPrompt = () => {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [showInstallPrompt, setShowInstallPrompt] = useState(false);

  useEffect(() => {
    const handler = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setShowInstallPrompt(true);
    };

    window.addEventListener('beforeinstallprompt', handler);

    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;

    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    
    if (outcome === 'accepted') {
      console.log('User accepted the install prompt');
    }
    
    setDeferredPrompt(null);
    setShowInstallPrompt(false);
  };

  const handleDismiss = () => {
    setShowInstallPrompt(false);
  };

  if (!showInstallPrompt) return null;

  return (
    <div className="fixed bottom-20 left-0 right-0 mx-4 mb-4 bg-white rounded-lg shadow-xl p-4 z-50 border-2 border-pink-500">
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <h3 className="font-bold text-gray-800 mb-1">Install TAARA App</h3>
          <p className="text-sm text-gray-600">
            Add to home screen for quick access and offline support!
          </p>
        </div>
        <button
          onClick={handleDismiss}
          className="ml-2 text-gray-400 hover:text-gray-600"
        >
          ✕
        </button>
      </div>
      <div className="flex gap-2 mt-3">
        <button
          onClick={handleInstallClick}
          className="flex-1 bg-pink-500 text-white py-2 px-4 rounded-lg font-semibold hover:bg-pink-600"
        >
          Install
        </button>
        <button
          onClick={handleDismiss}
          className="px-4 text-gray-600 hover:text-gray-800"
        >
          Later
        </button>
      </div>
    </div>
  );
};

export default InstallPrompt;