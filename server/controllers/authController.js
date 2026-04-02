const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const { OAuth2Client } = require('google-auth-library');
const User = require('../models/User');

const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);
const { sendVerificationEmail, sendPasswordResetEmail } = require('../services/emailService');
const { uploadToCloudinary, deleteFromCloudinary } = require('../services/cloudinaryService');

// Generate JWT
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE || '7d',
  });
};

// @desc    Register user
// @route   POST /api/auth/register
// @access  Public
const register = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ success: false, message: 'Please fill all fields' });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ success: false, message: 'Email already registered' });
    }

    const user = await User.create({ name, email, password });

    // Generate verification token
    const verificationToken = user.getVerificationToken();
    await user.save({ validateBeforeSave: false });

    // Send verification email (non-blocking)
    try {
      await sendVerificationEmail(email, name, verificationToken);
    } catch (emailErr) {
      console.error('Email send error:', emailErr.message);
    }

    const token = generateToken(user._id);

    res.status(201).json({
      success: true,
      message: 'Account created. Please verify your email.',
      token,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        isVerified: user.isVerified,
        isAdmin: user.isAdmin,
        isGuide: user.isGuide,
        profileImage: user.profileImage,
        travelStats: user.travelStats,
        subscription: user.subscription || 'FREE',
        subscriptionEndDate: user.subscriptionEndDate || null,
        monthlyTripCount: user.monthlyTripCount || 0,
      },
    });
  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Please provide email and password' });
    }

    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    const token = generateToken(user._id);

    res.status(200).json({
      success: true,
      token,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        isVerified: user.isVerified,
        isAdmin: user.isAdmin,
        isGuide: user.isGuide,
        profileImage: user.profileImage,
        travelStats: user.travelStats,
        preferredLanguage: user.preferredLanguage,
        subscription: user.subscription || 'FREE',
        subscriptionEndDate: user.subscriptionEndDate || null,
        monthlyTripCount: user.monthlyTripCount || 0,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get current user profile
// @route   GET /api/auth/me
// @access  Private
const getMe = async (req, res) => {
  try {
    // Always fetch fresh from DB so admin plan overrides are reflected immediately
    const user = await User.findById(req.user._id).select('-password');
    res.status(200).json({
      success: true,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        isVerified: user.isVerified,
        isAdmin: user.isAdmin,
        isGuide: user.isGuide,
        profileImage: user.profileImage,
        travelStats: user.travelStats,
        preferredLanguage: user.preferredLanguage,
        subscription: user.subscription || 'FREE',
        subscriptionEndDate: user.subscriptionEndDate || null,
        monthlyTripCount: user.monthlyTripCount || 0,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update profile
// @route   PUT /api/auth/profile
// @access  Private
const updateProfile = async (req, res) => {
  try {
    const { name, profileImage, preferredLanguage } = req.body;
    const user = await User.findByIdAndUpdate(
      req.user._id,
      { name, profileImage, preferredLanguage },
      { new: true, runValidators: true }
    );
    res.status(200).json({ success: true, user });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Google SignIn/SignUp
// @route   POST /api/auth/google
// @access  Public
const googleSignIn = async (req, res) => {
  try {
    const { token: idToken } = req.body;
    if (!idToken) {
      return res.status(400).json({ success: false, message: 'Google token is required' });
    }
    
    // Verify Google ID Token
    const ticket = await googleClient.verifyIdToken({
      idToken,
      audience: process.env.GOOGLE_CLIENT_ID,
    });
    const payload = ticket.getPayload();
    if (!payload?.email) {
      return res.status(400).json({ success: false, message: 'Google authentication failed' });
    }

    // Check if user exists
    let user = await User.findOne({ email: payload.email }).select('+password');
    let isNewUser = false;

    if (!user) {
      // Create random password since it's required by schema but useless for OAuth
      const randomPassword = crypto.randomBytes(20).toString('hex') + 'Gg1!';
      
      user = await User.create({
        name: payload.name,
        email: payload.email,
        password: randomPassword,
        googleId: payload.sub,
        authProvider: 'google',
        profileImage: payload.picture || '',
        isVerified: payload.email_verified || true
      });
      isNewUser = true;
    } else {
      // Update existing user to link google account if first time using Google
      let needsSave = false;
      if (!user.googleId) {
        user.googleId = payload.sub;
        user.authProvider = 'google';
        needsSave = true;
      }
      if (!user.profileImage && payload.picture) {
        user.profileImage = payload.picture;
        needsSave = true;
      }
      if (needsSave) {
        await user.save({ validateBeforeSave: false });
      }
    }

    const jwtToken = generateToken(user._id);

    res.status(isNewUser ? 201 : 200).json({
      success: true,
      token: jwtToken,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        isVerified: user.isVerified,
        isAdmin: user.isAdmin,
        isGuide: user.isGuide,
        profileImage: user.profileImage,
        travelStats: user.travelStats,
        preferredLanguage: user.preferredLanguage,
        subscription: user.subscription || 'FREE',
        subscriptionEndDate: user.subscriptionEndDate || null,
        monthlyTripCount: user.monthlyTripCount || 0,
        authProvider: user.authProvider,
      },
    });
  } catch (error) {
    console.error('Google Auth Error:', error);
    res.status(500).json({ success: false, message: 'Google authentication failed' });
  }
};

// @desc    Upload profile avatar
// @route   POST /api/auth/upload-avatar
// @access  Private
const uploadAvatar = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'Please upload an image file' });
    }

    const user = await User.findById(req.user._id);

    // If user already had a Cloudinary image, delete the old one
    if (user.profileImage && user.profileImage.includes('cloudinary')) {
      // Extract public_id from securely structured string
      // e.g., https://res.cloudinary.com/.../image/upload/v12345/tourism_avatars/xyz.jpg
      const parts = user.profileImage.split('/');
      const lastSegment = parts[parts.length - 1]; // "xyz.jpg"
      const publicId = lastSegment.split('.')[0]; // "xyz"
      const folderPath = parts[parts.length - 2]; // "tourism_avatars"
      if (folderPath && publicId) {
        await deleteFromCloudinary(`${folderPath}/${publicId}`, 'image');
      }
    }

    // Upload new image
    const result = await uploadToCloudinary(req.file.buffer, {
      folder: 'tourism_avatars',
      resource_type: 'image',
    });

    user.profileImage = result.secure_url;
    await user.save({ validateBeforeSave: false });

    res.status(200).json({ success: true, profileImage: user.profileImage });
  } catch (error) {
    console.error('Avatar upload error:', error);
    res.status(500).json({ success: false, message: 'Image upload failed' });
  }
};

// @desc    Remove profile avatar
// @route   DELETE /api/auth/remove-avatar
// @access  Private
const removeAvatar = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });

    if (user.profileImage && user.profileImage.includes('cloudinary')) {
      const parts = user.profileImage.split('/');
      const lastSegment = parts[parts.length - 1]; 
      const publicId = lastSegment.split('.')[0]; 
      const folderPath = parts[parts.length - 2]; 
      if (folderPath && publicId) {
        await deleteFromCloudinary(`${folderPath}/${publicId}`, 'image');
      }
    }

    user.profileImage = '';
    await user.save({ validateBeforeSave: false });

    res.status(200).json({ success: true, profileImage: '' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Verify email
// @route   GET /api/auth/verify-email/:token
// @access  Public
const verifyEmail = async (req, res) => {
  try {
    const hashedToken = crypto.createHash('sha256').update(req.params.token).digest('hex');
    const user = await User.findOne({
      verificationToken: hashedToken,
      verificationExpire: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).json({ success: false, message: 'Invalid or expired verification link' });
    }

    user.isVerified = true;
    user.verificationToken = undefined;
    user.verificationExpire = undefined;
    await user.save();

    res.status(200).json({ success: true, message: 'Email verified successfully!' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Forgot password - send reset email
// @route   POST /api/auth/forgot-password
// @access  Public
const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({ success: false, message: 'No account found with that email' });
    }

    const resetToken = user.getResetPasswordToken();
    await user.save({ validateBeforeSave: false });

    await sendPasswordResetEmail(email, user.name, resetToken);

    res.status(200).json({ success: true, message: 'Password reset email sent' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Reset password
// @route   PUT /api/auth/reset-password/:token
// @access  Public
const resetPassword = async (req, res) => {
  try {
    const hashedToken = crypto.createHash('sha256').update(req.params.token).digest('hex');
    const user = await User.findOne({
      resetPasswordToken: hashedToken,
      resetPasswordExpire: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).json({ success: false, message: 'Invalid or expired reset link' });
    }

    user.password = req.body.password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;
    await user.save();

    const token = generateToken(user._id);
    res.status(200).json({ success: true, message: 'Password reset successful', token });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = { register, login, googleSignIn, getMe, updateProfile, uploadAvatar, removeAvatar, verifyEmail, forgotPassword, resetPassword };
