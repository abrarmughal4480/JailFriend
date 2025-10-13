const AudioCall = require('../models/audioCall');
const User = require('../models/user');
const mongoose = require('mongoose');

// Initiate an audio call
exports.initiateCall = async (req, res) => {
  try {
    // Call initiation request
    
    const { receiverId, callType = 'audio' } = req.body;
    const callerId = req.user?.id;

    if (!callerId) {
      console.log('❌ No caller ID found:', { user: req.user });
      return res.status(401).json({
        success: false,
        message: 'User not authenticated'
      });
    }

    if (!receiverId) {
      console.log('❌ No receiver ID provided');
      return res.status(400).json({
        success: false,
        message: 'Receiver ID is required'
      });
    }

    if (callerId === receiverId) {
      console.log('❌ User trying to call themselves');
      return res.status(400).json({
        success: false,
        message: 'Cannot call yourself'
      });
    }

    // Check if receiver exists
    const receiver = await User.findById(receiverId);
    if (!receiver) {
      return res.status(404).json({
        success: false,
        message: 'Receiver not found'
      });
    }

    // Check if there's already an active call between these users
    const activeCall = await AudioCall.findOne({
      $or: [
        { callerId: new mongoose.Types.ObjectId(callerId), receiverId: new mongoose.Types.ObjectId(receiverId) },
        { callerId: new mongoose.Types.ObjectId(receiverId), receiverId: new mongoose.Types.ObjectId(callerId) }
      ],
      status: { $in: ['initiated', 'ringing', 'answered'] }
    });

    if (activeCall) {
      // Clean up old active calls between these users
      await AudioCall.updateMany({
        $or: [
          { callerId: new mongoose.Types.ObjectId(callerId), receiverId: new mongoose.Types.ObjectId(receiverId) },
          { callerId: new mongoose.Types.ObjectId(receiverId), receiverId: new mongoose.Types.ObjectId(callerId) }
        ],
        status: { $in: ['initiated', 'ringing', 'answered'] }
      }, {
        $set: { status: 'cancelled', endTime: new Date() }
      });
    }
    
    // Create new call record
    const call = new AudioCall({
      callerId: new mongoose.Types.ObjectId(callerId),
      receiverId: new mongoose.Types.ObjectId(receiverId),
      callType,
      status: 'initiated',
      deviceInfo: {
        userAgent: req.headers['user-agent'],
        platform: req.headers['sec-ch-ua-platform'] || 'unknown'
      }
    });

    const savedCall = await call.save();
    
    // Populate caller and receiver details
    await savedCall.populate([
      { path: 'callerId', select: 'name username avatar isOnline' },
      { path: 'receiverId', select: 'name username avatar isOnline' }
    ]);
    res.status(201).json({
      success: true,
      message: 'Call initiated successfully',
      call: savedCall
    });

  } catch (error) {
    console.error('❌ Error initiating call:', error);
    console.error('❌ Error stack:', error.stack);
    res.status(500).json({
      success: false,
      message: 'Error initiating call',
      error: error.message
    });
  }
};

// Accept an incoming call
exports.acceptCall = async (req, res) => {
  try {
    const { callId } = req.params;
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'User not authenticated'
      });
    }

    const call = await AudioCall.findById(callId);
    if (!call) {
      return res.status(404).json({
        success: false,
        message: 'Call not found'
      });
    }

    console.log('🔍 Accept call authorization check:', {
      callId,
      userId,
      callerId: call.callerId.toString(),
      receiverId: call.receiverId.toString(),
      isReceiver: call.receiverId.toString() === userId
    });

    // Check if user is the receiver
    if (call.receiverId.toString() !== userId) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to accept this call'
      });
    }

    // Check if call can be accepted
    if (!['initiated', 'ringing'].includes(call.status)) {
      return res.status(400).json({
        success: false,
        message: 'Call cannot be accepted in current status'
      });
    }

    // Update call status
    call.status = 'answered';
    call.startTime = new Date();
    
    await call.save();
    
    // Populate caller and receiver details
    await call.populate([
      { path: 'callerId', select: 'name username avatar isOnline' },
      { path: 'receiverId', select: 'name username avatar isOnline' }
    ]);

    res.json({
      success: true,
      message: 'Call accepted successfully',
      call
    });

  } catch (error) {
    console.error('Error accepting call:', error);
    res.status(500).json({
      success: false,
      message: 'Error accepting call',
      error: error.message
    });
  }
};

