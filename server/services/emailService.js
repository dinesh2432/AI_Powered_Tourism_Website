const nodemailer = require('nodemailer');

const createTransporter = () => {
  return nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: parseInt(process.env.EMAIL_PORT) || 587,
    secure: false,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });
};

const sendEmail = async ({ to, subject, html }) => {
  const transporter = createTransporter();
  const mailOptions = {
    from: `"AI Tourism Platform" <${process.env.EMAIL_USER}>`,
    to,
    subject,
    html,
  };
  await transporter.sendMail(mailOptions);
};

const sendVerificationEmail = async (email, name, token) => {
  const verifyUrl = `${process.env.CLIENT_URL}/verify-email/${token}`;
  await sendEmail({
    to: email,
    subject: '✉️ Verify Your Email - AI Tourism Platform',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background: #f9f9f9;">
        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; border-radius: 12px 12px 0 0; text-align: center;">
          <h1 style="color: white; margin: 0; font-size: 28px;">🌍 AI Tourism Platform</h1>
        </div>
        <div style="background: white; padding: 30px; border-radius: 0 0 12px 12px;">
          <h2 style="color: #333;">Hello, ${name}! 👋</h2>
          <p style="color: #666; font-size: 16px;">Welcome to the AI Tourism Platform! Please verify your email address to get started.</p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${verifyUrl}" style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 14px 30px; text-decoration: none; border-radius: 8px; font-size: 16px; font-weight: bold;">Verify Email</a>
          </div>
          <p style="color: #999; font-size: 14px;">This link expires in 24 hours. If you didn't create an account, please ignore this email.</p>
        </div>
      </div>
    `,
  });
};

const sendPasswordResetEmail = async (email, name, token) => {
  const resetUrl = `${process.env.CLIENT_URL}/reset-password/${token}`;
  await sendEmail({
    to: email,
    subject: '🔐 Password Reset - AI Tourism Platform',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background: #f9f9f9;">
        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; border-radius: 12px 12px 0 0; text-align: center;">
          <h1 style="color: white; margin: 0; font-size: 28px;">🌍 AI Tourism Platform</h1>
        </div>
        <div style="background: white; padding: 30px; border-radius: 0 0 12px 12px;">
          <h2 style="color: #333;">Password Reset Request</h2>
          <p style="color: #666; font-size: 16px;">Hi ${name}, we received a request to reset your password.</p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${resetUrl}" style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 14px 30px; text-decoration: none; border-radius: 8px; font-size: 16px; font-weight: bold;">Reset Password</a>
          </div>
          <p style="color: #999; font-size: 14px;">This link expires in 15 minutes. If you didn't request a password reset, please ignore this email.</p>
        </div>
      </div>
    `,
  });
};

const sendTripReminderEmail = async (email, name, tripDetails, type) => {
  const messages = {
    '3days': `Your trip to ${tripDetails.destination} starts in 3 days!`,
    '1day': `Your trip to ${tripDetails.destination} starts TOMORROW!`,
    weather: `Weather alert for your upcoming trip to ${tripDetails.destination}`,
    packing: `Don't forget to check your packing list for ${tripDetails.destination}!`,
  };
  await sendEmail({
    to: email,
    subject: `🏖️ Trip Reminder: ${messages[type]}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background: #f9f9f9;">
        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; border-radius: 12px 12px 0 0; text-align: center;">
          <h1 style="color: white; margin: 0; font-size: 28px;">🗺️ Trip Reminder</h1>
        </div>
        <div style="background: white; padding: 30px; border-radius: 0 0 12px 12px;">
          <h2 style="color: #333;">Hi ${name}! ✈️</h2>
          <p style="color: #666; font-size: 18px;">${messages[type]}</p>
          <div style="background: #f0f0ff; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <p><strong>Destination:</strong> ${tripDetails.destination}</p>
            <p><strong>Departure:</strong> ${new Date(tripDetails.startDate).toLocaleDateString()}</p>
            <p><strong>Return:</strong> ${new Date(tripDetails.endDate).toLocaleDateString()}</p>
          </div>
          <div style="text-align: center;">
            <a href="${process.env.CLIENT_URL}/trips/${tripDetails._id}" style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 14px 30px; text-decoration: none; border-radius: 8px; font-size: 16px;">View Trip Details</a>
          </div>
        </div>
      </div>
    `,
  });
};

const sendGuideBookingEmail = async ({ guideEmail, guideName, touristName, touristEmail, location, travelDate, message }) => {
  await sendEmail({
    to: guideEmail,
    subject: '🗺️ New Guide Booking Request - AI Tourism Platform',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background: #f9f9f9;">
        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; border-radius: 12px 12px 0 0; text-align: center;">
          <h1 style="color: white; margin: 0; font-size: 28px;">🌍 New Booking Request</h1>
          <p style="color: rgba(255,255,255,0.85); margin: 8px 0 0;">Someone wants to book you as their local guide!</p>
        </div>
        <div style="background: white; padding: 30px; border-radius: 0 0 12px 12px;">
          <h2 style="color: #333;">Hello, ${guideName}! 👋</h2>
          <p style="color: #666; font-size: 16px;">You have received a new guide booking request. Here are the details:</p>
          <div style="background: #f0f4ff; padding: 24px; border-radius: 10px; margin: 20px 0; border-left: 4px solid #667eea;">
            <table style="width: 100%; border-collapse: collapse;">
              <tr style="border-bottom: 1px solid #e0e7ff;">
                <td style="padding: 10px 0; color: #888; font-size: 14px; width: 40%;">Tourist Name</td>
                <td style="padding: 10px 0; color: #333; font-weight: bold; font-size: 14px;">${touristName}</td>
              </tr>
              <tr style="border-bottom: 1px solid #e0e7ff;">
                <td style="padding: 10px 0; color: #888; font-size: 14px;">Tourist Email</td>
                <td style="padding: 10px 0; color: #667eea; font-weight: bold; font-size: 14px;">
                  <a href="mailto:${touristEmail}" style="color: #667eea;">${touristEmail}</a>
                </td>
              </tr>
              <tr style="border-bottom: 1px solid #e0e7ff;">
                <td style="padding: 10px 0; color: #888; font-size: 14px;">📍 Location</td>
                <td style="padding: 10px 0; color: #333; font-weight: bold; font-size: 14px;">${location}</td>
              </tr>
              <tr style="border-bottom: 1px solid #e0e7ff;">
                <td style="padding: 10px 0; color: #888; font-size: 14px;">📅 Travel Date</td>
                <td style="padding: 10px 0; color: #333; font-weight: bold; font-size: 14px;">${travelDate}</td>
              </tr>
              <tr>
                <td style="padding: 10px 0; color: #888; font-size: 14px; vertical-align: top;">💬 Message</td>
                <td style="padding: 10px 0; color: #333; font-size: 14px; font-style: italic;">${message || 'No message provided.'}</td>
              </tr>
            </table>
          </div>
          <p style="color: #666; font-size: 15px;">Please contact the tourist directly at <strong>${touristEmail}</strong> to confirm the booking details.</p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="mailto:${touristEmail}" style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 14px 30px; text-decoration: none; border-radius: 8px; font-size: 16px; font-weight: bold;">📧 Reply to Tourist</a>
          </div>
          <p style="color: #999; font-size: 13px; text-align: center;">This request was submitted via the AI Tourism Platform. You can accept or decline by contacting the tourist directly.</p>
        </div>
      </div>
    `,
  });
};

module.exports = { sendVerificationEmail, sendPasswordResetEmail, sendTripReminderEmail, sendGuideBookingEmail };
