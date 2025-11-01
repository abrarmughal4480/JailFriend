'use client';
import { useState, useEffect, useRef } from 'react';
import { Reel, getReels, toggleLike, toggleSave, addComment, shareReel, formatDuration, formatViewCount, formatLikeCount, hasUserLiked, hasUserSaved } from '@/utils/reelsApi';
import ReactionPopup, { ReactionType } from './ReactionPopup';
import ReelsCreationModal from './ReelsCreationModal';

interface ReelsDisplayProps {
  initialCategory?: string;
  userId?: string;
  hashtag?: string;
  trending?: boolean;
}

export default function ReelsDisplay({ 
  initialCategory = 'general', 
  userId, 
  hashtag, 
  trending = false 
}: ReelsDisplayProps) {
  const [reels, setReels] = useState<Reel[]>([]);
  const [currentReelIndex, setCurrentReelIndex] = useState(0);
  
  // Function to safely update current reel index
  const setCurrentReelIndexSafely = (index: number) => {
    if (index !== currentReelIndex && index >= 0 && index < reels.length) {
      setCurrentReelIndex(index);
    }
  };
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');
  const [hasNextPage, setHasNextPage] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [commentText, setCommentText] = useState('');
  const [showComments, setShowComments] = useState<string | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showReactionPopup, setShowReactionPopup] = useState<string | null>(null);
  const [reactionButtonHovered, setReactionButtonHovered] = useState<string | null>(null);
  const [showReactionsTemporarily, setShowReactionsTemporarily] = useState<string | null>(null);
  const [isReacting, setIsReacting] = useState(false);
  
  const containerRef = useRef<HTMLDivElement>(null);
  const videoRefs = useRef<{ [key: string]: HTMLVideoElement | null }>({});


  const currentReelRef = useRef(0);

  useEffect(() => {
    loadReels();
  }, [initialCategory, userId, hashtag, trending]);

  // Auto-play first video when reels are loaded
  useEffect(() => {
    if (reels.length > 0 && currentReelIndex === 0) {
      const firstVideo = videoRefs.current[reels[0]._id || 'reel-0'];
      if (firstVideo) {
        // Small delay to ensure video is ready
        setTimeout(() => {
          firstVideo.play().then(() => {
            console.log('🎬 Auto-playing first reel:', reels[0].title || reels[0]._id);
          }).catch((error) => {
            console.error('❌ Error auto-playing first reel:', error);
            // Try muted play as fallback
            firstVideo.muted = true;
            firstVideo.play().catch(() => {});
          });
        }, 500);
      }
    }
  }, [reels]); // Remove currentReelIndex dependency

  // Auto-play current video when currentReelIndex changes
  useEffect(() => {
    if (reels.length > 0 && currentReelIndex >= 0 && currentReelIndex < reels.length) {
      console.log(`🎯 Switching to reel ${currentReelIndex}, total reels: ${reels.length}`);
      
      // Update the ref to match state
      currentReelRef.current = currentReelIndex;
      
      // Use the simplified audio function with a small delay to prevent conflicts
      setTimeout(() => {
        playReelWithAudio(currentReelIndex);
      }, 100);
    }
  }, [currentReelIndex]); // Remove reels dependency to prevent unnecessary re-renders

  // Intersection Observer to detect when reels come into view
  useEffect(() => {
    if (!containerRef.current || reels.length === 0) return;
    
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const reelIndex = parseInt(entry.target.getAttribute('data-reel-index') || '0');
            console.log(`👁️ Reel ${reelIndex} is now visible`);
            
            // Only update if it's different from current
            if (reelIndex !== currentReelRef.current) {
              console.log(`🔄 Intersection Observer: switching to reel ${reelIndex}`);
              currentReelRef.current = reelIndex;
              setCurrentReelIndexSafely(reelIndex);
              
              // Use our simplified audio function with delay to prevent conflicts
              setTimeout(() => {
                playReelWithAudio(reelIndex);
              }, 200);
            }
          }
        });
      },
      {
        root: containerRef.current,
        rootMargin: '0px',
        threshold: 0.8 // Increase threshold to 80% to prevent rapid switching
      }
    );
    
    // Observe all reel containers
    const reelContainers = containerRef.current.querySelectorAll('[data-reel-index]');
    reelContainers.forEach((container) => {
      observer.observe(container);
    });
    
    return () => {
      observer.disconnect();
    };
  }, [reels]); // Remove currentReelIndex dependency to prevent loops

  const loadReels = async (page = 1) => {
    try {
      setLoading(true);
      setError('');
      
      console.log('🎬 Loading reels with params:', { hashtag, userId, trending, initialCategory, page });
      
      let response: any;
      if (hashtag) {
        response = await getReels({ hashtag, page, limit: 10 });
      } else if (userId) {
        response = await getReels({ userId, page, limit: 10 });
      } else if (trending) {
        const trendingReels = await getReels({ trending: true, page, limit: 10 });
        response = { reels: trendingReels, pagination: { hasNextPage: false, currentPage: page } };
      } else {
        response = await getReels({ category: initialCategory, page, limit: 10 });
      }
      
      console.log('📡 API Response:', response);
      
      // Handle different response types properly
      let reelsArray: Reel[] = [];
      let pagination: any = null;
      
      if (Array.isArray(response)) {
        reelsArray = response;
        console.log('📋 Response is array, length:', reelsArray.length);
      } else if (response && typeof response === 'object' && 'reels' in response) {
        reelsArray = response.reels || [];
        pagination = response.pagination;
        console.log('📋 Response has reels property, count:', reelsArray.length);
        console.log('📊 Pagination:', pagination);
      } else {
        console.log('⚠️ Unexpected response structure:', response);
      }
      
      if (page === 1) {
        setReels(reelsArray);
        setCurrentReelIndex(0);
      } else {
        setReels(prev => [...prev, ...reelsArray]);
      }
      
      setHasNextPage(pagination?.hasNextPage || false);
      setCurrentPage(page);
      
      console.log('✅ Reels loaded successfully, total:', reelsArray.length);
      
        // Debug: Log video URLs for troubleshooting
  reelsArray.forEach((reel, index) => {
    console.log(`🎬 Reel ${index}:`, {
      id: reel._id,
      title: reel.title,
      videoUrl: reel.videoUrl,
      validatedUrl: getValidVideoUrl(reel.videoUrl || ''),
      hasVideo: !!reel.videoUrl,
      duration: reel.duration
    });
  });
  
  // Debug: Log current video states
  setTimeout(() => {
    console.log('🔍 Current video states:');
    reelsArray.forEach((reel, index) => {
      const video = videoRefs.current[reel._id || `reel-${index}`];
      if (video) {
        console.log(`🎬 Reel ${index}:`, {
          paused: video.paused,
          muted: video.muted,
          volume: video.volume,
          currentTime: video.currentTime,
          readyState: video.readyState,
          networkState: video.networkState
        });
      }
    });
  }, 1000);
    } catch (err: any) {
      console.error('❌ Error loading reels:', err);
      setError(err.message || 'Failed to load reels');
    } finally {
      setLoading(false);
    }
  };

  const handleScroll = () => {
    if (!containerRef.current) return;
    
    const container = containerRef.current;
    const scrollTop = container.scrollTop;
    const containerHeight = container.clientHeight;
    
    // Calculate which reel should be visible
    const reelHeight = containerHeight;
    const newIndex = Math.round(scrollTop / reelHeight);
    
    if (newIndex !== currentReelIndex && newIndex >= 0 && newIndex < reels.length) {
      console.log(`🔄 Scrolling from reel ${currentReelIndex} to ${newIndex}`);
      
      // Store the old index before updating state
      const oldIndex = currentReelIndex;
      setCurrentReelIndexSafely(newIndex);
      
      // Use the simplified audio function with delay to prevent conflicts
      setTimeout(() => {
        playReelWithAudio(newIndex);
      }, 150);
    }
    
    // Load more reels when near the end
    if (hasNextPage && newIndex >= reels.length - 2) {
      loadReels(currentPage + 1);
    }
  };

  const handleLike = async (reelId: string) => {
    try {
      const response = await toggleLike(reelId);
      setReels(prev => prev.map(reel => 
        reel._id === reelId 
          ? { ...reel, likes: response.likes, trendingScore: response.trendingScore }
          : reel
      ));
    } catch (err) {
      console.error('Error toggling like:', err);
    }
  };

  const handleSave = async (reelId: string) => {
    try {
      const response = await toggleSave(reelId);
      setReels(prev => prev.map(reel => 
        reel._id === reelId 
          ? { ...reel, savedBy: response.saved }
          : reel
      ));
    } catch (err) {
      console.error('Error toggling save:', err);
    }
  };

  const handleComment = async (reelId: string) => {
    if (!commentText.trim()) return;
    
    try {
      const response = await addComment(reelId, { text: commentText });
      setReels(prev => prev.map(reel => 
        reel._id === reelId 
          ? { 
              ...reel, 
              comments: [...(reel.comments || []), response.comment || reel.comments?.[0] || {}],
              trendingScore: response.trendingScore || reel.trendingScore
            }
          : reel
      ));
      setCommentText('');
    } catch (err) {
      console.error('Error adding comment:', err);
    }
  };

  const handleShare = async (reelId: string) => {
    try {
      console.log('🔄 Sharing reel:', reelId);
  console.log('🔗 API URL:', `${process.env.NEXT_PUBLIC_API_URL || 'https://jaifriend-backend.hgdjlive.com'}/api/reels/${reelId}/share`);
      
      const response = await shareReel(reelId);
      console.log('✅ Share response:', response);
      
      setReels(prev => prev.map(reel => 
        reel._id === reelId 
          ? { 
              ...reel, 
              shares: response.shares || reel.shares || [],
              trendingScore: response.trendingScore || reel.trendingScore
            }
          : reel
      ));
      
      // Show success message or copy link to clipboard
      const reelUrl = `${window.location.origin}/dashboard/reels/${reelId}`;
      await navigator.clipboard.writeText(reelUrl);
      alert('Reel link copied to clipboard!');
    } catch (err: any) {
      console.error('❌ Error sharing reel:', err);
      console.error('❌ Error details:', err.response?.data || err.message);
      alert('Failed to share reel. Please try again.');
    }
  };

  // Handle reactions (like, love, haha, wow, sad, angry)
  const handleReaction = async (reelId: string, reactionType: ReactionType) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        alert('Please login to add a reaction.');
        return;
      }

      setIsReacting(true);

      // Call backend API directly
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'https://jaifriend-backend.hgdjlive.com'}/api/reels/${reelId}/reaction`, {
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
        console.log('Reaction added successfully:', data);
        
        // Show success feedback
        const reactionEmojis: { [key: string]: string } = {
          'like': '👍',
          'love': '❤️',
          'haha': '😂',
          'wow': '😮',
          'sad': '😢',
          'angry': '😠'
        };
        
        const emoji = reactionEmojis[reactionType] || '😊';
        alert(`${emoji} Reaction added successfully!`);
        
        // Update local state to reflect the new reaction
        // For now, we'll refresh the page to get updated data
        // In a real app, you'd update the local state
        window.location.reload();
      } else {
        const errorData = await response.json().catch(() => ({}));
        console.error('Failed to add reaction:', errorData);
        alert(`Failed to add reaction: ${errorData.message || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('Error adding reaction:', error);
      alert('Error adding reaction. Please try again.');
    } finally {
      setIsReacting(false);
      // Automatically close the popup after reaction selection
      setShowReactionPopup(null);
    }
  };

  // Helper functions for reactions
  const getCurrentReaction = (reel: Reel) => {
    const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
    const userReaction = reel.reactions?.find(r => 
      r.user === currentUser._id || r.user === currentUser.id
    );
    return userReaction?.type || null;
  };

  const getMostCommonReactionEmoji = (reel: Reel) => {
    if (!reel.reactions || reel.reactions.length === 0) return '👍';
    
    const reactionCounts: { [key: string]: number } = {};
    reel.reactions.forEach(reaction => {
      reactionCounts[reaction.type] = (reactionCounts[reaction.type] || 0) + 1;
    });
    
    const mostCommon = Object.entries(reactionCounts).reduce((a, b) => 
      reactionCounts[a[0]] > reactionCounts[b[0]] ? a : b
    )[0];
    
    const reactionEmojis: { [key: string]: string } = {
      'like': '👍',
      'love': '❤️',
      'haha': '😂',
      'wow': '😮',
      'sad': '😢',
      'angry': '😠'
    };
    
    return reactionEmojis[mostCommon] || '👍';
  };

  const getReactionCount = (reel: Reel) => {
    return reel.reactions?.length || 0;
  };

  // Reaction popup handlers
  const handleReactionButtonMouseEnter = (reelId: string) => {
    setReactionButtonHovered(reelId);
    setShowReactionPopup(reelId);
  };

  const handleReactionButtonMouseLeave = (reelId: string) => {
    setReactionButtonHovered(null);
    // Delay hiding to allow moving to popup
    setTimeout(() => {
      if (!showReactionPopup) {
        setShowReactionPopup(null);
      }
    }, 100);
  };

  const handleReactionPopupMouseEnter = () => {
    setShowReactionPopup(showReactionPopup);
  };

  const handleReactionPopupMouseLeave = () => {
    setShowReactionPopup(null);
    setReactionButtonHovered(null);
  };

  // Validate video URL and add fallback extensions if needed
  const getValidVideoUrl = (url: string) => {
    if (!url) return '';
    
    // If URL already has a video extension, return as is
    if (url.match(/\.(mp4|webm|ogg|mov|avi|mkv)$/i)) {
      return url;
    }
    
    // If no extension, try to add .mp4 as fallback
    if (url.includes('uploads/') || url.includes('media/')) {
      return `${url}.mp4`;
    }
    
    return url;
  };



  // Simplified audio management - only one function to rule them all
  const playReelWithAudio = (reelIndex: number) => {
    if (reelIndex < 0 || reelIndex >= reels.length) return;
    
    console.log(`🎬 Playing reel ${reelIndex} with audio`);
    
    // Check if this is already the current playing reel
    const currentVideo = videoRefs.current[reels[currentReelIndex]?._id || `reel-${currentReelIndex}`];
    if (currentVideo && !currentVideo.muted && !currentVideo.paused) {
      console.log(`⏭️ Reel ${reelIndex} is already playing with audio, skipping`);
      return;
    }
    
    // Immediately mute all videos
    reels.forEach((reel, index) => {
      const video = videoRefs.current[reel._id || `reel-${index}`];
      if (video) {
        video.muted = true;
        video.volume = 0;
        if (index !== reelIndex) {
          video.pause();
          video.currentTime = 0;
        }
      }
    });
    
    // Play the target reel with audio
    const targetVideo = videoRefs.current[reels[reelIndex]._id || `reel-${reelIndex}`];
    if (targetVideo) {
      targetVideo.volume = 0.5;
      targetVideo.muted = false;
      targetVideo.currentTime = 0;
      targetVideo.play().then(() => {
        console.log(`✅ Successfully playing reel ${reelIndex} with audio`);
      }).catch((error) => {
        console.error(`❌ Error playing reel ${reelIndex}:`, error);
        // Fallback to muted play
        targetVideo.muted = true;
        targetVideo.play().catch(() => {});
      });
    }
  };

  const handleVideoClick = (reelId: string) => {
    const video = videoRefs.current[reelId];
    if (video) {
      if (video.paused) {
        console.log(`🎬 Manually playing video for reel:`, reelId);
        video.volume = 0.5;
        video.muted = false;
        video.play().then(() => {
          console.log(`✅ Successfully played video for reel:`, reelId);
        }).catch((error) => {
          console.error(`❌ Error playing video for reel:`, reelId, error);
          // Fallback to muted play
          video.muted = true;
          video.play().catch(() => {});
        });
      } else {
        console.log(`⏸️ Pausing video for reel:`, reelId);
        video.pause();
      }
    }
  };

  const handleDoubleTap = (reelId: string) => {
    // Auto-like on double tap
    handleLike(reelId);
    
    // Show heart animation
    const heartElement = document.createElement('div');
    heartElement.innerHTML = '❤️';
    heartElement.className = 'absolute inset-0 flex items-center justify-center text-6xl animate-pulse pointer-events-none z-10';
    heartElement.style.animation = 'pulse 0.6s ease-out';
    
    const videoContainer = document.querySelector(`[data-reel-id="${reelId}"]`);
    if (videoContainer) {
      videoContainer.appendChild(heartElement);
      setTimeout(() => {
        heartElement.remove();
      }, 600);
    }
  };

  if (loading && reels.length === 0) {
    return (
      <div className="flex items-center justify-center h-[580px] sm:h-screen max-w-[310px] mx-auto sm:max-w-none">
        <div className="animate-spin rounded-full h-10 w-10 sm:h-12 sm:w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error && reels.length === 0) {
    return (
      <div className="flex items-center justify-center h-[580px] sm:h-screen max-w-[310px] mx-auto sm:max-w-none">
        <div className="text-center">
          <div className="text-red-500 text-lg sm:text-xl mb-2">⚠️</div>
          <div className="text-gray-600 text-sm sm:text-base">{error}</div>
          <button 
            onClick={() => loadReels()}
            className="mt-4 px-3 sm:px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm sm:text-base"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full h-full flex flex-col">
      {/* Header with Create Video Button */}
      <div className="flex items-center justify-between p-4 bg-white border-b border-gray-200">
        <div>
          <h2 className="text-xl font-bold text-gray-900">
            {hashtag ? `#${hashtag} Reels` : 
             userId ? 'User Reels' : 
             trending ? 'Trending Reels' : 
             `${initialCategory.charAt(0).toUpperCase() + initialCategory.slice(1)} Reels`}
          </h2>
          <p className="text-sm text-gray-600">
            {reels.length} {reels.length === 1 ? 'reel' : 'reels'} available
          </p>
        </div>
        
        {/* Test Button - Only show in development */}
        {process.env.NODE_ENV === 'development' && (
          <button
            onClick={() => {
              const nextIndex = (currentReelIndex + 1) % reels.length;
              console.log(`🧪 Testing audio to reel ${nextIndex}`);
              setCurrentReelIndexSafely(nextIndex);
            }}
            className="px-3 py-1 bg-purple-500 text-white text-xs rounded hover:bg-purple-600"
          >
            Test Next Reel
          </button>
        )}
        

        

        

      </div>

      {/* Reels Container */}
      <div 
        ref={containerRef}
        className="flex-1 overflow-y-auto scrollbar-hide"
        onScroll={handleScroll}
      >
        {reels.length === 0 && !loading ? (
          <div className="h-[580px] sm:h-screen snap-start flex items-center justify-center">
            <div className="text-center text-white">
              <div className="text-6xl mb-4">🎬</div>
              <h3 className="text-xl font-semibold mb-2">No reels yet</h3>
              <p className="text-gray-300 mb-4">Be the first to create a reel!</p>
              <button
                onClick={() => window.location.href = '/dashboard/reels'}
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium transition-colors"
              >
                Create Reel
              </button>
            </div>
          </div>
        ) : (
          reels.map((reel, index) => (
          <div 
            key={reel._id || `reel-${index}`}
            data-reel-id={reel._id || `reel-${index}`}
            data-reel-index={index}
            className="h-[580px] sm:h-screen snap-start relative bg-black overflow-hidden"
            onDoubleClick={() => handleDoubleTap(reel._id || `reel-${index}`)}
          >
            {/* Video Container */}
            <div 
              className="relative w-full h-full flex items-center justify-center"
              onDoubleClick={() => handleDoubleTap(reel._id || `reel-${index}`)}
            >
                          {/* Loading Indicator - only show when there's a video */}
            {reel.videoUrl && (
              <div className="absolute inset-0 flex items-center justify-center bg-black/20 z-10">
                <div className="animate-spin rounded-full h-8 w-8 border-2 border-white border-t-transparent"></div>
              </div>
            )}
            
            {/* Video Placeholder - shown when no video URL */}
            {!reel.videoUrl && (
              <div className="absolute inset-0 flex items-center justify-center bg-gray-800 text-white text-center p-4">
                <div>
                  <div className="text-4xl mb-2">🎬</div>
                  <div className="text-sm">No video available</div>
                  <div className="text-xs text-gray-300 mt-1">This reel has no video content</div>
                </div>
              </div>
            )}
                          {reel.videoUrl && (
              <video
                ref={(el) => {
                  if (el) {
                    videoRefs.current[reel._id || `reel-${index}`] = el;
                    console.log(`🎬 Video ref set for reel ${index}:`, reel._id || `reel-${index}`);
                    
                    // If this is the current reel, use the simplified audio function
                    if (index === currentReelIndex) {
                      setTimeout(() => {
                        playReelWithAudio(index);
                      }, 100);
                    } else {
                      // Mute non-current videos immediately
                      el.muted = true;
                      el.volume = 0;
                    }
                  }
                }}
                src={getValidVideoUrl(reel.videoUrl)}
                className="w-full h-full object-cover"
                loop
                playsInline
                preload="metadata"
                onLoadStart={() => {
                  console.log(`🎬 Video loading started for reel ${index}:`, reel.videoUrl);
                }}
                onLoadedMetadata={() => {
                  console.log(`🎬 Video metadata loaded for reel ${index}:`, reel.title || reel._id);
                  console.log(`📹 Video details:`, {
                    duration: reel.duration,
                    url: reel.videoUrl
                  });
                  
                  // Auto-play if this is the current reel
                  if (index === currentReelIndex) {
                    playReelWithAudio(index);
                  }
                }}
                onCanPlay={() => {
                  console.log(`🎬 Video can play for reel ${index}:`, reel.title || reel._id);
                  
                  // Hide loading indicator
                  const loadingIndicator = document.querySelector(`[data-reel-id="${reel._id || `reel-${index}`}"] .animate-spin`);
                  if (loadingIndicator) {
                    loadingIndicator.parentElement!.style.display = 'none';
                  }
                  
                  // Auto-play if this is the current reel
                  if (index === currentReelIndex) {
                    playReelWithAudio(index);
                  }
                }}
                onLoad={() => {
                  console.log(`✅ Video loaded successfully for reel ${index}:`, reel.title || reel._id);
                }}
                onClick={() => handleVideoClick(reel._id || `reel-${index}`)}
                onError={(e) => {
                  const video = e.currentTarget;
                  console.error(`❌ Video error for reel ${index}:`, {
                    error: e,
                    videoElement: video,
                    videoUrl: reel.videoUrl,
                    videoSrc: video?.src,
                    videoCurrentSrc: video?.currentSrc,
                    videoNetworkState: video?.networkState,
                    videoReadyState: video?.readyState,
                    videoError: video?.error,
                    errorCode: video?.error?.code,
                    errorMessage: video?.error?.message,
                    reelId: reel._id,
                    reelTitle: reel.title,
                    timestamp: new Date().toISOString()
                  });
                  
                  // Hide loading indicator
                  const loadingIndicator = document.querySelector(`[data-reel-id="${reel._id || `reel-${index}`}"] .animate-spin`);
                  if (loadingIndicator) {
                    loadingIndicator.parentElement!.style.display = 'none';
                  }
                  
                  // Show detailed error message
                  const errorDiv = document.createElement('div');
                  errorDiv.className = 'absolute inset-0 flex items-center justify-center bg-black/50 text-white text-center p-4 z-20';
                  errorDiv.innerHTML = `
                    <div>
                      <div class="text-2xl mb-2">⚠️</div>
                      <div class="text-sm mb-2">Video could not be loaded</div>
                      <div class="text-xs text-gray-300 mb-3">${reel.videoUrl ? 'Check video URL or format' : 'No video URL provided'}</div>
                      <div class="text-xs text-gray-400 mb-2">Click to retry</div>
                      <div class="text-xs text-gray-500">URL: ${reel.videoUrl || 'None'}</div>
                    </div>
                  `;
                  errorDiv.onclick = () => {
                    const video = videoRefs.current[reel._id || `reel-${index}`];
                    if (video) {
                      console.log(`🔄 Retrying video for reel ${index}:`, reel.videoUrl);
                      video.load();
                      errorDiv.remove();
                    }
                  };
                  e.currentTarget.parentElement?.appendChild(errorDiv);
                }}
              />
            )}
              
              {/* Play/Pause Overlay */}
              <div className="absolute inset-0 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                <div className="bg-black/50 rounded-full p-4">
                  {(() => {
                    const video = videoRefs.current[reel._id || `reel-${index}`];
                    const isPlaying = video && !video.paused;
                    return isPlaying ? (
                      <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M6 4h4v12H6V4zm8 0h4v12h-4V4z" />
                      </svg>
                    ) : (
                      <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M8 5v10l8-5-8-5z" />
                      </svg>
                    );
                  })()}
                </div>
              </div>

              
              

              
              {/* Music Indicator */}
              {reel.music && (
                <div className="absolute bottom-20 left-3 sm:left-4 flex items-center gap-2 text-white">
                  <div className="w-8 h-8 sm:w-10 sm:h-10 bg-black/30 rounded-full flex items-center justify-center">
                    <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z"/>
                  </svg>
                  </div>
                  <span className="truncate max-w-16 sm:max-w-24">{reel.music?.title || 'Unknown Music'}</span>
                </div>
              )}
              
                          {/* Trending Badge */}
            {reel.isTrending && (
              <div className="absolute top-2 sm:top-4 right-2 sm:right-4 bg-gradient-to-r from-yellow-400 to-orange-500 text-white text-xs px-2 sm:px-3 py-1 sm:py-1.5 rounded-full flex items-center gap-1 sm:gap-2">
                <span>🔥</span>
                <span>Trending</span>
              </div>
            )}

            {/* Currently Playing Indicator */}
            {index === currentReelIndex && (
              <div className="absolute top-2 sm:top-4 left-2 sm:left-4 bg-green-500 text-white text-xs px-2 sm:px-3 py-1 sm:py-1.5 rounded-full flex items-center gap-1 sm:gap-2">
                <span>▶️</span>
                <span>Playing</span>
              </div>
            )}
            </div>

            {/* Right Side Actions */}
            <div className="absolute right-2 sm:right-4 bottom-16 sm:bottom-20 flex flex-col items-center gap-4 sm:gap-6">
              {/* Volume Control Button */}
              <button
                onClick={() => {
                  const video = videoRefs.current[reel._id || `reel-${index}`];
                  if (video) {
                    if (video.muted) {
                      video.muted = false;
                      video.volume = 0.5;
                    } else {
                      video.muted = true;
                    }
                  }
                }}
                className="flex flex-col items-center gap-1 text-white"
              >
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-black/30 hover:bg-black/50 rounded-full flex items-center justify-center transition-colors">
                  {(() => {
                    const video = videoRefs.current[reel._id || `reel-${index}`];
                    const isMuted = video && video.muted;
                    return isMuted ? (
                      <svg className="w-5 h-5 sm:w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2" />
                      </svg>
                    ) : (
                      <svg className="w-5 h-5 sm:w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
                      </svg>
                    );
                  })()}
                </div>
                <span className="text-xs sm:text-sm font-medium">Sound</span>
              </button>

              {/* Reaction Button with Popup */}
              <div className="relative">
                <ReactionPopup
                  onReaction={(reactionType) => handleReaction(reel._id || `reel-${index}`, reactionType)}
                  currentReaction={getCurrentReaction(reel)}
                >
                  <button 
                    onClick={() => handleLike(reel._id || `reel-${index}`)}
                    className={`flex flex-col items-center gap-1 text-white ${
                      getCurrentReaction(reel) ? 'text-red-500' : ''
                    }`}
                  >
                    <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded-full flex items-center justify-center transition-colors ${
                      getCurrentReaction(reel) ? 'bg-red-500' : 'bg-black/30 hover:bg-black/50'
                    }`}>
                      <span className="text-lg sm:text-xl">{getMostCommonReactionEmoji(reel)}</span>
                    </div>
                    <span className="text-xs sm:text-sm font-medium">{getReactionCount(reel)}</span>
                  </button>
                </ReactionPopup>
              </div>

              {/* Comment Button */}
              <button
                onClick={() => setShowComments(showComments === reel._id ? null : reel._id)}
                className="flex flex-col items-center gap-1 text-white"
              >
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-black/30 hover:bg-black/50 rounded-full flex items-center justify-center transition-colors">
                  <svg className="w-5 h-5 sm:w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                  </svg>
                </div>
                <span className="text-xs sm:text-sm font-medium">{reel.comments?.length || 0}</span>
              </button>

              {/* Save Button */}
              <button
                onClick={() => handleSave(reel._id || `reel-${index}`)}
                className="flex flex-col items-center gap-1 text-white"
              >
                <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded-full flex items-center justify-center transition-colors ${
                  hasUserSaved(reel, undefined) ? 'bg-blue-500' : 'bg-black/30 hover:bg-black/50'
                }`}>
                  <svg className="w-5 h-5 sm:w-6 h-6" fill={hasUserSaved(reel, undefined) ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
                  </svg>
                </div>
                <span className="text-xs sm:text-sm font-medium">Save</span>
              </button>

              {/* Share Button */}
              <button 
                onClick={() => handleShare(reel._id || `reel-${index}`)}
                className="flex flex-col items-center gap-1 text-white"
              >
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-black/30 hover:bg-black/50 rounded-full flex items-center justify-center transition-colors">
                  <svg className="w-5 h-5 sm:w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z" />
                  </svg>
                </div>
                <span className="text-xs sm:text-sm font-medium">{reel.shares?.length || 0}</span>
              </button>
            </div>

            {/* Bottom Info */}
            <div className="absolute bottom-3 sm:bottom-4 left-3 sm:left-4 right-16 sm:right-20 text-white">
              <div className="mb-2">
                <h3 className="text-base sm:text-lg font-semibold mb-1">{reel.title || 'Untitled'}</h3>
                <p className="text-xs sm:text-sm text-gray-200 mb-2">{reel.description || 'No description'}</p>
                
                {/* Hashtags */}
                {reel.hashtags?.length > 0 && (
                  <div className="flex flex-wrap gap-1 sm:gap-2 mb-2">
                    {reel.hashtags.map((tag, tagIndex) => (
                      <span key={tagIndex} className="text-blue-400 text-xs sm:text-sm">#{tag}</span>
                    ))}
                  </div>
                )}
                
                {/* User Info */}
                <div className="flex items-center gap-2">
                  <img 
                    src={reel.user?.avatar} 
                    alt={reel.user?.name || 'User'}
                    className="w-6 h-6 sm:w-8 sm:h-8 rounded-full border-2 border-white"
                  />
                  <div>
                    <div className="font-medium text-xs sm:text-sm">{reel.user?.name || 'Unknown User'}</div>
                    <div className="text-xs text-gray-300">{reel.category || 'General'} • {formatDuration(reel.duration || 0)}</div>
                  </div>
                </div>
                
                {/* View Count */}
                <div className="text-xs text-gray-300 mt-1">
                  {formatViewCount(reel.views?.length || 0)} views
                </div>
              </div>
            </div>

            {/* Comments Panel */}
            {showComments === (reel._id || `reel-${index}`) && (
              <div className="absolute right-0 top-0 h-full w-64 sm:w-80 bg-black/90 backdrop-blur-sm text-white p-3 sm:p-4 overflow-y-auto">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-base sm:text-lg font-semibold">Comments ({reel.comments?.length || 0})</h3>
                  <button 
                    onClick={() => setShowComments(null)}
                    className="text-gray-400 hover:text-white"
                  >
                    <svg className="w-5 h-5 sm:w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
                
                {/* Add Comment */}
                <div className="mb-4">
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={commentText}
                      onChange={(e) => setCommentText(e.target.value)}
                      placeholder="Add a comment..."
                      className="flex-1 px-2 sm:px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-300 focus:outline-none focus:border-white/40 text-sm"
                      onKeyPress={(e) => e.key === 'Enter' && handleComment(reel._id || `reel-${index}`)}
                    />
                    <button
                      onClick={() => handleComment(reel._id || `reel-${index}`)}
                      disabled={!commentText.trim()}
                      className="px-3 sm:px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-sm"
                    >
                      Post
                    </button>
                  </div>
                </div>
                
                {/* Comments List */}
                <div className="space-y-3">
                  {reel.comments?.map((comment) => (
                    <div key={comment._id} className="flex gap-2 sm:gap-3">
                      <img 
                        src={comment.user?.avatar} 
                        alt={comment.user?.name || 'User'}
                        className="w-6 h-6 sm:w-8 sm:h-8 rounded-full flex-shrink-0"
                      />
                      <div className="flex-1">
                        <div className="font-medium text-xs sm:text-sm">{comment.user?.name || 'Unknown User'}</div>
                        <div className="text-xs sm:text-sm text-gray-300">{comment.text || 'No text'}</div>
                        <div className="text-xs text-gray-400 mt-1">
                          {comment.createdAt ? new Date(comment.createdAt).toLocaleDateString() : 'Unknown date'}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        ))
        )}
        
        {/* Loading indicator for more reels */}
        {loading && reels.length > 0 && (
          <div className="h-[580px] sm:h-screen snap-start flex items-center justify-center">
            <div className="animate-spin rounded-full h-10 w-10 sm:h-12 sm:w-12 border-b-2 border-blue-600"></div>
          </div>
        )}
      </div>

      {/* Reels Creation Modal */}
      {showCreateModal && (
        <ReelsCreationModal
          isOpen={showCreateModal}
          onClose={() => setShowCreateModal(false)}
          onSuccess={() => {
            setShowCreateModal(false);
            loadReels(); // Refresh reels after creation
          }}
        />
      )}
    </div>
  );
}
