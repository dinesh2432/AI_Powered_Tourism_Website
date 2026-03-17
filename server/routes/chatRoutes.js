const express = require('express');
const router = express.Router();
const { sendMessage, getMessages, getConversations } = require('../controllers/chatController');
const { protect } = require('../middlewares/authMiddleware');

router.post('/send', protect, sendMessage);
router.get('/conversations', protect, getConversations);
router.get('/:userId', protect, getMessages);

module.exports = router;
