import { useState } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../services/api';
import toast from 'react-hot-toast';

const accommodationTypes = [
  { value: 'Budget', icon: '🏕️', desc: 'Hostels & budget hotels' },
  { value: 'Standard', icon: '🏩', desc: 'Comfortable 3-4 star hotels' },
  { value: 'Luxury', icon: '✨', desc: 'Premium 5-star resorts' },
];

const interestTags = ['Beach', 'Mountains', 'History', 'Food', 'Adventure', 'Art', 'Shopping', 'Nature', 'Nightlife', 'Wellness'];

const CreateTripPage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    source: '',
    destination: searchParams.get('destination') || '',
    startDate: '',
    endDate: '',
    budget: '',
    currency: 'USD',
    members: 1,
    accommodationType: 'Standard',
    interests: [],
  });

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
    if (new Date(form.endDate) <= new Date(form.startDate)) {
      return toast.error('End date must be after start date');
    }
    setLoading(true);
    toast('🤖 AI is generating your personalized itinerary...', { duration: 10000 });
    try {
      const { data } = await api.post('/trips', form);
      toast.success('Trip generated successfully! ✈️');
      navigate(`/trips/${data.trip._id}`);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to generate trip');
    } finally {
      setLoading(false);
    }
  };

  const canNext1 = form.source && form.destination;
  const canNext2 = form.startDate && form.endDate && form.budget && dayCount > 0;

  const stepInfo = [
    { n: 1, label: 'Destination' },
    { n: 2, label: 'Dates & Budget' },
    { n: 3, label: 'Preferences' },
  ];

  return (
    <div className="min-h-screen bg-slate-950 px-4 py-12 md:py-20 lg:py-24 relative overflow-hidden">
      {/* Background Decorative Elements */}
      <div className="absolute top-0 right-0 w-[50%] h-[50%] bg-primary-600/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-[50%] h-[50%] bg-secondary-600/10 rounded-full blur-[120px] pointer-events-none" />

      <div className="max-w-4xl mx-auto relative z-10">
        <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-16"
        >
            <h1 className="text-4xl md:text-6xl font-display font-black text-white mb-4 tracking-tighter">
                CRAFT YOUR <span className="gradient-text">ODYSSEY</span>
            </h1>
            <p className="text-slate-400 text-lg md:text-xl font-medium max-w-2xl mx-auto italic">
                Our AI engine is ready to synthesize your perfect journey. Tell us what moves you.
            </p>
        </motion.div>

        {/* Step Progress Bar */}
        <div className="mb-16 relative">
          <div className="absolute top-1/2 left-0 w-full h-0.5 bg-white/5 -translate-y-1/2" />
          <motion.div 
            className="absolute top-1/2 left-0 h-0.5 bg-gradient-to-r from-primary-500 to-secondary-500 -translate-y-1/2 transition-all duration-700"
            animate={{ width: `${((step - 1) / 2) * 100}%` }}
          />
          <div className="relative flex justify-between">
            {stepInfo.map((s) => (
              <div key={s.n} className="flex flex-col items-center">
                <button
                  onClick={() => step > s.n && setStep(s.n)}
                  className={`w-12 h-12 rounded-2xl flex items-center justify-center font-bold transition-all duration-500 border-2 ${
                    s.n < step ? 'bg-primary-500 border-primary-500 text-white shadow-glow-primary' : 
                    s.n === step ? 'bg-slate-900 border-primary-500 text-primary-400 shadow-xl' : 
                    'bg-slate-950 border-white/10 text-slate-600'
                  }`}
                >
                  {s.n < step ? '✓' : s.n}
                </button>
                <span className={`text-[10px] md:text-xs uppercase tracking-[0.2em] font-black mt-4 ${
                  s.n <= step ? 'text-white' : 'text-slate-600'
                }`}>
                  {s.label}
                </span>
              </div>
            ))}
          </div>
        </div>

        <motion.div
          className="glass-dark border border-white/5 rounded-[40px] p-8 md:p-12 shadow-3xl"
          key={step}
          initial={{ opacity: 0, scale: 0.98, x: 20 }}
          animate={{ opacity: 1, scale: 1, x: 0 }}
          transition={{ duration: 0.5 }}
        >
          {step === 1 && (
            <div className="space-y-10">
              <div>
                <h2 className="text-2xl md:text-3xl font-display font-bold text-white mb-2 italic">Where to?</h2>
                <p className="text-slate-500 font-medium">Anywhere in the world, our AI will find the best for you.</p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="form-group relative group">
                  <label className="input-label mb-2">Departing From</label>
                  <input
                    type="text"
                    className="input-field pl-12"
                    placeholder="e.g. Mumbai, New York..."
                    value={form.source}
                    onChange={(e) => setForm({ ...form, source: e.target.value })}
                  />
                  <span className="absolute left-4 bottom-4 text-xl opacity-20 group-focus-within:opacity-100 transition-opacity">🛫</span>
                </div>
                <div className="form-group relative group">
                  <label className="input-label mb-2">Dream Destination</label>
                  <input
                    type="text"
                    className="input-field pl-12"
                    placeholder="e.g. Paris, Tokyo, Bali..."
                    value={form.destination}
                    onChange={(e) => setForm({ ...form, destination: e.target.value })}
                  />
                  <span className="absolute left-4 bottom-4 text-xl opacity-20 group-focus-within:opacity-100 transition-opacity">📍</span>
                </div>
              </div>

              <div>
                <p className="text-xs font-bold text-slate-600 uppercase tracking-widest mb-6">Trending right now</p>
                <div className="flex flex-wrap gap-3">
                  {['Paris', 'Bali', 'Tokyo', 'Dubai', 'Santorini'].map(city => (
                    <button
                      key={city}
                      onClick={() => setForm({ ...form, destination: city })}
                      className={`px-6 py-3 bg-white/5 hover:bg-primary-500/10 border border-white/5 hover:border-primary-500/30 rounded-2x transition-all duration-300 ${
                        form.destination === city ? 'bg-primary-500/20 border-primary-500/40 text-white' : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      {city}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-12">
               <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                  <div className="form-group">
                    <label className="input-label mb-4">Travel Dates</label>
                    <div className="grid grid-cols-2 gap-4">
                        <input
                            type="date"
                            className="input-field"
                            min={new Date().toISOString().split('T')[0]}
                            value={form.startDate}
                            onChange={(e) => setForm({ ...form, startDate: e.target.value })}
                        />
                        <input
                            type="date"
                            className="input-field"
                            min={form.startDate || new Date().toISOString().split('T')[0]}
                            value={form.endDate}
                            onChange={(e) => setForm({ ...form, endDate: e.target.value })}
                        />
                    </div>
                    {dayCount > 0 && (
                      <p className="text-xs text-primary-400 font-bold uppercase tracking-widest mt-3">
                        Total duration: {dayCount} days
                      </p>
                    )}
                  </div>

                  <div className="form-group">
                    <label className="input-label mb-4">Traveler Count</label>
                    <div className="flex items-center gap-6">
                      <button type="button" onClick={() => setForm(f => ({ ...f, members: Math.max(1, f.members - 1) }))}
                        className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 text-white font-bold hover:bg-white/10 transition-colors flex items-center justify-center">−</button>
                      <span className="text-3xl font-black text-white w-10 text-center">{form.members}</span>
                      <button type="button" onClick={() => setForm(f => ({ ...f, members: Math.min(20, f.members + 1) }))}
                        className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 text-white font-bold hover:bg-white/10 transition-colors flex items-center justify-center">+</button>
                      <span className="text-slate-400 text-xs font-bold uppercase tracking-widest">{form.members === 1 ? 'Solo' : 'Group'}</span>
                    </div>
                  </div>
               </div>

               <div className="form-group">
                  <label className="input-label mb-4">Total Budget Strategy</label>
                  <div className="grid grid-cols-3 gap-6">
                    <div className="col-span-2">
                        <input
                            type="number"
                            className="input-field"
                            placeholder="Amount..."
                            value={form.budget}
                            onChange={(e) => setForm({ ...form, budget: e.target.value })}
                        />
                    </div>
                    <select 
                        className="input-field cursor-pointer"
                        value={form.currency}
                        onChange={(e) => setForm({ ...form, currency: e.target.value })}
                    >
                        {['USD', 'EUR', 'GBP', 'INR', 'JPY'].map(c => (
                            <option key={c} value={c} className="bg-slate-900">{c}</option>
                        ))}
                    </select>
                  </div>
                </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-12">
              <div className="form-group">
                <label className="input-label mb-4">Accommodation Preference</label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {accommodationTypes.map((type) => (
                    <button
                      key={type.value}
                      type="button"
                      onClick={() => setForm({ ...form, accommodationType: type.value })}
                      className={`p-6 rounded-[32px] text-left border-2 transition-all duration-500 ${
                        form.accommodationType === type.value
                          ? 'bg-primary-500/10 border-primary-500 shadow-xl'
                          : 'bg-white/5 border-white/5 hover:border-white/10'
                      }`}
                    >
                      <div className="text-3xl mb-4">{type.icon}</div>
                      <h4 className="font-display font-bold text-white mb-1">{type.value}</h4>
                      <p className="text-slate-500 text-[10px] font-medium leading-relaxed">{type.desc}</p>
                    </button>
                  ))}
                </div>
              </div>

              <div className="form-group">
                <h2 className="text-2xl md:text-3xl font-display font-bold text-white mb-2">Tailor Your Interest</h2>
                <p className="text-slate-500 font-medium mb-8">What are we prioritizing? (Select multiple)</p>
                <div className="flex flex-wrap gap-3">
                  {interestTags.map((tag) => (
                    <button
                      key={tag}
                      type="button"
                      onClick={() => toggleInterest(tag)}
                      className={`px-6 py-3 rounded-full border transition-all duration-300 font-bold text-xs uppercase tracking-widest ${
                        form.interests.includes(tag)
                          ? 'bg-secondary-500 border-secondary-500 text-white shadow-glow-secondary scale-105'
                          : 'bg-white/5 border-white/5 text-slate-400 hover:border-white/10'
                      }`}
                    >
                      {tag}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Navigation Buttons */}
          <div className="flex justify-between items-center mt-16 pt-10 border-t border-white/5">
            {step > 1 ? (
              <button
                type="button"
                onClick={() => setStep(step - 1)}
                className="text-slate-500 hover:text-white font-black text-xs uppercase tracking-widest px-6 transition-all"
                disabled={loading}
              >
                ← Back
              </button>
            ) : <div />}
            
            <div className="flex gap-4">
                {step < 3 ? (
                    <button
                        type="button"
                        onClick={() => setStep(step + 1)}
                        disabled={step === 1 ? !canNext1 : !canNext2}
                        className="btn-primary h-14 px-12 text-sm shadow-glow-primary disabled:opacity-30 disabled:cursor-not-allowed"
                    >
                        Continue Journey <span>→</span>
                    </button>
                ) : (
                    <button
                        onClick={handleSubmit}
                        disabled={loading}
                        className="btn-primary h-14 px-12 text-sm shadow-glow-primary disabled:opacity-50"
                    >
                        {loading ? (
                            <div className="flex items-center gap-2">
                                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                <span>Generating...</span>
                            </div>
                        ) : (
                            'Establish Itinerary 🚀'
                        )}
                    </button>
                )}
            </div>
          </div>
        </motion.div>
      </div>

      {/* Helper Tip */}
      <motion.div 
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 1 }}
        className="fixed bottom-8 right-8 hidden xl:block z-20"
      >
        <div className="glass-dark border border-white/10 p-5 rounded-[24px] shadow-2xl max-w-xs">
            <div className="flex gap-4 items-start">
                <div className="text-2xl">💡</div>
                <div>
                    <p className="text-white font-bold text-sm mb-1 uppercase tracking-widest">AI Suggestion</p>
                    <p className="text-slate-400 text-[10px] leading-relaxed font-medium">
                        Choosing multiple interests helps me build a more balanced adventure for you.
                    </p>
                </div>
            </div>
        </div>
      </motion.div>
    </div>
  );
};

export default CreateTripPage;
