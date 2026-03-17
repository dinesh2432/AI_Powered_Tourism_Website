const cron = require('node-cron');
const Trip = require('../models/Trip');
const User = require('../models/User');
const { sendTripReminderEmail } = require('../services/emailService');

// Run every day at 8:00 AM
cron.schedule('0 8 * * *', async () => {
  console.log('⏰ Running trip reminder scheduler...');
  try {
    const now = new Date();
    const in3Days = new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000);
    const in1Day = new Date(now.getTime() + 1 * 24 * 60 * 60 * 1000);

    // Helper to check same day (ignoring time)
    const isSameDay = (d1, d2) =>
      d1.getFullYear() === d2.getFullYear() &&
      d1.getMonth() === d2.getMonth() &&
      d1.getDate() === d2.getDate();

    // Trips starting in 3 days
    const tripsIn3 = await Trip.find({ status: 'upcoming' }).populate('userId', 'name email');
    for (const trip of tripsIn3) {
      const tripStart = new Date(trip.startDate);
      if (isSameDay(tripStart, in3Days)) {
        try {
          await sendTripReminderEmail(trip.userId.email, trip.userId.name, trip, '3days');
          console.log(`📧 3-day reminder sent to ${trip.userId.email} for trip to ${trip.destination}`);
        } catch (err) {
          console.error(`Email error for ${trip.userId.email}:`, err.message);
        }
      }
      // Trips starting tomorrow
      if (isSameDay(tripStart, in1Day)) {
        try {
          await sendTripReminderEmail(trip.userId.email, trip.userId.name, trip, '1day');
          console.log(`📧 1-day reminder sent to ${trip.userId.email} for trip to ${trip.destination}`);
        } catch (err) {
          console.error(`Email error for ${trip.userId.email}:`, err.message);
        }
      }
    }

    // Update ongoing trips status
    await Trip.updateMany(
      { status: 'upcoming', startDate: { $lte: now }, endDate: { $gte: now } },
      { $set: { status: 'ongoing' } }
    );
    // Update completed trips
    await Trip.updateMany(
      { status: { $in: ['upcoming', 'ongoing'] }, endDate: { $lt: now } },
      { $set: { status: 'completed' } }
    );

    console.log('✅ Reminder scheduler completed.');
  } catch (err) {
    console.error('Reminder scheduler error:', err.message);
  }
});

console.log('⏰ Trip reminder scheduler initialized (runs daily at 8:00 AM)');
