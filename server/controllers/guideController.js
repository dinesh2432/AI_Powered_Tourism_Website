const Guide = require('../models/Guide');
const GuideApplication = require('../models/GuideApplication');
const GuideRequest = require('../models/GuideRequest');
const User = require('../models/User');

// @desc    Get all guides (optionally filter by city)
// @route   GET /api/guides
// @access  Public
const getGuides = async (req, res) => {
  try {
    const { city, language, page = 1, limit = 12 } = req.query;
    const filter = {};
    if (city) filter.city = { $regex: city, $options: 'i' };
    if (language) filter.languages = { $in: [new RegExp(language, 'i')] };

    const guides = await Guide.find(filter)
      .populate('userId', 'name email profileImage')
      .sort({ rating: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    const total = await Guide.countDocuments(filter);
    res.status(200).json({ success: true, guides, total, pages: Math.ceil(total / limit) });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get guide profile
// @route   GET /api/guides/:id
// @access  Public
const getGuideById = async (req, res) => {
  try {
    const guide = await Guide.findById(req.params.id).populate('userId', 'name email profileImage createdAt');
    if (!guide) return res.status(404).json({ success: false, message: 'Guide not found' });
    res.status(200).json({ success: true, guide });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Apply to become a guide
// @route   POST /api/guides/apply
// @access  Private
const applyToBeGuide = async (req, res) => {
  try {
    const { city, languages, experience, description, identityDocument } = req.body;

    const existing = await GuideApplication.findOne({ userId: req.user._id, status: 'pending' });
    if (existing) {
      return res.status(400).json({ success: false, message: 'You already have a pending application' });
    }

    const application = await GuideApplication.create({
      userId: req.user._id,
      city,
      languages: Array.isArray(languages) ? languages : languages.split(',').map((l) => l.trim()),
      experience,
      description,
      identityDocument: identityDocument || 'pending-upload',
    });

    res.status(201).json({ success: true, message: 'Application submitted. Pending admin review.', application });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Request a guide
// @route   POST /api/guides/:id/request
// @access  Private
const requestGuide = async (req, res) => {
  try {
    const guide = await Guide.findById(req.params.id);
    if (!guide) return res.status(404).json({ success: false, message: 'Guide not found' });

    const request = await GuideRequest.create({
      userId: req.user._id,
      guideId: guide._id,
      tripId: req.body.tripId,
      message: req.body.message || '',
      tripDates: { start: req.body.startDate, end: req.body.endDate },
    });

    res.status(201).json({ success: true, message: 'Guide request sent!', request });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Respond to guide request (guide accepts/rejects)
// @route   PUT /api/guides/requests/:requestId
// @access  Private (guide)
const respondToRequest = async (req, res) => {
  try {
    const request = await GuideRequest.findById(req.params.requestId).populate('guideId');
    if (!request) return res.status(404).json({ success: false, message: 'Request not found' });

    const guide = await Guide.findOne({ userId: req.user._id });
    if (!guide || guide._id.toString() !== request.guideId._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    request.status = req.body.status; // 'accepted' or 'rejected'
    await request.save();

    res.status(200).json({ success: true, message: `Request ${req.body.status}`, request });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get requests for current guide
// @route   GET /api/guides/my-requests
// @access  Private (guide)
const getMyGuideRequests = async (req, res) => {
  try {
    const guide = await Guide.findOne({ userId: req.user._id });
    if (!guide) return res.status(404).json({ success: false, message: 'Guide profile not found' });

    const requests = await GuideRequest.find({ guideId: guide._id })
      .populate('userId', 'name email profileImage')
      .populate('tripId', 'destination startDate endDate')
      .sort({ createdAt: -1 });

    res.status(200).json({ success: true, requests });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get requests sent by user
// @route   GET /api/guides/my-sent-requests
// @access  Private
const getMySentRequests = async (req, res) => {
  try {
    const requests = await GuideRequest.find({ userId: req.user._id })
      .populate({ path: 'guideId', populate: { path: 'userId', select: 'name profileImage' } })
      .sort({ createdAt: -1 });
    res.status(200).json({ success: true, requests });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = { getGuides, getGuideById, applyToBeGuide, requestGuide, respondToRequest, getMyGuideRequests, getMySentRequests };
