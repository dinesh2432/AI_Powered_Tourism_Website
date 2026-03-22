/**
 * Subscription middleware factory.
 * Usage: router.get('/some-route', protect, checkSubscription('PRO'), handler)
 *
 * Plan hierarchy: FREE=0, PRO=1, PREMIUM=2
 */

const PLAN_RANK = { FREE: 0, PRO: 1, PREMIUM: 2 };

const checkSubscription = (requiredPlan) => (req, res, next) => {
  const userPlan = req.user?.subscription || 'FREE';
  const userRank = PLAN_RANK[userPlan] ?? 0;
  const requiredRank = PLAN_RANK[requiredPlan] ?? 0;

  if (userRank >= requiredRank) return next();

  return res.status(403).json({
    success: false,
    message: `Upgrade to ${requiredPlan} to unlock this feature`,
    requiredPlan,
    currentPlan: userPlan,
  });
};

module.exports = { checkSubscription, PLAN_RANK };
