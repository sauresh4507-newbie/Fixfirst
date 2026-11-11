const mongoose = require('mongoose');

const vendorProfileSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
    },
    businessName: {
      type: String,
      required: [true, 'Business name is required'],
      trim: true,
      maxlength: [150, 'Business name cannot exceed 150 characters'],
    },
    description: {
      type: String,
      maxlength: [1000, 'Description cannot exceed 1000 characters'],
    },
    logo: {
      type: String,
      default: null,
    },
    contactEmail: {
      type: String,
      trim: true,
      lowercase: true,
    },
    contactPhone: {
      type: String,
      trim: true,
    },
    address: {
      street: String,
      city: { type: String, required: [true, 'City is required'] },
      area: String,
      pinCode: String,
      state: String,
      country: { type: String, default: 'India' },
    },
    serviceAreas: [
      {
        type: String,
        trim: true,
      },
    ],
    deviceCategories: [
      {
        type: String,
        enum: ['Smartphone', 'Laptop', 'Tablet', 'Desktop', 'Smartwatch', 'Other'],
      },
    ],
    supportedBrands: [
      {
        type: String,
        trim: true,
      },
    ],
    specializations: [
      {
        type: String,
        trim: true,
      },
    ],
    isVerified: {
      type: Boolean,
      default: false,
    },
    verificationStatus: {
      type: String,
      enum: ['pending', 'under_review', 'verified', 'rejected'],
      default: 'pending',
    },
    verificationNotes: String,
    verifiedAt: Date,
    rating: {
      average: { type: Number, default: 0, min: 0, max: 5 },
      count: { type: Number, default: 0 },
      total: { type: Number, default: 0 },
    },
    totalRepairs: { type: Number, default: 0 },
    totalEarnings: { type: Number, default: 0 },
    openingHours: {
      weekdays: { open: String, close: String },
      weekends: { open: String, close: String },
    },
    isActive: { type: Boolean, default: true },
    establishedYear: Number,
    gstNumber: String,
    identityDocumentUrl: String,
  },
  {
    timestamps: true,
  }
);

// user index is created automatically by unique: true
vendorProfileSchema.index({ isVerified: 1 });
vendorProfileSchema.index({ 'address.city': 1 });
vendorProfileSchema.index({ deviceCategories: 1 });
vendorProfileSchema.index({ 'rating.average': -1 });

module.exports = mongoose.model('VendorProfile', vendorProfileSchema);
