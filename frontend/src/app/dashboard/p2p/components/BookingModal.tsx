'use client';

import { useEffect, useMemo, useState } from 'react';
import { config } from '@/utils/config';
import { useDarkMode } from '@/contexts/DarkModeContext';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js';

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

const toDateInputValue = (date: Date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

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
  let endMinutes = parseTimeToMinutes(end);

  // Handle case where range ends at midnight (00:00 which parses to 0)
  if (endMinutes === 0 && startMinutes !== null && startMinutes > 0) {
    endMinutes = 24 * 60; // Treat as 24:00
  }

  if (startMinutes === null || endMinutes === null || endMinutes <= startMinutes) {
    return [];
  }

  const slots: string[] = [];
  for (let mins = startMinutes; mins <= endMinutes; mins += stepMinutes) {
    // Only add if it's strictly less than end time OR if we want to include the end time?
    // Typically booking slots are start times.
    // If working hours are 9-5, last slot is usually 4:30 or 5:00 depending on duration.
    // Here we just list available start times.
    // We usually don't list the exact end time as a start time if duration > 0.
    // But let's follow existing logic which seems to include it, or maybe strict inequality is better?
    // Validating against previous logic: `mins <= endMinutes` was used.
    // If range is 00:00 to 24:00. 24:00 (00:00) would be included.
    slots.push(minutesToTimeString(mins));
  }
  return slots;
};

