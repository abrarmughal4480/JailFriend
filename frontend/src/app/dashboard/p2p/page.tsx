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
  FaLightbulb
} from 'react-icons/fa';
import { HiDotsVertical } from 'react-icons/hi';

const API_URL = process.env.NEXT_PUBLIC_API_URL;
const getAvatarUrl = (url?: string | null) => url?.startsWith('http') ? url : url?.includes('/avatars/') || url?.includes('/covers/') ? (url.startsWith('/') ? url : `/${url}`) : url ? `${API_URL}/${url}` : '/default-avatar.svg';

// Feature flags to control section visibility
const SHOW_WORTH_EXPLORING = true;
const SHOW_TRENDING_SHORTS = true;
const SHOW_TOP_RATED_PROFILES = true;
const SHOW_FIND_BY_EXPERTS = true;
const SHOW_FEATURE_CARDS = true;
const SHOW_BANNER_CAROUSEL = true;
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
  socialLinks: Record<string, string>;
  categoryId?: string;
}

interface CreateBookingData {
  serviceProviderId: string;
  p2pProfileId: string;
  serviceType: string;
  title: string;
  description: string;
  scheduledDate: string;
  duration: number;
  requirements: string[];
  deliverables: string[];
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
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [selectedBookingForPayment, setSelectedBookingForPayment] = useState<Booking | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState({ occupation: '', minRate: '', maxRate: '', skills: '' });
  const [selectedProfileDetail, setSelectedProfileDetail] = useState<P2PProfile | null>(null);
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [selectedProfile, setSelectedProfile] = useState<P2PProfile | null>(null);
  const [selectedServiceType, setSelectedServiceType] = useState<string>('consultation');
  const [bookingSubmitting, setBookingSubmitting] = useState(false);
  const [bookingForm, setBookingForm] = useState<CreateBookingData>({
    serviceProviderId: '', p2pProfileId: '', serviceType: 'consultation',
    title: '', description: '', scheduledDate: '', duration: 60, requirements: [], deliverables: []
  });

  const [profileForm, setProfileForm] = useState<CreateProfileData>({
    occupation: '', hourlyRate: 0, currency: 'USD',
    audioCallPrice: '', videoCallPrice: '', chatPrice: '',
    skills: [], experience: '',
    availability: 'Available', availableDays: [],
    workingHours: { start: '09:00', end: '17:00' },
    timezone: 'UTC', languages: [{ language: '', proficiency: 'Intermediate' }],
    portfolio: [], certifications: [], responseTime: 'Within 24 hours', tags: [],
    socialLinks: { website: '', linkedin: '', github: '', behance: '' },
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
    
    // Filter profiles with 80% or more completion
    const completeProfiles = allProfiles.filter(profile => {
      const completion = calculateProfileCompletion(profile);
      return completion >= 80;
    });

    // Sort by rating (stars) first, then by creation time (oldest first)
    return completeProfiles.sort((a, b) => {
      // First sort by rating (higher rating first)
      const ratingA = a.rating?.average || 0;
      const ratingB = b.rating?.average || 0;
      if (ratingB !== ratingA) {
        return ratingB - ratingA;
      }
      
      // If ratings are equal, sort by creation time (oldest first)
      const timeA = new Date(a.createdAt || a.updatedAt || 0).getTime();
      const timeB = new Date(b.createdAt || b.updatedAt || 0).getTime();
      return timeA - timeB;
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

  const getServiceMultiplier = (profile: P2PProfile | null, serviceType: string) => {
    if (!profile) return null;
    switch (serviceType) {
      case 'audio_call':
        return parseNumericValue(profile.audioCallRate ?? profile.audioCallPrice ?? null);
      case 'video_call':
        return parseNumericValue(profile.videoCallRate ?? profile.videoCallPrice ?? null);
      case 'chat':
        return parseNumericValue(profile.chatRate ?? profile.chatPrice ?? null);
      default:
        return null;
    }
  };

  const estimatedCost = useMemo(() => {
    if (!selectedProfile) return null;
    const hours = (bookingForm.duration || 0) / 60;
    if (hours <= 0 || !selectedProfile.hourlyRate) return null;

    const multiplier = getServiceMultiplier(selectedProfile, bookingForm.serviceType);

    if (multiplier && bookingForm.serviceType !== 'fixed_price') {
      return multiplier * selectedProfile.hourlyRate * hours;
    }

    if (bookingForm.serviceType === 'fixed_price') {
      return selectedProfile.hourlyRate;
    }

    return selectedProfile.hourlyRate * hours;
  }, [bookingForm.duration, bookingForm.serviceType, selectedProfile]);

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
            socialLinks: profile.socialLinks || { website: '', linkedin: '', github: '', behance: '' },
            categoryId: profile.category?._id || ''
          });
        }
      }

