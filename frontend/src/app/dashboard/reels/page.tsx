'use client';
import { useState, useEffect, useMemo, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import ReelsCreationModal from '@/components/ReelsCreationModal';
import { getReels, Reel, ReelsResponse } from '@/utils/reelsApi';
import { Heart, MessageCircle, Share, Bookmark, MoreHorizontal, Play, Pause, Volume2, VolumeX } from 'lucide-react';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://jailfriend-1.onrender.com';

// Helper function to construct proper video URLs
const getVideoUrl = (url: string): string => {
  if (!url) return '';
  
  // If already a full URL, return as is
  if (url.startsWith('http')) {
    return url;
  }
  
  // Get base URL and handle localhost vs production
  let baseUrl = API_URL;
  
  // For localhost development, use HTTP to avoid SSL errors
  if (baseUrl.includes('localhost') || baseUrl.includes('127.0.0.1')) {
    baseUrl = baseUrl.replace('https://', 'http://');
  } else if (typeof window !== 'undefined' && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')) {
    // If API_URL is production but we're running locally, try common dev ports
    const devPorts = [3002, 5000, 8000, 3001];
    for (const port of devPorts) {
      const testUrl = `http://localhost:${port}`;
      // For now, we'll use the most common backend port
      if (port === 3002) {
        baseUrl = testUrl;
        break;
      }
    }
  } else {
    // For production, ensure HTTPS
    baseUrl = baseUrl.replace('http://', 'https://');
  }
  
  // Ensure proper URL construction with forward slash
  const cleanPath = url.startsWith('/') ? url : `/${url}`;
  
  const finalUrl = `${baseUrl}${cleanPath}`;
  
  return finalUrl;
};

export default function ReelsPage() {
  const router = useRouter();
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('general');
  const [showTrending, setShowTrending] = useState(false);
  const [reels, setReels] = useState<Reel[]>([]);
  const [currentReelIndex, setCurrentReelIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');
  const [isPlaying, setIsPlaying] = useState(true);
  const [isMuted, setIsMuted] = useState(true);
  const [showComments, setShowComments] = useState<string | null>(null);
  const [commentText, setCommentText] = useState('');
  const [isLiking, setIsLiking] = useState<string | null>(null);
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);
  const [lastTap, setLastTap] = useState<number>(0);
  const [showLikeAnimation, setShowLikeAnimation] = useState(false);

  // Handle horizontal scroll with mouse wheel
  const handleWheelScroll = (e: React.WheelEvent) => {
    const container = e.currentTarget as HTMLElement;
    e.preventDefault();
    container.scrollLeft += e.deltaY;
  };

  // Handle click and drag scrolling
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollLeft, setScrollLeft] = useState(0);
  
  // Handle page scroll for reel navigation
  const [isScrolling, setIsScrolling] = useState(false);
  const [scrollTimeout, setScrollTimeout] = useState<NodeJS.Timeout | null>(null);

  const handleMouseDown = (e: React.MouseEvent) => {
    const container = e.currentTarget as HTMLElement;
    setIsDragging(true);
    setStartX(e.pageX - container.offsetLeft);
    setScrollLeft(container.scrollLeft);
    container.style.cursor = 'grabbing';
  };

  const handleMouseLeave = () => {
    setIsDragging(false);
  };

  const handleMouseUp = () => {
    setIsDragging(false);
    document.body.style.cursor = 'default';
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    e.preventDefault();
    const container = e.currentTarget as HTMLElement;
    const x = e.pageX - container.offsetLeft;
    const walk = (x - startX) * 2; // Scroll speed
    container.scrollLeft = scrollLeft - walk;
  };


  // Memoize categories to prevent recreation on every render
  const categories = useMemo(() => [
    { id: 'general', name: 'General', icon: '🎬' },
    { id: 'comedy', name: 'Comedy', icon: '😂' },
    { id: 'dance', name: 'Dance', icon: '💃' },
    { id: 'food', name: 'Food', icon: '🍕' },
    { id: 'travel', name: 'Travel', icon: '✈️' },
    { id: 'fashion', name: 'Fashion', icon: '👗' },
    { id: 'beauty', name: 'Beauty', icon: '💄' },
    { id: 'fitness', name: 'Fitness', icon: '💪' },
    { id: 'education', name: 'Education', icon: '📚' },
    { id: 'music', name: 'Music', icon: '🎵' },
    { id: 'gaming', name: 'Gaming', icon: '🎮' },
    { id: 'sports', name: 'Sports', icon: '⚽' },
    { id: 'technology', name: 'Technology', icon: '💻' },
    { id: 'lifestyle', name: 'Lifestyle', icon: '🌟' }
  ], []);

  // Memoize loadReels function to prevent recreation on every render
  const loadReels = useCallback(async () => {
    try {
      setLoading(true);
      setError('');
      
      let response: ReelsResponse | Reel[];
      if (showTrending) {
        response = await getReels({ trending: true, page: 1, limit: 20 });
        setReels(Array.isArray(response) ? response : response.reels || []);
      } else {
        response = await getReels({ category: selectedCategory, page: 1, limit: 20 });
        setReels(Array.isArray(response) ? response : response.reels || []);
      }
      
      setCurrentReelIndex(0);
    } catch (error: any) {
      console.error('❌ Error loading reels:', error);
      setError(error.message || 'Failed to load reels');
    } finally {
      setLoading(false);
    }
  }, [selectedCategory, showTrending]);

  useEffect(() => {
    loadReels();
  }, [loadReels]);

  // Allow normal page behavior for better navigation
  useEffect(() => {
    // Remove any previous scroll restrictions
    document.body.style.overflow = 'unset';
  }, []);


  // Remove excessive debug logging for production

  // Keyboard navigation
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.key === 'ArrowUp' || e.key === 'ArrowLeft') {
        handleReelChange('up');
      } else if (e.key === 'ArrowDown' || e.key === 'ArrowRight') {
        handleReelChange('down');
      } else if (e.key === ' ') {
        e.preventDefault();
        const video = document.querySelector('video');
        if (video) {
          if (isPlaying) {
            video.pause();
          } else {
            video.play();
          }
        }
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [currentReelIndex, isPlaying]);

  const handleCreateSuccess = useCallback(() => {
    console.log('🎬 Reel creation successful!');
    setShowCreateModal(false);
    loadReels();
    alert('🎬 Reel created successfully!');
  }, [loadReels]);

  const handleCategoryChange = useCallback((categoryId: string) => {
    setSelectedCategory(categoryId);
    setShowTrending(false);
  }, []);

  const handleTrendingToggle = useCallback(() => {
    setShowTrending(prev => {
      const newShowTrending = !prev;
      if (newShowTrending) {
        setSelectedCategory('general');
      }
      return newShowTrending;
    });
  }, []);

  const handleReelChange = useCallback((direction: 'up' | 'down') => {
    setCurrentReelIndex(prev => {
      if (direction === 'up' && prev > 0) {
        return prev - 1;
      } else if (direction === 'down' && prev < reels.length - 1) {
        return prev + 1;
      }
      return prev;
    });
  }, [reels.length]);

  // Handle page scroll for reel navigation (Instagram style)
  const handlePageScroll = useCallback((e: WheelEvent) => {
    if (isScrolling) return; // Prevent rapid scrolling
    
    e.preventDefault();
    setIsScrolling(true);
    
    // Clear existing timeout
    if (scrollTimeout) {
      clearTimeout(scrollTimeout);
    }
    
    const deltaY = e.deltaY;
    
    if (deltaY > 0 && currentReelIndex < reels.length - 1) {
      // Scroll down - next reel
      handleReelChange('down');
    } else if (deltaY < 0 && currentReelIndex > 0) {
      // Scroll up - previous reel
      handleReelChange('up');
    }
    
    // Reset scrolling state after delay
    const timeout = setTimeout(() => {
      setIsScrolling(false);
    }, 500); // 500ms delay to prevent rapid scrolling
    
    setScrollTimeout(timeout);
  }, [currentReelIndex, reels.length, isScrolling, scrollTimeout, handleReelChange]);

  // Add scroll event listener for reel navigation
  useEffect(() => {
    const handleWheel = (e: WheelEvent) => {
      // Only handle scroll if not in header filter area
      const target = e.target as HTMLElement;
      if (target.closest('.filter-scroll-area')) {
        return; // Let filter area handle its own scroll
      }
      handlePageScroll(e);
    };

    window.addEventListener('wheel', handleWheel, { passive: false });
    
    return () => {
      window.removeEventListener('wheel', handleWheel);
      if (scrollTimeout) {
        clearTimeout(scrollTimeout);
      }
    };
  }, [handlePageScroll, scrollTimeout]);

  const handleLike = async (reelId: string) => {
    if (isLiking) return;
    
    try {
      setIsLiking(reelId);
      // Here you would call the like API
      console.log('❤️ Liking reel:', reelId);
      // Update local state optimistically
      setReels(prev => prev.map(reel => 
        reel._id === reelId 
          ? { ...reel, likes: [...reel.likes, 'current-user-id'] }
          : reel
      ));
    } catch (error) {
      console.error('Error liking reel:', error);
    } finally {
      setIsLiking(null);
    }
  };

  const handleShare = async (reelId: string) => {
    try {
      if (navigator.share) {
        await navigator.share({
          title: 'Check out this reel!',
          url: `${window.location.origin}/dashboard/reels/${reelId}`
        });
      } else {
        // Fallback to copying to clipboard
        await navigator.clipboard.writeText(`${window.location.origin}/dashboard/reels/${reelId}`);
        alert('Link copied to clipboard!');
      }
    } catch (error) {
      console.error('Error sharing reel:', error);
    }
  };

  // Enhanced touch handlers for swipe navigation and double-tap to like
  const [touchStartTime, setTouchStartTime] = useState<number>(0);
  const [isTouchScrolling, setIsTouchScrolling] = useState(false);

  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientY);
    setTouchStartTime(Date.now());
    setIsTouchScrolling(false);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!touchStart) return;
    
    const currentY = e.targetTouches[0].clientY;
    setTouchEnd(currentY);
    
    // Calculate distance and check if it's a scroll gesture
    const distance = Math.abs(touchStart - currentY);
    if (distance > 10) {
      setIsTouchScrolling(true);
    }
    
    // Prevent default scroll behavior during touch move
    e.preventDefault();
  };

  const handleTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    
    const distance = touchStart - touchEnd;
    const touchDuration = Date.now() - touchStartTime;
    const isUpSwipe = distance > 50; // Swipe up threshold
    const isDownSwipe = distance < -50; // Swipe down threshold
    
    // Only process swipe if it was a scrolling gesture and not too slow
    if (isTouchScrolling && touchDuration < 1000) {
      if (isUpSwipe && currentReelIndex < reels.length - 1) {
        // Swipe up to go to next reel
        handleReelChange('down');
      } else if (isDownSwipe && currentReelIndex > 0) {
        // Swipe down to go to previous reel  
        handleReelChange('up');
      }
    }
    
    // Reset touch states
    setTouchStart(null);
    setTouchEnd(null);
    setIsTouchScrolling(false);
  };

  // Double-tap to like functionality
  const handleDoubleTap = () => {
    const now = Date.now();
    if (now - lastTap < 300) {
      // Double tap detected
      if (currentReel) {
        handleLike(currentReel._id);
        setShowLikeAnimation(true);
        setTimeout(() => setShowLikeAnimation(false), 1000);
      }
    }
    setLastTap(now);
  };

  // Memoize currentReel to prevent unnecessary re-computations
  const currentReel = useMemo(() => reels[currentReelIndex], [reels, currentReelIndex]);

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
          <p className="text-white text-lg">Loading reels...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-400 text-lg mb-4">Error: {error}</p>
          <button 
            onClick={loadReels}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (reels.length === 0) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">🎬</div>
          <h2 className="text-white text-2xl font-bold mb-2">No reels found</h2>
          <p className="text-gray-400 mb-6">Be the first to create a reel in this category!</p>
          <div className="text-white text-sm mb-4">
            Modal State: {showCreateModal ? 'OPEN' : 'CLOSED'}
          </div>
          <button
            onClick={() => {
              console.log('🎬 Create reel button clicked!');
              alert('Button clicked! Opening modal...');
              setShowCreateModal(true);
            }}
            className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-8 py-3 rounded-lg font-semibold hover:from-blue-700 hover:to-purple-700 transition-all duration-200"
          >
            Create Your First Reel
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black">
      {/* Header with three distinct sections */}
      <div className="bg-black border-b border-gray-800 sticky top-0 z-50">
        <div className="px-4 py-4">
          <div className="grid grid-cols-[auto_1fr_auto] items-center gap-4">
            {/* Left Section - Back button and title */}
            <div className="flex items-center gap-3">
              <button
                onClick={() => router.back()}
                className="text-white hover:text-gray-300 transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <h1 className="text-xl font-bold text-white">Reels</h1>
            </div>

            {/* Center Section - Category filters with limited width and overflow scroll */}
            <div 
              className="filter-scroll-area w-full max-w-md overflow-x-scroll overflow-y-hidden scrollbar-hide cursor-grab select-none mx-auto" 
              style={{ 
                scrollbarWidth: 'none',
                msOverflowStyle: 'none'
              }}
              onWheel={handleWheelScroll}
              onMouseDown={handleMouseDown}
              onMouseLeave={handleMouseLeave}
              onMouseUp={handleMouseUp}
              onMouseMove={handleMouseMove}
            >
              <div className="flex items-center gap-2 justify-start min-w-max px-2 py-1">
                <button
                  onClick={handleTrendingToggle}
                  className={`px-3 py-1.5 rounded-full font-medium transition-all duration-200 whitespace-nowrap flex-shrink-0 text-sm ${
                    showTrending
                      ? 'bg-red-500 text-white'
                      : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                  }`}
                >
                  🔥 Trending
                </button>

                {categories.map((category) => (
                  <button
                    key={category.id}
                    onClick={() => handleCategoryChange(category.id)}
                    disabled={showTrending}
                    className={`px-3 py-1.5 rounded-full font-medium transition-all duration-200 whitespace-nowrap flex-shrink-0 text-sm ${
                      !showTrending && selectedCategory === category.id
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-800 text-gray-300 hover:bg-gray-700 disabled:opacity-50'
                    }`}
                  >
                    {category.icon} {category.name}
                  </button>
                ))}
              </div>
            </div>

            {/* Right Section - Create button */}
            <div className="flex justify-end">
              <button
                onClick={() => setShowCreateModal(true)}
                className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-2 rounded-lg font-semibold hover:from-blue-700 hover:to-purple-700 transition-all duration-200"
              >
                Create
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Reels Container - Full height minus header with enhanced touch */}
      <div 
        className="relative h-[calc(100vh-120px)] flex items-center justify-center bg-black touch-pan-y"
        style={{ touchAction: 'pan-y' }}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        {/* Reel Video Container - Fit within available height */}
        {currentReel && (
          <div 
            className="relative w-full max-w-[350px] h-[calc(100vh-140px)] bg-black mx-auto sm:max-w-[380px] sm:h-[calc(100vh-140px)] md:max-w-[400px] md:h-[calc(100vh-160px)]"
            onDoubleClick={handleDoubleTap}
          >
            <video
              key={currentReel._id}
              className="w-full h-full object-contain rounded-none"
              style={{
                objectFit: 'contain',
                objectPosition: 'center'
              }}
              autoPlay
              muted={isMuted}
              loop
              playsInline
              onPlay={() => setIsPlaying(true)}
              onPause={() => setIsPlaying(false)}
              onError={(e) => {
                console.error('❌ Video failed to load:', currentReel.videoUrl);
                console.error('❌ Constructed URL:', getVideoUrl(currentReel.videoUrl));
                console.error('❌ Video error event:', e.nativeEvent);
                // Don't set global error, just log it - let video handle its own fallback
              }}
              onLoadStart={() => {
                console.log('🎬 Video loading started:', getVideoUrl(currentReel.videoUrl));
              }}
            >
              <source src={getVideoUrl(currentReel.videoUrl)} type="video/mp4" />
              {/* Fallback content when video fails to load */}
              <div className="w-full h-full bg-gray-900 flex items-center justify-center">
                <div className="text-center text-white">
                  <div className="text-6xl mb-4">🎬</div>
                  <p className="text-lg mb-2">Video Unavailable</p>
                  <p className="text-sm text-gray-400">This video could not be loaded</p>
                  <p className="text-xs text-gray-500 mt-2">URL: {getVideoUrl(currentReel.videoUrl)}</p>
                </div>
              </div>
            </video>

            {/* Double-tap like animation */}
            {showLikeAnimation && (
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className="animate-ping">
                  <Heart className="w-20 h-20 text-red-500 fill-red-500" />
                </div>
              </div>
            )}

            {/* Video Controls Overlay - Instagram style */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <button
                onClick={() => {
                  const video = document.querySelector('video');
                  if (video) {
                    if (isPlaying) {
                      video.pause();
                    } else {
                      video.play();
                    }
                  }
                }}
                className="w-20 h-20 bg-black bg-opacity-30 rounded-full flex items-center justify-center text-white hover:bg-opacity-50 transition-all duration-200 pointer-events-auto opacity-0 hover:opacity-100"
              >
                {isPlaying ? <Pause className="w-10 h-10" /> : <Play className="w-10 h-10 ml-1" />}
              </button>
            </div>

            {/* Reel Info Overlay - Instagram style */}
            <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black via-black/70 to-transparent">
              <div className="flex items-end justify-between">
                {/* Left Side - User Info & Description */}
                <div className="flex-1 pr-16">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="relative">
                      <img
                        src={currentReel.user.avatar || '/default-avatar.svg'}
                        alt={currentReel.user.name}
                        className="w-12 h-12 rounded-full border-2 border-white"
                      />
                      <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-blue-500 rounded-full border-2 border-black"></div>
                    </div>
                    <div className="flex-1">
                      <h3 className="text-white font-semibold text-base">@{currentReel.user.username}</h3>
                      <p className="text-gray-300 text-sm">{currentReel.user.name}</p>
                    </div>
                    <button className="bg-white text-black px-4 py-1.5 rounded-full text-sm font-semibold hover:bg-gray-200 transition-colors">
                      Follow
                    </button>
                  </div>
                  
                  <div className="space-y-2">
                    <p className="text-white text-sm leading-relaxed">{currentReel.title}</p>
                    
                    {currentReel.hashtags && currentReel.hashtags.length > 0 && (
                      <div className="flex flex-wrap gap-1">
                        {currentReel.hashtags.slice(0, 5).map((tag, index) => (
                          <span key={index} className="text-blue-400 text-sm font-medium">#{tag}</span>
                        ))}
                      </div>
                    )}
                    
                    <div className="flex items-center gap-2 text-gray-300 text-xs">
                      <span>{new Date(currentReel.createdAt).toLocaleDateString()}</span>
                      <span>•</span>
                      <span>{currentReel.views || 0} views</span>
                    </div>

                    {/* Music Info - Instagram style */}
                    {currentReel.music && (
                      <div className="flex items-center gap-2 mt-2">
                        <div className="w-4 h-4 bg-white rounded-full flex items-center justify-center">
                          <svg className="w-2 h-2 text-black" fill="currentColor" viewBox="0 0 20 20">
                            <path d="M18 3a1 1 0 00-1.196-.98l-10 2A1 1 0 006 5v9.114A4.369 4.369 0 005 14c-1.657 0-3 .895-3 2s1.343 2 3 2 3-.895 3-2V7.82l8-1.6v5.894A4.369 4.369 0 0015 12c-1.657 0-3 .895-3 2s1.343 2 3 2 3-.895 3-2V3z"/>
                          </svg>
                        </div>
                        <span className="text-white text-sm font-medium">{currentReel.music.title}</span>
                        <div className="w-1 h-1 bg-gray-400 rounded-full"></div>
                        <span className="text-gray-300 text-xs">{currentReel.music.artist}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Right Side - Action Buttons - Instagram style */}
                <div className="flex flex-col items-center gap-6">
                  {/* Like Button */}
                  <button
                    onClick={() => handleLike(currentReel._id)}
                    disabled={isLiking === currentReel._id}
                    className="flex flex-col items-center gap-1 text-white hover:text-red-500 transition-colors"
                  >
                    <div className="w-12 h-12 bg-black bg-opacity-30 rounded-full flex items-center justify-center hover:bg-opacity-50 transition-all duration-200">
                      <Heart className={`w-7 h-7 ${currentReel.likes.includes('current-user-id') ? 'fill-red-500 text-red-500' : ''}`} />
                    </div>
                    <span className="text-xs font-semibold text-white">{currentReel.likes.length}</span>
                  </button>

                  {/* Comment Button */}
                  <button
                    onClick={() => setShowComments(showComments === currentReel._id ? null : currentReel._id)}
                    className="flex flex-col items-center gap-1 text-white hover:text-blue-400 transition-colors"
                  >
                    <div className="w-12 h-12 bg-black bg-opacity-30 rounded-full flex items-center justify-center hover:bg-opacity-50 transition-all duration-200">
                      <MessageCircle className="w-7 h-7" />
                    </div>
                    <span className="text-xs font-semibold text-white">{currentReel.comments.length}</span>
                  </button>

                  {/* Share Button */}
                  <button
                    onClick={() => handleShare(currentReel._id)}
                    className="flex flex-col items-center gap-1 text-white hover:text-green-400 transition-colors"
                  >
                    <div className="w-12 h-12 bg-black bg-opacity-30 rounded-full flex items-center justify-center hover:bg-opacity-50 transition-all duration-200">
                      <Share className="w-7 h-7" />
                    </div>
                    <span className="text-xs font-semibold text-white">{currentReel.shares.length}</span>
                  </button>

                  {/* Save Button */}
                  <button className="flex flex-col items-center gap-1 text-white hover:text-yellow-400 transition-colors">
                    <div className="w-12 h-12 bg-black bg-opacity-30 rounded-full flex items-center justify-center hover:bg-opacity-50 transition-all duration-200">
                      <Bookmark className="w-7 h-7" />
                    </div>
                  </button>

                  {/* More Options */}
                  <button className="flex flex-col items-center gap-1 text-white hover:text-gray-400 transition-colors">
                    <div className="w-12 h-12 bg-black bg-opacity-30 rounded-full flex items-center justify-center hover:bg-opacity-50 transition-all duration-200">
                      <MoreHorizontal className="w-7 h-7" />
                    </div>
                  </button>
                </div>
              </div>
            </div>

            {/* Volume Control - Instagram style */}
            <button
              onClick={() => setIsMuted(!isMuted)}
              className="absolute top-4 right-4 w-10 h-10 bg-black bg-opacity-30 rounded-full flex items-center justify-center text-white hover:bg-opacity-50 transition-all duration-200"
            >
              {isMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
            </button>



        </div>
        )}
      </div>

      {/* Comments Modal - Instagram style */}
      {showComments && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-end">
          <div className="bg-white w-full h-3/4 rounded-t-3xl p-4 flex flex-col">
            <div className="flex items-center justify-between mb-4 pb-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">Comments</h3>
              <button
                onClick={() => setShowComments(null)}
                className="text-gray-500 hover:text-gray-700 p-2"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <div className="flex-1 space-y-4 mb-4 overflow-y-auto scrollbar-hide">
              {currentReel?.comments.map((comment, index) => (
                <div key={index} className="flex items-start gap-3">
                  <img
                    src={comment.user.avatar || '/default-avatar.svg'}
                    alt={comment.user.name}
                    className="w-10 h-10 rounded-full border-2 border-gray-200"
                  />
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-semibold text-sm text-gray-900">{comment.user.name}</span>
                      <span className="text-gray-500 text-xs">{new Date(comment.createdAt).toLocaleDateString()}</span>
                    </div>
                    <p className="text-gray-700 text-sm leading-relaxed">{comment.text}</p>
                    <div className="flex items-center gap-4 mt-2">
                      <button className="text-gray-500 hover:text-red-500 text-xs font-medium">Like</button>
                      <button className="text-gray-500 hover:text-blue-500 text-xs font-medium">Reply</button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            
            <div className="flex items-center gap-3 pt-4 border-t border-gray-200">
              <img
                src="/default-avatar.svg"
                alt="Your avatar"
                className="w-8 h-8 rounded-full"
              />
              <div className="flex-1 flex items-center gap-2">
                <input
                  type="text"
                  value={commentText}
                  onChange={(e) => setCommentText(e.target.value)}
                  placeholder="Add a comment..."
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <button 
                  className="bg-blue-600 text-white px-6 py-2 rounded-full hover:bg-blue-700 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={!commentText.trim()}
                >
                  Post
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Create Reel Modal */}
      <ReelsCreationModal
        isOpen={showCreateModal}
        onClose={() => {
          console.log('🚪 Closing modal');
          setShowCreateModal(false);
        }}
        onSuccess={handleCreateSuccess}
      />
    </div>
  );
}
