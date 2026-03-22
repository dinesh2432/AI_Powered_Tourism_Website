import { Link } from 'react-router-dom';

const PLAN_RANK = { FREE: 0, PRO: 1, PREMIUM: 2 };

/**
 * Wraps children with an upgrade gate if the user's plan is insufficient.
 * Props:
 *   requiredPlan  – 'PRO' | 'PREMIUM'
 *   userPlan      – current user plan string
 *   children      – content to show (blurred when locked)
 *   fallback      – optional custom locked UI (replaces default overlay)
 */
const FeatureGate = ({ requiredPlan, userPlan, children, fallback }) => {
  const userRank = PLAN_RANK[userPlan] ?? 0;
  const requiredRank = PLAN_RANK[requiredPlan] ?? 0;

  if (userRank >= requiredRank) return children;

  if (fallback) return fallback;

  return (
    <div className="relative">
      {/* Blurred content behind overlay */}
      <div className="pointer-events-none select-none blur-sm opacity-30">
        {children}
      </div>

      {/* Upgrade overlay */}
      <div className="absolute inset-0 flex flex-col items-center justify-center z-10">
        <div className="bg-slate-900/95 border border-white/10 px-8 py-6 text-center shadow-2xl max-w-xs">
          <div className="text-3xl mb-3">🔒</div>
          <p className="text-white font-black text-sm uppercase tracking-tighter mb-1">
            {requiredPlan} Feature
          </p>
          <p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest mb-5">
            Upgrade to {requiredPlan} to unlock this
          </p>
          <Link
            to="/pricing"
            className="inline-block px-8 py-3 bg-white text-slate-950 font-black text-[10px] uppercase tracking-widest hover:bg-primary-500 hover:text-white transition-all"
          >
            Upgrade →
          </Link>
        </div>
      </div>
    </div>
  );
};

export default FeatureGate;
