import React, { useState, useRef, useEffect } from 'react';
import { X, Camera, Video, FileText, Globe, Lock, Users, Eye } from 'lucide-react';
import { getCurrentUser } from '@/utils/auth';
import { useSystemThemeOverride } from '@/hooks/useSystemThemeOverride';
import { useDarkMode } from '@/contexts/DarkModeContext';

interface StoryCreationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (storyData: any) => void;
}

const StoryCreationModal: React.FC<StoryCreationModalProps> = ({
  isOpen,
  onClose,
  onSuccess
}) => {
  // Ensure system dark mode has no effect
  useSystemThemeOverride();
  
  const { isDarkMode } = useDarkMode();
  
  const [content, setContent] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [mediaPreview, setMediaPreview] = useState<string | null>(null);
  const [mediaType, setMediaType] = useState<'image' | 'video' | null>(null);
  const [privacy, setPrivacy] = useState<'public' | 'friends' | 'private'>('public');
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [currentUser, setCurrentUser] = useState<any>(null);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const getUserAvatar = (avatarUrl: string) => {
    if (!avatarUrl) return '/default-avatar.svg';
    if (avatarUrl.startsWith('http')) return avatarUrl;
    
    // Handle placeholder avatars that don't exist
    if (avatarUrl.includes('/avatars/') || avatarUrl.includes('/covers/')) {
      return '/default-avatar.svg';
    }
    
  return `${process.env.NEXT_PUBLIC_API_URL || 'https://jaifriend-backend.hgdjlive.com'}/${avatarUrl}`;
  };

  useEffect(() => {
    if (isOpen && textareaRef.current) {
      textareaRef.current.focus();
    }
    // Get current user info when modal opens
    const user = getCurrentUser();
    setCurrentUser(user);
  }, [isOpen]);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file size (max 50MB for stories)
    if (file.size > 50 * 1024 * 1024) {
      setError('File size must be less than 50MB');
      return;
    }

    // Validate file type
    const validImageTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    const validVideoTypes = ['video/mp4', 'video/webm', 'video/ogg', 'video/quicktime'];
    
    if (!validImageTypes.includes(file.type) && !validVideoTypes.includes(file.type)) {
      setError('Please select a valid image or video file');
      return;
    }

    setError(null);
    setSelectedFile(file);
    setMediaType(file.type.startsWith('image/') ? 'image' : 'video');
    
    // Create preview
    const reader = new FileReader();
    reader.onload = () => {
      setMediaPreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveFile = () => {
    setSelectedFile(null);
    setMediaPreview(null);
    setMediaType(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedFile) {
      setError('Please select a media file');
      return;
    }

    setIsUploading(true);
    setUploadProgress(0);
    setError(null);

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('Please login to create stories');
      }

      const formData = new FormData();
      formData.append('media', selectedFile);
      formData.append('content', content.trim());
      formData.append('privacy', privacy);

  const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'https://jaifriend-backend.hgdjlive.com'}/api/stories`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'Failed to create story');
      }

      const data = await response.json();
      
      // Simulate upload progress
      for (let i = 0; i <= 100; i += 10) {
        setUploadProgress(i);
        await new Promise(resolve => setTimeout(resolve, 50));
      }

      onSuccess(data.story);
      resetForm();
      onClose();
      
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to create story');
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
    }
  };

  const resetForm = () => {
    setContent('');
    setSelectedFile(null);
    setMediaPreview(null);
    setMediaType(null);
    setPrivacy('public');
    setError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleClose = () => {
    if (!isUploading) {
      resetForm();
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-2 sm:p-4" style={{ paddingTop: '60px', paddingBottom: '80px' }}>
      <div className={`${isDarkMode ? 'bg-gray-900' : 'bg-white'} rounded-2xl w-full max-w-md max-h-[calc(100vh-140px)] overflow-y-auto scrollbar-hide`}>
        {/* Header */}
        <div className={`flex items-center justify-between p-4 border-b ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
          <button
            onClick={handleClose}
            disabled={isUploading}
            className={`p-2 rounded-full transition-colors disabled:opacity-50 ${isDarkMode ? 'hover:bg-gray-800' : 'hover:bg-gray-100'}`}
          >
            <X className="w-5 h-5" />
          </button>
          <h2 className={`text-lg font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
            Create New Story
          </h2>
          <div className="w-10" /> {/* Spacer for centering */}
        </div>

        <form onSubmit={handleSubmit} className="p-3 sm:p-4 space-y-3 sm:space-y-4">
          {/* Content Input */}
          <div>
                          <textarea
                ref={textareaRef}
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="What is going on..."
                className={`w-full min-h-[80px] sm:min-h-[100px] p-2 sm:p-3 border rounded-xl resize-none text-sm sm:text-base ${
                  isDarkMode 
                    ? 'bg-gray-800 border-gray-600 text-white placeholder-gray-400 focus:ring-blue-500 focus:border-transparent' 
                    : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500 focus:ring-blue-500 focus:border-transparent'
                }`}
                disabled={isUploading}
                maxLength={500}
              />
            <div className={`text-right text-xs mt-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
              {content.length}/500
            </div>
          </div>

          {/* Media Upload */}
          <div>
            <label className={`block text-xs sm:text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
              Media File
            </label>
            
            {!selectedFile ? (
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={isUploading}
                className={`w-full p-3 sm:p-4 border-2 border-dashed rounded-xl transition-colors flex items-center justify-center gap-2 sm:gap-3 text-xs sm:text-sm ${
                  isDarkMode 
                    ? 'border-gray-600 hover:border-blue-400 text-gray-400 hover:text-blue-400' 
                    : 'border-gray-300 hover:border-blue-500 text-gray-600 hover:text-blue-500'
                }`}
              >
                {mediaType === 'video' ? (
                  <Video className="w-6 h-6" />
                ) : (
                  <Camera className="w-6 h-6" />
                )}
                <span>Select Photos & Videos</span>
              </button>
            ) : (
              <div className="relative">
                {mediaType === 'image' ? (
                  <div className="relative">
                    <img
                      src={mediaPreview!}
                      alt="Story preview"
                      className="w-full h-32 sm:h-48 object-cover rounded-xl"
                    />
                    {/* User DP Overlay - Centered */}
                    {currentUser && (
                      <div className="absolute bottom-3 left-1/2 transform -translate-x-1/2">
                        <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full border-4 border-white shadow-lg overflow-hidden bg-white">
                          {currentUser.avatar ? (
                            <img
                              src={currentUser.avatar} onError={(e) => { console.log('❌ Avatar load failed for user:', currentUser.avatar); e.currentTarget.src = '/default-avatar.svg'; }}
                              alt="Profile"
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-2xl font-bold">
                              {currentUser.name ? currentUser.name.charAt(0).toUpperCase() : 'U'}
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="relative">
                    <video
                      src={mediaPreview!}
                      controls
                      className="w-full h-32 sm:h-48 object-cover rounded-xl"
                    />
                    {/* User DP Overlay - Centered */}
                    {currentUser && (
                      <div className="absolute bottom-3 left-1/2 transform -translate-x-1/2">
                        <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full border-4 border-white shadow-lg overflow-hidden bg-white">
                          {currentUser.avatar ? (
                            <img
                              src={currentUser.avatar} onError={(e) => { console.log('❌ Avatar load failed for user:', currentUser.avatar); e.currentTarget.src = '/default-avatar.svg'; }}
                              alt="Profile"
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-2xl font-bold">
                              {currentUser.name ? currentUser.name.charAt(0).toUpperCase() : 'U'}
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                )}
                <button
                  type="button"
                  onClick={handleRemoveFile}
                  disabled={isUploading}
                  className="absolute top-2 right-2 p-2 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors disabled:opacity-50"
                >
                  <X className="w-4 h-4" />
                </button>
                <div className={`mt-2 text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                  {selectedFile.name} ({(selectedFile.size / 1024 / 1024).toFixed(1)}MB)
                </div>
              </div>
            )}
            
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*,video/*"
              onChange={handleFileSelect}
              className="hidden"
              disabled={isUploading}
            />
          </div>

          {/* Privacy Settings */}
          <div>
            <label className={`block text-xs sm:text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
              Privacy
            </label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { value: 'public', icon: Globe, label: 'Everyone', color: 'bg-green-100 text-green-700 border-green-300' },
                { value: 'friends', icon: Users, label: 'Friends', color: 'bg-blue-100 text-blue-700 border-blue-300' },
                { value: 'private', icon: Lock, label: 'Private', color: 'bg-gray-100 text-gray-700 border-gray-300' }
              ].map((option) => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => setPrivacy(option.value as any)}
                  disabled={isUploading}
                  className={`p-2 sm:p-3 rounded-lg border-2 transition-all ${
                    privacy === option.value
                      ? option.color + ' border-current'
                      : `${isDarkMode ? 'bg-gray-800 border-gray-600 text-gray-400 hover:border-gray-500' : 'bg-white border-gray-300 text-gray-600 hover:border-gray-400'}`
                  }`}
                >
                  <option.icon className="w-5 h-5 mx-auto mb-1" />
                  <div className="text-xs font-medium leading-tight">{option.label}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Error Display */}
          {error && (
            <div className={`p-3 border rounded-lg text-sm flex items-center gap-2 ${isDarkMode ? 'bg-red-900/20 border-red-700 text-red-400' : 'bg-red-100 border-red-300 text-red-700'}`}>
              <span>⚠️</span>
              {error}
            </div>
          )}

          {/* Upload Progress */}
          {isUploading && (
            <div className="space-y-2">
              <div className={`flex items-center justify-between text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                <span>Uploading story...</span>
                <span>{uploadProgress}%</span>
              </div>
              <div className={`w-full rounded-full h-2 ${isDarkMode ? 'bg-gray-700' : 'bg-gray-200'}`}>
                <div
                  className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${uploadProgress}%` }}
                />
              </div>
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isUploading || !selectedFile}
            className="w-full bg-red-500 hover:bg-red-600 disabled:bg-gray-400 text-white font-medium py-2 sm:py-3 px-4 sm:px-6 rounded-xl transition-colors disabled:cursor-not-allowed flex items-center justify-center gap-2 text-sm sm:text-base"
          >
            {isUploading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
                Creating...
              </>
            ) : (
              <>
                <FileText className="w-5 h-5" />
                Create
              </>
            )}
          </button>
        </form>
      </div>
      
      <style jsx>{`
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
        .scrollbar-hide::-webkit-scrollbar { 
          display: none;
        }
      `}</style>
    </div>
  );
};

export default StoryCreationModal;
