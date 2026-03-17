const mongoose = require('mongoose');

const guideSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
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
      type: Number, // years of experience
      required: true,
    },
    description: {
      type: String,
      required: true,
      maxlength: [1000, 'Description cannot exceed 1000 characters'],
    },
    rating: {
      type: Number,
      min: 0,
      max: 5,
      default: 0,
    },
    totalRatings: {
      type: Number,
      default: 0,
    },
    profileImage: {
      type: String,
      default: '',
    },
    isAvailable: {
      type: Boolean,
      default: true,
    },
    specialties: {
      type: [String],
      default: [],
    },
    pricePerDay: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Guide', guideSchema);
