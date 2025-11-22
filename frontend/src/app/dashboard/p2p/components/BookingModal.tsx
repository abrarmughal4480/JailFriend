'use client';

import { useEffect, useMemo, useState } from 'react';
import { config } from '@/utils/config';
import { useDarkMode } from '@/contexts/DarkModeContext';

type CallMode = 'audio' | 'video';
type PlanCategory = 'single' | 'subscription';

interface BookingModalProps {
  open: boolean;
  onClose: () => void;
  expertName: string;
  currencySymbol: string;
  pricePerMinute: {
    audio: number;
    video: number;
  };
  initialMode: CallMode;
  availability: {
    baseDate: Date;
    startTime: string;
    endTime: string;
    timezone?: string;
    availableDays?: string[];
  };
  serviceProviderId: string;
  p2pProfileId: string;
  onBookingSuccess?: (info: BookingSuccessInfo) => void;
  onBookingError?: (message: string) => void;
}

interface BookingSuccessInfo {
  bookingId?: string;
  planSummary: string;
  scheduledDate: Date;
  totalPrice: number;
  mode: CallMode;
  timezone?: string;
}

interface ProviderBookingSlot {
  scheduledDate: string;
  duration: number;
  status: string;
}

type CouponDefinition =
  | { type: 'percentage'; value: number }
  | { type: 'fixed'; value: number };

const CALL_PLAN_MINUTES = [15, 30, 45, 60, 80, 100, 120, 150];
const SUBSCRIPTION_MINUTES = [15, 30, 45, 60, 80];

const SUBSCRIPTION_TYPES = [
  { value: '5-days', label: '5 Days', days: 5 },
  { value: '10-days', label: '10 Days', days: 10 },
  { value: '15-days', label: '15 Days', days: 15 },
  { value: '30-days', label: '30 Days', days: 30 },
];

const COUPONS: Record<string, CouponDefinition> = {
  SAVE10: { type: 'percentage', value: 10 },
  FLAT500: { type: 'fixed', value: 500 },
};

const FALLBACK_TIME_SLOTS = ['10:00', '12:00', '14:00', '16:00', '18:00'];
const TIME_SLOT_STEP_MINUTES = 30;
const TRANSLATE_RATE_PER_MINUTE = 4;

const formatCurrency = (currencySymbol: string, value: number) =>
  `${currencySymbol}${value.toLocaleString('en-IN')}`;

const formatTimeDisplay = (time: string) => {
  const [hourStr, minute] = time.split(':');
  const hour = Number(hourStr);
  const date = new Date();
  date.setHours(hour);
  date.setMinutes(Number(minute));
  return date.toLocaleTimeString('en-IN', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  });
};

const toDateInputValue = (date: Date) => date.toISOString().split('T')[0];

/**
 * Creates an ISO date string representing the given date and time in the specified timezone.
 * This function finds the UTC time that, when converted to the target timezone, equals the desired time.
 * 
 * The approach: we iteratively adjust a UTC date until, when formatted in the target timezone,
 * it matches the desired local time.
 */
