import React, { useState, useRef } from 'react';
import { User, Camera, X } from 'lucide-react';

const ProfilePictureUpload = ({ currentPhotoURL, onPhotoUpdate, isUploading }) => {
  const [previewURL, setPreviewURL] = useState(currentPhotoURL);
  const fileInputRef = useRef(null);

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      
      if (!file.type.startsWith('image/')) {
        alert('Please select an image file');
        return;
      }

     
      if (file.size > 5 * 1024 * 1024) {
        alert('Image size should be less than 5MB');
        return;
      }

     
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewURL(reader.result);
      };
      reader.readAsDataURL(file);

      
      onPhotoUpdate(file);
    }
  };

  const handleRemovePhoto = () => {
    setPreviewURL(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    onPhotoUpdate(null);
  };

  return (
    <div className="relative inline-block">
      {}
      <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center flex-shrink-0 overflow-hidden border-4 border-white shadow-lg">
        {previewURL ? (
          <img 
            src={previewURL} 
            alt="Profile" 
            className="w-full h-full object-cover"
          />
        ) : (
          <User className="text-pink-500" size={40} />
        )}
      </div>

      {}
      <button
        onClick={() => fileInputRef.current?.click()}
        disabled={isUploading}
        className="absolute bottom-0 right-0 w-8 h-8 bg-pink-500 rounded-full flex items-center justify-center shadow-lg hover:bg-pink-600 transition-colors disabled:opacity-50"
      >
        {isUploading ? (
          <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
        ) : (
          <Camera className="text-white" size={16} />
        )}
      </button>

      {}
      {previewURL && !isUploading && (
        <button
          onClick={handleRemovePhoto}
          className="absolute top-0 right-0 w-6 h-6 bg-red-500 rounded-full flex items-center justify-center shadow-lg hover:bg-red-600 transition-colors"
        >
          <X className="text-white" size={14} />
        </button>
      )}

      {}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileSelect}
        className="hidden"
      />
    </div>
  );
};

export default ProfilePictureUpload;