"use client";
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://jaifriend-backend.hgdjlive.com';
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Plus, Search, Filter, Users, Settings, MessageCircle, Calendar, MapPin, Globe, Lock, Eye, EyeOff, UserPlus, UserMinus, Crown, Shield, Trash2, Edit3, MoreHorizontal, ChevronDown, Check, X, Star, Heart, Share2, Bookmark, Flag, Bell, BellOff, Menu as MenuIcon, ArrowLeft, FileText, Upload, Smile } from 'lucide-react';
import { getCurrentUserId } from '@/utils/auth';
import { useDarkMode } from '@/contexts/DarkModeContext';

interface FormData {
  name: string;
  description: string;
  privacy: string;
  category: string;
  website?: string;
  email?: string;
  phone?: string;
  location?: string;
  tags?: string;
  url?: string;
}

interface Group {
  _id: string;
  name: string;
  description: string;
  category: string;
  privacy: 'public' | 'private' | 'secret';
  avatar?: string;
  coverPhoto?: string;
  creator: {
    _id: string;
    name: string;
    username?: string;
    avatar?: string;
  };
  members: Array<{
    user: {
      _id: string;
      name: string;
      username?: string;
      avatar?: string;
    };
    role: 'member' | 'moderator' | 'admin';
    joinedAt: string;
    isActive: boolean;
  }>;
  stats: {
    memberCount: number;
    postCount: number;
    eventCount: number;
  };
  isActive: boolean;
  website?: string;
  email?: string;
  phone?: string;
  location?: string | { name: string; coordinates?: { latitude: number; longitude: number } };
  tags?: string[];
  createdAt: string;
  updatedAt: string;
}

