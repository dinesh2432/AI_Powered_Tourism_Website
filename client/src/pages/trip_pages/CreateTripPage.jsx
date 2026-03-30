import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
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

const CURRENCIES = ['USD', 'EUR', 'GBP', 'INR', 'JPY', 'AED', 'SGD'];
const TRENDING = ['Paris 🗼', 'Bali 🌴', 'Tokyo 🗾', 'Dubai 🏙️', 'Santorini 🌊', 'Maldives 🐠'];

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
    toast('✈️ Building your perfect itinerary...', { duration: 12000 });
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

  return (
    <div className="min-h-screen px-4 py-10 md:py-16 relative overflow-hidden" style={{ background: 'var(--bg-primary)' }}>
      <div className="absolute top-0 right-0 w-1/2 h-1/2 rounded-full blur-[120px] pointer-events-none opacity-20" style={{ background: `rgba(var(--accent), 0.2)` }} />
      <div className="absolute bottom-0 left-0 w-1/2 h-1/2 rounded-full blur-[120px] pointer-events-none opacity-20" style={{ background: `rgba(var(--accent), 0.1)` }} />

      <div className="max-w-3xl mx-auto relative z-10">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-12">
          <div className="text-5xl mb-4">✈️</div>
          <h1 className="text-3xl md:text-5xl font-bold text-white mb-3 tracking-tight">
            Plan Your Dream Trip
          </h1>
          <p className="text-slate-400 text-base md:text-lg">
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
                  s.n < step ? 'bg-white/10 text-green-400' : 'bg-white/5 text-slate-600'
                }`}
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
          className="bg-white/5 border border-white/10 rounded-3xl p-6 md:p-10 shadow-2xl backdrop-blur-sm"
        >
          {/* Step 1 – Destination */}
          {step === 1 && (
            <div className="space-y-8">
              <div>
                <h2 className="text-2xl font-bold text-white mb-1">Where are you going? 🌍</h2>
                <p className="text-slate-400 text-sm">Type a city and pick from the suggestions.</p>
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
                            ? 'bg-blue-500/20 border-blue-500/40 text-white'
                            : 'bg-white/5 border-white/10 text-slate-400 hover:text-white hover:border-white/20'
                        }`}
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
                <h2 className="text-2xl font-bold text-white mb-1">When & How Much? 📅</h2>
                <p className="text-slate-400 text-sm">All fields are required to generate your trip.</p>
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
                    className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 text-white font-bold hover:bg-white/10 transition flex items-center justify-center text-lg">−</button>
                  <span className="text-3xl font-black text-white w-8 text-center">{form.members}</span>
                  <button type="button" onClick={() => setForm(f => ({ ...f, members: Math.min(20, f.members + 1) }))}
                    className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 text-white font-bold hover:bg-white/10 transition flex items-center justify-center text-lg">+</button>
                  <span className="text-slate-400 text-sm">{form.members === 1 ? 'Solo traveler' : `${form.members} people`}</span>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">Total Budget</label>
                <div className="flex gap-3">
                  <input
                    type="number"
                    className="input-field flex-1"
                    placeholder="Enter your budget..."
                    value={form.budget}
                    min="1"
                    onChange={(e) => setForm({ ...form, budget: e.target.value })}
                  />
                  <select
                    className="input-field w-24 cursor-pointer"
                    value={form.currency}
                    onChange={(e) => setForm({ ...form, currency: e.target.value })}
                  >
                    {CURRENCIES.map(c => <option key={c} value={c} className="bg-slate-900">{c}</option>)}
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* Step 3 – Travel Style */}
          {step === 3 && (
            <div className="space-y-8">
              <div>
                <h2 className="text-2xl font-bold text-white mb-1">Your Travel Style 🎒</h2>
                <p className="text-slate-400 text-sm">Helps our AI personalize your itinerary.</p>
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
                          : 'bg-white/5 border-white/10 hover:border-white/20'
                      }`}
                    >
                      <div className="text-2xl mb-2">{type.icon}</div>
                      <p className="font-bold text-white text-sm">{type.value}</p>
                      <p className="text-slate-500 text-xs mt-0.5">{type.desc}</p>
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
                          ? 'bg-blue-500/20 border-blue-400 text-white scale-105'
                          : 'bg-white/5 border-white/10 text-slate-400 hover:border-white/20 hover:text-white'
                      }`}
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
                className="text-slate-400 hover:text-white font-semibold text-sm flex items-center gap-2 transition-colors"
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
                    Generating your trip...
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
