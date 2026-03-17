import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import toast from 'react-hot-toast';

const GuideMarketplacePage = () => {
  const { user } = useAuth();
  const [guides, setGuides] = useState([]);
  const [loading, setLoading] = useState(true);
  const [city, setCity] = useState('');
  const [language, setLanguage] = useState('');
  const [applying, setApplying] = useState(false);
  const [showApplyForm, setShowApplyForm] = useState(false);
  const [applyForm, setApplyForm] = useState({ city: '', languages: '', experience: '', description: '' });
  const [searchParams] = useSearchParams();

  useEffect(() => {
    const c = searchParams.get('city') || '';
    setCity(c);
    fetchGuides(c, '');
  }, []);

  const fetchGuides = async (c, l) => {
    setLoading(true);
    try {
      const { data } = await api.get('/guides', { params: { city: c, language: l } });
      setGuides(data.guides || []);
    } catch {
      toast.error('Failed to load guides');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => { e.preventDefault(); fetchGuides(city, language); };

  const handleApply = async (e) => {
    e.preventDefault();
    setApplying(true);
    try {
      await api.post('/guides/apply', applyForm);
      toast.success('Application submitted! Admin will review it.');
      setShowApplyForm(false);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Application failed');
    } finally {
      setApplying(false);
    }
  };

  const handleRequest = async (guide) => {
    if (!user) return toast.error('Please login first');
    try {
      await api.post(`/guides/${guide._id}/request`, { message: `Hi, I'd love to book you as my guide!` });
      toast.success(`Request sent to ${guide.userId?.name || 'Guide'}! 🎉`);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to send request');
    }
  };

  return (
    <div className="min-h-screen">
      {/* Header */}
      <div className="relative h-52 overflow-hidden">
        <img
          src="https://images.unsplash.com/photo-1527631746610-bca00a040d60?w=1600&q=80"
          alt="Guides"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-slate-950/60 to-slate-950" />
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 px-4 text-center">
          <h1 className="text-4xl md:text-5xl font-display font-bold text-white">Local Guides 🧑‍💼</h1>
          <p className="text-slate-300 max-w-md">Connect with verified local experts who know every hidden gem</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Search + Apply */}
        <div className="flex flex-col sm:flex-row gap-4 mb-8">
          <form onSubmit={handleSearch} className="flex gap-2 flex-1">
            <input type="text" className="input-field" placeholder="📍 City (e.g. Paris)"
              value={city} onChange={(e) => setCity(e.target.value)} />
            <input type="text" className="input-field" placeholder="🌐 Language"
              value={language} onChange={(e) => setLanguage(e.target.value)} />
            <button type="submit" className="btn-primary px-5 whitespace-nowrap">🔍 Search</button>
          </form>
          {user && !user.isGuide && (
            <button onClick={() => setShowApplyForm(!showApplyForm)} className="btn-secondary whitespace-nowrap">
              👤 Become a Guide
            </button>
          )}
        </div>

        {/* Apply Form */}
        <AnimatePresence>
          {showApplyForm && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mb-8"
            >
              <div className="card border-primary-500/30">
                <h2 className="text-xl font-display font-bold text-white mb-5">🌟 Apply to Become a Guide</h2>
                <form onSubmit={handleApply} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="form-group">
                    <label className="input-label">City you guide in</label>
                    <input required className="input-field" placeholder="e.g. Paris, Bali"
                      value={applyForm.city} onChange={(e) => setApplyForm({ ...applyForm, city: e.target.value })} />
                  </div>
                  <div className="form-group">
                    <label className="input-label">Languages (comma-separated)</label>
                    <input required className="input-field" placeholder="English, French, Spanish"
                      value={applyForm.languages} onChange={(e) => setApplyForm({ ...applyForm, languages: e.target.value })} />
                  </div>
                  <div className="form-group">
                    <label className="input-label">Years of experience</label>
                    <input required type="number" className="input-field" placeholder="e.g. 5"
                      value={applyForm.experience} onChange={(e) => setApplyForm({ ...applyForm, experience: e.target.value })} />
                  </div>
                  <div className="form-group sm:col-span-2">
                    <label className="input-label">About you</label>
                    <textarea required className="input-field h-24 resize-none" placeholder="Tell us about yourself and your expertise..."
                      value={applyForm.description} onChange={(e) => setApplyForm({ ...applyForm, description: e.target.value })} />
                  </div>
                  <div className="sm:col-span-2 flex gap-3">
                    <button type="submit" disabled={applying} className="btn-primary">
                      {applying ? 'Submitting...' : 'Submit Application'}
                    </button>
                    <button type="button" onClick={() => setShowApplyForm(false)} className="btn-secondary">Cancel</button>
                  </div>
                </form>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Guides Grid */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => <div key={i} className="rounded-2xl shimmer h-60" />)}
          </div>
        ) : guides.length === 0 ? (
          <div className="text-center py-24">
            <div className="text-7xl mb-4">🧑‍💼</div>
            <h3 className="text-2xl font-display font-bold text-white mb-2">No guides found</h3>
            <p className="text-slate-400">Try a different city or language filter</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {guides.map((guide, i) => (
              <motion.div
                key={guide._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.07 }}
                className="card hover:border-primary-500/40 hover:-translate-y-1 transition-all duration-300"
              >
                {/* Guide header */}
                <div className="flex items-center gap-4 mb-5">
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary-500 to-secondary-600 flex items-center justify-center text-2xl font-bold overflow-hidden shrink-0 shadow-lg">
                    {guide.userId?.profileImage ? (
                      <img src={guide.userId.profileImage} alt="" className="w-full h-full object-cover" />
                    ) : (
                      <span className="text-white">{guide.userId?.name?.charAt(0) || '?'}</span>
                    )}
                  </div>
                  <div className="min-w-0">
                    <h3 className="text-white font-display font-bold truncate">{guide.userId?.name || 'Guide'}</h3>
                    <p className="text-primary-400 text-sm flex items-center gap-1">📍 {guide.city}</p>
                    <div className="flex items-center gap-1.5 mt-1">
                      <span className="text-accent-400 text-sm">★</span>
                      <span className="text-white text-sm font-semibold">{guide.rating.toFixed(1)}</span>
                      <span className="text-slate-500 text-xs">· {guide.experience} yrs exp.</span>
                    </div>
                  </div>
                </div>

                {/* Languages */}
                <div className="flex flex-wrap gap-1.5 mb-3">
                  {guide.languages.map(l => (
                    <span key={l} className="badge-primary">{l}</span>
                  ))}
                </div>

                {/* Description */}
                <p className="text-slate-400 text-sm mb-5 line-clamp-2 leading-relaxed">{guide.description}</p>

                {/* Price & Actions */}
                <div className="flex items-center justify-between mb-4 text-sm">
                  <span className="text-slate-400">From <span className="text-white font-bold text-lg">${guide.pricePerDay || 80}</span><span className="text-slate-500">/day</span></span>
                </div>
                <div className="flex gap-2">
                  <button onClick={() => handleRequest(guide)} className="btn-primary flex-1 text-sm py-2.5">
                    📩 Book Guide
                  </button>
                  <Link to={`/chat/${guide.userId?._id}`} className="btn-secondary text-sm py-2.5 px-4">
                    💬
                  </Link>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default GuideMarketplacePage;
