import React, { useState } from 'react';

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
    <>
      <style>{`
        .share-popup-overlay {
          background: rgba(0, 0, 0, 0.4);
          backdrop-filter: blur(10px);
          -webkit-backdrop-filter: blur(10px);
        }
        .share-popup-content::-webkit-scrollbar {
          display: none;
        }
        .share-popup-content {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
      <div 
        className="fixed inset-0 flex items-center justify-center z-[100] p-2 sm:p-4 share-popup-overlay"
      >
        <div 
          className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-xl rounded-xl sm:rounded-2xl shadow-2xl border border-white/20 dark:border-gray-700/30 w-full max-w-sm sm:max-w-lg mx-2 sm:mx-4 transform transition-all duration-300 scale-100 max-h-[95vh] overflow-y-auto share-popup-content"
        >
        <div className="p-4 sm:p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-4 sm:mb-6">
            <h3 className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-white">
              Share {isAlbum ? 'Album' : 'Post'}
            </h3>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 touch-manipulation"
              style={{ touchAction: 'manipulation' }}
            >
              <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
              </svg>
            </button>
          </div>

          {/* Content Preview */}
          {(postContent || postMedia) && (
            <div className="mb-4 sm:mb-6 p-3 sm:p-4 bg-gray-50 dark:bg-gray-700 rounded-xl border border-gray-200 dark:border-gray-600">
              <div className="flex items-start gap-3 sm:gap-4">
                {postMedia && postMedia.length > 0 && (
                  <div className="relative w-16 h-16 sm:w-20 sm:h-20 bg-gray-200 dark:bg-gray-600 rounded-lg overflow-hidden flex-shrink-0">
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
                  <p className="text-xs sm:text-sm text-gray-700 dark:text-gray-300 line-clamp-3 leading-relaxed">
                    {postContent || (isAlbum ? 'Album' : 'Post')}
                  </p>
                  {isAlbum && postMedia && (
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 sm:mt-2">
                      {postMedia.length} media item{postMedia.length !== 1 ? 's' : ''}
                    </p>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Mode Toggle */}
          <div className="flex bg-gray-100 dark:bg-gray-700 rounded-xl p-1 mb-4 sm:mb-6">
            <button
              onClick={() => setShareMode('internal')}
              className={`flex-1 py-2 sm:py-3 px-3 sm:px-4 rounded-lg text-xs sm:text-sm font-medium transition-all duration-200 touch-manipulation ${
                shareMode === 'internal' 
                  ? 'bg-white dark:bg-gray-600 text-blue-600 dark:text-blue-400 shadow-sm' 
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
              }`}
              style={{ touchAction: 'manipulation' }}
            >
              📱 Internal
            </button>
            <button
              onClick={() => setShareMode('social')}
              className={`flex-1 py-2 sm:py-3 px-3 sm:px-4 rounded-lg text-xs sm:text-sm font-medium transition-all duration-200 touch-manipulation ${
                shareMode === 'social' 
                  ? 'bg-white dark:bg-gray-600 text-blue-600 dark:text-blue-400 shadow-sm' 
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
              }`}
              style={{ touchAction: 'manipulation' }}
            >
              🌐 Social Media
            </button>
          </div>

          {shareMode === 'internal' ? (
            <>
              {/* Internal Share Options */}
              <div className="space-y-4 mb-6">
                <label className="flex items-center space-x-3 cursor-pointer p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                  <input
                    type="checkbox"
                    checked={shareOptions.shareOnTimeline}
                    onChange={() => handleCheckboxChange('shareOnTimeline')}
                    className="w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  />
                  <div className="flex items-center space-x-3">
                    <span className="text-2xl">📝</span>
                    <div>
                      <span className="text-gray-700 dark:text-gray-300 font-medium">Share on my timeline</span>
                      <p className="text-xs text-gray-500 dark:text-gray-400">Post to your profile timeline</p>
                    </div>
                  </div>
                </label>
                
                <label className="flex items-center space-x-3 cursor-pointer p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                  <input
                    type="checkbox"
                    checked={shareOptions.shareToPage}
                    onChange={() => handleCheckboxChange('shareToPage')}
                    className="w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  />
                  <div className="flex items-center space-x-3">
                    <span className="text-2xl">🏢</span>
                    <div>
                      <span className="text-gray-700 dark:text-gray-300 font-medium">Share to a page</span>
                      <p className="text-xs text-gray-500 dark:text-gray-400">Share on your business page</p>
                    </div>
                  </div>
                </label>
                
                <label className="flex items-center space-x-3 cursor-pointer p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                  <input
                    type="checkbox"
                    checked={shareOptions.shareToGroup}
                    onChange={() => handleCheckboxChange('shareToGroup')}
                    className="w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  />
                  <div className="flex items-center space-x-3">
                    <span className="text-2xl">👥</span>
                    <div>
                      <span className="text-gray-700 dark:text-gray-300 font-medium">Share to a group</span>
                      <p className="text-xs text-gray-500 dark:text-gray-400">Share in a community group</p>
                    </div>
                  </div>
                </label>

                {/* Privacy Options */}
                {shareOptions.shareOnTimeline && (
                  <div className="ml-8 mt-4 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">Privacy Settings</label>
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
                          <span className="text-sm text-gray-700 dark:text-gray-300 font-medium">Friends</span>
                          <p className="text-xs text-gray-500 dark:text-gray-400">Visible to your friends only</p>
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
                          <span className="text-sm text-gray-700 dark:text-gray-300 font-medium">Public</span>
                          <p className="text-xs text-gray-500 dark:text-gray-400">Visible to everyone</p>
                        </div>
                      </label>
                    </div>
                  </div>
                )}
              </div>

              {/* Custom Message */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                  Add a message (optional)
                </label>
                <textarea
                  value={shareOptions.customMessage}
                  onChange={(e) => setShareOptions(prev => ({ ...prev, customMessage: e.target.value }))}
                  placeholder={isAlbum ? "Write something about this album..." : "Write something here..."}
                  className="w-full h-28 px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl resize-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
                  maxLength={500}
                />
                <div className="text-xs text-gray-500 dark:text-gray-400 mt-2 text-right">
                  {shareOptions.customMessage.length}/500
                </div>
              </div>
            </>
          ) : (
            <>
                             {/* Social Media Share Options */}
               <div className="mb-4 sm:mb-6">
                 <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3 sm:mb-4">Share to social platforms</h4>
                 <div className="grid grid-cols-2 gap-2 sm:gap-3">
                   {socialPlatforms.map((platform) => (
                     <button
                       key={platform.id}
                       onClick={() => handleSocialShare(platform.id)}
                       className={`flex items-center space-x-2 sm:space-x-3 p-3 sm:p-4 rounded-xl border-2 border-gray-200 dark:border-gray-600 hover:border-blue-300 dark:hover:border-blue-500 transition-all duration-200 hover:shadow-md touch-manipulation ${
                         shareOptions.socialPlatforms?.includes(platform.id)
                           ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                           : 'bg-white dark:bg-gray-700'
                       }`}
                       style={{ touchAction: 'manipulation' }}
                     >
                       <span className="text-xl sm:text-2xl">{platform.icon}</span>
                       <span className="text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300">
                         {platform.name}
                       </span>
                     </button>
                   ))}
                 </div>
               </div>

              {/* Custom Message for Social */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                  Custom message for social sharing
                </label>
                <textarea
                  value={shareOptions.customMessage}
                  onChange={(e) => setShareOptions(prev => ({ ...prev, customMessage: e.target.value }))}
                  placeholder="Write a message to share with your social media followers..."
                  className="w-full h-24 px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl resize-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
                  maxLength={280}
                />
                <div className="text-xs text-gray-500 dark:text-gray-400 mt-2 text-right">
                  {shareOptions.customMessage.length}/280
                </div>
              </div>
            </>
          )}

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
            <button
              onClick={onClose}
              className="flex-1 py-3 px-4 bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-xl font-medium hover:bg-gray-300 dark:hover:bg-gray-500 transition-colors text-sm touch-manipulation"
              style={{ touchAction: 'manipulation' }}
            >
              Cancel
            </button>
            <button
              onClick={handleShare}
              disabled={shareMode === 'internal' && !shareOptions.shareOnTimeline && !shareOptions.shareToPage && !shareOptions.shareToGroup}
              className="flex-1 py-3 px-4 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors text-sm touch-manipulation"
              style={{ touchAction: 'manipulation' }}
            >
              {shareMode === 'internal' ? 'Share' : 'Copy Link'}
            </button>
          </div>
        </div>
      </div>
    </div>
    </>
  );
};

export default SharePopup;
export type { ShareOptions }; 
