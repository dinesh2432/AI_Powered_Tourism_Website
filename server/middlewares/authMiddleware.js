const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Protect routes - verify JWT
const protect = async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return res.status(401).json({ success: false, message: 'Not authorized, no token' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = await User.findById(decoded.id).select('-password');
    if (!req.user) {
      return res.status(401).json({ success: false, message: 'User not found' });
    }
    next();
  } catch (error) {
    return res.status(401).json({ success: false, message: 'Not authorized, token failed' });
  }
};

// Admin-only routes
const adminOnly = (req, res, next) => {
  if (req.user && req.user.isAdmin) {
    return next();
  }
  return res.status(403).json({ success: false, message: 'Admin access required' });
};

// Guide-only routes
const guideOnly = (req, res, next) => {
  if (req.user && (req.user.isGuide || req.user.isAdmin)) {
    return next();
  }
  return res.status(403).json({ success: false, message: 'Guide access required' });
};

module.exports = { protect, adminOnly, guideOnly };
