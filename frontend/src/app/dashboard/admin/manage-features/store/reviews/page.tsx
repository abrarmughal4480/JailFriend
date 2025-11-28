'use client';

import { useState, useEffect } from 'react';
import { useDarkMode } from '@/contexts/DarkModeContext';

interface Review {
  _id: string;
  user?: {
    _id: string;
    name?: string;
    username?: string;
    avatar?: string;
  };
  userId?: string;
  productId?: string;
  productName?: string;
  rating?: number;
  text?: string;
  title?: string;
  description?: string;
  link?: string;
  author?: string;
  createdAt: string;
  updatedAt?: string;
}

const ManageReviews = () => {
  const { isDarkMode } = useDarkMode();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [filteredReviews, setFilteredReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedReviews, setSelectedReviews] = useState<string[]>([]);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [totalReviews, setTotalReviews] = useState<number>(0);
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [deleting, setDeleting] = useState<boolean>(false);

  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://jaifriend-backend.hgdjlive.com';
  const itemsPerPage = 15;

  useEffect(() => {
    fetchReviews();
  }, [currentPage, sortOrder]);

  useEffect(() => {
    filterReviews();
  }, [searchQuery, reviews]);

  const fetchReviews = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      
      // Try to fetch reviews from products or a dedicated reviews endpoint
      let reviewsList: Review[] = [];
      
      // First, try to get reviews from products
      try {
        const productsResponse = await fetch(`${API_URL}/api/products`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });

        if (productsResponse.ok) {
          const products = await productsResponse.json();
          // Extract reviews from products
          const allReviews: Review[] = [];
          products.forEach((product: any) => {
            if (product.reviews && Array.isArray(product.reviews)) {
              product.reviews.forEach((review: any) => {
                allReviews.push({
                  _id: review._id || `${product._id}-${review.user}`,
                  user: review.user,
                  userId: typeof review.user === 'string' ? review.user : review.user?._id,
                  productId: product._id,
                  productName: product.name || product.title,
                  rating: review.rating,
                  text: review.text,
                  title: review.title,
                  description: review.text,
                  link: `/dashboard/market/product/${product._id}`,
                  author: review.user?.name || review.user?.username || 'Unknown',
                  createdAt: review.createdAt || product.createdAt,
                  updatedAt: review.updatedAt
                });
              });
            }
          });
          reviewsList = allReviews;
        }
      } catch (error) {
        console.log('Could not fetch reviews from products, trying dedicated endpoint...');
      }

      // Try dedicated reviews endpoint if products didn't work
      if (reviewsList.length === 0) {
        try {
          const reviewsResponse = await fetch(`${API_URL}/api/reviews`, {
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            }
          });

          if (reviewsResponse.ok) {
            const data = await reviewsResponse.json();
            reviewsList = Array.isArray(data) ? data : (data.reviews || []);
          }
        } catch (error) {
          console.log('Reviews endpoint not available');
        }
      }

      // Sort reviews
      const sorted = [...reviewsList].sort((a: Review, b: Review) => {
        const aId = a._id || '';
        const bId = b._id || '';
        return sortOrder === 'asc' ? aId.localeCompare(bId) : bId.localeCompare(aId);
      });
      
      setReviews(sorted);
      setTotalReviews(sorted.length);
      setTotalPages(Math.ceil(sorted.length / itemsPerPage));
    } catch (error) {
      console.error('Error fetching reviews:', error);
      setReviews([]);
      setTotalReviews(0);
      setTotalPages(1);
    } finally {
      setLoading(false);
    }
  };

  const filterReviews = () => {
    if (!searchQuery.trim()) {
      const startIndex = (currentPage - 1) * itemsPerPage;
      const endIndex = startIndex + itemsPerPage;
      setFilteredReviews(reviews.slice(startIndex, endIndex));
      return;
    }

    const filtered = reviews.filter((review) => {
      const title = (review.title || review.productName || '').toLowerCase();
      const description = (review.description || review.text || '').toLowerCase();
      const query = searchQuery.toLowerCase();
      return title.includes(query) || description.includes(query);
    });

    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    setFilteredReviews(filtered.slice(startIndex, endIndex));
    setTotalPages(Math.ceil(filtered.length / itemsPerPage));
  };

  const handleSearch = () => {
    setCurrentPage(1);
    filterReviews();
  };

  const handleSort = () => {
    setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    setCurrentPage(1);
  };

  const handleSelectAll = (checked: boolean) => {
    const paginatedReviews = getPaginatedReviews();
    if (checked) {
      setSelectedReviews(paginatedReviews.map(r => r._id));
    } else {
      setSelectedReviews([]);
    }
  };

  const handleSelectReview = (reviewId: string, checked: boolean) => {
    if (checked) {
      setSelectedReviews([...selectedReviews, reviewId]);
    } else {
      setSelectedReviews(selectedReviews.filter(id => id !== reviewId));
    }
  };

  const handleDeleteSelected = async () => {
    if (selectedReviews.length === 0) return;
    
    if (!confirm(`Are you sure you want to delete ${selectedReviews.length} review(s)?`)) {
      return;
    }

    try {
      setDeleting(true);
      const token = localStorage.getItem('token');
      
      // Delete selected reviews
      const deletePromises = selectedReviews.map(reviewId => {
        // Try to delete from product reviews
        const review = reviews.find(r => r._id === reviewId);
        if (review?.productId) {
          return fetch(`${API_URL}/api/products/${review.productId}/reviews/${reviewId}`, {
            method: 'DELETE',
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            }
          }).catch(err => {
            console.error(`Error deleting review ${reviewId}:`, err);
            return { ok: false };
          });
        }
        // Fallback to generic delete
        return fetch(`${API_URL}/api/reviews/${reviewId}`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }).catch(err => {
          console.error(`Error deleting review ${reviewId}:`, err);
          return { ok: false };
        });
      });

      await Promise.all(deletePromises);
      setSelectedReviews([]);
      await fetchReviews();
      alert('Reviews deleted successfully!');
    } catch (error) {
      console.error('Error deleting reviews:', error);
      alert('Failed to delete reviews. Please try again.');
    } finally {
      setDeleting(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getReviewLink = (review: Review) => {
    if (review.link) return review.link;
    if (review.productId) return `/dashboard/market/product/${review.productId}`;
    return '#';
  };

  const getAuthorName = (review: Review) => {
    if (review.author) return review.author;
    if (review.user?.name) return review.user.name;
    if (review.user?.username) return review.user.username;
    return 'Unknown';
  };

  const getReviewText = (review: Review) => {
    if (review.text) return review.text;
    if (review.description) return review.description;
    return '-';
  };

  const getPaginatedReviews = () => {
    if (searchQuery.trim()) {
      return filteredReviews;
    }
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return reviews.slice(startIndex, endIndex);
  };

  const paginatedReviews = getPaginatedReviews();
  const showingCount = paginatedReviews.length;
  const totalCount = searchQuery.trim() 
    ? reviews.filter(r => {
        const title = (r.title || r.productName || '').toLowerCase();
        const desc = (r.description || r.text || '').toLowerCase();
        const query = searchQuery.toLowerCase();
        return title.includes(query) || desc.includes(query);
      }).length
    : totalReviews;

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
                Store
              </a>
            </li>
            <li>
              <span className="mx-2 text-gray-400">/</span>
            </li>
            <li>
              <span className={`${isDarkMode ? 'text-red-400' : 'text-red-500'} font-medium`}>Manage Reviews</span>
            </li>
          </ol>
        </nav>

        {/* Page Title */}
        <h1 className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'} mb-6`}>
          Reviews
        </h1>

        {/* Main Card */}
        <div className={`${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} rounded-lg shadow-sm border p-6`}>
          {/* Card Header */}
          <h2 className={`text-lg font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'} mb-4`}>
            Manage Reviews
          </h2>

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
                placeholder="Search reviews..."
              />
              <button
                onClick={handleSearch}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
              >
                Search
              </button>
            </div>
          </div>

          {/* Reviews Table */}
          <div className="overflow-x-auto mb-4">
            <table className="w-full">
              <thead className={`${isDarkMode ? 'bg-gray-700' : 'bg-gray-50'} border-b ${isDarkMode ? 'border-gray-600' : 'border-gray-200'}`}>
                <tr>
                  <th className="px-4 py-3 text-left">
                    <input
                      type="checkbox"
                      checked={selectedReviews.length === paginatedReviews.length && paginatedReviews.length > 0}
                      onChange={(e) => handleSelectAll(e.target.checked)}
                      className={`rounded ${isDarkMode ? 'border-gray-600' : 'border-gray-300'} text-blue-600 focus:ring-blue-500`}
                    />
                  </th>
                  <th 
                    className={`px-4 py-3 text-left text-xs font-medium ${isDarkMode ? 'text-gray-300 hover:text-white' : 'text-gray-500 hover:text-gray-700'} uppercase tracking-wider cursor-pointer`}
                    onClick={handleSort}
                  >
                    <div className="flex items-center gap-1">
                      ID
                      {sortOrder === 'asc' ? (
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
                    LINK
                  </th>
                  <th className={`px-4 py-3 text-left text-xs font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-500'} uppercase tracking-wider`}>
                    AUTHOR
                  </th>
                  <th className={`px-4 py-3 text-left text-xs font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-500'} uppercase tracking-wider`}>
                    POSTED
                  </th>
                  <th className={`px-4 py-3 text-left text-xs font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-500'} uppercase tracking-wider`}>
                    REVIEW
                  </th>
                  <th className={`px-4 py-3 text-left text-xs font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-500'} uppercase tracking-wider`}>
                    ACTION
                  </th>
                </tr>
              </thead>
              <tbody className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} divide-y ${isDarkMode ? 'divide-gray-700' : 'divide-gray-200'}`}>
                {loading ? (
                  <tr>
                    <td colSpan={7} className="px-4 py-8 text-center">
                      <div className="flex items-center justify-center">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                        <span className={`ml-3 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Loading reviews...</span>
                      </div>
                    </td>
                  </tr>
                ) : paginatedReviews.length === 0 ? (
                  <tr>
                    <td colSpan={7} className={`px-4 py-8 text-center ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                      No reviews found
                    </td>
                  </tr>
                ) : (
                  paginatedReviews.map((review) => (
                    <tr key={review._id} className={isDarkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-50'}>
                      <td className="px-4 py-3">
                        <input
                          type="checkbox"
                          checked={selectedReviews.includes(review._id)}
                          onChange={(e) => handleSelectReview(review._id, e.target.checked)}
                          className={`rounded ${isDarkMode ? 'border-gray-600' : 'border-gray-300'} text-blue-600 focus:ring-blue-500`}
                        />
                      </td>
                      <td className={`px-4 py-3 text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-900'}`}>
                        {review._id.substring(0, 8)}...
                      </td>
                      <td className={`px-4 py-3 text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-900'}`}>
                        <a 
                          href={getReviewLink(review)}
                          className="text-blue-600 hover:underline"
                        >
                          {getReviewLink(review).length > 30 ? getReviewLink(review).substring(0, 30) + '...' : getReviewLink(review)}
                        </a>
                      </td>
                      <td className={`px-4 py-3 text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-900'}`}>
                        {getAuthorName(review)}
                      </td>
                      <td className={`px-4 py-3 text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-900'}`}>
                        {formatDate(review.createdAt)}
                      </td>
                      <td className={`px-4 py-3 text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-900'}`}>
                        <div className="max-w-xs truncate" title={getReviewText(review)}>
                          {getReviewText(review)}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <button
                          onClick={async () => {
                            if (confirm('Are you sure you want to delete this review?')) {
                              try {
                                const token = localStorage.getItem('token');
                                const reviewToDelete = reviews.find(r => r._id === review._id);
                                
                                if (reviewToDelete?.productId) {
                                  await fetch(`${API_URL}/api/products/${reviewToDelete.productId}/reviews/${review._id}`, {
                                    method: 'DELETE',
                                    headers: {
                                      'Authorization': `Bearer ${token}`,
                                      'Content-Type': 'application/json'
                                    }
                                  });
                                } else {
                                  await fetch(`${API_URL}/api/reviews/${review._id}`, {
                                    method: 'DELETE',
                                    headers: {
                                      'Authorization': `Bearer ${token}`,
                                      'Content-Type': 'application/json'
                                    }
                                  });
                                }
                                await fetchReviews();
                                alert('Review deleted successfully!');
                              } catch (error) {
                                console.error('Error deleting review:', error);
                                alert('Failed to delete review.');
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
                disabled={selectedReviews.length === 0 || deleting}
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

export default ManageReviews;

