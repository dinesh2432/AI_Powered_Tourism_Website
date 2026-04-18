const { getPlan, getEffectivePlan } = require('../utils/planConfig');

/**
 * checkSubscription(requiredPlan)
 *
 * Express middleware factory that blocks requests unless the authenticated
 * user's EFFECTIVE plan meets the required minimum.
 * Effective plan handles expiry: an expired PRO user is treated as FREE.
 *
 * Usage:
 *   router.get('/api/trips/:id/pdf', protect, checkSubscription('PRO'), downloadTripPDF);
 *
 * Plan hierarchy: FREE < PRO < PREMIUM
 */
const PLAN_RANK = { FREE: 0, PRO: 1, PREMIUM: 2 };

const checkSubscription = (requiredPlan) => (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ success: false, message: 'Not authorized' });
  }

  // Admins bypass all plan gates
  if (req.user.isAdmin) return next();

  const effectivePlan = getEffectivePlan(req.user); // handles expiry
  const userRank      = PLAN_RANK[effectivePlan]  ?? 0;
  const requiredRank  = PLAN_RANK[requiredPlan]   ?? 0;

  if (userRank >= requiredRank) return next();

  return res.status(403).json({
    success: false,
    message: `This feature requires ${requiredPlan} plan. You are on the ${effectivePlan} plan.`,
    upgradeRequired: true,
    currentPlan: effectivePlan,
    requiredPlan,
  });
};

module.exports = { checkSubscription, PLAN_RANK };
