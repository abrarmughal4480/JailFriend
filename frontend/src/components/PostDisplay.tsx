'use client';
import React, { useState, useRef, useEffect } from 'react';
import { Heart, MessageCircle, Share2, ChevronDown, Smile, Paperclip, Send, MoreHorizontal, Globe } from 'lucide-react';
import { getCurrentUserId } from '@/utils/auth';
import { useDarkMode } from '@/contexts/DarkModeContext';
import { useSystemThemeOverride } from '@/hooks/useSystemThemeOverride';
import SharePopup, { ShareOptions } from './SharePopup';
import ReactionPopup, { ReactionType } from './ReactionPopup';
import MobileReactionPopup from './MobileReactionPopup';
import PostOptionsDropdown from './PostOptionsDropdown';
import LocationDisplay from './LocationDisplay';

interface PostDisplayProps {
  post: any;
  isOwner?: boolean;
  onLike?: (postId: string) => void;
  onReaction?: (postId: string, reactionType: ReactionType) => void;
  onComment?: (postId: string, comment: string) => void;
  onSave?: (postId: string) => void;
  onShare?: (postId: string, shareOptions: ShareOptions) => void;
  onDelete?: (postId: string) => void;
  onEdit?: (post: any) => void;
  onToggleComments?: (postId: string) => void;
  onPostUpdate?: (updatedPost: any) => void;
  showEditDelete?: boolean;
}

// Theme utility - DEFAULT LIGHT, can be overridden by dark mode
const getThemeClasses = (isDark: boolean) => ({
  container: isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200',
  text: {
    primary: isDark ? 'text-white' : 'text-black',
    secondary: isDark ? 'text-gray-400' : 'text-gray-500',
    tertiary: isDark ? 'text-gray-300' : 'text-gray-600',
  },
  border: isDark ? 'border-gray-600' : 'border-gray-200',
  bg: {
    hover: isDark ? 'hover:bg-gray-700' : 'hover:bg-gray-50',
    secondary: isDark ? 'bg-gray-700' : 'bg-gray-100',
    input: isDark ? 'bg-gray-800' : 'bg-gray-50',
  },
  input: {
    base: isDark 
      ? 'border-gray-600 bg-gray-800 text-white placeholder-gray-400' 
      : 'border-gray-300 bg-white text-gray-900 placeholder-gray-500',
  },
  button: {
    primary: isDark 
      ? 'bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600' 
      : 'bg-blue-500 hover:bg-blue-600 disabled:bg-blue-300',
  },
});

