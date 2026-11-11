const Quotation = require('../models/Quotation');
const DeviceRepairRequest = require('../models/DeviceRepairRequest');
const VendorProfile = require('../models/VendorProfile');
const asyncHandler = require('../utils/asyncHandler');
const { createNotification } = require('../services/notificationService');

// @desc    Submit a quotation
// @route   POST /api/quotations
// @access  Private (vendor)
const submitQuotation = asyncHandler(async (req, res) => {
  const {
    repairRequestId,
    totalCost,
    partsCoast,
    labourCost,
    additionalCharges,
    additionalChargesDescription,
    estimatedDurationValue,
    estimatedDurationUnit,
    repairExplanation,
    warrantyValue,
    warrantyUnit,
    conditions,
  } = req.body;

  const repairRequest = await DeviceRepairRequest.findById(repairRequestId);
  if (!repairRequest) {
    return res.status(404).json({ success: false, message: 'Repair request not found.' });
  }

  if (!repairRequest.isPublic || repairRequest.status !== 'awaiting_quotations') {
    return res.status(400).json({ success: false, message: 'This repair request is not accepting quotations.' });
  }

  const vendorProfile = await VendorProfile.findOne({ user: req.user._id });
  if (!vendorProfile || !vendorProfile.isVerified) {
    return res.status(403).json({ success: false, message: 'Only verified vendors can submit quotations.' });
  }

  // Check for duplicate
  const existing = await Quotation.findOne({ repairRequest: repairRequestId, vendor: req.user._id });
  if (existing) {
    return res.status(400).json({ success: false, message: 'You have already submitted a quotation for this request.' });
  }

  const quotation = await Quotation.create({
    repairRequest: repairRequestId,
    vendor: req.user._id,
    vendorProfile: vendorProfile._id,
    totalCost,
    partsCoast: partsCoast || 0,
    labourCost: labourCost || 0,
    additionalCharges: additionalCharges || 0,
    additionalChargesDescription,
    estimatedDuration: { value: estimatedDurationValue, unit: estimatedDurationUnit || 'days' },
    repairExplanation,
    warrantyPeriod: { value: warrantyValue || 0, unit: warrantyUnit || 'months' },
    conditions,
  });

  // Update quotation count on request
  await DeviceRepairRequest.findByIdAndUpdate(repairRequestId, {
    $inc: { quotationCount: 1 },
    status: 'quotations_received',
  });

  // Notify customer
  await createNotification({
    recipient: repairRequest.customer,
    type: 'new_quotation',
    title: 'New Quotation Received',
    message: `${vendorProfile.businessName} has submitted a quotation for your ${repairRequest.deviceBrand} ${repairRequest.deviceModel} repair.`,
    data: { repairRequestId, quotationId: quotation._id },
    link: `/repairs/${repairRequestId}/quotations`,
  });

  res.status(201).json({ success: true, message: 'Quotation submitted.', quotation });
});

// @desc    Get quotations for a repair request
// @route   GET /api/repairs/:id/quotations
// @access  Private (customer who owns the request)
const getQuotations = asyncHandler(async (req, res) => {
  const { sort = 'createdAt' } = req.query;

  const repairRequest = await DeviceRepairRequest.findById(req.params.id);
  if (!repairRequest) {
    return res.status(404).json({ success: false, message: 'Repair request not found.' });
  }

  if (repairRequest.customer.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
    return res.status(403).json({ success: false, message: 'Access denied.' });
  }

  const sortOptions = {
    price_asc: { totalCost: 1 },
    price_desc: { totalCost: -1 },
    rating: { 'vendorProfile.rating.average': -1 },
    duration: { 'estimatedDuration.value': 1 },
    createdAt: { createdAt: -1 },
  };

  const quotations = await Quotation.find({
    repairRequest: req.params.id,
    status: { $ne: 'withdrawn' },
  })
    .populate({
      path: 'vendorProfile',
      select: 'businessName rating isVerified address logo description',
    })
    .populate('vendor', 'fullName')
    .sort(sortOptions[sort] || { createdAt: -1 });

  res.json({ success: true, quotations });
});

// @desc    Update a quotation
// @route   PUT /api/quotations/:id
// @access  Private (vendor who owns the quotation)
const updateQuotation = asyncHandler(async (req, res) => {
  const quotation = await Quotation.findById(req.params.id);

  if (!quotation) {
    return res.status(404).json({ success: false, message: 'Quotation not found.' });
  }

  if (quotation.vendor.toString() !== req.user._id.toString()) {
    return res.status(403).json({ success: false, message: 'Access denied.' });
  }

  if (['accepted', 'withdrawn'].includes(quotation.status)) {
    return res.status(400).json({ success: false, message: 'Cannot edit a quotation that has been accepted or withdrawn.' });
  }

  const allowedFields = ['totalCost', 'partsCoast', 'labourCost', 'additionalCharges', 'additionalChargesDescription', 'repairExplanation', 'conditions', 'warrantyPeriod', 'estimatedDuration'];
  allowedFields.forEach((field) => {
    if (req.body[field] !== undefined) quotation[field] = req.body[field];
  });

  await quotation.save();
  res.json({ success: true, message: 'Quotation updated.', quotation });
});

// @desc    Withdraw a quotation
// @route   DELETE /api/quotations/:id
// @access  Private (vendor)
const withdrawQuotation = asyncHandler(async (req, res) => {
  const quotation = await Quotation.findById(req.params.id);

  if (!quotation) {
    return res.status(404).json({ success: false, message: 'Quotation not found.' });
  }

  if (quotation.vendor.toString() !== req.user._id.toString()) {
    return res.status(403).json({ success: false, message: 'Access denied.' });
  }

  if (quotation.status === 'accepted') {
    return res.status(400).json({ success: false, message: 'Cannot withdraw an accepted quotation.' });
  }

  quotation.status = 'withdrawn';
  quotation.withdrawnAt = new Date();
  await quotation.save();

  // Decrease quotation count
  await DeviceRepairRequest.findByIdAndUpdate(quotation.repairRequest, {
    $inc: { quotationCount: -1 },
  });

  res.json({ success: true, message: 'Quotation withdrawn.' });
});

module.exports = { submitQuotation, getQuotations, updateQuotation, withdrawQuotation };
