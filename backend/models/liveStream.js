const mongoose = require('mongoose');

const liveStreamSchema = new mongoose.Schema({
    hostId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    title: {
        type: String,
        required: true,
        trim: true
    },
    description: {
        type: String,
        trim: true
    },
    status: {
        type: String,
        enum: ['live', 'ended', 'scheduled'],
        default: 'live'
    },
    viewerCount: {
        type: Number,
        default: 0
    },
    viewers: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }],
    invitees: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }],
    guests: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }],
    startedAt: {
        type: Date,
        default: Date.now
    },
    endedAt: {
        type: Date
    },
    thumbnail: {
        type: String
    },
    category: {
        type: String,
        default: 'general'
    },
    settings: {
        allowComments: { type: Boolean, default: true },
        allowReactions: { type: Boolean, default: true },
        isPrivate: { type: Boolean, default: false }
    },
    recordingUrl: {
        type: String
    }
}, {
    timestamps: true
});

// Indexes for better performance
liveStreamSchema.index({ hostId: 1, status: 1 });
liveStreamSchema.index({ status: 1 });

const LiveStream = mongoose.model('LiveStream', liveStreamSchema);

module.exports = LiveStream;
