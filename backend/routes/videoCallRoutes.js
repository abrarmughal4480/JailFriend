const express = require('express');
const router = express.Router();
const authMiddleware = require('../middlewares/authMiddleware');
const {
  initiateCall,
  answerCall,
  rejectCall,
  endCall,
  getCallById,
  getCallHistory,
  getActiveCalls,
  getCallStats,
  addIceCandidate,
  updateCallQuality
} = require('../controllers/videoCallController');

// Protected routes (require authentication)
router.post('/initiate', authMiddleware, initiateCall);
router.get('/history', authMiddleware, getCallHistory);
router.get('/active', authMiddleware, getActiveCalls);
router.get('/stats', authMiddleware, getCallStats);
router.get('/:callId', authMiddleware, getCallById);
router.put('/:callId/answer', authMiddleware, answerCall);
router.put('/:callId/reject', authMiddleware, rejectCall);
router.put('/:callId/end', authMiddleware, endCall);
router.post('/:callId/ice-candidate', authMiddleware, addIceCandidate);
router.put('/:callId/quality', authMiddleware, updateCallQuality);

module.exports = router;
