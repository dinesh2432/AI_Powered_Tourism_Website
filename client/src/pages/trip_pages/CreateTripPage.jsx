import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../../services/api';
import toast from 'react-hot-toast';
import LocationAutocomplete from '../../components/LocationAutocomplete';

const INTERESTS = [
  { tag: 'Beach',        emoji: '🏖️' },
  { tag: 'Mountains',   emoji: '⛰️' },
  { tag: 'History',     emoji: '🏛️' },
  { tag: 'Food',        emoji: '🍜' },
  { tag: 'Adventure',   emoji: '🧗' },
  { tag: 'Art',         emoji: '🎨' },
  { tag: 'Shopping',    emoji: '🛍️' },
  { tag: 'Nature',      emoji: '🌿' },
  { tag: 'Nightlife',   emoji: '🎉' },
  { tag: 'Wellness',    emoji: '🧘' },
  { tag: 'Photography', emoji: '📷' },
  { tag: 'Culture',     emoji: '🎭' },
  { tag: 'Festivals',   emoji: '🎆' },
  { tag: 'Architecture', emoji: '🏰' },
  { tag: 'Wildlife',    emoji: '🦁' },
];

const ACCOMMODATION_TYPES = [
  { value: 'Budget',   icon: '🏕️', desc: 'Hostels & budget stays' },
  { value: 'Standard', icon: '🏨', desc: 'Comfortable 3-4 star hotels' },
  { value: 'Luxury',   icon: '✨', desc: 'Premium 5-star resorts' },
];

// Currency list with symbols
const CURRENCIES = [
  { code: 'USD', symbol: '$',  label: 'US Dollar' },
  { code: 'EUR', symbol: '€',  label: 'Euro' },
  { code: 'GBP', symbol: '£',  label: 'British Pound' },
  { code: 'INR', symbol: '₹',  label: 'Indian Rupee' },
  { code: 'JPY', symbol: '¥',  label: 'Japanese Yen' },
  { code: 'AED', symbol: 'د.إ', label: 'UAE Dirham' },
  { code: 'SGD', symbol: 'S$', label: 'Singapore Dollar' },
];

const TRENDING = ['Paris 🗼', 'Bali 🌴', 'Tokyo 🗾', 'Dubai 🏙️', 'Santorini 🌊', 'Maldives 🐠'];

// ── Trip Generation Loading Overlay ──────────────────────────────────────────
const LOADING_STAGES = [
  { pct: 10, text: 'Researching your destination...', emoji: '🌍' },
  { pct: 25, text: 'Planning your adventure...',       emoji: '🗺️' },
  { pct: 42, text: 'Finding the best hotels...',       emoji: '🏨' },
  { pct: 60, text: 'Creating your itinerary...',       emoji: '📅' },
  { pct: 75, text: 'Calculating budget breakdown...',  emoji: '💰' },
  { pct: 88, text: 'Finalizing travel tips...',        emoji: '✈️' },
  { pct: 98, text: 'Almost ready!',                    emoji: '🎉' },
];

