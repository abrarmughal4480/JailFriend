"use client";
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://jaifriend-backend.hgdjlive.com';
import React, { useState, useEffect } from 'react';
import { Search, Filter, Play, Clock, Globe, Eye, Star } from 'lucide-react';
import Popup from '@/components/Popup';
import MoviePlayer from '@/components/MoviePlayer';

interface Movie {
  _id: string;
  title: string;
  description: string;
  releaseYear: number;
  duration: number;
  genres: string[];
  country: string;
  language: string;
  director: string;
  cast: string[];
  rating: number;
  poster: string;
  trailer: string;
  videoUrl: string;
  quality: string;
  views: number;
  likes: string[];
  dislikes: string[];
  comments: any[];
  isRecommended: boolean;
  isNew: boolean;
  isPopular: boolean;
  tags: string[];
  createdAt: string;
  updatedAt: string;
}

export default function MoviesPage() {
  const [movies, setMovies] = useState<Movie[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('All');
  const [selectedGenres, setSelectedGenres] = useState<string[]>([]);
  const [selectedCountries, setSelectedCountries] = useState<string[]>([]);
  const [selectedMovie, setSelectedMovie] = useState<Movie | null>(null);
  const [isPlayerOpen, setIsPlayerOpen] = useState(false);
  const [popup, setPopup] = useState<any>(null);

  const genres = ['Action', 'Comedy', 'Drama', 'Horror', 'Romance', 'Sci-Fi', 'Thriller'];
  const countries = ['USA', 'UK', 'India', 'Japan', 'France', 'Germany'];

  const showPopup = (type: 'success' | 'error' | 'info' | 'warning', title: string, message: string) => {
    setPopup({ type, title, message });
  };

  const closePopup = () => {
    setPopup(null);
  };

  const fetchMovies = async () => {
    try {
      setLoading(true);
  const response = await fetch(`${API_URL}/api/movies`);
      if (response.ok) {
        const data = await response.json();
        setMovies(data);
      } else {
        showPopup('error', 'Error', 'Failed to fetch movies');
      }
    } catch (error) {
      showPopup('error', 'Error', 'Network error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMovies();
  }, []);

  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;
  };

  const handleMovieClick = (movie: Movie) => {
    setSelectedMovie(movie);
    setIsPlayerOpen(true);
  };

  const closePlayer = () => {
    setIsPlayerOpen(false);
    setSelectedMovie(null);
  };

  const filteredMovies = movies.filter(movie => {
    const matchesSearch = movie.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         movie.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesGenres = selectedGenres.length === 0 || 
                         selectedGenres.some(genre => movie.genres.includes(genre));
    const matchesCountries = selectedCountries.length === 0 || 
                            selectedCountries.includes(movie.country);
    
    return matchesSearch && matchesGenres && matchesCountries;
  });

  return (
    <div className="w-full h-full overflow-y-auto scrollbar-hide">
      {/* Header */}
      <div className="bg-white shadow-lg border-b sticky top-0 z-30">
        <div className="px-4 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 sm:gap-6">
            <div>
              <h1 className="text-2xl sm:text-4xl font-bold text-gray-900 mb-2">🎬 Movies</h1>
              <p className="text-gray-600 text-sm sm:text-lg">Watch the latest blockbusters and TV shows</p>
            </div>
            
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 sm:space-x-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4 sm:w-5 sm:h-5" />
                <input
                  type="text"
                  placeholder="Search movies..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 pr-4 py-2 sm:py-3 border border-gray-300 bg-white text-gray-900 rounded-lg sm:rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent w-full sm:w-64 placeholder-gray-500 text-sm sm:text-base"
                />
              </div>

              <button className="flex items-center justify-center space-x-2 px-4 sm:px-6 py-2 sm:py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg sm:rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all duration-200 shadow-lg hover:shadow-xl text-sm sm:text-base">
                <Filter className="w-4 h-4" />
                <span>Filters</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white border-b shadow-sm">
        <div className="px-4 sm:px-6 lg:px-8">
          <div className="flex space-x-4 sm:space-x-8 overflow-x-auto scrollbar-hide">
            {['All', 'Recommended', 'New', 'Popular'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`py-4 sm:py-6 px-2 sm:px-1 border-b-2 font-semibold text-sm whitespace-nowrap transition-all duration-200 ${
                  activeTab === tab
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white border-b">
        <div className="px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
          <div className="flex flex-col sm:flex-wrap gap-4">
            {/* Genre filters */}
            <div className="flex flex-col sm:flex-row sm:items-center gap-3">
              <span className="text-sm font-semibold text-gray-700">Genres:</span>
              <div className="flex flex-wrap gap-2">
                {genres.map((genre) => (
                  <button
                    key={genre}
                    onClick={() => {
                      if (selectedGenres.includes(genre)) {
                        setSelectedGenres(selectedGenres.filter(g => g !== genre));
                      } else {
                        setSelectedGenres([...selectedGenres, genre]);
                      }
                    }}
                    className={`px-3 sm:px-4 py-1 sm:py-2 text-xs sm:text-sm rounded-full transition-all duration-200 ${
                      selectedGenres.includes(genre)
                        ? 'bg-blue-100 text-blue-800 border border-blue-300'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200 border border-gray-200'
                    }`}
                  >
                    {genre}
                  </button>
                ))}
              </div>
            </div>

            {/* Country filters */}
            <div className="flex flex-col sm:flex-row sm:items-center gap-3">
              <span className="text-sm font-semibold text-gray-700">Countries:</span>
              <div className="flex flex-wrap gap-2">
                {countries.map((country) => (
                  <button
                    key={country}
                    onClick={() => {
                      if (selectedCountries.includes(country)) {
                        setSelectedCountries(selectedCountries.filter(c => c !== country));
                      } else {
                        setSelectedCountries([...selectedCountries, country]);
                      }
                    }}
                    className={`px-3 sm:px-4 py-1 sm:py-2 text-xs sm:text-sm rounded-full transition-all duration-200 ${
                      selectedCountries.includes(country)
                        ? 'bg-green-100 text-green-800 border border-green-300'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200 border border-gray-200'
                    }`}
                  >
                    {country}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : filteredMovies.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
            {filteredMovies.map((movie) => (
              <div
                key={movie._id}
                onClick={() => handleMovieClick(movie)}
                className="bg-white rounded-lg shadow-md hover:shadow-xl transition-all duration-300 cursor-pointer group overflow-hidden"
              >
                <div className="relative">
                  <img
                    src={movie.poster || '/placeholder-movie.jpg'}
                    alt={movie.title}
                    className="w-full h-48 sm:h-56 object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-all duration-300 flex items-center justify-center">
                    <Play className="w-12 h-12 text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  </div>
                  <div className="absolute top-2 right-2 bg-black bg-opacity-75 text-white px-2 py-1 rounded text-xs">
                    {movie.quality}
                  </div>
                </div>
                
                <div className="p-4">
                  <h3 className="font-bold text-gray-900 mb-2 line-clamp-2 group-hover:text-blue-600 transition-colors text-sm sm:text-lg">
                    {movie.title}
                  </h3>
                  
                  <div className="flex items-center justify-between text-xs sm:text-sm text-gray-600 mb-2">
                    <span className="bg-gray-100 px-2 py-1 rounded">{movie.releaseYear}</span>
                    <div className="flex items-center space-x-1">
                      <Clock className="w-3 h-3 sm:w-4 sm:h-4" />
                      <span>{formatDuration(movie.duration)}</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center space-x-1 text-gray-600">
                      <Globe className="w-3 h-3 sm:w-4 sm:h-4" />
                      <span className="text-xs sm:text-sm">{movie.country}</span>
                    </div>
                    <div className="flex items-center space-x-1 text-gray-600">
                      <Eye className="w-3 h-3 sm:w-4 sm:h-4" />
                      <span className="text-xs sm:text-sm">
                        {(movie.views / 1000).toFixed(1)}K
                      </span>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-1 sm:gap-2">
                    {movie.genres.slice(0, 2).map((genre: string, index: number) => (
                      <span
                        key={index}
                        className="px-2 sm:px-3 py-1 bg-gray-100 text-gray-700 text-xs rounded-full hover:bg-gray-200 transition-colors"
                      >
                        {genre}
                      </span>
                    ))}
                    {movie.genres.length > 2 && (
                      <span className="px-2 sm:px-3 py-1 bg-gray-100 text-gray-700 text-xs rounded-full">
                        +{movie.genres.length - 2}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12 sm:py-20">
            <div className="w-24 h-24 sm:w-32 sm:h-32 mx-auto mb-4 sm:mb-6 bg-gray-100 rounded-full flex items-center justify-center border-4 border-gray-200">
              <Play className="w-12 h-12 sm:w-16 sm:h-16 text-gray-400" />
            </div>
            <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2 sm:mb-3">No movies found</h3>
            <p className="text-gray-600 mb-6 sm:mb-8 text-sm sm:text-lg">Try adjusting your search or filters</p>
          </div>
        )}
      </div>

      {/* Popup */}
      <Popup popup={popup} onClose={closePopup} />

      {/* Movie Player */}
      {selectedMovie && (
        <MoviePlayer
          movie={selectedMovie}
          isOpen={isPlayerOpen}
          onClose={closePlayer}
        />
      )}
    </div>
  );
}
