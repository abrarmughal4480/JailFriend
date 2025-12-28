const express = require('express');
const router = express.Router();
const aiController = require('../controllers/aiController');
const auth = require('../middlewares/authMiddleware');

// All AI routes should be protected
router.post('/generate-text', auth, aiController.generateText);
router.post('/generate-image', auth, aiController.generateImage);

module.exports = router;
