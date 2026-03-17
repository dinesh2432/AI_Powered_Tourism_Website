import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import api from '../services/api';
import toast from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';
// Lazy load Leaflet
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import Modal from '../components/Modal';

// Fix Leaflet default marker
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

const WeatherWidget = ({ city }) => {
  const [weather, setWeather] = useState(null);
  useEffect(() => {
    api.get(`/weather/${city}`).then(({ data }) => setWeather(data.weather)).catch(() => {});
  }, [city]);
  if (!weather) return null;
  return (
    <div className="glass p-4 flex items-center gap-4">
      <img src={weather.icon} alt={weather.description} className="w-12 h-12" />
      <div>
        <div className="text-2xl font-bold text-white">{weather.temperature}°C</div>
        <div className="text-slate-300 text-sm capitalize">{weather.description}</div>
        <div className="text-slate-400 text-xs mt-0.5">Humidity: {weather.humidity}% · Wind: {weather.windSpeed}m/s</div>
      </div>
    </div>
  );
};

const TripDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [trip, setTrip] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [downloading, setDownloading] = useState(false);
  const [mapCoords, setMapCoords] = useState([20, 0]);

  // Modal for delete
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  useEffect(() => {
    const fetchTrip = async () => {
      try {
        const { data } = await api.get(`/trips/${id}`);
        setTrip(data.trip);
        fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(data.trip.destination)}`)
          .then((r) => r.json())
          .then((results) => {
            if (results[0]) setMapCoords([parseFloat(results[0].lat), parseFloat(results[0].lon)]);
          });
      } catch {
        toast.error('Trip not found');
        navigate('/trips');
      } finally {
        setLoading(false);
      }
    };
    fetchTrip();
  }, [id, navigate]);

  const handleDownloadPDF = async () => {
    setDownloading(true);
    try {
      const response = await api.get(`/trips/${id}/pdf`, { responseType: 'blob' });
      const url = URL.createObjectURL(new Blob([response.data]));
      const a = document.createElement('a');
      a.href = url;
      a.download = `trip-${trip.destination.replace(/\s+/g, '-')}-itinerary.pdf`;
      a.click();
      URL.revokeObjectURL(url);
      toast.success('Uplink Synchronized');
    } catch {
      toast.error('Uplink Failure');
    } finally {
      setDownloading(false);
    }
  };

  const confirmDelete = async () => {
    try {
      await api.delete(`/trips/${id}`);
      toast.success('Protocol Executed');
      navigate('/trips');
    } catch {
      toast.error('Protocol Failure');
    }
  };

  if (loading) return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center grid-bg">
      <div className="text-center">
        <div className="text-6xl animate-spin mb-4">✈️</div>
        <p className="text-slate-400 font-black text-xs uppercase tracking-widest">Scanning Sectors...</p>
      </div>
    </div>
  );

  if (!trip) return null;
  const ai = trip.aiResponse || {};
  const days = Math.ceil((new Date(trip.endDate) - new Date(trip.startDate)) / 86400000);

  const tabs = ['overview', 'itinerary', 'hotels', 'budget', 'packing', 'map'];

  return (
    <div className="min-h-screen bg-slate-950 pb-20 relative overflow-hidden grid-bg">
      <Modal 
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        title="Protocol: Deletion"
        type="danger"
        confirmText="Execute"
        onConfirm={confirmDelete}
      >
        Are you sure you want to permanently purge this mission data from the central archive? This action cannot be undone.
      </Modal>

      {/* Hero Section */}
      <div className="relative h-[60vh] min-h-[500px] overflow-hidden">
        {trip.images?.destination?.[0] ? (
          <motion.img 
            initial={{ scale: 1.1 }}
            animate={{ scale: 1 }}
            transition={{ duration: 1.5, ease: 'easeOut' }}
            src={trip.images.destination[0]} 
            alt={trip.destination} 
            className="w-full h-full object-cover" 
          />
        ) : (
          <div className="w-full h-full bg-slate-950" />
        )}
        <div className="absolute inset-0 bg-gradient-to-r from-slate-950 via-slate-950/40 to-transparent" />
        <div className="absolute inset-x-0 bottom-0 h-48 bg-gradient-to-t from-slate-950 to-transparent" />
        
        <div className="absolute inset-0 flex items-end">
          <div className="max-w-7xl mx-auto w-full px-4 md:px-12 lg:px-24 pb-16">
            <motion.div
                initial={{ opacity: 0, x: -30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8 }}
            >
                <div className="flex flex-wrap gap-4 mb-8">
                    <div className="inline-flex items-center gap-2 px-4 py-1.5 glass-dark border border-white/10">
                        <div className={`w-1.5 h-1.5 rounded-full ${trip.status === 'upcoming' ? 'bg-primary-500' : 'bg-secondary-500'} animate-pulse`} />
                        <span className="text-[10px] font-black uppercase tracking-[0.3em] text-white">Status: {trip.status}</span>
                    </div>
                    <div className="px-4 py-1.5 glass-dark border border-white/10 text-[10px] font-black uppercase tracking-[0.3em] text-slate-400">
                        Tier: {trip.accommodationType} STAY
                    </div>
                </div>
                <h1 className="text-6xl md:text-9xl font-black text-white mb-6 tracking-tighter uppercase italic leading-[0.8]">
                    {trip.destination}<span className="text-primary-500">.</span>
                </h1>
                <div className="flex flex-wrap items-center gap-10 text-slate-500 font-black uppercase tracking-[0.4em] text-[10px]">
                    <span className="flex items-center gap-3"><span className="text-white">🛫</span> {trip.source}</span>
                    <span className="flex items-center gap-3"><span className="text-white">⏳</span> {days} CYCLES</span>
                    <span className="flex items-center gap-3"><span className="text-white">👥</span> {trip.members} PERSONNEL</span>
                </div>
            </motion.div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 md:px-12 lg:px-24 relative z-10 -mt-20">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
            {/* Main Content Area */}
            <div className="lg:col-span-8 space-y-12">
                {/* Visual Strip & Quick Actions */}
                <div className="card p-8 flex flex-col md:flex-row items-center justify-between gap-10">
                    <div className="flex -space-x-4">
                        {trip.images?.destination?.slice(0, 5).map((img, i) => (
                            <motion.img 
                                key={i} src={img} alt="" 
                                whileHover={{ y: -10, scale: 1.1, zIndex: 10 }}
                                className="w-16 h-16 rounded-none object-contain bg-slate-950 border border-white/5 transition-all cursor-pointer p-1" 
                            />
                        ))}
                    </div>
                    <div className="flex flex-wrap gap-4">
                        <button onClick={handleDownloadPDF} disabled={downloading}
                            className="btn-primary min-w-[200px] h-14">
                            {downloading ? 'SYNCING...' : 'DOWNLOAD BRIEFING'}
                        </button>
                        <div className="flex gap-4">
                             <Link to={`/guides?city=${trip.destination}`} className="w-14 h-14 glass text-white flex items-center justify-center text-xl hover:bg-white/10 transition-all">
                                👤
                            </Link>
                            <button onClick={() => setIsDeleteModalOpen(true)} className="w-14 h-14 glass text-red-500 flex items-center justify-center text-xl hover:bg-red-500/10 transition-all border-red-500/20">
                                🗑️
                            </button>
                        </div>
                    </div>
                </div>

                {/* Navigation Tabs */}
                <nav className="flex gap-2 overflow-x-auto pb-6 no-scrollbar">
                    {tabs.map((tab) => (
                        <button 
                            key={tab} 
                            onClick={() => setActiveTab(tab)}
                            className={`px-10 h-16 transition-all duration-500 border ${
                                activeTab === tab 
                                ? 'bg-white text-slate-950 border-white shadow-glow-primary font-black uppercase tracking-[0.2em] text-[10px]' 
                                : 'bg-white/5 border-white/5 text-slate-600 hover:text-white hover:border-white/10 font-black uppercase tracking-[0.2em] text-[10px]'
                            }`}
                        >
                            {tab}
                        </button>
                    ))}
                </nav>

                {/* Tab Views */}
                <AnimatePresence mode="wait">
                    <motion.div
                        key={activeTab}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ duration: 0.3 }}
                    >
                        {activeTab === 'overview' && (
                            <div className="card p-12 space-y-16">
                                <div className="space-y-8">
                                    <div className="text-[10px] font-black text-primary-500 uppercase tracking-[0.4em]">Directives</div>
                                    <p className="text-slate-400 text-xl font-bold leading-relaxed italic border-l-2 border-primary-500/30 pl-10 uppercase tracking-wide">
                                        "{ai.overview}"
                                    </p>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 pt-10 border-t border-white/5">
                                    {[
                                        { label: 'Initialization', value: new Date(trip.startDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) },
                                        { label: 'Termination', value: new Date(trip.endDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) },
                                        { label: 'Total Cycles', value: `${days} DAYS` },
                                        { label: 'Asset Load', value: `${trip.budget} ${trip.currency}` },
                                    ].map((item) => (
                                        <div key={item.label} className="space-y-2">
                                            <div className="text-white font-black text-sm tracking-tighter italic uppercase">{item.value}</div>
                                            <div className="text-slate-600 text-[9px] font-black uppercase tracking-[0.3em]">{item.label}</div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {activeTab === 'itinerary' && (
                            <div className="space-y-16">
                                {(ai.daily_itinerary || []).map((day, dIdx) => (
                                    <div key={day.day} className="relative">
                                        <div className="flex flex-col md:flex-row gap-10">
                                            <div className="md:w-32">
                                                <div className="inline-block bg-white text-slate-950 font-black px-6 py-2 italic text-xl tracking-tighter mb-4 shadow-glow-primary">
                                                    D-{String(day.day).padStart(2, '0')}
                                                </div>
                                            </div>
                                            <div className="flex-1 space-y-10">
                                                <div>
                                                    <h3 className="text-3xl font-black text-white tracking-tighter uppercase italic leading-none">{day.title}</h3>
                                                    <p className="text-slate-600 text-[9px] font-black uppercase tracking-[0.3em] mt-3">{day.date}</p>
                                                </div>
                                                <div className="grid grid-cols-1 gap-4">
                                                    {(day.activities || []).map((act, i) => (
                                                        <motion.div 
                                                            key={i} 
                                                            whileHover={{ x: 10 }}
                                                            className="card group p-10"
                                                        >
                                                            <div className="flex flex-col md:flex-row items-start gap-8">
                                                                <div className="min-w-[80px]">
                                                                    <span className="text-primary-500 text-[10px] font-black uppercase tracking-[0.2em]">{act.time}</span>
                                                                </div>
                                                                <div className="flex-1">
                                                                    <div className="text-white font-black text-2xl tracking-tighter group-hover:text-primary-400 transition-colors uppercase italic mb-4">{act.activity}</div>
                                                                    <p className="text-slate-500 text-xs font-bold leading-relaxed uppercase tracking-tight mb-8">{act.description}</p>
                                                                    <div className="flex flex-wrap gap-8 pt-6 border-t border-white/5">
                                                                        {act.location && <div className="text-slate-600 text-[9px] font-black uppercase tracking-[0.3em]">Sector: {act.location}</div>}
                                                                        {act.tips && <div className="text-primary-500/60 text-[9px] font-black uppercase tracking-[0.3em] italic">Intel: {act.tips}</div>}
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </motion.div>
                                                    ))}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}

                        {activeTab === 'hotels' && (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-0">
                                {(ai.hotels || []).map((hotel, i) => (
                                    <div key={i} className="card p-0 group overflow-hidden border">
                                        <div className="h-64 relative overflow-hidden">
                                            <img src={trip.images?.hotels?.[i] || 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800&q=80'} alt={hotel.name} className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-1000 group-hover:scale-110" />
                                            <div className="absolute inset-0 bg-slate-950/40" />
                                        </div>
                                        <div className="p-10">
                                            <div className="flex items-center gap-3 mb-4">
                                                <div className="flex text-yellow-500 text-[8px]">
                                                    {[...Array(Math.floor(hotel.rating || 5))].map((_, idx) => <span key={idx}>★</span>)}
                                                </div>
                                                <span className="text-slate-600 font-black text-[9px] uppercase tracking-[0.2em]">Tier {hotel.rating} Validated</span>
                                            </div>
                                            <h3 className="text-2xl font-black text-white tracking-tighter uppercase italic mb-8 group-hover:text-primary-400 transition-colors">{hotel.name}</h3>
                                            
                                            <div className="flex flex-wrap gap-2 mb-10">
                                                {(hotel.amenities || []).slice(0, 4).map((a) => (
                                                    <span key={a} className="text-slate-500 text-[8px] font-black uppercase tracking-[0.2em] border border-white/5 px-2 py-1">{a}</span>
                                                ))}
                                            </div>

                                            <div className="flex items-center justify-between pt-8 border-t border-white/5">
                                                <div>
                                                    <p className="text-white font-black text-xl italic tracking-tighter leading-none">{hotel.price_per_night}</p>
                                                    <p className="text-[9px] font-black text-slate-600 uppercase tracking-widest mt-2">D-Cycle Rate</p>
                                                </div>
                                                <a href={hotel.booking_url || `https://www.booking.com/searchresults.html?ss=${encodeURIComponent(hotel.name)}`}
                                                    target="_blank" rel="noopener noreferrer"
                                                    className="w-12 h-12 bg-white text-slate-950 flex items-center justify-center font-black group-hover:bg-primary-500 group-hover:text-white transition-all">
                                                    →
                                                </a>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                        {activeTab === 'budget' && (
                            <div className="card p-12 space-y-16">
                                <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-8 border-b border-white/5 pb-12">
                                    <div className="space-y-4">
                                        <div className="text-[10px] font-black text-primary-500 uppercase tracking-[0.4em]">Asset Allocation</div>
                                        <h2 className="text-4xl font-black text-white tracking-tighter uppercase italic leading-none">Resource Audit</h2>
                                    </div>
                                    <div className="text-right">
                                        <div className="text-5xl font-black text-white tracking-tighter italic leading-none">{trip.budget} <span className="text-primary-500">{trip.currency}</span></div>
                                        <div className="text-slate-600 text-[9px] font-black uppercase tracking-[0.3em] mt-3">Total Authorized Load</div>
                                    </div>
                                </div>
                                <div className="grid grid-cols-1 gap-10">
                                    {Object.entries(ai.budget_breakdown || {}).map(([key, val]) => {
                                        if (key === 'currency' || key === 'total') return null;
                                        const total = ai.budget_breakdown?.total || trip.budget;
                                        const percentage = typeof val === 'number' ? Math.min((val / total) * 100, 100) : 15;
                                        return (
                                            <div key={key} className="space-y-4">
                                                <div className="flex justify-between items-end">
                                                    <div className="flex items-center gap-4">
                                                        <div className="w-1 h-3 bg-white" />
                                                        <span className="text-white text-[10px] font-black uppercase tracking-[0.3em]">{key.split('_').join(' ')}</span>
                                                    </div>
                                                    <span className="text-slate-400 font-black text-[10px] uppercase tracking-widest">{typeof val === 'number' ? `${val} ${trip.currency}` : val}</span>
                                                </div>
                                                <div className="w-full h-1.5 bg-white/5 border border-white/5 overflow-hidden">
                                                    <motion.div 
                                                        initial={{ width: 0 }}
                                                        animate={{ width: `${percentage}%` }}
                                                        transition={{ duration: 1, ease: 'easeOut' }}
                                                        className="bg-white h-full shadow-glow-primary" 
                                                    />
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        )}

                        {activeTab === 'packing' && (
                            <div className="card p-12">
                                <div className="text-[10px] font-black text-primary-500 uppercase tracking-[0.4em] mb-12">Inventory Setup</div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {(ai.packing_checklist || []).map((item, i) => (
                                        <motion.label 
                                            key={i} 
                                            whileHover={{ x: 10 }}
                                            className="flex items-center gap-6 p-6 bg-white/5 border border-white/5 cursor-pointer hover:bg-white hover:text-slate-950 transition-all group"
                                        >
                                            <input type="checkbox" className="w-5 h-5 accent-slate-950 cursor-pointer border-white/20 rounded-none bg-transparent" />
                                            <span className="text-[10px] font-black uppercase tracking-widest leading-none">{item}</span>
                                        </motion.label>
                                    ))}
                                </div>
                            </div>
                        )}

                        {activeTab === 'map' && (
                            <div className="space-y-12">
                                <div className="card p-4 h-[600px] relative overflow-hidden group">
                                    <div className="w-full h-full grayscale brightness-50 contrast-125 hover:grayscale-0 hover:brightness-100 transition-all duration-1000">
                                        <MapContainer center={mapCoords} zoom={12} style={{ height: '100%', width: '100%', background: '#020617' }}>
                                            <TileLayer
                                                url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
                                                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
                                            />
                                            <Marker position={mapCoords}>
                                                <Popup className="cyber-popup">
                                                    <div className="p-2 font-black text-[10px] uppercase tracking-widest">
                                                        Mission Sector: {trip.destination}
                                                    </div>
                                                </Popup>
                                            </Marker>
                                        </MapContainer>
                                    </div>
                                    <div className="absolute top-10 left-10 pointer-events-none">
                                        <div className="glass-dark border border-white/10 px-6 py-3">
                                            <div className="text-white text-[10px] font-black uppercase tracking-[0.3em]">Sector Geometry</div>
                                            <div className="text-primary-500 text-[8px] font-black uppercase tracking-[0.2em] mt-1">Lat: {mapCoords[0].toFixed(4)} / Lon: {mapCoords[1].toFixed(4)}</div>
                                        </div>
                                    </div>
                                </div>
                                {ai.transportation && (
                                    <div className="card p-12 border-l-4 border-l-primary-500">
                                        <div className="text-[10px] font-black text-primary-500 uppercase tracking-[0.4em] mb-8">Logistics Node</div>
                                        <p className="text-slate-400 text-sm font-bold leading-relaxed uppercase tracking-tight italic">
                                            "{ai.transportation.local}"
                                        </p>
                                    </div>
                                )}
                            </div>
                        )}
                    </motion.div>
                </AnimatePresence>
            </div>

            {/* Sidebar Content Area */}
            <div className="lg:col-span-4 space-y-12">
                <div className="sticky top-12 space-y-12">
                    {/* Atmospheric Scan */}
                    <div className="card p-10">
                        <div className="text-[10px] font-black text-primary-500 uppercase tracking-[0.4em] mb-8">Atmospheric Scan</div>
                        <WeatherWidget city={trip.destination} />
                        
                        <div className="mt-10 pt-10 border-t border-white/5 space-y-6">
                            <div className="flex justify-between items-center text-[9px] font-black uppercase tracking-[0.3em]">
                                <span className="text-slate-600">Core Link</span>
                                <span className="text-green-500">Authenticated</span>
                            </div>
                            <div className="flex justify-between items-center text-[9px] font-black uppercase tracking-[0.3em]">
                                <span className="text-slate-600">Sync Cycle</span>
                                <span className="text-white">Active</span>
                            </div>
                        </div>
                    </div>

                    {/* Chat CTA */}
                    <Link to="/chatbot" className="card group p-12 bg-primary-500 text-slate-950 hover:bg-white transition-all duration-500 border-none">
                        <div className="text-4xl mb-8 group-hover:scale-110 transition-transform">🧠</div>
                        <h3 className="text-3xl font-black tracking-tighter uppercase italic leading-none mb-6">NEURAL <br />OVERRIDE.</h3>
                        <p className="text-slate-950/60 text-[10px] font-black uppercase tracking-widest leading-relaxed mb-10">Access tactical support for mission contingencies.</p>
                        <div className="h-14 bg-slate-950 text-white flex items-center justify-center text-[10px] font-black uppercase tracking-widest">
                            Initiate Uplink
                        </div>
                    </Link>
                </div>
            </div>
        </div>
      </div>
    </div>
  );
};

export default TripDetailPage;
