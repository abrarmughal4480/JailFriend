"use client";
import React, { useState, useEffect } from 'react';
import { 
  Search, 
  Filter, 
  MoreVertical, 
  Edit, 
  Trash2, 
  Eye, 
  CheckCircle, 
  XCircle, 
  UserCheck, 
  UserX, 
  Mail, 
  Phone, 
  MapPin, 
  Globe, 
  Calendar,
  Users,
  Activity,
  Clock,
  ArrowUpDown,
  Download,
  RefreshCw,
  Ban,
  Unlock,
  Crown,
  UserPlus,
  Settings
} from 'lucide-react';

interface User {
  _id: string;
  email: string;
  name: string;
  fullName: string;
  username: string;
  avatar: string;
  coverPhoto?: string;
  bio?: string;
  status?: string;
  location?: string;
  website?: string;
  workplace?: string;
  country?: string;
  address?: string;
  gender: string;
  dateOfBirth?: string;
  phone?: string;
  isSetupDone: boolean;
  isOnline: boolean;
  lastSeen: string;
  lastActive: string;
  isVerified: boolean;
  isPrivate: boolean;
  isBlocked: boolean;
  createdAt: string;
  updatedAt: string;
  followers?: string[];
  following?: string[];
}

interface UserStats {
  totalUsers: number;
  onlineUsers: number;
  verifiedUsers: number;
  blockedUsers: number;
  newUsersToday: number;
  activeUsersThisWeek: number;
}

