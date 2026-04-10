const Guide = require('../models/Guide');
const GuideBooking = require('../models/GuideBooking');
const User = require('../models/User');
const { sendGuideBookingEmail } = require('../services/emailService');

// @desc    Create a guide booking request (tourist books a guide)
// @route   POST /api/bookings
// @access  Private (logged-in users)
const createBooking = async (req, res) => {
  try {
    const { guideId, location, travelDate, message } = req.body;

    if (!guideId || !location || !travelDate) {
      return res.status(400).json({
        success: false,
        message: 'guideId, location, and travelDate are required',
      });
    }

    // Validate guide exists
    const guide = await Guide.findById(guideId).populate('userId', 'name email');
    if (!guide) {
      return res.status(404).json({ success: false, message: 'Guide not found' });
    }

    // Prevent a guide from booking themselves
    if (guide.userId._id.toString() === req.user._id.toString()) {
      return res.status(400).json({ success: false, message: 'You cannot book yourself as a guide' });
    }

    // Prevent duplicate pending bookings
    const existingPending = await GuideBooking.findOne({
      touristId: req.user._id,
      guideId: guide._id,
      status: 'pending',
    });
    if (existingPending) {
      return res.status(400).json({
        success: false,
        message: 'You already have a pending booking with this guide',
      });
    }

    // Create booking record
    const booking = await GuideBooking.create({
      touristId: req.user._id,
      guideId: guide._id,
      location,
      travelDate: new Date(travelDate),
      message: message || '',
    });

    // Format the date nicely for the email
    const formattedDate = new Date(travelDate).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });

    // Send email notification to the guide (non-blocking — don't fail the request if email errors)
    try {
      await sendGuideBookingEmail({
        guideEmail: guide.userId.email,
        guideName: guide.userId.name,
        touristName: req.user.name,
        touristEmail: req.user.email,
        location,
        travelDate: formattedDate,
        message: message || '',
      });

      // Mark email as sent
      await GuideBooking.findByIdAndUpdate(booking._id, { emailSent: true });
    } catch (emailErr) {
      console.error('[createBooking] Email send failed (booking still created):', emailErr.message);
    }

    res.status(201).json({
      success: true,
      message: `Booking request sent to ${guide.userId.name}! They will contact you shortly.`,
      booking,
    });
  } catch (error) {
    console.error('[createBooking] Error:', error.message, error.stack);
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get all booking requests received by the current guide
// @route   GET /api/bookings/my-received
// @access  Private (guide only)
const getMyReceivedBookings = async (req, res) => {
  try {
    const guide = await Guide.findOne({ userId: req.user._id });
    if (!guide) {
      return res.status(404).json({ success: false, message: 'Guide profile not found' });
    }

    const bookings = await GuideBooking.find({ guideId: guide._id })
      .populate('touristId', 'name email profileImage')
      .sort({ createdAt: -1 });

    res.status(200).json({ success: true, bookings });
  } catch (error) {
    console.error('[getMyReceivedBookings] Error:', error.message);
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get all bookings made by the current tourist
// @route   GET /api/bookings/my-sent
// @access  Private
const getMySentBookings = async (req, res) => {
  try {
    const bookings = await GuideBooking.find({ touristId: req.user._id })
      .populate({
        path: 'guideId',
        populate: { path: 'userId', select: 'name email profileImage' },
      })
      .sort({ createdAt: -1 });

    res.status(200).json({ success: true, bookings });
  } catch (error) {
    console.error('[getMySentBookings] Error:', error.message);
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update booking status (guide accepts or rejects)
// @route   PUT /api/bookings/:id/status
// @access  Private (guide only)
const updateBookingStatus = async (req, res) => {
  try {
    const { status, guideNote } = req.body;
    const validStatuses = ['accepted', 'rejected'];

    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: `Invalid status. Must be one of: ${validStatuses.join(', ')}`,
      });
    }

    const booking = await GuideBooking.findById(req.params.id).populate('guideId');
    if (!booking) {
      return res.status(404).json({ success: false, message: 'Booking not found' });
    }

    // Ensure the logged-in user is the guide of this booking
    const guide = await Guide.findOne({ userId: req.user._id });
    if (!guide || guide._id.toString() !== booking.guideId._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized to update this booking' });
    }

    booking.status = status;
    booking.guideNote = guideNote || '';
    await booking.save();

    res.status(200).json({
      success: true,
      message: `Booking ${status} successfully`,
      booking,
    });
  } catch (error) {
    console.error('[updateBookingStatus] Error:', error.message);
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = { createBooking, getMyReceivedBookings, getMySentBookings, updateBookingStatus };
