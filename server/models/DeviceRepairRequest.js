const mongoose = require('mongoose');

const deviceRepairRequestSchema = new mongoose.Schema(
  {
    customer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    // Device Information
    deviceCategory: {
      type: String,
      required: [true, 'Device category is required'],
      enum: ['Smartphone', 'Laptop', 'Tablet', 'Desktop', 'Smartwatch', 'Other'],
    },
    deviceBrand: {
      type: String,
      required: [true, 'Device brand is required'],
      trim: true,
    },
    deviceModel: {
      type: String,
      required: [true, 'Device model is required'],
      trim: true,
    },
    operatingSystem: {
      type: String,
      trim: true,
    },
    // Issue Information
    issueCategory: {
      type: String,
      required: [true, 'Issue category is required'],
      enum: [
        'Screen damage',
        'Battery',
        'Charging',
        'Camera',
        'Buttons',
        'Software',
        'Performance',
        'Water damage',
        'Speaker',
        'Microphone',
        'Other',
      ],
    },
    issueDescription: {
      type: String,
      required: [true, 'Issue description is required'],
      maxlength: [2000, 'Description cannot exceed 2000 characters'],
    },
    problemStarted: {
      type: String,
      trim: true,
    },
    deviceCondition: {
      type: String,
      enum: ['Excellent', 'Good', 'Fair', 'Poor'],
    },
    // Images
    images: [
      {
        url: String,
        publicId: String,
        uploadedAt: { type: Date, default: Date.now },
      },
    ],
    // Location
    location: {
      city: { type: String, required: [true, 'City is required'] },
      area: String,
      pinCode: String,
    },
    // AI Analysis
    aiAnalysis: {
      classification: {
        type: String,
        enum: ['software', 'hardware', 'both', 'inspection_required', 'pending'],
        default: 'pending',
      },
      confidence: { type: Number, min: 0, max: 100 },
      possibleCauses: [String],
      troubleshootingSteps: [String],
      professionalRepairRecommended: { type: Boolean, default: false },
      safetyWarnings: [String],
      summary: String,
      analyzedAt: Date,
    },
    // Troubleshooting
    troubleshootingStatus: {
      type: String,
      enum: ['not_started', 'in_progress', 'resolved', 'escalated'],
      default: 'not_started',
    },
    // Request Status
    status: {
      type: String,
      enum: [
        'draft',
        'submitted',
        'troubleshooting',
        'awaiting_quotations',
        'quotations_received',
        'vendor_selected',
        'repair_accepted',
        'device_received',
        'repair_in_progress',
        'repair_completed',
        'delivered',
        'closed',
        'cancelled',
      ],
      default: 'draft',
    },
    quotationCount: { type: Number, default: 0 },
    selectedQuotation: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Quotation',
      default: null,
    },
    selectedVendor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    isPublic: { type: Boolean, default: false },
    closedAt: Date,
    cancelledAt: Date,
    cancelReason: String,
  },
  {
    timestamps: true,
  }
);

deviceRepairRequestSchema.index({ customer: 1 });
deviceRepairRequestSchema.index({ status: 1 });
deviceRepairRequestSchema.index({ deviceCategory: 1 });
deviceRepairRequestSchema.index({ 'location.city': 1 });
deviceRepairRequestSchema.index({ isPublic: 1 });
deviceRepairRequestSchema.index({ createdAt: -1 });

module.exports = mongoose.model('DeviceRepairRequest', deviceRepairRequestSchema);
