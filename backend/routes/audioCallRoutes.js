const express = require('express');
const router = express.Router();
const audioCallController = require('../controllers/audioCallController');
const authMiddleware = require('../middlewares/authMiddleware');

// Apply authentication middleware to all routes
router.use(authMiddleware);

// Call management routes
router.post('/initiate', audioCallController.initiateCall);
router.post('/:callId/accept', audioCallController.acceptCall);
router.post('/:callId/reject', audioCallController.rejectCall);
router.post('/:callId/end', audioCallController.endCall);
router.post('/:callId/cancel', audioCallController.cancelCall);

// Call history and statistics
router.get('/history', audioCallController.getCallHistory);
router.get('/active', audioCallController.getActiveCalls);
router.get('/stats', audioCallController.getCallStats);

// Call quality updates
router.put('/:callId/quality', audioCallController.updateCallQuality);

// WebRTC signaling routes
router.post('/:callId/offer', audioCallController.storeOffer);
router.post('/:callId/answer', audioCallController.storeAnswer);
router.post('/:callId/ice-candidate', audioCallController.addIceCandidate);

// Cleanup route (for testing/debugging)
router.post('/cleanup', audioCallController.cleanupOldCalls);

module.exports = router;
