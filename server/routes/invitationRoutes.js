const express = require('express');
const router = express.Router();
const {
  acceptInvitation,
  declineInvitation,
  getNotifications,
  markAllRead,
} = require('../controllers/invitationController');
const { protect } = require('../middlewares/authMiddleware');

// ── Notification routes ───────────────────────────────────────────────────────
router.get('/notifications', protect, getNotifications);
router.put('/notifications/read-all', protect, markAllRead);

// ── Invitation action routes ──────────────────────────────────────────────────
router.post('/invitations/:id/accept', protect, acceptInvitation);
router.post('/invitations/:id/decline', protect, declineInvitation);

module.exports = router;
