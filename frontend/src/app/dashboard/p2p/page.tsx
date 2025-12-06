"use client";
import React, { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { isAuthenticated } from '@/utils/auth';
import ToastContainer from '@/components/ToastContainer';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination, Autoplay } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';
import { useDarkMode } from '@/contexts/DarkModeContext';
import {
  FaShareAlt,
  FaSearch,
  FaTwitter,
  FaLinkedin,
  FaInstagram,
  FaStar,
  FaPhone,
  FaVideo,
  FaComments,
  FaCopy,
  FaLightbulb,
  FaGithub,
  FaBehance,
  FaGlobe,
  FaYoutube,
  FaFacebook
} from 'react-icons/fa';
import { HiDotsVertical } from 'react-icons/hi';

const API_URL = process.env.NEXT_PUBLIC_API_URL;
const getAvatarUrl = (url?: string | null) => url?.startsWith('http') ? url : url?.includes('/avatars/') || url?.includes('/covers/') ? (url.startsWith('/') ? url : `/${url}`) : url ? `${API_URL}/${url}` : '/default-avatar.svg';

// Feature flags to control section visibility
const SHOW_WORTH_EXPLORING = true;
const SHOW_TRENDING_SHORTS = true;
const SHOW_TOP_RATED_PROFILES = true;
const SHOW_FIND_BY_EXPERTS = true;
const SHOW_FEATURE_CARDS = false;
const SHOW_BANNER_CAROUSEL = false;
const SHOW_FIND_BY_CATEGORY = true;

const CATEGORY_PLACEHOLDERS = [
  { id: 'relationship', title: 'Relationship & Loneliness', image: 'https://cfront-unikon-assets.unikon.ai/extra_asset_19368_59d475d3-ee9a-4ce7-b319-88bd1a42961e.png', description: 'Dating advice | Emotional support | Moving on | Breakup' },
  { id: 'astrology', title: 'Astrology & More', image: 'https://cfront-unikon-assets.unikon.ai/extra_asset_19370_61290102-0201-4187-9747-296c2f211572.png', description: 'Vedic Astrology/Vaastu | Tarot | Numerology | Kundli' },
  { id: 'careers', title: 'Careers & Jobs', image: 'https://cfront-unikon-assets.unikon.ai/extra_asset_19350_7e4f44aa-ebd3-437d-8b05-4c5d60731da7.png', description: 'Job switch | Career planning | International careers | Upskill' },
  { id: 'life-coach', title: 'Life Coach', image: 'https://cfront-unikon-assets.unikon.ai/extra_asset_19357_61a16c0d-9a95-44a4-84a9-54e284d24fda.png', description: 'Work life balance | Stress management | Confidence building' },
  { id: 'fitness', title: 'Fitness & Nutrition', image: 'https://cfront-unikon-assets.unikon.ai/extra_asset_19367_97e70bef-7a25-405e-9ed2-47263190d9a9.png', description: 'Dietician | Body building | Weight management | Yoga' },
  { id: 'influencers', title: 'Influencers & Models', image: 'https://cfront-unikon-assets.unikon.ai/extra_asset_19369_88d452bf-9b63-4f14-a867-7bb6db23cf91.png', description: 'Creators | Models | Directors | Artists' },
  { id: 'finance', title: 'Finance & Trading', image: 'https://cfront-unikon-assets.unikon.ai/extra_asset_19360_2a75c4a2-a983-4c37-b585-fc8146af7c50.png', description: 'Taxation | Stocks | Mutual funds | Crypto | Planning' },
  { id: 'college', title: 'College Studies', image: 'https://cfront-unikon-assets.unikon.ai/extra_asset_19356_85c68f72-61d7-4dea-9e3d-81b4cd1fe0c8.png', description: 'Entrance | Networking | Study abroad | Exams | Dream college' },
  { id: 'communication', title: 'Communication', image: 'https://cfront-unikon-assets.unikon.ai/extra_asset_19365_7b076ef2-4d82-4a02-b7f8-9dadd69ccabc.png', description: 'English | Foreign languages | Public speaking | Storytelling' },
  { id: 'mental-health', title: 'Mental Well Being', image: 'https://cfront-unikon-assets.unikon.ai/extra_asset_135346_9e7a96f3-06d3-437e-b734-49ddfb43d3bf.png', description: 'Anxiety | Stress | Therapy | ADHD' }
];

const FALLBACK_CATEGORY_IMAGE = CATEGORY_PLACEHOLDERS[0].image;

type TabType = 'browse' | 'my-profile' | 'create' | 'bookings' | 'provider-bookings';
type ToastType = 'success' | 'error' | 'info' | 'warning';

interface BaseUser { _id: string; name: string; username: string; avatar: string; }
interface ExtendedUser extends BaseUser { fullName?: string; email: string; bio: string; location: string; }
interface SimpleProfile { _id: string; occupation: string; hourlyRate: number; currency: string; }

interface P2PCategory {
  _id: string;
  title: string;
  description?: string;
  image?: string;
  slug?: string;
}

const WEEK_DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

interface P2PProfile {
  _id: string;
  userId: ExtendedUser;
  occupation: string;
  currentOrganisation?: string;
  workExperience?: string;
  aboutMeLocation?: string;
  description?: string;
  areasOfExpertise?: string[];
  hourlyRate: number;
  audioCallRate?: number;
  videoCallRate?: number;
  chatRate?: number;
  audioCallPrice?: string;
  videoCallPrice?: string;
  chatPrice?: string;
  currency: string;
  skills: string[];
  experience: string;
  availableFromTime?: string;
  availableToTime?: string;
  availability: string;
  availableDays?: string[];
  workingHours: { start: string; end: string; };
  timezone: string;
  languages: { language: string; proficiency: string; }[];
  portfolio: { title: string; description: string; url: string; image: string; }[];
  certifications: { name: string; issuer: string; date: string; credentialId: string; }[];
  rating: { average: number; count: number; };
  completedJobs: number;
  responseTime: string;
  isActive: boolean;
  isVerified: boolean;
  featured: boolean;
  tags: string[];
  socialLinks: Record<string, string>;
  createdAt: string;
  updatedAt: string;
  category?: P2PCategory | null;
}

interface Booking {
  _id: string;
  clientId: BaseUser;
  serviceProviderId: BaseUser;
  p2pProfileId: SimpleProfile;
  serviceType: string;
  title: string;
  description: string;
  scheduledDate: string;
  duration: number;
  totalAmount: number;
  currency: string;
  status: string;
  createdAt: string;
  updatedAt: string;
}

interface SocialLinkItem {
  name: string;
  url: string;
}

interface CreateProfileData {
  occupation: string;
  hourlyRate: number;
  currency: string;
  audioCallPrice: string;
  videoCallPrice: string;
  chatPrice: string;
  skills: string[];
  experience: string;
  availability: string;
  availableDays: string[];
  workingHours: { start: string; end: string; };
  timezone: string;
  languages: { language: string; proficiency: string; }[];
  portfolio: { title: string; description: string; url: string; image: string; }[];
  certifications: { name: string; issuer: string; date: string; credentialId: string; }[];
  responseTime: string;
  tags: string[];
  socialLinks: SocialLinkItem[];
  categoryId?: string;
}

interface ToastData { id: string; type: ToastType; title: string; message: string; duration?: number; }

