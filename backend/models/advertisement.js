const mongoose = require('mongoose');

const advertisementSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    companyName: {
        type: String,
        required: true,
        trim: true
    },
    title: {
        type: String,
        required: true,
        trim: true
    },
    description: {
        type: String,
        required: true
    },
    imageUrl: {
        type: String,
        required: true
    },
    websiteUrl: {
        type: String,
        default: null
    },
    pageId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Page',
        default: null
    },
    startDate: {
        type: Date,
        required: true
    },
    endDate: {
        type: Date,
        required: true
    },
    placement: {
        type: String,
        default: 'Entire Site (File Format image)'
    },
    bidding: {
        type: String,
        default: 'Pay Per Click ($0.075)'
    },
    location: {
        type: String,
        default: null
    },
    audience: {
        type: String,
        default: 'Nothing selected'
    },
    budget: {
        type: Number,
        required: true,
        min: 0
    },
    gender: {
        type: String,
        enum: ['All', 'Male', 'Female'],
        default: 'All'
    },
    status: {
        type: String,
        enum: ['active', 'paused', 'completed', 'pending'],
        default: 'active'
    },
    clicks: {
        type: Number,
        default: 0
    },
    views: {
        type: Number,
        default: 0
    }
}, {
    timestamps: true
});

// Check if advertisement is currently active based on dates
advertisementSchema.methods.isActive = function () {
    const now = new Date();
    return this.status === 'active' &&
        this.startDate <= now &&
        this.endDate >= now;
};

// Automatically update status based on dates
advertisementSchema.pre('save', function (next) {
    const now = new Date();

    if (this.endDate < now && this.status === 'active') {
        this.status = 'completed';
    }

    next();
});

module.exports = mongoose.model('Advertisement', advertisementSchema);
