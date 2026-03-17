const express = require('express');
const router = express.Router();
const {
  getAllUsers, getAnalytics, getApplications,
  approveApplication, rejectApplication, uploadVideo, deleteVideo, toggleAdmin,
} = require('../controllers/adminController');
const { protect, adminOnly } = require('../middlewares/authMiddleware');
const { upload } = require('../services/cloudinaryService');

router.use(protect, adminOnly);

router.get('/users', getAllUsers);
router.put('/users/:id/toggle-admin', toggleAdmin);
router.get('/analytics', getAnalytics);
router.get('/applications', getApplications);
router.put('/applications/:id/approve', approveApplication);
router.put('/applications/:id/reject', rejectApplication);
router.post('/videos', upload.single('video'), uploadVideo);
router.delete('/videos/:id', deleteVideo);

module.exports = router;
