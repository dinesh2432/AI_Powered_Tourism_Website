import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import api from '../../services/api';
import toast from 'react-hot-toast';

const MyTripsPage = () => {
  const [trips, setTrips] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    api.get('/trips')
      .then(({ data }) => setTrips(data.trips || []))
      .catch(() => toast.error('Failed to load trips'))
      .finally(() => setLoading(false));
  }, []);

  const filtered = filter === 'all' ? trips : trips.filter(t => t.status === filter);

  const counts = {
    all: trips.length,
    upcoming: trips.filter(t => t.status === 'upcoming').length,
    ongoing: trips.filter(t => t.status === 'ongoing').length,
    completed: trips.filter(t => t.status === 'completed').length,
  };

  return (
    <div
      className="min-h-screen pb-20 relative overflow-hidden"
      style={{ background: 'var(--bg-primary)', fontFamily: "'Inter', 'Outfit', sans-serif" }}
    >
      {/* Hero Section */}
      <div className="relative h-[45vh] min-h-[340px] overflow-hidden">
        <motion.img
          initial={{ scale: 1.08, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 1.5 }}
          src="https://images.unsplash.com/photo-1488085061387-422e29b40080?w=1600&q=85"
          alt="My Trips"
          className="w-full h-full object-cover"
          style={{ opacity: 0.35 }}
        />
        {/* Gradient overlay using theme-aware colors */}
        <div
          className="absolute inset-0"
          style={{
            background: 'linear-gradient(to bottom, var(--bg-primary) 0%, transparent 40%, var(--bg-primary) 100%)',
          }}
        />
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="max-w-7xl mx-auto w-full px-4 md:px-12 text-center">
            <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
              <h1
                className="text-6xl md:text-8xl font-black mb-6 tracking-tight leading-none"
                style={{ color: 'var(--text-primary)' }}
              >
                My Trips
              </h1>
              <div
                className="flex justify-center gap-10 text-xs font-semibold uppercase tracking-widest"
                style={{ color: 'var(--text-muted)' }}
              >
                <div className="flex flex-col items-center gap-1">
                  <span className="text-2xl font-black" style={{ color: 'var(--text-primary)' }}>
                    {trips.length}
                  </span>
                  <span>Total</span>
                </div>
                <div className="w-px h-10" style={{ background: 'var(--border-strong)' }} />
                <div className="flex flex-col items-center gap-1">
                  <span className="text-2xl font-black" style={{ color: 'var(--text-primary)' }}>
                    {counts.ongoing}
                  </span>
                  <span>Active</span>
                </div>
                <div className="w-px h-10" style={{ background: 'var(--border-strong)' }} />
                <div className="flex flex-col items-center gap-1">
                  <span className="text-2xl font-black" style={{ color: 'var(--text-primary)' }}>
                    {counts.completed}
                  </span>
                  <span>Completed</span>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 md:px-8 lg:px-12 -mt-10 relative z-10">

        {/* Filter Tabs */}
        <div className="flex flex-wrap gap-2 mb-10">
          {['all', 'upcoming', 'ongoing', 'completed'].map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className="px-6 h-11 rounded-xl text-xs font-bold uppercase tracking-wider transition-all duration-300"
              style={
                filter === f
                  ? {
                      background: `rgb(var(--accent))`,
                      color: '#ffffff',
                      border: `1px solid rgba(var(--accent), 0.4)`,
                      boxShadow: `0 4px 16px rgba(var(--accent), 0.3)`,
                    }
                  : {
                      background: 'var(--bg-card)',
                      color: 'var(--text-secondary)',
                      border: '1px solid var(--border)',
                    }
              }
              onMouseEnter={e => {
                if (filter !== f) e.currentTarget.style.borderColor = `rgba(var(--accent), 0.4)`;
              }}
              onMouseLeave={e => {
                if (filter !== f) e.currentTarget.style.borderColor = 'var(--border)';
              }}
            >
              {f} <span className="ml-2 opacity-60">{counts[f]}</span>
            </button>
          ))}
        </div>

        {/* Trip Grid */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-80 rounded-2xl shimmer" />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div
            className="card p-20 text-center max-w-2xl mx-auto"
            style={{ border: '1px solid var(--border)' }}
          >
            <div className="text-5xl mb-8 opacity-30">🗺️</div>
            <h3 className="text-3xl font-black mb-4" style={{ color: 'var(--text-primary)' }}>
              No trips yet
            </h3>
            <p className="text-sm mb-10" style={{ color: 'var(--text-secondary)' }}>
              {filter === 'all'
                ? 'Start your journey — create your first AI-planned trip.'
                : `No ${filter} trips found.`}
            </p>
            <Link to="/create-trip" className="btn-primary h-12 px-10">
              Plan a New Trip →
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filtered.map((trip, i) => {
              const days = trip.startDate && trip.endDate
                ? Math.ceil((new Date(trip.endDate) - new Date(trip.startDate)) / (1000 * 60 * 60 * 24))
                : 0;

              const statusColors = {
                upcoming: { bg: 'rgba(14, 165, 233, 0.15)', text: 'rgb(56, 189, 248)', border: 'rgba(14, 165, 233, 0.3)' },
                ongoing:  { bg: 'rgba(16, 185, 129, 0.15)', text: 'rgb(52, 211, 153)', border: 'rgba(16, 185, 129, 0.3)' },
                completed:{ bg: 'rgba(148, 163, 184, 0.12)', text: 'rgb(148, 163, 184)', border: 'rgba(148, 163, 184, 0.25)' },
              };
              const sc = statusColors[trip.status] || statusColors.upcoming;

              return (
                <motion.div
                  key={trip._id}
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.06, duration: 0.4 }}
                >
                  <Link
                    to={`/trips/${trip._id}`}
                    className="group relative block rounded-2xl overflow-hidden transition-all duration-300 hover:-translate-y-1"
                    style={{ border: '1px solid var(--border)', background: 'var(--bg-card)' }}
                    onMouseEnter={e => {
                      e.currentTarget.style.borderColor = `rgba(var(--accent), 0.4)`;
                      e.currentTarget.style.boxShadow = `0 8px 32px rgba(var(--accent), 0.12)`;
                    }}
                    onMouseLeave={e => {
                      e.currentTarget.style.borderColor = 'var(--border)';
                      e.currentTarget.style.boxShadow = 'none';
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

                      {/* ID chip */}
                      <span
                        className="absolute top-3 right-3 text-[10px] font-mono px-2 py-1 rounded"
                        style={{ background: 'rgba(0,0,0,0.5)', color: 'rgba(255,255,255,0.5)' }}
                      >
                        #{trip._id.slice(-6)}
                      </span>
                    </div>

                    {/* Info */}
                    <div className="p-5">
                      <h3
                        className="text-xl font-black mb-1 tracking-tight group-hover:opacity-80 transition-opacity"
                        style={{ color: 'var(--text-primary)' }}
                      >
                        {trip.destination}
                      </h3>
                      <p className="text-sm mb-4" style={{ color: 'var(--text-secondary)' }}>
                        From {trip.source}
                        {days > 0 && ` · ${days} day${days !== 1 ? 's' : ''}`}
                      </p>

                      <div
                        className="flex items-end justify-between pt-4"
                        style={{ borderTop: '1px solid var(--border)' }}
                      >
                        <div>
                          <p className="text-[10px] font-semibold uppercase tracking-wider mb-0.5"
                            style={{ color: 'var(--text-muted)' }}>
                            Budget
                          </p>
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
          </div>
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
