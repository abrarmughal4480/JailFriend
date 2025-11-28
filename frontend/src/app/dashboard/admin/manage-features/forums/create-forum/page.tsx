'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useDarkMode } from '@/contexts/DarkModeContext';

interface ForumSection {
  _id: string;
  title?: string;
  name?: string;
  description?: string;
}

const CreateNewForum = () => {
  const { isDarkMode } = useDarkMode();
  const router = useRouter();
  const [name, setName] = useState<string>('');
  const [description, setDescription] = useState<string>('');
  const [sectionId, setSectionId] = useState<string>('');
  const [sections, setSections] = useState<ForumSection[]>([]);
  const [loadingSections, setLoadingSections] = useState<boolean>(true);
  const [creating, setCreating] = useState<boolean>(false);
  const [error, setError] = useState<string>('');

  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://jaifriend-backend.hgdjlive.com';

  useEffect(() => {
    fetchSections();
  }, []);

  const fetchSections = async () => {
    try {
      setLoadingSections(true);
      const token = localStorage.getItem('token');

      const response = await fetch(`${API_URL}/api/forums/sections`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        const sectionsList = Array.isArray(data) ? data : (data.sections || []);
        setSections(sectionsList);
        if (sectionsList.length > 0 && !sectionId) {
          setSectionId(sectionsList[0]._id);
        }
      }
    } catch (error) {
      console.error('Error fetching sections:', error);
    } finally {
      setLoadingSections(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Validation
    if (!name.trim()) {
      setError('Name is required');
      return;
    }

    if (!sectionId) {
      setError('Section is required');
      return;
    }

    try {
      setCreating(true);
      const token = localStorage.getItem('token');

      const response = await fetch(`${API_URL}/api/forums`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          title: name.trim(),
          name: name.trim(),
          description: description.trim(),
          sectionId: sectionId
        })
      });

      if (response.ok) {
        alert('Forum created successfully!');
        router.push('/dashboard/admin/manage-features/forums/manage');
      } else {
        const data = await response.json();
        setError(data.error || data.message || 'Failed to create forum');
      }
    } catch (error) {
      console.error('Error creating forum:', error);
      setError('Failed to create forum. Please try again.');
    } finally {
      setCreating(false);
    }
  };

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
              <span className={`${isDarkMode ? 'text-red-400' : 'text-red-500'} font-medium`}>Create New Forum</span>
            </li>
          </ol>
        </nav>

        {/* Page Title */}
        <h1 className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'} mb-6`}>
          Create New Forum
        </h1>

        {/* Main Card */}
        <div className={`${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} rounded-lg shadow-sm border p-6`}>
          {/* Card Header */}
          <h2 className={`text-lg font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'} mb-4`}>
            Create New Forum
          </h2>

          {/* Informational Message */}
          <div className={`mb-6 p-4 rounded-lg ${isDarkMode ? 'bg-blue-900/30 border border-blue-800' : 'bg-blue-50 border border-blue-200'}`}>
            <p className={`text-sm ${isDarkMode ? 'text-blue-300' : 'text-blue-800'}`}>
              You can create a forum, a forum is created inside sections.
            </p>
          </div>

          {/* Error Message */}
          {error && (
            <div className={`mb-4 p-3 rounded-lg ${isDarkMode ? 'bg-red-900/30 border border-red-800' : 'bg-red-50 border border-red-200'}`}>
              <p className={`text-sm ${isDarkMode ? 'text-red-300' : 'text-red-800'}`}>
                {error}
              </p>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit}>
            {/* Name Field */}
            <div className="mb-6">
              <label className={`block text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'} mb-2`}>
                Name
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className={`w-full px-3 py-2 border ${isDarkMode ? 'border-gray-600 bg-gray-700 text-white' : 'border-gray-300 bg-white text-gray-900'} rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500`}
                placeholder="Enter forum name"
                required
              />
            </div>

            {/* Description Field */}
            <div className="mb-6">
              <label className={`block text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'} mb-2`}>
                Description
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={4}
                className={`w-full px-3 py-2 border ${isDarkMode ? 'border-gray-600 bg-gray-700 text-white' : 'border-gray-300 bg-white text-gray-900'} rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 resize-y`}
                placeholder="Enter forum description"
              />
            </div>

            {/* Section Field */}
            <div className="mb-6">
              <label className={`block text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'} mb-2`}>
                Section
              </label>
              <select
                value={sectionId}
                onChange={(e) => setSectionId(e.target.value)}
                disabled={loadingSections || sections.length === 0}
                className={`w-full px-3 py-2 border ${isDarkMode ? 'border-gray-600 bg-gray-700 text-white' : 'border-gray-300 bg-white text-gray-900'} rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed`}
                required
              >
                {loadingSections ? (
                  <option value="">Loading sections...</option>
                ) : sections.length === 0 ? (
                  <option value="">No sections available</option>
                ) : (
                  <>
                    <option value="">Select a section</option>
                    {sections.map((section) => (
                      <option key={section._id} value={section._id}>
                        {section.title || section.name || 'Untitled Section'}
                      </option>
                    ))}
                  </>
                )}
              </select>
            </div>

            {/* Submit Button */}
            <div className="flex justify-end">
              <button
                type="submit"
                disabled={creating || loadingSections || sections.length === 0}
                className={`px-6 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${creating ? 'opacity-50' : ''}`}
              >
                {creating ? 'Creating...' : 'Create Forum'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CreateNewForum;

