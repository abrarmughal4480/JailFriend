import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { useDarkMode } from '@/contexts/DarkModeContext';
import { logout } from '@/utils/auth';
import FloatingActionButton from './FloatingActionButton';
import FollowersSidebar from './FollowersSidebar';

import {
  MenuItem,
  SettingsMenuItem,
  AdminMenuItem,
  menuSections,
  adminMenuItems,
  settingsSections
} from '@/constants/navigation';

interface PopupState {
  isOpen: boolean;
  type: 'success' | 'error' | 'info';
  title: string;
  message: string;
}

interface SwitchAccountModal {
  isOpen: boolean;
}

interface Profile {
  id?: string;
  name: string;
  avatar: string;
  balance: string;
  pokes: number;
}

interface MenuSections {
  me: MenuItem[];
  community: MenuItem[];
  explore: MenuItem[];
}

interface SettingsSections {
  settings: SettingsMenuItem[];
  profile: SettingsMenuItem[];
  security: SettingsMenuItem[];
}

interface DashboardLayoutProps {
  children: React.ReactNode;
}

type DropdownType = 'people' | 'messages' | 'notifications' | 'profile' | null;

const DashboardLayout: React.FC<DashboardLayoutProps> = ({ children }) => {
  const { isDarkMode, toggleDarkMode, resetToSystem, isSystemMode } = useDarkMode();
  const router = useRouter();
  const pathname = usePathname();


  // Layout States
  const [sidebarOpen, setSidebarOpen] = useState<boolean>(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState<boolean>(false);
  const [isMobile, setIsMobile] = useState<boolean>(false);

  // Navbar States
  const [profile, setProfile] = useState<Profile>({
    id: '',
    name: 'Waleed',
    avatar: '/avatars/1.png.png',
    balance: '$0.00',
    pokes: 0
  });

  const [openDropdown, setOpenDropdown] = useState<DropdownType>(null);
  const [popup, setPopup] = useState<PopupState>({
    isOpen: false,
    type: 'success',
    title: '',
    message: ''
  });
  const [switchAccountModal, setSwitchAccountModal] = useState<SwitchAccountModal>({
    isOpen: false
  });

  // Settings Sidebar States
  const [settingsOpen, setSettingsOpen] = useState<boolean>(false);
  const [profileSettingsOpen, setProfileSettingsOpen] = useState<boolean>(false);
  const [securitySettingsOpen, setSecuritySettingsOpen] = useState<boolean>(false);

  // Profile Sidebar State
  const [profileSidebarOpen, setProfileSidebarOpen] = useState<boolean>(false);

  // Search States
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState<boolean>(false);
  const [showSearchResults, setShowSearchResults] = useState<boolean>(false);

  // Check if token is valid
  const isTokenValid = (token: string): boolean => {
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      const currentTime = Math.floor(Date.now() / 1000);
      return payload.exp > currentTime;
    } catch (error) {
      return false;
    }
  };

  // Format balance to display with ₹ symbol
  const formatBalance = (balance: string): string => {
    // Handle undefined or null balance
    if (!balance || typeof balance !== 'string') {
      return '₹0.00';
    }
    // Extract numeric value from balance string (handles $, ₹, or plain numbers)
    const numericValue = parseFloat(balance.replace(/[^0-9.-]/g, '')) || 0;
    // Format with Indian Rupee symbol and 2 decimal places
    return `₹${numericValue.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',')}`;
  };

  // Fetch notification count
  const fetchNotificationCount = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        console.log('No token found, skipping notification fetch');
        return;
      }

      // Check if token is valid
      if (!isTokenValid(token)) {
        console.log('Token is expired or invalid, logging out user');
        logout();
        return;
      }

      // console.log('Fetching notifications with token:', token.substring(0, 20) + '...');

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/notifications/stats`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      // console.log('Notification response status:', response.status);

      if (response.ok) {
        const data = await response.json();
        setNotificationCount(data.data?.unreadCount || 0);
      } else {
        const errorData = await response.json().catch(() => ({}));
        console.log('Notification fetch failed:', response.status, errorData);

        // Handle authentication errors
        if (response.status === 401) {
          console.log('Token expired or invalid, logging out user');
          logout();
          return;
        }
      }
    } catch (error) {
      console.error('Error fetching notification count:', error);
    }
  };

  // Search function
  const handleSearch = async (query: string) => {
    if (!query.trim() || query.length < 2) {
      setSearchResults([]);
      setShowSearchResults(false);
      setIsSearching(false);
      return;
    }

    setIsSearching(true);
    setShowSearchResults(true);

    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/search/quick?q=${encodeURIComponent(query)}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        console.log('🔍 Search results:', data);
        setSearchResults(data.results || []);
      } else {
        console.error('❌ Search response not ok:', response.status);
        setSearchResults([]);
      }
    } catch (error) {
      console.error('❌ Search error:', error);
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  };

  // Debounced search effect
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (searchQuery.trim() && searchQuery.length >= 2) {
        handleSearch(searchQuery);
      } else if (searchQuery.trim().length < 2) {
        setSearchResults([]);
        setShowSearchResults(false);
      }
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [searchQuery]);

  // Close search results when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      // On desktop, close when clicking outside the search container
      if (!isMobile && !target.closest('.search-container')) {
        setShowSearchResults(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Admin Sidebar States
  const [adminSettingsOpen, setAdminSettingsOpen] = useState<boolean>(true);
  const [adminPostSettingsOpen, setAdminPostSettingsOpen] = useState<boolean>(false);
  const [adminManageFeaturesOpen, setAdminManageFeaturesOpen] = useState<boolean>(false);
  const [adminStoreOpen, setAdminStoreOpen] = useState<boolean>(false);
  const [adminForumsOpen, setAdminForumsOpen] = useState<boolean>(false);
  const [adminMoviesOpen, setAdminMoviesOpen] = useState<boolean>(false);
  const [adminGamesOpen, setAdminGamesOpen] = useState<boolean>(false);
  const [adminCategoriesOpen, setAdminCategoriesOpen] = useState<boolean>(false);
  const [adminCustomFieldsOpen, setAdminCustomFieldsOpen] = useState<boolean>(false);
  const [adminLanguagesOpen, setAdminLanguagesOpen] = useState<boolean>(false);
  const [adminUsersOpen, setAdminUsersOpen] = useState<boolean>(false);
  const [adminPaymentsOpen, setAdminPaymentsOpen] = useState<boolean>(false);
  const [adminProSystemOpen, setAdminProSystemOpen] = useState<boolean>(false);
  const [adminDesignOpen, setAdminDesignOpen] = useState<boolean>(false);
  const [adminToolsOpen, setAdminToolsOpen] = useState<boolean>(false);
  const [adminPagesOpen, setAdminPagesOpen] = useState<boolean>(false);

  // Notification state
  const [notificationCount, setNotificationCount] = useState<number>(0);
  const [lastNotificationCount, setLastNotificationCount] = useState<number>(0);
  const [adminReportsOpen, setAdminReportsOpen] = useState<boolean>(false);
  const [adminApiSettingsOpen, setAdminApiSettingsOpen] = useState<boolean>(false);

  // Check if current route is settings
  const isSettingsPage = pathname.startsWith('/dashboard/settings');

  // Check if current route is admin
  const isAdminPage = pathname.startsWith('/dashboard/admin');
  const mobileSidebarThemeClasses =

    isDarkMode
      ? 'bg-gray-900 text-white'
      : 'bg-white text-gray-900';

  // Check if current route is messages
  const isMessagesPage = pathname.startsWith('/dashboard/messages');

  // Check if current route is video call
  const isVideoCallPage = pathname.startsWith('/dashboard/video-call');

  // Check if current route is reels
  const isReelsPage = pathname.startsWith('/dashboard/reels');

  // Handle screen size changes
  useEffect(() => {
    const handleResize = (): void => {
      const width = window.innerWidth;
      setIsMobile(width < 1024);

      if (width < 1024) {
        setSidebarOpen(false);
        setSidebarCollapsed(false);
      } else {
        setSidebarCollapsed(false);
      }
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent | TouchEvent): void {
      const target = event.target as HTMLElement;
      if (!target.closest('.dropdown-container')) {
        setOpenDropdown(null);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('touchstart', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('touchstart', handleClickOutside);
    };
  }, []);

  // Close mobile sidebar when route changes
  useEffect(() => {
    // Close sidebar and search results when route changes on mobile
    if (isMobile) {
      setSidebarOpen(false);
      setShowSearchResults(false);
      setSearchQuery('');
    } else {
      // Also close search results on desktop when route changes
      setShowSearchResults(false);
      setSearchQuery('');
    }
  }, [pathname, isMobile]);

  // Auto-open settings sections when on settings page
  useEffect(() => {
    if (isSettingsPage) {
      setSettingsOpen(true);
      setProfileSettingsOpen(true);
      setSecuritySettingsOpen(true);
    }
  }, [isSettingsPage]);

  // Add event listeners for notifications
  useEffect(() => {
    window.addEventListener('notificationsUpdated', fetchNotificationCount);

    return () => {
      window.removeEventListener('notificationsUpdated', fetchNotificationCount);
    };
  }, []);

  // Real-time notification polling
  useEffect(() => {
    // Initial fetch
    fetchNotificationCount();

    // Set up polling every 30 seconds for real-time updates
    const pollInterval = setInterval(fetchNotificationCount, 30000);

    // Set up focus listener to refresh when user returns to tab
    const handleFocus = () => {
      fetchNotificationCount();
    };

    window.addEventListener('focus', handleFocus);

    return () => {
      clearInterval(pollInterval);
      window.removeEventListener('focus', handleFocus);
    };
  }, []);

  // Play notification sound when count increases
  useEffect(() => {
    if (notificationCount > lastNotificationCount && lastNotificationCount > 0) {
      // Play notification sound (if user has sound enabled)
      const playNotificationSound = () => {
        try {
          // Check if user has sound enabled from notification settings
          const notificationSettings = localStorage.getItem('notificationSettings');
          let soundEnabled = true; // Default to true

          if (notificationSettings) {
            try {
              const settings = JSON.parse(notificationSettings);
              soundEnabled = settings.notificationSound !== false;
            } catch (e) {
              console.log('Error parsing notification settings');
            }
          }

          if (!soundEnabled) return;

          // Try to play custom notification sound
          const audio = new Audio('/notification-sound.mp3');
          audio.volume = 0.3;
          audio.play().catch(() => {
            // Fallback: create a pleasant notification sound
            try {
              const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
              const oscillator = audioContext.createOscillator();
              const gainNode = audioContext.createGain();

              oscillator.connect(gainNode);
              gainNode.connect(audioContext.destination);

              // Create a pleasant notification sound (two-tone)
              const now = audioContext.currentTime;

              // First tone
              oscillator.frequency.setValueAtTime(800, now);
              gainNode.gain.setValueAtTime(0, now);
              gainNode.gain.linearRampToValueAtTime(0.1, now + 0.05);
              gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.2);

              // Second tone
              oscillator.frequency.setValueAtTime(1000, now + 0.25);
              gainNode.gain.setValueAtTime(0, now + 0.25);
              gainNode.gain.linearRampToValueAtTime(0.08, now + 0.3);
              gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.45);

              oscillator.start(now);
              oscillator.stop(now + 0.5);
            } catch (error) {
              console.log('Could not create notification sound');
            }
          });
        } catch (error) {
          console.log('Could not play notification sound');
        }
      };

      // Only play sound if user is not on notifications page
      if (!pathname.includes('/notifications')) {
        playNotificationSound();
      }
    }

    setLastNotificationCount(notificationCount);
  }, [notificationCount, lastNotificationCount, pathname]);

  // Load user profile from API
  useEffect(() => {
    const fetchProfile = () => {
      const token = localStorage.getItem('token');
      if (token) {
        fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/profile/me`, {
          headers: { Authorization: `Bearer ${token}` },
        })
          .then((res) => {
            if (!res.ok) {
              throw new Error(`HTTP error! status: ${res.status}`);
            }
            return res.json();
          })
          .then((data) => {
            console.log('✅ Profile data received:', data);
            console.log('💰 Balance from API:', data.balance);
            console.log('💰 Balance type:', typeof data.balance);
            console.log('💰 Full data object:', JSON.stringify(data, null, 2));

            const newProfile = {
              id: data.id || data._id,
              name: data.name || 'User',
              avatar: data.avatar || '/avatars/1.png.png',
              balance: data.balance || '₹0.00',
              pokes: data.pokes || 0
            };

            console.log('💰 New profile object:', newProfile);
            setProfile(newProfile);
            console.log('✅ Profile state updated');
          })
          .catch((error) => {
            console.error('❌ Profile load failed:', error);
          });
      } else {
        console.warn('⚠️ No token found, cannot fetch profile');
      }
    };

    // Initial fetch
    fetchProfile();

    // Refresh profile every 30 seconds to keep balance updated
    const profileInterval = setInterval(fetchProfile, 30000);

    return () => clearInterval(profileInterval);
  }, []);

  // Fetch notification count on mount
  useEffect(() => {
    fetchNotificationCount();
  }, []);

  // Listen for image updates from settings page
  useEffect(() => {
    const updateProfile = (data: any) => {
      setProfile({
        name: data.name || 'User',
        avatar: data.avatar || '/avatars/1.png.png',
        balance: data.balance || '₹0.00',
        pokes: data.pokes || 0
      });
    };

    const handleImagesUpdated = () => {
      console.log('Images updated event received in DashboardLayout, refreshing profile...');
      const token = localStorage.getItem('token');
      if (token) {
        fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/profile/me`, {
          headers: { Authorization: `Bearer ${token}` },
        })
          .then((res) => res.json())
          .then((data) => updateProfile(data))
          .catch(() => console.log('Profile refresh failed'));
      }
    };

    const handleNotificationsUpdated = () => {
      console.log('Notifications updated event received in DashboardLayout, refreshing notification count...');
      fetchNotificationCount();
    };

    const handlePrivacySettingsUpdated = () => {
      console.log('Privacy settings updated event received in DashboardLayout, refreshing profile...');
      const token = localStorage.getItem('token');
      if (token) {
        fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/profile/me`, {
          headers: { Authorization: `Bearer ${token}` },
        })
          .then((res) => res.json())
          .then((data) => updateProfile(data))
          .catch(() => console.log('Profile refresh failed'));
      }
    };

    const handlePasswordChanged = () => {
      console.log('Password changed event received in DashboardLayout, refreshing profile...');
      const token = localStorage.getItem('token');
      if (token) {
        fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/profile/me`, {
          headers: { Authorization: `Bearer ${token}` },
        })
          .then((res) => res.json())
          .then((data) => updateProfile(data))
          .catch(() => console.log('Profile refresh failed'));
      }
    };

    const handleBalanceUpdated = () => {
      console.log('Balance updated event received in DashboardLayout, refreshing profile...');
      const token = localStorage.getItem('token');
      if (token) {
        fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/profile/me`, {
          headers: { Authorization: `Bearer ${token}` },
        })
          .then((res) => res.json())
          .then((data) => updateProfile(data))
          .catch(() => console.log('Profile refresh failed'));
      }
    };

    window.addEventListener('imagesUpdated', handleImagesUpdated);
    window.addEventListener('privacySettingsUpdated', handlePrivacySettingsUpdated);
    window.addEventListener('passwordChanged', handlePasswordChanged);
    window.addEventListener('balanceUpdated', handleBalanceUpdated);

    return () => {
      window.removeEventListener('imagesUpdated', handleImagesUpdated);
      window.removeEventListener('privacySettingsUpdated', handlePrivacySettingsUpdated);
      window.removeEventListener('passwordChanged', handlePasswordChanged);
      window.removeEventListener('balanceUpdated', handleBalanceUpdated);
    };
  }, []);

  // Listen for profile updates from settings pages
  useEffect(() => {
    const handleProfileUpdated = () => {
      console.log('Profile updated event received in DashboardLayout, refreshing profile...');
      const token = localStorage.getItem('token');
      if (token) {
        fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/profile/me`, {
          headers: { Authorization: `Bearer ${token}` },
        })
          .then((res) => res.json())
          .then((data) => setProfile(data))
          .catch(() => console.log('Profile refresh failed'));
      }
    };

    window.addEventListener('profileUpdated', handleProfileUpdated);

    return () => {
      window.removeEventListener('profileUpdated', handleProfileUpdated);
    };
  }, []);

  // Navigation items are imported from @/constants/navigation

  // Popup Functions
  const showPopup = (type: 'success' | 'error' | 'info', title: string, message: string): void => {
    setPopup({ isOpen: true, type, title, message });
  };

  const closePopup = (): void => {
    setPopup(prev => ({ ...prev, isOpen: false }));
  };

  // Navbar Functions
  const handleDropdownClick = (dropdownType: 'people' | 'messages' | 'notifications' | 'profile'): void => {
    if (dropdownType === 'profile') {
      setProfileSidebarOpen(true);
      setOpenDropdown(null);
      // Close main sidebar on mobile when opening profile sidebar
      if (isMobile) {
        setSidebarOpen(false);
      }
    } else if (dropdownType === 'notifications') {
      // Navigate to notifications page instead of showing dropdown
      router.push('/dashboard/notifications');
      setOpenDropdown(null);
    } else {
      setOpenDropdown(openDropdown === dropdownType ? null : dropdownType);
    }
  };

  const handleMyProfile = (): void => {
    setOpenDropdown(null);
    setProfileSidebarOpen(false);

    if (profile.id) {
      router.push(`/dashboard/profile/${profile.id}`);
    } else {
      // Fallback if ID is not yet loaded
      router.push('/dashboard/profile');
    }
  };

  const handleSwitchAccount = (): void => {
    setOpenDropdown(null);
    setSwitchAccountModal({ isOpen: true });
  };

  const handleAddAccount = (): void => {
    setSwitchAccountModal({ isOpen: false });
    showPopup('info', 'Redirecting...', 'Taking you to the home page to add a new account.');
    setTimeout(() => {
      closePopup();
      router.push('/');
    }, 1500);
  };

  const handleLogout = (): void => {
    setOpenDropdown(null);
    showPopup('info', 'Logging Out...', 'Please wait while we log you out safely.');

    setTimeout(() => {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      closePopup();
      showPopup('success', 'Logged Out Successfully!', 'You have been logged out. Redirecting to home page...');

      setTimeout(() => {
        closePopup();
        router.push('/');
      }, 1500);
    }, 1000);
  };

  const closeProfileSidebar = (): void => {
    setProfileSidebarOpen(false);
  };

  // Sidebar Functions
  const renderMenuItems = (items: MenuItem[], collapsed: boolean = false): React.ReactElement => {
    if (collapsed) {
      return (
        <div className="flex flex-col gap-2">
          {items.map((item) => (
            <Link
              key={item.name}
              href={item.href}
              className={`flex flex-col items-center gap-1 p-3 rounded-lg transition-all duration-200 group relative ${pathname === item.href
                ? 'bg-blue-500 text-white'
                : isDarkMode ? 'hover:bg-gray-700 text-gray-300' : 'hover:bg-gray-50 text-gray-700'
                }`}
              title={item.name}
            >
              <div className={`w-8 h-8 rounded-lg ${item.color} flex items-center justify-center text-sm transition-transform leading-none relative`}>
                {item.icon}
                {/* Notification badge for notifications item in collapsed view */}
                {item.name === "Notifications" && notificationCount > 0 && (
                  <span className={`absolute -top-1 -right-1 min-w-3 h-3 bg-red-500 text-white text-xs rounded-full flex items-center justify-center font-bold transition-all duration-300 shadow-lg ${notificationCount > lastNotificationCount && lastNotificationCount > 0
                    ? 'animate-bounce scale-110 ring-1 ring-red-300 ring-opacity-50'
                    : 'animate-pulse'
                    }`}>
                    {notificationCount > 9 ? '9+' : notificationCount}
                  </span>
                )}
              </div>
              <div className="absolute left-full ml-2 px-1 py-1 bg-gray-800 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-50 pointer-events-none transform -translate-x-full">
                {item.name}
              </div>
            </Link>
          ))}
        </div>
      );
    }

    return (
      <div className="space-y-2 p-4">
        {items.map((item) => (
          <Link
            key={item.name}
            href={item.href}
            className={`flex items-center gap-3 p-3 rounded-xl transition-all duration-300 group ${pathname === item.href
              ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white'
              : isDarkMode ? 'text-gray-300 hover:text-white hover:bg-gray-700' : 'text-gray-700 hover:text-white hover:bg-gray-50'
              }`}
            style={{
              background: pathname === item.href
                ? 'linear-gradient(45deg, #022e8a, #5d97fe)'
                : isDarkMode ? '#374151' : '#ffffff',
              borderRadius: '8px',
              boxShadow: isDarkMode
                ? '4px 4px 8px rgba(0, 0, 0, 0.3), -4px -4px 8px rgba(0, 0, 0, 0.1)'
                : '4px 4px 8px rgba(0, 0, 0, 0.1), -4px -4px 8px rgba(255, 255, 255, 0.9)',
              padding: '8px 12px'
            }}
            onMouseEnter={(e) => {
              if (pathname !== item.href) {
                e.currentTarget.style.background = 'linear-gradient(45deg, #022e8a, #5d97fe)';
                e.currentTarget.style.boxShadow = '0 4px 15px rgba(93, 151, 254, 0.4)';
              }
            }}
            onMouseLeave={(e) => {
              if (pathname !== item.href) {
                e.currentTarget.style.background = isDarkMode ? '#374151' : '#ffffff';
                e.currentTarget.style.boxShadow = isDarkMode
                  ? '4px 4px 8px rgba(0, 0, 0, 0.3), -4px -4px 8px rgba(0, 0, 0, 0.1)'
                  : '6px 6px 12px rgba(0, 0, 0, 0.1), -6px -6px 12px rgba(255, 255, 255, 0.9)';
              }
            }}
          >
            <div className={`w-8 h-8 rounded-md flex items-center justify-center text-base transition-transform leading-none relative ${pathname === item.href ? 'bg-white/20' : isDarkMode ? 'bg-gray-600' : 'bg-gray-100'
              }`}>
              {item.icon}
              {/* Notification badge for notifications item */}
              {item.name === "Notifications" && notificationCount > 0 && (
                <span className={`absolute -top-1 -right-1 min-w-4 h-4 bg-red-500 text-white text-xs rounded-full flex items-center justify-center font-bold transition-all duration-300 shadow-lg ${notificationCount > lastNotificationCount && lastNotificationCount > 0
                  ? 'animate-bounce scale-110 ring-2 ring-red-300 ring-opacity-50'
                  : 'animate-pulse'
                  }`}>
                  {notificationCount > 9 ? '9+' : notificationCount}
                </span>
              )}
            </div>
            <span className="text-xs font-medium">
              {item.name}
            </span>
          </Link>
        ))}
      </div>
    );
  };

  const renderSettingsMenuItems = (items: SettingsMenuItem[]): React.ReactElement => (
    <div className="space-y-1">
      {items.map((item) => (
        <Link
          key={item.name}
          href={item.href}
          className={`w-full flex items-center px-3 py-2.5 text-sm font-medium rounded-lg transition-all duration-200 group ${pathname === item.href
            ? isDarkMode
              ? 'bg-blue-600 text-white shadow-lg'
              : 'bg-blue-100 text-blue-700 shadow-md'
            : isDarkMode
              ? 'text-gray-300 hover:bg-gray-700 hover:text-white'
              : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
            }`}
        >
          <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-lg mr-3 transition-all duration-200 ${pathname === item.href
            ? isDarkMode
              ? 'bg-white/20 text-white'
              : 'bg-blue-200 text-blue-600'
            : isDarkMode
              ? 'bg-gray-600 text-gray-300 group-hover:bg-gray-500 group-hover:text-white'
              : 'bg-gray-100 text-gray-600 group-hover:bg-gray-200 group-hover:text-gray-700'
            }`}>
            {item.icon}
          </div>
          <span className="font-medium">{item.name}</span>
        </Link>
      ))}
    </div>
  );

  const renderAdminMenuItems = (): React.ReactElement => {
    const getSectionState = (section: string) => {
      switch (section) {
        case 'settings': return adminSettingsOpen;
        case 'manageFeatures': return adminManageFeaturesOpen;
        case 'postSettings': return adminPostSettingsOpen;
        case 'store': return adminStoreOpen;
        case 'forums': return adminForumsOpen;
        case 'movies': return adminMoviesOpen;
        case 'games': return adminGamesOpen;
        case 'categories': return adminCategoriesOpen;
        case 'customFields': return adminCustomFieldsOpen;
        case 'languages': return adminLanguagesOpen;
        case 'users': return adminUsersOpen;
        case 'payments': return adminPaymentsOpen;
        case 'proSystem': return adminProSystemOpen;
        case 'design': return adminDesignOpen;
        case 'tools': return adminToolsOpen;
        case 'pages': return adminPagesOpen;
        case 'reports': return adminReportsOpen;
        case 'apiSettings': return adminApiSettingsOpen;
        default: return false;
      }
    };

    const toggleSection = (section: string) => {
      switch (section) {
        case 'settings': setAdminSettingsOpen(!adminSettingsOpen); break;
        case 'manageFeatures': setAdminManageFeaturesOpen(!adminManageFeaturesOpen); break;
        case 'postSettings': setAdminPostSettingsOpen(!adminPostSettingsOpen); break;
        case 'store': setAdminStoreOpen(!adminStoreOpen); break;
        case 'forums': setAdminForumsOpen(!adminForumsOpen); break;
        case 'movies': setAdminMoviesOpen(!adminMoviesOpen); break;
        case 'games': setAdminGamesOpen(!adminGamesOpen); break;
        case 'categories': setAdminCategoriesOpen(!adminCategoriesOpen); break;
        case 'customFields': setAdminCustomFieldsOpen(!adminCustomFieldsOpen); break;
        case 'languages': setAdminLanguagesOpen(!adminLanguagesOpen); break;
        case 'users': setAdminUsersOpen(!adminUsersOpen); break;
        case 'payments': setAdminPaymentsOpen(!adminPaymentsOpen); break;
        case 'proSystem': setAdminProSystemOpen(!adminProSystemOpen); break;
        case 'design': setAdminDesignOpen(!adminDesignOpen); break;
        case 'tools': setAdminToolsOpen(!adminToolsOpen); break;
        case 'pages': setAdminPagesOpen(!adminPagesOpen); break;
        case 'reports': setAdminReportsOpen(!adminReportsOpen); break;
        case 'apiSettings': setAdminApiSettingsOpen(!adminApiSettingsOpen); break;
      }
    };

    return (
      <div className="space-y-1">
        {adminMenuItems.map((item, index) => {
          const isSectionOpen = item.section ? getSectionState(item.section) : false;
          const subSection = (item as any).subSection;
          const isSubSectionOpen = subSection ? getSectionState(subSection) : false;

          // Find the parent item with subSection if this item is a sub-item of a sub-section
          let parentSubSection: string | null = null;
          if (item.isSubItem && !subSection) {
            // Look backwards to find the most recent item with a subSection that matches
            for (let i = index - 1; i >= 0; i--) {
              const prevItem = adminMenuItems[i];
              if (prevItem.isSubItem && prevItem.section === item.section && (prevItem as any).subSection) {
                parentSubSection = (prevItem as any).subSection;
                break;
              }
            }
          }

          // Determine if item should be shown
          let shouldShow = true;

          if (item.isSubItem) {
            // First check if parent section is open
            if (item.section && !isSectionOpen) {
              shouldShow = false;
            }
            // If this item has a subSection
            else if (subSection) {
              // If it has hasPlus, it's an expandable parent (Store, Forums, etc.)
              // Show it if parent section is open
              if (item.hasPlus) {
                shouldShow = !item.section || isSectionOpen;
              }
              // If it doesn't have hasPlus, it's a child of a sub-section (Store Settings, Manage Products, etc.)
              // Show it only if both parent section AND sub-section are open
              else {
                shouldShow = isSectionOpen && isSubSectionOpen;
              }
            }
            // If this item is a sub-item of a sub-section (fallback for items without subSection property)
            // Show it only if both parent section AND sub-section are open
            else if (parentSubSection) {
              const parentSubSectionOpen = getSectionState(parentSubSection);
              shouldShow = isSectionOpen && parentSubSectionOpen;
            }
            // If this is a regular sub-item with a section but no subSection (like Settings sub-items)
            // Show it if the parent section is open
            else if (item.section) {
              shouldShow = isSectionOpen;
            }
          }

          if (!shouldShow) return null;

          // Determine which section state to use for the plus icon
          const sectionToCheck = subSection ? subSection : item.section;
          const sectionStateForIcon = sectionToCheck ? getSectionState(sectionToCheck) : false;

          const menuItemContent = (
            <div className="flex items-center justify-between px-3 py-2 rounded-md cursor-pointer transition-colors">
              <div className="flex items-center gap-2 min-w-0">
                <span className="text-sm flex-shrink-0">{item.icon}</span>
                <span className="font-medium text-xs truncate">{item.name}</span>
              </div>
              {item.hasPlus && (
                <span className={`${isDarkMode ? 'text-gray-400' : 'text-gray-700'} transition-transform duration-200 text-xs flex-shrink-0 ${sectionStateForIcon ? 'rotate-45' : ''
                  }`}>
                  {sectionStateForIcon ? '−' : '+'}
                </span>
              )}
            </div>
          );

          // Determine indentation level
          // Level 1: sub-items of main sections (ml-3)
          // Level 2: sub-items of sub-sections (ml-6)
          const indentLevel = item.isSubItem ? (parentSubSection ? 'ml-6' : 'ml-3') : '';

          // Check if current pathname matches this item's href
          const isActive = item.href ? pathname === item.href || pathname.startsWith(item.href + '/') : false;

          return (
            <div key={index} className={indentLevel}>
              {item.href ? (
                <Link
                  href={item.href}
                  className={`block ${isActive
                    ? 'bg-gray-700 text-white'
                    : isDarkMode
                      ? 'text-gray-300 hover:bg-gray-700 hover:text-white'
                      : 'text-gray-900 hover:bg-gray-200 hover:text-gray-900'
                    }`}
                  onClick={(e) => {
                    if (item.hasPlus && subSection) {
                      e.preventDefault();
                      toggleSection(subSection);
                    } else if (item.hasPlus && item.section) {
                      e.preventDefault();
                      toggleSection(item.section);
                    }
                  }}
                >
                  {menuItemContent}
                </Link>
              ) : (
                <div
                  className={`${isActive
                    ? 'bg-gray-700 text-white'
                    : isDarkMode
                      ? 'text-gray-300 hover:bg-gray-700 hover:text-white'
                      : 'text-gray-900 hover:bg-gray-200 hover:text-gray-900'
                    }`}
                  onClick={() => {
                    if (item.hasPlus && subSection) {
                      toggleSection(subSection);
                    } else if (item.hasPlus && item.section) {
                      toggleSection(item.section);
                    }
                  }}
                >
                  {menuItemContent}
                </div>
              )}
            </div>
          );
        })}
      </div>
    );
  };

  // Main component return
  return (
    <div className={`${isReelsPage ? 'h-screen overflow-hidden' : 'min-h-screen'} overflow-x-hidden transition-colors duration-200 ${isDarkMode ? 'bg-gray-900' : 'bg-gray-50'
      }`} style={{
        padding: '0',
        ...(isReelsPage && { overflowY: 'hidden', height: '100vh' })
      }}>
      {/* Popup Modals */}
      {popup.isOpen && (
        <div className="fixed inset-0 flex items-center justify-center z-[100] p-4 bg-black bg-opacity-50">
          <div className={`rounded-2xl shadow-2xl max-w-md w-full mx-4 transform transition-all duration-300 scale-100 ${isDarkMode ? 'bg-gray-800' : 'bg-white'
            }`}>
            <div className="p-6">
              <div className="flex items-center justify-center mb-4">
                {popup.type === 'success' ? (
                  <div className={`w-16 h-16 rounded-full flex items-center justify-center transition-colors duration-200 ${isDarkMode ? 'bg-green-900/30' : 'bg-green-100'
                    }`}>
                    <svg className={`w-8 h-8 transition-colors duration-200 ${isDarkMode ? 'text-green-400' : 'text-green-500'
                      }`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                    </svg>
                  </div>
                ) : popup.type === 'error' ? (
                  <div className={`w-16 h-16 rounded-full flex items-center justify-center transition-colors duration-200 ${isDarkMode ? 'bg-red-900/30' : 'bg-red-100'
                    }`}>
                    <svg className={`w-8 h-8 transition-colors duration-200 ${isDarkMode ? 'text-red-400' : 'text-red-500'
                      }`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
                    </svg>
                  </div>
                ) : (
                  <div className={`w-16 h-16 rounded-full flex items-center justify-center transition-colors duration-200 ${isDarkMode ? 'bg-blue-900/30' : 'bg-blue-100'
                    }`}>
                    <svg className={`w-8 h-8 transition-colors duration-200 ${isDarkMode ? 'text-blue-400' : 'text-blue-500'
                      }`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0 1 18 0z"></path>
                    </svg>
                  </div>
                )}
              </div>

              <div className="text-center">
                <h3 className={`text-xl font-semibold mb-2 transition-colors duration-200 ${isDarkMode ? 'text-white' : 'text-gray-900'
                  }`}>{popup.title}</h3>
                <p className={`mb-6 transition-colors duration-200 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'
                  }`}>{popup.message}</p>

                {(popup.title !== 'Logging Out...' && popup.title !== 'Redirecting...') && (
                  <button
                    onClick={closePopup}
                    className={`w-full py-3 px-1 rounded-xl font-medium transition-all duration-200 ${popup.type === 'success'
                      ? 'bg-green-500 hover:bg-green-600 text-white'
                      : popup.type === 'error'
                        ? 'bg-red-500 hover:bg-red-600 text-white'
                        : 'bg-blue-500 hover:bg-blue-600 text-white'
                      }`}
                  >
                    OK
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Switch Account Modal */}
      {switchAccountModal.isOpen && (
        <div className="fixed inset-0 flex items-center justify-center z-[100] p-4 bg-black bg-opacity-50">
          <div className={`rounded-2xl shadow-2xl max-w-md w-full mx-4 transition-colors duration-200 ${isDarkMode ? 'bg-gray-800' : 'bg-white'
            }`}>
            <div className="p-6 relative">
              <button
                onClick={() => setSwitchAccountModal({ isOpen: false })}
                className={`absolute top-4 right-4 text-2xl font-bold w-8 h-8 flex items-center justify-center rounded-full transition-colors duration-200 ${isDarkMode
                  ? 'text-gray-400 hover:text-gray-200'
                  : 'text-gray-500 hover:text-gray-700'
                  }`}
              >
                ×
              </button>

              <div className="text-center pt-4">
                <div className={`w-16 h-16 rounded-full flex items-center justify-center mb-4 mx-auto transition-colors duration-200 ${isDarkMode ? 'bg-blue-900/30' : 'bg-blue-100'
                  }`}>
                  <svg className={`w-8 h-8 transition-colors duration-200 ${isDarkMode ? 'text-blue-400' : 'text-blue-500'
                    }`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 1 1 0 5.292M15 21H3v-1a6 6 0 0 1 12 0v1zm0 0h6v-1a6 6 0 0 0-9-5.197m13.5-1a5 5 0 1 1-11 0 5 5 0 0 1 11 0z"></path>
                  </svg>
                </div>

                <h3 className={`text-xl font-semibold mb-2 transition-colors duration-200 ${isDarkMode ? 'text-white' : 'text-gray-900'
                  }`}>Switch Account</h3>
                <p className={`mb-6 transition-colors duration-200 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'
                  }`}>Would you like to add a new account?</p>

                <div className="space-y-3">
                  <button
                    onClick={handleAddAccount}
                    className="w-full py-3 px-1 rounded-xl font-medium transition-all duration-200 bg-blue-500 hover:bg-blue-600 text-white"
                  >
                    Add Account
                  </button>

                  <button
                    onClick={() => setSwitchAccountModal({ isOpen: false })}
                    className={`w-full py-3 px-1 rounded-xl font-medium transition-all duration-200 ${isDarkMode
                      ? 'bg-gray-700 hover:bg-gray-600 text-gray-200'
                      : 'bg-gray-200 hover:bg-gray-300 text-gray-800'
                      }`}
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Navbar */}
      {!isMessagesPage && !isVideoCallPage && (
        <nav className={`w-full flex justify-center items-center px-1 py-3 z-[50] fixed top-0 left-0 shadow-md border-b transition-colors duration-200 ${isAdminPage
          ? 'bg-gray-800 border-gray-700'
          : isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
          }`}>
          <div className="flex items-center gap-2 w-full max-w-7xl justify-between mx-auto">

            {/* Left Side - Mobile Menu + Logo */}
            <div className="flex items-center gap-3">
              {/* Mobile Menu Button */}
              {isMobile && (
                <button
                  onClick={() => {
                    setSidebarOpen(!sidebarOpen);
                    // Close profile sidebar when opening main sidebar
                    if (!sidebarOpen) {
                      setProfileSidebarOpen(false);
                    }
                  }}
                  className={`w-10 h-10 rounded-lg text-white flex items-center justify-center shadow-sm transition-colors ${isDarkMode ? 'bg-blue-500 hover:bg-blue-600' : 'bg-blue-600 hover:bg-blue-700'
                    }`}
                >
                  ☰
                </button>
              )}

              {/* Logo */}
              <Link href="/dashboard" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
                <div className={`${isDarkMode ? 'bg-blue-500' : 'bg-blue-600'} rounded-lg w-8 h-8 flex items-center justify-center shadow-sm`}>
                  <span className="text-white text-lg font-bold">J</span>
                </div>
                <span className={`text-xl font-bold tracking-wide hidden sm:block ${isDarkMode ? 'text-blue-400' : 'text-blue-600'}`}>
                  jaifriend
                </span>
              </Link>
            </div>

            {/* Center - Search Bar (Hidden on mobile and tablet) */}
            <div className="hidden lg:flex flex-1 justify-center max-w-lg mx-4 search-container relative">
              <div className={`rounded-full px-1 py-2 w-full flex items-center gap-2 focus-within:ring-2 focus-within:ring-blue-400 transition-all ${isAdminPage
                ? 'bg-gray-700 focus-within:bg-gray-600'
                : isDarkMode
                  ? 'bg-gray-700 focus-within:bg-gray-600'
                  : 'bg-gray-100 focus-within:bg-white'
                }`}>
                <span className={`text-sm ${isAdminPage ? 'text-gray-400' : isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>🔍</span>
                <input
                  type="text"
                  placeholder="Search for people, pages, groups and #hashtags"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onFocus={() => {
                    if (searchQuery.trim().length >= 3) {
                      setShowSearchResults(true);
                    }
                  }}
                  className={`bg-transparent outline-none border-none flex-1 text-sm ${isAdminPage
                    ? 'placeholder-gray-400 text-white'
                    : isDarkMode
                      ? 'placeholder-gray-500 text-white'
                      : 'placeholder-gray-400 text-gray-900'
                    }`}
                />
                {isSearching && (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-500"></div>
                )}
              </div>

              {/* Search Results Dropdown */}
              {showSearchResults && searchResults.length > 0 && (
                <div className={`absolute top-full left-0 right-0 mt-2 rounded-xl shadow-xl max-h-96 overflow-y-auto z-50 ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
                  } border`}>
                  <div className={`p-3 border-b ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
                    <h3 className={`text-sm font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                      Search Results ({searchResults.length})
                    </h3>
                  </div>
                  <div className={`divide-y ${isDarkMode ? 'divide-gray-700' : 'divide-gray-200'}`}>
                    {searchResults.map((result, index) => (
                      <div
                        key={index}
                        className={`p-3 cursor-pointer transition-colors ${isDarkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-50'}`}
                        onClick={() => {
                          if (result.type === 'user') {
                            router.push(`/dashboard/profile/${result.id}`);
                          } else if (result.type === 'post') {
                            router.push(`/dashboard/post/${result.id}`);
                          } else if (result.type === 'group') {
                            router.push(`/dashboard/groups/${result.id}`);
                          } else if (result.type === 'album') {
                            router.push(`/dashboard/albums/${result.id}`);
                          }
                          setShowSearchResults(false);
                          setSearchQuery('');
                        }}
                      >
                        <div className="flex items-center space-x-3">
                          <div className="flex-shrink-0">
                            {result.type === 'user' ? (
                              <img
                                src={result.avatar || '/default-avatar.svg'}
                                alt={result.title}
                                className="w-10 h-10 rounded-full object-cover border border-gray-200"
                                onError={(e) => {
                                  e.currentTarget.src = '/default-avatar.svg';
                                }}
                              />
                            ) : (
                              <div className={`w-10 h-10 rounded-full flex items-center justify-center ${result.type === 'post' ? 'bg-blue-500' :
                                result.type === 'group' ? 'bg-green-500' :
                                  'bg-purple-500'
                                }`}>
                                <span className="text-white font-medium text-sm">
                                  {result.type === 'post' ? 'P' : result.type === 'group' ? 'G' : 'A'}
                                </span>
                              </div>
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className={`text-sm font-medium truncate ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                              {result.title}
                            </p>
                            <p className={`text-xs truncate ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                              {result.subtitle}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* No Results Message */}
              {showSearchResults && searchQuery.trim().length >= 2 && searchResults.length === 0 && !isSearching && (
                <div className={`absolute top-full left-0 right-0 mt-2 rounded-xl shadow-xl border z-50 ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
                  }`}>
                  <div className="p-4 text-center">
                    <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                      No results found for "{searchQuery}"
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Right Side Icons */}
            <div className="flex items-center gap-1 relative">
              {/* Mobile Search Icon */}
              {isMobile && (
                <button
                  onClick={() => setShowSearchResults(!showSearchResults)}
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-lg transition-all ${isAdminPage
                    ? 'bg-gray-700 hover:bg-gray-600 text-gray-300'
                    : isDarkMode
                      ? 'bg-gray-700 hover:bg-gray-600 text-gray-300'
                      : 'bg-gray-100 hover:bg-gray-200 text-gray-600'
                    }`}>
                  🔍
                </button>
              )}

              {/* Mobile Search Modal */}
              {isMobile && showSearchResults && (
                <div
                  className="fixed inset-0 z-50 bg-black bg-opacity-50 flex items-start justify-center pt-20 px-1 mobile-search-overlay"
                  onClick={(e) => {
                    if (e.target === e.currentTarget) {
                      setShowSearchResults(false);
                    }
                  }}
                >
                  <div
                    className={`rounded-xl shadow-xl w-full max-w-md max-h-96 overflow-hidden ${isDarkMode ? 'bg-gray-800' : 'bg-white'}`}
                    onClick={(e) => e.stopPropagation()}
                  >
                    <div className={`p-4 border-b ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">🔍</span>
                        <input
                          type="text"
                          placeholder="Search for people, pages, groups and #hashtags"
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                          className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${isDarkMode
                            ? 'border-gray-600 bg-gray-700 text-white placeholder-gray-400'
                            : 'border-gray-300 bg-gray-50 text-gray-900 placeholder-gray-500'
                            }`}
                          autoFocus
                        />
                        {isSearching && (
                          <div className="absolute right-3 top-1/2 transform -translate-y-1/2 animate-spin rounded-full h-5 w-5 border-b-2 border-blue-500"></div>
                        )}
                      </div>
                    </div>

                    {searchResults.length > 0 && (
                      <div className="max-h-80 overflow-y-auto">
                        <div className={`p-3 border-b ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
                          <h3 className={`text-sm font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                            Search Results ({searchResults.length})
                          </h3>
                        </div>
                        <div className={`divide-y ${isDarkMode ? 'divide-gray-700' : 'divide-gray-200'}`}>
                          {searchResults.map((result, index) => {
                            const resultId = result.id || result._id;
                            const path = result.type === 'user' ? `/dashboard/profile/${resultId}` :
                              result.type === 'post' ? `/dashboard/post/${resultId}` :
                                result.type === 'group' ? `/dashboard/groups/${resultId}` :
                                  result.type === 'album' ? `/dashboard/albums/${resultId}` : '#';

                            const handleTouchResult = (e: React.TouchEvent | React.MouseEvent) => {
                              // Use touch events for mobile to avoid the 300ms delay and event cancellation
                              e.preventDefault();
                              e.stopPropagation();

                              console.log('📱 Mobile search result clicked:', { type: result.type, id: resultId, path });

                              if (path && path !== '#') {
                                // Dismiss keyboard on mobile
                                if (typeof document !== 'undefined' && document.activeElement instanceof HTMLElement) {
                                  document.activeElement.blur();
                                }

                                // Close results immediately
                                setShowSearchResults(false);
                                setSearchQuery('');

                                // Direct navigation
                                window.location.href = path;
                              }
                            };

                            return (
                              <div
                                key={index}
                                onTouchEnd={handleTouchResult}
                                onClick={handleTouchResult}
                                className={`block p-3 cursor-pointer transition-colors ${isDarkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-50'}`}
                              >
                                <div className="flex items-center space-x-3 pointer-events-none">
                                  <div className="flex-shrink-0">
                                    {result.type === 'user' ? (
                                      <img
                                        src={result.avatar || '/default-avatar.svg'}
                                        alt={result.title}
                                        className="w-10 h-10 rounded-full object-cover border border-gray-200"
                                        onError={(e) => {
                                          e.currentTarget.src = '/default-avatar.svg';
                                        }}
                                      />
                                    ) : (
                                      <div className={`w-10 h-10 rounded-full flex items-center justify-center ${result.type === 'post' ? 'bg-blue-500' :
                                        result.type === 'group' ? 'bg-green-500' :
                                          'bg-purple-500'
                                        }`}>
                                        <span className="text-white font-medium text-sm">
                                          {result.type === 'post' ? 'P' : result.type === 'group' ? 'G' : 'A'}
                                        </span>
                                      </div>
                                    )}
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    <p className={`text-sm font-medium truncate ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                                      {result.title}
                                    </p>
                                    <p className={`text-xs truncate ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                                      {result.subtitle}
                                    </p>
                                  </div>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}

                    {searchQuery.trim().length >= 3 && searchResults.length === 0 && !isSearching && (
                      <div className="p-4 text-center">
                        <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                          No results found for "{searchQuery}"
                        </p>
                      </div>
                    )}

                    <div className={`p-3 border-t ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
                      <button
                        onClick={() => setShowSearchResults(false)}
                        className={`w-full py-2 text-sm transition-colors ${isDarkMode
                          ? 'text-gray-400 hover:text-gray-200'
                          : 'text-gray-500 hover:text-gray-700'
                          }`}
                      >
                        Close
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Desktop Icons Only */}
              {!isMobile && (
                <>
                  {/* People Icon */}
                  <div className="dropdown-container relative">
                    <button
                      className={`w-8 h-8 rounded-full flex items-center justify-center text-lg transition-all touch-manipulation ${openDropdown === 'people'
                        ? isAdminPage
                          ? 'bg-blue-900/50 text-blue-400'
                          : isDarkMode
                            ? 'bg-blue-900/50 text-blue-400'
                            : 'bg-blue-100 text-blue-600'
                        : isAdminPage
                          ? 'bg-gray-700 hover:bg-gray-600 text-gray-300'
                          : isDarkMode
                            ? 'bg-gray-700 hover:bg-gray-600 text-gray-300'
                            : 'bg-gray-100 hover:bg-gray-200 text-gray-600'
                        }`}
                      onClick={() => handleDropdownClick('people')}
                      onTouchStart={(e) => {
                        e.preventDefault();
                        handleDropdownClick('people');
                      }}
                      style={{ touchAction: 'manipulation' }}
                    >
                      👥
                    </button>

                    {openDropdown === 'people' && (
                      <div className={`absolute top-10 right-0 w-72 rounded-xl shadow-xl p-4 z-50 border ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
                        }`}>
                        <div className="flex flex-col items-center text-center">
                          <div className={`w-12 h-12 rounded-full flex items-center justify-center mb-3 ${isDarkMode ? 'bg-purple-900/30' : 'bg-purple-100'
                            }`}>
                            <span className={`text-lg ${isDarkMode ? 'text-purple-400' : 'text-purple-600'}`}>👥</span>
                          </div>
                          <h3 className={`text-base font-semibold mb-1 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                            You do not have any requests
                          </h3>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Messages Icon */}
                  <div className="dropdown-container relative">
                    <button
                      className={`w-8 h-8 rounded-full flex items-center justify-center text-lg transition-all touch-manipulation ${openDropdown === 'messages'
                        ? isAdminPage
                          ? 'bg-blue-900/50 text-blue-400'
                          : isDarkMode
                            ? 'bg-blue-900/50 text-blue-400'
                            : 'bg-blue-100 text-blue-600'
                        : isAdminPage
                          ? 'bg-gray-700 hover:bg-gray-600 text-gray-300'
                          : isDarkMode
                            ? 'bg-gray-700 hover:bg-gray-600 text-gray-300'
                            : 'bg-gray-100 hover:bg-gray-200 text-gray-600'
                        }`}
                      onClick={() => handleDropdownClick('messages')}
                      onTouchStart={(e) => {
                        e.preventDefault();
                        handleDropdownClick('messages');
                      }}
                      style={{ touchAction: 'manipulation' }}
                    >
                      💬
                    </button>

                    {openDropdown === 'messages' && (
                      <div className={`absolute top-10 right-0 w-72 rounded-xl shadow-xl p-4 z-50 border ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
                        }`}>
                        <div className="flex flex-col items-center text-center">
                          <div className={`w-12 h-12 rounded-full flex items-center justify-center mb-3 ${isDarkMode ? 'bg-red-900/30' : 'bg-red-100'
                            }`}>
                            <span className={`text-lg ${isDarkMode ? 'text-red-400' : 'text-red-500'}`}>💬</span>
                          </div>
                          <h3 className={`text-base font-semibold mb-1 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                            No more message
                          </h3>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Notifications Icon */}
                  <div className="relative group">
                    <button
                      className={`w-8 h-8 rounded-full flex items-center justify-center text-lg transition-all touch-manipulation ${isAdminPage
                        ? 'bg-gray-700 hover:bg-gray-600 text-gray-300'
                        : isDarkMode
                          ? 'bg-gray-700 hover:bg-gray-600 text-gray-300'
                          : 'bg-gray-200 hover:bg-gray-300 text-gray-600'
                        }`}
                      onClick={() => router.push('/dashboard/notifications')}
                      onTouchStart={(e) => {
                        e.preventDefault();
                        router.push('/dashboard/notifications');
                      }}
                      style={{ touchAction: 'manipulation' }}
                    >
                      🔔
                    </button>

                    {/* Tooltip */}
                    <div className="absolute top-full left-1/2 transform -translate-x-1/2 mt-2 px-3 py-2 bg-gray-900 dark:bg-gray-700 text-white text-sm rounded-lg shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-50">
                      {notificationCount > 0
                        ? `${notificationCount} unread notification${notificationCount !== 1 ? 's' : ''}`
                        : 'No new notifications'
                      }
                      <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-b-4 border-transparent border-b-gray-900 dark:border-b-gray-700"></div>
                    </div>

                    {/* Notification count badge */}
                    {notificationCount > 0 && (
                      <span className={`absolute -top-1 -right-1 min-w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center font-bold transition-all duration-300 shadow-lg ${notificationCount > lastNotificationCount && lastNotificationCount > 0
                        ? 'animate-bounce scale-110 ring-4 ring-red-300 ring-opacity-50'
                        : 'animate-pulse'
                        }`}>
                        {notificationCount > 99 ? '99+' : notificationCount}
                      </span>
                    )}

                    {/* Pulsing dot for new notifications */}
                    {notificationCount > 0 && (
                      <div className={`absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full transition-all duration-300 ${notificationCount > lastNotificationCount && lastNotificationCount > 0
                        ? 'animate-ping scale-150'
                        : 'opacity-0'
                        }`}></div>
                    )}
                  </div>
                </>
              )}

              {/* Profile Avatar */}
              <div className="dropdown-container relative">
                <button
                  className={`w-8 h-8 rounded-full overflow-hidden transition-all touch-manipulation ${profileSidebarOpen
                    ? 'ring-2 ring-blue-200 dark:ring-blue-800'
                    : 'hover:ring-2 hover:ring-gray-200 dark:hover:ring-gray-600'
                    }`}
                  onClick={() => handleDropdownClick('profile')}
                  onTouchStart={(e) => {
                    e.preventDefault();
                    handleDropdownClick('profile');
                  }}
                  style={{ touchAction: 'manipulation' }}
                >
                  <img
                    src={profile.avatar}
                    alt="Profile"
                    className="w-full h-full object-cover pointer-events-none"
                  />
                </button>
              </div>
            </div>
          </div>
        </nav>
      )}

      {/* Layout Container */}
      <div className="flex" style={{ padding: '0', margin: '0' }}>
        {/* Followers Sidebar */}
        {!isVideoCallPage && <FollowersSidebar isAdminPage={isAdminPage} />}

        {/* Mobile Sidebar Overlay */}
        {isMobile && (sidebarOpen || profileSidebarOpen) && (
          <div className="fixed inset-0 bg-black bg-opacity-50 z-[45]" onClick={() => {
            setSidebarOpen(false);
            setProfileSidebarOpen(false);
          }} />
        )}

        {/* Mobile Profile Sidebar */}
        {isMobile && profileSidebarOpen && (
          <aside
            className={`fixed inset-0 z-[50] w-full h-full transform transition-all duration-300 ${isDarkMode
              ? 'bg-gray-900 border-l border-gray-700'
              : 'bg-white border-l border-gray-200'
              }`}
          >
            <div className={`px-3 py-2 border-b flex items-center justify-between ${isDarkMode
              ? 'border-gray-700'
              : 'border-gray-200'
              }`}>
              <h2 className={`font-bold text-lg ${isDarkMode
                ? 'text-white'
                : 'text-gray-900'
                }`}>Profile</h2>
              <button
                onClick={() => setProfileSidebarOpen(false)}
                className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors ${isDarkMode
                  ? 'bg-gray-700 hover:bg-gray-600 text-gray-300'
                  : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                  }`}
              >
                ✕
              </button>
            </div>

            <div className="flex-1 px-3 pt-2 pb-3 overflow-y-auto">
              {/* Profile Section */}
              <div className={`flex items-center gap-2 mb-2 p-2 rounded-lg ${isDarkMode
                ? 'bg-gray-800'
                : 'bg-gray-50'
                }`}>
                <img
                  src={profile.avatar}
                  alt="avatar"
                  className={`w-12 h-12 rounded-full object-cover ${isDarkMode
                    ? 'border border-gray-600'
                    : 'border border-gray-200'
                    }`}
                />
                <div className="flex flex-col">
                  <span
                    className={`font-semibold text-sm cursor-pointer transition-colors ${isDarkMode
                      ? 'text-white hover:text-blue-400'
                      : 'text-gray-900 hover:text-blue-600'
                      }`}
                    onClick={handleMyProfile}
                  >
                    My Profile
                  </span>
                  <div
                    className={`flex items-center gap-2 mt-1 cursor-pointer transition-colors ${isDarkMode ? 'hover:text-blue-400' : 'hover:text-blue-600'
                      }`}
                    onClick={() => {
                      router.push('/dashboard/wallet');
                      setProfileSidebarOpen(false);
                    }}
                  >
                    <svg
                      className={`w-4 h-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                    <span className={`text-sm font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                      {formatBalance(profile.balance)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Menu Items */}
              <div className="space-y-1">
                <button
                  className="flex items-center gap-2 py-2 px-3 rounded-md text-left w-full transition-all duration-200"
                  onClick={() => {
                    handleSwitchAccount();
                    closeProfileSidebar();
                  }}
                  style={{
                    background: '#ffffff',
                    borderRadius: '8px',
                    boxShadow: '2px 2px 4px rgba(0, 0, 0, 0.1), -2px -2px 4px rgba(255, 255, 255, 0.9)',
                    border: '1px solid #e5e7eb'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = '#f8fafc';
                    e.currentTarget.style.boxShadow = '3px 3px 6px rgba(0, 0, 0, 0.15), -3px -3px 6px rgba(255, 255, 255, 1)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = '#ffffff';
                    e.currentTarget.style.boxShadow = '2px 2px 4px rgba(0, 0, 0, 0.1), -2px -2px 4px rgba(255, 255, 255, 0.9)';
                  }}
                >
                  <span className="p-1.5 rounded-full text-sm" style={{
                    background: '#f1f5f9',
                    boxShadow: 'inset 1px 1px 2px rgba(0, 0, 0, 0.1), inset -1px -1px 2px rgba(255, 255, 255, 0.9)'
                  }}>🔄</span>
                  <span className="font-medium text-gray-900 text-sm">Switch Account</span>
                </button>

                <button
                  className={`flex items-center gap-2 py-2 px-3 rounded-md text-left w-full transition-colors ${isDarkMode
                    ? 'hover:bg-gray-700'
                    : 'hover:bg-gray-50'
                    }`}
                  onClick={() => {
                    router.push('/dashboard/upgrade');
                    closeProfileSidebar();
                  }}
                >
                  <span className={`p-1.5 rounded-full text-sm ${isDarkMode
                    ? 'bg-gray-700'
                    : 'bg-gray-100'
                    }`}>🛠️</span>
                  <span className={`font-medium text-sm ${isDarkMode
                    ? 'text-white'
                    : 'text-gray-900'
                    }`}>
                    {(() => {
                      try {
                        const user = JSON.parse(localStorage.getItem('user') || '{}');
                        return user.plan && user.plan !== 'Free' ? 'Subscription' : 'Upgrade To Pro';
                      } catch {
                        return 'Upgrade To Pro';
                      }
                    })()}
                  </span>
                </button>

                <button
                  className={`flex items-center gap-2 py-2 px-3 rounded-md text-left w-full transition-colors ${isDarkMode
                    ? 'hover:bg-gray-700'
                    : 'hover:bg-gray-50'
                    }`}
                  onClick={() => {
                    router.push('/dashboard/advertising');
                    closeProfileSidebar();
                  }}
                >
                  <span className={`p-1.5 rounded-full text-sm ${isDarkMode
                    ? 'bg-gray-700'
                    : 'bg-gray-100'
                    }`}>📢</span>
                  <span className={`font-medium text-sm ${isDarkMode
                    ? 'text-white'
                    : 'text-gray-900'
                    }`}>Advertising</span>
                </button>



                <div className={`my-2 ${isDarkMode
                  ? 'border-gray-600'
                  : 'border-gray-200'
                  } border-t`}></div>

                <button
                  className={`flex items-center gap-2 py-2 px-3 rounded-md text-left w-full transition-colors ${isDarkMode
                    ? 'hover:bg-gray-700'
                    : 'hover:bg-gray-50'
                    }`}
                  onClick={() => {
                    router.push('/dashboard/settings/privacy');
                    setProfileSidebarOpen(false);
                  }}
                >
                  <span className={`p-1.5 rounded-full text-sm ${isDarkMode
                    ? 'bg-gray-700'
                    : 'bg-gray-100'
                    }`}>✔️</span>
                  <span className={`font-medium text-sm ${isDarkMode
                    ? 'text-white'
                    : 'text-gray-900'
                    }`}>Privacy Setting</span>
                </button>

                <button
                  className={`flex items-center gap-2 py-2 px-3 rounded-md text-left w-full transition-colors ${isDarkMode
                    ? 'hover:bg-gray-700'
                    : 'hover:bg-gray-50'
                    }`}
                  onClick={() => {
                    router.push('/dashboard/settings');
                    closeProfileSidebar();
                  }}
                >
                  <span className={`p-1.5 rounded-full text-sm ${isDarkMode
                    ? 'bg-gray-700'
                    : 'bg-gray-100'
                    }`}>⚙️</span>
                  <span className={`font-medium text-sm ${isDarkMode
                    ? 'text-white'
                    : 'text-gray-900'
                    }`}>General Setting</span>
                </button>

                <button
                  className={`flex items-center gap-2 py-2 px-3 rounded-md text-left w-full transition-colors ${isDarkMode
                    ? 'hover:bg-gray-700'
                    : 'hover:bg-gray-50'
                    }`}
                  onClick={() => {
                    router.push('/dashboard/invite');
                    closeProfileSidebar();
                  }}
                >
                  <span className={`p-1.5 rounded-full text-sm ${isDarkMode
                    ? 'bg-gray-700'
                    : 'bg-gray-100'
                    }`}>✉️</span>
                  <span className={`font-medium text-sm ${isDarkMode
                    ? 'text-white'
                    : 'text-gray-900'
                    }`}>Invite Your Friends</span>
                </button>

                <button
                  className={`flex items-center gap-2 py-2 px-3 rounded-md text-left w-full transition-colors ${isDarkMode
                    ? 'hover:bg-gray-700'
                    : 'hover:bg-gray-50'
                    }`}
                  onClick={() => {
                    router.push('/dashboard/admin');
                    setProfileSidebarOpen(false);
                  }}
                >
                  <span className={`p-1.5 rounded-full text-sm ${isDarkMode
                    ? 'bg-gray-700'
                    : 'bg-gray-100'
                    }`}>👑</span>
                  <span className={`font-medium text-sm ${isDarkMode
                    ? 'text-white'
                    : 'text-gray-900'
                    }`}>Admin Dashboard</span>
                </button>

                <div className="border-t border-gray-200 dark:border-gray-600 my-2"></div>

                <div className="space-y-2 p-4">
                  <div className="flex items-center gap-3 py-3 px-1">
                    <span className="bg-gray-100 dark:bg-gray-700 p-2 rounded-full text-lg">🌙</span>
                    <span className="font-medium flex-1 text-gray-900 dark:text-white">
                      {isSystemMode ? 'Follow System' : 'Night mode'}
                    </span>
                    <input
                      type="checkbox"
                      id="night-mode-toggle-mobile"
                      className="form-checkbox h-5 w-5 text-blue-600 rounded focus:ring-blue-500 focus:ring-2"
                      checked={isDarkMode}
                      onChange={(e) => {
                        toggleDarkMode();
                      }}
                      aria-label="Toggle night mode"
                    />
                  </div>
                  {!isSystemMode && (
                    <button
                      className="flex items-center gap-2 py-2 px-1 text-sm text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors w-full"
                      onClick={resetToSystem}
                    >
                      <span className="text-sm">🔄</span>
                      <span>Reset to System</span>
                    </button>
                  )}
                </div>

                <button
                  className="flex items-center gap-3 py-3 px-1 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg text-left w-full transition-colors"
                  onClick={handleLogout}
                >
                  <span className="bg-gray-100 dark:bg-gray-700 p-2 rounded-full text-lg">🚪</span>
                  <span className="font-medium text-red-600 dark:text-red-400">Log Out</span>
                </button>
              </div>

              {/* Footer */}
              <div className={`mt-8 p-4 border-t ${isDarkMode
                ? 'border-gray-600'
                : 'border-gray-200'
                }`}>
                <div className={`text-xs flex flex-col items-center gap-2 ${isDarkMode
                  ? 'text-gray-400'
                  : 'text-gray-500'
                  }`}>
                  <div className="flex items-center gap-2">
                    <span>© 2025 Jaifriend</span>
                    <span>•</span>
                    <button className={`underline cursor-pointer transition-colors ${isDarkMode
                      ? 'hover:text-gray-300'
                      : 'hover:text-gray-700'
                      }`}>Language</button>
                  </div>
                  <div className="flex flex-wrap gap-2 justify-center">
                    <button className={`underline cursor-pointer transition-colors text-xs ${isDarkMode
                      ? 'hover:text-gray-300'
                      : 'hover:text-gray-700'
                      }`}>About</button>
                    <button className={`underline cursor-pointer transition-colors text-xs ${isDarkMode
                      ? 'hover:text-gray-300'
                      : 'hover:text-gray-700'
                      }`}>Directory</button>
                    <button className={`underline cursor-pointer transition-colors text-xs ${isDarkMode
                      ? 'hover:text-gray-300'
                      : 'hover:text-gray-700'
                      }`}>Contact Us</button>
                    <button className={`underline cursor-pointer transition-colors text-xs ${isDarkMode
                      ? 'hover:text-gray-300'
                      : 'hover:text-gray-700'
                      }`}>Developers</button>
                    <button className={`underline cursor-pointer transition-colors text-xs ${isDarkMode
                      ? 'hover:text-gray-300'
                      : 'hover:text-gray-700'
                      }`}>Privacy Policy</button>
                    <button className={`underline cursor-pointer transition-colors text-xs ${isDarkMode
                      ? 'hover:text-gray-300'
                      : 'hover:text-gray-700'
                      }`}>Terms of Use</button>
                    <button className={`underline cursor-pointer transition-colors text-xs ${isDarkMode
                      ? 'hover:text-gray-300'
                      : 'hover:text-gray-700'
                      }`}>Refund</button>
                  </div>
                </div>
              </div>
            </div>
          </aside>
        )}

        {/* Sidebar */}
        {!isMessagesPage && !isVideoCallPage && (isMobile ? (
          <>
            {/* Main Sidebar */}
            <aside className={`fixed left-0 top-0 w-full h-screen flex flex-col z-[50] transform transition-transform duration-300 ${isMobile
              ? (sidebarOpen ? 'translate-x-0' : '-translate-x-full')
              : 'translate-x-0'
              } ${mobileSidebarThemeClasses}`} style={{
                height: '100vh',
                top: '0',
                padding: '0',
                scrollbarWidth: 'thin',
                scrollbarColor: isAdminPage ? '#4A4A4A #2C2C2C' : isDarkMode ? '#4A4A4A #374151' : '#022e8a #f4f4f9',
                display: 'flex',
                flexDirection: 'column',
                overflow: 'hidden',
                boxShadow: isAdminPage ? 'none' : isDarkMode ? '6px 6px 12px rgba(0, 0, 0, 0.3), -6px -6px 12px rgba(0, 0, 0, 0.1)' : '6px 6px 12px rgba(0, 0, 0, 0.1), -6px -6px 12px rgba(255, 255, 255, 0.9)'
              }}>
              <div className="px-1 py-4">
                <div className="flex items-center justify-between mb-4">
                  <h2 className={`font-bold text-lg ${isAdminPage || isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                    {isSettingsPage ? 'Settings' : isAdminPage ? 'Admin' : 'Menu'}
                  </h2>
                  <button
                    onClick={() => setSidebarOpen(false)}
                    className={`w-8 h-8 rounded-full flex items-center justify-center hover:transition-colors ${isAdminPage || isDarkMode
                      ? 'bg-gray-800 hover:bg-gray-700 text-gray-200'
                      : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                      }`}
                    style={!isAdminPage ? {
                      boxShadow: isDarkMode ? '6px 6px 12px rgba(0, 0, 0, 0.3), -6px -6px 12px rgba(0, 0, 0, 0.1)' : '6px 6px 12px rgba(0, 0, 0, 0.1), -6px -6px 12px rgba(255, 255, 255, 0.9)'
                    } : {}}
                  >
                    ✕
                  </button>
                </div>
              </div>

              <div className="flex-1 overflow-y-auto scrollbar-hide px-1" style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {isSettingsPage ? (
                  <>
                    {/* Back to Dashboard */}
                    <div className="mb-2">
                      <Link
                        href="/dashboard"
                        className={`flex items-center gap-1.5 p-1.5 rounded-md transition-colors font-medium text-xs ${isDarkMode ? 'hover:bg-gray-700 text-gray-300' : 'hover:bg-gray-50 text-gray-700'}`}
                      >
                        <span>←</span>
                        <span>Back to Dashboard</span>
                      </Link>
                    </div>

                    {/* SETTINGS Section */}
                    <div className="mb-4">
                      <button
                        onClick={() => setSettingsOpen(!settingsOpen)}
                        className={`flex items-center justify-between w-full mb-3 p-3 rounded-lg transition-colors focus:outline-none ${isDarkMode ? 'hover:bg-gray-700' : 'hover:bg-[#eaf0fb]'
                          }`}
                      >
                        <h3 className={`font-bold text-base ${isDarkMode ? 'text-white' : 'text-[#022e8a]'}`}>SETTINGS</h3>
                        {!isMobile && (
                          <span className={`transition-transform duration-200 ${settingsOpen ? 'rotate-180' : ''} ${isDarkMode ? 'text-gray-300' : 'text-[#022e8a]'}`}>▼</span>
                        )}
                      </button>
                      {(settingsOpen || isMobile) && (
                        <div className="pl-1">
                          {renderSettingsMenuItems(settingsSections.settings)}
                        </div>
                      )}
                    </div>

                    {/* PROFILE Section */}
                    <div className="mb-4">
                      <button
                        onClick={() => setProfileSettingsOpen(!profileSettingsOpen)}
                        className={`flex items-center justify-between w-full mb-3 p-3 rounded-lg transition-colors focus:outline-none ${isDarkMode ? 'hover:bg-gray-700' : 'hover:bg-[#eaf0fb]'
                          }`}
                      >
                        <h3 className={`font-bold text-base ${isDarkMode ? 'text-white' : 'text-[#022e8a]'}`}>PROFILE</h3>
                        {!isMobile && (
                          <span className={`transition-transform duration-200 ${profileSettingsOpen ? 'rotate-180' : ''} ${isDarkMode ? 'text-gray-300' : 'text-[#022e8a]'}`}>▼</span>
                        )}
                      </button>
                      {(profileSettingsOpen || isMobile) && (
                        <div className="pl-1">
                          {renderSettingsMenuItems(settingsSections.profile)}
                        </div>
                      )}
                    </div>

                    {/* SECURITY Section */}
                    <div className="mb-4">
                      <button
                        onClick={() => setSecuritySettingsOpen(!securitySettingsOpen)}
                        className={`flex items-center justify-between w-full mb-3 p-3 rounded-lg transition-colors focus:outline-none ${isDarkMode ? 'hover:bg-gray-700' : 'hover:bg-[#eaf0fb]'
                          }`}
                      >
                        <h3 className={`font-bold text-base ${isDarkMode ? 'text-white' : 'text-[#022e8a]'}`}>SECURITY</h3>
                        {!isMobile && (
                          <span className={`transition-transform duration-200 ${securitySettingsOpen ? 'rotate-180' : ''} ${isDarkMode ? 'text-gray-300' : 'text-[#022e8a]'}`}>▼</span>
                        )}
                      </button>
                      {(securitySettingsOpen || isMobile) && (
                        <div className="pl-1">
                          {renderSettingsMenuItems(settingsSections.security)}
                        </div>
                      )}
                    </div>
                  </>
                ) : isAdminPage ? (
                  <>
                    {/* Admin Sidebar */}
                    <div className="space-y-1">
                      {renderAdminMenuItems()}
                    </div>
                  </>
                ) : (
                  <>
                    {/* All Menu Items */}
                    <div className="space-y-3">
                      {renderMenuItems([...menuSections.me, ...menuSections.community, ...menuSections.explore])}
                    </div>

                    {/* Footer */}
                    <div className="mt-8 p-3" style={{
                      background: isDarkMode ? '#374151' : '#ffffff',
                      borderRadius: '8px',
                      boxShadow: isDarkMode
                        ? '4px 4px 8px rgba(0, 0, 0, 0.3), -4px -4px 8px rgba(0, 0, 0, 0.1)'
                        : '4px 4px 8px rgba(0, 0, 0, 0.1), -4px -4px 8px rgba(255, 255, 255, 0.9)',
                      color: isDarkMode ? '#d1d5db' : '#2d2d2d',
                      fontSize: '12px',
                      width: '100%'
                    }}>
                      <div className="flex justify-between items-center mb-3">
                        <span>© 2025 Jaifriend</span>
                        <button className="px-3 py-1 rounded-md text-white text-sm transition-all duration-300" style={{
                          background: '#022e8a'
                        }} onMouseEnter={(e) => {
                          e.currentTarget.style.background = '#5d97fe';
                          e.currentTarget.style.boxShadow = '0 4px 8px rgba(93, 151, 254, 0.3)';
                        }} onMouseLeave={(e) => {
                          e.currentTarget.style.background = '#022e8a';
                          e.currentTarget.style.boxShadow = 'none';
                        }}>
                          Language
                        </button>
                      </div>
                      <div className="flex flex-wrap gap-3">
                        <a href="#" className={`text-xs hover:text-blue-600 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>Privacy</a>
                        <a href="#" className={`text-xs hover:text-blue-600 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>Terms</a>
                        <a href="#" className={`text-xs hover:text-blue-600 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>About</a>
                        <span className={`text-xs ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>Jaifriend</span>
                      </div>
                    </div>
                  </>
                )}
              </div>
            </aside>
          </>
        ) : (
          <>
            {/* Desktop Main Sidebar */}
            <aside className={`flex flex-col fixed left-0 top-0 h-screen transition-all duration-300 scrollbar-hide ${sidebarCollapsed ? 'w-16' : isAdminPage ? 'w-48' : 'w-64'
              } ${isDarkMode ? 'bg-gray-800' : 'bg-white'} ${isAdminPage ? 'bg-gray-900' : ''} ${isAdminPage ? '' : isDarkMode ? 'shadow-2xl' : 'shadow-lg'
              }`} style={{
                height: 'calc(100vh - 64px)',
                top: '64px',
                padding: '0',
                scrollbarWidth: 'thin',
                scrollbarColor: isAdminPage ? '#4A4A4A #2C2C2C' : isDarkMode ? '#4A4A4A #374151' : '#022e8a #f4f4f9',
                display: 'flex',
                flexDirection: 'column',
                overflow: 'hidden'
              }}>


              <div className="flex-1 overflow-y-auto scrollbar-hide px-1" style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {isSettingsPage ? (
                  <>
                    {!sidebarCollapsed && (
                      <div className="mb-2">
                        <Link
                          href="/dashboard"
                          className={`flex items-center gap-1.5 p-1.5 rounded-md transition-colors font-medium text-xs ${isDarkMode ? 'hover:bg-gray-700 text-gray-300' : 'hover:bg-gray-50 text-gray-700'}`}
                        >
                          <span>←</span>
                          <span>Back to Dashboard</span>
                        </Link>
                      </div>
                    )}

                    {/* SETTINGS Section */}
                    <div className="mb-2">
                      {!sidebarCollapsed && (
                        <button
                          onClick={() => setSettingsOpen(!settingsOpen)}
                          className={`flex items-center justify-between w-full mb-1 p-1.5 rounded-md transition-colors focus:outline-none ${isDarkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-50'
                            }`}
                        >
                          <h3 className={`font-semibold text-xs ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>SETTINGS</h3>
                          <span className={`transition-transform duration-200 text-xs ${settingsOpen ? 'rotate-180' : ''} ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>▼</span>
                        </button>
                      )}
                      {(settingsOpen || sidebarCollapsed) && (
                        <div className={sidebarCollapsed ? '' : 'pl-2'}>
                          {sidebarCollapsed ? (
                            <div className="flex flex-col gap-2">
                              {settingsSections.settings.map((item) => (
                                <Link
                                  key={item.name}
                                  href={item.href}
                                  className={`flex flex-col items-center gap-2 p-3 rounded-xl transition-all duration-200 group relative ${pathname === item.href
                                    ? isDarkMode
                                      ? 'bg-blue-600 text-white shadow-lg '
                                      : 'bg-blue-100 border-2 border-blue-300 shadow-md '
                                    : isDarkMode
                                      ? 'hover:bg-gray-700 text-gray-300'
                                      : 'hover:bg-gray-100 text-gray-700'
                                    }`}
                                  title={item.name}
                                >
                                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center text-xl shadow  transition-all duration-200 ${pathname === item.href
                                    ? isDarkMode
                                      ? 'bg-white/20 text-white'
                                      : 'bg-blue-200 text-blue-600'
                                    : isDarkMode
                                      ? 'bg-gray-600 text-gray-300'
                                      : 'bg-gray-100 text-gray-600'
                                    }`}>
                                    {item.icon}
                                  </div>
                                  <div className="absolute left-full ml-3 px-3 py-2 bg-gray-800 dark:bg-gray-700 text-white text-sm rounded-lg shadow-xl opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-50 pointer-events-none font-medium transform -translate-x-full">
                                    {item.name}
                                  </div>
                                </Link>
                              ))}
                            </div>
                          ) : (
                            renderSettingsMenuItems(settingsSections.settings)
                          )}
                        </div>
                      )}
                    </div>

                    {sidebarCollapsed && <div className="border-t border-gray-200 my-2"></div>}

                    {/* PROFILE Section */}
                    <div className="mb-2">
                      {!sidebarCollapsed && (
                        <button
                          onClick={() => setProfileSettingsOpen(!profileSettingsOpen)}
                          className={`flex items-center justify-between w-full mb-1 p-1.5 rounded-md transition-colors focus:outline-none ${isDarkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-50'
                            }`}
                        >
                          <h3 className={`font-semibold text-xs ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>PROFILE</h3>
                          <span className={`transition-transform duration-200 text-xs ${profileSettingsOpen ? 'rotate-180' : ''} ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>▼</span>
                        </button>
                      )}
                      {(profileSettingsOpen || sidebarCollapsed) && (
                        <div className={sidebarCollapsed ? '' : 'pl-2'}>
                          {sidebarCollapsed ? (
                            <div className="flex flex-col gap-2">
                              {settingsSections.profile.map((item) => (
                                <Link
                                  key={item.name}
                                  href={item.href}
                                  className={`flex flex-col items-center gap-2 p-3 rounded-xl transition-all duration-200 group relative ${pathname === item.href
                                    ? isDarkMode
                                      ? 'bg-blue-600 text-white shadow-lg '
                                      : 'bg-blue-100 border-2 border-blue-300 shadow-md '
                                    : isDarkMode
                                      ? 'hover:bg-gray-700 text-gray-300'
                                      : 'hover:bg-gray-100 text-gray-700'
                                    }`}
                                  title={item.name}
                                >
                                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center text-xl shadow  transition-all duration-200 ${pathname === item.href
                                    ? isDarkMode
                                      ? 'bg-white/20 text-white'
                                      : 'bg-blue-200 text-blue-600'
                                    : isDarkMode
                                      ? 'bg-gray-600 text-gray-300'
                                      : 'bg-gray-100 text-gray-600'
                                    }`}>
                                    {item.icon}
                                  </div>
                                  <div className="absolute left-full ml-3 px-3 py-2 bg-gray-800 dark:bg-gray-700 text-white text-sm rounded-lg shadow-xl opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-50 pointer-events-none font-medium transform -translate-x-full">
                                    {item.name}
                                  </div>
                                </Link>
                              ))}
                            </div>
                          ) : (
                            renderSettingsMenuItems(settingsSections.profile)
                          )}
                        </div>
                      )}
                    </div>

                    {sidebarCollapsed && <div className="border-t border-gray-200 my-2"></div>}

                    {/* SECURITY Section */}
                    <div className="mb-2">
                      {!sidebarCollapsed && (
                        <button
                          onClick={() => setSecuritySettingsOpen(!securitySettingsOpen)}
                          className={`flex items-center justify-between w-full mb-1 p-1.5 rounded-md transition-colors focus:outline-none ${isDarkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-50'
                            }`}
                        >
                          <h3 className={`font-semibold text-xs ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>SECURITY</h3>
                          <span className={`transition-transform duration-200 text-xs ${securitySettingsOpen ? 'rotate-180' : ''} ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>▼</span>
                        </button>
                      )}
                      {(securitySettingsOpen || sidebarCollapsed) && (
                        <div className={sidebarCollapsed ? '' : 'pl-2'}>
                          {sidebarCollapsed ? (
                            <div className="flex flex-col gap-2">
                              {settingsSections.security.map((item) => (
                                <Link
                                  key={item.name}
                                  href={item.href}
                                  className={`flex flex-col items-center gap-2 p-3 rounded-xl transition-all duration-200 group relative ${pathname === item.href
                                    ? isDarkMode
                                      ? 'bg-red-600 text-white shadow-lg '
                                      : 'bg-red-100 border-2 border-red-300 shadow-md '
                                    : isDarkMode
                                      ? 'hover:bg-gray-700 text-gray-300'
                                      : 'hover:bg-gray-100 text-gray-700'
                                    }`}
                                  title={item.name}
                                >
                                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center text-xl shadow  transition-all duration-200 ${pathname === item.href
                                    ? isDarkMode
                                      ? 'bg-white/20 text-white'
                                      : 'bg-red-200 text-red-600'
                                    : isDarkMode
                                      ? 'bg-gray-600 text-gray-300'
                                      : 'bg-gray-100 text-gray-600'
                                    }`}>
                                    {item.icon}
                                  </div>
                                  <div className="absolute left-full ml-3 px-3 py-2 bg-gray-800 dark:bg-gray-700 text-white text-sm rounded-lg shadow-xl opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-50 pointer-events-none font-medium transform -translate-x-full">
                                    {item.name}
                                  </div>
                                </Link>
                              ))}
                            </div>
                          ) : (
                            renderSettingsMenuItems(settingsSections.security)
                          )}
                        </div>
                      )}
                    </div>
                  </>
                ) : isAdminPage ? (
                  <>
                    {/* Admin Sidebar */}
                    <div className="space-y-1">
                      {renderAdminMenuItems()}
                    </div>
                  </>
                ) : (
                  <>
                    {/* Profile Card */}
                    {!sidebarCollapsed && (
                      <div className={`mb-4 p-4 rounded-xl ${isDarkMode ? 'bg-gray-700' : 'bg-gray-50'}`}>
                        <div className="flex items-center gap-3 mb-3">
                          <img
                            src={profile.avatar}
                            alt="Profile"
                            className="w-16 h-16 rounded-full object-cover border-2 border-blue-500"
                          />
                          <div className="flex-1">
                            <h3 className={`text-lg font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                              My Profile
                            </h3>
                            <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                              {profile.name}
                            </p>
                          </div>
                        </div>
                        {/* <div
                          className={`flex items-center gap-2 p-3 rounded-lg cursor-pointer transition-colors ${isDarkMode ? 'bg-gray-600 hover:bg-gray-500' : 'bg-white hover:bg-gray-100'}`}
                          onClick={() => router.push('/dashboard/wallet')}
                        >
                          <svg
                            className={`w-5 h-5 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
                          </svg>
                          <span className={`text-lg font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                            {formatBalance(profile.balance)}
                          </span>
                        </div> */}
                      </div>
                    )}

                    {/* All Menu Items */}
                    <div className="space-y-3">
                      {renderMenuItems([...menuSections.me, ...menuSections.community, ...menuSections.explore], sidebarCollapsed)}
                    </div>

                    {/* Footer */}
                    {!sidebarCollapsed && (
                      <div className="mt-8 p-3" style={{
                        background: isDarkMode ? '#374151' : '#ffffff',
                        borderRadius: '8px',
                        boxShadow: isDarkMode
                          ? '4px 4px 8px rgba(0, 0, 0, 0.3), -4px -4px 8px rgba(0, 0, 0, 0.1)'
                          : '4px 4px 8px rgba(0, 0, 0, 0.1), -4px -4px 8px rgba(255, 255, 255, 0.9)',
                        color: isDarkMode ? '#d1d5db' : '#2d2d2d',
                        fontSize: '12px',
                        width: '100%'
                      }}>
                        <div className="flex justify-between items-center mb-3">
                          <span>© 2025 Jaifriend</span>
                          <button className="px-3 py-1 rounded-md text-white text-sm transition-all duration-300" style={{
                            background: '#022e8a'
                          }} onMouseEnter={(e) => {
                            e.currentTarget.style.background = '#5d97fe';
                            e.currentTarget.style.boxShadow = '0 4px 8px rgba(93, 151, 254, 0.3)';
                          }} onMouseLeave={(e) => {
                            e.currentTarget.style.background = '#022e8a';
                            e.currentTarget.style.boxShadow = 'none';
                          }}>
                            Language
                          </button>
                        </div>
                        <div className="flex flex-wrap gap-3">
                          <a href="#" className={`text-xs hover:text-blue-600 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>Privacy</a>
                          <a href="#" className={`text-xs hover:text-blue-600 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>Terms</a>
                          <a href="#" className={`text-xs hover:text-blue-600 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>About</a>
                          <span className={`text-xs ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>Jaifriend</span>
                        </div>
                      </div>
                    )}
                  </>
                )}
              </div>
            </aside>

            {/* Desktop Profile Sidebar */}
            <aside className={`overflow-y-auto overflow-x-hidden flex flex-col fixed left-0 top-0 h-screen transition-all duration-300 scrollbar-hide z-[60] ${profileSidebarOpen ? 'w-64' : 'w-0'
              } ${isDarkMode ? 'bg-gray-900 border-r border-gray-700' : 'bg-white border-r border-gray-200'}`}>
              {profileSidebarOpen && (
                <>
                  <div className={`px-3 py-2 border-b flex items-center justify-between ${isDarkMode
                    ? 'border-gray-700'
                    : 'border-gray-200'
                    }`}>
                    <h2 className={`font-bold text-lg ${isDarkMode
                      ? 'text-white'
                      : 'text-gray-900'
                      }`}>Profile</h2>
                    <button
                      onClick={() => setProfileSidebarOpen(false)}
                      className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors ${isDarkMode
                        ? 'bg-gray-700 hover:bg-gray-600 text-gray-300'
                        : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                        }`}
                    >
                      ✕
                    </button>
                  </div>

                  <div className="flex-1 px-3 pt-2 pb-3 overflow-y-auto scrollbar-hide">
                    {/* Profile Section */}
                    <div className={`flex items-center gap-2 mb-2 p-2 rounded-lg ${isDarkMode
                      ? 'bg-gray-800'
                      : 'bg-gray-50'
                      }`}>
                      <img
                        src={profile.avatar}
                        alt="avatar"
                        className={`w-12 h-12 rounded-full object-cover ${isDarkMode
                          ? 'border border-gray-600'
                          : 'border border-gray-200'
                          }`}
                      />
                      <div className="flex flex-col">
                        <span
                          className={`font-semibold text-sm cursor-pointer transition-colors ${isDarkMode
                            ? 'text-white hover:text-blue-400'
                            : 'text-gray-900 hover:text-blue-600'
                            }`}
                          onClick={handleMyProfile}
                        >
                          My Profile
                        </span>
                        <div
                          className="flex items-center gap-2 mt-1 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md px-2 py-1 transition-colors"
                          onClick={() => {
                            router.push('/dashboard/wallet');
                            setProfileSidebarOpen(false);
                          }}
                          title="View wallet"
                        >
                          <svg
                            className={`w-4 h-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
                          </svg>
                          <span className={`text-sm font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                            {formatBalance(profile.balance)}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Menu Items */}
                    <div className="space-y-1">
                      <button
                        className="flex items-center gap-2 py-2 px-3 rounded-md text-left w-full transition-all duration-200"
                        onClick={handleSwitchAccount}
                        style={{
                          background: '#ffffff',
                          borderRadius: '8px',
                          boxShadow: '2px 2px 4px rgba(0, 0, 0, 0.1), -2px -2px 4px rgba(255, 255, 255, 0.9)',
                          border: '1px solid #e5e7eb'
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.background = '#f8fafc';
                          e.currentTarget.style.boxShadow = '3px 3px 6px rgba(0, 0, 0, 0.15), -3px -3px 6px rgba(255, 255, 255, 1)';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.background = '#ffffff';
                          e.currentTarget.style.boxShadow = '2px 2px 4px rgba(0, 0, 0, 0.1), -2px -2px 4px rgba(255, 255, 255, 0.9)';
                        }}
                      >
                        <span className="p-1.5 rounded-full text-sm" style={{
                          background: '#f1f5f9',
                          boxShadow: 'inset 1px 1px 2px rgba(0, 0, 0, 0.1), inset -1px -1px 2px rgba(255, 255, 255, 0.9)'
                        }}>🔄</span>
                        <span className="font-medium text-gray-900 text-sm">Switch Account</span>
                      </button>

                      <button
                        className={`flex items-center gap-2 py-2 px-3 rounded-md text-left w-full transition-colors ${isDarkMode
                          ? 'hover:bg-gray-700'
                          : 'hover:bg-gray-50'
                          }`}
                        onClick={() => router.push('/dashboard/upgrade')}
                      >
                        <span className={`p-1.5 rounded-full text-sm ${isDarkMode
                          ? 'bg-gray-700'
                          : 'bg-gray-100'
                          }`}>🛠️</span>
                        <span className={`font-medium text-sm ${isDarkMode
                          ? 'text-white'
                          : 'text-gray-900'
                          }`}>
                          {(() => {
                            try {
                              const user = JSON.parse(localStorage.getItem('user') || '{}');
                              return user.plan && user.plan !== 'Free' ? 'Subscription' : 'Upgrade To Pro';
                            } catch {
                              return 'Upgrade To Pro';
                            }
                          })()}
                        </span>
                      </button>

                      <button
                        className={`flex items-center gap-2 py-2 px-3 rounded-md text-left w-full transition-colors ${isDarkMode
                          ? 'hover:bg-gray-700'
                          : 'hover:bg-gray-50'
                          }`}
                        onClick={() => router.push('/dashboard/advertising')}
                      >
                        <span className={`p-1.5 rounded-full text-sm ${isDarkMode
                          ? 'bg-gray-700'
                          : 'bg-gray-100'
                          }`}>📢</span>
                        <span className={`font-medium text-sm ${isDarkMode
                          ? 'text-white'
                          : 'text-gray-900'
                          }`}>Advertising</span>
                      </button>



                      <div className={`my-2 ${isDarkMode
                        ? 'border-gray-600'
                        : 'border-gray-200'
                        } border-t`}></div>

                      <button
                        className={`flex items-center gap-2 py-2 px-3 rounded-md text-left w-full transition-colors ${isDarkMode
                          ? 'hover:bg-gray-700'
                          : 'hover:bg-gray-50'
                          }`}
                        onClick={() => {
                          router.push('/dashboard/settings/privacy');
                          setProfileSidebarOpen(false);
                        }}
                      >
                        <span className={`p-1.5 rounded-full text-sm ${isDarkMode
                          ? 'bg-gray-700'
                          : 'bg-gray-100'
                          }`}>✔️</span>
                        <span className={`font-medium text-sm ${isDarkMode
                          ? 'text-white'
                          : 'text-gray-900'
                          }`}>Privacy Setting</span>
                      </button>

                      <button
                        className={`flex items-center gap-2 py-2 px-3 rounded-md text-left w-full transition-colors ${isDarkMode
                          ? 'hover:bg-gray-700'
                          : 'hover:bg-gray-50'
                          }`}
                        onClick={() => {
                          router.push('/dashboard/settings');
                          setProfileSidebarOpen(false);
                        }}
                      >
                        <span className={`p-1.5 rounded-full text-sm ${isDarkMode
                          ? 'bg-gray-700'
                          : 'bg-gray-100'
                          }`}>⚙️</span>
                        <span className={`font-medium text-sm ${isDarkMode
                          ? 'text-white'
                          : 'text-gray-900'
                          }`}>General Setting</span>
                      </button>

                      <button
                        className={`flex items-center gap-2 py-2 px-3 rounded-md text-left w-full transition-colors ${isDarkMode
                          ? 'hover:bg-gray-700'
                          : 'hover:bg-gray-50'
                          }`}
                        onClick={() => router.push('/dashboard/invite')}
                      >
                        <span className={`p-1.5 rounded-full text-sm ${isDarkMode
                          ? 'bg-gray-700'
                          : 'bg-gray-100'
                          }`}>✉️</span>
                        <span className={`font-medium text-sm ${isDarkMode
                          ? 'text-white'
                          : 'text-gray-900'
                          }`}>Invite Your Friends</span>
                      </button>

                      <button
                        className={`flex items-center gap-2 py-2 px-3 rounded-md text-left w-full transition-colors ${isDarkMode
                          ? 'hover:bg-gray-700'
                          : 'hover:bg-gray-50'
                          }`}
                        onClick={() => {
                          router.push('/dashboard/admin');
                          setProfileSidebarOpen(false);
                        }}
                      >
                        <span className={`p-1.5 rounded-full text-sm ${isDarkMode
                          ? 'bg-gray-700'
                          : 'bg-gray-100'
                          }`}>👑</span>
                        <span className={`font-medium text-sm ${isDarkMode
                          ? 'text-white'
                          : 'text-gray-900'
                          }`}>Admin Dashboard</span>
                      </button>

                      <div className="border-t border-gray-200 my-2"></div>

                      <div className="space-y-2 p-4">
                        <div className="flex items-center gap-3 py-3 px-1">
                          <span className="bg-gray-100 dark:bg-gray-700 p-2 rounded-full text-lg">🌙</span>
                          <span className="font-medium flex-1 text-gray-900 dark:text-white">
                            {isSystemMode ? 'Follow System' : 'Night mode'}
                          </span>
                          <input
                            type="checkbox"
                            id="night-mode-toggle-desktop"
                            className="form-checkbox h-5 w-5 text-blue-600 rounded focus:ring-blue-500 focus:ring-2"
                            checked={isDarkMode}
                            onChange={(e) => {
                              toggleDarkMode();
                            }}
                            aria-label="Toggle night mode"
                          />
                        </div>
                        {!isSystemMode && (
                          <button
                            className="flex items-center gap-2 py-2 px-1 text-sm text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors w-full"
                            onClick={resetToSystem}
                          >
                            <span className="text-sm">🔄</span>
                            <span>Reset to System</span>
                          </button>
                        )}
                      </div>

                      <button
                        className="flex items-center gap-3 py-3 px-1 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg text-left w-full transition-colors"
                        onClick={handleLogout}
                      >
                        <span className="bg-gray-100 dark:bg-gray-700 p-2 rounded-full text-lg">🚪</span>
                        <span className="font-medium text-red-600 dark:text-red-400">Log Out</span>
                      </button>
                    </div>

                    {/* Footer */}
                    <div className={`mt-8 p-4 border-t ${isDarkMode
                      ? 'border-gray-600'
                      : 'border-gray-200'
                      }`}>
                      <div className={`text-xs flex flex-col items-center gap-2 ${isDarkMode
                        ? 'text-gray-400'
                        : 'text-gray-500'
                        }`}>
                        <div className="flex items-center gap-2">
                          <span>© 2025 Jaifriend</span>
                          <span>•</span>
                          <button className={`underline cursor-pointer transition-colors ${isDarkMode
                            ? 'hover:text-gray-300'
                            : 'hover:text-gray-700'
                            }`}>Language</button>
                        </div>
                        <div className="flex flex-wrap gap-2 justify-center">
                          <button className={`underline cursor-pointer transition-colors text-xs ${isDarkMode
                            ? 'hover:text-gray-300'
                            : 'hover:text-gray-700'
                            }`}>About</button>
                          <button className={`underline cursor-pointer transition-colors text-xs ${isDarkMode
                            ? 'hover:text-gray-300'
                            : 'hover:text-gray-700'
                            }`}>Directory</button>
                          <button className={`underline cursor-pointer transition-colors text-xs ${isDarkMode
                            ? 'hover:text-gray-300'
                            : 'hover:text-gray-700'
                            }`}>Contact Us</button>
                          <button className={`underline cursor-pointer transition-colors text-xs ${isDarkMode
                            ? 'hover:text-gray-300'
                            : 'hover:text-gray-700'
                            }`}>Developers</button>
                          <button className={`underline cursor-pointer transition-colors text-xs ${isDarkMode
                            ? 'hover:text-gray-300'
                            : 'hover:text-gray-700'
                            }`}>Privacy Policy</button>
                          <button className={`underline cursor-pointer transition-colors text-xs ${isDarkMode
                            ? 'hover:text-gray-300'
                            : 'hover:text-gray-700'
                            }`}>Terms of Use</button>
                          <button className={`underline cursor-pointer transition-colors text-xs ${isDarkMode
                            ? 'hover:text-gray-300'
                            : 'hover:text-gray-700'
                            }`}>Refund</button>
                        </div>
                      </div>
                    </div>
                  </div>
                </>
              )}
            </aside>
          </>
        ))}

        {/* Main Content Area */}
        <main className={`
          ${isReelsPage ? 'fixed inset-0' : 'flex-1'} transition-all duration-300 ${isReelsPage ? 'h-screen overflow-hidden' : 'min-h-screen'} overflow-x-hidden bg-gray-50 dark:bg-gray-900
          ${isMessagesPage || isVideoCallPage || isReelsPage
            ? 'ml-0 mr-0 pt-0 pb-0'
            : isMobile
              ? 'ml-0 mr-0 pb-20'
              : sidebarCollapsed
                ? 'ml-16'
                : isAdminPage
                  ? 'ml-48'
                  : 'ml-64'
          }
          ${!isMessagesPage && !isVideoCallPage && !isReelsPage && 'md:mr-20'}
          ${!isMobile && !isMessagesPage && !isVideoCallPage && !isReelsPage && profileSidebarOpen ? 'ml-64' : ''}
          ${!isMessagesPage && !isVideoCallPage && !isReelsPage && 'pt-16'}
        `} style={{
            paddingLeft: '0',
            paddingRight: '0',
            ...(isReelsPage && {
              overflowY: 'hidden',
              overflowX: 'hidden',
              height: '100vh',
              width: '100vw',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              position: 'fixed',
              zIndex: 40
            })
          }}>
          <div className={`w-full ${isReelsPage ? 'h-full overflow-hidden' : 'h-full'} overflow-x-hidden max-w-full`}>
            <div className={`w-full ${isReelsPage ? 'h-full overflow-hidden' : 'overflow-x-hidden'} ${isMessagesPage || isVideoCallPage ? 'max-w-none pt-0 pb-0' : isReelsPage ? 'max-w-none h-full pt-0 pb-0 overflow-hidden' : 'max-w-full md:mr-24 pt-16 pb-20 md:pt-0 md:pb-0'}`}>
              {children}
            </div>
          </div>
        </main>
      </div>

      {/* Mobile Bottom Navigation */}
      {isMobile && !isMessagesPage && !isVideoCallPage && (
        <nav className="fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 z-40 overflow-x-hidden transition-colors duration-200">
          <div className="flex justify-around items-center py-3 w-full max-w-full">
            <Link
              href="/dashboard"
              className={`flex flex-col items-center p-2 rounded-lg transition-colors ${pathname === '/dashboard'
                ? 'text-blue-600 dark:text-blue-400'
                : isDarkMode ? 'text-gray-300 hover:text-blue-400' : 'text-gray-600 hover:text-blue-600'
                }`}
            >
              <span className="text-xl mb-1">🏠</span>
              <span className="text-xs font-medium">Home</span>
            </Link>

            <Link
              href="/dashboard/find-friends"
              className={`flex flex-col items-center p-2 rounded-lg transition-colors ${pathname === '/dashboard/find-friends'
                ? 'text-blue-600 dark:text-blue-400'
                : isDarkMode ? 'text-gray-300 hover:text-blue-400' : 'text-gray-600 hover:text-blue-600'
                }`}
            >
              <span className="text-xl mb-1">👥</span>
              <span className="text-xs font-medium">Friends</span>
            </Link>

            <Link
              href="/dashboard/messages"
              className={`flex flex-col items-center p-2 rounded-lg transition-colors ${pathname === '/dashboard/messages'
                ? 'text-blue-600 dark:text-blue-400'
                : isDarkMode ? 'text-gray-300 hover:text-blue-400' : 'text-gray-600 hover:text-blue-600'
                }`}
            >
              <span className="text-xl mb-1">💬</span>
              <span className="text-xs font-medium">Messages</span>
            </Link>

            <Link
              href="/dashboard/p2p"
              className={`flex flex-col items-center p-2 rounded-lg transition-colors ${pathname === '/dashboard/p2p'
                ? 'text-blue-600 dark:text-blue-400'
                : isDarkMode ? 'text-gray-300 hover:text-blue-400' : 'text-gray-600 hover:text-blue-600'
                }`}
            >
              <span className="text-xl mb-1">🤝</span>
              <span className="text-xs font-medium">Connect</span>
            </Link>

            <Link
              href="/dashboard/notifications"
              className={`flex flex-col items-center p-2 rounded-lg transition-colors relative ${pathname === '/dashboard/notifications'
                ? 'text-blue-600 dark:text-blue-400'
                : 'text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400'
                }`}
            >
              <div className="relative">
                <span className="text-xl mb-1">🔔</span>
                {/* Notification count badge for mobile */}
                {notificationCount > 0 && (
                  <span className={`absolute -top-1 -right-1 min-w-4 h-4 bg-red-500 text-white text-xs rounded-full flex items-center justify-center font-bold transition-all duration-300 shadow-lg ${notificationCount > lastNotificationCount && lastNotificationCount > 0
                    ? 'animate-bounce scale-110 ring-2 ring-red-300 ring-opacity-50'
                    : 'animate-pulse'
                    }`}>
                    {notificationCount > 9 ? '9+' : notificationCount}
                  </span>
                )}

                {/* Pulsing dot for new notifications on mobile */}
                {notificationCount > 0 && (
                  <div className={`absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full transition-all duration-300 ${notificationCount > lastNotificationCount && lastNotificationCount > 0
                    ? 'animate-ping scale-150'
                    : 'opacity-0'
                    }`}></div>
                )}
              </div>
              <span className="text-xs font-medium">Notifications</span>
            </Link>

            <Link
              href={profile.id ? `/dashboard/profile/${profile.id}` : "/dashboard/profile"}
              className={`flex flex-col items-center p-2 rounded-lg transition-colors ${pathname === '/dashboard/profile' || (profile.id && pathname === `/dashboard/profile/${profile.id}`)
                ? 'text-blue-600 dark:text-blue-400'
                : 'text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400'
                }`}
            >
              <img
                src={profile.avatar}
                alt="Profile"
                className="w-6 h-6 rounded-full mb-1 object-cover"
              />
              <span className="text-xs font-medium">Profile</span>
            </Link>
          </div>
        </nav>
      )}

      {/* Floating Action Button */}
      {pathname === '/dashboard' && <FloatingActionButton isAdminPage={isAdminPage} />}

      <style jsx>{`
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
        .scrollbar-hide::-webkit-scrollbar { 
          display: none;
        }
        
        /* Custom scrollbar styling for sidebar */
        aside::-webkit-scrollbar {
          width: 8px;
        }
        
        aside::-webkit-scrollbar-track {
          background: #f4f4f9;
        }
        
        aside::-webkit-scrollbar-thumb {
          background: #022e8a;
          border-radius: 10px;
        }
        
        /* Hide scrollbars for sidebar specifically */
        aside .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
        
        aside .scrollbar-hide::-webkit-scrollbar {
          display: none;
          width: 0;
          height: 0;
        }
        
        /* Hide horizontal scrollbars */
        aside .scrollbar-hide::-webkit-scrollbar:horizontal {
          display: none;
          height: 0;
        }
        
        /* Hide vertical scrollbars */
        aside .scrollbar-hide::-webkit-scrollbar:vertical {
          display: none;
          width: 0;
        }
        
        /* Ensure sidebar content doesn't overflow horizontally */
        aside {
          overflow-x: hidden;
        }
        
        /* Hide scrollbars for all sidebar elements */
        aside * {
          scrollbar-width: none;
          -ms-overflow-style: none;
        }
        
        aside *::-webkit-scrollbar {
          display: none;
          width: 0;
          height: 0;
        }
        
        /* Mobile touch improvements */
        .touch-manipulation {
          touch-action: manipulation;
          -webkit-tap-highlight-color: transparent;
        }
        
        /* Ensure dropdowns are properly positioned on mobile */
        @media (max-width: 640px) {
          .dropdown-container {
            position: relative;
          }
          
          .dropdown-container > div {
            position: absolute;
            right: 0;
            top: 100%;
            margin-top: 0.5rem;
            z-index: 50;
          }
        }
        
        /* Gradient pulse animation for hover effects */
        @keyframes gradientPulse {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
        
        /* Custom sidebar styling */
        .custom-sidebar-style {
          background: #ffffff;
          border-radius: 24px;
          box-shadow: 6px 6px 12px rgba(0, 0, 0, 0.1), -6px -6px 12px rgba(255, 255, 255, 0.9);
          margin: 20px;
          height: calc(100vh - 40px);
          padding: 24px;
          scrollbar-width: thin;
          scrollbar-color: #022e8a #f4f4f9;
        }
      `}</style>
    </div>
  );
};

export default DashboardLayout;