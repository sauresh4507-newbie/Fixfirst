const User = require('../models/User');
const VendorProfile = require('../models/VendorProfile');
const DeviceRepairRequest = require('../models/DeviceRepairRequest');
const Booking = require('../models/Booking');
const Review = require('../models/Review');
const Complaint = require('../models/Complaint');
const asyncHandler = require('../utils/asyncHandler');
const { createNotification } = require('../services/notificationService');

// @desc    Get admin dashboard statistics
// @route   GET /api/admin/dashboard
// @access  Private (admin)
const getDashboard = asyncHandler(async (req, res) => {
  const [
    totalCustomers,
    totalVendors,
    pendingVerification,
    totalRequests,
    activeRepairs,
    completedRepairs,
    cancelledRequests,
    openComplaints,
    recentRequests,
    recentUsers,
  ] = await Promise.all([
    User.countDocuments({ role: 'customer' }),
    User.countDocuments({ role: 'vendor' }),
    VendorProfile.countDocuments({ verificationStatus: 'pending' }),
    DeviceRepairRequest.countDocuments(),
    DeviceRepairRequest.countDocuments({
      status: { $in: ['repair_accepted', 'device_received', 'repair_in_progress'] },
    }),
    DeviceRepairRequest.countDocuments({ status: { $in: ['repair_completed', 'delivered'] } }),
    DeviceRepairRequest.countDocuments({ status: 'cancelled' }),
    Complaint.countDocuments({ status: 'open' }),
    DeviceRepairRequest.find().sort({ createdAt: -1 }).limit(5).populate('customer', 'fullName'),
    User.find({ role: { $in: ['customer', 'vendor'] } }).sort({ createdAt: -1 }).limit(5),
  ]);

  res.json({
    success: true,
    stats: {
      totalCustomers,
      totalVendors,
      pendingVerification,
      totalRequests,
      activeRepairs,
      completedRepairs,
      cancelledRequests,
      openComplaints,
    },
    recentRequests,
    recentUsers,
  });
});

// @desc    Get all users
// @route   GET /api/admin/users
// @access  Private (admin)
const getUsers = asyncHandler(async (req, res) => {
  const { role, page = 1, limit = 20, search } = req.query;
  const query = {};
  if (role) query.role = role;
  if (search) {
    query.$or = [
      { fullName: { $regex: search, $options: 'i' } },
      { email: { $regex: search, $options: 'i' } },
    ];
  }

  const skip = (Number(page) - 1) * Number(limit);
  const [users, total] = await Promise.all([
    User.find(query).sort({ createdAt: -1 }).skip(skip).limit(Number(limit)),
    User.countDocuments(query),
  ]);

  res.json({
    success: true,
    users,
    pagination: { page: Number(page), limit: Number(limit), total, pages: Math.ceil(total / Number(limit)) },
  });
});

// @desc    Toggle user active status
// @route   PUT /api/admin/users/:id/toggle-active
// @access  Private (admin)
const toggleUserActive = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);
  if (!user) return res.status(404).json({ success: false, message: 'User not found.' });
  if (user.role === 'admin') return res.status(400).json({ success: false, message: 'Cannot deactivate admin accounts.' });

  user.isActive = !user.isActive;
  await user.save({ validateBeforeSave: false });

  res.json({ success: true, message: `User ${user.isActive ? 'activated' : 'deactivated'}.`, user });
});

// @desc    Get all vendors
// @route   GET /api/admin/vendors
// @access  Private (admin)
const getVendors = asyncHandler(async (req, res) => {
  const { verificationStatus, page = 1, limit = 20, search } = req.query;
  const query = {};
  if (verificationStatus) query.verificationStatus = verificationStatus;

  const skip = (Number(page) - 1) * Number(limit);
  const vendors = await VendorProfile.find(query)
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(Number(limit))
    .populate('user', 'fullName email phone isActive createdAt');

  const total = await VendorProfile.countDocuments(query);

  res.json({
    success: true,
    vendors,
    pagination: { page: Number(page), limit: Number(limit), total, pages: Math.ceil(total / Number(limit)) },
  });
});

