const jwt = require('jsonwebtoken');
const User = require('../models/User');

// ─── Protect routes — verify JWT ──────────────────────────────────────────
const protect = async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return res.status(401).json({ success: false, message: 'Not authorized. Please log in.' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Early expiry check (jwt.verify already throws TokenExpiredError, but being explicit)
    if (decoded.exp && Date.now() >= decoded.exp * 1000) {
      return res.status(401).json({ success: false, message: 'Session expired. Please log in again.', tokenExpired: true });
    }

    const user = await User.findById(decoded.id).select('-password -resetPasswordToken -verificationToken');
    if (!user) {
      return res.status(401).json({ success: false, message: 'Account not found. Please log in again.' });
    }

    req.user = user;
    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ success: false, message: 'Session expired. Please log in again.', tokenExpired: true });
    }
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ success: false, message: 'Invalid token. Please log in again.' });
    }
    return res.status(401).json({ success: false, message: 'Authentication failed. Please log in again.' });
  }
};

// ─── Admin-only routes ──────────────────────────────────────────────────────
const adminOnly = (req, res, next) => {
  if (req.user && req.user.isAdmin) {
    return next();
  }
  return res.status(403).json({ success: false, message: 'Admin access required.' });
};

// ─── Guide-only routes ──────────────────────────────────────────────────────
const guideOnly = (req, res, next) => {
  if (req.user && (req.user.isGuide || req.user.isAdmin)) {
    return next();
  }
  return res.status(403).json({ success: false, message: 'Guide access required.' });
};

module.exports = { protect, adminOnly, guideOnly };
