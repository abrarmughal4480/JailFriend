const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
  senderId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  receiverId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  content: {
    type: String,
    required: true,
    trim: true
  },
  messageType: {
    type: String,
    enum: ['text', 'image', 'file', 'audio', 'video'],
    default: 'text'
  },
  mediaUrl: {
    type: String,
    default: ''
  },
  isRead: {
    type: Boolean,
    default: false
  },
  readAt: {
    type: Date,
    default: null
  },
  isDeleted: {
    type: Boolean,
    default: false
  },
  deletedBy: [{
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    deletedAt: {
      type: Date,
      default: Date.now
    }
  }],
  replyTo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Message',
    default: null
  },
  reactions: [{
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    reaction: {
      type: String,
      enum: ['like', 'love', 'haha', 'wow', 'sad', 'angry']
    },
    createdAt: {
      type: Date,
      default: Date.now
    }
  }],
  // P2P Context Fields
  conversationContext: {
    type: {
      type: String,
      enum: ['regular', 'p2p_service', 'p2p_booking', 'p2p_consultation'],
      default: 'regular'
    },
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
      required: false
    },
    userRole: {
      type: String,
      enum: ['client', 'service_provider'],
      required: false
    },
    source: {
      type: String,
      enum: ['p2p_browse', 'p2p_booking', 'p2p_contact', 'regular_message'],
      default: 'regular_message'
    }
  }
}, {
  timestamps: true
});

// Indexes for better query performance
messageSchema.index({ senderId: 1, receiverId: 1 });
messageSchema.index({ receiverId: 1, isRead: 1 });
messageSchema.index({ createdAt: -1 });
messageSchema.index({ isDeleted: 1 });
messageSchema.index({ 'conversationContext.type': 1 });
messageSchema.index({ 'conversationContext.bookingId': 1 });

// Virtual for conversation ID (for grouping messages between two users)
messageSchema.virtual('conversationId').get(function() {
  const sortedIds = [this.senderId.toString(), this.receiverId.toString()].sort();
  return `${sortedIds[0]}-${sortedIds[1]}`;
});

// Ensure virtual fields are serialized
messageSchema.set('toJSON', { virtuals: true });
messageSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('Message', messageSchema); 