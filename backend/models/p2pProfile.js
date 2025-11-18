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
  currentOrganisation: { 
    type: String, 
    default: null,
    maxlength: 100 
  },
  workExperience: { 
    type: String, 
    default: null,
    maxlength: 500 
  },
  aboutMeLocation: { 
    type: String, 
    default: null,
    maxlength: 100 
  },
  description: { 
    type: String, 
    default: null,
    maxlength: 200 
  },
  areasOfExpertise: [{ 
    type: String, 
    maxlength: 50 
  }],
  hourlyRate: { 
    type: Number, 
    required: true,
    min: 0 
  },
  // Call rates (multipliers for hourly rate)
  audioCallRate: { 
    type: Number, 
    default: null,
    min: 0 
  },
  videoCallRate: { 
    type: Number, 
    default: null,
    min: 0 
  },
  chatRate: { 
    type: Number, 
    default: null,
    min: 0 
  },
  // Legacy fields for backward compatibility (kept as String for now)
  audioCallPrice: { 
    type: String, 
    default: null 
  },
  videoCallPrice: { 
    type: String, 
    default: null 
  },
  chatPrice: { 
    type: String, 
    default: null 
  },
  currency: { 
    type: String, 
    default: 'USD',
    enum: ['USD', 'INR']
  },
  skills: [{
    type: String,
    maxlength: 50
  }],
  category: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'P2PCategory',
    default: null
  },
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
  availableFromTime: { 
    type: String, 
    default: null 
  },
  availableToTime: { 
    type: String, 
    default: null 
  },
  availableDays: [{
    type: String,
    enum: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']
  }],
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
    linkedInLink: { type: String },
    instagramLink: { type: String },
    twitterLink: { type: String },
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
p2pProfileSchema.index({ category: 1 });

module.exports = mongoose.model('P2PProfile', p2pProfileSchema);
