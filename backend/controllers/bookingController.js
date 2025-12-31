const Booking = require('../models/booking');
const P2PProfile = require('../models/p2pProfile');
const User = require('../models/user');
const VideoCall = require('../models/videoCall');
const PaymentTransaction = require('../models/PaymentTransaction');
const socketService = require('../services/socketService');

const BLOCKING_BOOKING_STATUSES = ['pending', 'accepted', 'in_progress'];

const parseMultiplierValue = (rateValue, legacyValue) => {
  if (rateValue !== null && rateValue !== undefined) {
    const numeric = Number(rateValue);
    if (Number.isFinite(numeric)) return numeric;
  }
  if (legacyValue !== null && legacyValue !== undefined && legacyValue !== '') {
    const numeric = typeof legacyValue === 'number' ? legacyValue : parseFloat(legacyValue);
    if (Number.isFinite(numeric)) return numeric;
  }
  return null;
};

const parseTimeToMinutes = (timeStr) => {
  if (!timeStr || typeof timeStr !== 'string') return null;
  const [hours, minutes] = timeStr.split(':').map(part => parseInt(part, 10));
  if (Number.isNaN(hours) || Number.isNaN(minutes)) return null;
  return hours * 60 + minutes;
};

const getMinutesInTimezone = (date, timezone) => {
  const formatter = new Intl.DateTimeFormat('en-US', {
    timeZone: timezone || 'UTC',
    hour12: false,
    hour: '2-digit',
    minute: '2-digit'
  });
  const parts = formatter.formatToParts(date);
  const hour = parseInt(parts.find(part => part.type === 'hour')?.value ?? '0', 10);
  const minute = parseInt(parts.find(part => part.type === 'minute')?.value ?? '0', 10);
  return hour * 60 + minute;
};

const getWeekdayInTimezone = (date, timezone) =>
  new Intl.DateTimeFormat('en-US', {
    timeZone: timezone || 'UTC',
    weekday: 'long'
  }).format(date);

const hasBookingConflict = (requestedStart, requestedEnd, existingBookings) =>
  existingBookings.some(booking => {
    const bookingStart = booking.scheduledDate;
    const bookingEnd = new Date(bookingStart.getTime() + booking.duration * 60000);
    return requestedStart < bookingEnd && requestedEnd > bookingStart;
  });

const getCallRateMultiplier = (profile, callType) => {
  if (!callType) return null;
  if (callType === 'audio') {
    return parseMultiplierValue(profile.audioCallRate, profile.audioCallPrice);
  }
  if (callType === 'video') {
    return parseMultiplierValue(profile.videoCallRate, profile.videoCallPrice);
  }
  if (callType === 'chat') {
    return parseMultiplierValue(profile.chatRate, profile.chatPrice);
  }
  return null;
};

