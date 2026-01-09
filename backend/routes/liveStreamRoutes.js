const express = require('express');
const router = express.Router();
const authMiddleware = require('../middlewares/authMiddleware');
const {
    startStream,
    endStream,
    getActiveStreams,
    getStreamDetails,
    checkUserLiveStatus
} = require('../controllers/liveStreamController');

router.get('/active', getActiveStreams);
router.get('/user/:userId/status', checkUserLiveStatus);
router.get('/:streamId', getStreamDetails);

router.use(authMiddleware); // Protective middleware for following routes

router.post('/start', startStream);
router.post('/:streamId/end', endStream);

module.exports = router;
