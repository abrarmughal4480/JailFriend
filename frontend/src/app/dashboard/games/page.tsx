"use client";
import React, { useState, FC } from 'react';
import { Plus, Gamepad2, Play, Star, Download, Menu, X, Filter } from 'lucide-react';

const GamesPage = () => {
  const [activeTab, setActiveTab] = useState<'Latest games' | 'My Games'>('Latest games');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [filterOpen, setFilterOpen] = useState(false);

  const tabs: Array<'Latest games' | 'My Games'> = ['Latest games', 'My Games'];

  // Mock games data for demonstration
  const mockGames = [
    {
      id: 1,
      title: 'Space Adventure',
      category: 'Action',
      rating: 4.8,
      downloads: '10M+',
      image: 'https://images.unsplash.com/photo-1511512578047-dfb367046420?w=400&h=300&fit=crop',
      description: 'Epic space exploration game with stunning graphics',
      size: '150MB',
      featured: true
    },
    {
      id: 2,
      title: 'Puzzle Master',
      category: 'Puzzle',
      rating: 4.6,
      downloads: '5M+',
      image: 'https://images.unsplash.com/photo-1606092195730-5d7b9af1efc5?w=400&h=300&fit=crop',
      description: 'Mind-bending puzzles to challenge your brain',
      size: '80MB',
      featured: false
    },
    {
      id: 3,
      title: 'Racing Thunder',
      category: 'Racing',
      rating: 4.7,
      downloads: '25M+',
      image: 'https://images.unsplash.com/photo-1542282088-fe8426682b8f?w=400&h=300&fit=crop',
      description: 'High-speed racing with realistic physics',
      size: '200MB',
      featured: true
    },
    {
      id: 4,
      title: 'Fantasy Quest',
      category: 'RPG',
      rating: 4.9,
      downloads: '15M+',
      image: 'https://images.unsplash.com/photo-1518709268805-4e9042af2176?w=400&h=300&fit=crop',
      description: 'Immersive fantasy role-playing adventure',
      size: '300MB',
      featured: false
    }
  ];

  const popularGames = mockGames.filter(game => game.featured);

  const GamepadIcon: FC = () => (
    <div className="w-12 h-12 sm:w-16 sm:h-16 bg-blue-100 rounded-full flex items-center justify-center mb-3 sm:mb-4">
      <Gamepad2 className="w-6 h-6 sm:w-8 sm:h-8 text-blue-500" />
    </div>
  );

  // Game Card Component
  const GameCard: FC<{ game: any; size?: 'small' | 'large' }> = ({ game, size = 'large' }) => (
    <div className={`bg-white rounded-lg border border-gray-200 overflow-hidden hover:shadow-md transition-shadow ${
      size === 'small' ? 'flex gap-3 p-3' : 'flex flex-col'
    }`}>
      <div className={`${size === 'small' ? 'w-16 h-16 flex-shrink-0' : 'w-full h-32 sm:h-40'} relative`}>
        <img 
          src={game.image} 
          alt={game.title}
          className="w-full h-full object-cover rounded-lg"
        />
        {game.featured && size === 'large' && (
          <div className="absolute top-2 left-2 bg-orange-500 text-white text-xs px-2 py-1 rounded-full">
            Featured
          </div>
        )}
      </div>
      
      <div className={`${size === 'small' ? 'flex-1 min-w-0' : 'p-3 sm:p-4'}`}>
        <div className="flex items-start justify-between mb-1 sm:mb-2">
          <h3 className={`font-semibold text-gray-900 truncate ${
            size === 'small' ? 'text-sm' : 'text-base sm:text-lg'
          }`}>
            {game.title}
          </h3>
          <div className="flex items-center gap-1 ml-2">
            <Star className="w-3 h-3 sm:w-4 sm:h-4 text-yellow-500 fill-current" />
            <span className="text-xs sm:text-sm text-gray-600">{game.rating}</span>
          </div>
        </div>
        
        <p className={`text-gray-600 mb-2 ${
          size === 'small' ? 'text-xs line-clamp-1' : 'text-xs sm:text-sm line-clamp-2'
        }`}>
          {game.description}
        </p>
        
        <div className={`flex items-center justify-between ${
          size === 'small' ? 'text-xs' : 'text-xs sm:text-sm'
        } text-gray-500 mb-2 sm:mb-3`}>
          <span className="bg-gray-100 px-2 py-1 rounded-full">{game.category}</span>
          <div className="flex items-center gap-1">
            <Download className="w-3 h-3" />
            <span>{game.downloads}</span>
          </div>
        </div>
        
        <button className={`w-full bg-blue-500 text-white rounded-lg font-medium hover:bg-blue-600 transition-colors flex items-center justify-center gap-2 ${
          size === 'small' ? 'py-1.5 text-xs' : 'py-2 sm:py-2.5 text-sm'
        }`}>
          <Play className="w-3 h-3 sm:w-4 sm:h-4" />
          Play
        </button>
      </div>
    </div>
  );

  // Define props type for EmptyGamesSection
  interface EmptyGamesSectionProps {
    title: string;
  }

  const EmptyGamesSection: FC<EmptyGamesSectionProps> = ({ title }) => (
    <div className="bg-white rounded-lg border border-gray-200 min-h-64 sm:min-h-80 flex flex-col items-center justify-center p-6 sm:p-8">
      <GamepadIcon />
      <p className="text-gray-600 text-sm sm:text-base font-medium">{title}</p>
    </div>
  );

  const GamesGrid: FC = () => (
    <div className="space-y-4 sm:space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4 lg:gap-6">
        {mockGames.map((game) => (
          <GameCard key={game.id} game={game} />
        ))}
      </div>
      
      {/* Load More */}
      <div className="text-center mt-6">
        <button className="text-blue-600 text-sm font-medium hover:text-blue-700 transition-colors">
          Load more games
        </button>
      </div>
    </div>
  );

  const MyGamesSection: FC = () => (
    <div className="space-y-4">
      <div className="bg-white rounded-lg border border-gray-200 p-4 sm:p-6">
        <h3 className="font-semibold text-gray-900 mb-4">Recently Played</h3>
        <div className="space-y-3">
          {mockGames.slice(0, 2).map((game) => (
            <GameCard key={game.id} game={game} size="small" />
          ))}
        </div>
      </div>
      
      <div className="bg-white rounded-lg border border-gray-200 p-4 sm:p-6">
        <h3 className="font-semibold text-gray-900 mb-4">My Library</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
          {mockGames.slice(1, 4).map((game) => (
            <GameCard key={game.id} game={game} />
          ))}
        </div>
      </div>
    </div>
  );

  return (
    <div className="w-full h-full overflow-y-auto scrollbar-hide">
      
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-4 sm:py-6">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 sm:mb-8 gap-4">
          <div className="flex items-center gap-3">
            <div className="w-6 h-6 sm:w-8 sm:h-8 bg-gray-600 rounded-lg flex items-center justify-center">
              <Gamepad2 className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
            </div>
            <h1 className="text-xl sm:text-2xl font-semibold text-gray-900">Games</h1>
          </div>

          <div className="flex items-center gap-2">
            {/* Filter Button - Mobile */}
            <button
              onClick={() => setFilterOpen(!filterOpen)}
              className="sm:hidden flex items-center gap-2 bg-white border border-gray-200 px-3 py-2 rounded-lg text-sm"
            >
              <Filter className="w-4 h-4" />
              Filter
            </button>

            {/* Tab Navigation */}
            <div className="flex items-center gap-1 bg-white rounded-lg border border-gray-200 p-1">
              {tabs.map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-3 sm:px-4 py-2 text-xs sm:text-sm font-medium rounded-md transition-colors whitespace-nowrap ${
                    activeTab === tab
                      ? 'bg-gray-100 text-gray-900'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="sm:hidden p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Filter Panel */}
        {filterOpen && (
          <div className="sm:hidden bg-white rounded-lg border border-gray-200 p-4 mb-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold text-gray-900">Filter Games</h3>
              <button
                onClick={() => setFilterOpen(false)}
                className="p-1 hover:bg-gray-100 rounded"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                <select className="w-full p-2 border border-gray-200 rounded-lg text-sm">
                  <option>All Categories</option>
                  <option>Action</option>
                  <option>Puzzle</option>
                  <option>Racing</option>
                  <option>RPG</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Rating</label>
                <select className="w-full p-2 border border-gray-200 rounded-lg text-sm">
                  <option>All Ratings</option>
                  <option>4.5+ Stars</option>
                  <option>4.0+ Stars</option>
                  <option>3.5+ Stars</option>
                </select>
              </div>
            </div>
          </div>
        )}

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <>
            <div 
              className="fixed inset-0 bg-black bg-opacity-50 z-40 sm:hidden"
              onClick={() => setMobileMenuOpen(false)}
            />
            <div className="fixed top-0 right-0 h-full w-64 bg-white shadow-lg z-50 sm:hidden">
              <div className="p-4 border-b">
                <h3 className="font-semibold text-gray-800">Game Menu</h3>
              </div>
              <div className="py-2">
                <button className="w-full text-left px-4 py-3 text-sm text-gray-700 hover:bg-gray-50">
                  Search Games
                </button>
                <button className="w-full text-left px-4 py-3 text-sm text-gray-700 hover:bg-gray-50">
                  Categories
                </button>
                <button className="w-full text-left px-4 py-3 text-sm text-gray-700 hover:bg-gray-50">
                  Top Rated
                </button>
                <button className="w-full text-left px-4 py-3 text-sm text-gray-700 hover:bg-gray-50">
                  New Releases
                </button>
              </div>
            </div>
          </>
        )}

        {/* Main Content Area */}
        <div className="mb-6 sm:mb-8">
          {activeTab === 'Latest games' && (
            mockGames.length > 0 ? <GamesGrid /> : <EmptyGamesSection title="No games to show" />
          )}
          {activeTab === 'My Games' && (
            mockGames.length > 0 ? <MyGamesSection /> : <EmptyGamesSection title="No games to show" />
          )}
        </div>

        {/* Popular Games Section */}
        {activeTab === 'Latest games' && (
          <div className="mb-6">
            <h2 className="text-base sm:text-lg font-semibold text-blue-600 mb-4 sm:mb-6">Popular Games</h2>
            {popularGames.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4 lg:gap-6">
                {popularGames.map((game) => (
                  <GameCard key={game.id} game={game} />
                ))}
              </div>
            ) : (
              <EmptyGamesSection title="No popular games to show" />
            )}
          </div>
        )}

        {/* Categories Section - Desktop */}
        <div className="hidden lg:block">
          <h2 className="text-lg font-semibold text-gray-900 mb-6">Browse by Category</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {['Action', 'Puzzle', 'Racing', 'RPG'].map((category) => (
              <button
                key={category}
                className="bg-white border border-gray-200 rounded-lg p-4 text-center hover:shadow-md transition-shadow"
              >
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-2">
                  <Gamepad2 className="w-6 h-6 text-blue-500" />
                </div>
                <span className="text-sm font-medium text-gray-900">{category}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Floating Action Button */}
      <button className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 w-12 h-12 sm:w-14 sm:h-14 bg-blue-500 text-white rounded-full shadow-lg hover:bg-blue-600 transition-colors flex items-center justify-center z-30">
        <Plus className="w-5 h-5 sm:w-6 sm:h-6" />
      </button>
    </div>
  );
};

export default GamesPage;
