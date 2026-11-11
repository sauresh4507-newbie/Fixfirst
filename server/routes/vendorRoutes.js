const express = require('express');
const { protect, authorize } = require('../middleware/auth');
const {
  registerVendor,
  getVendorProfile,
  updateVendorProfile,
  getAvailableRepairRequests,
  getPublicVendorProfile,
} = require('../controllers/vendorController');
const upload = require('../middleware/upload');

const router = express.Router();

// Public route
router.get('/:id/public', getPublicVendorProfile);

// Protected vendor routes
router.use(protect);

router.post('/register', authorize('vendor'), upload.single('logo'), registerVendor);
router.get('/profile', authorize('vendor'), getVendorProfile);
router.put('/profile', authorize('vendor'), upload.single('logo'), updateVendorProfile);
router.get('/repair-requests', authorize('vendor'), getAvailableRepairRequests);

module.exports = router;
