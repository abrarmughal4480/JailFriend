"use client";
import React, { useState, useRef, useEffect } from 'react';
import Popup from '@/components/Popup';
import { useDarkMode } from '@/contexts/DarkModeContext';

interface ImageSettings {
  avatar: string | null;
  cover: string | null;
}

interface PopupState {
  isOpen: boolean;
  type: 'success' | 'error' | 'info' | 'warning';
  title: string;
  message: string;
  showConfirm?: boolean;
  confirmText?: string;
  cancelText?: string;
}

const AvatarCoverSettingsPage = () => {
  const { isDarkMode } = useDarkMode();
  const [loading, setLoading] = useState(false);
  const [images, setImages] = useState<ImageSettings>({
    avatar: null,
    cover: null
  });
  const [popup, setPopup] = useState<PopupState>({
    isOpen: false,
    type: 'info',
    title: '',
    message: ''
  });
  const [uploading, setUploading] = useState<'avatar' | 'cover' | null>(null);
  
  const avatarInputRef = useRef<HTMLInputElement>(null);
  const coverInputRef = useRef<HTMLInputElement>(null);

  const showPopup = (type: 'success' | 'error' | 'info' | 'warning', title: string, message: string, showConfirm?: boolean, confirmText?: string, cancelText?: string) => {
    setPopup({
      isOpen: true,
      type,
      title,
      message,
      showConfirm,
      confirmText,
      cancelText
    });
  };

  const closePopup = () => {
    setPopup(prev => ({ ...prev, isOpen: false }));
  };

  const getMediaUrl = (url: string | null) => {
    if (!url) return '';
    if (url.startsWith('http')) return url;
    return `${process.env.NEXT_PUBLIC_API_URL || 'https://jaifriend-backend.hgdjlive.com'}/${url}`;
  };

  const handlePopupConfirm = () => {
    // Handle confirmation for delete operations
    if (popup.title === 'Delete Profile Picture') {
      handleDeleteImage('avatar');
    } else if (popup.title === 'Delete Cover Photo') {
      handleDeleteImage('cover');
    }
    closePopup();
  };

  const handlePopupCancel = () => {
    closePopup();
  };

  // Load images from backend on component mount
  useEffect(() => {
    const fetchUserImages = async () => {
      try {
        const token = localStorage.getItem('token');
        console.log('Token available:', !!token);
        
        if (!token) {
          showPopup('error', 'Authentication Error', 'Please log in to manage your profile images.');
          return;
        }

        const apiUrl = `${process.env.NEXT_PUBLIC_API_URL || 'https://jaifriend-backend.hgdjlive.com'}/api/userimages`;
        console.log('Fetching from:', apiUrl);

        const response = await fetch(apiUrl, { 
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        console.log('Response status:', response.status);
        console.log('Response ok:', response.ok);

        if (response.ok) {
          const data = await response.json();
          console.log('Received data:', data);
          setImages(data);
          // Also save to localStorage as backup
          localStorage.setItem('userImages', JSON.stringify(data));
        } else {
          const errorData = await response.json().catch(() => ({}));
          console.log('Error response:', errorData);
          showPopup('error', 'Failed to Load Images', errorData.message || 'Could not load your profile images. Please try again.');
        }
      } catch (error) {
        console.error('Error fetching user images:', error);
        showPopup('error', 'Network Error', 'Failed to connect to server. Please check your internet connection.');
      }
    };

    fetchUserImages();
  }, []);

  const handleImageUpload = async (type: 'avatar' | 'cover', file: File) => {
    setUploading(type);
    
    try {
      const token = localStorage.getItem('token');
      console.log('Upload - Token available:', !!token);
      
      if (!token) {
        showPopup('error', 'Authentication Error', 'Please log in to upload images.');
        return;
      }

      // Validate file size
      const maxSize = type === 'avatar' ? 5 * 1024 * 1024 : 10 * 1024 * 1024; // 5MB for avatar, 10MB for cover
      if (file.size > maxSize) {
        showPopup('error', 'File Too Large', `${type === 'avatar' ? 'Avatar' : 'Cover'} image must be less than ${maxSize / 1024 / 1024}MB`);
        return;
      }

      // Validate file type
      if (!file.type.startsWith('image/')) {
        showPopup('error', 'Invalid File Type', 'Please select an image file (JPG, PNG, GIF, WebP)');
        return;
      }

      // Create FormData for file upload
      const formData = new FormData();
      formData.append(type, file);

              const apiUrl = `${process.env.NEXT_PUBLIC_API_URL || 'https://jaifriend-backend.hgdjlive.com'}/api/userimages/${type}`;
      console.log('Upload URL:', apiUrl);
      console.log('File being uploaded:', file.name, file.size, file.type);

      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });

      console.log('Upload response status:', response.status);
      console.log('Upload response ok:', response.ok);

      if (response.ok) {
        const data = await response.json();
        console.log('Upload response data:', data);
        
        // Update local state with the new image URL
        setImages(prev => ({
          ...prev,
          [type]: data[type] || data.avatar || data.cover
        }));

        // Update localStorage
        const currentImages = JSON.parse(localStorage.getItem('userImages') || '{}');
        localStorage.setItem('userImages', JSON.stringify({
          ...currentImages,
          [type]: data[type] || data.avatar || data.cover
        }));

        // Dispatch event to refresh other pages
        window.dispatchEvent(new CustomEvent('imagesUpdated'));
        window.dispatchEvent(new CustomEvent('profileUpdated'));

        showPopup('success', 'Upload Successful', `${type === 'avatar' ? 'Profile picture' : 'Cover photo'} uploaded successfully!`);
      } else {
        const errorData = await response.json().catch(() => ({}));
        console.error('Upload error response:', errorData);
        showPopup('error', 'Upload Failed', errorData.message || errorData.error || `Failed to upload ${type}. Please try again.`);
      }
    } catch (error) {
      console.error(`Error uploading ${type}:`, error);
      showPopup('error', 'Network Error', 'Failed to connect to server. Please check your internet connection.');
    } finally {
      setUploading(null);
    }
  };

  const handleAvatarClick = () => {
    avatarInputRef.current?.click();
  };

  const handleCoverClick = () => {
    coverInputRef.current?.click();
  };

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleImageUpload('avatar', file);
    }
    // Reset input value to allow selecting the same file again
    e.target.value = '';
  };

  const handleCoverChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleImageUpload('cover', file);
    }
    // Reset input value to allow selecting the same file again
    e.target.value = '';
  };

  const handleDeleteImage = async (type: 'avatar' | 'cover') => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        showPopup('error', 'Authentication Error', 'Please log in to delete images.');
        return;
      }

              const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'https://jaifriend-backend.hgdjlive.com'}/api/userimages/${type}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        // Update local state
        setImages(prev => ({
          ...prev,
          [type]: null
        }));

        // Update localStorage
        const currentImages = JSON.parse(localStorage.getItem('userImages') || '{}');
        localStorage.setItem('userImages', JSON.stringify({
          ...currentImages,
          [type]: null
        }));

        // Dispatch event to refresh other pages
        window.dispatchEvent(new CustomEvent('imagesUpdated'));
        window.dispatchEvent(new CustomEvent('profileUpdated'));

        showPopup('success', 'Deleted Successfully', `${type === 'avatar' ? 'Profile picture' : 'Cover photo'} removed successfully!`);
      } else {
        const errorData = await response.json().catch(() => ({}));
        console.error('Delete error response:', errorData);
        showPopup('error', 'Delete Failed', errorData.message || errorData.error || `Failed to delete ${type}. Please try again.`);
      }
    } catch (error) {
      console.error(`Error deleting ${type}:`, error);
      showPopup('error', 'Network Error', 'Failed to connect to server. Please check your internet connection.');
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className={`rounded-lg shadow-sm border p-8 ${
        isDarkMode 
          ? 'bg-gray-800 border-gray-700' 
          : 'bg-white border-gray-200'
      }`}>
        <h1 className={`text-2xl font-semibold mb-8 ${
          isDarkMode ? 'text-white' : 'text-gray-900'
        }`}>Avatar & Cover Settings</h1>
        
        {/* Cover and Avatar Upload Area */}
        <div className={`relative rounded-lg overflow-hidden mb-8 ${
          isDarkMode ? 'bg-gray-700' : 'bg-gray-100'
        }`} style={{ height: '400px' }}>
          {/* Cover Photo Area */}
          <div 
            className="w-full h-full cursor-pointer relative group"
            onClick={handleCoverClick}
          >
            {images.cover ? (
              <img 
                src={getMediaUrl(images.cover)} 
                alt="Cover" 
                className="w-full h-full object-cover"
              />
            ) : (
              <div className={`w-full h-full flex flex-col items-center justify-center ${
                isDarkMode ? 'bg-gray-700' : 'bg-gray-200'
              }`}>
                <div className="mb-4">
                  <svg className={`w-12 h-12 ${
                    isDarkMode ? 'text-gray-500' : 'text-gray-400'
                  }`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16.5L12 9l8 7.5M4 9l8-7.5L20 9" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16.5h16v2H4v-2z" />
                  </svg>
                </div>
                <p className={`text-sm ${
                  isDarkMode ? 'text-gray-400' : 'text-gray-500'
                }`}>Click to upload cover photo</p>
              </div>
            )}
            
            {/* Loading Overlay */}
            {uploading === 'cover' && (
              <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                <div className="text-white text-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white mx-auto mb-2"></div>
                  <p className="text-sm">Uploading...</p>
                </div>
              </div>
            )}
            
            {/* Cover Upload Overlay */}
            {!uploading && (
              <div className="absolute inset-0 bg-black bg-opacity-50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                <div className="text-white text-center">
                  <svg className="w-8 h-8 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  <p className="text-sm">Change Cover</p>
                </div>
              </div>
            )}
            
            {/* Delete Cover Button */}
            {images.cover && !uploading && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  showPopup('warning', 'Delete Cover Photo', 'Are you sure you want to delete your cover photo?', true, 'Delete', 'Cancel');
                }}
                className="absolute top-4 right-4 bg-red-500 hover:bg-red-600 text-white p-2 rounded-full transition-colors duration-200"
                title="Delete cover photo"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </button>
            )}
          </div>

          {/* Avatar Area */}
          <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2">
            <div 
              className="w-32 h-32 rounded-full border-4 border-white cursor-pointer relative group bg-white overflow-hidden shadow-lg"
              onClick={handleAvatarClick}
            >
              {images.avatar ? (
                <img 
                  src={getMediaUrl(images.avatar)} 
                  onError={(e) => { 
                    console.log('❌ Avatar load failed for user:', images.avatar); 
                    e.currentTarget.src = '/default-avatar.svg'; 
                  }} 
                  alt="Avatar" 
                  className="w-full h-full object-cover rounded-full"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-gray-200 rounded-full">
                  <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </div>
              )}
              
              {/* Loading Overlay */}
              {uploading === 'avatar' && (
                <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center rounded-full">
                  <div className="text-white text-center">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white mx-auto mb-1"></div>
                    <p className="text-xs">Uploading...</p>
                  </div>
                </div>
              )}
              
              {/* Avatar Upload Overlay */}
              {!uploading && (
                <div className="absolute inset-0 bg-black bg-opacity-50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center rounded-full">
                  <div className="text-white text-center">
                    <svg className="w-6 h-6 mx-auto mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    <p className="text-xs">Change</p>
                  </div>
                </div>
              )}
              
              {/* Delete Avatar Button */}
              {images.avatar && !uploading && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    showPopup('warning', 'Delete Profile Picture', 'Are you sure you want to delete your profile picture?', true, 'Delete', 'Cancel');
                  }}
                  className="absolute -top-2 -right-2 bg-red-500 hover:bg-red-600 text-white p-1.5 rounded-full transition-colors duration-200"
                  title="Delete profile picture"
                >
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Hidden File Inputs */}
        <input
          ref={avatarInputRef}
          type="file"
          accept="image/*"
          onChange={handleAvatarChange}
          className="hidden"
        />
        <input
          ref={coverInputRef}
          type="file"
          accept="image/*"
          onChange={handleCoverChange}
          className="hidden"
        />

        {/* Upload Guidelines */}
        <div className="mb-8 p-4 bg-blue-50 rounded-lg border border-blue-200">
          <h3 className="text-sm font-medium text-blue-900 mb-2">Upload Guidelines:</h3>
          <ul className="text-sm text-blue-800 space-y-1">
            <li>• Avatar: Recommended size 400x400px, max 5MB</li>
            <li>• Cover: Recommended size 1200x400px, max 10MB</li>
            <li>• Supported formats: JPG, PNG, GIF</li>
          </ul>
        </div>

        {/* Info Section */}
        <div className="mt-8 p-4 bg-gray-50 rounded-lg border border-gray-200">
          <h3 className="text-sm font-medium text-gray-900 mb-2">How it works:</h3>
          <ul className="text-sm text-gray-700 space-y-1">
            <li>• Click on the cover photo or profile picture to upload a new image</li>
            <li>• Images are automatically saved and will persist permanently</li>
            <li>• Use the delete buttons (🗑️) to remove images</li>
            <li>• Changes are applied immediately across your profile</li>
          </ul>
        </div>
      </div>

      {/* Popup Component */}
      <Popup 
        popup={popup} 
        onClose={closePopup}
        onConfirm={handlePopupConfirm}
        onCancel={handlePopupCancel}
      />
    </div>
  );
};

export default AvatarCoverSettingsPage;
