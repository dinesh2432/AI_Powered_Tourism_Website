const Trip = require('../models/Trip');
const User = require('../models/User');
const Invitation = require('../models/Invitation');
const { getPlan, getEffectivePlan } = require('../utils/planConfig');

// ── Helpers ───────────────────────────────────────────────────────────────────
const isOwner = (trip, userId) => trip.userId.toString() === userId.toString();

// @desc    Send a collaboration invitation
// @route   POST /api/trips/:id/invite
// @access  Private (trip owner only)
const sendInvitation = async (req, res) => {
  try {
    const { email, role = 'editor' } = req.body;

    if (!email || !email.trim())
      return res.status(400).json({ success: false, message: 'Email is required' });

    if (!['viewer', 'editor'].includes(role))
      return res.status(400).json({ success: false, message: 'Role must be viewer or editor' });

    const trip = await Trip.findById(req.params.id);
    if (!trip) return res.status(404).json({ success: false, message: 'Trip not found' });

    if (!isOwner(trip, req.user._id))
      return res.status(403).json({ success: false, message: 'Only the trip owner can invite collaborators' });

    // ── Plan gate: FREE users cannot invite anyone ──
    const effectivePlan = getEffectivePlan(req.user);
    const planConfig    = getPlan(effectivePlan);

    if (!planConfig.canInvite) {
      return res.status(403).json({
        success: false,
        message: 'Collaboration invitations are available on PRO and PREMIUM plans.',
        upgradeRequired: true,
        currentPlan: effectivePlan,
      });
    }

    // ── Enforece collaborator count limit ──
    // Count existing collaborators + pending invitations (prevents circumventing via multi-invite)
    const pendingInviteCount = await Invitation.countDocuments({
      tripId: trip._id,
      status: 'pending',
    });
    const totalCollaboratorSlots = trip.collaborators.length + pendingInviteCount;

    if (totalCollaboratorSlots >= planConfig.maxCollaborators) {
      return res.status(403).json({
        success: false,
        message: `Your ${effectivePlan} plan allows a maximum of ${planConfig.maxCollaborators} collaborator(s) per trip.`,
        upgradeRequired: effectivePlan === 'PRO', // PRO can upgrade to PREMIUM for more
        currentPlan: effectivePlan,
        limit: planConfig.maxCollaborators,
      });
    }

    // Find target user (after plan gates — fast-fail before expensive DB lookup)
    const targetUser = await User.findOne({ email: email.toLowerCase().trim() });
    if (!targetUser)
      return res.status(404).json({ success: false, message: 'No user found with that email address' });

    // Prevent self-invite
    if (targetUser._id.toString() === req.user._id.toString())
      return res.status(400).json({ success: false, message: 'You cannot invite yourself' });

    // Prevent inviting someone already a collaborator
    const alreadyCollaborator = trip.collaborators.some(
      (c) => c.user.toString() === targetUser._id.toString()
    );
    if (alreadyCollaborator)
      return res.status(400).json({ success: false, message: 'This user is already a collaborator' });

    // Prevent duplicate pending invitation
    const existingInvite = await Invitation.findOne({
      tripId: trip._id,
      toUser: targetUser._id,
      status: 'pending',
    });
    if (existingInvite)
      return res.status(400).json({ success: false, message: 'An invitation is already pending for this user' });

    // Create invitation
    const invitation = await Invitation.create({
      tripId: trip._id,
      fromUser: req.user._id,
      toUser: targetUser._id,
      toEmail: email.toLowerCase().trim(),
      role,
    });

    // Push notification to the invitee's notifications array
    await User.findByIdAndUpdate(targetUser._id, {
      $push: {
        notifications: {
          type: 'collaboration_invite',
          tripId: trip._id,
          inviteId: invitation._id,
          fromName: req.user.name,
          tripName: trip.destination,
          role,
          read: false,
          createdAt: new Date(),
        },
      },
    });

    res.status(201).json({
      success: true,
      message: `Invitation sent to ${targetUser.name} (${targetUser.email})`,
      invitation: {
        _id: invitation._id,
        toEmail: invitation.toEmail,
        role: invitation.role,
        status: invitation.status,
      },
    });
  } catch (error) {
    console.error('[sendInvitation] Error:', error.message);
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Accept a collaboration invitation
// @route   POST /api/invitations/:id/accept
// @access  Private (invitee only)
const acceptInvitation = async (req, res) => {
  try {
    const invitation = await Invitation.findById(req.params.id);

    if (!invitation)
      return res.status(404).json({ success: false, message: 'Invitation not found or expired' });

    if (invitation.toUser.toString() !== req.user._id.toString())
      return res.status(403).json({ success: false, message: 'Not your invitation' });

    if (invitation.status !== 'pending')
      return res.status(400).json({ success: false, message: `Invitation is already ${invitation.status}` });

    if (invitation.expiresAt < new Date())
      return res.status(400).json({ success: false, message: 'This invitation has expired' });

    // Add user to trip collaborators
    const trip = await Trip.findById(invitation.tripId);
    if (!trip)
      return res.status(404).json({ success: false, message: 'The trip no longer exists' });

    // ── BUG-06 FIX: enforce acceptRoles based on the INVITEE's own plan ──────
    // FREE users can only accept as 'viewer' regardless of what role the owner assigned
    const inviteePlan       = getEffectivePlan(req.user);
    const inviteePlanConfig = getPlan(inviteePlan);
    const allowedRoles      = inviteePlanConfig.acceptRoles || ['viewer', 'editor'];
    const assignedRole      = allowedRoles.includes(invitation.role)
      ? invitation.role
      : allowedRoles[0]; // fallback to first allowed (viewer for FREE)

    // Prevent duplicate (in case they were somehow added manually in between)
    const alreadyThere = trip.collaborators.some(
      (c) => c.user.toString() === req.user._id.toString()
    );
    if (!alreadyThere) {
      trip.collaborators.push({ user: req.user._id, role: assignedRole });
      await trip.save();
    }

    // Mark invitation accepted
    invitation.status = 'accepted';
    await invitation.save();

    // Mark the notification as read
    await User.updateOne(
      { _id: req.user._id, 'notifications.inviteId': invitation._id },
      { $set: { 'notifications.$.read': true } }
    );

    // Notify the trip owner
    await User.findByIdAndUpdate(invitation.fromUser, {
      $push: {
        notifications: {
          type: 'invite_accepted',
          tripId: trip._id,
          inviteId: invitation._id,
          fromName: req.user.name,
          tripName: trip.destination,
          role: invitation.role,
          read: false,
          createdAt: new Date(),
        },
      },
    });

    res.status(200).json({
      success: true,
      message: 'You have joined the trip! It will appear in your My Trips.',
      tripId: trip._id,
      destination: trip.destination,
    });
  } catch (error) {
    console.error('[acceptInvitation] Error:', error.message);
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Decline a collaboration invitation
// @route   POST /api/invitations/:id/decline
// @access  Private (invitee only)
const declineInvitation = async (req, res) => {
  try {
    const invitation = await Invitation.findById(req.params.id);

    if (!invitation)
      return res.status(404).json({ success: false, message: 'Invitation not found or expired' });

    if (invitation.toUser.toString() !== req.user._id.toString())
      return res.status(403).json({ success: false, message: 'Not your invitation' });

    if (invitation.status !== 'pending')
      return res.status(400).json({ success: false, message: `Invitation already ${invitation.status}` });

    invitation.status = 'declined';
    await invitation.save();

    // Mark notification read
    await User.updateOne(
      { _id: req.user._id, 'notifications.inviteId': invitation._id },
      { $set: { 'notifications.$.read': true } }
    );

    res.status(200).json({ success: true, message: 'Invitation declined' });
  } catch (error) {
    console.error('[declineInvitation] Error:', error.message);
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get all notifications for current user
// @route   GET /api/notifications
// @access  Private
const getNotifications = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('notifications');
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });

    // Sort newest first, return last 50
    const sorted = [...(user.notifications || [])]
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      .slice(0, 50);

    const unreadCount = sorted.filter((n) => !n.read).length;

    res.status(200).json({ success: true, notifications: sorted, unreadCount });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Mark all notifications as read
// @route   PUT /api/notifications/read-all
// @access  Private
const markAllRead = async (req, res) => {
  try {
    await User.updateOne(
      { _id: req.user._id },
      { $set: { 'notifications.$[].read': true } }
    );
    res.status(200).json({ success: true, message: 'All notifications marked as read' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get pending invitations sent to a trip (for owner to see status)
// @route   GET /api/trips/:id/invitations
// @access  Private (owner)
const getTripInvitations = async (req, res) => {
  try {
    const trip = await Trip.findById(req.params.id);
    if (!trip) return res.status(404).json({ success: false, message: 'Trip not found' });

    if (!isOwner(trip, req.user._id))
      return res.status(403).json({ success: false, message: 'Only the owner can view invitations' });

    const invitations = await Invitation.find({ tripId: trip._id })
      .populate('toUser', 'name email profileImage')
      .sort({ createdAt: -1 });

    res.status(200).json({ success: true, invitations });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  sendInvitation,
  acceptInvitation,
  declineInvitation,
  getNotifications,
  markAllRead,
  getTripInvitations,
};