const TripLoadingOverlay = ({ destination }) => {
  const [stageIdx, setStageIdx] = useState(0);
  const [displayPct, setDisplayPct] = useState(0);

  useEffect(() => {
    // advance stages every ~2.5s
    const id = setInterval(() => {
      setStageIdx(prev => Math.min(prev + 1, LOADING_STAGES.length - 1));
    }, 2500);
    return () => clearInterval(id);
  }, []);

  // Smoothly animate percentage towards target
  const targetPct = LOADING_STAGES[stageIdx].pct;
  useEffect(() => {
    let raf;
    const animate = () => {
      setDisplayPct(prev => {
        if (Math.abs(prev - targetPct) < 0.5) return targetPct;
        return prev + (targetPct - prev) * 0.08;
      });
      raf = requestAnimationFrame(animate);
    };
    raf = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(raf);
  }, [targetPct]);

  const stage = LOADING_STAGES[stageIdx];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center"
      style={{ background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(16px)' }}
    >
      <div className="text-center max-w-sm w-full px-8">
        {/* Animated emoji */}
        <AnimatePresence mode="wait">
          <motion.div
            key={stageIdx}
            initial={{ scale: 0.5, opacity: 0, y: 10 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.5, opacity: 0, y: -10 }}
            transition={{ duration: 0.4 }}
            className="text-7xl mb-6"
          >
            {stage.emoji}
          </motion.div>
        </AnimatePresence>

        {/* Destination label */}
        <p className="text-white/50 text-xs font-semibold uppercase tracking-widest mb-2">
          Generating trip to
        </p>
        <h2 className="text-3xl font-black text-white mb-8 tracking-tight">
          {destination || 'Your Dream Destination'}
        </h2>

        {/* Stage text */}
        <AnimatePresence mode="wait">
          <motion.p
            key={stageIdx}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.35 }}
            className="text-white/80 text-sm font-medium mb-6"
          >
            {stage.text}
          </motion.p>
        </AnimatePresence>

        {/* Progress bar */}
        <div className="w-full h-1.5 rounded-full overflow-hidden mb-3" style={{ background: 'rgba(255,255,255,0.1)' }}>
          <motion.div
            className="h-full rounded-full"
            style={{
              width: `${displayPct}%`,
              background: 'linear-gradient(90deg, #6366f1, #06b6d4)',
              boxShadow: '0 0 12px rgba(99,102,241,0.6)',
            }}
          />
        </div>

        {/* Percentage */}
        <p className="text-white/40 text-xs font-mono">
          {Math.round(displayPct)}%
        </p>

        {/* Dots */}
        <div className="flex justify-center gap-1.5 mt-8">
          {LOADING_STAGES.map((_, i) => (
            <div
              key={i}
              className="rounded-full transition-all duration-500"
              style={{
                width: i === stageIdx ? 20 : 6,
                height: 6,
                background: i <= stageIdx ? 'rgb(99,102,241)' : 'rgba(255,255,255,0.15)',
              }}
            />
          ))}
        </div>
      </div>
    </motion.div>
  );
};

