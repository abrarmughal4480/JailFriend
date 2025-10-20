const mongoose = require('mongoose');

const conversationSchema = new mongoose.Schema({
  participants: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }],
  conversationId: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  lastMessage: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Message'
  },
  lastMessageAt: {
    type: Date,
    default: Date.now
  },
  // Enhanced P2P Context
  conversationType: {
    type: String,
    enum: ['regular', 'p2p_service', 'p2p_booking', 'p2p_consultation'],
    default: 'regular'
  },
  p2pContext: {
    bookingId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Booking',
      default: null
    },
    p2pProfileId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'P2PProfile',
      default: null
    },
    serviceType: {
      type: String,
      enum: ['consultation', 'project', 'hourly', 'fixed_price'],
      default: null
    },
    serviceProviderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null
    },
    clientId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null
    },
    source: {
      type: String,
      enum: ['p2p_browse', 'p2p_booking', 'p2p_contact', 'regular_message'],
      default: 'regular_message'
    },
    hourlyRate: {
      type: Number,
      default: null
    },
    currency: {
      type: String,
      default: null
    },
    serviceTitle: {
      type: String,
      default: null
    }
  },
  // Legacy fields for backward compatibility
  isP2PUser: {
    type: Boolean,
    default: false
  },
  p2pUserId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  unreadCount: {
    type: Map,
    of: Number,
    default: new Map()
  },
  isPinned: {
    type: Boolean,
    default: false
  },
  isArchived: {
    type: Boolean,
    default: false
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Update the updatedAt field before saving
conversationSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

// Index for efficient queries
conversationSchema.index({ conversationId: 1 });
conversationSchema.index({ participants: 1 });
conversationSchema.index({ lastMessageAt: -1 });
conversationSchema.index({ conversationType: 1 });
conversationSchema.index({ 'p2pContext.bookingId': 1 });
conversationSchema.index({ 'p2pContext.serviceProviderId': 1 });
conversationSchema.index({ 'p2pContext.clientId': 1 });

module.exports = mongoose.model('Conversation', conversationSchema);
