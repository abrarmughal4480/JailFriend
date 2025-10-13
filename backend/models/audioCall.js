const mongoose = require('mongoose');

const audioCallSchema = new mongoose.Schema({
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
  status: {
    type: String,
    enum: ['initiated', 'ringing', 'answered', 'rejected', 'ended', 'missed', 'cancelled'],
    default: 'initiated'
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
  callType: {
    type: String,
    enum: ['audio', 'video'],
    default: 'audio'
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
    connectionQuality: {
      type: String,
      enum: ['excellent', 'good', 'fair', 'poor'],
      default: 'good'
    }
  },
  // Call metadata
  deviceInfo: {
    userAgent: String,
    platform: String
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
    }
  }]
}, {
  timestamps: true
});

// Indexes for better query performance
audioCallSchema.index({ callerId: 1, createdAt: -1 });
audioCallSchema.index({ receiverId: 1, createdAt: -1 });
audioCallSchema.index({ status: 1 });
audioCallSchema.index({ startTime: -1 });

// Virtual for call duration calculation
audioCallSchema.virtual('calculatedDuration').get(function() {
  if (this.endTime && this.startTime) {
    return Math.floor((this.endTime - this.startTime) / 1000);
  }
  return 0;
});

// Method to end the call
audioCallSchema.methods.endCall = function() {
  this.status = 'ended';
  this.endTime = new Date();
  this.duration = this.calculatedDuration;
  return this.save();
};

// Method to reject the call
audioCallSchema.methods.rejectCall = function(reason = 'user_rejected') {
  this.status = 'rejected';
  this.endTime = new Date();
  this.rejectionReason = reason;
  return this.save();
};

// Method to mark as missed
audioCallSchema.methods.markAsMissed = function() {
  this.status = 'missed';
  this.endTime = new Date();
  return this.save();
};

// Static method to get user's call history
audioCallSchema.statics.getUserCallHistory = function(userId, page = 1, limit = 20) {
  const skip = (page - 1) * limit;
  
  return this.find({
    $or: [
      { callerId: userId },
      { receiverId: userId }
    ]
  })
  .populate('callerId', 'name username avatar')
  .populate('receiverId', 'name username avatar')
  .sort({ createdAt: -1 })
  .skip(skip)
  .limit(limit);
};

// Static method to get active calls for a user
audioCallSchema.statics.getActiveCalls = function(userId) {
  return this.find({
    $or: [
      { callerId: userId },
      { receiverId: userId }
    ],
    status: { $in: ['initiated', 'ringing', 'answered'] }
  })
  .populate('callerId', 'name username avatar')
  .populate('receiverId', 'name username avatar');
};

// Static method to get call statistics
audioCallSchema.statics.getCallStats = function(userId, days = 30) {
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
        averageDuration: { $avg: '$duration' }
      }
    }
  ]);
};

module.exports = mongoose.model('AudioCall', audioCallSchema);