const createDateInTimezone = (dateStr: string, timeStr: string, timezone: string): string => {
  const [year, month, day] = dateStr.split('-').map(Number);
  const [hours, minutes] = timeStr.split(':').map(Number);
  
  // Create a date string in ISO format (interpreted as UTC initially)
  const dateTimeStr = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}T${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:00`;
  
  // Start with a guess: create date assuming it's UTC
  // This is our initial candidate
  let candidateDate = new Date(dateTimeStr + 'Z');
  
  // Formatter to check what time our candidate represents in the target timezone
  const formatter = new Intl.DateTimeFormat('en-US', {
    timeZone: timezone,
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  });
  
  const desiredMinutes = hours * 60 + minutes;
  let attempts = 0;
  const maxAttempts = 20; // Increased for better accuracy
  
  while (attempts < maxAttempts) {
    const parts = formatter.formatToParts(candidateDate);
    const tzHour = parseInt(parts.find(p => p.type === 'hour')?.value || '0', 10);
    const tzMinute = parseInt(parts.find(p => p.type === 'minute')?.value || '0', 10);
    const actualMinutes = tzHour * 60 + tzMinute;
    const diffMinutes = desiredMinutes - actualMinutes;
    
    // If we're within 1 minute, we're close enough (accounting for rounding)
    if (Math.abs(diffMinutes) <= 1) {
      break;
    }
    
    // Adjust the candidate date by the difference
    // If the timezone shows an earlier time, we need to add time to our UTC date
    // If the timezone shows a later time, we need to subtract time from our UTC date
    candidateDate = new Date(candidateDate.getTime() + diffMinutes * 60 * 1000);
    attempts++;
  }
  
  return candidateDate.toISOString();
};

const parseTimeToMinutes = (time: string | null | undefined): number | null => {
  if (!time) return null;
  const trimmed = time.trim();
  if (!trimmed) return null;

  const dateCandidate = new Date(trimmed);
  if (!Number.isNaN(dateCandidate.getTime())) {
    return dateCandidate.getHours() * 60 + dateCandidate.getMinutes();
  }

  const meridianMatch = trimmed.match(/^(\d{1,2})(?::(\d{2}))?\s*(AM|PM)$/i);
  if (meridianMatch) {
    let hours = parseInt(meridianMatch[1], 10);
    const minutes = parseInt(meridianMatch[2] ?? '0', 10);
    const meridian = meridianMatch[3].toUpperCase();
    if (hours === 12) {
      hours = meridian === 'AM' ? 0 : 12;
    } else if (meridian === 'PM') {
      hours += 12;
    }
    return hours * 60 + minutes;
  }

  const timeMatch = trimmed.match(/^(\d{1,2})(?::(\d{2}))?$/);
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

const buildTimeSlots = (
  start: string | null,
  end: string | null,
  stepMinutes = TIME_SLOT_STEP_MINUTES
): string[] => {
  const startMinutes = parseTimeToMinutes(start);
  const endMinutes = parseTimeToMinutes(end);
  if (startMinutes === null || endMinutes === null || endMinutes <= startMinutes) {
    return [];
  }

  const slots: string[] = [];
  // Extract the minute component from the start time to preserve it for all slots
  const startMinuteComponent = startMinutes % 60;
  const startHour = Math.floor(startMinutes / 60);
  const endHour = Math.floor(endMinutes / 60);
  
  // Generate slots every hour (60 minutes) at the same minute mark
  // This gives us slots like 4:52, 5:52, 6:52, etc.
  for (let hour = startHour; hour <= endHour; hour++) {
    const slotMinutes = hour * 60 + startMinuteComponent;
    // Only include slots that are within the time range
    if (slotMinutes >= startMinutes && slotMinutes <= endMinutes) {
      slots.push(minutesToTimeString(slotMinutes));
    }
  }
  return slots;
};

export function BookingModal({
  open,
  onClose,
  expertName,
  currencySymbol,
  pricePerMinute,
  initialMode,
  availability,
  serviceProviderId,
  p2pProfileId,
  onBookingSuccess,
  onBookingError,
}: BookingModalProps) {
  const { isDarkMode } = useDarkMode();
  const [callMode, setCallMode] = useState<CallMode>('audio');
  const [planCategory, setPlanCategory] = useState<PlanCategory>('single');
  const [callMinutes, setCallMinutes] = useState<number>(CALL_PLAN_MINUTES[0]);
  const [subscriptionMinutes, setSubscriptionMinutes] = useState<number>(SUBSCRIPTION_MINUTES[0]);
  const [subscriptionType, setSubscriptionType] = useState<string>(SUBSCRIPTION_TYPES[SUBSCRIPTION_TYPES.length - 1].value);
  const [baseDate, setBaseDate] = useState<Date>(availability.baseDate);
  const [callDate, setCallDate] = useState<string>(() => toDateInputValue(availability.baseDate));
  const [callTime, setCallTime] = useState<string>(availability.startTime || FALLBACK_TIME_SLOTS[0]);
  const [translateActive, setTranslateActive] = useState<boolean>(false);
  const [couponInput, setCouponInput] = useState<string>('');
  const [appliedCoupon, setAppliedCoupon] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submissionError, setSubmissionError] = useState<string | null>(null);
  const [providerBookings, setProviderBookings] = useState<ProviderBookingSlot[]>([]);
  const [isLoadingAvailability, setIsLoadingAvailability] = useState(false);
  const [availabilityError, setAvailabilityError] = useState<string | null>(null);

  const timeOptions = useMemo(() => {
    const slots = buildTimeSlots(availability.startTime, availability.endTime);
    return slots.length ? slots : FALLBACK_TIME_SLOTS;
  }, [availability.endTime, availability.startTime]);

  useEffect(() => {
    if (!open) return;
    if (!callDate) return;
    if (!serviceProviderId) return;

    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
    if (!token) {
      setAvailabilityError('You must be logged in to view availability.');
      setProviderBookings([]);
      setIsLoadingAvailability(false);
      return;
    }

    let isMounted = true;
    setIsLoadingAvailability(true);
    setAvailabilityError(null);

    const fetchAvailability = async () => {
      try {
        const response = await fetch(
          `${config.API_URL}/api/bookings/provider/${serviceProviderId}/availability?date=${callDate}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        const data = await response.json().catch(() => ({}));
        if (!response.ok || !data.success) {
          if (!isMounted) return;
          const message = data.message || 'Unable to load availability.';
          setAvailabilityError(message);
          setProviderBookings([]);
          return;
        }

        if (!isMounted) return;
        setProviderBookings(Array.isArray(data.bookings) ? data.bookings : []);
      } catch (error) {
        if (!isMounted) return;
        setAvailabilityError('Network error while loading availability.');
        setProviderBookings([]);
      } finally {
        if (isMounted) {
          setIsLoadingAvailability(false);
        }
      }
    };

    fetchAvailability();

    return () => {
      isMounted = false;
    };
  }, [open, callDate, serviceProviderId]);

  const handlePayNow = async () => {
    if (isSubmitting) return;
    if (!callTime || !availableTimeOptions.includes(callTime)) {
      const message = 'Please select an available time.';
      setSubmissionError(message);
      onBookingError?.(message);
      return;
    }

    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
    if (!token) {
      const message = 'You must be logged in to create a booking.';
      setSubmissionError(message);
      onBookingError?.(message);
      return;
    }

    // Create the scheduled date in the provider's timezone
    const providerTimezone = availability.timezone || 'UTC';
    let scheduledDateISO: string;
    let scheduledDate: Date;
    
    try {
      scheduledDateISO = createDateInTimezone(callDate, callTime, providerTimezone);
      scheduledDate = new Date(scheduledDateISO);
      
      if (Number.isNaN(scheduledDate.getTime())) {
        const message = 'Invalid date or time selection.';
        setSubmissionError(message);
        onBookingError?.(message);
        return;
      }
    } catch (error) {
      const message = 'Invalid date or time selection.';
      setSubmissionError(message);
      onBookingError?.(message);
      return;
    }

    const planSummary =
      planCategory === 'single'
        ? `Single Call (${activeMinutes} Min)`
        : `${subscriptionDays}-Day Subscription (${activeMinutes} Min/Day)`;

    const payload = {
      serviceProviderId,
      p2pProfileId,
      serviceType: 'hourly',
      callType: callMode, // 'audio' or 'video'
      title: `Booking with ${expertName}`,
      description: `Auto-generated ${callMode === 'audio' ? 'audio' : 'video'} call booking for ${planSummary}.`,
      scheduledDate: scheduledDateISO,
      duration: activeMinutes,
      requirements: translateActive ? ['Real-time translation requested.'] : [],
      deliverables: [],
      attachments: [],
    };

    setIsSubmitting(true);
    setSubmissionError(null);

    try {
      const response = await fetch(`${config.API_URL}/api/bookings`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        const message = data.message || 'Failed to create booking. Please try again.';
        setSubmissionError(message);
        onBookingError?.(message);
        return;
      }

      onBookingSuccess?.({
        bookingId: data.booking?._id,
        planSummary,
        scheduledDate,
        totalPrice,
        mode: callMode,
        timezone: availability.timezone,
      });
      setSubmissionError(null);
      onClose();
    } catch (error) {
      const message = 'Network error while creating booking. Please try again.';
      setSubmissionError(message);
      onBookingError?.(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  useEffect(() => {
    if (open) {
      const base = availability.baseDate;
      setBaseDate(new Date(base));
      setCallDate(toDateInputValue(base));
      const preferredTime = availability.startTime;
      const initialTime = preferredTime && timeOptions.includes(preferredTime)
        ? preferredTime
        : timeOptions[0] || FALLBACK_TIME_SLOTS[0];
      setCallTime(initialTime);
      setCallMode(initialMode);
      setPlanCategory('single');
      setCallMinutes(CALL_PLAN_MINUTES[0]);
      setSubscriptionMinutes(SUBSCRIPTION_MINUTES[0]);
      setSubscriptionType(SUBSCRIPTION_TYPES[SUBSCRIPTION_TYPES.length - 1].value);
      setTranslateActive(false);
      setCouponInput('');
      setAppliedCoupon('');
      setProviderBookings([]);
      setAvailabilityError(null);
    }
  }, [availability.baseDate, availability.startTime, initialMode, open, timeOptions]);

  const dateSuggestions = useMemo(() => {
    const availableDays = availability.availableDays || [];
    const providerTimezone = availability.timezone || 'UTC';
    
    return Array.from({ length: 5 }, (_, index) => {
      const date = new Date(baseDate);
      date.setDate(baseDate.getDate() + index);
      
      // If provider has specific available days, check if this date is available
      if (availableDays.length > 0) {
        // Get the weekday name in the provider's timezone
        const weekdayName = new Intl.DateTimeFormat('en-US', {
          timeZone: providerTimezone,
          weekday: 'long'
        }).format(date);
        
        // Check if this weekday is in the available days list
        const isAvailable = availableDays.some(day => 
          day.toLowerCase() === weekdayName.toLowerCase()
        );
        
        if (!isAvailable) {
          return null;
        }
      }
      
      return {
        value: date.toISOString().split('T')[0],
        label:
          index === 0
            ? 'Today'
            : date.toLocaleDateString('en-IN', {
                weekday: 'short',
                day: 'numeric',
                month: 'short',
              }),
      };
    }).filter((item): item is { value: string; label: string } => item !== null);
  }, [baseDate, availability.availableDays, availability.timezone]);

  const subscriptionDays = useMemo(() => {
    if (planCategory === 'single') return 1;
    return SUBSCRIPTION_TYPES.find((type) => type.value === subscriptionType)?.days ?? 1;
  }, [planCategory, subscriptionType]);

  const activeMinutes = planCategory === 'single' ? callMinutes : subscriptionMinutes;

  const bookedRanges = useMemo(() => {
    if (!providerBookings.length) return [];

    // Parse the selected date string (YYYY-MM-DD) to avoid timezone issues
    const [selectedYear, selectedMonth, selectedDay] = callDate.split('-').map(Number);

    return providerBookings
      .filter((slot) => {
        // Only consider bookings on the selected date
        const bookingDate = new Date(slot.scheduledDate);
        // Compare date components directly to avoid timezone issues
        return (
          bookingDate.getFullYear() === selectedYear &&
          bookingDate.getMonth() === selectedMonth - 1 && // getMonth() is 0-indexed
          bookingDate.getDate() === selectedDay
        );
      })
      .map((slot) => {
        const start = new Date(slot.scheduledDate);
        const end = new Date(start.getTime() + slot.duration * 60000);
        return {
          startMinutes: start.getHours() * 60 + start.getMinutes(),
          endMinutes: end.getHours() * 60 + end.getMinutes(),
        };
      });
  }, [providerBookings, callDate]);

  const availableTimeOptions = useMemo(() => {
    const workingStartMinutes = parseTimeToMinutes(availability.startTime);
    const workingEndMinutes = parseTimeToMinutes(availability.endTime);
    
    if (workingStartMinutes === null || workingEndMinutes === null) {
      return timeOptions;
    }

    // Filter slots that are within working hours
    // Don't filter by duration here - we'll show all slots and disable ones that don't fit
    return timeOptions.filter((slot) => {
      const slotStart = parseTimeToMinutes(slot);
      if (slotStart === null) return false;
      
      // Check if slot start is within working hours
      if (slotStart < workingStartMinutes) return false;
      if (slotStart > workingEndMinutes) return false;

      // Check if slot overlaps with booked ranges (considering the selected duration)
      // Only filter out if there's an actual booking conflict
      if (bookedRanges.length > 0) {
        const slotEnd = slotStart + activeMinutes;
        const overlaps = bookedRanges.some((range) => {
          // Check if the slot overlaps with the booked range
          // Overlap occurs if: slotStart < range.endMinutes AND slotEnd > range.startMinutes
          // But we need to handle edge cases where they're exactly equal
          return slotStart < range.endMinutes && slotEnd > range.startMinutes;
        });
        // If there's an overlap, filter this slot out
        if (overlaps) return false;
      }
      
      return true;
    });
  }, [activeMinutes, bookedRanges, timeOptions, availability.startTime, availability.endTime]);

  useEffect(() => {
    if (!availableTimeOptions.length) {
      setCallTime('');
      return;
    }
    if (!availableTimeOptions.includes(callTime)) {
      setCallTime(availableTimeOptions[0]);
    }
  }, [availableTimeOptions, callTime]);

  const basePrice = useMemo(() => {
    const perMinute = callMode === 'audio' ? pricePerMinute.audio : pricePerMinute.video;
    return Math.round(activeMinutes * perMinute * subscriptionDays);
  }, [activeMinutes, callMode, pricePerMinute.audio, pricePerMinute.video, subscriptionDays]);

  const translateCost = useMemo(() => {
    if (!translateActive) return 0;
    return activeMinutes * subscriptionDays * TRANSLATE_RATE_PER_MINUTE;
  }, [activeMinutes, subscriptionDays, translateActive]);

  const couponDiscount = useMemo(() => {
    if (!appliedCoupon || !COUPONS[appliedCoupon]) return 0;
    const definition = COUPONS[appliedCoupon];
    const subtotal = basePrice + translateCost;
    if (definition.type === 'percentage') {
      return Math.round(subtotal * (definition.value / 100));
    }
    return Math.min(definition.value, subtotal);
  }, [appliedCoupon, basePrice, translateCost]);

  const totalPrice = Math.max(basePrice + translateCost - couponDiscount, 0);

  const translateRateLabel = useMemo(
    () => formatCurrency(currencySymbol, TRANSLATE_RATE_PER_MINUTE),
    [currencySymbol]
  );

  if (!open) return null;

  const planDescription =
    planCategory === 'single'
      ? `Single Call (${activeMinutes} Min)`
      : `${subscriptionDays}-Day Subscription (${activeMinutes} Min/Day)`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4 py-6">
      <div className={`relative max-h-[90vh] w-full max-w-[1000px] overflow-y-auto rounded-2xl border-2 shadow-2xl ${
        isDarkMode ? 'border-gray-700 bg-gray-800' : 'border-gray-200 bg-white'
      }`}>
        <button
          onClick={onClose}
          className={`absolute right-4 top-4 flex h-10 w-10 items-center justify-center rounded-full border transition ${
            isDarkMode 
              ? 'border-gray-600 text-gray-300 hover:bg-gray-700' 
              : 'border-gray-200 text-gray-500 hover:bg-gray-100'
          }`}
          aria-label="Close booking modal"
        >
          <span className="text-xl font-semibold">&times;</span>
        </button>

        <div className="flex flex-col">
          <div className={`border-b-2 px-6 py-10 ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
           

            <div className="mb-8">
              <h3 className={`text-lg font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Select mode to connect</h3>
              <div className="mt-4 flex flex-wrap gap-4">
                {(['audio', 'video'] as CallMode[]).map((mode) => (
                  <button
                    key={mode}
                    onClick={() => setCallMode(mode)}
                    className={`flex min-w-[180px] items-center gap-3 rounded-xl border-2 px-5 py-4 transition ${
                      callMode === mode
                        ? 'border-[#148F80] bg-[#148F80]/10'
                        : isDarkMode
                        ? 'border-gray-600 hover:border-[#148F80] hover:bg-[#148F80]/5'
                        : 'border-gray-200 hover:border-[#148F80] hover:bg-[#148F80]/5'
                    }`}
                  >
                    <img
                      src={
                        mode === 'audio'
                          ? 'https://application-assets-app-and-web.s3.ap-south-1.amazonaws.com/booking-audio-call.svg'
                          : 'https://application-assets-app-and-web.s3.ap-south-1.amazonaws.com/booking-video-call.svg'
                      }
                      alt={mode === 'audio' ? 'Audio Call' : 'Video Call'}
                      className="h-10 w-10"
                    />
                    <span className={`text-base font-medium ${isDarkMode ? 'text-gray-200' : 'text-gray-800'}`}>
                      {mode === 'audio' ? 'Audio Call' : 'Video Call'}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            <div className="mb-10">
              <h3 className={`text-lg font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Select date</h3>
              {availability.timezone && (
                <p className={`mt-1 text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                  Availability shown in {availability.timezone}.
                </p>
              )}
              <div className="mt-4 flex flex-wrap items-center gap-4">
                <div className="flex flex-wrap gap-3">
                  {dateSuggestions.map((suggestion) => (
                    <button
                      key={suggestion.value}
                      onClick={() => setCallDate(suggestion.value)}
                      className={`rounded-xl border-2 px-4 py-2 text-sm font-medium transition ${
                        callDate === suggestion.value
                          ? 'border-[#148F80] bg-[#148F80]/10 text-[#148F80]'
                          : isDarkMode
                          ? 'border-gray-600 text-gray-300 hover:border-[#148F80] hover:bg-[#148F80]/5'
                          : 'border-gray-200 text-gray-700 hover:border-[#148F80] hover:bg-[#148F80]/5'
                      }`}
                    >
                      {suggestion.label}
                    </button>
                  ))}
                </div>
                <input
                  type="date"
                  min={dateSuggestions[0]?.value}
                  value={callDate}
                  onChange={(event) => setCallDate(event.target.value)}
                  className={`rounded-xl border-2 px-4 py-2 text-sm focus:border-[#148F80] focus:outline-none focus:ring-2 focus:ring-[#148F80]/20 ${
                    isDarkMode 
                      ? 'border-gray-600 bg-gray-700 text-white' 
                      : 'border-gray-200'
                  }`}
                />
              </div>

              <h3 className={`mt-8 text-lg font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Select time</h3>
              <div className="mt-4 flex flex-wrap items-center gap-4">
                <div className="flex flex-wrap gap-3">
                  {availableTimeOptions.map((slot) => {
                    const slotStart = parseTimeToMinutes(slot);
                    const workingEndMinutes = parseTimeToMinutes(availability.endTime);
                    const slotEnd = slotStart !== null ? slotStart + activeMinutes : null;
                    const wouldExceedEndTime = slotEnd !== null && workingEndMinutes !== null && slotEnd > workingEndMinutes;
                    
                    return (
                      <button
                        key={slot}
                        onClick={() => setCallTime(slot)}
                        disabled={wouldExceedEndTime}
                        className={`rounded-xl border-2 px-4 py-2 text-sm font-medium transition ${
                          callTime === slot
                            ? 'border-[#148F80] bg-[#148F80]/10 text-[#148F80]'
                            : wouldExceedEndTime
                            ? 'border-gray-300 bg-gray-100 text-gray-400 cursor-not-allowed opacity-50'
                            : isDarkMode
                            ? 'border-gray-600 text-gray-300 hover:border-[#148F80] hover:bg-[#148F80]/5'
                            : 'border-gray-200 text-gray-700 hover:border-[#148F80] hover:bg-[#148F80]/5'
                        }`}
                        title={wouldExceedEndTime ? `This time slot would exceed the available end time (${formatTimeDisplay(availability.endTime)})` : ''}
                      >
                        {formatTimeDisplay(slot)}
                      </button>
                    );
                  })}
                  {isLoadingAvailability && (
                    <span className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Checking availability...</span>
                  )}
                  {!isLoadingAvailability && !availableTimeOptions.length && (
                    <span className="text-sm text-red-600">No slots available for this date. Please choose another date.</span>
                  )}
                </div>
                <input
                  type="time"
                  value={callTime}
                  min={availability.startTime}
                  max={availability.endTime}
                  step={TIME_SLOT_STEP_MINUTES * 60}
                  disabled={!availableTimeOptions.length}
                  onChange={(event) => {
                    const newTime = event.target.value;
                    // Validate that the selected time is in available options
                    if (availableTimeOptions.includes(newTime)) {
                      setCallTime(newTime);
                    } else if (availableTimeOptions.length > 0) {
                      // If invalid, set to first available option
                      setCallTime(availableTimeOptions[0]);
                    }
                  }}
                  className={`rounded-xl border-2 px-4 py-2 text-sm focus:border-[#148F80] focus:outline-none focus:ring-2 focus:ring-[#148F80]/20 ${
                    isDarkMode 
                      ? 'border-gray-600 bg-gray-700 text-white' 
                      : 'border-gray-200'
                  }`}
                />
              </div>
            </div>

            <div className="mb-10">
              <h3 className={`text-lg font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Select call plan</h3>
              <div className="mt-4 flex gap-4 overflow-x-auto pb-1">
                {CALL_PLAN_MINUTES.map((minutes) => {
                  const isActive = planCategory === 'single' && callMinutes === minutes;
                  const perMinute = callMode === 'audio' ? pricePerMinute.audio : pricePerMinute.video;
                  const price = Math.round(minutes * perMinute);
                  return (
                    <button
                      key={minutes}
                      onClick={() => {
                        setPlanCategory('single');
                        setCallMinutes(minutes);
                      }}
                      className={`flex min-w-[160px] flex-col gap-1 rounded-xl border-2 px-4 py-3 text-left text-sm transition ${
                        isActive
                          ? 'border-[#148F80] bg-[#148F80]/10 text-[#148F80]'
                          : isDarkMode
                          ? 'border-gray-600 text-gray-300 hover:border-[#148F80] hover:bg-[#148F80]/5'
                          : 'border-gray-200 text-gray-700 hover:border-[#148F80] hover:bg-[#148F80]/5'
                      }`}
                    >
                      <span className="font-semibold">{minutes} Min</span>
                      <span className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>{formatCurrency(currencySymbol, price)}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className={`mb-10 rounded-2xl border-2 p-6 ${
              isDarkMode ? 'border-gray-700 bg-gray-700/50' : 'border-gray-200 bg-gray-50'
            }`}>
              <div className="mb-4 flex items-start gap-3">
                <h3 className="flex-1 text-lg font-semibold text-[#148F80]">
                  Daily Subscription Plan
                </h3>
                <div className="group relative flex h-8 w-8 items-center justify-center rounded-full border border-[#148F80] bg-[#148F80]/10 text-sm font-semibold text-[#148F80]">
                  i
                  <div className="invisible absolute left-1/2 top-full z-10 mt-3 w-72 -translate-x-1/2 rounded-xl bg-gray-900 p-4 text-xs font-medium text-white opacity-0 transition group-hover:visible group-hover:opacity-100">
                    Arey bhai, sun na! Ye Daily Subscription Plan ekdum mast hai. Jo time aur minutes
                    tune select kiye hain, wo har din usi time pe call ke liye milega. Matlab, agar tune
                    15 min/day aur 10:00 AM select kiya, toh 5, 10, 15, ya 30 din tak har roz 10:00 AM ko
                    15 minute ke liye baat kar sakta hai. Bas date aur time set kar, aur har din apne plan
                    ke hisaab se baat kar. No tension, no confusion! Plan ke duration ke liye sab fixed hai,
                    toh tu apne hisaab se baat kar sakta hai.
                  </div>
                </div>
              </div>

              <div className="mb-6 flex flex-wrap gap-3">
                {SUBSCRIPTION_MINUTES.map((minutes) => {
                  const isActive = planCategory === 'subscription' && subscriptionMinutes === minutes;
                  const perMinute = callMode === 'audio' ? pricePerMinute.audio : pricePerMinute.video;
                  const price = Math.round(minutes * perMinute * subscriptionDays);
                  return (
                    <button
                      key={minutes}
                      onClick={() => {
                        setPlanCategory('subscription');
                        setSubscriptionMinutes(minutes);
                      }}
                      className={`rounded-xl border-2 px-4 py-3 text-sm font-semibold transition ${
                        isActive
                          ? 'border-[#148F80] bg-[#148F80]/10 text-[#148F80]'
                          : isDarkMode
                          ? 'border-gray-600 text-gray-300 hover:border-[#148F80] hover:bg-[#148F80]/5'
                          : 'border-gray-200 text-gray-700 hover:border-[#148F80] hover:bg-[#148F80]/5'
                      }`}
                    >
                      {minutes} Min/Day ({formatCurrency(currencySymbol, price)})
                    </button>
                  );
                })}
              </div>

              <h4 className={`mb-3 text-base font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Select Duration</h4>
              <div className="flex flex-wrap gap-3">
                {SUBSCRIPTION_TYPES.map((type) => {
                  const isActive = subscriptionType === type.value;
                  return (
                    <label
                      key={type.value}
                      className={`relative flex cursor-pointer items-center gap-3 rounded-xl border-2 px-5 py-3 text-base font-medium transition ${
                        isActive
                          ? isDarkMode
                          ? 'border-[#148F80] bg-gray-700 text-[#148F80] shadow-lg'
                          : 'border-[#148F80] bg-white text-[#148F80] shadow-lg'
                          : isDarkMode
                          ? 'border-gray-600 bg-gray-700 text-gray-300 hover:border-[#148F80]'
                          : 'border-gray-200 bg-white text-gray-700 hover:border-[#148F80]'
                      }`}
                    >
                      <input
                        type="radio"
                        name="subscription-type"
                        value={type.value}
                        checked={isActive}
                        onChange={() => {
                          setPlanCategory('subscription');
                          setSubscriptionType(type.value);
                        }}
                        className="absolute inset-0 cursor-pointer opacity-0"
                      />
                      {type.label}
                    </label>
                  );
                })}
              </div>
            </div>

            <div className={`rounded-2xl border-2 p-6 ${
              isDarkMode ? 'border-gray-700 bg-gray-700/50' : 'border-gray-200 bg-gray-50'
            }`}>
              <div className="flex flex-col gap-3">
                <h3 className="text-lg font-semibold text-[#148F80]">Real-Time Call Translation</h3>
                <label className={`flex items-center gap-3 text-sm font-semibold ${
                  isDarkMode ? 'text-gray-300' : 'text-gray-700'
                }`}>
                  <input
                    type="checkbox"
                    checked={translateActive}
                    onChange={(event) => setTranslateActive(event.target.checked)}
                    className="h-5 w-5 cursor-pointer accent-[#148F80]"
                  />
                  Enable Real-Time Translation ({translateRateLabel}/min)
                  <div className="group relative ml-2 flex h-6 w-6 items-center justify-center rounded-full border border-[#148F80] bg-[#148F80]/10 text-xs font-semibold text-[#148F80]">
                    i
                    <div className="invisible absolute left-1/2 top-full z-10 mt-2 w-60 -translate-x-1/2 rounded-lg bg-gray-900 p-3 text-xs font-medium text-white opacity-0 transition group-hover:visible group-hover:opacity-100">
                      Communicate effortlessly in your preferred language. Our real-time translation
                      feature ensures seamless conversations, no matter the language. Additional cost: {translateRateLabel} per minute.
                    </div>
                  </div>
                </label>
              </div>
            </div>
          </div>

          <div className={`border-t-2 px-6 py-10 ${
            isDarkMode ? 'border-gray-700 bg-gray-800/50' : 'border-gray-200 bg-gray-50'
          }`}>
            <h2 className={`text-xl font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Payment Summary</h2>
            <div className={`mt-6 space-y-4 text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
              <div className="flex items-center justify-between">
                <span>Expert</span>
                <span className={`font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{expertName}</span>
              </div>
              <div className="flex items-center justify-between">
                <span>Type</span>
                <span id="selected-mode-display" className={`font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                  {callMode === 'audio' ? 'Audio Call' : 'Video Call'}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span>Plan</span>
                <span className={`font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{planDescription}</span>
              </div>
              <div className="flex items-center justify-between">
                <span>Date</span>
                <span className={`font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                  {new Date(callDate).toLocaleDateString('en-IN', {
                    weekday: 'short',
                    day: 'numeric',
                    month: 'short',
                  })}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span>Time</span>
                <span className={`font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                  {callTime
                    ? `${formatTimeDisplay(callTime)}${availability.timezone ? ` (${availability.timezone})` : ''}`
                    : 'Select a time'}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span>Base Price</span>
                <span className={`font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{formatCurrency(currencySymbol, basePrice)}</span>
              </div>
              <div className="flex items-center justify-between">
                <span>Real-Time Translation</span>
                <span className={`font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                  {formatCurrency(currencySymbol, translateCost)}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span>Coupon Discount</span>
                <span className="font-semibold text-rose-600">
                  -{formatCurrency(currencySymbol, couponDiscount)}
                </span>
              </div>
              <div className={`flex items-center justify-between border-t pt-4 text-base font-semibold ${
                isDarkMode 
                  ? 'border-gray-700 text-white' 
                  : 'border-gray-200 text-gray-900'
              }`}>
                <span>Total</span>
                <span>{formatCurrency(currencySymbol, totalPrice)}</span>
              </div>
            </div>

            <div className={`mt-8 rounded-2xl border-2 p-5 ${
              isDarkMode ? 'border-gray-700 bg-gray-700/50' : 'border-gray-200 bg-white'
            }`}>
              <h3 className={`text-base font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Apply Coupon Code</h3>
              <div className="mt-3 flex gap-2">
                <input
                  type="text"
                  value={couponInput}
                  onChange={(event) => setCouponInput(event.target.value)}
                  placeholder="Enter coupon code"
                  className={`flex-1 rounded-xl border-2 px-4 py-2 text-sm focus:border-[#148F80] focus:outline-none focus:ring-2 focus:ring-[#148F80]/20 ${
                    isDarkMode 
                      ? 'border-gray-600 bg-gray-800 text-white placeholder-gray-400' 
                      : 'border-gray-200'
                  }`}
                />
                <button
                  onClick={() => setAppliedCoupon(couponInput.trim().toUpperCase())}
                  className="rounded-xl border-2 border-[#148F80] bg-[#148F80] px-5 py-2 text-sm font-semibold text-white transition hover:border-[#0f6e63] hover:bg-[#0f6e63]"
                >
                  Apply
                </button>
              </div>
              <div className="mt-3 flex flex-wrap gap-2">
                {Object.keys(COUPONS).map((code) => (
                  <button
                    key={code}
                    onClick={() => {
                      setCouponInput(code);
                      setAppliedCoupon(code);
                    }}
                    className={`rounded-xl border-2 px-3 py-1 text-xs font-semibold transition ${
                      appliedCoupon === code
                        ? 'border-[#148F80] bg-[#148F80]/10 text-[#148F80]'
                        : isDarkMode
                        ? 'border-gray-600 text-gray-300 hover:border-[#148F80] hover:bg-[#148F80]/5'
                        : 'border-gray-200 text-gray-700 hover:border-[#148F80] hover:bg-[#148F80]/5'
                    }`}
                  >
                    {code === 'SAVE10' ? 'SAVE10 (10% Off)' : 'FLAT500 (₹500 Off)'}
                  </button>
                ))}
              </div>
            </div>

            <button
              type="button"
              onClick={handlePayNow}
              disabled={isSubmitting || !callTime || !availableTimeOptions.length}
              className={`mt-6 w-full rounded-xl border-2 px-6 py-3 text-base font-semibold text-white transition ${
                isSubmitting || !callTime || !availableTimeOptions.length
                  ? 'cursor-not-allowed border-gray-300 bg-gray-300'
                  : 'border-[#148F80] bg-[#148F80] hover:border-[#0f6e63] hover:bg-[#0f6e63]'
              }`}
            >
              {isSubmitting ? 'Processing…' : 'Pay Now'}
            </button>
            {submissionError && (
              <p className="mt-3 text-sm text-red-600">
                {submissionError}
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default BookingModal;

