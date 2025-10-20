const mongoose = require('mongoose');

const videoCallSchema = new mongoose.Schema({
  callerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  receiverId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  bookingId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Booking'
  },
  roomId: {
    type: String,
    unique: true,
    sparse: true // This allows multiple null values
  },
  status: {
    type: String,
    enum: ['initiated', 'ringing', 'answered', 'rejected', 'ended', 'missed', 'cancelled'],
    default: 'initiated'
  },
  callType: {
    type: String,
    enum: ['audio', 'video'],
    default: 'video'
  },
  startTime: {
    type: Date,
    default: Date.now
  },
  endTime: {
    type: Date
  },
  duration: {
    type: Number, // Duration in seconds
    default: 0
  },
  // WebRTC signaling data
  offer: {
    type: String // SDP offer
  },
  answer: {
    type: String // SDP answer
  },
  iceCandidates: [{
    candidate: String,
    sdpMLineIndex: Number,
    sdpMid: String,
    timestamp: {
      type: Date,
      default: Date.now
    }
  }],
  // Call quality metrics
  quality: {
    audioLevel: Number,
    videoQuality: {
      type: String,
      enum: ['high', 'medium', 'low'],
      default: 'medium'
    },
    connectionQuality: {
      type: String,
      enum: ['excellent', 'good', 'fair', 'poor'],
      default: 'good'
    },
    bandwidth: Number,
    latency: Number
  },
  // Call metadata
  deviceInfo: {
    userAgent: String,
    platform: String,
    browser: String
  },
  // Call recording (if enabled)
  recordingUrl: {
    type: String
  },
  isRecorded: {
    type: Boolean,
    default: false
  },
  // Call rejection reason
  rejectionReason: {
    type: String,
    enum: ['user_busy', 'user_rejected', 'network_error', 'timeout', 'other']
  },
  // Call notes/transcript (if available)
  transcript: {
    type: String
  },
  // Screen sharing
  isScreenSharing: {
    type: Boolean,
    default: false
  },
  screenShareStartTime: Date,
  screenShareEndTime: Date,
  // Call participants (for group calls in future)
  participants: [{
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    joinedAt: {
      type: Date,
      default: Date.now
    },
    leftAt: Date,
    role: {
      type: String,
      enum: ['caller', 'receiver'],
      default: 'receiver'
    },
    isMuted: {
      type: Boolean,
      default: false
    },
    isVideoEnabled: {
      type: Boolean,
      default: true
    }
  }],
  // P2P specific fields
  serviceType: {
    type: String,
    enum: ['consultation', 'project', 'hourly', 'fixed_price']
  },
  hourlyRate: Number,
  currency: {
    type: String,
    default: 'USD'
  },
  // Call feedback
  feedback: {
    callerRating: {
      type: Number,
      min: 1,
      max: 5
    },
    receiverRating: {
      type: Number,
      min: 1,
      max: 5
    },
    callerComment: String,
    receiverComment: String
  }
}, {
  timestamps: true
});

// Indexes for better query performance
videoCallSchema.index({ callerId: 1, createdAt: -1 });
videoCallSchema.index({ receiverId: 1, createdAt: -1 });
videoCallSchema.index({ bookingId: 1 });
videoCallSchema.index({ roomId: 1 }, { unique: true, sparse: true });
videoCallSchema.index({ status: 1 });
videoCallSchema.index({ startTime: -1 });

// Virtual for call duration calculation
videoCallSchema.virtual('calculatedDuration').get(function() {
  if (this.endTime && this.startTime) {
    return Math.floor((this.endTime - this.startTime) / 1000);
  }
  return 0;
});

// Method to end the call
videoCallSchema.methods.endCall = function() {
  this.status = 'ended';
  this.endTime = new Date();
  this.duration = this.calculatedDuration;
  return this.save();
};

// Method to reject the call
videoCallSchema.methods.rejectCall = function(reason = 'user_rejected') {
  this.status = 'rejected';
  this.endTime = new Date();
  this.rejectionReason = reason;
  return this.save();
};

