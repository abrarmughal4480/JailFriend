const mongoose = require('mongoose');

const p2pProfileSchema = new mongoose.Schema({
  userId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true,
    unique: true 
  },
  occupation: { 
    type: String, 
    required: true,
    maxlength: 100 
  },
  hourlyRate: { 
    type: Number, 
    required: true,
    min: 0 
  },
  currency: { 
    type: String, 
    default: 'USD',
    enum: ['USD', 'PKR', 'EUR', 'GBP', 'INR']
  },
  skills: [{
    type: String,
    maxlength: 50
  }],
  experience: { 
    type: String, 
    required: true,
    minlength: 10,
    maxlength: 500 
  },
  availability: {
    type: String,
    enum: ['Available', 'Busy', 'Away'],
    default: 'Available'
  },
  workingHours: {
    start: { type: String, default: '09:00' },
    end: { type: String, default: '17:00' }
  },
  timezone: { 
    type: String, 
    default: 'UTC' 
  },
  languages: [{
    language: { type: String, required: true },
    proficiency: { 
      type: String, 
      enum: ['Beginner', 'Intermediate', 'Advanced', 'Native'],
      default: 'Intermediate'
    }
  }],
  portfolio: [{
    title: { type: String, required: true },
    description: { type: String },
    url: { type: String },
    image: { type: String }
  }],
  certifications: [{
    name: { type: String, required: true },
    issuer: { type: String },
    date: { type: Date },
    credentialId: { type: String }
  }],
  rating: {
    average: { type: Number, default: 0, min: 0, max: 5 },
    count: { type: Number, default: 0 }
  },
  completedJobs: { type: Number, default: 0 },
  responseTime: { type: String, default: 'Within 24 hours' },
  isActive: { type: Boolean, default: true },
  isVerified: { type: Boolean, default: false },
  featured: { type: Boolean, default: false },
  tags: [{
    type: String,
    maxlength: 30
  }],
  socialLinks: {
    website: { type: String },
    linkedin: { type: String },
    github: { type: String },
    behance: { type: String }
  }
}, {
  timestamps: true
});

// Index for better search performance
p2pProfileSchema.index({ occupation: 'text', skills: 'text', experience: 'text' });
p2pProfileSchema.index({ hourlyRate: 1 });
p2pProfileSchema.index({ rating: -1 });
p2pProfileSchema.index({ featured: 1, isActive: 1 });

module.exports = mongoose.model('P2PProfile', p2pProfileSchema);
