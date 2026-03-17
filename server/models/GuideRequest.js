const mongoose = require('mongoose');

const guideRequestSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    guideId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Guide',
      required: true,
    },
    tripId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Trip',
    },
    message: {
      type: String,
      default: '',
    },
    status: {
      type: String,
      enum: ['pending', 'accepted', 'rejected'],
      default: 'pending',
    },
    tripDates: {
      start: Date,
      end: Date,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('GuideRequest', guideRequestSchema);
