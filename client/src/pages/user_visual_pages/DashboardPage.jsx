import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: (i = 0) => ({
    opacity: 1, y: 0,
    transition: { duration: 0.45, delay: i * 0.08, ease: 'easeOut' },
  }),
};

const quickActions = [
  { icon: '✈️', label: 'Plan a Trip',     desc: 'Generate AI itinerary',   to: '/create-trip' },
  { icon: '🗺️',  label: 'My Trips',       desc: 'View your past journeys',  to: '/trips' },
  { icon: '🧑‍💼', label: 'Find a Guide',   desc: 'Book local travel expert', to: '/guides' },
  { icon: '💬',  label: 'AI Travel Chat', desc: 'Ask anything about travel',to: '/chatbot' },
  { icon: '🎬',  label: 'Explore Videos', desc: 'Get inspired for your trip',to: '/explore' },
];

const getGreeting = () => {
  const h = new Date().getHours();
  if (h < 12) return 'Good morning';
  if (h < 17) return 'Good afternoon';
  return 'Good evening';
};

const statusLabel = { upcoming: 'Upcoming', ongoing: 'Ongoing', completed: 'Completed' };
const statusStyle = {
  upcoming: 'bg-sky-500/15 text-sky-400 border-sky-500/25',
  ongoing:  'bg-emerald-500/15 text-emerald-400 border-emerald-500/25',
  completed:'bg-slate-500/15 text-slate-400 border-slate-500/25',
};

