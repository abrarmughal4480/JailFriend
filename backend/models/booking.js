const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema({
  clientId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  serviceProviderId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  p2pProfileId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'P2PProfile',
    required: true
  },
  serviceType: {
    type: String,
    required: true,
    enum: ['consultation', 'project', 'hourly', 'fixed_price']
  },
  title: {
    type: String,
    required: true,
    maxlength: 200
  },
  description: {
    type: String,
    required: true,
    maxlength: 1000
  },
  scheduledDate: {
    type: Date,
    required: true
  },
  duration: {
    type: Number, // Duration in minutes
    required: true,
    min: 15,
    max: 480 // Max 8 hours
  },
  hourlyRate: {
    type: Number,
    required: true,
    min: 0
  },
  totalAmount: {
    type: Number,
    required: true,
    min: 0
  },
  currency: {
    type: String,
    default: 'USD',
    enum: ['USD', 'PKR', 'EUR', 'GBP', 'INR']
  },
  status: {
    type: String,
    enum: ['pending', 'accepted', 'rejected', 'in_progress', 'completed', 'cancelled', 'disputed'],
    default: 'pending'
  },
  // Video call details
  videoCallId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'VideoCall'
  },
  callLink: {
    type: String
  },
  // Payment details
  paymentStatus: {
    type: String,
    enum: ['pending', 'paid', 'refunded', 'failed'],
    default: 'pending'
  },
  paymentMethod: {
    type: String,
    enum: ['stripe', 'paypal', 'bank_transfer', 'cash']
  },
  paymentId: {
    type: String
  },
  // Booking metadata
  requirements: [{
    type: String,
    maxlength: 200
  }],
  deliverables: [{
    type: String,
    maxlength: 200
  }],
  attachments: [{
    filename: String,
    url: String,
    uploadedAt: {
      type: Date,
      default: Date.now
    }
  }],
  // Communication
  messages: [{
    senderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    message: String,
    timestamp: {
      type: Date,
      default: Date.now
    },
    isSystemMessage: {
      type: Boolean,
      default: false
    }
  }],
  // Timestamps
  acceptedAt: Date,
  startedAt: Date,
  completedAt: Date,
  cancelledAt: Date,
  cancellationReason: String,
  // Reviews
  clientReview: {
    rating: {
      type: Number,
      min: 1,
      max: 5
    },
    comment: String,
    createdAt: Date
  },
  providerReview: {
    rating: {
      type: Number,
      min: 1,
      max: 5
    },
    comment: String,
    createdAt: Date
  }
}, {
  timestamps: true
});

// Indexes for better query performance
bookingSchema.index({ clientId: 1, createdAt: -1 });
bookingSchema.index({ serviceProviderId: 1, createdAt: -1 });
bookingSchema.index({ status: 1 });
bookingSchema.index({ scheduledDate: 1 });
bookingSchema.index({ p2pProfileId: 1 });

// Virtual for calculating total amount based on duration and hourly rate
bookingSchema.virtual('calculatedAmount').get(function() {
  if (this.serviceType === 'hourly') {
    return (this.duration / 60) * this.hourlyRate;
  }
  return this.totalAmount;
});

// Method to accept booking
bookingSchema.methods.acceptBooking = function() {
  this.status = 'accepted';
  this.acceptedAt = new Date();
  return this.save();
};

// Method to reject booking
bookingSchema.methods.rejectBooking = function(reason) {
  this.status = 'rejected';
  this.cancellationReason = reason;
  this.cancelledAt = new Date();
  return this.save();
};

// Method to start booking
bookingSchema.methods.startBooking = function() {
  this.status = 'in_progress';
  this.startedAt = new Date();
  return this.save();
};

// Method to complete booking
bookingSchema.methods.completeBooking = function() {
  this.status = 'completed';
  this.completedAt = new Date();
  return this.save();
};

// Method to cancel booking
bookingSchema.methods.cancelBooking = function(reason) {
  this.status = 'cancelled';
  this.cancellationReason = reason;
  this.cancelledAt = new Date();
  return this.save();
};

// Static method to get user's bookings
bookingSchema.statics.getUserBookings = function(userId, userType = 'client', page = 1, limit = 20) {
  const skip = (page - 1) * limit;
  const query = userType === 'client' ? { clientId: userId } : { serviceProviderId: userId };
  
  return this.find(query)
    .populate('clientId', 'name username avatar')
    .populate('serviceProviderId', 'name username avatar')
    .populate('p2pProfileId', 'occupation hourlyRate currency')
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit);
};

// Static method to get upcoming bookings
bookingSchema.statics.getUpcomingBookings = function(userId, userType = 'client') {
  const query = userType === 'client' ? { clientId: userId } : { serviceProviderId: userId };
  
  return this.find({
    ...query,
    status: { $in: ['accepted', 'in_progress'] },
    scheduledDate: { $gte: new Date() }
  })
  .populate('clientId', 'name username avatar')
  .populate('serviceProviderId', 'name username avatar')
  .populate('p2pProfileId', 'occupation hourlyRate currency')
  .sort({ scheduledDate: 1 });
};

// Static method to get booking statistics
bookingSchema.statics.getBookingStats = function(userId, userType = 'client', days = 30) {
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);
  
  const query = userType === 'client' ? { clientId: userId } : { serviceProviderId: userId };
  
  return this.aggregate([
    {
      $match: {
        ...query,
        createdAt: { $gte: startDate }
      }
    },
    {
      $group: {
        _id: null,
        totalBookings: { $sum: 1 },
        completedBookings: {
          $sum: { $cond: [{ $eq: ['$status', 'completed'] }, 1, 0] }
        },
        cancelledBookings: {
          $sum: { $cond: [{ $eq: ['$status', 'cancelled'] }, 1, 0] }
        },
        totalEarnings: {
          $sum: { $cond: [{ $eq: ['$status', 'completed'] }, '$totalAmount', 0] }
        },
        averageBookingValue: { $avg: '$totalAmount' }
      }
    }
  ]);
};

module.exports = mongoose.model('Booking', bookingSchema);
