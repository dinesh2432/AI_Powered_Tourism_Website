import { Link } from 'react-router-dom';

const PLAN_RANK = { FREE: 0, PRO: 1, PREMIUM: 2 };

// Feature permission table — only features actually requiring a paid plan
// FREE users: trips(3/mo), chatbot, collaboration, explore — ALL UNLOCKED
// PRO users: + unlimited trips, PDF export, analytics, smart reminders
// PREMIUM: + AI simulation, story generator, priority guide, concierge
export const FEATURE_ACCESS = {
  pdf_download: 'PRO',
  travel_analytics: 'PRO',
  smart_reminders: 'PRO',
  hidden_gems: 'PRO',
  unlimited_trips: 'PRO',
  ai_simulation: 'PREMIUM',
  story_generator: 'PREMIUM',
  priority_guide: 'PREMIUM',
  concierge_support: 'PREMIUM',
};

/**
 * FeatureGate – wraps content that requires a specific plan.
 *
 * Props:
 *   requiredPlan  – 'PRO' | 'PREMIUM'
 *   userPlan      – current user's plan string (defaults to 'FREE')
 *   children      – content to show when unlocked
 *   fallback      – optional custom locked UI
 */
const FeatureGate = ({ requiredPlan, userPlan = 'FREE', children, fallback }) => {
  const userRank = PLAN_RANK[userPlan] ?? 0;
  const requiredRank = PLAN_RANK[requiredPlan] ?? 0;

  if (userRank >= requiredRank) return children;

  if (fallback) return fallback;

  return (
    <div className="relative inline-block w-full">
      {/* Blurred locked content */}
      <div className="pointer-events-none select-none blur-sm opacity-30">
        {children}
      </div>

      {/* Upgrade overlay */}
      <div className="absolute inset-0 flex flex-col items-center justify-center z-10">
        <div className="bg-slate-900/95 border border-white/10 px-6 py-5 text-center shadow-2xl max-w-xs rounded-2xl">
          <div className="text-2xl mb-2">🔒</div>
          <p className="text-white font-bold text-sm mb-1">{requiredPlan} Feature</p>
          <p className="text-slate-400 text-xs mb-4">
            Upgrade to {requiredPlan} to unlock this
          </p>
          <Link
            to="/pricing"
            className="inline-block px-6 py-2 bg-gradient-to-r from-blue-500 to-indigo-500 text-white font-bold text-xs rounded-xl hover:opacity-90 transition-all"
          >
            Upgrade Now →
          </Link>
        </div>
      </div>
    </div>
  );
};

export default FeatureGate;
