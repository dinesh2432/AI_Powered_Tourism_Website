import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import api from '../services/api';
import toast from 'react-hot-toast';

const statusConfig = {
  upcoming: { label: 'Upcoming', cls: 'badge-primary' },
  ongoing: { label: 'Ongoing', cls: 'badge-success' },
  completed: { label: 'Completed', cls: 'badge-warning' },
};

const MyTripsPage = () => {
  const [trips, setTrips] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    api.get('/trips')
      .then(({ data }) => setTrips(data.trips || []))
      .catch(() => toast.error('Uplink Failure'))
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
    <div className="min-h-screen bg-slate-950 pb-20 relative overflow-hidden grid-bg">
        {/* Hero Section */}
        <div className="relative h-[45vh] min-h-[400px] overflow-hidden">
            <motion.img
                initial={{ scale: 1.1, opacity: 0.5 }}
                animate={{ scale: 1, opacity: 0.3 }}
                transition={{ duration: 2 }}
                src="https://images.unsplash.com/photo-1488085061387-422e29b40080?w=1600&q=85"
                alt="Archive"
                className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-b from-slate-950 via-slate-950/20 to-slate-950" />
            <div className="absolute inset-0 flex items-center justify-center">
                <div className="max-w-7xl mx-auto w-full px-4 md:px-12 lg:px-24 text-center">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                    >
                        <div className="inline-flex items-center gap-3 px-6 py-2 border border-white/10 bg-white/5 backdrop-blur-md mb-10">
                            <div className="w-1.5 h-1.5 bg-primary-500 animate-pulse" />
                            <span className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-400">Mission Archive // Central Command</span>
                        </div>
                        <h1 className="text-7xl md:text-9xl font-black text-white mb-8 tracking-tighter uppercase italic leading-[0.8] mix-blend-difference">
                            OPERATIONS<span className="text-primary-500">.</span>
                        </h1>
                        <div className="flex justify-center gap-12 text-slate-500 font-black uppercase tracking-[0.4em] text-[10px]">
                            <div className="flex flex-col gap-2">
                                <span className="text-white text-lg leading-none">{trips.length}</span>
                                <span>Total Files</span>
                            </div>
                            <div className="w-px h-10 bg-white/10" />
                            <div className="flex flex-col gap-2">
                                <span className="text-white text-lg leading-none">{counts.ongoing}</span>
                                <span>Active Signals</span>
                            </div>
                        </div>
                    </motion.div>
                </div>
            </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 md:px-12 lg:px-24 -mt-16 relative z-10">
            {/* Filters */}
            <div className="flex flex-wrap gap-2 mb-16">
                {['all', 'upcoming', 'ongoing', 'completed'].map(f => (
                    <button
                        key={f}
                        onClick={() => setFilter(f)}
                        className={`px-10 h-16 transition-all duration-500 border ${
                            filter === f
                                ? 'bg-white text-slate-950 border-white shadow-glow-primary font-black uppercase tracking-[0.2em] text-[10px]'
                                : 'bg-white/5 border-white/5 text-slate-600 hover:text-white hover:border-white/10 font-black uppercase tracking-[0.2em] text-[10px]'
                        }`}
                    >
                        {f} <span className="ml-4 opacity-40">[{counts[f]}]</span>
                    </button>
                ))}
            </div>

            {loading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-0">
                    {[...Array(6)].map((_, i) => (
                        <div key={i} className="h-96 border border-white/5 bg-white/5 animate-pulse" />
                    ))}
                </div>
            ) : filtered.length === 0 ? (
                <div className="card p-24 text-center max-w-4xl mx-auto">
                    <div className="text-6xl mb-10 opacity-20">📡</div>
                    <h3 className="text-4xl font-black text-white mb-6 uppercase italic tracking-tighter">Zero Telemetry.</h3>
                    <p className="text-slate-500 font-bold mb-12 uppercase tracking-tight text-xs max-w-sm mx-auto">
                        Your global operations archive is empty. Initialize a new mission protocol to begin synchronization.
                    </p>
                    <Link to="/create-trip" className="btn-primary h-16 px-12 group">
                        INITIALIZE NEW MISSION <span className="ml-4 group-hover:translate-x-2 transition-transform">→</span>
                    </Link>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-0 border-t border-l border-white/5">
                    {filtered.map((trip, i) => {
                        const days = trip.startDate && trip.endDate
                            ? Math.ceil((new Date(trip.endDate) - new Date(trip.startDate)) / (1000 * 60 * 60 * 24))
                            : 0;

                        return (
                            <motion.div
                                key={trip._id}
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ delay: i * 0.05 }}
                            >
                                <Link to={`/trips/${trip._id}`} className="group relative block aspect-[4/5] border-r border-b border-white/5 overflow-hidden transition-all duration-700 hover:bg-white/5">
                                    <div className="absolute inset-0 opacity-40 grayscale group-hover:grayscale-0 group-hover:opacity-100 group-hover:scale-105 transition-all duration-1000">
                                        <img
                                            src={trip.images?.destination?.[0] || 'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?w=800&q=80'}
                                            alt={trip.destination}
                                            className="w-full h-full object-cover"
                                        />
                                    </div>
                                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/20 to-transparent" />
                                    
                                    <div className="absolute inset-0 p-10 flex flex-col justify-between">
                                        <div className="flex justify-between items-start">
                                            <div className="px-4 py-1.5 glass-dark border border-white/10 text-[9px] font-black uppercase tracking-[0.2em]">
                                                {trip.status}
                                            </div>
                                            <div className="text-white/40 font-black text-[10px] uppercase tracking-widest">
                                                ID: {trip._id.slice(-8)}
                                            </div>
                                        </div>

                                        <div className="space-y-6">
                                            <div>
                                                <h3 className="text-4xl font-black text-white tracking-tighter uppercase italic leading-none mb-4 group-hover:text-primary-500 transition-colors">
                                                    {trip.destination}
                                                </h3>
                                                <div className="flex items-center gap-6 text-slate-400 text-[10px] font-black uppercase tracking-[0.3em]">
                                                    <span>Origin: {trip.source}</span>
                                                    <span className="w-1 h-1 bg-white/20" />
                                                    <span>{days} CYCLES</span>
                                                </div>
                                            </div>

                                            <div className="pt-6 border-t border-white/10 flex items-end justify-between">
                                                <div className="space-y-1">
                                                    <div className="text-[9px] font-black text-slate-600 uppercase tracking-widest">AUTHORIZED ASSETS</div>
                                                    <div className="text-white font-black text-xl italic tracking-tighter">{trip.budget} <span className="text-primary-500">{trip.currency}</span></div>
                                                </div>
                                                <div className="w-12 h-12 bg-white text-slate-950 flex items-center justify-center font-black group-hover:bg-primary-500 group-hover:text-white transition-all duration-500">
                                                    →
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Technical Decor Overlay */}
                                    <div className="absolute top-0 right-0 w-32 h-32 opacity-0 group-hover:opacity-10 transition-opacity pointer-events-none">
                                        <div className="absolute inset-0 border-t-2 border-r-2 border-white" />
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
            className="fixed bottom-12 right-12 w-20 h-20 bg-white text-slate-950 flex items-center justify-center text-4xl shadow-glow-primary hover:bg-primary-500 hover:text-white transition-all duration-500 z-50 group"
        >
            <span className="group-hover:rotate-180 transition-transform duration-700 font-light">+</span>
        </Link>
    </div>
  );
};

export default MyTripsPage;