// Reject an incoming call
exports.rejectCall = async (req, res) => {
  try {
    const { callId } = req.params;
    const { reason = 'user_rejected' } = req.body;
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'User not authenticated'
      });
    }

    const call = await AudioCall.findById(callId);
    if (!call) {
      return res.status(404).json({
        success: false,
        message: 'Call not found'
      });
    }

    console.log('🔍 Reject call authorization check:', {
      callId,
      userId,
      callerId: call.callerId.toString(),
      receiverId: call.receiverId.toString(),
      isCaller: call.callerId.toString() === userId,
      isReceiver: call.receiverId.toString() === userId
    });

    // Check if user is either the caller or receiver (both can reject)
    if (call.callerId.toString() !== userId && call.receiverId.toString() !== userId) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to reject this call'
      });
    }

    // Check if call can be rejected
    if (!['initiated', 'ringing'].includes(call.status)) {
      return res.status(400).json({
        success: false,
        message: 'Call cannot be rejected in current status'
      });
    }

    // Update call status
    await call.rejectCall(reason);
    
    // Populate caller and receiver details
    await call.populate([
      { path: 'callerId', select: 'name username avatar isOnline' },
      { path: 'receiverId', select: 'name username avatar isOnline' }
    ]);

    res.json({
      success: true,
      message: 'Call rejected successfully',
      call
    });

  } catch (error) {
    console.error('Error rejecting call:', error);
    res.status(500).json({
      success: false,
      message: 'Error rejecting call',
      error: error.message
    });
  }
};

// End an active call
exports.endCall = async (req, res) => {
  try {
    const { callId } = req.params;
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'User not authenticated'
      });
    }

    const call = await AudioCall.findById(callId);
    if (!call) {
      return res.status(404).json({
        success: false,
        message: 'Call not found'
      });
    }

    // Check if user is part of the call
    if (call.callerId.toString() !== userId && call.receiverId.toString() !== userId) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to end this call'
      });
    }

    // Check if call can be ended
    if (!['answered', 'ringing'].includes(call.status)) {
      return res.status(400).json({
        success: false,
        message: 'Call cannot be ended in current status'
      });
    }

    // End the call
    await call.endCall();
    
    // Populate caller and receiver details
    await call.populate([
      { path: 'callerId', select: 'name username avatar isOnline' },
      { path: 'receiverId', select: 'name username avatar isOnline' }
    ]);

    res.json({
      success: true,
      message: 'Call ended successfully',
      call
    });

  } catch (error) {
    console.error('Error ending call:', error);
    res.status(500).json({
      success: false,
      message: 'Error ending call',
      error: error.message
    });
  }
};

// Cancel a call (caller cancels before receiver answers)
exports.cancelCall = async (req, res) => {
  try {
    const { callId } = req.params;
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'User not authenticated'
      });
    }

    const call = await AudioCall.findById(callId);
    if (!call) {
      return res.status(404).json({
        success: false,
        message: 'Call not found'
      });
    }

    // Check if user is the caller
    if (call.callerId.toString() !== userId) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to cancel this call'
      });
    }

    // Check if call can be cancelled
    if (!['initiated', 'ringing'].includes(call.status)) {
      return res.status(400).json({
        success: false,
        message: 'Call cannot be cancelled in current status'
      });
    }

    // Update call status
    call.status = 'cancelled';
    call.endTime = new Date();
    await call.save();
    
    // Populate caller and receiver details
    await call.populate([
      { path: 'callerId', select: 'name username avatar isOnline' },
      { path: 'receiverId', select: 'name username avatar isOnline' }
    ]);

    res.json({
      success: true,
      message: 'Call cancelled successfully',
      call
    });

  } catch (error) {
    console.error('Error cancelling call:', error);
    res.status(500).json({
      success: false,
      message: 'Error cancelling call',
      error: error.message
    });
  }
};

// Get call history for a user
exports.getCallHistory = async (req, res) => {
  try {
    const userId = req.user?.id;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'User not authenticated'
      });
    }

    const calls = await AudioCall.getUserCallHistory(userId, page, limit);
    const totalCalls = await AudioCall.countDocuments({
      $or: [
        { callerId: userId },
        { receiverId: userId }
      ]
    });

    res.json({
      success: true,
      calls,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(totalCalls / limit),
        totalCalls,
        hasNextPage: page * limit < totalCalls,
        hasPrevPage: page > 1
      }
    });

  } catch (error) {
    console.error('Error getting call history:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching call history',
      error: error.message
    });
  }
};

// Get active calls for a user
exports.getActiveCalls = async (req, res) => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'User not authenticated'
      });
    }

    const activeCalls = await AudioCall.getActiveCalls(userId);

    res.json({
      success: true,
      activeCalls
    });

  } catch (error) {
    console.error('Error getting active calls:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching active calls',
      error: error.message
    });
  }
};

