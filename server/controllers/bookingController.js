const Booking = require('../models/Booking');
const Quotation = require('../models/Quotation');
const DeviceRepairRequest = require('../models/DeviceRepairRequest');
const VendorProfile = require('../models/VendorProfile');
const asyncHandler = require('../utils/asyncHandler');
const { createNotification } = require('../services/notificationService');

// @desc    Create a booking (customer selects a vendor/quotation)
// @route   POST /api/bookings
// @access  Private (customer)
const createBooking = asyncHandler(async (req, res) => {
  const { quotationId } = req.body;

  const quotation = await Quotation.findById(quotationId).populate('vendorProfile');
  if (!quotation) {
    return res.status(404).json({ success: false, message: 'Quotation not found.' });
  }

  if (quotation.status !== 'submitted' && quotation.status !== 'viewed') {
    return res.status(400).json({ success: false, message: 'This quotation is no longer available.' });
  }

  const repairRequest = await DeviceRepairRequest.findById(quotation.repairRequest);
  if (!repairRequest) {
    return res.status(404).json({ success: false, message: 'Repair request not found.' });
  }

  if (repairRequest.customer.toString() !== req.user._id.toString()) {
    return res.status(403).json({ success: false, message: 'Access denied.' });
  }

  if (repairRequest.selectedQuotation) {
    return res.status(400).json({ success: false, message: 'A vendor has already been selected for this request.' });
  }

  // Create booking
  const booking = await Booking.create({
    repairRequest: repairRequest._id,
    customer: req.user._id,
    vendor: quotation.vendor,
    vendorProfile: quotation.vendorProfile._id,
    quotation: quotation._id,
    agreedPrice: quotation.totalCost,
    status: 'vendor_selected',
    statusHistory: [
      {
        status: 'vendor_selected',
        updatedAt: new Date(),
        updatedBy: req.user._id,
        note: 'Customer selected this vendor',
      },
    ],
  });

  // Update quotation status
  await Quotation.findByIdAndUpdate(quotationId, {
    status: 'accepted',
    isAccepted: true,
    acceptedAt: new Date(),
  });

  // Mark other quotations as rejected
  await Quotation.updateMany(
    { repairRequest: repairRequest._id, _id: { $ne: quotationId } },
    { status: 'rejected' }
  );

  // Update repair request
  await DeviceRepairRequest.findByIdAndUpdate(repairRequest._id, {
    status: 'vendor_selected',
    selectedQuotation: quotationId,
    selectedVendor: quotation.vendor,
    isPublic: false,
  });

  // Notify vendor
  await createNotification({
    recipient: quotation.vendor,
    type: 'quotation_accepted',
    title: 'Your Quotation Was Accepted!',
    message: `A customer has accepted your quotation for ${repairRequest.deviceBrand} ${repairRequest.deviceModel} repair.`,
    data: { bookingId: booking._id, repairRequestId: repairRequest._id },
    link: `/vendor/bookings/${booking._id}`,
  });

  res.status(201).json({
    success: true,
    message: 'Vendor selected. Booking created successfully.',
    booking,
  });
});

// @desc    Get bookings for current user
// @route   GET /api/bookings/my-bookings
// @access  Private
const getMyBookings = asyncHandler(async (req, res) => {
  const { status, page = 1, limit = 10 } = req.query;
  const query =
    req.user.role === 'vendor'
      ? { vendor: req.user._id }
      : { customer: req.user._id };

  if (status) query.status = status;

  const skip = (Number(page) - 1) * Number(limit);
  const [bookings, total] = await Promise.all([
    Booking.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit))
      .populate('repairRequest', 'deviceBrand deviceModel deviceCategory issueCategory status')
      .populate('vendorProfile', 'businessName rating logo')
      .populate('customer', 'fullName phone')
      .populate('vendor', 'fullName'),
    Booking.countDocuments(query),
  ]);

  res.json({
    success: true,
    bookings,
    pagination: {
      page: Number(page),
      limit: Number(limit),
      total,
      pages: Math.ceil(total / Number(limit)),
    },
  });
});

// @desc    Get a single booking
// @route   GET /api/bookings/:id
// @access  Private
const getBooking = asyncHandler(async (req, res) => {
  const booking = await Booking.findById(req.params.id)
    .populate('repairRequest')
    .populate('vendorProfile', 'businessName rating logo address contactEmail contactPhone')
    .populate('quotation')
    .populate('customer', 'fullName email phone')
    .populate('vendor', 'fullName email phone');

  if (!booking) {
    return res.status(404).json({ success: false, message: 'Booking not found.' });
  }

  const isCustomer = booking.customer._id.toString() === req.user._id.toString();
  const isVendor = booking.vendor._id.toString() === req.user._id.toString();
  const isAdmin = req.user.role === 'admin';

  if (!isCustomer && !isVendor && !isAdmin) {
    return res.status(403).json({ success: false, message: 'Access denied.' });
  }

  res.json({ success: true, booking });
});

// @desc    Update booking status
// @route   PUT /api/bookings/:id/status
// @access  Private (vendor)
const updateBookingStatus = asyncHandler(async (req, res) => {
  const { status, note } = req.body;

  const booking = await Booking.findById(req.params.id)
    .populate('repairRequest', 'deviceBrand deviceModel customer');

  if (!booking) {
    return res.status(404).json({ success: false, message: 'Booking not found.' });
  }

  if (booking.vendor.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
    return res.status(403).json({ success: false, message: 'Access denied.' });
  }

  const validTransitions = {
    vendor_selected: ['repair_accepted', 'cancelled'],
    repair_accepted: ['device_received', 'cancelled'],
    device_received: ['repair_in_progress'],
    repair_in_progress: ['repair_completed'],
    repair_completed: ['delivered'],
  };

  const allowed = validTransitions[booking.status];
  if (!allowed || !allowed.includes(status)) {
    return res.status(400).json({
      success: false,
      message: `Cannot transition from '${booking.status}' to '${status}'.`,
    });
  }

  booking.status = status;
  booking.statusHistory.push({
    status,
    updatedAt: new Date(),
    updatedBy: req.user._id,
    note,
  });

  if (status === 'repair_completed') {
    booking.actualCompletionDate = new Date();
  }

  await booking.save();

  // Sync repair request status
  await DeviceRepairRequest.findByIdAndUpdate(booking.repairRequest._id, { status });

  // Notify customer
  const statusMessages = {
    repair_accepted: 'Your repair has been accepted by the vendor.',
    device_received: 'The vendor has received your device.',
    repair_in_progress: 'Your device repair is now in progress.',
    repair_completed: 'Your device repair has been completed!',
    delivered: 'Your device has been delivered.',
  };

  if (statusMessages[status]) {
    await createNotification({
      recipient: booking.repairRequest.customer,
      type: 'booking_status_update',
      title: 'Repair Status Update',
      message: statusMessages[status],
      data: { bookingId: booking._id },
      link: `/bookings/${booking._id}`,
    });
  }

  res.json({ success: true, message: 'Status updated.', booking });
});

module.exports = { createBooking, getMyBookings, getBooking, updateBookingStatus };
