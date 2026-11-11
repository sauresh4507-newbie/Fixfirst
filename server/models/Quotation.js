const mongoose = require('mongoose');

const quotationSchema = new mongoose.Schema(
  {
    repairRequest: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'DeviceRepairRequest',
      required: true,
    },
    vendor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    vendorProfile: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'VendorProfile',
      required: true,
    },
    // Pricing
    totalCost: {
      type: Number,
      required: [true, 'Total repair cost is required'],
      min: [0, 'Cost cannot be negative'],
    },
    partsCoast: {
      type: Number,
      default: 0,
      min: 0,
    },
    labourCost: {
      type: Number,
      default: 0,
      min: 0,
    },
    additionalCharges: {
      type: Number,
      default: 0,
    },
    additionalChargesDescription: String,
    // Timing
    estimatedDuration: {
      value: { type: Number, required: [true, 'Estimated duration is required'] },
      unit: { type: String, enum: ['hours', 'days'], default: 'days' },
    },
    // Details
    repairExplanation: {
      type: String,
      required: [true, 'Repair explanation is required'],
      maxlength: [2000, 'Explanation cannot exceed 2000 characters'],
    },
    warrantyPeriod: {
      value: { type: Number, default: 0 },
      unit: { type: String, enum: ['days', 'months'], default: 'months' },
    },
    conditions: String,
    // Status
    status: {
      type: String,
      enum: ['submitted', 'viewed', 'accepted', 'rejected', 'withdrawn', 'expired'],
      default: 'submitted',
    },
    isAccepted: { type: Boolean, default: false },
    acceptedAt: Date,
    withdrawnAt: Date,
    expiresAt: {
      type: Date,
      default: () => new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
    },
  },
  {
    timestamps: true,
  }
);

// Prevent duplicate quotations from same vendor for same request
quotationSchema.index({ repairRequest: 1, vendor: 1 }, { unique: true });
quotationSchema.index({ repairRequest: 1 });
quotationSchema.index({ vendor: 1 });
quotationSchema.index({ status: 1 });

module.exports = mongoose.model('Quotation', quotationSchema);
