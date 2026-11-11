const express = require('express');
const { protect, authorize } = require('../middleware/auth');
const {
  createBooking,
  getMyBookings,
  getBooking,
  updateBookingStatus,
} = require('../controllers/bookingController');

const router = express.Router();

router.use(protect);

router.post('/', authorize('customer'), createBooking);
router.get('/my-bookings', getMyBookings);
router.get('/:id', getBooking);
router.put('/:id/status', authorize('vendor', 'admin'), updateBookingStatus);

module.exports = router;
