const mongoose = require('mongoose');

const videoSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Title is required'],
      trim: true,
    },
    description: {
      type: String,
      default: '',
    },
    cloudinaryUrl: {
      type: String,
      required: true,
    },
    publicId: {
      type: String,
      required: true,
    },
    thumbnail: {
      type: String,
      default: '',
    },
    destination: {
      type: String,
      default: '',
    },
    tags: {
      type: [String],
      default: [],
    },
    uploadedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    views: {
      type: Number,
      default: 0,
    },
    duration: {
      type: Number, // seconds
      default: 0,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Video', videoSchema);
