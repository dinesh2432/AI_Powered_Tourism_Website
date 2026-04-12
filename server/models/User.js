const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
      maxlength: [50, 'Name cannot exceed 50 characters'],
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      match: [/^\S+@\S+\.\S+$/, 'Please enter a valid email'],
    },
    password: {
      type: String,
      required: [true, 'Password is required'],
      minlength: [6, 'Password must be at least 6 characters'],
      select: false,
    },
    profileImage: {
      type: String,
      default: '',
    },
    googleId: {
      type: String,
      default: null,
    },
    authProvider: {
      type: String,
      enum: ['email', 'google'],
      default: 'email',
    },
    isGuide: {
      type: Boolean,
      default: false,
    },
    isAdmin: {
      type: Boolean,
      default: false,
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
    verificationToken: String,
    verificationExpire: Date,
    resetPasswordToken: String,
    resetPasswordExpire: Date,
    preferredLanguage: {
      type: String,
      default: 'en',
    },
    travelStats: {
      totalTrips: { type: Number, default: 0 },
      citiesVisited: { type: Number, default: 0 },
      countriesVisited: { type: Number, default: 0 },
      totalDays: { type: Number, default: 0 },
    },

    // ── Subscription & Billing ──────────────────────────────────────────
    subscription: {
      type: String,
      enum: ['FREE', 'PRO', 'PREMIUM'],
      default: 'FREE',
    },
    subscriptionStartDate: { type: Date, default: null },
    subscriptionEndDate: { type: Date, default: null },
    monthlyTripCount: { type: Number, default: 0 },
    monthlyTripResetDate: { type: Date, default: Date.now },

    // ── Chatbot daily rate limiting (FREE plan: 10 messages/day) ─────────
    chatbotMessageCount: { type: Number, default: 0 },
    chatbotMessageResetDate: { type: Date, default: Date.now },

    // ── In-App Notifications ─────────────────────────────────────────────
    notifications: [
      {
        type: {
          type: String,
          enum: ['collaboration_invite', 'invite_accepted', 'invite_declined'],
          required: true,
        },
        tripId:     { type: mongoose.Schema.Types.ObjectId, ref: 'Trip' },
        inviteId:   { type: mongoose.Schema.Types.ObjectId, ref: 'Invitation' },
        fromName:   { type: String, default: '' },
        tripName:   { type: String, default: '' },
        role:       { type: String, default: '' },
        read:       { type: Boolean, default: false },
        createdAt:  { type: Date, default: Date.now },
      },
    ],
  },
  { timestamps: true }
);

// Hash password before save
userSchema.pre('save', async function () {
  if (!this.isModified('password')) return;
  const salt = await bcrypt.genSalt(12);
  this.password = await bcrypt.hash(this.password, salt);
});

// Compare password
userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

// Generate reset password token
userSchema.methods.getResetPasswordToken = function () {
  const resetToken = crypto.randomBytes(20).toString('hex');
  this.resetPasswordToken = crypto.createHash('sha256').update(resetToken).digest('hex');
  this.resetPasswordExpire = Date.now() + 15 * 60 * 1000; // 15 minutes
  return resetToken;
};

// Generate email verification token
userSchema.methods.getVerificationToken = function () {
  const token = crypto.randomBytes(20).toString('hex');
  this.verificationToken = crypto.createHash('sha256').update(token).digest('hex');
  this.verificationExpire = Date.now() + 24 * 60 * 60 * 1000; // 24 hours
  return token;
};

module.exports = mongoose.model('User', userSchema);
