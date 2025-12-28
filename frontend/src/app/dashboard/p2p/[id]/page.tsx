"use client";
import { useEffect, useMemo, useState, useCallback } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Image from 'next/image';
import { useDarkMode } from '@/contexts/DarkModeContext';
import { config } from '@/utils/config';
import BookingModal from '../components/BookingModal';
import ToastContainer from '@/components/ToastContainer';

const DEFAULT_PLAN_MINUTES = 15;
const TIME_SLOT_STEP_MINUTES = 30;

const parsePriceValue = (value?: string | number | null): number | null => {
  if (value === null || value === undefined) return null;
  if (typeof value === 'number') return value;
  const sanitized = value.replace(/[^0-9.]/g, '');
  if (!sanitized) return null;
  const numeric = parseFloat(sanitized);
  return Number.isFinite(numeric) ? numeric : null;
};

interface P2PCategory {
  _id: string;
  title: string;
  description?: string;
  image?: string;
}

interface P2PProfile {
  _id: string;
  userId: {
    _id: string;
    name?: string;
    fullName?: string;
    username?: string;
    avatar?: string;
    bio?: string;
  };
  occupation?: string;
  currentOrganisation?: string;
  description?: string;
  areasOfExpertise?: string[];
  audioCallPrice?: string;
  videoCallPrice?: string;
  chatPrice?: string;
  hourlyRate?: number | string;
  currency?: string;
  availability?: string;
  availableDays?: string[];
  workingHours?: {
    start?: string;
    end?: string;
  };
  timezone?: string;
  linkedInLink?: string;
  instagramLink?: string;
  twitterLink?: string;
  availableFromTime?: string;
  availableToTime?: string;
  rating?: {
    average: number;
    count: number;
  };
  socialLinks?: {
    linkedin?: string;
    instagram?: string;
    twitter?: string;
    facebook?: string;
    youtube?: string;
  };
  category?: {
    _id?: string;
    title: string;
    description?: string;
    image?: string;
  };
}

const DEFAULT_TIME_RANGE = { start: '09:00', end: '17:00' };
const WEEKDAY_ORDER = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
const WORTH_EXPLORING_FALLBACK_TAGS = [
  'Entrepreneurship',
  'Marketing Leadership',
  'Sales Leadership',
  'Business Development',
  'Sales Operations',
  'Digital Marketing',
  'Software Development',
  'Design Leadership',
  'Motivation Coaching',
  'Coding',
  'Education Guidance',
  'Accounting Management',
  'Data Analysis',
  'Management',
  'Student Counseling',
  'Graphic Designing',
  'Leadership Development',
  'Study Planning',
  'Content Creation',
  'Mentoring',
];

type ToastType = 'success' | 'error' | 'info' | 'warning';

interface ToastData {
  id: string;
  type: ToastType;
  title: string;
  message: string;
  duration?: number;
}

interface ProviderBookingSlot {
  scheduledDate: string;
  duration: number;
  status: string;
}

const parseDateValue = (value?: string | null): Date | null => {
  if (!value) return null;
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
};

const timeStringToMinutes = (value?: string | null): number | null => {
  if (!value) return null;
  const trimmed = value.trim();
  if (!trimmed) return null;

  const dateCandidate = new Date(trimmed);
  if (!Number.isNaN(dateCandidate.getTime())) {
    return dateCandidate.getHours() * 60 + dateCandidate.getMinutes();
  }

  // Handle AM/PM format
  const meridianMatch = trimmed.match(/^(\d{1,2})(?::(\d{2}))?(?::(\d{2}))?\s*(AM|PM)$/i);
  if (meridianMatch) {
    let hours = parseInt(meridianMatch[1], 10);
    const minutes = parseInt(meridianMatch[2] ?? '0', 10);
    const meridian = meridianMatch[4]?.toUpperCase(); // Capture group 4 is AM/PM now 

    if (hours === 12) {
      hours = meridian === 'AM' ? 0 : 12;
    } else if (meridian === 'PM') {
      hours += 12;
    }
    return hours * 60 + minutes;
  }

  // Handle 24-hour HH:MM or HH:MM:SS format
  const timeMatch = trimmed.match(/^(\d{1,2})(?::(\d{2}))?(?::(\d{2}))?$/);
  if (!timeMatch) return null;

  const hours = parseInt(timeMatch[1], 10);
  const minutes = parseInt(timeMatch[2] ?? '0', 10);

  if (Number.isNaN(hours) || Number.isNaN(minutes)) return null;
  if (hours < 0 || hours > 23 || minutes < 0 || minutes > 59) return null;

  return hours * 60 + minutes;
};

const minutesToTimeString = (minutes: number): string => {
  const normalized = ((minutes % (24 * 60)) + 24 * 60) % (24 * 60);
  const hours = Math.floor(normalized / 60);
  const mins = normalized % 60;
  return `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`;
};

const normalizeTimeTo24h = (value?: string | null): string | null => {
  const minutes = timeStringToMinutes(value);
  if (minutes === null) return null;
  return minutesToTimeString(minutes);
};

