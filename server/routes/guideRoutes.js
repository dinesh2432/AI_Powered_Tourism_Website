const express = require('express');
const router = express.Router();
const {
  getGuides, getGuideById, applyToBeGuide, requestGuide,
  respondToRequest, getMyGuideRequests, getMySentRequests, getApplicationStatus
} = require('../controllers/guideController');
const { protect } = require('../middlewares/authMiddleware');
const { upload } = require('../services/cloudinaryService');

router.get('/', getGuides);
router.get('/my-requests', protect, getMyGuideRequests);
router.get('/my-sent-requests', protect, getMySentRequests);
router.get('/application-status', protect, getApplicationStatus);
router.get('/:id', getGuideById);
router.post('/apply', protect, upload.single('identityDocument'), applyToBeGuide);
router.post('/:id/request', protect, requestGuide);
router.put('/requests/:requestId', protect, respondToRequest);

module.exports = router;
