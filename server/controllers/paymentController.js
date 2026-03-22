const Razorpay = require('razorpay');
const crypto = require('crypto');
const User = require('../models/User');

// Plan prices in paise (INR) – test mode
const PLAN_PRICES = {
  PRO: 49900,      // ₹499
  PREMIUM: 99900,  // ₹999
};

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

// @desc    Create Razorpay order
// @route   POST /api/payments/create-order
// @access  Private
const createOrder = async (req, res) => {
  try {
    const { plan } = req.body;

    if (!plan || !PLAN_PRICES[plan]) {
      return res.status(400).json({ success: false, message: 'Invalid plan. Choose PRO or PREMIUM.' });
    }

    // Razorpay receipt must be ≤ 40 characters
    const shortId = req.user._id.toString().slice(-8);
    const shortTs = Date.now().toString().slice(-8);
    const receipt = `rcpt_${shortId}_${shortTs}`; // max ~22 chars

    const options = {
      amount: PLAN_PRICES[plan],
      currency: 'INR',
      receipt,
      notes: { userId: req.user._id.toString(), plan },
    };

    const order = await razorpay.orders.create(options);

    res.status(201).json({
      success: true,
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
      plan,
      keyId: process.env.RAZORPAY_KEY_ID,
      userName: req.user.name,
      userEmail: req.user.email,
    });
  } catch (error) {
    console.error('Razorpay create order error:', error);
    res.status(500).json({ success: false, message: error.message || 'Failed to create payment order' });
  }
};

// @desc    Verify Razorpay payment and upgrade subscription
// @route   POST /api/payments/verify-payment
// @access  Private
const verifyPayment = async (req, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, plan } = req.body;

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature || !plan) {
      return res.status(400).json({ success: false, message: 'Missing payment verification fields' });
    }

    // Verify HMAC-SHA256 signature
    const body = `${razorpay_order_id}|${razorpay_payment_id}`;
    const expectedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
      .update(body)
      .digest('hex');

    if (expectedSignature !== razorpay_signature) {
      return res.status(400).json({ success: false, message: 'Payment verification failed. Invalid signature.' });
    }

    // Update user subscription
    const now = new Date();
    const endDate = new Date(now);
    endDate.setDate(endDate.getDate() + 30); // 30-day subscription

    const updatedUser = await User.findByIdAndUpdate(
      req.user._id,
      {
        subscription: plan,
        subscriptionStartDate: now,
        subscriptionEndDate: endDate,
        monthlyTripCount: 0,
        monthlyTripResetDate: now,
      },
      { new: true, select: '-password' }
    );

    res.status(200).json({
      success: true,
      message: `Successfully upgraded to ${plan}!`,
      subscription: updatedUser.subscription,
      subscriptionEndDate: updatedUser.subscriptionEndDate,
    });
  } catch (error) {
    console.error('Payment verification error:', error);
    res.status(500).json({ success: false, message: error.message || 'Payment verification failed' });
  }
};

module.exports = { createOrder, verifyPayment };