export default function P2PPage() {
  const router = useRouter();
  const { isDarkMode } = useDarkMode();
  const [activeTab, setActiveTab] = useState<TabType>('browse');
  const [profiles, setProfiles] = useState<P2PProfile[]>([]);
  const [featuredProfiles, setFeaturedProfiles] = useState<P2PProfile[]>([]);
  const [myProfile, setMyProfile] = useState<P2PProfile | null>(null);
  const [currentUser, setCurrentUser] = useState<ExtendedUser | null>(null);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [providerBookings, setProviderBookings] = useState<Booking[]>([]);
  const [allBookings, setAllBookings] = useState<Booking[]>([]);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [selectedBookingForPayment, setSelectedBookingForPayment] = useState<Booking | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<P2PProfile[]>([]);
  const [hasSearched, setHasSearched] = useState(false);
  const [filters, setFilters] = useState({ occupation: '', minRate: '', maxRate: '', skills: '' });
  const [selectedProfileDetail, setSelectedProfileDetail] = useState<P2PProfile | null>(null);
  const [showTimeChangeModal, setShowTimeChangeModal] = useState(false);
  const [selectedBookingForTimeChange, setSelectedBookingForTimeChange] = useState<Booking | null>(null);
  const [newTime, setNewTime] = useState('');
  const [updatingTime, setUpdatingTime] = useState(false);

  const [profileForm, setProfileForm] = useState<CreateProfileData>({
    occupation: '', hourlyRate: 0, currency: 'USD',
    audioCallPrice: '', videoCallPrice: '', chatPrice: '',
    skills: [], experience: '',
    availability: 'Available', availableDays: [],
    workingHours: { start: '09:00', end: '17:00' },
    timezone: 'UTC', languages: [{ language: '', proficiency: 'Intermediate' }],
    portfolio: [], certifications: [], responseTime: 'Within 24 hours', tags: [],
    socialLinks: [],
    categoryId: ''
  });
  const [newSkill, setNewSkill] = useState('');
  const [newTag, setNewTag] = useState('');
  const [newLanguage, setNewLanguage] = useState('');
  const [toasts, setToasts] = useState<ToastData[]>([]);
  const [categories, setCategories] = useState<P2PCategory[]>([]);
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>('');
  const categoryCards = useMemo(() => {
    if (!categories.length) {
      return CATEGORY_PLACEHOLDERS;
    }
    return categories.map(category => ({
      id: category._id,
      title: category.title,
      description: category.description || 'Discover trusted experts in this category',
      image: category.image || FALLBACK_CATEGORY_IMAGE
    }));
  }, [categories]);
  const worthExploringItems = useMemo(() => {
    if (categories.length) {
      return categories.slice(0, 18).map(category => ({
        id: category._id,
        label: category.title,
        isSelectable: true
      }));
    }
    return CATEGORY_PLACEHOLDERS.map(category => ({
      id: category.id,
      label: category.title,
      isSelectable: false
    }));
  }, [categories]);

  const addToast = (type: ToastType, title: string, message: string, duration = 5000) => {
    setToasts(prev => [...prev, { id: Date.now().toString(), type, title, message, duration }]);
  };

  const removeToast = (id: string) => setToasts(prev => prev.filter(toast => toast.id !== id));

  // Calculate P2P profile completion percentage
  const calculateProfileCompletion = (profile: P2PProfile): number => {
    const fields = [
      { key: 'occupation', value: profile.occupation },
      { key: 'hourlyRate', value: profile.hourlyRate },
      { key: 'skills', value: profile.skills?.length > 0 },
      { key: 'experience', value: profile.experience || profile.description },
      { key: 'workingHours', value: profile.workingHours?.start && profile.workingHours?.end },
      { key: 'availability', value: profile.availability },
      { key: 'languages', value: profile.languages?.length > 0 },
      { key: 'description', value: profile.description },
      { key: 'userId.avatar', value: profile.userId?.avatar },
      { key: 'userId.name', value: profile.userId?.name || profile.userId?.fullName },
    ];

    const completedFields = fields.filter(field => {
      if (typeof field.value === 'boolean') return field.value;
      if (Array.isArray(field.value)) return field.value.length > 0;
      return field.value && field.value.toString().trim() !== '';
    }).length;

    return Math.round((completedFields / fields.length) * 100);
  };

  // Get filtered and sorted profiles for "Top experts for you"
  const getTopExpertsProfiles = (): P2PProfile[] => {
    const allProfiles = featuredProfiles.length > 0 ? featuredProfiles : profiles;

    // Get logged-in user's category
    const userCategoryId = myProfile?.category?._id;

    // If user doesn't have a category, return empty array
    if (!userCategoryId) {
      return [];
    }

    // Filter profiles with same category as logged-in user
    const sameCategoryProfiles = allProfiles.filter(profile => {
      const profileCategoryId = profile.category?._id;
      return profileCategoryId && profileCategoryId.toString() === userCategoryId.toString();
    });

    // Count bookings for each profile - use completedJobs if available, otherwise count from all bookings
    // Combine all bookings and remove duplicates
    const allBookingsMap = new Map<string, Booking>();
    [...bookings, ...providerBookings, ...allBookings].forEach(booking => {
      if (booking._id) {
        allBookingsMap.set(booking._id, booking);
      }
    });
    const allBookingsForCounting = Array.from(allBookingsMap.values());

    const profilesWithBookingCount = sameCategoryProfiles.map(profile => {
      // Use completedJobs if available, otherwise count from bookings
      let bookingCount = profile.completedJobs || 0;

      if (bookingCount === 0) {
        // Count bookings from available data
        bookingCount = allBookingsForCounting.filter(booking => {
          const bookingProfileId = booking.p2pProfileId?._id || booking.p2pProfileId;
          return bookingProfileId && bookingProfileId.toString() === profile._id.toString();
        }).length;
      }

      return { profile, bookingCount };
    });

    // Sort by booking count (most bookings first), then by rating
    return profilesWithBookingCount.sort((a, b) => {
      if (b.bookingCount !== a.bookingCount) {
        return b.bookingCount - a.bookingCount;
      }
      // If booking counts are equal, sort by rating
      const ratingA = a.profile.rating?.average || 0;
      const ratingB = b.profile.rating?.average || 0;
      return ratingB - ratingA;
    }).map(item => item.profile);
  };

  // Get filtered and sorted profiles for "Top Rated Profiles"
  const getTopRatedProfiles = (): P2PProfile[] => {
    const allProfiles = featuredProfiles.length > 0 ? featuredProfiles : profiles;

    // Get logged-in user's category
    const userCategoryId = myProfile?.category?._id;

    // If user doesn't have a category, return empty array or all profiles
    if (!userCategoryId) {
      return [];
    }

    // Filter profiles with same category as logged-in user
    const sameCategoryProfiles = allProfiles.filter(profile => {
      const profileCategoryId = profile.category?._id;
      return profileCategoryId && profileCategoryId.toString() === userCategoryId.toString();
    });

    // Sort by rating (highest rating first), then by number of reviews
    return sameCategoryProfiles.sort((a, b) => {
      const ratingA = a.rating?.average || 0;
      const ratingB = b.rating?.average || 0;

      if (ratingB !== ratingA) {
        return ratingB - ratingA;
      }

      // If ratings are equal, sort by number of reviews
      const reviewsA = a.rating?.count || 0;
      const reviewsB = b.rating?.count || 0;
      return reviewsB - reviewsA;
    });
  };

  useEffect(() => {
    if (!isAuthenticated()) {
      router.push('/');
      return;
    }
    loadData();
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      if (isAuthenticated()) {
        Promise.all([loadBookings(), loadProviderBookings()]);
      }
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  const apiCall = async (endpoint: string, options?: RequestInit) => {
    const token = localStorage.getItem('token');
    return fetch(`${API_URL}${endpoint}`, {
      headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json', ...options?.headers },
      ...options
    });
  };

  const fetchProfileDetails = async (profileId: string): Promise<P2PProfile | null> => {
    try {
      const response = await apiCall(`/api/p2p/profiles/${profileId}`);
      if (!response.ok) return null;
      const data = await response.json();
      return data.profile || null;
    } catch {
      return null;
    }
  };

  const getCurrencySymbol = (currency?: string) => (currency === 'INR' ? '₹' : '$');

  const parseNumericValue = (value?: string | number | null) => {
    if (value === null || value === undefined || value === '') return null;
    const numericValue = typeof value === 'number' ? value : parseFloat(value);
    return Number.isFinite(numericValue) ? numericValue : null;
  };

  const formatAmountDisplay = (amount?: string | number | null, currency?: string) => {
    if (amount === null || amount === undefined || amount === '') return '—';
    const numericValue = parseNumericValue(amount);
    if (numericValue === null) {
      return `${getCurrencySymbol(currency)}${amount}`;
    }
    return `${getCurrencySymbol(currency)}${numericValue.toLocaleString(undefined, { maximumFractionDigits: 2 })}`;
  };


  // Convert social links object to array format
  const convertSocialLinksToArray = (socialLinks: Record<string, string> | undefined): SocialLinkItem[] => {
    if (!socialLinks || typeof socialLinks !== 'object') return [];
    return Object.entries(socialLinks)
      .filter(([_, url]) => url && url.trim() !== '')
      .map(([name, url]) => ({ name, url }));
  };

  // Convert social links array to object format for backend
  const convertSocialLinksToObject = (socialLinks: SocialLinkItem[]): Record<string, string> => {
    const result: Record<string, string> = {};
    socialLinks.forEach(link => {
      if (link.name && link.name.trim() && link.url && link.url.trim()) {
        result[link.name.trim()] = link.url.trim();
      }
    });
    return result;
  };

  // Get icon component for social link platform
  const getSocialLinkIcon = (platformName: string) => {
    const name = platformName.toLowerCase().trim();
    if (name.includes('twitter') || name.includes('x.com')) return FaTwitter;
    if (name.includes('linkedin') || name.includes('linked')) return FaLinkedin;
    if (name.includes('instagram') || name.includes('insta')) return FaInstagram;
    if (name.includes('github') || name.includes('git')) return FaGithub;
    if (name.includes('behance')) return FaBehance;
    if (name.includes('youtube') || name.includes('yt')) return FaYoutube;
    if (name.includes('facebook') || name.includes('fb')) return FaFacebook;
    if (name.includes('website') || name.includes('web') || name.includes('site')) return FaGlobe;
    return FaGlobe; // Default icon
  };

  const loadData = async () => {
    try {
      setLoading(true);
      const [featuredRes, profilesRes, myProfileRes, currentUserRes, categoriesRes] = await Promise.all([
        apiCall('/api/p2p/profiles/featured'),
        apiCall('/api/p2p/profiles'),
        apiCall('/api/p2p/profile/me'),
        apiCall('/api/auth/me'),
        apiCall('/api/p2p/categories')
      ]);

      if (currentUserRes.ok) {
        const userData = await currentUserRes.json();
        setCurrentUser(userData.user || userData);
      }

      if (featuredRes.ok) {
        const data = await featuredRes.json();
        setFeaturedProfiles(data.profiles || []);
        if (data.profiles?.length > 0) setSelectedProfileDetail(prev => prev || data.profiles[0]);
      }

      if (profilesRes.ok) {
        const data = await profilesRes.json();
        setProfiles(data.profiles || []);
      }

      if (categoriesRes.ok) {
        const data = await categoriesRes.json();
        setCategories(data.categories || []);
      }

      if (myProfileRes.ok) {
        const data = await myProfileRes.json();
        setMyProfile(data.profile);
        if (data.profile) {
          const profile = data.profile;
          setProfileForm({
            occupation: profile.occupation || '', hourlyRate: profile.hourlyRate || 0,
            currency: profile.currency || 'USD',
            audioCallPrice: profile.audioCallPrice || '',
            videoCallPrice: profile.videoCallPrice || '',
            chatPrice: profile.chatPrice || '',
            skills: profile.skills || [],
            experience: profile.experience || '',
            availability: profile.availability || 'Available',
            availableDays: profile.availableDays || [],
            workingHours: profile.workingHours || { start: '09:00', end: '17:00' },
            timezone: profile.timezone || 'UTC',
            languages: profile.languages || [{ language: '', proficiency: 'Intermediate' }],
            portfolio: profile.portfolio || [], certifications: profile.certifications || [],
            responseTime: profile.responseTime || 'Within 24 hours', tags: profile.tags || [],
            socialLinks: convertSocialLinksToArray(profile.socialLinks),
            categoryId: profile.category?._id || ''
          });
        }
      }

      await Promise.all([loadBookings(), loadProviderBookings(), loadAllBookings()]);
    } catch (error) {
      setError('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const loadBookings = async () => {
    try {
      const [clientRes, providerRes] = await Promise.all([
        apiCall('/api/bookings?userType=client'),
        apiCall('/api/bookings?userType=provider')
      ]);
      if (clientRes.ok) {
        const data = await clientRes.json();
        setBookings(data.bookings || []);
      }
      if (providerRes.ok) {
        const data = await providerRes.json();
        setProviderBookings(data.bookings || []);
      }
    } catch (error) {
      // Silent error
    }
  };

  const loadProviderBookings = async () => loadBookings();

  const loadAllBookings = async () => {
    try {
      // Fetch all bookings with a high limit to get booking counts
      const response = await apiCall('/api/bookings?limit=1000');
      if (response.ok) {
        const data = await response.json();
        setAllBookings(data.bookings || []);
      }
    } catch (error) {
      // Silent error
    }
  };

  const loadProfiles = async () => {
    try {
      const queryParams = Object.entries(filters)
        .filter(([_, value]) => value)
        .map(([key, value]) => `${key}=${encodeURIComponent(value)}`)
        .join('&');

      const response = await apiCall(`/api/p2p/profiles${queryParams ? `?${queryParams}` : ''}`);

      if (response.ok) {
        const data = await response.json();
        setProfiles(data.profiles || []);
        if (data.profiles?.length > 0 && !selectedProfileDetail && featuredProfiles.length === 0) {
          setSelectedProfileDetail(prev => prev || data.profiles[0]);
        }
      }
    } catch (error) {
      // Silent error
    }
  };

  const handleCategorySelect = (categoryId: string) => {
    if (!categoryId || !categories.length) return;
    setSelectedCategoryId(categoryId);
    router.push(`/dashboard/p2p/category/${categoryId}`);
  };

  const searchProfiles = async () => {
    if (!searchQuery.trim()) {
      setHasSearched(false);
      setSearchResults([]);
      return;
    }
    try {
      const response = await apiCall(`/api/p2p/profiles/search?q=${encodeURIComponent(searchQuery)}`);
      if (response.ok) {
        const data = await response.json();
        setSearchResults(data.profiles || []);
        setHasSearched(true);
      } else {
        setSearchResults([]);
        setHasSearched(true);
      }
    } catch (error) {
      setSearchResults([]);
      setHasSearched(true);
    }
  };


  const acceptBooking = async (bookingId: string) => {
    try {
      const response = await apiCall(`/api/bookings/${bookingId}/accept`, { method: 'PUT' });
      if (response.ok) {
        await loadBookings();
        addToast('success', 'Booking Accepted!', 'Booking has been accepted successfully');
      } else {
        const data = await response.json();
        addToast('error', 'Accept Failed', data.message || 'Failed to accept booking');
      }
    } catch (error) {
      addToast('error', 'Network Error', 'Failed to accept booking. Please check your connection');
    }
  };

  const rejectBooking = async (bookingId: string) => {
    const reason = prompt('Please provide a reason for rejection:');
    if (!reason) return;

    try {
      const response = await apiCall(`/api/bookings/${bookingId}/reject`, {
        method: 'PUT', body: JSON.stringify({ reason })
      });

      if (response.ok) {
        await loadBookings();
        addToast('success', 'Booking Rejected', 'Booking has been rejected successfully');
      } else {
        const data = await response.json();
        addToast('error', 'Reject Failed', data.message || 'Failed to reject booking');
      }
    } catch (error) {
      addToast('error', 'Network Error', 'Failed to reject booking. Please check your connection');
    }
  };

  const updateBookingTime = async (bookingId: string, newTime: string) => {
    try {
      const response = await apiCall(`/api/bookings/${bookingId}/update-time`, {
        method: 'PUT',
        body: JSON.stringify({ newTime })
      });

      if (response.ok) {
        await loadBookings();
        addToast('success', 'Time Updated!', 'Booking time has been updated and message sent to client');
        return true;
      } else {
        const data = await response.json();
        addToast('error', 'Update Failed', data.message || 'Failed to update booking time');
        return false;
      }
    } catch (error) {
      addToast('error', 'Network Error', 'Failed to update booking time. Please check your connection');
      return false;
    }
  };

  const startVideoCall = async (bookingId: string) => {
    try {
      const response = await apiCall(`/api/bookings/${bookingId}/start`, { method: 'PUT' });
      const data = await response.json();

      if (response.ok) {
        window.location.href = `/dashboard/video-call/${data.videoCall.id}?type=admin`;
      } else {
        const errorMessage = data.message || 'Failed to start video call';
        const toastType = errorMessage.includes('30 minutes') || errorMessage.includes('cannot be started') ? 'warning' : 'error';
        const title = errorMessage.includes('30 minutes') ? 'Timing Issue' :
          errorMessage.includes('cannot be started') ? 'Booking Status' : 'Video Call Failed';
        addToast(toastType, title, errorMessage);
      }
    } catch (error) {
      addToast('error', 'Network Error', 'Failed to start video call. Please check your connection');
    }
  };

  const saveProfile = async () => {
    const validationErrors = [
      { condition: !profileForm.occupation.trim(), message: 'Please enter your occupation' },
      { condition: !profileForm.hourlyRate || profileForm.hourlyRate <= 0, message: 'Please enter a valid hourly rate' },
      {
        condition: !profileForm.experience.trim() || profileForm.experience.trim().length < 10,
        message: 'Please provide a detailed experience description (at least 10 characters)'
      }
    ];

    const error = validationErrors.find(v => v.condition);
    if (error) return addToast('warning', 'Validation Error', error.message);

    try {
      // Convert social links array to object format for backend
      const profileDataToSend = {
        ...profileForm,
        socialLinks: convertSocialLinksToObject(profileForm.socialLinks)
      };
      const response = await apiCall('/api/p2p/profile', { method: 'POST', body: JSON.stringify(profileDataToSend) });
      const data = await response.json();

      if (response.ok) {
        setMyProfile(data.profile);
        setActiveTab('my-profile');
        addToast('success', 'Profile Saved!', 'Your profile has been saved successfully');
      } else {
        const message = data.errors?.length ? data.errors.join('\n') : data.message || 'Failed to save profile';
        addToast('error', data.errors?.length ? 'Validation Errors' : 'Save Failed', message);
      }
    } catch (error) {
      addToast('error', 'Network Error', 'Failed to save profile. Please check your connection');
    }
  };

  const updateArray = (field: keyof CreateProfileData, action: 'add' | 'remove', value: any, index?: number) => {
    setProfileForm(prev => {
      const currentArray = prev[field] as any[];
      let newArray;

      if (action === 'add') {
        newArray = [...currentArray, value];
      } else {
        newArray = index !== undefined ? currentArray.filter((_, i) => i !== index) : currentArray.filter(item => item !== value);
      }

      return { ...prev, [field]: newArray };
    });
  };

  const addSkill = () => {
    if (newSkill.trim() && !profileForm.skills.includes(newSkill.trim())) {
      updateArray('skills', 'add', newSkill.trim());
      setNewSkill('');
    }
  };

  const removeSkill = (skill: string) => updateArray('skills', 'remove', skill);

  const addTag = () => {
    if (newTag.trim() && !profileForm.tags.includes(newTag.trim())) {
      updateArray('tags', 'add', newTag.trim());
      setNewTag('');
    }
  };

  const removeTag = (tag: string) => updateArray('tags', 'remove', tag);

  const addLanguage = () => {
    if (newLanguage.trim()) {
      updateArray('languages', 'add', { language: newLanguage.trim(), proficiency: 'Intermediate' });
      setNewLanguage('');
    }
  };

  const removeLanguage = (index: number) => updateArray('languages', 'remove', null, index);

  const toggleAvailableDay = (day: string) => {
    setProfileForm(prev => ({
      ...prev,
      availableDays: prev.availableDays.includes(day)
        ? prev.availableDays.filter(d => d !== day)
        : [...prev.availableDays, day]
    }));
  };

  const addPortfolioItem = () => updateArray('portfolio', 'add', { title: '', description: '', url: '', image: '' });
  const removePortfolioItem = (index: number) => updateArray('portfolio', 'remove', null, index);

  const updatePortfolioItem = (index: number, field: string, value: string) => {
    setProfileForm(prev => ({
      ...prev,
      portfolio: prev.portfolio.map((item, i) =>
        i === index ? { ...item, [field]: value } : item
      )
    }));
  };

  const handlePayment = (booking: Booking) => {
    setSelectedBookingForPayment(booking);
    setShowPaymentModal(true);
  };

  const processPayment = async () => {
    if (!selectedBookingForPayment) return;

    try {
      addToast('success', 'Payment Processed!', `Payment of $${selectedBookingForPayment.totalAmount} ${selectedBookingForPayment.currency} processed successfully!`);
      setShowPaymentModal(false);
      setSelectedBookingForPayment(null);
    } catch (error) {
      addToast('error', 'Payment Failed', 'Payment failed. Please try again.');
    }
  };

  const handleContact = async (profile: P2PProfile) => {
    try {
      const data = await apiCall('/api/messages/p2p-conversation', {
        method: 'POST',
        body: JSON.stringify({
          serviceProviderId: profile.userId._id,
          p2pProfileId: profile._id,
          source: 'p2p_browse'
        })
      });

      router.push(`/dashboard/messages?userId=${profile.userId._id}&p2p=true`);
    } catch (error: any) {
      addToast('error', 'Contact Failed', error.message || 'Failed to start conversation');
    }
  };

  const handleViewProfile = (profile: P2PProfile) => {
    setSelectedProfileDetail(profile);
    router.push(`/dashboard/p2p/${profile._id}`);
  };

  const ProfileCard = ({ profile }: { profile: P2PProfile }) => {
    const handlers = {
      view: () => handleViewProfile(profile)
    };

    return (
      <div className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-md p-3 sm:p-4 lg:p-6 border ${isDarkMode ? 'border-gray-700' : 'border-gray-200'} hover:shadow-lg transition-shadow duration-200`}>
        {/* Mobile Layout */}
        <div className="sm:hidden">
          <div className="flex items-start space-x-3 mb-3">
            <img
              src={profile.userId.avatar || '/default-avatar.svg'}
              alt={profile.userId.name}
              className="w-12 h-12 rounded-full object-cover flex-shrink-0"
            />
            <div className="flex-1 min-w-0">
              <div className="flex items-center space-x-2 mb-1">
                <h3 className={`text-sm font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'} truncate`}>
                  {profile.userId.name}
                </h3>
                {profile.isVerified && (
                  <span className="text-blue-500 text-xs">✓</span>
                )}
                {profile.featured && (
                  <span className="bg-yellow-100 text-yellow-800 text-xs px-1 py-0.5 rounded-full">
                    Featured
                  </span>
                )}
              </div>
              <p className={`${isDarkMode ? 'text-gray-300' : 'text-gray-600'} text-xs truncate`}>
                @{profile.userId.username}
              </p>
            </div>
          </div>

          <p className={`${isDarkMode ? 'text-gray-200' : 'text-gray-700'} font-medium text-sm mb-2`}>
            {profile.occupation}
          </p>

          <div className="flex items-center justify-between mb-2">
            <span className={`${isDarkMode ? 'text-green-400' : 'text-green-600'} font-bold text-sm`}>
              ${profile.hourlyRate}/{profile.currency}
            </span>
            <span className={`px-2 py-1 rounded-full text-xs ${profile.availability === 'Available'
              ? 'bg-green-100 text-green-800'
              : profile.availability === 'Busy'
                ? 'bg-red-100 text-red-800'
                : 'bg-yellow-100 text-yellow-800'
              }`}>
              {profile.availability}
            </span>
          </div>

          <div className="flex flex-wrap gap-1 mb-2">
            {profile.skills.slice(0, 2).map((skill, index) => (
              <span
                key={index}
                className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full"
              >
                {skill}
              </span>
            ))}
            {profile.skills.length > 2 && (
              <span className="text-gray-500 text-xs">
                +{profile.skills.length - 2} more
              </span>
            )}
          </div>

          <p className={`${isDarkMode ? 'text-gray-300' : 'text-gray-600'} text-xs mb-3 line-clamp-2`}>
            {profile.experience}
          </p>

          <button
            onClick={handlers.view}
            className="w-full bg-blue-500 hover:bg-blue-600 text-white px-3 py-2 rounded-lg text-xs font-medium transition-colors"
          >
            View Profile
          </button>
        </div>

        {/* Desktop Layout */}
        <div className="hidden sm:block">
          <div className="text-center mb-4">
            <img
              src={profile.userId.avatar || '/default-avatar.svg'}
              alt={profile.userId.name}
              className="w-16 h-16 lg:w-20 lg:h-20 rounded-full object-cover mx-auto mb-3"
            />
            <div className="flex items-center justify-center space-x-2 mb-1">
              <h3 className={`text-base lg:text-lg font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                {profile.userId.name}
              </h3>
              {profile.isVerified && (
                <span className="text-blue-500 text-sm">✓</span>
              )}
            </div>
            <p className={`${isDarkMode ? 'text-gray-300' : 'text-gray-600'} text-sm mb-1`}>
              @{profile.userId.username}
            </p>
            {profile.featured && (
              <span className="bg-yellow-100 text-yellow-800 text-xs px-2 py-1 rounded-full">
                Featured
              </span>
            )}
          </div>

          <div className="text-center mb-3">
            <p className={`${isDarkMode ? 'text-gray-200' : 'text-gray-700'} font-medium text-sm lg:text-base mb-2`}>
              {profile.occupation}
            </p>
            <span className={`${isDarkMode ? 'text-green-400' : 'text-green-600'} font-bold text-sm lg:text-base`}>
              ${profile.hourlyRate}/{profile.currency}
            </span>
          </div>

          <div className="flex items-center justify-center mb-3">
            <span className={`${isDarkMode ? 'text-gray-400' : 'text-gray-500'} text-xs lg:text-sm`}>
              ⭐ {profile.rating.average.toFixed(1)} ({profile.rating.count} reviews)
            </span>
          </div>

          <div className="flex justify-center mb-3">
            <span className={`px-2 py-1 rounded-full text-xs ${profile.availability === 'Available'
              ? 'bg-green-100 text-green-800'
              : profile.availability === 'Busy'
                ? 'bg-red-100 text-red-800'
                : 'bg-yellow-100 text-yellow-800'
              }`}>
              {profile.availability}
            </span>
          </div>

          <div className="flex flex-wrap justify-center gap-1 lg:gap-2 mb-3">
            {profile.skills.slice(0, 3).map((skill, index) => (
              <span
                key={index}
                className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full"
              >
                {skill}
              </span>
            ))}
            {profile.skills.length > 3 && (
              <span className="text-gray-500 text-xs">
                +{profile.skills.length - 3} more
              </span>
            )}
          </div>

          <p className={`${isDarkMode ? 'text-gray-300' : 'text-gray-600'} text-xs lg:text-sm text-center mb-4 line-clamp-2`}>
            {profile.experience}
          </p>

          <button
            onClick={handlers.view}
            className="w-full bg-blue-500 hover:bg-blue-600 text-white px-3 py-2 rounded-lg text-xs lg:text-sm font-medium transition-colors"
          >
            View Profile
          </button>
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className={`min-h-screen flex items-center justify-center ${isDarkMode ? 'bg-gray-900' : 'bg-gray-50'}`}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
          <p className={`mt-4 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>Loading P2P Services...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen w-full transition-colors duration-200 ${isDarkMode ? 'bg-gray-900 text-white' : 'bg-gray-50 text-gray-900'}`}>
      <div className="w-full py-4 sm:py-6 lg:py-8">
        {/* Tabs */}
        <div className="mb-6 sm:mb-8">
          <div className={`border-b ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
            <div className="overflow-x-scroll overflow-y-hidden -mx-3 px-3 sm:mx-0 sm:px-0" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none', WebkitOverflowScrolling: 'touch' }}>
              <nav className="flex flex-nowrap gap-6 sm:gap-8 min-w-max">
                {[
                  { key: 'browse', label: 'Browse Services' },
                  { key: 'bookings', label: 'My Bookings' },
                  { key: 'provider-bookings', label: 'Provider Bookings' },
                  { key: 'create', label: myProfile ? 'Edit Profile' : 'Create Profile' }
                ].map(({ key, label }) => (
                  <button
                    key={key}
                    onClick={() => setActiveTab(key as any)}
                    className={`py-3 border-b-2 font-medium text-sm whitespace-nowrap ${activeTab === key
                        ? `border-blue-500 ${isDarkMode ? 'text-blue-400' : 'text-blue-600'}`
                        : `border-transparent ${isDarkMode ? 'text-gray-400 hover:text-gray-300' : 'text-gray-500 hover:text-gray-700'} hover:border-gray-300`
                      }`}
                  >
                    {label}
                  </button>
                ))}
              </nav>
            </div>
          </div>
        </div>

        <div className="px-3 sm:px-4 lg:px-8">

          {activeTab === 'bookings' && (
            <div>
              <h2 className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'} mb-6`}>
                My Bookings
              </h2>

              {bookings.length === 0 ? (
                <div className="text-center py-12">
                  <p className={isDarkMode ? 'text-gray-400' : 'text-gray-500'} mb-4>
                    You don't have any bookings yet.
                  </p>
                  <button
                    onClick={() => setActiveTab('browse')}
                    className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded-lg font-medium transition-colors"
                  >
                    Browse Services
                  </button>
                </div>
              ) : (
                <div className="space-y-4 sm:space-y-6">
                  {bookings.map((booking) => (
                    <div key={booking._id} className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-md p-4 sm:p-6 border ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
                      <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between space-y-4 lg:space-y-0">
                        <div className="flex-1">
                          <div className="flex items-center space-x-3 sm:space-x-4 mb-3 sm:mb-4">
                            <img
                              src={booking.serviceProviderId.avatar || '/default-avatar.svg'}
                              alt={booking.serviceProviderId.name}
                              className="w-10 h-10 sm:w-12 sm:h-12 rounded-full object-cover flex-shrink-0"
                            />
                            <div className="min-w-0 flex-1">
                              <h3 className={`text-base sm:text-lg font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'} truncate`}>
                                {booking.title}
                              </h3>
                              <p className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'} truncate`}>
                                with {booking.serviceProviderId.name} (@{booking.serviceProviderId.username})
                              </p>
                              <p className={`text-xs sm:text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                                {booking.p2pProfileId.occupation}
                              </p>
                            </div>
                          </div>

                          <p className={`text-sm sm:text-base ${isDarkMode ? 'text-gray-300' : 'text-gray-700'} mb-3 sm:mb-4 line-clamp-2`}>
                            {booking.description}
                          </p>

                          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 sm:gap-4 text-xs sm:text-sm">
                            <div>
                              <span className={isDarkMode ? 'text-gray-400' : 'text-gray-500'}>Scheduled:</span>
                              <p className={`${isDarkMode ? 'text-white' : 'text-gray-900'} font-medium`}>
                                {new Date(booking.scheduledDate).toLocaleDateString()}
                              </p>
                              <p className={isDarkMode ? 'text-gray-300' : 'text-gray-600'}>
                                {new Date(booking.scheduledDate).toLocaleTimeString()}
                              </p>
                            </div>
                            <div>
                              <span className={isDarkMode ? 'text-gray-400' : 'text-gray-500'}>Duration:</span>
                              <p className={`${isDarkMode ? 'text-white' : 'text-gray-900'} font-medium`}>{booking.duration} minutes</p>
                            </div>
                            <div>
                              <span className={isDarkMode ? 'text-gray-400' : 'text-gray-500'}>Amount:</span>
                              <p className={`${isDarkMode ? 'text-green-400' : 'text-green-600'} font-bold`}>
                                ${booking.totalAmount} {booking.currency}
                              </p>
                            </div>
                          </div>
                        </div>

                        <div className="flex flex-col sm:flex-row lg:flex-col items-start sm:items-center lg:items-end space-y-2 sm:space-y-0 sm:space-x-2 lg:space-x-0 lg:space-y-2">
                          <span className={`px-2 sm:px-3 py-1 rounded-full text-xs sm:text-sm font-medium ${booking.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                            booking.status === 'accepted' ? 'bg-green-100 text-green-800' :
                              booking.status === 'rejected' ? 'bg-red-100 text-red-800' :
                                booking.status === 'in_progress' ? 'bg-blue-100 text-blue-800' :
                                  booking.status === 'completed' ? 'bg-gray-100 text-gray-800' :
                                    'bg-gray-100 text-gray-800'
                            }`}>
                            {booking.status.charAt(0).toUpperCase() + booking.status.slice(1).replace('_', ' ')}
                          </span>

                          {booking.status === 'pending' && (
                            <div className="flex space-x-2">
                              <button
                                onClick={() => acceptBooking(booking._id)}
                                className="bg-green-500 hover:bg-green-600 text-white px-2 sm:px-3 py-1 rounded text-xs sm:text-sm"
                              >
                                Accept
                              </button>
                              <button
                                onClick={() => rejectBooking(booking._id)}
                                className="bg-red-500 hover:bg-red-600 text-white px-2 sm:px-3 py-1 rounded text-xs sm:text-sm"
                              >
                                Reject
                              </button>
                            </div>
                          )}

                          {(booking.status === 'accepted' || booking.status === 'In_progress') && (
                            <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2">
                              <button
                                onClick={() => startVideoCall(booking._id)}
                                className="bg-blue-500 hover:bg-blue-600 text-white px-3 sm:px-4 py-2 rounded-lg text-xs sm:text-sm font-medium"
                              >
                                Start Video Call
                              </button>
                              <button
                                onClick={() => handlePayment(booking)}
                                className="bg-green-500 hover:bg-green-600 text-white px-3 sm:px-4 py-2 rounded-lg text-xs sm:text-sm font-medium"
                              >
                                Pay Now
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
          )}

          {/* Browse Tab */}
          {activeTab === 'browse' && (
            <div>
              {/* Main Container: Profile Section (Left) + Banner Section (Right) */}
              <div className="w-full flex flex-col lg:flex-row gap-4 mb-8">
                {/* Profile Container (Left Side - 50%) */}
                <div className={`w-full lg:w-[60%] ${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-[20px] p-5 shadow-lg border ${isDarkMode ? 'border-gray-700' : 'border-gray-200'} backdrop-blur-sm`}>
                  {/* Header */}
                  <div className={`flex justify-between items-center pb-5 border-b ${isDarkMode ? 'border-gray-700' : 'border-gray-200'} mb-5`}>
                    <div className="flex gap-2 mt-2 text-xl font-medium"></div>
                    <div className="flex gap-4 items-center">
                      {myProfile?.rating && (
                        <div className={`flex items-center gap-1.5 px-3 py-1 ${isDarkMode ? 'bg-blue-500/20' : 'bg-blue-500/10'} rounded-full`}>
                          <FaStar className={`w-4 h-4 ${isDarkMode ? 'text-blue-400' : 'text-blue-500'}`} />
                          <span className={`text-sm font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                            {(myProfile.rating.average ?? 0).toFixed(1)}
                          </span>
                          <span className={`text-[11px] ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                            ({myProfile.rating.count ?? 0})
                          </span>
                        </div>
                      )}
                      <FaShareAlt
                        className={`w-6 h-6 cursor-pointer ${isDarkMode ? 'text-white' : 'text-gray-900'}`}
                      />
                      <HiDotsVertical
                        className={`w-6 h-6 cursor-pointer ${isDarkMode ? 'text-white' : 'text-gray-900'}`}
                      />
                    </div>
                  </div>

                  {/* Profile Section - Logged in User Profile */}
                  {(() => {
                    const user = currentUser || myProfile?.userId;
                    return user ? (
                      <div className="flex flex-col items-center gap-5 w-full">
                        {/* Profile Picture */}
                        <div className="relative flex flex-col items-center">
                          <Image
                            src={getAvatarUrl(user.avatar) || '/default-avatar.svg'}
                            alt={(user.fullName || user.name) || 'Profile'}
                            width={150}
                            height={150}
                            className="w-[150px] h-[150px] rounded-full border-[3px] border-blue-500 object-cover"
                            unoptimized
                          />
                          <button
                            onClick={() => setActiveTab('create')}
                            className={`mt-4 border-none px-4 py-2 rounded-[20px] text-sm cursor-pointer transition-all mx-auto ${isDarkMode
                              ? 'bg-blue-600 hover:bg-blue-500 text-white'
                              : 'bg-blue-500 hover:bg-blue-600 text-white'
                              }`}
                          >
                            Edit Profile
                          </button>
                        </div>

                        {/* Profile Info */}
                        <div className="text-center w-full">
                          <h1 className={`text-2xl font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'} mb-2.5`}>
                            {user.fullName || user.name}
                          </h1>

                          {/* Title/Organization */}
                          <h3 className={`text-base ${isDarkMode ? 'text-gray-300' : 'text-[#CCCCCC]'} mb-5`}>
                            {(() => {
                              if (myProfile) {
                                const parts = [];
                                if (myProfile.currentOrganisation) {
                                  parts.push(myProfile.currentOrganisation);
                                }
                                if (myProfile.occupation && myProfile.occupation !== myProfile.currentOrganisation) {
                                  parts.push(myProfile.occupation);
                                }
                                return parts.length > 0 ? parts.join(' | ') : myProfile.occupation || 'Professional';
                              }
                              return user.bio || 'Professional';
                            })()}
                          </h3>

                          {/* Tags/Areas of Expertise */}
                          <div className="flex flex-wrap gap-2.5 justify-center mb-5">
                            {(() => {
                              if (myProfile) {
                                const allTags = [
                                  ...(myProfile.areasOfExpertise || []),
                                  ...(myProfile.skills || []),
                                  ...(myProfile.tags || [])
                                ];
                                const uniqueTags = Array.from(new Set(allTags));
                                return uniqueTags.length > 0 ? uniqueTags.map((tag: string, idx: number) => (
                                  <div
                                    key={idx}
                                    className={`px-3 py-1.5 rounded-[20px] ${isDarkMode ? 'bg-blue-900/20' : 'bg-blue-50'} ${isDarkMode ? 'text-blue-400' : 'text-blue-600'} text-xs border ${isDarkMode ? 'border-blue-800' : 'border-blue-200'}`}
                                  >
                                    {tag}
                                  </div>
                                )) : null;
                              }
                              return null;
                            })()}
                          </div>

                          {/* Description */}
                          <p className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-[#CCCCCC]'} mb-5 text-center`}>
                            {myProfile?.description || myProfile?.experience || user.bio || 'No description available.'}
                          </p>
                        </div>

                        {/* CTA Section - User's Own Pricing */}
                        {myProfile && (
                          <div className="flex justify-center gap-1.5 sm:gap-3 lg:gap-4 mt-5 w-full">
                            {/* Audio Call */}
                            <div className={`w-[100px] sm:w-[180px] lg:w-[220px] h-[160px] sm:h-[200px] lg:h-[220px] ${isDarkMode ? 'bg-gradient-to-br from-blue-600 to-blue-800' : 'bg-gradient-to-br from-blue-500 to-blue-700'} rounded-xl sm:rounded-2xl border ${isDarkMode ? 'border-blue-500' : 'border-blue-400'} px-1.5 sm:px-4 lg:px-6 py-3 sm:py-5 lg:py-7 flex flex-col items-center justify-between text-center shadow-lg`}>
                              <div className="flex-1 flex flex-col justify-center">
                                <h3 className="text-xs sm:text-base lg:text-lg font-semibold text-white">Audio Call</h3>
                                <div className="w-8 sm:w-12 h-0.5 sm:h-1 bg-white/50 mx-auto mt-1 sm:mt-2 rounded-full"></div>
                                <p className="text-[10px] sm:text-sm text-white/90 mt-1.5 sm:mt-3">
                                  {myProfile.audioCallPrice
                                    ? `₹${myProfile.audioCallPrice}`
                                    : myProfile.hourlyRate
                                      ? `₹${myProfile.hourlyRate}`
                                      : 'N/A'}
                                </p>
                              </div>
                              <button
                                onClick={() => setActiveTab('create')}
                                className="w-full py-1.5 sm:py-2 lg:py-2.5 bg-white hover:bg-gray-100 text-blue-600 rounded-md sm:rounded-lg text-[10px] sm:text-xs lg:text-sm font-medium transition-all mt-2 sm:mt-4"
                              >
                                Book Now
                              </button>
                            </div>

                            {/* Video Call */}
                            <div className={`w-[100px] sm:w-[180px] lg:w-[220px] h-[160px] sm:h-[200px] lg:h-[220px] ${isDarkMode ? 'bg-gradient-to-br from-purple-600 to-purple-800' : 'bg-gradient-to-br from-purple-500 to-purple-700'} rounded-xl sm:rounded-2xl border ${isDarkMode ? 'border-purple-500' : 'border-purple-400'} px-1.5 sm:px-4 lg:px-6 py-3 sm:py-5 lg:py-7 flex flex-col items-center justify-between text-center shadow-lg`}>
                              <div className="flex-1 flex flex-col justify-center">
                                <h3 className="text-xs sm:text-base lg:text-lg font-semibold text-white">Video Call</h3>
                                <div className="w-8 sm:w-12 h-0.5 sm:h-1 bg-white/50 mx-auto mt-1 sm:mt-2 rounded-full"></div>
                                <p className="text-[10px] sm:text-sm text-white/90 mt-1.5 sm:mt-3">
                                  {myProfile.videoCallPrice
                                    ? `₹${myProfile.videoCallPrice}`
                                    : myProfile.hourlyRate
                                      ? `₹${myProfile.hourlyRate}`
                                      : 'N/A'}
                                </p>
                              </div>
                              <button
                                onClick={() => setActiveTab('create')}
                                className="w-full py-1.5 sm:py-2 lg:py-2.5 bg-white hover:bg-gray-100 text-purple-600 rounded-md sm:rounded-lg text-[10px] sm:text-xs lg:text-sm font-medium transition-all mt-2 sm:mt-4"
                              >
                                Book Now
                              </button>
                            </div>

                            {/* Next Available */}
                            <div className={`w-[100px] sm:w-[180px] lg:w-[220px] h-[160px] sm:h-[200px] lg:h-[220px] ${isDarkMode ? 'bg-gradient-to-br from-green-600 to-green-800' : 'bg-gradient-to-br from-green-500 to-green-700'} rounded-xl sm:rounded-2xl border ${isDarkMode ? 'border-green-500' : 'border-green-400'} px-1.5 sm:px-4 lg:px-6 py-3 sm:py-5 lg:py-7 flex flex-col items-center justify-between text-center shadow-lg`}>
                              <div className="flex-1 flex flex-col justify-center">
                                <h2 className="text-[10px] sm:text-sm lg:text-base font-medium text-white leading-tight">Next Available at</h2>
                                <div className="w-8 sm:w-12 h-0.5 sm:h-1 bg-white/50 mx-auto mt-1 sm:mt-2 rounded-full"></div>
                                <p className="text-[9px] sm:text-xs lg:text-sm text-white/90 mt-1.5 sm:mt-3">
                                  {(() => {
                                    const startTime = myProfile.workingHours?.start || myProfile.availableFromTime || '09:00';
                                    const endTime = myProfile.workingHours?.end || myProfile.availableToTime || '17:00';
                                    const formatTime = (time: string) => {
                                      if (!time) return '';
                                      if (time.includes('AM') || time.includes('PM')) return time;
                                      const [hours, minutes] = time.split(':');
                                      const hour = parseInt(hours);
                                      const ampm = hour >= 12 ? 'PM' : 'AM';
                                      const hour12 = hour % 12 || 12;
                                      return `${hour12}:${minutes || '00'} ${ampm}`;
                                    };
                                    return `${formatTime(startTime)}-${formatTime(endTime)}`;
                                  })()}
                                </p>
                              </div>
                              <button
                                onClick={() => setActiveTab('create')}
                                className="w-full py-1.5 sm:py-2 lg:py-2.5 bg-white hover:bg-gray-100 text-green-600 rounded-md sm:rounded-lg text-[10px] sm:text-xs lg:text-sm font-medium transition-all mt-2 sm:mt-4"
                              >
                                Book Now
                              </button>
                            </div>
                          </div>
                        )}

                        {myProfile && myProfile.rating && myProfile.rating.count > 0 && (
                          <div className={`grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6 p-4 ${isDarkMode ? 'bg-gray-700/30' : 'bg-gray-50'} rounded-xl border ${isDarkMode ? 'border-gray-600' : 'border-gray-200'}`}>
                            <div className="text-center">
                              <p className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'} mb-1`}>Rating</p>
                              <p className={`text-lg font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                                ⭐ {myProfile.rating.average.toFixed(1)} ({myProfile.rating.count})
                              </p>
                            </div>
                            {myProfile.completedJobs > 0 && (
                              <div className="text-center">
                                <p className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'} mb-1`}>Completed Jobs</p>
                                <p className={`text-lg font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                                  {myProfile.completedJobs}
                                </p>
                              </div>
                            )}
                            {myProfile.responseTime && (
                              <div className="text-center">
                                <p className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'} mb-1`}>Response Time</p>
                                <p className={`text-lg font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                                  {myProfile.responseTime}
                                </p>
                              </div>
                            )}
                          </div>
                        )}

                        <div className="flex justify-center gap-2.5 mt-5 flex-wrap">
                          {myProfile?.socialLinks && Object.entries(myProfile.socialLinks).map(([platformName, url]) => {
                            if (!url || !url.trim()) return null;
                            const IconComponent = getSocialLinkIcon(platformName);
                            return (
                              <a
                                key={platformName}
                                href={url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className={`w-10 h-10 rounded-full ${isDarkMode ? 'bg-gray-700' : 'bg-[rgba(51,51,51,0.5)]'} flex items-center justify-center border ${isDarkMode ? 'border-gray-600' : 'border-gray-200'} ${isDarkMode ? 'hover:bg-gray-600' : 'hover:bg-gray-200'} transition-colors`}
                                title={platformName}
                              >
                                <IconComponent
                                  className={`w-5 h-5 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}
                                />
                              </a>
                            );
                          })}
                        </div>
                      </div>
                    ) : null;
                  })()}
                  {(() => {
                    const user = currentUser || myProfile?.userId;
                    if (!user && loading) {
                      return (
                        <div className="text-center py-12">
                          <p className={isDarkMode ? 'text-gray-400' : 'text-gray-500'}>Loading profile...</p>
                        </div>
                      );
                    }
                    if (!user && !loading) {
                      return (
                        <div className="text-center py-12">
                          <p className={isDarkMode ? 'text-gray-400' : 'text-gray-500'}>Unable to load profile. Please refresh the page.</p>
                        </div>
                      );
                    }
                    return null;
                  })()}
                </div>

                {/* Banner Section (Right Side - 50%) */}
                {SHOW_FIND_BY_EXPERTS && (
                  <div
                    className={`w-full lg:w-[40%] h-[400px] flex flex-col justify-center items-center text-center relative rounded-xl shadow-lg transition-colors ${isDarkMode ? 'bg-[#28303D] text-white' : 'bg-white text-gray-900'
                      }`}
                  >
                    <h1 className={`text-[25px] p-2 font-bold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                      Find the best expert to help you with
                    </h1>
                    <div className={`text-[25px] font-bold mb-8 animate-[fade-in_1.5s_ease-in-out_forwards] ${isDarkMode ? 'text-[#66A5FF]' : 'text-[#4285F4]'}`}>
                      interview preparation
                    </div>

                    {/* Search Bar */}
                    <div className={`w-[90%] max-w-[600px] h-[50px] flex items-center rounded-[50px] px-2 shadow-md ${isDarkMode ? 'bg-gray-800 border border-gray-700' : 'bg-white'}`}>
                      <input
                        type="text"
                        placeholder="Search by name, company, s"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && searchProfiles()}
                        className={`flex-1 h-full border-none bg-transparent px-4 text-sm outline-none placeholder:text-gray-500 ${isDarkMode ? 'text-white placeholder:text-gray-400' : 'text-gray-900'}`}
                      />
                      <button
                        onClick={searchProfiles}
                        className="bg-[#4285F4] text-white border-none px-4 h-[90%] rounded-[50px] text-sm font-medium cursor-pointer transition-all hover:bg-[#357AE8]"
                      >
                        Search
                      </button>
                    </div>

                    {/* Footer */}
                    <div className="absolute bottom-4 left-0 w-full flex justify-center items-center text-sm">
                      <span className={`${isDarkMode ? 'text-gray-300' : 'text-gray-500'} font-light`}>Need help?</span>
                      <span className={`${isDarkMode ? 'text-gray-500' : 'text-gray-300'} mx-2`}>|</span>
                      <span className="text-[#4285F4] font-medium cursor-pointer hover:underline">Contact us</span>
                    </div>
                  </div>
                )
                }
              </div>

              {/* Search Results Section */}
              {hasSearched && (
                <div className={`w-full mx-auto mt-8 mb-8 p-4 sm:p-6 ${isDarkMode ? 'bg-gray-800' : 'bg-white'} shadow-md rounded-xl`}>
                  <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-6">
                    <div>
                      <h3 className={`text-xl sm:text-2xl font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                        Search Results
                      </h3>
                      <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'} mt-1`}>
                        {searchResults.length} {searchResults.length === 1 ? 'expert' : 'experts'} found for "{searchQuery}"
                      </p>
                    </div>
                    <button
                      onClick={() => {
                        setSearchQuery('');
                        setHasSearched(false);
                        setSearchResults([]);
                      }}
                      className={`px-4 py-2 text-sm font-medium border ${isDarkMode ? 'border-gray-600 hover:bg-gray-700' : 'border-gray-300 hover:bg-gray-50'} rounded-lg transition-colors`}
                    >
                      Clear Search
                    </button>
                  </div>

                  {searchResults.length === 0 ? (
                    <div className="text-center py-12">
                      <p className={`text-lg ${isDarkMode ? 'text-gray-400' : 'text-gray-600'} mb-2`}>
                        No experts found matching your search
                      </p>
                      <p className={`text-sm ${isDarkMode ? 'text-gray-500' : 'text-gray-500'}`}>
                        Try different keywords or browse our categories below
                      </p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                      {searchResults.map((profile) => (
                        <ProfileCard key={profile._id} profile={profile} />
                      ))}
                    </div>
                  )}
                </div>
              )}

              {SHOW_FIND_BY_CATEGORY && (
                <div className={`pt-10 pb-5 transition-colors ${isDarkMode ? 'bg-gray-900' : 'bg-gray-100'}`}>
                  <h3 className={`text-[28px] font-semibold text-center mb-5 ${isDarkMode ? 'text-white' : 'text-gray-900'} relative inline-block w-full`}>
                    Find experts by category
                    <span className="absolute left-1/2 bottom-[-10px] w-[60px] h-1 bg-gradient-to-r from-[#FF7F7F] to-[#FF4D4D] transform -translate-x-1/2 rounded"></span>
                  </h3>
                  <div className="w-full mx-auto pt-5 pb-10 px-5 relative">
                    {categories.length > 0 && (
                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 gap-2">
                        <p className="text-sm text-gray-400">
                          Tap any category to open a dedicated page with every expert in that niche.
                        </p>
                      </div>
                    )}
                    <Swiper
                      modules={[Navigation, Pagination, Autoplay]}
                      spaceBetween={20}
                      slidesPerView={5}
                      navigation={{
                        nextEl: '.swiper-button-next',
                        prevEl: '.swiper-button-prev',
                      }}
                      pagination={{
                        clickable: true,
                        el: '.swiper-pagination',
                      }}
                      autoplay={{
                        delay: 3000,
                        disableOnInteraction: false,
                      }}
                      breakpoints={{
                        320: { slidesPerView: 2, spaceBetween: 10 },
                        640: { slidesPerView: 3, spaceBetween: 15 },
                        1024: { slidesPerView: 4, spaceBetween: 20 },
                        1280: { slidesPerView: 5, spaceBetween: 20 },
                      }}
                      className="h-[250px]"
                    >
                      {categoryCards.map((category) => {
                        const isSelectable = categories.length > 0;
                        const isSelected = selectedCategoryId === category.id;
                        return (
                          <SwiperSlide key={category.id}>
                            <div
                              className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-[15px] p-5 h-[200px] flex flex-col justify-between items-center border shadow-md transition-all ${isSelectable ? 'cursor-pointer hover:-translate-y-2.5 hover:shadow-lg' : 'cursor-default'
                                } ${isSelected ? 'border-blue-500 ring-2 ring-blue-200' : isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}
                              role={isSelectable ? 'button' : undefined}
                              aria-pressed={isSelected}
                              onClick={() => isSelectable && handleCategorySelect(category.id)}
                            >
                              <h5 className={`text-base font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'} mb-2.5 text-center leading-tight`}>
                                {category.title}
                              </h5>
                              <img src={category.image} alt={category.title} className="w-[100px] h-[62px] object-cover drop-shadow-md rounded-md" />
                              <p className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-600'} text-center leading-snug`}>
                                {category.description}
                              </p>
                              {isSelected && (
                                <span className="text-[11px] font-semibold text-blue-600 mt-2">Selected</span>
                              )}
                            </div>
                          </SwiperSlide>
                        );
                      })}
                    </Swiper>
                    <div className="flex justify-center mt-6">
                      <div className="swiper-pagination swiper-pagination-bullets swiper-pagination-horizontal !static !w-auto"></div>
                    </div>
                    <div className="bg-[#D9D9D9] rounded-full h-10 w-10 flex justify-center items-center absolute left-[-50px] top-1/2 -translate-y-1/2 z-20 cursor-pointer swiper-button-prev hover:bg-gray-400 transition-all">
                      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4 text-[#333]">
                        <path d="m15 18-6-6 6-6"></path>
                      </svg>
                    </div>
                    <div className="bg-[#D9D9D9] rounded-full h-10 w-10 flex justify-center items-center absolute right-[-50px] top-1/2 -translate-y-1/2 z-20 cursor-pointer swiper-button-next hover:bg-gray-400 transition-all">
                      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4 text-[#333]">
                        <path d="m9 18 6-6-6-6"></path>
                      </svg>
                    </div>
                  </div>
                </div>
              )}

              <div className={`w-full mx-auto mt-[60px] mb-5 p-4 sm:p-6 ${isDarkMode ? 'bg-gray-800' : 'bg-white'} shadow-md rounded-xl`}>
                <div className="flex flex-col lg:flex-row lg:justify-between lg:items-start gap-4">
                  {/* Left side - Title and description */}
                  <div className="flex-1">
                    <h3 className={`text-2xl sm:text-[35px] font-semibold leading-tight sm:leading-[40px] ${isDarkMode ? 'text-white' : 'text-[#1A1A1A]'} mb-2 sm:mb-3`}>
                      Top experts for you
                    </h3>
                    <p className={`text-sm sm:text-base font-light leading-5 sm:leading-6 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'} mt-2 sm:mt-3`}>
                      Connect with trusted and verified professionals across various fields of expertise
                    </p>
                  </div>

                  {/* Right side - Filter buttons */}
                  <div className="flex flex-wrap gap-2 sm:gap-3 lg:justify-end">
                    <button className={`px-3 sm:px-4 py-2 text-xs sm:text-sm font-medium border ${isDarkMode ? 'border-gray-600' : 'border-[#E0E0E0]'} rounded-lg ${isDarkMode ? 'bg-gray-800' : 'bg-white'} ${isDarkMode ? 'hover:bg-gray-700' : 'hover:bg-[#F5F5F5]'} transition-all hover:-translate-y-0.5 whitespace-nowrap`}>
                      Instantly available
                    </button>
                    <button className={`px-3 sm:px-4 py-2 text-xs sm:text-sm font-medium border ${isDarkMode ? 'border-gray-600' : 'border-[#E0E0E0]'} rounded-lg ${isDarkMode ? 'bg-gray-800' : 'bg-white'} ${isDarkMode ? 'hover:bg-gray-700' : 'hover:bg-[#F5F5F5]'} transition-all hover:-translate-y-0.5 whitespace-nowrap`}>
                      Verified profiles
                    </button>
                    <button className={`px-3 sm:px-4 py-2 text-xs sm:text-sm font-medium border ${isDarkMode ? 'border-gray-600' : 'border-[#E0E0E0]'} rounded-lg ${isDarkMode ? 'bg-gray-800' : 'bg-white'} ${isDarkMode ? 'hover:bg-gray-700' : 'hover:bg-[#F5F5F5]'} transition-all hover:-translate-y-0.5 whitespace-nowrap`}>
                      Top rated
                    </button>
                    <button className={`px-3 sm:px-4 py-2 text-xs sm:text-sm font-medium border ${isDarkMode ? 'border-gray-600' : 'border-[#E0E0E0]'} rounded-lg ${isDarkMode ? 'bg-gray-800' : 'bg-white'} ${isDarkMode ? 'hover:bg-gray-700' : 'hover:bg-[#F5F5F5]'} transition-all hover:-translate-y-0.5 whitespace-nowrap`}>
                      Sort by
                    </button>
                  </div>
                </div>
              </div>

              <div className="flex flex-col gap-5 w-full mx-auto mb-5 px-5">
                <div className="grid w-full gap-6 sm:grid-cols-2 xl:grid-cols-3 justify-items-center">{getTopExpertsProfiles().slice(0, 6).map((profile) => (
                  <div
                    key={profile._id}
                    className={`w-full max-w-[360px] ${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-[20px] p-5 shadow-lg text-center border ${isDarkMode ? 'border-gray-700' : 'border-gray-200'} hover:shadow-xl transition-all`}
                  >
                    <div
                      onClick={() => handleViewProfile(profile)}
                      className="cursor-pointer"
                    >
                      <div className="relative mx-auto mb-4 w-[100px] h-[100px]">
                        <Image
                          src={getAvatarUrl(profile.userId.avatar)}
                          alt={profile.userId.fullName || profile.userId.name}
                          width={100}
                          height={100}
                          className={`w-full h-full rounded-full border-4 ${isDarkMode ? 'border-gray-600' : 'border-[#f0f0f0]'} object-cover`}
                          unoptimized
                        />
                        <div className="absolute -bottom-2.5 left-1/2 transform -translate-x-1/2 bg-blue-500 px-3 py-1.5 rounded-[20px] flex items-center gap-1.5 shadow-lg">
                          <FaStar
                            className="w-3.5 h-3.5 text-white"
                          />
                          <span className="text-xs font-semibold text-white">
                            {profile.rating?.average?.toFixed(1) || '5.0'}
                          </span>
                        </div>
                      </div>
                      {profile.category?.title && (
                        <div className="mb-3">
                          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-indigo-50 text-indigo-600">
                            {profile.category.title}
                          </span>
                        </div>
                      )}
                      <div className="mb-4">
                        <h1 className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'} mb-2`}>
                          {profile.userId.fullName || profile.userId.name}
                        </h1>
                        <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                          {(() => {
                            const parts = [];
                            if (profile.currentOrganisation) parts.push(profile.currentOrganisation);
                            if (profile.occupation && profile.occupation !== profile.currentOrganisation) {
                              parts.push(profile.occupation);
                            }
                            return parts.length > 0 ? parts.join(' | ') : profile.occupation || 'Professional';
                          })()}
                        </p>
                      </div>
                      <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'} leading-relaxed mb-4 line-clamp-3 overflow-hidden text-ellipsis break-words`}>
                        {profile.description || profile.experience || profile.userId.bio || 'Expert professional'}
                      </p>
                      <div className="flex flex-wrap gap-2 justify-center mb-6">
                        {(() => {
                          const allTags = [
                            ...(profile.areasOfExpertise || []),
                            ...(profile.skills || []),
                            ...(profile.tags || [])
                          ];
                          const uniqueTags = Array.from(new Set(allTags));
                          return uniqueTags.slice(0, 5).map((tag: string, idx: number) => (
                            <div
                              key={idx}
                              className={`${isDarkMode ? 'bg-gray-700' : 'bg-[#f0f0f0]'} ${isDarkMode ? 'text-gray-200' : 'text-gray-900'} text-xs px-3 py-1.5 rounded-[20px] hover:bg-blue-500 hover:text-white transition-all`}
                            >
                              {tag}
                            </div>
                          ));
                        })()}
                        {(() => {
                          const allTags = [
                            ...(profile.areasOfExpertise || []),
                            ...(profile.skills || []),
                            ...(profile.tags || [])
                          ];
                          const uniqueTags = Array.from(new Set(allTags));
                          return uniqueTags.length > 5 ? (
                            <div className={`${isDarkMode ? 'bg-gray-700' : 'bg-[#f0f0f0]'} ${isDarkMode ? 'text-gray-200' : 'text-gray-900'} text-xs px-3 py-1.5 rounded-[20px]`}>
                              +{uniqueTags.length - 5} more
                            </div>
                          ) : null;
                        })()}
                      </div>
                    </div>

                    {/* Pricing & Services Section */}
                    <div className={`mt-6 pt-6 border-t ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
                      <h3 className={`text-sm font-semibold ${isDarkMode ? 'text-gray-300' : 'text-gray-700'} mb-4 text-center`}>
                        Available Services & Pricing
                      </h3>

                      {/* Services Grid */}
                      <div className="flex gap-2.5 mb-3">
                        {/* Audio Call Service */}
                        {(profile.audioCallPrice || profile.hourlyRate) && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                            }}
                            className={`flex items-center justify-between p-2.5 ${isDarkMode ? 'bg-gray-700/50' : 'bg-gray-50'} rounded-lg border ${isDarkMode ? 'border-gray-600' : 'border-gray-200'} ${isDarkMode ? 'hover:bg-blue-900/20' : 'hover:bg-blue-50'} ${isDarkMode ? 'hover:border-blue-700' : 'hover:border-blue-300'} transition-all cursor-pointer text-sm`}
                          >
                            <div className=" items-center gap-1.5">
                              <div className={`w-8 h-8 ${isDarkMode ? 'bg-blue-900/30' : 'bg-blue-100'} rounded-lg flex items-center justify-center`}>
                                <FaPhone className={`w-4 h-4 ${isDarkMode ? 'text-blue-400' : 'text-blue-600'}`} />
                              </div>
                              <div className="text-left">
                                <p className={`text-xs font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Audio Call</p>
                                <p className={`text-base font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                                  ₹{profile.audioCallPrice || profile.hourlyRate}
                                </p>
                                <p className={`text-[10px] ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                                  {profile.audioCallPrice ? 'per call' : `/${profile.currency || 'hour'}`}
                                </p>
                              </div>
                            </div>

                          </button>
                        )}

                        {/* Video Call Service */}
                        {(profile.videoCallPrice || profile.hourlyRate) && (
                          <button

                            className={`flex items-center justify-between p-2.5 ${isDarkMode ? 'bg-gray-700/50' : 'bg-gray-50'} rounded-lg border ${isDarkMode ? 'border-gray-600' : 'border-gray-200'} ${isDarkMode ? 'hover:bg-blue-900/20' : 'hover:bg-blue-50'} ${isDarkMode ? 'hover:border-blue-700' : 'hover:border-blue-300'} transition-all cursor-pointer text-sm`}
                          >
                            <div className=" items-center gap-1.5">
                              <div className={`w-8 h-8 ${isDarkMode ? 'bg-blue-900/30' : 'bg-blue-100'} rounded-lg flex items-center justify-center`}>
                                <FaVideo className={`w-4 h-4 ${isDarkMode ? 'text-blue-400' : 'text-blue-600'}`} />
                              </div>
                              <div className="text-left">
                                <p className={`text-xs font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Video Call</p>
                                <p className={`text-base font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                                  ₹{profile.videoCallPrice || profile.hourlyRate}
                                </p>
                                <p className={`text-[10px] ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                                  {profile.videoCallPrice ? 'per call' : `/${profile.currency || 'hour'}`}
                                </p>
                              </div>
                            </div>
                          </button>
                        )}

                        {/* Chat Service */}
                        {profile.chatPrice && (
                          <button

                            className={`flex items-center justify-between p-2.5 ${isDarkMode ? 'bg-gray-700/50' : 'bg-gray-50'} rounded-lg border ${isDarkMode ? 'border-gray-600' : 'border-gray-200'} ${isDarkMode ? 'hover:bg-blue-900/20' : 'hover:bg-blue-50'} ${isDarkMode ? 'hover:border-blue-700' : 'hover:border-blue-300'} transition-all cursor-pointer text-sm`}
                          >
                            <div className=" items-start gap-1.5">
                              <div className={`w-8 h-8 ${isDarkMode ? 'bg-blue-900/30' : 'bg-blue-100'} rounded-lg flex items-center justify-center`}>
                                <FaComments className={`w-4 h-4 ${isDarkMode ? 'text-blue-400' : 'text-blue-600'}`} />
                              </div>
                              <div className="text-left">
                                <p className={`text-xs font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Chat</p>
                                <p className={`text-base font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                                  ₹{profile.chatPrice}
                                </p>
                                <p className={`text-[10px] ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>per message</p>
                              </div>
                            </div>
                          </button>
                        )}

                        {/* Hourly Rate (if no specific prices) */}
                        {!profile.audioCallPrice && !profile.videoCallPrice && !profile.chatPrice && profile.hourlyRate > 0 && (
                          <button
                            // onClick={(e) => {
                            //   e.stopPropagation();
                            //   handleBookService(profile, 'consultation');
                            // }}
                            className={`flex items-center justify-between p-2.5 ${isDarkMode ? 'bg-gray-700/50' : 'bg-gray-50'} rounded-lg border ${isDarkMode ? 'border-gray-600' : 'border-gray-200'} ${isDarkMode ? 'hover:bg-blue-900/20' : 'hover:bg-blue-50'} ${isDarkMode ? 'hover:border-blue-700' : 'hover:border-blue-300'} transition-all cursor-pointer text-sm`}
                          >
                            <div className=" items-center gap-1.5">
                              <div className={`w-8 h-8 ${isDarkMode ? 'bg-blue-900/30' : 'bg-blue-100'} rounded-lg flex items-center justify-center`}>
                                <FaStar className={`w-4 h-4 ${isDarkMode ? 'text-blue-400' : 'text-blue-600'}`} />
                              </div>
                              <div className="text-left">
                                <p className={`text-xs font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Hourly Rate</p>
                                <p className={`text-[10px] ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Consultation services</p>
                                <p className={`text-base font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                                  ₹{profile.hourlyRate}
                                </p>
                                <p className={`text-[10px] ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>/{profile.currency || 'hour'}</p>
                              </div>
                            </div>
                          </button>
                        )}
                      </div>

                      {/* Book Now Button - Opens modal to select service */}
                      {/* <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleBookService(profile, 'consultation');
                      }}
                      className="w-full py-3 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-semibold rounded-lg shadow-md hover:shadow-lg transition-all transform hover:-translate-y-0.5 flex items-center justify-center gap-2"
                    >
                      <span>Book Consultation</span>
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="m9 18 6-6-6-6"></path>
                      </svg>
                    </button> */}
                    </div>
                  </div>
                ))}
                </div>
              </div>

              {(SHOW_FEATURE_CARDS || SHOW_BANNER_CAROUSEL) && (
                <div className="flex flex-col lg:flex-row gap-5 w-full mx-auto mb-5 px-5">
                  {SHOW_FEATURE_CARDS && (
                    <div className="w-full lg:w-[50%] h-[300px] grid grid-cols-3 gap-2.5 overflow-hidden">
                      {[
                        { img: 'https://application-assets-app-and-web.s3.ap-south-1.amazonaws.com/upcoming-calls.svg', title: 'Upcoming calls', desc: 'See your upcoming schedule and plan ahead.' },
                        { img: 'https://application-assets-app-and-web.s3.ap-south-1.amazonaws.com/service-quick.svg', title: 'Create service', desc: 'Define and offer your personalised services.' },
                        { img: 'https://application-assets-app-and-web.s3.ap-south-1.amazonaws.com/call-history-quick.svg', title: 'Call history', desc: 'Track and review your previous audio/video calls.' },
                        { img: 'https://application-assets-app-and-web.s3.ap-south-1.amazonaws.com/visits-quick.svg', title: 'Profile visits', desc: 'See who\'s viewing your profile and services.' },
                        { img: 'https://application-assets-app-and-web.s3.ap-south-1.amazonaws.com/schedule-quick.svg', title: 'Set schedule', desc: 'Update your availability to maximise your earnings.' },
                        { title: 'Share profile', desc: 'Copy link', isShare: true },
                      ].map((feature, idx) => (
                        <div
                          key={idx}
                          className={`flex flex-col items-center justify-center p-2.5 ${isDarkMode ? 'bg-gray-700' : 'bg-[#F5F5F5]'} rounded-xl cursor-pointer transition-all hover:-translate-y-1 hover:shadow-lg text-center`}
                        >
                          {feature.isShare ? (
                            <div className="w-10 h-10 p-0.5 relative mb-2">
                              <div className="bg-blue-500 flex justify-center items-center font-medium text-white p-2 rounded-full text-sm w-[38px] h-[38px]">
                                {selectedProfileDetail?.userId?.fullName?.substring(0, 2).toUpperCase() || 'KY'}
                              </div>
                            </div>
                          ) : (
                            <img src={feature.img} alt={feature.title} className="w-10 h-10 mb-2" />
                          )}
                          <h5 className={`text-sm font-semibold ${isDarkMode ? 'text-white' : 'text-[#1A1A1A]'} mb-1`}>
                            {feature.title}
                          </h5>
                          {feature.desc && (
                            <div className={`flex items-center justify-start text-xs cursor-pointer ${isDarkMode ? 'text-blue-400' : 'text-blue-600'}`}>
                              {feature.isShare ? (
                                <>
                                  <FaCopy className="mr-1 w-3 h-3" />
                                  {feature.desc}
                                </>
                              ) : (
                                <p className={`text-[10px] font-light ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>{feature.desc}</p>
                              )}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}

                  {SHOW_BANNER_CAROUSEL && (
                    <div className="w-full lg:w-[50%] h-[300px] overflow-hidden rounded-xl relative">
                      <Swiper
                        modules={[Pagination, Autoplay]}
                        spaceBetween={0}
                        slidesPerView={1}
                        pagination={{
                          clickable: true,
                          el: '.promo-pagination',
                        }}
                        autoplay={{
                          delay: 3000,
                          disableOnInteraction: false,
                        }}
                        className="h-full"
                      >
                        {[
                          'https://application-assets-app-and-web.s3.ap-south-1.amazonaws.com/price_banner_3x.png',
                          'https://application-assets-app-and-web.s3.ap-south-1.amazonaws.com/set_time_banner_3x.png',
                          'https://application-assets-app-and-web.s3.ap-south-1.amazonaws.com/verified_badge_banner_3x.png',
                        ].map((banner, idx) => (
                          <SwiperSlide key={idx}>
                            <img src={banner} alt={`Banner ${idx + 1}`} className="w-full h-full object-cover rounded-xl" />
                          </SwiperSlide>
                        ))}
                      </Swiper>
                      <div className="promo-pagination absolute bottom-5 left-1/2 transform -translate-x-1/2 flex gap-2 z-10"></div>
                    </div>
                  )}
                </div>
              )}

              <div className={`relative py-10 px-5 overflow-hidden ${isDarkMode ? 'bg-gray-900' : 'bg-white'} mb-5`}>
                {SHOW_WORTH_EXPLORING && (
                  <>
                    <div className="absolute top-[60%] right-[10%] transform -translate-y-1/2 w-[525px] h-[425px] z-[-1] bg-[radial-gradient(50%_50%_at_50%_50%,rgba(17,214,190,0.15)_23%,rgba(10,7,11,0.15)_100%)] blur-[40px]"></div>
                    <div className="text-center">
                      <h3 className={`text-[35px] font-semibold ${isDarkMode ? 'text-white' : 'text-[#1A1A1A]'} leading-[35px] mb-12`}>
                        Worth Exploring
                      </h3>
                      <div className="flex flex-wrap gap-3 justify-center">
                        {worthExploringItems.map(item => {
                          const isActive = item.isSelectable && selectedCategoryId === item.id;
                          return (
                            <button
                              key={item.id}
                              type="button"
                              disabled={!item.isSelectable}
                              onClick={() => item.isSelectable && handleCategorySelect(item.id)}
                              className={`px-[18px] py-2 rounded-[100px] border text-sm font-medium transition-all ${isActive
                                ? 'bg-blue-500 border-blue-500 text-white'
                                : isDarkMode
                                  ? 'border-blue-700 bg-blue-900/20 text-white hover:bg-blue-500 hover:text-white'
                                  : 'border-blue-300 bg-blue-50 text-[#1A1A1A] hover:bg-blue-500 hover:text-white'
                                } ${item.isSelectable ? 'cursor-pointer hover:-translate-y-0.5' : 'opacity-70 cursor-default'}`}
                            >
                              {item.label}
                            </button>
                          );
                        })}
                      </div>
                      {!categories.length && (
                        <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'} mt-4`}>
                          Sample categories shown until admins publish the real list.
                        </p>
                      )}
                    </div>
                  </>
                )}
              </div>

              {SHOW_TRENDING_SHORTS && (
                <div className={`py-20 ${isDarkMode ? 'bg-gray-800/50' : 'bg-[rgba(255,255,255,0.15)]'} mt-[60px] w-full mb-5`}>
                  <div className="w-[90%] mx-auto">
                    <div className="mb-10">
                      <div className="flex items-center justify-between mb-4">
                        <h3 className={`text-[35px] font-semibold leading-[35px] ${isDarkMode ? 'text-white' : 'text-[#1A1A1A]'}`}>
                          Trending JFshorts
                        </h3>
                        <button className={`flex items-center gap-1 text-base font-semibold ${isDarkMode ? 'text-blue-400' : 'text-blue-600'} cursor-pointer bg-none border-none hover:underline`}>
                          View all
                          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="arrow-icon">
                            <path d="M5 12h14"></path>
                            <path d="m12 5 7 7-7 7"></path>
                          </svg>
                        </button>
                      </div>
                      <h5 className={`text-base font-light ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                        Watch the latest clips from trending sessions. Click to view the full session and gain expert insights.
                      </h5>
                    </div>

                    <div className="relative">
                      <Swiper
                        modules={[Navigation]}
                        spaceBetween={20}
                        slidesPerView={4}
                        navigation={{
                          nextEl: '.video-next',
                          prevEl: '.video-prev',
                        }}
                        breakpoints={{
                          320: { slidesPerView: 1 },
                          640: { slidesPerView: 2 },
                          1024: { slidesPerView: 3 },
                          1280: { slidesPerView: 4 },
                        }}
                      >
                        {[
                          { title: 'Want a career in media industry?', src: 'https://cfront-snips.unikon.ai/snip_asset_29370_846b5248-22ad-48ed-9d10-37476f925522.mp4' },
                          { title: 'Want to increase profitability?', src: 'https://cfront-snips.unikon.ai/snip_asset_36431_6eb907df-9e0b-4fa8-8a3c-d9705d1a86f8.mp4' },
                          { title: 'Seeking key startup steps?', src: 'https://cfront-snips.unikon.ai/snip_asset_22996_49aea3b3-3e6d-464e-bcf9-b04d011ae460.mp4' },
                          { title: 'How to pivot from design to data analysis?', src: 'https://cfront-snips.unikon.ai/snip_asset_68177_059ff3fd-f17a-4d67-b60c-56523dcfca76.mp4' },
                        ].map((video, idx) => (
                          <SwiperSlide key={idx}>
                            <div className="relative rounded-lg overflow-hidden">
                              <div className="absolute bottom-4 left-3 z-10">
                                <div className="flex items-center gap-1 px-2 py-1 bg-[rgba(36,36,36,0.7)] rounded">
                                  <FaLightbulb className="w-2.5 h-2.5 text-white" />
                                  <h5 className="text-[10px] text-white m-0">{video.title}</h5>
                                </div>
                              </div>
                              <video playsInline loop className="w-full h-auto rounded-lg">
                                <source src={video.src} type="video/mp4" />
                              </video>
                            </div>
                          </SwiperSlide>
                        ))}
                      </Swiper>
                      <div className="flex justify-between absolute top-1/2 left-0 right-0 transform -translate-y-1/2 z-10">
                        <button className="bg-[#D9D9D9] border-none rounded-full w-[27px] h-[27px] flex items-center justify-center cursor-pointer transition-all hover:bg-[#C0C0C0] video-prev">
                          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-3 h-3 text-[#1C1B1F]">
                            <path d="m15 18-6-6 6-6"></path>
                          </svg>
                        </button>
                        <button className="bg-[#D9D9D9] border-none rounded-full w-[27px] h-[27px] flex items-center justify-center cursor-pointer transition-all hover:bg-[#C0C0C0] video-next">
                          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-3 h-3 text-[#1C1B1F]">
                            <path d="m9 18 6-6-6-6"></path>
                          </svg>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {SHOW_TOP_RATED_PROFILES && (
                <div className={`w-full mx-auto mb-5 p-6 ${isDarkMode ? 'bg-gray-800' : 'bg-white'} shadow-md rounded-xl`}>
                  <table className="w-full">
                    <tbody>
                      <tr>
                        <td className="w-full align-top">
                          <h3 className={`text-[35px] font-semibold leading-[40px] ${isDarkMode ? 'text-white' : 'text-[#1A1A1A]'} mb-3`}>
                            Top Rated Profiles
                          </h3>
                          <p className={`text-base font-light leading-6 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'} mt-3`}>
                            Browse highly-rated experts with 4.5+ reviews from users for exceptional guidance
                          </p>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              )}

              <div className="flex flex-col gap-5 w-full mx-auto mb-5 px-5">
                <div className="flex justify-around items-center w-full flex-wrap gap-5">{getTopRatedProfiles().slice(0, 6).map((profile) => (
                  <div
                    key={profile._id}
                    onClick={() => handleViewProfile(profile)}
                    className={`w-full max-w-[400px] ${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-[20px] p-6 shadow-lg text-center border ${isDarkMode ? 'border-gray-700' : 'border-gray-200'} cursor-pointer hover:shadow-xl transition-all`}
                  >
                    <div className="relative mx-auto mb-4 w-[100px] h-[100px]">
                      <Image
                        src={getAvatarUrl(profile.userId.avatar)}
                        alt={profile.userId.fullName || profile.userId.name}
                        width={100}
                        height={100}
                        className={`w-full h-full rounded-full border-4 ${isDarkMode ? 'border-gray-600' : 'border-[#f0f0f0]'} object-cover`}
                        unoptimized
                      />
                      <div className="absolute -bottom-2.5 left-1/2 transform -translate-x-1/2 bg-blue-500 px-3 py-1.5 rounded-[20px] flex items-center gap-1.5 shadow-lg">
                        <FaStar
                          className="w-3.5 h-3.5 text-white"
                        />
                        <span className="text-xs font-semibold text-white">
                          {profile.rating?.average?.toFixed(1) || '5.0'}
                        </span>
                      </div>
                    </div>
                    <div className="mb-4">
                      <h1 className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'} mb-2`}>
                        {profile.userId.fullName || profile.userId.name}
                      </h1>
                      <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                        {(() => {
                          const parts = [];
                          if (profile.currentOrganisation) parts.push(profile.currentOrganisation);
                          if (profile.occupation && profile.occupation !== profile.currentOrganisation) {
                            parts.push(profile.occupation);
                          }
                          return parts.length > 0 ? parts.join(' | ') : profile.occupation || 'Professional';
                        })()}
                      </p>
                    </div>
                    <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'} leading-relaxed mb-4 line-clamp-3 overflow-hidden text-ellipsis break-words`}>
                      {profile.description || profile.experience || profile.userId.bio || 'Expert professional'}
                    </p>
                    <div className="flex flex-wrap gap-2 justify-center mb-6">
                      {(() => {
                        const allTags = [
                          ...(profile.areasOfExpertise || []),
                          ...(profile.skills || []),
                          ...(profile.tags || [])
                        ];
                        const uniqueTags = Array.from(new Set(allTags));
                        return uniqueTags.slice(0, 5).map((tag: string, idx: number) => (
                          <div
                            key={idx}
                            className={`${isDarkMode ? 'bg-gray-700' : 'bg-[#f0f0f0]'} ${isDarkMode ? 'text-gray-200' : 'text-gray-900'} text-xs px-3 py-1.5 rounded-[20px] hover:bg-blue-500 hover:text-white transition-all`}
                          >
                            {tag}
                          </div>
                        ));
                      })()}
                      {(() => {
                        const allTags = [
                          ...(profile.areasOfExpertise || []),
                          ...(profile.skills || []),
                          ...(profile.tags || [])
                        ];
                        const uniqueTags = Array.from(new Set(allTags));
                        return uniqueTags.length > 5 ? (
                          <div className={`${isDarkMode ? 'bg-gray-700' : 'bg-[#f0f0f0]'} ${isDarkMode ? 'text-gray-200' : 'text-gray-900'} text-xs px-3 py-1.5 rounded-[20px]`}>
                            +{uniqueTags.length - 5} more
                          </div>
                        ) : null;
                      })()}
                    </div>
                    <div className="flex justify-center gap-4">
                      {profile.audioCallPrice && (
                        <a
                          href="#"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleViewProfile(profile);
                          }}
                          className="flex flex-col items-center gap-2 px-4 py-3 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl text-white no-underline transition-all hover:-translate-y-1 hover:shadow-lg shadow-md"
                        >
                          <FaPhone
                            className="w-6 h-6 text-white"
                          />
                          <span className="text-xs font-medium">₹{profile.audioCallPrice}</span>
                        </a>
                      )}
                      {profile.videoCallPrice && (
                        <a
                          href="#"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleViewProfile(profile);
                          }}
                          className="flex flex-col items-center gap-2 px-4 py-3 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl text-white no-underline transition-all hover:-translate-y-1 hover:shadow-lg shadow-md"
                        >
                          <FaVideo
                            className="w-6 h-6 text-white"
                          />
                          <span className="text-xs font-medium">₹{profile.videoCallPrice}</span>
                        </a>
                      )}
                      {profile.chatPrice && (
                        <a
                          href="#"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleContact(profile);
                          }}
                          className="flex flex-col items-center gap-2 px-4 py-3 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl text-white no-underline transition-all hover:-translate-y-1 hover:shadow-lg shadow-md"
                        >
                          <FaComments
                            className="w-6 h-6 text-white"
                          />
                          <span className="text-xs font-medium">₹{profile.chatPrice}</span>
                        </a>
                      )}
                    </div>
                  </div>
                ))}
                </div>
              </div>
            </div>
          )}

          {/* Provider Bookings Tab */}
          {activeTab === 'provider-bookings' && (
            <div>
              <h2 className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'} mb-6`}>
                Provider Bookings
              </h2>

              {providerBookings.length === 0 ? (
                <div className="text-center py-12">
                  <p className={isDarkMode ? 'text-gray-400' : 'text-gray-500'} mb-4>
                    You haven't received any booking requests yet.
                  </p>
                  <button
                    onClick={() => setActiveTab('my-profile')}
                    className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded-lg font-medium transition-colors"
                  >
                    Update Your Profile
                  </button>
                </div>
              ) : (
                <div className="space-y-4 sm:space-y-6">
                  {providerBookings.map((booking) => {
                    const scheduledDate = new Date(booking.scheduledDate);
                    const now = new Date();
                    const timeDiff = scheduledDate.getTime() - now.getTime();
                    const daysUntil = Math.floor(timeDiff / (1000 * 60 * 60 * 24));
                    const hoursUntil = Math.floor((timeDiff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
                    const minutesUntil = Math.floor((timeDiff % (1000 * 60 * 60)) / (1000 * 60));
                    const isUpcoming = timeDiff > 0;

                    const dateStr = scheduledDate.toLocaleDateString('en-US', {
                      weekday: 'long',
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    });
                    const timeStr = scheduledDate.toLocaleTimeString('en-US', {
                      hour: '2-digit',
                      minute: '2-digit',
                      hour12: true
                    });
                    const endTime = new Date(scheduledDate.getTime() + booking.duration * 60000);
                    const endTimeStr = endTime.toLocaleTimeString('en-US', {
                      hour: '2-digit',
                      minute: '2-digit',
                      hour12: true
                    });

                    return (
                      <div key={booking._id} className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-md p-4 sm:p-6 border ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
                        <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between space-y-4 lg:space-y-0">
                          <div className="flex-1">
                            {/* Requester Info */}
                            <div className="flex items-center space-x-3 sm:space-x-4 mb-4">
                              <img
                                src={booking.clientId.avatar || '/default-avatar.svg'}
                                alt={booking.clientId.name}
                                className="w-12 h-12 sm:w-14 sm:h-14 rounded-full object-cover flex-shrink-0 border-2 border-blue-500"
                              />
                              <div className="min-w-0 flex-1">
                                <div className="flex items-center gap-2 mb-1">
                                  <h3 className={`text-lg sm:text-xl font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                                    {booking.clientId.name}
                                  </h3>
                                  <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${booking.status === 'pending'
                                    ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
                                    : booking.status === 'accepted'
                                      ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                                      : booking.status === 'rejected'
                                        ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                                        : 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
                                    }`}>
                                    {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                                  </span>
                                </div>
                                <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                                  @{booking.clientId.username} • Requested this meeting
                                </p>
                              </div>
                            </div>

                            {/* Booking Details */}
                            <div className="mb-4">
                              <h4 className={`text-base sm:text-lg font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'} mb-2`}>
                                {booking.title}
                              </h4>
                              <p className={`text-sm sm:text-base ${isDarkMode ? 'text-gray-300' : 'text-gray-600'} mb-3`}>
                                {booking.description}
                              </p>
                            </div>

                            {/* Time and Date Display */}
                            <div className={`rounded-lg p-4 mb-4 ${isDarkMode ? 'bg-gray-700/50' : 'bg-blue-50'} border ${isDarkMode ? 'border-gray-600' : 'border-blue-200'}`}>
                              <div className="flex items-start justify-between mb-3">
                                <div>
                                  <p className={`text-xs font-medium mb-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                                    Meeting Date & Time
                                  </p>
                                  <p className={`text-lg font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                                    {dateStr}
                                  </p>
                                  <p className={`text-base font-semibold ${isDarkMode ? 'text-blue-300' : 'text-blue-600'}`}>
                                    {timeStr} - {endTimeStr} ({booking.duration} minutes)
                                  </p>
                                </div>
                                {isUpcoming && (
                                  <div className="text-right">
                                    <p className={`text-xs font-medium mb-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                                      Meeting in
                                    </p>
                                    <p className={`text-sm font-semibold ${isDarkMode ? 'text-green-300' : 'text-green-600'}`}>
                                      {daysUntil > 0 ? `${daysUntil}d ` : ''}{hoursUntil > 0 ? `${hoursUntil}h ` : ''}{minutesUntil}m
                                    </p>
                                  </div>
                                )}
                              </div>

                              {/* Timeline Bar */}
                              {isUpcoming && (
                                <div className="mt-3">
                                  <div className={`h-2 rounded-full ${isDarkMode ? 'bg-gray-600' : 'bg-gray-200'}`}>
                                    <div
                                      className="h-2 rounded-full bg-gradient-to-r from-blue-500 to-green-500 transition-all"
                                      style={{
                                        width: `${Math.min(100, Math.max(0, (1 - timeDiff / (7 * 24 * 60 * 60 * 1000)) * 100))}%`
                                      }}
                                    />
                                  </div>
                                  <p className={`text-xs mt-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                                    Timeline: Meeting scheduled for {dateStr}
                                  </p>
                                </div>
                              )}
                            </div>

                            {/* Additional Info */}
                            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4 text-xs sm:text-sm">
                              <div>
                                <span className={`${isDarkMode ? 'text-gray-400' : 'text-gray-500'} font-medium`}>Service Type:</span>
                                <p className={`${isDarkMode ? 'text-white' : 'text-gray-900'} capitalize mt-1`}>{booking.serviceType}</p>
                              </div>
                              <div>
                                <span className={`${isDarkMode ? 'text-gray-400' : 'text-gray-500'} font-medium`}>Duration:</span>
                                <p className={`${isDarkMode ? 'text-white' : 'text-gray-900'} mt-1`}>{booking.duration} minutes</p>
                              </div>
                              <div>
                                <span className={`${isDarkMode ? 'text-gray-400' : 'text-gray-500'} font-medium`}>Amount:</span>
                                <p className={`${isDarkMode ? 'text-white' : 'text-gray-900'} font-semibold mt-1`}>
                                  ${booking.totalAmount} {booking.currency}
                                </p>
                              </div>
                            </div>
                          </div>

                          {/* Action Buttons */}
                          <div className="flex flex-col sm:flex-row lg:flex-col space-y-2 sm:space-y-0 sm:space-x-2 lg:space-x-0 lg:space-y-2 mt-4 lg:mt-0">
                            {booking.status === 'pending' && (
                              <>
                                <button
                                  onClick={() => acceptBooking(booking._id)}
                                  className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-2"
                                >
                                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                                  </svg>
                                  Accept
                                </button>
                                <button
                                  onClick={() => {
                                    setSelectedBookingForTimeChange(booking);
                                    const currentTime = scheduledDate.toTimeString().slice(0, 5);
                                    setNewTime(currentTime);
                                    setShowTimeChangeModal(true);
                                  }}
                                  className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-2"
                                >
                                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                  </svg>
                                  Change Time
                                </button>
                                <button
                                  onClick={() => rejectBooking(booking._id)}
                                  className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-2"
                                >
                                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                                  </svg>
                                  Reject
                                </button>
                              </>
                            )}
                            {(booking.status === 'accepted' || booking.status === 'In_progress' || booking.status === 'in_progress') && (
                              <button
                                onClick={() => startVideoCall(booking._id)}
                                className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-2"
                              >
                                <FaVideo className="w-4 h-4" />
                                Start Call
                              </button>
                            )}
                            <button
                              onClick={() => router.push(`/dashboard/messages?userId=${booking.clientId._id}`)}
                              className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-2"
                            >
                              <FaComments className="w-4 h-4" />
                              Chat
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {activeTab === 'my-profile' && (
            <div>
              {myProfile ? (
                <div className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-md p-6`}>
                  <div className="flex items-start space-x-4">
                    <img
                      src={myProfile.userId.avatar || '/default-avatar.svg'}
                      alt={myProfile.userId.name}
                      className="w-20 h-20 rounded-full object-cover"
                    />
                    <div className="flex-1">
                      <h2 className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                        {myProfile.userId.name}
                      </h2>
                      <p className={isDarkMode ? 'text-gray-300' : 'text-gray-600'}>
                        @{myProfile.userId.username}
                      </p>
                      {myProfile.category?.title && (
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-indigo-50 text-indigo-600 mt-2">
                          {myProfile.category.title}
                        </span>
                      )}
                      <p className={`${isDarkMode ? 'text-gray-200' : 'text-gray-700'} font-medium text-lg`}>
                        {myProfile.occupation}
                      </p>
                      <div className="flex items-center space-x-4 mt-2">
                        <span className={`${isDarkMode ? 'text-green-400' : 'text-green-600'} font-bold text-lg`}>
                          ${myProfile.hourlyRate}/{myProfile.currency}
                        </span>
                        <span className={isDarkMode ? 'text-gray-400' : 'text-gray-500'}>
                          ⭐ {myProfile.rating.average.toFixed(1)} ({myProfile.rating.count} reviews)
                        </span>
                        <span className={`px-3 py-1 rounded-full text-sm ${myProfile.availability === 'Available'
                          ? 'bg-green-100 text-green-800'
                          : myProfile.availability === 'Busy'
                            ? 'bg-red-100 text-red-800'
                            : 'bg-yellow-100 text-yellow-800'
                          }`}>
                          {myProfile.availability}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="mt-6">
                    <h3 className={`text-lg font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'} mb-3`}>
                      Experience
                    </h3>
                    <p className={isDarkMode ? 'text-gray-300' : 'text-gray-700'}>
                      {myProfile.experience}
                    </p>
                  </div>

                  <div className="mt-6">
                    <h3 className={`text-lg font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'} mb-3`}>
                      Skills
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {myProfile.skills.map((skill, index) => (
                        <span
                          key={index}
                          className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm"
                        >
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="mt-6">
                    <h3 className={`text-lg font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'} mb-3`}>
                      Languages
                    </h3>
                    <div className="space-y-2">
                      {myProfile.languages.map((lang, index) => (
                        <div key={index} className="flex justify-between items-center">
                          <span className={isDarkMode ? 'text-gray-300' : 'text-gray-700'}>
                            {lang.language}
                          </span>
                          <span className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                            {lang.proficiency}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="mt-6">
                    <h3 className={`text-lg font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'} mb-3`}>
                      Portfolio
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {myProfile.portfolio.map((item, index) => (
                        <div key={index} className={`border ${isDarkMode ? 'border-gray-700' : 'border-gray-200'} rounded-lg p-4`}>
                          <h4 className={`font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                            {item.title}
                          </h4>
                          <p className={`${isDarkMode ? 'text-gray-300' : 'text-gray-600'} text-sm mt-1`}>
                            {item.description}
                          </p>
                          {item.url && (
                            <a
                              href={item.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-blue-500 hover:text-blue-600 text-sm mt-2 inline-block"
                            >
                              View Project →
                            </a>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-12">
                  <p className={isDarkMode ? 'text-gray-400' : 'text-gray-500'} mb-4>
                    You haven't created a P2P profile yet.
                  </p>
                  <button
                    onClick={() => setActiveTab('create')}
                    className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded-lg font-medium transition-colors"
                  >
                    Create Profile
                  </button>
                </div>
              )}
            </div>
          )}

          {activeTab === 'create' && (
            <div className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-md p-4 sm:p-6`}>
              <h2 className={`text-xl sm:text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'} mb-4 sm:mb-6`}>
                {myProfile ? 'Edit Profile' : 'Create P2P Profile'}
              </h2>

              <div className="space-y-6">
                <div>
                  <h3 className={`text-lg font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'} mb-4`}>
                    Basic Information
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className={`block text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'} mb-2`}>
                        Occupation *
                      </label>
                      <input
                        type="text"
                        value={profileForm.occupation}
                        onChange={(e) => setProfileForm(prev => ({ ...prev, occupation: e.target.value }))}
                        placeholder="e.g., Web Developer, Graphic Designer"
                        className={`w-full px-3 py-2 border ${isDarkMode ? 'border-gray-600 bg-gray-700 text-white' : 'border-gray-300'} rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
                        required
                      />
                      {!profileForm.occupation.trim() && (
                        <p className="text-red-500 text-xs mt-1">Occupation is required</p>
                      )}
                    </div>
                    <div>
                      <label className={`block text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'} mb-2`}>
                        Hourly Rate *
                      </label>
                      <div className="flex">
                        <input
                          type="number"
                          value={profileForm.hourlyRate}
                          onChange={(e) => setProfileForm(prev => ({ ...prev, hourlyRate: parseFloat(e.target.value) || 0 }))}
                          placeholder="50"
                          className={`w-full px-3 py-2 border ${isDarkMode ? 'border-gray-600 bg-gray-700 text-white' : 'border-gray-300'} rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
                          required
                        />
                        <select
                          value={profileForm.currency}
                          onChange={(e) => setProfileForm(prev => ({ ...prev, currency: e.target.value }))}
                          className={`ml-2 px-3 py-2 border ${isDarkMode ? 'border-gray-600 bg-gray-700 text-white' : 'border-gray-300'} rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
                        >
                          <option value="USD">USD</option>
                          <option value="INR">INR</option>
                        </select>
                      </div>
                      {(!profileForm.hourlyRate || profileForm.hourlyRate <= 0) && (
                        <p className="text-red-500 text-xs mt-1">Valid hourly rate is required</p>
                      )}
                    </div>
                  </div>
                </div>

                <div>
                  <label className={`block text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'} mb-2`}>
                    Category
                  </label>
                  <select
                    value={profileForm.categoryId}
                    onChange={(e) => setProfileForm(prev => ({ ...prev, categoryId: e.target.value }))}
                    className={`w-full px-3 py-2 border ${isDarkMode ? 'border-gray-600 bg-gray-700 text-white' : 'border-gray-300'} rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
                    disabled={!categories.length}
                  >
                    <option value="">
                      {categories.length ? 'Select a category' : 'No categories available'}
                    </option>
                    {categories.map(category => (
                      <option key={category._id} value={category._id}>
                        {category.title}
                      </option>
                    ))}
                  </select>
                  {!categories.length && (
                    <p className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'} mt-1`}>
                      Categories are managed by admins. Please check back later.
                    </p>
                  )}
                </div>

                <div>
                  <h3 className={`text-lg font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'} mb-3`}>
                    Call & Chat Rates
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className={`block text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'} mb-2`}>
                        Audio Call Rate (multiplier)
                      </label>
                      <input
                        type="number"
                        value={profileForm.audioCallPrice}
                        onChange={(e) => setProfileForm(prev => ({ ...prev, audioCallPrice: e.target.value }))}
                        placeholder="e.g., 12"
                        className={`w-full px-3 py-2 border ${isDarkMode ? 'border-gray-600 bg-gray-700 text-white' : 'border-gray-300'} rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent placeholder-gray-400`}
                      />
                    </div>
                    <div>
                      <label className={`block text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'} mb-2`}>
                        Video Call Rate (multiplier)
                      </label>
                      <input
                        type="number"
                        value={profileForm.videoCallPrice}
                        onChange={(e) => setProfileForm(prev => ({ ...prev, videoCallPrice: e.target.value }))}
                        placeholder="e.g., 15"
                        className={`w-full px-3 py-2 border ${isDarkMode ? 'border-gray-600 bg-gray-700 text-white' : 'border-gray-300'} rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent placeholder-gray-400`}
                      />
                    </div>
                    <div>
                      <label className={`block text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'} mb-2`}>
                        Chat Rate (multiplier)
                      </label>
                      <input
                        type="number"
                        value={profileForm.chatPrice}
                        onChange={(e) => setProfileForm(prev => ({ ...prev, chatPrice: e.target.value }))}
                        placeholder="e.g., 10"
                        className={`w-full px-3 py-2 border ${isDarkMode ? 'border-gray-600 bg-gray-700 text-white' : 'border-gray-300'} rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent placeholder-gray-400`}
                      />
                    </div>
                  </div>
                  <p className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'} mt-2`}>
                    Multipliers are applied to your hourly rate to derive session pricing for each medium.
                  </p>
                </div>

                <div>
                  <label className={`block text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'} mb-2`}>
                    Experience * (Minimum 10 characters)
                  </label>
                  <textarea
                    value={profileForm.experience}
                    onChange={(e) => setProfileForm(prev => ({ ...prev, experience: e.target.value }))}
                    placeholder="Describe your experience, background, and what makes you unique..."
                    rows={4}
                    className={`w-full px-3 py-2 border ${isDarkMode ? 'border-gray-600 bg-gray-700 text-white' : 'border-gray-300'} rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
                    required
                  />
                  <div className="flex justify-between items-center mt-1">
                    {(!profileForm.experience.trim() || profileForm.experience.trim().length < 10) && (
                      <p className="text-red-500 text-xs">Experience description must be at least 10 characters long</p>
                    )}
                    <p className="text-gray-500 text-xs">
                      {profileForm.experience.length}/500 characters
                    </p>
                  </div>
                </div>

                <div>
                  <label className={`block text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'} mb-2`}>
                    Skills
                  </label>
                  <div className="flex flex-wrap gap-2 mb-3">
                    {profileForm.skills.map((skill, index) => (
                      <span
                        key={index}
                        className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm flex items-center"
                      >
                        {skill}
                        <button
                          onClick={() => removeSkill(skill)}
                          className="ml-2 text-blue-600 hover:text-blue-800"
                        >
                          ×
                        </button>
                      </span>
                    ))}
                  </div>
                  <div className="flex">
                    <input
                      type="text"
                      value={newSkill}
                      onChange={(e) => setNewSkill(e.target.value)}
                      placeholder="Add a skill"
                      className={`flex-1 px-3 py-2 border ${isDarkMode ? 'border-gray-600 bg-gray-700 text-white' : 'border-gray-300'} rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
                      onKeyPress={(e) => e.key === 'Enter' && addSkill()}
                    />
                    <button
                      onClick={addSkill}
                      className="ml-2 bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg"
                    >
                      Add
                    </button>
                  </div>
                </div>

                <div>
                  <label className={`block text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'} mb-2`}>
                    Availability
                  </label>
                  <select
                    value={profileForm.availability}
                    onChange={(e) => setProfileForm(prev => ({ ...prev, availability: e.target.value }))}
                    className={`w-full px-3 py-2 border ${isDarkMode ? 'border-gray-600 bg-gray-700 text-white' : 'border-gray-300'} rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
                  >
                    <option value="Available">Available</option>
                    <option value="Busy">Busy</option>
                    <option value="Away">Away</option>
                  </select>
                </div>

                <div>
                  <label className={`block text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'} mb-2`}>
                    Working Hours
                  </label>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className={`block text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'} mb-1`}>
                        Start Time
                      </label>
                      <input
                        type="time"
                        value={profileForm.workingHours.start}
                        onChange={(e) => setProfileForm(prev => ({
                          ...prev,
                          workingHours: { ...prev.workingHours, start: e.target.value }
                        }))}
                        className={`w-full px-3 py-2 border ${isDarkMode ? 'border-gray-600 bg-gray-700 text-white' : 'border-gray-300'} rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
                      />
                    </div>
                    <div>
                      <label className={`block text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'} mb-1`}>
                        End Time
                      </label>
                      <input
                        type="time"
                        value={profileForm.workingHours.end}
                        onChange={(e) => setProfileForm(prev => ({
                          ...prev,
                          workingHours: { ...prev.workingHours, end: e.target.value }
                        }))}
                        className={`w-full px-3 py-2 border ${isDarkMode ? 'border-gray-600 bg-gray-700 text-white' : 'border-gray-300'} rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <label className={`block text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'} mb-2`}>
                    Available Days
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {WEEK_DAYS.map(day => {
                      const isSelected = profileForm.availableDays.includes(day);
                      return (
                        <button
                          key={day}
                          type="button"
                          onClick={() => toggleAvailableDay(day)}
                          className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${isSelected
                            ? 'bg-blue-600 text-white'
                            : isDarkMode
                              ? 'bg-gray-700 text-gray-300'
                              : 'bg-gray-200 text-gray-700'
                            }`}
                        >
                          {day.slice(0, 3)}
                        </button>
                      );
                    })}
                  </div>
                  <p className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'} mt-1`}>
                    These help clients know which days you are generally available.
                  </p>
                </div>

                <div>
                  <label className={`block text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'} mb-2`}>
                    Languages
                  </label>
                  <div className="space-y-2 mb-3">
                    {profileForm.languages.map((lang, index) => (
                      <div key={index} className="flex items-center space-x-2">
                        <input
                          type="text"
                          value={lang.language}
                          onChange={(e) => setProfileForm(prev => ({
                            ...prev,
                            languages: prev.languages.map((l, i) =>
                              i === index ? { ...l, language: e.target.value } : l
                            )
                          }))}
                          placeholder="Language"
                          className={`flex-1 px-3 py-2 border ${isDarkMode ? 'border-gray-600 bg-gray-700 text-white' : 'border-gray-300'} rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
                        />
                        <select
                          value={lang.proficiency}
                          onChange={(e) => setProfileForm(prev => ({
                            ...prev,
                            languages: prev.languages.map((l, i) =>
                              i === index ? { ...l, proficiency: e.target.value } : l
                            )
                          }))}
                          className={`px-3 py-2 border ${isDarkMode ? 'border-gray-600 bg-gray-700 text-white' : 'border-gray-300'} rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
                        >
                          <option value="Beginner">Beginner</option>
                          <option value="Intermediate">Intermediate</option>
                          <option value="Advanced">Advanced</option>
                          <option value="Native">Native</option>
                        </select>
                        <button
                          onClick={() => removeLanguage(index)}
                          className="text-red-500 hover:text-red-700"
                        >
                          ×
                        </button>
                      </div>
                    ))}
                  </div>
                  <div className="flex">
                    <input
                      type="text"
                      value={newLanguage}
                      onChange={(e) => setNewLanguage(e.target.value)}
                      placeholder="Add a language"
                      className={`flex-1 px-3 py-2 border ${isDarkMode ? 'border-gray-600 bg-gray-700 text-white' : 'border-gray-300'} rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
                      onKeyPress={(e) => e.key === 'Enter' && addLanguage()}
                    />
                    <button
                      onClick={addLanguage}
                      className="ml-2 bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg"
                    >
                      Add
                    </button>
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className={`block text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                      Portfolio
                    </label>
                    <button
                      onClick={addPortfolioItem}
                      className="text-blue-500 hover:text-blue-600 text-sm"
                    >
                      + Add Project
                    </button>
                  </div>
                  <div className="space-y-4">
                    {profileForm.portfolio.map((item, index) => (
                      <div key={index} className={`border ${isDarkMode ? 'border-gray-700' : 'border-gray-200'} rounded-lg p-4`}>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <label className={`block text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'} mb-1`}>
                              Project Title
                            </label>
                            <input
                              type="text"
                              value={item.title}
                              onChange={(e) => updatePortfolioItem(index, 'title', e.target.value)}
                              placeholder="Project title"
                              className={`w-full px-3 py-2 border ${isDarkMode ? 'border-gray-600 bg-gray-700 text-white' : 'border-gray-300'} rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
                            />
                          </div>
                          <div>
                            <label className={`block text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'} mb-1`}>
                              Project URL
                            </label>
                            <input
                              type="url"
                              value={item.url}
                              onChange={(e) => updatePortfolioItem(index, 'url', e.target.value)}
                              placeholder="https://example.com"
                              className={`w-full px-3 py-2 border ${isDarkMode ? 'border-gray-600 bg-gray-700 text-white' : 'border-gray-300'} rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
                            />
                          </div>
                        </div>
                        <div className="mt-3">
                          <label className={`block text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'} mb-1`}>
                            Description
                          </label>
                          <textarea
                            value={item.description}
                            onChange={(e) => updatePortfolioItem(index, 'description', e.target.value)}
                            placeholder="Describe your project..."
                            rows={2}
                            className={`w-full px-3 py-2 border ${isDarkMode ? 'border-gray-600 bg-gray-700 text-white' : 'border-gray-300'} rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
                          />
                        </div>
                        <button
                          onClick={() => removePortfolioItem(index)}
                          className="mt-2 text-red-500 hover:text-red-700 text-sm"
                        >
                          Remove Project
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <h3 className={`text-lg font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'} mb-4`}>
                    Social Links
                  </h3>
                  <div className="space-y-4">
                    {profileForm.socialLinks.map((link, index) => (
                      <div key={index} className="grid grid-cols-1 md:grid-cols-12 gap-4 items-end">
                        <div className="md:col-span-4">
                          <label className={`block text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'} mb-2`}>
                            Platform Name
                          </label>
                          <input
                            type="text"
                            value={link.name}
                            onChange={(e) => {
                              const newLinks = [...profileForm.socialLinks];
                              newLinks[index].name = e.target.value;
                              setProfileForm(prev => ({ ...prev, socialLinks: newLinks }));
                            }}
                            placeholder="e.g., Website, LinkedIn, GitHub"
                            className={`w-full px-3 py-2 border ${isDarkMode ? 'border-gray-600 bg-gray-700 text-white' : 'border-gray-300'} rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
                          />
                        </div>
                        <div className="md:col-span-7">
                          <label className={`block text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'} mb-2`}>
                            URL
                          </label>
                          <input
                            type="url"
                            value={link.url}
                            onChange={(e) => {
                              const newLinks = [...profileForm.socialLinks];
                              newLinks[index].url = e.target.value;
                              setProfileForm(prev => ({ ...prev, socialLinks: newLinks }));
                            }}
                            placeholder="https://example.com/yourprofile"
                            className={`w-full px-3 py-2 border ${isDarkMode ? 'border-gray-600 bg-gray-700 text-white' : 'border-gray-300'} rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
                          />
                        </div>
                        <div className="md:col-span-1">
                          <button
                            type="button"
                            onClick={() => {
                              const newLinks = profileForm.socialLinks.filter((_, i) => i !== index);
                              setProfileForm(prev => ({ ...prev, socialLinks: newLinks }));
                            }}
                            className={`w-full px-3 py-2 border ${isDarkMode ? 'border-red-600 hover:bg-red-700 text-red-400' : 'border-red-300 hover:bg-red-50 text-red-600'} rounded-lg font-medium transition-colors`}
                            title="Remove"
                          >
                            ×
                          </button>
                        </div>
                      </div>
                    ))}
                    <button
                      type="button"
                      onClick={() => {
                        setProfileForm(prev => ({
                          ...prev,
                          socialLinks: [...prev.socialLinks, { name: '', url: '' }]
                        }));
                      }}
                      className="text-blue-500 hover:text-blue-600 font-medium flex items-center gap-2"
                    >
                      + Add Social Link
                    </button>
                  </div>
                </div>

                <div className="flex justify-end space-x-4">
                  <button
                    onClick={() => setActiveTab('browse')}
                    className={`border ${isDarkMode ? 'border-gray-600 hover:bg-gray-700 text-gray-300' : 'border-gray-300 hover:bg-gray-50 text-gray-700'} px-6 py-3 rounded-lg font-medium transition-colors`}
                  >
                    Cancel
                  </button>
                  <button
                    onClick={saveProfile}
                    className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded-lg font-medium transition-colors"
                  >
                    {myProfile ? 'Update Profile' : 'Create Profile'}
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {showPaymentModal && selectedBookingForPayment && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-2 sm:p-4">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-4 sm:p-6 w-full max-w-md max-h-[95vh] sm:max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between mb-4 sm:mb-6">
                <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">
                  Payment
                </h2>
                <button
                  onClick={() => setShowPaymentModal(false)}
                  className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 text-xl sm:text-2xl"
                >
                  ✕
                </button>
              </div>

              <div className="mb-6 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
                  {selectedBookingForPayment.title}
                </h3>
                <p className="text-gray-600 dark:text-gray-300 text-sm mb-2">
                  Service Provider: {selectedBookingForPayment.serviceProviderId.name}
                </p>
                <p className="text-gray-600 dark:text-gray-300 text-sm">
                  Duration: {selectedBookingForPayment.duration} minutes
                </p>
              </div>

              <div className="mb-6">
                <div className="flex justify-between items-center mb-4">
                  <span className="text-lg font-medium text-gray-900 dark:text-white">Total Amount:</span>
                  <span className="text-2xl font-bold text-green-600 dark:text-green-400">
                    ${selectedBookingForPayment.totalAmount} {selectedBookingForPayment.currency}
                  </span>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center p-3 border border-gray-300 dark:border-gray-600 rounded-lg cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700">
                    <input type="radio" name="payment" value="card" className="mr-3" defaultChecked />
                    <div className="flex items-center">
                      <span className="text-gray-700 dark:text-gray-300">💳 Credit/Debit Card</span>
                    </div>
                  </div>
                  <div className="flex items-center p-3 border border-gray-300 dark:border-gray-600 rounded-lg cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700">
                    <input type="radio" name="payment" value="paypal" className="mr-3" />
                    <div className="flex items-center">
                      <span className="text-gray-700 dark:text-gray-300">🅿️ PayPal</span>
                    </div>
                  </div>
                  <div className="flex items-center p-3 border border-gray-300 dark:border-gray-600 rounded-lg cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700">
                    <input type="radio" name="payment" value="bank" className="mr-3" />
                    <div className="flex items-center">
                      <span className="text-gray-700 dark:text-gray-300">🏦 Bank Transfer</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row justify-end space-y-2 sm:space-y-0 sm:space-x-4">
                <button
                  onClick={() => setShowPaymentModal(false)}
                  className="border border-gray-300 hover:bg-gray-50 dark:border-gray-600 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 px-4 sm:px-6 py-2 rounded-lg text-sm sm:text-base font-medium transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={processPayment}
                  className="bg-green-500 hover:bg-green-600 text-white px-4 sm:px-6 py-2 rounded-lg text-sm sm:text-base font-medium transition-colors"
                >
                  Pay Now
                </button>
              </div>
            </div>
          </div>
        )}

        <ToastContainer toasts={toasts} onClose={removeToast} />

        {/* Time Change Modal */}
        {showTimeChangeModal && selectedBookingForTimeChange && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-xl max-w-md w-full p-6`}>
              <h3 className={`text-xl font-bold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                Change Meeting Time
              </h3>

              <div className="mb-4">
                <p className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'} mb-2`}>
                  Current Date: <span className="font-semibold">
                    {new Date(selectedBookingForTimeChange.scheduledDate).toLocaleDateString('en-US', {
                      weekday: 'long',
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </span>
                </p>
                <p className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'} mb-4`}>
                  Current Time: <span className="font-semibold">
                    {new Date(selectedBookingForTimeChange.scheduledDate).toLocaleTimeString('en-US', {
                      hour: '2-digit',
                      minute: '2-digit',
                      hour12: true
                    })}
                  </span>
                </p>
                <p className={`text-xs ${isDarkMode ? 'text-yellow-300' : 'text-yellow-600'} mb-4 p-2 rounded bg-yellow-50 dark:bg-yellow-900/20`}>
                  ⚠️ Note: You can only change the time, not the date. A message will be sent to the requester automatically.
                </p>
              </div>

              <div className="mb-6">
                <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  New Time (HH:MM format)
                </label>
                <input
                  type="time"
                  value={newTime}
                  onChange={(e) => setNewTime(e.target.value)}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${isDarkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'
                    }`}
                  required
                />
                <p className={`text-xs mt-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                  Example: 14:30 (2:30 PM)
                </p>
              </div>

              <div className="flex space-x-3">
                <button
                  onClick={() => {
                    setShowTimeChangeModal(false);
                    setSelectedBookingForTimeChange(null);
                    setNewTime('');
                  }}
                  className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={async () => {
                    if (!newTime) {
                      addToast('error', 'Invalid Time', 'Please select a valid time');
                      return;
                    }

                    setUpdatingTime(true);
                    const success = await updateBookingTime(selectedBookingForTimeChange._id, newTime);
                    setUpdatingTime(false);

                    if (success) {
                      setShowTimeChangeModal(false);
                      setSelectedBookingForTimeChange(null);
                      setNewTime('');
                    }
                  }}
                  disabled={updatingTime || !newTime}
                  className="flex-1 px-4 py-2 bg-blue-500 hover:bg-blue-600 disabled:bg-gray-400 disabled:cursor-not-allowed text-white rounded-lg transition-colors"
                >
                  {updatingTime ? 'Updating...' : 'Update Time'}
                </button>
              </div>
            </div>
          </div>
        )}

        <style jsx>{`
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
      `}</style>
      </div>
    </div>
  );
}
