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
  MessageSquare
} from 'lucide-react';

interface UserStory {
  _id: string;
  id: number;
  title: string;
  description: string;
  owner: {
    _id: string;
    name: string;
    username: string;
    avatar: string;
  };
  status: 'active' | 'expired' | 'pending' | 'completed';
  expiresAt: string;
  createdAt: string;
  updatedAt: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  category: string;
  tags: string[];
  views: number;
  likes: number;
  comments: number;
}

interface UserStoryStats {
  totalStories: number;
  activeStories: number;
  expiredStories: number;
  pendingStories: number;
  completedStories: number;
  totalViews: number;
  totalLikes: number;
}

const UserStoriesPage = () => {
  const [stories, setStories] = useState<UserStory[]>([]);
  const [filteredStories, setFilteredStories] = useState<UserStory[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<UserStoryStats>({
    totalStories: 0,
    activeStories: 0,
    expiredStories: 0,
    pendingStories: 0,
    completedStories: 0,
    totalViews: 0,
    totalLikes: 0
  });
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [sortBy, setSortBy] = useState('id');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedStories, setSelectedStories] = useState<string[]>([]);
  const [selectedStory, setSelectedStory] = useState<UserStory | null>(null);
  const [showStoryModal, setShowStoryModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('stories');

  // Mock data for demonstration
  const mockStories: UserStory[] = [
    {
      _id: '1',
      id: 6,
      title: 'User Story 6',
      description: 'This is a user story description',
      owner: {
        _id: 'user1',
        name: 'Vicky bedardi yadav',
        username: 'vickybedardi',
        avatar: '/avatars/1.png.png'
      },
      status: 'active',
      expiresAt: '2025-06-26T00:00:00.000Z',
      createdAt: '2024-01-15T00:00:00.000Z',
      updatedAt: '2024-01-15T00:00:00.000Z',
      priority: 'high',
      category: 'Feature',
      tags: ['frontend', 'ui'],
      views: 150,
      likes: 25,
      comments: 8
    },
    {
      _id: '2',
      id: 5,
      title: 'User Story 5',
      description: 'Another user story description',
      owner: {
        _id: 'user2',
        name: 'Priyanshuoffice',
        username: 'priyanshu',
        avatar: '/avatars/2.png.png'
      },
      status: 'active',
      expiresAt: '2025-06-24T00:00:00.000Z',
      createdAt: '2024-01-14T00:00:00.000Z',
      updatedAt: '2024-01-14T00:00:00.000Z',
      priority: 'medium',
      category: 'Bug',
      tags: ['backend', 'api'],
      views: 89,
      likes: 12,
      comments: 3
    },
    {
      _id: '3',
      id: 4,
      title: 'User Story 4',
      description: 'Third user story description',
      owner: {
        _id: 'user3',
        name: 'Nofs Tracksuit',
        username: 'nofs',
        avatar: '/avatars/3.png.png'
      },
      status: 'expired',
      expiresAt: '2025-06-19T00:00:00.000Z',
      createdAt: '2024-01-13T00:00:00.000Z',
      updatedAt: '2024-01-13T00:00:00.000Z',
      priority: 'low',
      category: 'Enhancement',
      tags: ['mobile', 'responsive'],
      views: 234,
      likes: 45,
      comments: 15
    },
    {
      _id: '4',
      id: 3,
      title: 'User Story 3',
      description: 'Fourth user story description',
      owner: {
        _id: 'user3',
        name: 'Nofs Tracksuit',
        username: 'nofs',
        avatar: '/avatars/3.png.png'
      },
      status: 'expired',
      expiresAt: '2025-06-19T00:00:00.000Z',
      createdAt: '2024-01-12T00:00:00.000Z',
      updatedAt: '2024-01-12T00:00:00.000Z',
      priority: 'urgent',
      category: 'Security',
      tags: ['security', 'authentication'],
      views: 567,
      likes: 89,
      comments: 23
    },
    {
      _id: '5',
      id: 2,
      title: 'User Story 2',
      description: 'Fifth user story description',
      owner: {
        _id: 'user4',
        name: 'Mukesh abc',
        username: 'mukesh',
        avatar: '/avatars/4.png.png'
      },
      status: 'completed',
      expiresAt: '2025-04-12T00:00:00.000Z',
      createdAt: '2024-01-11T00:00:00.000Z',
      updatedAt: '2024-01-11T00:00:00.000Z',
      priority: 'medium',
      category: 'Documentation',
      tags: ['docs', 'guide'],
      views: 123,
      likes: 18,
      comments: 5
    }
  ];

  // Fetch stories from API (mock implementation)
  const fetchStories = async (page = 1) => {
    try {
      setLoading(true);
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setStories(mockStories);
      setFilteredStories(mockStories);
      setCurrentPage(1);
      setTotalPages(1);
      
      // Calculate stats
      const totalStories = mockStories.length;
      const activeStories = mockStories.filter(s => s.status === 'active').length;
      const expiredStories = mockStories.filter(s => s.status === 'expired').length;
      const pendingStories = mockStories.filter(s => s.status === 'pending').length;
      const completedStories = mockStories.filter(s => s.status === 'completed').length;
      const totalViews = mockStories.reduce((sum, s) => sum + s.views, 0);
      const totalLikes = mockStories.reduce((sum, s) => sum + s.likes, 0);
      
      setStats({
        totalStories,
        activeStories,
        expiredStories,
        pendingStories,
        completedStories,
        totalViews,
        totalLikes
      });
    } catch (error) {
      console.error('Error fetching stories:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStories();
  }, []);

  // Filter and search stories
  useEffect(() => {
    let filtered = stories;

    if (searchQuery) {
      filtered = filtered.filter(story =>
        story.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        story.owner.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        story.owner.username?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        story.description?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    switch (statusFilter) {
      case 'active':
        filtered = filtered.filter(story => story.status === 'active');
        break;
      case 'expired':
        filtered = filtered.filter(story => story.status === 'expired');
        break;
      case 'pending':
        filtered = filtered.filter(story => story.status === 'pending');
        break;
      case 'completed':
        filtered = filtered.filter(story => story.status === 'completed');
        break;
    }

    // Sort stories
    filtered.sort((a, b) => {
      let aValue: any, bValue: any;
      
      switch (sortBy) {
        case 'id':
          aValue = a.id;
          bValue = b.id;
          break;
        case 'expiresAt':
          aValue = new Date(a.expiresAt);
          bValue = new Date(b.expiresAt);
          break;
        case 'createdAt':
          aValue = new Date(a.createdAt);
          bValue = new Date(b.createdAt);
          break;
        case 'owner':
          aValue = a.owner.name;
          bValue = b.owner.name;
          break;
        case 'status':
          aValue = a.status;
          bValue = b.status;
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

    setFilteredStories(filtered);
  }, [stories, searchQuery, statusFilter, sortBy, sortOrder]);

  // Handle story actions
  const handleStoryAction = async (storyId: string, action: string) => {
    try {
      setActionLoading(true);
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500));
      
      if (action === 'delete') {
        setStories(stories.filter(s => s._id !== storyId));
        alert('Story deleted successfully');
      } else {
        alert(`Story ${action} successfully`);
      }
    } catch (error) {
      console.error(`Error ${action}ing story:`, error);
      alert(`Error ${action}ing story`);
    } finally {
      setActionLoading(false);
    }
  };

  // Handle bulk actions
  const handleBulkAction = async (action: string) => {
    if (selectedStories.length === 0) return;

    try {
      setActionLoading(true);
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      if (action === 'delete') {
        setStories(stories.filter(s => !selectedStories.includes(s._id)));
        setSelectedStories([]);
        alert('Selected stories deleted successfully');
      } else {
        alert(`Bulk ${action} completed successfully`);
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
      month: '2-digit',
      day: '2-digit'
    }).replace(/\//g, '/');
  };

  // Get time ago
  const getTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInWeeks = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24 * 7));
    return `${diffInWeeks} w`;
  };

  // Get status color
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'text-green-600 bg-green-100';
      case 'expired':
        return 'text-red-600 bg-red-100';
      case 'pending':
        return 'text-yellow-600 bg-yellow-100';
      case 'completed':
        return 'text-blue-600 bg-blue-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  // Get status text
  const getStatusText = (status: string) => {
    switch (status) {
      case 'active':
        return 'Active';
      case 'expired':
        return 'Expired';
      case 'pending':
        return 'Pending';
      case 'completed':
        return 'Completed';
      default:
        return 'Unknown';
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
      {/* Main Content */}
      <div className="lg:ml-64">
        {/* Mobile Header */}
        <div className="lg:hidden bg-white shadow-sm border-b border-gray-200">
          <div className="flex items-center justify-between px-4 py-3">
            <button
              onClick={() => setSidebarOpen(true)}
              className="p-2 text-gray-400 hover:text-gray-600"
            >
              <Menu className="w-6 h-6" />
            </button>
            <h1 className="text-lg font-semibold text-gray-800">User Stories</h1>
            <div className="w-6" /> {/* Spacer for centering */}
          </div>
        </div>

        {/* Content */}
        <div className="p-4 lg:p-6">
          {/* Header */}
          <div className="mb-6">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-4">
              <div>
                <h1 className="text-2xl lg:text-3xl font-bold text-gray-800 mb-2">Manage User Stories / Status</h1>
                <div className="text-sm text-gray-600">
                  Home {'>'} Users {'>'} <span className="text-red-500 font-semibold">Manage User Stories / Status</span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => fetchStories(currentPage)}
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
                    <p className="text-lg lg:text-xl font-bold text-gray-900">{stats.totalStories}</p>
                  </div>
                  <FileText className="w-5 h-5 lg:w-6 lg:h-6 text-blue-500" />
                </div>
              </div>
              <div className="bg-white rounded-lg shadow-sm p-3 lg:p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs lg:text-sm text-gray-600">Active</p>
                    <p className="text-lg lg:text-xl font-bold text-green-600">{stats.activeStories}</p>
                  </div>
                  <CheckCircle className="w-5 h-5 lg:w-6 lg:h-6 text-green-500" />
                </div>
              </div>
              <div className="bg-white rounded-lg shadow-sm p-3 lg:p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs lg:text-sm text-gray-600">Expired</p>
                    <p className="text-lg lg:text-xl font-bold text-red-600">{stats.expiredStories}</p>
                  </div>
                  <XCircle className="w-5 h-5 lg:w-6 lg:h-6 text-red-500" />
                </div>
              </div>
              <div className="bg-white rounded-lg shadow-sm p-3 lg:p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs lg:text-sm text-gray-600">Pending</p>
                    <p className="text-lg lg:text-xl font-bold text-yellow-600">{stats.pendingStories}</p>
                  </div>
                  <Clock className="w-5 h-5 lg:w-6 lg:h-6 text-yellow-500" />
                </div>
              </div>
              <div className="bg-white rounded-lg shadow-sm p-3 lg:p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs lg:text-sm text-gray-600">Completed</p>
                    <p className="text-lg lg:text-xl font-bold text-blue-600">{stats.completedStories}</p>
                  </div>
                  <UserCheck className="w-5 h-5 lg:w-6 lg:h-6 text-blue-500" />
                </div>
              </div>
              <div className="bg-white rounded-lg shadow-sm p-3 lg:p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs lg:text-sm text-gray-600">Views</p>
                    <p className="text-lg lg:text-xl font-bold text-purple-600">{stats.totalViews}</p>
                  </div>
                  <Eye className="w-5 h-5 lg:w-6 lg:h-6 text-purple-500" />
                </div>
              </div>
              <div className="bg-white rounded-lg shadow-sm p-3 lg:p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs lg:text-sm text-gray-600">Likes</p>
                    <p className="text-lg lg:text-xl font-bold text-pink-600">{stats.totalLikes}</p>
                  </div>
                  <Crown className="w-5 h-5 lg:w-6 lg:h-6 text-pink-500" />
                </div>
              </div>
            </div>
          </div>

          {/* Main Content Panel */}
          <div className="bg-white rounded-lg shadow-sm">
            {/* Panel Header */}
            <div className="p-4 lg:p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h2 className="text-lg lg:text-xl font-semibold text-gray-800">Manage User Stories / Status</h2>
                <button className="px-3 py-1.5 bg-gray-100 text-gray-700 rounded text-sm hover:bg-gray-200 transition-colors">
                  All
                </button>
              </div>
            </div>

            {/* Stories Table */}
            <div className="overflow-x-auto">
              <table className="w-full min-w-[800px]">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-3 lg:px-6 py-3 text-left">
                      <input
                        type="checkbox"
                        checked={selectedStories.length === filteredStories.length && filteredStories.length > 0}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedStories(filteredStories.map(story => story._id));
                          } else {
                            setSelectedStories([]);
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
                    <th 
                      className="px-3 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                      onClick={() => handleSort('expiresAt')}
                    >
                      <div className="flex items-center gap-1">
                        EXPIRES
                        {sortBy === 'expiresAt' && (
                          sortOrder === 'asc' ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />
                        )}
                      </div>
                    </th>
                    <th className="px-3 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      OWNER
                    </th>
                    <th 
                      className="px-3 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                      onClick={() => handleSort('createdAt')}
                    >
                      <div className="flex items-center gap-1">
                        TIME
                        {sortBy === 'createdAt' && (
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
                          <span className="text-sm lg:text-base">Loading stories...</span>
                        </div>
                      </td>
                    </tr>
                  ) : filteredStories.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="px-3 lg:px-6 py-8 text-center text-gray-500 text-sm lg:text-base">
                        No stories found
                      </td>
                    </tr>
                  ) : (
                    filteredStories.map((story) => (
                      <tr key={story._id} className="hover:bg-gray-50">
                        <td className="px-3 lg:px-6 py-3 lg:py-4">
                          <input
                            type="checkbox"
                            checked={selectedStories.includes(story._id)}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setSelectedStories([...selectedStories, story._id]);
                              } else {
                                setSelectedStories(selectedStories.filter(id => id !== story._id));
                              }
                            }}
                            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                          />
                        </td>
                        <td className="px-3 lg:px-6 py-3 lg:py-4 text-sm text-gray-900 font-medium">
                          {story.id}
                        </td>
                        <td className="px-3 lg:px-6 py-3 lg:py-4 text-sm text-gray-900">
                          {formatDate(story.expiresAt)}
                        </td>
                        <td className="px-3 lg:px-6 py-3 lg:py-4">
                          <div className="flex items-center">
                            <img
                              src={story.owner.avatar} onError={(e) => { console.log('❌ Avatar load failed for user:', story.owner.avatar); e.currentTarget.src = '/default-avatar.svg'; }}
                              alt={story.owner.name}
                              className="w-8 h-8 rounded-full object-cover mr-2"
                            />
                            <span className="text-sm text-gray-900">{story.owner.name}</span>
                          </div>
                        </td>
                        <td className="px-3 lg:px-6 py-3 lg:py-4 text-sm text-gray-600">
                          {getTimeAgo(story.createdAt)}
                        </td>
                        <td className="px-3 lg:px-6 py-3 lg:py-4">
                          <button
                            onClick={() => handleStoryAction(story._id, 'delete')}
                            disabled={actionLoading}
                            className="px-3 py-1 bg-red-600 text-white rounded text-xs hover:bg-red-700 transition-colors disabled:opacity-50"
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

            {/* Pagination and Bulk Actions */}
            <div className="p-4 lg:p-6 border-t border-gray-200">
              <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                  <div className="text-sm text-gray-700">
                    Showing {filteredStories.length} out of {stats.totalStories}
                  </div>
                  
                  {/* Bulk Actions */}
                  {selectedStories.length > 0 && (
                    <button
                      onClick={() => handleBulkAction('delete')}
                      disabled={actionLoading}
                      className="px-4 py-1 bg-red-600 text-white rounded text-sm hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Delete Selected
                    </button>
                  )}
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

export default UserStoriesPage; 
