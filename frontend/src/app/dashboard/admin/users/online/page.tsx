"use client";
import React, { useState, useEffect } from 'react';
import { Search, RefreshCw, ChevronUp, ChevronDown, ChevronsLeft, ChevronsRight, Users, Activity, Menu, X, Home, Settings, UserCheck, BarChart3, FileText, MessageSquare } from 'lucide-react';

interface OnlineUser {
  _id: string;
  id: string;
  username: string;
  email: string;
  source: string;
  ipAddress: string;
  status: 'online' | 'offline' | 'away';
  lastActive: string;
  userAgent: string;
  sessionId: string;
}

const OnlineUsersPage: React.FC = () => {
  const [users, setUsers] = useState<OnlineUser[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<OnlineUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalUsers, setTotalUsers] = useState(0);
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const [sortField, setSortField] = useState('id');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [bulkAction, setBulkAction] = useState('activate');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('online');

  // Fetch online users from API
  const fetchOnlineUsers = async (page = 1) => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      if (!token) return;

      const response = await fetch(
  `${process.env.NEXT_PUBLIC_API_URL || 'https://jaifriend-backend.hgdjlive.com'}/api/admin/users/online?page=${page}&limit=20&sortBy=${sortField}&sortOrder=${sortOrder}`,
        {
          headers: { 'Authorization': `Bearer ${token}` }
        }
      );

      if (response.ok) {
        const data = await response.json();
        setUsers(data.users);
        setFilteredUsers(data.users);
        setCurrentPage(data.pagination.currentPage);
        setTotalPages(data.pagination.totalPages);
        setTotalUsers(data.pagination.totalUsers);
      }
    } catch (error) {
      console.error('Error fetching online users:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOnlineUsers();
  }, [sortField, sortOrder]);

  // Filter users based on search query
  useEffect(() => {
    const filtered = users.filter(user =>
      user.username?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.id?.toLowerCase().includes(searchQuery.toLowerCase())
    );
    setFilteredUsers(filtered);
  }, [users, searchQuery]);

  // Handle search
  const handleSearch = () => {
    fetchOnlineUsers(1);
  };

  // Handle sorting
  const handleSort = (field: string) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('asc');
    }
  };

  // Handle bulk action
  const handleBulkAction = async () => {
    if (selectedUsers.length === 0) {
      alert('Please select users to perform bulk action');
      return;
    }

    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      const response = await fetch(
  `${process.env.NEXT_PUBLIC_API_URL || 'https://jaifriend-backend.hgdjlive.com'}/api/admin/users/bulk/${bulkAction}`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ userIds: selectedUsers })
        }
      );

      if (response.ok) {
        fetchOnlineUsers(currentPage);
        setSelectedUsers([]);
        alert(`Bulk ${bulkAction} completed successfully`);
      } else {
        alert(`Failed to perform bulk ${bulkAction}`);
      }
    } catch (error) {
      console.error(`Error performing bulk ${bulkAction}:`, error);
      alert(`Error performing bulk ${bulkAction}`);
    }
  };

  // Handle individual user action
  const handleUserAction = async (userId: string, action: string) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      const response = await fetch(
  `${process.env.NEXT_PUBLIC_API_URL || 'https://jaifriend-backend.hgdjlive.com'}/api/admin/users/${userId}/${action}`,
        {
          method: 'POST',
          headers: { 'Authorization': `Bearer ${token}` }
        }
      );

      if (response.ok) {
        fetchOnlineUsers(currentPage);
        alert(`User ${action} successfully`);
      } else {
        alert(`Failed to ${action} user`);
      }
    } catch (error) {
      console.error(`Error ${action}ing user:`, error);
      alert(`Error ${action}ing user`);
    }
  };

  // Get status color
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'online':
        return 'text-green-600 bg-green-100';
      case 'away':
        return 'text-yellow-600 bg-yellow-100';
      case 'offline':
        return 'text-red-600 bg-red-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  // Get status text
  const getStatusText = (status: string) => {
    switch (status) {
      case 'online':
        return 'Online';
      case 'away':
        return 'Away';
      case 'offline':
        return 'Offline';
      default:
        return 'Unknown';
    }
  };

  // Get source text
  const getSourceText = (source: string) => {
    switch (source) {
      case 'web':
        return 'Web Browser';
      case 'mobile':
        return 'Mobile App';
      case 'api':
        return 'API';
      default:
        return source || 'Unknown';
    }
  };

  // Sidebar navigation items

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

    

      {/* Main Content */}
      <div>
        {/* Mobile Header */}
        <div className="lg:hidden bg-white shadow-sm border-b border-gray-200">
          <div className="flex items-center justify-between px-4 py-3">
            <button
              onClick={() => setSidebarOpen(true)}
              className="p-2 text-gray-400 hover:text-gray-600"
            >
              <Menu className="w-6 h-6" />
            </button>
            <h1 className="text-lg font-semibold text-gray-800">Online Users</h1>
            <div className="w-6" /> {/* Spacer for centering */}
          </div>
        </div>

        {/* Content */}
        <div className="p-4 lg:p-6">
          {/* Header */}
          <div className="mb-6">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-4">
              <div>
                <h1 className="text-2xl lg:text-3xl font-bold text-gray-800 mb-2">Online Users</h1>
                <div className="text-sm text-gray-600">
                  Home {'>'} Users {'>'} <span className="text-red-500 font-semibold">Online Users</span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => fetchOnlineUsers(currentPage)}
                  disabled={loading}
                  className="flex items-center gap-1 px-3 py-1.5 bg-gray-100 text-gray-700 rounded text-sm hover:bg-gray-200 transition-colors disabled:opacity-50"
                >
                  <span className="hidden sm:inline">All</span>
                </button>
                <button
                  onClick={() => fetchOnlineUsers(currentPage)}
                  disabled={loading}
                  className="flex items-center gap-1 px-3 py-1.5 bg-blue-600 text-white rounded text-sm hover:bg-blue-700 transition-colors disabled:opacity-50"
                >
                  <RefreshCw className={`w-3 h-3 ${loading ? 'animate-spin' : ''}`} />
                  <span className="hidden sm:inline">Refresh</span>
                </button>
              </div>
            </div>
          </div>

          {/* Main Content Panel */}
          <div className="bg-white rounded-lg shadow-sm">
            {/* Panel Header */}
            <div className="p-4 lg:p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h2 className="text-lg lg:text-xl font-semibold text-gray-800">Online Users</h2>
              </div>
            </div>

            {/* Search Section */}
            <div className="p-4 lg:p-6 border-b border-gray-200">
              <div className="flex flex-col lg:flex-row items-start lg:items-center gap-4">
                <div className="flex-1 w-full">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Search for Username, E-mail, First or Last Name
                  </label>
                  <div className="flex flex-col sm:flex-row gap-2">
                    <input
                      type="text"
                      placeholder="Enter search terms..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-sm"
                    />
                    <button
                      onClick={handleSearch}
                      className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
                    >
                      Search
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Users Table */}
            <div className="overflow-x-auto">
              <table className="w-full min-w-[800px]">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-3 lg:px-6 py-3 text-left">
                      <input
                        type="checkbox"
                        checked={selectedUsers.length === filteredUsers.length && filteredUsers.length > 0}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedUsers(filteredUsers.map(user => user._id));
                          } else {
                            setSelectedUsers([]);
                          }
                        }}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                    </th>
                    <th 
                      className="px-3 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                      onClick={() => handleSort('id')}
                    >
                      <div className="flex items-center gap-1">
                        ID
                        {sortField === 'id' && (
                          sortOrder === 'asc' ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />
                        )}
                      </div>
                    </th>
                    <th 
                      className="px-3 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                      onClick={() => handleSort('username')}
                    >
                      <div className="flex items-center gap-1">
                        USERNAME
                        {sortField === 'username' && (
                          sortOrder === 'asc' ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />
                        )}
                      </div>
                    </th>
                    <th className="px-3 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      SOURCE
                    </th>
                    <th 
                      className="px-3 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                      onClick={() => handleSort('email')}
                    >
                      <div className="flex items-center gap-1">
                        E-MAIL
                        {sortField === 'email' && (
                          sortOrder === 'asc' ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />
                        )}
                      </div>
                    </th>
                    <th className="px-3 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      IP ADDRESS
                    </th>
                    <th 
                      className="px-3 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                      onClick={() => handleSort('status')}
                    >
                      <div className="flex items-center gap-1">
                        STATUS
                        {sortField === 'status' && (
                          sortOrder === 'asc' ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />
                        )}
                      </div>
                    </th>
                    <th className="px-3 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      ACTION
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {loading ? (
                    <tr>
                      <td colSpan={8} className="px-3 lg:px-6 py-8 text-center">
                        <div className="flex items-center justify-center">
                          <RefreshCw className="w-5 h-5 animate-spin text-blue-500 mr-2" />
                          <span className="text-sm lg:text-base">Loading online users...</span>
                        </div>
                      </td>
                    </tr>
                  ) : filteredUsers.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="px-3 lg:px-6 py-8 text-center text-gray-500 text-sm lg:text-base">
                        No online users found
                      </td>
                    </tr>
                  ) : (
                    filteredUsers.map((user) => (
                      <tr key={user._id} className="hover:bg-gray-50">
                        <td className="px-3 lg:px-6 py-3 lg:py-4">
                          <input
                            type="checkbox"
                            checked={selectedUsers.includes(user._id)}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setSelectedUsers([...selectedUsers, user._id]);
                              } else {
                                setSelectedUsers(selectedUsers.filter(id => id !== user._id));
                              }
                            }}
                            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                          />
                        </td>
                        <td className="px-3 lg:px-6 py-3 lg:py-4 text-sm text-gray-900">
                          {user.id}
                        </td>
                        <td className="px-3 lg:px-6 py-3 lg:py-4 text-sm text-gray-900 font-medium">
                          {user.username}
                        </td>
                        <td className="px-3 lg:px-6 py-3 lg:py-4 text-sm text-gray-600">
                          {getSourceText(user.source)}
                        </td>
                        <td className="px-3 lg:px-6 py-3 lg:py-4 text-sm text-gray-900">
                          {user.email}
                        </td>
                        <td className="px-3 lg:px-6 py-3 lg:py-4 text-sm text-gray-600">
                          {user.ipAddress}
                        </td>
                        <td className="px-3 lg:px-6 py-3 lg:py-4">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(user.status)}`}>
                            {getStatusText(user.status)}
                          </span>
                        </td>
                        <td className="px-3 lg:px-6 py-3 lg:py-4">
                          <div className="flex items-center gap-1 lg:gap-2">
                            <button
                              onClick={() => handleUserAction(user._id, 'block')}
                              className="px-2 lg:px-3 py-1 bg-red-600 text-white rounded text-xs hover:bg-red-700 transition-colors"
                            >
                              Block
                            </button>
                            <button
                              onClick={() => handleUserAction(user._id, 'kick')}
                              className="px-2 lg:px-3 py-1 bg-yellow-600 text-white rounded text-xs hover:bg-yellow-700 transition-colors"
                            >
                              Kick
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination and Bulk Actions */}
            <div className="p-4 lg:p-6 border-t border-gray-200">
              <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                  <div className="text-sm text-gray-700">
                    Showing {filteredUsers.length} out of {totalUsers}
                  </div>
                  
                  {/* Bulk Actions */}
                  <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2">
                    <label className="text-sm font-medium text-gray-700">Action:</label>
                    <select
                      value={bulkAction}
                      onChange={(e) => setBulkAction(e.target.value)}
                      className="px-3 py-1 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                    >
                      <option value="activate">Activate</option>
                      <option value="deactivate">Deactivate</option>
                      <option value="block">Block</option>
                      <option value="kick">Kick</option>
                    </select>
                    <button
                      onClick={handleBulkAction}
                      disabled={selectedUsers.length === 0}
                      className="px-4 py-1 bg-blue-500 text-white rounded text-sm hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Submit
                    </button>
                  </div>
                </div>

                {/* Pagination */}
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => fetchOnlineUsers(1)}
                    disabled={currentPage === 1}
                    className="p-2 text-gray-400 hover:text-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
                    title="First page"
                  >
                    <ChevronsLeft className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => fetchOnlineUsers(currentPage - 1)}
                    disabled={currentPage === 1}
                    className="p-2 text-gray-400 hover:text-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
                    title="Previous page"
                  >
                    <ChevronUp className="w-4 h-4 rotate-90" />
                  </button>
                  <span className="px-3 py-1 text-sm text-gray-700">
                    Page {currentPage} of {totalPages}
                  </span>
                  <button
                    onClick={() => fetchOnlineUsers(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className="p-2 text-gray-400 hover:text-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
                    title="Next page"
                  >
                    <ChevronDown className="w-4 h-4 -rotate-90" />
                  </button>
                  <button
                    onClick={() => fetchOnlineUsers(totalPages)}
                    disabled={currentPage === totalPages}
                    className="p-2 text-gray-400 hover:text-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
                    title="Last page"
                  >
                    <ChevronsRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OnlineUsersPage; 
