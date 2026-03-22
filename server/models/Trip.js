const mongoose = require('mongoose');

const tripSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    source: {
      type: String,
      required: [true, 'Source location is required'],
      trim: true,
    },
    destination: {
      type: String,
      required: [true, 'Destination is required'],
      trim: true,
    },
    startDate: {
      type: Date,
      required: [true, 'Start date is required'],
    },
    endDate: {
      type: Date,
      required: [true, 'End date is required'],
    },
    budget: {
      type: Number,
      required: [true, 'Budget is required'],
    },
    currency: {
      type: String,
      default: 'USD',
    },
    members: {
      type: Number,
      default: 1,
    },
    accommodationType: {
      type: String,
      enum: ['Budget', 'Standard', 'Luxury'],
      default: 'Standard',
    },
    aiResponse: {
      overview: { type: String, default: '' },
      daily_itinerary: { type: mongoose.Schema.Types.Mixed, default: [] },
      transportation: { type: mongoose.Schema.Types.Mixed, default: {} },
      hotels: { type: mongoose.Schema.Types.Mixed, default: [] },
      budget_breakdown: { type: mongoose.Schema.Types.Mixed, default: {} },
      packing_checklist: { type: [String], default: [] },
      travel_warnings: { type: [String], default: [] },
    },
    images: {
      destination: [String],
      attractions: [String],
      hotels: [String],
    },
    coordinates: {
      destination: {
        lat: Number,
        lng: Number,
      },
    },
    status: {
      type: String,
      enum: ['upcoming', 'ongoing', 'completed'],
      default: 'upcoming',
    },

    // ── Collaboration fields ──────────────────────────────────────────────
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    collaborators: [
      {
        user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        role: { type: String, enum: ['viewer', 'editor'], default: 'editor' },
      },
    ],
    isShared: {
      type: Boolean,
      default: false,
    },
    sharedLinkToken: {
      type: String,
      default: null,
    },
    comments: [
      {
        user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
        message: { type: String, required: true, trim: true },
        dayIndex: { type: Number, default: null },
        createdAt: { type: Date, default: Date.now },
      },
    ],
  },
  { timestamps: true }
);

// Sparse unique index on sharedLinkToken (null values ignored)
tripSchema.index({ sharedLinkToken: 1 }, { unique: true, sparse: true });

module.exports = mongoose.model('Trip', tripSchema);
