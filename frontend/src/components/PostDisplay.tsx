'use client';
import React, { useState, useRef, useEffect } from 'react';
import { Heart, MessageCircle, Share2, ChevronDown, Smile, Paperclip, Send, MoreHorizontal, Globe } from 'lucide-react';
import { getCurrentUserId } from '@/utils/auth';
import { useDarkMode } from '@/contexts/DarkModeContext';
import SharePopup, { ShareOptions } from './SharePopup';
import ReactionPopup, { ReactionType } from './ReactionPopup';
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
  const { isDarkMode } = useDarkMode();
  const [showCommentInput, setShowCommentInput] = useState(false);
  const [commentText, setCommentText] = useState('');
  const [showSharePopup, setShowSharePopup] = useState(false);
  const [showReactionPopup, setShowReactionPopup] = useState(false);
  const [reactionTimeout, setReactionTimeout] = useState<NodeJS.Timeout | null>(null);
  const [showOptionsDropdown, setShowOptionsDropdown] = useState(false);
  const [showReactionsTemporarily, setShowReactionsTemporarily] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [showLikedUsers, setShowLikedUsers] = useState(false);

  // Track view when component mounts
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

  // Monitor post changes
  useEffect(() => {
    console.log('📸 PostDisplay post changed - Post ID:', post._id, 'Media:', post.media);
  }, [post]);

  const getMediaUrl = (url: string) => {
    if (!url) return '/default-avatar.svg';
    if (url.startsWith('http')) return url;
    
    // Handle localhost URLs that might be stored incorrectly
    if (url.includes('localhost:3000')) {
              const correctedUrl = url.replace('http://localhost:3000', 'https://jaifriend-backend.hgdjlive.com');
      console.log('🔗 getMediaUrl - Fixed localhost URL:', { original: url, corrected: correctedUrl });
      return correctedUrl;
    }
    
    // Remove leading slash to avoid double slashes
    const cleanUrl = url.startsWith('/') ? url.substring(1) : url;
    const fullUrl = `${process.env.NEXT_PUBLIC_API_URL}/${cleanUrl}`;
    console.log('📸 getMediaUrl - Original:', url, 'Full:', fullUrl);
    return fullUrl;
  };

  // Get current user's reaction
  const getCurrentReaction = (): ReactionType | null => {
    if (post.reactions && Array.isArray(post.reactions)) {
      const token = localStorage.getItem('token');
      if (token) {
        // In a real app, you'd decode the token to get userId
        // For now, we'll check if any reaction exists
        return post.reactions.length > 0 ? post.reactions[0].type : null;
      }
    }
    return null;
  };

  // Handle poll voting
  const handlePollVote = async (optionIndex: number) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        alert('Please login to vote in polls.');
        return;
      }

      // Check if user has already voted
      if (post.poll.userVote && post.poll.userVote.includes(optionIndex)) {
        // Remove vote
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
          // Update local state to reflect vote removal
          const updatedPost = { ...post };
          if (updatedPost.poll.userVote) {
            updatedPost.poll.userVote = updatedPost.poll.userVote.filter((vote: number) => vote !== optionIndex);
          }
          // Update the post state to reflect changes
          if (onPostUpdate) {
            onPostUpdate(updatedPost);
          }
        }
      } else {
        // Add vote
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
          // Update local state with the new poll data
          const updatedPost = { ...post };
          updatedPost.poll = data.poll;
          // Update the post state to reflect changes
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

  // Get reaction count
  const getReactionCount = (): number => {
    if (post.reactions && Array.isArray(post.reactions)) {
      return post.reactions.length;
    }
    // Fallback to likes count for backward compatibility
    return post.likes ? (Array.isArray(post.likes) ? post.likes.length : post.likes) : 0;
  };

  // Get most common reaction emoji
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

  const handleReaction = (reactionType: ReactionType) => {
    if (onReaction) {
      onReaction(post._id, reactionType);
    }
    // Show reactions temporarily after adding a reaction
    setShowReactionsTemporarily(true);
    setTimeout(() => {
      setShowReactionsTemporarily(false);
    }, 2000); // Hide after 2 seconds
  };

  // Get current user ID for save checking
  const currentUserId = getCurrentUserId();
  // Check if current user has saved this post
  const isSaved = post.savedBy && Array.isArray(post.savedBy) && 
    post.savedBy.some((savedUser: any) => {
      // Handle both user ID strings and user objects
      if (typeof savedUser === 'string') {
        return savedUser === currentUserId;
      } else if (savedUser && typeof savedUser === 'object') {
        return savedUser._id === currentUserId || savedUser.userId === currentUserId;
      }
      return false;
    });

  // Calculate total reactions (likes + other reactions if they exist)
  const totalReactions = (post.likes?.length || 0) + (post.reactions?.length || 0);

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow p-2 sm:p-3 md:p-4 mb-3 sm:mb-4 md:mb-6 transition-colors duration-200">
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
                // Handle populated user object (when userId is the full user object)
                if (post.user.userId && typeof post.user.userId === 'object' && post.user.userId._id) {
                  return post.user.userId._id;
                }
                return String(post.user.userId || post.user._id || post.user.id || 'unknown');
              })()}`} 
              className="font-semibold hover:underline cursor-pointer text-xs sm:text-sm md:text-base truncate block text-blue-600 dark:text-blue-400"
            >
              {post.user?.name || 'Unknown User'}
            </a>
          ) : (
            <div className="font-semibold text-xs sm:text-sm md:text-base truncate text-gray-900 dark:text-white">{post.user?.name || 'Unknown User'}</div>
          )}
          <div className="text-xs text-gray-400 dark:text-gray-500">
            {new Date(post.createdAt).toLocaleString()}
            {post.isShared && (
              <span className="ml-1 sm:ml-2 text-blue-600 dark:text-blue-400 text-xs">📤 Shared</span>
            )}
          </div>
        </div>
      </div>

      <div className="mb-2 sm:mb-3">
        {/* Content with word limit and Read More */}
        <div className="text-gray-800 dark:text-white text-xs sm:text-sm md:text-base leading-relaxed">
          {(() => {
            const content = post.content || '';
            const preMatchForPreview = content.includes('<pre') ? content.match(/<pre[^>]*>([\s\S]*?)<\/pre>/) : null;
            const plainTextForPreview = (preMatchForPreview ? preMatchForPreview[1] : content).replace(/<[^>]+>/g, '');
            const wordCount = plainTextForPreview.split(/\s+/).filter((word: string) => word && word.length > 0).length;
            
            // Debug logging to see what content we're working with
            console.log('🔍 PostDisplay - Content Debug:', {
              postId: post._id,
              contentLength: content.length,
              wordCount: wordCount,
              content: content,
              truncated: content.length > 200 ? content.substring(0, 200) + '...' : content
            });
            
            // Function to format content with line breaks and paragraphs
            const formatContent = (text: string) => {
              // Check if content contains HTML (from backend pre tags)
              if (text.includes('<pre')) {
                const match = text.match(/<pre[^>]*>([\s\S]*?)<\/pre>/);
                const inner = match ? match[1] : text;
                return (
                  <pre className="whitespace-pre-wrap break-words font-sans">{inner}</pre>
                );
              }
              
              // Fallback to original formatting for non-HTML content
              // Split by double line breaks to create paragraphs
              const paragraphs = text.split(/\n\n+/);
              
              return paragraphs.map((paragraph, index) => {
                if (paragraph.trim() === '') return null;
                
                // Split by single line breaks within paragraphs
                const lines = paragraph.split(/\n/);
                
                return (
                  <div key={index} className="mb-3">
                    {lines.map((line, lineIndex) => {
                      if (line.trim() === '') return null;
                      
                      // Check if line starts with emoji or special characters
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
              // Smart truncation that respects paragraph boundaries
              const smartTruncate = (text: string, maxWords: number) => {
                const words = text.split(/\s+/);
                if (words.length <= maxWords) return text;
                
                // Take first maxWords words
                let truncatedWords = words.slice(0, maxWords);
                
                // Try to find a good breaking point (end of sentence, paragraph, or bullet point)
                let truncatedText = truncatedWords.join(' ');
                
                // Look for natural break points in the last few words
                const lastWords = truncatedWords.slice(-10).join(' ');
                const breakPatterns = [
                  /[.!?]\s*$/,           // End of sentence
                  /\n\n\s*$/,            // End of paragraph
                  /[•·▪▫‣⁃]\s*$/,       // End of bullet point
                  /\n\s*$/,              // End of line
                  /\s*$/,                // End of word
                ];
                
                let foundBreak = false;
                for (const pattern of breakPatterns) {
                  if (pattern.test(truncatedText)) {
                    foundBreak = true;
                    break;
                  }
                }
                
                // If no natural break found, try to find the last complete sentence
                if (!foundBreak) {
                  const lastSentenceMatch = truncatedText.match(/.*[.!?]\s*$/);
                  if (lastSentenceMatch) {
                    truncatedText = lastSentenceMatch[0];
                  }
                }
                
                // IMPORTANT: Ensure truncated content is actually shorter than original
                // If the smart truncation didn't reduce the content enough, force a shorter version
                if (truncatedText.length >= text.length * 0.9) { // If truncated is 90% or more of original
                  // Force truncation to be more aggressive
                  const forceTruncateWords = Math.floor(maxWords * 0.7); // Use 70% of max words
                  const forcedWords = words.slice(0, forceTruncateWords);
                  truncatedText = forcedWords.join(' ');
                  
                  // Try to find a natural break in this shorter version
                  for (const pattern of breakPatterns) {
                    const match = truncatedText.match(new RegExp(`.*${pattern.source}`));
                    if (match) {
                      truncatedText = match[0];
                      break;
                    }
                  }
                }
                
                console.log('🔍 PostDisplay - Smart Truncation Debug:', {
                  originalText: text,
                  maxWords: maxWords,
                  truncatedText: truncatedText,
                  foundBreak: foundBreak,
                  wordCount: words.length,
                  originalLength: text.length,
                  truncatedLength: truncatedText.length,
                  reductionPercentage: ((text.length - truncatedText.length) / text.length * 100).toFixed(1) + '%'
                });
                
                return truncatedText;
              };
              
              // For collapsed view, preserve original formatting but limit to first few lines
              const lines = plainTextForPreview.split('\n');
              const maxLines = 4; // Show only first 4 lines in collapsed view
              const truncatedPreview = lines.slice(0, maxLines).join('\n');
              
              return (
                <div>
                  <div>{isExpanded ? formatContent(content) : (
                    <div className="break-words whitespace-pre-wrap">{truncatedPreview}</div>
                  )}</div>
                  <span className="text-blue-600 cursor-pointer hover:underline ml-1 mt-2 inline-block" 
                        onClick={() => setIsExpanded(!isExpanded)}>
                    {isExpanded ? '... Show Less' : '... Read More'}
                  </span>
                </div>
              );
            } else {
              return <div>{formatContent(content)}</div>;
            }
          })()}
        </div>
      </div>

      {/* Poll Display - Only show if poll was actually created */}
      {post.poll && post.poll.question && post.poll.options && post.poll.options.length > 0 && (
        <div className="mb-2 sm:mb-3 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
          <div className="mb-2">
            <h4 className="text-sm font-semibold text-blue-900 dark:text-blue-100 mb-2">
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
                          : 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-600'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-sm">{option.text}</span>
                        <span className="text-xs">
                          {optionVotes} votes ({percentage}%)
                        </span>
                      </div>
                      {/* Progress bar */}
                      <div className="mt-1 w-full bg-gray-200 dark:bg-gray-600 rounded-full h-2">
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
            <div className="mt-2 text-xs text-gray-500 dark:text-gray-400">
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
      
      {/* Feeling Display - Only show if feeling was actually selected */}
      {post.feeling && post.feeling.type && post.feeling.emoji && post.feeling.description && (
        <div className="mb-2 sm:mb-3 p-3 bg-pink-50 dark:bg-pink-900/20 rounded-lg border border-pink-200 dark:border-pink-800">
          <div className="flex items-center gap-2">
            <span className="text-2xl">{post.feeling.emoji}</span>
            <div>
              <h4 className="text-sm font-semibold text-pink-900 dark:text-pink-100">
                Feeling {post.feeling.description}
              </h4>
              <p className="text-xs text-pink-700 dark:text-pink-300">
                Intensity: {post.feeling.intensity}/10
              </p>
            </div>
          </div>
        </div>
      )}
      
      {/* Location Display - Only show if location was actually added */}
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
      
      {/* Sell Info Display - Only show if sell info was actually added */}
      {post.sell && post.sell.productName && post.sell.price && (
        <div className="mb-2 sm:mb-3 p-3 bg-orange-50 dark:bg-orange-900/20 rounded-lg border border-orange-200 dark:border-orange-800">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-2xl">🏪</span>
              <div>
                <h4 className="text-sm font-semibold text-orange-900 dark:text-orange-100">
                  {post.sell.productName}
                </h4>
                <p className="text-xs text-orange-700 dark:text-orange-300">
                  Condition: {post.sell.condition}
                  {post.sell.negotiable && <span className="ml-2">• Price negotiable</span>}
                </p>
              </div>
            </div>
            <div className="text-right">
              <div className="text-lg font-bold text-orange-900 dark:text-orange-100">
                ${post.sell.price}
              </div>
              <div className="text-xs text-orange-700 dark:text-orange-300">
                {post.sell.currency || 'USD'}
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* GIF Display - Only show if GIF was actually selected */}
      {post.gif && post.gif.url && post.gif.url !== 'undefined' && (
        <div className="mb-2 sm:mb-3">
          <img 
            src={post.gif.url} 
            alt="GIF"
            className="w-full max-h-96 rounded-lg object-contain"
          />
        </div>
      )}
      
      {/* Voice Recording Display - Only show if voice was actually recorded */}
      {post.voice && post.voice.url && post.voice.duration && (
        <div className="mb-2 sm:mb-3 p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg border border-purple-200 dark:border-purple-800">
          <div className="flex items-center gap-2">
            <span className="text-2xl">🎤</span>
            <div className="flex-1">
              <h4 className="text-sm font-semibold text-purple-900 dark:text-purple-100 mb-2">
                Voice Message
              </h4>
              <audio controls className="w-full">
                <source src={post.voice.url} type="audio/wav" />
                Your browser does not support the audio element.
              </audio>
              <p className="text-xs text-purple-700 dark:text-purple-300 mt-1">
                Duration: {post.voice.duration}s
                {post.voice.transcription && (
                  <span className="ml-2">• Transcription: {post.voice.transcription}</span>
                )}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Show media if present */}
      {post.media && post.media.length > 0 && (
        <div className="mb-2 sm:mb-3">
          {(() => {
            console.log('📸 PostDisplay media:', post.media);
            console.log('📸 Post ID:', post._id);
            console.log('📸 Media URLs:', post.media.map((m: any) => m.url));
            return post.media.map((media: any, index: number) => (
              <div key={index} className="mb-2">
                {media.type === 'video' ? (
                  <video 
                    src={getMediaUrl(media.url)} 
                    controls 
                    className="w-full object-contain rounded-lg shadow-lg"
                    style={{ maxHeight: '80vh' }}
                  />
                ) : media.type === 'audio' ? (
                  <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">🎵</span>
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-900 dark:text-white">
                          {media.originalName || 'Audio File'}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
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
                  <div className="bg-blue-50 dark:bg-blue-800 rounded-lg p-4 border border-blue-200 dark:border-blue-700">
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">
                        {media.mimetype?.includes('pdf') ? '📕' : 
                         media.mimetype?.includes('word') ? '📘' : 
                         media.mimetype?.includes('excel') ? '📗' : '📄'}
                      </span>
                      <div className="flex-1">
                        <p className="text-sm font-medium text-blue-900 dark:text-blue-100">
                          {media.originalName || 'Document'}
                        </p>
                        <p className="text-xs text-blue-700 dark:text-blue-300">
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
            ));
          })()}
        </div>
      )}

      {/* Engagement Metrics Section - Upper Section */}
      <div className="py-2 border-b border-gray-200">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-0">
          {/* Reactions - Left Side */}
          <div className="flex items-center space-x-2">
            <span className="text-pink-500 text-base sm:text-lg">❤️</span>
            <span className="text-blue-500 text-base sm:text-lg">👍</span>
            <span className="text-yellow-500 text-base sm:text-lg">😊</span>
            <span className="text-gray-600 dark:text-white text-xs sm:text-sm font-medium ml-1">
              {totalReactions}
            </span>
            {/* Removed showReactionDetails indicator */}
          </div>
          
          {/* Content Statistics - Right Side */}
          <div className="flex items-center space-x-2 sm:space-x-4 text-xs sm:text-sm">
            <div className="flex items-center space-x-1 text-gray-500 dark:text-gray-300">
              <span className="text-base sm:text-lg">💬</span>
              <span className="text-xs sm:text-sm">{post.comments?.length || 0} Comments</span>
            </div>
            <div className="flex items-center space-x-1 text-gray-500 dark:text-gray-300">
              <span className="text-base sm:text-lg">👁️</span>
              <span className="text-xs sm:text-sm">{post.views?.length || post.views || 0} Views</span>
            </div>
            <div className="flex items-center space-x-1 text-gray-500 dark:text-gray-300">
              <span className="text-base sm:text-lg">⭐</span>
              <span className="text-xs sm:text-sm">{post.reviews?.length || 0} Reviews</span>
            </div>
          </div>
        </div>
        
        {/* Temporary Reaction Display - Shows briefly after adding reaction */}
        {showReactionsTemporarily && (
          <div className="mt-3 pt-3 border-t border-gray-100 dark:border-gray-600">
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
                    <div key={type} className="flex items-center space-x-1 bg-gray-50 dark:bg-gray-700 rounded-full px-3 py-1">
                      <span className="text-lg">{reactionEmojis[type] || '😊'}</span>
                      <span className="text-sm text-gray-600 dark:text-white">{count}</span>
                    </div>
                  ));
                } else if (post.likes && Array.isArray(post.likes) && post.likes.length > 0) {
                  return (
                    <div className="flex items-center space-x-1 bg-gray-50 dark:bg-gray-700 rounded-full px-3 py-1">
                      <span className="text-lg">👍</span>
                      <span className="text-sm text-gray-600 dark:text-white">{post.likes.length}</span>
                    </div>
                  );
                } else {
                  return (
                    <div className="text-gray-500 dark:text-gray-400 text-sm">
                      No reactions yet
                    </div>
                  );
                }
              })()}
            </div>
          </div>
        )}

        {/* Liked Users Display - Shows when like button is clicked */}
        {showLikedUsers && (
          <div className="mt-3 pt-3 border-t border-gray-100 dark:border-gray-600 bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg">
            <div className="mb-2">
              <h4 className="text-sm font-semibold text-gray-700 dark:text-white mb-2">
                👍 Liked Users Section
              </h4>
            </div>
            
            {post.likes && post.likes.length > 0 ? (
              <>
                <div className="mb-2">
                  <span className="text-xs text-gray-600 dark:text-white">
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
                        className="w-8 h-8 rounded-full object-cover border-2 border-white dark:border-gray-800 shadow-sm" 
                        onError={(e) => {
                          e.currentTarget.src = '/default-avatar.svg';
                        }}
                      />
                    );
                  })}
                </div>
              </>
            ) : (
              <div className="text-sm text-gray-500 dark:text-gray-400">
                No likes yet
              </div>
            )}
            
            <button 
              onClick={() => setShowLikedUsers(false)}
              className="mt-2 text-xs text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
            >
              Hide liked users
            </button>
          </div>
        )}
      </div>

      {/* Action Buttons Section - Lower Section */}
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
                // Toggle liked users display
                console.log('🔍 React button clicked!');
                console.log('🔍 Current showLikedUsers:', showLikedUsers);
                console.log('🔍 Post likes:', post.likes);
                setShowLikedUsers(!showLikedUsers);
              }}
                className={`flex flex-col items-center justify-center transition-colors touch-manipulation min-h-[60px] ${
                  getCurrentReaction() ? 'text-red-500' : 'hover:text-red-500'
              }`}
              style={{ touchAction: 'manipulation' }}
            >
                <span className="font-medium text-xs mb-2 text-center text-gray-900 dark:text-white">React</span>
              <div className="w-5 h-5 rounded-full bg-gray-200 dark:bg-gray-600 flex items-center justify-center">
                <span className="text-sm">😊</span>
                </div>
            </button>
            
            {/* Reaction Popup */}
            <div
              onMouseEnter={handleReactionPopupMouseEnter}
              onMouseLeave={handleReactionPopupMouseLeave}
            >
              <ReactionPopup
                isOpen={showReactionPopup}
                onClose={() => setShowReactionPopup(false)}
                onReaction={handleReaction}
                currentReaction={getCurrentReaction()}
                position="top"
              />
            </div>
          </div>
          
            {/* Comment Button */}
          <button 
            onClick={() => setShowCommentInput(!showCommentInput)}
              className="flex flex-col items-center justify-center hover:text-blue-500 transition-colors touch-manipulation min-h-[60px]"
            style={{ touchAction: 'manipulation' }}
          >
                <span className="font-medium text-xs mb-2 text-center text-gray-900 dark:text-white">Comment</span>
            <div className="w-5 h-5 rounded-full bg-gray-200 dark:bg-gray-600 flex items-center justify-center">
              <span className="text-sm">💬</span>
              </div>
          </button>
          
            {/* Share Button */}
          <button 
            onClick={() => setShowSharePopup(true)}
              className="flex flex-col items-center justify-center hover:text-green-500 transition-colors touch-manipulation min-h-[60px]"
              style={{ touchAction: 'manipulation' }}
            >
                <span className="font-medium text-xs mb-2 text-center text-gray-900 dark:text-white">Share</span>
            <div className="w-5 h-5 rounded-full bg-gray-200 dark:bg-gray-600 flex items-center justify-center">
              <span className="text-sm">📤</span>
              </div>
            </button>
            
            {/* Review Button */}
            <button 
              className="flex flex-col items-center justify-center hover:text-yellow-500 transition-colors touch-manipulation min-h-[70px] px-2"
            style={{ touchAction: 'manipulation' }}
          >
            <div className="w-5 h-5 rounded-full bg-gray-200 dark:bg-gray-600 flex items-center justify-center mb-2">
              <span className="text-sm">⭐</span>
            </div>
            <span className="font-medium text-xs text-center whitespace-nowrap text-gray-900 dark:text-white">Review</span>
          </button>
        </div>
        
        <div className="flex items-center gap-1 sm:gap-2">
          <button 
            onClick={() => onSave && onSave(post._id)}
            className={`flex flex-col items-center justify-center px-2 py-1 rounded-lg transition-colors touch-manipulation min-h-[60px] ${
              isSaved ? 'bg-blue-50 dark:bg-blue-900/20' : 'hover:text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20'
            }`}
            style={{ touchAction: 'manipulation' }}
          >
            <span className="text-xs font-medium mb-2 text-center text-gray-900 dark:text-white">{isSaved ? 'Saved' : 'Save'}</span>
            <span className="text-base">{isSaved ? '💾' : '🔖'}</span>
          </button>
          
          {/* Edit and Delete buttons - only show if showEditDelete is true AND user owns the post */}
          {showEditDelete && isOwner && (
            <>
              <button 
                onClick={() => onEdit && onEdit(post)}
                className="flex flex-col items-center px-2 py-1 rounded-lg text-gray-600 dark:text-white hover:text-blue-500 hover:bg-blue-50 transition-colors touch-manipulation"
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
                className="flex flex-col items-center px-2 py-1 rounded-lg text-gray-600 dark:text-white hover:text-red-500 hover:bg-red-50 transition-colors touch-manipulation"
                title="Delete post"
                style={{ touchAction: 'manipulation' }}
              >
                <span className="text-xs font-medium mb-1">Delete</span>
                <span className="text-base">🗑️</span>
              </button>
              
              {/* Comment Toggle Button - only for post owners */}
              <button 
                onClick={() => {
                  if (onToggleComments) {
                    onToggleComments(post._id);
                  }
                }}
                className="flex flex-col items-center px-2 py-1 rounded-lg text-gray-600 dark:text-white hover:text-yellow-500 hover:bg-yellow-50 transition-colors touch-manipulation"
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
        <div className="mt-3 p-2 sm:p-3 bg-gray-50 dark:bg-gray-700 rounded-lg transition-colors duration-200">
          <div className="flex gap-2">
            <input
              type="text"
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              placeholder="Write a comment..."
              className="flex-1 px-2 sm:px-3 py-1 sm:py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
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
              className="px-3 sm:px-4 py-1 sm:py-2 bg-blue-500 dark:bg-blue-600 text-white rounded-lg hover:bg-blue-600 dark:hover:bg-blue-700 disabled:bg-gray-300 dark:disabled:bg-gray-600 disabled:cursor-not-allowed transition-colors text-sm touch-manipulation"
              style={{ touchAction: 'manipulation' }}
            >
              Post
            </button>
          </div>
        </div>
      )}

      {/* Comments Display */}
      {post.comments && post.comments.length > 0 && (
        <div className="mt-3 space-y-2">
          {post.comments.slice(0, 3).map((comment: any, index: number) => (
            <div key={index} className="flex items-start gap-2 p-2 bg-gray-50 rounded-lg">
              <img 
                src={comment.user?.avatar ? getMediaUrl(comment.user.avatar) : '/default-avatar.svg'} 
                alt="avatar" 
                className="w-5 h-5 sm:w-6 sm:h-6 rounded-full flex-shrink-0 object-cover" 
                onError={(e) => {
                  console.log('❌ Comment avatar load failed for user:', comment.user?.name, 'URL:', comment.user?.avatar);
                  e.currentTarget.src = '/default-avatar.svg';
                }}
              />
              <div className="flex-1 min-w-0">
                {comment.user ? (
                  <a 
                    href={`/dashboard/profile/${(() => {
                      // Handle populated user object (when userId is the full user object)
                      if (comment.user.userId && typeof comment.user.userId === 'object' && comment.user.userId._id) {
                        return comment.user.userId._id;
                      }
                      return String(comment.user.userId || comment.user._id || comment.user.id || 'unknown');
                    })()}`} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-xs sm:text-sm font-medium hover:underline cursor-pointer truncate block"
                  >
                    {comment.user?.name || 'User'}
                  </a>
                ) : (
                  <span className="text-xs sm:text-sm font-medium truncate">{comment.user?.name || 'User'}</span>
                )}
                <span className="text-xs sm:text-sm text-gray-600 dark:text-white ml-1 sm:ml-2 break-words">{comment.text}</span>
              </div>
            </div>
          ))}
          {post.comments.length > 3 && (
            <button className="text-xs sm:text-sm text-blue-500 hover:text-blue-700">
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