export default function PostDisplay({ 
  post, 
  isOwner = false,
  onLike,
  onReaction,
  onComment,
  onSave,
  onShare,
  onDelete,
  onEdit,
  onToggleComments,
  onPostUpdate,
  showEditDelete = false
}: PostDisplayProps) {
  useSystemThemeOverride();
  
  const { isDarkMode } = useDarkMode();
  const theme = getThemeClasses(isDarkMode);
  
  const [showCommentInput, setShowCommentInput] = useState(false);
  const [commentText, setCommentText] = useState('');
  const [showSharePopup, setShowSharePopup] = useState(false);
  const [showReactionPopup, setShowReactionPopup] = useState(false);
  const [reactionTimeout, setReactionTimeout] = useState<NodeJS.Timeout | null>(null);
  const [showOptionsDropdown, setShowOptionsDropdown] = useState(false);
  const [showReactionsTemporarily, setShowReactionsTemporarily] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [showLikedUsers, setShowLikedUsers] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [isReacting, setIsReacting] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 640);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  useEffect(() => {
    console.log('📸 PostDisplay mounted - Post ID:', post._id, 'Media count:', post.media?.length || 0);
    
    const trackView = async () => {
      const token = localStorage.getItem('token');
      if (token && post._id) {
        try {
          const API_URL = process.env.NEXT_PUBLIC_API_URL;
          await fetch(`${API_URL}/api/posts/${post._id}/view`, {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${token}`
            }
          });
        } catch (error) {
          console.error('Error tracking view:', error);
        }
      }
    };
    
    trackView();
  }, [post._id]);

  useEffect(() => {
    console.log('📸 PostDisplay post changed - Post ID:', post._id, 'Media:', post.media);
  }, [post]);

  const getMediaUrl = (url: string) => {
    if (!url) return '/default-avatar.svg';
    if (url.startsWith('http')) return url;
    
    if (url.includes('localhost:3000')) {
      const correctedUrl = url.replace('http://localhost:3000', 'https://jaifriend-backend.hgdjlive.com');
      console.log('🔗 getMediaUrl - Fixed localhost URL:', { original: url, corrected: correctedUrl });
      return correctedUrl;
    }
    
    const cleanUrl = url.startsWith('/') ? url.substring(1) : url;
    const fullUrl = `${process.env.NEXT_PUBLIC_API_URL}/${cleanUrl}`;
    console.log('📸 getMediaUrl - Original:', url, 'Full:', fullUrl);
    return fullUrl;
  };

  const getCurrentReaction = (): ReactionType | null => {
    if (post.reactions && Array.isArray(post.reactions)) {
      const token = localStorage.getItem('token');
      if (token) {
        return post.reactions.length > 0 ? post.reactions[0].type : null;
      }
    }
    return null;
  };

  const handlePollVote = async (optionIndex: number) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        alert('Please login to vote in polls.');
        return;
      }

      if (post.poll.userVote && post.poll.userVote.includes(optionIndex)) {
        const API_URL = process.env.NEXT_PUBLIC_API_URL;
        const response = await fetch(`${API_URL}/api/posts/${post._id}/poll/vote`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ optionIndex })
        });

        if (response.ok) {
          const updatedPost = { ...post };
          if (updatedPost.poll.userVote) {
            updatedPost.poll.userVote = updatedPost.poll.userVote.filter((vote: number) => vote !== optionIndex);
          }
          if (onPostUpdate) {
            onPostUpdate(updatedPost);
          }
        }
      } else {
        const API_URL = process.env.NEXT_PUBLIC_API_URL;
        const response = await fetch(`${API_URL}/api/posts/${post._id}/poll/vote`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ optionIndex })
        });

        if (response.ok) {
          const data = await response.json();
          const updatedPost = { ...post };
          updatedPost.poll = data.poll;
          if (onPostUpdate) {
            onPostUpdate(updatedPost);
          }
        } else {
          alert('Failed to vote. Please try again.');
        }
      }
    } catch (error) {
      console.error('Error voting in poll:', error);
      alert('Error voting in poll. Please try again.');
    }
  };

  const getReactionCount = (): number => {
    if (post.reactions && Array.isArray(post.reactions)) {
      return post.reactions.length;
    }
    return post.likes ? (Array.isArray(post.likes) ? post.likes.length : post.likes) : 0;
  };

  const getMostCommonReactionEmoji = (): string => {
    if (post.reactions && Array.isArray(post.reactions) && post.reactions.length > 0) {
      const reactionCounts: { [key: string]: number } = {};
      post.reactions.forEach((reaction: any) => {
        reactionCounts[reaction.type] = (reactionCounts[reaction.type] || 0) + 1;
      });
      
      const mostCommon = Object.keys(reactionCounts).reduce((a, b) => 
        reactionCounts[a] > reactionCounts[b] ? a : b
      );
      
      const reactionEmojis: { [key: string]: string } = {
        like: '👍',
        love: '❤️',
        haha: '😂',
        wow: '😮',
        sad: '😢',
        angry: '😠'
      };
      
      return reactionEmojis[mostCommon] || '👍';
    }
    return '👍';
  };

  const handleReactionButtonMouseEnter = () => {
    if (reactionTimeout) {
      clearTimeout(reactionTimeout);
    }
    setShowReactionPopup(true);
  };

  const handleReactionButtonMouseLeave = () => {
    const timeout = setTimeout(() => {
      setShowReactionPopup(false);
    }, 300);
    setReactionTimeout(timeout);
  };

  const handleReactionPopupMouseEnter = () => {
    if (reactionTimeout) {
      clearTimeout(reactionTimeout);
    }
  };

  const handleReactionPopupMouseLeave = () => {
    setShowReactionPopup(false);
  };

  const handleReaction = async (reactionType: ReactionType) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        alert('Please login to add a reaction.');
        return;
      }

      setIsReacting(true);

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'https://jaifriend-backend.hgdjlive.com'}/api/posts/${post._id}/reaction`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          reactionType: reactionType
        })
      });

      if (response.ok) {
        const data = await response.json();
        console.log('Reaction updated successfully:', data);
        
        if (onPostUpdate) {
          if (data.post) {
            onPostUpdate(data.post);
          } else {
            console.log('API response missing post data, refreshing page...');
            window.location.reload();
          }
        }
      } else {
        const errorData = await response.json().catch(() => ({}));
        console.error('Failed to update reaction:', errorData);
        alert(`Failed to update reaction: ${errorData.message || 'Unknown error'}`);
      }
    } catch (error: any) {
      console.error('Error adding reaction:', error);
      
      let errorMessage = 'Error adding reaction. Please try again.';
      
      if (error.message) {
        errorMessage = error.message;
      } else if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.response?.data?.error) {
        errorMessage = error.response.data.error;
      }
      
      alert(errorMessage);
    } finally {
      setIsReacting(false);
      setShowReactionPopup(false);
    }
  };

  const currentUserId = getCurrentUserId();
  const isSaved = post.savedBy && Array.isArray(post.savedBy) && 
    post.savedBy.some((savedUser: any) => {
      if (typeof savedUser === 'string') {
        return savedUser === currentUserId;
      } else if (savedUser && typeof savedUser === 'object') {
        return savedUser._id === currentUserId || savedUser.userId === currentUserId;
      }
      return false;
    });

  const totalReactions = (post.likes?.length || 0) + (post.reactions?.length || 0);

  return (
    <div className={`${theme.container} rounded-xl shadow border p-2 sm:p-3 md:p-4 mb-3 sm:mb-4 md:mb-6 transition-colors duration-200`}>
      {/* Header Section */}
      <div className="flex items-center gap-2 sm:gap-3 mb-2 sm:mb-3">
        <img 
          src={post.user?.avatar ? getMediaUrl(post.user.avatar) : '/default-avatar.svg'} 
          alt="avatar" 
          className="w-7 h-7 sm:w-8 sm:h-8 md:w-10 md:h-10 rounded-full flex-shrink-0 object-cover" 
          onError={(e) => {
            console.log('❌ Avatar load failed for user:', post.user?.name, 'URL:', post.user?.avatar);
            e.currentTarget.src = '/default-avatar.svg';
          }}
        />
        <div className="flex-1 min-w-0">
          {post.user ? (
            <a 
              href={`/dashboard/profile/${(() => {
                if (post.user.userId && typeof post.user.userId === 'object' && post.user.userId._id) {
                  return post.user.userId._id;
                }
                return String(post.user.userId || post.user._id || post.user.id || 'unknown');
              })()}`} 
              className={`font-semibold hover:underline cursor-pointer text-xs sm:text-sm md:text-base truncate block ${theme.text.primary}`}
            >
              {post.user?.name || 'Unknown User'}
            </a>
          ) : (
            <div className={`font-semibold text-xs sm:text-sm md:text-base truncate ${theme.text.primary}`}>
              {post.user?.name || 'Unknown User'}
            </div>
          )}
          <div className={`text-xs ${theme.text.secondary}`}>
            {new Date(post.createdAt).toLocaleString()}
            {post.isShared && (
              <span className="ml-1 sm:ml-2 text-xs text-blue-500">📤 Shared</span>
            )}
          </div>
        </div>
      </div>

      {/* Content Section */}
      <div className="mb-2 sm:mb-3">
        <div className={`text-xs sm:text-sm md:text-base leading-relaxed ${theme.text.primary}`}>
          {(() => {
            const content = post.content || '';
            const preMatchForPreview = content.includes('<pre') ? content.match(/<pre[^>]*>([\s\S]*?)<\/pre>/) : null;
            const plainTextForPreview = (preMatchForPreview ? preMatchForPreview[1] : content).replace(/<[^>]+>/g, '');
            const wordCount = plainTextForPreview.split(/\s+/).filter((word: string) => word && word.length > 0).length;
            
            console.log('🔍 PostDisplay - Content Debug:', {
              postId: post._id,
              contentLength: content.length,
              wordCount: wordCount,
            });
            
            const formatContent = (text: string) => {
              if (text.includes('<pre')) {
                const match = text.match(/<pre[^>]*>([\s\S]*?)<\/pre>/);
                const inner = match ? match[1] : text;
                return (
                  <pre className={`whitespace-pre-wrap break-words font-sans ${isDarkMode ? 'text-white bg-gray-700' : 'text-black bg-gray-100'} p-2 rounded`}>
                    {inner}
                  </pre>
                );
              }
              
              const paragraphs = text.split(/\n\n+/);
              
              return paragraphs.map((paragraph, index) => {
                if (paragraph.trim() === '') return null;
                
                const lines = paragraph.split(/\n/);
                
                return (
                  <div key={index} className="mb-3">
                    {lines.map((line, lineIndex) => {
                      if (line.trim() === '') return null;
                      
                      const hasEmoji = /^[🚩✨✅💬🔴🟡🟢🔵⚫🟣🟠⚪🟤]/.test(line.trim());
                      const isBulletPoint = /^[•·▪▫‣⁃]/.test(line.trim());
                      
                      return (
                        <div key={lineIndex} className={`${lineIndex > 0 ? 'mt-2' : ''} ${hasEmoji || isBulletPoint ? 'flex items-start gap-2' : ''}`}>
                          {hasEmoji || isBulletPoint ? (
                            <>
                              <span className="text-lg flex-shrink-0">{line.trim().charAt(0)}</span>
                              <span className="flex-1">{line.trim().substring(1)}</span>
                            </>
                          ) : (
                            <span>{line}</span>
                          )}
                        </div>
                      );
                    })}
                  </div>
                );
              });
            };
            
            if (wordCount > 300) {
              const lines = plainTextForPreview.split('\n');
              const maxLines = 4;
              const truncatedPreview = lines.slice(0, maxLines).join('\n');
              
              return (
                <div>
                  <div className={theme.text.primary}>
                    {isExpanded ? formatContent(content) : (
                      <div className="break-words whitespace-pre-wrap">{truncatedPreview}</div>
                    )}
                  </div>
                  <span 
                    className="text-blue-500 cursor-pointer hover:underline ml-1 mt-2 inline-block" 
                    onClick={() => setIsExpanded(!isExpanded)}
                  >
                    {isExpanded ? '... Show Less' : '... Read More'}
                  </span>
                </div>
              );
            } else {
              return <div className={theme.text.primary}>{formatContent(content)}</div>;
            }
          })()}
        </div>
      </div>

      {/* Poll Display */}
      {post.poll && post.poll.question && post.poll.options && post.poll.options.length > 0 && (
        <div className={`mb-2 sm:mb-3 p-3 ${isDarkMode ? 'bg-blue-900/20 border-blue-800' : 'bg-blue-50 border-blue-200'} rounded-lg border`}>
          <div className="mb-2">
            <h4 className={`text-sm font-semibold mb-2 ${isDarkMode ? 'text-blue-100' : 'text-blue-900'}`}>
              📊 {post.poll.question}
            </h4>
            <div className="space-y-2">
              {post.poll.options.map((option: any, index: number) => {
                const totalVotes = post.poll.totalVotes || 0;
                const optionVotes = option.voteCount || 0;
                const percentage = totalVotes > 0 ? Math.round((optionVotes / totalVotes) * 100) : 0;
                const isVoted = post.poll.userVote && post.poll.userVote.includes(index);
                
                return (
                  <div key={index} className="relative">
                    <button
                      onClick={() => handlePollVote(index)}
                      className={`w-full text-left p-2 rounded-lg border transition-all duration-200 ${
                        isVoted 
                          ? 'bg-blue-500 text-white border-blue-500' 
                          : `${isDarkMode ? 'bg-gray-700 text-white border-gray-600 hover:bg-gray-600' : 'bg-white text-gray-900 border-gray-300 hover:bg-gray-100'}`
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-sm">{option.text}</span>
                        <span className="text-xs">
                          {optionVotes} votes ({percentage}%)
                        </span>
                      </div>
                      <div className={`mt-1 w-full rounded-full h-2 ${isDarkMode ? 'bg-gray-600' : 'bg-gray-200'}`}>
                        <div 
                          className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                    </button>
                  </div>
                );
              })}
            </div>
            <div className={`mt-2 text-xs ${theme.text.secondary}`}>
              Total votes: {post.poll.totalVotes || 0}
              {post.poll.expiresAt && (
                <span className="ml-2">
                  • Expires: {new Date(post.poll.expiresAt).toLocaleDateString()}
                </span>
              )}
            </div>
          </div>
        </div>
      )}
      
      {/* Feeling Display */}
      {post.feeling && post.feeling.type && post.feeling.emoji && post.feeling.description && (
        <div className={`mb-2 sm:mb-3 p-3 ${isDarkMode ? 'bg-pink-900/20 border-pink-800' : 'bg-pink-50 border-pink-200'} rounded-lg border`}>
          <div className="flex items-center gap-2">
            <span className="text-2xl">{post.feeling.emoji}</span>
            <div>
              <h4 className={`text-sm font-semibold ${isDarkMode ? 'text-pink-100' : 'text-pink-900'}`}>
                Feeling {post.feeling.description}
              </h4>
              <p className={`text-xs ${isDarkMode ? 'text-pink-300' : 'text-pink-700'}`}>
                Intensity: {post.feeling.intensity}/10
              </p>
            </div>
          </div>
        </div>
      )}
      
      {/* Location Display */}
      {post.location && post.location.name && post.location.address && (
        <div className="mb-2 sm:mb-3">
          <LocationDisplay 
            location={{
              name: post.location.name || 'Unknown Location',
              address: post.location.address || post.location.formatted_address || 'Location',
              coordinates: {
                latitude: post.location.coordinates?.lat || post.location.coordinates?.latitude || 0,
                longitude: post.location.coordinates?.lng || post.location.coordinates?.longitude || 0
              },
              country: post.location.country,
              state: post.location.state,
              city: post.location.city,
              postalCode: post.location.postalCode,
              timezone: post.location.timezone,
              isp: post.location.isp,
              ip: post.location.ip,
              source: post.location.source
            }}
            compact={true}
            showCoordinates={false}
          />
        </div>
      )}
      
      {/* Sell Info Display */}
      {post.sell && post.sell.productName && post.sell.price && (
        <div className={`mb-2 sm:mb-3 p-3 ${isDarkMode ? 'bg-orange-900/20 border-orange-800' : 'bg-orange-50 border-orange-200'} rounded-lg border`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-2xl">🏪</span>
              <div>
                <h4 className={`text-sm font-semibold ${isDarkMode ? 'text-orange-100' : 'text-orange-900'}`}>
                  {post.sell.productName}
                </h4>
                <p className={`text-xs ${isDarkMode ? 'text-orange-300' : 'text-orange-700'}`}>
                  Condition: {post.sell.condition}
                  {post.sell.negotiable && <span className="ml-2">• Price negotiable</span>}
                </p>
              </div>
            </div>
            <div className="text-right">
              <div className={`text-lg font-bold ${isDarkMode ? 'text-orange-100' : 'text-orange-900'}`}>
                ${post.sell.price}
              </div>
              <div className={`text-xs ${isDarkMode ? 'text-orange-300' : 'text-orange-700'}`}>
                {post.sell.currency || 'USD'}
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* GIF Display */}
      {post.gif && post.gif.url && post.gif.url !== 'undefined' && (
        <div className="mb-2 sm:mb-3">
          <img 
            src={post.gif.url} 
            alt="GIF"
            className="w-full max-h-96 rounded-lg object-contain"
          />
        </div>
      )}
      
      {/* Voice Recording Display */}
      {post.voice && post.voice.url && post.voice.duration && (
        <div className={`mb-2 sm:mb-3 p-3 ${isDarkMode ? 'bg-purple-900/20 border-purple-800' : 'bg-purple-50 border-purple-200'} rounded-lg border`}>
          <div className="flex items-center gap-2">
            <span className="text-2xl">🎤</span>
            <div className="flex-1">
              <h4 className={`text-sm font-semibold mb-2 ${isDarkMode ? 'text-purple-100' : 'text-purple-900'}`}>
                Voice Message
              </h4>
              <audio controls className="w-full">
                <source src={post.voice.url} type="audio/wav" />
                Your browser does not support the audio element.
              </audio>
              <p className={`text-xs mt-1 ${isDarkMode ? 'text-purple-300' : 'text-purple-700'}`}>
                Duration: {post.voice.duration}s
                {post.voice.transcription && (
                  <span className="ml-2">• Transcription: {post.voice.transcription}</span>
                )}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Media Display */}
      {post.media && post.media.length > 0 && (
        <div className="mb-2 sm:mb-3">
          {post.media.map((media: any, index: number) => (
            <div key={index} className="mb-2">
              {media.type === 'video' ? (
                <video 
                  src={getMediaUrl(media.url)} 
                  controls 
                  className="w-full object-contain rounded-lg shadow-lg"
                  style={{ maxHeight: '80vh' }}
                />
              ) : media.type === 'audio' ? (
                <div className={`${theme.container} rounded-lg p-4 border`}>
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">🎵</span>
                    <div className="flex-1">
                      <p className={`text-sm font-medium ${theme.text.primary}`}>
                        {media.originalName || 'Audio File'}
                      </p>
                      <p className={`text-xs ${theme.text.secondary}`}>
                        {(media.size / 1024 / 1024).toFixed(1)}MB
                      </p>
                    </div>
                    <audio
                      src={getMediaUrl(media.url)}
                      controls
                      className="w-full"
                    />
                  </div>
                </div>
              ) : media.type === 'file' ? (
                <div className={`${isDarkMode ? 'bg-blue-800 border-blue-700' : 'bg-blue-50 border-blue-200'} rounded-lg p-4 border`}>
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">
                      {media.mimetype?.includes('pdf') ? '📕' : 
                       media.mimetype?.includes('word') ? '📘' : 
                       media.mimetype?.includes('excel') ? '📗' : '📄'}
                    </span>
                    <div className="flex-1">
                      <p className={`text-sm font-medium ${isDarkMode ? 'text-blue-100' : 'text-blue-900'}`}>
                        {media.originalName || 'Document'}
                      </p>
                      <p className={`text-xs ${isDarkMode ? 'text-blue-300' : 'text-blue-700'}`}>
                        {(media.size / 1024 / 1024).toFixed(1)}MB • {media.extension?.toUpperCase()}
                      </p>
                    </div>
                    <a
                      href={getMediaUrl(media.url)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-3 py-1 bg-blue-500 text-white text-xs rounded-lg hover:bg-blue-600 transition-colors"
                    >
                      Download
                    </a>
                  </div>
                </div>
              ) : (
                <img
                  src={getMediaUrl(media.url)}
                  alt="media"
                  className="w-full object-contain rounded-lg shadow-lg"
                  style={{ maxHeight: '80vh' }}
                />
              )}
            </div>
          ))}
        </div>
      )}

      {/* Engagement Metrics Section */}
      <div className={`py-2 border-b ${theme.border}`}>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-0">
          {/* Reactions */}
          <div className="flex items-center space-x-2">
            <span className="text-pink-500 text-base sm:text-lg">❤️</span>
            <span className="text-blue-500 text-base sm:text-lg">👍</span>
            <span className="text-yellow-500 text-base sm:text-lg">😊</span>
            <span className={`${theme.text.secondary} text-xs sm:text-sm font-medium ml-1`}>
              {totalReactions}
            </span>
          </div>
          
          {/* Statistics */}
          <div className="flex items-center space-x-2 sm:space-x-4 text-xs sm:text-sm">
            <div className={`flex items-center space-x-1 ${theme.text.secondary}`}>
              <span className="text-base sm:text-lg">💬</span>
              <span className="text-xs sm:text-sm">{post.comments?.length || 0} Comments</span>
            </div>
            <div className={`flex items-center space-x-1 ${theme.text.secondary}`}>
              <span className="text-base sm:text-lg">👁️</span>
              <span className="text-xs sm:text-sm">{post.views?.length || post.views || 0} Views</span>
            </div>
            <div className={`flex items-center space-x-1 ${theme.text.secondary}`}>
              <span className="text-base sm:text-lg">⭐</span>
              <span className="text-xs sm:text-sm">{post.reviews?.length || 0} Reviews</span>
            </div>
          </div>
        </div>
        
        {/* Temporary Reaction Display */}
        {showReactionsTemporarily && (
          <div className={`mt-3 pt-3 border-t ${theme.border}`}>
            <div className="flex flex-wrap gap-2">
              {(() => {
                if (post.reactions && Array.isArray(post.reactions) && post.reactions.length > 0) {
                  const reactionCounts: { [key: string]: number } = {};
                  post.reactions.forEach((reaction: any) => {
                    reactionCounts[reaction.type] = (reactionCounts[reaction.type] || 0) + 1;
                  });
                  
                  const reactionEmojis: { [key: string]: string } = {
                    like: '👍',
                    love: '❤️',
                    haha: '😂',
                    wow: '😮',
                    sad: '😢',
                    angry: '😠'
                  };
                  
                  return Object.entries(reactionCounts).map(([type, count]) => (
                    <div key={type} className={`flex items-center space-x-1 ${isDarkMode ? 'bg-gray-700' : 'bg-gray-100'} rounded-full px-3 py-1 border ${theme.border}`}>
                      <span className="text-lg">{reactionEmojis[type] || '😊'}</span>
                      <span className={`text-sm ${theme.text.primary}`}>{count}</span>
                    </div>
                  ));
                } else if (post.likes && Array.isArray(post.likes) && post.likes.length > 0) {
                  return (
                    <div className={`flex items-center space-x-1 ${isDarkMode ? 'bg-gray-700' : 'bg-gray-100'} rounded-full px-3 py-1 border ${theme.border}`}>
                      <span className="text-lg">👍</span>
                      <span className={`text-sm ${theme.text.primary}`}>{post.likes.length}</span>
                    </div>
                  );
                } else {
                  return (
                    <div className={`text-sm ${theme.text.secondary}`}>
                      No reactions yet
                    </div>
                  );
                }
              })()}
            </div>
          </div>
        )}

        {/* Liked Users Display */}
        {showLikedUsers && (
          <div className={`mt-3 pt-3 border-t ${theme.border} ${theme.bg.secondary} border ${theme.border} p-3 rounded-lg`}>
            <div className="mb-2">
              <h4 className={`text-sm font-semibold mb-2 ${theme.text.primary}`}>
                👍 Liked Users Section
              </h4>
            </div>
            
            {post.likes && post.likes.length > 0 ? (
              <>
                <div className="mb-2">
                  <span className={`text-xs ${theme.text.primary}`}>
                    Total likes: {post.likes.length}
                  </span>
                </div>
                <div className="flex items-center gap-2 flex-wrap">
                  {post.likes.map((like: any, index: number) => {
                    const userAvatar = typeof like === 'string' ? '/default-avatar.svg' : (like.avatar || '/default-avatar.svg');
                    
                    return (
                      <img 
                        key={index}
                        src={getMediaUrl(userAvatar)} 
                        alt="user avatar" 
                        className={`w-8 h-8 rounded-full object-cover border-2 shadow-sm ${isDarkMode ? 'border-gray-800' : 'border-gray-200'}`}
                        onError={(e) => {
                          e.currentTarget.src = '/default-avatar.svg';
                        }}
                      />
                    );
                  })}
                </div>
              </>
            ) : (
              <div className={`text-sm ${theme.text.secondary}`}>
                No likes yet
              </div>
            )}
            
            <button 
              onClick={() => setShowLikedUsers(false)}
              className={`mt-2 text-xs ${isDarkMode ? 'text-blue-400 hover:text-blue-300' : 'text-blue-500 hover:text-blue-700'}`}
            >
              Hide liked users
            </button>
          </div>
        )}
      </div>

      {/* Action Buttons Section */}
      <div className="py-2 sm:py-3">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-3 md:gap-0">
          <div className="flex items-center justify-center sm:justify-start space-x-3 sm:space-x-3 md:space-x-6">
            {/* React Button */}
            <div className="relative">
              <button 
                onMouseEnter={handleReactionButtonMouseEnter}
                onMouseLeave={handleReactionButtonMouseLeave}
                onClick={() => {
                  if (onLike) {
                    onLike(post._id);
                  }
                  console.log('🔍 React button clicked!');
                  setShowLikedUsers(!showLikedUsers);
                }}
                className={`flex flex-col items-center justify-center transition-colors touch-manipulation min-h-[60px] ${
                  getCurrentReaction() ? 'text-red-500' : 'hover:text-red-500'
                }`}
                style={{ touchAction: 'manipulation' }}
              >
                <span className={`font-medium text-xs mb-2 text-center ${theme.text.primary}`}>React</span>
                <div className={`w-5 h-5 rounded-full flex items-center justify-center transition-colors ${
                  getCurrentReaction() 
                    ? getCurrentReaction() === 'like' 
                      ? 'bg-blue-500 hover:bg-blue-600' 
                      : getCurrentReaction() === 'love'
                      ? 'bg-red-500 hover:bg-red-600'
                      : getCurrentReaction() === 'haha'
                      ? 'bg-yellow-500 hover:bg-yellow-600'
                      : getCurrentReaction() === 'wow'
                      ? 'bg-purple-500 hover:bg-purple-600'
                      : getCurrentReaction() === 'sad'
                      ? 'bg-blue-400 hover:bg-blue-500'
                      : getCurrentReaction() === 'angry'
                      ? 'bg-red-600 hover:bg-red-700'
                      : `${isDarkMode ? 'bg-gray-600' : 'bg-gray-300'}`
                    : `${isDarkMode ? 'bg-gray-600' : 'bg-gray-300'}`
                }`}>
                  <span className="text-sm">
                    {getCurrentReaction() 
                      ? getCurrentReaction() === 'like' 
                        ? '👍' 
                        : getCurrentReaction() === 'love'
                        ? '❤️'
                        : getCurrentReaction() === 'haha'
                        ? '😂'
                        : getCurrentReaction() === 'wow'
                        ? '😮'
                        : getCurrentReaction() === 'sad'
                        ? '😢'
                        : getCurrentReaction() === 'angry'
                        ? '😠'
                        : '😊'
                      : '😊'
                    }
                  </span>
                </div>
              </button>
              
              {/* Reaction Popups */}
              <div
                onMouseEnter={handleReactionPopupMouseEnter}
                onMouseLeave={handleReactionPopupMouseLeave}
              >
                <div className="hidden sm:block">
                  <ReactionPopup
                    isOpen={showReactionPopup}
                    onClose={() => setShowReactionPopup(false)}
                    onReaction={handleReaction}
                    currentReaction={getCurrentReaction()}
                    position="top"
                  />
                </div>
                
                <MobileReactionPopup
                  isOpen={showReactionPopup}
                  onClose={() => setShowReactionPopup(false)}
                  onReaction={handleReaction}
                  currentReaction={getCurrentReaction()}
                  isReacting={isReacting}
                />
              </div>
            </div>
          
            {/* Comment Button */}
            <button 
              onClick={() => setShowCommentInput(!showCommentInput)}
              className="flex flex-col items-center justify-center hover:text-blue-500 transition-colors touch-manipulation min-h-[60px]"
              style={{ touchAction: 'manipulation' }}
            >
              <span className={`font-medium text-xs mb-2 text-center ${theme.text.primary}`}>Comment</span>
              <div className={`w-5 h-5 rounded-full flex items-center justify-center ${isDarkMode ? 'bg-gray-600' : 'bg-gray-300'}`}>
                <span className="text-sm">💬</span>
              </div>
            </button>
          
            {/* Share Button */}
            <button 
              onClick={() => setShowSharePopup(true)}
              className="flex flex-col items-center justify-center hover:text-green-500 transition-colors touch-manipulation min-h-[60px]"
              style={{ touchAction: 'manipulation' }}
            >
              <span className={`font-medium text-xs mb-2 text-center ${theme.text.primary}`}>Share</span>
              <div className={`w-5 h-5 rounded-full flex items-center justify-center ${isDarkMode ? 'bg-gray-600' : 'bg-gray-300'}`}>
                <span className="text-sm">📤</span>
              </div>
            </button>
            
            {/* Review Button */}
            <button 
              className="flex flex-col items-center justify-center hover:text-yellow-500 transition-colors touch-manipulation min-h-[70px] px-2"
              style={{ touchAction: 'manipulation' }}
            >
              <div className={`w-5 h-5 rounded-full flex items-center justify-center mb-2 ${isDarkMode ? 'bg-gray-600' : 'bg-gray-300'}`}>
                <span className="text-sm">⭐</span>
              </div>
              <span className={`font-medium text-xs text-center whitespace-nowrap ${theme.text.primary}`}>Review</span>
            </button>
          </div>
        
          <div className="flex items-center gap-1 sm:gap-2">
            <button 
              onClick={() => onSave && onSave(post._id)}
              className={`flex flex-col items-center justify-center px-2 py-1 rounded-lg transition-colors touch-manipulation min-h-[60px] ${
                isSaved ? 'bg-blue-100 dark:bg-blue-900/20' : 'hover:text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20'
              }`}
              style={{ touchAction: 'manipulation' }}
            >
              <span className={`text-xs font-medium mb-2 text-center ${theme.text.primary}`}>{isSaved ? 'Saved' : 'Save'}</span>
              <span className="text-base">{isSaved ? '💾' : '🔖'}</span>
            </button>
            
            {/* Edit and Delete buttons */}
            {showEditDelete && isOwner && (
              <>
                <button 
                  onClick={() => onEdit && onEdit(post)}
                  className={`flex flex-col items-center px-2 py-1 rounded-lg ${isDarkMode ? 'text-white hover:text-blue-400 hover:bg-blue-900/20' : 'text-gray-600 hover:text-blue-500 hover:bg-blue-50'} transition-colors touch-manipulation`}
                  title="Edit post"
                  style={{ touchAction: 'manipulation' }}
                >
                  <span className="text-xs font-medium mb-1">Edit</span>
                  <span className="text-base">✏️</span>
                </button>
                
                <button 
                  onClick={() => {
                    if (confirm('Are you sure you want to delete this post?')) {
                      onDelete && onDelete(post._id);
                    }
                  }}
                  className={`flex flex-col items-center px-2 py-1 rounded-lg ${isDarkMode ? 'text-white hover:text-red-400 hover:bg-red-900/20' : 'text-gray-600 hover:text-red-500 hover:bg-red-50'} transition-colors touch-manipulation`}
                  title="Delete post"
                  style={{ touchAction: 'manipulation' }}
                >
                  <span className="text-xs font-medium mb-1">Delete</span>
                  <span className="text-base">🗑️</span>
                </button>
                
                {/* Comment Toggle Button */}
                <button 
                  onClick={() => {
                    if (onToggleComments) {
                      onToggleComments(post._id);
                    }
                  }}
                  className={`flex flex-col items-center px-2 py-1 rounded-lg ${isDarkMode ? 'text-white hover:text-yellow-400 hover:bg-yellow-900/20' : 'text-gray-600 hover:text-yellow-500 hover:bg-yellow-50'} transition-colors touch-manipulation`}
                  title={post.commentsEnabled !== false ? "Disable comments" : "Enable comments"}
                  style={{ touchAction: 'manipulation' }}
                >
                  <span className="text-xs font-medium mb-1">{post.commentsEnabled !== false ? 'Disable' : 'Enable'}</span>
                  <span className="text-base">{post.commentsEnabled !== false ? '🔇' : '💬'}</span>
                </button>
              </>
            )}
          </div>
        </div>

        {/* Comment Input */}
        {showCommentInput && (
          <div className={`mt-3 p-2 sm:p-3 ${theme.bg.secondary} rounded-lg border ${theme.border} transition-colors duration-200`}>
            <div className="flex gap-2">
              <input
                type="text"
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                placeholder="Write a comment and press enter"
                className={`flex-1 px-2 sm:px-3 py-1 sm:py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-sm ${theme.input.base}`}
              />
              <button
                onClick={() => {
                  if (commentText.trim() && onComment) {
                    onComment(post._id, commentText);
                    setCommentText('');
                    setShowCommentInput(false);
                  }
                }}
                disabled={!commentText.trim()}
                className={`px-3 sm:px-4 py-1 sm:py-2 rounded-lg transition-colors text-sm touch-manipulation ${theme.button.primary} text-white disabled:cursor-not-allowed`}
                style={{ touchAction: 'manipulation' }}
              >
                Post
              </button>
              <button
                onClick={() => setShowCommentInput(false)}
                className={`px-3 sm:px-4 py-1 sm:py-2 rounded-lg transition-colors text-sm touch-manipulation ${isDarkMode ? 'text-gray-300 hover:text-white' : 'text-gray-600 hover:text-gray-800'}`}
                style={{ touchAction: 'manipulation' }}
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        {/* Comments Display */}
        {post.comments && post.comments.length > 0 && (
          <div className="mt-3 space-y-2">
            {post.comments.slice(0, 3).map((comment: any, index: number) => (
              <div key={index} className={`flex items-start gap-2 p-2 ${theme.bg.secondary} rounded-lg border ${theme.border}`}>
                <img 
                  src={comment.user?.avatar ? getMediaUrl(comment.user.avatar) : '/default-avatar.svg'} 
                  alt="avatar" 
                  className="w-5 h-5 sm:w-6 sm:h-6 rounded-full flex-shrink-0 object-cover" 
                  onError={(e) => {
                    e.currentTarget.src = '/default-avatar.svg';
                  }}
                />
                <div className="flex-1 min-w-0">
                  {comment.user ? (
                    <a 
                      href={`/dashboard/profile/${(() => {
                        if (comment.user.userId && typeof comment.user.userId === 'object' && comment.user.userId._id) {
                          return comment.user.userId._id;
                        }
                        return String(comment.user.userId || comment.user._id || comment.user.id || 'unknown');
                      })()}`} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className={`text-xs sm:text-sm font-medium hover:underline cursor-pointer truncate block ${theme.text.primary}`}
                    >
                      {comment.user?.name || 'User'}
                    </a>
                  ) : (
                    <span className={`text-xs sm:text-sm font-medium truncate ${theme.text.primary}`}>{comment.user?.name || 'User'}</span>
                  )}
                  <div className={`text-xs ${theme.text.secondary} mt-1`}>
                    {new Date(comment.createdAt).toLocaleDateString()}
                  </div>
                  <span className={`text-xs sm:text-sm ml-1 sm:ml-2 break-words ${theme.text.primary}`}>{comment.text}</span>
                  <div className="flex items-center gap-3 mt-2">
                    <button className={`flex items-center gap-1 ${isDarkMode ? 'text-gray-300 hover:text-white' : 'text-gray-600 hover:text-gray-800'}`}>
                      <span>👍</span>
                      <span className="text-xs">Like</span>
                    </button>
                    <button className={`flex items-center gap-1 ${isDarkMode ? 'text-gray-300 hover:text-white' : 'text-gray-600 hover:text-gray-800'}`}>
                      <span>💬</span>
                      <span className="text-xs">Reply</span>
                    </button>
                  </div>
                </div>
              </div>
            ))}
            {post.comments.length > 3 && (
              <button className={`text-xs sm:text-sm ${isDarkMode ? 'text-blue-400 hover:text-blue-300' : 'text-blue-500 hover:text-blue-700'}`}>
                View all {post.comments.length} comments
              </button>
            )}
          </div>
        )}
      </div>

      {/* Share Popup */}
      <SharePopup
        isOpen={showSharePopup}
        onClose={() => setShowSharePopup(false)}
        onShare={(shareOptions) => {
          if (onShare) {
            onShare(post._id, shareOptions);
          }
        }}
        postContent={post.content}
        postMedia={post.media}
      />
    </div>
  );
}