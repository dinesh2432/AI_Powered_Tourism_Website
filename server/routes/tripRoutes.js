const express = require('express');
const router = express.Router();
const {
  createTrip, getMyTrips, getTripById, deleteTrip, downloadTripPDF, askChatbot,
} = require('../controllers/tripController');
const { protect } = require('../middlewares/authMiddleware');

router.post('/', protect, createTrip);
router.get('/', protect, getMyTrips);
router.get('/:id', protect, getTripById);
router.delete('/:id', protect, deleteTrip);
router.get('/:id/pdf', protect, downloadTripPDF);
router.post('/chatbot', protect, askChatbot);

module.exports = router;
