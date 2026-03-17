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

module.exports = { sendVerificationEmail, sendPasswordResetEmail, sendTripReminderEmail };
