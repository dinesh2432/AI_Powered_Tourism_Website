const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const { OAuth2Client } = require('google-auth-library');
const User = require('../models/User');
const { sendVerificationEmail, sendPasswordResetEmail } = require('../services/emailService');
const { uploadToCloudinary, deleteFromCloudinary } = require('../services/cloudinaryService');

const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

// ─── Helpers ────────────────────────────────────────────────────────────────

/** Sign a JWT and return it */
const signToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE || '7d',
  });

/** Strip sensitive fields before sending user to client */
const sanitizeUser = (user) => {
  const obj = user.toObject ? user.toObject() : { ...user };
  delete obj.password;
  delete obj.resetPasswordToken;
  delete obj.resetPasswordExpire;
  delete obj.verificationToken;
  delete obj.verificationExpire;
  return obj;
};

// ─── @desc    Register a new user ──────────────────────────────────────────
// ─── @route   POST /api/auth/register
// ─── @access  Public
const register = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // Basic validation
    if (!name || !email || !password) {
      return res.status(400).json({ success: false, message: 'Please provide name, email, and password.' });
    }
    if (password.length < 8) {
      return res.status(400).json({ success: false, message: 'Password must be at least 8 characters.' });
    }

    // Duplicate email check
    const existing = await User.findOne({ email: email.toLowerCase() });
    if (existing) {
      return res.status(409).json({ success: false, message: 'An account with this email already exists.' });
    }

    // Create user — password is hashed by the pre-save hook in User.js
    const user = await User.create({ name: name.trim(), email: email.toLowerCase(), password });

    // Generate email verification token and send it (non-blocking — don't fail registration if email fails)
    try {
      const verifyToken = user.getVerificationToken();
      await user.save({ validateBeforeSave: false });
      await sendVerificationEmail(user.email, user.name, verifyToken);
    } catch (emailErr) {
      console.warn('[register] Verification email failed (non-fatal):', emailErr.message);
    }

    const token = signToken(user._id);

    return res.status(201).json({
      success: true,
      message: 'Account created! Please check your email to verify your account.',
      token,
      user: sanitizeUser(user),
    });
  } catch (error) {
    console.error('[register] Error:', error.message);
    return res.status(500).json({ success: false, message: 'Registration failed. Please try again.' });
  }
};

// ─── @desc    Login user ───────────────────────────────────────────────────
// ─── @route   POST /api/auth/login
// ─── @access  Public
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Please provide your email and password.' });
    }

    // Explicitly select password (it has select:false in schema)
    const user = await User.findOne({ email: email.toLowerCase() }).select('+password');
    if (!user) {
      // Generic message to prevent email enumeration
      return res.status(401).json({ success: false, message: 'Invalid email or password.' });
    }

    // Google-only accounts have no password
    if (user.authProvider === 'google' && !user.password) {
      return res.status(401).json({ success: false, message: 'This account uses Google Sign-In. Please sign in with Google.' });
    }

    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid email or password.' });
    }

    const token = signToken(user._id);

    return res.status(200).json({
      success: true,
      token,
      user: sanitizeUser(user),
    });
  } catch (error) {
    console.error('[login] Error:', error.message);
    return res.status(500).json({ success: false, message: 'Login failed. Please try again.' });
  }
};

// ─── @desc    Google OAuth sign-in / sign-up ──────────────────────────────
// ─── @route   POST /api/auth/google
// ─── @access  Public
const googleSignIn = async (req, res) => {
  try {
    const { token } = req.body;
    if (!token) {
      return res.status(400).json({ success: false, message: 'Google ID token is required.' });
    }

    // Verify the Google credential
    const ticket = await googleClient.verifyIdToken({
      idToken: token,
      audience: process.env.GOOGLE_CLIENT_ID,
    });
    const { sub: googleId, email, name, picture } = ticket.getPayload();

    // Find or create user
    let user = await User.findOne({ $or: [{ googleId }, { email }] });

    if (user) {
      // Link Google ID if user registered with email before
      if (!user.googleId) {
        user.googleId = googleId;
        user.authProvider = 'google';
        if (!user.profileImage && picture) user.profileImage = picture;
        user.isVerified = true;
        await user.save({ validateBeforeSave: false });
      }
    } else {
      // New user via Google
      user = await User.create({
        name,
        email,
        googleId,
        authProvider: 'google',
        profileImage: picture || '',
        isVerified: true,
        // Google-auth users have no password — set a random unusable one to satisfy schema
        password: crypto.randomBytes(32).toString('hex'),
      });
    }

    const jwtToken = signToken(user._id);

    return res.status(200).json({
      success: true,
      token: jwtToken,
      user: sanitizeUser(user),
    });
  } catch (error) {
    console.error('[googleSignIn] Error:', error.message);
    return res.status(401).json({ success: false, message: 'Google authentication failed. Please try again.' });
  }
};

