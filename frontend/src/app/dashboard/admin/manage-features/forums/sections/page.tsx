'use client';

import { useState, useEffect } from 'react';
import { useDarkMode } from '@/contexts/DarkModeContext';

interface ForumSection {
  _id: string;
  title: string;
  description?: string;
  createdAt: string;
  updatedAt?: string;
}

const ManageForumsSections = () => {
  const { isDarkMode } = useDarkMode();
  const [sections, setSections] = useState<ForumSection[]>([]);
  const [filteredSections, setFilteredSections] = useState<ForumSection[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedSections, setSelectedSections] = useState<string[]>([]);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [totalSections, setTotalSections] = useState<number>(0);
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [deleting, setDeleting] = useState<boolean>(false);

  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://jaifriend-backend.hgdjlive.com';
  const itemsPerPage = 15;

  useEffect(() => {
    fetchSections();
  }, [currentPage, sortOrder]);

  useEffect(() => {
    filterSections();
  }, [searchQuery, sections]);

  const fetchSections = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      
      // Try to fetch forum sections from API
      try {
        const response = await fetch(`${API_URL}/api/forums/sections`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });

        if (response.ok) {
          const data = await response.json();
          const sectionsList = Array.isArray(data) ? data : (data.sections || []);
          
          // Sort sections
          const sorted = [...sectionsList].sort((a: ForumSection, b: ForumSection) => {
            const aId = a._id || '';
            const bId = b._id || '';
            return sortOrder === 'asc' ? aId.localeCompare(bId) : bId.localeCompare(aId);
          });
          
          setSections(sorted);
          setTotalSections(sorted.length);
          setTotalPages(Math.ceil(sorted.length / itemsPerPage));
        } else {
          // If endpoint doesn't exist yet, set empty array
          setSections([]);
          setTotalSections(0);
          setTotalPages(1);
        }
      } catch (error) {
        console.log('Forum sections endpoint not available');
        setSections([]);
        setTotalSections(0);
        setTotalPages(1);
      }
    } catch (error) {
      console.error('Error fetching forum sections:', error);
      setSections([]);
      setTotalSections(0);
      setTotalPages(1);
    } finally {
      setLoading(false);
    }
  };

  const filterSections = () => {
    if (!searchQuery.trim()) {
      const startIndex = (currentPage - 1) * itemsPerPage;
      const endIndex = startIndex + itemsPerPage;
      setFilteredSections(sections.slice(startIndex, endIndex));
      return;
    }

    const filtered = sections.filter((section) => {
      const title = (section.title || '').toLowerCase();
      const description = (section.description || '').toLowerCase();
      const query = searchQuery.toLowerCase();
      return title.includes(query) || description.includes(query);
    });

    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    setFilteredSections(filtered.slice(startIndex, endIndex));
    setTotalPages(Math.ceil(filtered.length / itemsPerPage));
  };

  const handleSearch = () => {
    setCurrentPage(1);
    filterSections();
  };

  const handleSort = () => {
    setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    setCurrentPage(1);
  };

  const handleSelectAll = (checked: boolean) => {
    const paginatedSections = getPaginatedSections();
    if (checked) {
      setSelectedSections(paginatedSections.map(s => s._id));
    } else {
      setSelectedSections([]);
    }
  };

  const handleSelectSection = (sectionId: string, checked: boolean) => {
    if (checked) {
      setSelectedSections([...selectedSections, sectionId]);
    } else {
      setSelectedSections(selectedSections.filter(id => id !== sectionId));
    }
  };

  const handleDeleteSelected = async () => {
    if (selectedSections.length === 0) return;
    
    if (!confirm(`Are you sure you want to delete ${selectedSections.length} section(s)?`)) {
      return;
    }

    try {
      setDeleting(true);
      const token = localStorage.getItem('token');
      
      // Delete selected sections
      const deletePromises = selectedSections.map(sectionId =>
        fetch(`${API_URL}/api/forums/sections/${sectionId}`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }).catch(err => {
          console.error(`Error deleting section ${sectionId}:`, err);
          return { ok: false };
        })
      );

      await Promise.all(deletePromises);
      setSelectedSections([]);
      await fetchSections();
      alert('Sections deleted successfully!');
    } catch (error) {
      console.error('Error deleting sections:', error);
      alert('Failed to delete sections. Please try again.');
    } finally {
      setDeleting(false);
    }
  };

  const getPaginatedSections = () => {
    if (searchQuery.trim()) {
      return filteredSections;
    }
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return sections.slice(startIndex, endIndex);
  };

  const paginatedSections = getPaginatedSections();
  const showingCount = paginatedSections.length;
  const totalCount = searchQuery.trim() 
    ? sections.filter(s => {
        const title = (s.title || '').toLowerCase();
        const desc = (s.description || '').toLowerCase();
        const query = searchQuery.toLowerCase();
        return title.includes(query) || desc.includes(query);
      }).length
    : totalSections;

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
                Forums
              </a>
            </li>
            <li>
              <span className="mx-2 text-gray-400">/</span>
            </li>
            <li>
              <span className={`${isDarkMode ? 'text-red-400' : 'text-red-500'} font-medium`}>Manage Forums Sections</span>
            </li>
          </ol>
        </nav>

        {/* Page Title */}
        <h1 className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'} mb-6`}>
          Manage Forums Sections
        </h1>

        {/* Main Card */}
        <div className={`${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} rounded-lg shadow-sm border p-6`}>
          {/* Card Header */}
          <h2 className={`text-lg font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'} mb-4`}>
            Manage Forums Sections
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
                placeholder="Search sections..."
              />
              <button
                onClick={handleSearch}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
              >
                Search
              </button>
            </div>
          </div>

          {/* Sections Table */}
          <div className="overflow-x-auto mb-4">
            <table className="w-full">
              <thead className={`${isDarkMode ? 'bg-gray-700' : 'bg-gray-50'} border-b ${isDarkMode ? 'border-gray-600' : 'border-gray-200'}`}>
                <tr>
                  <th className="px-4 py-3 text-left">
                    <input
                      type="checkbox"
                      checked={selectedSections.length === paginatedSections.length && paginatedSections.length > 0}
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
                    TITLE
                  </th>
                  <th className={`px-4 py-3 text-left text-xs font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-500'} uppercase tracking-wider`}>
                    DESCRIPTION
                  </th>
                  <th className={`px-4 py-3 text-left text-xs font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-500'} uppercase tracking-wider`}>
                    ACTION
                  </th>
                </tr>
              </thead>
              <tbody className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} divide-y ${isDarkMode ? 'divide-gray-700' : 'divide-gray-200'}`}>
                {loading ? (
                  <tr>
                    <td colSpan={5} className="px-4 py-8 text-center">
                      <div className="flex items-center justify-center">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                        <span className={`ml-3 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Loading sections...</span>
                      </div>
                    </td>
                  </tr>
                ) : paginatedSections.length === 0 ? (
                  <tr>
                    <td colSpan={5} className={`px-4 py-8 text-center ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                      No sections found
                    </td>
                  </tr>
                ) : (
                  paginatedSections.map((section) => (
                    <tr key={section._id} className={isDarkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-50'}>
                      <td className="px-4 py-3">
                        <input
                          type="checkbox"
                          checked={selectedSections.includes(section._id)}
                          onChange={(e) => handleSelectSection(section._id, e.target.checked)}
                          className={`rounded ${isDarkMode ? 'border-gray-600' : 'border-gray-300'} text-blue-600 focus:ring-blue-500`}
                        />
                      </td>
                      <td className={`px-4 py-3 text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-900'}`}>
                        {section._id.substring(0, 8)}...
                      </td>
                      <td className={`px-4 py-3 text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-900'}`}>
                        {section.title || '-'}
                      </td>
                      <td className={`px-4 py-3 text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-900'}`}>
                        <div className="max-w-xs truncate" title={section.description || ''}>
                          {section.description || '-'}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <button
                          onClick={async () => {
                            if (confirm('Are you sure you want to delete this section?')) {
                              try {
                                const token = localStorage.getItem('token');
                                await fetch(`${API_URL}/api/forums/sections/${section._id}`, {
                                  method: 'DELETE',
                                  headers: {
                                    'Authorization': `Bearer ${token}`,
                                    'Content-Type': 'application/json'
                                  }
                                });
                                await fetchSections();
                                alert('Section deleted successfully!');
                              } catch (error) {
                                console.error('Error deleting section:', error);
                                alert('Failed to delete section.');
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
                disabled={selectedSections.length === 0 || deleting}
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

export default ManageForumsSections;