const GroupsPage: React.FC = () => {
  const router = useRouter();
  const { isDarkMode } = useDarkMode();
  const [activeTab, setActiveTab] = useState<string>('My Groups');
  const [showCreateModal, setShowCreateModal] = useState<boolean>(false);
  const [showEditModal, setShowEditModal] = useState<boolean>(false);
  const [editingGroup, setEditingGroup] = useState<Group | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState<boolean>(false);
  const [formData, setFormData] = useState<FormData>({
    name: '',
    description: '',
    privacy: 'public',
    category: 'general',
    website: '',
    email: '',
    phone: '',
    location: '',
    tags: '',
    url: ''
  });

  const tabs: string[] = ['My Groups', 'Suggested groups', 'Joined Groups'];

  // Empty groups data - will be populated from API
  const [groups, setGroups] = useState<Group[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [creating, setCreating] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  // Fetch groups from API
  const fetchGroups = async (isRefresh = false) => {
    try {
      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }
      console.log('Fetching groups...');
      
      const token = localStorage.getItem('token');
      
      if (!token) {
        console.log('No token found');
        setLoading(false);
        setRefreshing(false);
        return;
      }

  const apiUrl = `${API_URL}/api/groups`;

      const response = await fetch(apiUrl, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      console.log('Groups response status:', response.status);

      if (response.ok) {
        const groupsData = await response.json();
        console.log('📊 Groups fetched:', groupsData.length);
        console.log('📊 Groups data:', groupsData);
        setGroups(groupsData);
      } else {
        console.error('Failed to fetch groups:', response.status);
        const errorText = await response.text();
        console.error('Error response:', errorText);
        setGroups([]);
      }
    } catch (error) {
      console.error('Error fetching groups:', error);
      setGroups([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchGroups();
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>): void => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleCreateGroup = async (): Promise<void> => {
    try {
      setCreating(true);
      console.log('Creating group with data:', formData);
      
      const token = localStorage.getItem('token');
      if (!token) {
        console.log('No token found for group creation');
        alert('Please log in to create a group');
        return;
      }

      // Validate required fields
      if (!formData.name.trim()) {
        console.log('Group name is required');
        alert('Group name is required');
        return;
      }



      const formDataToSend = new FormData();
      formDataToSend.append('name', formData.name.trim());
      formDataToSend.append('description', formData.description || '');
      formDataToSend.append('privacy', formData.privacy);
      formDataToSend.append('category', formData.category);
      if (formData.website) formDataToSend.append('website', formData.website);
      if (formData.email) formDataToSend.append('email', formData.email);
      if (formData.phone) formDataToSend.append('phone', formData.phone);
      if (formData.location) {
        // Convert location string to object for the API
        const locationObj = { name: formData.location };
        formDataToSend.append('location', JSON.stringify(locationObj));
      }
      if (formData.tags) {
        // Convert comma-separated string to array for the API
        const tagsArray = formData.tags.split(',').map(tag => tag.trim()).filter(tag => tag.length > 0);
        formDataToSend.append('tags', JSON.stringify(tagsArray));
      }

  const apiUrl = `${API_URL}/api/groups`;

      console.log('Sending group creation request to:', apiUrl);

  const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formDataToSend
      });

      console.log('Group creation response status:', response.status);

      if (response.ok) {
        const newGroup = await response.json();
        console.log('Group created successfully:', newGroup);
        
        // Add the new group to the beginning of the list
        setGroups(prev => [newGroup, ...prev]);
        
        setShowCreateModal(false);
        setFormData({
          name: '',
          description: '',
          privacy: 'public',
          category: 'general',
          website: '',
          email: '',
          phone: '',
          location: '',
          tags: '',
          url: ''
        });
        
        // Show success message
        setSuccessMessage('Group created successfully!');
        setShowSuccessMessage(true);
        
        // Hide success message after 3 seconds
        setTimeout(() => {
          setShowSuccessMessage(false);
        }, 3000);
        
       
      } else {
        console.error('Failed to create group:', response.status);
        let errorMessage = 'Failed to create group. Please try again.';
        
        try {
          const errorData = await response.json();
        console.error('Error details:', errorData);
          errorMessage = errorData.error || errorData.message || errorMessage;
        } catch (parseError) {
          console.error('Failed to parse error response:', parseError);
          const errorText = await response.text();
          console.error('Raw error response:', errorText);
        }
        
        alert(errorMessage);
      }
    } catch (error) {
      console.error('Error creating group:', error);
      alert('Network error occurred. Please check your connection and try again.');
    } finally {
      setCreating(false);
    }
  };

  const handleCancel = (): void => {
    setShowCreateModal(false);
    setFormData({
      name: '',
      description: '',
      privacy: 'public',
      category: 'general',
      website: '',
      email: '',
      phone: '',
      location: '',
      tags: '',
      url: ''
    });
  };

  const handleLeaveGroup = async (groupId: string) => {
    if (!confirm('Are you sure you want to leave this group?')) return;
    
    try {
      console.log('Leaving group:', groupId);
      
      const token = localStorage.getItem('token');
      if (!token) {
        console.log('No token found for leaving group');
        alert('Please log in to leave groups');
        return;
      }

  const response = await fetch(`${API_URL}/api/groups/${groupId}/leave`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      console.log('Leave group response status:', response.status);

      if (response.ok) {
        console.log('Successfully left group');
        
        // Show success message
        setSuccessMessage('Successfully left the group!');
        setShowSuccessMessage(true);
        
        // Hide success message after 3 seconds
        setTimeout(() => {
          setShowSuccessMessage(false);
        }, 3000);
        
        // Refresh groups to update the UI
  const groupsResponse = await fetch(`${API_URL}/api/groups`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        if (groupsResponse.ok) {
          const updatedGroups = await groupsResponse.json();
          setGroups(updatedGroups);
        }
      } else {
        console.error('Failed to leave group:', response.status);
        let errorMessage = 'Failed to leave group. Please try again.';
        
        try {
          const errorData = await response.json();
          errorMessage = errorData.error || errorData.message || errorMessage;
        } catch (parseError) {
          console.error('Failed to parse error response:', parseError);
        }
        
        alert(errorMessage);
      }
    } catch (error) {
      console.error('Error leaving group:', error);
      alert('Network error occurred. Please check your connection and try again.');
    }
  };

  const handleJoinGroup = async (groupId: string) => {
    try {
      console.log('Joining group:', groupId);
      
      const token = localStorage.getItem('token');
      if (!token) {
        console.log('No token found for joining group');
        alert('Please log in to join groups');
        return;
      }

  const response = await fetch(`${API_URL}/api/groups/${groupId}/join`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      console.log('Join group response status:', response.status);

      if (response.ok) {
        console.log('Successfully joined group');
        
        // Show success message
        setSuccessMessage('Successfully joined the group!');
        setShowSuccessMessage(true);
        
        // Hide success message after 3 seconds
        setTimeout(() => {
          setShowSuccessMessage(false);
        }, 3000);
        
        // Refresh groups to update the UI
          const groupsResponse = await fetch(`${API_URL}/api/groups`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        if (groupsResponse.ok) {
          const updatedGroups = await groupsResponse.json();
          setGroups(updatedGroups);
        }
      } else {
        console.error('Failed to join group:', response.status);
        let errorMessage = 'Failed to join group. Please try again.';
        
        try {
          const errorData = await response.json();
          errorMessage = errorData.error || errorData.message || errorMessage;
        } catch (parseError) {
          console.error('Failed to parse error response:', parseError);
        }
        
        alert(errorMessage);
      }
    } catch (error) {
      console.error('Error joining group:', error);
      alert('Network error occurred. Please check your connection and try again.');
    }
  };

  const handleEditGroup = (group: Group) => {
    console.log('Editing group:', group);
    setEditingGroup(group);
    setFormData({
      name: group.name,
      description: group.description,
      privacy: group.privacy,
      category: group.category,
      website: group.website || '',
      email: group.email || '',
      phone: group.phone || '',
      location: typeof group.location === 'object' ? group.location.name : (group.location || ''),
      tags: group.tags && Array.isArray(group.tags) ? group.tags.join(', ') : ''
    });
    setShowEditModal(true);
  };

  const handleUpdateGroup = async () => {
    if (!editingGroup) return;
    
    try {
      console.log('Updating group:', editingGroup._id);
      
      const token = localStorage.getItem('token');
      if (!token) {
        console.log('No token found for updating group');
        return;
      }

      const formDataToSend = new FormData();
      formDataToSend.append('name', formData.name);
      formDataToSend.append('description', formData.description);
      formDataToSend.append('privacy', formData.privacy);
      formDataToSend.append('category', formData.category);
      if (formData.website) formDataToSend.append('website', formData.website);
      if (formData.email) formDataToSend.append('email', formData.email);
      if (formData.phone) formDataToSend.append('phone', formData.phone);
      if (formData.location) {
        // Convert location string to object for the API
        const locationObj = { name: formData.location };
        formDataToSend.append('location', JSON.stringify(locationObj));
      }
      if (formData.tags) {
        // Convert comma-separated string back to array for the API
        const tagsArray = formData.tags.split(',').map(tag => tag.trim()).filter(tag => tag.length > 0);
        formDataToSend.append('tags', JSON.stringify(tagsArray));
      }

  const response = await fetch(`${API_URL}/api/groups/${editingGroup._id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formDataToSend
      });

      console.log('Update group response status:', response.status);

      if (response.ok) {
        const updatedGroup = await response.json();
        console.log('Group updated successfully:', updatedGroup);
        setGroups(prev => prev.map(g => g._id === editingGroup._id ? updatedGroup : g));
        setShowEditModal(false);
        setEditingGroup(null);
        setFormData({
          name: '',
          description: '',
          privacy: 'public',
          category: 'general',
          website: '',
          email: '',
          phone: '',
          location: '',
          tags: '',
          url: ''
        });
        alert('Group updated successfully!');
      } else {
        console.error('Failed to update group:', response.status);
        alert('Failed to update group. Please try again.');
      }
    } catch (error) {
      console.error('Error updating group:', error);
    }
  };

  const handleDeleteGroup = async (groupId: string) => {
    if (!confirm('Are you sure you want to delete this group?')) return;
    
    try {
      console.log('Deleting group:', groupId);
      
      const token = localStorage.getItem('token');
      if (!token) {
        console.log('No token found for deleting group');
        return;
      }

  const response = await fetch(`${API_URL}/api/groups/${groupId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      console.log('Delete group response status:', response.status);

      if (response.ok) {
        console.log('Group deleted successfully');
        setGroups(prev => prev.filter(g => g._id !== groupId));
        alert('Group deleted successfully!');
      } else {
        console.error('Failed to delete group:', response.status);
        alert('Failed to delete group. Please try again.');
      }
    } catch (error) {
      console.error('Error deleting group:', error);
    }
  };

  const getGroupsForTab = (): Group[] => {
    const userId = getCurrentUserId();
    
    console.log('Filtering groups for tab:', activeTab, 'User ID:', userId);
    console.log('Total groups:', groups.length);
    console.log('Groups data:', groups);
    
    if (!userId) {
      console.log('❌ No user ID found, showing all groups');
      return groups;
    }
    
    let filteredGroups: Group[] = [];
    
    switch (activeTab) {
      case 'My Groups':
          filteredGroups = groups.filter(group => {
            const creatorId = typeof group.creator === 'object' ? group.creator?._id : group.creator;
            const isCreator = creatorId === userId;
            const isAdmin = group.members?.some(member => {
              const memberId = typeof member.user === 'object' ? member.user?._id : member.user;
              return memberId === userId && member.role === 'admin';
            });
            return isCreator || isAdmin;
          });
        break;
          
      case 'Suggested groups':
          filteredGroups = groups.filter(group => {
            const isPublic = group.privacy === 'public';
            const isNotMember = !group.members?.some(member => {
              const memberId = typeof member.user === 'object' ? member.user?._id : member.user;
              return memberId === userId;
            });
            const creatorId = typeof group.creator === 'object' ? group.creator?._id : group.creator;
            const isNotCreator = creatorId !== userId;
            return isPublic && isNotMember && isNotCreator;
          });
        break;
          
      case 'Joined Groups':
          filteredGroups = groups.filter(group => {
            const isMember = group.members?.some(member => {
              const memberId = typeof member.user === 'object' ? member.user?._id : member.user;
              return memberId === userId;
            });
            const creatorId = typeof group.creator === 'object' ? group.creator?._id : group.creator;
            const isCreator = creatorId === userId;
            return isMember || isCreator;
          });
        break;
        
      default:
        return [];
    }
    
    // Apply search filter
    if (searchQuery.trim()) {
      filteredGroups = filteredGroups.filter(group => 
        group.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        group.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        group.category.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    
    return filteredGroups;
  };

  // Group Card Component
  const GroupCard: React.FC<{ group: Group }> = ({ group }) => {
    const userId = getCurrentUserId();
    const isMember = group.members?.some(member => {
      const memberId = typeof member.user === 'object' ? member.user?._id : member.user;
      return memberId === userId;
    });
    const isAdmin = group.members?.some(member => {
      const memberId = typeof member.user === 'object' ? member.user?._id : member.user;
      return memberId === userId && member.role === 'admin';
    });
    const creatorId = typeof group.creator === 'object' ? group.creator?._id : group.creator;
    const isCreator = creatorId === userId;

    console.log(`Group ${group.name}: userId=${userId}, isMember=${isMember}, isAdmin=${isAdmin}, isCreator=${isCreator}`);

    return (
    <div className="bg-white rounded-lg border border-gray-200 overflow-hidden hover:shadow-lg hover:scale-[1.02] transition-all duration-200 cursor-pointer transform" onClick={() => router.push(`/dashboard/groups/${group._id}`)}>
      <div className="relative">
        <img 
            src={group.avatar || group.coverPhoto || '/avatars/1.png.png'} onError={(e) => { console.log('❌ Avatar load failed for user:', group.avatar || group.coverPhoto || '/avatars/1.png.png'); e.currentTarget.src = '/default-avatar.svg'; }} 
          alt={group.name}
          className="w-full h-32 sm:h-40 object-cover"
        />
        <div className="absolute top-2 left-2 flex gap-2">
          <span className={`px-2 py-1 text-xs rounded-full ${
              group.privacy === 'public' 
              ? 'bg-green-100 text-green-700' 
                : group.privacy === 'private'
                ? 'bg-orange-100 text-orange-700'
                : 'bg-red-100 text-red-700'
          }`}>
              {group.privacy.charAt(0).toUpperCase() + group.privacy.slice(1)}
          </span>
          <span className="px-2 py-1 text-xs bg-blue-100 text-blue-700 rounded-full">
              {group.category.charAt(0).toUpperCase() + group.category.slice(1)}
          </span>
        </div>
      </div>
      
      <div className="p-4">
        <div className="flex items-start justify-between mb-2">
          <h3 className="font-semibold text-gray-900 text-lg line-clamp-1">{group.name}</h3>
          <button 
            className="text-gray-400 hover:text-gray-600 p-1"
            onClick={(e) => {
              e.stopPropagation();
              // Handle favorite functionality
            }}
          >
            <Star className="w-4 h-4" />
          </button>
        </div>
        
        <p className="text-gray-600 text-sm mb-3 line-clamp-2">{group.description}</p>
        
        <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
          <div className="flex items-center gap-1">
            <Users className="w-4 h-4" />
              <span>{group.stats?.memberCount || group.members?.length || 0} members</span>
            </div>
            <span>Created {new Date(group.createdAt).toLocaleDateString()}</span>
        </div>
        
        <div className="flex gap-2">
            {isMember || isAdmin || isCreator ? (
            <>
              <button 
                className="flex-1 bg-blue-500 text-white py-2 px-4 rounded-lg text-sm font-medium hover:bg-blue-600 transition-colors flex items-center justify-center gap-2"
                onClick={(e) => {
                  e.stopPropagation();
                  // Handle chat functionality
                }}
              >
                <MessageCircle className="w-4 h-4" />
                Chat
              </button>
                {(isAdmin || isCreator) && (
                  <div className="flex gap-1">
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        handleEditGroup(group);
                      }}
                      className="px-3 py-2 border border-gray-200 rounded-lg text-gray-600 hover:bg-gray-50 transition-colors"
                    >
                <Settings className="w-4 h-4" />
              </button>
                    {(isCreator) && (
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteGroup(group._id);
                        }}
                        className="px-3 py-2 border border-red-200 rounded-lg text-red-600 hover:bg-red-50 transition-colors"
                      >
                        🗑️
                      </button>
                    )}
                  </div>
                )}
                {!isCreator && (
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      handleLeaveGroup(group._id);
                    }}
                    className="px-3 py-2 border border-gray-200 rounded-lg text-gray-600 hover:bg-gray-50 transition-colors"
                  >
                    Leave
                  </button>
                )}
            </>
          ) : (
            <button 
                onClick={(e) => {
                  e.stopPropagation();
                  handleJoinGroup(group._id);
                }}
              className="w-full bg-blue-500 text-white py-2 px-4 rounded-lg text-sm font-medium hover:bg-blue-600 transition-colors"
            >
              Join Group
            </button>
          )}
        </div>
      </div>
    </div>
  );
  };

  // Empty State Component
  const EmptyState: React.FC = () => (
    <div className="flex flex-col items-center justify-center py-12 sm:py-16">
      <div className="w-12 h-12 sm:w-16 sm:h-16 mb-4 sm:mb-6 text-purple-400">
        <svg viewBox="0 0 64 64" fill="currentColor" className="w-full h-full">
          <path d="M32 8c-4.4 0-8 3.6-8 8s3.6 8 8 8 8-3.6 8-8-3.6-8-8-8zm-12 20c-3.3 0-6 2.7-6 6s2.7 6 6 6 6-2.7 6-6-2.7-6-6-6zm24 0c-3.3 0-6 2.7-6 6s2.7 6 6 6 6-2.7 6-6-2.7-6-6-6zm-12 12c-6.6 0-12 5.4-12 12v4h24v-4c0-6.6-5.4-12-12-12z"/>
        </svg>
      </div>
      <p className="text-gray-500 text-base sm:text-lg mb-4 sm:mb-6">No groups to show</p>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6 w-full max-w-4xl">
        {/* Create New Group Card */}
        <div 
        onClick={() => setShowCreateModal(true)}
          className="bg-gray-50 border-2 border-dashed border-gray-300 rounded-lg p-6 flex flex-col items-center justify-center cursor-pointer hover:border-gray-400 hover:bg-gray-100 transition-all duration-200 min-h-[200px]"
        >
          <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center mb-3">
            <Plus className="w-6 h-6 text-gray-600" />
          </div>
          <p className="text-gray-700 font-medium text-center">Create New Group</p>
        </div>
      </div>
    </div>
  );

  // Enhanced Create Group Modal Component
  const CreateGroupModal: React.FC = () => (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-xl max-w-2xl w-full max-h-screen overflow-y-auto">
        <div className="p-6">
          {/* Form Header */}
          <div className="mb-6">
                <h2 className="text-2xl font-bold text-gray-900">Create New Group</h2>
          </div>

          <form onSubmit={(e) => e.preventDefault()} noValidate className="space-y-6">
            {/* Group Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Group name
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                placeholder="Group name"
                className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* Group URL */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Group URL
              </label>
              <input
                type="text"
                name="url"
                value={formData.name ? formData.name.toLowerCase().replace(/\s+/g, '') : ''}
                placeholder="Group URL"
                className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                readOnly
              />
              <p className="text-sm text-gray-500 mt-1">
                https://jaifriend.com/{formData.name ? formData.name.toLowerCase().replace(/\s+/g, '') : 'Group URL'}
              </p>
            </div>

            {/* Group Type and Category */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Group type</label>
                <select
                  name="privacy"
                  value={formData.privacy}
                  onChange={handleInputChange}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="public">Public</option>
                  <option value="private">Private</option>
                  <option value="secret">Secret</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
                <select
                  name="category"
                  value={formData.category}
                  onChange={handleInputChange}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="general">General</option>
                  <option value="business">Business</option>
                  <option value="education">Education</option>
                  <option value="entertainment">Entertainment</option>
                  <option value="health">Health & Fitness</option>
                  <option value="sports">Sports</option>
                  <option value="technology">Technology</option>
                  <option value="travel">Travel</option>
                  <option value="music">Music</option>
                  <option value="art">Art & Design</option>
                  <option value="food">Food & Cooking</option>
                  <option value="fashion">Fashion & Beauty</option>
                  <option value="gaming">Gaming</option>
                  <option value="cars">Cars and Vehicles</option>
                  <option value="other">Other</option>
                </select>
              </div>
            </div>

            {/* Form Actions */}
            <div className="flex justify-end gap-3 pt-4">
              <button
                onClick={handleCancel}
                disabled={creating}
                className="px-6 py-2 text-gray-600 hover:text-gray-800 transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateGroup}
                disabled={creating || !formData.name.trim()}
                className="px-6 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
              >
                {creating ? 'Creating...' : 'Create'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );

  return (
    <div className="w-full">
      
      {/* Header */}
      <div className={`border-b sticky top-0 z-30 transition-colors duration-200 ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
        <div className="px-4 sm:px-6 py-3 sm:py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className={`text-xl sm:text-2xl font-semibold transition-colors duration-200 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Groups</h1>
              {!loading && (
                <p className={`text-sm mt-1 transition-colors duration-200 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                  {getGroupsForTab().length} group{getGroupsForTab().length !== 1 ? 's' : ''} in {activeTab}
                </p>
              )}
            </div>
            <div className="flex items-center space-x-2 sm:space-x-3">
              {/* Refresh Button */}
              <button
                onClick={() => fetchGroups(true)}
                disabled={refreshing}
                className={`p-2 transition-colors ${refreshing ? 'opacity-50' : ''} ${
                  isDarkMode 
                    ? 'text-gray-400 hover:text-gray-300 hover:bg-gray-700' 
                    : 'text-gray-400 hover:text-gray-600 hover:bg-gray-100'
                }`}
                title="Refresh groups"
              >
                <div className={`w-5 h-5 ${refreshing ? 'animate-spin' : ''}`}>
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                </div>
              </button>
              
              <div className="relative hidden sm:block">
                <Search className={`absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 transition-colors duration-200 ${isDarkMode ? 'text-gray-400' : 'text-gray-400'}`} />
                <input
                  type="text"
                  placeholder="Search groups..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className={`pl-10 pr-4 py-2 w-64 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors duration-200 ${
                    isDarkMode 
                      ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
                      : 'bg-white border-gray-200 text-gray-900 placeholder-gray-500'
                  }`}
                />
              </div>
              <button className={`p-2 transition-colors duration-200 ${
                isDarkMode 
                  ? 'text-gray-400 hover:text-gray-300 hover:bg-gray-700' 
                  : 'text-gray-400 hover:text-gray-600 hover:bg-gray-100'
              }`}>
                <Users className="w-5 h-5" />
              </button>
              
              {/* Mobile Menu Button */}
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className={`sm:hidden p-2 transition-colors duration-200 ${
                  isDarkMode 
                    ? 'text-gray-400 hover:text-gray-300 hover:bg-gray-700' 
                    : 'text-gray-400 hover:text-gray-600 hover:bg-gray-100'
                }`}
              >
                {mobileMenuOpen ? <X className="w-5 h-5" /> : <MenuIcon className="w-5 h-5" />}
              </button>
            </div>
          </div>
          
          {/* Desktop Tabs */}
          <div className="hidden sm:flex space-x-1 mt-4">
            {tabs.map((tab: string) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors duration-200 ${
                  activeTab === tab
                    ? 'bg-blue-100 text-blue-700'
                    : isDarkMode 
                      ? 'text-gray-300 hover:text-white hover:bg-gray-700' 
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>

          {/* Mobile Tab Indicator */}
          <div className="sm:hidden mt-3">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
              <span className={`text-sm font-medium transition-colors duration-200 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>{activeTab}</span>
            </div>
          </div>
          
          {/* Mobile Search Bar */}
          <div className="sm:hidden mt-3">
            <div className="relative">
              <Search className={`absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 transition-colors duration-200 ${isDarkMode ? 'text-gray-400' : 'text-gray-400'}`} />
              <input
                type="text"
                placeholder="Search groups..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className={`w-full pl-10 pr-4 py-2 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors duration-200 ${
                  isDarkMode 
                    ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
                    : 'bg-white border-gray-200 text-gray-900 placeholder-gray-500'
                }`}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <>
          <div 
            className="fixed inset-0 bg-black bg-opacity-50 z-40 sm:hidden"
            onClick={() => setMobileMenuOpen(false)}
          />
          <div className={`fixed top-0 right-0 h-full w-64 shadow-lg z-50 sm:hidden transition-colors duration-200 ${isDarkMode ? 'bg-gray-800' : 'bg-white'}`}>
            <div className={`p-4 border-b transition-colors duration-200 ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
              <h3 className={`font-semibold transition-colors duration-200 ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>Navigation</h3>
            </div>
            <div className="py-2">
              {tabs.map((tab: string) => (
                <button
                  key={tab}
                  onClick={() => {
                    setActiveTab(tab);
                    setMobileMenuOpen(false);
                  }}
                  className={`w-full text-left px-4 py-3 text-sm transition-colors duration-200 ${
                    activeTab === tab
                      ? 'text-blue-600 bg-blue-50'
                      : isDarkMode 
                        ? 'text-gray-300 hover:bg-gray-700' 
                        : 'text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  {tab}
                </button>
              ))}
              <div className="border-t mt-2 pt-2">
                <button
                  onClick={() => {
                    setShowCreateModal(true);
                    setMobileMenuOpen(false);
                  }}
                  className="w-full text-left px-4 py-3 text-sm text-blue-600 hover:bg-blue-50 transition-colors"
                >
                  Create New Group
                </button>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Main Content */}
      <div className="px-4 sm:px-6 py-6 sm:py-8">

        
        {loading ? (
          <div className="text-center py-12 sm:py-16">
            <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-500">Loading groups...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
            {/* Create New Group Card */}
            <div 
              onClick={() => setShowCreateModal(true)}
              className="bg-gray-50 border-2 border-dashed border-gray-300 rounded-lg p-6 flex flex-col items-center justify-center cursor-pointer hover:border-gray-400 hover:bg-gray-100 transition-all duration-200 min-h-[200px]"
            >
              <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center mb-3">
                <Plus className="w-6 h-6 text-gray-600" />
              </div>
              <p className="text-gray-700 font-medium text-center">Create New Group</p>
            </div>
            
            {/* Existing Groups */}
            {getGroupsForTab().map((group) => (
              <GroupCard key={group._id} group={group} />
            ))}
          </div>
        )}
      </div>

      {/* Floating Action Button */}
      <button
        onClick={() => setShowCreateModal(true)}
        className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 w-12 h-12 sm:w-14 sm:h-14 bg-blue-600 text-white rounded-full shadow-lg hover:bg-blue-700 transition-colors flex items-center justify-center z-30"
      >
        <Plus className="w-5 h-5 sm:w-6 sm:h-6" />
      </button>

      {/* Success Notification */}
      {showSuccessMessage && (
        <div className="fixed top-4 right-4 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg z-50 flex items-center gap-2">
          <div className="w-5 h-5 bg-white rounded-full flex items-center justify-center">
            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
          </div>
          <span className="font-medium">{successMessage}</span>
          <button
            onClick={() => setShowSuccessMessage(false)}
            className="ml-4 text-white hover:text-green-100"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Enhanced Create Group Modal */}
      {showCreateModal && <CreateGroupModal />}

      {/* Edit Group Modal */}
      {showEditModal && editingGroup && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full max-h-screen overflow-y-auto">
            <div className="p-4 sm:p-6">
              <div className="flex items-center justify-between mb-4 sm:mb-6">
                <h2 className="text-lg sm:text-xl font-semibold text-gray-900">Edit Group</h2>
                <button
                  onClick={() => {
                    setShowEditModal(false);
                    setEditingGroup(null);
                    setFormData({
                      name: '',
                      description: '',
                      privacy: 'public',
                      category: 'general',
                      website: '',
                      email: '',
                      phone: '',
                      location: '',
                        tags: '',
                        url: ''
                    });
                  }}
                  className="p-1 hover:bg-gray-100 rounded-full transition-colors"
                >
                  <X className="w-5 h-5 text-gray-500" />
                </button>
              </div>
              
              <div className="space-y-4">
                {/* Group Name */}
                <div>
                  <input
                    type="text"
                    name="name"
                    placeholder="Group name"
                    value={formData.name}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm sm:text-base"
                  />
                </div>

                {/* Group Description */}
                <div>
                  <textarea
                    name="description"
                    placeholder="Group description"
                    value={formData.description}
                    onChange={handleInputChange}
                    rows={3}
                    className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm sm:text-base resize-none"
                  />
                </div>

                {/* Group Privacy and Category */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm text-gray-600 mb-1">Group type</label>
                    <select
                      name="privacy"
                      value={formData.privacy}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                    >
                      <option value="public">Public</option>
                      <option value="private">Private</option>
                      <option value="secret">Secret</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm text-gray-600 mb-1">Category</label>
                    <select
                      name="category"
                      value={formData.category}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                    >
                      <option value="general">General</option>
                      <option value="business">Business</option>
                      <option value="education">Education</option>
                      <option value="entertainment">Entertainment</option>
                      <option value="health">Health</option>
                      <option value="sports">Sports</option>
                      <option value="technology">Technology</option>
                      <option value="travel">Travel</option>
                      <option value="other">Other</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Modal Actions */}
              <div className="flex flex-col sm:flex-row justify-end space-y-2 sm:space-y-0 sm:space-x-3 mt-6 sm:mt-8">
                <button
                  onClick={() => {
                    setShowEditModal(false);
                    setEditingGroup(null);
                    setFormData({
                      name: '',
                      description: '',
                      privacy: 'public',
                      category: 'general',
                      website: '',
                      email: '',
                      phone: '',
                      location: '',
                      tags: '',
                      url: ''
                    });
                  }}
                  className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors w-full sm:w-auto text-sm"
                >
                  Cancel
                </button>
                <button
                  onClick={handleUpdateGroup}
                  disabled={!formData.name.trim()}
                  className="px-6 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white rounded-lg transition-colors w-full sm:w-auto text-sm"
                >
                  Update
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default GroupsPage;
