const express = require('express');
const { protect, authorize } = require('../middleware/auth');
const {
  getDashboard,
  getUsers,
  toggleUserActive,
  getVendors,
  verifyVendor,
  getRepairs,
  getComplaints,
  updateComplaint,
} = require('../controllers/adminController');

const router = express.Router();

router.use(protect, authorize('admin'));

router.get('/dashboard', getDashboard);
router.get('/users', getUsers);
router.put('/users/:id/toggle-active', toggleUserActive);
router.get('/vendors', getVendors);
router.put('/vendors/:id/verify', verifyVendor);
router.get('/repairs', getRepairs);
router.get('/complaints', getComplaints);
router.put('/complaints/:id', updateComplaint);

module.exports = router;
