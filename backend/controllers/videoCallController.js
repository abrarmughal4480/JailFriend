const VideoCall = require('../models/videoCall');
const Booking = require('../models/booking');
const User = require('../models/user');

// Initiate a video call
const initiateCall = async (req, res) => {
  try {
    const callerId = req.user.id;
    const { receiverId, bookingId, callType = 'video' } = req.body;

    if (!receiverId) {
      return res.status(400).json({
        success: false,
        message: 'Receiver ID is required'
      });
    }

    // Check if user is trying to call themselves
    if (callerId === receiverId) {
      return res.status(400).json({
        success: false,
        message: 'You cannot call yourself'
      });
    }

    // Check if there's an active call between these users
    const activeCall = await VideoCall.findOne({
      $or: [
        { callerId, receiverId },
        { callerId: receiverId, receiverId: callerId }
      ],
      status: { $in: ['initiated', 'ringing', 'answered'] }
    });

    if (activeCall) {
      return res.status(400).json({
        success: false,
        message: 'There is already an active call between these users'
      });
    }

    // If bookingId is provided, verify the booking
    let booking = null;
    if (bookingId) {
      booking = await Booking.findById(bookingId);
      if (!booking) {
        return res.status(404).json({
          success: false,
          message: 'Booking not found'
        });
      }

      // Check if user is authorized for this booking
      if (booking.clientId.toString() !== callerId && booking.serviceProviderId.toString() !== callerId) {
        return res.status(403).json({
          success: false,
          message: 'You are not authorized to make calls for this booking'
        });
      }

      // Check if booking is in the right status
      if (!['accepted', 'in_progress'].includes(booking.status)) {
        return res.status(400).json({
          success: false,
          message: 'Cannot initiate call for this booking status'
        });
      }
    }

    // Create the video call
    const videoCall = new VideoCall({
      callerId,
      receiverId,
      bookingId: bookingId || null,
      callType,
      status: 'initiated',
      serviceType: booking?.serviceType,
      hourlyRate: booking?.hourlyRate,
      currency: booking?.currency
    });

    await videoCall.save();

    // Populate the call with user details
    await videoCall.populate([
      { path: 'callerId', select: 'name username avatar' },
      { path: 'receiverId', select: 'name username avatar' },
      { path: 'bookingId', select: 'title serviceType totalAmount' }
    ]);

    res.status(201).json({
      success: true,
      message: 'Call initiated successfully',
      videoCall
    });
  } catch (error) {
    console.error('Error initiating call:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};

// Answer a call
const answerCall = async (req, res) => {
  try {
    const userId = req.user.id;
    const { callId } = req.params;
    const { answer } = req.body;

    const videoCall = await VideoCall.findById(callId);
    
    if (!videoCall) {
      return res.status(404).json({
        success: false,
        message: 'Call not found'
      });
    }

    // Check if user is the receiver
    if (videoCall.receiverId.toString() !== userId) {
      return res.status(403).json({
        success: false,
        message: 'You are not authorized to answer this call'
      });
    }

    // Check if call can be answered
    if (!['initiated', 'ringing'].includes(videoCall.status)) {
      return res.status(400).json({
        success: false,
        message: 'This call cannot be answered'
      });
    }

    // Update call with answer and status
    videoCall.answer = answer;
    videoCall.status = 'answered';
    await videoCall.save();

    // If this is a booking call, update booking status
    if (videoCall.bookingId) {
      const booking = await Booking.findById(videoCall.bookingId);
      if (booking && booking.status === 'accepted') {
        booking.status = 'in_progress';
        booking.startedAt = new Date();
        await booking.save();
      }
    }

    res.status(200).json({
      success: true,
      message: 'Call answered successfully',
      videoCall
    });
  } catch (error) {
    console.error('Error answering call:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};

// Reject a call
const rejectCall = async (req, res) => {
  try {
    const userId = req.user.id;
    const { callId } = req.params;
    const { reason = 'user_rejected' } = req.body;

    const videoCall = await VideoCall.findById(callId);
    
    if (!videoCall) {
      return res.status(404).json({
        success: false,
        message: 'Call not found'
      });
    }

    // Check if user is the receiver
    if (videoCall.receiverId.toString() !== userId) {
      return res.status(403).json({
        success: false,
        message: 'You are not authorized to reject this call'
      });
    }

    // Check if call can be rejected
    if (!['initiated', 'ringing'].includes(videoCall.status)) {
      return res.status(400).json({
        success: false,
        message: 'This call cannot be rejected'
      });
    }

    await videoCall.rejectCall(reason);

    res.status(200).json({
      success: true,
      message: 'Call rejected successfully',
      videoCall
    });
  } catch (error) {
    console.error('Error rejecting call:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};

// End a call
const endCall = async (req, res) => {
  try {
    const userId = req.user.id;
    const { callId } = req.params;

    const videoCall = await VideoCall.findById(callId);
    
    if (!videoCall) {
      return res.status(404).json({
        success: false,
        message: 'Call not found'
      });
    }

    // Check if user is authorized to end the call
    if (videoCall.callerId.toString() !== userId && videoCall.receiverId.toString() !== userId) {
      return res.status(403).json({
        success: false,
        message: 'You are not authorized to end this call'
      });
    }

    // Check if call can be ended
    if (!['answered'].includes(videoCall.status)) {
      return res.status(400).json({
        success: false,
        message: 'This call cannot be ended'
      });
    }

    await videoCall.endCall();

    // If this is a booking call, update booking status
    if (videoCall.bookingId) {
      const booking = await Booking.findById(videoCall.bookingId);
      if (booking && booking.status === 'in_progress') {
        // Calculate earnings based on call duration
        const earnings = (videoCall.duration / 3600) * videoCall.hourlyRate;
        booking.totalAmount = earnings;
        await booking.save();
      }
    }

    res.status(200).json({
      success: true,
      message: 'Call ended successfully',
      videoCall
    });
  } catch (error) {
    console.error('Error ending call:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};

// Get call by ID
const getCallById = async (req, res) => {
  try {
    const { callId } = req.params;
    const userId = req.user.id;

    const videoCall = await VideoCall.findById(callId)
      .populate('callerId', 'name username avatar')
      .populate('receiverId', 'name username avatar')
      .populate('bookingId', 'title serviceType totalAmount');

    if (!videoCall) {
      return res.status(404).json({
        success: false,
        message: 'Call not found'
      });
    }

    // Check if user is authorized to view this call
    if (videoCall.callerId._id.toString() !== userId && videoCall.receiverId._id.toString() !== userId) {
      return res.status(403).json({
        success: false,
        message: 'You are not authorized to view this call'
      });
    }

    res.status(200).json({
      success: true,
      videoCall
    });
  } catch (error) {
    console.error('Error fetching call:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};

// Get user's call history
const getCallHistory = async (req, res) => {
  try {
    const userId = req.user.id;
    const { page = 1, limit = 20, callType, status } = req.query;

    const query = {
      $or: [
        { callerId: userId },
        { receiverId: userId }
      ]
    };

    if (callType) {
      query.callType = callType;
    }

    if (status) {
      query.status = status;
    }

    const calls = await VideoCall.find(query)
      .populate('callerId', 'name username avatar')
      .populate('receiverId', 'name username avatar')
      .populate('bookingId', 'title serviceType totalAmount')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await VideoCall.countDocuments(query);

    res.status(200).json({
      success: true,
      calls,
      pagination: {
        current: parseInt(page),
        pages: Math.ceil(total / limit),
        total
      }
    });
  } catch (error) {
    console.error('Error fetching call history:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};

// Get active calls for user
const getActiveCalls = async (req, res) => {
  try {
    const userId = req.user.id;

    const activeCalls = await VideoCall.getActiveCalls(userId);

    res.status(200).json({
      success: true,
      activeCalls
    });
  } catch (error) {
    console.error('Error fetching active calls:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};

// Get call statistics
const getCallStats = async (req, res) => {
  try {
    const userId = req.user.id;
    const { days = 30 } = req.query;

    const stats = await VideoCall.getCallStats(userId, parseInt(days));
    const p2pStats = await VideoCall.getP2PCallStats(userId, parseInt(days));

    res.status(200).json({
      success: true,
      stats: stats[0] || {
        totalCalls: 0,
        answeredCalls: 0,
        missedCalls: 0,
        rejectedCalls: 0,
        totalDuration: 0,
        averageDuration: 0,
        totalVideoCalls: 0,
        totalAudioCalls: 0
      },
      p2pStats: p2pStats[0] || {
        totalP2PCalls: 0,
        completedP2PCalls: 0,
        totalEarnings: 0,
        averageCallDuration: 0
      }
    });
  } catch (error) {
    console.error('Error fetching call stats:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};

// Add ICE candidate
const addIceCandidate = async (req, res) => {
  try {
    const { callId } = req.params;
    const { candidate, sdpMLineIndex, sdpMid } = req.body;

    const videoCall = await VideoCall.findById(callId);
    
    if (!videoCall) {
      return res.status(404).json({
        success: false,
        message: 'Call not found'
      });
    }

    videoCall.iceCandidates.push({
      candidate,
      sdpMLineIndex,
      sdpMid
    });

    await videoCall.save();

    res.status(200).json({
      success: true,
      message: 'ICE candidate added successfully'
    });
  } catch (error) {
    console.error('Error adding ICE candidate:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};

// Update call quality
const updateCallQuality = async (req, res) => {
  try {
    const { callId } = req.params;
    const { audioLevel, videoQuality, connectionQuality, bandwidth, latency } = req.body;

    const videoCall = await VideoCall.findById(callId);
    
    if (!videoCall) {
      return res.status(404).json({
        success: false,
        message: 'Call not found'
      });
    }

    videoCall.quality = {
      audioLevel,
      videoQuality,
      connectionQuality,
      bandwidth,
      latency
    };

    await videoCall.save();

    res.status(200).json({
      success: true,
      message: 'Call quality updated successfully'
    });
  } catch (error) {
    console.error('Error updating call quality:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};

module.exports = {
  initiateCall,
  answerCall,
  rejectCall,
  endCall,
  getCallById,
  getCallHistory,
  getActiveCalls,
  getCallStats,
  addIceCandidate,
  updateCallQuality
};
