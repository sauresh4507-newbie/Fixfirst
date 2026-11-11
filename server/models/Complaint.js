const mongoose = require('mongoose');

const complaintSchema = new mongoose.Schema(
  {
    submittedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    againstUser: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    booking: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Booking',
    },
    category: {
      type: String,
      enum: [
        'fraud',
        'poor_service',
        'overcharging',
        'harassment',
        'fake_profile',
        'data_misuse',
        'other',
      ],
      required: true,
    },
    subject: {
      type: String,
      required: [true, 'Subject is required'],
      maxlength: 200,
    },
    description: {
      type: String,
      required: [true, 'Description is required'],
      maxlength: 3000,
    },
    evidence: [
      {
        url: String,
        type: String,
      },
    ],
    status: {
      type: String,
      enum: ['open', 'under_review', 'resolved', 'dismissed'],
      default: 'open',
    },
    adminNotes: String,
    resolvedAt: Date,
    resolvedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    resolution: String,
  },
  {
    timestamps: true,
  }
);

complaintSchema.index({ submittedBy: 1 });
complaintSchema.index({ status: 1 });

module.exports = mongoose.model('Complaint', complaintSchema);
