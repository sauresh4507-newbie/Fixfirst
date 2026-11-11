const User = require('../models/User');
const asyncHandler = require('../utils/asyncHandler');
const { uploadToCloudinary } = require('../services/cloudinaryService');

// @desc    Get customer profile
// @route   GET /api/customer/profile
// @access  Private (customer)
const getProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);
  res.json({
    success: true,
    user: {
      _id: user._id,
      fullName: user.fullName,
      email: user.email,
      phone: user.phone,
      avatar: user.avatar,
      createdAt: user.createdAt,
    },
  });
});

// @desc    Update customer profile
// @route   PUT /api/customer/profile
// @access  Private (customer)
const updateProfile = asyncHandler(async (req, res) => {
  const { fullName, phone } = req.body;

  const updateFields = {};
  if (fullName) updateFields.fullName = fullName;
  if (phone) updateFields.phone = phone;

  // Handle avatar upload
  if (req.file) {
    const result = await uploadToCloudinary(req.file.buffer, 'fixfirst/avatars');
    updateFields.avatar = result.url;
  }

  const user = await User.findByIdAndUpdate(req.user._id, updateFields, {
    new: true,
    runValidators: true,
  });

  res.json({
    success: true,
    message: 'Profile updated successfully.',
    user: {
      _id: user._id,
      fullName: user.fullName,
      email: user.email,
      phone: user.phone,
      avatar: user.avatar,
    },
  });
});

// @desc    Change password
// @route   PUT /api/customer/change-password
// @access  Private
const changePassword = asyncHandler(async (req, res) => {
  const { currentPassword, newPassword } = req.body;

  const user = await User.findById(req.user._id).select('+password');

  const isMatch = await user.matchPassword(currentPassword);
  if (!isMatch) {
    return res.status(400).json({
      success: false,
      message: 'Current password is incorrect.',
    });
  }

  user.password = newPassword;
  await user.save();

  res.json({ success: true, message: 'Password changed successfully.' });
});

module.exports = { getProfile, updateProfile, changePassword };
