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
  Settings,
  ChevronUp,
  ChevronDown,
  ChevronsLeft,
  ChevronsRight,
  Menu,
  X,
  Home,
  BarChart3,
  FileText,
  MessageSquare,
  Flag,
  CheckSquare,
  Square
} from 'lucide-react';

interface VerificationRequest {
  _id: string;
  id: number;
  user: {
    _id: string;
    name: string;
    username: string;
    avatar: string;
  };
  information: string;
  type: 'Page' | 'Profile' | 'Business' | 'Document' | 'Other';
  status: 'pending' | 'approved' | 'rejected' | 'ignored';
  createdAt: string;
  updatedAt: string;
  documents?: string[];
  description?: string;
  category?: string;
}

interface VerificationStats {
  totalRequests: number;
  pendingRequests: number;
  approvedRequests: number;
  rejectedRequests: number;
  ignoredRequests: number;
  pageRequests: number;
  profileRequests: number;
}

const VerificationRequestsPage: React.FC = () => {
  const [requests, setRequests] = useState<VerificationRequest[]>([]);
  const [filteredRequests, setFilteredRequests] = useState<VerificationRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<VerificationStats>({
    totalRequests: 0,
    pendingRequests: 0,
    approvedRequests: 0,
    rejectedRequests: 0,
    ignoredRequests: 0,
    pageRequests: 0,
    profileRequests: 0
  });
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [sortBy, setSortBy] = useState('id');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedRequests, setSelectedRequests] = useState<string[]>([]);
  const [bulkAction, setBulkAction] = useState('verify');
  const [actionLoading, setActionLoading] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('verification');

  // Mock data for demonstration (matching the image)
  const mockRequests: VerificationRequest[] = [
    {
      _id: '1',
      id: 1,
      user: {
        _id: 'user1',
        name: 'jaifriend',
        username: 'jaifriend',
        avatar: '/avatars/1.png.png'
      },
      information: '',
      type: 'Page',
      status: 'pending',
      createdAt: '2024-01-15T00:00:00.000Z',
      updatedAt: '2024-01-15T00:00:00.000Z',
      description: 'Page verification request',
      category: 'Business'
    }
  ];

  // Fetch verification requests from API
  const fetchVerificationRequests = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      if (!token) {
        console.error('No token found');
        return;
      }

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'https://jaifriend-backend.hgdjlive.com'}/api/verification/all`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch requests');
      }

      const data = await response.json();
      console.log('Verification requests fetched:', data);

      // Transform data if needed to match interface or direct usage
      // Assuming API returns array of verification objects that match or are close to interface
      // We might need to map if backend field names differ
      const mappedData = data.map((item: any) => ({
        ...item,
        id: item._id.substring(item._id.length - 6), // Generate short ID for display
        type: 'Profile', // Defaulting to Profile as per current backend schema
        information: item.message,
        category: 'Person'
      }));

      setRequests(mappedData);
      setFilteredRequests(mappedData);

      // Calculate stats
      const totalRequests = mappedData.length;
      const pendingRequests = mappedData.filter((r: any) => r.status === 'pending').length;
      const approvedRequests = mappedData.filter((r: any) => r.status === 'approved').length;
      const rejectedRequests = mappedData.filter((r: any) => r.status === 'rejected').length;
      const ignoredRequests = mappedData.filter((r: any) => r.status === 'ignored').length;
      const pageRequests = mappedData.filter((r: any) => r.type === 'Page').length;
      const profileRequests = mappedData.filter((r: any) => r.type === 'Profile').length;

      setStats({
        totalRequests,
        pendingRequests,
        approvedRequests,
        rejectedRequests,
        ignoredRequests,
        pageRequests,
        profileRequests
      });
    } catch (error) {
      console.error('Error fetching verification requests:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVerificationRequests();
  }, []);

  // Filter and search requests
  useEffect(() => {
    let filtered = requests;

    if (searchQuery) {
      filtered = filtered.filter(request =>
        request.user?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        request.user?.username?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        request.information?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        request.type?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    switch (typeFilter) {
      case 'Page':
        filtered = filtered.filter(request => request.type === 'Page');
        break;
      case 'Profile':
        filtered = filtered.filter(request => request.type === 'Profile');
        break;
      case 'Business':
        filtered = filtered.filter(request => request.type === 'Business');
        break;
      case 'Document':
        filtered = filtered.filter(request => request.type === 'Document');
        break;
    }

    // Sort requests
    filtered.sort((a, b) => {
      let aValue: any, bValue: any;

      switch (sortBy) {
        case 'id':
          aValue = a.id;
          bValue = b.id;
          break;
        case 'type':
          aValue = a.type;
          bValue = b.type;
          break;
        case 'createdAt':
          aValue = new Date(a.createdAt);
          bValue = new Date(b.createdAt);
          break;
        case 'user':
          aValue = a.user?.name || '';
          bValue = b.user?.name || '';
          break;
        default:
          aValue = a.id;
          bValue = b.id;
      }

      if (sortOrder === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

    setFilteredRequests(filtered);
  }, [requests, searchQuery, typeFilter, sortBy, sortOrder]);

  // Handle request actions
  const handleRequestAction = async (requestId: string, action: string) => {
    try {
      setActionLoading(true);
      const token = localStorage.getItem('token');

      let status = '';
      if (action === 'verify') status = 'approved';
      else if (action === 'reject') status = 'rejected';
      else return; // Ignore not implemented in backend yet or handled differently

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'https://jaifriend-backend.hgdjlive.com'}/api/verification/${requestId}/review`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ status })
      });

      if (!response.ok) {
        throw new Error('Failed to update request');
      }

      const updatedData = await response.json();
      console.log('Request updated:', updatedData);

      // Update local state
      setRequests(requests.map(r =>
        r._id === requestId ? { ...r, status: status as any } : r
      ));

      alert(`Request ${status} successfully`);
    } catch (error) {
      console.error(`Error ${action}ing request:`, error);
      alert(`Error updating request`);
    } finally {
      setActionLoading(false);
    }
  };

  // Handle bulk actions
  const handleBulkAction = async () => {
    if (selectedRequests.length === 0) return;

    // Bulk action not implemented in backend yet, so implementing loop for now
    // Ideally this should be a single API call
    if (!confirm(`Are you sure you want to ${bulkAction} ${selectedRequests.length} requests?`)) {
      return;
    }

    try {
      setActionLoading(true);
      const token = localStorage.getItem('token');
      const status = bulkAction === 'verify' ? 'approved' : 'rejected'; // Mapping verify->approved, ignore->rejected? or just support verify/reject

      // Process requests sequentially or parallel
      await Promise.all(selectedRequests.map(async (requestId) => {
        return fetch(`${process.env.NEXT_PUBLIC_API_URL || 'https://jaifriend-backend.hgdjlive.com'}/api/verification/${requestId}/review`, {
          method: 'PUT',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ status })
        });
      }));

      // Update local state
      setRequests(requests.map(r =>
        selectedRequests.includes(r._id)
          ? { ...r, status: status as any }
          : r
      ));
      setSelectedRequests([]);
      alert(`Bulk action completed successfully`);
    } catch (error) {
      console.error(`Error performing bulk ${bulkAction}:`, error);
      alert(`Error performing bulk action`);
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

  // Get type color
  const getTypeColor = (type: string) => {
    switch (type) {
      case 'Page':
        return 'text-blue-600 bg-blue-100';
      case 'Profile':
        return 'text-green-600 bg-green-100';
      case 'Business':
        return 'text-purple-600 bg-purple-100';
      case 'Document':
        return 'text-orange-600 bg-orange-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  // Handle sort
  const handleSort = (field: string) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('asc');
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
            <h1 className="text-lg font-semibold text-gray-800">Verification</h1>
            <div className="w-6" /> {/* Spacer for centering */}
          </div>
        </div>

        {/* Content */}
        <div className="p-4 lg:p-6">
          {/* Header */}
          <div className="mb-6">
            <div className="flex flex-col gap-4 mb-4">
              <div>
                <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-800 mb-2">Manage Verification Requests</h1>
                <div className="text-xs sm:text-sm text-gray-600">
                  Home {'>'} Users {'>'} <span className="text-red-500 font-semibold">Manage Verification Requests</span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => fetchVerificationRequests()}
                  disabled={loading}
                  className="flex items-center gap-1 px-3 py-1.5 bg-blue-600 text-white rounded text-sm hover:bg-blue-700 transition-colors disabled:opacity-50"
                >
                  <RefreshCw className={`w-3 h-3 ${loading ? 'animate-spin' : ''}`} />
                  <span className="hidden sm:inline">Refresh</span>
                </button>
                <button className="flex items-center gap-1 px-3 py-1.5 bg-green-600 text-white rounded text-sm hover:bg-green-700 transition-colors">
                  <Download className="w-3 h-3" />
                  <span className="hidden sm:inline">Export</span>
                </button>
              </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3 lg:gap-4">
              <div className="bg-white rounded-lg shadow-sm p-3 lg:p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs lg:text-sm text-gray-600">Total</p>
                    <p className="text-lg lg:text-xl font-bold text-gray-900">{stats.totalRequests}</p>
                  </div>
                  <UserCheck className="w-5 h-5 lg:w-6 lg:h-6 text-blue-500" />
                </div>
              </div>
              <div className="bg-white rounded-lg shadow-sm p-3 lg:p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs lg:text-sm text-gray-600">Pending</p>
                    <p className="text-lg lg:text-xl font-bold text-yellow-600">{stats.pendingRequests}</p>
                  </div>
                  <Clock className="w-5 h-5 lg:w-6 lg:h-6 text-yellow-500" />
                </div>
              </div>
              <div className="bg-white rounded-lg shadow-sm p-3 lg:p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs lg:text-sm text-gray-600">Approved</p>
                    <p className="text-lg lg:text-xl font-bold text-green-600">{stats.approvedRequests}</p>
                  </div>
                  <CheckCircle className="w-5 h-5 lg:w-6 lg:h-6 text-green-500" />
                </div>
              </div>
              <div className="bg-white rounded-lg shadow-sm p-3 lg:p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs lg:text-sm text-gray-600">Rejected</p>
                    <p className="text-lg lg:text-xl font-bold text-red-600">{stats.rejectedRequests}</p>
                  </div>
                  <XCircle className="w-5 h-5 lg:w-6 lg:h-6 text-red-500" />
                </div>
              </div>
              <div className="bg-white rounded-lg shadow-sm p-3 lg:p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs lg:text-sm text-gray-600">Ignored</p>
                    <p className="text-lg lg:text-xl font-bold text-gray-600">{stats.ignoredRequests}</p>
                  </div>
                  <UserX className="w-5 h-5 lg:w-6 lg:h-6 text-gray-500" />
                </div>
              </div>
              <div className="bg-white rounded-lg shadow-sm p-3 lg:p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs lg:text-sm text-gray-600">Pages</p>
                    <p className="text-lg lg:text-xl font-bold text-blue-600">{stats.pageRequests}</p>
                  </div>
                  <FileText className="w-5 h-5 lg:w-6 lg:h-6 text-blue-500" />
                </div>
              </div>
              <div className="bg-white rounded-lg shadow-sm p-3 lg:p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs lg:text-sm text-gray-600">Profiles</p>
                    <p className="text-lg lg:text-xl font-bold text-purple-600">{stats.profileRequests}</p>
                  </div>
                  <Users className="w-5 h-5 lg:w-6 lg:h-6 text-purple-500" />
                </div>
              </div>
            </div>
          </div>

          {/* Main Content Panel */}
          <div className="bg-white rounded-lg shadow-sm">
            {/* Panel Header */}
            <div className="p-4 lg:p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h2 className="text-lg lg:text-xl font-semibold text-gray-800">Manage Verification Requests</h2>
                {/* Mobile Select All */}
                <div className="lg:hidden flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={selectedRequests.length === filteredRequests.length && filteredRequests.length > 0}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setSelectedRequests(filteredRequests.map(request => request._id));
                      } else {
                        setSelectedRequests([]);
                      }
                    }}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-xs text-gray-600">Select All</span>
                </div>
              </div>
            </div>

            {/* Mobile Card View */}
            <div className="lg:hidden">
              {loading ? (
                <div className="p-8 text-center">
                  <div className="flex items-center justify-center">
                    <RefreshCw className="w-5 h-5 animate-spin text-blue-500 mr-2" />
                    <span className="text-sm">Loading verification requests...</span>
                  </div>
                </div>
              ) : filteredRequests.length === 0 ? (
                <div className="p-8 text-center text-gray-500 text-sm">
                  No verification requests found
                </div>
              ) : (
                <div className="divide-y divide-gray-200">
                  {filteredRequests.map((request) => (
                    <div key={request._id} className="p-4 hover:bg-gray-50">
                      <div className="flex items-start gap-3">
                        <input
                          type="checkbox"
                          checked={selectedRequests.includes(request._id)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSelectedRequests([...selectedRequests, request._id]);
                            } else {
                              setSelectedRequests(selectedRequests.filter(id => id !== request._id));
                            }
                          }}
                          className="mt-1 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-2 min-w-0">
                              <Flag className="w-4 h-4 text-orange-500 flex-shrink-0" />
                              <span className="text-sm font-medium text-gray-900 truncate">{request.user.name}</span>
                            </div>
                            <span className="text-xs text-gray-500 font-mono flex-shrink-0 ml-2">{request.id}</span>
                          </div>
                          <div className="mb-2">
                            <p className="text-sm text-gray-600 break-words">{request.information || '-'}</p>
                          </div>
                          <div className="flex items-center gap-2 flex-wrap mb-2">
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getTypeColor(request.type)}`}>
                              {request.type}
                            </span>
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${request.status === 'approved' ? 'bg-green-100 text-green-800' :
                              request.status === 'rejected' ? 'bg-red-100 text-red-800' :
                                'bg-yellow-100 text-yellow-800'
                              }`}>
                              {request.status.charAt(0).toUpperCase() + request.status.slice(1)}
                            </span>
                          </div>
                          {request.status === 'pending' && (
                            <div className="flex items-center gap-2 mt-3">
                              <button
                                onClick={() => handleRequestAction(request._id, 'verify')}
                                disabled={actionLoading}
                                className="flex-1 px-3 py-1.5 bg-green-600 text-white rounded text-xs font-medium hover:bg-green-700 transition-colors disabled:opacity-50"
                              >
                                Verify
                              </button>
                              <button
                                onClick={() => handleRequestAction(request._id, 'reject')}
                                disabled={actionLoading}
                                className="flex-1 px-3 py-1.5 bg-red-600 text-white rounded text-xs font-medium hover:bg-red-700 transition-colors disabled:opacity-50"
                              >
                                Reject
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Desktop Table View */}
            <div className="hidden lg:block overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-3 text-left">
                      <input
                        type="checkbox"
                        checked={selectedRequests.length === filteredRequests.length && filteredRequests.length > 0}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedRequests(filteredRequests.map(request => request._id));
                          } else {
                            setSelectedRequests([]);
                          }
                        }}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                    </th>
                    <th
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                      onClick={() => handleSort('id')}
                    >
                      <div className="flex items-center gap-1">
                        ID
                        {sortBy === 'id' && (
                          sortOrder === 'asc' ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />
                        )}
                      </div>
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      USER
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      INFORMATION
                    </th>
                    <th
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                      onClick={() => handleSort('type')}
                    >
                      <div className="flex items-center gap-1">
                        TYPE
                        {sortBy === 'type' && (
                          sortOrder === 'asc' ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />
                        )}
                      </div>
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      STATUS
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      ACTION
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {loading ? (
                    <tr>
                      <td colSpan={7} className="px-6 py-8 text-center">
                        <div className="flex items-center justify-center">
                          <RefreshCw className="w-5 h-5 animate-spin text-blue-500 mr-2" />
                          <span className="text-base">Loading verification requests...</span>
                        </div>
                      </td>
                    </tr>
                  ) : filteredRequests.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="px-6 py-8 text-center text-gray-500 text-base">
                        No verification requests found
                      </td>
                    </tr>
                  ) : (
                    filteredRequests.map((request) => (
                      <tr key={request._id} className="hover:bg-gray-50">
                        <td className="px-6 py-4">
                          <input
                            type="checkbox"
                            checked={selectedRequests.includes(request._id)}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setSelectedRequests([...selectedRequests, request._id]);
                              } else {
                                setSelectedRequests(selectedRequests.filter(id => id !== request._id));
                              }
                            }}
                            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                          />
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-900 font-medium">
                          {request.id}
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center">
                            <Flag className="w-4 h-4 text-orange-500 mr-2" />
                            <span className="text-sm text-gray-900">{request.user.name}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-600">
                          {request.information || '-'}
                        </td>
                        <td className="px-6 py-4">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getTypeColor(request.type)}`}>
                            {request.type}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${request.status === 'approved' ? 'bg-green-100 text-green-800' :
                            request.status === 'rejected' ? 'bg-red-100 text-red-800' :
                              'bg-yellow-100 text-yellow-800'
                            }`}>
                            {request.status.charAt(0).toUpperCase() + request.status.slice(1)}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            {request.status === 'pending' && (
                              <>
                                <button
                                  onClick={() => handleRequestAction(request._id, 'verify')}
                                  disabled={actionLoading}
                                  className="px-3 py-1 bg-green-600 text-white rounded text-xs hover:bg-green-700 transition-colors disabled:opacity-50"
                                >
                                  Verify
                                </button>
                                <button
                                  onClick={() => handleRequestAction(request._id, 'reject')}
                                  disabled={actionLoading}
                                  className="px-3 py-1 bg-red-600 text-white rounded text-xs hover:bg-red-700 transition-colors disabled:opacity-50"
                                >
                                  Reject
                                </button>
                              </>
                            )}
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
              <div className="flex flex-col gap-4">
                {/* Top Row: Results Count and Pagination */}
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                  <div className="text-sm text-gray-700">
                    Showing {filteredRequests.length} out of {stats.totalRequests}
                  </div>

                  {/* Pagination */}
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => setCurrentPage(1)}
                      disabled={currentPage === 1}
                      className="p-2 text-gray-400 hover:text-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
                      title="First page"
                    >
                      <ChevronsLeft className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => setCurrentPage(currentPage - 1)}
                      disabled={currentPage === 1}
                      className="p-2 text-gray-400 hover:text-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
                      title="Previous page"
                    >
                      <ChevronUp className="w-4 h-4 rotate-90" />
                    </button>
                    <span className="px-3 py-1 text-sm text-gray-700 bg-blue-600 text-white rounded-full">
                      {currentPage}
                    </span>
                    <button
                      onClick={() => setCurrentPage(currentPage + 1)}
                      disabled={currentPage === totalPages}
                      className="p-2 text-gray-400 hover:text-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
                      title="Next page"
                    >
                      <ChevronDown className="w-4 h-4 -rotate-90" />
                    </button>
                    <button
                      onClick={() => setCurrentPage(totalPages)}
                      disabled={currentPage === totalPages}
                      className="p-2 text-gray-400 hover:text-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
                      title="Last page"
                    >
                      <ChevronsRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Bottom Row: Bulk Actions */}
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 pt-3 border-t border-gray-200 lg:border-t-0 lg:pt-0">
                  <label className="text-sm font-medium text-gray-700 flex-shrink-0">Action:</label>
                  <div className="flex flex-col sm:flex-row gap-2 flex-1">
                    <select
                      value={bulkAction}
                      onChange={(e) => setBulkAction(e.target.value)}
                      className="flex-1 sm:flex-initial px-3 py-2 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                    >
                      <option value="verify">Verify</option>
                      <option value="reject">Reject</option>
                    </select>
                    <button
                      onClick={handleBulkAction}
                      disabled={selectedRequests.length === 0 || actionLoading}
                      className="w-full sm:w-auto px-4 py-2 bg-blue-600 text-white rounded text-sm font-medium hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Apply
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VerificationRequestsPage; 
