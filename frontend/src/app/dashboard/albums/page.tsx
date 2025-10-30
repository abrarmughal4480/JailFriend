"use client";
import React, { useState, useEffect } from 'react';
import { Plus, Camera, ArrowLeft, Settings, Users, User, X } from 'lucide-react';
import { useDarkMode } from '@/contexts/DarkModeContext';
import { useSystemThemeOverride } from '@/hooks/useSystemThemeOverride';
import Popup, { PopupState } from '../../../components/Popup';

const PhotoAlbumManager: React.FC = () => {
  // Ensure system dark mode has no effect
  useSystemThemeOverride();
  
  const { isDarkMode } = useDarkMode();
  
  // Debug: Log dark mode state
  const [currentView, setCurrentView] = useState<'albums' | 'create'>('albums');
  const [albumName, setAlbumName] = useState<string>('');
  const [selectedPhotos, setSelectedPhotos] = useState<(File | string)[]>([]);
  const [albums, setAlbums] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [creatingAlbum, setCreatingAlbum] = useState<boolean>(false);
  const [menuOpen, setMenuOpen] = useState<string | null>(null);
  const [editingAlbumId, setEditingAlbumId] = useState<string | null>(null);
  const [editAlbumName, setEditAlbumName] = useState('');
  const [editPhotos, setEditPhotos] = useState<File[]>([]);
  const [photoUrlInput, setPhotoUrlInput] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(true);
  const [showCreatePopup, setShowCreatePopup] = useState<boolean>(false);
  const [popup, setPopup] = useState<PopupState>({
    isOpen: false,
    type: 'success',
    title: '',
    message: ''
  });
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://jaifriend-backend.hgdjlive.com';
  // Fetch real albums from API
  useEffect(() => {
    const fetchAlbums = async () => {
      setLoading(true);
      try {
        const token = localStorage.getItem('token');
        
        // Check if token exists and is valid
        if (!token || token === 'null' || token === 'undefined') {
          console.error('No valid token found');
          setIsAuthenticated(false);
          return;
        }
        
  const response = await fetch(`${API_URL}/api/albums/user`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });
        
        if (response.ok) {
          const albumsData = await response.json();
          setAlbums(albumsData);
        } else if (response.status === 401) {
          console.error('Authentication failed');
          setIsAuthenticated(false);
          localStorage.removeItem('token');
        } else {
          console.error('Failed to fetch albums');
        }
      } catch (error) {
        console.error('Error fetching albums:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchAlbums();
  }, []);

  const handleCreateAlbum = (): void => {
    setShowCreatePopup(true);
  };

  const handleCloseCreatePopup = (): void => {
    setShowCreatePopup(false);
    setAlbumName('');
    setSelectedPhotos([]);
    setPhotoUrlInput('');
  };

  // Handle ESC key to close popup
  useEffect(() => {
    const handleEscKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && showCreatePopup) {
        handleCloseCreatePopup();
      }
    };

    if (showCreatePopup) {
      document.addEventListener('keydown', handleEscKey);
    }

    return () => {
      document.removeEventListener('keydown', handleEscKey);
    };
  }, [showCreatePopup]);

  const handleGoBack = (): void => {
    setCurrentView('albums');
    setAlbumName('');
    setSelectedPhotos([]);
  };

  const handleAddPhotoUrl = () => {
    if (photoUrlInput.trim()) {
      setSelectedPhotos(prev => [...prev, photoUrlInput.trim()]);
      setPhotoUrlInput('');
    }
  };

  const showPopup = (type: 'success' | 'error' | 'info' | 'warning', title: string, message: string) => {
    setPopup({
      isOpen: true,
      type,
      title,
      message
    });
  };

  const closePopup = () => {
    setPopup(prev => ({ ...prev, isOpen: false }));
  };

  const handlePublish = async (): Promise<void> => {
    if (!albumName.trim()) {
      showPopup('error', 'Missing Album Name', 'Please enter an album name');
      return;
    }
    if (selectedPhotos.length === 0) {
      showPopup('error', 'No Photos Selected', 'Please select at least one photo');
      return;
    }
    
    setCreatingAlbum(true);
    try {
      const token = localStorage.getItem('token');
      
      // Check if token exists and is valid
      if (!token || token === 'null' || token === 'undefined') {
        showPopup('error', 'Authentication Error', 'Please log in again');
        setIsAuthenticated(false);
        return;
      }
      
      const formData = new FormData();
      formData.append('name', albumName);
      
      // Add photos to form data
      selectedPhotos.forEach((photo, index) => {
        if (typeof photo === 'string') {
          // If it's a URL, add it as mediaUrls
          formData.append('mediaUrls', photo);
        } else {
          // If it's a file, add it as photos
          formData.append('photos', photo);
        }
      });

  const response = await fetch(`${API_URL}/api/albums`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });

      if (response.ok) {
        const newAlbum = await response.json();
        setAlbums(prev => [newAlbum, ...prev]);
        setAlbumName('');
        setSelectedPhotos([]);
        setPhotoUrlInput('');
        setShowCreatePopup(false);
        
        // Show success message after popup closes
        setTimeout(() => {
          showPopup('success', 'Album Created!', `Album "${albumName}" created successfully!`);
        }, 100);
        
        // Dispatch event to refresh feed
        window.dispatchEvent(new CustomEvent('albumCreated'));
      } else if (response.status === 401) {
        console.error('Authentication failed');
        setIsAuthenticated(false);
        localStorage.removeItem('token');
        showPopup('error', 'Authentication Error', 'Please log in again');
      } else {
        console.error('Server response error:', response.status, response.statusText);
        try {
          const error = await response.json();
          console.error('Server error details:', error);
          showPopup('error', 'Failed to Create Album', error.message || error.error || 'Something went wrong');
        } catch (parseError) {
          console.error('Failed to parse error response:', parseError);
          showPopup('error', 'Failed to Create Album', `Server error: ${response.status} ${response.statusText}`);
        }
      }
    } catch (error: unknown) {
      console.error('Error creating album:', error);
      console.error('Error details:', {
        message: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : 'No stack trace',
        albumName,
        selectedPhotosCount: selectedPhotos.length,
        token: localStorage.getItem('token') ? 'Present' : 'Missing'
      });
      showPopup('error', 'Network Error', 'Failed to create album. Please try again.');
    } finally {
      setCreatingAlbum(false);
    }
  };

  const handlePhotoUpload = (event: React.ChangeEvent<HTMLInputElement>): void => {
    const files = event.target.files;
    if (files) {
      const fileArray = Array.from(files);
      setSelectedPhotos(prev => [...prev, ...fileArray]);
    }
  };

  const removePhoto = (index: number) => {
    setSelectedPhotos(prev => prev.filter((_, i) => i !== index));
  };

  const getMediaUrl = (url: string) => {
    if (!url) return '';
  if (url.startsWith('http')) return url;
  return `${API_URL}/${url}`;
  };

  // Edit album handlers
  const startEditAlbum = (album: any) => {
    setEditingAlbumId(album._id);
    setEditAlbumName(album.name);
    setEditPhotos([]);
    setMenuOpen(null);
  };

  const cancelEditAlbum = () => {
    setEditingAlbumId(null);
    setEditAlbumName('');
    setEditPhotos([]);
  };

  const handleEditAlbum = async (albumId: string) => {
    try {
      const token = localStorage.getItem('token');
      
      // Check if token exists and is valid
      if (!token || token === 'null' || token === 'undefined') {
        showPopup('error', 'Authentication Error', 'Please log in again');
        setIsAuthenticated(false);
        return;
      }
      
      const formData = new FormData();
      formData.append('name', editAlbumName);
      
      // Add new photos to form data
      editPhotos.forEach((photo, index) => {
        if (typeof photo === 'string') {
          // If it's a URL, add it as mediaUrls
          formData.append('mediaUrls', photo);
        } else {
          // If it's a file, add it as photos
          formData.append('photos', photo);
        }
      });

  const response = await fetch(`${API_URL}/api/albums/${albumId}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });

      if (response.ok) {
        const updatedAlbum = await response.json();
        setAlbums(prev => prev.map(a => a._id === albumId ? updatedAlbum : a));
        showPopup('success', 'Album Updated!', 'Album updated successfully!');
        setEditingAlbumId(null);
        setEditAlbumName('');
        setEditPhotos([]);
        
        // Dispatch event to refresh feed
        window.dispatchEvent(new CustomEvent('albumUpdated'));
      } else if (response.status === 401) {
        console.error('Authentication failed');
        setIsAuthenticated(false);
        localStorage.removeItem('token');
        showPopup('error', 'Authentication Error', 'Please log in again');
      } else {
        console.error('Server response error:', response.status, response.statusText);
        try {
          const error = await response.json();
          console.error('Server error details:', error);
          showPopup('error', 'Failed to Update Album', error.message || error.error || 'Something went wrong');
        } catch (parseError) {
          console.error('Failed to parse error response:', parseError);
          showPopup('error', 'Failed to Update Album', `Server error: ${response.status} ${response.statusText}`);
        }
      }
    } catch (error: unknown) {
      console.error('Error updating album:', error);
      console.error('Error details:', {
        message: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : 'No stack trace',
        albumId,
        editAlbumName,
        editPhotosCount: editPhotos.length,
        token: localStorage.getItem('token') ? 'Present' : 'Missing'
      });
      showPopup('error', 'Network Error', 'Failed to update album. Please try again.');
    }
  };

  const handleEditPhotoUpload = (event: React.ChangeEvent<HTMLInputElement>): void => {
    const files = event.target.files;
    if (files) {
      const fileArray = Array.from(files);
      setEditPhotos(prev => [...prev, ...fileArray]);
    }
  };

  // Delete album
  const handleDeleteAlbum = async (albumId: string) => {
    try {
      const token = localStorage.getItem('token');
      
      // Check if token exists and is valid
      if (!token || token === 'null' || token === 'undefined') {
        showPopup('error', 'Authentication Error', 'Please log in again');
        setIsAuthenticated(false);
        return;
      }
      
      const response = await fetch(`${API_URL}/api/albums/${albumId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const result = await response.json();
        setAlbums(prev => prev.filter(a => a._id !== albumId));
        showPopup('success', 'Album Deleted!', 'Album deleted successfully!');
        
        // Dispatch event to refresh feed
        window.dispatchEvent(new CustomEvent('albumDeleted'));
      } else if (response.status === 401) {
        console.error('Authentication failed');
        setIsAuthenticated(false);
        localStorage.removeItem('token');
        showPopup('error', 'Authentication Error', 'Please log in again');
      } else {
        const error = await response.json();
        showPopup('error', 'Failed to Delete Album', error.message || 'Something went wrong');
      }
    } catch (error: unknown) {
      console.error('Error deleting album:', error);
      showPopup('error', 'Network Error', 'Failed to delete album. Please try again.');
    }
    setMenuOpen(null);
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4 transition-colors duration-200 bg-gray-50 dark:bg-gray-900">
        <div className="text-center">
          <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 transition-colors duration-200 bg-red-100 dark:bg-red-900/20">
            <User className="w-8 h-8 text-red-500" />
          </div>
          <h2 className="text-xl font-semibold mb-2 transition-colors duration-200 text-gray-900 dark:text-white">Authentication Required</h2>
          <p className="mb-4 transition-colors duration-200 text-gray-600 dark:text-gray-300">Please log in to access your albums</p>
          <button 
            onClick={() => window.location.href = '/login'}
            className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 rounded-lg transition-colors duration-200"
          >
            Go to Login
          </button>
        </div>
      </div>
    );
  }

  if (currentView === 'albums') {
      return (
    <div className={`min-h-screen w-full transition-colors duration-200 ${isDarkMode ? 'bg-gray-900' : 'bg-gray-50'}`}>
      <div className="h-full overflow-y-auto scrollbar-hide">
      {/* Popup Modal */}
      <Popup popup={popup} onClose={closePopup} />
      
      {/* Album Creation Popup */}
      {showCreatePopup && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[9999] p-4"
          onClick={handleCloseCreatePopup}
        >
          <div 
            className={`rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden transition-colors duration-200 ${isDarkMode ? 'bg-gray-800' : 'bg-white'} scrollbar-hide`}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className={`flex items-center justify-between p-4 sm:p-6 border-b transition-colors duration-200 ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
              <div className="flex items-center gap-3">
                <div className="w-6 h-6 sm:w-8 sm:h-8 bg-blue-500 rounded-full flex items-center justify-center">
                  <Plus className="w-3 h-3 sm:w-4 sm:h-4 text-white" />
                </div>
                <h2 className={`text-lg sm:text-xl font-semibold transition-colors duration-200 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Create New Album</h2>
              </div>
              <button
                onClick={handleCloseCreatePopup}
                className={`p-2 rounded-full transition-colors duration-200 text-gray-400 ${isDarkMode ? 'hover:text-gray-200 hover:bg-gray-700' : 'hover:text-gray-600 hover:bg-gray-100'}`}
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Form Content */}
            <div className="p-4 sm:p-6 overflow-y-auto max-h-[calc(90vh-140px)] scrollbar-hide">
              {/* Album Name Field */}
              <div className="mb-4 sm:mb-6">
                <label className={`block text-sm font-medium mb-2 sm:mb-3 transition-colors duration-200 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>Album Name</label>
                <input
                  type="text"
                  value={albumName}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setAlbumName(e.target.value)}
                  placeholder="Choose your album name"
                  className={`w-full px-3 sm:px-4 py-2 sm:py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors duration-200 ${isDarkMode ? 'border-gray-600 bg-gray-700 text-white placeholder-gray-400' : 'border-gray-300 bg-white text-gray-900 placeholder-gray-400'}`}
                />
              </div>

              {/* Photos Section */}
              <div className="mb-4 sm:mb-6">
                <label className={`block text-sm font-medium mb-3 sm:mb-4 transition-colors duration-200 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>Photos</label>
                
                {/* Photo URL Input */}
                <div className="mb-3 sm:mb-4 flex gap-2">
                  <input
                    type="text"
                    value={photoUrlInput}
                    onChange={e => setPhotoUrlInput(e.target.value)}
                    placeholder="Paste image URL (e.g. from Cloudinary)"
                    className={`border px-2 sm:px-3 py-2 rounded flex-1 text-sm transition-colors duration-200 ${isDarkMode ? 'border-gray-600 bg-gray-700 text-white placeholder-gray-400' : 'border-gray-300 bg-white text-gray-900 placeholder-gray-500'}`}
                  />
                  <button
                    type="button"
                    onClick={handleAddPhotoUrl}
                    className="bg-blue-500 text-white px-3 sm:px-4 py-2 rounded whitespace-nowrap text-sm transition-colors duration-200 hover:bg-blue-600"
                  >
                    Add URL
                  </button>
                </div>
                
                {/* Photo Upload Area */}
                <div className={`border-2 border-dashed rounded-lg p-4 sm:p-8 text-center transition-colors duration-200 ${isDarkMode ? 'border-gray-600 hover:border-gray-500' : 'border-gray-300 hover:border-gray-400'}`}>
                  <input
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={handlePhotoUpload}
                    className="hidden"
                    id="photo-upload-popup"
                  />
                  <label htmlFor="photo-upload-popup" className="cursor-pointer">
                    <div className={`w-12 h-12 sm:w-16 sm:h-16 rounded-lg mx-auto mb-3 sm:mb-4 flex items-center justify-center relative transition-colors duration-200 ${isDarkMode ? 'bg-gray-700' : 'bg-gray-100'}`}>
                      <Camera className="w-6 h-6 sm:w-8 sm:h-8 transition-colors duration-200 text-gray-400" />
                      <div className="absolute -top-1 -right-1">
                        <Plus className={`w-3 h-3 sm:w-4 sm:h-4 transition-colors duration-200 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`} />
                      </div>
                    </div>
                    <p className={`text-sm sm:text-base font-medium transition-colors duration-200 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                      Click to upload photos
                    </p>
                    <p className={`text-xs sm:text-sm mt-1 transition-colors duration-200 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                      Supports: JPG, PNG, GIF
                    </p>
                  </label>
                </div>
                
                {/* Selected Photos Preview */}
                {selectedPhotos.length > 0 && (
                  <div className="mt-4">
                    <p className={`text-sm mb-2 transition-colors duration-200 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>{selectedPhotos.length} file(s) selected</p>
                    <div className="grid grid-cols-4 sm:grid-cols-6 gap-2">
                      {selectedPhotos.map((media: any, index: number) => (
                        <div key={index} className="relative group">
                          <button
                            onClick={() => removePhoto(index)}
                            className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity z-10"
                          >
                            <X className="w-3 h-3" />
                          </button>
                          {(() => {
                            if (typeof media === 'string') {
                              if (/\.(mp4|webm|ogg|mov|avi)$/i.test(media)) {
                                return (
                                  <video 
                                    src={media} 
                                    className="w-full aspect-square object-cover rounded-lg border" 
                                    controls
                                    muted
                                    preload="metadata"
                                  />
                                );
                              }
                              return (
                                <img src={media} alt="media url" className="w-full aspect-square object-cover rounded-lg border" />
                              );
                            } else if (media.type && media.type.startsWith('video')) {
                              const videoUrl = URL.createObjectURL(media);
                              return (
                                <video 
                                  src={videoUrl} 
                                  className="w-full aspect-square object-cover rounded-lg border" 
                                  controls
                                  muted
                                  preload="metadata"
                                />
                              );
                            } else if (media.type && media.type.startsWith('image')) {
                              const imageUrl = URL.createObjectURL(media);
                              return (
                                <img src={imageUrl} alt="media file" className="w-full aspect-square object-cover rounded-lg border" />
                              );
                            } else {
                              return (
                                <div className="w-full aspect-square bg-gray-200 rounded-lg flex items-center justify-center">
                                  <Camera className="w-4 h-4 text-gray-400" />
                                </div>
                              );
                            }
                          })()}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Footer */}
            <div className={`flex items-center justify-end gap-2 sm:gap-3 p-4 sm:p-6 border-t transition-colors duration-200 ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
              <button
                onClick={handleCloseCreatePopup}
                className={`px-4 sm:px-6 py-2 font-medium transition-colors duration-200 border rounded-lg ${isDarkMode ? 'text-gray-300 hover:text-white border-gray-600 hover:bg-gray-700' : 'text-gray-600 hover:text-gray-800 border-gray-300 hover:bg-gray-50'}`}
              >
                Cancel
              </button>
              <button
                onClick={handlePublish}
                disabled={!albumName.trim() || selectedPhotos.length === 0 || creatingAlbum}
                className={`px-4 sm:px-6 py-2 rounded-lg font-medium transition-colors duration-200 ${isDarkMode ? 'bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600' : 'bg-blue-500 hover:bg-blue-600 disabled:bg-gray-300'} disabled:cursor-not-allowed text-white`}
              >
                {creatingAlbum ? 'Creating...' : 'Create Album'}
              </button>
            </div>
          </div>
        </div>
      )}
      
        {/* Header */}
        <div className={`border-b px-6 sm:px-8 py-3 sticky top-0 z-30 transition-colors duration-200 ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} ml-18 md:ml-72 mr-18 md:mr-72`}>
          <div className="flex items-center justify-center w-full">
            <h1 className={`text-xl sm:text-2xl font-semibold transition-colors duration-200 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>My Albums</h1>
          </div>
        </div>

        {/* Main Content */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 sm:py-6 ml-18 md:ml-72 mr-18 md:mr-72">
          {/* Albums List */}
          {loading ? (
            <div className={`text-center py-12 transition-colors duration-200 ${isDarkMode ? 'text-gray-400' : 'text-gray-400'}`}>
              <div className={`animate-spin rounded-full h-8 w-8 border-b-2 mx-auto mb-4 transition-colors duration-200 ${isDarkMode ? 'border-gray-500' : 'border-gray-400'}`}></div>
              Loading albums...
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6 mb-6 sm:mb-12">
              {/* Create New Album Card - Only show when albums exist */}
              {albums.length > 0 && (
                <div 
                  onClick={handleCreateAlbum}
                  className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors duration-200 cursor-pointer group ${isDarkMode ? 'bg-gray-800 border-gray-600 hover:border-gray-500 hover:bg-gray-700' : 'bg-gray-100 border-gray-300 hover:border-gray-400 hover:bg-gray-50'}`}
                >
                  <div className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-3 group-hover:transition-colors duration-200 ${isDarkMode ? 'bg-gray-700 group-hover:bg-gray-600' : 'bg-gray-200 group-hover:bg-gray-300'}`}>
                    <Plus className={`w-8 h-8 transition-colors duration-200 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`} />
                  </div>
                  <p className={`font-medium text-sm transition-colors duration-200 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>Create New Album</p>
                </div>
              )}
              
              {/* Existing Albums */}
              {albums.map((album, idx) => (
                <div key={album._id || idx} className={`rounded-lg shadow border p-3 sm:p-4 relative transition-colors duration-200 ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
                  {/* Dropdown menu button */}
                  <button
                    className={`absolute top-2 right-2 p-1.5 sm:p-2 rounded-full z-10 transition-colors duration-200 ${isDarkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'}`}
                    onClick={() => setMenuOpen(menuOpen === album._id ? null : album._id)}
                  >
                    <span className={`text-lg transition-colors duration-200 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>⋮</span>
                  </button>
                  
                  {/* Dropdown Menu */}
                  {menuOpen === album._id && (
                    <>
                      {/* Backdrop */}
                      <div 
                        className="fixed inset-0 z-20 sm:hidden" 
                        onClick={() => setMenuOpen(null)}
                      />
                      <div className={`absolute right-2 top-10 w-40 sm:w-48 border rounded-lg shadow-lg z-30 transition-colors duration-200 ${isDarkMode ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-200'}`}>
                        <button
                          className={`w-full text-left px-3 sm:px-4 py-2 text-sm rounded-t-lg transition-colors duration-200 ${isDarkMode ? 'hover:bg-gray-600 text-gray-300' : 'hover:bg-gray-100 text-gray-700'}`}
                          onClick={() => startEditAlbum(album)}
                        >
                          ✏️ Edit Album
                        </button>
                        <button
                          className={`w-full text-left px-3 sm:px-4 py-2 text-red-600 text-sm transition-colors duration-200 ${isDarkMode ? 'hover:bg-gray-600' : 'hover:bg-gray-100'}`}
                          onClick={() => handleDeleteAlbum(album._id)}
                        >
                          🗑️ Delete Album
                        </button>
                        <button
                          className={`w-full text-left px-3 sm:px-4 py-2 text-sm rounded-b-lg transition-colors duration-200 ${isDarkMode ? 'hover:bg-gray-600 text-gray-300' : 'hover:bg-gray-100 text-gray-700'}`}
                          onClick={() => setMenuOpen(null)}
                        >
                          Cancel
                        </button>
                      </div>
                    </>
                  )}
                  
                  {/* Edit album form */}
                  {editingAlbumId === album._id ? (
                    <div className="mb-2 p-2 sm:p-3 rounded border mt-2 transition-colors duration-200 bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-700">
                      <input
                        type="text"
                        className="w-full border rounded p-2 mb-2 text-sm transition-colors duration-200 border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
                        value={editAlbumName}
                        onChange={e => setEditAlbumName(e.target.value)}
                        placeholder="Edit album name..."
                      />
                      <input
                        type="file"
                        multiple
                        accept="image/*"
                        className="mb-2 text-xs sm:text-sm w-full"
                        onChange={handleEditPhotoUpload}
                      />
                      {editPhotos.length > 0 && (
                        <div className="text-xs mb-2 transition-colors duration-200 text-gray-600 dark:text-gray-300">Selected: {editPhotos.length} photo(s)</div>
                      )}
                      <div className="flex gap-2">
                        <button
                          className="bg-blue-600 text-white px-2 sm:px-3 py-1 rounded hover:bg-blue-700 transition-colors duration-200 text-xs sm:text-sm"
                          onClick={() => handleEditAlbum(album._id)}
                          disabled={!editAlbumName.trim()}
                        >
                          Save
                        </button>
                        <button
                          className="px-2 sm:px-3 py-1 rounded transition-colors duration-200 text-xs sm:text-sm bg-gray-300 dark:bg-gray-600 hover:bg-gray-400 dark:hover:bg-gray-500 text-gray-700 dark:text-white"
                          onClick={cancelEditAlbum}
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  ) : null}
                  
                  <div className={`font-semibold text-base sm:text-lg mb-2 pr-8 transition-colors duration-200 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{album.name}</div>
                  <div className="grid grid-cols-3 gap-1 sm:gap-2 mb-2">
                    {album.media && album.media.length > 0 ? (
                      album.media.slice(0, 6).map((media: any, pidx: number) => {
                        const mediaUrl = getMediaUrl(media.url);
                        
                        if (media.type === 'video' || media.url.match(/\.(mp4|webm|ogg|mov|avi)$/i)) {
                          return (
                            <video
                              key={pidx}
                              src={mediaUrl}
                              className="w-full aspect-square object-cover rounded"
                              muted
                              preload="metadata"
                            />
                          );
                        } else {
                          return (
                            <img
                              key={pidx}
                              src={mediaUrl}
                              alt="album media"
                              className="w-full aspect-square object-cover rounded"
                            />
                          );
                        }
                      })
                    ) : (
                      <div className={`col-span-3 text-xs py-4 text-center transition-colors duration-200 ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`}>No media</div>
                    )}
                    {album.media && album.media.length > 6 && (
                      <div className={`aspect-square rounded flex items-center justify-center text-xs transition-colors duration-200 ${isDarkMode ? 'bg-gray-700 text-gray-400' : 'bg-gray-100 text-gray-500'}`}>
                        +{album.media.length - 6}
                      </div>
                    )}
                  </div>
                  <div className={`text-xs transition-colors duration-200 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                    Created: {album.createdAt ? new Date(album.createdAt).toLocaleDateString() : ''}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Empty State - Only show when no albums exist and not loading */}
          {(!loading && albums.length === 0) && (
            <div className="text-center px-4">
              {/* Empty State Icon */}
              <div className="mx-auto w-20 sm:w-24 h-20 sm:h-24 rounded-2xl flex items-center justify-center mb-6 sm:mb-8 transition-colors duration-200 bg-purple-100 dark:bg-purple-900/20">
                <div className="relative">
                  <div className="w-10 sm:w-12 h-10 sm:h-12 bg-purple-500 rounded-lg flex items-center justify-center">
                    <Camera className="w-5 sm:w-6 h-5 sm:h-6 text-white" />
                  </div>
                  <div className="absolute -top-1 -right-1 w-5 sm:w-6 h-5 sm:h-6 bg-purple-400 rounded-md opacity-70"></div>
                </div>
              </div>

              {/* Empty State Text */}
              <p className={`text-base sm:text-lg mb-6 sm:mb-8 transition-colors duration-200 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                You haven't created any <span className="text-purple-600 font-medium">albums</span> yet.
              </p>

              {/* Create Album Button */}
              <button
                onClick={handleCreateAlbum}
                className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded-lg font-medium transition-colors duration-200 shadow-sm"
              >
                Create album
              </button>
            </div>
          )}
        </div>

        </div>
      </div>
    );
  }

  // This view is no longer needed as we use popup instead
  return null;
};

export default PhotoAlbumManager;
