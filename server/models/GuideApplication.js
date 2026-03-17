const mongoose = require('mongoose');

const guideApplicationSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    city: {
      type: String,
      required: true,
      trim: true,
    },
    languages: {
      type: [String],
      required: true,
    },
    experience: {
      type: Number,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    identityDocument: {
      type: String, // Cloudinary URL
      required: true,
    },
    status: {
      type: String,
      enum: ['pending', 'approved', 'rejected'],
      default: 'pending',
    },
    adminNote: {
      type: String,
      default: '',
    },
    reviewedAt: Date,
    reviewedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('GuideApplication', guideApplicationSchema);