// Get call statistics
exports.getCallStats = async (req, res) => {
  try {
    const userId = req.user?.id;
    const days = parseInt(req.query.days) || 30;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'User not authenticated'
      });
    }

    const stats = await AudioCall.getCallStats(userId, days);

    res.json({
      success: true,
      stats: stats[0] || {
        totalCalls: 0,
        answeredCalls: 0,
        missedCalls: 0,
        rejectedCalls: 0,
        totalDuration: 0,
        averageDuration: 0
      }
    });

  } catch (error) {
    console.error('Error getting call stats:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching call statistics',
      error: error.message
    });
  }
};

// Update call quality metrics
exports.updateCallQuality = async (req, res) => {
  try {
    const { callId } = req.params;
    const { audioLevel, connectionQuality } = req.body;
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'User not authenticated'
      });
    }

    const call = await AudioCall.findById(callId);
    if (!call) {
      return res.status(404).json({
        success: false,
        message: 'Call not found'
      });
    }

    // Check if user is part of the call
    if (call.callerId.toString() !== userId && call.receiverId.toString() !== userId) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this call'
      });
    }

    // Update quality metrics
    if (audioLevel !== undefined) {
      call.quality.audioLevel = audioLevel;
    }
    if (connectionQuality) {
      call.quality.connectionQuality = connectionQuality;
    }

    await call.save();

    res.json({
      success: true,
      message: 'Call quality updated successfully'
    });

  } catch (error) {
    console.error('Error updating call quality:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating call quality',
      error: error.message
    });
  }
};

// Store WebRTC offer
exports.storeOffer = async (req, res) => {
  try {
    const { callId } = req.params;
    const { offer } = req.body;
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'User not authenticated'
      });
    }

    const call = await AudioCall.findById(callId);
    if (!call) {
      return res.status(404).json({
        success: false,
        message: 'Call not found'
      });
    }

    // Check if user is the caller
    if (call.callerId.toString() !== userId) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to store offer for this call'
      });
    }

    call.offer = offer;
    await call.save();

    res.json({
      success: true,
      message: 'Offer stored successfully'
    });

  } catch (error) {
    console.error('Error storing offer:', error);
    res.status(500).json({
      success: false,
      message: 'Error storing offer',
      error: error.message
    });
  }
};

// Store WebRTC answer
exports.storeAnswer = async (req, res) => {
  try {
    const { callId } = req.params;
    const { answer } = req.body;
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'User not authenticated'
      });
    }

    const call = await AudioCall.findById(callId);
    if (!call) {
      return res.status(404).json({
        success: false,
        message: 'Call not found'
      });
    }

    // Check if user is the receiver
    if (call.receiverId.toString() !== userId) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to store answer for this call'
      });
    }

    call.answer = answer;
    await call.save();

    res.json({
      success: true,
      message: 'Answer stored successfully'
    });

  } catch (error) {
    console.error('Error storing answer:', error);
    res.status(500).json({
      success: false,
      message: 'Error storing answer',
      error: error.message
    });
  }
};

// Add ICE candidate
exports.addIceCandidate = async (req, res) => {
  try {
    const { callId } = req.params;
    const { candidate, sdpMLineIndex, sdpMid } = req.body;
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'User not authenticated'
      });
    }

    const call = await AudioCall.findById(callId);
    if (!call) {
      return res.status(404).json({
        success: false,
        message: 'Call not found'
      });
    }

    // Check if user is part of the call
    if (call.callerId.toString() !== userId && call.receiverId.toString() !== userId) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to add ICE candidate for this call'
      });
    }

    call.iceCandidates.push({
      candidate,
      sdpMLineIndex,
      sdpMid
    });

    await call.save();

    res.json({
      success: true,
      message: 'ICE candidate added successfully'
    });

  } catch (error) {
    console.error('Error adding ICE candidate:', error);
    res.status(500).json({
      success: false,
      message: 'Error adding ICE candidate',
      error: error.message
    });
  }
};

// Clean up old calls (for testing/debugging)
exports.cleanupOldCalls = async (req, res) => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'User not authenticated'
      });
    }

    // Clean up all active calls for this user
    const result = await AudioCall.updateMany({
      $or: [
        { callerId: new mongoose.Types.ObjectId(userId) },
        { receiverId: new mongoose.Types.ObjectId(userId) }
      ],
      status: { $in: ['initiated', 'ringing', 'answered'] }
    }, {
      $set: { status: 'cancelled', endTime: new Date() }
    });

    res.json({
      success: true,
      message: 'Old calls cleaned up successfully',
      modifiedCount: result.modifiedCount
    });

  } catch (error) {
    console.error('Error cleaning up old calls:', error);
    res.status(500).json({
      success: false,
      message: 'Error cleaning up old calls',
      error: error.message
    });
  }
};
