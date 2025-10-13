'use client';

import { useState } from 'react';

interface Post {
  id: string;
  publisher: string;
  publisherAvatar: string;
  postLink: string;
  posted: string;
  status: string;
}

const Posts = () => {
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [selectedPosts, setSelectedPosts] = useState<string[]>([]);
  const [bulkAction, setBulkAction] = useState<string>('');
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [posts, setPosts] = useState<Post[]>([
    {
      id: '14755',
      publisher: 'Charles Leclerc',
      publisherAvatar: '/api/placeholder/24/24',
      postLink: 'Open Post',
      posted: '1 h',
      status: 'Active'
    },
    {
      id: '14754',
      publisher: 'jiangcc jiangcc',
      publisherAvatar: '/api/placeholder/24/24',
      postLink: 'Open Post',
      posted: '1 h',
      status: 'Active'
    },
    {
      id: '14753',
      publisher: 'xtameem',
      publisherAvatar: '/api/placeholder/24/24',
      postLink: 'Open Post',
      posted: '1 h',
      status: 'Active'
    },
    {
      id: '14752',
      publisher: 'Watermark Event Solutions',
      publisherAvatar: '/api/placeholder/24/24',
      postLink: 'Open Post',
      posted: '1 h',
      status: 'Active'
    },
    {
      id: '14751',
      publisher: 'Watermark Event Solutions',
      publisherAvatar: '/api/placeholder/24/24',
      postLink: 'Open Post',
      posted: '1 h',
      status: 'Active'
    },
    {
      id: '14716',
      publisher: 'xtameem',
      publisherAvatar: '/api/placeholder/24/24',
      postLink: 'Open Post',
      posted: '1 d',
      status: 'Active'
    },
    {
      id: '14715',
      publisher: 'xtameem',
      publisherAvatar: '/api/placeholder/24/24',
      postLink: 'Open Post',
      posted: '1 d',
      status: 'Active'
    },
    {
      id: '14714',
      publisher: 'xtameem',
      publisherAvatar: '/api/placeholder/24/24',
      postLink: 'Open Post',
      posted: '1 d',
      status: 'Active'
    },
    {
      id: '14713',
      publisher: 'xtameem',
      publisherAvatar: '/api/placeholder/24/24',
      postLink: 'Open Post',
      posted: '1 d',
      status: 'Active'
    },
    {
      id: '14712',
      publisher: 'xtameem',
      publisherAvatar: '/api/placeholder/24/24',
      postLink: 'Open Post',
      posted: '1 d',
      status: 'Active'
    },
    {
      id: '14711',
      publisher: 'xtameem',
      publisherAvatar: '/api/placeholder/24/24',
      postLink: 'Open Post',
      posted: '1 d',
      status: 'Active'
    },
    {
      id: '14710',
      publisher: 'xtameem',
      publisherAvatar: '/api/placeholder/24/24',
      postLink: 'Open Post',
      posted: '1 d',
      status: 'Active'
    },
    {
      id: '14709',
      publisher: 'xtameem',
      publisherAvatar: '/api/placeholder/24/24',
      postLink: 'Open Post',
      posted: '1 d',
      status: 'Active'
    },
    {
      id: '14708',
      publisher: 'xtameem',
      publisherAvatar: '/api/placeholder/24/24',
      postLink: 'Open Post',
      posted: '1 d',
      status: 'Active'
    },
    {
      id: '14707',
      publisher: 'xtameem',
      publisherAvatar: '/api/placeholder/24/24',
      postLink: 'Open Post',
      posted: '1 d',
      status: 'Active'
    },
    {
      id: '14706',
      publisher: 'xtameem',
      publisherAvatar: '/api/placeholder/24/24',
      postLink: 'Open Post',
      posted: '1 d',
      status: 'Active'
    }
  ]);

  const handleSearch = () => {
    console.log('Searching for:', searchTerm);
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedPosts(posts.map((post: Post) => post.id));
    } else {
      setSelectedPosts([]);
    }
  };

  const handleSelectPost = (postId: string, checked: boolean) => {
    if (checked) {
      setSelectedPosts(prev => [...prev, postId]);
    } else {
      setSelectedPosts(prev => prev.filter((id: string) => id !== postId));
    }
  };

  const handleDeletePost = (postId: string) => {
    if (confirm('Are you sure you want to delete this post?')) {
      setPosts(prev => prev.filter((post: Post) => post.id !== postId));
      setSelectedPosts(prev => prev.filter((id: string) => id !== postId));
      alert('Post deleted successfully!');
    }
  };

  const handleBulkAction = () => {
    if (selectedPosts.length === 0) {
      alert('Please select posts first.');
      return;
    }
    if (!bulkAction) {
      alert('Please select an action.');
      return;
    }
    
    if (bulkAction === 'delete') {
      if (confirm(`Are you sure you want to delete ${selectedPosts.length} selected post(s)?`)) {
        setPosts(prev => prev.filter((post: Post) => !selectedPosts.includes(post.id)));
        setSelectedPosts([]);
        alert('Selected posts deleted successfully!');
      }
    }
  };

  const totalPosts = posts.length;
  const isAllSelected = selectedPosts.length === totalPosts && totalPosts > 0;

  // Stats
  const totalComments = 9;
  const totalLikes = 0;
  const totalWondersDisilikes = 0;
  const totalReplies = 0;

  // Pagination
  const totalPages = 20;
  const pageNumbers = Array.from({ length: Math.min(10, totalPages) }, (_, i) => i + 1);

  return (
    <div className="min-h-screen bg-gray-50 py-4">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Breadcrumb */}
          <nav className="flex mb-4" aria-label="Breadcrumb">
            <ol className="flex items-center space-x-2">
              <li>
                <div className="flex items-center">
                  <svg className="w-3 h-3 text-orange-500" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M10.707 2.293a1 1 0 00-1.414 0l-9 9a1 1 0 001.414 1.414L8 5.414V17a1 1 0 102 0V5.414l6.293 6.293a1 1 0 001.414-1.414l-9-9z"/>
                  </svg>
                  <a href="#" className="ml-1 text-xs font-medium text-orange-500 hover:text-orange-700">
                    Home
                  </a>
                </div>
              </li>
              <li>
                <div className="flex items-center">
                  <svg className="w-3 h-3 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd"/>
                  </svg>
                  <a href="#" className="ml-1 text-xs font-medium text-gray-500 hover:text-gray-700">
                    Manage Features
                  </a>
                </div>
              </li>
              <li>
                <div className="flex items-center">
                  <svg className="w-3 h-3 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd"/>
                  </svg>
                  <span className="ml-1 text-xs font-medium text-red-500">
                    Posts
                  </span>
                </div>
              </li>
            </ol>
          </nav>

          {/* Page Title */}
          <h1 className="text-xl font-bold text-gray-900 mb-4">
            Posts
          </h1>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                    <svg className="w-4 h-4 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M18 13V5a2 2 0 00-2-2H4a2 2 0 00-2 2v8a2 2 0 002 2h3l3 3 3-3h3a2 2 0 002-2zM5 7a1 1 0 011-1h8a1 1 0 110 2H6a1 1 0 01-1-1zm1 3a1 1 0 100 2h3a1 1 0 100-2H6z" clipRule="evenodd"/>
                    </svg>
                  </div>
                </div>
                <div className="ml-3">
                  <p className="text-xs font-medium text-gray-500 uppercase">TOTAL COMMENTS</p>
                  <p className="text-lg font-bold text-gray-900">{totalComments}</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                    <svg className="w-4 h-4 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M2 10.5a1.5 1.5 0 113 0v6a1.5 1.5 0 01-3 0v-6zM6 10.333v5.43a2 2 0 001.106 1.79l.05.025A4 4 0 008.943 18h5.416a2 2 0 001.962-1.608l1.2-6A2 2 0 0015.56 8H12V4a2 2 0 00-2-2 1 1 0 00-1 1v.667a4 4 0 01-.8 2.4L6.8 7.933a4 4 0 00-.8 2.4z"/>
                    </svg>
                  </div>
                </div>
                <div className="ml-3">
                  <p className="text-xs font-medium text-gray-500 uppercase">TOTAL LIKES</p>
                  <p className="text-lg font-bold text-gray-900">{totalLikes}</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-yellow-100 rounded-full flex items-center justify-center">
                    <span className="text-yellow-600 text-sm">😍</span>
                  </div>
                </div>
                <div className="ml-3">
                  <p className="text-xs font-medium text-gray-500 uppercase">TOTAL WONDERS / DISLIKES</p>
                  <p className="text-lg font-bold text-gray-900">{totalWondersDisilikes}</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                    <svg className="w-4 h-4 text-purple-600" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M7.707 3.293a1 1 0 010 1.414L5.414 7H11a7 7 0 017 7v2a1 1 0 11-2 0v-2a5 5 0 00-5-5H5.414l2.293 2.293a1 1 0 11-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd"/>
                    </svg>
                  </div>
                </div>
                <div className="ml-3">
                  <p className="text-xs font-medium text-gray-500 uppercase">TOTAL REPLIES</p>
                  <p className="text-lg font-bold text-gray-900">{totalReplies}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            {/* Header Section */}
            <div className="p-4 border-b border-gray-200">
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-sm font-semibold text-gray-900">
                  Manage & Edit Posts
                </h2>
                <span className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded">
                  All
                </span>
              </div>

              {/* Search Section */}
              <div className="flex flex-col sm:flex-row gap-2">
                <div className="flex-1">
                  <label htmlFor="search" className="block text-xs text-gray-700 mb-1">
                    Search for post ID, post text.
                  </label>
                  <input
                    id="search"
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full px-2 py-1.5 text-xs border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                    onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                  />
                </div>
                <div className="flex items-end">
                  <button
                    onClick={handleSearch}
                    className="bg-blue-500 hover:bg-blue-600 text-white font-medium py-1.5 px-4 text-xs rounded-md transition-colors"
                  >
                    Search
                  </button>
                </div>
              </div>
            </div>

            {/* Table Section */}
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-3 py-2 text-left">
                      <input
                        type="checkbox"
                        checked={isAllSelected}
                        onChange={(e) => handleSelectAll(e.target.checked)}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 h-3 w-3"
                      />
                    </th>
                    <th className="px-3 py-2 text-left">
                      <div className="flex items-center gap-1">
                        <span className="text-xs font-medium text-gray-500 uppercase">ID</span>
                        <svg className="w-3 h-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 11l5-5m0 0l5 5m-5-5v12" />
                        </svg>
                      </div>
                    </th>
                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                      PUBLISHER
                    </th>
                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                      POST LINK
                    </th>
                    <th className="px-3 py-2 text-left">
                      <div className="flex items-center gap-1">
                        <span className="text-xs font-medium text-gray-500 uppercase">POSTED</span>
                        <svg className="w-3 h-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                      </div>
                    </th>
                    <th className="px-3 py-2 text-left">
                      <div className="flex items-center gap-1">
                        <span className="text-xs font-medium text-gray-500 uppercase">STATUS</span>
                        <svg className="w-3 h-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                      </div>
                    </th>
                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                      ACTION
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {posts.map((post) => (
                    <tr key={post.id} className="hover:bg-gray-50">
                      <td className="px-3 py-2">
                        <input
                          type="checkbox"
                          checked={selectedPosts.includes(post.id)}
                          onChange={(e) => handleSelectPost(post.id, e.target.checked)}
                          className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 h-3 w-3"
                        />
                      </td>
                      <td className="px-3 py-2 text-xs text-gray-900 font-medium">{post.id}</td>
                      <td className="px-3 py-2">
                        <div className="flex items-center gap-2">
                          <img
                            src={post.publisherAvatar}
                            alt={post.publisher}
                            className="w-5 h-5 rounded-full object-cover"
                          />
                          <span className="text-xs text-gray-900">{post.publisher}</span>
                        </div>
                      </td>
                      <td className="px-3 py-2">
                        <button className="text-xs bg-blue-500 text-white px-2 py-1 rounded hover:bg-blue-600 transition-colors">
                          {post.postLink}
                        </button>
                      </td>
                      <td className="px-3 py-2 text-xs text-gray-900">{post.posted}</td>
                      <td className="px-3 py-2">
                        <div className="flex items-center gap-1">
                          <svg className="w-3 h-3 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"/>
                          </svg>
                          <span className="text-xs text-gray-900">{post.status}</span>
                        </div>
                      </td>
                      <td className="px-3 py-2">
                        <button
                          onClick={() => handleDeletePost(post.id)}
                          className="text-xs bg-red-100 text-red-600 px-2 py-1 rounded hover:bg-red-200 transition-colors"
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Footer Section */}
            <div className="px-4 py-3 border-t border-gray-200 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              {/* Results Count */}
              <div className="text-xs text-gray-700">
                Showing 1 out of 295
              </div>

              {/* Bulk Actions & Pagination */}
              <div className="flex flex-col sm:flex-row gap-3 items-center">
                {/* Bulk Action */}
                <div className="flex items-center gap-2">
                  <span className="text-xs text-gray-700">Action</span>
                  <select
                    value={bulkAction}
                    onChange={(e) => setBulkAction(e.target.value)}
                    className="text-xs border border-gray-300 rounded-md px-2 py-1"
                  >
                    <option value="">Activate</option>
                    <option value="delete">Delete</option>
                    <option value="deactivate">Deactivate</option>
                  </select>
                  <button
                    onClick={handleBulkAction}
                    className="bg-blue-500 hover:bg-blue-600 text-white font-medium py-1 px-3 text-xs rounded-md transition-colors"
                  >
                    Submit
                  </button>
                </div>

                {/* Pagination */}
                <div className="flex items-center gap-1">
                  <button className="p-1.5 rounded-md border border-gray-300 hover:bg-gray-50">
                    <svg className="w-3 h-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                  </button>
                  
                  {pageNumbers.map((pageNum) => (
                    <button
                      key={pageNum}
                      onClick={() => setCurrentPage(pageNum)}
                      className={`px-2 py-1 text-xs rounded ${
                        currentPage === pageNum
                          ? 'bg-blue-500 text-white'
                          : 'border border-gray-300 text-gray-700 hover:bg-gray-50'
                      }`}
                    >
                      {pageNum}
                    </button>
                  ))}
                  
                  <span className="px-2 text-xs text-gray-500">...</span>
                  
                  {[17, 18, 19, 20].map((pageNum) => (
                    <button
                      key={pageNum}
                      onClick={() => setCurrentPage(pageNum)}
                      className="px-2 py-1 text-xs border border-gray-300 text-gray-700 hover:bg-gray-50 rounded"
                    >
                      {pageNum}
                    </button>
                  ))}
                  
                  <button className="p-1.5 rounded-md border border-gray-300 hover:bg-gray-50">
                    <svg className="w-3 h-3 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </button>
                  
                  <button className="p-1.5 rounded-md border border-gray-300 hover:bg-gray-50">
                    <svg className="w-3 h-3 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 5l7 7-7 7M5 5l7 7-7 7" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
  );
};

export default Posts;
