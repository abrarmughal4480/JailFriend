"use client";

import React, { useState, useEffect } from 'react';
import { useDarkMode } from '@/contexts/DarkModeContext';
import { adminApi } from '@/utils/adminApi';

interface Report {
  id: string;
  _id?: string;
  type: string;
  reporter: string;
  reporterId?: string;
  link: string;
  time: string;
  createdAt?: string;
  status?: string;
}

const ManageReports = () => {
  const { isDarkMode } = useDarkMode();
  const [reports, setReports] = useState<Report[]>([]);
  const [selectedReports, setSelectedReports] = useState<string[]>([]);
  const [sortField, setSortField] = useState<'id' | 'time'>('id');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalReports, setTotalReports] = useState(0);
  const [filter, setFilter] = useState('all');
  const [actionType, setActionType] = useState('mark-safe');
  const [submitting, setSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const itemsPerPage = 15;

  useEffect(() => {
    fetchReports();
  }, [currentPage]);

  const fetchReports = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await adminApi.getReports(currentPage, itemsPerPage);
      
      if (data.success) {
        // Transform API data to match Report interface
        const transformedReports: Report[] = (data.reports || []).map((report: any) => ({
          id: report._id || report.id || '',
          _id: report._id || report.id,
          type: report.type || report.reportType || 'Unknown',
          reporter: report.reporterName || report.reporter?.name || report.reporterId || 'Unknown',
          reporterId: report.reporterId || report.reporter?._id,
          link: report.link || report.postLink || report.contentLink || '#',
          time: report.createdAt ? new Date(report.createdAt).toLocaleString() : report.time || new Date().toLocaleString(),
          createdAt: report.createdAt,
          status: report.status || 'pending'
        }));
        
        setReports(transformedReports);
        setTotalReports(data.pagination?.totalReports || data.reports?.length || 0);
        setTotalPages(data.pagination?.totalPages || 1);
      }
    } catch (err) {
      console.error('Error fetching reports:', err);
      setError(err instanceof Error ? err.message : 'Failed to load reports');
      setReports([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSort = (field: 'id' | 'time') => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('asc');
    }
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedReports(reports.map(report => report.id));
    } else {
      setSelectedReports([]);
    }
  };

  const handleSelectReport = (id: string, checked: boolean) => {
    if (checked) {
      setSelectedReports([...selectedReports, id]);
    } else {
      setSelectedReports(selectedReports.filter(reportId => reportId !== id));
    }
  };

  const handleSubmit = async () => {
    if (selectedReports.length === 0) {
      alert('Please select at least one report');
      return;
    }

    try {
      setSubmitting(true);
      await adminApi.handleReportAction(selectedReports, actionType);
      setSelectedReports([]);
      alert(`Action "${actionType}" applied successfully!`);
      fetchReports(); // Refresh the reports list
    } catch (error) {
      console.error('Error performing report action:', error);
      alert(`Failed to perform action: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setSubmitting(false);
    }
  };

  const getSortIcon = (field: 'id' | 'time') => {
    if (sortField !== field) {
      return (
        <svg className="w-4 h-4 inline ml-1 opacity-30" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
        </svg>
      );
    }
    return sortOrder === 'asc' ? (
      <svg className="w-4 h-4 inline ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
      </svg>
    ) : (
      <svg className="w-4 h-4 inline ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
      </svg>
    );
  };

  return (
    <div className={`p-6 min-h-screen transition-colors duration-200 ${isDarkMode ? 'bg-gray-900' : 'bg-gray-50'}`}>
      {/* Header */}
      <div className="mb-6">
        <h1 className={`text-3xl font-bold mb-2 transition-colors duration-200 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
          Manage Reports
        </h1>
        <div className={`text-sm transition-colors duration-200 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
          <span className="flex items-center gap-1">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
            </svg>
            Home
          </span>
          {' > '}
          Reports
          {' > '}
          <span className="text-red-500 font-semibold">Manage Reports</span>
        </div>
      </div>

      {/* Main Content Card */}
      <div className={`rounded-lg shadow-md border transition-colors duration-200 ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
        <div className="p-6">
          <h2 className={`text-2xl font-semibold mb-6 transition-colors duration-200 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
            Manage Reports
          </h2>

          {/* Table Controls */}
          <div className="mb-4 flex items-center justify-between">
            <div></div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setFilter('all')}
                className={`px-4 py-2 rounded-lg transition-colors duration-200 font-medium ${
                  filter === 'all'
                    ? isDarkMode
                      ? 'bg-blue-600 text-white'
                      : 'bg-blue-500 text-white'
                    : isDarkMode
                    ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                All
              </button>
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className={`w-full border-collapse transition-colors duration-200 ${isDarkMode ? 'text-gray-300' : 'text-gray-900'}`}>
              <thead>
                <tr className={`transition-colors duration-200 ${isDarkMode ? 'bg-gray-700' : 'bg-gray-100'}`}>
                  <th className={`px-4 py-3 text-left border-b transition-colors duration-200 ${
                    isDarkMode ? 'border-gray-600' : 'border-gray-300'
                  }`}>
                    <input
                      type="checkbox"
                      checked={selectedReports.length === reports.length && reports.length > 0}
                      onChange={(e) => handleSelectAll(e.target.checked)}
                      className={`w-4 h-4 rounded transition-colors duration-200 ${
                        isDarkMode
                          ? 'bg-gray-700 border-gray-600 text-blue-600'
                          : 'bg-white border-gray-300 text-blue-600'
                      }`}
                    />
                  </th>
                  <th
                    className={`px-4 py-3 text-left border-b cursor-pointer hover:bg-opacity-80 transition-colors duration-200 ${
                      isDarkMode ? 'border-gray-600' : 'border-gray-300'
                    }`}
                    onClick={() => handleSort('id')}
                  >
                    <div className="flex items-center uppercase text-xs font-medium">
                      ID
                      {getSortIcon('id')}
                    </div>
                  </th>
                  <th className={`px-4 py-3 text-left border-b uppercase text-xs font-medium transition-colors duration-200 ${
                    isDarkMode ? 'border-gray-600 text-gray-400' : 'border-gray-300 text-gray-600'
                  }`}>
                    TYPE
                  </th>
                  <th className={`px-4 py-3 text-left border-b uppercase text-xs font-medium transition-colors duration-200 ${
                    isDarkMode ? 'border-gray-600 text-gray-400' : 'border-gray-300 text-gray-600'
                  }`}>
                    REPORTER
                  </th>
                  <th className={`px-4 py-3 text-left border-b uppercase text-xs font-medium transition-colors duration-200 ${
                    isDarkMode ? 'border-gray-600 text-gray-400' : 'border-gray-300 text-gray-600'
                  }`}>
                    LINK
                  </th>
                  <th
                    className={`px-4 py-3 text-left border-b cursor-pointer hover:bg-opacity-80 transition-colors duration-200 ${
                      isDarkMode ? 'border-gray-600' : 'border-gray-300'
                    }`}
                    onClick={() => handleSort('time')}
                  >
                    <div className="flex items-center uppercase text-xs font-medium">
                      TIME
                      {getSortIcon('time')}
                    </div>
                  </th>
                  <th className={`px-4 py-3 text-left border-b uppercase text-xs font-medium transition-colors duration-200 ${
                    isDarkMode ? 'border-gray-600 text-gray-400' : 'border-gray-300 text-gray-600'
                  }`}>
                    ACTION
                  </th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td
                      colSpan={7}
                      className={`px-4 py-8 text-center transition-colors duration-200 ${
                        isDarkMode ? 'text-gray-400' : 'text-gray-500'
                      }`}
                    >
                      <div className="flex items-center justify-center">
                        <div className="inline-block animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500 mr-2"></div>
                        Loading reports...
                      </div>
                    </td>
                  </tr>
                ) : error ? (
                  <tr>
                    <td
                      colSpan={7}
                      className={`px-4 py-8 text-center transition-colors duration-200 ${
                        isDarkMode ? 'text-red-300' : 'text-red-800'
                      }`}
                    >
                      {error}
                    </td>
                  </tr>
                ) : reports.length === 0 ? (
                  <tr>
                    <td
                      colSpan={7}
                      className={`px-4 py-8 text-center transition-colors duration-200 ${
                        isDarkMode ? 'text-gray-400' : 'text-gray-500'
                      }`}
                    >
                      No reports found
                    </td>
                  </tr>
                ) : (
                  reports.map((report) => (
                    <tr
                      key={report.id}
                      className={`border-b transition-colors duration-200 hover:bg-opacity-50 ${
                        isDarkMode
                          ? 'border-gray-700 hover:bg-gray-700'
                          : 'border-gray-200 hover:bg-gray-50'
                      }`}
                    >
                      <td className={`px-4 py-3 transition-colors duration-200 ${
                        isDarkMode ? 'border-gray-700' : 'border-gray-200'
                      }`}>
                        <input
                          type="checkbox"
                          checked={selectedReports.includes(report.id)}
                          onChange={(e) => handleSelectReport(report.id, e.target.checked)}
                          className={`w-4 h-4 rounded transition-colors duration-200 ${
                            isDarkMode
                              ? 'bg-gray-700 border-gray-600 text-blue-600'
                              : 'bg-white border-gray-300 text-blue-600'
                          }`}
                        />
                      </td>
                      <td className={`px-4 py-3 transition-colors duration-200 ${
                        isDarkMode ? 'border-gray-700' : 'border-gray-200'
                      }`}>
                        {report.id}
                      </td>
                      <td className={`px-4 py-3 transition-colors duration-200 ${
                        isDarkMode ? 'border-gray-700' : 'border-gray-200'
                      }`}>
                        {report.type}
                      </td>
                      <td className={`px-4 py-3 transition-colors duration-200 ${
                        isDarkMode ? 'border-gray-700' : 'border-gray-200'
                      }`}>
                        {report.reporter}
                      </td>
                      <td className={`px-4 py-3 transition-colors duration-200 ${
                        isDarkMode ? 'border-gray-700' : 'border-gray-200'
                      }`}>
                        <a
                          href={report.link}
                          target="_blank"
                          rel="noopener noreferrer"
                          className={`text-blue-500 hover:text-blue-700 transition-colors duration-200 ${
                            isDarkMode ? 'hover:text-blue-400' : ''
                          }`}
                        >
                          View
                        </a>
                      </td>
                      <td className={`px-4 py-3 transition-colors duration-200 ${
                        isDarkMode ? 'border-gray-700' : 'border-gray-200'
                      }`}>
                        {report.time}
                      </td>
                      <td className={`px-4 py-3 transition-colors duration-200 ${
                        isDarkMode ? 'border-gray-700' : 'border-gray-200'
                      }`}>
                        <button
                          className={`px-3 py-1 rounded text-sm transition-colors duration-200 ${
                            isDarkMode
                              ? 'bg-red-600 hover:bg-red-700 text-white'
                              : 'bg-red-500 hover:bg-red-600 text-white'
                          }`}
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

          {/* Table Footer */}
          <div className="mt-4 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <p className={`text-sm transition-colors duration-200 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                Showing {reports.length} out of {totalReports}
              </p>
              {/* Action Section */}
              <div className="flex items-center gap-3">
                <label className={`text-sm font-medium transition-colors duration-200 ${
                  isDarkMode ? 'text-gray-300' : 'text-gray-700'
                }`}>
                  Action:
                </label>
                <select
                  value={actionType}
                  onChange={(e) => setActionType(e.target.value)}
                  className={`px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors duration-200 ${
                    isDarkMode
                      ? 'border-gray-600 bg-gray-700 text-white'
                      : 'border-gray-300 bg-white text-gray-900'
                  }`}
                >
                  <option value="mark-safe">Mark Safe</option>
                  <option value="delete">Delete</option>
                  <option value="ban-user">Ban User</option>
                  <option value="ignore">Ignore</option>
                </select>
                <button
                  onClick={handleSubmit}
                  disabled={submitting || selectedReports.length === 0}
                  className={`px-6 py-2 rounded-lg text-white font-medium transition-colors duration-200 ${
                    isDarkMode
                      ? 'bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400'
                      : 'bg-blue-500 hover:bg-blue-600 disabled:bg-blue-400'
                  }`}
                >
                  {submitting ? 'Submitting...' : 'Submit'}
                </button>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  setCurrentPage(prev => Math.max(1, prev - 1));
                }}
                disabled={currentPage === 1 || loading}
                className={`px-3 py-2 rounded-lg transition-colors duration-200 ${
                  currentPage === 1
                    ? isDarkMode
                      ? 'bg-gray-700 text-gray-500 cursor-not-allowed'
                      : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                    : isDarkMode
                    ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <button
                onClick={() => {
                  setCurrentPage(prev => Math.min(totalPages, prev + 1));
                }}
                disabled={currentPage === totalPages || totalPages === 0 || loading}
                className={`px-3 py-2 rounded-lg transition-colors duration-200 ${
                  currentPage === totalPages || totalPages === 0
                    ? isDarkMode
                      ? 'bg-gray-700 text-gray-500 cursor-not-allowed'
                      : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                    : isDarkMode
                    ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ManageReports;



