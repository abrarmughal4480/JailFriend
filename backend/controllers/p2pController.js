const P2PProfile = require('../models/p2pProfile');
const User = require('../models/user');
const P2PCategory = require('../models/p2pCategory');

const WEEK_DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

const parseRateInput = (value) => {
  if (value === null || value === undefined || value === '') return null;
  const numericValue = typeof value === 'number' ? value : parseFloat(value);
  return Number.isFinite(numericValue) ? numericValue : null;
};

// Create or update P2P profile
const createOrUpdateProfile = async (req, res) => {
  try {
    const userId = req.user.id;
    const {
      occupation,
      hourlyRate,
      currency,
      skills,
      experience,
      availability,
      workingHours,
      timezone,
      languages,
      portfolio,
      certifications,
      responseTime,
      tags,
      socialLinks,
      categoryId,
      audioCallPrice,
      videoCallPrice,
      chatPrice,
      audioCallRate,
      videoCallRate,
      chatRate,
      availableDays
    } = req.body;

    // Validate required fields
    if (!occupation || !occupation.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Occupation is required'
      });
    }

    if (!hourlyRate || hourlyRate <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Valid hourly rate is required'
      });
    }

    if (!experience || experience.trim().length < 10) {
      return res.status(400).json({
        success: false,
        message: 'Experience description must be at least 10 characters long'
      });
    }

    let category = null;
    if (categoryId) {
      category = await P2PCategory.findById(categoryId);
      if (!category) {
        return res.status(400).json({
          success: false,
          message: 'Selected category does not exist'
        });
      }
      if (!category.isActive) {
        return res.status(400).json({
          success: false,
          message: 'Selected category is not active'
        });
      }
    }

    // Check if profile already exists
    let profile = await P2PProfile.findOne({ userId });

    const normalizedAvailableDays = Array.isArray(availableDays)
      ? availableDays.filter(day => WEEK_DAYS.includes(day))
      : undefined;

    const normalizedAudioRate = parseRateInput(audioCallRate ?? audioCallPrice);
    const normalizedVideoRate = parseRateInput(videoCallRate ?? videoCallPrice);
    const normalizedChatRate = parseRateInput(chatRate ?? chatPrice);

    const baseProfilePayload = {
      occupation: occupation.trim(),
      hourlyRate: parseFloat(hourlyRate),
      currency: currency || 'USD',
      skills: skills || [],
      experience: experience.trim(),
      availability: availability || 'Available',
      workingHours: workingHours || { start: '09:00', end: '17:00' },
      timezone: timezone || 'UTC',
      languages: languages || [],
      portfolio: portfolio || [],
      certifications: certifications || [],
      responseTime: responseTime || 'Within 24 hours',
      tags: tags || [],
      socialLinks: socialLinks || {},
      category: category ? category._id : null,
      audioCallRate: normalizedAudioRate,
      videoCallRate: normalizedVideoRate,
      chatRate: normalizedChatRate,
      audioCallPrice: audioCallPrice ?? (normalizedAudioRate !== null ? normalizedAudioRate.toString() : null),
      videoCallPrice: videoCallPrice ?? (normalizedVideoRate !== null ? normalizedVideoRate.toString() : null),
      chatPrice: chatPrice ?? (normalizedChatRate !== null ? normalizedChatRate.toString() : null)
    };

    if (profile) {
      // Update existing profile
      Object.assign(profile, baseProfilePayload);
      if (normalizedAvailableDays !== undefined) {
        profile.availableDays = normalizedAvailableDays;
      }
    } else {
      // Create new profile
      profile = new P2PProfile({
        userId,
        ...baseProfilePayload,
        availableDays: normalizedAvailableDays || []
      });
    }

    await profile.save();
    await profile.populate([
      { path: 'userId', select: 'name username avatar email' },
      { path: 'category', select: 'title description image slug' }
    ]);

    res.status(200).json({
      success: true,
      message: profile ? 'Profile updated successfully' : 'Profile created successfully',
      profile
    });
  } catch (error) {
    console.error('Error creating/updating P2P profile:', error);
    
    // Handle validation errors
    if (error.name === 'ValidationError') {
      const errors = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors
      });
    }

    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};

