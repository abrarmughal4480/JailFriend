const express = require('express');
const router = express.Router();
const authMiddleware = require('../middlewares/authMiddleware');
const {
  createBooking,
  getUserBookings,
  getUpcomingBookings,
  acceptBooking,
  rejectBooking,
  startBooking,
  completeBooking,
  cancelBooking,
  getBookingById,
  getBookingStats
} = require('../controllers/bookingController');

// Protected routes (require authentication)
router.post('/', authMiddleware, createBooking);
router.get('/', authMiddleware, getUserBookings);
router.get('/upcoming', authMiddleware, getUpcomingBookings);
router.get('/stats', authMiddleware, getBookingStats);
router.get('/:bookingId', authMiddleware, getBookingById);
router.put('/:bookingId/accept', authMiddleware, acceptBooking);
router.put('/:bookingId/reject', authMiddleware, rejectBooking);
router.put('/:bookingId/start', authMiddleware, startBooking);
router.put('/:bookingId/complete', authMiddleware, completeBooking);
router.put('/:bookingId/cancel', authMiddleware, cancelBooking);

module.exports = router;