function BookingFormInner({
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
  const stripe = useStripe();
  const elements = useElements();
  const [callMode, setCallMode] = useState<CallMode>('audio');
  const [planCategory, setPlanCategory] = useState<PlanCategory>('single');
  const [paymentMethod, setPaymentMethod] = useState<'wallet' | 'card'>('wallet');
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
  const [isSubscriptionExpanded, setIsSubscriptionExpanded] = useState(false);
  const [websiteCoupons, setWebsiteCoupons] = useState<Record<string, CouponDefinition>>(COUPONS);
  const [translateRate, setTranslateRate] = useState(4);
  const [translateRateLabel, setTranslateRateLabel] = useState('₹4');

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

  useEffect(() => {
    if (!open) return;

    const fetchWebsiteSettings = async () => {
      try {
        const response = await fetch(`${config.API_URL}/api/website-settings/mode`);
        if (response.ok) {
          const data = await response.json();
          // Assuming the public endpoint or similar gives these. 
          // If not, we might need a separate call or update the public endpoint.
          // For now, let's try to get them from /api/website-settings if admin, 
          // but usually these should be public or available.
        }

        // Alternative: fetch from a more appropriate public settings endpoint if it exists
        const settingsResponse = await fetch(`${config.API_URL}/api/website-settings`);
        const settingsData = await settingsResponse.json();
        if (settingsResponse.ok && settingsData.data && settingsData.data.ai) {
          const ai = settingsData.data.ai;
          if (ai.coupons && Array.isArray(ai.coupons)) {
            const mappedCoupons: Record<string, CouponDefinition> = {};
            ai.coupons.forEach((c: any) => {
              mappedCoupons[c.code] = { type: c.type, value: c.value };
            });
            setWebsiteCoupons(mappedCoupons);
          }
          if (ai.creditSystem && ai.creditSystem.translation) {
            setTranslateRate(ai.creditSystem.translation.price || 4);
            setTranslateRateLabel(`${currencySymbol}${ai.creditSystem.translation.price || 4}`);
          }
        }
      } catch (err) {
        console.error('Failed to fetch website settings', err);
      }
    };

    fetchWebsiteSettings();
  }, [open, currencySymbol]);
  const handlePayNow = async () => {
    if (isSubmitting) return;

    // Validate time selection
    const selectedMinutes = parseTimeToMinutes(callTime);
    const workingStartMinutes = parseTimeToMinutes(availability.startTime);
    let workingEndMinutes = parseTimeToMinutes(availability.endTime);
    if (workingEndMinutes === 0) workingEndMinutes = 24 * 60;

    let isValidTime = false;
    let timeErrorMessage = 'Please select an available time.';

    if (selectedMinutes !== null && workingStartMinutes !== null && workingEndMinutes !== null) {
      if (selectedMinutes >= workingStartMinutes && selectedMinutes <= workingEndMinutes) {
        // Check for overlaps with booked ranges
        const slotStart = selectedMinutes;
        const slotEnd = selectedMinutes + activeMinutes;
        const overlaps = bookedRanges.some((range) => {
          return slotStart < range.endMinutes && slotEnd > range.startMinutes;
        });

        if (!overlaps) {
          isValidTime = true;
        } else {
          timeErrorMessage = 'Selected time overlaps with an existing booking.';
        }
      } else {
        timeErrorMessage = 'Selected time is outside working hours.';
      }
    }

    if (!callTime || !isValidTime) {
      setSubmissionError(timeErrorMessage);
      onBookingError?.(timeErrorMessage);
      return;
    }

    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
    if (!token) {
      const message = 'You must be logged in to create a booking.';
      setSubmissionError(message);
      onBookingError?.(message);
      return;
    }

    if (paymentMethod === 'card') {
      if (!stripe || !elements) {
        setSubmissionError("Stripe is not loaded yet.");
        return;
      }
      const cardElement = elements.getElement(CardElement);
      if (!cardElement) {
        setSubmissionError("Please enter card details.");
        return;
      }
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
      hasRealtimeTranslation: translateActive,
      discountCode: appliedCoupon || null,
      paymentMethod: paymentMethod
    };

    setIsSubmitting(true);
    setSubmissionError(null);

    try {
      // 1. Create Booking (and Payment Intent if Card)
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
        setIsSubmitting(false); // Only unset if error
        return;
      }

      // 2. Handle Stripe Confirmation if Card
      if (paymentMethod === 'card' && data.clientSecret) {
        if (!stripe || !elements) return; // Should allow check earlier
        const cardElement = elements.getElement(CardElement);
        if (!cardElement) return;

        const result = await stripe.confirmCardPayment(data.clientSecret, {
          payment_method: {
            card: cardElement,
            billing_details: {
              name: 'Client Name' // ideally fetch from user profile
            }
          }
        });

        if (result.error) {
          setSubmissionError(result.error.message || 'Payment failed');
          setIsSubmitting(false);
          return;
        }

        if (result.paymentIntent?.status === 'succeeded') {
          // 3. Confirm to Backend
          const confirmRes = await fetch(`${config.API_URL}/api/bookings/${data.bookingId}/confirm-payment`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({ paymentIntentId: result.paymentIntent.id })
          });

          if (!confirmRes.ok) {
            const confirmData = await confirmRes.json();
            setSubmissionError(confirmData.message || 'Payment confirmed but booking update failed. Contact support.');
            setIsSubmitting(false);
            return;
          }

          // Success
          onBookingSuccess?.({
            bookingId: data.bookingId,
            planSummary,
            scheduledDate,
            totalPrice,
            mode: callMode,
            timezone: availability.timezone,
          });
          onClose();
        }
      } else {
        // Wallet success
        onBookingSuccess?.({
          bookingId: data.booking?._id,
          planSummary,
          scheduledDate,
          totalPrice,
          mode: callMode,
          timezone: availability.timezone,
        });
        onClose();
      }

    } catch (error) {
      console.error(error);
      const message = 'Network error while creating booking. Please try again.';
      setSubmissionError(message);
      onBookingError?.(message);
      setIsSubmitting(false); // Ensure reset on error
    } finally {
      if (paymentMethod !== 'card' || submissionError) {
        setIsSubmitting(false);
      }
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
      setIsSubscriptionExpanded(false);
      setIsSubmitting(false);
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
        value: toDateInputValue(date),
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
        // Use UTC components because backend query and scheduledDate storage are UTC-based
        const bookingDate = new Date(slot.scheduledDate);
        return (
          bookingDate.getUTCFullYear() === selectedYear &&
          bookingDate.getUTCMonth() === selectedMonth - 1 &&
          bookingDate.getUTCDate() === selectedDay
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
    let workingEndMinutes = parseTimeToMinutes(availability.endTime);

    // Treat 00:00 (0 minutes) as 24:00 (1440 minutes) if it is the end time
    // This supports ranges ending at midnight (e.g. 09:00 AM - 12:00 AM)
    if (workingEndMinutes === 0) {
      workingEndMinutes = 24 * 60;
    }

    if (workingStartMinutes === null || workingEndMinutes === null) {
      return timeOptions;
    }

    // Determine timezone to use for "current time" check
    // Default to local timezone if not specified
    const timezone = availability.timezone || Intl.DateTimeFormat().resolvedOptions().timeZone;

    // Get current time in that timezone
    const now = new Date();
    const formatter = new Intl.DateTimeFormat('en-US', {
      timeZone: timezone,
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      hour12: false
    });

    const parts = formatter.formatToParts(now);
    const getPart = (type: string) => parts.find(p => p.type === type)?.value;

    const pYear = getPart('year');
    const pMonth = getPart('month');
    const pDay = getPart('day');
    // Ensure YYYY-MM-DD format matches toDateInputValue
    const providerDateStr = `${pYear}-${pMonth}-${pDay}`;

    const pHour = parseInt(getPart('hour') || '0', 10);
    const pMinute = parseInt(getPart('minute') || '0', 10);
    const currentMinutes = pHour * 60 + pMinute;

    // Check if the selected callDate matches the provider's current date
    const isToday = callDate === providerDateStr;

    // Filter slots that are within working hours
    // Don't filter by duration here - we'll show all slots and disable ones that don't fit
    return timeOptions.filter((slot) => {
      const slotStart = parseTimeToMinutes(slot);
      if (slotStart === null) return false;

      // Check if slot start is within working hours
      if (slotStart < workingStartMinutes) return false;
      if (slotStart > workingEndMinutes) return false;

      // Filter passed time slots ONLY if we are looking at "Today" in provider's timezone
      if (isToday && slotStart < currentMinutes) return false;

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
  }, [activeMinutes, bookedRanges, timeOptions, availability.startTime, availability.endTime, callDate, availability.timezone]);

  useEffect(() => {
    if (!availableTimeOptions.length) {
      setCallTime('');
      return;
    }
    // Only set default if no time is selected yet, or if previous selection was cleared
    if (!callTime) {
      setCallTime(availableTimeOptions[0]);
    }
  }, [availableTimeOptions]);

  const basePrice = useMemo(() => {
    const perMinute = callMode === 'audio' ? pricePerMinute.audio : pricePerMinute.video;
    return Math.round(activeMinutes * perMinute * subscriptionDays);
  }, [activeMinutes, callMode, pricePerMinute.audio, pricePerMinute.video, subscriptionDays]);

  const translateCost = useMemo(() => {
    if (!translateActive) return 0;
    return activeMinutes * translateRate * subscriptionDays;
  }, [translateActive, activeMinutes, translateRate, subscriptionDays]);

  const couponDiscount = useMemo(() => {
    if (!appliedCoupon || !websiteCoupons[appliedCoupon]) return 0;
    const definition = websiteCoupons[appliedCoupon];
    const subtotal = basePrice + translateCost;
    if (definition.type === 'percentage') {
      return Math.round(subtotal * (definition.value / 100));
    }
    return Math.min(definition.value, subtotal);
  }, [appliedCoupon, basePrice, translateCost, websiteCoupons]);

  const totalPrice = Math.max(basePrice + translateCost - couponDiscount, 0);

  if (!open) return null;

  const planDescription =
    planCategory === 'single'
      ? `Single Call (${activeMinutes} Min)`
      : `${subscriptionDays}-Day Subscription (${activeMinutes} Min/Day)`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4 py-6">
      <div className={`relative max-h-[90vh] w-full max-w-[1000px] overflow-y-auto rounded-2xl border-2 shadow-2xl ${isDarkMode ? 'border-gray-700 bg-gray-800' : 'border-gray-200 bg-white'
        }`}>
        <button
          onClick={onClose}
          className={`absolute right-4 top-4 flex h-10 w-10 items-center justify-center rounded-full border transition ${isDarkMode
            ? 'border-gray-600 text-gray-300 hover:bg-gray-700'
            : 'border-gray-200 text-gray-500 hover:bg-gray-100'
            }`}
          aria-label="Close booking modal"
        >
          <span className="text-xl font-semibold">&times;</span>
        </button>

        <div className="flex flex-col">
          <div className={`border-b-2 px-6 py-10 ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>


            {/* <div className="mb-8">
              <h3 className={`text-lg font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Select mode to connect</h3>
              <div className="mt-4 flex flex-wrap gap-4">
                {(['audio', 'video'] as CallMode[]).map((mode) => (
                  <button
                    key={mode}
                    onClick={() => setCallMode(mode)}
                    className={`flex min-w-[180px] items-center gap-3 rounded-xl border-2 px-5 py-4 transition ${callMode === mode
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
            </div> */}

            <div className="mb-10">
              <h3 className={`text-lg font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Select date</h3>
              <p className={`mt-1 text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                Times shown in your local time ({Intl.DateTimeFormat().resolvedOptions().timeZone}).
              </p>
              <div className="mt-4 flex flex-wrap items-center gap-4">
                <div className="flex flex-wrap gap-3">
                  {dateSuggestions.map((suggestion) => (
                    <button
                      key={suggestion.value}
                      onClick={() => setCallDate(suggestion.value)}
                      className={`rounded-xl border-2 px-4 py-2 text-sm font-medium transition ${callDate === suggestion.value
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
                  className={`rounded-xl border-2 px-4 py-2 text-sm focus:border-[#148F80] focus:outline-none focus:ring-2 focus:ring-[#148F80]/20 ${isDarkMode
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
                    let workingEndMinutes = parseTimeToMinutes(availability.endTime);
                    if (workingEndMinutes === 0) workingEndMinutes = 24 * 60;

                    const slotEnd = slotStart !== null ? slotStart + activeMinutes : null;
                    const wouldExceedEndTime = slotEnd !== null && workingEndMinutes !== null && slotEnd > workingEndMinutes;

                    // Convert provider slot time to user local time for display
                    const providerTimezone = availability.timezone || 'UTC';
                    const userTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone;

                    let displayLabel = formatTimeDisplay(slot); // Default fallback

                    try {
                      // Construct the full provider date-time
                      const pDate = new Date(createDateInTimezone(callDate, slot, providerTimezone));
                      // Format to user's local time
                      displayLabel = pDate.toLocaleTimeString(undefined, {
                        hour: 'numeric',
                        minute: '2-digit',
                        hour12: true
                      });
                    } catch (e) {
                      // If conversion fails, fallback to slot string
                    }

                    return (
                      <button
                        key={slot}
                        onClick={() => setCallTime(slot)}
                        disabled={wouldExceedEndTime}
                        className={`rounded-xl border-2 px-4 py-2 text-sm font-medium transition ${callTime === slot
                          ? 'border-[#148F80] bg-[#148F80]/10 text-[#148F80]'
                          : wouldExceedEndTime
                            ? 'border-gray-300 bg-gray-100 text-gray-400 cursor-not-allowed opacity-50'
                            : isDarkMode
                              ? 'border-gray-600 text-gray-300 hover:border-[#148F80] hover:bg-[#148F80]/5'
                              : 'border-gray-200 text-gray-700 hover:border-[#148F80] hover:bg-[#148F80]/5'
                          }`}
                        title={wouldExceedEndTime ? `This time slot would exceed the available end time` : ''}
                      >
                        {displayLabel}
                      </button>
                    );
                  })}
                  {isLoadingAvailability && (
                    <span className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Checking availability...</span>
                  )}
                  {!isLoadingAvailability && !availableTimeOptions.length && (
                    <span className="text-sm text-red-600">No slots available for this date. (Slots may be booked or past working hours). Please choose another date.</span>
                  )}
                </div>
                {/* Time Input in Local Time */}
                {(() => {
                  // Calculate local time for input value
                  const providerTimezone = availability.timezone || 'UTC';
                  let localInputValue = '';
                  try {
                    const pDate = new Date(createDateInTimezone(callDate, callTime, providerTimezone));
                    // Input type="time" needs HH:mm in 24h format
                    localInputValue = pDate.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });
                  } catch (e) {
                    localInputValue = callTime;
                  }

                  return (
                    <input
                      type="time"
                      value={localInputValue}
                      // min/max also need conversion ideally, but for now we skip strict html validation on input
                      step={300}
                      onChange={(event) => {
                        const newLocalTime = event.target.value; // HH:mm (Local)
                        if (!newLocalTime) return;

                        // Convert Local Time back to Provider Time (callTime)
                        // We assume date is 'Today' relative to the user selection
                        // This is a bit non-trivial: Local Date + Local Time -> Provider Time
                        // We approximate by: create a Date object with [CallDate components] + [Local Time components] ?? 
                        // Actually, 'callDate' is already potentially shifted.

                        // Better approach: Get the currently rendered 'base' date object in local time
                        // We know 'pDate' (Above) represents the current selected moment.
                        // We update its hours/minutes.
                        try {
                          const currentPDate = new Date(createDateInTimezone(callDate, callTime, providerTimezone));
                          const [h, m] = newLocalTime.split(':').map(Number);
                          currentPDate.setHours(h);
                          currentPDate.setMinutes(m);

                          // Now currentPDate represents the Desired Moment.
                          // We need to express this in Provider Timezone to get HH:mm string
                          const providerFormatter = new Intl.DateTimeFormat('en-GB', {
                            timeZone: providerTimezone,
                            hour: '2-digit',
                            minute: '2-digit',
                          });
                          const parts = providerFormatter.formatToParts(currentPDate);
                          // formatToParts might behave differently, simple lookup
                          // 'en-GB' forces 24h usually, but verifying... 
                          // Actually, simple toLocaleString with 'en-GB' and options works well
                          const pTimeStr = currentPDate.toLocaleTimeString('en-GB', {
                            timeZone: providerTimezone,
                            hour: '2-digit',
                            minute: '2-digit'
                          }); // Returns "HH:mm"
                          setCallTime(pTimeStr);

                        } catch (err) {
                          // Fallback
                          setCallTime(newLocalTime);
                        }
                      }}
                      className={`rounded-xl border-2 px-4 py-2 text-sm focus:border-[#148F80] focus:outline-none focus:ring-2 focus:ring-[#148F80]/20 ${isDarkMode
                        ? 'border-gray-600 bg-gray-700 text-white'
                        : 'border-gray-200'
                        }`}
                    />
                  );
                })()}
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
                      className={`flex min-w-[160px] flex-col gap-1 rounded-xl border-2 px-4 py-3 text-left text-sm transition ${isActive
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

            <div className={`mb-10 rounded-2xl border-2 p-6 transition-all ${isDarkMode ? 'border-gray-700 bg-gray-700/50' : 'border-gray-200 bg-gray-50'
              }`}>
              <div
                className="flex cursor-pointer items-center justify-between gap-3"
                onClick={() => setIsSubscriptionExpanded(!isSubscriptionExpanded)}
              >
                <div className="flex items-center gap-3">
                  <h3 className="text-lg font-semibold text-[#148F80]">
                    Daily Subscription Plan
                  </h3>
                  <div className="group relative flex h-8 w-8 items-center justify-center rounded-full border border-[#148F80] bg-[#148F80]/10 text-sm font-semibold text-[#148F80]" onClick={(e) => e.stopPropagation()}>
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

                <div className={`transition-transform duration-300 ${isSubscriptionExpanded ? 'rotate-180' : ''}`}>
                  <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M5 7.5L10 12.5L15 7.5" stroke={isDarkMode ? "#9CA3AF" : "#4B5563"} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </div>
              </div>

              {isSubscriptionExpanded && (
                <div className="mt-6 animate-fadeIn">
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
                          className={`rounded-xl border-2 px-4 py-3 text-sm font-semibold transition ${isActive
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
                          className={`relative flex cursor-pointer items-center gap-3 rounded-xl border-2 px-5 py-3 text-base font-medium transition ${isActive
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
              )}
            </div>

            <div className={`rounded-2xl border-2 p-6 ${isDarkMode ? 'border-gray-700 bg-gray-700/50' : 'border-gray-200 bg-gray-50'
              }`}>
              <div className="flex flex-col gap-3">
                <h3 className="text-lg font-semibold text-[#148F80]">Real-Time Call Translation</h3>
                <label className={`flex items-center gap-3 text-sm font-semibold ${isDarkMode ? 'text-gray-300' : 'text-gray-700'
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

          <div className={`border-t-2 px-6 py-10 ${isDarkMode ? 'border-gray-700 bg-gray-800/50' : 'border-gray-200 bg-gray-50'
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
              <div className={`flex items-center justify-between border-t pt-4 text-base font-semibold ${isDarkMode
                ? 'border-gray-700 text-white'
                : 'border-gray-200 text-gray-900'
                }`}>
                <span>Total</span>
                <span>{formatCurrency(currencySymbol, totalPrice)}</span>
              </div>
            </div>

            <div className={`mt-8 rounded-2xl border-2 p-1 ${isDarkMode ? 'border-gray-700 bg-gray-700/50' : 'border-gray-200 bg-white'
              }`}>
              <h3 className={`text-base font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Apply Coupon Code</h3>
              <div className="mt-3 flex gap-2">
                <input
                  type="text"
                  value={couponInput}
                  onChange={(event) => setCouponInput(event.target.value)}
                  placeholder="Enter coupon code"
                  className={`flex-1 rounded-xl border-2 px-4 py-2 text-sm focus:border-[#148F80] focus:outline-none focus:ring-2 focus:ring-[#148F80]/20 ${isDarkMode
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
                {Object.keys(websiteCoupons).map((code) => (
                  <button
                    key={code}
                    onClick={() => {
                      setCouponInput(code);
                      setAppliedCoupon(code);
                    }}
                    className={`rounded-xl border-2 px-3 py-1 text-xs font-semibold transition ${appliedCoupon === code
                      ? 'border-[#148F80] bg-[#148F80]/10 text-[#148F80]'
                      : isDarkMode
                        ? 'border-gray-600 text-gray-300 hover:border-[#148F80] hover:bg-[#148F80]/5'
                        : 'border-gray-200 text-gray-700 hover:border-[#148F80] hover:bg-[#148F80]/5'
                      }`}
                  >
                    {code} ({websiteCoupons[code].value}{websiteCoupons[code].type === 'percentage' ? '%' : ''} Off)
                  </button>
                ))}
              </div>
            </div>

            {/* Payment Method Selection */}
            <div className={`mt-6 rounded-2xl border-2 p-4 ${isDarkMode ? 'border-gray-700 bg-gray-700/50' : 'border-gray-200 bg-white'}`}>
              <h3 className={`text-base font-semibold mb-3 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Payment Method</h3>
              <div className="flex gap-4 mb-4">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="wallet"
                    checked={paymentMethod === 'wallet'}
                    onChange={() => setPaymentMethod('wallet')}
                    className="accent-[#148F80]"
                  />
                  <span className={isDarkMode ? 'text-gray-300' : 'text-gray-700'}>Pay from Wallet</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="card"
                    checked={paymentMethod === 'card'}
                    onChange={() => setPaymentMethod('card')}
                    className="accent-[#148F80]"
                  />
                  <span className={isDarkMode ? 'text-gray-300' : 'text-gray-700'}>Pay by Card (Stripe)</span>
                </label>
              </div>

              {paymentMethod === 'card' && (
                <div className="p-3 border rounded-md bg-white">
                  <CardElement options={{
                    style: {
                      base: {
                        fontSize: '16px',
                        color: '#424770',
                        '::placeholder': {
                          color: '#aab7c4',
                        },
                      },
                      invalid: {
                        color: '#9e2146',
                      },
                    },
                  }} />
                </div>
              )}
            </div>

            <button
              type="button"
              onClick={handlePayNow}
              disabled={isSubmitting || !callTime || !availableTimeOptions.length}
              className={`mt-6 w-full rounded-xl border-2 px-6 py-3 text-base font-semibold text-white transition ${isSubmitting || !callTime || !availableTimeOptions.length
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

export function BookingModal(props: BookingModalProps) {
  const [stripePromise, setStripePromise] = useState<any>(null);

  useEffect(() => {
    const fetchConfig = async () => {
      try {
        const response = await fetch(`${config.API_URL}/api/website-settings/payment-config`);
        if (response.ok) {
          const resData = await response.json();
          const data = resData.data;
          if (data.stripe?.enabled && data.stripe?.publishableKey) {
            setStripePromise(loadStripe(data.stripe.publishableKey));
          }
        }
      } catch (err) {
        console.error("Failed to load payment config", err);
      }
    };
    fetchConfig();
  }, []);

  return (
    <Elements stripe={stripePromise}>
      <BookingFormInner {...props} />
    </Elements>
  );
}

export default BookingModal;

