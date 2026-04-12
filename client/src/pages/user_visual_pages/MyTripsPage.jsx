import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import toast from 'react-hot-toast';

const MyTripsPage = () => {
  const { user } = useAuth();
  const [ownedTrips, setOwnedTrips]           = useState([]);
  const [collaboratedTrips, setCollaboratedTrips] = useState([]);
  const [loading, setLoading]                 = useState(true);
  const [tab, setTab]                         = useState('mine');     // 'mine' | 'shared'
  const [filter, setFilter]                   = useState('all');

  useEffect(() => {
    const fetchAll = async () => {
      try {
        const [ownedRes, collabRes] = await Promise.all([
          api.get('/trips?type=owned'),
          api.get('/trips?type=collaborated'),
        ]);
        setOwnedTrips(ownedRes.data.trips || []);
        setCollaboratedTrips(collabRes.data.trips || []);
      } catch {
        toast.error('Failed to load trips');
      } finally {
        setLoading(false);
      }
    };
    fetchAll();
  }, []);

  const activeTrips = tab === 'mine' ? ownedTrips : collaboratedTrips;
  const filtered    = filter === 'all' ? activeTrips : activeTrips.filter(t => t.status === filter);

  const counts = {
    all:       activeTrips.length,
    upcoming:  activeTrips.filter(t => t.status === 'upcoming').length,
    ongoing:   activeTrips.filter(t => t.status === 'ongoing').length,
    completed: activeTrips.filter(t => t.status === 'completed').length,
  };

  const statusColors = {
    upcoming:  { bg: 'rgba(14,165,233,0.15)',  text: 'rgb(56,189,248)',   border: 'rgba(14,165,233,0.3)' },
    ongoing:   { bg: 'rgba(16,185,129,0.15)',  text: 'rgb(52,211,153)',   border: 'rgba(16,185,129,0.3)' },
    completed: { bg: 'rgba(148,163,184,0.12)', text: 'rgb(148,163,184)', border: 'rgba(148,163,184,0.25)' },
  };

  return (
    <div
      className="min-h-screen pb-20 relative overflow-hidden"
      style={{ background: 'var(--bg-primary)', fontFamily: "'Inter', 'Outfit', sans-serif" }}
    >
      {/* Hero */}
      <div className="relative h-[40vh] min-h-[300px] overflow-hidden">
        <motion.img
          initial={{ scale: 1.08, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 1.5 }}
          src="https://images.unsplash.com/photo-1488085061387-422e29b40080?w=1600&q=85"
          alt="My Trips"
          className="w-full h-full object-cover"
          style={{ opacity: 0.35 }}
        />
        <div
          className="absolute inset-0"
          style={{ background: 'linear-gradient(to bottom, var(--bg-primary) 0%, transparent 40%, var(--bg-primary) 100%)' }}
        />
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="max-w-7xl mx-auto w-full px-4 md:px-12 text-center">
            <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
              <h1 className="text-6xl md:text-8xl font-black mb-6 tracking-tight leading-none" style={{ color: 'var(--text-primary)' }}>
                My Trips
              </h1>
              <div className="flex justify-center gap-10 text-xs font-semibold uppercase tracking-widest" style={{ color: 'var(--text-muted)' }}>
                <div className="flex flex-col items-center gap-1">
                  <span className="text-2xl font-black" style={{ color: 'var(--text-primary)' }}>{ownedTrips.length}</span>
                  <span>Created</span>
                </div>
                <div className="w-px h-10" style={{ background: 'var(--border-strong)' }} />
                <div className="flex flex-col items-center gap-1">
                  <span className="text-2xl font-black" style={{ color: 'var(--text-primary)' }}>{collaboratedTrips.length}</span>
                  <span>Shared</span>
                </div>
                <div className="w-px h-10" style={{ background: 'var(--border-strong)' }} />
                <div className="flex flex-col items-center gap-1">
                  <span className="text-2xl font-black" style={{ color: 'var(--text-primary)' }}>
                    {ownedTrips.filter(t => t.status === 'ongoing').length}
                  </span>
                  <span>Active</span>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 md:px-8 lg:px-12 -mt-6 relative z-10">

        {/* ── Primary Tabs: Mine / Shared ── */}
        <div className="flex gap-2 mb-6">
          {[
            { key: 'mine',   label: '✈️ My Trips',       count: ownedTrips.length },
            { key: 'shared', label: '🤝 Shared With Me', count: collaboratedTrips.length },
          ].map(t => (
            <button
              key={t.key}
              onClick={() => { setTab(t.key); setFilter('all'); }}
              className="relative h-11 px-6 rounded-xl text-xs font-bold uppercase tracking-wider transition-all duration-300"
              style={
                tab === t.key
                  ? { background: `rgb(var(--accent))`, color: '#fff', border: `1px solid rgba(var(--accent),0.4)`, boxShadow: `0 4px 16px rgba(var(--accent),0.3)` }
                  : { background: 'var(--bg-card)', color: 'var(--text-secondary)', border: '1px solid var(--border)' }
              }
            >
              {t.label}
              {t.count > 0 && (
                <span
                  className="ml-2 text-[10px] px-1.5 py-0.5 rounded-full font-bold"
                  style={tab === t.key ? { background: 'rgba(255,255,255,0.25)', color: '#fff' } : { background: 'var(--bg-hover)', color: 'var(--text-muted)' }}
                >
                  {t.count}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* ── Secondary Filters: Status ── */}
        <div className="flex flex-wrap gap-2 mb-8">
          {['all', 'upcoming', 'ongoing', 'completed'].map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className="px-5 h-9 rounded-xl text-xs font-bold uppercase tracking-wider transition-all duration-200"
              style={
                filter === f
                  ? { background: 'var(--bg-hover)', color: 'var(--text-primary)', border: `1px solid var(--border-strong)` }
                  : { background: 'transparent', color: 'var(--text-muted)', border: '1px solid var(--border)' }
              }
            >
              {f} <span className="ml-1 opacity-60">{counts[f]}</span>
            </button>
          ))}
        </div>

        {/* ── Trip Grid ── */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[...Array(6)].map((_, i) => <div key={i} className="h-80 rounded-2xl shimmer" />)}
          </div>
        ) : filtered.length === 0 ? (
          <div className="card p-20 text-center max-w-2xl mx-auto" style={{ border: '1px solid var(--border)' }}>
            <div className="text-5xl mb-8 opacity-30">{tab === 'shared' ? '🤝' : '🗺️'}</div>
            <h3 className="text-3xl font-black mb-4" style={{ color: 'var(--text-primary)' }}>
              {tab === 'shared' ? 'No shared trips yet' : 'No trips yet'}
            </h3>
            <p className="text-sm mb-10" style={{ color: 'var(--text-secondary)' }}>
              {tab === 'shared'
                ? 'When someone adds you as a collaborator, their trip will appear here.'
                : filter === 'all'
                ? 'Start your journey — create your first AI-planned trip.'
                : `No ${filter} trips found.`}
            </p>
            {tab === 'mine' && (
              <Link to="/create-trip" className="btn-primary h-12 px-10">Plan a New Trip →</Link>
            )}
          </div>
        ) : (
          <AnimatePresence mode="wait">
            <motion.div
              key={`${tab}-${filter}`}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.25 }}
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
            >
              {filtered.map((trip, i) => {
                const days = trip.startDate && trip.endDate
                  ? Math.ceil((new Date(trip.endDate) - new Date(trip.startDate)) / (1000 * 60 * 60 * 24))
                  : 0;
                const sc = statusColors[trip.status] || statusColors.upcoming;

                // Am I the owner or a collaborator?
                const isMyTrip = trip.userId?._id
                  ? trip.userId._id.toString() === user?._id
                  : trip.userId?.toString() === user?._id;

                return (
                  <motion.div
                    key={trip._id}
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.05, duration: 0.35 }}
                  >
                    <Link
                      to={`/trips/${trip._id}`}
                      className="group relative block rounded-2xl overflow-hidden transition-all duration-300 hover:-translate-y-1"
                      style={{ border: '1px solid var(--border)', background: 'var(--bg-card)' }}
                      onMouseEnter={e => {
                        e.currentTarget.style.borderColor = `rgba(var(--accent), 0.4)`;
                        e.currentTarget.style.boxShadow  = `0 8px 32px rgba(var(--accent), 0.12)`;
                      }}
                      onMouseLeave={e => {
                        e.currentTarget.style.borderColor = 'var(--border)';
                        e.currentTarget.style.boxShadow  = 'none';
                      }}
                    >
                      {/* Image */}
                      <div className="h-48 relative overflow-hidden">
                        <img
                          src={trip.images?.destination?.[0] || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=600&q=80'}
                          alt={trip.destination}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />

                        {/* Status badge */}
                        <span
                          className="absolute top-3 left-3 text-xs font-bold px-3 py-1 rounded-full capitalize"
                          style={{ background: sc.bg, color: sc.text, border: `1px solid ${sc.border}` }}
                        >
                          {trip.status}
                        </span>

                        {/* Shared / Owned badge */}
                        {!isMyTrip && (
                          <span
                            className="absolute top-3 right-3 text-[10px] font-bold px-2.5 py-1 rounded-full"
                            style={{ background: 'rgba(99,102,241,0.9)', color: '#fff' }}
                          >
                            🤝 Shared
                          </span>
                        )}
                        {isMyTrip && trip.collaborators?.length > 0 && (
                          <span
                            className="absolute top-3 right-3 text-[10px] font-bold px-2.5 py-1 rounded-full"
                            style={{ background: 'rgba(16,185,129,0.85)', color: '#fff' }}
                          >
                            👥 {trip.collaborators.length} collab
                          </span>
                        )}
                      </div>

                      {/* Info */}
                      <div className="p-5">
                        <h3
                          className="text-xl font-black mb-1 tracking-tight group-hover:opacity-80 transition-opacity"
                          style={{ color: 'var(--text-primary)' }}
                        >
                          {trip.destination}
                        </h3>
                        <p className="text-sm mb-1" style={{ color: 'var(--text-secondary)' }}>
                          From {trip.source}
                          {days > 0 && ` · ${days} day${days !== 1 ? 's' : ''}`}
                        </p>
                        {/* Owner info (only visible on shared tab) */}
                        {!isMyTrip && trip.userId?.name && (
                          <p className="text-xs mb-2 font-medium" style={{ color: `rgb(var(--accent))` }}>
                            by {trip.userId.name}
                          </p>
                        )}

                        <div className="flex items-end justify-between pt-4" style={{ borderTop: '1px solid var(--border)' }}>
                          <div>
                            <p className="text-[10px] font-semibold uppercase tracking-wider mb-0.5" style={{ color: 'var(--text-muted)' }}>Budget</p>
                            <p className="text-base font-black" style={{ color: 'var(--text-primary)' }}>
                              {trip.budget}{' '}
                              <span style={{ color: `rgb(var(--accent))` }}>{trip.currency}</span>
                            </p>
                          </div>
                          <div
                            className="w-9 h-9 rounded-lg flex items-center justify-center text-white font-bold text-sm group-hover:scale-110 transition-transform duration-300"
                            style={{ background: `rgb(var(--accent))` }}
                          >
                            →
                          </div>
                        </div>
                      </div>
                    </Link>
                  </motion.div>
                );
              })}
            </motion.div>
          </AnimatePresence>
        )}
      </div>

      {/* FAB */}
      <Link
        to="/create-trip"
        className="fixed bottom-8 right-8 w-14 h-14 rounded-2xl flex items-center justify-center text-2xl text-white shadow-2xl hover:-translate-y-1 active:scale-95 transition-all duration-200 z-50"
        style={{ background: `rgb(var(--accent))`, boxShadow: `0 8px 32px rgba(var(--accent), 0.4)` }}
        title="Plan a new trip"
      >
        +
      </Link>
    </div>
  );
};

export default MyTripsPage;
