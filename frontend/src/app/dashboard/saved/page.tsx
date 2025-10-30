'use client';
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://jaifriend-backend.hgdjlive.com';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Bookmark, Grid, List, Search, Filter, Share2, Heart, MessageCircle, Download, Settings, MoreHorizontal } from 'lucide-react';
import AlbumDisplay from '@/components/AlbumDisplay';
import PostDisplay from '@/components/PostDisplay';
import FeedPost from '@/components/FeedPost'; // Added FeedPost import
import { useDarkMode } from '@/contexts/DarkModeContext';

export default function SavedPosts() {
  const { isDarkMode } = useDarkMode();
  const [savedAlbums, setSavedAlbums] = useState<any[]>([]);
  const [savedPosts, setSavedPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('list');
  const [activeFilter, setActiveFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [showSearch, setShowSearch] = useState(false);
  const router = useRouter();

  const filters = [
    { id: 'all', label: 'All', count: 0 },
    { id: 'albums', label: 'Albums', count: 0 },
    { id: 'posts', label: 'Posts', count: 0 },
    { id: 'recent', label: 'Recent', count: 0 },
  ];

  // Check auth and fetch saved content
  const checkAuthAndFetchSaved = async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/login');
      return;
    }
    try {
      setLoading(true);
      
      // Fetch saved albums
  const apiUrl = API_URL;
      
      const savedAlbumsRes = await fetch(`${apiUrl}/api/albums/saved`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      
      if (savedAlbumsRes.ok) {
        const savedAlbumsData = await savedAlbumsRes.json();
        setSavedAlbums(savedAlbumsData);
      } else if (savedAlbumsRes.status === 401) {
        localStorage.removeItem('token');
        router.push('/login');
        return;
      } else {
        const errorData = await savedAlbumsRes.json().catch(() => ({}));
        console.error('Failed to fetch saved albums:', savedAlbumsRes.status, errorData);
      }
      
      // Fetch saved posts
      const savedPostsRes = await fetch(`${apiUrl}/api/posts/saved`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      
      if (savedPostsRes.ok) {
        const savedPostsData = await savedPostsRes.json();
        
        // Handle new API response format with savedPosts and pagination
        if (savedPostsData.savedPosts && Array.isArray(savedPostsData.savedPosts)) {
          setSavedPosts(savedPostsData.savedPosts);
        } else if (Array.isArray(savedPostsData)) {
          // Handle old format (direct array)
          setSavedPosts(savedPostsData);
        } else {
          console.error('Unexpected saved posts data format:', savedPostsData);
          setSavedPosts([]);
        }
      } else {
        const errorData = await savedPostsRes.json().catch(() => ({}));
        console.error('Failed to fetch saved posts:', savedPostsRes.status, errorData);
      }
    } catch (error) {
      console.error('Error fetching saved content:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    checkAuthAndFetchSaved();
  }, [router]);

  // Listen for album creation events to refresh saved content
  useEffect(() => {
    const handleAlbumCreated = () => {
      checkAuthAndFetchSaved();
    };

    const handleAlbumDeleted = () => {
      checkAuthAndFetchSaved();
    };

    const handlePostCreated = () => {
      checkAuthAndFetchSaved();
    };

    const handlePostSaved = () => {
      checkAuthAndFetchSaved();
    };

    const handleAlbumSaved = () => {
      checkAuthAndFetchSaved();
    };

    window.addEventListener('albumCreated', handleAlbumCreated);
    window.addEventListener('albumDeleted', handleAlbumDeleted);
    window.addEventListener('postCreated', handlePostCreated);
    window.addEventListener('postSaved', handlePostSaved);
    window.addEventListener('albumSaved', handleAlbumSaved);
    
    return () => {
      window.removeEventListener('albumCreated', handleAlbumCreated);
      window.removeEventListener('albumDeleted', handleAlbumDeleted);
      window.removeEventListener('postCreated', handlePostCreated);
      window.removeEventListener('postSaved', handlePostSaved);
      window.removeEventListener('albumSaved', handleAlbumSaved);
    };
  }, []);

  // Update filter counts
  useEffect(() => {
    filters[0].count = savedAlbums.length + savedPosts.length;
    filters[1].count = savedAlbums.length;
    filters[2].count = savedPosts.length;
    filters[3].count = savedAlbums.length + savedPosts.length; // Recent = all for now
  }, [savedAlbums, savedPosts]);

  // Filter content based on active filter and search
  const getFilteredContent = () => {
    let albums = savedAlbums;
    let posts = savedPosts;

    // Apply search filter
    if (searchQuery) {
      albums = albums.filter((album: any) => 
        album.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        album.description?.toLowerCase().includes(searchQuery.toLowerCase())
      );
      posts = posts.filter((post: any) => 
        post.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        post.content?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Apply category filter
    switch (activeFilter) {
      case 'albums':
        return { albums, posts: [] };
      case 'posts':
        return { albums: [], posts };
      case 'recent':
        // Sort by most recent
        const recentAlbums = albums.slice().sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()).slice(0, 5);
        const recentPosts = posts.slice().sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()).slice(0, 5);
        return { albums: recentAlbums, posts: recentPosts };
      default:
        return { albums, posts };
    }
  };

  const { albums: filteredAlbums, posts: filteredPosts } = getFilteredContent();

  

  // Handle album like
  const handleAlbumLike = async (albumId: string) => {
    const token = localStorage.getItem('token');
    try {
  const apiUrl = API_URL;
      const res = await fetch(`${apiUrl}/api/albums/${albumId}/like`, {
        method: 'POST',
        headers: {
          ...(token ? { Authorization: `Bearer ${token}` } : {})
        }
      });
      if (res.ok) {
        const data = await res.json();
        setSavedAlbums((prev: any[]) => prev.map((album: any) => 
          album._id === albumId ? { ...album, likes: data.likes, liked: data.liked } : album
        ));
      }
    } catch (error) {
      console.error('Error liking album:', error);
    }
  };

  // Handle album comment
  const handleAlbumComment = async (albumId: string, comment: string) => {
    const token = localStorage.getItem('token');
    try {
  const apiUrl = API_URL;
      const res = await fetch(`${apiUrl}/api/albums/${albumId}/comment`, {
        method: 'POST',
        headers: {
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ text: comment })
      });
      if (res.ok) {
        const data = await res.json();
        setSavedAlbums((prev: any[]) => prev.map((album: any) => 
          album._id === albumId ? { ...album, comments: [...(album.comments || []), data.comment] } : album
        ));
      }
    } catch (error) {
      console.error('Error commenting on album:', error);
    }
  };

  // Handle album save
  const handleAlbumSave = async (albumId: string) => {
    const token = localStorage.getItem('token');
    
    try {
  const apiUrl = API_URL;
      const url = `${apiUrl}/api/albums/${albumId}/save`;
      
      const res = await fetch(url, {
        method: 'POST',
        headers: {
          ...(token ? { Authorization: `Bearer ${token}` } : {})
        }
      });
      
      if (res.ok) {
        const data = await res.json();
        
        // Check if the album was saved or unsaved
        const isSaved = data.saved || data.isSaved;
        
        // Remove from saved list if unsaved
        if (!isSaved) {
          setSavedAlbums((prev: any[]) => prev.filter((album: any) => album._id !== albumId));
          // Dispatch event to notify other components
          window.dispatchEvent(new CustomEvent('albumSaved', { detail: { albumId, saved: false } }));
        } else {
          setSavedAlbums((prev: any[]) => prev.map((album: any) => 
            album._id === albumId ? { ...album, savedBy: data.savedBy || data.album?.savedBy, saved: isSaved } : album
          ));
          // Dispatch event to notify other components
          window.dispatchEvent(new CustomEvent('albumSaved', { detail: { albumId, saved: true } }));
        }
      } else {
        const errorData = await res.json().catch(() => ({}));
        console.error('Album save failed:', res.status, errorData);
      }
    } catch (error) {
      console.error('Error saving album:', error);
    }
  };

  // Handle album share
  const handleAlbumShare = async (albumId: string, shareOptions?: any) => {
    const token = localStorage.getItem('token');
    try {
  const apiUrl = API_URL;
      const res = await fetch(`${apiUrl}/api/albums/${albumId}/share`, {
        method: 'POST',
        headers: {
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(shareOptions || {})
      });
      if (res.ok) {
        const data = await res.json();
        setSavedAlbums((prev: any[]) => prev.map((album: any) => 
          album._id === albumId ? { ...album, shares: data.shares, shared: data.shared } : album
        ));
      }
    } catch (error) {
      console.error('Error sharing album:', error);
    }
  };

  // Handle post like
  const handlePostLike = async (postId: string) => {
    const token = localStorage.getItem('token');
    try {
  const apiUrl = API_URL;
      const res = await fetch(`${apiUrl}/api/posts/${postId}/like`, {
        method: 'POST',
        headers: {
          ...(token ? { Authorization: `Bearer ${token}` } : {})
        }
      });
      if (res.ok) {
        const data = await res.json();
        setSavedPosts((prev: any[]) => prev.map((post: any) => 
          post._id === postId ? { ...post, likes: data.likes, liked: data.liked } : post
        ));
      }
    } catch (error) {
      console.error('Error liking post:', error);
    }
  };

  // Handle post save
  const handlePostSave = async (postId: string) => {
    const token = localStorage.getItem('token');
    
    try {
  const apiUrl = API_URL;
      const url = `${apiUrl}/api/posts/${postId}/save`;
      
      const res = await fetch(url, {
        method: 'POST',
        headers: {
          ...(token ? { Authorization: `Bearer ${token}` } : {})
        }
      });
      
      if (res.ok) {
        const data = await res.json();
        
        // Check if the post was saved or unsaved
        const isSaved = data.saved || data.isSaved;
        
        // Remove from saved list if unsaved
        if (!isSaved) {
          setSavedPosts((prev: any[]) => prev.filter((post: any) => post._id !== postId));
          // Dispatch event to notify other components
          window.dispatchEvent(new CustomEvent('postSaved', { detail: { postId, saved: false } }));
        } else {
          setSavedPosts((prev: any[]) => prev.map((post: any) => 
            post._id === postId ? { ...post, savedBy: data.savedBy || data.post?.savedBy, saved: isSaved } : post
          ));
          // Dispatch event to notify other components
          window.dispatchEvent(new CustomEvent('postSaved', { detail: { postId, saved: true } }));
        }
      } else {
        const errorData = await res.json().catch(() => ({}));
        console.error('Post save failed:', res.status, errorData);
      }
    } catch (error) {
      console.error('Error saving post:', error);
    }
  };

  // Handle post comment
  const handlePostComment = async (postId: string, comment: string) => {
    const token = localStorage.getItem('token');
    try {
  const apiUrl = API_URL;
      const res = await fetch(`${apiUrl}/api/posts/${postId}/comment`, {
        method: 'POST',
        headers: {
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ text: comment })
      });
      if (res.ok) {
        const data = await res.json();
        setSavedPosts((prev: any[]) => prev.map((post: any) => 
          post._id === postId ? { ...post, comments: data.comments } : post
        ));
      }
    } catch (error) {
      console.error('Error commenting on post:', error);
    }
  };

  const handlePostShare = async (postId: string, shareOptions?: any) => {
    const token = localStorage.getItem('token');
    try {
      const apiUrl = API_URL;
      const res = await fetch(`${apiUrl}/api/posts/${postId}/share`, {
        method: 'POST',
        headers: {
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(shareOptions || {})
      });
      if (res.ok) {
        const data = await res.json();
        setSavedPosts((prev: any[]) => prev.map((post: any) => 
          post._id === postId ? { ...post, shares: data.shares, shared: data.shared } : post
        ));
      }
    } catch (error) {
      console.error('Error sharing post:', error);
    }
  };

  const handlePostView = async (postId: string) => {
    const token = localStorage.getItem('token');
    try {
      const apiUrl = API_URL;
      const res = await fetch(`${apiUrl}/api/posts/${postId}/view`, {
        method: 'POST',
        headers: {
          ...(token ? { Authorization: `Bearer ${token}` } : {})
        }
      });
      if (res.ok) {
        const data = await res.json();
        setSavedPosts((prev: any[]) => prev.map((post: any) => 
          post._id === postId ? { ...post, views: data.views } : post
        ));
      }
    } catch (error) {
      console.error('Error tracking view:', error);
    }
  };

  const handleReaction = async (postId: string, reactionType: string) => {
    const token = localStorage.getItem('token');
  const apiUrl = API_URL;
    const res = await fetch(`${apiUrl}/api/posts/${postId}/reaction`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {})
      },
      body: JSON.stringify({ reactionType })
    });
    if (res.ok) {
      const data = await res.json();
      setSavedPosts((prev: any[]) => prev.map((p: any) => (p._id === postId || p.id === postId) ? data.post : p));
    } else {
      console.error('Failed to add reaction');
    }
  };

  return (
    <div className="w-full h-full overflow-y-auto scrollbar-hide">
      {/* Header */}
              <div className={`border-b sticky top-0 z-30 transition-colors duration-200 ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
        <div className="px-4 sm:px-6 lg:px-8 py-3 sm:py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <button 
                onClick={() => router.back()}
                className={`p-2 rounded-full transition-colors lg:hidden ${
                  isDarkMode 
                    ? 'hover:bg-gray-700' 
                    : 'hover:bg-gray-100'
                }`}
              >
                <ArrowLeft className={`w-5 h-5 transition-colors duration-200 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`} />
              </button>
              <div>
                <h1 className={`text-xl sm:text-2xl font-semibold flex items-center gap-2 transition-colors duration-200 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                  <Bookmark className="w-5 h-5 sm:w-6 sm:h-6 text-blue-500" />
                  Saved Posts
                </h1>
                <p className={`text-sm hidden sm:block transition-colors duration-200 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                  Your saved albums and posts
                </p>
              </div>
            </div>
            
            {/* Removed search, view mode toggle, and more options from header */}
          </div>

          {/* Search Bar */}
          {showSearch && (
            <div className="mt-3 sm:mt-4">
              <div className="relative">
                <Search className={`absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 transition-colors duration-200 ${isDarkMode ? 'text-gray-400' : 'text-gray-400'}`} />
                <input
                  type="text"
                  placeholder="Search saved content..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className={`w-full pl-10 pr-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-colors duration-200 ${
                    isDarkMode 
                      ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
                      : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                  }`}
                  autoFocus
                />
              </div>
            </div>
          )}
        </div>
      </div>

  {/* Removed filter tabs (All, Albums, Posts, Recent) from Saved page */}

      {/* Stats Bar */}
      <div className={`border-b transition-colors duration-200 ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
        <div className="px-4 sm:px-6 lg:px-8 py-2">
          <div className={`flex items-center justify-between text-sm transition-colors duration-200 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
            <div className="flex items-center gap-4">
              <span>{filteredAlbums.length + filteredPosts.length} items</span>
              {searchQuery && (
                <span className="text-blue-600">
                  Results for "{searchQuery}"
                </span>
              )}
            </div>
            <div className="hidden sm:flex items-center gap-4">
              <span>{filteredAlbums.length} albums</span>
              <span>{filteredPosts.length} posts</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="px-4 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-8">
        <div className="max-w-4xl mx-auto">
          
          {loading ? (
            <div className="flex items-center justify-center min-h-64">
              <div className="text-center">
                <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                <p className="text-gray-600">Loading saved posts...</p>
              </div>
            </div>
          ) : filteredAlbums.length === 0 && filteredPosts.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-16 h-16 sm:w-20 sm:h-20 lg:w-24 lg:h-24 bg-gradient-to-br from-blue-100 to-purple-100 rounded-2xl flex items-center justify-center mx-auto mb-4 sm:mb-6">
                {searchQuery ? (
                  <Search className="w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12 text-gray-400" />
                ) : (
                  <Bookmark className="w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12 text-blue-500" />
                )}
              </div>
              <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-2">
                {searchQuery ? 'No results found' : 'No saved posts yet'}
              </h3>
              <p className="text-sm sm:text-base text-gray-500 mb-4 sm:mb-6 max-w-md mx-auto">
                {searchQuery 
                  ? 'Try adjusting your search terms or browse all saved content.'
                  : 'When you save albums or posts, they\'ll appear here for easy access.'
                }
              </p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                {searchQuery ? (
                  <button
                    onClick={() => {
                      setSearchQuery('');
                      setActiveFilter('all');
                    }}
                    className="px-4 sm:px-6 py-2.5 sm:py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors font-medium text-sm sm:text-base"
                  >
                    Show All Saved
                  </button>
                ) : (
                  <button
                    onClick={() => router.push('/dashboard')}
                    className="px-4 sm:px-6 py-2.5 sm:py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors font-medium text-sm sm:text-base"
                  >
                    Explore Posts
                  </button>
                )}
              </div>
            </div>
          ) : (
            <div className={`space-y-6 sm:space-y-8 ${viewMode === 'grid' ? 'sm:grid sm:grid-cols-2 lg:grid-cols-3 sm:gap-6 sm:space-y-0' : ''}`}>
              {/* Saved Albums */}
              {filteredAlbums.length > 0 && (
                <div className={viewMode === 'grid' ? 'sm:col-span-full' : ''}>
                  {viewMode === 'list' && (
                    <div className="flex items-center justify-between mb-4 sm:mb-6">
                      <h2 className="text-lg sm:text-xl font-semibold text-gray-900 flex items-center gap-2">
                        <Grid className="w-5 h-5 text-purple-500" />
                        Saved Albums ({filteredAlbums.length})
                      </h2>
                      {filteredAlbums.length > 5 && (
                        <button className="text-sm text-blue-600 hover:text-blue-700 font-medium">
                          View all
                        </button>
                      )}
                    </div>
                  )}
                  <div className={`${viewMode === 'grid' ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6' : 'space-y-4 sm:space-y-6'}`}>
                    {filteredAlbums.map((album) => (
                      <div key={album._id} className={viewMode === 'grid' ? 'bg-white rounded-lg border border-gray-200 overflow-hidden hover:shadow-md transition-shadow' : ''}>
                        <AlbumDisplay
                          album={album}
                          isOwner={false}
                          onLike={handleAlbumLike}
                          onComment={handleAlbumComment}
                          onSave={handleAlbumSave}
                          onShare={handleAlbumShare}
                        />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Saved Posts */}
              {filteredPosts.length > 0 && (
                <div className={viewMode === 'grid' ? 'sm:col-span-full' : ''}>
                  {viewMode === 'list' && (
                    <div className="flex items-center justify-between mb-4 sm:mb-6">
                      <h2 className="text-lg sm:text-xl font-semibold text-gray-900 flex items-center gap-2">
                        <MessageCircle className="w-5 h-5 text-green-500" />
                        Saved Posts ({filteredPosts.length})
                      </h2>
                      {filteredPosts.length > 5 && (
                        <button className="text-sm text-blue-600 hover:text-blue-700 font-medium">
                          View all
                        </button>
                      )}
                    </div>
                  )}
                  <div className={`${viewMode === 'grid' ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6' : 'space-y-4 sm:space-y-6'}`}>
                    {filteredPosts.map((post) => {
                      return (
                        <div key={post._id} className={viewMode === 'grid' ? 'bg-white rounded-lg border border-gray-200 overflow-hidden hover:shadow-md transition-shadow' : ''}>
                          <FeedPost
                            post={post}
                            onLike={handlePostLike}
                            onReaction={handleReaction}
                            onComment={handlePostComment}
                            onShare={handlePostShare}
                            onSave={handlePostSave}
                            onDelete={() => {}} // No delete for saved posts
                            onEdit={() => {}} // No edit for saved posts
                            isOwnPost={false}
                          />
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Floating Action Buttons */}
      <div className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 flex flex-col gap-3 z-20">
        <button className="w-12 h-12 bg-white border border-gray-200 rounded-full shadow-lg hover:shadow-xl transition-all flex items-center justify-center group">
          <Download className="w-5 h-5 text-gray-600 group-hover:text-blue-500" />
        </button>
        <button className="w-12 h-12 bg-white border border-gray-200 rounded-full shadow-lg hover:shadow-xl transition-all flex items-center justify-center group">
          <Share2 className="w-5 h-5 text-gray-600 group-hover:text-green-500" />
        </button>
      </div>

      {/* Mobile Bottom Safe Area */}
      <div className="sm:hidden h-safe-area-inset-bottom"></div>
    </div>
  );
}
