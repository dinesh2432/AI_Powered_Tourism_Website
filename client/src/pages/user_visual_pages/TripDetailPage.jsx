import { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import api from '../../services/api';
import toast from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import Modal from '../../components/Modal';
import { useAuth } from '../../context/AuthContext';
import CollaboratorPanel from '../../components/CollaboratorPanel';
import CommentsSection from '../../components/CommentsSection';
import ShareTripModal from '../../components/ShareTripModal';
import FeatureGate from '../../components/FeatureGate';

// Fix Leaflet default marker icons
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl:       'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl:     'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

// Budget category icons + colors
const BUDGET_CATEGORIES = {
  accommodation: { icon: '🏨', label: 'Accommodation', color: '#3b82f6' },
  food:          { icon: '🍽️', label: 'Food & Dining',  color: '#f59e0b' },
  transportation:{ icon: '🚗', label: 'Transportation', color: '#10b981' },
  activities:    { icon: '🎭', label: 'Activities',     color: '#8b5cf6' },
  shopping:      { icon: '🛍️', label: 'Shopping',       color: '#ec4899' },
  emergency:     { icon: '🆘', label: 'Emergency Fund', color: '#ef4444' },
};

// Weather widget
const WeatherWidget = ({ city }) => {
  const [weather, setWeather] = useState(null);
  useEffect(() => {
    api.get(`/weather/${city}`).then(({ data }) => setWeather(data.weather)).catch(() => {});
  }, [city]);
  if (!weather) return (
    <div className="flex items-center gap-3 p-3 rounded-xl" style={{ background: 'var(--bg-hover)' }}>
      <span className="text-2xl">🌤️</span>
      <div>
        <p className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>Current Weather</p>
        <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Loading...</p>
      </div>
    </div>
  );
  return (
    <div className="flex items-center gap-4 p-4 rounded-xl" style={{ background: 'var(--bg-hover)' }}>
      <img src={weather.icon} alt={weather.description} className="w-12 h-12" />
      <div>
        <div className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>{weather.temperature}°C</div>
        <div className="text-sm capitalize" style={{ color: 'var(--text-secondary)' }}>{weather.description}</div>
        <div className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>
          Humidity: {weather.humidity}% · Wind: {weather.windSpeed}m/s
        </div>
      </div>
    </div>
  );
};

// Hotel rating stars
const Stars = ({ rating }) => {
  const full = Math.floor(rating || 0);
  return (
    <div className="flex items-center gap-1">
      {[1,2,3,4,5].map(i => (
        <span key={i} className={`text-sm ${i <= full ? 'text-amber-400' : 'text-gray-600'}`}>★</span>
      ))}
      <span className="text-xs ml-1" style={{ color: 'var(--text-muted)' }}>({rating})</span>
    </div>
  );
};

const TABS = [
  { id: 'overview',    label: '📋 Overview' },
  { id: 'itinerary',  label: '📅 Itinerary' },
  { id: 'hotels',     label: '🏨 Hotels' },
  { id: 'budget',     label: '💰 Budget' },
  { id: 'packing',    label: '🎒 Packing List' },
  { id: 'map',        label: '🗺️ Map & Transport' },
  { id: 'collaborate',label: '👥 Collaboration' },
];

const TripDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, effectivePlan } = useAuth(); // BUG-04 FIX: use effectivePlan not user.subscription
  const [trip, setTrip] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [downloading, setDownloading] = useState(false);
  const [mapCoords, setMapCoords] = useState([20, 78]);

  // Hotel filters
  const [priceFilter, setPriceFilter] = useState('all');
  const [ratingFilter, setRatingFilter] = useState(0);

  // Modals
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  // Packing list checked state
  const [checkedItems, setCheckedItems] = useState({});

  // Lightbox
  const [lightboxIndex, setLightboxIndex] = useState(null);
  const lightboxSwipeRef = useRef(null);
  const pointerStartX = useRef(null);

  useEffect(() => {
    const fetchTrip = async () => {
      try {
        const { data } = await api.get(`/trips/${id}`);
        setTrip(data.trip);
        // Geocode destination
        fetch(
          `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(data.trip.destination)}&limit=1`
        )
          .then(r => r.json())
          .then(results => {
            if (results[0]) setMapCoords([parseFloat(results[0].lat), parseFloat(results[0].lon)]);
          })
          .catch(() => {});
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
      toast.success('PDF downloaded!');
    } catch {
      toast.error('PDF download failed. Please try again.');
    } finally {
      setDownloading(false);
    }
  };

  const confirmDelete = async () => {
    try {
      await api.delete(`/trips/${id}`);
      toast.success('Trip deleted successfully');
      navigate('/trips');
    } catch {
      toast.error('Could not delete trip. Please try again.');
    }
  };

  if (loading) return (
    <div
      className="min-h-screen flex items-center justify-center"
      style={{ background: 'var(--bg-primary)' }}
    >
      <div className="text-center space-y-4">
        <div className="text-5xl animate-bounce">✈️</div>
        <p className="text-sm font-medium" style={{ color: 'var(--text-muted)' }}>
          Loading your trip...
        </p>
      </div>
    </div>
  );

  if (!trip) return null;

  const ai = trip.aiResponse || {};
  const days = Math.max(1, Math.ceil((new Date(trip.endDate) - new Date(trip.startDate)) / 86400000));
  const isOwner = trip?.userId?._id?.toString() === user?._id?.toString() ||
    trip?.userId?.toString?.() === user?._id?.toString();

  // All hotels from AI
  const allHotels = ai.hotels || [];

  // Apply filters
  const filteredHotels = allHotels.filter(h => {
    const price = parseFloat(h.price_per_night) || 0;
    const rating = parseFloat(h.rating) || 0;
    const passPrice =
      priceFilter === 'all' ? true :
      priceFilter === 'budget' ? price < 60 :
      priceFilter === 'mid'    ? (price >= 60 && price <= 150) :
      price > 150;
    const passRating = rating >= ratingFilter;
    return passPrice && passRating;
  });

  // Budget breakdown
  const budgetBreakdown = ai.budget_breakdown || {};
  const totalBudget = budgetBreakdown.total || trip.budget;

  return (
    <div className="min-h-screen pb-16" style={{ background: 'var(--bg-primary)' }}>
      <Modal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        title="Delete Trip"
        type="danger"
        confirmText="Delete"
        onConfirm={confirmDelete}
      >
        Are you sure you want to permanently delete this trip? This action cannot be undone.
      </Modal>

      <ShareTripModal
        tripId={id}
        isOpen={isShareModalOpen}
        onClose={() => setIsShareModalOpen(false)}
      />

      {/* ── Hero Image ── */}
      <div className="relative h-[50vh] min-h-[350px] overflow-hidden">
        {trip.images?.destination?.[0] ? (
          <motion.img
            initial={{ scale: 1.08 }}
            animate={{ scale: 1 }}
            transition={{ duration: 1.5 }}
            src={trip.images.destination[0]}
            alt={trip.destination}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-slate-800 to-slate-700" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/30 to-transparent" />

        {/* Hero text */}
        <div className="absolute bottom-0 left-0 right-0 p-6 md:p-10">
          <div className="max-w-6xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <div className="flex flex-wrap gap-2 mb-3">
                <span className="badge badge-primary text-xs">
                  {trip.status === 'ongoing' ? '🟢 Ongoing' : trip.status === 'completed' ? '✅ Completed' : '📅 Upcoming'}
                </span>
                <span
                  className="badge text-xs"
                  style={{
                    background: 'rgba(255,255,255,0.15)',
                    color: '#fff',
                    border: '1px solid rgba(255,255,255,0.2)',
                  }}
                >
                  {trip.accommodationType} Stay
                </span>
              </div>
              <h1 className="text-4xl md:text-6xl font-black text-white leading-tight mb-2">
                {trip.destination}
              </h1>
              <div className="flex flex-wrap gap-4 text-sm text-slate-300">
                <span>✈️ From {trip.source}</span>
                <span>⏱️ {days} day{days !== 1 ? 's' : ''}</span>
                <span>👥 {trip.members} traveler{trip.members !== 1 ? 's' : ''}</span>
                <span>💰 {trip.budget} {trip.currency}</span>
              </div>
            </motion.div>
          </div>
        </div>
      </div>

      {/* ── Main Content ── */}
      <div className="max-w-6xl mx-auto px-4 md:px-8 -mt-4 relative z-10">

        {/* Action Buttons */}
        <div
          className="card mb-6 flex flex-wrap items-center gap-3 p-4"
        >
          {/* Image gallery thumbnails */}
          <div className="flex -space-x-2 mr-2">
            {(trip.images?.destination || []).slice(0, 4).map((img, i) => (
              <img
                key={i}
                src={img}
                alt=""
                className="w-10 h-10 rounded-lg object-cover border-2"
                style={{ borderColor: 'var(--bg-primary)' }}
              />
            ))}
          </div>

          <div className="flex flex-wrap gap-2 ml-auto">
            {/* BUG-04 FIX: pass effectivePlan (handles expiry) not user.subscription */}
            {/* BUG-05 FIX: FeatureGate no longer renders button in DOM when locked */}
            <FeatureGate requiredPlan="PRO" userPlan={effectivePlan}>
              <button
                id="download-pdf-btn"
                onClick={handleDownloadPDF}
                disabled={downloading}
                className="btn-primary h-10 px-4 text-sm disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {downloading ? '⏳ Downloading...' : '📄 Download PDF'}
              </button>
            </FeatureGate>

            {isOwner && (
              <button
                onClick={() => setIsShareModalOpen(true)}
                className="btn-secondary h-10 px-4 text-sm"
              >
                🔗 Share Trip
              </button>
            )}

            <Link
              to={`/guides?city=${trip.destination}`}
              className="btn-secondary h-10 px-4 text-sm"
            >
              👤 Find Guide
            </Link>

            {isOwner && (
              <button
                onClick={() => setIsDeleteModalOpen(true)}
                className="btn-danger h-10 px-4 text-sm"
              >
                🗑️ Delete
              </button>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* ── Tab Area ── */}
          <div className="lg:col-span-2 space-y-4">
            {/* Tab Navigation */}
            <div
              className="flex flex-wrap gap-2 pb-2 sticky top-16 z-20 py-2 px-1 rounded-xl"
              style={{ background: 'var(--bg-primary)' }}
            >
              {TABS.map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`tab-btn whitespace-nowrap ${activeTab === tab.id ? 'tab-btn-active' : ''}`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Tab Content */}
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.2 }}
              >

                {/* ─── OVERVIEW ─── */}
                {activeTab === 'overview' && (
                  <div className="card space-y-6">
                    <div>
                      <h2 className="text-lg font-bold mb-3" style={{ color: 'var(--text-primary)' }}>
                        Trip Overview
                      </h2>
                      <p className="text-sm leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
                        {ai.overview || 'No overview available.'}
                      </p>
                    </div>

                    <div
                      className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-5"
                      style={{ borderTop: '1px solid var(--border)' }}
                    >
                      {[
                        { label: 'Start Date',  value: new Date(trip.startDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) },
                        { label: 'End Date',    value: new Date(trip.endDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) },
                        { label: 'Duration',    value: `${days} day${days !== 1 ? 's' : ''}` },
                        { label: 'Total Budget',value: `${trip.budget} ${trip.currency}` },
                      ].map(item => (
                        <div key={item.label} className="space-y-1">
                          <p className="text-xs font-medium" style={{ color: 'var(--text-muted)' }}>{item.label}</p>
                          <p className="text-sm font-bold" style={{ color: 'var(--text-primary)' }}>{item.value}</p>
                        </div>
                      ))}
                    </div>

                    {/* Packing highlights */}
                    {ai.best_time_to_visit && (
                      <div className="p-4 rounded-xl" style={{ background: 'var(--bg-hover)', border: '1px solid var(--border)' }}>
                        <p className="text-xs font-semibold mb-1 text-amber-500">🌟 Best Time to Visit</p>
                        <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>{ai.best_time_to_visit}</p>
                      </div>
                    )}

                    {/* Local cuisine */}
                    {ai.local_cuisine?.length > 0 && (
                      <div>
                        <p className="text-xs font-semibold mb-2" style={{ color: 'var(--text-muted)' }}>🍽️ Must-Try Local Food</p>
                        <div className="flex flex-wrap gap-2">
                          {ai.local_cuisine.map((dish, i) => (
                            <span key={i} className="badge badge-primary text-xs">{dish}</span>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Travel warnings */}
                    {ai.travel_warnings?.length > 0 && (
                      <div className="p-4 rounded-xl" style={{ background: 'rgba(239,68,68,0.06)', border: '1px solid rgba(239,68,68,0.2)' }}>
                        <p className="text-xs font-semibold text-red-400 mb-2">⚠️ Travel Tips & Reminders</p>
                        <ul className="space-y-1">
                          {ai.travel_warnings.map((w, i) => (
                            <li key={i} className="text-sm" style={{ color: 'var(--text-secondary)' }}>• {w}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                )}

                {/* ─── ITINERARY ─── */}
                {activeTab === 'itinerary' && (
                  <div className="space-y-4">
                    {(ai.daily_itinerary || []).length === 0 ? (
                      <div className="card text-center py-10">
                        <p style={{ color: 'var(--text-muted)' }}>No itinerary available</p>
                      </div>
                    ) : (ai.daily_itinerary || []).map((day) => (
                      <div key={day.day} className="card">
                        <div className="flex items-center gap-3 mb-4">
                          <div
                            className="w-10 h-10 rounded-xl flex items-center justify-center text-white text-sm font-black shrink-0"
                            style={{ background: `rgb(var(--accent))` }}
                          >
                            D{day.day}
                          </div>
                          <div>
                            <h3 className="font-bold" style={{ color: 'var(--text-primary)' }}>{day.title}</h3>
                            <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{day.date}</p>
                          </div>
                        </div>
                        <div className="space-y-3 ml-3 border-l-2 pl-5" style={{ borderColor: 'var(--border)' }}>
                          {(day.activities || []).map((act, i) => (
                            <div key={i} className="relative">
                              <div
                                className="absolute -left-[21px] top-1.5 w-2.5 h-2.5 rounded-full"
                                style={{ background: `rgb(var(--accent))` }}
                              />
                              <div className="flex items-start gap-3">
                                <span
                                  className="text-xs font-semibold shrink-0 mt-0.5 w-16"
                                  style={{ color: `rgb(var(--accent))` }}
                                >
                                  {act.time}
                                </span>
                                <div className="flex-1">
                                  <p className="text-sm font-semibold mb-0.5" style={{ color: 'var(--text-primary)' }}>
                                    {act.activity}
                                  </p>
                                  <p className="text-xs leading-relaxed mb-1" style={{ color: 'var(--text-secondary)' }}>
                                    {act.description}
                                  </p>
                                  <div className="flex flex-wrap gap-3">
                                    {act.location && (
                                      <span className="text-xs" style={{ color: 'var(--text-muted)' }}>
                                        📍 {act.location}
                                      </span>
                                    )}
                                    {act.cost && (
                                      <span className="text-xs" style={{ color: 'var(--text-muted)' }}>
                                        💰 ~{act.cost} {trip.currency}
                                      </span>
                                    )}
                                    {act.tips && (
                                      <span className="text-xs text-amber-500">
                                        💡 {act.tips}
                                      </span>
                                    )}
                                  </div>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* ─── HOTELS ─── */}
                {activeTab === 'hotels' && (
                  <div className="space-y-4">
                    {/* Filters */}
                    <div className="card p-4 flex flex-wrap gap-3 items-center">
                      <span className="text-xs font-semibold" style={{ color: 'var(--text-muted)' }}>
                        Filter:
                      </span>
                      <div className="flex gap-2 flex-wrap">
                        {[
                          { id: 'all',    label: '🏨 All' },
                          { id: 'budget', label: '💚 Budget (<$60)' },
                          { id: 'mid',    label: '🔵 Mid-range ($60-150)' },
                          { id: 'luxury', label: '⭐ Luxury (>$150)' },
                        ].map(f => (
                          <button
                            key={f.id}
                            onClick={() => setPriceFilter(f.id)}
                            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                              priceFilter === f.id ? 'tab-btn-active' : 'tab-btn'
                            }`}
                          >
                            {f.label}
                          </button>
                        ))}
                      </div>
                      <div className="flex items-center gap-2 ml-auto">
                        <span className="text-xs" style={{ color: 'var(--text-muted)' }}>Min Rating:</span>
                        {[0, 3, 4, 4.5].map(r => (
                          <button
                            key={r}
                            onClick={() => setRatingFilter(r)}
                            className={`px-2 py-1 rounded-lg text-xs transition-all ${
                              ratingFilter === r ? 'tab-btn-active' : 'tab-btn'
                            }`}
                          >
                            {r === 0 ? 'Any' : `${r}★+`}
                          </button>
                        ))}
                      </div>
                    </div>

                    <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                      Showing {filteredHotels.length} of {allHotels.length} hotels
                    </p>

                    {filteredHotels.length === 0 ? (
                      <div className="card text-center py-10">
                        <p className="text-3xl mb-2">🏨</p>
                        <p style={{ color: 'var(--text-muted)' }}>No hotels match your filters</p>
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {filteredHotels.map((hotel, i) => (
                          <motion.div
                            key={i}
                            initial={{ opacity: 0, y: 12 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: i * 0.04 }}
                            className="card overflow-hidden group"
                          >
                            <div className="h-44 rounded-xl overflow-hidden mb-4 -mx-1 -mt-1">
                              <img
                                src={
                                  trip.images?.hotels?.[i % (trip.images.hotels.length || 1)] ||
                                  `https://images.unsplash.com/photo-1566073771259-6a8506099945?w=600&q=75`
                                }
                                alt={hotel.name}
                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                              />
                            </div>

                            <div className="space-y-2">
                              <Stars rating={hotel.rating} />
                              <h3 className="font-bold text-sm" style={{ color: 'var(--text-primary)' }}>
                                {hotel.name}
                              </h3>
                              <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>
                                📍 {hotel.location}
                              </p>

                              {hotel.description && (
                                <p className="text-xs leading-relaxed" style={{ color: 'var(--text-muted)' }}>
                                  {hotel.description}
                                </p>
                              )}

                              {/* Amenities */}
                              {hotel.amenities?.length > 0 && (
                                <div className="flex flex-wrap gap-1 pt-1">
                                  {hotel.amenities.slice(0, 4).map((a, ai) => (
                                    <span
                                      key={ai}
                                      className="text-xs px-2 py-0.5 rounded-full"
                                      style={{
                                        background: 'var(--bg-hover)',
                                        color: 'var(--text-muted)',
                                        border: '1px solid var(--border)',
                                      }}
                                    >
                                      {a}
                                    </span>
                                  ))}
                                </div>
                              )}

                          <div
                                className="flex items-center justify-between pt-3"
                                style={{ borderTop: '1px solid var(--border)' }}
                              >
                                <div>
                                  <span className="text-base font-black" style={{ color: 'var(--text-primary)' }}>
                                    {trip.currency === 'INR' ? '₹' :
                                     trip.currency === 'EUR' ? '€' :
                                     trip.currency === 'GBP' ? '£' :
                                     trip.currency === 'JPY' ? '¥' :
                                     trip.currency === 'AED' ? 'د.إ' :
                                     trip.currency === 'SGD' ? 'S$' : '$'}{hotel.price_per_night}
                                  </span>
                                  <span className="text-xs ml-1" style={{ color: 'var(--text-muted)' }}>
                                    / night · {trip.currency}
                                  </span>
                                </div>
                                <a
                                  href={hotel.booking_url || `https://www.booking.com/searchresults.html?ss=${encodeURIComponent(hotel.name + ' ' + trip.destination)}`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="btn-primary h-8 px-4 text-xs"
                                >
                                  Book →
                                </a>
                              </div>
                            </div>
                          </motion.div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* ─── BUDGET ─── */}
                {activeTab === 'budget' && (
                  <div className="card space-y-6">
                    <div className="flex flex-col sm:flex-row justify-between gap-4">
                      <div>
                        <h2 className="text-lg font-bold mb-1" style={{ color: 'var(--text-primary)' }}>
                          Budget Breakdown
                        </h2>
                        <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                          Estimated spending for {trip.members} traveler{trip.members !== 1 ? 's' : ''}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-3xl font-black" style={{ color: 'var(--text-primary)' }}>
                          {totalBudget} <span style={{ color: `rgb(var(--accent))`, fontSize: '1rem' }}>{trip.currency}</span>
                        </p>
                        {budgetBreakdown.per_person && (
                          <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                            ~{budgetBreakdown.per_person} {trip.currency} per person
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="space-y-4">
                      {Object.entries(budgetBreakdown).map(([key, val]) => {
                        if (['currency', 'total', 'per_person'].includes(key)) return null;
                        const cat = BUDGET_CATEGORIES[key] || { icon: '💡', label: key, color: '#6b7280' };
                        const amount = typeof val === 'number' ? val : 0;
                        const pct = totalBudget > 0 ? Math.min((amount / totalBudget) * 100, 100) : 0;

                        return (
                          <div key={key}>
                            <div className="flex items-center justify-between mb-2">
                              <div className="flex items-center gap-3">
                                <span className="text-2xl">{cat.icon}</span>
                                <div>
                                  <p className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>
                                    {cat.label}
                                  </p>
                                  <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                                    {pct.toFixed(0)}% of budget
                                  </p>
                                </div>
                              </div>
                              <span className="text-sm font-bold" style={{ color: 'var(--text-primary)' }}>
                                {typeof val === 'number' ? `${val} ${trip.currency}` : val}
                              </span>
                            </div>
                            <div
                              className="h-2 rounded-full overflow-hidden"
                              style={{ background: 'var(--bg-hover)' }}
                            >
                              <motion.div
                                initial={{ width: 0 }}
                                animate={{ width: `${pct}%` }}
                                transition={{ duration: 0.8, delay: 0.1, ease: 'easeOut' }}
                                className="h-full rounded-full"
                                style={{ background: cat.color }}
                              />
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* ─── PACKING LIST ─── */}
                {activeTab === 'packing' && (() => {
                    const items = ai.packing_checklist || [];
                    const checkedCount = Object.values(checkedItems).filter(Boolean).length;
                    const totalCount = items.length;
                    const pct = totalCount > 0 ? Math.round((checkedCount / totalCount) * 100) : 0;
                    const isDone = pct === 100 && totalCount > 0;

                    return (
                    <div className="card">
                      {/* Header + progress */}
                      <div className="flex items-center justify-between mb-2">
                        <h2 className="text-lg font-bold" style={{ color: 'var(--text-primary)' }}>🎒 Packing Checklist</h2>
                        <span
                          className="text-sm font-bold px-3 py-1 rounded-full"
                          style={{
                            background: isDone ? 'rgba(16,185,129,0.15)' : 'rgba(var(--accent),0.1)',
                            color: isDone ? '#10b981' : 'rgb(var(--accent))',
                          }}
                        >
                          {checkedCount}/{totalCount} packed
                        </span>
                      </div>

                      {/* Progress bar */}
                      <div className="mb-2">
                        <div className="h-2 rounded-full overflow-hidden mb-1" style={{ background: 'var(--bg-hover)' }}>
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${pct}%` }}
                            transition={{ duration: 0.5, ease: 'easeOut' }}
                            className="h-full rounded-full"
                            style={{ background: isDone ? '#10b981' : 'linear-gradient(90deg, rgb(var(--accent)), #06b6d4)' }}
                          />
                        </div>
                        <div className="flex justify-between text-xs" style={{ color: 'var(--text-muted)' }}>
                          <span>{pct}% packed</span>
                          {isDone && <span className="text-green-400 font-semibold">✅ All packed! Safe travels!</span>}
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-4">
                        {items.map((item, i) => (
                          <label
                            key={i}
                            className="flex items-center gap-3 p-3 rounded-xl cursor-pointer transition-all group"
                            style={{
                              border: `1px solid ${checkedItems[i] ? 'rgba(16,185,129,0.3)' : 'var(--border)'}`,
                              background: checkedItems[i] ? 'rgba(16,185,129,0.06)' : 'transparent',
                            }}
                            onMouseEnter={e => { if (!checkedItems[i]) e.currentTarget.style.background = 'var(--bg-hover)'; }}
                            onMouseLeave={e => { if (!checkedItems[i]) e.currentTarget.style.background = 'transparent'; }}
                          >
                            <input
                              type="checkbox"
                              checked={!!checkedItems[i]}
                              onChange={() => setCheckedItems(prev => ({ ...prev, [i]: !prev[i] }))}
                              className="w-4 h-4 rounded accent-sky-500 cursor-pointer shrink-0"
                            />
                            <span
                              className="text-sm transition-all"
                              style={{
                                color: checkedItems[i] ? 'var(--text-muted)' : 'var(--text-secondary)',
                                textDecoration: checkedItems[i] ? 'line-through' : 'none',
                              }}
                            >
                              {item}
                            </span>
                            {checkedItems[i] && <span className="ml-auto text-green-400 text-xs">✓</span>}
                          </label>
                        ))}
                      </div>
                    </div>
                    );
                  })()}

                {/* ─── MAP & TRANSPORT ─── */}
                {activeTab === 'map' && (
                  <div className="space-y-4">
                    {/* Satellite Map */}
                    <div className="card overflow-hidden p-0 rounded-2xl" style={{ height: 420 }}>
                      <MapContainer
                        center={mapCoords}
                        zoom={11}
                        style={{ height: '100%', width: '100%' }}
                        scrollWheelZoom={false}
                      >
                        {/* ESRI Satellite Imagery — no API key required */}
                        <TileLayer
                          url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
                          attribution="Tiles © Esri — Source: Esri, Maxar, Earthstar Geographics"
                          maxZoom={18}
                        />
                        {/* Labels layer on top of satellite */}
                        <TileLayer
                          url="https://server.arcgisonline.com/ArcGIS/rest/services/Reference/World_Boundaries_and_Places/MapServer/tile/{z}/{y}/{x}"
                          attribution=""
                        />
                        <Marker position={mapCoords}>
                          <Popup>
                            <div className="font-semibold text-slate-900">
                              📍 {trip.destination}
                            </div>
                          </Popup>
                        </Marker>
                      </MapContainer>
                    </div>

                    {/* Coordinates info */}
                    <div
                      className="card flex items-center gap-4 p-4"
                    >
                      <span className="text-2xl">🌐</span>
                      <div>
                        <p className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>
                          {trip.destination}
                        </p>
                        <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                          Lat: {mapCoords[0].toFixed(4)} · Lon: {mapCoords[1].toFixed(4)}
                        </p>
                      </div>
                    </div>

                    {/* Transportation */}
                    {ai.transportation && (
                      <div className="card space-y-4">
                        <h3 className="font-bold" style={{ color: 'var(--text-primary)' }}>
                          🚀 Getting There & Around
                        </h3>
                        {[
                          { icon: '✈️', key: 'arrival',   label: 'Arrival' },
                          { icon: '🚗', key: 'local',     label: 'Local Transport' },
                          { icon: '🛫', key: 'departure', label: 'Return Journey' },
                        ].map(({ icon, key, label }) => ai.transportation[key] && (
                          <div key={key} className="flex gap-3">
                            <span className="text-xl shrink-0">{icon}</span>
                            <div>
                              <p className="text-xs font-semibold mb-0.5" style={{ color: 'var(--text-muted)' }}>
                                {label}
                              </p>
                              <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                                {ai.transportation[key]}
                              </p>
                            </div>
                          </div>
                        ))}
                        {ai.transportation.estimated_cost && (
                          <div
                            className="flex items-center justify-between p-3 rounded-xl"
                            style={{ background: 'var(--bg-hover)' }}
                          >
                            <span className="text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>
                              Estimated Transport Cost
                            </span>
                            <span className="font-bold" style={{ color: 'var(--text-primary)' }}>
                              {ai.transportation.estimated_cost} {trip.currency}
                            </span>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )}

                {/* ─── COLLABORATION ─── */}
                {activeTab === 'collaborate' && (
                  <div className="space-y-4">
                    <CollaboratorPanel tripId={id} isOwner={isOwner} />
                    <CommentsSection tripId={id} />
                  </div>
                )}

              </motion.div>
            </AnimatePresence>
          </div>

          {/* ── Sidebar: Weather + Quick Info ── */}
          <div className="space-y-4">
            <div className="sticky top-20 space-y-4">
              {/* Weather */}
              <div className="card">
                <h3 className="text-sm font-semibold mb-3" style={{ color: 'var(--text-secondary)' }}>
                  Current Weather
                </h3>
                <WeatherWidget city={trip.destination} />
              </div>

              {/* Emergency Contacts */}
              {ai.emergency_contacts && (
                <div className="card">
                  <h3 className="text-sm font-semibold mb-3" style={{ color: 'var(--text-secondary)' }}>
                    🆘 Emergency Numbers
                  </h3>
                  <div className="space-y-2">
                    {Object.entries(ai.emergency_contacts).map(([key, val]) => (
                      <div key={key} className="flex justify-between">
                        <span className="text-xs capitalize" style={{ color: 'var(--text-muted)' }}>
                          {key.replace(/_/g, ' ')}
                        </span>
                        <span className="text-xs font-semibold" style={{ color: 'var(--text-primary)' }}>
                          {val}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Destination photos */}
              {(trip.images?.destination || []).length > 1 && (
                <div className="card">
                  <h3 className="text-sm font-semibold mb-3" style={{ color: 'var(--text-secondary)' }}>
                    📸 Photos
                  </h3>
                  <div className="grid grid-cols-3 gap-1.5">
                    {trip.images.destination.slice(0, 6).map((img, i) => (
                      <img
                        key={i}
                        src={img}
                        alt=""
                        onClick={() => setLightboxIndex(i)}
                        className="w-full aspect-square object-cover rounded-lg cursor-pointer hover:opacity-80 transition-opacity"
                      />
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
      {/* Lightbox Overlay */}
      {lightboxIndex !== null && (() => {
        const images = trip.images?.destination || [];
        const maxLen = Math.min(6, images.length);

        const goPrev = () => setLightboxIndex(prev => (prev - 1 + maxLen) % maxLen);
        const goNext = () => setLightboxIndex(prev => (prev + 1) % maxLen);

        const onPointerDown = (e) => { pointerStartX.current = e.clientX; };
        const onPointerUp   = (e) => {
          if (pointerStartX.current === null) return;
          const dx = e.clientX - pointerStartX.current;
          if (Math.abs(dx) > 50) dx < 0 ? goNext() : goPrev();
          pointerStartX.current = null;
        };

        return (
        <div
          className="fixed inset-0 z-[100] bg-slate-950/95 flex items-center justify-center p-4 backdrop-blur-sm"
          onPointerDown={onPointerDown}
          onPointerUp={onPointerUp}
          style={{ touchAction: 'pan-y' }}
        >
          <button
            onClick={() => setLightboxIndex(null)}
            className="absolute top-6 right-6 text-white text-3xl font-black w-12 h-12 flex items-center justify-center hover:bg-white/10 rounded-full transition-colors z-50"
          >
            ✕
          </button>

          <button
            onClick={goPrev}
            className="absolute left-2 md:left-10 text-white text-5xl font-black w-16 h-16 flex items-center justify-center hover:bg-white/10 rounded-full transition-colors z-50"
          >
            ‹
          </button>

          <button
            onClick={goNext}
            className="absolute right-2 md:right-10 text-white text-5xl font-black w-16 h-16 flex items-center justify-center hover:bg-white/10 rounded-full transition-colors z-50"
          >
            ›
          </button>

          <AnimatePresence mode="wait">
            <motion.img
              key={lightboxIndex}
              initial={{ opacity: 0, x: 40 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -40 }}
              transition={{ duration: 0.25 }}
              src={images[lightboxIndex]}
              className="max-w-[95vw] max-h-[85vh] object-contain shadow-2xl rounded-xl"
              alt="Trip Destination"
            />
          </AnimatePresence>

          {/* Dot indicators */}
          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-2">
            {Array.from({ length: maxLen }).map((_, i) => (
              <button
                key={i}
                onClick={() => setLightboxIndex(i)}
                className="rounded-full transition-all duration-300"
                style={{
                  width: i === lightboxIndex ? 24 : 8,
                  height: 8,
                  background: i === lightboxIndex ? '#fff' : 'rgba(255,255,255,0.3)',
                }}
              />
            ))}
          </div>
        </div>
        );
      })()}
    </div>
  );
};

export default TripDetailPage;
