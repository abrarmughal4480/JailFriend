'use client';

import { useState, useEffect } from 'react';
import { useDarkMode } from '@/contexts/DarkModeContext';

interface Game {
  _id: string;
  name: string;
  title?: string;
  description?: string;
  players?: Array<{
    userId?: string;
    score?: number;
    playedAt?: string;
  }>;
  totalPlays?: number;
  createdAt: string;
  updatedAt?: string;
}

const ManageGames = () => {
  const { isDarkMode } = useDarkMode();
  const [games, setGames] = useState<Game[]>([]);
  const [filteredGames, setFilteredGames] = useState<Game[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedGames, setSelectedGames] = useState<string[]>([]);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [totalGames, setTotalGames] = useState<number>(0);
  const [idSortOrder, setIdSortOrder] = useState<'asc' | 'desc'>('asc');
  const [addedSortOrder, setAddedSortOrder] = useState<'asc' | 'desc'>('desc');
  const [deleting, setDeleting] = useState<boolean>(false);
  const [filter, setFilter] = useState<string>('All');

  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://jaifriend-backend.hgdjlive.com';
  const itemsPerPage = 15;

  useEffect(() => {
    fetchGames();
  }, [currentPage, idSortOrder, addedSortOrder, filter]);

  useEffect(() => {
    filterGames();
  }, [searchQuery, games]);

  const fetchGames = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      
      // Try to fetch games from API
      try {
        const endpoint = filter === 'All' 
          ? `${API_URL}/admin/games`
          : `${API_URL}/admin/games?status=${filter}`;
        
        const response = await fetch(endpoint, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });

        if (response.ok) {
          const data = await response.json();
          const gamesList = Array.isArray(data) ? data : (data.games || []);
          
          // Sort games by ID first, then by added date
          const sorted = [...gamesList].sort((a: Game, b: Game) => {
            // Primary sort by ID
            const aId = a._id || '';
            const bId = b._id || '';
            const idCompare = idSortOrder === 'asc' ? aId.localeCompare(bId) : bId.localeCompare(aId);
            
            if (idCompare !== 0) return idCompare;
            
            // Secondary sort by added date
            const aDate = new Date(a.createdAt).getTime();
            const bDate = new Date(b.createdAt).getTime();
            return addedSortOrder === 'asc' ? aDate - bDate : bDate - aDate;
          });
          
          setGames(sorted);
          setTotalGames(sorted.length);
          setTotalPages(Math.ceil(sorted.length / itemsPerPage));
        } else {
          // If endpoint doesn't exist yet, set empty array
          setGames([]);
          setTotalGames(0);
          setTotalPages(1);
        }
      } catch (error) {
        console.log('Games endpoint not available');
        setGames([]);
        setTotalGames(0);
        setTotalPages(1);
      }
    } catch (error) {
      console.error('Error fetching games:', error);
      setGames([]);
      setTotalGames(0);
      setTotalPages(1);
    } finally {
      setLoading(false);
    }
  };

  const filterGames = () => {
    if (!searchQuery.trim()) {
      const startIndex = (currentPage - 1) * itemsPerPage;
      const endIndex = startIndex + itemsPerPage;
      setFilteredGames(games.slice(startIndex, endIndex));
      return;
    }

    const filtered = games.filter((game) => {
      const title = (game.name || game.title || '').toLowerCase();
      const description = (game.description || '').toLowerCase();
      const query = searchQuery.toLowerCase();
      return title.includes(query) || description.includes(query);
    });

    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    setFilteredGames(filtered.slice(startIndex, endIndex));
    setTotalPages(Math.ceil(filtered.length / itemsPerPage));
  };

  const handleSearch = () => {
    setCurrentPage(1);
    filterGames();
  };

  const handleIdSort = () => {
    setIdSortOrder(idSortOrder === 'asc' ? 'desc' : 'asc');
    setCurrentPage(1);
  };

  const handleAddedSort = () => {
    setAddedSortOrder(addedSortOrder === 'asc' ? 'desc' : 'asc');
    setCurrentPage(1);
  };

  const handleSelectAll = (checked: boolean) => {
    const paginatedGames = getPaginatedGames();
    if (checked) {
      setSelectedGames(paginatedGames.map(g => g._id));
    } else {
      setSelectedGames([]);
    }
  };

  const handleSelectGame = (gameId: string, checked: boolean) => {
    if (checked) {
      setSelectedGames([...selectedGames, gameId]);
    } else {
      setSelectedGames(selectedGames.filter(id => id !== gameId));
    }
  };

  const handleDeleteSelected = async () => {
    if (selectedGames.length === 0) return;
    
    if (!confirm(`Are you sure you want to delete ${selectedGames.length} game(s)?`)) {
      return;
    }

    try {
      setDeleting(true);
      const token = localStorage.getItem('token');
      
      // Delete selected games
      const deletePromises = selectedGames.map(gameId =>
        fetch(`${API_URL}/admin/games/${gameId}`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }).catch(err => {
          console.error(`Error deleting game ${gameId}:`, err);
          return { ok: false };
        })
      );

      await Promise.all(deletePromises);
      setSelectedGames([]);
      await fetchGames();
      alert('Games deleted successfully!');
    } catch (error) {
      console.error('Error deleting games:', error);
      alert('Failed to delete games. Please try again.');
    } finally {
      setDeleting(false);
    }
  };

  const getGameName = (game: Game) => {
    return game.name || game.title || 'Untitled Game';
  };

  const getPlayersCount = (game: Game) => {
    if (game.totalPlays !== undefined) return game.totalPlays.toString();
    if (game.players && Array.isArray(game.players)) return game.players.length.toString();
    return '0';
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getPaginatedGames = () => {
    if (searchQuery.trim()) {
      return filteredGames;
    }
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return games.slice(startIndex, endIndex);
  };

  const paginatedGames = getPaginatedGames();
  const showingCount = paginatedGames.length;
  const totalCount = searchQuery.trim() 
    ? games.filter(g => {
        const title = (g.name || g.title || '').toLowerCase();
        const desc = (g.description || '').toLowerCase();
        const query = searchQuery.toLowerCase();
        return title.includes(query) || desc.includes(query);
      }).length
    : totalGames;

  return (
    <div className={`min-h-screen ${isDarkMode ? 'bg-gray-900' : 'bg-gray-50'} py-4`}>
      <div className="max-w-7xl mx-auto px-4">
        {/* Breadcrumb */}
        <nav className="flex mb-4" aria-label="Breadcrumb">
          <ol className="flex items-center space-x-2 text-sm">
            <li>
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z" />
              </svg>
            </li>
            <li>
              <a href="#" className={`${isDarkMode ? 'text-gray-400 hover:text-gray-300' : 'text-gray-500 hover:text-gray-700'}`}>
                Home
              </a>
            </li>
            <li>
              <span className="mx-2 text-gray-400">/</span>
            </li>
            <li>
              <a href="#" className={`${isDarkMode ? 'text-gray-400 hover:text-gray-300' : 'text-gray-500 hover:text-gray-700'}`}>
                Manage Features
              </a>
            </li>
            <li>
              <span className="mx-2 text-gray-400">/</span>
            </li>
            <li>
              <a href="#" className={`${isDarkMode ? 'text-gray-400 hover:text-gray-300' : 'text-gray-500 hover:text-gray-700'}`}>
                Games
              </a>
            </li>
            <li>
              <span className="mx-2 text-gray-400">/</span>
            </li>
            <li>
              <span className={`${isDarkMode ? 'text-red-400' : 'text-red-500'} font-medium`}>Manage Games</span>
            </li>
          </ol>
        </nav>

        {/* Page Title */}
        <h1 className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'} mb-6`}>
          Manage Games
        </h1>

        {/* Main Card */}
        <div className={`${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} rounded-lg shadow-sm border p-6`}>
          {/* Card Header with All Button */}
          <div className="flex items-center justify-between mb-4">
            <h2 className={`text-lg font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
              Manage Games
            </h2>
            <button
              onClick={() => {
                setFilter('All');
                setCurrentPage(1);
              }}
              className={`px-3 py-1.5 text-sm rounded-md ${
                filter === 'All'
                  ? isDarkMode 
                    ? 'bg-gray-700 text-white' 
                    : 'bg-gray-200 text-gray-700'
                  : isDarkMode
                    ? 'bg-gray-700/50 text-gray-300 hover:bg-gray-700'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              } transition-colors`}
            >
              All
            </button>
          </div>

          {/* Search Bar */}
          <div className="mb-6">
            <label className={`block text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'} mb-2`}>
              Search for title, description.
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                className={`flex-1 px-3 py-2 border ${isDarkMode ? 'border-gray-600 bg-gray-700 text-white' : 'border-gray-300 bg-white text-gray-900'} rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500`}
                placeholder="Search games..."
              />
              <button
                onClick={handleSearch}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
              >
                Search
              </button>
            </div>
          </div>

          {/* Games Table */}
          <div className="overflow-x-auto mb-4">
            <table className="w-full">
              <thead className={`${isDarkMode ? 'bg-gray-700' : 'bg-gray-50'} border-b ${isDarkMode ? 'border-gray-600' : 'border-gray-200'}`}>
                <tr>
                  <th className="px-4 py-3 text-left">
                    <input
                      type="checkbox"
                      checked={selectedGames.length === paginatedGames.length && paginatedGames.length > 0}
                      onChange={(e) => handleSelectAll(e.target.checked)}
                      className={`rounded ${isDarkMode ? 'border-gray-600' : 'border-gray-300'} text-blue-600 focus:ring-blue-500`}
                    />
                  </th>
                  <th 
                    className={`px-4 py-3 text-left text-xs font-medium ${isDarkMode ? 'text-gray-300 hover:text-white' : 'text-gray-500 hover:text-gray-700'} uppercase tracking-wider cursor-pointer`}
                    onClick={handleIdSort}
                  >
                    <div className="flex items-center gap-1">
                      ID
                      {idSortOrder === 'asc' ? (
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                        </svg>
                      ) : (
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                      )}
                    </div>
                  </th>
                  <th className={`px-4 py-3 text-left text-xs font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-500'} uppercase tracking-wider`}>
                    NAME
                  </th>
                  <th className={`px-4 py-3 text-left text-xs font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-500'} uppercase tracking-wider`}>
                    PLAYERS
                  </th>
                  <th 
                    className={`px-4 py-3 text-left text-xs font-medium ${isDarkMode ? 'text-gray-300 hover:text-white' : 'text-gray-500 hover:text-gray-700'} uppercase tracking-wider cursor-pointer`}
                    onClick={handleAddedSort}
                  >
                    <div className="flex items-center gap-1">
                      ADDED
                      {addedSortOrder === 'asc' ? (
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                        </svg>
                      ) : (
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                      )}
                    </div>
                  </th>
                  <th className={`px-4 py-3 text-left text-xs font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-500'} uppercase tracking-wider`}>
                    ACTION
                  </th>
                </tr>
              </thead>
              <tbody className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} divide-y ${isDarkMode ? 'divide-gray-700' : 'divide-gray-200'}`}>
                {loading ? (
                  <tr>
                    <td colSpan={6} className="px-4 py-8 text-center">
                      <div className="flex items-center justify-center">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                        <span className={`ml-3 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Loading games...</span>
                      </div>
                    </td>
                  </tr>
                ) : paginatedGames.length === 0 ? (
                  <tr>
                    <td colSpan={6} className={`px-4 py-8 text-center ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                      No games found
                    </td>
                  </tr>
                ) : (
                  paginatedGames.map((game) => (
                    <tr key={game._id} className={isDarkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-50'}>
                      <td className="px-4 py-3">
                        <input
                          type="checkbox"
                          checked={selectedGames.includes(game._id)}
                          onChange={(e) => handleSelectGame(game._id, e.target.checked)}
                          className={`rounded ${isDarkMode ? 'border-gray-600' : 'border-gray-300'} text-blue-600 focus:ring-blue-500`}
                        />
                      </td>
                      <td className={`px-4 py-3 text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-900'}`}>
                        {game._id.substring(0, 8)}...
                      </td>
                      <td className={`px-4 py-3 text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-900'}`}>
                        {getGameName(game)}
                      </td>
                      <td className={`px-4 py-3 text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-900'}`}>
                        {getPlayersCount(game)}
                      </td>
                      <td className={`px-4 py-3 text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-900'}`}>
                        {formatDate(game.createdAt)}
                      </td>
                      <td className="px-4 py-3">
                        <button
                          onClick={async () => {
                            if (confirm('Are you sure you want to delete this game?')) {
                              try {
                                const token = localStorage.getItem('token');
                                await fetch(`${API_URL}/admin/games/${game._id}`, {
                                  method: 'DELETE',
                                  headers: {
                                    'Authorization': `Bearer ${token}`,
                                    'Content-Type': 'application/json'
                                  }
                                });
                                await fetchGames();
                                alert('Game deleted successfully!');
                              } catch (error) {
                                console.error('Error deleting game:', error);
                                alert('Failed to delete game.');
                              }
                            }
                          }}
                          className={`text-red-600 hover:text-red-800 ${isDarkMode ? 'hover:text-red-400' : ''}`}
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination and Summary */}
          <div className={`flex items-center justify-between border-t ${isDarkMode ? 'border-gray-700' : 'border-gray-200'} pt-4`}>
            <div className="flex items-center gap-4">
              <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                Showing {showingCount} out of {totalCount}
              </p>
              <button
                onClick={handleDeleteSelected}
                disabled={selectedGames.length === 0 || deleting}
                className={`px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${deleting ? 'opacity-50' : ''}`}
              >
                {deleting ? 'Deleting...' : 'Delete Selected'}
              </button>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setCurrentPage(1)}
                disabled={currentPage === 1}
                className={`p-2 rounded-full ${isDarkMode ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'} disabled:opacity-50 disabled:cursor-not-allowed`}
                title="First page"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 19l-7-7 7-7m8 14l-7-7 7-7" />
                </svg>
              </button>
              <button
                onClick={() => setCurrentPage(totalPages)}
                disabled={currentPage === totalPages}
                className={`p-2 rounded-full ${isDarkMode ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'} disabled:opacity-50 disabled:cursor-not-allowed`}
                title="Last page"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 5l7 7-7 7M5 5l7 7-7 7" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ManageGames;

