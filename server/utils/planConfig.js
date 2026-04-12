/**
 * planConfig.js — Single source of truth for all subscription plan rules.
 * Import this in any controller that needs plan-based feature gating.
 */

const PLANS = {
  FREE: {
    name: 'Free',
    tripsPerMonth: 3,          // max trips a user can CREATE per month
    maxCollaborators: 0,       // cannot invite anyone (0 = no inviting)
    canInvite: false,          // cannot send collaboration invitations
    canAcceptInvite: true,     // can accept invitations from others
    acceptRoles: ['viewer'],   // FREE users can only be viewers when invited
                               // (Q1: owner's plan determines what role they get, 
                               //  but free users accept in viewer mode by default)
    pdfDownload: false,        // cannot download PDF
    chatbotDailyLimit: 10,     // 10 chatbot messages per day
    tripHistoryLimit: 10,      // only 10 most recent trips visible
    shareLinks: 1,             // 1 active share link
  },
  PRO: {
    name: 'Pro',
    tripsPerMonth: Infinity,
    maxCollaborators: 5,       // can have up to 5 collaborators per trip
    canInvite: true,
    acceptRoles: ['viewer', 'editor'],
    pdfDownload: true,
    chatbotDailyLimit: Infinity,
    tripHistoryLimit: Infinity,
    shareLinks: Infinity,
  },
  PREMIUM: {
    name: 'Premium',
    tripsPerMonth: Infinity,
    maxCollaborators: 15,
    canInvite: true,
    acceptRoles: ['viewer', 'editor'],
    pdfDownload: true,
    chatbotDailyLimit: Infinity,
    tripHistoryLimit: Infinity,
    shareLinks: Infinity,
  },
};

/**
 * Get the plan config for a given subscription tier.
 * Defaults to FREE if the plan is unknown.
 */
const getPlan = (subscription) => PLANS[subscription] || PLANS.FREE;

/**
 * Check if a user's subscription is still active.
 * FREE plan never expires. PRO/PREMIUM expire after subscriptionEndDate.
 */
const isSubscriptionActive = (user) => {
  if (!user.subscription || user.subscription === 'FREE') return true;
  if (!user.subscriptionEndDate) return false;
  return new Date(user.subscriptionEndDate) > new Date();
};

/**
 * Get the effective plan for a user — falls back to FREE if subscription expired.
 */
const getEffectivePlan = (user) => {
  if (!isSubscriptionActive(user)) return 'FREE';
  return user.subscription || 'FREE';
};

module.exports = { PLANS, getPlan, isSubscriptionActive, getEffectivePlan };
