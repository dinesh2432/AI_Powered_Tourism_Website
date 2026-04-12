import { useState } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import toast from 'react-hot-toast';

const PLANS = [
  {
    id: 'FREE',
    name: 'Free',
    price: 0,
    priceLabel: '₹0',
    period: 'Forever',
    tagline: 'Get started for free',
    icon: '🛫',
    features: [
      { label: '3 AI trips per month',                  ok: true },
      { label: 'AI Travel Chat (10 messages/day)',       ok: true },
      { label: 'Accept collaboration invites (viewer)',  ok: true },
      { label: 'Explore destination discovery',         ok: true },
      { label: 'Basic destination images',              ok: true },
      { label: 'Invite others to collaborate',          ok: false },
      { label: 'PDF export & download',                 ok: false },
      { label: 'Unlimited trip generation',             ok: false },
      { label: 'Priority guide booking',                ok: false },
      { label: 'Unlimited AI Chat',                     ok: false },
    ],
  },
  {
    id: 'PRO',
    name: 'Pro',
    price: 499,
    priceLabel: '₹499',
    period: '/ month',
    tagline: 'For serious explorers',
    icon: '🚀',
    badge: 'Most Popular',
    features: [
      { label: 'Unlimited AI trip generation',          ok: true },
      { label: 'Unlimited AI Travel Chat',              ok: true },
      { label: 'PDF export & download',                 ok: true },
      { label: 'Invite up to 5 collaborators/trip',     ok: true },
      { label: 'Editor & Viewer collaborator roles',    ok: true },
      { label: 'Full high-res destination images',      ok: true },
      { label: 'Smart trip reminders',                  ok: true },
      { label: 'Ad-free experience',                    ok: true },
      { label: 'Invite up to 15 collaborators/trip',   ok: false },
      { label: 'Priority guide booking (VIP)',          ok: false },
    ],
  },
  {
    id: 'PREMIUM',
    name: 'Premium',
    price: 999,
    priceLabel: '₹999',
    period: '/ month',
    tagline: 'The complete travel companion',
    icon: '💎',
    badge: 'All-Inclusive',
    features: [
      { label: 'Everything in Pro',                      ok: true },
      { label: 'Invite up to 15 collaborators/trip',     ok: true },
      { label: 'Priority guide booking (VIP badge)',     ok: true },
      { label: 'AI travel story generator',              ok: true },
      { label: 'Advanced analytics dashboard',           ok: true },
      { label: 'Password-protected share links',         ok: true },
      { label: 'Concierge support',                      ok: true },
      { label: 'Unlimited AI trip generation',           ok: true },
      { label: 'Unlimited AI Travel Chat',               ok: true },
      { label: 'PDF export & download',                  ok: true },
    ],
  },
];


const loadRazorpay = () =>
  new Promise((resolve) => {
    if (window.Razorpay) return resolve(true);
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });

