const express = require('express');
const router = express.Router();
const Video = require('../models/Video');
const { protect } = require('../middlewares/authMiddleware');

// @desc    Get all explore videos
// @route   GET /api/explore
// @access  Public
router.get('/', async (req, res) => {
  try {
    const { destination, page = 1, limit = 12 } = req.query;
    const filter = destination ? { destination: { $regex: destination, $options: 'i' } } : {};

    const videos = await Video.find(filter)
      .populate('uploadedBy', 'name profileImage')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    const total = await Video.countDocuments(filter);
    res.status(200).json({ success: true, videos, total, pages: Math.ceil(total / limit) });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @desc    Increment video views
// @route   PUT /api/explore/:id/view
// @access  Public
router.put('/:id/view', async (req, res) => {
  try {
    await Video.findByIdAndUpdate(req.params.id, { $inc: { views: 1 } });
    res.status(200).json({ success: true });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
