import React, { useState } from 'react';
import { useSystemThemeOverride } from '@/hooks/useSystemThemeOverride';
import { useDarkMode } from '@/contexts/DarkModeContext';

interface SharePopupProps {
  isOpen: boolean;
  onClose: () => void;
  onShare: (shareOptions: ShareOptions) => void;
  postContent?: string;
  postMedia?: any;
  isAlbum?: boolean;
}

interface ShareOptions {
  shareOnTimeline: boolean;
  shareToPage: boolean;
  shareToGroup: boolean;
  customMessage: string;
  shareTo?: string;
  socialPlatforms?: string[];
}

const SharePopup: React.FC<SharePopupProps> = ({ 
  isOpen, 
  onClose, 
  onShare, 
  postContent = '',
  postMedia,
  isAlbum = false
}) => {
  // Ensure system dark mode has no effect
  useSystemThemeOverride();
  
  const { isDarkMode } = useDarkMode();
  
  const [shareMode, setShareMode] = useState<'internal' | 'social'>('internal');
  const [shareOptions, setShareOptions] = useState<ShareOptions>({
    shareOnTimeline: true,
    shareToPage: false,
    shareToGroup: false,
    customMessage: '',
    shareTo: 'friends',
    socialPlatforms: []
  });

  if (!isOpen) return null;

  const handleShare = () => {
    onShare(shareOptions);
    onClose();
  };

  const handleCheckboxChange = (option: keyof ShareOptions) => {
    setShareOptions(prev => ({
      ...prev,
      [option]: !prev[option]
    }));
  };

  const handleSocialShare = (platform: string) => {
    const text = shareOptions.customMessage || postContent || (isAlbum ? 'Check out this album!' : 'Check out this post!');
    const url = window.location.href;
    
    let shareUrl = '';
    
    switch (platform) {
      case 'whatsapp':
        shareUrl = `https://wa.me/?text=${encodeURIComponent(text + ' ' + url)}`;
        break;
      case 'facebook':
        shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}&quote=${encodeURIComponent(text)}`;
        break;
      case 'twitter':
        shareUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`;
        break;
      case 'instagram':
        // Instagram doesn't support direct URL sharing, but we can copy to clipboard
        navigator.clipboard.writeText(text + ' ' + url);
        alert('Content copied to clipboard! You can now paste it on Instagram.');
        return;
      case 'telegram':
        shareUrl = `https://t.me/share/url?url=${encodeURIComponent(url)}&text=${encodeURIComponent(text)}`;
        break;
      case 'linkedin':
        shareUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`;
        break;
      default:
        return;
    }
    
    window.open(shareUrl, '_blank', 'width=600,height=400');
  };

  const toggleSocialPlatform = (platform: string) => {
    setShareOptions(prev => ({
      ...prev,
      socialPlatforms: prev.socialPlatforms?.includes(platform)
        ? prev.socialPlatforms.filter(p => p !== platform)
        : [...(prev.socialPlatforms || []), platform]
    }));
  };

  const socialPlatforms = [
    { id: 'whatsapp', name: 'WhatsApp', icon: '💬', color: 'bg-green-500' },
    { id: 'facebook', name: 'Facebook', icon: '📘', color: 'bg-blue-600' },
    { id: 'twitter', name: 'Twitter', icon: '🐦', color: 'bg-blue-400' },
    { id: 'instagram', name: 'Instagram', icon: '📷', color: 'bg-pink-500' },
    { id: 'telegram', name: 'Telegram', icon: '📡', color: 'bg-blue-500' },
    { id: 'linkedin', name: 'LinkedIn', icon: '💼', color: 'bg-blue-700' }
  ];

  return (
    <div className="fixed inset-0 flex items-center justify-center z-[100] p-2 sm:p-4 backdrop-blur-md bg-white/10">
      <div className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-xl w-full max-w-xs sm:max-w-sm mx-2 sm:mx-4 transform transition-all duration-300 scale-100 max-h-[85vh] overflow-y-auto scrollbar-hide`}>
        <div className="p-3 sm:p-4">
          {/* Header */}
          <div className="flex items-center justify-between mb-3 sm:mb-4">
            <h3 className={`text-base sm:text-lg font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
              Share {isAlbum ? 'Album' : 'Post'}
            </h3>
            <button
              onClick={onClose}
              className={`text-gray-400 transition-colors p-2 rounded-full touch-manipulation ${isDarkMode ? 'hover:text-gray-200 hover:bg-gray-700' : 'hover:text-gray-600 hover:bg-gray-100'}`}
              style={{ touchAction: 'manipulation' }}
            >
              <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
              </svg>
            </button>
          </div>

          {/* Content Preview */}
          {(postContent || postMedia) && (
            <div className={`mb-3 sm:mb-4 p-2 sm:p-3 rounded-lg border ${isDarkMode ? 'bg-gray-700 border-gray-600' : 'bg-gray-50 border-gray-200'}`}>
              <div className="flex items-start gap-3 sm:gap-4">
                {postMedia && postMedia.length > 0 && (
                  <div className={`relative w-12 h-12 sm:w-16 sm:h-16 rounded-lg overflow-hidden flex-shrink-0 ${isDarkMode ? 'bg-gray-600' : 'bg-gray-200'}`}>
                    {postMedia[0].type === 'video' ? (
                      <video 
                        src={postMedia[0].url} 
                        className="w-full h-full object-cover"
                        muted
                      />
                    ) : (
                      <img 
                        src={postMedia[0].url} 
                        alt="Preview" 
                        className="w-full h-full object-cover"
                      />
                    )}
                    {postMedia.length > 1 && (
                      <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                        <span className="text-white text-xs font-bold">+{postMedia.length - 1}</span>
                      </div>
                    )}
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <p className={`text-xs sm:text-sm line-clamp-2 leading-relaxed ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    {postContent || (isAlbum ? 'Album' : 'Post')}
                  </p>
                  {isAlbum && postMedia && (
                    <p className={`text-xs mt-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                      {postMedia.length} media item{postMedia.length !== 1 ? 's' : ''}
                    </p>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Mode Toggle */}
          <div className={`flex rounded-lg p-1 mb-3 sm:mb-4 ${isDarkMode ? 'bg-gray-700' : 'bg-gray-100'}`}>
            <button
              onClick={() => setShareMode('internal')}
              className={`flex-1 py-1.5 sm:py-2 px-2 sm:px-3 rounded-md text-xs font-medium transition-all duration-200 touch-manipulation ${
                shareMode === 'internal' 
                  ? `${isDarkMode ? 'bg-gray-600 text-blue-400' : 'bg-white text-blue-600'} shadow-sm` 
                  : `${isDarkMode ? 'text-gray-400 hover:text-gray-200' : 'text-gray-600 hover:text-gray-900'}`
              }`}
              style={{ touchAction: 'manipulation' }}
            >
              📱 Internal
            </button>
            <button
              onClick={() => setShareMode('social')}
              className={`flex-1 py-1.5 sm:py-2 px-2 sm:px-3 rounded-md text-xs font-medium transition-all duration-200 touch-manipulation ${
                shareMode === 'social' 
                  ? `${isDarkMode ? 'bg-gray-600 text-blue-400' : 'bg-white text-blue-600'} shadow-sm` 
                  : `${isDarkMode ? 'text-gray-400 hover:text-gray-200' : 'text-gray-600 hover:text-gray-900'}`
              }`}
              style={{ touchAction: 'manipulation' }}
            >
              🌐 Social Media
            </button>
          </div>

          {shareMode === 'internal' ? (
            <>
              {/* Internal Share Options */}
              <div className="space-y-3 mb-4">
                <label className={`flex items-center space-x-3 cursor-pointer p-2 rounded-lg transition-colors ${isDarkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-50'}`}>
                  <input
                    type="checkbox"
                    checked={shareOptions.shareOnTimeline}
                    onChange={() => handleCheckboxChange('shareOnTimeline')}
                    className="w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  />
                  <div className="flex items-center space-x-3">
                    <span className="text-2xl">📝</span>
                    <div>
                      <span className={`font-medium ${isDarkMode ? 'text-white' : 'text-gray-700'}`}>Share on my timeline</span>
                      <p className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Post to your profile timeline</p>
                    </div>
                  </div>
                </label>
                
                <label className={`flex items-center space-x-3 cursor-pointer p-2 rounded-lg transition-colors ${isDarkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-50'}`}>
                  <input
                    type="checkbox"
                    checked={shareOptions.shareToPage}
                    onChange={() => handleCheckboxChange('shareToPage')}
                    className="w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  />
                  <div className="flex items-center space-x-3">
                    <span className="text-2xl">🏢</span>
                    <div>
                      <span className={`font-medium ${isDarkMode ? 'text-white' : 'text-gray-700'}`}>Share to a page</span>
                      <p className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Share on your business page</p>
                    </div>
                  </div>
                </label>
                
                <label className={`flex items-center space-x-3 cursor-pointer p-2 rounded-lg transition-colors ${isDarkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-50'}`}>
                  <input
                    type="checkbox"
                    checked={shareOptions.shareToGroup}
                    onChange={() => handleCheckboxChange('shareToGroup')}
                    className="w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  />
                  <div className="flex items-center space-x-3">
                    <span className="text-2xl">👥</span>
                    <div>
                      <span className={`font-medium ${isDarkMode ? 'text-white' : 'text-gray-700'}`}>Share to a group</span>
                      <p className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Share in a community group</p>
                    </div>
                  </div>
                </label>

                {/* Privacy Options */}
                {shareOptions.shareOnTimeline && (
                  <div className={`ml-6 mt-3 p-3 rounded-lg border ${isDarkMode ? 'bg-blue-900/20 border-blue-800' : 'bg-blue-50 border-blue-200'}`}>
                    <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>Privacy Settings</label>
                    <div className="space-y-3">
                      <label className="flex items-center space-x-3 cursor-pointer">
                        <input
                          type="radio"
                          name="privacy"
                          value="friends"
                          checked={shareOptions.shareTo === 'friends'}
                          onChange={(e) => setShareOptions(prev => ({ ...prev, shareTo: e.target.value }))}
                          className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                        />
                        <div>
                          <span className={`text-sm font-medium ${isDarkMode ? 'text-white' : 'text-gray-700'}`}>Friends</span>
                          <p className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Visible to your friends only</p>
                        </div>
                      </label>
                      <label className="flex items-center space-x-3 cursor-pointer">
                        <input
                          type="radio"
                          name="privacy"
                          value="public"
                          checked={shareOptions.shareTo === 'public'}
                          onChange={(e) => setShareOptions(prev => ({ ...prev, shareTo: e.target.value }))}
                          className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                        />
                        <div>
                          <span className={`text-sm font-medium ${isDarkMode ? 'text-white' : 'text-gray-700'}`}>Public</span>
                          <p className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Visible to everyone</p>
                        </div>
                      </label>
                    </div>
                  </div>
                )}
              </div>

              {/* Custom Message */}
              <div className="mb-4">
                <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  Add a message (optional)
                </label>
                <textarea
                  value={shareOptions.customMessage}
                  onChange={(e) => setShareOptions(prev => ({ ...prev, customMessage: e.target.value }))}
                  placeholder={isAlbum ? "Write something about this album..." : "Write something here..."}
                  className={`w-full h-20 px-3 py-2 border rounded-lg resize-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-sm ${
                    isDarkMode 
                      ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
                      : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                  }`}
                  maxLength={500}
                />
                <div className={`text-xs mt-1 text-right ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                  {shareOptions.customMessage.length}/500
                </div>
              </div>
            </>
          ) : (
            <>
                             {/* Social Media Share Options */}
               <div className="mb-3 sm:mb-4">
                 <h4 className={`text-sm font-medium mb-2 sm:mb-3 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>Share to social platforms</h4>
                 <div className="grid grid-cols-2 gap-2 sm:gap-3">
                   {socialPlatforms.map((platform) => (
                     <button
                       key={platform.id}
                       onClick={() => handleSocialShare(platform.id)}
                       className={`flex items-center space-x-2 p-2 rounded-lg border-2 transition-all duration-200 hover:shadow-md touch-manipulation ${
                         shareOptions.socialPlatforms?.includes(platform.id)
                           ? `${isDarkMode ? 'border-blue-500 bg-blue-900/20' : 'border-blue-500 bg-blue-50'}`
                           : `${isDarkMode ? 'border-gray-600 bg-gray-700 hover:border-blue-500' : 'border-gray-200 bg-white hover:border-blue-300'}`
                       }`}
                       style={{ touchAction: 'manipulation' }}
                     >
                       <span className="text-lg">{platform.icon}</span>
                       <span className={`text-xs font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                         {platform.name}
                       </span>
                     </button>
                   ))}
                 </div>
               </div>

              {/* Custom Message for Social */}
              <div className="mb-4">
                <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  Custom message for social sharing
                </label>
                <textarea
                  value={shareOptions.customMessage}
                  onChange={(e) => setShareOptions(prev => ({ ...prev, customMessage: e.target.value }))}
                  placeholder="Write a message to share with your social media followers..."
                  className={`w-full h-16 px-3 py-2 border rounded-lg resize-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-sm ${
                    isDarkMode 
                      ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
                      : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                  }`}
                  maxLength={280}
                />
                <div className={`text-xs mt-1 text-right ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                  {shareOptions.customMessage.length}/280
                </div>
              </div>
            </>
          )}

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-2">
            <button
              onClick={onClose}
              className={`flex-1 py-2 px-3 rounded-lg font-medium transition-colors text-xs touch-manipulation ${
                isDarkMode 
                  ? 'bg-gray-600 text-gray-300 hover:bg-gray-500' 
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
              style={{ touchAction: 'manipulation' }}
            >
              Cancel
            </button>
            <button
              onClick={handleShare}
              disabled={shareMode === 'internal' && !shareOptions.shareOnTimeline && !shareOptions.shareToPage && !shareOptions.shareToGroup}
              className={`flex-1 py-2 px-3 rounded-lg font-medium transition-colors text-xs touch-manipulation ${
                shareMode === 'internal' && !shareOptions.shareOnTimeline && !shareOptions.shareToPage && !shareOptions.shareToGroup
                  ? 'bg-gray-300 cursor-not-allowed'
                  : 'bg-blue-600 text-white hover:bg-blue-700'
              }`}
              style={{ touchAction: 'manipulation' }}
            >
              {shareMode === 'internal' ? 'Share' : 'Copy Link'}
            </button>
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
        }
      `}</style>
    </div>
  );
};

export default SharePopup;
export type { ShareOptions }; 
