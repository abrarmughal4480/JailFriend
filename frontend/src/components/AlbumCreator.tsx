'use client';
import React, { useState, useRef, useEffect } from 'react';

interface AlbumCreatorProps {
  onAlbumCreated: (album: any) => void;
}

interface MediaFile {
  file: File;
  type: 'image' | 'video';
  preview: string;
}

export default function AlbumCreator({ onAlbumCreated }: AlbumCreatorProps) {
  const [albumName, setAlbumName] = useState('');
  const [mediaFiles, setMediaFiles] = useState<MediaFile[]>([]);
  const [isCreating, setIsCreating] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    
    const newMediaFiles: MediaFile[] = files.map(file => {
      const isVideo = file.type.startsWith('video/');
      const type: 'image' | 'video' = isVideo ? 'video' : 'image';
      const preview = URL.createObjectURL(file);
      
      return {
        file,
        type,
        preview
      };
    });
    
    setMediaFiles(prev => [...prev, ...newMediaFiles]);
  };

  const removeMedia = (index: number) => {
    const mediaFile = mediaFiles[index];
    // Revoke the object URL to free memory
    URL.revokeObjectURL(mediaFile.preview);
    setMediaFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleCreateAlbum = async () => {
    if (!albumName.trim() || mediaFiles.length === 0) {
      alert('Please provide an album name and select at least one media file');
      return;
    }

    setIsCreating(true);
    try {
      const token = localStorage.getItem('token');
      const formData = new FormData();
      formData.append('name', albumName);
      
      mediaFiles.forEach(mediaFile => {
        formData.append('photos', mediaFile.file);
      });

  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://jaifriend-backend.hgdjlive.com';
  const response = await fetch(`${API_URL}/api/albums`, {
        method: 'POST',
        headers: {
          ...(token ? { Authorization: `Bearer ${token}` } : {})
        },
        body: formData
      });

      if (response.ok) {
        const album = await response.json();
        onAlbumCreated(album);
        setAlbumName('');
        
        // Clean up object URLs
        mediaFiles.forEach(mediaFile => {
          URL.revokeObjectURL(mediaFile.preview);
        });
        setMediaFiles([]);
        
        if (fileInputRef.current) fileInputRef.current.value = '';
        
        // Dispatch event to refresh feed
        window.dispatchEvent(new CustomEvent('albumCreated'));
        
        // Redirect to dashboard feed immediately
        window.location.href = '/dashboard';
      } else {
        const error = await response.json();
        alert(`Failed to create album: ${error.message}`);
      }
    } catch (error) {
      console.error('Error creating album:', error);
      alert('Failed to create album');
    } finally {
      setIsCreating(false);
    }
  };

  // Cleanup object URLs when component unmounts
  useEffect(() => {
    return () => {
      mediaFiles.forEach(mediaFile => {
        URL.revokeObjectURL(mediaFile.preview);
      });
    };
  }, [mediaFiles]);

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow p-4 mb-6 transition-colors duration-200">
      <h3 className="font-semibold mb-3 text-gray-900 dark:text-white">Create New Album</h3>
      
      <div className="mb-3">
        <input
          type="text"
          placeholder="Album name..."
          value={albumName}
          onChange={(e) => setAlbumName(e.target.value)}
          className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
          disabled={isCreating}
        />
      </div>

      <div className="mb-3">
        <input
          type="file"
          accept="image/*,video/*"
          multiple
          ref={fileInputRef}
          onChange={handleFileSelect}
          className="hidden"
          disabled={isCreating}
        />
        <button
          onClick={() => fileInputRef.current?.click()}
          className="bg-blue-100 hover:bg-blue-200 dark:bg-blue-900/30 dark:hover:bg-blue-900/50 px-4 py-2 rounded-lg text-sm text-blue-700 dark:text-blue-300 transition-colors"
          disabled={isCreating}
        >
          📷📹 Select Photos & Videos
        </button>
      </div>

      {mediaFiles.length > 0 && (
        <div className="mb-3">
          <div className="text-sm text-gray-600 dark:text-gray-400 mb-2">
            Selected Media ({mediaFiles.length}):
          </div>
          <div className="grid grid-cols-3 gap-2 max-h-64 overflow-y-auto">
            {mediaFiles.map((mediaFile, index) => (
              <div key={index} className="relative group">
                {mediaFile.type === 'video' ? (
                  <div className="relative">
                    <video
                      src={mediaFile.preview}
                      className="w-full h-20 object-cover rounded cursor-pointer"
                      onMouseEnter={(e) => {
                        const video = e.currentTarget;
                        video.play().catch(() => {}); // Muted autoplay on hover
                      }}
                      onMouseLeave={(e) => {
                        const video = e.currentTarget;
                        video.pause();
                        video.currentTime = 0;
                      }}
                      muted
                      loop
                    />
                    {/* Video indicator */}
                    <div className="absolute top-1 left-1 bg-black bg-opacity-70 text-white text-xs px-1 py-0.5 rounded">
                      🎥
                    </div>
                    {/* Play button overlay */}
                    <div className="absolute inset-0 bg-black bg-opacity-30 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                      <div className="w-8 h-8 bg-white bg-opacity-80 rounded-full flex items-center justify-center">
                        <span className="text-black text-lg">▶️</span>
                      </div>
                    </div>
                  </div>
                ) : (
                  <img
                    src={mediaFile.preview}
                    alt={`Media ${index + 1}`}
                    className="w-full h-20 object-cover rounded"
                  />
                )}
                
                {/* Remove button */}
                <button
                  onClick={() => removeMedia(index)}
                  className="absolute top-1 right-1 bg-red-500 hover:bg-red-600 text-white rounded-full w-5 h-5 text-xs flex items-center justify-center transition-colors"
                  title="Remove media"
                >
                  ×
                </button>
                
                {/* File type indicator */}
                <div className="absolute bottom-1 left-1 bg-black bg-opacity-70 text-white text-xs px-1 py-0.5 rounded">
                  {mediaFile.type === 'video' ? '🎥' : '🖼️'}
                </div>
              </div>
            ))}
          </div>
          
          {/* Media info */}
          <div className="mt-2 text-xs text-gray-500 dark:text-gray-400">
            {mediaFiles.filter(m => m.type === 'image').length} photos, {mediaFiles.filter(m => m.type === 'video').length} videos
          </div>
        </div>
      )}

      <button
        onClick={handleCreateAlbum}
        disabled={isCreating || !albumName.trim() || mediaFiles.length === 0}
        className="bg-blue-500 hover:bg-blue-600 disabled:bg-gray-300 dark:disabled:bg-gray-600 text-white px-4 py-2 rounded-lg w-full transition-colors"
      >
        {isCreating ? 'Creating Album...' : 'Create Album'}
      </button>
    </div>
  );
} 
