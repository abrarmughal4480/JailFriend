const express = require('express');
const router = express.Router();
const {
    updateProSystemSettings,
    getProPackages,
    createProPackage,
    updateProPackage,
    deleteProPackage,
    getProSystemSettings
} = require('../controllers/proSystemController');
const authMiddleware = require('../middlewares/authMiddleware');
const { upload } = require('../config/cloudinary');

// Settings
router.get('/settings', authMiddleware, getProSystemSettings);
router.post('/settings', authMiddleware, updateProSystemSettings);

// Packages
router.get('/packages', authMiddleware, getProPackages);
router.post('/packages', authMiddleware, upload.fields([{ name: 'icon', maxCount: 1 }, { name: 'nightIcon', maxCount: 1 }]), createProPackage);
router.put('/packages/:id', authMiddleware, upload.fields([{ name: 'icon', maxCount: 1 }, { name: 'nightIcon', maxCount: 1 }]), updateProPackage);
router.delete('/packages/:id', authMiddleware, deleteProPackage);

module.exports = router;
