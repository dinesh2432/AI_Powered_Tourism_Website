const ChatMessage = require('../models/ChatMessage');
const { translateMessage } = require('../services/geminiService');
const User = require('../models/User');

// Build a consistent conversation ID from two user IDs
const buildConversationId = (id1, id2) => {
  return [id1.toString(), id2.toString()].sort().join('_');
};

// @desc    Send a message (with AI translation)
// @route   POST /api/chat/send
// @access  Private
const sendMessage = async (req, res) => {
  try {
    const { receiverId, originalText, tripId } = req.body;

    if (!receiverId || !originalText) {
      return res.status(400).json({ success: false, message: 'receiverId and message text are required' });
    }

    const sender = await User.findById(req.user._id);
    const receiver = await User.findById(receiverId);

    if (!receiver) return res.status(404).json({ success: false, message: 'Receiver not found' });

    const senderLang = sender.preferredLanguage || 'en';
    const receiverLang = receiver.preferredLanguage || 'en';

    // Translate message using Gemini
    let translatedText = originalText;
    if (senderLang !== receiverLang) {
      try {
        translatedText = await translateMessage(originalText, senderLang, receiverLang);
      } catch (err) {
        console.error('Translation error:', err.message);
      }
    }

    const conversationId = buildConversationId(req.user._id, receiverId);

    const message = await ChatMessage.create({
      conversationId,
      senderId: req.user._id,
      receiverId,
      tripId: tripId || null,
      originalText,
      translatedText,
      senderLanguage: senderLang,
      receiverLanguage: receiverLang,
    });

    const populatedMessage = await ChatMessage.findById(message._id)
      .populate('senderId', 'name profileImage')
      .populate('receiverId', 'name profileImage');

    res.status(201).json({ success: true, message: populatedMessage });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get messages in a conversation
// @route   GET /api/chat/:userId
// @access  Private
const getMessages = async (req, res) => {
  try {
    const conversationId = buildConversationId(req.user._id, req.params.userId);

    const messages = await ChatMessage.find({ conversationId })
      .populate('senderId', 'name profileImage preferredLanguage')
      .populate('receiverId', 'name profileImage')
      .sort({ createdAt: 1 });

    // Mark unread messages as read
    await ChatMessage.updateMany(
      { conversationId, receiverId: req.user._id, isRead: false },
      { isRead: true }
    );

    res.status(200).json({ success: true, messages });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get all conversations for current user
// @route   GET /api/chat/conversations
// @access  Private
const getConversations = async (req, res) => {
  try {
    const userId = req.user._id.toString();

    const latestMessages = await ChatMessage.aggregate([
      {
        $match: {
          $or: [
            { senderId: req.user._id },
            { receiverId: req.user._id },
          ],
        },
      },
      { $sort: { createdAt: -1 } },
      {
        $group: {
          _id: '$conversationId',
          lastMessage: { $first: '$$ROOT' },
        },
      },
    ]);

    const populated = await ChatMessage.populate(latestMessages.map((m) => m.lastMessage), [
      { path: 'senderId', select: 'name profileImage' },
      { path: 'receiverId', select: 'name profileImage' },
    ]);

    res.status(200).json({ success: true, conversations: populated });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = { sendMessage, getMessages, getConversations };
