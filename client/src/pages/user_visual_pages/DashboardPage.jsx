import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: (i = 0) => ({
    opacity: 1, y: 0,
    transition: { duration: 0.5, delay: i * 0.1, ease: 'easeOut' },
  }),
};

const quickActions = [
  { icon: '✨', label: 'Plan a Trip', desc: 'Generate AI itinerary', to: '/create-trip', color: 'from-primary-500/20 to-primary-600/10', border: 'border-primary-500/30', hover: 'hover:border-primary-500/60' },
  { icon: '🗺️', label: 'My Trips', desc: 'View your journeys', to: '/trips', color: 'from-slate-800 to-slate-800', border: 'border-slate-700', hover: 'hover:border-slate-500' },
  { icon: '🧑‍💼', label: 'Find a Guide', desc: 'Book local experts', to: '/guides', color: 'from-slate-800 to-slate-800', border: 'border-slate-700', hover: 'hover:border-slate-500' },
  { icon: '💬', label: 'AI Chat', desc: 'Ask anything', to: '/chatbot', color: 'from-slate-800 to-slate-800', border: 'border-slate-700', hover: 'hover:border-slate-500' },
  { icon: '🎬', label: 'Explore Videos', desc: 'Get inspired', to: '/explore', color: 'from-slate-800 to-slate-800', border: 'border-slate-700', hover: 'hover:border-slate-500' },
];

const getGreeting = () => {
  const h = new Date().getHours();
  if (h < 12) return 'Good morning';
  if (h < 17) return 'Good afternoon';
  return 'Good evening';
};

