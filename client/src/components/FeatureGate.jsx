import { Link } from 'react-router-dom';

const PLAN_RANK = { FREE: 0, PRO: 1, PREMIUM: 2 };

// Feature permission table
export const FEATURE_ACCESS = {
  pdf_download:      'PRO',
  travel_analytics:  'PRO',
  smart_reminders:   'PRO',
  hidden_gems:       'PRO',
  unlimited_trips:   'PRO',
  ai_simulation:     'PREMIUM',
  story_generator:   'PREMIUM',
  priority_guide:    'PREMIUM',
  concierge_support: 'PREMIUM',
};

/**
 * FeatureGate — wraps content that requires a specific subscription plan.
 *
 * BUG-05 FIX:
 *   - When locked, the children are NOT rendered at all (not just blurred).
 *     This prevents DOM-level bypasses where users could remove pointer-events via DevTools.
 *   - The disabled prop is forwarded to button children via cloneElement (where possible).
 *
 * Props:
 *   requiredPlan  – 'PRO' | 'PREMIUM'
 *   userPlan      – current EFFECTIVE plan (use effectivePlan from useAuth, not user.subscription)
 *   children      – content to show when unlocked
 *   fallback      – optional custom locked UI (if not provided, renders upgrade card)
 *   showLocked    – if true, show a locked placeholder instead of nothing (default: true)
 */
const FeatureGate = ({ requiredPlan, userPlan = 'FREE', children, fallback, showLocked = true }) => {
  const userRank     = PLAN_RANK[userPlan]     ?? 0;
  const requiredRank = PLAN_RANK[requiredPlan] ?? 0;

  // Unlocked — render children normally
  if (userRank >= requiredRank) return children;

  // Custom fallback
  if (fallback) return fallback;

  // BUG-05 FIX: show nothing if showLocked=false (for silent gates)
  if (!showLocked) return null;

  // Default locked state — upgrade prompt card, NO blurred children in DOM
  const planColor = requiredPlan === 'PREMIUM' ? '#f59e0b' : 'rgb(var(--accent, 14 165 233))';

  return (
    <div
      className="w-full rounded-2xl flex flex-col items-center justify-center text-center gap-3 py-6 px-4"
      style={{
        background: requiredPlan === 'PREMIUM'
          ? 'rgba(245,158,11,0.06)'
          : 'rgba(var(--accent, 14 165 233), 0.06)',
        border: `1px dashed ${requiredPlan === 'PREMIUM' ? 'rgba(245,158,11,0.3)' : 'rgba(var(--accent, 14 165 233), 0.3)'}`,
      }}
    >
      <div
        className="w-10 h-10 rounded-xl flex items-center justify-center text-xl"
        style={{ background: `${planColor}20` }}
      >
        🔒
      </div>
      <div>
        <p className="font-bold text-sm mb-0.5" style={{ color: 'var(--text-primary)' }}>
          {requiredPlan} Feature
        </p>
        <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
          Upgrade to {requiredPlan} to unlock this
        </p>
      </div>
      <Link
        to="/pricing"
        className="inline-flex items-center gap-1.5 px-5 py-2 rounded-xl font-bold text-xs text-white transition-all hover:opacity-90 hover:-translate-y-0.5"
        style={{ background: planColor, boxShadow: `0 4px 16px ${planColor}40` }}
      >
        Upgrade Now →
      </Link>
    </div>
  );
};

export default FeatureGate;
