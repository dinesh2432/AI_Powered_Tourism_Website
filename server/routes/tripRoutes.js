const express = require('express');
const router = express.Router();
const {
  createTrip, getMyTrips, getTripById, deleteTrip, downloadTripPDF, askChatbot,
} = require('../controllers/tripController');
const {
  shareTripLink, revokeShareLink, getSharedTrip,
  addCollaborator, removeCollaborator, getCollaborators,
  addComment, getComments,
} = require('../controllers/collaborationController');
const { protect } = require('../middlewares/authMiddleware');

// Existing routes
router.post('/', protect, createTrip);
router.get('/', protect, getMyTrips);
router.post('/chatbot', protect, askChatbot);

// ── Share link (public route MUST be before /:id to avoid conflicts) ──
router.get('/shared/:token', getSharedTrip);          // Public – no auth

router.get('/:id', protect, getTripById);
router.delete('/:id', protect, deleteTrip);
router.get('/:id/pdf', protect, downloadTripPDF);

// ── Collaboration routes ───────────────────────────────────────────────
router.post('/:id/share', protect, shareTripLink);
router.delete('/:id/share', protect, revokeShareLink);

router.get('/:id/collaborators', protect, getCollaborators);
router.post('/:id/collaborators', protect, addCollaborator);
router.delete('/:id/collaborators/:userId', protect, removeCollaborator);

router.get('/:id/comments', protect, getComments);
router.post('/:id/comments', protect, addComment);

module.exports = router;
