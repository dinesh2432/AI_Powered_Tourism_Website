const express = require('express');
const router = express.Router();
const {
  register,
  login,
  googleSignIn,
  getMe,
  updateProfile,
  verifyEmail,
  forgotPassword,
  resetPassword,
  uploadAvatar,
  removeAvatar,
} = require('../controllers/authController');
const { protect } = require('../middlewares/authMiddleware');
const { upload } = require('../services/cloudinaryService');

router.post('/register', register);
router.post('/login', login);
router.post('/google', googleSignIn);
router.get('/me', protect, getMe);
router.put('/profile', protect, updateProfile);
router.post('/upload-avatar', protect, upload.single('image'), uploadAvatar);
router.delete('/remove-avatar', protect, removeAvatar);
router.get('/verify-email/:token', verifyEmail);
router.post('/forgot-password', forgotPassword);
router.put('/reset-password/:token', resetPassword);

module.exports = router;