// ── Main Page ─────────────────────────────────────────────────────────────────
const CreateTripPage = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    source: '',
    destination: '',
    startDate: '',
    endDate: '',
    budget: '',
    currency: 'USD',
    members: 1,
    accommodationType: 'Standard',
    interests: [],
  });

  const today = new Date().toISOString().split('T')[0];
  const dayCount = form.startDate && form.endDate
    ? Math.max(0, Math.ceil((new Date(form.endDate) - new Date(form.startDate)) / (1000 * 60 * 60 * 24)))
    : 0;

  const toggleInterest = (tag) => {
    setForm(prev => ({
      ...prev,
      interests: prev.interests.includes(tag)
        ? prev.interests.filter(t => t !== tag)
        : [...prev.interests, tag],
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.source) return toast.error('Please select a valid departure city from the dropdown.');
    if (!form.destination) return toast.error('Please select a valid destination from the dropdown.');
    if (new Date(form.endDate) < new Date(form.startDate)) return toast.error('End date must be on or after start date.');
    setLoading(true);
    try {
      const { data } = await api.post('/trips', form);
      toast.success('Your trip is ready! 🎉');
      navigate(`/trips/${data.trip._id}`);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const canNext1 = form.source && form.destination;
  const canNext2 = form.startDate && form.endDate && form.budget && new Date(form.endDate) >= new Date(form.startDate);

  const STEPS = [
    { n: 1, label: 'Where' },
    { n: 2, label: 'When & Budget' },
    { n: 3, label: 'Style' },
  ];

  // Active currency object
  const activeCurrency = CURRENCIES.find(c => c.code === form.currency) || CURRENCIES[0];

  return (
    <div className="min-h-screen px-4 py-10 md:py-16 relative overflow-hidden" style={{ background: 'var(--bg-primary)' }}>
      {/* Loading overlay */}
      <AnimatePresence>
        {loading && <TripLoadingOverlay destination={form.destination} />}
      </AnimatePresence>

      <div className="absolute top-0 right-0 w-1/2 h-1/2 rounded-full blur-[120px] pointer-events-none opacity-20" style={{ background: `rgba(var(--accent), 0.2)` }} />
      <div className="absolute bottom-0 left-0 w-1/2 h-1/2 rounded-full blur-[120px] pointer-events-none opacity-20" style={{ background: `rgba(var(--accent), 0.1)` }} />

      <div className="max-w-3xl mx-auto relative z-10">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-12">
          <div className="text-5xl mb-4">✈️</div>
          <h1 className="text-3xl md:text-5xl font-bold mb-3 tracking-tight" style={{ color: 'var(--text-primary)' }}>
            Plan Your Dream Trip
          </h1>
          <p className="text-base md:text-lg" style={{ color: 'var(--text-secondary)' }}>
            Tell us where you want to go. Our AI will do the rest.
          </p>
        </motion.div>

        {/* Step Indicator */}
        <div className="flex items-center justify-center gap-3 mb-10">
          {STEPS.map((s, i) => (
            <div key={s.n} className="flex items-center gap-3">
              <button
                onClick={() => step > s.n && setStep(s.n)}
                className={`flex items-center gap-2 px-4 py-2 rounded-full text-xs font-bold uppercase tracking-widest transition-all ${
                  s.n === step ? 'bg-blue-500 text-white' :
                  s.n < step ? 'bg-emerald-500/20 text-emerald-500' : ''
                }`}
                style={{
                  background: s.n > step ? 'var(--bg-glass)' : undefined,
                  color: s.n > step ? 'var(--text-secondary)' : undefined,
                }}
              >
                <span>{s.n < step ? '✓' : s.n}</span>
                <span className="hidden sm:inline">{s.label}</span>
              </button>
              {i < STEPS.length - 1 && (
                <div className={`h-0.5 w-8 rounded-full ${s.n < step ? 'bg-green-500/60' : 'bg-white/10'}`} />
              )}
            </div>
          ))}
        </div>

        <motion.div
          key={step}
          initial={{ opacity: 0, x: 24 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.35 }}
          className="rounded-3xl p-6 md:p-10 shadow-2xl backdrop-blur-sm"
          style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}
        >
          {/* Step 1 – Destination */}
          {step === 1 && (
            <div className="space-y-8">
              <div>
                <h2 className="text-2xl font-bold mb-1" style={{ color: 'var(--text-primary)' }}>Where are you going? 🌍</h2>
                <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>Type a city and pick from the suggestions.</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <LocationAutocomplete
                  label="Departing From"
                  icon="🛫"
                  placeholder="e.g. Mumbai, New York..."
                  value={form.source}
                  onChange={(val) => setForm({ ...form, source: val })}
                />
                <LocationAutocomplete
                  label="Dream Destination"
                  icon="📍"
                  placeholder="e.g. Paris, Tokyo, Bali..."
                  value={form.destination}
                  onChange={(val) => setForm({ ...form, destination: val })}
                />
              </div>

              <div>
                <p className="text-xs text-slate-500 uppercase tracking-widest mb-4">✨ Trending Destinations</p>
                <div className="flex flex-wrap gap-2">
                  {TRENDING.map(city => {
                    const name = city.split(' ')[0];
                    return (
                      <button
                        key={city}
                        onClick={() => setForm({ ...form, destination: name })}
                        className={`px-4 py-2 rounded-xl border text-sm font-medium transition-all ${
                          form.destination === name
                            ? 'bg-blue-500/20 border-blue-500/40 text-blue-600 dark:text-blue-400'
                            : 'hover:border-blue-400 hover:text-blue-500'
                        }`}
                        style={{
                          background: form.destination !== name ? 'var(--bg-glass)' : undefined,
                          borderColor: form.destination !== name ? 'var(--border)' : undefined,
                          color: form.destination !== name ? 'var(--text-secondary)' : undefined
                        }}
                      >
                        {city}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* Step 2 – Dates & Budget */}
          {step === 2 && (
            <div className="space-y-8">
              <div>
                <h2 className="text-2xl font-bold mb-1" style={{ color: 'var(--text-primary)' }}>When & How Much? 📅</h2>
                <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>All fields are required to generate your trip.</p>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">Travel Dates</label>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-slate-500 text-xs mb-1">Start Date</p>
                    <input
                      type="date"
                      className="input-field"
                      min={today}
                      value={form.startDate}
                      onChange={(e) => setForm({ ...form, startDate: e.target.value })}
                    />
                  </div>
                  <div>
                    <p className="text-slate-500 text-xs mb-1">End Date</p>
                    <input
                      type="date"
                      className="input-field"
                      min={form.startDate || today}
                      value={form.endDate}
                      onChange={(e) => setForm({ ...form, endDate: e.target.value })}
                    />
                  </div>
                </div>
                {form.startDate && form.endDate && (
                  <p className="text-blue-400 text-xs font-semibold mt-2">
                    {dayCount === 0 ? '🌅 1-day trip (same day)' : `🗓️ ${dayCount} day${dayCount !== 1 ? 's' : ''}`}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">Travelers</label>
                <div className="flex items-center gap-5">
                  <button type="button" onClick={() => setForm(f => ({ ...f, members: Math.max(1, f.members - 1) }))}
                    className="w-10 h-10 rounded-xl font-bold transition flex items-center justify-center text-lg" style={{ background: 'var(--bg-glass)', border: '1px solid var(--border)', color: 'var(--text-primary)' }}>−</button>
                  <span className="text-3xl font-black w-8 text-center" style={{ color: 'var(--text-primary)' }}>{form.members}</span>
                  <button type="button" onClick={() => setForm(f => ({ ...f, members: Math.min(20, f.members + 1) }))}
                    className="w-10 h-10 rounded-xl font-bold transition flex items-center justify-center text-lg" style={{ background: 'var(--bg-glass)', border: '1px solid var(--border)', color: 'var(--text-primary)' }}>+</button>
                  <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>{form.members === 1 ? 'Solo traveler' : `${form.members} people`}</span>
                </div>
              </div>

              {/* ── Budget with currency icons ── */}
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">Total Budget</label>
                <div className="flex gap-3">
                  {/* Budget input with inline currency symbol */}
                  <div className="relative flex-1">
                    <span
                      className="absolute left-4 top-1/2 -translate-y-1/2 text-base font-bold pointer-events-none"
                      style={{ color: 'rgb(var(--accent))' }}
                    >
                      {activeCurrency.symbol}
                    </span>
                    <input
                      type="number"
                      className="input-field w-full pl-10"
                      placeholder="Enter your budget..."
                      value={form.budget}
                      min="1"
                      onChange={(e) => setForm({ ...form, budget: e.target.value })}
                    />
                  </div>

                  {/* Currency selector with symbol badges */}
                  <div className="relative">
                    <select
                      className="input-field w-32 cursor-pointer appearance-none pr-2"
                      value={form.currency}
                      onChange={(e) => setForm({ ...form, currency: e.target.value })}
                      style={{ background: 'var(--bg-card)', color: 'var(--text-primary)' }}
                    >
                      {CURRENCIES.map(c => (
                        <option key={c.code} value={c.code} style={{ background: 'var(--bg-card)', color: 'var(--text-primary)' }}>
                          {c.symbol} {c.code}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Currency quick-pick badges */}
                <div className="flex flex-wrap gap-2 mt-3">
                  {CURRENCIES.slice(0, 5).map(c => (
                    <button
                      key={c.code}
                      type="button"
                      onClick={() => setForm({ ...form, currency: c.code })}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all ${
                        form.currency === c.code ? 'border-blue-500/50' : ''
                      }`}
                      style={{
                        background: form.currency === c.code ? 'rgba(var(--accent), 0.12)' : 'var(--bg-glass)',
                        borderColor: form.currency === c.code ? 'rgb(var(--accent))' : 'var(--border)',
                        color: form.currency === c.code ? 'rgb(var(--accent))' : 'var(--text-secondary)',
                      }}
                    >
                      <span className="font-bold text-sm">{c.symbol}</span>
                      <span>{c.code}</span>
                    </button>
                  ))}
                </div>

                {form.budget && (
                  <p className="text-xs mt-2 font-medium" style={{ color: 'var(--text-muted)' }}>
                    Budget: <span style={{ color: 'rgb(var(--accent))' }}>{activeCurrency.symbol}{Number(form.budget).toLocaleString()} {form.currency}</span>
                  </p>
                )}
              </div>
            </div>
          )}

          {/* Step 3 – Travel Style */}
          {step === 3 && (
            <div className="space-y-8">
              <div>
                <h2 className="text-2xl font-bold mb-1" style={{ color: 'var(--text-primary)' }}>Your Travel Style 🎒</h2>
                <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>Helps our AI personalize your itinerary.</p>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">Accommodation</label>
                <div className="grid grid-cols-3 gap-3">
                  {ACCOMMODATION_TYPES.map(type => (
                    <button
                      key={type.value}
                      type="button"
                      onClick={() => setForm({ ...form, accommodationType: type.value })}
                      className={`p-4 rounded-2xl text-left border-2 transition-all ${
                        form.accommodationType === type.value
                          ? 'bg-blue-500/15 border-blue-500 shadow-lg'
                          : 'hover:border-blue-300'
                      }`}
                      style={{
                        background: form.accommodationType !== type.value ? 'var(--bg-glass)' : undefined,
                        borderColor: form.accommodationType !== type.value ? 'var(--border)' : undefined,
                      }}
                    >
                      <div className="text-2xl mb-2">{type.icon}</div>
                      <p className="font-bold text-sm" style={{ color: 'var(--text-primary)' }}>{type.value}</p>
                      <p className="text-xs mt-0.5" style={{ color: 'var(--text-secondary)' }}>{type.desc}</p>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">
                  Interests <span className="text-slate-600 normal-case font-normal">(pick any)</span>
                </label>
                <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
                  {INTERESTS.map(({ tag, emoji }) => (
                    <button
                      key={tag}
                      type="button"
                      onClick={() => toggleInterest(tag)}
                      className={`flex flex-col items-center justify-center gap-1 py-3 px-2 rounded-xl border text-center transition-all ${
                        form.interests.includes(tag)
                          ? 'bg-blue-500/20 border-blue-400 text-blue-600 dark:text-blue-100 scale-105'
                          : 'hover:border-blue-400 hover:text-blue-500'
                      }`}
                      style={{
                        background: !form.interests.includes(tag) ? 'var(--bg-glass)' : undefined,
                        borderColor: !form.interests.includes(tag) ? 'var(--border)' : undefined,
                        color: !form.interests.includes(tag) ? 'var(--text-secondary)' : undefined
                      }}
                    >
                      <span className="text-xl">{emoji}</span>
                      <span className="text-xs font-semibold">{tag}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Navigation */}
          <div className="flex justify-between items-center mt-10 pt-8 border-t border-white/5">
            {step > 1 ? (
              <button
                type="button"
                onClick={() => setStep(step - 1)}
                className="font-semibold text-sm flex items-center gap-2 transition-colors"
                style={{ color: 'var(--text-secondary)' }}
                disabled={loading}
              >
                ← Back
              </button>
            ) : <div />}

            {step < 3 ? (
              <button
                type="button"
                onClick={() => setStep(step + 1)}
                disabled={step === 1 ? !canNext1 : !canNext2}
                className="btn-primary px-8 h-12 text-sm disabled:opacity-30 disabled:cursor-not-allowed"
              >
                Continue →
              </button>
            ) : (
              <button
                onClick={handleSubmit}
                disabled={loading}
                className="btn-primary px-8 h-12 text-sm disabled:opacity-50"
              >
                {loading ? (
                  <span className="flex items-center gap-2">
                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Generating...
                  </span>
                ) : 'Generate My Trip 🚀'}
              </button>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default CreateTripPage;
