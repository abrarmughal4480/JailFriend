const express = require('express');
const router = express.Router();
const aiController = require('../controllers/aiController');
const { protect } = require('../middlewares/authMiddleware');

// All AI routes should be protected
router.post('/generate-text', protect, aiController.generateText);
router.post('/generate-image', protect, aiController.generateImage);

module.exports = router;
