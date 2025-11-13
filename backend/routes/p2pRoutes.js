const express = require('express');
const router = express.Router();
const authMiddleware = require('../middlewares/authMiddleware');
const {
  createOrUpdateProfile,
  getMyProfile,
  getAllProfiles,
  getFeaturedProfiles,
  getProfileById,
  searchProfiles,
  updateProfileStatus,
  deleteProfile
} = require('../controllers/p2pController');

// Optional auth middleware for public routes that need user context
const optionalAuthMiddleware = (req, res, next) => {
  // Try to authenticate, but don't fail if no token
  const token = req.header('Authorization')?.replace('Bearer ', '');
  if (token) {
    // If token exists, use auth middleware
    return authMiddleware(req, res, next);
  }
  // If no token, continue without user context
  next();
};

// Protected routes (require authentication)
router.post('/profile', authMiddleware, createOrUpdateProfile);
router.get('/profile/me', authMiddleware, getMyProfile);
router.put('/profile/status', authMiddleware, updateProfileStatus);
router.delete('/profile', authMiddleware, deleteProfile);

// Public routes with optional authentication (to exclude current user)
router.get('/profiles', optionalAuthMiddleware, getAllProfiles);
router.get('/profiles/featured', optionalAuthMiddleware, getFeaturedProfiles);
router.get('/profiles/search', optionalAuthMiddleware, searchProfiles);
router.get('/profiles/:profileId', optionalAuthMiddleware, getProfileById);

module.exports = router;
