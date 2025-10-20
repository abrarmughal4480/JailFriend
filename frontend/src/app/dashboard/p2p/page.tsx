"use client";
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { isAuthenticated, getCurrentUserId } from '@/utils/auth';
import ToastContainer from '@/components/ToastContainer';

const API_URL = process.env.NEXT_PUBLIC_API_URL;

interface P2PProfile {
  _id: string;
  userId: {
    _id: string;
    name: string;
    username: string;
    avatar: string;
    email: string;
    bio: string;
    location: string;
  };
  occupation: string;
  hourlyRate: number;
  currency: string;
  skills: string[];
  experience: string;
  availability: string;
  workingHours: {
    start: string;
    end: string;
  };
  timezone: string;
  languages: Array<{
    language: string;
    proficiency: string;
  }>;
  portfolio: Array<{
    title: string;
    description: string;
    url: string;
    image: string;
  }>;
  certifications: Array<{
    name: string;
    issuer: string;
    date: string;
    credentialId: string;
  }>;
  rating: {
    average: number;
    count: number;
  };
  completedJobs: number;
  responseTime: string;
  isActive: boolean;
  isVerified: boolean;
  featured: boolean;
  tags: string[];
  socialLinks: {
    website: string;
    linkedin: string;
    github: string;
    behance: string;
  };
  createdAt: string;
  updatedAt: string;
}

interface Booking {
  _id: string;
  clientId: {
    _id: string;
    name: string;
    username: string;
    avatar: string;
  };
  serviceProviderId: {
    _id: string;
    name: string;
    username: string;
    avatar: string;
  };
  p2pProfileId: {
    _id: string;
    occupation: string;
    hourlyRate: number;
    currency: string;
  };
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
  skills: string[];
  experience: string;
  availability: string;
  workingHours: {
    start: string;
    end: string;
  };
  timezone: string;
  languages: Array<{
    language: string;
    proficiency: string;
  }>;
  portfolio: Array<{
    title: string;
    description: string;
    url: string;
    image: string;
  }>;
  certifications: Array<{
    name: string;
    issuer: string;
    date: string;
    credentialId: string;
  }>;
  responseTime: string;
  tags: string[];
  socialLinks: {
    website: string;
    linkedin: string;
    github: string;
    behance: string;
  };
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

interface ToastData {
  id: string;
  type: 'success' | 'error' | 'info' | 'warning';
  title: string;
  message: string;
  duration?: number;
}

export default function P2PPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'browse' | 'my-profile' | 'create' | 'bookings' | 'provider-bookings'>('browse');
  const [profiles, setProfiles] = useState<P2PProfile[]>([]);
  const [featuredProfiles, setFeaturedProfiles] = useState<P2PProfile[]>([]);
  const [myProfile, setMyProfile] = useState<P2PProfile | null>(null);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [providerBookings, setProviderBookings] = useState<Booking[]>([]);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [selectedBookingForPayment, setSelectedBookingForPayment] = useState<Booking | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState({
    occupation: '',
    minRate: '',
    maxRate: '',
    skills: ''
  });

  // Booking form state
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [selectedProfile, setSelectedProfile] = useState<P2PProfile | null>(null);
  const [bookingForm, setBookingForm] = useState<CreateBookingData>({
    serviceProviderId: '',
    p2pProfileId: '',
    serviceType: 'consultation',
    title: '',
    description: '',
    scheduledDate: '',
    duration: 60,
    requirements: [],
    deliverables: []
  });

  // Form states for creating/editing profile
  const [profileForm, setProfileForm] = useState<CreateProfileData>({
    occupation: '',
    hourlyRate: 0,
    currency: 'USD',
    skills: [],
    experience: '',
    availability: 'Available',
    workingHours: {
      start: '09:00',
      end: '17:00'
    },
    timezone: 'UTC',
    languages: [{ language: '', proficiency: 'Intermediate' }],
    portfolio: [],
    certifications: [],
    responseTime: 'Within 24 hours',
    tags: [],
    socialLinks: {
      website: '',
      linkedin: '',
      github: '',
      behance: ''
    }
  });

