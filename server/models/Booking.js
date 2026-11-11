const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema(
  {
    repairRequest: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'DeviceRepairRequest',
      required: true,
    },
    customer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
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
    quotation: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Quotation',
      required: true,
    },
    status: {
      type: String,
      enum: [
        'request_submitted',
        'awaiting_quotations',
        'quotations_received',
        'vendor_selected',
        'repair_accepted',
        'device_received',
        'repair_in_progress',
        'repair_completed',
        'delivered',
        'cancelled',
      ],
      default: 'vendor_selected',
    },
    statusHistory: [
      {
        status: String,
        updatedAt: { type: Date, default: Date.now },
        updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        note: String,
      },
    ],
    agreedPrice: {
      type: Number,
      required: true,
    },
    estimatedCompletionDate: Date,
    actualCompletionDate: Date,
    vendorNotes: String,
    customerNotes: String,
    isReviewed: { type: Boolean, default: false },
    cancelledBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    cancelReason: String,
    cancelledAt: Date,
  },
  {
    timestamps: true,
  }
);

bookingSchema.index({ customer: 1 });
bookingSchema.index({ vendor: 1 });
bookingSchema.index({ repairRequest: 1 });
bookingSchema.index({ status: 1 });

module.exports = mongoose.model('Booking', bookingSchema);
