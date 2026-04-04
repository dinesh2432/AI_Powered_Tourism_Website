import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import toast from 'react-hot-toast';

const GuideMarketplacePage = () => {
  const { user } = useAuth();
  const [guides, setGuides] = useState([]);
  const [loading, setLoading] = useState(true);
  const [city, setCity] = useState('');
  const [language, setLanguage] = useState('');
  const [applying, setApplying] = useState(false);
  const [showApplyForm, setShowApplyForm] = useState(false);
  const [applyForm, setApplyForm] = useState({ 
    city: '', 
    languages: '', 
    experience: '', 
    description: '',
    phoneNumber: '',
    socialLink: '',
    transportation: ''
  });
  const [selectedFile, setSelectedFile] = useState(null);
  const [appStatus, setAppStatus] = useState(null);
  const [searchParams] = useSearchParams();

  useEffect(() => {
    if (user && !user.isGuide) checkApplicationStatus();
  }, [user]);

  const checkApplicationStatus = async () => {
    try {
      const { data } = await api.get('/guides/application-status');
      if (data.application) {
        setAppStatus(data.application.status);
      }
    } catch {
      // ignore
    }
  };

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
    if (!selectedFile) return toast.error('Please upload an identity document');
    
    setApplying(true);
    try {
      const formData = new FormData();
      Object.keys(applyForm).forEach(key => formData.append(key, applyForm[key]));
      formData.append('identityDocument', selectedFile);

      await api.post('/guides/apply', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      
      toast.success('Application submitted! Admin will review it.');
      setShowApplyForm(false);
      setAppStatus('pending');
      setApplyForm({ city: '', languages: '', experience: '', description: '', phoneNumber: '', socialLink: '', transportation: '' });
      setSelectedFile(null);
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
    <div
      className="min-h-screen"
      style={{ background: 'var(--bg-primary)', fontFamily: "'Inter', 'Outfit', sans-serif" }}
    >
      {/* Header */}
      <div className="relative h-52 overflow-hidden">
        <img
          src="https://images.unsplash.com/photo-1527631746610-bca00a040d60?w=1600&q=80"
          alt="Guides"
          className="w-full h-full object-cover"
        />
        <div
          className="absolute inset-0"
          style={{ background: 'linear-gradient(to bottom, rgba(0,0,0,0.5), var(--bg-primary))' }}
        />
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 px-4 text-center">
          <h1 className="text-4xl md:text-5xl font-black text-white drop-shadow-lg">Local Guides 🧑‍💼</h1>
          <p className="text-white/80 max-w-md text-sm drop-shadow">
            Connect with verified local experts who know every hidden gem
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Search + Apply */}
        <div className="flex flex-col lg:flex-row gap-4 mb-8">
          <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-3 flex-1">
            <input
              type="text"
              className="input-field w-full sm:flex-1"
              placeholder="📍 City (e.g. Paris)"
              value={city}
              onChange={(e) => setCity(e.target.value)}
            />
            <input
              type="text"
              className="input-field w-full sm:flex-1"
              placeholder="🌐 Language"
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
            />
            <button type="submit" className="btn-primary w-full sm:w-auto px-6 whitespace-nowrap">🔍 Search</button>
          </form>
          {user && (
            user.isGuide ? (
              <button disabled className="btn-secondary whitespace-nowrap w-full lg:w-auto opacity-70 cursor-not-allowed border-green-500/30 text-green-400">
                ✅ Verified Guide
              </button>
            ) : appStatus === 'pending' ? (
              <button disabled className="btn-secondary whitespace-nowrap w-full lg:w-auto opacity-70 cursor-not-allowed">
                ⏳ Pending Approval
              </button>
            ) : (
              <button onClick={() => setShowApplyForm(!showApplyForm)} className="btn-secondary whitespace-nowrap w-full lg:w-auto">
                👤 Become a Guide
              </button>
            )
          )}
        </div>

        {/* Apply Form */}
        <AnimatePresence>
          {showApplyForm && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mb-8 overflow-hidden"
            >
              <div className="card" style={{ border: `1px solid rgba(var(--accent), 0.3)` }}>
                <h2
                  className="text-xl font-bold mb-5"
                  style={{ color: 'var(--text-primary)' }}
                >
                  🌟 Apply to Become a Guide
                </h2>
                <form onSubmit={handleApply} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="input-label">City you guide in</label>
                    <input required className="input-field" placeholder="e.g. Paris, Bali"
                      value={applyForm.city} onChange={(e) => setApplyForm({ ...applyForm, city: e.target.value })} />
                  </div>
                  <div>
                    <label className="input-label">Languages (comma-separated)</label>
                    <input required className="input-field" placeholder="English, French, Spanish"
                      value={applyForm.languages} onChange={(e) => setApplyForm({ ...applyForm, languages: e.target.value })} />
                  </div>
                  <div>
                    <label className="input-label">Years of experience</label>
                    <input required type="number" className="input-field" placeholder="e.g. 5"
                      value={applyForm.experience} onChange={(e) => setApplyForm({ ...applyForm, experience: e.target.value })} />
                  </div>
                  <div>
                    <label className="input-label">Phone Number</label>
                    <input required type="tel" className="input-field" placeholder="e.g. +1 234 567 890"
                      value={applyForm.phoneNumber} onChange={(e) => setApplyForm({ ...applyForm, phoneNumber: e.target.value })} />
                  </div>
                  <div>
                    <label className="input-label">Social / Portfolio Link</label>
                    <input required type="url" className="input-field" placeholder="Instagram, LinkedIn, or Portfolio URL"
                      value={applyForm.socialLink} onChange={(e) => setApplyForm({ ...applyForm, socialLink: e.target.value })} />
                  </div>
                  <div>
                    <label className="input-label">Transportation</label>
                    <input required className="input-field" placeholder="e.g. Private Car, Walking only, etc."
                      value={applyForm.transportation} onChange={(e) => setApplyForm({ ...applyForm, transportation: e.target.value })} />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="input-label">Identity Verification (ID/Passport)</label>
                    <div className="mt-1 flex items-center gap-4 p-4 rounded-xl border border-dashed border-white/20 bg-white/5 transition-colors hover:bg-white/10">
                      <input 
                        type="file" 
                        required 
                        id="id-upload"
                        className="hidden" 
                        accept="image/*,.pdf"
                        onChange={(e) => setSelectedFile(e.target.files[0])} 
                      />
                      <label htmlFor="id-upload" className="btn-secondary py-2 px-4 text-xs cursor-pointer">
                        {selectedFile ? 'Change File' : '📁 Upload ID'}
                      </label>
                      <span className="text-xs text-slate-400 truncate max-w-[200px]">
                        {selectedFile ? selectedFile.name : 'No file chosen (JPG, PNG, PDF)'}
                      </span>
                    </div>
                  </div>
                  <div className="sm:col-span-2">
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
            <h3
              className="text-2xl font-bold mb-2"
              style={{ color: 'var(--text-primary)' }}
            >
              No guides found
            </h3>
            <p style={{ color: 'var(--text-secondary)' }}>Try a different city or language filter</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {guides.map((guide, i) => (
              <motion.div
                key={guide._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.07 }}
                className="card transition-all duration-300 hover:-translate-y-1"
                onMouseEnter={e => {
                  e.currentTarget.style.borderColor = `rgba(var(--accent), 0.4)`;
                  e.currentTarget.style.boxShadow = `0 8px 32px rgba(var(--accent), 0.12)`;
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.borderColor = 'var(--border)';
                  e.currentTarget.style.boxShadow = 'none';
                }}
              >
                {/* Guide header */}
                <div className="flex items-center gap-4 mb-5">
                  <div
                    className="w-16 h-16 rounded-2xl flex items-center justify-center text-2xl font-bold overflow-hidden shrink-0 shadow-lg"
                    style={{ background: `linear-gradient(135deg, rgb(var(--accent)), #818cf8)` }}
                  >
                    {guide.userId?.profileImage ? (
                      <img src={guide.userId.profileImage} alt="" className="w-full h-full object-cover" />
                    ) : (
                      <span className="text-white">{guide.userId?.name?.charAt(0) || '?'}</span>
                    )}
                  </div>
                  <div className="min-w-0">
                    <h3
                      className="font-bold truncate"
                      style={{ color: 'var(--text-primary)' }}
                    >
                      {guide.userId?.name || 'Guide'}
                    </h3>
                    <p
                      className="text-sm flex items-center gap-1"
                      style={{ color: `rgb(var(--accent))` }}
                    >
                      📍 {guide.city}
                    </p>
                    <div className="flex items-center gap-1.5 mt-1">
                      <span className="text-amber-400 text-sm">★</span>
                      <span className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>
                        {guide.rating.toFixed(1)}
                      </span>
                      <span className="text-xs" style={{ color: 'var(--text-muted)' }}>
                        · {guide.experience} yrs exp.
                      </span>
                    </div>
                  </div>
                </div>

                {/* Languages */}
                <div className="flex flex-wrap gap-1.5 mb-3">
                  {guide.languages.map(l => (
                    <span
                      key={l}
                      className="badge text-xs"
                      style={{
                        background: `rgba(var(--accent), 0.12)`,
                        color: `rgb(var(--accent))`,
                        border: `1px solid rgba(var(--accent), 0.25)`,
                      }}
                    >
                      {l}
                    </span>
                  ))}
                </div>

                {/* Description */}
                <p
                  className="text-sm mb-5 line-clamp-2 leading-relaxed"
                  style={{ color: 'var(--text-secondary)' }}
                >
                  {guide.description}
                </p>

                {/* Price & Actions */}
                <div className="flex items-center justify-between mb-4 text-sm">
                  <span style={{ color: 'var(--text-secondary)' }}>
                    From{' '}
                    <span className="font-bold text-lg" style={{ color: 'var(--text-primary)' }}>
                      ${guide.pricePerDay || 80}
                    </span>
                    <span style={{ color: 'var(--text-muted)' }}>/day</span>
                  </span>
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
