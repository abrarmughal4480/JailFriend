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

  // Fetch verification requests from API (mock implementation)
  const fetchVerificationRequests = async (page = 1) => {
    try {
      setLoading(true);
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setRequests(mockRequests);
      setFilteredRequests(mockRequests);
      setCurrentPage(1);
      setTotalPages(1);
      
      // Calculate stats
      const totalRequests = mockRequests.length;
      const pendingRequests = mockRequests.filter(r => r.status === 'pending').length;
      const approvedRequests = mockRequests.filter(r => r.status === 'approved').length;
      const rejectedRequests = mockRequests.filter(r => r.status === 'rejected').length;
      const ignoredRequests = mockRequests.filter(r => r.status === 'ignored').length;
      const pageRequests = mockRequests.filter(r => r.type === 'Page').length;
      const profileRequests = mockRequests.filter(r => r.type === 'Profile').length;
      
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
        request.user.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        request.user.username?.toLowerCase().includes(searchQuery.toLowerCase()) ||
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
          aValue = a.user.name;
          bValue = b.user.name;
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
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500));
      
      if (action === 'verify') {
        setRequests(requests.map(r => 
          r._id === requestId ? { ...r, status: 'approved' } : r
        ));
        alert('Request verified successfully');
      } else if (action === 'ignore') {
        setRequests(requests.map(r => 
          r._id === requestId ? { ...r, status: 'ignored' } : r
        ));
        alert('Request ignored successfully');
      } else if (action === 'reject') {
        setRequests(requests.map(r => 
          r._id === requestId ? { ...r, status: 'rejected' } : r
        ));
        alert('Request rejected successfully');
      }
    } catch (error) {
      console.error(`Error ${action}ing request:`, error);
      alert(`Error ${action}ing request`);
    } finally {
      setActionLoading(false);
    }
  };

  // Handle bulk actions
  const handleBulkAction = async () => {
    if (selectedRequests.length === 0) return;

    try {
      setActionLoading(true);
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setRequests(requests.map(r => 
        selectedRequests.includes(r._id) 
          ? { ...r, status: bulkAction === 'verify' ? 'approved' : 'ignored' }
          : r
      ));
      setSelectedRequests([]);
      alert(`Bulk ${bulkAction} completed successfully`);
    } catch (error) {
      console.error(`Error performing bulk ${bulkAction}:`, error);
      alert(`Error performing bulk ${bulkAction}`);
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
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-4">
              <div>
                <h1 className="text-2xl lg:text-3xl font-bold text-gray-800 mb-2">Manage Verification Reqeusts</h1>
                <div className="text-sm text-gray-600">
                  Home {'>'} Users {'>'} <span className="text-red-500 font-semibold">Manage Verification Reqeusts</span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => fetchVerificationRequests(currentPage)}
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
                <h2 className="text-lg lg:text-xl font-semibold text-gray-800">Manage Verification Reqeusts</h2>
              </div>
            </div>

            {/* Verification Requests Table */}
            <div className="overflow-x-auto">
              <table className="w-full min-w-[800px]">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-3 lg:px-6 py-3 text-left">
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
                      className="px-3 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                      onClick={() => handleSort('id')}
                    >
                      <div className="flex items-center gap-1">
                        ID
                        {sortBy === 'id' && (
                          sortOrder === 'asc' ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />
                        )}
                      </div>
                    </th>
                    <th className="px-3 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      USER
                    </th>
                    <th className="px-3 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      INFORMATION
                    </th>
                    <th 
                      className="px-3 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                      onClick={() => handleSort('type')}
                    >
                      <div className="flex items-center gap-1">
                        TYPE
                        {sortBy === 'type' && (
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
                      <td colSpan={6} className="px-3 lg:px-6 py-8 text-center">
                        <div className="flex items-center justify-center">
                          <RefreshCw className="w-5 h-5 animate-spin text-blue-500 mr-2" />
                          <span className="text-sm lg:text-base">Loading verification requests...</span>
                        </div>
                      </td>
                    </tr>
                  ) : filteredRequests.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="px-3 lg:px-6 py-8 text-center text-gray-500 text-sm lg:text-base">
                        No verification requests found
                      </td>
                    </tr>
                  ) : (
                    filteredRequests.map((request) => (
                      <tr key={request._id} className="hover:bg-gray-50">
                        <td className="px-3 lg:px-6 py-3 lg:py-4">
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
                        <td className="px-3 lg:px-6 py-3 lg:py-4 text-sm text-gray-900 font-medium">
                          {request.id}
                        </td>
                        <td className="px-3 lg:px-6 py-3 lg:py-4">
                          <div className="flex items-center">
                            <Flag className="w-4 h-4 text-orange-500 mr-2" />
                            <span className="text-sm text-gray-900">{request.user.name}</span>
                          </div>
                        </td>
                        <td className="px-3 lg:px-6 py-3 lg:py-4 text-sm text-gray-600">
                          {request.information || '-'}
                        </td>
                        <td className="px-3 lg:px-6 py-3 lg:py-4">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getTypeColor(request.type)}`}>
                            {request.type}
                          </span>
                        </td>
                        <td className="px-3 lg:px-6 py-3 lg:py-4">
                          <div className="flex items-center gap-1 lg:gap-2">
                            <button
                              onClick={() => handleRequestAction(request._id, 'verify')}
                              disabled={actionLoading}
                              className="px-3 py-1 bg-green-600 text-white rounded text-xs hover:bg-green-700 transition-colors disabled:opacity-50"
                            >
                              Verify
                            </button>
                            <button
                              onClick={() => handleRequestAction(request._id, 'ignore')}
                              disabled={actionLoading}
                              className="px-3 py-1 bg-red-600 text-white rounded text-xs hover:bg-red-700 transition-colors disabled:opacity-50"
                            >
                              Ignore
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
                    Showing {filteredRequests.length} out of {stats.totalRequests}
                  </div>
                  
                  {/* Bulk Actions */}
                  <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2">
                    <label className="text-sm font-medium text-gray-700">Action:</label>
                    <select
                      value={bulkAction}
                      onChange={(e) => setBulkAction(e.target.value)}
                      className="px-3 py-1 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                    >
                      <option value="verify">Verify</option>
                      <option value="ignore">Ignore</option>
                      <option value="reject">Reject</option>
                    </select>
                    <button
                      onClick={handleBulkAction}
                      disabled={selectedRequests.length === 0 || actionLoading}
                      className="px-4 py-1 bg-blue-500 text-white rounded text-sm hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Submit
                    </button>
                  </div>
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
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VerificationRequestsPage; 
