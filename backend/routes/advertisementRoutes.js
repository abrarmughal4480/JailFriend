const express = require('express');
const router = express.Router();
const authMiddleware = require('../middlewares/authMiddleware');
const { upload } = require('../config/cloudinary');
const advertisementController = require('../controllers/advertisementController');

// Advertisement routes
router.post('/', authMiddleware, upload.single('image'), advertisementController.createAdvertisement);
router.get('/user', authMiddleware, advertisementController.getUserAdvertisements);
router.get('/active', advertisementController.getActiveAdvertisements);
router.put('/:id', authMiddleware, advertisementController.updateAdvertisement);
router.delete('/:id', authMiddleware, advertisementController.deleteAdvertisement);
router.post('/:id/view', advertisementController.trackAdView);
router.post('/:id/click', advertisementController.trackAdClick);

module.exports = router;