// @desc    Verify or reject a vendor
// @route   PUT /api/admin/vendors/:id/verify
// @access  Private (admin)
const verifyVendor = asyncHandler(async (req, res) => {
  const { action, notes } = req.body; // action: 'verify' | 'reject'

  const profile = await VendorProfile.findById(req.params.id).populate('user', '_id fullName');
  if (!profile) return res.status(404).json({ success: false, message: 'Vendor profile not found.' });

  if (action === 'verify') {
    profile.isVerified = true;
    profile.verificationStatus = 'verified';
    profile.verifiedAt = new Date();
  } else if (action === 'reject') {
    profile.isVerified = false;
    profile.verificationStatus = 'rejected';
  } else {
    return res.status(400).json({ success: false, message: "Action must be 'verify' or 'reject'." });
  }

  profile.verificationNotes = notes || '';
  await profile.save();

  // Notify vendor
  await createNotification({
    recipient: profile.user._id,
    type: 'vendor_verified',
    title: action === 'verify' ? 'Account Verified!' : 'Verification Update',
    message:
      action === 'verify'
        ? 'Congratulations! Your vendor account has been verified. You can now receive repair requests.'
        : `Your verification request was not approved. ${notes || ''}`,
    link: '/vendor/profile',
  });

  res.json({ success: true, message: `Vendor ${action === 'verify' ? 'verified' : 'rejected'}.`, profile });
});

// @desc    Get all repair requests
// @route   GET /api/admin/repairs
// @access  Private (admin)
const getRepairs = asyncHandler(async (req, res) => {
  const { status, page = 1, limit = 20 } = req.query;
  const query = {};
  if (status) query.status = status;

  const skip = (Number(page) - 1) * Number(limit);
  const [requests, total] = await Promise.all([
    DeviceRepairRequest.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit))
      .populate('customer', 'fullName email')
      .populate('selectedVendor', 'fullName'),
    DeviceRepairRequest.countDocuments(query),
  ]);

  res.json({
    success: true,
    requests,
    pagination: { page: Number(page), limit: Number(limit), total, pages: Math.ceil(total / Number(limit)) },
  });
});

// @desc    Get complaints
// @route   GET /api/admin/complaints
// @access  Private (admin)
const getComplaints = asyncHandler(async (req, res) => {
  const { status, page = 1, limit = 20 } = req.query;
  const query = {};
  if (status) query.status = status;

  const skip = (Number(page) - 1) * Number(limit);
  const [complaints, total] = await Promise.all([
    Complaint.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit))
      .populate('submittedBy', 'fullName email')
      .populate('againstUser', 'fullName email'),
    Complaint.countDocuments(query),
  ]);

  res.json({
    success: true,
    complaints,
    pagination: { page: Number(page), limit: Number(limit), total, pages: Math.ceil(total / Number(limit)) },
  });
});

// @desc    Update complaint status
// @route   PUT /api/admin/complaints/:id
// @access  Private (admin)
const updateComplaint = asyncHandler(async (req, res) => {
  const { status, adminNotes, resolution } = req.body;

  const complaint = await Complaint.findByIdAndUpdate(
    req.params.id,
    {
      status,
      adminNotes,
      resolution,
      resolvedAt: ['resolved', 'dismissed'].includes(status) ? new Date() : undefined,
      resolvedBy: req.user._id,
    },
    { new: true }
  );

  if (!complaint) return res.status(404).json({ success: false, message: 'Complaint not found.' });

  res.json({ success: true, complaint });
});

module.exports = {
  getDashboard,
  getUsers,
  toggleUserActive,
  getVendors,
  verifyVendor,
  getRepairs,
  getComplaints,
  updateComplaint,
};