// ─── @desc    Get current logged-in user ──────────────────────────────────
// ─── @route   GET /api/auth/me
// ─── @access  Private
const getMe = async (req, res) => {
  try {
    // req.user is already set by authMiddleware (without password)
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }
    return res.status(200).json({ success: true, user: sanitizeUser(user) });
  } catch (error) {
    console.error('[getMe] Error:', error.message);
    return res.status(500).json({ success: false, message: 'Failed to fetch user.' });
  }
};

// ─── @desc    Update user profile ─────────────────────────────────────────
// ─── @route   PUT /api/auth/profile
// ─── @access  Private
const updateProfile = async (req, res) => {
  try {
    const { name, preferredLanguage } = req.body;
    const updates = {};
    if (name && name.trim()) updates.name = name.trim().slice(0, 50);
    if (preferredLanguage) updates.preferredLanguage = preferredLanguage;

    const user = await User.findByIdAndUpdate(req.user._id, updates, {
      new: true,
      runValidators: true,
    });

    return res.status(200).json({ success: true, message: 'Profile updated.', user: sanitizeUser(user) });
  } catch (error) {
    console.error('[updateProfile] Error:', error.message);
    return res.status(500).json({ success: false, message: 'Profile update failed.' });
  }
};

// ─── @desc    Change password ─────────────────────────────────────────────
// ─── @route   PUT /api/auth/change-password
// ─── @access  Private
const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({ success: false, message: 'Both current and new password are required.' });
    }
    if (newPassword.length < 8) {
      return res.status(400).json({ success: false, message: 'New password must be at least 8 characters.' });
    }

    const user = await User.findById(req.user._id).select('+password');
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }

    // Google-auth users have no real password
    if (user.authProvider === 'google' && !user.password) {
      return res.status(400).json({ success: false, message: 'Google sign-in accounts cannot change passwords here.' });
    }

    const isMatch = await user.matchPassword(currentPassword);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Current password is incorrect.' });
    }

    // The pre-save hook will bcrypt this automatically
    user.password = newPassword;
    await user.save();

    return res.status(200).json({ success: true, message: 'Password changed successfully.' });
  } catch (error) {
    console.error('[changePassword] Error:', error.message);
    return res.status(500).json({ success: false, message: 'Password change failed.' });
  }
};

// ─── @desc    Verify email address ────────────────────────────────────────
// ─── @route   GET /api/auth/verify-email/:token
// ─── @access  Public
const verifyEmail = async (req, res) => {
  try {
    // Hash the raw token from the URL to match what is stored in DB
    const hashedToken = crypto.createHash('sha256').update(req.params.token).digest('hex');

    const user = await User.findOne({
      verificationToken: hashedToken,
      verificationExpire: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).json({ success: false, message: 'Invalid or expired verification link.' });
    }

    user.isVerified = true;
    user.verificationToken = undefined;
    user.verificationExpire = undefined;
    await user.save({ validateBeforeSave: false });

    return res.status(200).json({ success: true, message: 'Email verified successfully! You can now log in.' });
  } catch (error) {
    console.error('[verifyEmail] Error:', error.message);
    return res.status(500).json({ success: false, message: 'Email verification failed.' });
  }
};