const DashboardPage = () => {
  const { user } = useAuth();
  const [trips, setTrips] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/trips')
      .then(({ data }) => setTrips(data.trips || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const recentTrips = trips.slice(0, 4);
  const plan = user?.subscription || 'FREE';

  return (
    <div
      className="min-h-screen p-4 md:p-8 relative overflow-hidden"
      style={{ background: 'var(--bg-primary)' }}
    >
      {/* Decorative background blobs */}
      <div
        className="absolute top-0 right-0 w-96 h-96 rounded-full blur-[120px] pointer-events-none opacity-30"
        style={{ background: `rgba(var(--accent), 0.12)` }}
      />

      <div className="max-w-7xl mx-auto space-y-8 relative z-10">

        {/* ─── Hero Banner ─── */}
        <motion.div
          initial="hidden" animate="visible" variants={fadeUp} custom={0}
          className="relative rounded-2xl overflow-hidden"
          style={{ minHeight: 260 }}
        >
          <img
            src="https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=1400&q=80"
            alt="Beautiful travel destination"
            className="absolute inset-0 w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-slate-950/90 via-slate-950/60 to-transparent" />
          <div className="relative px-6 py-10 md:px-12 md:py-14 max-w-xl">
            <p className="text-sm font-medium mb-2" style={{ color: 'rgba(var(--accent),1)' }}>
              {getGreeting()} 👋
            </p>
            <h1 className="text-3xl md:text-5xl font-black text-white mb-3 leading-tight">
              Welcome back,<br />
              <span className="gradient-text">{user?.name?.split(' ')[0]}</span>
            </h1>
            <p className="text-slate-300 text-sm md:text-base mb-6 leading-relaxed">
              {trips.length === 0
                ? 'Ready for your next adventure? Let AI plan the perfect trip for you.'
                : `You have ${trips.length} trip${trips.length > 1 ? 's' : ''} planned. Where are we going next?`}
            </p>
            <div className="flex flex-wrap gap-3">
              <Link to="/create-trip" className="btn-primary h-11 px-6">
                ✈ Plan a New Trip
              </Link>
              <Link to="/explore" className="btn-secondary h-11 px-6">
                Explore Destinations
              </Link>
            </div>
          </div>
        </motion.div>

        {/* ─── Stats Row ─── */}
        <motion.div
          initial="hidden" animate="visible" variants={fadeUp} custom={1}
          className="grid grid-cols-2 sm:grid-cols-4 gap-4"
        >
          {[
            { icon: '🗺️', label: 'Total Trips',      value: user?.travelStats?.totalTrips ?? trips.length },
            { icon: '🏙️', label: 'Cities Visited',    value: user?.travelStats?.citiesVisited ?? 0 },
            { icon: '📅', label: 'Travel Days',       value: user?.travelStats?.totalDays ?? 0 },
            { icon: '💳', label: 'Plan',              value: plan },
          ].map((stat) => (
            <div
              key={stat.label}
              className="card flex flex-col items-center justify-center text-center py-5 gap-1"
            >
              <span className="text-2xl mb-1">{stat.icon}</span>
              <span className="text-2xl font-black" style={{ color: 'var(--text-primary)' }}>
                {stat.value}
              </span>
              <span className="text-xs font-medium" style={{ color: 'var(--text-muted)' }}>
                {stat.label}
              </span>
            </div>
          ))}
        </motion.div>

        {/* ─── Main Content Grid ─── */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">

          {/* Recent Trips */}
          <motion.div
            className="xl:col-span-2 space-y-5"
            initial="hidden" animate="visible" variants={fadeUp} custom={2}
          >
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold" style={{ color: 'var(--text-primary)' }}>
                Recent Trips
              </h2>
              {trips.length > 0 && (
                <Link
                  to="/trips"
                  className="text-sm font-medium transition-colors"
                  style={{ color: `rgb(var(--accent))` }}
                >
                  View All →
                </Link>
              )}
            </div>

            {loading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {[1, 2].map((i) => (
                  <div key={i} className="h-56 rounded-2xl shimmer" />
                ))}
              </div>
            ) : recentTrips.length === 0 ? (
              <div
                className="card flex flex-col items-center justify-center text-center py-16 gap-4"
              >
                <div className="text-5xl">🌍</div>
                <div>
                  <h3 className="text-lg font-bold mb-1" style={{ color: 'var(--text-primary)' }}>
                    No trips yet
                  </h3>
                  <p className="text-sm mb-5" style={{ color: 'var(--text-secondary)' }}>
                    Create your first AI-planned trip in seconds
                  </p>
                </div>
                <Link to="/create-trip" className="btn-primary h-11 px-8">
                  Plan Your First Trip
                </Link>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {recentTrips.map((trip) => (
                  <Link
                    key={trip._id}
                    to={`/trips/${trip._id}`}
                    className="group relative rounded-2xl overflow-hidden transition-all duration-300 hover:-translate-y-1"
                    style={{
                      border: '1px solid var(--border)',
                      background: 'var(--bg-card)',
                    }}
                  >
                    <div className="h-40 relative overflow-hidden">
                      <img
                        src={trip.images?.destination?.[0] || `https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=600&q=80`}
                        alt={trip.destination}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 to-transparent" />
                      <span
                        className={`absolute top-2 left-2 badge text-xs border ${statusStyle[trip.status] || statusStyle.upcoming}`}
                      >
                        {statusLabel[trip.status] || 'Upcoming'}
                      </span>
                    </div>
                    <div className="p-4">
                      <h3
                        className="font-bold text-base mb-0.5 group-hover:opacity-80 transition-colors"
                        style={{ color: 'var(--text-primary)' }}
                      >
                        {trip.destination}
                      </h3>
                      <p className="text-xs mb-2" style={{ color: 'var(--text-secondary)' }}>
                        From {trip.source}
                      </p>
                      <div
                        className="flex items-center gap-3 text-xs pt-2"
                        style={{ color: 'var(--text-muted)', borderTop: '1px solid var(--border)' }}
                      >
                        <span>📅 {new Date(trip.startDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
                        <span>·</span>
                        <span>💰 {trip.budget} {trip.currency}</span>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </motion.div>

          {/* Quick Actions */}
          <motion.div
            className="space-y-5"
            initial="hidden" animate="visible" variants={fadeUp} custom={3}
          >
            <h2 className="text-xl font-bold" style={{ color: 'var(--text-primary)' }}>
              Quick Actions
            </h2>
            <div className="space-y-2">
              {quickActions.map((action) => (
                <Link
                  key={action.label}
                  to={action.to}
                  className="flex items-center gap-4 p-4 rounded-xl transition-all duration-200 group"
                  style={{
                    border: '1px solid var(--border)',
                    background: 'var(--bg-card)',
                  }}
                  onMouseEnter={e => {
                    e.currentTarget.style.borderColor = `rgba(var(--accent), 0.4)`;
                    e.currentTarget.style.background = 'var(--bg-hover)';
                  }}
                  onMouseLeave={e => {
                    e.currentTarget.style.borderColor = 'var(--border)';
                    e.currentTarget.style.background = 'var(--bg-card)';
                  }}
                >
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center text-xl shrink-0 group-hover:scale-110 transition-transform duration-200"
                    style={{ background: 'var(--bg-hover)' }}
                  >
                    {action.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>
                      {action.label}
                    </p>
                    <p className="text-xs truncate" style={{ color: 'var(--text-muted)' }}>
                      {action.desc}
                    </p>
                  </div>
                  <svg
                    className="w-4 h-4 opacity-30 group-hover:opacity-70 group-hover:translate-x-0.5 transition-all"
                    style={{ color: 'var(--text-primary)' }}
                    fill="none" stroke="currentColor" viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </Link>
              ))}
            </div>

            {/* Subscription nudge for FREE users */}
            {plan === 'FREE' && (
              <div
                className="card p-4 space-y-3"
                style={{ border: `1px solid rgba(var(--accent), 0.2)`, background: `rgba(var(--accent), 0.04)` }}
              >
                <div className="flex items-center gap-2">
                  <span className="text-xl">🚀</span>
                  <div>
                    <p className="text-sm font-bold" style={{ color: 'var(--text-primary)' }}>Upgrade to Pro</p>
                    <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                      {user?.monthlyTripCount ?? 0}/3 trips used this month
                    </p>
                  </div>
                </div>
                <div
                  className="h-1.5 rounded-full overflow-hidden"
                  style={{ background: 'var(--bg-hover)' }}
                >
                  <div
                    className="h-full rounded-full transition-all"
                    style={{
                      width: `${Math.min(((user?.monthlyTripCount ?? 0) / 3) * 100, 100)}%`,
                      background: (user?.monthlyTripCount ?? 0) >= 3 ? '#ef4444' : `rgb(var(--accent))`,
                    }}
                  />
                </div>
                <Link to="/pricing" className="btn-primary w-full h-10 text-sm">
                  View Plans →
                </Link>
              </div>
            )}
          </motion.div>
        </div>
      </div>

      {/* FAB */}
      <Link
        to="/create-trip"
        className="fixed bottom-6 right-6 w-14 h-14 rounded-2xl flex items-center justify-center text-2xl text-white shadow-2xl hover:-translate-y-1 active:scale-95 transition-all duration-200 z-50 md:hidden"
        style={{ background: `rgb(var(--accent))`, boxShadow: `0 8px 32px rgba(var(--accent), 0.4)` }}
        title="Plan a new trip"
      >
        +
      </Link>
    </div>
  );
};

export default DashboardPage;
