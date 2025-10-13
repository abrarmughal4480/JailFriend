import React, { useState, useEffect, useRef } from 'react';
import { X, ChevronLeft, ChevronRight, Heart, MessageCircle, Eye, Trash2, Menu, ChevronDown } from 'lucide-react';

interface Story {
  _id: string;
  content?: string;
  media: string;
  mediaType: 'image' | 'video';
  thumbnail?: string;
  user: {
    _id: string;
    username: string;
    avatar: string;
    fullName: string;
  };
  views: Array<{ userId: string; viewedAt: string }>;
  reactions: Array<{ userId: string; type: string; createdAt: string }>;
  replies: Array<{ userId: string; content: string; createdAt: string }>;
  createdAt: string;
  expiresAt: string;
  privacy: string;
}

interface StoryViewerProps {
  stories: Story[];
  initialStoryIndex: number;
  onClose: () => void;
  onDelete?: (storyId: string) => void;
  onReact?: (storyId: string, reactionType: string) => void;
  onReply?: (storyId: string, content: string) => void;
  onView?: (storyId: string) => void;
}

const StoryViewer: React.FC<StoryViewerProps> = ({
  stories,
  initialStoryIndex,
  onClose,
  onDelete,
  onReact,
  onReply,
  onView
}) => {
  const [currentIndex, setCurrentIndex] = useState(initialStoryIndex);
  const [currentStory, setCurrentStory] = useState<Story>(stories[initialStoryIndex]);
  const [showReplies, setShowReplies] = useState(false);
  const [replyContent, setReplyContent] = useState('');
  const [isSubmittingReply, setIsSubmittingReply] = useState(false);
  const [timeLeft, setTimeLeft] = useState<number>(0);
  const [progress, setProgress] = useState<number>(0);
  const [localReactions, setLocalReactions] = useState<{[key: string]: string}>({});
  const [showReactionToast, setShowReactionToast] = useState(false);
  const [lastReaction, setLastReaction] = useState('');
  const [showSidebar, setShowSidebar] = useState(false);
  const [touchStart, setTouchStart] = useState<{ x: number; y: number } | null>(null);
  const [touchEnd, setTouchEnd] = useState<{ x: number; y: number } | null>(null);
  const [viewedStories, setViewedStories] = useState<Set<string>>(new Set());
  const [viewTrackingTimeout, setViewTrackingTimeout] = useState<NodeJS.Timeout | null>(null);
  const [isTrackingView, setIsTrackingView] = useState(false);
  const [showViewers, setShowViewers] = useState(false);
  
  const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
  const isOwnStory = currentStory?.user._id === currentUser._id || currentStory?.user._id === currentUser.id;
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const progressIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    setCurrentStory(stories[currentIndex]);
    
    // Track view when story changes
    if (stories[currentIndex] && onView) {
      const storyId = stories[currentIndex]._id;
      
      // Check if user has already viewed this story
      const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
      const userId = currentUser._id || currentUser.id;
      
      if (userId && !isOwnStory) {
        const hasViewed = stories[currentIndex].views?.some((view: any) => 
          view.userId === userId
        );
        
        if (!hasViewed && !viewedStories.has(storyId)) {
          // Clear any existing timeout
          if (viewTrackingTimeout) {
            clearTimeout(viewTrackingTimeout);
          }
          
          // Show tracking indicator
          setIsTrackingView(true);
          
          // Set a timeout to track view after 2 seconds (user has actually watched)
          const timeout = setTimeout(() => {
            onView(storyId);
            setViewedStories(prev => new Set([...prev, storyId]));
            setIsTrackingView(false);
          }, 2000);
          
          setViewTrackingTimeout(timeout);
        } else {
          setIsTrackingView(false);
        }
      }
    }
  }, [currentIndex, stories, onView, isOwnStory, viewedStories, viewTrackingTimeout]);

  useEffect(() => {
    if (currentStory) {
      const now = Date.now();
      const expiresAt = new Date(currentStory.expiresAt).getTime();
      const remaining = Math.max(0, expiresAt - now);
      setTimeLeft(remaining);
      
      // Calculate progress (0 to 100)
      const totalDuration = 24 * 60 * 60 * 1000; // 24 hours in milliseconds
      const elapsed = totalDuration - remaining;
      const progressPercent = Math.min(100, (elapsed / totalDuration) * 100);
      setProgress(progressPercent);

      // Auto-advance progress bar
      progressIntervalRef.current = setInterval(() => {
        setTimeLeft(prev => {
          const newTimeLeft = Math.max(0, prev - 1000);
          if (newTimeLeft === 0) {
            // Story expired, close viewer
            onClose();
          }
          return newTimeLeft;
        });
      }, 1000);

      return () => {
        if (progressIntervalRef.current) {
          clearInterval(progressIntervalRef.current);
          progressIntervalRef.current = null;
        }
      };
    }
  }, [currentStory, onClose]);

  const formatTimeLeft = (milliseconds: number) => {
    const hours = Math.floor(milliseconds / (1000 * 60 * 60));
    const minutes = Math.floor((milliseconds % (1000 * 60 * 60)) / (1000 * 60));
    return `${hours}h ${minutes}m`;
  };

  const formatViewTime = (viewedAt: string) => {
    const viewTime = new Date(viewedAt);
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - viewTime.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`;
    return `${Math.floor(diffInMinutes / 1440)}d ago`;
  };

  const handlePrevious = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    }
  };

  const handleNext = () => {
    if (currentIndex < stories.length - 1) {
      setCurrentIndex(currentIndex + 1);
    } else {
      onClose();
    }
  };

  const handleKeyPress = (e: KeyboardEvent) => {
    if (e.key === 'ArrowLeft') {
      handlePrevious();
    } else if (e.key === 'ArrowRight') {
      handleNext();
    } else if (e.key === 'Escape') {
      onClose();
    }
  };

  useEffect(() => {
    document.addEventListener('keydown', handleKeyPress);
    return () => document.removeEventListener('keydown', handleKeyPress);
  }, [currentIndex, stories.length]);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (viewTrackingTimeout) {
        clearTimeout(viewTrackingTimeout);
      }
    };
  }, [viewTrackingTimeout]);

  const handleReaction = (reactionType: string) => {
    if (onReact && currentStory) {
      // Add immediate local feedback
      const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
      const userId = currentUser._id || currentUser.id;
      
      setLocalReactions(prev => ({
        ...prev,
        [currentStory._id]: reactionType
      }));
      
      // Show reaction toast
      setLastReaction(reactionType);
      setShowReactionToast(true);
      setTimeout(() => setShowReactionToast(false), 1500);
      
      onReact(currentStory._id, reactionType);
    }
  };

  const handleSubmitReply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!replyContent.trim() || !onReply || !currentStory) return;

    setIsSubmittingReply(true);
    try {
      await onReply(currentStory._id, replyContent.trim());
      setReplyContent('');
      setShowReplies(false);
    } catch (error) {
      console.error('Failed to submit reply:', error);
    } finally {
      setIsSubmittingReply(false);
    }
  };

  const handleDelete = () => {
    if (onDelete && currentStory && isOwnStory) {
      if (window.confirm('Are you sure you want to delete this story?')) {
        onDelete(currentStory._id);
        onClose();
      }
    }
  };

  // Touch gesture handlers for mobile
  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchEnd(null);
    setTouchStart({
      x: e.targetTouches[0].clientX,
      y: e.targetTouches[0].clientY,
    });
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    setTouchEnd({
      x: e.targetTouches[0].clientX,
      y: e.targetTouches[0].clientY,
    });
  };

  const handleTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    
    const deltaX = touchStart.x - touchEnd.x;
    const deltaY = touchStart.y - touchEnd.y;
    const isLeftSwipe = deltaX > 50;
    const isRightSwipe = deltaX < -50;
    const isUpSwipe = deltaY > 50;
    const isDownSwipe = deltaY < -50;

    // Only handle horizontal swipes for story navigation
    if (Math.abs(deltaX) > Math.abs(deltaY)) {
      if (isLeftSwipe) {
        handleNext();
      } else if (isRightSwipe) {
        handlePrevious();
      }
    }
    
    // Handle vertical swipes for sidebar toggle
    if (Math.abs(deltaY) > Math.abs(deltaX)) {
      if (isUpSwipe) {
        setShowSidebar(true);
      } else if (isDownSwipe) {
        setShowSidebar(false);
      }
    }
  };

  if (!currentStory) return null;

  return (
    <div className="fixed inset-0 bg-black flex items-center justify-center z-[9999] p-0 sm:p-2">
      {/* Professional Story Container with Sidebar */}
      <div 
        className="w-full h-full sm:max-w-6xl sm:h-full sm:max-h-[90vh] bg-black sm:rounded-2xl overflow-hidden relative shadow-2xl flex flex-col sm:flex-row"
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        {/* Main Story View */}
        <div className="flex-1 relative">
        {/* Progress Bar */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gray-800">
          <div 
            className="h-full bg-white transition-all duration-1000 ease-linear"
            style={{ width: `${progress}%` }}
          />
        </div>

        {/* Reaction Toast */}
        {showReactionToast && (
          <div className="absolute top-20 left-1/2 transform -translate-x-1/2 bg-black bg-opacity-80 text-white px-4 py-2 rounded-full text-lg animate-bounce z-[200]">
            {lastReaction === 'like' && '👍 Liked!'}
            {lastReaction === 'love' && '❤️ Loved!'}
            {lastReaction === 'haha' && '😂 Haha!'}
            {lastReaction === 'wow' && '😮 Wow!'}
            {lastReaction === 'sad' && '😢 Sad!'}
            {lastReaction === 'angry' && '😠 Angry!'}
          </div>
        )}

        {/* Header */}
        <div className="absolute top-2 sm:top-4 left-2 right-2 z-[100] flex items-center justify-between">
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="w-12 h-12 sm:w-16 sm:h-16 md:w-20 md:h-20 rounded-full border-2 sm:border-4 border-white bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center">
              {currentStory.user.avatar ? (
                <img
                  src={currentStory.user.avatar} 
                  onError={(e) => { console.log('❌ Avatar load failed for user:', currentStory.user.avatar); e.currentTarget.src = '/default-avatar.svg'; }}
                  alt={currentStory.user.username}
                  className="w-full h-full rounded-full object-cover"
                />
              ) : (
                <span className="text-white text-lg sm:text-2xl font-bold">
                  {currentStory.user.fullName?.charAt(0) || currentStory.user.username?.charAt(0) || 'U'}
                </span>
              )}
            </div>
            <div className="text-white">
              <div className="text-sm sm:text-base font-semibold">{currentStory.user.fullName || currentStory.user.username}</div>
              <div className="text-xs text-gray-300">{formatTimeLeft(timeLeft)} left</div>
            </div>
          </div>
          
          <div className="flex items-center gap-1 sm:gap-2">
            {/* Mobile Menu Button */}
            <button
              onClick={() => setShowSidebar(!showSidebar)}
              className="p-2 bg-black bg-opacity-50 text-white rounded-full hover:bg-opacity-70 transition-colors sm:hidden"
            >
              <Menu className="w-5 h-5" />
            </button>
            
            {isOwnStory && onDelete && (
              <button
                onClick={handleDelete}
                className="p-2 bg-black bg-opacity-50 text-white rounded-full hover:bg-opacity-70 transition-colors"
              >
                <Trash2 className="w-4 h-4 sm:w-5 sm:h-5" />
              </button>
            )}
            <button
              onClick={onClose}
              className="p-2 bg-black bg-opacity-50 text-white rounded-full hover:bg-opacity-70 transition-colors"
            >
              <X className="w-4 h-4 sm:w-5 sm:h-5" />
            </button>
          </div>
        </div>

        {/* Navigation Arrows - Hidden on mobile, shown on desktop */}
        {currentIndex > 0 && (
          <button
            onClick={handlePrevious}
            className="hidden sm:block absolute left-2 top-1/2 transform -translate-y-1/2 p-2 bg-black bg-opacity-50 text-white rounded-full hover:bg-opacity-70 transition-colors z-[100]"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
        )}
        
        {currentIndex < stories.length - 1 && (
          <button
            onClick={handleNext}
            className="hidden sm:block absolute right-2 top-1/2 transform -translate-y-1/2 p-2 bg-black bg-opacity-50 text-white rounded-full hover:bg-opacity-70 transition-colors z-[100]"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        )}

        {/* Story Content */}
        <div className="relative w-full h-full flex items-center justify-center pb-16 sm:pb-20">
         {currentStory.mediaType === 'image' ? (
           <img
             src={currentStory.media}
             alt="Story"
             className="w-full h-full object-cover sm:object-contain"
           />
         ) : (
           <video
             ref={videoRef}
             src={currentStory.media}
             poster={currentStory.thumbnail}
             className="w-full h-full object-cover sm:object-contain"
             controls
             autoPlay
             muted
             playsInline
           />
         )}

        {/* Content Overlay */}
        {currentStory.content && (
          <div className="absolute bottom-16 sm:bottom-20 left-2 right-2 text-white text-center">
            <div className="bg-black bg-opacity-70 rounded-lg p-3 max-w-md mx-auto text-sm backdrop-blur-sm">
              {currentStory.content}
            </div>
          </div>
        )}
       </div>
        </div>

        {/* Mobile Overlay */}
        {showSidebar && (
          <div 
            className="fixed inset-0 bg-black bg-opacity-50 z-[199] sm:hidden"
            onClick={() => setShowSidebar(false)}
          />
        )}

        {/* Stories Sidebar - Mobile: Bottom sheet, Desktop: Right sidebar */}
        <div className={`${
          showSidebar ? 'translate-y-0' : 'translate-y-full sm:translate-y-0'
        } fixed sm:relative bottom-0 left-0 right-0 sm:left-auto sm:right-0 sm:top-0 w-full sm:w-80 h-2/3 sm:h-full bg-gray-900 border-t sm:border-t-0 sm:border-l border-gray-700 p-4 overflow-y-auto transition-transform duration-300 ease-in-out z-[200] sm:z-auto`}>
          <div className="mb-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-white text-lg font-semibold">Stories</h3>
              <button
                onClick={() => setShowSidebar(false)}
                className="sm:hidden p-1 text-gray-400 hover:text-white"
              >
                <ChevronDown className="w-5 h-5" />
              </button>
            </div>
            
            {/* Create New Story */}
            <div className="mb-4 p-3 bg-gray-800 rounded-lg border-2 border-dashed border-gray-600 hover:border-gray-500 transition-colors cursor-pointer">
              <div className="flex items-center justify-center w-16 h-20 bg-gray-700 rounded-lg mb-2">
                <div className="w-8 h-8 bg-gray-600 rounded-full flex items-center justify-center">
                  <span className="text-white text-lg">+</span>
                </div>
              </div>
              <p className="text-gray-300 text-sm text-center">Create new story</p>
            </div>
          </div>

          {/* Other Stories */}
          <div className="space-y-3">
            {stories.map((story, index) => {
              const isActive = index === currentIndex;
              
              return (
                <div 
                  key={story._id}
                  className={`p-3 rounded-lg cursor-pointer transition-all duration-200 ${
                    isActive 
                      ? 'bg-blue-600 text-white' 
                      : 'bg-gray-800 hover:bg-gray-700 text-gray-300'
                  }`}
                  onClick={() => setCurrentIndex(index)}
                >
                  <div className="flex items-center gap-3">
                    {/* Story Thumbnail */}
                    <div className="w-16 h-20 rounded-lg overflow-hidden flex-shrink-0">
                      {story.mediaType === 'video' ? (
                        <video
                          src={story.media}
                          poster={story.thumbnail}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <img
                          src={story.media}
                          alt="Story"
                          className="w-full h-full object-cover"
                        />
                      )}
                    </div>
                    
                    {/* Story Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-center mb-1">
                        {/* User Avatar */}
                        <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full overflow-hidden">
                          {story.user?.avatar ? (
                            <img
                              src={story.user.avatar}
                              alt={story.user.username || 'User'}
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                e.currentTarget.src = '/default-avatar.svg';
                              }}
                            />
                          ) : (
                            <div className="w-full h-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center">
                              <span className="text-white text-base font-bold">
                                {story.user?.fullName?.charAt(0) || story.user?.username?.charAt(0) || 'U'}
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                      
                      {/* Story Stats */}
                      <div className="flex items-center justify-center gap-2 mb-1">
                        <div className="flex items-center gap-1 text-xs opacity-75">
                          <Eye className="w-3 h-3" />
                          <span>{story.views?.length || 0}</span>
                        </div>
                        {story.reactions && story.reactions.length > 0 && (
                          <div className="flex items-center gap-1 text-xs opacity-75">
                            <span>❤️ {story.reactions.length}</span>
                          </div>
                        )}
                      </div>
                      
                      {/* Story Content Preview */}
                      {story.content && (
                        <p className="text-xs opacity-75 line-clamp-2 text-center">
                          {story.content}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Bottom Actions */}
        <div className="absolute bottom-2 left-2 right-2 flex items-center justify-between">
          <div className="flex items-center gap-1 sm:gap-2">
            {/* Views - Only clickable for story owner */}
            {isOwnStory ? (
              <button
                onClick={() => setShowViewers(true)}
                className={`flex items-center gap-1 text-white bg-black bg-opacity-30 rounded-full px-2 py-1 transition-all duration-300 hover:bg-opacity-50 cursor-pointer group ${
                  isTrackingView ? 'bg-blue-500 bg-opacity-50' : ''
                }`}
                title="Click to see who viewed your story"
              >
                <Eye className={`w-3 h-3 sm:w-4 sm:h-4 ${isTrackingView ? 'animate-pulse' : ''}`} />
                <span className="text-xs font-medium">{currentStory.views?.length || 0}</span>
                <span className="text-xs text-gray-300 hidden sm:inline">views</span>
                {isTrackingView && (
                  <div className="w-2 h-2 bg-blue-400 rounded-full animate-ping ml-1" />
                )}
                {/* Click indicator for story owner */}
                <div className="w-1 h-1 bg-blue-400 rounded-full opacity-0 group-hover:opacity-100 transition-opacity ml-1" />
              </button>
            ) : (
              <div className={`flex items-center gap-1 text-white bg-black bg-opacity-30 rounded-full px-2 py-1 transition-all duration-300 ${
                isTrackingView ? 'bg-blue-500 bg-opacity-50' : ''
              }`}>
                <Eye className={`w-3 h-3 sm:w-4 sm:h-4 ${isTrackingView ? 'animate-pulse' : ''}`} />
                <span className="text-xs font-medium">{currentStory.views?.length || 0}</span>
                <span className="text-xs text-gray-300 hidden sm:inline">views</span>
                {isTrackingView && (
                  <div className="w-2 h-2 bg-blue-400 rounded-full animate-ping ml-1" />
                )}
              </div>
            )}

            {/* Reaction Count */}
            {currentStory.reactions && currentStory.reactions.length > 0 && (
              <div className="flex items-center gap-1 text-white">
                <span className="text-xs">❤️ {currentStory.reactions.length}</span>
              </div>
            )}

            {/* Reactions - Scrollable on mobile */}
            <div className="flex items-center gap-1 overflow-x-auto scrollbar-hide max-w-[200px] sm:max-w-none">
              {['like', 'love', 'haha', 'wow', 'sad', 'angry'].map((reaction) => {
                const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
                const hasReacted = currentStory.reactions?.some((r: any) => 
                  r.userId === currentUser._id || r.userId === currentUser.id
                );
                const isCurrentReaction = hasReacted && currentStory.reactions?.some((r: any) => 
                  (r.userId === currentUser._id || r.userId === currentUser.id) && r.type === reaction
                );
                const isLocalReaction = localReactions[currentStory._id] === reaction;
                
                return (
                  <button
                    key={reaction}
                    onClick={() => handleReaction(reaction)}
                    className={`p-1 rounded-full hover:bg-opacity-70 transition-all duration-200 hover:scale-110 flex-shrink-0 ${
                      isCurrentReaction || isLocalReaction
                        ? 'bg-blue-500 text-white' 
                        : 'bg-black bg-opacity-50 text-white'
                    }`}
                    title={reaction}
                  >
                    {reaction === 'like' && '👍'}
                    {reaction === 'love' && '❤️'}
                    {reaction === 'haha' && '😂'}
                    {reaction === 'wow' && '😮'}
                    {reaction === 'sad' && '😢'}
                    {reaction === 'angry' && '😠'}
                  </button>
                );
              })}
            </div>

            {/* Reply Button */}
            <button
              onClick={() => setShowReplies(!showReplies)}
              className={`p-1 rounded-full hover:bg-opacity-70 transition-colors ${
                showReplies 
                  ? 'bg-blue-500 text-white' 
                  : 'bg-black bg-opacity-50 text-white'
              }`}
            >
              <MessageCircle className="w-3 h-3 sm:w-4 sm:h-4" />
            </button>
          </div>

          {/* Story Counter */}
          <div className="text-white text-xs">
            {currentIndex + 1} / {stories.length}
          </div>
        </div>

        {/* Replies Section */}
        {showReplies && (
          <div className="absolute bottom-16 sm:bottom-20 left-2 right-2 bg-black bg-opacity-90 rounded-lg p-3 max-h-48 sm:max-h-60 overflow-y-auto scrollbar-hide backdrop-blur-sm">
            <div className="text-white font-semibold mb-3 text-sm">Replies</div>
          
            {/* Reply Form */}
            <form onSubmit={handleSubmitReply} className="mb-4">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={replyContent}
                  onChange={(e) => setReplyContent(e.target.value)}
                  placeholder="Reply to this story..."
                  className="flex-1 px-2 py-2 sm:py-1 bg-white bg-opacity-20 text-white placeholder-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                  maxLength={200}
                />
                <button
                  type="submit"
                  disabled={!replyContent.trim() || isSubmittingReply}
                  className="px-3 py-2 sm:py-1 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                >
                  {isSubmittingReply ? 'Sending...' : 'Send'}
                </button>
              </div>
            </form>

            {/* Replies List */}
            <div className="space-y-3">
              {currentStory.replies?.length === 0 ? (
                <div className="text-gray-400 text-center py-4 text-sm">No replies yet</div>
              ) : (
                currentStory.replies?.map((reply, index) => (
                  <div key={index} className="flex items-start gap-2">
                    <div className="w-6 h-6 bg-gray-600 rounded-full flex-shrink-0" />
                    <div className="flex-1">
                      <div className="text-white text-xs font-medium">
                        {reply.userId === 'current' ? 'You' : 'User'}
                      </div>
                      <div className="text-gray-300 text-xs">{reply.content}</div>
                      <div className="text-gray-400 text-xs mt-1">
                        {new Date(reply.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
        </div>
      )}

      {/* Viewers Modal - Only for story owner */}
      {showViewers && isOwnStory && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[300] p-4">
          <div className="bg-gray-900 rounded-2xl w-full max-w-md max-h-[80vh] overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-gray-700">
              <h3 className="text-white text-lg font-semibold">Story Viewers</h3>
              <button
                onClick={() => setShowViewers(false)}
                className="p-2 text-gray-400 hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Viewers List */}
            <div className="p-4 overflow-y-auto max-h-96">
              {currentStory.views && currentStory.views.length > 0 ? (
                <div className="space-y-3">
                  {currentStory.views.map((view, index) => (
                    <div key={index} className="flex items-center gap-3 p-2 hover:bg-gray-800 rounded-lg transition-colors">
                      {/* User Avatar */}
                      <div className="w-10 h-10 rounded-full overflow-hidden flex-shrink-0">
                        <div className="w-full h-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center">
                          <span className="text-white text-sm font-bold">
                            {view.userId?.charAt(0) || 'U'}
                          </span>
                        </div>
                      </div>
                      
                      {/* User Info */}
                      <div className="flex-1 min-w-0">
                        <div className="text-white text-sm font-medium">
                          User {view.userId?.slice(-4) || 'Unknown'}
                        </div>
                        <div className="text-gray-400 text-xs">
                          {formatViewTime(view.viewedAt)}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Eye className="w-12 h-12 text-gray-500 mx-auto mb-3" />
                  <p className="text-gray-400 text-sm">No views yet</p>
                  <p className="text-gray-500 text-xs mt-1">Be the first to view this story!</p>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="p-4 border-t border-gray-700">
              <div className="text-center text-gray-400 text-sm">
                {currentStory.views?.length || 0} total views
              </div>
            </div>
          </div>
        </div>
      )}
      
      <style jsx>{`
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
        .scrollbar-hide::-webkit-scrollbar { 
          display: none;
        }
      `}</style>
      </div> {/* Close mobile container */}
    </div>
  );
};

export default StoryViewer;