// Create a new booking request
const createBooking = async (req, res) => {
  const session = await User.startSession();
  session.startTransaction();
  try {
    const clientId = req.user.id;
    const {
      serviceProviderId,
      p2pProfileId,
      serviceType,
      callType,
      title,
      description,
      scheduledDate,
      duration,
      requirements,
      deliverables,
      attachments,
      hasRealtimeTranslation,
      discountCode
    } = req.body;

    // Validate required fields
    if (!serviceProviderId || !p2pProfileId || !serviceType || !title || !description || !scheduledDate || !duration) {
      return res.status(400).json({
        success: false,
        message: 'All required fields must be provided'
      });
    }

    // Check if user is trying to book themselves
    if (clientId === serviceProviderId) {
      return res.status(400).json({
        success: false,
        message: 'You cannot book your own services'
      });
    }

    // Verify the P2P profile exists and belongs to the service provider
    const profile = await P2PProfile.findById(p2pProfileId);
    if (!profile || profile.userId.toString() !== serviceProviderId) {
      return res.status(404).json({
        success: false,
        message: 'P2P profile not found or does not belong to the service provider'
      });
    }

    // Check if the service provider is available
    if (!profile.isActive || profile.availability === 'Busy') {
      return res.status(400).json({
        success: false,
        message: 'Service provider is currently not available'
      });
    }

    const parsedDuration = parseInt(duration, 10);
    if (!parsedDuration || parsedDuration <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Duration must be a positive number of minutes'
      });
    }

    const requestedStart = new Date(scheduledDate);
    if (Number.isNaN(requestedStart.getTime())) {
      return res.status(400).json({
        success: false,
        message: 'Invalid scheduled date'
      });
    }

    const requestedEnd = new Date(requestedStart.getTime() + parsedDuration * 60000);

    // Determine call type from serviceType if not provided
    let bookingCallType = callType;
    if (!bookingCallType) {
      if (serviceType === 'audio_call') bookingCallType = 'audio';
      else if (serviceType === 'video_call') bookingCallType = 'video';
      else if (serviceType === 'chat') bookingCallType = 'chat';
    }

    const providerTimezone = profile.timezone || 'UTC';

    // Validate provider available days
    if (Array.isArray(profile.availableDays) && profile.availableDays.length > 0) {
      const requestedWeekday = getWeekdayInTimezone(requestedStart, providerTimezone);
      if (!profile.availableDays.includes(requestedWeekday)) {
        return res.status(400).json({
          success: false,
          message: `Service provider is not available on ${requestedWeekday}`
        });
      }
    }

    // Validate working hours window
    const workingStartMinutes = parseTimeToMinutes(profile.workingHours?.start || '09:00');
    let workingEndMinutes = parseTimeToMinutes(profile.workingHours?.end || '17:00');

    // Treat 00:00 end time as midnight (24:00)
    if (workingEndMinutes === 0) {
      workingEndMinutes = 24 * 60;
    }

    if (workingStartMinutes !== null && workingEndMinutes !== null) {
      const requestStartMinutes = getMinutesInTimezone(requestedStart, providerTimezone);
      const requestEndMinutes = getMinutesInTimezone(requestedEnd, providerTimezone);

      // Special handling for requestEndMinutes if it wraps to 00:00 (which is 0)
      // If a booking ends exactly at midnight, requestEndMinutes will be 0, which is < workingStartMinutes
      // We should treat it as 24:00 (1440 minutes) for comparison
      const adjustedRequestEndMinutes = (requestEndMinutes === 0 && requestStartMinutes > 0) ? 24 * 60 : requestEndMinutes;

      if (requestStartMinutes < workingStartMinutes || adjustedRequestEndMinutes > workingEndMinutes) {
        return res.status(400).json({
          success: false,
          message: 'Requested time is outside the service provider’s working hours'
        });
      }
    }

    // Validate overlapping bookings
    const bufferWindowStart = new Date(requestedStart.getTime() - 12 * 60 * 60 * 1000);
    const bufferWindowEnd = new Date(requestedEnd.getTime() + 12 * 60 * 60 * 1000);

    const conflictingBookings = await Booking.find({
      serviceProviderId,
      status: { $in: BLOCKING_BOOKING_STATUSES },
      scheduledDate: { $lt: bufferWindowEnd, $gt: bufferWindowStart }
    }).select('scheduledDate duration');

    if (hasBookingConflict(requestedStart, requestedEnd, conflictingBookings)) {
      return res.status(400).json({
        success: false,
        message: 'Selected time overlaps with another booking for this provider'
      });
    }

    // Get the appropriate call rate based on call type
    const callRate = getCallRateMultiplier(profile, bookingCallType);

    // Calculate base amount
    let baseAmount;
    const hours = parsedDuration / 60;

    if (bookingCallType && callRate) {
      // Treat callRate as the price for a 15-minute session (matching frontend logic)
      baseAmount = (callRate / 15) * parsedDuration;
    } else if (profile.hourlyRate) {
      baseAmount = hours * profile.hourlyRate;
    } else {
      baseAmount = 0; // Fallback
    }

    // Get website settings for translation rate and coupons
    const WebsiteSettings = require('../models/websiteSettings');
    const settings = await WebsiteSettings.getSettings();
    const aiSettings = settings.ai || {};

    // Calculate translation amount
    let translationAmount = 0;
    const TRANSLATION_RATE_PER_MIN = aiSettings.creditSystem?.translation?.price || 4;
    if (hasRealtimeTranslation) {
      translationAmount = parsedDuration * TRANSLATION_RATE_PER_MIN;
    }

    // Calculate discount amount
    let discountAmount = 0;
    if (discountCode && aiSettings.coupons) {
      const coupon = aiSettings.coupons.find(c => c.code === discountCode);
      if (coupon) {
        if (coupon.type === 'percentage') {
          discountAmount = (baseAmount + translationAmount) * (coupon.value / 100);
        } else if (coupon.type === 'fixed') {
          discountAmount = coupon.value;
        }
      }
    }

    const totalAmount = Math.max(baseAmount + translationAmount - discountAmount, 0);

    // Check client wallet balance
    const client = await User.findById(clientId).session(session);
    if (!client || client.balance < totalAmount) {
      await session.abortTransaction();
      session.endSession();
      return res.status(400).json({
        success: false,
        message: `Insufficient wallet balance. You need ${totalAmount} ${profile.currency || 'USD'} but only have ${client?.balance || 0} ${profile.currency || 'USD'}.`
      });
    }

    // Deduct from client
    client.balance -= totalAmount;
    await client.save({ session });

    // Add to provider
    const provider = await User.findById(serviceProviderId).session(session);
    if (provider) {
      provider.balance = (provider.balance || 0) + totalAmount;
      await provider.save({ session });
    }

    // Create the booking
    const booking = new Booking({
      clientId,
      serviceProviderId,
      p2pProfileId,
      serviceType,
      callType: bookingCallType,
      title: title.trim(),
      description: description.trim(),
      scheduledDate: requestedStart,
      duration: parsedDuration,
      hourlyRate: profile.hourlyRate,
      callRate: callRate,
      totalAmount,
      currency: profile.currency,
      requirements: requirements || [],
      deliverables: deliverables || [],
      attachments: attachments || [],
      paymentStatus: 'paid', // Mark as paid since we deducted from wallet
      paymentMethod: 'wallet',
      hasRealtimeTranslation: !!hasRealtimeTranslation,
      translationAmount,
      discountCode: discountCode || null,
      discountAmount
    });

    await booking.save({ session });

    // Create Payment Transactions for records
    const clientTransaction = new PaymentTransaction({
      userId: clientId,
      amount: totalAmount,
      paymentMethod: 'wallet',
      status: 'completed',
      bookingId: booking._id,
      paymentDetails: { type: 'deduction', description: `Payment for booking: ${title}` }
    });
    await clientTransaction.save({ session });

    const providerTransaction = new PaymentTransaction({
      userId: serviceProviderId,
      amount: totalAmount,
      paymentMethod: 'wallet',
      status: 'completed',
      bookingId: booking._id,
      paymentDetails: { type: 'addition', description: `Payment received for booking: ${title}` }
    });
    await providerTransaction.save({ session });

    await session.commitTransaction();
    session.endSession();

    // Notify users about balance updates via socket
    if (socketService.io) {
      socketService.io.to(clientId.toString()).emit('balanceUpdated', { balance: client.balance });
      if (provider) {
        socketService.io.to(serviceProviderId.toString()).emit('balanceUpdated', { balance: provider.balance });
      }
    }

    // Populate the booking with user details
    await booking.populate([
      { path: 'clientId', select: 'name username avatar' },
      { path: 'serviceProviderId', select: 'name username avatar' },
      { path: 'p2pProfileId', select: 'occupation hourlyRate currency' }
    ]);

    res.status(201).json({
      success: true,
      message: 'Booking request created and paid successfully',
      booking
    });
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    console.error('Error creating booking:', error);

    if (error.name === 'ValidationError') {
      const errors = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors
      });
    }

    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};