const AdminUsersPage: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<UserStats>({
    totalUsers: 0,
    onlineUsers: 0,
    verifiedUsers: 0,
    blockedUsers: 0,
    newUsersToday: 0,
    activeUsersThisWeek: 0
  });
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [sortBy, setSortBy] = useState('createdAt');
  const [sortOrder, setSortOrder] = useState('desc');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [showUserModal, setShowUserModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  // Fetch users from API
  const fetchUsers = async (page = 1) => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      if (!token) return;

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || 'https://jaifriend-backend.hgdjlive.com'}/api/admin/users?page=${page}&limit=15&sortBy=${sortBy}&sortOrder=${sortOrder}`,
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
      }
    } catch (error) {
      console.error('Error fetching users:', error);
    } finally {
      setLoading(false);
    }
  };

  // Fetch user statistics
  const fetchUserStats = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || 'https://jaifriend-backend.hgdjlive.com'}/api/admin/stats`,
        {
          headers: { 'Authorization': `Bearer ${token}` }
        }
      );

      if (response.ok) {
        const data = await response.json();
        const onlineUsers = users.filter(user => user.isOnline).length;
        const verifiedUsers = users.filter(user => user.isVerified).length;
        const blockedUsers = users.filter(user => user.isBlocked).length;
        
        const today = new Date();
        const newUsersToday = users.filter(user => {
          const userDate = new Date(user.createdAt);
          return userDate.toDateString() === today.toDateString();
        }).length;

        const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
        const activeUsersThisWeek = users.filter(user => {
          const lastActive = new Date(user.lastActive);
          return lastActive >= weekAgo;
        }).length;

        setStats({
          totalUsers: data.stats.totalUsers,
          onlineUsers,
          verifiedUsers,
          blockedUsers,
          newUsersToday,
          activeUsersThisWeek
        });
      }
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [sortBy, sortOrder]);

  useEffect(() => {
    if (users.length > 0) {
      fetchUserStats();
    }
  }, [users]);

  // Filter and search users
  useEffect(() => {
    let filtered = users;

    if (searchQuery) {
      filtered = filtered.filter(user =>
        user.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.username?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.location?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    switch (statusFilter) {
      case 'online':
        filtered = filtered.filter(user => user.isOnline);
        break;
      case 'offline':
        filtered = filtered.filter(user => !user.isOnline);
        break;
      case 'verified':
        filtered = filtered.filter(user => user.isVerified);
        break;
      case 'blocked':
        filtered = filtered.filter(user => user.isBlocked);
        break;
      case 'new':
        const today = new Date();
        filtered = filtered.filter(user => {
          const userDate = new Date(user.createdAt);
          return userDate.toDateString() === today.toDateString();
        });
        break;
    }

    setFilteredUsers(filtered);
  }, [users, searchQuery, statusFilter]);

  // Handle user actions
  const handleUserAction = async (userId: string, action: string) => {
    try {
      setActionLoading(true);
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
        fetchUsers(currentPage);
        alert(`User ${action} successfully`);
      } else {
        alert(`Failed to ${action} user`);
      }
    } catch (error) {
      console.error(`Error ${action}ing user:`, error);
      alert(`Error ${action}ing user`);
    } finally {
      setActionLoading(false);
    }
  };

  // Handle bulk actions
  const handleBulkAction = async (action: string) => {
    if (selectedUsers.length === 0) return;

    try {
      setActionLoading(true);
      const token = localStorage.getItem('token');
      if (!token) return;

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || 'https://jaifriend-backend.hgdjlive.com'}/api/admin/users/bulk/${action}`,
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
        fetchUsers(currentPage);
        setSelectedUsers([]);
        alert(`Bulk ${action} completed successfully`);
      } else {
        alert(`Failed to perform bulk ${action}`);
      }
    } catch (error) {
      console.error(`Error performing bulk ${action}:`, error);
      alert(`Error performing bulk ${action}`);
    } finally {
      setActionLoading(false);
    }
  };

  // Format date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  // Get time ago
  const getTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`;
    return `${Math.floor(diffInMinutes / 1440)}d ago`;
  };

  // Get user status color
  const getUserStatusColor = (user: User) => {
    if (user.isBlocked) return 'text-red-500';
    if (user.isOnline) return 'text-green-500';
    if (user.isVerified) return 'text-blue-500';
    return 'text-gray-500';
  };

  // Get user status text
  const getUserStatusText = (user: User) => {
    if (user.isBlocked) return 'Blocked';
    if (user.isOnline) return 'Online';
    if (user.isVerified) return 'Verified';
    return 'Active';
  };

  return (
    <div className="min-h-screen bg-gray-50 p-2 sm:p-4 overflow-x-hidden">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">User Management</h1>
            <p className="text-gray-600 text-sm">Manage all users on the platform</p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => fetchUsers(currentPage)}
              disabled={loading}
              className="flex items-center gap-1 px-3 py-1.5 bg-blue-600 text-white rounded text-sm hover:bg-blue-700 transition-colors disabled:opacity-50"
            >
              <RefreshCw className={`w-3 h-3 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </button>
            <button className="flex items-center gap-1 px-3 py-1.5 bg-green-600 text-white rounded text-sm hover:bg-green-700 transition-colors">
              <Download className="w-3 h-3" />
              Export
            </button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 mb-4">
          <div className="bg-white rounded-lg shadow-sm p-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-600">Total</p>
                <p className="text-lg font-bold text-gray-900">{stats.totalUsers}</p>
              </div>
              <Users className="w-5 h-5 text-blue-500" />
            </div>
          </div>
          <div className="bg-white rounded-lg shadow-sm p-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-600">Online</p>
                <p className="text-lg font-bold text-green-600">{stats.onlineUsers}</p>
              </div>
              <Activity className="w-5 h-5 text-green-500" />
            </div>
          </div>
          <div className="bg-white rounded-lg shadow-sm p-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-600">Verified</p>
                <p className="text-lg font-bold text-blue-600">{stats.verifiedUsers}</p>
              </div>
              <CheckCircle className="w-5 h-5 text-blue-500" />
            </div>
          </div>
          <div className="bg-white rounded-lg shadow-sm p-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-600">Blocked</p>
                <p className="text-lg font-bold text-red-600">{stats.blockedUsers}</p>
              </div>
              <Ban className="w-5 h-5 text-red-500" />
            </div>
          </div>
          <div className="bg-white rounded-lg shadow-sm p-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-600">New Today</p>
                <p className="text-lg font-bold text-purple-600">{stats.newUsersToday}</p>
              </div>
              <UserPlus className="w-5 h-5 text-purple-500" />
            </div>
          </div>
          <div className="bg-white rounded-lg shadow-sm p-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-600">Active Week</p>
                <p className="text-lg font-bold text-orange-600">{stats.activeUsersThisWeek}</p>
              </div>
              <Clock className="w-5 h-5 text-orange-500" />
            </div>
          </div>
        </div>

        {/* Filters and Search */}
        <div className="bg-white rounded-lg shadow-sm p-3 mb-4">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  placeholder="Search users..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-8 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-sm"
                />
              </div>
            </div>
            <div className="flex gap-2">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-sm"
              >
                <option value="all">All Users</option>
                <option value="online">Online</option>
                <option value="offline">Offline</option>
                <option value="verified">Verified</option>
                <option value="blocked">Blocked</option>
                <option value="new">New Today</option>
              </select>
              <select
                value={`${sortBy}-${sortOrder}`}
                onChange={(e) => {
                  const [field, order] = e.target.value.split('-');
                  setSortBy(field);
                  setSortOrder(order);
                }}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-sm"
              >
                <option value="createdAt-desc">Newest First</option>
                <option value="createdAt-asc">Oldest First</option>
                <option value="name-asc">Name A-Z</option>
                <option value="name-desc">Name Z-A</option>
                <option value="lastActive-desc">Recently Active</option>
              </select>
            </div>
          </div>
        </div>

        {/* Bulk Actions */}
        {selectedUsers.length > 0 && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4">
            <div className="flex items-center justify-between">
              <p className="text-blue-800 text-sm">
                {selectedUsers.length} user(s) selected
              </p>
              <div className="flex gap-2">
                <button
                  onClick={() => handleBulkAction('verify')}
                  disabled={actionLoading}
                  className="flex items-center gap-1 px-2 py-1 bg-blue-600 text-white rounded text-xs hover:bg-blue-700 transition-colors disabled:opacity-50"
                >
                  <CheckCircle className="w-3 h-3" />
                  Verify
                </button>
                <button
                  onClick={() => handleBulkAction('block')}
                  disabled={actionLoading}
                  className="flex items-center gap-1 px-2 py-1 bg-red-600 text-white rounded text-xs hover:bg-red-700 transition-colors disabled:opacity-50"
                >
                  <Ban className="w-3 h-3" />
                  Block
                </button>
                <button
                  onClick={() => setSelectedUsers([])}
                  className="px-2 py-1 bg-gray-600 text-white rounded text-xs hover:bg-gray-700 transition-colors"
                >
                  Clear
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-4 py-2 text-left">
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
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  User
                </th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Contact
                </th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Joined
                </th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center">
                    <div className="flex items-center justify-center">
                      <RefreshCw className="w-5 h-5 animate-spin text-blue-500 mr-2" />
                      Loading users...
                    </div>
                  </td>
                </tr>
              ) : filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-gray-500">
                    No users found
                  </td>
                </tr>
              ) : (
                filteredUsers.map((user) => (
                  <tr key={user._id} className="hover:bg-gray-50">
                    <td className="px-4 py-2">
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
                    <td className="px-4 py-2">
                      <div className="flex items-center">
                        <img
                          src={user.avatar || '/avatars/1.png.png'} onError={(e) => { console.log('❌ Avatar load failed for user:', user.avatar || '/avatars/1.png.png'); e.currentTarget.src = '/default-avatar.svg'; }}
                          alt={user.name}
                          className="w-8 h-8 rounded-full object-cover mr-2"
                        />
                        <div>
                          <div className="flex items-center gap-1">
                            <p className="text-sm font-medium text-gray-900">
                              {user.name || user.fullName || 'Unknown'}
                            </p>
                            {user.isVerified && (
                              <CheckCircle className="w-3 h-3 text-blue-500" />
                            )}
                          </div>
                          <p className="text-xs text-gray-500">@{user.username}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-2">
                      <div className="text-xs">
                        <p className="text-gray-900">{user.email}</p>
                        {user.phone && (
                          <p className="text-gray-500">{user.phone}</p>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-2">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${getUserStatusColor(user)}`}>
                        {getUserStatusText(user)}
                      </span>
                    </td>
                    <td className="px-4 py-2 text-xs text-gray-500">
                      {formatDate(user.createdAt)}
                    </td>
                    <td className="px-4 py-2">
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => {
                            setSelectedUser(user);
                            setShowUserModal(true);
                          }}
                          className="p-1 text-gray-400 hover:text-blue-600 transition-colors"
                          title="View Details"
                        >
                          <Eye className="w-3 h-3" />
                        </button>
                        <button
                          onClick={() => handleUserAction(user._id, user.isVerified ? 'unverify' : 'verify')}
                          disabled={actionLoading}
                          className={`p-1 transition-colors ${
                            user.isVerified 
                              ? 'text-blue-600 hover:text-blue-800' 
                              : 'text-gray-400 hover:text-blue-600'
                          }`}
                          title={user.isVerified ? 'Unverify' : 'Verify'}
                        >
                          <CheckCircle className="w-3 h-3" />
                        </button>
                        <button
                          onClick={() => handleUserAction(user._id, user.isBlocked ? 'unblock' : 'block')}
                          disabled={actionLoading}
                          className={`p-1 transition-colors ${
                            user.isBlocked 
                              ? 'text-red-600 hover:text-red-800' 
                              : 'text-gray-400 hover:text-red-600'
                          }`}
                          title={user.isBlocked ? 'Unblock' : 'Block'}
                        >
                          <Ban className="w-3 h-3" />
                        </button>
                        <button
                          onClick={() => {
                            setSelectedUser(user);
                            setShowDeleteModal(true);
                          }}
                          className="p-1 text-gray-400 hover:text-red-600 transition-colors"
                          title="Delete User"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="bg-white px-4 py-3 border-t border-gray-200">
            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-700">
                Page {currentPage} of {totalPages}
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => fetchUsers(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="px-3 py-1 border border-gray-300 rounded text-sm hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Previous
                </button>
                <button
                  onClick={() => fetchUsers(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className="px-3 py-1 border border-gray-300 rounded text-sm hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Next
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* User Details Modal */}
      {showUserModal && selectedUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-lg w-full max-h-[80vh] overflow-y-auto">
            <div className="p-4">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-bold text-gray-900">User Details</h2>
                <button
                  onClick={() => setShowUserModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <XCircle className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-4">
                {/* User Header */}
                <div className="flex items-center gap-3">
                  <img
                    src={selectedUser.avatar || '/avatars/1.png.png'} onError={(e) => { console.log('❌ Avatar load failed for user:', selectedUser.avatar || '/avatars/1.png.png'); e.currentTarget.src = '/default-avatar.svg'; }}
                    alt={selectedUser.name}
                    className="w-16 h-16 rounded-full object-cover"
                  />
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">
                      {selectedUser.name || selectedUser.fullName || 'Unknown'}
                    </h3>
                    <p className="text-gray-500">@{selectedUser.username}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${getUserStatusColor(selectedUser)}`}>
                        {getUserStatusText(selectedUser)}
                      </span>
                      {selectedUser.isVerified && (
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                          Verified
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* User Information */}
                <div className="grid grid-cols-1 gap-4">
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-2">Contact Information</h4>
                    <div className="space-y-1 text-sm">
                      <p className="flex items-center gap-2">
                        <Mail className="w-4 h-4 text-gray-400" />
                        {selectedUser.email}
                      </p>
                      {selectedUser.phone && (
                        <p className="flex items-center gap-2">
                          <Phone className="w-4 h-4 text-gray-400" />
                          {selectedUser.phone}
                        </p>
                      )}
                      {selectedUser.website && (
                        <p className="flex items-center gap-2">
                          <Globe className="w-4 h-4 text-gray-400" />
                          <a href={selectedUser.website} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                            {selectedUser.website}
                          </a>
                        </p>
                      )}
                    </div>
                  </div>

                  <div>
                    <h4 className="font-semibold text-gray-900 mb-2">Account Information</h4>
                    <div className="space-y-1 text-sm">
                      <p className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-gray-400" />
                        Joined: {formatDate(selectedUser.createdAt)}
                      </p>
                      <p className="flex items-center gap-2">
                        <Clock className="w-4 h-4 text-gray-400" />
                        Last Active: {getTimeAgo(selectedUser.lastActive)}
                      </p>
                      <p className="text-gray-600">
                        Online: {selectedUser.isOnline ? 'Yes' : 'No'}
                      </p>
                      <p className="text-gray-600">
                        Verified: {selectedUser.isVerified ? 'Yes' : 'No'}
                      </p>
                      <p className="text-gray-600">
                        Blocked: {selectedUser.isBlocked ? 'Yes' : 'No'}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 pt-3 border-t border-gray-200">
                  <button
                    onClick={() => handleUserAction(selectedUser._id, selectedUser.isVerified ? 'unverify' : 'verify')}
                    disabled={actionLoading}
                    className={`flex items-center gap-1 px-3 py-1.5 rounded text-sm font-medium transition-colors ${
                      selectedUser.isVerified
                        ? 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        : 'bg-blue-600 text-white hover:bg-blue-700'
                    } disabled:opacity-50`}
                  >
                    <CheckCircle className="w-3 h-3" />
                    {selectedUser.isVerified ? 'Unverify' : 'Verify'}
                  </button>
                  <button
                    onClick={() => handleUserAction(selectedUser._id, selectedUser.isBlocked ? 'unblock' : 'block')}
                    disabled={actionLoading}
                    className={`flex items-center gap-1 px-3 py-1.5 rounded text-sm font-medium transition-colors ${
                      selectedUser.isBlocked
                        ? 'bg-green-600 text-white hover:bg-green-700'
                        : 'bg-red-600 text-white hover:bg-red-700'
                    } disabled:opacity-50`}
                  >
                    <Ban className="w-3 h-3" />
                    {selectedUser.isBlocked ? 'Unblock' : 'Block'}
                  </button>
                  <button
                    onClick={() => {
                      setShowUserModal(false);
                      setShowDeleteModal(true);
                    }}
                    className="flex items-center gap-1 px-3 py-1.5 bg-red-600 text-white rounded text-sm font-medium hover:bg-red-700 transition-colors"
                  >
                    <Trash2 className="w-3 h-3" />
                    Delete
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && selectedUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full">
            <div className="p-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Delete User</h3>
              <p className="text-gray-600 mb-4 text-sm">
                Are you sure you want to delete <strong>{selectedUser.name || selectedUser.username}</strong>? 
                This action cannot be undone.
              </p>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => {
                    setShowDeleteModal(false);
                    setSelectedUser(null);
                  }}
                  className="flex-1 px-3 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-sm"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    handleUserAction(selectedUser._id, 'delete');
                    setShowDeleteModal(false);
                    setSelectedUser(null);
                  }}
                  disabled={actionLoading}
                  className="flex-1 px-3 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm disabled:opacity-50"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminUsersPage; 
