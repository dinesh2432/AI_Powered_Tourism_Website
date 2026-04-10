const express = require('express');
const router = express.Router();
const {
  createBooking,
  getMyReceivedBookings,
  getMySentBookings,
  updateBookingStatus,
} = require('../controllers/bookingController');
const { protect, guideOnly } = require('../middlewares/authMiddleware');

// Tourist submits a booking request
router.post('/', protect, createBooking);

// Tourist views their own sent booking requests
router.get('/my-sent', protect, getMySentBookings);

// Guide views bookings they received
router.get('/my-received', protect, guideOnly, getMyReceivedBookings);

// Guide accepts or rejects a booking
router.put('/:id/status', protect, guideOnly, updateBookingStatus);

module.exports = router;