      await Promise.all([loadBookings(), loadProviderBookings()]);
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
    if (!searchQuery.trim()) return;
    try {
      const response = await apiCall(`/api/p2p/profiles/search?q=${encodeURIComponent(searchQuery)}`);
      if (response.ok) {
        const data = await response.json();
        setProfiles(data.profiles || []);
      }
    } catch (error) {
      // Silent error
    }
  };

  const handleBookService = async (profile: P2PProfile, serviceType: string = 'consultation') => {
    let profileToUse = profile;

    try {
      const latestProfile = await fetchProfileDetails(profile._id);
      if (latestProfile) {
        profileToUse = latestProfile;
      } else {
        addToast('info', 'Latest profile unavailable', 'Showing cached profile details while we refresh the provider information.');
      }
    } catch (error) {
      addToast('warning', 'Unable to refresh profile', 'Using cached profile details for now.');
    }

    const now = new Date();
    setSelectedProfile(profileToUse);
    setSelectedServiceType(serviceType);
    setBookingForm({
      serviceProviderId: profileToUse.userId._id, p2pProfileId: profileToUse._id,
      serviceType: serviceType, title: '', description: '',
      scheduledDate: now.toISOString().slice(0, 16), duration: 60,
      requirements: [], deliverables: []
    });
    setShowBookingModal(true);
  };

  const createBooking = async () => {
    const { title, description, scheduledDate } = bookingForm;
    if (!title.trim() || !description.trim() || !scheduledDate) {
      return addToast('warning', 'Missing Information', 'Please fill in all required fields');
    }

    if (new Date(scheduledDate) < new Date()) {
      return addToast('error', 'Scheduling Error', 'Meeting cannot be scheduled in the past. Please select a future date and time.');
    }

    setBookingSubmitting(true);

    try {
      const response = await apiCall('/api/bookings', { method: 'POST', body: JSON.stringify(bookingForm) });
      const data = await response.json();
      
      if (response.ok) {
        setShowBookingModal(false);
        setSelectedProfile(null);
        await loadBookings();
        addToast('success', 'Booking Request Sent!', 'Your booking request has been sent successfully');
      } else {
        addToast('error', 'Booking Failed', data.message || 'Failed to create booking');
      }
    } catch (error) {
      addToast('error', 'Network Error', 'Failed to create booking. Please check your connection');
    } finally {
      setBookingSubmitting(false);
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
      { condition: !profileForm.experience.trim() || profileForm.experience.trim().length < 10, 
        message: 'Please provide a detailed experience description (at least 10 characters)' }
    ];

    const error = validationErrors.find(v => v.condition);
    if (error) return addToast('warning', 'Validation Error', error.message);

    try {
      const response = await apiCall('/api/p2p/profile', { method: 'POST', body: JSON.stringify(profileForm) });
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
      contact: () => handleContact(profile),
      view: () => handleViewProfile(profile),
      book: () => handleBookService(profile)
    };

    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-3 sm:p-4 lg:p-6 border border-gray-200 dark:border-gray-700 hover:shadow-lg transition-shadow duration-200">
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
                <h3 className="text-sm font-semibold text-gray-900 dark:text-white truncate">
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
              <p className="text-gray-600 dark:text-gray-300 text-xs truncate">
                @{profile.userId.username}
              </p>
            </div>
          </div>
          
          <p className="text-gray-700 dark:text-gray-200 font-medium text-sm mb-2">
            {profile.occupation}
          </p>
          
          <div className="flex items-center justify-between mb-2">
            <span className="text-green-600 dark:text-green-400 font-bold text-sm">
              ${profile.hourlyRate}/{profile.currency}
            </span>
            <span className={`px-2 py-1 rounded-full text-xs ${
              profile.availability === 'Available' 
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
          
          <p className="text-gray-600 dark:text-gray-300 text-xs mb-3 line-clamp-2">
            {profile.experience}
          </p>
          
          <div className="flex space-x-2">
            <button 
              onClick={handlers.contact}
              className="flex-1 bg-blue-500 hover:bg-blue-600 text-white px-3 py-2 rounded-lg text-xs font-medium transition-colors"
            >
              Contact
            </button>
            {(profile.availability === 'Available' || profile.availability === 'Away') && (
              <button 
                onClick={handlers.book}
                className="flex-1 bg-green-500 hover:bg-green-600 text-white px-3 py-2 rounded-lg text-xs font-medium transition-colors"
              >
                Book
              </button>
            )}
          </div>
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
              <h3 className="text-base lg:text-lg font-semibold text-gray-900 dark:text-white">
                {profile.userId.name}
              </h3>
              {profile.isVerified && (
                <span className="text-blue-500 text-sm">✓</span>
              )}
            </div>
            <p className="text-gray-600 dark:text-gray-300 text-sm mb-1">
              @{profile.userId.username}
            </p>
            {profile.featured && (
              <span className="bg-yellow-100 text-yellow-800 text-xs px-2 py-1 rounded-full">
                Featured
              </span>
            )}
          </div>
          
          <div className="text-center mb-3">
            <p className="text-gray-700 dark:text-gray-200 font-medium text-sm lg:text-base mb-2">
              {profile.occupation}
            </p>
            <span className="text-green-600 dark:text-green-400 font-bold text-sm lg:text-base">
              ${profile.hourlyRate}/{profile.currency}
            </span>
          </div>
          
          <div className="flex items-center justify-center mb-3">
            <span className="text-gray-500 dark:text-gray-400 text-xs lg:text-sm">
              ⭐ {profile.rating.average.toFixed(1)} ({profile.rating.count} reviews)
            </span>
          </div>
          
          <div className="flex justify-center mb-3">
            <span className={`px-2 py-1 rounded-full text-xs ${
              profile.availability === 'Available' 
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
          
          <p className="text-gray-600 dark:text-gray-300 text-xs lg:text-sm text-center mb-4 line-clamp-2">
            {profile.experience}
          </p>
          
          <div className="space-y-2">
            <button 
              onClick={handlers.view}
              className="w-full bg-gray-500 hover:bg-gray-600 text-white px-3 py-2 rounded-lg text-xs lg:text-sm font-medium transition-colors"
            >
              View Profile
            </button>
            <div className="flex space-x-2">
              <button 
                onClick={handlers.contact}
                className="flex-1 bg-blue-500 hover:bg-blue-600 text-white px-3 py-2 rounded-lg text-xs lg:text-sm font-medium transition-colors"
              >
                Contact
              </button>
              {(profile.availability === 'Available' || profile.availability === 'Away') && (
                <button 
                  onClick={handlers.book}
                  className="flex-1 bg-green-500 hover:bg-green-600 text-white px-3 py-2 rounded-lg text-xs lg:text-sm font-medium transition-colors"
                >
                  Book Service
                </button>
              )}
            </div>
          </div>
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
      <div className="w-full px-3 sm:px-4 lg:px-8 py-4 sm:py-6 lg:py-8">
        {/* Header */}
        <div className="mb-6 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">
            P2P Services
          </h1>
          <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400 mt-1 sm:mt-2">
            Connect with skilled professionals and offer your services
          </p>
        </div>

        {/* Tabs */}
        <div className="mb-6 sm:mb-8">
          <div className="border-b border-gray-200 dark:border-gray-700">
            <nav className="-mb-px flex flex-wrap gap-2 sm:gap-0 sm:space-x-8 overflow-x-auto">
              {[
                { key: 'browse', label: 'Browse Services' },
                { key: 'bookings', label: 'My Bookings' },
                { key: 'provider-bookings', label: 'Provider Bookings' },
                { key: 'create', label: myProfile ? 'Edit Profile' : 'Create Profile' }
              ].map(({ key, label }) => (
                <button
                  key={key}
                  onClick={() => setActiveTab(key as any)}
                  className={`py-2 px-2 sm:px-1 border-b-2 font-medium text-xs sm:text-sm whitespace-nowrap ${
                    activeTab === key
                      ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
                  }`}
                >
                  {label}
                </button>
              ))}
            </nav>
          </div>
        </div>

        {activeTab === 'bookings' && (
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
              My Bookings
            </h2>
            
            {bookings.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-gray-500 dark:text-gray-400 mb-4">
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
                  <div key={booking._id} className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4 sm:p-6 border border-gray-200 dark:border-gray-700">
                    <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between space-y-4 lg:space-y-0">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 sm:space-x-4 mb-3 sm:mb-4">
                          <img
                            src={booking.serviceProviderId.avatar || '/default-avatar.svg'}
                            alt={booking.serviceProviderId.name}
                            className="w-10 h-10 sm:w-12 sm:h-12 rounded-full object-cover flex-shrink-0"
                          />
                          <div className="min-w-0 flex-1">
                            <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white truncate">
                              {booking.title}
                            </h3>
                            <p className="text-sm text-gray-600 dark:text-gray-300 truncate">
                              with {booking.serviceProviderId.name} (@{booking.serviceProviderId.username})
                            </p>
                            <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">
                              {booking.p2pProfileId.occupation}
                            </p>
                          </div>
                        </div>
                        
                        <p className="text-sm sm:text-base text-gray-700 dark:text-gray-300 mb-3 sm:mb-4 line-clamp-2">
                          {booking.description}
                        </p>
                        
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 sm:gap-4 text-xs sm:text-sm">
                          <div>
                            <span className="text-gray-500 dark:text-gray-400">Scheduled:</span>
                            <p className="text-gray-900 dark:text-white font-medium">
                              {new Date(booking.scheduledDate).toLocaleDateString()}
                            </p>
                            <p className="text-gray-600 dark:text-gray-300">
                              {new Date(booking.scheduledDate).toLocaleTimeString()}
                            </p>
                          </div>
                          <div>
                            <span className="text-gray-500 dark:text-gray-400">Duration:</span>
                            <p className="text-gray-900 dark:text-white font-medium">{booking.duration} minutes</p>
                          </div>
                          <div>
                            <span className="text-gray-500 dark:text-gray-400">Amount:</span>
                            <p className="text-green-600 dark:text-green-400 font-bold">
                              ${booking.totalAmount} {booking.currency}
                            </p>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex flex-col sm:flex-row lg:flex-col items-start sm:items-center lg:items-end space-y-2 sm:space-y-0 sm:space-x-2 lg:space-x-0 lg:space-y-2">
                        <span className={`px-2 sm:px-3 py-1 rounded-full text-xs sm:text-sm font-medium ${
                          booking.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
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
              <div className="w-full lg:w-[60%] bg-white dark:bg-gray-800 rounded-[20px] p-5 shadow-lg border border-gray-200 dark:border-gray-700 backdrop-blur-sm">
                {/* Header */}
                <div className="flex justify-between items-center pb-5 border-b border-gray-200 dark:border-gray-700 mb-5">
                  <div className="flex gap-2 mt-2 text-xl font-medium"></div>
                  <div className="flex gap-4 items-center">
                    {myProfile?.rating && (
                      <div className="flex items-center gap-1.5 px-3 py-1 bg-blue-500/10 dark:bg-blue-500/20 rounded-full">
                        <FaStar className="w-4 h-4 text-blue-500 dark:text-blue-400" />
                        <span className="text-sm font-semibold text-gray-900 dark:text-white">
                          {(myProfile.rating.average ?? 0).toFixed(1)}
                        </span>
                        <span className="text-[11px] text-gray-500 dark:text-gray-400">
                          ({myProfile.rating.count ?? 0})
                        </span>
                      </div>
                    )}
                    <FaShareAlt 
                      className="w-6 h-6 cursor-pointer text-gray-900 dark:text-white"
                    />
                    <HiDotsVertical 
                      className="w-6 h-6 cursor-pointer text-gray-900 dark:text-white"
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
                      className="mt-4 bg-blue-500 text-white border-none px-4 py-2 rounded-[20px] text-sm cursor-pointer transition-all hover:bg-blue-600 mx-auto"
                    >
                      Edit Profile
                    </button>
                  </div>

                  {/* Profile Info */}
                  <div className="text-center w-full">
                    <h1 className="text-2xl font-semibold text-gray-900 dark:text-white mb-2.5">
                      {user.fullName || user.name}
                    </h1>
                    
                    {/* Title/Organization */}
                    <h3 className="text-base text-[#CCCCCC] dark:text-gray-300 mb-5">
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
                              className="px-3 py-1.5 rounded-[20px] bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 text-xs border border-blue-200 dark:border-blue-800"
                            >
                              {tag}
                            </div>
                          )) : null;
                        }
                        return null;
                      })()}
                    </div>
                    
                    {/* Description */}
                    <p className="text-sm text-[#CCCCCC] dark:text-gray-300 mb-5 text-center">
                      {myProfile?.description || myProfile?.experience || user.bio || 'No description available.'}
                    </p>
                  </div>

                  {/* CTA Section - User's Own Pricing */}
                  {myProfile && (
                    <div className="flex  justify-center gap-2 mt-5 w-full">
                      {/* Audio Call */}
                      <div className="w-[220px] h-[220px] bg-[rgba(51,51,51,0.5)] dark:bg-gray-700/50 rounded-2xl border border-gray-200 dark:border-gray-600 px-1 py-7 flex flex-col items-center text-center">
                        <div className="mb-6">
                          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Audio Call</h3>
                          <div className="w-12 h-1 bg-blue-500 mx-auto mt-2 rounded-full"></div>
                          <p className="text-sm text-[#CCCCCC] dark:text-gray-300 mt-3">
                            {myProfile.audioCallPrice 
                              ? `₹${myProfile.audioCallPrice}`
                              : myProfile.hourlyRate 
                                ? `₹${myProfile.hourlyRate}/${myProfile.currency || 'hour'}`
                                : 'N/A'}
                          </p>
                        </div>
                        <button 
                          onClick={() => setActiveTab('create')}
                          className="w-full py-2.5 bg-blue-500 hover:bg-blue-600 text-white rounded-lg text-sm font-medium transition-all"
                        >
                          Book Now
                        </button>
                      </div>
                      
                      {/* Video Call */}
                      <div className="w-[220px] h-[220px] bg-[rgba(51,51,51,0.5)] dark:bg-gray-700/50 rounded-2xl border border-gray-200 dark:border-gray-600 px-6 py-7 flex flex-col items-center text-center">
                        <div className="mb-6">
                          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Video Call</h3>
                          <div className="w-12 h-1 bg-blue-500 mx-auto mt-2 rounded-full"></div>
                          <p className="text-sm text-[#CCCCCC] dark:text-gray-300 mt-3">
                            {myProfile.videoCallPrice 
                              ? `₹${myProfile.videoCallPrice}`
                              : myProfile.hourlyRate 
                                ? `₹${myProfile.hourlyRate}/${myProfile.currency || 'hour'}`
                                : 'N/A'}
                          </p>
                        </div>
                        <button 
                          onClick={() => setActiveTab('create')}
                          className="w-full py-2.5 bg-blue-500 hover:bg-blue-600 text-white rounded-lg text-sm font-medium transition-all"
                        >
                          Book Now
                        </button>
                      </div>
                      
                      {/* Next Available */}
                      <div className="w-[220px] h-[220px] bg-[rgba(51,51,51,0.5)] dark:bg-gray-700/50 rounded-2xl border border-gray-200 dark:border-gray-600 px-6 py-7 flex flex-col items-center text-center">
                        <div className="mb-6">
                          <h2 className="text-base font-medium text-gray-900 dark:text-white">Next Available at</h2>
                          <div className="w-12 h-1 bg-blue-500 mx-auto mt-2 rounded-full"></div>
                          <p className="text-xs text-[#CCCCCC] dark:text-gray-300 mt-3">
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
                          className="w-full py-2.5 bg-blue-500 hover:bg-blue-600 text-white rounded-lg text-sm font-medium transition-all"
                        >
                          Book Now
                        </button>
                      </div>
                    </div>
                  )}
                  
                  {myProfile && myProfile.rating && myProfile.rating.count > 0 && (
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6 p-4 bg-gray-50 dark:bg-gray-700/30 rounded-xl border border-gray-200 dark:border-gray-600">
                      <div className="text-center">
                        <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Rating</p>
                        <p className="text-lg font-semibold text-gray-900 dark:text-white">
                          ⭐ {myProfile.rating.average.toFixed(1)} ({myProfile.rating.count})
                        </p>
                      </div>
                      {myProfile.completedJobs > 0 && (
                        <div className="text-center">
                          <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Completed Jobs</p>
                          <p className="text-lg font-semibold text-gray-900 dark:text-white">
                            {myProfile.completedJobs}
                          </p>
                        </div>
                      )}
                      {myProfile.responseTime && (
                        <div className="text-center">
                          <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Response Time</p>
                          <p className="text-lg font-semibold text-gray-900 dark:text-white">
                            {myProfile.responseTime}
                          </p>
                        </div>
                      )}
                    </div>
                  )}

                  <div className="flex justify-center gap-2.5 mt-5">
                    {myProfile?.socialLinks?.twitterLink && (
                      <a 
                        href={myProfile.socialLinks.twitterLink} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="w-10 h-10 rounded-full bg-[rgba(51,51,51,0.5)] dark:bg-gray-700 flex items-center justify-center border border-gray-200 dark:border-gray-600 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                      >
                        <FaTwitter 
                          className="w-5 h-5 text-gray-900 dark:text-white"
                        />
                      </a>
                    )}
                    {myProfile?.socialLinks?.linkedInLink && (
                      <a 
                        href={myProfile.socialLinks.linkedInLink} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="w-10 h-10 rounded-full bg-[rgba(51,51,51,0.5)] dark:bg-gray-700 flex items-center justify-center border border-gray-200 dark:border-gray-600 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                      >
                        <FaLinkedin 
                          className="w-5 h-5 text-gray-900 dark:text-white"
                        />
                      </a>
                    )}
                    {myProfile?.socialLinks?.instagramLink && (
                      <a 
                        href={myProfile.socialLinks.instagramLink} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="w-10 h-10 rounded-full bg-[rgba(51,51,51,0.5)] dark:bg-gray-700 flex items-center justify-center border border-gray-200 dark:border-gray-600 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                      >
                        <FaInstagram 
                          className="w-5 h-5 text-gray-900 dark:text-white"
                        />
                      </a>
                    )}
                  </div>
                </div>
                  ) : null;
                })()}
                {(() => {
                  const user = currentUser || myProfile?.userId;
                  if (!user && loading) {
                    return (
                      <div className="text-center py-12">
                        <p className="text-gray-500 dark:text-gray-400">Loading profile...</p>
                      </div>
                    );
                  }
                  if (!user && !loading) {
                    return (
                      <div className="text-center py-12">
                        <p className="text-gray-500 dark:text-gray-400">Unable to load profile. Please refresh the page.</p>
                      </div>
                    );
                  }
                  return null;
                })()}
              </div>

              {/* Banner Section (Right Side - 50%) */}
              {SHOW_FIND_BY_EXPERTS && (
                <div
                  className={`w-full lg:w-[40%] h-[400px] flex flex-col justify-center items-center text-center relative rounded-xl shadow-lg transition-colors ${
                    isDarkMode ? 'bg-[#28303D] text-white' : 'bg-white text-gray-900'
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
              )}
            </div>

            {SHOW_FIND_BY_CATEGORY && (
              <div className={`pt-10 pb-5 transition-colors ${isDarkMode ? 'bg-gray-900' : 'bg-gray-100'}`}>
                <h3 className="text-[28px] font-semibold text-center mb-5 text-gray-900 dark:text-white relative inline-block w-full">
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
                            className={`bg-white dark:bg-gray-800 rounded-[15px] p-5 h-[200px] flex flex-col justify-between items-center border shadow-md transition-all ${
                              isSelectable ? 'cursor-pointer hover:-translate-y-2.5 hover:shadow-lg' : 'cursor-default'
                            } ${isSelected ? 'border-blue-500 ring-2 ring-blue-200' : 'border-gray-200 dark:border-gray-700'}`}
                            role={isSelectable ? 'button' : undefined}
                            aria-pressed={isSelected}
                            onClick={() => isSelectable && handleCategorySelect(category.id)}
                          >
                            <h5 className="text-base font-bold text-gray-900 dark:text-white mb-2.5 text-center leading-tight">
                              {category.title}
                            </h5>
                            <img src={category.image} alt={category.title} className="w-[100px] h-[62px] object-cover drop-shadow-md rounded-md" />
                            <p className="text-xs text-gray-600 dark:text-gray-400 text-center leading-snug">
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

          <div className="w-full mx-auto mt-[60px] mb-5 p-6 bg-white dark:bg-gray-800 shadow-md rounded-xl">
            <table className="w-full">
              <tbody>
                <tr>
                  <td className="w-1/2 align-top">
                    <h3 className="text-[35px] font-semibold leading-[40px] text-[#1A1A1A] dark:text-white mb-3">
                      Top experts for you
                    </h3>
                    <p className="text-base font-light leading-6 text-gray-600 dark:text-gray-400 mt-3">
                      Connect with trusted and verified professionals across various fields of expertise
                    </p>
                  </td>
                  <td className="w-1/2 align-top text-right">
                    <div className="flex gap-3 justify-end">
                      <button className="px-4 py-2 text-sm font-medium border border-[#E0E0E0] dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 hover:bg-[#F5F5F5] dark:hover:bg-gray-700 transition-all hover:-translate-y-0.5">
                        Instantly available
                      </button>
                      <button className="px-4 py-2 text-sm font-medium border border-[#E0E0E0] dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 hover:bg-[#F5F5F5] dark:hover:bg-gray-700 transition-all hover:-translate-y-0.5">
                        Verified profiles
                      </button>
                      <button className="px-4 py-2 text-sm font-medium border border-[#E0E0E0] dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 hover:bg-[#F5F5F5] dark:hover:bg-gray-700 transition-all hover:-translate-y-0.5">
                        Top rated
                      </button>
                      <button className="px-4 py-2 text-sm font-medium border border-[#E0E0E0] dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 hover:bg-[#F5F5F5] dark:hover:bg-gray-700 transition-all hover:-translate-y-0.5">
                        Sort by
                      </button>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <div className="flex flex-col gap-5 w-full mx-auto mb-5 px-5">
            <div className="grid w-full gap-6 sm:grid-cols-2 xl:grid-cols-3 justify-items-center">{getTopExpertsProfiles().slice(0, 6).map((profile) => (
                <div 
                  key={profile._id}
                  className="w-full max-w-[360px] bg-white dark:bg-gray-800 rounded-[20px] p-5 shadow-lg text-center border border-gray-200 dark:border-gray-700 hover:shadow-xl transition-all"
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
                        className="w-full h-full rounded-full border-4 border-[#f0f0f0] dark:border-gray-600 object-cover"
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
                      <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                        {profile.userId.fullName || profile.userId.name}
                      </h1>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
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
                    <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed mb-4 break-words">
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
                            className="bg-[#f0f0f0] dark:bg-gray-700 text-gray-900 dark:text-gray-200 text-xs px-3 py-1.5 rounded-[20px] hover:bg-blue-500 hover:text-white transition-all"
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
                          <div className="bg-[#f0f0f0] dark:bg-gray-700 text-gray-900 dark:text-gray-200 text-xs px-3 py-1.5 rounded-[20px]">
                            +{uniqueTags.length - 5} more
                          </div>
                        ) : null;
                      })()}
                    </div>
                  </div>

                  {/* Pricing & Services Section */}
                  <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
                    <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-4 text-center">
                      Available Services & Pricing
                    </h3>
                    
                    {/* Services Grid */}
                    <div className="flex gap-2.5 mb-3">
                      {/* Audio Call Service */}
                      {(profile.audioCallPrice || profile.hourlyRate) && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleBookService(profile, 'audio_call');
                          }}
                          className="flex items-center justify-between p-2.5 bg-gray-50 dark:bg-gray-700/50 rounded-lg border border-gray-200 dark:border-gray-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 hover:border-blue-300 dark:hover:border-blue-700 transition-all cursor-pointer text-sm"
                        >
                          <div className=" items-center gap-1.5">
                            <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
                              <FaPhone className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                            </div>
                            <div className="text-left">
                              <p className="text-xs font-semibold text-gray-900 dark:text-white">Audio Call</p>
                              <p className="text-base font-bold text-gray-900 dark:text-white">
                                ₹{profile.audioCallPrice || profile.hourlyRate}
                              </p>
                              <p className="text-[10px] text-gray-500 dark:text-gray-400">
                                {profile.audioCallPrice ? 'per call' : `/${profile.currency || 'hour'}`}
                              </p>
                            </div>
                          </div>

                        </button>
                      )}

                      {/* Video Call Service */}
                      {(profile.videoCallPrice || profile.hourlyRate) && (
                        <button
                        
                          className="flex items-center justify-between p-2.5 bg-gray-50 dark:bg-gray-700/50 rounded-lg border border-gray-200 dark:border-gray-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 hover:border-blue-300 dark:hover:border-blue-700 transition-all cursor-pointer text-sm"
                        >
                          <div className=" items-center gap-1.5">
                            <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
                              <FaVideo className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                            </div>
                            <div className="text-left">
                              <p className="text-xs font-semibold text-gray-900 dark:text-white">Video Call</p>
                              <p className="text-base font-bold text-gray-900 dark:text-white">
                                ₹{profile.videoCallPrice || profile.hourlyRate}
                              </p>
                              <p className="text-[10px] text-gray-500 dark:text-gray-400">
                                {profile.videoCallPrice ? 'per call' : `/${profile.currency || 'hour'}`}
                              </p>
                            </div>
                          </div>
                        </button>
                      )}

                      {/* Chat Service */}
                      {profile.chatPrice && (
                        <button
                         
                          className="flex items-center justify-between p-2.5 bg-gray-50 dark:bg-gray-700/50 rounded-lg border border-gray-200 dark:border-gray-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 hover:border-blue-300 dark:hover:border-blue-700 transition-all cursor-pointer text-sm"
                        >
                          <div className=" items-start gap-1.5">
                            <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
                              <FaComments className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                            </div>
                            <div className="text-left">
                              <p className="text-xs font-semibold text-gray-900 dark:text-white">Chat</p>
                              <p className="text-base font-bold text-gray-900 dark:text-white">
                                ₹{profile.chatPrice}
                              </p>
                              <p className="text-[10px] text-gray-500 dark:text-gray-400">per message</p>
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
                          className="flex items-center justify-between p-2.5 bg-gray-50 dark:bg-gray-700/50 rounded-lg border border-gray-200 dark:border-gray-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 hover:border-blue-300 dark:hover:border-blue-700 transition-all cursor-pointer text-sm"
                        >
                          <div className=" items-center gap-1.5">
                            <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
                              <FaStar className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                            </div>
                            <div className="text-left">
                              <p className="text-xs font-semibold text-gray-900 dark:text-white">Hourly Rate</p>
                              <p className="text-[10px] text-gray-500 dark:text-gray-400">Consultation services</p>
                              <p className="text-base font-bold text-gray-900 dark:text-white">
                                ₹{profile.hourlyRate}
                              </p>
                              <p className="text-[10px] text-gray-500 dark:text-gray-400">/{profile.currency || 'hour'}</p>
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
                      className="flex flex-col items-center justify-center p-2.5 bg-[#F5F5F5] dark:bg-gray-700 rounded-xl cursor-pointer transition-all hover:-translate-y-1 hover:shadow-lg text-center"
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
                      <h5 className="text-sm font-semibold text-[#1A1A1A] dark:text-white mb-1">
                        {feature.title}
                      </h5>
                      {feature.desc && (
                        <div className="flex items-center justify-start text-xs cursor-pointer text-blue-600 dark:text-blue-400">
                          {feature.isShare ? (
                            <>
                              <FaCopy className="mr-1 w-3 h-3" />
                              {feature.desc}
                            </>
                          ) : (
                            <p className="text-[10px] font-light text-gray-600 dark:text-gray-400">{feature.desc}</p>
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

          <div className="relative py-10 px-5 overflow-hidden bg-white dark:bg-gray-900 mb-5">
            {SHOW_WORTH_EXPLORING && (
              <>
                <div className="absolute top-[60%] right-[10%] transform -translate-y-1/2 w-[525px] h-[425px] z-[-1] bg-[radial-gradient(50%_50%_at_50%_50%,rgba(17,214,190,0.15)_23%,rgba(10,7,11,0.15)_100%)] blur-[40px]"></div>
                <div className="text-center">
                  <h3 className="text-[35px] font-semibold text-[#1A1A1A] dark:text-white leading-[35px] mb-12">
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
                          className={`px-[18px] py-2 rounded-[100px] border text-sm font-medium transition-all ${
                            isActive
                              ? 'bg-blue-500 border-blue-500 text-white'
                              : 'border-blue-300 dark:border-blue-700 bg-blue-50 dark:bg-blue-900/20 text-[#1A1A1A] dark:text-white hover:bg-blue-500 hover:text-white'
                          } ${item.isSelectable ? 'cursor-pointer hover:-translate-y-0.5' : 'opacity-70 cursor-default'}`}
                        >
                          {item.label}
                        </button>
                      );
                    })}
                  </div>
                  {!categories.length && (
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-4">
                      Sample categories shown until admins publish the real list.
                    </p>
                  )}
                </div>
              </>
            )}
          </div>

          {SHOW_TRENDING_SHORTS && (
            <div className="py-20 bg-[rgba(255,255,255,0.15)] dark:bg-gray-800/50 mt-[60px] w-full mb-5">
              <div className="w-[90%] mx-auto">
                <div className="mb-10">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-[35px] font-semibold leading-[35px] text-[#1A1A1A] dark:text-white">
                      Trending JFshorts
                    </h3>
                    <button className="flex items-center gap-1 text-base font-semibold text-blue-600 dark:text-blue-400 cursor-pointer bg-none border-none hover:underline">
                      View all
                      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="arrow-icon">
                        <path d="M5 12h14"></path>
                        <path d="m12 5 7 7-7 7"></path>
                      </svg>
                    </button>
                  </div>
                  <h5 className="text-base font-light text-gray-600 dark:text-gray-400">
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
            <div className="w-full mx-auto mb-5 p-6 bg-white dark:bg-gray-800 shadow-md rounded-xl">
              <table className="w-full">
                <tbody>
                  <tr>
                    <td className="w-full align-top">
                      <h3 className="text-[35px] font-semibold leading-[40px] text-[#1A1A1A] dark:text-white mb-3">
                        Top Rated Profiles
                      </h3>
                      <p className="text-base font-light leading-6 text-gray-600 dark:text-gray-400 mt-3">
                        Browse highly-rated experts with 4.5+ reviews from users for exceptional guidance
                      </p>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          )}

          <div className="flex flex-col gap-5 w-full mx-auto mb-5 px-5">
            <div className="flex justify-around items-center w-full flex-wrap gap-5">{(featuredProfiles.length > 0 ? featuredProfiles : profiles).slice(6, 12).map((profile) => (
                <div 
                  key={profile._id}
                  onClick={() => handleViewProfile(profile)}
                  className="w-full max-w-[400px] bg-white dark:bg-gray-800 rounded-[20px] p-6 shadow-lg text-center border border-gray-200 dark:border-gray-700 cursor-pointer hover:shadow-xl transition-all"
                >
                  <div className="relative mx-auto mb-4 w-[100px] h-[100px]">
                    <Image 
                      src={getAvatarUrl(profile.userId.avatar)} 
                      alt={profile.userId.fullName || profile.userId.name} 
                      width={100}
                      height={100}
                      className="w-full h-full rounded-full border-4 border-[#f0f0f0] dark:border-gray-600 object-cover"
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
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                      {profile.userId.fullName || profile.userId.name}
                    </h1>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
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
                  <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed mb-4">
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
                          className="bg-[#f0f0f0] dark:bg-gray-700 text-gray-900 dark:text-gray-200 text-xs px-3 py-1.5 rounded-[20px] hover:bg-blue-500 hover:text-white transition-all"
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
                        <div className="bg-[#f0f0f0] dark:bg-gray-700 text-gray-900 dark:text-gray-200 text-xs px-3 py-1.5 rounded-[20px]">
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
                          setSelectedProfile(profile);
                          setShowBookingModal(true);
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
                          setSelectedProfile(profile);
                          setShowBookingModal(true);
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
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
              Provider Bookings
            </h2>
            
            {providerBookings.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-gray-500 dark:text-gray-400 mb-4">
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
                {providerBookings.map((booking) => (
                  <div key={booking._id} className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4 sm:p-6">
                    <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between space-y-4 lg:space-y-0">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 sm:space-x-3 mb-3 sm:mb-4">
                          <img
                            src={booking.clientId.avatar || '/default-avatar.svg'}
                            alt={booking.clientId.name}
                            className="w-10 h-10 sm:w-12 sm:h-12 rounded-full object-cover flex-shrink-0"
                          />
                          <div className="min-w-0 flex-1">
                            <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white truncate">
                              {booking.clientId.name}
                            </h3>
                            <p className="text-sm text-gray-600 dark:text-gray-300 truncate">
                              @{booking.clientId.username}
                            </p>
                          </div>
                        </div>
                        
                        <div className="mb-3 sm:mb-4">
                          <h4 className="text-base sm:text-lg font-medium text-gray-900 dark:text-white mb-2">
                            {booking.title}
                          </h4>
                          <p className="text-sm sm:text-base text-gray-600 dark:text-gray-300 mb-3 line-clamp-2">
                            {booking.description}
                          </p>
                        </div>
                        
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 mb-3 sm:mb-4 text-xs sm:text-sm">
                          <div>
                            <span className="text-gray-500 dark:text-gray-400 font-medium">Service Type:</span>
                            <p className="text-gray-900 dark:text-white capitalize">{booking.serviceType}</p>
                          </div>
                          <div>
                            <span className="text-gray-500 dark:text-gray-400 font-medium">Scheduled:</span>
                            <p className="text-gray-900 dark:text-white">
                              {new Date(booking.scheduledDate).toLocaleDateString()}
                            </p>
                            <p className="text-gray-600 dark:text-gray-300">
                              {new Date(booking.scheduledDate).toLocaleTimeString()}
                            </p>
                          </div>
                          <div>
                            <span className="text-gray-500 dark:text-gray-400 font-medium">Duration:</span>
                            <p className="text-gray-900 dark:text-white">{booking.duration} minutes</p>
                          </div>
                          <div>
                            <span className="text-gray-500 dark:text-gray-400 font-medium">Amount:</span>
                            <p className="text-gray-900 dark:text-white font-semibold">
                              ${booking.totalAmount} {booking.currency}
                            </p>
                          </div>
                        </div>
                        
                        <div className="flex items-center space-x-2 mb-3 sm:mb-4">
                          <span className={`px-2 sm:px-3 py-1 rounded-full text-xs sm:text-sm font-medium ${
                            booking.status === 'pending' 
                              ? 'bg-yellow-100 text-yellow-800' 
                              : booking.status === 'accepted'
                              ? 'bg-green-100 text-green-800'
                              : booking.status === 'rejected'
                              ? 'bg-red-100 text-red-800'
                              : 'bg-blue-100 text-blue-800'
                          }`}>
                            {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                          </span>
                        </div>
                      </div>
                      
                      <div className="flex flex-col sm:flex-row lg:flex-col space-y-2 sm:space-y-0 sm:space-x-2 lg:space-x-0 lg:space-y-2">
                        {booking.status === 'pending' && (
                          <>
                            <button
                              onClick={() => acceptBooking(booking._id)}
                              className="bg-green-500 hover:bg-green-600 text-white px-3 sm:px-4 py-2 rounded-lg text-xs sm:text-sm font-medium transition-colors"
                            >
                              Accept
                            </button>
                            <button
                              onClick={() => rejectBooking(booking._id)}
                              className="bg-red-500 hover:bg-red-600 text-white px-3 sm:px-4 py-2 rounded-lg text-xs sm:text-sm font-medium transition-colors"
                            >
                              Reject
                            </button>
                          </>
                        )}
                        {(booking.status === 'accepted' || booking.status === 'In_progress' || booking.status === 'in_progress') && (
                          <button
                            onClick={() => startVideoCall(booking._id)}
                            className="bg-blue-500 hover:bg-blue-600 text-white px-3 sm:px-4 py-2 rounded-lg text-xs sm:text-sm font-medium transition-colors"
                          >
                            Start Call
                          </button>
                        )}
                        <button
                          onClick={() => router.push(`/dashboard/messages?userId=${booking.clientId._id}`)}
                          className="bg-gray-500 hover:bg-gray-600 text-white px-3 sm:px-4 py-2 rounded-lg text-xs sm:text-sm font-medium transition-colors"
                        >
                          Chat
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'my-profile' && (
          <div>
            {myProfile ? (
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
                <div className="flex items-start space-x-4">
                  <img
                    src={myProfile.userId.avatar || '/default-avatar.svg'}
                    alt={myProfile.userId.name}
                    className="w-20 h-20 rounded-full object-cover"
                  />
                  <div className="flex-1">
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                      {myProfile.userId.name}
                    </h2>
                    <p className="text-gray-600 dark:text-gray-300">
                      @{myProfile.userId.username}
                    </p>
                    {myProfile.category?.title && (
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-indigo-50 text-indigo-600 mt-2">
                        {myProfile.category.title}
                      </span>
                    )}
                    <p className="text-gray-700 dark:text-gray-200 font-medium text-lg">
                      {myProfile.occupation}
                    </p>
                    <div className="flex items-center space-x-4 mt-2">
                      <span className="text-green-600 dark:text-green-400 font-bold text-lg">
                        ${myProfile.hourlyRate}/{myProfile.currency}
                      </span>
                      <span className="text-gray-500 dark:text-gray-400">
                        ⭐ {myProfile.rating.average.toFixed(1)} ({myProfile.rating.count} reviews)
                      </span>
                      <span className={`px-3 py-1 rounded-full text-sm ${
                        myProfile.availability === 'Available' 
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
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                    Experience
                  </h3>
                  <p className="text-gray-700 dark:text-gray-300">
                    {myProfile.experience}
                  </p>
                </div>

                <div className="mt-6">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
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
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                    Languages
                  </h3>
                  <div className="space-y-2">
                    {myProfile.languages.map((lang, index) => (
                      <div key={index} className="flex justify-between items-center">
                        <span className="text-gray-700 dark:text-gray-300">
                          {lang.language}
                        </span>
                        <span className="text-sm text-gray-500 dark:text-gray-400">
                          {lang.proficiency}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="mt-6">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                    Portfolio
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {myProfile.portfolio.map((item, index) => (
                      <div key={index} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                        <h4 className="font-medium text-gray-900 dark:text-white">
                          {item.title}
                        </h4>
                        <p className="text-gray-600 dark:text-gray-300 text-sm mt-1">
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
                <p className="text-gray-500 dark:text-gray-400 mb-4">
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
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4 sm:p-6">
            <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white mb-4 sm:mb-6">
              {myProfile ? 'Edit Profile' : 'Create P2P Profile'}
            </h2>

            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                  Basic Information
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Occupation *
                    </label>
                    <input
                      type="text"
                      value={profileForm.occupation}
                      onChange={(e) => setProfileForm(prev => ({ ...prev, occupation: e.target.value }))}
                      placeholder="e.g., Web Developer, Graphic Designer"
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                      required
                    />
                    {!profileForm.occupation.trim() && (
                      <p className="text-red-500 text-xs mt-1">Occupation is required</p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Hourly Rate *
                    </label>
                    <div className="flex">
                      <input
                        type="number"
                        value={profileForm.hourlyRate}
                        onChange={(e) => setProfileForm(prev => ({ ...prev, hourlyRate: parseFloat(e.target.value) || 0 }))}
                        placeholder="50"
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                        required
                      />
                      <select
                        value={profileForm.currency}
                        onChange={(e) => setProfileForm(prev => ({ ...prev, currency: e.target.value }))}
                        className="ml-2 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
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
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Category
                </label>
                <select
                  value={profileForm.categoryId}
                  onChange={(e) => setProfileForm(prev => ({ ...prev, categoryId: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
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
                  <p className="text-xs text-gray-500 mt-1">
                    Categories are managed by admins. Please check back later.
                  </p>
                )}
              </div>

              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                  Call & Chat Rates
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Audio Call Rate (multiplier)
                    </label>
                    <input
                      type="number"
                      value={profileForm.audioCallPrice}
                      onChange={(e) => setProfileForm(prev => ({ ...prev, audioCallPrice: e.target.value }))}
                      placeholder="e.g., 12"
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white placeholder-gray-400"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Video Call Rate (multiplier)
                    </label>
                    <input
                      type="number"
                      value={profileForm.videoCallPrice}
                      onChange={(e) => setProfileForm(prev => ({ ...prev, videoCallPrice: e.target.value }))}
                      placeholder="e.g., 15"
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white placeholder-gray-400"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Chat Rate (multiplier)
                    </label>
                    <input
                      type="number"
                      value={profileForm.chatPrice}
                      onChange={(e) => setProfileForm(prev => ({ ...prev, chatPrice: e.target.value }))}
                      placeholder="e.g., 10"
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white placeholder-gray-400"
                    />
                  </div>
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                  Multipliers are applied to your hourly rate to derive session pricing for each medium.
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Experience * (Minimum 10 characters)
                </label>
                <textarea
                  value={profileForm.experience}
                  onChange={(e) => setProfileForm(prev => ({ ...prev, experience: e.target.value }))}
                  placeholder="Describe your experience, background, and what makes you unique..."
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
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
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
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
                    className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
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
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Availability
                </label>
                <select
                  value={profileForm.availability}
                  onChange={(e) => setProfileForm(prev => ({ ...prev, availability: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                >
                  <option value="Available">Available</option>
                  <option value="Busy">Busy</option>
                  <option value="Away">Away</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Working Hours
                </label>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">
                      Start Time
                    </label>
                    <input
                      type="time"
                      value={profileForm.workingHours.start}
                      onChange={(e) => setProfileForm(prev => ({ 
                        ...prev, 
                        workingHours: { ...prev.workingHours, start: e.target.value }
                      }))}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">
                      End Time
                    </label>
                    <input
                      type="time"
                      value={profileForm.workingHours.end}
                      onChange={(e) => setProfileForm(prev => ({ 
                        ...prev, 
                        workingHours: { ...prev.workingHours, end: e.target.value }
                      }))}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
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
                        className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                          isSelected
                            ? 'bg-blue-600 text-white'
                            : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
                        }`}
                      >
                        {day.slice(0, 3)}
                      </button>
                    );
                  })}
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  These help clients know which days you are generally available.
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
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
                        className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                      />
                      <select
                        value={lang.proficiency}
                        onChange={(e) => setProfileForm(prev => ({
                          ...prev,
                          languages: prev.languages.map((l, i) => 
                            i === index ? { ...l, proficiency: e.target.value } : l
                          )
                        }))}
                        className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
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
                    className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
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
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
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
                    <div key={index} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">
                            Project Title
                          </label>
                          <input
                            type="text"
                            value={item.title}
                            onChange={(e) => updatePortfolioItem(index, 'title', e.target.value)}
                            placeholder="Project title"
                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                          />
                        </div>
                        <div>
                          <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">
                            Project URL
                          </label>
                          <input
                            type="url"
                            value={item.url}
                            onChange={(e) => updatePortfolioItem(index, 'url', e.target.value)}
                            placeholder="https://example.com"
                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                          />
                        </div>
                      </div>
                      <div className="mt-3">
                        <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">
                          Description
                        </label>
                        <textarea
                          value={item.description}
                          onChange={(e) => updatePortfolioItem(index, 'description', e.target.value)}
                          placeholder="Describe your project..."
                          rows={2}
                          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
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
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                  Social Links
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Website
                    </label>
                    <input
                      type="url"
                      value={profileForm.socialLinks.website}
                      onChange={(e) => setProfileForm(prev => ({
                        ...prev,
                        socialLinks: { ...prev.socialLinks, website: e.target.value }
                      }))}
                      placeholder="https://yourwebsite.com"
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      LinkedIn
                    </label>
                    <input
                      type="url"
                      value={profileForm.socialLinks.linkedin}
                      onChange={(e) => setProfileForm(prev => ({
                        ...prev,
                        socialLinks: { ...prev.socialLinks, linkedin: e.target.value }
                      }))}
                      placeholder="https://linkedin.com/in/yourprofile"
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      GitHub
                    </label>
                    <input
                      type="url"
                      value={profileForm.socialLinks.github}
                      onChange={(e) => setProfileForm(prev => ({
                        ...prev,
                        socialLinks: { ...prev.socialLinks, github: e.target.value }
                      }))}
                      placeholder="https://github.com/yourusername"
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Behance
                    </label>
                    <input
                      type="url"
                      value={profileForm.socialLinks.behance}
                      onChange={(e) => setProfileForm(prev => ({
                        ...prev,
                        socialLinks: { ...prev.socialLinks, behance: e.target.value }
                      }))}
                      placeholder="https://behance.net/yourprofile"
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                    />
                  </div>
                </div>
              </div>

              <div className="flex justify-end space-x-4">
                <button
                  onClick={() => setActiveTab('browse')}
                  className="border border-gray-300 hover:bg-gray-50 dark:border-gray-600 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 px-6 py-3 rounded-lg font-medium transition-colors"
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

        {showBookingModal && selectedProfile && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-2 sm:p-4">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-4 sm:p-6 w-full max-w-2xl max-h-[95vh] sm:max-h-[90vh] overflow-y-auto scrollbar-hide">
              <div className="flex items-center justify-between mb-4 sm:mb-6">
                <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">
                  Book Service
                </h2>
                <button
                  onClick={() => setShowBookingModal(false)}
                  className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 text-xl sm:text-2xl"
                >
                  ✕
                </button>
              </div>

              <div className="mb-4 sm:mb-6 p-3 sm:p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <div className="flex items-center space-x-3 sm:space-x-4">
                  <img
                    src={selectedProfile.userId.avatar || '/default-avatar.svg'}
                    alt={selectedProfile.userId.name}
                    className="w-10 h-10 sm:w-12 sm:h-12 rounded-full object-cover flex-shrink-0"
                  />
                  <div className="min-w-0 flex-1">
                    <h3 className="font-semibold text-gray-900 dark:text-white text-sm sm:text-base truncate">
                      {selectedProfile.userId.name}
                    </h3>
                    <p className="text-gray-600 dark:text-gray-300 text-xs sm:text-sm truncate">
                      {selectedProfile.occupation} • {getCurrencySymbol(selectedProfile.currency)}
                      {selectedProfile.hourlyRate}/{selectedProfile.currency}/hour
                    </p>
                    {selectedProfile.category?.title && (
                      <p className="text-[11px] uppercase tracking-wide text-blue-500 font-semibold mt-1">
                        {selectedProfile.category.title}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                {/* Selected Service Display */}
                {selectedServiceType && (
                  <div className="p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                    <div className="flex items-center gap-3">
                      {selectedServiceType === 'audio_call' && (
                        <>
                          <FaPhone className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                          <div>
                            <p className="text-sm font-semibold text-blue-900 dark:text-blue-300">Audio Call Selected</p>
                            <p className="text-xs text-blue-700 dark:text-blue-400">
                              {formatAmountDisplay(selectedProfile.audioCallPrice || selectedProfile.hourlyRate, selectedProfile.currency)}{' '}
                              {selectedProfile.audioCallPrice ? 'per call' : `/${selectedProfile.currency || 'hour'}`}
                            </p>
                          </div>
                        </>
                      )}
                      {selectedServiceType === 'video_call' && (
                        <>
                          <FaVideo className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                          <div>
                            <p className="text-sm font-semibold text-blue-900 dark:text-blue-300">Video Call Selected</p>
                            <p className="text-xs text-blue-700 dark:text-blue-400">
                              {formatAmountDisplay(selectedProfile.videoCallPrice || selectedProfile.hourlyRate, selectedProfile.currency)}{' '}
                              {selectedProfile.videoCallPrice ? 'per call' : `/${selectedProfile.currency || 'hour'}`}
                            </p>
                          </div>
                        </>
                      )}
                      {selectedServiceType === 'chat' && (
                        <>
                          <FaComments className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                          <div>
                            <p className="text-sm font-semibold text-blue-900 dark:text-blue-300">Chat Selected</p>
                            <p className="text-xs text-blue-700 dark:text-blue-400">
                              {formatAmountDisplay(selectedProfile.chatPrice || selectedProfile.hourlyRate, selectedProfile.currency)} per message
                            </p>
                          </div>
                        </>
                      )}
                      {(selectedServiceType === 'consultation' || (!selectedServiceType || (selectedServiceType !== 'audio_call' && selectedServiceType !== 'video_call' && selectedServiceType !== 'chat'))) && (
                        <>
                          <FaStar className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                          <div>
                            <p className="text-sm font-semibold text-blue-900 dark:text-blue-300">Consultation Selected</p>
                            <p className="text-xs text-blue-700 dark:text-blue-400">
                              {formatAmountDisplay(selectedProfile.hourlyRate, selectedProfile.currency)}/{selectedProfile.currency || 'hour'}
                            </p>
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Service Type *
                  </label>
                  <select
                    value={bookingForm.serviceType}
                    onChange={(e) => {
                      setBookingForm(prev => ({ ...prev, serviceType: e.target.value }));
                      setSelectedServiceType(e.target.value);
                    }}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                  >
                    <option value="consultation">Consultation</option>
                    <option value="audio_call">Audio Call</option>
                    <option value="video_call">Video Call</option>
                    <option value="chat">Chat</option>
                    <option value="project">Project</option>
                    <option value="hourly">Hourly Work</option>
                    <option value="fixed_price">Fixed Price</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Title *
                  </label>
                  <input
                    type="text"
                    value={bookingForm.title}
                    onChange={(e) => setBookingForm(prev => ({ ...prev, title: e.target.value }))}
                    placeholder="Brief title for your service request"
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Description *
                  </label>
                  <textarea
                    value={bookingForm.description}
                    onChange={(e) => setBookingForm(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Describe what you need help with..."
                    rows={4}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 sm:mb-2">
                      Scheduled Date & Time *
                    </label>
                    <input
                      type="datetime-local"
                      value={bookingForm.scheduledDate}
                      onChange={(e) => setBookingForm(prev => ({ ...prev, scheduledDate: e.target.value }))}
                      min={new Date().toISOString().slice(0, 16)}
                      className="w-full px-3 py-2 text-sm sm:text-base border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                    />
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      ⏰ Select any future date and time for your meeting
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 sm:mb-2">
                      Duration (minutes) *
                    </label>
                    <input
                      type="number"
                      value={bookingForm.duration}
                      onChange={(e) => setBookingForm(prev => ({ ...prev, duration: parseInt(e.target.value) || 60 }))}
                      min="15"
                      max="480"
                      className="w-full px-3 py-2 text-sm sm:text-base border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                    />
                  </div>
                </div>

                <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
                  <h4 className="font-medium text-blue-900 dark:text-blue-100 mb-2">
                    Estimated Cost
                  </h4>
                  <p className="text-blue-800 dark:text-blue-200">
                    {estimatedCost !== null ? formatAmountDisplay(estimatedCost, selectedProfile.currency) : '—'}
                  </p>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row justify-end space-y-2 sm:space-y-0 sm:space-x-4 mt-4 sm:mt-6">
                <button
                  onClick={() => setShowBookingModal(false)}
                  className="border border-gray-300 hover:bg-gray-50 dark:border-gray-600 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 px-4 sm:px-6 py-2 rounded-lg text-sm sm:text-base font-medium transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={createBooking}
                  disabled={bookingSubmitting}
                  className={`px-4 sm:px-6 py-2 rounded-lg text-sm sm:text-base font-medium transition-colors ${
                    bookingSubmitting
                      ? 'bg-blue-300 cursor-not-allowed text-white'
                      : 'bg-blue-500 hover:bg-blue-600 text-white'
                  }`}
                >
                  {bookingSubmitting ? 'Sending...' : 'Send Booking Request'}
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
  );
}
