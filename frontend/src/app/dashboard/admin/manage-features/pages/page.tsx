'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { adminApi } from '@/utils/adminApi';

interface Page {
  id: string;
  _id?: string;
  pageName: string;
  name?: string;
  url?: string;
  owner: string;
  ownerName?: string;
  createdBy?: any;
  ownerAvatar: string;
  category: string;
  categoryName?: string;
  favicon: string;
}

const Pages = () => {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [selectedPages, setSelectedPages] = useState<string[]>([]);
  const [pages, setPages] = useState<Page[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalPagesCount, setTotalPagesCount] = useState(0);
  const [totalLikes, setTotalLikes] = useState(0);
  const [totalPosts, setTotalPosts] = useState(0);
  const [verifiedPages, setVerifiedPages] = useState(0);

  useEffect(() => {
    fetchPages();
  }, [currentPage]);

  const fetchPages = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await adminApi.getPages();
      
      if (data.success && data.pages) {
        // Transform API data to match Page interface
        const transformedPages: Page[] = data.pages.map((page: any) => ({
          id: page._id?.toString() || page.id || '',
          _id: page._id?.toString() || page.id,
          pageName: page.name || page.pageName || 'Unnamed Page',
          name: page.name || page.pageName,
          url: page.url || page.slug || page._id?.toString() || page.id,
          owner: page.createdBy?.name || page.ownerName || page.owner || 'Unknown',
          ownerName: page.createdBy?.name || page.ownerName || page.owner,
          createdBy: page.createdBy,
          ownerAvatar: page.createdBy?.avatar || page.ownerAvatar || '/default-avatar.svg',
          category: page.categoryName || page.category || 'Other',
          categoryName: page.categoryName || page.category,
          favicon: page.favicon || '📄'
        }));
        
        setPages(transformedPages);
        setTotalPagesCount(data.totalPages || transformedPages.length);
        
        // Calculate stats
        const verified = transformedPages.filter((p: any) => p.isVerified || p.verified).length;
        setVerifiedPages(verified);
        
        // You might want to fetch these from a separate stats endpoint
        setTotalLikes(0);
        setTotalPosts(0);
      }
    } catch (err) {
      console.error('Error fetching pages:', err);
      setError(err instanceof Error ? err.message : 'Failed to load pages');
      setPages([]);
    } finally {
      setLoading(false);
    }
  };

  // Filter pages based on search term
  const filteredPages = searchTerm.trim()
    ? pages.filter((page) =>
        page.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        page.pageName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        page.owner.toLowerCase().includes(searchTerm.toLowerCase())
      )
    : pages;

  const handleSearch = () => {
    // Search is handled by filteredPages computed value
    // For server-side search, you would call fetchPages with search params here
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedPages(filteredPages.map((page: Page) => page.id));
    } else {
      setSelectedPages([]);
    }
  };

  const handleSelectPage = (pageId: string, checked: boolean) => {
    if (checked) {
      setSelectedPages(prev => [...prev, pageId]);
    } else {
      setSelectedPages(prev => prev.filter((id: string) => id !== pageId));
    }
  };

  const handleDeleteSelected = async () => {
    if (selectedPages.length > 0) {
      if (confirm(`Are you sure you want to delete ${selectedPages.length} selected page(s)?`)) {
        try {
          // TODO: Implement bulk delete API call
          // await adminApi.deletePages(selectedPages);
          setPages(prev => prev.filter((page: Page) => !selectedPages.includes(page.id)));
          setSelectedPages([]);
          alert('Selected pages deleted successfully!');
          fetchPages(); // Refresh the list
        } catch (error) {
          console.error('Error deleting pages:', error);
          alert('Failed to delete pages. Please try again.');
        }
      }
    } else {
      alert('Please select pages to delete.');
    }
  };

  const handleEditPage = (pageId: string) => {
    // TODO: Navigate to edit page or open edit modal
    alert(`Edit page with ID: ${pageId}`);
  };

  const handleDeletePage = async (pageId: string) => {
    if (confirm('Are you sure you want to delete this page?')) {
      try {
        // TODO: Implement delete API call
        // await adminApi.deletePage(pageId);
        setPages(prev => prev.filter((page: Page) => page.id !== pageId));
        setSelectedPages(prev => prev.filter((id: string) => id !== pageId));
        alert('Page deleted successfully!');
        fetchPages(); // Refresh the list
      } catch (error) {
        console.error('Error deleting page:', error);
        alert('Failed to delete page. Please try again.');
      }
    }
  };

  const isAllSelected = selectedPages.length === filteredPages.length && filteredPages.length > 0;

  return (
    <div className="min-h-screen bg-gray-50 py-2 sm:py-4">
        <div className="max-w-7xl mx-auto px-2 sm:px-4 lg:px-8">
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
                  <span className="ml-1 text-xs font-medium text-blue-600">
                    Pages
                  </span>
                </div>
              </li>
            </ol>
          </nav>

          {/* Page Title */}
          <h1 className="text-lg sm:text-xl font-bold text-gray-900 mb-3 sm:mb-4">
            Pages
          </h1>

          {/* Stats Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-4 mb-4 sm:mb-6">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-2 sm:p-4">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-6 h-6 sm:w-8 sm:h-8 bg-blue-100 rounded-full flex items-center justify-center">
                    <span className="text-blue-600 text-sm sm:text-lg">📄</span>
                  </div>
                </div>
                <div className="ml-2 sm:ml-3">
                  <p className="text-xs font-medium text-gray-500 uppercase">TOTAL PAGES</p>
                  <p className="text-sm sm:text-lg font-bold text-gray-900">{totalPagesCount}</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-2 sm:p-4">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-6 h-6 sm:w-8 sm:h-8 bg-blue-100 rounded-full flex items-center justify-center">
                    <span className="text-blue-600 text-sm sm:text-lg">👍</span>
                  </div>
                </div>
                <div className="ml-2 sm:ml-3">
                  <p className="text-xs font-medium text-gray-500 uppercase">TOTAL LIKES</p>
                  <p className="text-sm sm:text-lg font-bold text-gray-900">{totalLikes}</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-2 sm:p-4">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-6 h-6 sm:w-8 sm:h-8 bg-yellow-100 rounded-full flex items-center justify-center">
                    <span className="text-yellow-600 text-sm sm:text-lg">✏️</span>
                  </div>
                </div>
                <div className="ml-2 sm:ml-3">
                  <p className="text-xs font-medium text-gray-500 uppercase">TOTAL POSTS</p>
                  <p className="text-sm sm:text-lg font-bold text-gray-900">{totalPosts}</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-2 sm:p-4">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-6 h-6 sm:w-8 sm:h-8 bg-purple-100 rounded-full flex items-center justify-center">
                    <span className="text-purple-600 text-lg">✓</span>
                  </div>
                </div>
                <div className="ml-3">
                  <p className="text-xs font-medium text-gray-500 uppercase">VERIFIED PAGES</p>
                  <p className="text-lg font-bold text-gray-900">{verifiedPages}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            {/* Header Section */}
            <div className="p-4 border-b border-gray-200">
              <h2 className="text-sm font-semibold text-gray-900 mb-3">
                Manage & Edit Pages
              </h2>

              {/* Search Section */}
              <div className="flex flex-col sm:flex-row gap-2">
                <div className="flex-1">
                  <label htmlFor="search" className="block text-xs text-gray-700 mb-1">
                    Search for page ID, page name, page title.
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
                    <th className="px-3 py-2 text-left">
                      <div className="flex items-center gap-1">
                        <span className="text-xs font-medium text-gray-500 uppercase">PAGE NAME</span>
                        <svg className="w-3 h-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                      </div>
                    </th>
                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                      OWNER
                    </th>
                    <th className="px-3 py-2 text-left">
                      <div className="flex items-center gap-1">
                        <span className="text-xs font-medium text-gray-500 uppercase">CATEGORY</span>
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
                  {loading ? (
                    <tr>
                      <td colSpan={6} className="px-3 py-8 text-center">
                        <div className="flex items-center justify-center">
                          <div className="inline-block animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500 mr-2"></div>
                          <span className="text-xs text-gray-500">Loading pages...</span>
                        </div>
                      </td>
                    </tr>
                  ) : error ? (
                    <tr>
                      <td colSpan={6} className="px-3 py-8 text-center">
                        <span className="text-xs text-red-600">{error}</span>
                      </td>
                    </tr>
                  ) : filteredPages.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="px-3 py-8 text-center">
                        <span className="text-xs text-gray-500">
                          {searchTerm ? 'No pages found matching your search.' : 'No pages available.'}
                        </span>
                      </td>
                    </tr>
                  ) : (
                    filteredPages.map((page) => (
                    <tr key={page.id} className="hover:bg-gray-50">
                      <td className="px-3 py-2">
                        <input
                          type="checkbox"
                          checked={selectedPages.includes(page.id)}
                          onChange={(e) => handleSelectPage(page.id, e.target.checked)}
                          className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 h-3 w-3"
                        />
                      </td>
                      <td className="px-3 py-2 text-xs text-gray-900 font-medium">{page.id}</td>
                      <td className="px-3 py-2">
                        <div className="flex items-center gap-2">
                          <span className="text-sm">{page.favicon}</span>
                          <span 
                            className="text-xs text-blue-600 font-medium cursor-pointer hover:underline"
                            onClick={() => {
                              const pageIdentifier = page.url || page.id;
                              router.push(`/dashboard/pages/${pageIdentifier}`);
                            }}
                          >
                            {page.pageName}
                          </span>
                        </div>
                      </td>
                      <td className="px-3 py-2">
                        <div className="flex items-center gap-2">
                          <img
                            src={page.ownerAvatar}
                            alt={page.owner}
                            className="w-5 h-5 rounded-full object-cover"
                            onError={(e) => {
                              e.currentTarget.src = '/default-avatar.svg';
                            }}
                          />
                          <span className="text-xs text-blue-600">{page.owner}</span>
                        </div>
                      </td>
                      <td className="px-3 py-2">
                        <span className={`text-xs ${
                          page.category === 'Education' ? 'text-orange-600' : 
                          page.category === 'Cars and Vehicles' ? 'text-green-600' : 
                          'text-gray-600'
                        }`}>
                          {page.category}
                        </span>
                      </td>
                      <td className="px-3 py-2">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleEditPage(page.id)}
                            className="text-xs bg-blue-100 text-blue-600 px-2 py-1 rounded hover:bg-blue-200 transition-colors"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleDeletePage(page.id)}
                            className="text-xs bg-red-100 text-red-600 px-2 py-1 rounded hover:bg-red-200 transition-colors"
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Footer Section */}
            <div className="px-4 py-3 border-t border-gray-200 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              {/* Results Count */}
              <div className="text-xs text-gray-700">
                Showing {filteredPages.length} out of {totalPagesCount}
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-2">
                <button
                  onClick={handleDeleteSelected}
                  disabled={selectedPages.length === 0}
                  className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
                    selectedPages.length === 0
                      ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                      : 'bg-blue-500 hover:bg-blue-600 text-white'
                  }`}
                >
                  Delete Selected
                </button>

                {/* Pagination */}
                <div className="flex items-center gap-1">
                  <button 
                    onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                    disabled={currentPage === 1 || loading}
                    className={`p-1.5 rounded-md border border-gray-300 ${
                      currentPage === 1 || loading
                        ? 'cursor-not-allowed opacity-50'
                        : 'hover:bg-gray-50'
                    }`}
                  >
                    <svg className="w-3 h-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                  </button>
                  <span className="px-2 py-1 text-xs bg-blue-500 text-white rounded">{currentPage}</span>
                  <button 
                    onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                    disabled={currentPage === totalPages || totalPages === 0 || loading}
                    className={`p-1.5 rounded-md border border-gray-300 ${
                      currentPage === totalPages || totalPages === 0 || loading
                        ? 'cursor-not-allowed opacity-50'
                        : 'hover:bg-gray-50'
                    }`}
                  >
                    <svg className="w-3 h-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
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

export default Pages;
