const User = require('../models/User');
const Trip = require('../models/Trip');
const Guide = require('../models/Guide');
const GuideApplication = require('../models/GuideApplication');
const Video = require('../models/Video');
const { uploadToCloudinary, deleteFromCloudinary } = require('../services/cloudinaryService');

// @desc    Get all users
// @route   GET /api/admin/users
// @access  Admin
const getAllUsers = async (req, res) => {
  try {
    const { page = 1, limit = 20, search } = req.query;
    const filter = search
      ? { $or: [{ name: { $regex: search, $options: 'i' } }, { email: { $regex: search, $options: 'i' } }] }
      : {};

    const users = await User.find(filter)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit))
      .select('-password -resetPasswordToken -verificationToken');

    const total = await User.countDocuments(filter);
    res.status(200).json({ success: true, users, total });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get platform analytics
// @route   GET /api/admin/analytics
// @access  Admin
const getAnalytics = async (req, res) => {
  try {
    const [totalUsers, totalTrips, totalGuides, pendingApplications, totalVideos] = await Promise.all([
      User.countDocuments(),
      Trip.countDocuments(),
      Guide.countDocuments(),
      GuideApplication.countDocuments({ status: 'pending' }),
      Video.countDocuments(),
    ]);

    const recentUsers = await User.find().sort({ createdAt: -1 }).limit(5).select('name email createdAt profileImage');
    const recentTrips = await Trip.find().sort({ createdAt: -1 }).limit(5).select('destination source startDate userId');

    // Trips by month (last 6 months)
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
    const tripsByMonth = await Trip.aggregate([
      { $match: { createdAt: { $gte: sixMonthsAgo } } },
      { $group: { _id: { month: { $month: '$createdAt' }, year: { $year: '$createdAt' } }, count: { $sum: 1 } } },
      { $sort: { '_id.year': 1, '_id.month': 1 } },
    ]);

    res.status(200).json({
      success: true,
      stats: { totalUsers, totalTrips, totalGuides, pendingApplications, totalVideos },
      recentUsers,
      recentTrips,
      tripsByMonth,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get pending guide applications
// @route   GET /api/admin/applications
// @access  Admin
const getApplications = async (req, res) => {
  try {
    const { status = 'pending' } = req.query;
    const applications = await GuideApplication.find({ status })
      .populate('userId', 'name email profileImage')
      .sort({ createdAt: -1 });
    res.status(200).json({ success: true, applications });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Approve guide application
// @route   PUT /api/admin/applications/:id/approve
// @access  Admin
const approveApplication = async (req, res) => {
  try {
    const application = await GuideApplication.findByIdAndUpdate(
      req.params.id,
      {
        status: 'approved',
        reviewedBy: req.user._id,
        reviewedAt: new Date()
      },
      { new: true, runValidators: false }
    ).populate('userId');

    if (!application) return res.status(404).json({ success: false, message: 'Application not found' });

    // Create Guide profile
    await Guide.findOneAndUpdate(
      { userId: application.userId._id },
      {
        userId: application.userId._id,
        city: application.city,
        languages: application.languages,
        experience: application.experience,
        description: application.description,
        profileImage: application.userId.profileImage || '',
      },
      { upsert: true, new: true, runValidators: false }
    );

    // Mark user as guide
    await User.findByIdAndUpdate(application.userId._id, { isGuide: true });

    res.status(200).json({ success: true, message: 'Application approved. Guide profile created.' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Reject guide application
// @route   PUT /api/admin/applications/:id/reject
// @access  Admin
const rejectApplication = async (req, res) => {
  try {
    const application = await GuideApplication.findByIdAndUpdate(
      req.params.id,
      {
        status: 'rejected',
        adminNote: req.body.reason || '',
        reviewedBy: req.user._id,
        reviewedAt: new Date()
      },
      { new: true, runValidators: false }
    );

    if (!application) return res.status(404).json({ success: false, message: 'Application not found' });

    res.status(200).json({ success: true, message: 'Application rejected.' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Upload explore video
// @route   POST /api/admin/videos
// @access  Admin
const uploadVideo = async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ success: false, message: 'No video file provided' });

    const result = await uploadToCloudinary(req.file.buffer, {
      resource_type: 'video',
      folder: 'ai-tourism/videos',
      chunk_size: 6000000,
    });

    const video = await Video.create({
      title: req.body.title || 'Travel Video',
      description: req.body.description || '',
      destination: req.body.destination || '',
      tags: req.body.tags ? req.body.tags.split(',').map((t) => t.trim()) : [],
      cloudinaryUrl: result.secure_url,
      publicId: result.public_id,
      thumbnail: result.secure_url.replace('/video/upload/', '/video/upload/so_0,f_jpg/'),
      duration: Math.round(result.duration || 0),
      uploadedBy: req.user._id,
    });

    res.status(201).json({ success: true, video });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Delete video
// @route   DELETE /api/admin/videos/:id
// @access  Admin
const deleteVideo = async (req, res) => {
  try {
    const video = await Video.findById(req.params.id);
    if (!video) return res.status(404).json({ success: false, message: 'Video not found' });

    await deleteFromCloudinary(video.publicId, 'video');
    await video.deleteOne();

    res.status(200).json({ success: true, message: 'Video deleted' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Toggle user admin status
// @route   PUT /api/admin/users/:id/toggle-admin
// @access  Admin
const toggleAdmin = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });
    user.isAdmin = !user.isAdmin;
    await user.save();
    res.status(200).json({ success: true, message: `Admin status ${user.isAdmin ? 'granted' : 'revoked'}` });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Manually set user subscription (admin override)
// @route   PATCH /api/admin/users/:id/subscription
// @access  Admin
const updateUserSubscription = async (req, res) => {
  try {
    const { subscription, durationDays = 30 } = req.body;
    const validPlans = ['FREE', 'PRO', 'PREMIUM'];

    if (!subscription || !validPlans.includes(subscription)) {
      return res.status(400).json({ success: false, message: 'Invalid plan. Must be FREE, PRO, or PREMIUM.' });
    }

    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });

    const now = new Date();
    const endDate = new Date(now);
    endDate.setDate(endDate.getDate() + Number(durationDays));

    const updateData = {
      subscription,
      subscriptionStartDate: now,
      subscriptionEndDate: subscription === 'FREE' ? null : endDate,
      monthlyTripCount: 0,
      monthlyTripResetDate: now,
    };

    const updatedUser = await User.findByIdAndUpdate(req.params.id, updateData, {
      new: true,
      select: '-password',
    });

    res.status(200).json({
      success: true,
      message: `Subscription updated to ${subscription} for ${user.name}`,
      user: updatedUser,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = { getAllUsers, getAnalytics, getApplications, approveApplication, rejectApplication, uploadVideo, deleteVideo, toggleAdmin, updateUserSubscription };
