import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../../services/api';
import { motion } from 'framer-motion';

const SharedTripPage = () => {
  const { token } = useParams();
  const [trip, setTrip] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    api
      .get(`/trips/shared/${token}`)
      .then(({ data }) => setTrip(data.trip))
      .catch(() => setError('This share link is invalid or has been revoked.'))
      .finally(() => setLoading(false));
  }, [token]);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl animate-spin mb-4">✈️</div>
          <p className="text-slate-400 font-black text-xs uppercase tracking-widest">Loading Mission Data...</p>
        </div>
      </div>
    );
  }

  if (error || !trip) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="text-center max-w-md">
          <div className="text-6xl mb-8">🔒</div>
          <h1 className="text-3xl font-black text-white uppercase tracking-tighter italic mb-4">Link Expired</h1>
          <p className="text-slate-400 text-sm font-bold uppercase tracking-widest mb-8">{error}</p>
          <Link to="/" className="btn-primary px-10 h-14 inline-flex items-center justify-center">
            Go Home
          </Link>
        </div>
      </div>
    );
  }

  const ai = trip.aiResponse || {};
  const days = Math.ceil((new Date(trip.endDate) - new Date(trip.startDate)) / 86400000);

  return (
    <div className="min-h-screen bg-slate-950 pb-20">
      {/* Minimal top bar */}
      <div className="border-b border-white/5 px-8 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-2 h-2 rounded-full bg-primary-500 animate-pulse" />
          <span className="text-white font-black text-xs uppercase tracking-[0.3em]">AI Tourism — Shared Mission</span>
        </div>
        <Link
          to="/login"
          className="text-[9px] font-black text-slate-500 uppercase tracking-widest hover:text-white transition-colors"
        >
          Sign in to collaborate →
        </Link>
      </div>

      {/* Hero */}
      {trip.images?.destination?.[0] && (
        <div className="relative h-[45vh] overflow-hidden">
          <img src={trip.images.destination[0]} alt={trip.destination} className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent" />
        </div>
      )}

      <div className="max-w-5xl mx-auto px-6 md:px-12 pt-12 space-y-16">
        {/* Title */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <div className="text-[9px] font-black text-primary-500 uppercase tracking-[0.4em] mb-4">
            Shared Mission Dossier
          </div>
          <h1 className="text-6xl md:text-8xl font-black text-white tracking-tighter uppercase italic leading-none mb-6">
            {trip.destination}<span className="text-primary-500">.</span>
          </h1>
          <div className="flex flex-wrap gap-8 text-slate-500 font-black uppercase tracking-[0.3em] text-[10px]">
            <span>🛫 {trip.source}</span>
            <span>⏳ {days} Days</span>
            <span>👥 {trip.members} Members</span>
            <span>💰 {trip.budget} {trip.currency}</span>
            <span className="text-white bg-white/10 px-3 py-1">{trip.accommodationType}</span>
          </div>
        </motion.div>

        {/* Owner */}
        {trip.userId && (
          <div className="flex items-center gap-4 p-6 border border-white/5 bg-white/2">
            {trip.userId.profileImage ? (
              <img src={trip.userId.profileImage} alt={trip.userId.name} className="w-12 h-12 rounded-full object-cover border border-white/10" />
            ) : (
              <div className="w-12 h-12 rounded-full bg-primary-500/20 flex items-center justify-center text-primary-400 font-black text-lg">
                {trip.userId.name?.[0]}
              </div>
            )}
            <div>
              <div className="text-[8px] font-black text-slate-600 uppercase tracking-[0.3em]">Shared by</div>
              <div className="text-white font-black text-sm uppercase tracking-tight">{trip.userId.name}</div>
            </div>
          </div>
        )}

        {/* Overview */}
        {ai.overview && (
          <div className="card p-10">
            <div className="text-[9px] font-black text-primary-500 uppercase tracking-[0.4em] mb-6">Overview</div>
            <p className="text-slate-400 text-lg font-bold leading-relaxed italic border-l-2 border-primary-500/30 pl-8 uppercase tracking-wide">
              "{ai.overview}"
            </p>
          </div>
        )}

        {/* Daily Itinerary */}
        {ai.daily_itinerary?.length > 0 && (
          <div className="space-y-12">
            <div className="text-[9px] font-black text-primary-500 uppercase tracking-[0.4em]">Daily Itinerary</div>
            {ai.daily_itinerary.map((day) => (
              <div key={day.day} className="flex flex-col md:flex-row gap-8">
                <div className="md:w-28 flex-shrink-0">
                  <div className="inline-block bg-white text-slate-950 font-black px-5 py-2 italic text-lg tracking-tighter shadow-glow-primary">
                    D-{String(day.day).padStart(2, '0')}
                  </div>
                </div>
                <div className="flex-1 space-y-8">
                  <h3 className="text-2xl font-black text-white tracking-tighter uppercase italic">{day.title}</h3>
                  {(day.activities || []).map((act, i) => (
                    <div key={i} className="card p-8 flex gap-6">
                      <span className="text-primary-500 text-[10px] font-black uppercase tracking-widest min-w-[70px]">{act.time}</span>
                      <div>
                        <div className="text-white font-black text-lg tracking-tighter uppercase italic mb-2">{act.activity}</div>
                        <p className="text-slate-500 text-xs font-bold leading-relaxed uppercase tracking-tight">{act.description}</p>
                        {act.location && <div className="text-slate-600 text-[9px] font-black uppercase tracking-[0.2em] mt-4">📍 {act.location}</div>}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* CTA */}
        <div className="card p-10 text-center space-y-6">
          <div className="text-[9px] font-black text-slate-500 uppercase tracking-[0.4em]">Want to collaborate on this trip?</div>
          <h3 className="text-2xl font-black text-white tracking-tighter uppercase italic">Join the Mission</h3>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/signup" className="btn-primary px-12 h-14 inline-flex items-center justify-center">
              Create Account
            </Link>
            <Link to="/login" className="px-12 h-14 border border-white/10 text-white font-black text-[10px] uppercase tracking-widest hover:bg-white/5 transition-all inline-flex items-center justify-center">
              Sign In
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SharedTripPage;