// Method to mark as missed
videoCallSchema.methods.markAsMissed = function() {
  this.status = 'missed';
  this.endTime = new Date();
  return this.save();
};

// Method to answer the call
videoCallSchema.methods.answerCall = function() {
  this.status = 'answered';
  return this.save();
};

// Method to start screen sharing
videoCallSchema.methods.startScreenShare = function() {
  this.isScreenSharing = true;
  this.screenShareStartTime = new Date();
  return this.save();
};

// Method to stop screen sharing
videoCallSchema.methods.stopScreenShare = function() {
  this.isScreenSharing = false;
  this.screenShareEndTime = new Date();
  return this.save();
};

// Static method to get user's call history
videoCallSchema.statics.getUserCallHistory = function(userId, page = 1, limit = 20) {
  const skip = (page - 1) * limit;
  
  return this.find({
    $or: [
      { callerId: userId },
      { receiverId: userId }
    ]
  })
  .populate('callerId', 'name username avatar')
  .populate('receiverId', 'name username avatar')
  .populate('bookingId', 'title serviceType totalAmount')
  .sort({ createdAt: -1 })
  .skip(skip)
  .limit(limit);
};

// Static method to get active calls for a user
videoCallSchema.statics.getActiveCalls = function(userId) {
  return this.find({
    $or: [
      { callerId: userId },
      { receiverId: userId }
    ],
    status: { $in: ['initiated', 'ringing', 'answered'] }
  })
  .populate('callerId', 'name username avatar')
  .populate('receiverId', 'name username avatar')
  .populate('bookingId', 'title serviceType');
};

// Static method to get call statistics
videoCallSchema.statics.getCallStats = function(userId, days = 30) {
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);
  
  return this.aggregate([
    {
      $match: {
        $or: [
          { callerId: new mongoose.Types.ObjectId(userId) },
          { receiverId: new mongoose.Types.ObjectId(userId) }
        ],
        createdAt: { $gte: startDate }
      }
    },
    {
      $group: {
        _id: null,
        totalCalls: { $sum: 1 },
        answeredCalls: {
          $sum: { $cond: [{ $eq: ['$status', 'answered'] }, 1, 0] }
        },
        missedCalls: {
          $sum: { $cond: [{ $eq: ['$status', 'missed'] }, 1, 0] }
        },
        rejectedCalls: {
          $sum: { $cond: [{ $eq: ['$status', 'rejected'] }, 1, 0] }
        },
        totalDuration: { $sum: '$duration' },
        averageDuration: { $avg: '$duration' },
        totalVideoCalls: {
          $sum: { $cond: [{ $eq: ['$callType', 'video'] }, 1, 0] }
        },
        totalAudioCalls: {
          $sum: { $cond: [{ $eq: ['$callType', 'audio'] }, 1, 0] }
        }
      }
    }
  ]);
};

// Static method to get P2P call statistics
videoCallSchema.statics.getP2PCallStats = function(userId, days = 30) {
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);
  
  return this.aggregate([
    {
      $match: {
        $or: [
          { callerId: new mongoose.Types.ObjectId(userId) },
          { receiverId: new mongoose.Types.ObjectId(userId) }
        ],
        createdAt: { $gte: startDate },
        bookingId: { $exists: true, $ne: null }
      }
    },
    {
      $group: {
        _id: null,
        totalP2PCalls: { $sum: 1 },
        completedP2PCalls: {
          $sum: { $cond: [{ $eq: ['$status', 'ended'] }, 1, 0] }
        },
        totalEarnings: {
          $sum: {
            $cond: [
              { $eq: ['$status', 'ended'] },
              { $multiply: [{ $divide: ['$duration', 3600] }, '$hourlyRate'] },
              0
            ]
          }
        },
        averageCallDuration: { $avg: '$duration' }
      }
    }
  ]);
};

module.exports = mongoose.model('VideoCall', videoCallSchema);
