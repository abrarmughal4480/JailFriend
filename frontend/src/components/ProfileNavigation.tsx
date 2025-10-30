'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { User, Settings, LogOut, Heart, Bookmark, Camera } from 'lucide-react';
import { useSystemThemeOverride } from '@/hooks/useSystemThemeOverride';
import { useDarkMode } from '@/contexts/DarkModeContext';

interface ProfileNavigationProps {
  className?: string;
}

interface User {
  id?: string;
  _id?: string;
  name: string;
  username: string;
  avatar: string;
}

export default function ProfileNavigation({ className = '' }: ProfileNavigationProps) {
  // Ensure system dark mode has no effect
  useSystemThemeOverride();
  
  const { isDarkMode } = useDarkMode();
  
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [showDropdown, setShowDropdown] = useState(false);

  useEffect(() => {
    fetchCurrentUser();
  }, []);

  const fetchCurrentUser = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;

                             const API_URL = process.env.NEXT_PUBLIC_API_URL;
                             const response = await fetch(`${API_URL}/api/profile/me`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const userData = await response.json();
        console.log('User data received from API:', userData);
        setUser(userData);
      }
    } catch (error) {
      console.error('Error fetching user:', error);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    router.push('/');
  };

  const navigateToProfile = () => {
    if (user) {
      // Get user ID from either id or _id field
      const userId = user.id || user._id;
      
      console.log('Navigating to profile with user ID:', userId);
      console.log('User object:', user);
      
      if (userId) {
        window.open(`/dashboard/profile/${userId}`, '_blank');
      } else {
        console.error('No valid user ID found:', user);
        alert('Unable to navigate to profile - user ID not found');
      }
    }
  };

  const navigateToSettings = () => {
    window.open('/dashboard/settings', '_blank');
  };

  const navigateToSaved = () => {
    window.open('/dashboard/saved', '_blank');
  };

  const navigateToAlbums = () => {
    window.open('/dashboard/albums', '_blank');
  };

  if (!user) {
    return (
      <div className={`flex items-center gap-2 ${className}`}>
        <div className="w-8 h-8 bg-gray-200 rounded-full animate-pulse"></div>
        <div className="w-20 h-4 bg-gray-200 rounded animate-pulse"></div>
      </div>
    );
  }

  return (
    <div className={`relative ${className}`}>
      {/* Profile Button */}
      <button
        onClick={() => setShowDropdown(!showDropdown)}
        className={`flex items-center gap-2 p-2 rounded-lg transition-colors ${
          isDarkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'
        }`}
      >
        <img
          src={user.avatar ? (user.avatar.startsWith('http') ? user.avatar : `${process.env.NEXT_PUBLIC_API_URL || 'https://jaifriend-backend.hgdjlive.com'}/${user.avatar}`) : '/default-avatar.svg'}
          alt={user.name}
          className="w-8 h-8 rounded-full object-cover"
          onError={(e) => {
            console.log('❌ Avatar load failed for user:', user.name, 'URL:', user.avatar);
            e.currentTarget.src = '/default-avatar.svg';
          }}
        />
        <span className={`hidden sm:block text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
          {user.name}
        </span>
        <User className={`w-4 h-4 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`} />
      </button>

      {/* Dropdown Menu */}
      {showDropdown && (
        <>
          src={user.avatar ? (user.avatar.startsWith('http') ? user.avatar : `${process.env.NEXT_PUBLIC_API_URL}/${user.avatar}`) : '/default-avatar.svg'}
          <div
            className="fixed inset-0 z-10"
            onClick={() => setShowDropdown(false)}
          />
          
          {/* Menu */}
          <div className={`absolute right-0 top-full mt-2 w-56 rounded-lg shadow-lg border z-20 ${
            isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
          }`}>
            <div className="p-2">
              {/* User Info */}
              <div className={`px-3 py-2 border-b ${
                isDarkMode ? 'border-gray-700' : 'border-gray-100'
              }`}>
                <div className="flex items-center gap-3">
                  <img
                      src={user.avatar ? (user.avatar.startsWith('http') ? user.avatar : `${process.env.NEXT_PUBLIC_API_URL}/${user.avatar}`) : '/default-avatar.svg'}
                    alt={user.name}
                    className="w-10 h-10 rounded-full object-cover"
                    onError={(e) => {
                      console.log('❌ Avatar load failed for user:', user.name, 'URL:', user.avatar);
                      e.currentTarget.src = '/default-avatar.svg';
                    }}
                  />
                  <div>
                    <p className={`font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{user.name}</p>
                    <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>@{user.username}</p>
                  </div>
                </div>
              </div>

              {/* Menu Items */}
              <div className="py-1">
                <button
                  onClick={() => {
                    navigateToProfile();
                    setShowDropdown(false);
                  }}
                  className={`w-full flex items-center gap-3 px-3 py-2 text-left rounded-md transition-colors ${
                    isDarkMode 
                      ? 'text-gray-300 hover:bg-gray-700' 
                      : 'text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  <User className="w-4 h-4" />
                  <span>My Profile</span>
                </button>

                <button
                  onClick={() => {
                    navigateToAlbums();
                    setShowDropdown(false);
                  }}
                  className={`w-full flex items-center gap-3 px-3 py-2 text-left rounded-md transition-colors ${
                    isDarkMode 
                      ? 'text-gray-300 hover:bg-gray-700' 
                      : 'text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  <Camera className="w-4 h-4" />
                  <span>My Albums</span>
                </button>

                <button
                  onClick={() => {
                    navigateToSaved();
                    setShowDropdown(false);
                  }}
                  className={`w-full flex items-center gap-3 px-3 py-2 text-left rounded-md transition-colors ${
                    isDarkMode 
                      ? 'text-gray-300 hover:bg-gray-700' 
                      : 'text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  <Bookmark className="w-4 h-4" />
                  <span>Saved Posts</span>
                </button>

                <button
                  onClick={() => {
                    navigateToSettings();
                    setShowDropdown(false);
                  }}
                  className={`w-full flex items-center gap-3 px-3 py-2 text-left rounded-md transition-colors ${
                    isDarkMode 
                      ? 'text-gray-300 hover:bg-gray-700' 
                      : 'text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  <Settings className="w-4 h-4" />
                  <span>Settings</span>
                </button>
              </div>

              {/* Divider */}
              <div className={`border-t my-1 ${
                isDarkMode ? 'border-gray-700' : 'border-gray-100'
              }`}></div>

              {/* Logout */}
              <button
                onClick={() => {
                  handleLogout();
                  setShowDropdown(false);
                }}
                className={`w-full flex items-center gap-3 px-3 py-2 text-left rounded-md transition-colors ${
                  isDarkMode 
                    ? 'text-red-400 hover:bg-red-900/20' 
                    : 'text-red-600 hover:bg-red-50'
                }`}
              >
                <LogOut className="w-4 h-4" />
                <span>Logout</span>
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
} 
