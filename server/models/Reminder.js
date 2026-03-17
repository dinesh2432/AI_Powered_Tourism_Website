const mongoose = require('mongoose');

const reminderSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    tripId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Trip',
      required: true,
    },
    reminderDate: {
      type: Date,
      required: true,
    },
    type: {
      type: String,
      enum: ['3days', '1day', 'weather', 'packing'],
      default: '3days',
    },
    sent: {
      type: Boolean,
      default: false,
    },
    sentAt: Date,
  },
  { timestamps: true }
);

module.exports = mongoose.model('Reminder', reminderSchema);
