'use client';
import { useState, useMemo, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import ReelsCreationModal from '@/components/ReelsCreationModal';
import ReelsDisplay from '@/components/ReelsDisplay';
import { useDarkMode } from '@/contexts/DarkModeContext';

export default function ReelsPage() {
  const { isDarkMode } = useDarkMode();
  const router = useRouter();
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('general');
  const [showTrending, setShowTrending] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  // Memoize categories
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

  const handleCreateSuccess = useCallback(() => {
    console.log('🎬 Reel creation successful!');
    setShowCreateModal(false);
    setRefreshKey(prev => prev + 1);
    alert('🎬 Reel created successfully!');
  }, []);

  // Handle horizontal scroll with mouse wheel for filters
  const handleWheelScroll = (e: React.WheelEvent) => {
    const container = e.currentTarget as HTMLElement;
    e.preventDefault();
    container.scrollLeft += e.deltaY;
  };

  return (
    <div className={`h-screen flex flex-col overflow-hidden ${isDarkMode ? 'bg-gray-900' : 'bg-black'}`}>
      {/* Header with three distinct sections */}
      <div className={`${isDarkMode ? 'bg-gray-900 border-gray-700' : 'bg-black border-gray-800'} border-b flex-shrink-0 z-50`}>
        <div className="px-4 py-4">
          <div className="grid grid-cols-[auto_1fr_auto] items-center gap-4">
            {/* Left Section - Back button and title */}
            <div className="flex items-center gap-3">
              <button
                onClick={() => router.back()}
                className={isDarkMode ? 'text-gray-300 hover:text-gray-100 transition-colors' : 'text-white hover:text-gray-300 transition-colors'}
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <h1 className={isDarkMode ? 'text-xl font-bold text-gray-100' : 'text-xl font-bold text-white'}>Reels</h1>
            </div>

            {/* Center Section - Category filters with limited width and overflow scroll */}
            <div
              className="filter-scroll-area w-full max-w-md overflow-x-scroll overflow-y-hidden scrollbar-hide cursor-grab select-none mx-auto"
              style={{
                scrollbarWidth: 'none',
                msOverflowStyle: 'none'
              }}
              onWheel={handleWheelScroll}
            >
              <div className="flex items-center gap-2 justify-start min-w-max px-2 py-1">
                <button
                  onClick={handleTrendingToggle}
                  className={`px-3 py-1.5 rounded-full font-medium transition-all duration-200 whitespace-nowrap flex-shrink-0 text-sm ${showTrending
                    ? 'bg-red-500 text-white'
                    : isDarkMode
                      ? 'bg-gray-700 text-gray-200 hover:bg-gray-600'
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
                    className={`px-3 py-1.5 rounded-full font-medium transition-all duration-200 whitespace-nowrap flex-shrink-0 text-sm ${!showTrending && selectedCategory === category.id
                      ? 'bg-blue-600 text-white'
                      : isDarkMode
                        ? 'bg-gray-700 text-gray-200 hover:bg-gray-600 disabled:opacity-50'
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

      {/* Main Content - Reels Display */}
      <div className="flex-1 min-h-0 relative">
        <ReelsDisplay
          key={refreshKey}
          initialCategory={selectedCategory}
          trending={showTrending}
          hideHeader={true}
        />
      </div>

      {/* Create Reel Modal */}
      <ReelsCreationModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onSuccess={handleCreateSuccess}
      />
    </div>
  );
}