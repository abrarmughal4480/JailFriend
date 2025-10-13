"use client";

import React, { useState, useEffect } from 'react';
import { usePrivacy } from '@/contexts/PrivacyContext';
import {
  getDisplayName,
  getDisplayBio,
  getDisplayLocation,
  getDisplayWorkplace,
  getDisplayWebsite,
  getOnlineStatus,
  shouldShowOnlineStatus,
  canViewFriends,
  canViewActivities,
  calculatePrivacyLevel,
  getPrivacyLevelText
} from '@/utils/privacyUtils';
import { MapPin, Globe, Calendar, Users, Eye, Shield, GraduationCap, Briefcase, Heart, School, Building, Link, Search, MoreVertical, Edit, Activity, FileText } from 'lucide-react';

interface PrivacyAwareProfileProps {
  viewerType: 'public' | 'friend' | 'following' | 'self';
  user: {
    id: string;
    name: string;
    username: string;
    avatar: string;
    email: string;
    followers: string[];
    following: string[];
    bio?: string;
    location?: string;
    website?: string;
    workplace?: string;
    address?: string;
    country?: string;
    isOnline?: boolean;
    joinedDate?: string;
    posts?: any[];
  };
  onEditProfile?: () => void;
  onViewActivities?: () => void;
}

const PrivacyAwareProfile: React.FC<PrivacyAwareProfileProps> = ({ 
  viewerType, 
  user, 
  onEditProfile, 
  onViewActivities 
}) => {
  const { privacySettings, profileSettings } = usePrivacy();
  const [isOnline, setIsOnline] = useState(user.isOnline || false);
  const [followersCount, setFollowersCount] = useState(user.followers?.length || 0);
  const [followingCount, setFollowingCount] = useState(user.following?.length || 0);
  const [postsCount, setPostsCount] = useState(user.posts?.length || 0);
  const [searchQuery, setSearchQuery] = useState('');

  // Update online status periodically
  useEffect(() => {
    const updateOnlineStatus = () => {
      setIsOnline(true);
    };
    
    updateOnlineStatus();
    const interval = setInterval(updateOnlineStatus, 30000); // Update every 30 seconds
    
    return () => clearInterval(interval);
  }, []);

  // Fetch real counts
  useEffect(() => {
    const fetchCounts = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) return;

  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://jaifriend-backend.hgdjlive.com';
  const response = await fetch(`${API_URL}/api/users/${user.id}/stats`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (response.ok) {
          const data = await response.json();
          setFollowersCount(data.followersCount || 0);
          setFollowingCount(data.followingCount || 0);
          setPostsCount(data.postsCount || 0);
        }
      } catch (error) {
        console.error('Error fetching user stats:', error);
      }
    };

    fetchCounts();
  }, [user.id]);

  if (!privacySettings || !profileSettings) {
    // Fallback to basic display if settings are not loaded
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <div className="text-center mb-6">
          <div className="relative inline-block mb-4">
            <div className="w-24 h-24 bg-gray-200 dark:bg-gray-600 rounded-full flex items-center justify-center">
              {user.avatar ? (
                <img 
                  src={user.avatar} onError={(e) => { console.log('❌ Avatar load failed for user:', user.avatar); e.currentTarget.src = '/default-avatar.svg'; }} 
                  alt={user.name} 
                  className="w-full h-full rounded-full object-cover"
                />
              ) : (
                <span className="text-2xl">👤</span>
              )}
            </div>
            {isOnline && (
              <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-green-500 border-2 border-white dark:border-gray-800 rounded-full"></div>
            )}
          </div>
          
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">
            {user.name}
          </h1>
          <p className="text-gray-600 dark:text-gray-400 text-sm mb-2">
            @{user.username}
          </p>
          {isOnline && (
            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400">
              <div className="w-2 h-2 bg-green-500 rounded-full mr-1"></div>
              Online
            </span>
          )}
        </div>
        
        {user.bio && (
          <p className="text-gray-700 dark:text-gray-300 mb-4 text-center">
            {user.bio}
          </p>
        )}

        <div className="flex flex-wrap gap-2 text-sm text-gray-600 dark:text-gray-400 mb-4 justify-center">
          {user.location && (
            <div className="flex items-center gap-1">
              <MapPin className="w-4 h-4" />
              <span>{user.location}</span>
            </div>
          )}
          {user.website && (
            <div className="flex items-center gap-1">
              <Globe className="w-4 h-4" />
              <a href={user.website} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                {user.website}
              </a>
            </div>
          )}
        </div>
      </div>
    );
  }

  // Get privacy-aware display values
  const displayName = getDisplayName(profileSettings);
  const displayBio = getDisplayBio(profileSettings, privacySettings, viewerType);
  const displayLocation = getDisplayLocation(profileSettings, privacySettings, viewerType);
  const displayWorkplace = getDisplayWorkplace(profileSettings, privacySettings, viewerType);
  const displayWebsite = getDisplayWebsite(profileSettings, privacySettings, viewerType);
  const onlineStatus = getOnlineStatus(privacySettings, isOnline);
  const showOnlineStatus = shouldShowOnlineStatus(privacySettings, viewerType);
  const canViewFriendsList = canViewFriends(privacySettings, viewerType);
  const canViewActivitiesList = canViewActivities(privacySettings, viewerType);
  const privacyLevel = calculatePrivacyLevel(privacySettings);

  // Helper function to check if we should show education/work info
  const shouldShowEducationWork = () => {
    if (viewerType === 'self') return true;
    return canViewActivitiesList;
  };

  return (
    <div className="space-y-6">
      {/* Profile Header */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <div className="text-center mb-6">
          <div className="relative inline-block mb-4">
            <div className="w-24 h-24 bg-gray-200 dark:bg-gray-600 rounded-full flex items-center justify-center">
              {user.avatar ? (
                <img 
                  src={user.avatar} onError={(e) => { console.log('❌ Avatar load failed for user:', user.avatar); e.currentTarget.src = '/default-avatar.svg'; }} 
                  alt={displayName} 
                  className="w-full h-full rounded-full object-cover"
                />
              ) : (
                <span className="text-2xl">👤</span>
              )}
            </div>
            {showOnlineStatus && isOnline && (
              <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-green-500 border-2 border-white dark:border-gray-800 rounded-full"></div>
            )}
          </div>
          
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">
            {displayName}
          </h1>
          <p className="text-gray-600 dark:text-gray-400 text-sm mb-2">
            @{user.username}
          </p>
          {showOnlineStatus && isOnline && (
            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400">
              <div className="w-2 h-2 bg-green-500 rounded-full mr-1"></div>
              {onlineStatus}
            </span>
          )}
        </div>
        
        {displayBio && (
          <p className="text-gray-700 dark:text-gray-300 mb-4 text-center">
            {displayBio}
          </p>
        )}

        {/* Basic User Details */}
        <div className="flex flex-wrap gap-2 text-sm text-gray-600 dark:text-gray-400 mb-4 justify-center">
          {displayLocation && (
            <div className="flex items-center gap-1">
              <MapPin className="w-4 h-4 flex-shrink-0" />
              <span className="truncate">{displayLocation}</span>
            </div>
          )}
          {displayWebsite && (
            <div className="flex items-center gap-1">
              <Globe className="w-4 h-4 flex-shrink-0" />
              <a href={displayWebsite} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline truncate">
                {displayWebsite}
              </a>
            </div>
          )}
          {user.joinedDate && (
            <div className="flex items-center gap-1">
              <Calendar className="w-4 h-4 flex-shrink-0" />
              <span>Joined {new Date(user.joinedDate).toLocaleDateString()}</span>
            </div>
          )}
        </div>

        {/* Privacy Level */}
        <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 mb-4">
          <div className="flex items-center gap-2 mb-2">
            <Shield className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            <span className="text-sm font-medium text-blue-900 dark:text-blue-100">
              Privacy Level: {getPrivacyLevelText(privacyLevel)}
            </span>
          </div>
          <div className="w-full bg-blue-200 dark:bg-blue-800 rounded-full h-2">
            <div 
              className="bg-blue-600 dark:bg-blue-400 h-2 rounded-full transition-all duration-300" 
              style={{ width: `${privacyLevel}%` }}
            ></div>
          </div>
          <p className="text-xs text-blue-700 dark:text-blue-300 mt-1">
            {privacyLevel}% - Your profile is {privacyLevel < 30 ? 'very open' : privacyLevel < 70 ? 'moderately private' : 'very private'}
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2 justify-center">
          <button className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors">
            <MoreVertical className="w-5 h-5" />
          </button>
          {viewerType === 'self' && onEditProfile && (
            <button 
              onClick={onEditProfile}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Edit className="w-4 h-4" />
              <span>Edit</span>
            </button>
          )}
          {onViewActivities && (
            <button 
              onClick={onViewActivities}
              className="flex items-center gap-2 px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
            >
              <Activity className="w-4 h-4" />
              <span>Activities</span>
            </button>
          )}
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4 text-center">
          <div className="text-2xl font-bold text-gray-900 dark:text-white mb-1">
            {canViewFriendsList ? followingCount : '0'}
          </div>
          <div className="text-sm text-gray-600 dark:text-gray-400">Following</div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4 text-center">
          <div className="text-2xl font-bold text-gray-900 dark:text-white mb-1">
            {canViewFriendsList ? followersCount : '0'}
          </div>
          <div className="text-sm text-gray-600 dark:text-gray-400">Followers</div>
        </div>
      </div>

      {/* Posts Count */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4">
        <div className="flex items-center gap-2 mb-2">
          <FileText className="w-5 h-5 text-gray-600 dark:text-gray-400" />
          <span className="text-sm font-medium text-gray-900 dark:text-white">Posts</span>
        </div>
        <div className="text-2xl font-bold text-gray-900 dark:text-white">
          {canViewActivitiesList ? postsCount : '0'} posts
        </div>
      </div>

      {/* Education & Work Information */}
      {shouldShowEducationWork() && (
        <div className="space-y-4">
          {/* Education Section */}
          {(profileSettings.school || profileSettings.schoolCompleted !== undefined) && (
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4">
              <div className="flex items-center gap-2 mb-3">
                <GraduationCap className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                <h3 className="text-sm font-semibold text-gray-900 dark:text-white">Education</h3>
              </div>
              <div className="space-y-2">
                {profileSettings.school && (
                  <div className="flex items-center gap-2">
                    <School className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                    <span className="text-sm text-gray-700 dark:text-gray-300">
                      {profileSettings.school}
                      {profileSettings.schoolCompleted !== undefined && (
                        <span className="text-gray-500 dark:text-gray-400 ml-1">
                          {profileSettings.schoolCompleted ? ' (Completed)' : ' (In Progress)'}
                        </span>
                      )}
                    </span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Work Section */}
          {(profileSettings.workingAt || profileSettings.companyWebsite) && (
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4">
              <div className="flex items-center gap-2 mb-3">
                <Briefcase className="w-5 h-5 text-green-600 dark:text-green-400" />
                <h3 className="text-sm font-semibold text-gray-900 dark:text-white">Work</h3>
              </div>
              <div className="space-y-2">
                {profileSettings.workingAt && (
                  <div className="flex items-center gap-2">
                    <Building className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                    <span className="text-sm text-gray-700 dark:text-gray-300">
                      {profileSettings.workingAt}
                    </span>
                  </div>
                )}
                {profileSettings.companyWebsite && (
                  <div className="flex items-center gap-2">
                    <Link className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                    <a 
                      href={profileSettings.companyWebsite} 
                      target="_blank" 
                      rel="noopener noreferrer" 
                      className="text-sm text-blue-600 dark:text-blue-400 hover:underline truncate"
                    >
                      {profileSettings.companyWebsite}
                    </a>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Relationship Status */}
          {profileSettings.relationship && profileSettings.relationship !== 'None' && (
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4">
              <div className="flex items-center gap-2 mb-3">
                <Heart className="w-5 h-5 text-pink-600 dark:text-pink-400" />
                <h3 className="text-sm font-semibold text-gray-900 dark:text-white">Relationship</h3>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-700 dark:text-gray-300">
                  {profileSettings.relationship}
                </span>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Search Bar */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search for posts..."
            value={searchQuery || ''}
            onChange={(e) => setSearchQuery?.(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          />
        </div>
      </div>
    </div>
  );
};

export default PrivacyAwareProfile;
