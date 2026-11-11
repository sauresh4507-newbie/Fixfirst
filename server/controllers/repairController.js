const DeviceRepairRequest = require('../models/DeviceRepairRequest');
const Quotation = require('../models/Quotation');
const asyncHandler = require('../utils/asyncHandler');
const { uploadMultiple } = require('../services/cloudinaryService');
const { analyzeIssue } = require('../services/aiService');
const { createNotification } = require('../services/notificationService');

// @desc    Create a new repair request
// @route   POST /api/repairs
// @access  Private (customer)
const createRepairRequest = asyncHandler(async (req, res) => {
  const {
    deviceCategory,
    deviceBrand,
    deviceModel,
    operatingSystem,
    issueCategory,
    issueDescription,
    problemStarted,
    deviceCondition,
    city,
    area,
    pinCode,
  } = req.body;

  // Upload images to Cloudinary
  let images = [];
  if (req.files && req.files.length > 0) {
    try {
      const uploadResults = await uploadMultiple(req.files, 'fixfirst/repairs');
      images = uploadResults;
    } catch (err) {
      console.error('Image upload error:', err.message);
    }
  }

  // Create the repair request — set isPublic true by default so vendors see it immediately
  const repairRequest = await DeviceRepairRequest.create({
    customer: req.user._id,
    deviceCategory,
    deviceBrand,
    deviceModel,
    operatingSystem,
    issueCategory,
    issueDescription,
    problemStarted,
    deviceCondition,
    images,
    location: { city, area, pinCode },
    status: 'awaiting_quotations',
    isPublic: true,
  });

  // Trigger AI analysis asynchronously (updates analysis fields only, doesn't hide the request)
  analyzeIssue({
    deviceCategory,
    deviceBrand,
    deviceModel,
    issueCategory,
    issueDescription,
  })
    .then(async (analysis) => {
      await DeviceRepairRequest.findByIdAndUpdate(repairRequest._id, {
        aiAnalysis: { ...analysis, analyzedAt: new Date() },
        // Keep isPublic: true regardless of AI recommendation
        troubleshootingStatus: analysis.professionalRepairRecommended ? 'escalated' : 'in_progress',
      });
    })
    .catch((err) => console.error('Async AI analysis failed:', err.message));

  res.status(201).json({
    success: true,
    message: 'Repair request submitted. Analyzing your issue...',
    repairRequest,
  });
});

// @desc    Get all repair requests for the logged-in customer
// @route   GET /api/repairs/my-requests
// @access  Private (customer)
const getMyRepairRequests = asyncHandler(async (req, res) => {
  const { status, page = 1, limit = 10 } = req.query;
  const query = { customer: req.user._id };
  if (status) query.status = status;

  const skip = (Number(page) - 1) * Number(limit);
  const [requests, total] = await Promise.all([
    DeviceRepairRequest.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit))
      .select('-aiAnalysis.troubleshootingSteps'),
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

// @desc    Get a single repair request
// @route   GET /api/repairs/:id
// @access  Private
const getRepairRequest = asyncHandler(async (req, res) => {
  const request = await DeviceRepairRequest.findById(req.params.id)
    .populate('selectedVendor', 'fullName email phone')
    .populate('selectedQuotation');

  if (!request) {
    return res.status(404).json({ success: false, message: 'Repair request not found.' });
  }

  // Only allow customer who owns it, the selected vendor, or admin
  const isOwner = request.customer.toString() === req.user._id.toString();
  const isSelectedVendor =
    request.selectedVendor && request.selectedVendor._id?.toString() === req.user._id.toString();
  const isAdmin = req.user.role === 'admin';

  if (!isOwner && !isSelectedVendor && !isAdmin) {
    return res.status(403).json({ success: false, message: 'Access denied.' });
  }

  res.json({ success: true, request });
});

// @desc    Close/resolve a repair request
// @route   POST /api/repairs/:id/close
// @access  Private (customer)
const closeRepairRequest = asyncHandler(async (req, res) => {
  const request = await DeviceRepairRequest.findById(req.params.id);

  if (!request) {
    return res.status(404).json({ success: false, message: 'Repair request not found.' });
  }

  if (request.customer.toString() !== req.user._id.toString()) {
    return res.status(403).json({ success: false, message: 'Access denied.' });
  }

  request.status = 'closed';
  request.closedAt = new Date();
  request.isPublic = false;
  await request.save();

  res.json({ success: true, message: 'Repair request closed successfully.', request });
});

// @desc    Cancel a repair request
// @route   POST /api/repairs/:id/cancel
// @access  Private (customer)
const cancelRepairRequest = asyncHandler(async (req, res) => {
  const request = await DeviceRepairRequest.findById(req.params.id);

  if (!request) {
    return res.status(404).json({ success: false, message: 'Repair request not found.' });
  }

  if (request.customer.toString() !== req.user._id.toString()) {
    return res.status(403).json({ success: false, message: 'Access denied.' });
  }

  const nonCancellableStatuses = ['repair_in_progress', 'repair_completed', 'delivered'];
  if (nonCancellableStatuses.includes(request.status)) {
    return res.status(400).json({
      success: false,
      message: 'This request cannot be cancelled at its current stage.',
    });
  }

  request.status = 'cancelled';
  request.cancelledAt = new Date();
  request.cancelReason = req.body.reason || '';
  request.isPublic = false;
  await request.save();

  res.json({ success: true, message: 'Request cancelled.', request });
});

// @desc    Update AI analysis / status after troubleshooting
// @route   PUT /api/repairs/:id/escalate
// @access  Private (customer)
const escalateToVendors = asyncHandler(async (req, res) => {
  const request = await DeviceRepairRequest.findById(req.params.id);

  if (!request) {
    return res.status(404).json({ success: false, message: 'Repair request not found.' });
  }

  if (request.customer.toString() !== req.user._id.toString()) {
    return res.status(403).json({ success: false, message: 'Access denied.' });
  }

  request.status = 'awaiting_quotations';
  request.troubleshootingStatus = 'escalated';
  request.isPublic = true;
  await request.save();

  res.json({ success: true, message: 'Request published to vendors.', request });
});

module.exports = {
  createRepairRequest,
  getMyRepairRequests,
  getRepairRequest,
  closeRepairRequest,
  cancelRepairRequest,
  escalateToVendors,
};
