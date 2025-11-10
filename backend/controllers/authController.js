const User = require('../models/user');
const P2PProfile = require('../models/p2pProfile');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');

exports.registerUser = async (req, res) => {
  const { name, email, password, username, gender } = req.body;
  if (!username || !email || !password) {
    return res.status(400).json({ message: 'Username, email, and password are required' });
  }
  
  // Check if database is connected
  if (mongoose.connection.readyState !== 1) {
    console.log('Database connection state:', mongoose.connection.readyState);
    console.log('Attempting to reconnect...');
    
    try {
      await mongoose.connect(process.env.MONGO_URI);
      console.log('Reconnected to database successfully');
    } catch (reconnectError) {
      console.error('Reconnection failed:', reconnectError.message);
      return res.status(503).json({ 
        message: 'Database not connected. Please check your MongoDB connection.',
        error: 'Database connection required'
      });
    }
  }
  
  try {
    let user = await User.findOne({ $or: [{ email }, { username }] });
    if (user) return res.status(400).json({ message: 'User already exists' });

    const hashedPassword = await bcrypt.hash(password, 10);
    
    // Ensure name is provided to satisfy validation
    const userName = name || username; // Use username as fallback if name is not provided
    
    user = new User({ 
      name: userName, 
      email, 
      password: hashedPassword, 
      username,
      gender: gender || 'Prefer not to say'
    });
    await user.save();

    // Generate JWT token after registration
    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET || 'your-super-secret-jwt-key-for-development-only', { expiresIn: '7d' });

    res.status(201).json({
      message: 'User registered successfully',
      token,
      isSetupDone: user.isSetupDone
    });
  } catch (err) {
    console.error('Registration error:', err);
    console.error('Error details:', {
      name: err.name,
      message: err.message,
      stack: err.stack,
      code: err.code
    });
    
    // Provide more specific error messages
    if (err.name === 'ValidationError') {
      return res.status(400).json({ 
        message: 'Validation error', 
        error: err.message,
        details: Object.values(err.errors).map(e => e.message)
      });
    }
    
    if (err.code === 11000) {
      return res.status(400).json({ 
        message: 'User already exists with this email or username',
        error: 'Duplicate key error'
      });
    }
    
    res.status(500).json({ 
      message: 'Server error', 
      error: err.message,
      details: process.env.NODE_ENV === 'development' ? err.stack : undefined
    });
  }
};

exports.login = async (req, res) => {
  const { username, email, password } = req.body;
  if (!password) {
    return res.status(400).json({ message: 'Password is required' });
  }
  
  // Check if either username or email is provided
  if (!username && !email) {
    return res.status(400).json({ message: 'Username or email is required' });
  }
  
  try {
    // Try to find user by username or email
    let user;
    if (username) {
      user = await User.findOne({ username });
    } else if (email) {
      user = await User.findOne({ email });
    }
    
    if (!user) return res.status(400).json({ message: 'Invalid credentials' });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ message: 'Invalid credentials' });

    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET || 'your-super-secret-jwt-key-for-development-only', { expiresIn: '7d' });

    res.json({
      token,
      isSetupDone: user.isSetupDone,
      message: 'Login successful',
      user: {
        _id: user._id,
        email: user.email,
        avatar: user.avatar,
        name: user.name,
        username: user.username
      }
    });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