// ─── @desc    Forgot password — send reset email ─────────────────────────
// ─── @route   POST /api/auth/forgot-password
// ─── @access  Public
const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ success: false, message: 'Please provide your email address.' });
    }

    const user = await User.findOne({ email: email.toLowerCase() });

    // Always return the same response to prevent email enumeration
    const genericMessage = 'If that email is registered, a password reset link has been sent.';

    if (!user) {
      return res.status(200).json({ success: true, message: genericMessage });
    }

    const resetToken = user.getResetPasswordToken();
    await user.save({ validateBeforeSave: false });

    try {
      await sendPasswordResetEmail(user.email, user.name, resetToken);
    } catch (emailErr) {
      // Rollback token if email sending fails
      user.resetPasswordToken = undefined;
      user.resetPasswordExpire = undefined;
      await user.save({ validateBeforeSave: false });
      console.error('[forgotPassword] Email send failed:', emailErr.message);
      return res.status(500).json({ success: false, message: 'Failed to send reset email. Please try again later.' });
    }

    return res.status(200).json({ success: true, message: genericMessage });
  } catch (error) {
    console.error('[forgotPassword] Error:', error.message);
    return res.status(500).json({ success: false, message: 'Something went wrong. Please try again.' });
  }
};

// ─── @desc    Reset password with token ──────────────────────────────────
// ─── @route   PUT /api/auth/reset-password/:token
// ─── @access  Public
const resetPassword = async (req, res) => {
  try {
    const { password } = req.body;
    if (!password || password.length < 8) {
      return res.status(400).json({ success: false, message: 'Password must be at least 8 characters.' });
    }

    // Hash the raw token from the URL
    const hashedToken = crypto.createHash('sha256').update(req.params.token).digest('hex');

    const user = await User.findOne({
      resetPasswordToken: hashedToken,
      resetPasswordExpire: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).json({ success: false, message: 'Invalid or expired reset link. Please request a new one.' });
    }

    // The pre-save hook will bcrypt hash the new password
    user.password = password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;
    await user.save();

    return res.status(200).json({ success: true, message: 'Password reset successfully. You can now log in.' });
  } catch (error) {
    console.error('[resetPassword] Error:', error.message);
    return res.status(500).json({ success: false, message: 'Password reset failed. Please try again.' });
  }
};

// ─── @desc    Upload profile avatar ──────────────────────────────────────
// ─── @route   POST /api/auth/upload-avatar
// ─── @access  Private
const uploadAvatar = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'No image file provided.' });
    }

    // Delete old avatar from Cloudinary if it exists
    const user = await User.findById(req.user._id);
    if (user.profileImage && user.profileImage.includes('cloudinary')) {
      const parts = user.profileImage.split('/');
      const publicIdWithExt = parts.slice(-2).join('/');
      const publicId = publicIdWithExt.replace(/\.[^.]+$/, '');
      try {
        await deleteFromCloudinary(publicId);
      } catch (_) {
        // Non-fatal — old image cleanup failure shouldn't block upload
      }
    }

    const result = await uploadToCloudinary(req.file.buffer, {
      folder: 'ai-tourism/avatars',
      transformation: [{ width: 400, height: 400, crop: 'fill', gravity: 'face' }],
    });

    user.profileImage = result.secure_url;
    await user.save({ validateBeforeSave: false });

    return res.status(200).json({ success: true, message: 'Avatar uploaded.', profileImage: result.secure_url, user: sanitizeUser(user) });
  } catch (error) {
    console.error('[uploadAvatar] Error:', error.message);
    return res.status(500).json({ success: false, message: 'Avatar upload failed.' });
  }
};

// ─── @desc    Remove profile avatar ──────────────────────────────────────
// ─── @route   DELETE /api/auth/remove-avatar
// ─── @access  Private
const removeAvatar = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }

    if (user.profileImage && user.profileImage.includes('cloudinary')) {
      const parts = user.profileImage.split('/');
      const publicIdWithExt = parts.slice(-2).join('/');
      const publicId = publicIdWithExt.replace(/\.[^.]+$/, '');
      try {
        await deleteFromCloudinary(publicId);
      } catch (_) {
        // Non-fatal
      }
    }

    user.profileImage = '';
    await user.save({ validateBeforeSave: false });

    return res.status(200).json({ success: true, message: 'Avatar removed.', user: sanitizeUser(user) });
  } catch (error) {
    console.error('[removeAvatar] Error:', error.message);
    return res.status(500).json({ success: false, message: 'Avatar removal failed.' });
  }
};

module.exports = {
  register,
  login,
  googleSignIn,
  getMe,
  updateProfile,
  changePassword,
  verifyEmail,
  forgotPassword,
  resetPassword,
  uploadAvatar,
  removeAvatar,
};
