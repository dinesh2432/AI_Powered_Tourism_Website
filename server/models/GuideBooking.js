const mongoose = require('mongoose');

/**
 * GuideBooking — represents a tourist's request to book a local guide.
 *
 * Flow:
 *   Tourist submits booking → Guide receives email → Guide contacts tourist → booking accepted/rejected
 *
 * Status lifecycle: pending → accepted | rejected
 */
const guideBookingSchema = new mongoose.Schema(
  {
    // The tourist who is booking
    touristId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },

    // The guide being booked (Guide document, not User)
    guideId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Guide',
      required: true,
    },

    // Requested location / destination
    location: {
      type: String,
      required: [true, 'Location is required'],
      trim: true,
    },

    // Preferred travel date
    travelDate: {
      type: Date,
      required: [true, 'Travel date is required'],
    },

    // Optional personal message to the guide
    message: {
      type: String,
      default: '',
      maxlength: [1000, 'Message cannot exceed 1000 characters'],
    },

    // Booking lifecycle status
    status: {
      type: String,
      enum: ['pending', 'accepted', 'rejected'],
      default: 'pending',
    },

    // Optional note from the guide when accepting/rejecting
    guideNote: {
      type: String,
      default: '',
    },

    // Tracks whether the guide email notification was sent
    emailSent: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

// Index for fast lookups by guide and tourist
guideBookingSchema.index({ guideId: 1, status: 1 });
guideBookingSchema.index({ touristId: 1 });

module.exports = mongoose.model('GuideBooking', guideBookingSchema);