// Get user's own P2P profile
const getMyProfile = async (req, res) => {
  try {
    const userId = req.user.id;
    
    const profile = await P2PProfile.findOne({ userId })
      .populate('userId', 'name fullName username avatar email bio location')
      .populate('category', 'title description image slug');

    if (!profile) {
      return res.status(404).json({
        success: false,
        message: 'P2P profile not found'
      });
    }

    res.status(200).json({
      success: true,
      profile
    });
  } catch (error) {
    console.error('Error fetching P2P profile:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};

// Get all P2P profiles (for browsing)
const getAllProfiles = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      occupation,
      minRate,
      maxRate,
      category: categoryFilter,
      skills,
      sortBy = 'rating',
      sortOrder = 'desc'
    } = req.query;

    const userId = req.user?.id; // Get current user ID if authenticated

    const query = { isActive: true };
    
    // Exclude current user from results
    if (userId) {
      query.userId = { $ne: userId };
    }
    
    // Add filters
    if (occupation) {
      query.occupation = { $regex: occupation, $options: 'i' };
    }
    
    if (minRate || maxRate) {
      query.hourlyRate = {};
      if (minRate) query.hourlyRate.$gte = parseFloat(minRate);
      if (maxRate) query.hourlyRate.$lte = parseFloat(maxRate);
    }
    
    if (categoryFilter) {
      query.category = categoryFilter;
    }

    if (skills) {
      const skillArray = skills.split(',').map(skill => skill.trim());
      query.skills = { $in: skillArray };
    }

    // Sort options
    const sortOptions = {};
    if (sortBy === 'rating') {
      sortOptions['rating.average'] = sortOrder === 'desc' ? -1 : 1;
    } else if (sortBy === 'rate') {
      sortOptions.hourlyRate = sortOrder === 'desc' ? -1 : 1;
    } else if (sortBy === 'featured') {
      sortOptions.featured = sortOrder === 'desc' ? -1 : 1;
    } else {
      sortOptions.createdAt = sortOrder === 'desc' ? -1 : 1;
    }

    const profiles = await P2PProfile.find(query)
      .populate('userId', 'name fullName username avatar email bio location')
      .populate('category', 'title description image slug')
      .sort(sortOptions)
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await P2PProfile.countDocuments(query);

    res.status(200).json({
      success: true,
      profiles,
      pagination: {
        current: parseInt(page),
        pages: Math.ceil(total / limit),
        total
      }
    });
  } catch (error) {
    console.error('Error fetching P2P profiles:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};

// Get featured profiles (for top section)
const getFeaturedProfiles = async (req, res) => {
  try {
    const userId = req.user?.id; // Get current user ID if authenticated
    
    const query = { 
      isActive: true, 
      featured: true 
    };
    
    // Exclude current user from featured results
    if (userId) {
      query.userId = { $ne: userId };
    }
    
    const profiles = await P2PProfile.find(query)
      .populate('userId', 'name fullName username avatar email bio location')
      .populate('category', 'title description image slug')
      .sort({ 'rating.average': -1 })
      .limit(6);

    res.status(200).json({
      success: true,
      profiles
    });
  } catch (error) {
    console.error('Error fetching featured profiles:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};

// Get profile by ID
const getProfileById = async (req, res) => {
  try {
    const { profileId } = req.params;
    
    const profile = await P2PProfile.findById(profileId)
      .populate('userId', 'name fullName username avatar email bio location')
      .populate('category', 'title description image slug');

    if (!profile) {
      return res.status(404).json({
        success: false,
        message: 'Profile not found'
      });
    }

    res.status(200).json({
      success: true,
      profile
    });
  } catch (error) {
    console.error('Error fetching profile:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};

// Search profiles
const searchProfiles = async (req, res) => {
  try {
    const { q, page = 1, limit = 10 } = req.query;
    const userId = req.user?.id; // Get current user ID if authenticated
    
    if (!q) {
      return res.status(400).json({
        success: false,
        message: 'Search query is required'
      });
    }

    const query = {
      isActive: true,
      $or: [
        { occupation: { $regex: q, $options: 'i' } },
        { skills: { $in: [new RegExp(q, 'i')] } },
        { experience: { $regex: q, $options: 'i' } },
        { tags: { $in: [new RegExp(q, 'i')] } }
      ]
    };
    
    // Exclude current user from search results
    if (userId) {
      query.userId = { $ne: userId };
    }

    const profiles = await P2PProfile.find(query)
      .populate('userId', 'name fullName username avatar email bio location')
      .populate('category', 'title description image slug')
      .sort({ 'rating.average': -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await P2PProfile.countDocuments(query);

    res.status(200).json({
      success: true,
      profiles,
      pagination: {
        current: parseInt(page),
        pages: Math.ceil(total / limit),
        total
      }
    });
  } catch (error) {
    console.error('Error searching profiles:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};

// Update profile status
const updateProfileStatus = async (req, res) => {
  try {
    const userId = req.user.id;
    const { availability, isActive } = req.body;

    const profile = await P2PProfile.findOne({ userId });
    
    if (!profile) {
      return res.status(404).json({
        success: false,
        message: 'Profile not found'
      });
    }

    if (availability !== undefined) profile.availability = availability;
    if (isActive !== undefined) profile.isActive = isActive;

    await profile.save();

    res.status(200).json({
      success: true,
      message: 'Profile status updated successfully',
      profile
    });
  } catch (error) {
    console.error('Error updating profile status:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};

// Delete profile
const deleteProfile = async (req, res) => {
  try {
    const userId = req.user.id;

    const profile = await P2PProfile.findOneAndDelete({ userId });
    
    if (!profile) {
      return res.status(404).json({
        success: false,
        message: 'Profile not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Profile deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting profile:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};

module.exports = {
  createOrUpdateProfile,
  getMyProfile,
  getAllProfiles,
  getFeaturedProfiles,
  getProfileById,
  searchProfiles,
  updateProfileStatus,
  deleteProfile
};
