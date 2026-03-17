const Trip = require('../models/Trip');
const User = require('../models/User');
const { generateTripItinerary } = require('../services/geminiService');
const { getDestinationImages, getHotelImages } = require('../services/unsplashService');
const PDFDocument = require('pdfkit');

// @desc    Create AI trip
// @route   POST /api/trips
// @access  Private
const createTrip = async (req, res) => {
  try {
    const { source, destination, startDate, endDate, budget, members, accommodationType, currency } = req.body;

    if (!source || !destination || !startDate || !endDate || !budget) {
      return res.status(400).json({ success: false, message: 'Please fill all required fields' });
    }

    // Generate AI itinerary
    const aiResponse = await generateTripItinerary({
      source, destination, startDate, endDate, budget, members: members || 1,
      accommodationType: accommodationType || 'Standard', currency: currency || 'USD',
    });

    // Fetch images from Unsplash
    const destinationImages = await getDestinationImages(destination);
    const hotelImages = await Promise.all(
      (aiResponse.hotels || []).slice(0, 3).map((h) => getHotelImages(h.name, destination))
    );

    const trip = await Trip.create({
      userId: req.user._id,
      source,
      destination,
      startDate,
      endDate,
      budget,
      currency: currency || 'USD',
      members: members || 1,
      accommodationType: accommodationType || 'Standard',
      aiResponse,
      images: {
        destination: destinationImages,
        hotels: hotelImages.flat().slice(0, 6),
        attractions: [],
      },
    });

    // Update user travel stats
    await User.findByIdAndUpdate(req.user._id, {
      $inc: {
        'travelStats.totalTrips': 1,
        'travelStats.citiesVisited': 1,
        'travelStats.totalDays': Math.ceil((new Date(endDate) - new Date(startDate)) / (1000 * 60 * 60 * 24)),
      },
    });

    res.status(201).json({ success: true, trip });
  } catch (error) {
    console.error('Create trip error:', error);
    res.status(500).json({ success: false, message: error.message || 'Failed to generate trip' });
  }
};