const statusColors = {
  upcoming: 'badge-primary',
  ongoing: 'badge-success',
  completed: 'badge-warning',
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

  const recentTrips = trips.slice(0, 3);

  return (
    <div className="min-h-screen bg-slate-950 p-4 md:p-8 lg:p-12 relative overflow-hidden">
        {/* Background Decorative Elements */}
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary-600/10 rounded-full blur-[120px] pointer-events-none" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-secondary-600/10 rounded-full blur-[120px] pointer-events-none" />

        <div className="max-w-[1600px] mx-auto space-y-12 relative z-10">
            {/* ─── Hero Command Center ─── */}
            <motion.div
                className="relative rounded-[48px] overflow-hidden border border-white/5 shadow-3xl group"
                initial="hidden" animate="visible" variants={fadeUp} custom={0}
            >
                <div className="absolute inset-0">
                    <img
                        src="https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=1600&q=85"
                        alt="Adventure awaits"
                        className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-r from-slate-950 via-slate-950/60 to-transparent" />
                </div>
                <div className="relative px-8 py-16 md:px-16 md:py-24 max-w-2xl">
                    <motion.div 
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.5 }}
                    >
                        {/* <div className="inline-flex items-center gap-2 bg-primary-500/15 border border-primary-500/30 rounded-full px-4 py-1.5 mb-6 text-xs font-black text-primary-300 backdrop-blur-md uppercase tracking-widest">
                            <span className="w-2 h-2 bg-primary-400 rounded-full animate-pulse shadow-glow-primary" />
                            Expedition Status: Active
                        </div> */}
                        <h1 className="text-4xl md:text-7xl font-display font-black text-white mb-6 leading-[0.9] tracking-tighter italic">
                            {getGreeting()}, <br />
                            <span className="gradient-text uppercase">{user?.name?.split(' ')[0]}</span>
                        </h1>
                        <p className="text-slate-400 text-lg md:text-xl font-medium mb-10 max-w-md leading-relaxed">
                            {trips.length === 0
                                ? "Your trip adventure atlas is empty. Let our AI synchronize your first destination."
                                : `You've established ${trips.length} trip${trips.length > 1 ? 's' : ''} buddy!!. Where shall we navigate next?`}
                        </p>
                        <div className="flex flex-wrap gap-4">
                            <Link to="/create-trip" className="btn-primary h-14 px-10 text-sm shadow-glow-primary hover:shadow-glow-secondary flex items-center gap-3">
                                <span>🚀</span> Generate New Trip
                            </Link>
                            <Link to="/explore" className="btn-secondary h-14 px-10 text-sm">
                                Explore Videos
                            </Link>
                        </div>
                    </motion.div>
                </div>
            </motion.div>

            
                {/* <motion.div
                    className="grid grid-cols-2 lg:grid-cols-4 gap-6"
                    initial="hidden" animate="visible" variants={fadeUp} custom={1}
                >
                    {[
                        { icon: '🗺️', label: 'Missions Launched', value: trips.length, trend: '+2 this month', color: 'from-primary-500/10' },
                        { icon: '🛬', label: 'Target Regions', value: [...new Set(trips.map(t => t.destination))].length, trend: 'Global coverage', color: 'from-secondary-500/10' },
                        { icon: '⚡', label: 'Engagement Days', value: trips.reduce((acc, t) => {
                            if (!t.startDate || !t.endDate) return acc;
                            return acc + Math.ceil((new Date(t.endDate) - new Date(t.startDate)) / (1000 * 60 * 60 * 24));
                        }, 0), trend: 'Active planning', color: 'from-accent-500/10' },
                        { icon: '💎', label: 'Resource Allocation', value: (trips.reduce((acc, t) => acc + (Number(t.budget) || 0), 0) / 1000).toFixed(1) + 'K', trend: 'In ' + (trips[0]?.currency || 'USD'), color: 'from-slate-400/10' },
                    ].map((s, i) => (
                        <div key={s.label} className={`glass-dark border border-white/5 rounded-[32px] p-8 relative overflow-hidden group hover:border-white/10 transition-all duration-500`}>
                            <div className={`absolute top-0 right-0 w-24 h-24 bg-gradient-to-br ${s.color} to-transparent rounded-full blur-2xl translate-x-8 translate-y-[-8px] opacity-0 group-hover:opacity-100 transition-opacity`} />
                            <div className="text-3xl mb-6 grayscale group-hover:grayscale-0 transition-all duration-500">{s.icon}</div>
                            <div className="text-4xl md:text-5xl font-display font-black text-white mb-2 tracking-tighter italic">{s.value || 0}</div>
                            <div className="space-y-1">
                                <p className="text-slate-500 text-[10px] font-black uppercase tracking-[0.2em]">{s.label}</p>
                                <p className="text-primary-400 text-[10px] font-bold tracking-tight">{s.trend}</p>
                            </div>
                        </div>
                    ))}
                </motion.div> */}

            
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-12">
                <motion.div 
                    className="xl:col-span-2 space-y-8"
                    initial="hidden" animate="visible" variants={fadeUp} custom={2}
                >
                    <div className="flex items-center justify-between">
                        <div>
                            <h2 className="text-2xl font-display font-black text-white tracking-tighter uppercase italic">Generated Trips!</h2>
                            <p className="text-slate-500 text-xs font-bold uppercase tracking-widest mt-1">Your latest AI-generated itineraries Trips</p>
                        </div>
                        {trips.length > 0 && (
                            <Link to="/trips" className="glass-dark border border-white/5 rounded-full px-6 py-2.5 text-[10px] font-black text-slate-400 hover:text-white transition-all uppercase tracking-widest">
                                Expand Archive →
                            </Link>
                        )}
                    </div>

                    {loading ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            {[1, 2].map((i) => (
                                <div key={i} className="h-[400px] glass-dark rounded-[40px] shimmer" />
                            ))}
                        </div>
                    ) : trips.length === 0 ? (
                        <div className="glass-dark border border-white/5 rounded-[40px] p-20 text-center flex flex-col items-center justify-center">
                            <div className="w-24 h-24 bg-white/5 rounded-full flex items-center justify-center text-5xl mb-8 grayscale opacity-50">🛰️</div>
                            <h3 className="text-2xl font-display font-black text-white mb-2 tracking-tighter uppercase">No Recon Data Found</h3>
                            <p className="text-slate-500 font-medium mb-10 max-w-sm">Establish your first expedition coordinates to begin tracking mission data.</p>
                            <Link to="/create-trip" className="btn-primary h-14 px-10 text-sm shadow-glow-primary">
                                Launch Initial Mission
                            </Link>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            {recentTrips.map((trip) => (
                                <Link
                                    key={trip._id}
                                    to={`/trips/${trip._id}`}
                                    className="group relative rounded-[40px] overflow-hidden border border-white/5 bg-slate-900 shadow-2xl transition-all duration-500 hover:-translate-y-2"
                                >
                                    <div className="h-56 relative overflow-hidden">
                                        <img
                                            src={trip.images?.destination?.[0] || 'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?w=800&q=80'}
                                            alt={trip.destination}
                                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000"
                                        />
                                        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/20 to-transparent" />
                                        <div className="absolute top-6 left-6">
                                            <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest backdrop-blur-md border border-white/10 ${
                                                trip.status === 'upcoming' ? 'bg-primary-500/20 text-primary-400' :
                                                trip.status === 'ongoing' ? 'bg-secondary-500/20 text-secondary-400 shadow-glow-secondary' :
                                                'bg-slate-500/20 text-slate-400'
                                            }`}>
                                                {trip.status}
                                            </span>
                                        </div>
                                    </div>
                                    <div className="p-8">
                                        <div className="flex justify-between items-start mb-4">
                                            <div>
                                                <h3 className="text-2xl font-display font-black text-white tracking-tighter uppercase group-hover:text-primary-400 transition-colors italic">
                                                    {trip.destination}
                                                </h3 >
                                                <p className="text-slate-500 text-[10px] font-black uppercase tracking-widest mt-1">Origin: {trip.source}</p>
                                            </div>
                                            <div className="text-right">
                                                <p className="text-white font-black text-xl tracking-tighter italic">{trip.budget}</p>
                                                <p className="text-[10px] font-black text-primary-500 uppercase tracking-widest">{trip.currency}</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-4 text-slate-500 text-[10px] font-black uppercase tracking-widest border-t border-white/5 pt-6">
                                            <span className="flex items-center gap-1.5">📅 {new Date(trip.startDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
                                            <div className="w-1 h-1 bg-white/20 rounded-full" />
                                            <span className="flex items-center gap-1.5">🗺️ {trip.accommodationType}</span>
                                        </div>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    )}
                </motion.div>

                
                <motion.div 
                    className="space-y-12"
                    initial="hidden" animate="visible" variants={fadeUp} custom={3}
                >
                    <div>
                        <h2 className="text-xl font-display font-black text-white tracking-tighter uppercase italic mb-6">Quick Linkage</h2>
                        <div className="space-y-3">
                            {quickActions.map((a) => (
                                <Link
                                    key={a.label}
                                    to={a.to}
                                    className="flex items-center gap-4 p-5 glass-dark border border-white/5 rounded-[28px] group hover:bg-white/5 hover:border-white/10 transition-all duration-300"
                                >
                                    <div className="w-12 h-12 bg-white/5 rounded-2xl flex items-center justify-center text-2xl group-hover:scale-110 group-hover:rotate-3 transition-transform duration-300">
                                        {a.icon}
                                    </div>
                                    <div className="flex-1">
                                        <p className="text-xs font-black text-white uppercase tracking-widest leading-none mb-1">{a.label}</p>
                                        <p className="text-[10px] font-bold text-slate-500 uppercase tracking-tight">{a.desc}</p>
                                    </div>
                                    <div className="text-slate-700 group-hover:text-primary-400 transition-colors">→</div>
                                </Link>
                            ))}
                        </div>
                    </div>

                    {/* Subscription Status Card */}
                    {(() => {
                        const plan = user?.subscription || 'FREE';
                        const count = user?.monthlyTripCount ?? 0;
                        const expiry = user?.subscriptionEndDate;
                        const planColors = {
                            FREE: 'text-slate-400 border-slate-700 bg-slate-800/50',
                            PRO: 'text-primary-400 border-primary-500/30 bg-primary-500/10',
                            PREMIUM: 'text-amber-400 border-amber-500/30 bg-amber-500/10',
                        };
                        return (
                            <div className="glass-dark border border-white/5 rounded-[28px] p-7 space-y-5">
                                <div className="flex items-center justify-between">
                                    <h2 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em]">Subscription</h2>
                                    <span className={`text-[9px] font-black uppercase tracking-[0.2em] px-3 py-1 border ${planColors[plan]}`}>
                                        {plan}
                                    </span>
                                </div>

                                {plan === 'FREE' && (
                                    <div className="space-y-2">
                                        <div className="flex justify-between text-[9px] font-black uppercase tracking-widest text-slate-600">
                                            <span>Trips Used</span>
                                            <span className="text-white">{count} / 3</span>
                                        </div>
                                        <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                                            <div
                                                className={`h-full rounded-full transition-all duration-500 ${count >= 3 ? 'bg-red-500' : 'bg-primary-500'}`}
                                                style={{ width: `${Math.min((count / 3) * 100, 100)}%` }}
                                            />
                                        </div>
                                        {count >= 3 && (
                                            <p className="text-red-400 text-[9px] font-black uppercase tracking-widest">Monthly limit reached</p>
                                        )}
                                    </div>
                                )}

                                {expiry && plan !== 'FREE' && (
                                    <div className="text-[9px] font-bold uppercase tracking-widest text-slate-600">
                                        Expires: <span className="text-slate-400">{new Date(expiry).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                                    </div>
                                )}

                                {plan === 'FREE' && (
                                    <Link
                                        to="/pricing"
                                        className="block w-full h-10 bg-primary-500 text-white font-black text-[9px] uppercase tracking-widest hover:bg-primary-400 transition-all text-center leading-10">
                                        Upgrade Plan →
                                    </Link>
                                )}
                                {plan !== 'FREE' && (
                                    <Link
                                        to="/pricing"
                                        className="block text-center text-[9px] font-black uppercase tracking-widest text-slate-600 hover:text-white transition-colors">
                                        Manage Plan →
                                    </Link>
                                )}
                            </div>
                        );
                    })()}
                </motion.div>


            </div>
        </div>

        {/* Global Floating FAB */}
        <Link 
            to="/create-trip" 
            className="fixed bottom-10 right-10 w-16 h-16 bg-gradient-to-br from-primary-500 to-secondary-600 rounded-[24px] flex items-center justify-center text-3xl text-white shadow-glow-primary hover:shadow-glow-secondary hover:-translate-y-2 active:scale-95 transition-all duration-500 z-50 group"
            title="Plan a new trip"
        >
            <span className="group-hover:rotate-90 transition-transform duration-500">+</span>
        </Link>
    </div>
  );
};

export default DashboardPage;
