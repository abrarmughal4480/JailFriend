const Booking = require('../models/booking');
const P2PProfile = require('../models/p2pProfile');
const User = require('../models/user');
const VideoCall = require('../models/videoCall');
const socketService = require('../services/socketService');

// Create a new booking request
const createBooking = async (req, res) => {
  try {
    const clientId = req.user.id;
    const {
      serviceProviderId,
      p2pProfileId,
      serviceType,
      title,
      description,
      scheduledDate,
      duration,
      requirements,
      deliverables,
      attachments
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

    // Calculate total amount
    let totalAmount;
    if (serviceType === 'hourly') {
      totalAmount = (duration / 60) * profile.hourlyRate;
    } else {
      totalAmount = profile.hourlyRate; // For fixed price services
    }

    // Create the booking
    const booking = new Booking({
      clientId,
      serviceProviderId,
      p2pProfileId,
      serviceType,
      title: title.trim(),
      description: description.trim(),
      scheduledDate: new Date(scheduledDate),
      duration,
      hourlyRate: profile.hourlyRate,
      totalAmount,
      currency: profile.currency,
      requirements: requirements || [],
      deliverables: deliverables || [],
      attachments: attachments || []
    });

    await booking.save();

    // Populate the booking with user details
    await booking.populate([
      { path: 'clientId', select: 'name username avatar' },
      { path: 'serviceProviderId', select: 'name username avatar' },
      { path: 'p2pProfileId', select: 'occupation hourlyRate currency' }
    ]);

    res.status(201).json({
      success: true,
      message: 'Booking request created successfully',
      booking
    });
  } catch (error) {
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

    const blockingStatuses = ['pending', 'accepted', 'in_progress'];

    const bookings = await Booking.find({
      serviceProviderId: providerId,
      status: { $in: blockingStatuses },
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
      callType: 'video',
      status: 'initiated'
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
  getProviderDailyBookings
};
