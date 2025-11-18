"use client";
import React, { useState, useEffect } from 'react';
import { Plus, Camera, ArrowLeft, Settings, Users, User, X, Heart } from 'lucide-react';
import { useDarkMode } from '@/contexts/DarkModeContext';
import Popup, { PopupState } from '../../../components/Popup';

const PhotoAlbumManager: React.FC = () => {
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
  
  // Auth-aware media URL resolver: fetches protected media with Authorization and returns blob URL
  const useAuthMediaUrl = (inputUrl: string) => {
    const [resolvedUrl, setResolvedUrl] = useState<string>(inputUrl);
    useEffect(() => {
      let objectUrlToRevoke: string | null = null;
      const resolve = async () => {
        const url = inputUrl;
        if (!url) return;
        try {
          const token = localStorage.getItem('token');
          const apiBase = (API_URL || '').replace(/\/$/, '');
          const isSameOrigin = url.startsWith(apiBase);
          if (token && isSameOrigin) {
            const resp = await fetch(url, { headers: { Authorization: `Bearer ${token}` } });
            if (resp.ok) {
              const blob = await resp.blob();
              const obj = URL.createObjectURL(blob);
              objectUrlToRevoke = obj;
              setResolvedUrl(obj);
              return;
            }
          }
          setResolvedUrl(url);
        } catch {
          setResolvedUrl(url);
        }
      };
      resolve();
      return () => {
        if (objectUrlToRevoke) URL.revokeObjectURL(objectUrlToRevoke);
      };
    }, [inputUrl]);
    return resolvedUrl;
  };
  
  const AuthImage: React.FC<{ src: string; rawSrc?: string; alt: string; className?: string }> = ({ src, rawSrc, alt, className }) => {
    const url = useAuthMediaUrl(src);
    return (
      <img
        src={url}
        alt={alt}
        className={className}
        loading="lazy"
        onError={(e) => {
          const target = e.currentTarget as HTMLImageElement;
          if (rawSrc && target.src !== rawSrc) {
            // Fallback to the raw URL (e.g., Cloudinary secure_url)
            target.src = rawSrc;
          }
        }}
      />
    );
  };
  
  const AuthVideo: React.FC<{ src: string; className?: string }> = ({ src, className }) => {
    const url = useAuthMediaUrl(src);
    return (
      <video src={url} className={className} muted preload="metadata" controls />
    );
  };
  
  // REMOVED: System theme following
  // We NEVER follow system preference - only manual toggle
  // Theme is controlled by DarkModeContext
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

  const handleAlbumLike = async (albumId: string) => {
    const token = localStorage.getItem('token');
    if (!token) {
      showPopup('error', 'Authentication Error', 'Please login to like albums');
      return;
    }
    try {
      const res = await fetch(`${API_URL}/api/albums/${albumId}/like`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      if (res.ok) {
        const data = await res.json();
        console.log('Album like response:', data);
        // Handle different response structures
        const updatedAlbum = data.album || data;
        
        // Update albums state with the new album data, ensuring likes array is properly set
        setAlbums(prev => prev.map(a => {
          if (a._id === albumId || a._id?.toString() === albumId.toString()) {
            // Ensure likes is always an array
            const likesArray = Array.isArray(updatedAlbum.likes) 
              ? updatedAlbum.likes 
              : (updatedAlbum.likes && typeof updatedAlbum.likes === 'object' 
                ? Object.values(updatedAlbum.likes) 
                : []);
            
            return {
              ...a,
              ...updatedAlbum,
              likes: likesArray,
              liked: data.isLiked !== undefined ? data.isLiked : data.liked
            };
          }
          return a;
        }));
        
        // Don't show popup for like/unlike to avoid interruption
        // showPopup('success', 'Success', data.liked ? 'Album liked!' : 'Album unliked!');
      } else {
        showPopup('error', 'Error', 'Failed to like album. Please try again.');
      }
    } catch (error) {
      console.error('Error liking album:', error);
      showPopup('error', 'Network Error', 'Failed to connect to server. Please check your internet connection.');
    }
  };

  // Helper function to check if album is liked
  const isAlbumLiked = (album: any): boolean => {
    if (album.liked === true) return true;
    if (!album.likes || !Array.isArray(album.likes)) return false;
    const currentUserId = localStorage.getItem('userId') || JSON.parse(localStorage.getItem('user') || '{}')._id;
    if (!currentUserId) return false;
    return album.likes.some((like: any) => {
      if (typeof like === 'string') return like === currentUserId;
      return like?._id === currentUserId || like?.userId === currentUserId;
    });
  };

  // Helper function to get like count
  const getAlbumLikeCount = (album: any): number => {
    if (Array.isArray(album.likes)) return album.likes.length;
    if (typeof album.likes === 'number') return album.likes;
    if (album.likeCount !== undefined) return album.likeCount;
    return 0;
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
    // Allow absolute and safe URL schemes (Cloudinary, protocol-relative, data, blob)
    if (/^(https?:)?\/\//i.test(url) || /^(data:|blob:)/i.test(url)) return url;
    const apiBase = (API_URL || '').replace(/\/$/, '');
    const normalized = url
      .replace(/\\/g, '/')      // backslashes -> slashes
      .replace(/^\/+/, '');      // remove leading slashes
    const joined = `${apiBase}/${normalized}`;
    // Encode spaces and unsafe characters minimally
    return joined.replace(/\s/g, '%20');
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
    <div className="min-h-screen w-full transition-colors duration-200 bg-gray-50 dark:bg-gray-900">
      <div className="h-full overflow-y-auto scrollbar-hide">
      {/* Popup Modal */}
      <Popup popup={popup} onClose={closePopup} />
      
      {/* Album Creation Popup */}
      {showCreatePopup && (
        <div 
          className="fixed inset-0 flex items-center justify-center z-[9999] p-4 overflow-y-auto scrollbar-hide bg-white/20 dark:bg-black/30 backdrop-blur-md"
          onClick={handleCloseCreatePopup}
        >
          <div 
            className="rounded-2xl w-full max-w-sm sm:max-w-md md:max-w-2xl max-h-[90vh] overflow-hidden transition-colors duration-200 bg-white dark:bg-gray-800"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 sm:p-6 border-b transition-colors duration-200 border-gray-200 dark:border-gray-700">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                  <Plus className="w-4 h-4 text-white" />
                </div>
                <h2 className="text-xl font-semibold transition-colors duration-200 text-gray-900 dark:text-white">Create New Album</h2>
              </div>
              <button
                onClick={handleCloseCreatePopup}
                className="p-2 rounded-full transition-colors duration-200 text-gray-400 hover:text-gray-600 hover:bg-gray-100 dark:hover:text-gray-200 dark:hover:bg-gray-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Form Content */}
            <div className="p-4 sm:p-6 overflow-y-auto max-h-[calc(90vh-140px)] scrollbar-hide">
              {/* Album Name Field */}
              <div className="mb-6">
                <label className="block text-sm font-medium mb-3 transition-colors duration-200 text-gray-700 dark:text-gray-300">Album Name</label>
                <input
                  type="text"
                  value={albumName}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setAlbumName(e.target.value)}
                  placeholder="Choose your album name"
                  className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors duration-200 border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400"
                />
              </div>

              {/* Photos Section */}
              <div className="mb-6">
                <label className="block text-sm font-medium mb-4 transition-colors duration-200 text-gray-700 dark:text-gray-300">Photos</label>
                
                {/* Photo URL Input */}
                <div className="mb-4 flex gap-2">
                  <input
                    type="text"
                    value={photoUrlInput}
                    onChange={e => setPhotoUrlInput(e.target.value)}
                    placeholder="Paste image URL (e.g. from Cloudinary)"
                    className="border px-3 py-2 rounded flex-1 text-sm transition-colors duration-200 border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
                  />
                  <button
                    type="button"
                    onClick={handleAddPhotoUrl}
                    className="bg-blue-500 text-white px-4 py-2 rounded whitespace-nowrap text-sm transition-colors duration-200 hover:bg-blue-600"
                  >
                    Add URL
                  </button>
                </div>
                
                {/* Photo Upload Area */}
                <div className="border-2 border-dashed rounded-lg p-8 text-center transition-colors duration-200 border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500">
                  <input
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={handlePhotoUpload}
                    className="hidden"
                    id="photo-upload-popup"
                  />
                  <label htmlFor="photo-upload-popup" className="cursor-pointer">
                    <div className="w-16 h-16 rounded-lg mx-auto mb-4 flex items-center justify-center relative transition-colors duration-200 bg-gray-100 dark:bg-gray-700">
                      <Camera className="w-8 h-8 transition-colors duration-200 text-gray-400" />
                      <div className="absolute -top-1 -right-1">
                        <Plus className="w-4 h-4 transition-colors duration-200 text-gray-600 dark:text-gray-300" />
                      </div>
                    </div>
                    <p className="text-base font-medium transition-colors duration-200 text-gray-700 dark:text-gray-300">
                      Click to upload photos
                    </p>
                    <p className="text-sm mt-1 transition-colors duration-200 text-gray-500 dark:text-gray-400">
                      Supports: JPG, PNG, GIF
                    </p>
                  </label>
                </div>
                
                {/* Selected Photos Preview */}
                {selectedPhotos.length > 0 && (
                  <div className="mt-4">
                    <p className="text-sm mb-2 transition-colors duration-200 text-gray-600 dark:text-gray-300">{selectedPhotos.length} file(s) selected</p>
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
            <div className="flex items-center justify-end gap-3 p-4 sm:p-6 border-t transition-colors duration-200 border-gray-200 dark:border-gray-700">
              <button
                onClick={handleCloseCreatePopup}
                className="px-6 py-2 font-medium transition-colors duration-200 border rounded-lg text-gray-600 dark:text-gray-300 hover:text-gray-800 dark:hover:text-white border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700"
              >
                Cancel
              </button>
              <button
                onClick={handlePublish}
                disabled={!albumName.trim() || selectedPhotos.length === 0 || creatingAlbum}
                className="px-6 py-2 rounded-lg font-medium transition-colors duration-200 bg-blue-500 dark:bg-blue-600 hover:bg-blue-600 dark:hover:bg-blue-700 disabled:bg-gray-300 dark:disabled:bg-gray-600 disabled:cursor-not-allowed text-white"
              >
                {creatingAlbum ? 'Creating...' : 'Create Album'}
              </button>
            </div>
          </div>
        </div>
      )}
      
        {/* Header */}
        <div className="border-b px-4 sm:px-6 py-3 sm:py-4 sticky top-0 z-30 transition-colors duration-200 bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between max-w-7xl mx-auto">
            <h1 className="text-xl sm:text-2xl font-semibold transition-colors duration-200 text-gray-900 dark:text-white">My Albums</h1>
            {/* Removed icon buttons from header */}
          </div>
        </div>

        {/* Main Content */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-12">
          {/* Albums List */}
          {loading ? (
            <div className="text-center py-12 transition-colors duration-200 text-gray-400">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 mx-auto mb-4 transition-colors duration-200 border-gray-400 dark:border-gray-500"></div>
              Loading albums...
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6 mb-6 sm:mb-12">
              {/* Create New Album Card (hidden when no albums exist) */}
              {albums.length > 0 && (
              <div 
                onClick={handleCreateAlbum}
                className="border-2 border-dashed rounded-lg p-6 text-center transition-colors duration-200 cursor-pointer group bg-gray-100 dark:bg-gray-800 border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500 hover:bg-gray-50 dark:hover:bg-gray-700"
              >
                <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-3 group-hover:transition-colors duration-200 bg-gray-200 dark:bg-gray-700 group-hover:bg-gray-300 dark:group-hover:bg-gray-600">
                  <Plus className="w-8 h-8 transition-colors duration-200 text-gray-500 dark:text-gray-400" />
                </div>
                <p className="font-medium text-sm transition-colors duration-200 text-gray-600 dark:text-gray-300">Create New Album</p>
              </div>
              )}
              
              {/* Existing Albums */}
              {albums.map((album, idx) => (
                <div key={album._id || idx} className="rounded-lg shadow border p-3 sm:p-4 relative transition-colors duration-200 bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
                  {/* Dropdown menu button */}
                  <button
                    className="absolute top-2 right-2 p-1.5 sm:p-2 rounded-full z-10 transition-colors duration-200 hover:bg-gray-100 dark:hover:bg-gray-700"
                    onClick={() => setMenuOpen(menuOpen === album._id ? null : album._id)}
                  >
                    <span className="text-lg transition-colors duration-200 text-gray-600 dark:text-gray-300">⋮</span>
                  </button>
                  
                  {/* Dropdown Menu */}
                  {menuOpen === album._id && (
                    <>
                      {/* Backdrop */}
                      <div 
                        className="fixed inset-0 z-20 sm:hidden" 
                        onClick={() => setMenuOpen(null)}
                      />
                      <div className="absolute right-2 top-10 w-40 sm:w-48 border rounded-lg shadow-lg z-30 transition-colors duration-200 bg-white dark:bg-gray-700 border-gray-200 dark:border-gray-600">
                        <button
                          className="w-full text-left px-3 sm:px-4 py-2 text-sm rounded-t-lg transition-colors duration-200 hover:bg-gray-100 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300"
                          onClick={() => startEditAlbum(album)}
                        >
                          ✏️ Edit Album
                        </button>
                        <button
                          className="w-full text-left px-3 sm:px-4 py-2 text-red-600 text-sm transition-colors duration-200 hover:bg-gray-100 dark:hover:bg-gray-600"
                          onClick={() => handleDeleteAlbum(album._id)}
                        >
                          🗑️ Delete Album
                        </button>
                        <button
                          className="w-full text-left px-3 sm:px-4 py-2 text-sm rounded-b-lg transition-colors duration-200 hover:bg-gray-100 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300"
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
                  
                  <div className="font-semibold text-base sm:text-lg mb-2 pr-8 transition-colors duration-200 text-gray-900 dark:text-white">{album.name}</div>
                  <div className="grid grid-cols-3 gap-1 sm:gap-2 mb-2">
                    {album.media && album.media.length > 0 ? (
                      album.media.slice(0, 6).map((media: any, pidx: number) => {
                        // Handle various backend shapes: string URL or object with url/path/secure_url/type
                        const rawUrl: string = typeof media === 'string' 
                          ? media 
                          : (media?.url || media?.secure_url || media?.path || '');
                        const normalizedUrl = getMediaUrl(rawUrl);
                        const isVideo: boolean = (typeof media === 'object' && media?.type === 'video') 
                          || /\.(mp4|webm|ogg|mov|avi)$/i.test(rawUrl || '');

                        if (isVideo) {
                          return (
                            <AuthVideo
                              key={pidx}
                              src={normalizedUrl}
                              className="w-full aspect-square object-cover rounded"
                            />
                          );
                        }
                          return (
                          <AuthImage
                              key={pidx}
                            src={normalizedUrl}
                            rawSrc={rawUrl}
                              alt="album media"
                              className="w-full aspect-square object-cover rounded"
                            />
                          );
                      })
                    ) : (
                      <div className="col-span-3 text-xs py-4 text-center transition-colors duration-200 text-gray-400 dark:text-gray-500">No media</div>
                    )}
                    {album.media && album.media.length > 6 && (
                      <div className="aspect-square rounded flex items-center justify-center text-xs transition-colors duration-200 bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400">
                        +{album.media.length - 6}
                      </div>
                    )}
                  </div>
                  {/* Actions: Like */}
                  <div className="flex items-center justify-between mt-2">
                    <button
                      onClick={() => handleAlbumLike(album._id)}
                      className={`flex items-center gap-1 px-2 py-1 rounded transition-colors duration-200 ${
                        isDarkMode 
                          ? 'hover:bg-gray-700' 
                          : 'hover:bg-gray-100'
                      }`}
                      aria-label="Like album"
                    >
                      <Heart className={`w-4 h-4 transition-colors duration-200 ${
                        isAlbumLiked(album) 
                          ? 'text-red-500 fill-red-500' 
                          : isDarkMode 
                            ? 'text-gray-400' 
                            : 'text-gray-500'
                      }`} />
                      <span className={`text-xs transition-colors duration-200 ${
                        isDarkMode ? 'text-gray-300' : 'text-gray-600'
                      }`}>
                        {getAlbumLikeCount(album)}
                      </span>
                    </button>
                  </div>
                  <div className="text-xs transition-colors duration-200 text-gray-500 dark:text-gray-400">
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
              <p className="text-base sm:text-lg mb-6 sm:mb-8 transition-colors duration-200 text-gray-600 dark:text-gray-300">
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