const PricingPage = () => {
  const { user, updateUser } = useAuth();
  const [processing, setProcessing] = useState(null);

  const currentPlan = user?.subscription || 'FREE';

  const handleUpgrade = async (plan) => {
    if (plan.id === 'FREE' || plan.id === currentPlan) return;
    setProcessing(plan.id);
    try {
      const loaded = await loadRazorpay();
      if (!loaded) {
        toast.error('Payment service unavailable. Please check your internet connection.');
        return;
      }

      const { data } = await api.post('/payments/create-order', { plan: plan.id });

      await new Promise((resolve, reject) => {
        const options = {
          key: data.keyId || import.meta.env.VITE_RAZORPAY_KEY_ID,
          amount: data.amount,
          currency: data.currency,
          name: 'TRAVELX Travel Platform',
          description: `${plan.name} Plan — Monthly Subscription`,
          order_id: data.orderId,
          prefill: { name: data.userName, email: data.userEmail },
          theme: { color: 'rgb(14, 165, 233)' },
          handler: async (response) => {
            try {
              const verifyRes = await api.post('/payments/verify-payment', {
                razorpay_order_id:   response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature:  response.razorpay_signature,
                plan: plan.id,
              });
              toast.success(`🎉 Welcome to ${plan.name}! Your features are now unlocked.`);
              if (updateUser) {
                updateUser({
                  ...user,
                  subscription:        verifyRes.data.subscription,
                  subscriptionEndDate: verifyRes.data.subscriptionEndDate,
                });
              }
              resolve();
            } catch (err) {
              toast.error(err.response?.data?.message || 'Payment verification failed. Please contact support.');
              reject(err);
            }
          },
          modal: { ondismiss: () => resolve() },
        };
        const rzp = new window.Razorpay(options);
        rzp.on('payment.failed', (r) => {
          toast.error(`Payment failed: ${r.error.description}`);
          resolve();
        });
        rzp.open();
      });
    } catch (err) {
      toast.error(err.response?.data?.message || 'Something went wrong. Please try again.');
    } finally {
      setProcessing(null);
    }
  };

  return (
    <div
      className="min-h-screen pb-20 relative overflow-hidden"
      style={{ background: 'var(--bg-primary)' }}
    >
      {/* Background decoration */}
      <div
        className="absolute top-0 left-1/3 w-96 h-96 rounded-full blur-[120px] pointer-events-none opacity-20"
        style={{ background: `rgba(var(--accent), 0.3)` }}
      />

      <div className="max-w-5xl mx-auto px-4 pt-10">

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-14"
        >
          <p className="text-sm font-semibold mb-3" style={{ color: `rgb(var(--accent))` }}>
            Simple, transparent pricing
          </p>
          <h1 className="text-4xl md:text-6xl font-black mb-4 leading-tight" style={{ color: 'var(--text-primary)' }}>
            Choose Your Plan
          </h1>
          <p className="text-base md:text-lg max-w-lg mx-auto" style={{ color: 'var(--text-secondary)' }}>
            Unlock the full power of AI-driven travel planning. Upgrade or downgrade anytime.
          </p>

          {currentPlan !== 'FREE' && (
            <div
              className="inline-flex items-center gap-2 mt-5 px-4 py-2 rounded-full text-sm font-semibold"
              style={{
                background: `rgba(var(--accent), 0.1)`,
                border: `1px solid rgba(var(--accent), 0.25)`,
                color: `rgb(var(--accent))`,
              }}
            >
              <span className="w-2 h-2 rounded-full animate-pulse" style={{ background: `rgb(var(--accent))` }} />
              Current Plan: {currentPlan}
            </div>
          )}
        </motion.div>

        {/* Plan Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-stretch">
          {PLANS.map((plan, i) => {
            const isCurrent  = currentPlan === plan.id;
            const isPro      = plan.id === 'PRO';
            const isPremium  = plan.id === 'PREMIUM';

            return (
              <motion.div
                key={plan.id}
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                className="relative rounded-2xl p-6 flex flex-col"
                style={{
                  background: isPro
                    ? `linear-gradient(135deg, rgba(var(--accent),0.08), var(--bg-card))`
                    : 'var(--bg-card)',
                  border: isCurrent
                    ? `2px solid rgb(var(--accent))`
                    : isPro
                    ? `1px solid rgba(var(--accent), 0.4)`
                    : isPremium
                    ? `1px solid rgba(245,158,11,0.4)`
                    : '1px solid var(--border)',
                  boxShadow: isPro ? `0 0 40px rgba(var(--accent), 0.1)` : 'none',
                }}
              >
                {/* Badge */}
                {plan.badge && (
                  <div
                    className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full text-xs font-bold text-white whitespace-nowrap"
                    style={{
                      background: isPro ? `rgb(var(--accent))` : '#f59e0b',
                    }}
                  >
                    {plan.badge}
                  </div>
                )}

                {/* Header */}
                <div className="mb-6">
                  <div className="text-3xl mb-3">{plan.icon}</div>
                  <p className="text-xs font-medium mb-1" style={{ color: 'var(--text-muted)' }}>
                    {plan.tagline}
                  </p>
                  <h2
                    className="text-2xl font-black mb-4"
                    style={{
                      color: isPremium
                        ? '#f59e0b'
                        : isPro
                        ? `rgb(var(--accent))`
                        : 'var(--text-primary)',
                    }}
                  >
                    {plan.name}
                  </h2>
                  <div className="flex items-end gap-2">
                    <span className="text-4xl font-black" style={{ color: 'var(--text-primary)' }}>
                      {plan.priceLabel}
                    </span>
                    <span className="text-sm pb-1" style={{ color: 'var(--text-muted)' }}>
                      {plan.period}
                    </span>
                  </div>
                </div>

                {/* CTA Button */}
                {plan.id === 'FREE' ? (
                  isCurrent ? (
                    <div
                      className="w-full py-3 rounded-xl text-sm font-semibold text-center mb-6"
                      style={{
                        background: 'var(--bg-hover)',
                        color: 'var(--text-muted)',
                        border: '1px solid var(--border)',
                      }}
                    >
                      ✓ Current Plan
                    </div>
                  ) : (
                    <Link
                      to="/dashboard"
                      className="btn-secondary w-full py-3 mb-6 text-sm font-semibold text-center block"
                    >
                      Get Started Free
                    </Link>
                  )
                ) : (
                  <button
                    onClick={() => handleUpgrade(plan)}
                    disabled={!!processing || isCurrent}
                    className={`w-full py-3 rounded-xl text-sm font-bold mb-6 transition-all duration-200 ${
                      isCurrent
                        ? 'cursor-default'
                        : 'hover:opacity-90 hover:-translate-y-0.5'
                    }`}
                    style={{
                      background: isCurrent
                        ? 'var(--bg-hover)'
                        : isPremium
                        ? '#f59e0b'
                        : `rgb(var(--accent))`,
                      color: isCurrent ? 'var(--text-muted)' : '#ffffff',
                      border: isCurrent ? '1px solid var(--border)' : 'none',
                      boxShadow: !isCurrent ? `0 4px 20px rgba(var(--accent), 0.3)` : 'none',
                    }}
                  >
                    {isCurrent
                      ? '✓ Current Plan'
                      : processing === plan.id
                      ? '⏳ Processing...'
                      : `Get ${plan.name} →`}
                  </button>
                )}

                {/* Features */}
                <ul className="space-y-2.5 flex-1">
                  {plan.features.map((f) => (
                    <li
                      key={f.label}
                      className="flex items-center gap-2.5 text-sm"
                      style={{ color: f.ok ? 'var(--text-secondary)' : 'var(--text-muted)' }}
                    >
                      <span
                        className="text-base shrink-0"
                        style={{ color: f.ok ? (isPremium ? '#f59e0b' : `rgb(var(--accent))`) : 'var(--border-strong)' }}
                      >
                        {f.ok ? '✓' : '✕'}
                      </span>
                      {f.label}
                    </li>
                  ))}
                </ul>
              </motion.div>
            );
          })}
        </div>

        {/* Test mode notice */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="mt-10 p-5 rounded-2xl text-center"
          style={{
            background: 'rgba(245,158,11,0.06)',
            border: '1px solid rgba(245,158,11,0.2)',
          }}
        >
          <p className="text-amber-400 font-semibold text-sm mb-1">🧪 Test Mode</p>
          <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
            Use test card: <span className="font-mono font-bold" style={{ color: 'var(--text-primary)' }}>4111 1111 1111 1111</span> · Any future expiry · Any CVV
          </p>
        </motion.div>
      </div>
    </div>
  );
};

export default PricingPage;
