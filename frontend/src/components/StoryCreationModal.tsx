import React, { useState, useRef, useEffect } from 'react';
import { X, Camera, Video, FileText, Globe, Lock, Users, Eye } from 'lucide-react';
import { getCurrentUser } from '@/utils/auth';

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
    
  return `${process.env.NEXT_PUBLIC_API_URL}/${avatarUrl}`;
  };

  useEffect(() => {
    if (isOpen) {
      // Disable scrolling
      document.body.style.overflow = 'hidden';
      // Prevent scroll on mobile
      document.body.style.position = 'fixed';
      document.body.style.width = '100%';
      
      if (textareaRef.current) {
        textareaRef.current.focus();
      }
      // Get current user info when modal opens
      const user = getCurrentUser();
      setCurrentUser(user);
    } else {
      // Re-enable scrolling
      document.body.style.overflow = 'unset';
      document.body.style.position = 'unset';
      document.body.style.width = 'unset';
    }

    // Cleanup function to restore scrolling when component unmounts
    return () => {
      document.body.style.overflow = 'unset';
      document.body.style.position = 'unset';
      document.body.style.width = 'unset';
    };
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

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/stories`, {
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
    <div className="fixed inset-0 flex items-center justify-center z-[100] p-2 sm:p-4 bg-black/20 backdrop-blur-md">
      <div className="bg-white dark:bg-gray-800 rounded-xl sm:rounded-2xl shadow-2xl w-full max-w-sm sm:max-w-md mx-2 sm:mx-4 transform transition-all duration-300 scale-100 max-h-[80vh] overflow-y-auto scrollbar-hide">
        <div className="p-4 sm:p-6 relative">
          {/* Close Button */}
          <button
            onClick={handleClose}
            disabled={isUploading}
            className="absolute top-4 right-4 text-2xl font-bold w-8 h-8 flex items-center justify-center rounded-full transition-colors text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 disabled:opacity-50"
          >
            ×
          </button>
          
          
          <div className="text-center">
            <h3 className="text-lg sm:text-xl font-semibold mb-2 text-gray-900 dark:text-white break-words">
              Create New Story
            </h3>

            <form onSubmit={handleSubmit} className="space-y-3 sm:space-y-4">
          {/* Content Input */}
          <div>
                          <textarea
                ref={textareaRef}
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="What is going on..."
                className="w-full min-h-[80px] sm:min-h-[100px] p-2 sm:p-3 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none text-sm sm:text-base"
                disabled={isUploading}
                maxLength={500}
              />
            <div className="text-right text-xs text-gray-500 mt-1">
              {content.length}/500
            </div>
          </div>

          {/* Media Upload */}
          <div>
            <label className="block text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Media File
            </label>
            
            {!selectedFile ? (
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={isUploading}
                className="w-full p-3 sm:p-4 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-xl hover:border-blue-500 dark:hover:border-blue-400 transition-colors flex items-center justify-center gap-2 sm:gap-3 text-gray-600 dark:text-gray-400 hover:text-blue-500 dark:hover:text-blue-400 text-xs sm:text-sm"
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
                <div className="mt-2 text-sm text-gray-600 dark:text-gray-400">
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
            <label className="block text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
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
                    : 'bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-600 dark:text-gray-400 hover:border-gray-400 dark:hover:border-gray-500'
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
            <div className="p-3 bg-red-100 dark:bg-red-900/20 border border-red-300 dark:border-red-700 rounded-lg text-red-700 dark:text-red-400 text-sm flex items-center gap-2">
              <span>⚠️</span>
              {error}
            </div>
          )}

          {/* Upload Progress */}
          {isUploading && (
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm text-gray-600 dark:text-gray-400">
                <span>Uploading story...</span>
                <span>{uploadProgress}%</span>
              </div>
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
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
                className="w-full py-3 px-4 rounded-xl font-medium transition-all duration-200 text-sm sm:text-base touch-manipulation bg-blue-500 hover:bg-blue-600 dark:bg-blue-600 dark:hover:bg-blue-700 text-white disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                style={{ touchAction: 'manipulation' }}
              >
                {isUploading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
                    Creating...
                  </>
                ) : (
                  <>
                    <FileText className="w-5 h-5" />
                    Create Story
                  </>
                )}
              </button>
            </form>
          </div>
        </div>
      </div>
      
      <style jsx>{`
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
        .scrollbar-hide::-webkit-scrollbar { 
          display: none;
          width: 0;
          height: 0;
        }
        .scrollbar-hide::-webkit-scrollbar-track {
          display: none;
        }
        .scrollbar-hide::-webkit-scrollbar-thumb {
          display: none;
        }
      `}</style>
    </div>
  );
};

export default StoryCreationModal;