const ensureValidTimeRange = (startInput: string, endInput: string) => {
  let startMinutes = timeStringToMinutes(startInput);
  if (startMinutes === null) {
    startMinutes = timeStringToMinutes(DEFAULT_TIME_RANGE.start) ?? 9 * 60;
  }

  let endMinutes = timeStringToMinutes(endInput);

  // Special handling: If end time is 00:00 (0 minutes), treat it as 24:00 (1440 minutes)
  // This allows ranges like "09:00 - 00:00" (9 AM to Midnight) to work correctly
  if (endMinutes === 0) {
    endMinutes = 24 * 60;
  }

  if (endMinutes === null || endMinutes <= startMinutes) {
    endMinutes = startMinutes + 60; // Ensure at least 60 mins duration
    if (endMinutes > 24 * 60) endMinutes = 24 * 60; // Cap at end of day
  }

  return {
    start: minutesToTimeString(startMinutes),
    end: minutesToTimeString(endMinutes === 1440 ? 0 : endMinutes), // Convert back to 00:00 string if needed, or keep logic using minutes elsewhere
  };
};

export default function ExpertDetailPage() {
  const router = useRouter();
  const params = useParams();
  const { isDarkMode } = useDarkMode();
  const [profile, setProfile] = useState<P2PProfile | null>(null);
  const [categories, setCategories] = useState<P2PCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'shorts' | 'services'>('shorts');
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
  const [selectedBookingMode, setSelectedBookingMode] = useState<'audio' | 'video'>('audio');
  const [toasts, setToasts] = useState<ToastData[]>([]);
  const [providerBookings, setProviderBookings] = useState<ProviderBookingSlot[]>([]);
  const [nextSlotLabel, setNextSlotLabel] = useState<string | null>(null);

  const pricePerMinute = useMemo(() => {
    const audioBase = parsePriceValue(profile?.audioCallPrice) ?? 3700;
    const videoBase = parsePriceValue(profile?.videoCallPrice) ?? 4500;
    return {
      audio: Math.max(audioBase / DEFAULT_PLAN_MINUTES, 1),
      video: Math.max(videoBase / DEFAULT_PLAN_MINUTES, 1),
    };
  }, [profile?.audioCallPrice, profile?.videoCallPrice]);

  const availabilityInfo = useMemo(() => {
    const resolvedOptions = Intl.DateTimeFormat().resolvedOptions();
    const fallbackTimezone = resolvedOptions.timeZone || 'UTC';
    const now = new Date();

    if (!profile) {
      const defaults = ensureValidTimeRange(DEFAULT_TIME_RANGE.start, DEFAULT_TIME_RANGE.end);
      return {
        baseDate: now,
        startTime: defaults.start,
        endTime: defaults.end,
        timezone: fallbackTimezone,
      };
    }

    // Prioritize workingHours for daily recurring schedules
    // availableFromTime might be a one-time start date or legacy field
    let startCandidate = null;
    let endCandidate = null;

    if (profile.workingHours?.start) {
      startCandidate = normalizeTimeTo24h(profile.workingHours.start);
    }
    if (profile.workingHours?.end) {
      endCandidate = normalizeTimeTo24h(profile.workingHours.end);
    }

    // If workingHours not found, try availableFromTime
    if (!startCandidate) {
      startCandidate = normalizeTimeTo24h(profile.availableFromTime);
    }
    if (!endCandidate) {
      endCandidate = normalizeTimeTo24h(profile.availableToTime);
    }

    // Fallback to widened default range if completely missing
    if (!startCandidate) startCandidate = '08:00';
    if (!endCandidate) endCandidate = '22:00';

    const { start, end } = ensureValidTimeRange(startCandidate, endCandidate);

    // availableFromTime might still be useful as the "Base Date" if it's a future date
    const parsedBase = parseDateValue(profile.availableFromTime);
    const baseDate = parsedBase && parsedBase.getTime() >= now.getTime() ? parsedBase : now;

    return {
      baseDate,
      startTime: start,
      endTime: end,
      timezone: profile.timezone || fallbackTimezone,
      availableDays: profile.availableDays || [],
    };
  }, [profile]);

  const availableDayLabels = useMemo(() => {
    if (profile?.availableDays?.length) {
      const seen = new Set<string>();
      return profile.availableDays
        .map((day) => {
          const trimmed = day?.trim();
          if (!trimmed) return null;
          const normalized = trimmed.toLowerCase();
          const canonical =
            WEEKDAY_ORDER.find((weekday) => weekday.toLowerCase() === normalized) ||
            trimmed.charAt(0).toUpperCase() + trimmed.slice(1).toLowerCase();
          if (seen.has(canonical)) return null;
          seen.add(canonical);
          return canonical;
        })
        .filter((value): value is string => Boolean(value));
    }
    return WEEKDAY_ORDER;
  }, [profile?.availableDays]);

  const profileId = params?.id as string;

  useEffect(() => {
    if (profileId) {
      fetchProfile();
      fetchCategories();
    }
  }, [profileId]);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      if (!token) {
        router.push('/');
        return;
      }

      const response = await fetch(`${config.API_URL}/api/p2p/profiles/${profileId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        setProfile(data.profile || data);
      } else {
        const errorData = await response.json().catch(() => ({}));
        setError(errorData.message || 'Profile not found');
      }
    } catch (err) {
      console.error('Error fetching profile:', err);
      setError('Failed to load profile');
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      const response = await fetch(`${config.API_URL}/api/p2p/categories`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        setCategories(Array.isArray(data.categories) ? data.categories : []);
      }
    } catch (error) {
      // silently fail, fallback tags will be used
    }
  };

  const addToast = (type: ToastType, title: string, message: string, duration = 5000) => {
    setToasts(prev => [...prev, { id: Date.now().toString(), type, title, message, duration }]);
  };

  const removeToast = (id: string) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
  };

  const getAvatarUrl = (url: string | null | undefined): string => {
    if (!url) return '/default-avatar.svg';
    if (url.startsWith('http://') || url.startsWith('https://')) return url;
    if (url.startsWith('/avatars/') || url.startsWith('/default-avatar')) return url;
    const cleanUrl = url.replace(/\\/g, '/').replace(/^\/+/, '');
    return `${config.API_URL}/${cleanUrl}`;
  };

  const handleBookService = (serviceType: 'audio' | 'video' | 'chat') => {
    if (!profile) return;
    if (serviceType === 'video') {
      setSelectedBookingMode('video');
    } else {
      setSelectedBookingMode('audio');
    }
    setIsBookingModalOpen(true);
  };

  useEffect(() => {
    const loadProviderAvailability = async () => {
      if (!profile) return;
      const token = localStorage.getItem('token');
      if (!token) return;

      try {
        const response = await fetch(
          `${config.API_URL}/api/bookings/provider/${profile.userId._id}/availability?date=${new Date()
            .toISOString()
            .split('T')[0]}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        const data = await response.json().catch(() => ({}));
        if (!response.ok || !data.success) {
          setProviderBookings([]);
          return;
        }

        setProviderBookings(Array.isArray(data.bookings) ? data.bookings : []);
        if (Array.isArray(data.bookings) && data.bookings.length) {
          const slot = data.bookings[0];
          const start = new Date(slot.scheduledDate);
          setNextSlotLabel(
            `${formatTime(
              `${String(start.getHours()).padStart(2, '0')}:${String(start.getMinutes()).padStart(2, '0')}`
            )} • ${start.toLocaleDateString('en-IN', {
              weekday: 'short',
              day: 'numeric',
              month: 'short',
            })}${profile.timezone ? ` (${profile.timezone})` : ''}`
          );
        } else {
          setNextSlotLabel(null);
        }
      } catch (error) {
        setProviderBookings([]);
        setNextSlotLabel(null);
      }
    };

    loadProviderAvailability();
  }, [profile]);

  const formatTime = (time: string | undefined): string => {
    if (!time) return '';
    if (time.includes('AM') || time.includes('PM')) return time;
    const [hours, minutes] = time.split(':');
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const hour12 = hour % 12 || 12;
    return `${hour12}:${minutes || '00'} ${ampm}`;
  };

  const formatStatusLabel = (status?: string) => {
    if (!status) return 'Pending';
    return status
      .split('_')
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  const getNextAvailableTime = (): string => {
    if (nextSlotLabel) return nextSlotLabel;
    const dateLabel = availabilityInfo.baseDate.toLocaleDateString('en-IN', {
      weekday: 'short',
      day: 'numeric',
      month: 'short',
    });
    const startLabel = formatTime(availabilityInfo.startTime) || formatTime(DEFAULT_TIME_RANGE.start);
    const timezoneSuffix = availabilityInfo.timezone ? ` (${availabilityInfo.timezone})` : '';
    return `${startLabel} • ${dateLabel}${timezoneSuffix}`;
  };

  const bookedRanges = useMemo(() => {
    if (!providerBookings.length) return [];

    return providerBookings.map((slot) => {
      const start = new Date(slot.scheduledDate);
      const end = new Date(start.getTime() + (slot.duration || DEFAULT_PLAN_MINUTES) * 60000);
      return {
        startMinutes: start.getHours() * 60 + start.getMinutes(),
        endMinutes: end.getHours() * 60 + end.getMinutes(),
        dateKey: start.toISOString().split('T')[0],
        status: slot.status,
        start,
        end,
      };
    });
  }, [providerBookings]);

  const getAvailableSlotsForDate = useCallback(
    (dateKey: string) => {
      const startMinutes = timeStringToMinutes(availabilityInfo.startTime);
      const endMinutes = timeStringToMinutes(availabilityInfo.endTime);

      if (
        startMinutes === null ||
        endMinutes === null ||
        startMinutes >= endMinutes
      ) {
        return [];
      }

      const bookingsForDay = bookedRanges.filter((range) => range.dateKey === dateKey);

      const now = new Date();
      const currentMinutes = now.getHours() * 60 + now.getMinutes();
      const isToday = dateKey === now.toISOString().split('T')[0];

      const slots: string[] = [];
      for (
        let current = startMinutes;
        current + DEFAULT_PLAN_MINUTES <= endMinutes;
        current += TIME_SLOT_STEP_MINUTES
      ) {
        if (isToday && current < currentMinutes) {
          continue;
        }

        const end = current + DEFAULT_PLAN_MINUTES;
        const overlaps = bookingsForDay.some((booking) => {
          const bookingStart = booking.start.getHours() * 60 + booking.start.getMinutes();
          const bookingEnd = booking.end.getHours() * 60 + booking.end.getMinutes();
          return current < bookingEnd && end > bookingStart;
        });

        if (!overlaps) {
          slots.push(minutesToTimeString(current));
        }
      }

      return slots;
    },
    [availabilityInfo.endTime, availabilityInfo.startTime, bookedRanges]
  );

  const todaysBookings = useMemo(() => {
    const todayKey = availabilityInfo.baseDate.toISOString().split('T')[0];
    return bookedRanges
      .filter((range) => range.dateKey === todayKey)
      .sort((a, b) => a.start.getTime() - b.start.getTime());
  }, [availabilityInfo.baseDate, bookedRanges]);

  const availableTimeSlots = useMemo(() => {
    const todayKey = availabilityInfo.baseDate.toISOString().split('T')[0];
    return getAvailableSlotsForDate(todayKey);
  }, [availabilityInfo.baseDate, getAvailableSlotsForDate]);

  const weeklyAvailability = useMemo(() => {
    const today = new Date();
    return availableDayLabels.slice(0, 7).map((day) => {
      const normalizedIndex = WEEKDAY_ORDER.findIndex(
        (weekday) => weekday.toLowerCase() === day.toLowerCase()
      );
      if (normalizedIndex === -1) return null;

      const reference = new Date(today);
      const currentDayIndex = reference.getDay();
      const diff = (normalizedIndex - currentDayIndex + 7) % 7;
      reference.setDate(reference.getDate() + diff);
      const dateKey = reference.toISOString().split('T')[0];

      return {
        id: `${day}-${dateKey}`,
        dayLabel: day,
        dateLabel: reference.toLocaleDateString('en-IN', {
          weekday: 'short',
          day: 'numeric',
          month: 'short',
        }),
        slots: getAvailableSlotsForDate(dateKey),
      };
    }).filter((entry): entry is {
      id: string;
      dayLabel: string;
      dateLabel: string;
      slots: string[];
    } => Boolean(entry));
  }, [availableDayLabels, getAvailableSlotsForDate]);

  const worthExploringItems = useMemo(() => {
    if (categories.length) {
      return categories
        .slice(0, 18)
        .map((category) => ({
          id: category._id,
          label: category.title,
          isSelectable: Boolean(category._id),
        }))
        .filter((item) => Boolean(item.label));
    }
    return WORTH_EXPLORING_FALLBACK_TAGS.map((label) => ({
      id: label,
      label,
      isSelectable: false,
    }));
  }, [categories]);

  const formatScheduledDateTime = (date: Date, timezone?: string) => {
    const datePart = date.toLocaleDateString('en-IN', {
      weekday: 'short',
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
    const timePart = date.toLocaleTimeString('en-IN', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });
    return `${datePart} ${timePart}${timezone ? ` (${timezone})` : ''}`;
  };

  const getCurrencySymbol = (currency?: string): string => {
    switch (currency) {
      case 'USD':
        return '$';
      case 'INR':
        return '₹';
      default:
        return '$';
    }
  };

  const formatPrice = (
    primary?: string | number | null,
    fallback?: string | number | null,
    currency?: string
  ): string => {
    const value =
      primary !== undefined && primary !== null && primary !== ''
        ? primary
        : fallback !== undefined && fallback !== null && fallback !== ''
          ? fallback
          : null;

    if (value === null) {
      return 'N/A';
    }

    if (typeof value === 'string') {
      const trimmed = value.trim();
      if (!trimmed) return 'N/A';
      const hasCurrencySymbol = /^[₹$€£₨]/.test(trimmed);
      return hasCurrencySymbol ? trimmed : `${getCurrencySymbol(currency)}${trimmed}`;
    }

    return `${getCurrencySymbol(currency)}${value}`;
  };

  if (loading) {
    return (
      <div className={`min-h-screen flex items-center justify-center ${isDarkMode ? 'bg-gray-900' : 'bg-white'}`}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className={`${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>Loading profile...</p>
        </div>
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div className={`min-h-screen flex items-center justify-center ${isDarkMode ? 'bg-gray-900' : 'bg-white'}`}>
        <div className="text-center">
          <p className={`text-xl mb-4 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>{error || 'Profile not found'}</p>
          <button
            onClick={() => router.push('/dashboard/p2p')}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Back to P2P
          </button>
        </div>
      </div>
    );
  }

  const expertName = profile.userId.fullName || profile.userId.name || 'Expert';
  const expertTitle = profile.currentOrganisation
    ? `${profile.occupation || ''} | ${profile.currentOrganisation}`.replace(/^\| | \|$/g, '').trim()
    : profile.occupation || 'Professional';
  const expertiseTags = profile.areasOfExpertise || [];
  const rating = profile.rating?.average || 5.0;
  const audioPrice = formatPrice(profile.audioCallPrice, profile.hourlyRate, profile.currency);
  const videoPrice = formatPrice(profile.videoCallPrice, profile.hourlyRate, profile.currency);
  const chatPrice = formatPrice(profile.chatPrice, null, profile.currency);

  return (
    <>
      <ToastContainer toasts={toasts} onClose={removeToast} />
      <div className={`min-h-screen ${isDarkMode ? 'bg-gray-900' : 'bg-white'} py-8 px-4`}>
        <div className="max-w-7xl mx-auto flex gap-5">
          {/* Left Side (80%) */}
          <div className="w-full lg:w-[80%]">
            {/* Profile Container */}
            <div className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-[20px] p-5 shadow-lg border ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
              {/* Header */}
              <div className="flex justify-between items-center pb-5 border-b border-gray-200 dark:border-gray-700">
                <div className="flex gap-2 mt-2 text-xl font-medium">
                  <button
                    onClick={() => router.back()}
                    className="text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white"
                  >
                    ← Back
                  </button>
                </div>
                <div className="flex gap-4 items-center">
                  <button className="cursor-pointer">
                    <svg className="w-6 h-6 text-gray-600 dark:text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                    </svg>
                  </button>
                  <button className="cursor-pointer">
                    <svg className="w-6 h-6 text-gray-600 dark:text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <circle cx="12" cy="12" r="1"></circle>
                      <circle cx="12" cy="5" r="1"></circle>
                      <circle cx="12" cy="19" r="1"></circle>
                    </svg>
                  </button>
                </div>
              </div>

              {/* Profile Section */}
              <div className="flex flex-col md:flex-row gap-5 py-5">
                <div className="w-full md:w-[25%] flex justify-center items-center">
                  <div className="relative">
                    <Image
                      src={getAvatarUrl(profile.userId.avatar)}
                      alt={expertName}
                      width={150}
                      height={150}
                      className="rounded-full border-[3px] border-[#148F80] object-cover"
                      unoptimized
                    />
                  </div>
                </div>
                <div className="w-full md:w-[75%] md:pl-5 min-w-0">
                  <h1 className={`text-2xl font-semibold mb-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                    {expertName}
                  </h1>
                  <h3 className={`text-base mb-5 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                    {expertTitle}
                  </h3>
                  {profile.category?.title && (
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-indigo-50 text-indigo-600 mb-4">
                      {profile.category.title}
                    </span>
                  )}
                  <div className="flex flex-wrap gap-2 mb-5">
                    {expertiseTags.map((tag, idx) => (
                      <div
                        key={idx}
                        className="px-3 py-1.5 rounded-[20px] bg-[rgba(20,143,128,0.1)] text-[#148F80] text-xs border border-[rgba(20,143,128,0.2)]"
                      >
                        {tag}
                      </div>
                    ))}
                  </div>
                  <p className={`text-sm mb-5 break-all overflow-hidden max-w-full ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                    {profile.description || profile.userId.bio || 'Expert professional ready to help you.'}
                  </p>
                </div>
              </div>

              {/* CTA Section */}
              <div className="flex flex-col md:flex-row gap-5 mt-5">
                <div className={`flex-1 rounded-xl p-5 text-center border ${isDarkMode ? 'bg-gray-700/50 border-gray-600' : 'bg-gray-50 border-gray-200'}`}>
                  <h3 className={`text-base mb-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Audio Call</h3>
                  <p className={`text-lg font-semibold mb-3 ${isDarkMode ? 'text-gray-200' : 'text-gray-700'}`}>
                    {audioPrice}
                  </p>
                  <button
                    onClick={() => handleBookService('audio')}
                    className="w-full py-2.5 bg-[#148F80] text-white rounded-lg text-sm font-medium hover:bg-[#0f6e63] transition-colors"
                  >
                    Book Now
                  </button>
                </div>
                <div className={`flex-1 rounded-xl p-5 text-center border ${isDarkMode ? 'bg-gray-700/50 border-gray-600' : 'bg-gray-50 border-gray-200'}`}>
                  <h3 className={`text-base mb-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Video Call</h3>
                  <p className={`text-lg font-semibold mb-3 ${isDarkMode ? 'text-gray-200' : 'text-gray-700'}`}>
                    {videoPrice}
                  </p>
                  <button
                    onClick={() => handleBookService('video')}
                    className="w-full py-2.5 bg-[#148F80] text-white rounded-lg text-sm font-medium hover:bg-[#0f6e63] transition-colors"
                  >
                    Book Now
                  </button>
                </div>
                <div className={`flex-1 rounded-xl p-5 text-center border ${isDarkMode ? 'bg-gray-700/50 border-gray-600' : 'bg-gray-50 border-gray-200'}`}>
                  <h3 className={`text-base mb-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Next available at</h3>
                  <p className={`text-sm mb-3 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                    {getNextAvailableTime()}
                  </p>
                  <button
                    onClick={() => handleBookService('audio')}
                    className="w-full py-2.5 bg-[#148F80] text-white rounded-lg text-sm font-medium hover:bg-[#0f6e63] transition-colors"
                  >
                    Book Now
                  </button>
                </div>
              </div>

              {/* Social Links */}
              <div className="flex justify-center gap-2.5 mt-5 flex-wrap">
                {profile.socialLinks && Object.entries(profile.socialLinks).map(([platformName, url]) => {
                  if (!url || !url.trim()) return null;

                  // Get icon based on platform name
                  const getIcon = () => {
                    const name = platformName.toLowerCase().trim();
                    if (name.includes('twitter') || name.includes('x.com')) {
                      return (
                        <svg className="w-5 h-5 text-gray-600 dark:text-gray-300" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M23 3a10.9 10.9 0 01-3.14 1.53 4.48 4.48 0 00-7.86 3v1A10.66 10.66 0 013 4s-4 9 5 13a11.64 11.64 0 01-7 2c9 5 20 0 20-11.5a4.5 4.5 0 00-.08-.83A7.72 7.72 0 0023 3z" />
                        </svg>
                      );
                    }
                    if (name.includes('linkedin') || name.includes('linked')) {
                      return (
                        <svg className="w-5 h-5 text-gray-600 dark:text-gray-300" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M16 8a6 6 0 016 6v7h-4v-7a2 2 0 00-2-2 2 2 0 00-2 2v7h-4v-7a6 6 0 016-6zM2 9h4v12H2z" />
                          <circle cx="4" cy="4" r="2" />
                        </svg>
                      );
                    }
                    if (name.includes('instagram') || name.includes('insta')) {
                      return (
                        <svg className="w-5 h-5 text-gray-600 dark:text-gray-300" fill="currentColor" viewBox="0 0 24 24">
                          <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
                          <path d="M16 11.37A4 4 0 1112.63 8 4 4 0 0116 11.37z" />
                          <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
                        </svg>
                      );
                    }
                    if (name.includes('facebook') || name.includes('fb')) {
                      return (
                        <svg className="w-5 h-5 text-gray-600 dark:text-gray-300" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M18 2h-3a5 5 0 00-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 011-1h3z" />
                        </svg>
                      );
                    }
                    if (name.includes('youtube') || name.includes('yt')) {
                      return (
                        <svg className="w-5 h-5 text-gray-600 dark:text-gray-300" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M22.54 6.42a2.78 2.78 0 00-1.94-2C18.88 4 12 4 12 4s-6.88 0-8.6.46a2.78 2.78 0 00-1.94 2A29 29 0 001 11.75a29 29 0 00.46 5.33A2.78 2.78 0 003.4 19c1.72.46 8.6.46 8.6.46s6.88 0 8.6-.46a2.78 2.78 0 001.94-2 29 29 0 00.46-5.25 29 29 0 00-.46-5.33z" />
                          <polygon points="9.75 15.02 15.5 11.75 9.75 8.48 9.75 15.02" />
                        </svg>
                      );
                    }
                    if (name.includes('github') || name.includes('git')) {
                      return (
                        <svg className="w-5 h-5 text-gray-600 dark:text-gray-300" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23 1.957-.545 4.059-.545 6.115 0 2.293-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
                        </svg>
                      );
                    }
                    if (name.includes('behance')) {
                      return (
                        <svg className="w-5 h-5 text-gray-600 dark:text-gray-300" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M22 7h-7v-2h7v2zm1.726 10c-.442 1.297-2.029 3-5.101 3-3.074 0-5.564-1.729-5.564-5.675 0-3.91 2.325-5.92 5.466-5.92 3.082 0 4.964 1.782 5.375 4.426.078.506.109 1.188.109 1.268h-8.027c.13 3.211 3.483 3.312 4.588 2.029h3.168zm-7.686-4.258c0-2.572-.161-3.611 2.515-3.611 2.575 0 2.486 1.044 2.486 3.611h-5.001zm-9.04 0c0 3.2.746 4.478 2.104 5.412.637.5 1.701.73 2.59.73 1.933 0 3.133-.465 3.133-2.002 0-1.021-.649-1.482-1.936-1.482h-1.849v-1.649h1.849c1.21 0 1.771-.481 1.771-1.38 0-1.356-.987-1.846-2.602-1.846-1.021 0-2.023.247-2.666.721-.609.443-1.193 1.204-1.193 2.538h-2.248zm-7.5 0c0 3.2.746 4.478 2.104 5.412.637.5 1.701.73 2.59.73 1.933 0 3.133-.465 3.133-2.002 0-1.021-.649-1.482-1.936-1.482h-1.849v-1.649h1.849c1.21 0 1.771-.481 1.771-1.38 0-1.356-.987-1.846-2.602-1.846-1.021 0-2.023.247-2.666.721-.609.443-1.193 1.204-1.193 2.538h-2.248z" />
                        </svg>
                      );
                    }
                    // Default globe icon for website or unknown platforms
                    return (
                      <svg className="w-5 h-5 text-gray-600 dark:text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
                      </svg>
                    );
                  };

                  return (
                    <a
                      key={platformName}
                      href={url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-10 h-10 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center border border-gray-200 dark:border-gray-600 hover:bg-gray-200 dark:hover:bg-gray-600"
                      title={platformName}
                    >
                      {getIcon()}
                    </a>
                  );
                })}
              </div>
            </div>

            {/* Tabs and Content */}
            <div className={`mt-5 ${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-[20px] p-5 shadow-lg border ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
              {/* Tab Buttons */}
              <div className="mb-5">
                <div className="relative inline-flex rounded-lg bg-[#161616] p-1 border border-gray-600">
                  <div
                    className={`absolute top-0 left-0 h-full w-1/2 rounded-lg bg-gradient-to-r from-[rgba(11,47,42,0.8)] to-[rgba(20,143,128,0.5)] transition-transform duration-300 ${activeTab === 'services' ? 'translate-x-full' : ''
                      }`}
                  />
                  <button
                    onClick={() => setActiveTab('shorts')}
                    className={`relative z-10 px-4 py-2 flex items-center gap-2 rounded-lg transition-colors ${activeTab === 'shorts' ? 'text-white' : 'text-gray-500'
                      }`}
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                    </svg>
                    <span className="text-sm font-medium">JFconnShorts</span>
                  </button>
                  <button
                    onClick={() => setActiveTab('services')}
                    className={`relative z-10 px-4 py-2 flex items-center gap-2 rounded-lg transition-colors ${activeTab === 'services' ? 'text-white' : 'text-gray-500'
                      }`}
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                    </svg>
                    <span className="text-sm font-medium">Services Time</span>
                  </button>
                </div>
              </div>

              {/* Content */}
              {activeTab === 'shorts' && (
                <div className="grid grid-cols-3 gap-0.5">
                  {/* Placeholder for shorts - you can fetch actual posts/videos here */}
                  <div className="relative aspect-square cursor-pointer overflow-hidden rounded-lg">
                    <div className="absolute inset-0 bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
                      <svg className="w-10 h-10 text-gray-400" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M8 5v14l11-7z" />
                      </svg>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'services' && (
                <div className="space-y-6">
                  {weeklyAvailability.length > 0 && (
                    <div>
                      <h4 className={`text-sm font-semibold mb-3 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                        Available days & slots
                      </h4>
                      <div className="space-y-3">
                        {weeklyAvailability.map((day) => (
                          <div
                            key={day.id}
                            className={`rounded-xl border px-4 py-3 ${isDarkMode ? 'border-gray-700 bg-gray-800' : 'border-gray-200 bg-gray-50'}`}
                          >
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <span className={`text-sm font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                                  {day.dayLabel}
                                </span>
                                <span className="text-[11px] uppercase tracking-wide text-[#148F80]">
                                  {day.dateLabel}
                                </span>
                              </div>
                              <span className="text-xs text-gray-500">
                                {day.slots.length ? `${day.slots.length} slot${day.slots.length > 1 ? 's' : ''}` : 'Fully booked'}
                              </span>
                            </div>
                            <div className="mt-2 flex flex-wrap gap-2">
                              {day.slots.length ? (
                                day.slots.slice(0, 8).map((slot) => (
                                  <span
                                    key={`${day.id}-${slot}`}
                                    className="px-3 py-1 rounded-full border border-[#148F80] bg-[#148F80]/10 text-sm text-[#148F80]"
                                  >
                                    {formatTime(slot)}
                                  </span>
                                ))
                              ) : (
                                <span className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                                  No open slots
                                </span>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  <div>
                    <h4 className={`text-sm font-semibold mb-3 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                      Available today
                    </h4>
                    {availableTimeSlots.length ? (
                      <div className="flex flex-wrap gap-2">
                        {availableTimeSlots.map((slot) => (
                          <span
                            key={slot}
                            className="px-3 py-1 rounded-full border border-[#148F80] bg-[#148F80]/10 text-sm text-[#148F80]"
                          >
                            {formatTime(slot)}
                          </span>
                        ))}
                      </div>
                    ) : (
                      <div className={`rounded-xl border px-4 py-5 text-sm ${isDarkMode ? 'border-gray-700 bg-gray-800 text-gray-300' : 'border-gray-200 bg-gray-50 text-gray-600'}`}>
                        All slots are currently booked. Next available: <span className="font-medium text-[#148F80]">{getNextAvailableTime()}</span>
                      </div>
                    )}
                  </div>

                  <div className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                    Working hours:{' '}
                    <span className="font-medium text-[#148F80]">
                      {formatTime(availabilityInfo.startTime) || formatTime(DEFAULT_TIME_RANGE.start)} -{' '}
                      {formatTime(availabilityInfo.endTime) || formatTime(DEFAULT_TIME_RANGE.end)}
                    </span>
                    {availabilityInfo.timezone && (
                      <span className="ml-1 text-xs align-middle text-gray-500">
                        ({availabilityInfo.timezone})
                      </span>
                    )}
                  </div>

                  {todaysBookings.length > 0 && (
                    <div>
                      <h4 className={`text-sm font-semibold mb-3 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                        Booked today
                      </h4>
                      <div className="space-y-2">
                        {todaysBookings.map((slot, index) => (
                          <div
                            key={`${slot.start.toISOString()}-${index}`}
                            className={`flex items-center justify-between rounded-lg border px-4 py-2 text-sm ${isDarkMode ? 'border-gray-700 bg-gray-800 text-gray-300' : 'border-gray-200 bg-gray-50 text-gray-600'}`}
                          >
                            <span>
                              {formatTime(`${String(slot.start.getHours()).padStart(2, '0')}:${String(slot.start.getMinutes()).padStart(2, '0')}`)} -{' '}
                              {formatTime(`${String(slot.end.getHours()).padStart(2, '0')}:${String(slot.end.getMinutes()).padStart(2, '0')}`)}
                            </span>
                            <span className="text-xs font-semibold text-[#148F80]">
                              {formatStatusLabel(slot.status)}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Right Sidebar (20%) */}
          <div className="hidden lg:block w-[20%] space-y-5">
            {/* Popular Experts Card */}
            <div className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-[20px] p-5 shadow-lg border ${isDarkMode ? 'border-gray-700' : 'border-gray-200'} text-center`}>
              <div className="flex justify-between items-center mb-5">
                <h3 className={`text-base font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Popular Experts</h3>
                <button
                  onClick={() => router.push('/dashboard/p2p')}
                  className="flex items-center gap-2 text-sm text-[#148F80] hover:underline"
                >
                  <span>View All</span>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              </div>
              <div className="relative mx-auto mb-4 w-[100px] h-[100px]">
                <Image
                  src={getAvatarUrl(profile.userId.avatar)}
                  alt={expertName}
                  width={100}
                  height={100}
                  className="rounded-full border-[3px] border-gray-200 dark:border-gray-600 object-cover"
                  unoptimized
                />
                <div className="absolute -bottom-2.5 left-1/2 transform -translate-x-1/2 bg-[#148F80] px-3 py-1.5 rounded-[20px] flex items-center gap-1.5 shadow-lg">
                  <svg className="w-3.5 h-3.5 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                  <span className="text-xs font-semibold text-white">{rating.toFixed(1)}</span>
                </div>
              </div>
              <h1 className={`text-2xl font-bold mb-2 truncate ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                {expertName}
              </h1>
              <p className={`text-sm mb-4 line-clamp-2 break-all overflow-hidden max-w-full ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                {profile.description || profile.userId.bio || expertTitle || 'Expert professional'}
              </p>
              <div className="flex flex-wrap gap-2 justify-center mb-6">
                {expertiseTags.slice(0, 5).map((tag, idx) => (
                  <div
                    key={idx}
                    className={`px-3 py-1.5 rounded-[20px] text-xs ${isDarkMode ? 'bg-gray-700 text-gray-200' : 'bg-gray-100 text-gray-700'} hover:bg-[#148F80] hover:text-white transition-colors cursor-pointer`}
                  >
                    {tag}
                  </div>
                ))}
                {expertiseTags.length > 5 && (
                  <div className={`px-3 py-1.5 rounded-[20px] text-xs ${isDarkMode ? 'bg-gray-700 text-gray-200' : 'bg-gray-100 text-gray-700'}`}>
                    +{expertiseTags.length - 5} more
                  </div>
                )}
              </div>
              <div className="flex justify-center gap-2">
                <a
                  href="#"
                  className="flex items-center gap-1 px-1.5 py-1 bg-gradient-to-br from-[#148F80] to-[#30C7B5] rounded-xl text-white transition-transform hover:-translate-y-1 shadow-lg"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                  </svg>
                  <span className="text-xs font-medium">{audioPrice}</span>
                </a>
                <a
                  href="#"
                  className="flex items-center gap-1 px-1.5 py-1 bg-gradient-to-br from-[#148F80] to-[#30C7B5] rounded-xl text-white transition-transform hover:-translate-y-1 shadow-lg"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                  </svg>
                  <span className="text-xs font-medium">{videoPrice}</span>
                </a>
                <a
                  href="#"
                  className="flex  items-center gap-1 px-1.5 py-1 bg-gradient-to-br from-[#148F80] to-[#30C7B5] rounded-xl text-white transition-transform hover:-translate-y-1 shadow-lg"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                  </svg>
                  <span className="text-xs font-medium">{chatPrice}</span>
                </a>
              </div>
            </div>

            {/* Worth Exploring */}
            <div className={`relative ${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-[20px] p-5 shadow-lg border ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
              <div className="absolute inset-0 bg-gradient-radial from-[rgba(17,214,190,0.15)] to-[rgba(10,7,11,0.15)] blur-[40px] -z-10 rounded-[20px]"></div>
              <h3 className={`text-base font-semibold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Worth Exploring</h3>
              <div className="flex flex-wrap gap-2">
                {worthExploringItems.map((item) => {
                  const key = item.id || item.label;
                  return (
                    <button
                      key={key}
                      type="button"
                      disabled={!item.isSelectable}
                      onClick={() => item.isSelectable && item.id && router.push(`/dashboard/p2p/category/${item.id}`)}
                      className={`px-[18px] py-2 border border-[#148F80] rounded-full text-sm font-medium capitalize transition-colors ${item.isSelectable
                        ? 'bg-[rgba(20,143,128,0.1)] text-[#148F80] hover:bg-[#148F80] hover:text-white cursor-pointer'
                        : 'bg-transparent text-gray-500 cursor-not-allowed opacity-75'
                        }`}
                    >
                      {item.label}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>
      <BookingModal
        open={isBookingModalOpen}
        onClose={() => setIsBookingModalOpen(false)}
        expertName={expertName}
        currencySymbol={getCurrencySymbol(profile.currency)}
        pricePerMinute={pricePerMinute}
        initialMode={selectedBookingMode}
        availability={availabilityInfo}
        serviceProviderId={profile.userId._id}
        p2pProfileId={profile._id}
        onBookingSuccess={(info) => {
          addToast(
            'success',
            'Booking Request Sent',
            `Your ${info.planSummary} is scheduled for ${formatScheduledDateTime(
              info.scheduledDate,
              info.timezone
            )}.`
          );
        }}
        onBookingError={(message) => addToast('error', 'Booking Failed', message)}
      />
    </>
  );
}