exports.setupProfile = async (req, res) => {
  const { 
    avatar, 
    fullName, 
    bio, 
    location,
    workExperience,
    currentOrganisation,
    aboutMeLocation,
    description,
    areasOfExpertise,
    audioCallPrice,
    videoCallPrice,
    chatPrice,
    linkedInLink,
    instagramLink,
    twitterLink,
    availableFromTime,
    availableToTime,
    stepNumber,
    skipped 
  } = req.body;
  
  try {
    const user = await User.findById(req.userId);
    if (!user) return res.status(404).json({ message: 'User not found' });

    // Step 1: Media (Avatar) - only process if this is step 1
    if (stepNumber === 1 && avatar !== undefined && avatar) {
      const oldAvatar = user.avatar;
      const newAvatar = avatar;
      
      // Only delete old avatar if it's different from new one and not a default avatar
      if (oldAvatar && oldAvatar !== newAvatar && 
          !oldAvatar.includes('/avatars/') && 
          oldAvatar !== '/avatars/1.png.png' &&
          oldAvatar !== '/default-avatar.svg') {
        try {
          const { deleteFromCloudinary, isCloudinaryConfigured } = require('../config/cloudinary');
          const fs = require('fs');
          const path = require('path');
          
          // Check if it's a Cloudinary URL
          if (isCloudinaryConfigured && oldAvatar.includes('cloudinary.com')) {
            // Extract public ID from Cloudinary URL
            // Format: https://res.cloudinary.com/cloud_name/image/upload/v1234567890/folder/filename.jpg
            const urlParts = oldAvatar.split('/');
            const uploadIndex = urlParts.findIndex(part => part === 'upload');
            if (uploadIndex !== -1 && uploadIndex < urlParts.length - 1) {
              // Get everything after 'upload' and before the extension
              const publicIdWithVersion = urlParts.slice(uploadIndex + 1).join('/');
              // Remove version if present (format: v1234567890/folder/filename)
              const publicId = publicIdWithVersion.replace(/^v\d+\//, '').split('.')[0];
              await deleteFromCloudinary(publicId);
              console.log(`✅ Deleted old Cloudinary avatar: ${publicId}`);
            }
          } else if (oldAvatar.includes('/uploads/') || oldAvatar.includes('uploads\\')) {
            // Delete local file
            try {
              const cleanPath = oldAvatar.replace(/\\/g, '/').replace(/^\/+/, '');
              const filePath = path.join(__dirname, '..', cleanPath);
              if (fs.existsSync(filePath)) {
                fs.unlinkSync(filePath);
                console.log(`✅ Deleted old local avatar: ${filePath}`);
              }
            } catch (localError) {
              console.log('Could not delete old local avatar:', localError.message);
            }
          }
        } catch (deleteError) {
          console.log('Could not delete old profile photo:', deleteError.message);
          // Continue even if deletion fails
        }
      }
      
      // Update avatar
      user.avatar = newAvatar;
    }

    // Step 2: Info - only process if this is step 2
    if (stepNumber === 2) {
      if (fullName !== undefined) user.fullName = fullName || null;
      if (bio !== undefined) user.bio = bio || null;
      if (location !== undefined) user.location = location || null;
    }

    // Step 3-7: P2P Profile fields - save directly to P2PProfile, not User model
    // These will be handled in the P2P profile creation/update below

    // Mark setup as done when step 9 is completed (final step)
    if (stepNumber >= 9) {
      user.isSetupDone = true;
    }
    
    await user.save();

    // Also update UserImage model to keep it synchronized
    const UserImage = require('../models/userImage');
    let userImage = await UserImage.findOne({ userId: req.userId });
    
    if (!userImage) {
      userImage = new UserImage({ userId: req.userId });
    }
    
    if (avatar !== undefined) {
      userImage.avatar = avatar || userImage.avatar;
    }
    await userImage.save();

    // Auto-create/update P2P Profile when relevant fields are filled
    // Step 3-7: Save directly to P2PProfile model
    if (stepNumber >= 3 && stepNumber <= 7) {
      try {
        await createOrUpdateP2PProfileFromSetup(req.userId, {
          stepNumber,
          skipped,
          workExperience,
          currentOrganisation,
          aboutMeLocation,
          description,
          areasOfExpertise,
          audioCallPrice,
          videoCallPrice,
          chatPrice,
          availableFromTime,
          availableToTime,
          linkedInLink,
          instagramLink,
          twitterLink
        });
        console.log(`✅ P2P profile updated for step ${stepNumber} for user ${req.userId}`);
      } catch (p2pError) {
        console.error('⚠️ Error creating/updating P2P profile:', p2pError.message);
        // Don't fail the request if P2P profile creation fails
      }
    } else if (stepNumber === 5 && skipped) {
      // If user skips pricing step, delete P2P profile if it exists
      try {
        await P2PProfile.findOneAndDelete({ userId: req.userId });
        console.log(`✅ P2P profile deleted for user ${req.userId} (pricing skipped)`);
      } catch (p2pError) {
        console.error('⚠️ Error deleting P2P profile:', p2pError.message);
      }
    }

    console.log(`✅ Step ${stepNumber} ${skipped ? 'skipped' : 'completed'} for user ${req.userId}`);
    res.json({ 
      message: `Step ${stepNumber} ${skipped ? 'skipped' : 'completed'} successfully`,
      stepNumber,
      skipped: skipped || false
    });
  } catch (err) {
    console.error('❌ Setup profile error:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// Helper function to create/update P2P Profile from setup form data
async function createOrUpdateP2PProfileFromSetup(userId, data) {
  const { 
    stepNumber, 
    skipped,
    workExperience,
    currentOrganisation,
    aboutMeLocation,
    description,
    areasOfExpertise,
    audioCallPrice,
    videoCallPrice,
    chatPrice,
    availableFromTime,
    availableToTime,
    linkedInLink,
    instagramLink,
    twitterLink
  } = data;

  // Check if P2P profile already exists
  let p2pProfile = await P2PProfile.findOne({ userId });

  // Step 3: About Me
  if (stepNumber === 3) {
    if (!p2pProfile) {
      // Create new profile with basic required fields
      p2pProfile = new P2PProfile({
        userId,
        occupation: 'Professional',
        hourlyRate: 100,
        experience: 'Professional',
        currency: 'INR',
        availability: 'Available',
        workingHours: { start: '09:00', end: '17:00' },
        timezone: 'UTC',
        languages: [],
        portfolio: [],
        certifications: [],
        responseTime: 'Within 24 hours',
        tags: [],
        socialLinks: {},
        isActive: true
      });
    }
    
    if (skipped) {
      p2pProfile.workExperience = null;
      p2pProfile.currentOrganisation = null;
      p2pProfile.aboutMeLocation = null;
      p2pProfile.description = null;
    } else {
      if (workExperience !== undefined) p2pProfile.workExperience = workExperience || null;
      if (currentOrganisation !== undefined) {
        p2pProfile.currentOrganisation = currentOrganisation || null;
        // Also update occupation if currentOrganisation is provided
        if (currentOrganisation) p2pProfile.occupation = currentOrganisation;
      }
      if (aboutMeLocation !== undefined) p2pProfile.aboutMeLocation = aboutMeLocation || null;
      if (description !== undefined) {
        p2pProfile.description = description || null;
        // Also update experience if description is provided
        if (description) p2pProfile.experience = description;
      }
    }
  }

  // Step 4: My Expertise
  if (stepNumber === 4) {
    if (!p2pProfile) {
      p2pProfile = new P2PProfile({
        userId,
        occupation: 'Professional',
        hourlyRate: 100,
        experience: 'Professional',
        currency: 'INR',
        availability: 'Available',
        workingHours: { start: '09:00', end: '17:00' },
        timezone: 'UTC',
        languages: [],
        portfolio: [],
        certifications: [],
        responseTime: 'Within 24 hours',
        tags: [],
        socialLinks: {},
        isActive: true
      });
    }
    
    if (skipped) {
      p2pProfile.areasOfExpertise = [];
      p2pProfile.skills = [];
      p2pProfile.tags = [];
    } else {
      if (areasOfExpertise !== undefined) {
        const expertiseArray = Array.isArray(areasOfExpertise) ? areasOfExpertise : [];
        p2pProfile.areasOfExpertise = expertiseArray;
        p2pProfile.skills = expertiseArray;
        p2pProfile.tags = expertiseArray;
      }
    }
  }

  // Step 5: Pricing Details
  if (stepNumber === 5) {
    if (skipped) {
      // Delete profile if pricing is skipped
      if (p2pProfile) {
        await P2PProfile.findOneAndDelete({ userId });
        return;
      }
    } else {
      if (!p2pProfile) {
        // Create new profile with required fields
        p2pProfile = new P2PProfile({
          userId,
          occupation: currentOrganisation || 'Professional',
          hourlyRate: 100, // Will be calculated below
          experience: description || workExperience || 'Professional',
          currency: 'INR',
          availability: 'Available',
          workingHours: { 
            start: availableFromTime || '09:00', 
            end: availableToTime || '17:00' 
          },
          timezone: 'UTC',
          languages: [],
          portfolio: [],
          certifications: [],
          responseTime: 'Within 24 hours',
          tags: areasOfExpertise || [],
          skills: areasOfExpertise || [],
          areasOfExpertise: areasOfExpertise || [],
          socialLinks: {},
          isActive: true
        });
      }

      // Update pricing fields
      if (audioCallPrice !== undefined) p2pProfile.audioCallPrice = audioCallPrice || null;
      if (videoCallPrice !== undefined) p2pProfile.videoCallPrice = videoCallPrice || null;
      if (chatPrice !== undefined) p2pProfile.chatPrice = chatPrice || null;

      // Calculate hourly rate from prices (use first available price)
      let hourlyRate = 0;
      if (audioCallPrice) {
        hourlyRate = parseFloat(audioCallPrice.replace(/[₹,\s]/g, '')) || 0;
      } else if (videoCallPrice) {
        hourlyRate = parseFloat(videoCallPrice.replace(/[₹,\s]/g, '')) || 0;
      } else if (chatPrice) {
        hourlyRate = parseFloat(chatPrice.replace(/[₹,\s]/g, '')) || 0;
      }

      // If hourly rate is 0 or invalid, set a default
      if (hourlyRate <= 0) {
        hourlyRate = 100; // Default rate
      }
      p2pProfile.hourlyRate = hourlyRate;
    }
  }

  // Step 6: Available Time
  if (stepNumber === 6) {
    if (!p2pProfile) {
      p2pProfile = new P2PProfile({
        userId,
        occupation: currentOrganisation || 'Professional',
        hourlyRate: 100,
        experience: description || workExperience || 'Professional',
        currency: 'INR',
        availability: 'Available',
        workingHours: { start: '09:00', end: '17:00' },
        timezone: 'UTC',
        languages: [],
        portfolio: [],
        certifications: [],
        responseTime: 'Within 24 hours',
        tags: areasOfExpertise || [],
        skills: areasOfExpertise || [],
        areasOfExpertise: areasOfExpertise || [],
        socialLinks: {},
        isActive: true
      });
    }
    
    if (skipped) {
      p2pProfile.availableFromTime = null;
      p2pProfile.availableToTime = null;
      p2pProfile.workingHours = { start: '09:00', end: '17:00' };
    } else {
      if (availableFromTime !== undefined) {
        p2pProfile.availableFromTime = availableFromTime || null;
        if (availableFromTime) p2pProfile.workingHours.start = availableFromTime;
      }
      if (availableToTime !== undefined) {
        p2pProfile.availableToTime = availableToTime || null;
        if (availableToTime) p2pProfile.workingHours.end = availableToTime;
      }
    }
  }

  // Step 7: Social Media Links
  if (stepNumber === 7) {
    if (!p2pProfile) {
      p2pProfile = new P2PProfile({
        userId,
        occupation: currentOrganisation || 'Professional',
        hourlyRate: 100,
        experience: description || workExperience || 'Professional',
        currency: 'INR',
        availability: 'Available',
        workingHours: { 
          start: availableFromTime || '09:00', 
          end: availableToTime || '17:00' 
        },
        timezone: 'UTC',
        languages: [],
        portfolio: [],
        certifications: [],
        responseTime: 'Within 24 hours',
        tags: areasOfExpertise || [],
        skills: areasOfExpertise || [],
        areasOfExpertise: areasOfExpertise || [],
        socialLinks: {},
        isActive: true
      });
    }
    
    if (skipped) {
      p2pProfile.socialLinks.linkedInLink = null;
      p2pProfile.socialLinks.instagramLink = null;
      p2pProfile.socialLinks.twitterLink = null;
    } else {
      if (linkedInLink !== undefined) {
        p2pProfile.socialLinks.linkedInLink = linkedInLink || null;
        p2pProfile.socialLinks.linkedin = linkedInLink || null; // Keep both for compatibility
      }
      if (instagramLink !== undefined) {
        p2pProfile.socialLinks.instagramLink = instagramLink || null;
      }
      if (twitterLink !== undefined) {
        p2pProfile.socialLinks.twitterLink = twitterLink || null;
      }
    }
  }

  if (p2pProfile) {
    await p2pProfile.save();
    return p2pProfile;
  }
}

exports.getUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.userId);
    if (!user) return res.status(404).json({ message: 'User not found' });

    // P2P Profile fields are now in P2PProfile model, not User model
    // Get P2P profile if exists
    const p2pProfile = await P2PProfile.findOne({ userId: req.userId });
    
    // Return P2P profile fields if available
    const p2pFields = p2pProfile ? {
      workExperience: p2pProfile.workExperience || null,
      currentOrganisation: p2pProfile.currentOrganisation || null,
      aboutMeLocation: p2pProfile.aboutMeLocation || null,
      description: p2pProfile.description || null,
      areasOfExpertise: p2pProfile.areasOfExpertise || [],
      audioCallPrice: p2pProfile.audioCallPrice || null,
      videoCallPrice: p2pProfile.videoCallPrice || null,
      chatPrice: p2pProfile.chatPrice || null,
      linkedInLink: p2pProfile.socialLinks?.linkedInLink || null,
      instagramLink: p2pProfile.socialLinks?.instagramLink || null,
      twitterLink: p2pProfile.socialLinks?.twitterLink || null,
      availableFromTime: p2pProfile.availableFromTime || null,
      availableToTime: p2pProfile.availableToTime || null,
    } : {
      workExperience: null,
      currentOrganisation: null,
      aboutMeLocation: null,
      description: null,
      areasOfExpertise: [],
      audioCallPrice: null,
      videoCallPrice: null,
      chatPrice: null,
      linkedInLink: null,
      instagramLink: null,
      twitterLink: null,
      availableFromTime: null,
      availableToTime: null,
    };

    res.json({
      avatar: user.avatar,
      fullName: user.fullName,
      email: user.email,
      bio: user.bio,
      location: user.location,
      ...p2pFields,
      isSetupDone: user.isSetupDone || false
    });
  } catch (err) {
    console.error('❌ Get user profile error:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};
