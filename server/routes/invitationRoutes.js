const express = require('express');
const router = express.Router();
const {
  sendInvitation,
  acceptInvitation,
  declineInvitation,
  getNotifications,
  markAllRead,
  getTripInvitations,
} = require('../controllers/invitationController');
const { protect } = require('../middlewares/authMiddleware');

// ── Notification routes ───────────────────────────────────────────────────────
router.get('/notifications', protect, getNotifications);
router.put('/notifications/read-all', protect, markAllRead);

// ── Invitation action routes ──────────────────────────────────────────────────
router.post('/invitations/:id/accept', protect, acceptInvitation);
router.post('/invitations/:id/decline', protect, declineInvitation);

// ── Trip-scoped invitation routes ─────────────────────────────────────────────
router.post('/trips/:id/invite', protect, sendInvitation);
router.get('/trips/:id/invitations', protect, getTripInvitations);

module.exports = router;