  const [newSkill, setNewSkill] = useState('');
  const [newTag, setNewTag] = useState('');
  const [newLanguage, setNewLanguage] = useState('');

  // Toast notifications
  const [toasts, setToasts] = useState<ToastData[]>([]);

  // Toast functions
  const addToast = (type: 'success' | 'error' | 'info' | 'warning', title: string, message: string, duration = 5000) => {
    const id = Date.now().toString();
    const newToast: ToastData = { id, type, title, message, duration };
    setToasts(prev => [...prev, newToast]);
  };

  const removeToast = (id: string) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
  };

  useEffect(() => {
    if (!isAuthenticated()) {
      router.push('/');
      return;
    }
    loadData();
  }, []);

  // Auto-refresh data every 5 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      if (isAuthenticated()) {
        // Only refresh booking data, not the entire profile data
        Promise.all([loadBookings(), loadProviderBookings()]);
      }
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      
      // Load featured profiles
      const featuredResponse = await fetch(`${API_URL}/api/p2p/profiles/featured`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (featuredResponse.ok) {
        const featuredData = await featuredResponse.json();
        setFeaturedProfiles(featuredData.profiles || []);
      }

      // Load all profiles
      await loadProfiles();

      // Load user's profile
      const myProfileResponse = await fetch(`${API_URL}/api/p2p/profile/me`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (myProfileResponse.ok) {
        const myProfileData = await myProfileResponse.json();
        setMyProfile(myProfileData.profile);
        if (myProfileData.profile) {
          setProfileForm({
            occupation: myProfileData.profile.occupation || '',
            hourlyRate: myProfileData.profile.hourlyRate || 0,
            currency: myProfileData.profile.currency || 'USD',
            skills: myProfileData.profile.skills || [],
            experience: myProfileData.profile.experience || '',
            availability: myProfileData.profile.availability || 'Available',
            workingHours: myProfileData.profile.workingHours || { start: '09:00', end: '17:00' },
            timezone: myProfileData.profile.timezone || 'UTC',
            languages: myProfileData.profile.languages || [{ language: '', proficiency: 'Intermediate' }],
            portfolio: myProfileData.profile.portfolio || [],
            certifications: myProfileData.profile.certifications || [],
            responseTime: myProfileData.profile.responseTime || 'Within 24 hours',
            tags: myProfileData.profile.tags || [],
            socialLinks: myProfileData.profile.socialLinks || {
              website: '',
              linkedin: '',
              github: '',
              behance: ''
            }
          });
        }
      }

      // Load bookings
      await loadBookings();
      await loadProviderBookings();

    } catch (error) {
      console.error('Error loading P2P data:', error);
      setError('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const loadBookings = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/api/bookings?userType=client`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setBookings(data.bookings || []);
      }
    } catch (error) {
      console.error('Error loading bookings:', error);
    }
  };

  const loadProviderBookings = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/api/bookings?userType=provider`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setProviderBookings(data.bookings || []);
      }
    } catch (error) {
      console.error('Error loading provider bookings:', error);
    }
  };

  const loadProfiles = async () => {
    try {
      const token = localStorage.getItem('token');
      const queryParams = new URLSearchParams();
      
      if (filters.occupation) queryParams.append('occupation', filters.occupation);
      if (filters.minRate) queryParams.append('minRate', filters.minRate);
      if (filters.maxRate) queryParams.append('maxRate', filters.maxRate);
      if (filters.skills) queryParams.append('skills', filters.skills);
      
      const response = await fetch(`${API_URL}/api/p2p/profiles?${queryParams}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setProfiles(data.profiles || []);
      }
    } catch (error) {
      console.error('Error loading profiles:', error);
    }
  };

  const searchProfiles = async () => {
    if (!searchQuery.trim()) return;
    
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/api/p2p/profiles/search?q=${encodeURIComponent(searchQuery)}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setProfiles(data.profiles || []);
      }
    } catch (error) {
      console.error('Error searching profiles:', error);
    }
  };

  const handleBookService = (profile: P2PProfile) => {
    setSelectedProfile(profile);
    
    // Set minimum scheduled date to 30 minutes from now
    const minDateTime = new Date(Date.now() + 30 * 60 * 1000);
    const minDateTimeString = minDateTime.toISOString().slice(0, 16);
    
    setBookingForm({
      serviceProviderId: profile.userId._id,
      p2pProfileId: profile._id,
      serviceType: 'consultation',
      title: '',
      description: '',
      scheduledDate: minDateTimeString,
      duration: 60,
      requirements: [],
      deliverables: []
    });
    setShowBookingModal(true);
  };

  const createBooking = async () => {
    if (!bookingForm.title.trim() || !bookingForm.description.trim() || !bookingForm.scheduledDate) {
      addToast('warning', 'Missing Information', 'Please fill in all required fields');
      return;
    }

    // Check if scheduled time is at least 30 minutes from now
    const scheduledDateTime = new Date(bookingForm.scheduledDate);
    const currentTime = new Date();
    const timeDifference = scheduledDateTime.getTime() - currentTime.getTime();
    const minutesDifference = timeDifference / (1000 * 60);

    if (minutesDifference < 30) {
      const currentTimeStr = currentTime.toLocaleString();
      const requiredTimeStr = new Date(currentTime.getTime() + 30 * 60 * 1000).toLocaleString();
      addToast('error', 'Scheduling Error', `Meeting must be scheduled at least 30 minutes from now.\n\nCurrent time: ${currentTimeStr}\nEarliest available: ${requiredTimeStr}`);
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/api/bookings`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(bookingForm)
      });
      
      const data = await response.json();
      
      if (response.ok) {
        setShowBookingModal(false);
        setSelectedProfile(null);
        // Update both booking lists
        await Promise.all([loadBookings(), loadProviderBookings()]);
        addToast('success', 'Booking Request Sent!', 'Your booking request has been sent successfully');
      } else {
        addToast('error', 'Booking Failed', data.message || 'Failed to create booking');
      }
    } catch (error) {
      console.error('Error creating booking:', error);
      addToast('error', 'Network Error', 'Failed to create booking. Please check your connection');
    }
  };

  const acceptBooking = async (bookingId: string) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/api/bookings/${bookingId}/accept`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.ok) {
        // Update both booking lists
        await Promise.all([loadBookings(), loadProviderBookings()]);
        addToast('success', 'Booking Accepted!', 'Booking has been accepted successfully');
      } else {
        const data = await response.json();
        addToast('error', 'Accept Failed', data.message || 'Failed to accept booking');
      }
    } catch (error) {
      console.error('Error accepting booking:', error);
      addToast('error', 'Network Error', 'Failed to accept booking. Please check your connection');
    }
  };

  const rejectBooking = async (bookingId: string) => {
    const reason = prompt('Please provide a reason for rejection:');
    if (!reason) return;

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/api/bookings/${bookingId}/reject`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ reason })
      });
      
      if (response.ok) {
        // Update both booking lists
        await Promise.all([loadBookings(), loadProviderBookings()]);
        addToast('success', 'Booking Rejected', 'Booking has been rejected successfully');
      } else {
        const data = await response.json();
        addToast('error', 'Reject Failed', data.message || 'Failed to reject booking');
      }
    } catch (error) {
      console.error('Error rejecting booking:', error);
      addToast('error', 'Network Error', 'Failed to reject booking. Please check your connection');
    }
  };

  const startVideoCall = async (bookingId: string) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/api/bookings/${bookingId}/start`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      const data = await response.json();
      
      if (response.ok) {
        // Redirect to video call page as admin (caller) in same tab
        window.location.href = `/dashboard/video-call/${data.videoCall.id}?type=admin`;
      } else {
        // Show specific error message based on response
        const errorMessage = data.message || 'Failed to start video call';
        if (errorMessage.includes('30 minutes')) {
          addToast('warning', 'Timing Issue', 'Video call can only be started within 30 minutes of the scheduled time');
        } else if (errorMessage.includes('cannot be started')) {
          addToast('warning', 'Booking Status', 'This booking cannot be started. Please check the booking status');
        } else {
          addToast('error', 'Video Call Failed', errorMessage);
        }
      }
    } catch (error) {
      console.error('Error starting video call:', error);
      addToast('error', 'Network Error', 'Failed to start video call. Please check your connection');
    }
  };

  const saveProfile = async () => {
    // Frontend validation
    if (!profileForm.occupation.trim()) {
      addToast('warning', 'Missing Information', 'Please enter your occupation');
      return;
    }

    if (!profileForm.hourlyRate || profileForm.hourlyRate <= 0) {
      addToast('warning', 'Invalid Rate', 'Please enter a valid hourly rate');
      return;
    }

    if (!profileForm.experience.trim() || profileForm.experience.trim().length < 10) {
      addToast('warning', 'Experience Required', 'Please provide a detailed experience description (at least 10 characters)');
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/api/p2p/profile`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(profileForm)
      });
      
      const data = await response.json();
      
      if (response.ok) {
        setMyProfile(data.profile);
        setActiveTab('my-profile');
        addToast('success', 'Profile Saved!', 'Your profile has been saved successfully');
      } else {
        if (data.errors && Array.isArray(data.errors)) {
          addToast('error', 'Validation Errors', data.errors.join('\n'));
        } else {
          addToast('error', 'Save Failed', data.message || 'Failed to save profile');
        }
      }
    } catch (error) {
      console.error('Error saving profile:', error);
      addToast('error', 'Network Error', 'Failed to save profile. Please check your connection');
    }
  };

  const addSkill = () => {
    if (newSkill.trim() && !profileForm.skills.includes(newSkill.trim())) {
      setProfileForm(prev => ({
        ...prev,
        skills: [...prev.skills, newSkill.trim()]
      }));
      setNewSkill('');
    }
  };

  const removeSkill = (skill: string) => {
    setProfileForm(prev => ({
      ...prev,
      skills: prev.skills.filter(s => s !== skill)
    }));
  };

  const addTag = () => {
    if (newTag.trim() && !profileForm.tags.includes(newTag.trim())) {
      setProfileForm(prev => ({
        ...prev,
        tags: [...prev.tags, newTag.trim()]
      }));
      setNewTag('');
    }
  };

  const removeTag = (tag: string) => {
    setProfileForm(prev => ({
      ...prev,
      tags: prev.tags.filter(t => t !== tag)
    }));
  };

  const addLanguage = () => {
    if (newLanguage.trim()) {
      setProfileForm(prev => ({
        ...prev,
        languages: [...prev.languages, { language: newLanguage.trim(), proficiency: 'Intermediate' }]
      }));
      setNewLanguage('');
    }
  };

  const removeLanguage = (index: number) => {
    setProfileForm(prev => ({
      ...prev,
      languages: prev.languages.filter((_, i) => i !== index)
    }));
  };

  const addPortfolioItem = () => {
    setProfileForm(prev => ({
      ...prev,
      portfolio: [...prev.portfolio, { title: '', description: '', url: '', image: '' }]
    }));
  };

  const removePortfolioItem = (index: number) => {
    setProfileForm(prev => ({
      ...prev,
      portfolio: prev.portfolio.filter((_, i) => i !== index)
    }));
  };

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
      // Simulate payment processing
      addToast('success', 'Payment Processed!', `Payment of $${selectedBookingForPayment.totalAmount} ${selectedBookingForPayment.currency} processed successfully!`);
      setShowPaymentModal(false);
      setSelectedBookingForPayment(null);
      
      // In a real app, you would call a payment API here
      // const response = await fetch(`${API_URL}/api/payments`, {
      //   method: 'POST',
      //   headers: {
      //     'Content-Type': 'application/json',
      //     'Authorization': `Bearer ${token}`
      //   },
      //   body: JSON.stringify({
      //     bookingId: selectedBookingForPayment._id,
      //     amount: selectedBookingForPayment.totalAmount,
      //     currency: selectedBookingForPayment.currency
      //   })
      // });
    } catch (error) {
      console.error('Payment error:', error);
      addToast('error', 'Payment Failed', 'Payment failed. Please try again.');
    }
  };

  const handleContact = async (profile: P2PProfile) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/api/messages/p2p-conversation`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          serviceProviderId: profile.userId._id,
          p2pProfileId: profile._id,
          source: 'p2p_browse'
        })
      });
      
      const data = await response.json();
      
      if (response.ok) {
        // Redirect to messages page with the new conversation
        router.push(`/dashboard/messages?userId=${profile.userId._id}&p2p=true`);
      } else {
        addToast('error', 'Contact Failed', data.message || 'Failed to start conversation');
      }
    } catch (error) {
      console.error('Error creating P2P conversation:', error);
      addToast('error', 'Network Error', 'Failed to start conversation. Please check your connection');
    }
  };

  const ProfileCard = ({ profile }: { profile: P2PProfile }) => {
    const handleContactClick = () => {
      handleContact(profile);
    };

    const handleViewProfile = () => {
      // You can implement a detailed profile view here
      console.log('View profile:', profile._id);
    };

    const handleBookServiceClick = () => {
      handleBookService(profile);
    };

    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4 sm:p-6 border border-gray-200 dark:border-gray-700">
        <div className="flex flex-col sm:flex-row sm:items-start space-y-3 sm:space-y-0 sm:space-x-4">
          <div className="flex items-center space-x-3 sm:flex-col sm:items-center sm:space-x-0 sm:space-y-2">
            <img
              src={profile.userId.avatar || '/default-avatar.svg'}
              alt={profile.userId.name}
              className="w-12 h-12 sm:w-16 sm:h-16 rounded-full object-cover flex-shrink-0"
            />
            <div className="sm:hidden">
              <div className="flex items-center space-x-2">
                <h3 className="text-base font-semibold text-gray-900 dark:text-white">
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
              <p className="text-gray-600 dark:text-gray-300 text-xs">
                @{profile.userId.username}
              </p>
            </div>
          </div>
          <div className="flex-1 min-w-0">
            <div className="hidden sm:block">
              <div className="flex items-center space-x-2">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  {profile.userId.name}
                </h3>
                {profile.isVerified && (
                  <span className="text-blue-500 text-sm">✓ Verified</span>
                )}
                {profile.featured && (
                  <span className="bg-yellow-100 text-yellow-800 text-xs px-2 py-1 rounded-full">
                    Featured
                  </span>
                )}
              </div>
              <p className="text-gray-600 dark:text-gray-300 text-sm">
                @{profile.userId.username}
              </p>
            </div>
            <p className="text-gray-700 dark:text-gray-200 font-medium text-sm sm:text-base">
              {profile.occupation}
            </p>
            <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-4 mt-2 space-y-1 sm:space-y-0">
              <span className="text-green-600 dark:text-green-400 font-bold text-sm sm:text-base">
                ${profile.hourlyRate}/{profile.currency}
              </span>
              <span className="text-gray-500 dark:text-gray-400 text-xs sm:text-sm">
                ⭐ {profile.rating.average.toFixed(1)} ({profile.rating.count} reviews)
              </span>
              <span className={`px-2 py-1 rounded-full text-xs w-fit ${
                profile.availability === 'Available' 
                  ? 'bg-green-100 text-green-800' 
                  : profile.availability === 'Busy'
                  ? 'bg-red-100 text-red-800'
                  : 'bg-yellow-100 text-yellow-800'
              }`}>
                {profile.availability}
              </span>
            </div>
            <div className="mt-3">
              <div className="flex flex-wrap gap-1 sm:gap-2">
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
            </div>
            <p className="text-gray-600 dark:text-gray-300 text-xs sm:text-sm mt-2 line-clamp-2">
              {profile.experience}
            </p>
            <div className="mt-4 flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2">
              <button 
                onClick={handleViewProfile}
                className="bg-gray-500 hover:bg-gray-600 text-white px-3 sm:px-4 py-2 rounded-lg text-xs sm:text-sm font-medium transition-colors"
              >
                View Profile
              </button>
              <button 
                onClick={handleContactClick}
                className="bg-blue-500 hover:bg-blue-600 text-white px-3 sm:px-4 py-2 rounded-lg text-xs sm:text-sm font-medium transition-colors"
              >
                Contact
              </button>
              {(profile.availability === 'Available' || profile.availability === 'Away') && (
                <button 
                  onClick={handleBookServiceClick}
                  className="bg-green-500 hover:bg-green-600 text-white px-3 sm:px-4 py-2 rounded-lg text-xs sm:text-sm font-medium transition-colors"
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
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">Loading P2P Services...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-8 py-4 sm:py-6 lg:py-8">
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
              <button
                onClick={() => setActiveTab('browse')}
                className={`py-2 px-2 sm:px-1 border-b-2 font-medium text-xs sm:text-sm whitespace-nowrap ${
                  activeTab === 'browse'
                    ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
                }`}
              >
                Browse Services
              </button>
              <button
                onClick={() => setActiveTab('bookings')}
                className={`py-2 px-2 sm:px-1 border-b-2 font-medium text-xs sm:text-sm whitespace-nowrap ${
                  activeTab === 'bookings'
                    ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
                }`}
              >
                My Bookings
              </button>
              <button
                onClick={() => setActiveTab('provider-bookings')}
                className={`py-2 px-2 sm:px-1 border-b-2 font-medium text-xs sm:text-sm whitespace-nowrap ${
                  activeTab === 'provider-bookings'
                    ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
                }`}
              >
                Provider Bookings
              </button>
              <button
                onClick={() => setActiveTab('create')}
                className={`py-2 px-2 sm:px-1 border-b-2 font-medium text-xs sm:text-sm whitespace-nowrap ${
                  activeTab === 'create'
                    ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
                }`}
              >
                {myProfile ? 'Edit Profile' : 'Create Profile'}
              </button>
            </nav>
          </div>
        </div>

        {/* Bookings Tab */}
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
            {/* Featured Profiles */}
            {featuredProfiles.length > 0 && (
              <div className="mb-8">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                  Featured Professionals
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                  {featuredProfiles.map((profile) => (
                    <ProfileCard key={profile._id} profile={profile} />
                  ))}
                </div>
              </div>
            )}

            {/* Search and Filters */}
            <div className="mb-6 sm:mb-8">
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4 sm:p-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 sm:mb-2">
                      Search
                    </label>
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Search by skills, occupation..."
                      className="w-full px-3 py-2 text-sm sm:text-base border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 sm:mb-2">
                      Occupation
                    </label>
                    <input
                      type="text"
                      value={filters.occupation}
                      onChange={(e) => setFilters(prev => ({ ...prev, occupation: e.target.value }))}
                      placeholder="e.g., Developer, Designer"
                      className="w-full px-3 py-2 text-sm sm:text-base border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 sm:mb-2">
                      Min Rate
                    </label>
                    <input
                      type="number"
                      value={filters.minRate}
                      onChange={(e) => setFilters(prev => ({ ...prev, minRate: e.target.value }))}
                      placeholder="0"
                      className="w-full px-3 py-2 text-sm sm:text-base border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 sm:mb-2">
                      Max Rate
                    </label>
                    <input
                      type="number"
                      value={filters.maxRate}
                      onChange={(e) => setFilters(prev => ({ ...prev, maxRate: e.target.value }))}
                      placeholder="1000"
                      className="w-full px-3 py-2 text-sm sm:text-base border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                    />
                  </div>
                </div>
                <div className="mt-4 flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-4">
                  <button
                    onClick={searchProfiles}
                    className="bg-blue-500 hover:bg-blue-600 text-white px-4 sm:px-6 py-2 rounded-lg text-sm sm:text-base font-medium transition-colors"
                  >
                    Search
                  </button>
                  <button
                    onClick={loadProfiles}
                    className="border border-gray-300 hover:bg-gray-50 dark:border-gray-600 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 px-4 sm:px-6 py-2 rounded-lg text-sm sm:text-base font-medium transition-colors"
                  >
                    Clear Filters
                  </button>
                </div>
              </div>
            </div>

            {/* All Profiles */}
            <div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                All Professionals
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                {profiles.map((profile) => (
                  <ProfileCard key={profile._id} profile={profile} />
                ))}
              </div>
              {profiles.length === 0 && (
                <div className="text-center py-12">
                  <p className="text-gray-500 dark:text-gray-400">
                    No profiles found. Try adjusting your search criteria.
                  </p>
                </div>
              )}
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

        {/* My Profile Tab */}
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

        {/* Create/Edit Profile Tab */}
        {activeTab === 'create' && (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4 sm:p-6">
            <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white mb-4 sm:mb-6">
              {myProfile ? 'Edit Profile' : 'Create P2P Profile'}
            </h2>

            <div className="space-y-6">
              {/* Basic Information */}
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
                        <option value="PKR">PKR</option>
                        <option value="EUR">EUR</option>
                        <option value="GBP">GBP</option>
                        <option value="INR">INR</option>
                      </select>
                    </div>
                    {(!profileForm.hourlyRate || profileForm.hourlyRate <= 0) && (
                      <p className="text-red-500 text-xs mt-1">Valid hourly rate is required</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Experience */}
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

              {/* Skills */}
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

              {/* Availability */}
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

              {/* Working Hours */}
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

              {/* Languages */}
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

              {/* Portfolio */}
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

              {/* Social Links */}
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

              {/* Save Button */}
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

        {/* Booking Modal */}
        {showBookingModal && selectedProfile && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-2 sm:p-4">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-4 sm:p-6 w-full max-w-2xl max-h-[95vh] sm:max-h-[90vh] overflow-y-auto">
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
                      {selectedProfile.occupation} • ${selectedProfile.hourlyRate}/{selectedProfile.currency}/hour
                    </p>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Service Type *
                  </label>
                  <select
                    value={bookingForm.serviceType}
                    onChange={(e) => setBookingForm(prev => ({ ...prev, serviceType: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                  >
                    <option value="consultation">Consultation</option>
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
                      min={new Date(Date.now() + 30 * 60 * 1000).toISOString().slice(0, 16)}
                      className="w-full px-3 py-2 text-sm sm:text-base border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                    />
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      ⏰ Meeting must be scheduled at least 30 minutes from now
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
                    ${((bookingForm.duration / 60) * selectedProfile.hourlyRate).toFixed(2)} {selectedProfile.currency}
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
                  className="bg-blue-500 hover:bg-blue-600 text-white px-4 sm:px-6 py-2 rounded-lg text-sm sm:text-base font-medium transition-colors"
                >
                  Send Booking Request
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Payment Modal */}
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

      {/* Toast Container */}
      <ToastContainer toasts={toasts} onClose={removeToast} />
    </div>
  );
}
