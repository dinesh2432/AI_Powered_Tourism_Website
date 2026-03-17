const mongoose = require('mongoose');

const chatMessageSchema = new mongoose.Schema(
  {
    tripId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Trip',
    },
    conversationId: {
      type: String, // `${userId}_${guideId}` sorted
      required: true,
      index: true,
    },
    senderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    receiverId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    originalText: {
      type: String,
      required: true,
    },
    translatedText: {
      type: String,
      default: '',
    },
    senderLanguage: {
      type: String,
      default: 'en',
    },
    receiverLanguage: {
      type: String,
      default: 'en',
    },
    isRead: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('ChatMessage', chatMessageSchema);
