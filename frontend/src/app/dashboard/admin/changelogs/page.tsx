"use client";
import React, { useState, useEffect } from 'react';
import { useDarkMode } from '@/contexts/DarkModeContext';
import { adminApi } from '@/utils/adminApi';

interface Changelog {
  version: string;
  date: string;
  type: string;
  description: string;
}

const AdminChangelogs = () => {
  const { isDarkMode } = useDarkMode();
  const [changelogs, setChangelogs] = useState<Changelog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchChangelogs();
  }, []);

  const fetchChangelogs = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await adminApi.getChangelogs();
      
      if (data.success && data.changelogs) {
        setChangelogs(data.changelogs);
      } else if (data.success && data.changelogs === undefined) {
        // If API returns success but no changelogs, use empty array
        setChangelogs([]);
      }
    } catch (err) {
      console.error('Error fetching changelogs:', err);
      setError(err instanceof Error ? err.message : 'Failed to load changelogs');
      setChangelogs([]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={`p-6 min-h-screen transition-colors duration-200 ${isDarkMode ? 'bg-gray-900' : 'bg-gray-50'}`}>
      {/* Header */}
      <div className="mb-6">
        <h1 className={`text-3xl font-bold mb-2 transition-colors duration-200 ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>
          Changelogs
        </h1>
        <div className={`text-sm transition-colors duration-200 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
          Home {'>'} Admin {'>'} <span className="text-red-500 font-semibold">CHANGELOGS</span>
        </div>
      </div>

      {/* Changelogs List */}
      <div className={`rounded-lg shadow-sm border transition-colors duration-200 ${
        isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
      }`}>
        <div className={`p-6 border-b transition-colors duration-200 ${
          isDarkMode ? 'border-gray-700' : 'border-gray-200'
        }`}>
          <h2 className={`text-xl font-semibold transition-colors duration-200 ${
            isDarkMode ? 'text-white' : 'text-gray-800'
          }`}>
            Version History
          </h2>
        </div>
        {loading ? (
          <div className="p-6 text-center">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
            <p className={`mt-4 transition-colors duration-200 ${
              isDarkMode ? 'text-gray-300' : 'text-gray-600'
            }`}>
              Loading changelogs...
            </p>
          </div>
        ) : error ? (
          <div className="p-6">
            <p className={`transition-colors duration-200 ${
              isDarkMode ? 'text-red-300' : 'text-red-800'
            }`}>
              {error}
            </p>
          </div>
        ) : changelogs.length === 0 ? (
          <div className="p-6 text-center">
            <p className={`transition-colors duration-200 ${
              isDarkMode ? 'text-gray-400' : 'text-gray-500'
            }`}>
              No changelogs available
            </p>
          </div>
        ) : (
          <div className={`divide-y transition-colors duration-200 ${
            isDarkMode ? 'divide-gray-700' : 'divide-gray-200'
          }`}>
            {changelogs.map((log, index) => (
            <div key={index} className="p-6">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-3">
                  <h3 className={`text-lg font-semibold transition-colors duration-200 ${
                    isDarkMode ? 'text-white' : 'text-gray-800'
                  }`}>
                    {log.version}
                  </h3>
                  <span className={`px-2 py-1 text-xs font-semibold rounded-full transition-colors duration-200 ${
                    log.type === 'Feature'
                      ? isDarkMode
                        ? 'bg-blue-900/30 text-blue-300'
                        : 'bg-blue-100 text-blue-800'
                      : log.type === 'Bug Fix'
                      ? isDarkMode
                        ? 'bg-green-900/30 text-green-300'
                        : 'bg-green-100 text-green-800'
                      : log.type === 'Security'
                      ? isDarkMode
                        ? 'bg-red-900/30 text-red-300'
                        : 'bg-red-100 text-red-800'
                      : isDarkMode
                      ? 'bg-yellow-900/30 text-yellow-300'
                      : 'bg-yellow-100 text-yellow-800'
                  }`}>
                    {log.type}
                  </span>
                </div>
                <span className={`text-sm transition-colors duration-200 ${
                  isDarkMode ? 'text-gray-400' : 'text-gray-500'
                }`}>
                  {log.date}
                </span>
              </div>
              <p className={`transition-colors duration-200 ${
                isDarkMode ? 'text-gray-300' : 'text-gray-600'
              }`}>
                {log.description}
              </p>
            </div>
          ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminChangelogs; 