// Get provider bookings for a specific date to determine availability
const getProviderDailyBookings = async (req, res) => {
  try {
    const { providerId } = req.params;
    const { date } = req.query;

    if (!providerId) {
      return res.status(400).json({
        success: false,
        message: 'Provider ID is required'
      });
    }

    if (!date) {
      return res.status(400).json({
        success: false,
        message: 'Date query parameter is required (YYYY-MM-DD)'
      });
    }

    const requestedDate = new Date(date);
    if (Number.isNaN(requestedDate.getTime())) {
      return res.status(400).json({
        success: false,
        message: 'Invalid date format'
      });
    }

    const startOfDay = new Date(requestedDate);
    startOfDay.setHours(0, 0, 0, 0);

    const endOfDay = new Date(startOfDay);
    endOfDay.setDate(endOfDay.getDate() + 1);

    const bookings = await Booking.find({
      serviceProviderId: providerId,
      status: { $in: BLOCKING_BOOKING_STATUSES },
      scheduledDate: { $gte: startOfDay, $lt: endOfDay }
    })
      .select('scheduledDate duration status')
      .sort({ scheduledDate: 1 });

    res.status(200).json({
      success: true,
      bookings
    });
  } catch (error) {
    console.error('Error fetching provider bookings:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};

// Get user's bookings (as client or service provider)
const getUserBookings = async (req, res) => {
  try {
    const userId = req.user.id;
    const { userType = 'client', page = 1, limit = 20, status } = req.query;

    const query = userType === 'client' ? { clientId: userId } : { serviceProviderId: userId };

    if (status) {
      query.status = status;
    }

    const bookings = await Booking.find(query)
      .populate('clientId', 'name username avatar')
      .populate('serviceProviderId', 'name username avatar')
      .populate('p2pProfileId', 'occupation hourlyRate currency')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Booking.countDocuments(query);

    res.status(200).json({
      success: true,
      bookings,
      pagination: {
        current: parseInt(page),
        pages: Math.ceil(total / limit),
        total
      }
    });
  } catch (error) {
    console.error('Error fetching user bookings:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};

// Get upcoming bookings
const getUpcomingBookings = async (req, res) => {
  try {
    const userId = req.user.id;
    const { userType = 'client' } = req.query;

    const query = userType === 'client' ? { clientId: userId } : { serviceProviderId: userId };

    const bookings = await Booking.find({
      ...query,
      status: { $in: ['accepted', 'in_progress'] },
      scheduledDate: { $gte: new Date() }
    })
      .populate('clientId', 'name username avatar')
      .populate('serviceProviderId', 'name username avatar')
      .populate('p2pProfileId', 'occupation hourlyRate currency')
      .sort({ scheduledDate: 1 });

    res.status(200).json({
      success: true,
      bookings
    });
  } catch (error) {
    console.error('Error fetching upcoming bookings:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};

// Accept a booking request
const acceptBooking = async (req, res) => {
  try {
    const userId = req.user.id;
    const { bookingId } = req.params;

    const booking = await Booking.findById(bookingId);

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found'
      });
    }

    // Check if user is the service provider
    if (booking.serviceProviderId.toString() !== userId) {
      return res.status(403).json({
        success: false,
        message: 'You are not authorized to accept this booking'
      });
    }

    // Check if booking can be accepted
    if (booking.status !== 'pending') {
      return res.status(400).json({
        success: false,
        message: 'This booking cannot be accepted'
      });
    }

    await booking.acceptBooking();

    // Populate the booking
    await booking.populate([
      { path: 'clientId', select: 'name username avatar' },
      { path: 'serviceProviderId', select: 'name username avatar' },
      { path: 'p2pProfileId', select: 'occupation hourlyRate currency' }
    ]);

    res.status(200).json({
      success: true,
      message: 'Booking accepted successfully',
      booking
    });
  } catch (error) {
    console.error('Error accepting booking:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};

// Reject a booking request
const rejectBooking = async (req, res) => {
  try {
    const userId = req.user.id;
    const { bookingId } = req.params;
    const { reason } = req.body;

    const booking = await Booking.findById(bookingId);

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found'
      });
    }

    // Check if user is the service provider
    if (booking.serviceProviderId.toString() !== userId) {
      return res.status(403).json({
        success: false,
        message: 'You are not authorized to reject this booking'
      });
    }

    // Check if booking can be rejected
    if (booking.status !== 'pending') {
      return res.status(400).json({
        success: false,
        message: 'This booking cannot be rejected'
      });
    }

    await booking.rejectBooking(reason);

    res.status(200).json({
      success: true,
      message: 'Booking rejected successfully',
      booking
    });
  } catch (error) {
    console.error('Error rejecting booking:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};

// Start a booking session
const startBooking = async (req, res) => {
  try {
    const userId = req.user.id;
    const { bookingId } = req.params;

    const booking = await Booking.findById(bookingId);

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found'
      });
    }

    // Check if user is authorized (client or service provider)
    if (booking.clientId.toString() !== userId && booking.serviceProviderId.toString() !== userId) {
      return res.status(403).json({
        success: false,
        message: 'You are not authorized to start this booking'
      });
    }

    // Check if booking can be started
    if (booking.status !== 'accepted' && booking.status !== 'In_progress' && booking.status !== 'in_progress') {
      return res.status(400).json({
        success: false,
        message: 'This booking cannot be started'
      });
    }

    // Check if it's time to start the booking (within 30 minutes of scheduled time)
    const now = new Date();
    const scheduledTime = new Date(booking.scheduledDate);
    const timeDiff = Math.abs(now - scheduledTime) / (1000 * 60); // minutes

    // Allow starting if it's within 30 minutes before or after scheduled time
    if (timeDiff > 30) {
      return res.status(400).json({
        success: false,
        message: 'Booking can only be started within 30 minutes of scheduled time'
      });
    }

    await booking.startBooking();

    // Create video call session
    const roomId = `room_${booking._id}_${Date.now()}`;
    const videoCall = new VideoCall({
      callerId: booking.clientId,
      receiverId: booking.serviceProviderId,
      bookingId: booking._id,
      roomId: roomId,
      callType: booking.callType || 'video',
      status: 'initiated',
      serviceType: booking.serviceType,
      hourlyRate: booking.hourlyRate,
      currency: booking.currency,
      hasRealtimeTranslation: booking.hasRealtimeTranslation || false
    });

    await videoCall.save();

    // Update booking with video call details
    booking.videoCallId = videoCall._id;
    booking.callLink = `/video-call/${videoCall._id}`;
    await booking.save();

    // Get user names for the video call invitation
    const User = require('../models/user');
    const [serviceProvider, client] = await Promise.all([
      User.findById(booking.serviceProviderId).select('name username'),
      User.findById(booking.clientId).select('name username')
    ]);

    // Send video call invitation to client via socket
    const clientRoom = `video_user_${booking.clientId}`;

    // Check if client room exists, if not try to find client socket and join them
    const room = socketService.io.sockets.adapter.rooms.get(clientRoom);
    if (!room) {
      console.log(`🔍 DEBUG: Client room ${clientRoom} not found, attempting to find client socket...`);
      const allSockets = Array.from(socketService.io.sockets.sockets.values());
      const clientSocket = allSockets.find(s => s.userId === booking.clientId);

      if (clientSocket) {
        console.log(`🔍 DEBUG: Found client socket, joining to video call room:`, clientSocket.id);
        clientSocket.join(clientRoom);
        console.log(`🔍 DEBUG: Client joined video call room: ${clientRoom}`);
      } else {
        console.log(`🔍 DEBUG: Client socket not found for user: ${booking.clientId}`);
      }
    }

    const videoCallData = {
      callerId: booking.serviceProviderId,
      callerName: serviceProvider?.name || serviceProvider?.username || 'Service Provider',
      receiverId: booking.clientId,
      receiverName: client?.name || client?.username || 'Client',
      callId: videoCall._id,
      roomId: roomId,
      bookingId: booking._id,
      timestamp: new Date().toISOString()
    };

    console.log(`📡 Sending video call invitation:`, videoCallData);

    socketService.io.to(clientRoom).emit('incoming-video-call', videoCallData);

    // Also try to find the client socket directly and send the notification
    const allSockets = Array.from(socketService.io.sockets.sockets.values());
    const clientSocket = allSockets.find(s => s.userId === booking.clientId);

    if (clientSocket) {
      console.log(`📡 Also sending video call invitation directly to client socket:`, clientSocket.id);
      clientSocket.emit('incoming-video-call', videoCallData);
    }

    console.log(`📡 Video call invitation sent to room ${clientRoom}`);

    res.status(200).json({
      success: true,
      message: 'Booking session started successfully',
      booking,
      videoCall: {
        id: videoCall._id,
        callLink: booking.callLink
      }
    });
  } catch (error) {
    console.error('Error starting booking:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};

// Complete a booking
const completeBooking = async (req, res) => {
  try {
    const userId = req.user.id;
    const { bookingId } = req.params;

    const booking = await Booking.findById(bookingId);

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found'
      });
    }

    // Check if user is the service provider
    if (booking.serviceProviderId.toString() !== userId) {
      return res.status(403).json({
        success: false,
        message: 'You are not authorized to complete this booking'
      });
    }

    // Check if booking can be completed
    if (booking.status !== 'in_progress') {
      return res.status(400).json({
        success: false,
        message: 'This booking cannot be completed'
      });
    }

    await booking.completeBooking();

    res.status(200).json({
      success: true,
      message: 'Booking completed successfully',
      booking
    });
  } catch (error) {
    console.error('Error completing booking:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};

// Cancel a booking
const cancelBooking = async (req, res) => {
  try {
    const userId = req.user.id;
    const { bookingId } = req.params;
    const { reason } = req.body;

    const booking = await Booking.findById(bookingId);

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found'
      });
    }

    // Check if user is authorized (client or service provider)
    if (booking.clientId.toString() !== userId && booking.serviceProviderId.toString() !== userId) {
      return res.status(403).json({
        success: false,
        message: 'You are not authorized to cancel this booking'
      });
    }

    // Check if booking can be cancelled
    if (!['pending', 'accepted'].includes(booking.status)) {
      return res.status(400).json({
        success: false,
        message: 'This booking cannot be cancelled'
      });
    }

    await booking.cancelBooking(reason);

    res.status(200).json({
      success: true,
      message: 'Booking cancelled successfully',
      booking
    });
  } catch (error) {
    console.error('Error cancelling booking:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};

// Get booking by ID
const getBookingById = async (req, res) => {
  try {
    const { bookingId } = req.params;
    const userId = req.user.id;

    const booking = await Booking.findById(bookingId)
      .populate('clientId', 'name username avatar')
      .populate('serviceProviderId', 'name username avatar')
      .populate('p2pProfileId', 'occupation hourlyRate currency skills experience');

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found'
      });
    }

    // Check if user is authorized to view this booking
    if (booking.clientId._id.toString() !== userId && booking.serviceProviderId._id.toString() !== userId) {
      return res.status(403).json({
        success: false,
        message: 'You are not authorized to view this booking'
      });
    }

    res.status(200).json({
      success: true,
      booking
    });
  } catch (error) {
    console.error('Error fetching booking:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};

// Get booking statistics
const getBookingStats = async (req, res) => {
  try {
    const userId = req.user.id;
    const { userType = 'client', days = 30 } = req.query;

    const stats = await Booking.getBookingStats(userId, userType, parseInt(days));

    res.status(200).json({
      success: true,
      stats: stats[0] || {
        totalBookings: 0,
        completedBookings: 0,
        cancelledBookings: 0,
        totalEarnings: 0,
        averageBookingValue: 0
      }
    });
  } catch (error) {
    console.error('Error fetching booking stats:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};

// Get booking by video call ID
const getBookingByVideoCallId = async (req, res) => {
  try {
    const { callId } = req.params;

    const booking = await Booking.findOne({ videoCallId: callId })
      .populate('clientId', 'name username avatar')
      .populate('serviceProviderId', 'name username avatar')
      .populate('p2pProfileId', 'occupation hourlyRate currency');

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found for this video call'
      });
    }

    res.json({
      success: true,
      booking
    });
  } catch (error) {
    console.error('Error fetching booking by video call ID:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};

// Update booking time (date locked)
const updateBookingTime = async (req, res) => {
  try {
    const userId = req.user.id;
    const { bookingId } = req.params;
    const { newTime } = req.body; // Format: "HH:MM" (e.g., "14:30")

    if (!newTime) {
      return res.status(400).json({
        success: false,
        message: 'New time is required (format: HH:MM)'
      });
    }

    // Validate time format
    const timeRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/;
    if (!timeRegex.test(newTime)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid time format. Please use HH:MM format (e.g., 14:30)'
      });
    }

    const booking = await Booking.findById(bookingId);

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found'
      });
    }

    // Check if user is the service provider
    if (booking.serviceProviderId.toString() !== userId) {
      return res.status(403).json({
        success: false,
        message: 'You are not authorized to update this booking'
      });
    }

    // Check if booking can be updated
    if (booking.status !== 'pending') {
      return res.status(400).json({
        success: false,
        message: 'Only pending bookings can have their time changed'
      });
    }

    // Get the original scheduled date
    const originalDate = new Date(booking.scheduledDate);
    const [hours, minutes] = newTime.split(':').map(Number);

    // Create new scheduled date with same date but new time
    const newScheduledDate = new Date(originalDate);
    newScheduledDate.setHours(hours, minutes, 0, 0);

    // Validate the new time is not in the past
    if (newScheduledDate < new Date()) {
      return res.status(400).json({
        success: false,
        message: 'New time cannot be in the past'
      });
    }

    // Check for conflicts with other bookings
    const requestedEnd = new Date(newScheduledDate.getTime() + booking.duration * 60000);
    const bufferWindowStart = new Date(newScheduledDate.getTime() - 12 * 60 * 60 * 1000);
    const bufferWindowEnd = new Date(requestedEnd.getTime() + 12 * 60 * 60 * 1000);

    const conflictingBookings = await Booking.find({
      serviceProviderId: booking.serviceProviderId,
      _id: { $ne: booking._id }, // Exclude current booking
      status: { $in: BLOCKING_BOOKING_STATUSES },
      scheduledDate: { $lt: bufferWindowEnd, $gt: bufferWindowStart }
    }).select('scheduledDate duration');

    if (hasBookingConflict(newScheduledDate, requestedEnd, conflictingBookings)) {
      return res.status(400).json({
        success: false,
        message: 'Selected time overlaps with another booking'
      });
    }

    // Store old time for message
    const oldTime = originalDate.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });

    // Update booking time
    booking.scheduledDate = newScheduledDate;
    await booking.save();

    // Send message to client about time change
    const Message = require('../models/message');
    const Conversation = require('../models/conversation');

    const newTimeFormatted = newScheduledDate.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
    const dateFormatted = newScheduledDate.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });

    const messageContent = `I've updated the meeting time from ${oldTime} to ${newTimeFormatted} on ${dateFormatted}. The date remains the same.`;

    // Create message
    const message = new Message({
      senderId: userId,
      receiverId: booking.clientId,
      content: messageContent,
      messageType: 'text',
      conversationContext: {
        type: 'p2p_booking',
        bookingId: booking._id,
        source: 'booking_time_change'
      }
    });

    await message.save();

    // Create or update conversation
    const sortedIds = [userId, booking.clientId.toString()].sort();
    const conversationId = `${sortedIds[0]}-${sortedIds[1]}`;

    await Conversation.findOneAndUpdate(
      { conversationId },
      {
        $set: {
          participants: sortedIds,
          lastMessage: message._id,
          lastMessageAt: new Date(),
          updatedAt: new Date(),
          conversationType: 'p2p_booking',
          p2pContext: {
            bookingId: booking._id,
            serviceProviderId: booking.serviceProviderId,
            clientId: booking.clientId,
            source: 'booking_time_change'
          }
        },
        $setOnInsert: {
          conversationId,
          isP2PUser: true,
          p2pUserId: booking.clientId,
          unreadCount: new Map(),
          isPinned: false,
          isArchived: false,
          createdAt: new Date()
        }
      },
      { upsert: true, new: true }
    );

    // Send socket notification
    const socketService = require('../services/socketService');
    const clientRoom = `user_${booking.clientId}`;
    socketService.io.to(clientRoom).emit('new_message', {
      _id: message._id,
      senderId: userId,
      receiverId: booking.clientId,
      content: messageContent,
      timestamp: new Date().toISOString(),
      conversationId: conversationId
    });

    // Populate booking for response
    await booking.populate([
      { path: 'clientId', select: 'name username avatar' },
      { path: 'serviceProviderId', select: 'name username avatar' },
      { path: 'p2pProfileId', select: 'occupation hourlyRate currency' }
    ]);

    res.status(200).json({
      success: true,
      message: 'Booking time updated successfully and message sent to client',
      booking
    });
  } catch (error) {
    console.error('Error updating booking time:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};

module.exports = {
  createBooking,
  getUserBookings,
  getUpcomingBookings,
  acceptBooking,
  rejectBooking,
  startBooking,
  completeBooking,
  cancelBooking,
  getBookingById,
  getBookingStats,
  getBookingByVideoCallId,
  getProviderDailyBookings,
  updateBookingTime
};
