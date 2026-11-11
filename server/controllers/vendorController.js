const VendorProfile = require('../models/VendorProfile');
const User = require('../models/User');
const DeviceRepairRequest = require('../models/DeviceRepairRequest');
const Quotation = require('../models/Quotation');
const asyncHandler = require('../utils/asyncHandler');
const { uploadToCloudinary } = require('../services/cloudinaryService');

// @desc    Register vendor profile
// @route   POST /api/vendors/register
// @access  Private (vendor)
const registerVendor = asyncHandler(async (req, res) => {
  const existing = await VendorProfile.findOne({ user: req.user._id });
  if (existing) {
    return res.status(400).json({
      success: false,
      message: 'Vendor profile already exists.',
    });
  }

  const {
    businessName,
    description,
    contactEmail,
    contactPhone,
    street,
    city,
    area,
    pinCode,
    state,
    serviceAreas,
    deviceCategories,
    supportedBrands,
    specializations,
    establishedYear,
    gstNumber,
  } = req.body;

  let logo = null;
  if (req.file) {
    const result = await uploadToCloudinary(req.file.buffer, 'fixfirst/vendor-logos');
    logo = result.url;
  }

  const profile = await VendorProfile.create({
    user: req.user._id,
    businessName,
    description,
    contactEmail: contactEmail || req.user.email,
    contactPhone: contactPhone || req.user.phone,
    logo,
    address: { street, city, area, pinCode, state },
    serviceAreas: Array.isArray(serviceAreas) ? serviceAreas : serviceAreas ? serviceAreas.split(',').map((s) => s.trim()) : [],
    deviceCategories: Array.isArray(deviceCategories) ? deviceCategories : [],
    supportedBrands: Array.isArray(supportedBrands) ? supportedBrands : supportedBrands ? supportedBrands.split(',').map((s) => s.trim()) : [],
    specializations: Array.isArray(specializations) ? specializations : specializations ? specializations.split(',').map((s) => s.trim()) : [],
    establishedYear,
    gstNumber,
  });

  res.status(201).json({
    success: true,
    message: 'Vendor profile created. Pending verification.',
    profile,
  });
});

// @desc    Get vendor profile
// @route   GET /api/vendors/profile
// @access  Private (vendor)
const getVendorProfile = asyncHandler(async (req, res) => {
  const profile = await VendorProfile.findOne({ user: req.user._id }).populate(
    'user',
    'fullName email phone'
  );

  if (!profile) {
    return res.status(404).json({
      success: false,
      message: 'Vendor profile not found.',
    });
  }

  res.json({ success: true, profile });
});

// @desc    Update vendor profile
// @route   PUT /api/vendors/profile
// @access  Private (vendor)
const updateVendorProfile = asyncHandler(async (req, res) => {
  const {
    businessName,
    description,
    contactEmail,
    contactPhone,
    street,
    city,
    area,
    pinCode,
    state,
    serviceAreas,
    deviceCategories,
    supportedBrands,
    specializations,
  } = req.body;

  const updateFields = {};
  if (businessName) updateFields.businessName = businessName;
  if (description !== undefined) updateFields.description = description;
  if (contactEmail) updateFields.contactEmail = contactEmail;
  if (contactPhone) updateFields.contactPhone = contactPhone;
  if (street || city || area || pinCode || state) {
    updateFields.address = {};
    if (street) updateFields['address.street'] = street;
    if (city) updateFields['address.city'] = city;
    if (area) updateFields['address.area'] = area;
    if (pinCode) updateFields['address.pinCode'] = pinCode;
    if (state) updateFields['address.state'] = state;
  }
  if (serviceAreas) updateFields.serviceAreas = Array.isArray(serviceAreas) ? serviceAreas : serviceAreas.split(',').map((s) => s.trim());
  if (deviceCategories) updateFields.deviceCategories = Array.isArray(deviceCategories) ? deviceCategories : [];
  if (supportedBrands) updateFields.supportedBrands = Array.isArray(supportedBrands) ? supportedBrands : supportedBrands.split(',').map((s) => s.trim());
  if (specializations) updateFields.specializations = Array.isArray(specializations) ? specializations : specializations.split(',').map((s) => s.trim());

  if (req.file) {
    const result = await uploadToCloudinary(req.file.buffer, 'fixfirst/vendor-logos');
    updateFields.logo = result.url;
  }

  const profile = await VendorProfile.findOneAndUpdate(
    { user: req.user._id },
    { $set: updateFields },
    { new: true, runValidators: true }
  );

  if (!profile) {
    return res.status(404).json({ success: false, message: 'Vendor profile not found.' });
  }

  res.json({ success: true, message: 'Profile updated.', profile });
});

// @desc    Get repair requests matching vendor profile
// @route   GET /api/vendors/repair-requests
// @access  Private (vendor)
const getAvailableRepairRequests = asyncHandler(async (req, res) => {
  const profile = await VendorProfile.findOne({ user: req.user._id });

  if (!profile) {
    return res.status(404).json({ success: false, message: 'Please complete your vendor profile first.' });
  }

  // In development, allow unverified vendors to browse requests
  // In production, uncomment the block below:
  // if (!profile.isVerified) {
  //   return res.status(403).json({
  //     success: false,
  //     message: 'Your account must be verified before you can view repair requests.',
  //   });
  // }

  const { page = 1, limit = 10 } = req.query;
  const skip = (Number(page) - 1) * Number(limit);

  // Build match query — show all public awaiting_quotations requests
  const query = {
    status: 'awaiting_quotations',
    isPublic: true,
  };

  // Optionally filter by device categories if vendor has set them
  if (profile.deviceCategories && profile.deviceCategories.length > 0) {
    query.deviceCategory = { $in: profile.deviceCategories };
  }

  // Exclude requests this vendor already quoted
  const quotedRequestIds = await Quotation.find({ vendor: req.user._id }).distinct('repairRequest');
  if (quotedRequestIds.length > 0) {
    query._id = { $nin: quotedRequestIds };
  }

  const [requests, total] = await Promise.all([
    DeviceRepairRequest.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit))
      .populate('customer', 'fullName'),
    DeviceRepairRequest.countDocuments(query),
  ]);

  res.json({
    success: true,
    requests,
    pagination: {
      page: Number(page),
      limit: Number(limit),
      total,
      pages: Math.ceil(total / Number(limit)),
    },
  });
});

// @desc    Get public vendor profile (for customers)
// @route   GET /api/vendors/:id/public
// @access  Public
const getPublicVendorProfile = asyncHandler(async (req, res) => {
  const profile = await VendorProfile.findById(req.params.id)
    .populate('user', 'fullName')
    .select('-gstNumber -identityDocumentUrl');

  if (!profile || !profile.isActive) {
    return res.status(404).json({ success: false, message: 'Vendor not found.' });
  }

  res.json({ success: true, profile });
});

module.exports = {
  registerVendor,
  getVendorProfile,
  updateVendorProfile,
  getAvailableRepairRequests,
  getPublicVendorProfile,
};
