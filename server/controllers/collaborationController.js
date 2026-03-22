const { v4: uuidv4 } = require('uuid');
const Trip = require('../models/Trip');
const User = require('../models/User');

// Helpers
const isOwner = (trip, userId) => trip.userId.toString() === userId.toString();

const isCollaborator = (trip, userId) =>
  trip.collaborators.some((c) => c.user.toString() === userId.toString());

const getCollaboratorRole = (trip, userId) => {
  const c = trip.collaborators.find((c) => c.user.toString() === userId.toString());
  return c ? c.role : null;
};

// @desc    Generate or return existing share link
// @route   POST /api/trips/:id/share
// @access  Private (owner only)
const shareTripLink = async (req, res) => {
  try {
    const trip = await Trip.findById(req.params.id);
    if (!trip) return res.status(404).json({ success: false, message: 'Trip not found' });
    if (!isOwner(trip, req.user._id))
      return res.status(403).json({ success: false, message: 'Only the trip owner can share this trip' });

    if (!trip.sharedLinkToken) {
      trip.sharedLinkToken = uuidv4();
      trip.isShared = true;
      await trip.save();
    }

    const shareUrl = `${process.env.CLIENT_URL || 'http://localhost:5173'}/trip/share/${trip.sharedLinkToken}`;
    res.status(200).json({ success: true, token: trip.sharedLinkToken, shareUrl });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Revoke share link
// @route   DELETE /api/trips/:id/share
// @access  Private (owner only)
const revokeShareLink = async (req, res) => {
  try {
    const trip = await Trip.findById(req.params.id);
    if (!trip) return res.status(404).json({ success: false, message: 'Trip not found' });
    if (!isOwner(trip, req.user._id))
      return res.status(403).json({ success: false, message: 'Only the trip owner can revoke sharing' });

    trip.sharedLinkToken = null;
    trip.isShared = false;
    await trip.save();

    res.status(200).json({ success: true, message: 'Share link revoked' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    View shared trip (public – no auth)
// @route   GET /api/trips/shared/:token
// @access  Public
const getSharedTrip = async (req, res) => {
  try {
    const trip = await Trip.findOne({ sharedLinkToken: req.params.token, isShared: true })
      .populate('userId', 'name email profileImage')
      .populate('collaborators.user', 'name email profileImage');

    if (!trip) return res.status(404).json({ success: false, message: 'Trip not found or link has been revoked' });

    res.status(200).json({ success: true, trip });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Add collaborator by email
// @route   POST /api/trips/:id/collaborators
// @access  Private (owner only)
const addCollaborator = async (req, res) => {
  try {
    const { email, role = 'editor' } = req.body;
    if (!email) return res.status(400).json({ success: false, message: 'Email is required' });

    const trip = await Trip.findById(req.params.id);
    if (!trip) return res.status(404).json({ success: false, message: 'Trip not found' });
    if (!isOwner(trip, req.user._id))
      return res.status(403).json({ success: false, message: 'Only the trip owner can add collaborators' });

    const targetUser = await User.findOne({ email: email.toLowerCase() }).select('-password');
    if (!targetUser) return res.status(404).json({ success: false, message: 'User with this email not found' });

    // Prevent adding self
    if (targetUser._id.toString() === req.user._id.toString())
      return res.status(400).json({ success: false, message: 'You are already the owner of this trip' });

    // Prevent duplicate
    const alreadyAdded = trip.collaborators.some(
      (c) => c.user.toString() === targetUser._id.toString()
    );
    if (alreadyAdded)
      return res.status(400).json({ success: false, message: 'User is already a collaborator' });

    trip.collaborators.push({ user: targetUser._id, role });
    await trip.save();

    const populated = await Trip.findById(trip._id).populate('collaborators.user', 'name email profileImage');
    const newCollaborator = populated.collaborators.at(-1);

    res.status(201).json({ success: true, message: 'Collaborator added', collaborator: newCollaborator });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Remove collaborator
// @route   DELETE /api/trips/:id/collaborators/:userId
// @access  Private (owner only)
const removeCollaborator = async (req, res) => {
  try {
    const trip = await Trip.findById(req.params.id);
    if (!trip) return res.status(404).json({ success: false, message: 'Trip not found' });
    if (!isOwner(trip, req.user._id))
      return res.status(403).json({ success: false, message: 'Only the trip owner can remove collaborators' });

    const before = trip.collaborators.length;
    trip.collaborators = trip.collaborators.filter(
      (c) => c.user.toString() !== req.params.userId
    );

    if (trip.collaborators.length === before)
      return res.status(404).json({ success: false, message: 'Collaborator not found' });

    await trip.save();
    res.status(200).json({ success: true, message: 'Collaborator removed' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get collaborator list (owner + all collaborators)
// @route   GET /api/trips/:id/collaborators
// @access  Private (owner or collaborator)
const getCollaborators = async (req, res) => {
  try {
    const trip = await Trip.findById(req.params.id)
      .populate('userId', 'name email profileImage')
      .populate('collaborators.user', 'name email profileImage');

    if (!trip) return res.status(404).json({ success: false, message: 'Trip not found' });

    const hasAccess = isOwner(trip, req.user._id) || isCollaborator(trip, req.user._id) || req.user.isAdmin;
    if (!hasAccess) return res.status(403).json({ success: false, message: 'Not authorized' });

    res.status(200).json({
      success: true,
      owner: trip.userId,
      collaborators: trip.collaborators,
      isShared: trip.isShared,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Add a comment to a trip
// @route   POST /api/trips/:id/comments
// @access  Private (owner or editor collaborator)
const addComment = async (req, res) => {
  try {
    const { message, dayIndex } = req.body;
    if (!message || !message.trim())
      return res.status(400).json({ success: false, message: 'Comment message is required' });

    const trip = await Trip.findById(req.params.id);
    if (!trip) return res.status(404).json({ success: false, message: 'Trip not found' });

    const hasAccess = isOwner(trip, req.user._id) || isCollaborator(trip, req.user._id) || req.user.isAdmin;
    if (!hasAccess) return res.status(403).json({ success: false, message: 'Not authorized to comment on this trip' });

    // Viewers cannot comment
    if (!isOwner(trip, req.user._id) && !req.user.isAdmin) {
      const role = getCollaboratorRole(trip, req.user._id);
      if (role === 'viewer')
        return res.status(403).json({ success: false, message: 'Viewers cannot post comments' });
    }

    trip.comments.push({
      user: req.user._id,
      message: message.trim(),
      dayIndex: dayIndex != null ? Number(dayIndex) : null,
    });
    await trip.save();

    const populated = await Trip.findById(trip._id).populate('comments.user', 'name email profileImage');
    const newComment = populated.comments.at(-1);

    res.status(201).json({ success: true, comment: newComment });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get all comments for a trip
// @route   GET /api/trips/:id/comments
// @access  Private (owner or collaborator)
const getComments = async (req, res) => {
  try {
    const trip = await Trip.findById(req.params.id).populate('comments.user', 'name email profileImage');
    if (!trip) return res.status(404).json({ success: false, message: 'Trip not found' });

    const hasAccess = isOwner(trip, req.user._id) || isCollaborator(trip, req.user._id) || req.user.isAdmin;
    if (!hasAccess) return res.status(403).json({ success: false, message: 'Not authorized' });

    const sorted = [...trip.comments].sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
    res.status(200).json({ success: true, comments: sorted });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  shareTripLink,
  revokeShareLink,
  getSharedTrip,
  addCollaborator,
  removeCollaborator,
  getCollaborators,
  addComment,
  getComments,
};