// @desc    Get my trips
// @route   GET /api/trips
// @access  Private
const getMyTrips = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const trips = await Trip.find({ userId: req.user._id })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .select('-aiResponse.daily_itinerary -aiResponse.packing_checklist');

    const total = await Trip.countDocuments({ userId: req.user._id });

    res.status(200).json({
      success: true,
      trips,
      pagination: { page, limit, total, pages: Math.ceil(total / limit) },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get single trip
// @route   GET /api/trips/:id
// @access  Private
const getTripById = async (req, res) => {
  try {
    const trip = await Trip.findById(req.params.id).populate('userId', 'name email profileImage');

    if (!trip) {
      return res.status(404).json({ success: false, message: 'Trip not found' });
    }

    if (trip.userId._id.toString() !== req.user._id.toString() && !req.user.isAdmin) {
      return res.status(403).json({ success: false, message: 'Not authorized to view this trip' });
    }

    res.status(200).json({ success: true, trip });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Delete trip
// @route   DELETE /api/trips/:id
// @access  Private
const deleteTrip = async (req, res) => {
  try {
    const trip = await Trip.findById(req.params.id);
    if (!trip) return res.status(404).json({ success: false, message: 'Trip not found' });

    if (trip.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    await trip.deleteOne();
    await User.findByIdAndUpdate(req.user._id, { $inc: { 'travelStats.totalTrips': -1 } });

    res.status(200).json({ success: true, message: 'Trip deleted' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Download trip as PDF
// @route   GET /api/trips/:id/pdf
// @access  Private
const downloadTripPDF = async (req, res) => {
  try {
    const trip = await Trip.findById(req.params.id);
    if (!trip) return res.status(404).json({ success: false, message: 'Trip not found' });

    if (trip.userId.toString() !== req.user._id.toString() && !req.user.isAdmin) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    const doc = new PDFDocument({ margin: 50, size: 'A4' });

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="trip-${trip.destination.replace(/\s+/g, '-')}-itinerary.pdf"`);
    doc.pipe(res);

    const ai = trip.aiResponse;

    // Header
    doc.rect(0, 0, 595, 120).fill('#667eea');
    doc.fillColor('white').fontSize(28).font('Helvetica-Bold').text('✈ AI TOURISM PLATFORM', 50, 30);
    doc.fontSize(16).text(`Trip to ${trip.destination}`, 50, 65);
    doc.fontSize(12).font('Helvetica').text(
      `${new Date(trip.startDate).toDateString()} — ${new Date(trip.endDate).toDateString()}`,
      50, 90
    );

    doc.moveDown(4).fillColor('#333');

    // Overview
    doc.fontSize(18).font('Helvetica-Bold').fillColor('#667eea').text('TRIP OVERVIEW', { underline: true });
    doc.fontSize(11).font('Helvetica').fillColor('#555').text(ai.overview || 'No overview available.', { align: 'justify' });
    doc.moveDown();

    // Trip Info Box
    doc.fontSize(14).font('Helvetica-Bold').fillColor('#333').text('Trip Details:');
    doc.fontSize(11).font('Helvetica').fillColor('#555')
      .text(`From: ${trip.source}`)
      .text(`To: ${trip.destination}`)
      .text(`Duration: ${Math.ceil((new Date(trip.endDate) - new Date(trip.startDate)) / 86400000)} days`)
      .text(`Travelers: ${trip.members}`)
      .text(`Budget: ${trip.budget} ${trip.currency}`)
      .text(`Accommodation: ${trip.accommodationType}`);
    doc.moveDown();

    // Daily Itinerary
    if (ai.daily_itinerary && ai.daily_itinerary.length > 0) {
      doc.addPage();
      doc.fontSize(18).font('Helvetica-Bold').fillColor('#667eea').text('DAILY ITINERARY', { underline: true });
      doc.moveDown(0.5);

      ai.daily_itinerary.forEach((day) => {
        doc.fontSize(14).font('Helvetica-Bold').fillColor('#333').text(`Day ${day.day}: ${day.title || ''}`);
        if (day.activities) {
          day.activities.forEach((act) => {
            doc.fontSize(11).font('Helvetica-Bold').fillColor('#555').text(`  ${act.time || ''} — ${act.activity || ''}`);
            if (act.description) doc.fontSize(10).font('Helvetica').fillColor('#777').text(`    ${act.description}`);
            if (act.location) doc.fillColor('#888').text(`    📍 ${act.location}`);
          });
        }
        doc.moveDown(0.5);
      });
    }

    // Hotels
    if (ai.hotels && ai.hotels.length > 0) {
      doc.addPage();
      doc.fontSize(18).font('Helvetica-Bold').fillColor('#667eea').text('HOTEL RECOMMENDATIONS', { underline: true });
      doc.moveDown(0.5);
      ai.hotels.forEach((hotel) => {
        doc.fontSize(13).font('Helvetica-Bold').fillColor('#333').text(`🏨 ${hotel.name || 'Hotel'}`);
        doc.fontSize(11).font('Helvetica').fillColor('#555')
          .text(`  Location: ${hotel.location || ''}`)
          .text(`  Price/Night: ${hotel.price_per_night || 'N/A'} ${trip.currency}`)
          .text(`  Rating: ${hotel.rating || 'N/A'} ⭐`);
        doc.moveDown(0.5);
      });
    }

    // Budget Breakdown
    if (ai.budget_breakdown) {
      doc.fontSize(18).font('Helvetica-Bold').fillColor('#667eea').text('BUDGET BREAKDOWN', { underline: true });
      doc.moveDown(0.5);
      const bd = ai.budget_breakdown;
      Object.entries(bd).forEach(([key, value]) => {
        if (key !== 'currency') {
          doc.fontSize(11).font('Helvetica').fillColor('#555').text(`  ${key.charAt(0).toUpperCase() + key.slice(1).replace('_', ' ')}: ${value} ${trip.currency}`);
        }
      });
      doc.moveDown();
    }

    // Packing Checklist
    if (ai.packing_checklist && ai.packing_checklist.length > 0) {
      doc.fontSize(18).font('Helvetica-Bold').fillColor('#667eea').text('PACKING CHECKLIST', { underline: true });
      doc.moveDown(0.5);
      ai.packing_checklist.forEach((item) => {
        doc.fontSize(11).font('Helvetica').fillColor('#555').text(`  ☐ ${item}`);
      });
      doc.moveDown();
    }

    // Travel Warnings
    if (ai.travel_warnings && ai.travel_warnings.length > 0) {
      doc.fontSize(18).font('Helvetica-Bold').fillColor('#e74c3c').text('TRAVEL TIPS & WARNINGS', { underline: true });
      doc.moveDown(0.5);
      ai.travel_warnings.forEach((warning) => {
        doc.fontSize(11).font('Helvetica').fillColor('#555').text(`  ⚠️ ${warning}`);
      });
    }

    // Footer
    doc.moveDown(2);
    doc.fontSize(10).fillColor('#aaa').text(`Generated by AI Tourism Platform • ${new Date().toLocaleDateString()}`, { align: 'center' });

    doc.end();
  } catch (error) {
    console.error('PDF generation error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Ask AI chatbot
// @route   POST /api/trips/chatbot
// @access  Private
const askChatbot = async (req, res) => {
  try {
    const { question, context } = req.body;
    if (!question) return res.status(400).json({ success: false, message: 'Question is required' });

    const { answerTravelQuestion } = require('../services/geminiService');
    const answer = await answerTravelQuestion(question, context);

    res.status(200).json({ success: true, answer });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = { createTrip, getMyTrips, getTripById, deleteTrip, downloadTripPDF, askChatbot };
