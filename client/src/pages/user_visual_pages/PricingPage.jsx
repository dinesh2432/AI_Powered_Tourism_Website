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
    tagline: 'Start your journey',
    icon: '🛫',
    color: 'border-white/10',
    badge: null,
    features: [
      { label: '3 AI trips per month', ok: true },
      { label: 'Standard chatbot (20/day)', ok: true },
      { label: 'Trip collaboration', ok: true },
      { label: 'Explore videos', ok: true },
      { label: 'PDF export', ok: false },
      { label: 'Unlimited trip generation', ok: false },
      { label: 'Smart trip reminders', ok: false },
      { label: 'Travel analytics', ok: false },
      { label: 'AI "What-if" simulations', ok: false },
      { label: 'Ad-free experience', ok: false },
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
    color: 'border-primary-500/60',
    badge: 'Most Popular',
    features: [
      { label: 'Unlimited AI trip generation', ok: true },
      { label: 'Unlimited chatbot usage', ok: true },
      { label: 'PDF export & download', ok: true },
      { label: 'Travel analytics dashboard', ok: true },
      { label: 'Smart trip reminders', ok: true },
      { label: 'Hidden gems feature', ok: true },
      { label: 'Trip collaboration', ok: true },
      { label: 'Ad-free experience', ok: true },
      { label: 'AI "What-if" simulations', ok: false },
      { label: 'Priority guide booking', ok: false },
    ],
  },
  {
    id: 'PREMIUM',
    name: 'Premium',
    price: 999,
    priceLabel: '₹999',
    period: '/ month',
    tagline: 'For power travelers',
    icon: '💎',
    color: 'border-amber-500/40',
    badge: 'All-Inclusive',
    features: [
      { label: 'Everything in Pro', ok: true },
      { label: 'AI "What-if" simulations', ok: true },
      { label: 'AI travel story generator', ok: true },
      { label: 'Advanced analytics', ok: true },
      { label: 'Priority guide booking', ok: true },
      { label: 'Ad-free experience', ok: true },
      { label: 'Unlimited AI trip generation', ok: true },
      { label: 'Unlimited chatbot usage', ok: true },
      { label: 'PDF export & download', ok: true },
      { label: 'Concierge support', ok: true },
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

  const handleUpgrade = async (plan) => {
    if (plan.id === 'FREE') return;
    if (user?.subscription === plan.id) {
      return toast.error(`You're already on the ${plan.id} plan.`);
    }

    setProcessing(plan.id);
    try {
      const loaded = await loadRazorpay();
      if (!loaded) {
        toast.error('Failed to load Razorpay. Check your internet connection.');
        return;
      }

      const { data } = await api.post('/payments/create-order', { plan: plan.id });

      await new Promise((resolve, reject) => {
        const options = {
          key: data.keyId || import.meta.env.VITE_RAZORPAY_KEY_ID,
          amount: data.amount,
          currency: data.currency,
          name: 'AI Tourism Platform',
          description: `${plan.name} Plan – Monthly Subscription`,
          order_id: data.orderId,
          prefill: { name: data.userName, email: data.userEmail },
          theme: { color: '#60a5fa' },
          handler: async (response) => {
            try {
              const verifyRes = await api.post('/payments/verify-payment', {
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
                plan: plan.id,
              });

              toast.success(`🎉 Welcome to ${plan.name}!`);
              // Update user context (also persists to localStorage)
              if (updateUser) {
                updateUser({
                  ...user,
                  subscription: verifyRes.data.subscription,
                  subscriptionEndDate: verifyRes.data.subscriptionEndDate,
                });
              }
              resolve();
            } catch (err) {
              toast.error(err.response?.data?.message || 'Payment verification failed');
              reject(err);
            }
          },
          modal: { ondismiss: () => resolve() },
        };

        const rzp = new window.Razorpay(options);
        rzp.on('payment.failed', (response) => {
          toast.error(`Payment failed: ${response.error.description}`);
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

  const currentPlan = user?.subscription || 'FREE';

  return (
    <div className="min-h-screen bg-slate-950 pb-24 relative overflow-hidden">
      {/* Background blobs */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary-600/8 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-amber-600/8 rounded-full blur-[120px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 md:px-12 pt-16">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-20"
        >
          <div className="text-[9px] font-black text-primary-500 uppercase tracking-[0.4em] mb-4">
            Mission Tier Selection
          </div>
          <h1 className="text-5xl md:text-8xl font-black text-white tracking-tighter uppercase italic leading-none mb-6">
            Choose Your<br /><span className="gradient-text">Plan.</span>
          </h1>
          <p className="text-slate-400 text-lg font-bold uppercase tracking-widest max-w-xl mx-auto">
            Unlock the full power of AI-driven travel planning
          </p>

          {currentPlan !== 'FREE' && (
            <div className="inline-flex items-center gap-3 mt-8 bg-primary-500/10 border border-primary-500/20 px-6 py-3">
              <div className="w-2 h-2 rounded-full bg-primary-500 animate-pulse" />
              <span className="text-primary-400 font-black text-[10px] uppercase tracking-widest">
                Active Plan: {currentPlan}
              </span>
            </div>
          )}
        </motion.div>

        {/* Pricing cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-start">
          {PLANS.map((plan, i) => {
            const isCurrent = currentPlan === plan.id;
            const isPro = plan.id === 'PRO';
            const isPremium = plan.id === 'PREMIUM';

            return (
              <motion.div
                key={plan.id}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                className={`relative border ${plan.color} p-8 transition-all duration-500 ${isPro ? 'bg-white/[0.03] shadow-[0_0_60px_rgba(96,165,250,0.08)]' : 'bg-white/[0.015]'}`}
              >
                {/* Popular badge */}
                {plan.badge && (
                  <div className={`absolute -top-4 left-1/2 -translate-x-1/2 px-6 py-2 font-black text-[9px] uppercase tracking-[0.3em] ${isPro ? 'bg-primary-500 text-white' : 'bg-amber-500 text-slate-950'}`}>
                    {plan.badge}
                  </div>
                )}

                {/* Plan header */}
                <div className="mb-10">
                  <div className="text-4xl mb-4">{plan.icon}</div>
                  <div className="text-[9px] font-black text-slate-500 uppercase tracking-[0.3em] mb-1">{plan.tagline}</div>
                  <h2 className={`text-3xl font-black uppercase tracking-tighter italic mb-6 ${isPremium ? 'text-amber-400' : isPro ? 'text-primary-400' : 'text-white'}`}>
                    {plan.name}
                  </h2>
                  <div className="flex items-end gap-2">
                    <span className="text-5xl font-black text-white tracking-tighter italic">{plan.priceLabel}</span>
                    <span className="text-slate-500 font-bold text-xs uppercase tracking-widest pb-2">{plan.period}</span>
                  </div>
                </div>

                {/* CTA Button */}
                {plan.id === 'FREE' ? (
                  isCurrent ? (
                    <div className="w-full h-14 border border-white/10 text-slate-500 font-black text-[10px] uppercase tracking-widest flex items-center justify-center mb-8">
                      Current Plan
                    </div>
                  ) : (
                    <Link
                      to="/dashboard"
                      className="w-full h-14 bg-white/5 border border-white/10 text-slate-400 font-black text-[10px] uppercase tracking-widest hover:bg-white/10 transition-all flex items-center justify-center mb-8"
                    >
                      Get Started Free
                    </Link>
                  )
                ) : (
                  <button
                    onClick={() => handleUpgrade(plan)}
                    disabled={!!processing || isCurrent}
                    className={`w-full h-14 font-black text-[10px] uppercase tracking-widest transition-all mb-8 ${
                      isCurrent
                        ? 'bg-white/5 border border-white/10 text-slate-500 cursor-default'
                        : isPremium
                        ? 'bg-amber-500 text-slate-950 hover:bg-amber-400'
                        : 'bg-primary-500 text-white hover:bg-primary-400 shadow-[0_0_30px_rgba(96,165,250,0.3)]'
                    }`}
                  >
                    {isCurrent
                      ? '✓ Current Plan'
                      : processing === plan.id
                      ? 'Processing...'
                      : `Upgrade to ${plan.name} →`}
                  </button>
                )}

                {/* Features */}
                <div className="space-y-3">
                  {plan.features.map((f) => (
                    <div key={f.label} className={`flex items-center gap-3 text-[10px] font-bold uppercase tracking-wider ${f.ok ? 'text-slate-300' : 'text-slate-700'}`}>
                      <span className={`flex-shrink-0 text-sm ${f.ok ? (isPremium ? 'text-amber-400' : 'text-primary-400') : 'text-slate-700'}`}>
                        {f.ok ? '✓' : '✕'}
                      </span>
                      {f.label}
                    </div>
                  ))}
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Test mode notice */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="mt-16 border border-amber-500/20 bg-amber-500/5 p-8 text-center"
        >
          <p className="text-amber-400 font-black text-[10px] uppercase tracking-[0.3em] mb-2">
            🧪 Test Mode Active
          </p>
          <p className="text-slate-500 text-xs font-bold uppercase tracking-wider">
            Use Razorpay test card: <span className="text-white font-black font-mono">4111 1111 1111 1111</span> · Exp: Any future date · CVV: Any 3 digits
          </p>
        </motion.div>
      </div>
    </div>
  );
};

export default PricingPage;
