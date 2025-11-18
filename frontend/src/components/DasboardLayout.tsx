import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { useDarkMode } from '@/contexts/DarkModeContext';
import { logout } from '@/utils/auth';
import FloatingActionButton from './FloatingActionButton';
import FollowersSidebar from './FollowersSidebar';

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
  name: string;
  avatar: string;
  balance: string;
  pokes: number;
}

interface MenuItem {
  name: string;
  icon: string;
  color: string;
  href: string;
}

interface SettingsMenuItem {
  name: string;
  icon: string;
  href: string;
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
      if (!target.closest('.search-container')) {
        setShowSearchResults(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Admin Sidebar States
  const [adminSettingsOpen, setAdminSettingsOpen] = useState<boolean>(true);
  const [adminManageFeaturesOpen, setAdminManageFeaturesOpen] = useState<boolean>(false);
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
  
  // Check if current route is messages
  const isMessagesPage = pathname.startsWith('/dashboard/messages');
  
  // Check if current route is video call
  const isVideoCallPage = pathname.startsWith('/dashboard/video-call');

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
    if (isMobile) {
      setSidebarOpen(false);
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
    const token = localStorage.getItem('token');
    if (token) {
              fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/profile/me`, {
        headers: { Authorization: `Bearer ${token}` },
      })
        .then((res) => res.json())
        .then((data) => setProfile(data))
        .catch(() => console.log('Profile load failed'));
    }
  }, []);

  // Fetch notification count on mount
  useEffect(() => {
    fetchNotificationCount();
  }, []);

  // Listen for image updates from settings page
  useEffect(() => {
    const handleImagesUpdated = () => {
      console.log('Images updated event received in DashboardLayout, refreshing profile...');
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
          .then((data) => setProfile(data))
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
          .then((data) => setProfile(data))
          .catch(() => console.log('Profile refresh failed'));
      }
    };

    window.addEventListener('imagesUpdated', handleImagesUpdated);
    window.addEventListener('privacySettingsUpdated', handlePrivacySettingsUpdated);
    window.addEventListener('passwordChanged', handlePasswordChanged);

    return () => {
      window.removeEventListener('imagesUpdated', handleImagesUpdated);
      window.removeEventListener('privacySettingsUpdated', handlePrivacySettingsUpdated);
      window.removeEventListener('passwordChanged', handlePasswordChanged);
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

  // Menu sections for sidebar
  const menuSections: MenuSections = {
    me: [
      { name: "Messages", icon: "💬", color: "bg-blue-100", href: "/dashboard/messages" },
    ],
    community: [
    ],
    explore: [
      { name: "News Feed", icon: "📰", color: "bg-blue-100", href: "/dashboard" },
      { name: "Albums", icon: "📸", color: "bg-green-100", href: "/dashboard/albums" },
      { name: "Saved Posts", icon: "💾", color: "bg-purple-100", href: "/dashboard/saved" },
      { name: "Reels", icon: "🎬", color: "bg-orange-100", href: "/dashboard/reels" },
      { name: "Explore  ", icon: "📸", color: "bg-green-100", href: "/dashboard/explore" },
      { name: "Market", icon: "🛒", color: "bg-green-100", href: "/dashboard/market" },
      { name: "My Products", icon: "📦", color: "bg-yellow-100", href: "/dashboard/products" },
      { name: "P2P Services", icon: "🤝", color: "bg-indigo-100", href: "/dashboard/p2p" },
      { name: "My Groups", icon: "👥", color: "bg-purple-100", href: "/dashboard/groups" },
      { name: "My Pages", icon: "📄", color: "bg-gray-100", href: "/dashboard/pages" },
      { name: "Popular Posts", icon: "🔥", color: "bg-red-100", href: "/dashboard/popular" },
    ]
  };

  const adminMenuItems = [
    { name: "Dashboard", icon: "⬜", active: false, hasPlus: false, href: "/dashboard/admin" },
    { name: "Settings", icon: "⚙️", active: true, hasPlus: true, section: "settings", href: "/dashboard/admin/settings" },
    { name: "Website Mode", icon: "🌐", active: true, hasPlus: false, isSubItem: true, section: "settings", href: "/dashboard/admin/settings/website-mode" },
    { name: "General Configuration", icon: "⚙️", active: false, hasPlus: false, isSubItem: true, section: "settings", href: "/dashboard/admin/settings/general" },
    { name: "Website Information", icon: "ℹ️", active: false, hasPlus: false, isSubItem: true, section: "settings", href: "/dashboard/admin/settings/info" },
    { name: "File Upload Configuration", icon: "📁", active: false, hasPlus: false, isSubItem: true, section: "settings", href: "/dashboard/admin/settings/upload" },
    { name: "E-mail & SMS Setup", icon: "📧", active: false, hasPlus: false, isSubItem: true, section: "settings", href: "/dashboard/admin/settings/email" },
    { name: "Chat & Video/Audio", icon: "💬", active: false, hasPlus: false, isSubItem: true, section: "settings", href: "/dashboard/admin/settings/chat" },
    { name: "Social Login Settings", icon: "🔗", active: false, hasPlus: false, isSubItem: true, section: "settings", href: "/dashboard/admin/settings/social" },
    { name: "NodeJS Settings", icon: "🟢", active: false, hasPlus: false, isSubItem: true, section: "settings", href: "/dashboard/admin/settings/nodejs" },
    { name: "CronJob Settings", icon: "⏰", active: false, hasPlus: false, isSubItem: true, section: "settings", href: "/dashboard/admin/settings/cronjob" },
    { name: "AI Settings", icon: "🤖", active: false, hasPlus: false, isSubItem: true, section: "settings", href: "/dashboard/admin/settings/ai" },
    { name: "Manage Features", icon: "☰", active: false, hasPlus: true, section: "manageFeatures", href: "/dashboard/admin/manage-features" },
    { name: "Enable / Disable Features", icon: "🔧", active: false, hasPlus: false, isSubItem: true, section: "manageFeatures", href: "/dashboard/admin/manage-features/enable-disable" },
    { name: "Applications", icon: "📱", active: false, hasPlus: false, isSubItem: true, section: "manageFeatures", href: "/dashboard/admin/manage-features/applications" },
    { name: "Pages", icon: "📄", active: false, hasPlus: false, isSubItem: true, section: "manageFeatures", href: "/dashboard/admin/manage-features/pages" },
    { name: "Groups", icon: "👥", active: false, hasPlus: false, isSubItem: true, section: "manageFeatures", href: "/dashboard/admin/manage-features/groups" },
    { name: "Posts", icon: "📝", active: false, hasPlus: false, isSubItem: true, section: "manageFeatures", href: "/dashboard/admin/manage-features/posts" },
    { name: "Fundings", icon: "💰", active: false, hasPlus: false, isSubItem: true, section: "manageFeatures", href: "/dashboard/admin/manage-features/fundings" },
    { name: "Jobs", icon: "💼", active: false, hasPlus: false, isSubItem: true, section: "manageFeatures", href: "/dashboard/admin/manage-features/jobs" },
    { name: "Offers", icon: "🎁", active: false, hasPlus: false, isSubItem: true, section: "manageFeatures", href: "/dashboard/admin/manage-features/offers" },
    { name: "Articles (Blog)", icon: "📰", active: false, hasPlus: false, isSubItem: true, section: "manageFeatures", href: "/dashboard/admin/manage-features/articles" },
    { name: "Events", icon: "📅", active: false, hasPlus: false, isSubItem: true, section: "manageFeatures", href: "/dashboard/admin/manage-features/events" },
    { name: "Content Monetization", icon: "💳", active: false, hasPlus: false, isSubItem: true, section: "manageFeatures", href: "/dashboard/admin/manage-features/monetization" },
    { name: "P2P Categories", icon: "🏷️", active: false, hasPlus: false, href: "/dashboard/admin/p2p/categories" },
    { name: "Languages", icon: "🌐", active: false, hasPlus: true, section: "languages", href: "/dashboard/admin/languages" },
    { name: "Add New Language & Keys", icon: "➕", active: false, hasPlus: false, isSubItem: true, section: "languages", href: "/dashboard/admin/languages/add" },
    { name: "Manage Languages", icon: "🔧", active: false, hasPlus: false, isSubItem: true, section: "languages", href: "/dashboard/admin/languages/manage" },
    { name: "Users", icon: "👤", active: false, hasPlus: true, section: "users", href: "/dashboard/admin/users" },
    { name: "Manage Users", icon: "👥", active: false, hasPlus: false, isSubItem: true, section: "users", href: "/dashboard/admin/users/manage" },
    { name: "Online Users", icon: "🟢", active: false, hasPlus: false, isSubItem: true, section: "users", href: "/dashboard/admin/users/online" },
    { name: "Manage User Stories / Status", icon: "📖", active: false, hasPlus: false, isSubItem: true, section: "users", href: "/dashboard/admin/users/stories" },
    { name: "Manage Verification Requests", icon: "✅", active: false, hasPlus: false, isSubItem: true, section: "users", href: "/dashboard/admin/users/verification" },
    { name: "Payments & Ads", icon: "💰", active: false, hasPlus: true, section: "payments", href: "/dashboard/admin/payments" },
    { name: "Payment Configuration", icon: "⚙️", active: false, hasPlus: false, isSubItem: true, section: "payments", href: "/dashboard/admin/payments/config" },
    { name: "Advertisement Settings", icon: "📢", active: false, hasPlus: false, isSubItem: true, section: "payments", href: "/dashboard/admin/payments/ads" },
    { name: "Manage Currencies", icon: "💱", active: false, hasPlus: false, isSubItem: true, section: "payments", href: "/dashboard/admin/payments/currencies" },
    { name: "Manage Site Advertisements", icon: "🏢", active: false, hasPlus: false, isSubItem: true, section: "payments", href: "/dashboard/admin/payments/site-ads" },
    { name: "Manage User Advertisements", icon: "👤", active: false, hasPlus: false, isSubItem: true, section: "payments", href: "/dashboard/admin/payments/user-ads" },
    { name: "Manage Bank Receipts", icon: "🏦", active: false, hasPlus: false, isSubItem: true, section: "payments", href: "/dashboard/admin/payments/receipts" },
    { name: "Pro System", icon: "⭐", active: false, hasPlus: true, section: "proSystem", href: "/dashboard/admin/pro-system" },
    { name: "Pro System Settings", icon: "⚙️", active: false, hasPlus: false, isSubItem: true, section: "proSystem", href: "/dashboard/admin/pro-system/settings" },
    { name: "Manage Payments", icon: "💳", active: false, hasPlus: false, isSubItem: true, section: "proSystem", href: "/dashboard/admin/pro-system/payments" },
    { name: "Manage Members", icon: "👥", active: false, hasPlus: false, isSubItem: true, section: "proSystem", href: "/dashboard/admin/pro-system/members" },
    { name: "Manage Refund Requests", icon: "↩️", active: false, hasPlus: false, isSubItem: true, section: "proSystem", href: "/dashboard/admin/pro-system/refunds" },
    { name: "Design", icon: "🎨", active: false, hasPlus: true, section: "design", href: "/dashboard/admin/design" },
    { name: "Themes", icon: "🎭", active: false, hasPlus: false, isSubItem: true, section: "design", href: "/dashboard/admin/design/themes" },
    { name: "Change Site Design", icon: "🎨", active: false, hasPlus: false, isSubItem: true, section: "design", href: "/dashboard/admin/design/site" },
    { name: "Custom JS / CSS", icon: "💻", active: false, hasPlus: false, isSubItem: true, section: "design", href: "/dashboard/admin/design/custom" },
    { name: "Tools", icon: "🔧", active: false, hasPlus: true, section: "tools", href: "/dashboard/admin/tools" },
    { name: "Manage Emails", icon: "📧", active: true, hasPlus: false, isSubItem: true, section: "tools", href: "/dashboard/admin/tools/emails" },
    { name: "Users Invitation", icon: "📨", active: false, hasPlus: false, isSubItem: true, section: "tools", href: "/dashboard/admin/tools/invitations" },
    { name: "Send E-mail", icon: "📤", active: false, hasPlus: false, isSubItem: true, section: "tools", href: "/dashboard/admin/tools/send-email" },
    { name: "Announcements", icon: "📢", active: false, hasPlus: false, isSubItem: true, section: "tools", href: "/dashboard/admin/tools/announcements" },
    { name: "Auto Delete Data", icon: "🗑️", active: false, hasPlus: false, isSubItem: true, section: "tools", href: "/dashboard/admin/tools/auto-delete" },
    { name: "Auto Friend", icon: "🤝", active: false, hasPlus: false, isSubItem: true, section: "tools", href: "/dashboard/admin/tools/auto-friend" },
    { name: "Auto Page Like", icon: "👍", active: false, hasPlus: false, isSubItem: true, section: "tools", href: "/dashboard/admin/tools/auto-like" },
    { name: "Auto Group Join", icon: "👥", active: false, hasPlus: false, isSubItem: true, section: "tools", href: "/dashboard/admin/tools/auto-join" },
    { name: "Fake User Generator", icon: "👤", active: false, hasPlus: false, isSubItem: true, section: "tools", href: "/dashboard/admin/tools/fake-users" },
    { name: "Mass Notifications", icon: "📢", active: false, hasPlus: false, isSubItem: true, section: "tools", href: "/dashboard/admin/tools/notifications" },
    { name: "BlackList", icon: "🚫", active: false, hasPlus: false, isSubItem: true, section: "tools", href: "/dashboard/admin/tools/blacklist" },
    { name: "Generate SiteMap", icon: "🗺️", active: false, hasPlus: false, isSubItem: true, section: "tools", href: "/dashboard/admin/tools/sitemap" },
    { name: "Invitation Codes", icon: "🎫", active: false, hasPlus: false, isSubItem: true, section: "tools", href: "/dashboard/admin/tools/codes" },
    { name: "Backup SQL & Files", icon: "💾", active: false, hasPlus: false, isSubItem: true, section: "tools", href: "/dashboard/admin/tools/backup" },
    { name: "Pages", icon: "📄", active: false, hasPlus: true, section: "pages", href: "/dashboard/admin/pages" },
    { name: "Manage Custom Pages", icon: "📝", active: false, hasPlus: false, isSubItem: true, section: "pages", href: "/dashboard/admin/pages/custom" },
    { name: "Manage Terms Pages", icon: "📋", active: false, hasPlus: false, isSubItem: true, section: "pages", href: "/dashboard/admin/pages/terms" },
    { name: "Reports", icon: "⚠️", active: false, hasPlus: true, section: "reports", href: "/dashboard/admin/reports" },
    { name: "Manage Reports", icon: "📊", active: false, hasPlus: false, isSubItem: true, section: "reports", href: "/dashboard/admin/reports/manage" },
    { name: "Manage Users Reports", icon: "👥", active: false, hasPlus: false, isSubItem: true, section: "reports", href: "/dashboard/admin/reports/users" },
    { name: "API Settings", icon: "↔️", active: false, hasPlus: true, section: "apiSettings", href: "/dashboard/admin/api-settings" },
    { name: "Manage API Server Key", icon: "🔑", active: false, hasPlus: false, isSubItem: true, section: "apiSettings", href: "/dashboard/admin/api-settings/keys" },
    { name: "Push Notifications Settings", icon: "🔔", active: true, hasPlus: false, isSubItem: true, section: "apiSettings", href: "/dashboard/admin/api-settings/push" },
    { name: "Verify Applications", icon: "✅", active: false, hasPlus: false, isSubItem: true, section: "apiSettings", href: "/dashboard/admin/api-settings/verify" },
    { name: "3rd Party Scripts", icon: "📜", active: false, hasPlus: false, isSubItem: true, section: "apiSettings", href: "/dashboard/admin/api-settings/scripts" },
    { name: "System Status", icon: "ℹ️", active: false, hasPlus: false, href: "/dashboard/admin/system-status" },
    { name: "Changelogs", icon: "🕐", active: false, hasPlus: false, href: "/dashboard/admin/changelogs" },
    { name: "FAQs", icon: "⋮", active: false, hasPlus: false, href: "/dashboard/admin/faqs" }
  ];

  // Settings sections for settings sidebar
  const settingsSections: SettingsSections = {
    settings: [
      { name: "General", icon: "⚙️", href: "/dashboard/settings" },
      { name: "Notification Settings", icon: "🔔", href: "/dashboard/settings/notifications" },
      { name: "Invitation Links", icon: "🔗", href: "/dashboard/settings/invitations" },
      { name: "Social Links", icon: "📋", href: "/dashboard/settings/social" },
    ],
    profile: [
      { name: "Profile Settings", icon: "👤", href: "/dashboard/settings/profile" },
      { name: "My Addresses", icon: "📍", href: "/dashboard/settings/addresses" },
      { name: "Avatar & Cover", icon: "📸", href: "/dashboard/settings/avatar" },
      { name: "Verification", icon: "✅", href: "/dashboard/settings/verification" },
      { name: "My Information", icon: "📄", href: "/dashboard/settings/info" },
    ],
    security: [
      { name: "Privacy", icon: "🛡️", href: "/dashboard/settings/privacy" },
      { name: "Password", icon: "🔒", href: "/dashboard/settings/password" },
    ]
  };

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

  const handleMyProfile = async (): Promise<void> => {
    setOpenDropdown(null);
    
    try {
      const token = localStorage.getItem('token');
      if (token) {
        // Get current user's profile to get their ID
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/profile/me`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (response.ok) {
          const userData = await response.json();
          // Open profile in new tab instead of redirecting
          window.open(`/dashboard/profile/${userData.id}`, '_blank');
          return;
        }
      }
    } catch (error) {
      console.error('Error fetching user profile:', error);
    }
    
    // Fallback to general profile page in new tab
    window.open('/dashboard/profile', '_blank');
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

  // Sidebar Functions
  const renderMenuItems = (items: MenuItem[], collapsed: boolean = false): React.ReactElement => {
    if (collapsed) {
      return (
        <div className="flex flex-col gap-2">
          {items.map((item) => (
            <Link
              key={item.name}
              href={item.href}
              className={`flex flex-col items-center gap-1 p-3 rounded-lg transition-all duration-200 group relative ${
                pathname === item.href 
                  ? 'bg-blue-500 text-white' 
                  : isDarkMode ? 'hover:bg-gray-700 text-gray-300' : 'hover:bg-gray-50 text-gray-700'
              }`}
              title={item.name}
            >
              <div className={`w-8 h-8 rounded-lg ${item.color} flex items-center justify-center text-sm transition-transform leading-none relative`}>
                {item.icon}
                {/* Notification badge for notifications item in collapsed view */}
                {item.name === "Notifications" && notificationCount > 0 && (
                  <span className={`absolute -top-1 -right-1 min-w-3 h-3 bg-red-500 text-white text-xs rounded-full flex items-center justify-center font-bold transition-all duration-300 shadow-lg ${
                    notificationCount > lastNotificationCount && lastNotificationCount > 0 
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
            className={`flex items-center gap-3 p-3 rounded-xl transition-all duration-300 group ${
              pathname === item.href 
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
            <div className={`w-8 h-8 rounded-md flex items-center justify-center text-base transition-transform leading-none relative ${
              pathname === item.href ? 'bg-white/20' : isDarkMode ? 'bg-gray-600' : 'bg-gray-100'
            }`}>
              {item.icon}
              {/* Notification badge for notifications item */}
              {item.name === "Notifications" && notificationCount > 0 && (
                <span className={`absolute -top-1 -right-1 min-w-4 h-4 bg-red-500 text-white text-xs rounded-full flex items-center justify-center font-bold transition-all duration-300 shadow-lg ${
                  notificationCount > lastNotificationCount && lastNotificationCount > 0 
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
          className={`w-full flex items-center px-3 py-2.5 text-sm font-medium rounded-lg transition-all duration-200 group ${
            pathname === item.href
              ? isDarkMode 
                ? 'bg-blue-600 text-white shadow-lg' 
                : 'bg-blue-100 text-blue-700 shadow-md'
              : isDarkMode 
                ? 'text-gray-300 hover:bg-gray-700 hover:text-white' 
                : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
          }`}
        >
          <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-lg mr-3 transition-all duration-200 ${
            pathname === item.href
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
          const shouldShow = !item.section || isSectionOpen || !item.isSubItem;

          if (!shouldShow) return null;

          const menuItemContent = (
            <div className="flex items-center justify-between px-3 py-2 rounded-md cursor-pointer transition-colors">
              <div className="flex items-center gap-2 min-w-0">
                <span className="text-sm flex-shrink-0">{item.icon}</span>
                <span className="font-medium text-xs truncate">{item.name}</span>
              </div>
              {item.hasPlus && (
                <span className={`text-gray-400 transition-transform duration-200 text-xs flex-shrink-0 ${
                  isSectionOpen ? 'rotate-45' : ''
                }`}>
                  {isSectionOpen ? '−' : '+'}
                </span>
              )}
            </div>
          );

          return (
            <div key={index} className={`${item.isSubItem ? 'ml-3' : ''}`}>
              {item.href ? (
                <Link
                  href={item.href}
                  className={`block ${
                    item.active 
                      ? 'bg-gray-700 text-white' 
                      : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                  }`}
                  onClick={(e) => {
                    if (item.hasPlus && item.section) {
                      e.preventDefault();
                      toggleSection(item.section);
                    }
                    // Close admin sidebar when clicking on settings
                    if (item.name === "Settings" || item.href?.includes('/admin/settings')) {
                      setAdminSettingsOpen(false);
                    }
                  }}
                >
                  {menuItemContent}
                </Link>
              ) : (
                <div
                  className={`${
                    item.active 
                      ? 'bg-gray-700 text-white' 
                      : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                  }`}
                  onClick={() => {
                    if (item.hasPlus && item.section) {
                      toggleSection(item.section);
                    }
                    // Close admin sidebar when clicking on settings
                    if (item.name === "Settings" || item.href?.includes('/admin/settings')) {
                      setAdminSettingsOpen(false);
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
    <div className={`min-h-screen overflow-x-hidden transition-colors duration-200 ${
      isDarkMode ? 'bg-gray-900' : 'bg-gray-50'
    }`} style={{ padding: '0' }}>
      {/* Popup Modals */}
      {popup.isOpen && (
        <div className="fixed inset-0 flex items-center justify-center z-[100] p-4 bg-black bg-opacity-50">
          <div className={`rounded-2xl shadow-2xl max-w-md w-full mx-4 transform transition-all duration-300 scale-100 ${
            isDarkMode ? 'bg-gray-800' : 'bg-white'
          }`}>
            <div className="p-6">
              <div className="flex items-center justify-center mb-4">
                {popup.type === 'success' ? (
                  <div className={`w-16 h-16 rounded-full flex items-center justify-center transition-colors duration-200 ${
                    isDarkMode ? 'bg-green-900/30' : 'bg-green-100'
                  }`}>
                    <svg className={`w-8 h-8 transition-colors duration-200 ${
                      isDarkMode ? 'text-green-400' : 'text-green-500'
                    }`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                    </svg>
                  </div>
                ) : popup.type === 'error' ? (
                  <div className={`w-16 h-16 rounded-full flex items-center justify-center transition-colors duration-200 ${
                    isDarkMode ? 'bg-red-900/30' : 'bg-red-100'
                  }`}>
                    <svg className={`w-8 h-8 transition-colors duration-200 ${
                      isDarkMode ? 'text-red-400' : 'text-red-500'
                    }`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
                    </svg>
                  </div>
                ) : (
                  <div className={`w-16 h-16 rounded-full flex items-center justify-center transition-colors duration-200 ${
                    isDarkMode ? 'bg-blue-900/30' : 'bg-blue-100'
                  }`}>
                    <svg className={`w-8 h-8 transition-colors duration-200 ${
                      isDarkMode ? 'text-blue-400' : 'text-blue-500'
                    }`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0 1 18 0z"></path>
                    </svg>
                  </div>
                )}
              </div>
              
              <div className="text-center">
                <h3 className={`text-xl font-semibold mb-2 transition-colors duration-200 ${
                  isDarkMode ? 'text-white' : 'text-gray-900'
                }`}>{popup.title}</h3>
                <p className={`mb-6 transition-colors duration-200 ${
                  isDarkMode ? 'text-gray-300' : 'text-gray-600'
                }`}>{popup.message}</p>
                
                {(popup.title !== 'Logging Out...' && popup.title !== 'Redirecting...') && (
                  <button
                    onClick={closePopup}
                    className={`w-full py-3 px-1 rounded-xl font-medium transition-all duration-200 ${
                      popup.type === 'success'
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
          <div className={`rounded-2xl shadow-2xl max-w-md w-full mx-4 transition-colors duration-200 ${
            isDarkMode ? 'bg-gray-800' : 'bg-white'
          }`}>
            <div className="p-6 relative">
              <button
                onClick={() => setSwitchAccountModal({ isOpen: false })}
                className={`absolute top-4 right-4 text-2xl font-bold w-8 h-8 flex items-center justify-center rounded-full transition-colors duration-200 ${
                  isDarkMode 
                    ? 'text-gray-400 hover:text-gray-200' 
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                ×
              </button>

              <div className="text-center pt-4">
                <div className={`w-16 h-16 rounded-full flex items-center justify-center mb-4 mx-auto transition-colors duration-200 ${
                  isDarkMode ? 'bg-blue-900/30' : 'bg-blue-100'
                }`}>
                  <svg className={`w-8 h-8 transition-colors duration-200 ${
                    isDarkMode ? 'text-blue-400' : 'text-blue-500'
                  }`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 1 1 0 5.292M15 21H3v-1a6 6 0 0 1 12 0v1zm0 0h6v-1a6 6 0 0 0-9-5.197m13.5-1a5 5 0 1 1-11 0 5 5 0 0 1 11 0z"></path>
                  </svg>
                </div>
                
                <h3 className={`text-xl font-semibold mb-2 transition-colors duration-200 ${
                  isDarkMode ? 'text-white' : 'text-gray-900'
                }`}>Switch Account</h3>
                <p className={`mb-6 transition-colors duration-200 ${
                  isDarkMode ? 'text-gray-300' : 'text-gray-600'
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
                    className={`w-full py-3 px-1 rounded-xl font-medium transition-all duration-200 ${
                      isDarkMode 
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
        <nav className={`w-full flex justify-center items-center px-1 py-3 z-[50] fixed top-0 left-0 shadow-md border-b transition-colors duration-200 ${
          isAdminPage 
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
                className={`w-10 h-10 rounded-lg text-white flex items-center justify-center shadow-sm transition-colors ${
                  isDarkMode ? 'bg-blue-500 hover:bg-blue-600' : 'bg-blue-600 hover:bg-blue-700'
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
            <div className={`rounded-full px-1 py-2 w-full flex items-center gap-2 focus-within:ring-2 focus-within:ring-blue-400 transition-all ${
              isAdminPage 
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
                className={`bg-transparent outline-none border-none flex-1 text-sm ${
                  isAdminPage 
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
              <div className={`absolute top-full left-0 right-0 mt-2 rounded-xl shadow-xl max-h-96 overflow-y-auto z-50 ${
                isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
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
                            <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                              result.type === 'post' ? 'bg-blue-500' : 
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
              <div className={`absolute top-full left-0 right-0 mt-2 rounded-xl shadow-xl border z-50 ${
                isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
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
                className={`w-8 h-8 rounded-full flex items-center justify-center text-lg transition-all ${
                  isAdminPage 
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
              <div className="fixed inset-0 z-50 bg-black bg-opacity-50 flex items-start justify-center pt-20 px-1">
                <div className={`rounded-xl shadow-xl w-full max-w-md max-h-96 overflow-hidden ${
                  isDarkMode ? 'bg-gray-800' : 'bg-white'
                }`}>
                  <div className={`p-4 border-b ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">🔍</span>
                      <input
                        type="text"
                        placeholder="Search for people, pages, groups and #hashtags"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                          isDarkMode 
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
                                  <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                                    result.type === 'post' ? 'bg-blue-500' : 
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
                      className={`w-full py-2 text-sm transition-colors ${
                        isDarkMode 
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
                    className={`w-8 h-8 rounded-full flex items-center justify-center text-lg transition-all touch-manipulation ${
                      openDropdown === 'people' 
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
                    <div className={`absolute top-10 right-0 w-72 rounded-xl shadow-xl p-4 z-50 border ${
                      isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
                    }`}>
                      <div className="flex flex-col items-center text-center">
                        <div className={`w-12 h-12 rounded-full flex items-center justify-center mb-3 ${
                          isDarkMode ? 'bg-purple-900/30' : 'bg-purple-100'
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
                    className={`w-8 h-8 rounded-full flex items-center justify-center text-lg transition-all touch-manipulation ${
                      openDropdown === 'messages' 
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
                    <div className={`absolute top-10 right-0 w-72 rounded-xl shadow-xl p-4 z-50 border ${
                      isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
                    }`}>
                      <div className="flex flex-col items-center text-center">
                        <div className={`w-12 h-12 rounded-full flex items-center justify-center mb-3 ${
                          isDarkMode ? 'bg-red-900/30' : 'bg-red-100'
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
                    className={`w-8 h-8 rounded-full flex items-center justify-center text-lg transition-all touch-manipulation ${
                      isAdminPage 
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
                    <span className={`absolute -top-1 -right-1 min-w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center font-bold transition-all duration-300 shadow-lg ${
                      notificationCount > lastNotificationCount && lastNotificationCount > 0 
                        ? 'animate-bounce scale-110 ring-4 ring-red-300 ring-opacity-50' 
                        : 'animate-pulse'
                    }`}>
                      {notificationCount > 99 ? '99+' : notificationCount}
                    </span>
                  )}
                  
                  {/* Pulsing dot for new notifications */}
                  {notificationCount > 0 && (
                    <div className={`absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full transition-all duration-300 ${
                      notificationCount > lastNotificationCount && lastNotificationCount > 0 
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
                className={`w-8 h-8 rounded-full overflow-hidden transition-all touch-manipulation ${
                  profileSidebarOpen 
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
          <div className="fixed inset-0 bg-black bg-opacity-50 z-[55]" onClick={() => {
            setSidebarOpen(false);
            setProfileSidebarOpen(false);
          }} />
        )}

        {/* Mobile Profile Sidebar */}
        {isMobile && profileSidebarOpen && (
          <aside className={`fixed right-0 top-0 h-screen w-80 z-[60] transform transition-all duration-300 ${
            isDarkMode 
              ? 'bg-gray-900 border-l border-gray-700' 
              : 'bg-white border-l border-gray-200'
          }`} style={{ top: '64px', height: 'calc(100vh - 64px)' }}>
            <div className={`p-4 border-b flex items-center justify-between ${
              isDarkMode 
                ? 'border-gray-700' 
                : 'border-gray-200'
            }`}>
              <h2 className={`font-bold text-lg ${
                isDarkMode 
                  ? 'text-white' 
                  : 'text-gray-900'
              }`}>Profile</h2>
              <button
                onClick={() => setProfileSidebarOpen(false)}
                className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors ${
                  isDarkMode 
                    ? 'bg-gray-700 hover:bg-gray-600 text-gray-300' 
                    : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                }`}
              >
                ✕
              </button>
            </div>

            <div className="flex-1 p-4 overflow-y-auto">
              {/* Profile Section */}
              <div className={`flex items-center gap-2 mb-4 p-3 rounded-lg ${
                isDarkMode 
                  ? 'bg-gray-800' 
                  : 'bg-gray-50'
              }`}>
                <img
                  src={profile.avatar}
                  alt="avatar"
                  className={`w-12 h-12 rounded-full object-cover ${
                    isDarkMode 
                      ? 'border border-gray-600' 
                      : 'border border-gray-200'
                  }`}
                />
                <div className="flex flex-col">
                  <span 
                    className={`font-semibold text-sm cursor-pointer transition-colors ${
                      isDarkMode 
                        ? 'text-white hover:text-blue-400' 
                        : 'text-gray-900 hover:text-blue-600'
                    }`}
                    onClick={handleMyProfile}
                  >
                    My Profile
                  </span>
                  <div className="flex gap-1 mt-1">
                    <span className={`flex items-center gap-1 px-1.5 py-0.5 rounded text-xs font-medium ${
                      isDarkMode 
                        ? 'bg-gray-700 text-gray-300' 
                        : 'bg-gray-100 text-gray-700'
                    }`}>
                      💳 {profile.balance}
                    </span>
                    <span className={`flex items-center gap-1 px-1.5 py-0.5 rounded text-xs font-medium ${
                      isDarkMode 
                        ? 'bg-gray-700 text-gray-300' 
                        : 'bg-gray-100 text-gray-700'
                    }`}>
                      👍 {profile.pokes} Pokes
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
                  className={`flex items-center gap-2 py-2 px-3 rounded-md text-left w-full transition-colors ${
                    isDarkMode 
                      ? 'hover:bg-gray-700' 
                      : 'hover:bg-gray-50'
                  }`}
                  onClick={() => router.push('/dashboard/upgrade')}
                >
                  <span className={`p-1.5 rounded-full text-sm ${
                    isDarkMode 
                      ? 'bg-gray-700' 
                      : 'bg-gray-100'
                  }`}>🛠️</span>
                  <span className={`font-medium text-sm ${
                    isDarkMode 
                      ? 'text-white' 
                      : 'text-gray-900'
                  }`}>Upgrade To Pro</span>
                </button>
                
                <button 
                  className={`flex items-center gap-2 py-2 px-3 rounded-md text-left w-full transition-colors ${
                    isDarkMode 
                      ? 'hover:bg-gray-700' 
                      : 'hover:bg-gray-50'
                  }`}
                  onClick={() => router.push('/dashboard/advertising')}
                >
                  <span className={`p-1.5 rounded-full text-sm ${
                    isDarkMode 
                      ? 'bg-gray-700' 
                      : 'bg-gray-100'
                  }`}>📢</span>
                  <span className={`font-medium text-sm ${
                    isDarkMode 
                      ? 'text-white' 
                      : 'text-gray-900'
                  }`}>Advertising</span>
                </button>
                
                <button 
                  className={`flex items-center gap-2 py-2 px-3 rounded-md text-left w-full transition-colors ${
                    isDarkMode 
                      ? 'hover:bg-gray-700' 
                      : 'hover:bg-gray-50'
                  }`}
                  onClick={() => router.push('/dashboard/subscriptions')}
                >
                  <span className={`p-1.5 rounded-full text-sm ${
                    isDarkMode 
                      ? 'bg-gray-700' 
                      : 'bg-gray-100'
                  }`}>💳</span>
                  <span className={`font-medium text-sm ${
                    isDarkMode 
                      ? 'text-white' 
                      : 'text-gray-900'
                  }`}>Subscriptions</span>
                </button>
                
                <div className={`my-2 ${
                  isDarkMode 
                    ? 'border-gray-600' 
                    : 'border-gray-200'
                } border-t`}></div>
                
                <button 
                  className={`flex items-center gap-2 py-2 px-3 rounded-md text-left w-full transition-colors ${
                    isDarkMode 
                      ? 'hover:bg-gray-700' 
                      : 'hover:bg-gray-50'
                  }`}
                  onClick={() => {
                    router.push('/dashboard/settings/privacy');
                    setProfileSidebarOpen(false);
                  }}
                >
                  <span className={`p-1.5 rounded-full text-sm ${
                    isDarkMode 
                      ? 'bg-gray-700' 
                      : 'bg-gray-100'
                  }`}>✔️</span>
                  <span className={`font-medium text-sm ${
                    isDarkMode 
                      ? 'text-white' 
                      : 'text-gray-900'
                  }`}>Privacy Setting</span>
                </button>
                
                <button 
                  className={`flex items-center gap-2 py-2 px-3 rounded-md text-left w-full transition-colors ${
                    isDarkMode 
                      ? 'hover:bg-gray-700' 
                      : 'hover:bg-gray-50'
                  }`}
                  onClick={() => {
                    router.push('/dashboard/settings');
                    setProfileSidebarOpen(false);
                  }}
                >
                  <span className={`p-1.5 rounded-full text-sm ${
                    isDarkMode 
                      ? 'bg-gray-700' 
                      : 'bg-gray-100'
                  }`}>⚙️</span>
                  <span className={`font-medium text-sm ${
                    isDarkMode 
                      ? 'text-white' 
                      : 'text-gray-900'
                  }`}>General Setting</span>
                </button>
                
                <button 
                  className={`flex items-center gap-2 py-2 px-3 rounded-md text-left w-full transition-colors ${
                    isDarkMode 
                      ? 'hover:bg-gray-700' 
                      : 'hover:bg-gray-50'
                  }`}
                  onClick={() => router.push('/dashboard/invite')}
                >
                  <span className={`p-1.5 rounded-full text-sm ${
                    isDarkMode 
                      ? 'bg-gray-700' 
                      : 'bg-gray-100'
                  }`}>✉️</span>
                  <span className={`font-medium text-sm ${
                    isDarkMode 
                      ? 'text-white' 
                      : 'text-gray-900'
                  }`}>Invite Your Friends</span>
                </button>
                
                <button 
                  className={`flex items-center gap-2 py-2 px-3 rounded-md text-left w-full transition-colors ${
                    isDarkMode 
                      ? 'hover:bg-gray-700' 
                      : 'hover:bg-gray-50'
                  }`}
                  onClick={() => {
                    router.push('/dashboard/admin');
                    setProfileSidebarOpen(false);
                  }}
                >
                  <span className={`p-1.5 rounded-full text-sm ${
                    isDarkMode 
                      ? 'bg-gray-700' 
                      : 'bg-gray-100'
                  }`}>👑</span>
                  <span className={`font-medium text-sm ${
                    isDarkMode 
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
              <div className={`mt-8 p-4 border-t ${
                isDarkMode 
                  ? 'border-gray-600' 
                  : 'border-gray-200'
              }`}>
                <div className={`text-xs flex flex-col items-center gap-2 ${
                  isDarkMode 
                    ? 'text-gray-400' 
                    : 'text-gray-500'
                }`}>
                  <div className="flex items-center gap-2">
                    <span>© 2025 Jaifriend</span>
                    <span>•</span>
                    <button className={`underline cursor-pointer transition-colors ${
                      isDarkMode 
                        ? 'hover:text-gray-300' 
                        : 'hover:text-gray-700'
                    }`}>Language</button>
                  </div>
                  <div className="flex flex-wrap gap-2 justify-center">
                    <button className={`underline cursor-pointer transition-colors text-xs ${
                      isDarkMode 
                        ? 'hover:text-gray-300' 
                        : 'hover:text-gray-700'
                    }`}>About</button>
                    <button className={`underline cursor-pointer transition-colors text-xs ${
                      isDarkMode 
                        ? 'hover:text-gray-300' 
                        : 'hover:text-gray-700'
                    }`}>Directory</button>
                    <button className={`underline cursor-pointer transition-colors text-xs ${
                      isDarkMode 
                        ? 'hover:text-gray-300' 
                        : 'hover:text-gray-700'
                    }`}>Contact Us</button>
                    <button className={`underline cursor-pointer transition-colors text-xs ${
                      isDarkMode 
                        ? 'hover:text-gray-300' 
                        : 'hover:text-gray-700'
                    }`}>Developers</button>
                    <button className={`underline cursor-pointer transition-colors text-xs ${
                      isDarkMode 
                        ? 'hover:text-gray-300' 
                        : 'hover:text-gray-700'
                    }`}>Privacy Policy</button>
                    <button className={`underline cursor-pointer transition-colors text-xs ${
                      isDarkMode 
                        ? 'hover:text-gray-300' 
                        : 'hover:text-gray-700'
                    }`}>Terms of Use</button>
                    <button className={`underline cursor-pointer transition-colors text-xs ${
                      isDarkMode 
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
            <aside className={`fixed left-0 top-0 ${isAdminPage ? 'w-48' : 'w-64'} h-screen flex flex-col z-[60] transform transition-transform duration-300 ${
              isMobile 
                ? (sidebarOpen ? 'translate-x-0' : '-translate-x-full')
                : 'translate-x-0'
            } ${isAdminPage ? 'bg-gray-900' : 'bg-white dark:bg-gray-800'}`} style={{
              height: 'calc(100vh - 64px)',
              top: '64px',
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
                  <h2 className={`font-bold text-lg ${isAdminPage ? 'text-white' : 'text-gray-900 dark:text-white'}`}>
                    {isSettingsPage ? 'Settings' : isAdminPage ? 'Admin' : 'Menu'}
                  </h2>
                  <button
                    onClick={() => setSidebarOpen(false)}
                      className={`w-8 h-8 rounded-full flex items-center justify-center hover:transition-colors ${
                        isAdminPage 
                          ? 'bg-gray-700 hover:bg-gray-600 text-gray-300' 
                          : 'bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300'
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
                      className={`flex items-center justify-between w-full mb-3 p-3 rounded-lg transition-colors focus:outline-none ${
                        isDarkMode ? 'hover:bg-gray-700' : 'hover:bg-[#eaf0fb]'
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
                      className={`flex items-center justify-between w-full mb-3 p-3 rounded-lg transition-colors focus:outline-none ${
                        isDarkMode ? 'hover:bg-gray-700' : 'hover:bg-[#eaf0fb]'
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
                      className={`flex items-center justify-between w-full mb-3 p-3 rounded-lg transition-colors focus:outline-none ${
                        isDarkMode ? 'hover:bg-gray-700' : 'hover:bg-[#eaf0fb]'
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
                        }}                         onMouseEnter={(e) => {
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
            <aside className={`flex flex-col fixed left-0 top-0 h-screen transition-all duration-300 scrollbar-hide ${
              sidebarCollapsed ? 'w-16' : isAdminPage ? 'w-48' : 'w-64'
            } ${isDarkMode ? 'bg-gray-800' : 'bg-white'} ${isAdminPage ? 'bg-gray-900' : ''} ${
              isAdminPage ? '' : isDarkMode ? 'shadow-2xl' : 'shadow-lg'
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
                          className={`flex items-center justify-between w-full mb-1 p-1.5 rounded-md transition-colors focus:outline-none ${
                            isDarkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-50'
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
                                  className={`flex flex-col items-center gap-2 p-3 rounded-xl transition-all duration-200 group relative ${
                                    pathname === item.href 
                                      ? isDarkMode 
                                        ? 'bg-blue-600 text-white shadow-lg ' 
                                        : 'bg-blue-100 border-2 border-blue-300 shadow-md ' 
                                      : isDarkMode 
                                        ? 'hover:bg-gray-700 text-gray-300' 
                                        : 'hover:bg-gray-100 text-gray-700'
                                  }`}
                                  title={item.name}
                                >
                                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center text-xl shadow  transition-all duration-200 ${
                                    pathname === item.href
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
                          className={`flex items-center justify-between w-full mb-1 p-1.5 rounded-md transition-colors focus:outline-none ${
                            isDarkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-50'
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
                                  className={`flex flex-col items-center gap-2 p-3 rounded-xl transition-all duration-200 group relative ${
                                    pathname === item.href 
                                      ? isDarkMode 
                                        ? 'bg-blue-600 text-white shadow-lg ' 
                                        : 'bg-blue-100 border-2 border-blue-300 shadow-md ' 
                                      : isDarkMode 
                                        ? 'hover:bg-gray-700 text-gray-300' 
                                        : 'hover:bg-gray-100 text-gray-700'
                                  }`}
                                  title={item.name}
                                >
                                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center text-xl shadow  transition-all duration-200 ${
                                    pathname === item.href
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
                          className={`flex items-center justify-between w-full mb-1 p-1.5 rounded-md transition-colors focus:outline-none ${
                            isDarkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-50'
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
                                  className={`flex flex-col items-center gap-2 p-3 rounded-xl transition-all duration-200 group relative ${
                                    pathname === item.href 
                                      ? isDarkMode 
                                        ? 'bg-red-600 text-white shadow-lg ' 
                                        : 'bg-red-100 border-2 border-red-300 shadow-md ' 
                                      : isDarkMode 
                                        ? 'hover:bg-gray-700 text-gray-300' 
                                        : 'hover:bg-gray-100 text-gray-700'
                                  }`}
                                  title={item.name}
                                >
                                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center text-xl shadow  transition-all duration-200 ${
                                    pathname === item.href
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
                          }}                         onMouseEnter={(e) => {
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
            <aside className={`overflow-y-auto overflow-x-hidden flex flex-col fixed left-0 top-0 h-screen transition-all duration-300 scrollbar-hide z-[60] ${
              profileSidebarOpen ? 'w-64' : 'w-0'
            } ${isDarkMode ? 'bg-gray-900 border-r border-gray-700' : 'bg-white border-r border-gray-200'}`}>
              {profileSidebarOpen && (
                <>
                  <div className={`p-4 border-b flex items-center justify-between ${
                    isDarkMode 
                      ? 'border-gray-700' 
                      : 'border-gray-200'
                  }`}>
                    <h2 className={`font-bold text-lg ${
                      isDarkMode 
                        ? 'text-white' 
                        : 'text-gray-900'
                    }`}>Profile</h2>
                    <button
                      onClick={() => setProfileSidebarOpen(false)}
                      className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors ${
                        isDarkMode 
                          ? 'bg-gray-700 hover:bg-gray-600 text-gray-300' 
                          : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                      }`}
                    >
                      ✕
                    </button>
                  </div>

                  <div className="flex-1 p-4 overflow-y-auto scrollbar-hide">
                    {/* Profile Section */}
                    <div className={`flex items-center gap-2 mb-4 p-3 rounded-lg ${
                      isDarkMode 
                        ? 'bg-gray-800' 
                        : 'bg-gray-50'
                    }`}>
                      <img
                        src={profile.avatar}
                        alt="avatar"
                        className={`w-12 h-12 rounded-full object-cover ${
                          isDarkMode 
                            ? 'border border-gray-600' 
                            : 'border border-gray-200'
                        }`}
                      />
                      <div className="flex flex-col">
                        <span 
                          className={`font-semibold text-sm cursor-pointer transition-colors ${
                            isDarkMode 
                              ? 'text-white hover:text-blue-400' 
                              : 'text-gray-900 hover:text-blue-600'
                          }`}
                          onClick={handleMyProfile}
                        >
                          My Profile
                        </span>
                        <div className="flex gap-1 mt-1">
                          <span className={`flex items-center gap-1 px-1.5 py-0.5 rounded text-xs font-medium ${
                            isDarkMode 
                              ? 'bg-gray-700 text-gray-300' 
                              : 'bg-gray-100 text-gray-700'
                          }`}>
                            💳 {profile.balance}
                          </span>
                          <span className={`flex items-center gap-1 px-1.5 py-0.5 rounded text-xs font-medium ${
                            isDarkMode 
                              ? 'bg-gray-700 text-gray-300' 
                              : 'bg-gray-100 text-gray-700'
                          }`}>
                            👍 {profile.pokes} Pokes
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
                        className={`flex items-center gap-2 py-2 px-3 rounded-md text-left w-full transition-colors ${
                          isDarkMode 
                            ? 'hover:bg-gray-700' 
                            : 'hover:bg-gray-50'
                        }`}
                        onClick={() => router.push('/dashboard/upgrade')}
                      >
                        <span className={`p-1.5 rounded-full text-sm ${
                          isDarkMode 
                            ? 'bg-gray-700' 
                            : 'bg-gray-100'
                        }`}>🛠️</span>
                        <span className={`font-medium text-sm ${
                          isDarkMode 
                            ? 'text-white' 
                            : 'text-gray-900'
                        }`}>Upgrade To Pro</span>
                      </button>
                      
                      <button 
                        className={`flex items-center gap-2 py-2 px-3 rounded-md text-left w-full transition-colors ${
                          isDarkMode 
                            ? 'hover:bg-gray-700' 
                            : 'hover:bg-gray-50'
                        }`}
                        onClick={() => router.push('/dashboard/advertising')}
                      >
                        <span className={`p-1.5 rounded-full text-sm ${
                          isDarkMode 
                            ? 'bg-gray-700' 
                            : 'bg-gray-100'
                        }`}>📢</span>
                        <span className={`font-medium text-sm ${
                          isDarkMode 
                            ? 'text-white' 
                            : 'text-gray-900'
                        }`}>Advertising</span>
                      </button>
                      
                      <button 
                        className={`flex items-center gap-2 py-2 px-3 rounded-md text-left w-full transition-colors ${
                          isDarkMode 
                            ? 'hover:bg-gray-700' 
                            : 'hover:bg-gray-50'
                        }`}
                        onClick={() => router.push('/dashboard/subscriptions')}
                      >
                        <span className={`p-1.5 rounded-full text-sm ${
                          isDarkMode 
                            ? 'bg-gray-700' 
                            : 'bg-gray-100'
                        }`}>💳</span>
                        <span className={`font-medium text-sm ${
                          isDarkMode 
                            ? 'text-white' 
                            : 'text-gray-900'
                        }`}>Subscriptions</span>
                      </button>
                      
                      <div className={`my-2 ${
                        isDarkMode 
                          ? 'border-gray-600' 
                          : 'border-gray-200'
                      } border-t`}></div>
                      
                      <button 
                        className={`flex items-center gap-2 py-2 px-3 rounded-md text-left w-full transition-colors ${
                          isDarkMode 
                            ? 'hover:bg-gray-700' 
                            : 'hover:bg-gray-50'
                        }`}
                        onClick={() => {
                          router.push('/dashboard/settings/privacy');
                          setProfileSidebarOpen(false);
                        }}
                      >
                        <span className={`p-1.5 rounded-full text-sm ${
                          isDarkMode 
                            ? 'bg-gray-700' 
                            : 'bg-gray-100'
                        }`}>✔️</span>
                        <span className={`font-medium text-sm ${
                          isDarkMode 
                            ? 'text-white' 
                            : 'text-gray-900'
                        }`}>Privacy Setting</span>
                      </button>
                      
                      <button 
                        className={`flex items-center gap-2 py-2 px-3 rounded-md text-left w-full transition-colors ${
                          isDarkMode 
                            ? 'hover:bg-gray-700' 
                            : 'hover:bg-gray-50'
                        }`}
                        onClick={() => {
                          router.push('/dashboard/settings');
                          setProfileSidebarOpen(false);
                        }}
                      >
                        <span className={`p-1.5 rounded-full text-sm ${
                          isDarkMode 
                            ? 'bg-gray-700' 
                            : 'bg-gray-100'
                        }`}>⚙️</span>
                        <span className={`font-medium text-sm ${
                          isDarkMode 
                            ? 'text-white' 
                            : 'text-gray-900'
                        }`}>General Setting</span>
                      </button>
                      
                      <button 
                        className={`flex items-center gap-2 py-2 px-3 rounded-md text-left w-full transition-colors ${
                          isDarkMode 
                            ? 'hover:bg-gray-700' 
                            : 'hover:bg-gray-50'
                        }`}
                        onClick={() => router.push('/dashboard/invite')}
                      >
                        <span className={`p-1.5 rounded-full text-sm ${
                          isDarkMode 
                            ? 'bg-gray-700' 
                            : 'bg-gray-100'
                        }`}>✉️</span>
                        <span className={`font-medium text-sm ${
                          isDarkMode 
                            ? 'text-white' 
                            : 'text-gray-900'
                        }`}>Invite Your Friends</span>
                      </button>
                      
                      <button 
                        className={`flex items-center gap-2 py-2 px-3 rounded-md text-left w-full transition-colors ${
                          isDarkMode 
                            ? 'hover:bg-gray-700' 
                            : 'hover:bg-gray-50'
                        }`}
                        onClick={() => {
                          router.push('/dashboard/admin');
                          setProfileSidebarOpen(false);
                        }}
                      >
                        <span className={`p-1.5 rounded-full text-sm ${
                          isDarkMode 
                            ? 'bg-gray-700' 
                            : 'bg-gray-100'
                        }`}>👑</span>
                        <span className={`font-medium text-sm ${
                          isDarkMode 
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
                    <div className={`mt-8 p-4 border-t ${
                      isDarkMode 
                        ? 'border-gray-600' 
                        : 'border-gray-200'
                    }`}>
                      <div className={`text-xs flex flex-col items-center gap-2 ${
                        isDarkMode 
                          ? 'text-gray-400' 
                          : 'text-gray-500'
                      }`}>
                        <div className="flex items-center gap-2">
                          <span>© 2025 Jaifriend</span>
                          <span>•</span>
                          <button className={`underline cursor-pointer transition-colors ${
                            isDarkMode 
                              ? 'hover:text-gray-300' 
                              : 'hover:text-gray-700'
                          }`}>Language</button>
                        </div>
                        <div className="flex flex-wrap gap-2 justify-center">
                          <button className={`underline cursor-pointer transition-colors text-xs ${
                            isDarkMode 
                              ? 'hover:text-gray-300' 
                              : 'hover:text-gray-700'
                          }`}>About</button>
                          <button className={`underline cursor-pointer transition-colors text-xs ${
                            isDarkMode 
                              ? 'hover:text-gray-300' 
                              : 'hover:text-gray-700'
                          }`}>Directory</button>
                          <button className={`underline cursor-pointer transition-colors text-xs ${
                            isDarkMode 
                              ? 'hover:text-gray-300' 
                              : 'hover:text-gray-700'
                          }`}>Contact Us</button>
                          <button className={`underline cursor-pointer transition-colors text-xs ${
                            isDarkMode 
                              ? 'hover:text-gray-300' 
                              : 'hover:text-gray-700'
                          }`}>Developers</button>
                          <button className={`underline cursor-pointer transition-colors text-xs ${
                            isDarkMode 
                              ? 'hover:text-gray-300' 
                              : 'hover:text-gray-700'
                          }`}>Privacy Policy</button>
                          <button className={`underline cursor-pointer transition-colors text-xs ${
                            isDarkMode 
                              ? 'hover:text-gray-300' 
                              : 'hover:text-gray-700'
                          }`}>Terms of Use</button>
                          <button className={`underline cursor-pointer transition-colors text-xs ${
                            isDarkMode 
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
          flex-1 transition-all duration-300 min-h-screen overflow-x-hidden bg-gray-50 dark:bg-gray-900
          ${isMessagesPage || isVideoCallPage
            ? 'ml-0 mr-0 pt-0 pb-0' 
            : isMobile 
              ? 'ml-0 mr-0 pb-20'
              : sidebarCollapsed 
                ? 'ml-16' 
                : isAdminPage 
                  ? 'ml-48' 
                  : 'ml-64'
          }
          ${!isMessagesPage && !isVideoCallPage && 'md:mr-20'}
          ${!isMobile && !isMessagesPage && !isVideoCallPage && profileSidebarOpen ? 'ml-96' : ''}
          ${!isMessagesPage && !isVideoCallPage && 'pt-16'}
        `} style={{ 
          paddingLeft: '0', 
          paddingRight: '0'
        }}>
          <div className="w-full h-full overflow-x-hidden max-w-full">
            <div className={`w-full overflow-x-hidden ${isMessagesPage || isVideoCallPage ? 'max-w-none pt-0 pb-0' : 'max-w-full md:mr-24 pt-16 pb-24 md:pt-0 md:pb-0'}`}>
              {children}
            </div>
          </div>
        </main>
      </div>

      {/* Mobile Bottom Navigation */}
      {isMobile && !isMessagesPage && !isVideoCallPage && (
        <nav className="fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 z-[65] overflow-x-hidden transition-colors duration-200">
          <div className="flex justify-around items-center py-3 w-full max-w-full">
            <Link
              href="/dashboard"
              className={`flex flex-col items-center p-2 rounded-lg transition-colors ${
                pathname === '/dashboard' 
                  ? 'text-blue-600 dark:text-blue-400' 
                  : isDarkMode ? 'text-gray-300 hover:text-blue-400' : 'text-gray-600 hover:text-blue-600'
              }`}
            >
              <span className="text-xl mb-1">🏠</span>
              <span className="text-xs font-medium">Home</span>
            </Link>
            
            <Link
              href="/dashboard/find-friends"
              className={`flex flex-col items-center p-2 rounded-lg transition-colors ${
                pathname === '/dashboard/find-friends' 
                  ? 'text-blue-600 dark:text-blue-400' 
                  : isDarkMode ? 'text-gray-300 hover:text-blue-400' : 'text-gray-600 hover:text-blue-600'
              }`}
            >
              <span className="text-xl mb-1">👥</span>
              <span className="text-xs font-medium">Friends</span>
            </Link>
            
            <Link
              href="/dashboard/messages"
              className={`flex flex-col items-center p-2 rounded-lg transition-colors ${
                pathname === '/dashboard/messages' 
                  ? 'text-blue-600 dark:text-blue-400' 
                  : isDarkMode ? 'text-gray-300 hover:text-blue-400' : 'text-gray-600 hover:text-blue-600'
              }`}
            >
              <span className="text-xl mb-1">💬</span>
              <span className="text-xs font-medium">Messages</span>
            </Link>
            
            <Link
              href="/dashboard/notifications"
              className={`flex flex-col items-center p-2 rounded-lg transition-colors relative ${
                pathname === '/dashboard/notifications' 
                  ? 'text-blue-600 dark:text-blue-400' 
                  : 'text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400'
              }`}
            >
              <div className="relative">
                <span className="text-xl mb-1">🔔</span>
                {/* Notification count badge for mobile */}
                {notificationCount > 0 && (
                  <span className={`absolute -top-1 -right-1 min-w-4 h-4 bg-red-500 text-white text-xs rounded-full flex items-center justify-center font-bold transition-all duration-300 shadow-lg ${
                    notificationCount > lastNotificationCount && lastNotificationCount > 0 
                      ? 'animate-bounce scale-110 ring-2 ring-red-300 ring-opacity-50' 
                      : 'animate-pulse'
                  }`}>
                    {notificationCount > 9 ? '9+' : notificationCount}
                  </span>
                )}
                
                {/* Pulsing dot for new notifications on mobile */}
                {notificationCount > 0 && (
                  <div className={`absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full transition-all duration-300 ${
                    notificationCount > lastNotificationCount && lastNotificationCount > 0 
                      ? 'animate-ping scale-150' 
                      : 'opacity-0'
                  }`}></div>
                )}
              </div>
              <span className="text-xs font-medium">Notifications</span>
            </Link>
            
            <Link
              href="/dashboard/profile"
              className={`flex flex-col items-center p-2 rounded-lg transition-colors ${
                pathname === '/dashboard/profile' 
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
      {!isMessagesPage && !isVideoCallPage && <FloatingActionButton isAdminPage={isAdminPage} />}

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