import { useEffect, useRef, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../../services/api';
import toast from 'react-hot-toast';

/* ─── Reel card with IntersectionObserver auto-play ─── */
const ReelCard = ({ video, onClick, isLastFetched, onEnterView }) => {
  const videoRef = useRef(null);
  const cardRef = useRef(null);

  /* Auto-play / pause on scroll */
  useEffect(() => {
    const el = cardRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (videoRef.current) {
          if (entry.isIntersecting) videoRef.current.play().catch(() => {});
          else videoRef.current.pause();
        }
        if (entry.isIntersecting && isLastFetched) onEnterView?.();
      },
      { threshold: 0.6 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [isLastFetched, onEnterView]);

  return (
    <div
      ref={cardRef}
      className="relative w-full cursor-pointer group"
      style={{
        height: '100dvh',
        scrollSnapAlign: 'start',
        background: 'var(--bg-secondary)',
      }}
      onClick={() => onClick(video)}
    >
      {/* Video / thumbnail */}
      {video.cloudinaryUrl ? (
        <video
          ref={videoRef}
          src={video.cloudinaryUrl}
          className="w-full h-full object-cover"
          loop
          muted
          playsInline
          preload="metadata"
        />
      ) : video.thumbnail ? (
        <img
          src={video.thumbnail}
          alt={video.title}
          className="w-full h-full object-cover"
        />
      ) : (
        <div
          className="w-full h-full flex items-center justify-center text-6xl"
          style={{ background: 'var(--bg-card)' }}
        >
          🎬
        </div>
      )}

      {/* Dark scrim at bottom */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent pointer-events-none" />

      {/* Play hint */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <div
          className="w-16 h-16 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-80 transition-opacity duration-300"
          style={{ background: 'rgba(255,255,255,0.15)', backdropFilter: 'blur(4px)', border: '1.5px solid rgba(255,255,255,0.4)' }}
        >
          <svg className="w-6 h-6 text-white ml-1" fill="currentColor" viewBox="0 0 24 24">
            <path d="M8 5v14l11-7z" />
          </svg>
        </div>
      </div>

      {/* Info overlay */}
      <div className="absolute bottom-0 left-0 right-0 p-6 pointer-events-none">
        {/* Destination chip */}
        {video.destination && (
          <span
            className="inline-block text-xs font-bold px-3 py-1 rounded-full mb-3"
            style={{
              background: `rgba(var(--accent), 0.25)`,
              color: `rgb(var(--accent))`,
              border: `1px solid rgba(var(--accent), 0.4)`,
              backdropFilter: 'blur(8px)',
            }}
          >
            📍 {video.destination}
          </span>
        )}
        <h3 className="text-xl font-black text-white leading-snug mb-2 drop-shadow-lg">
          {video.title}
        </h3>
        {video.description && (
          <p className="text-sm text-white/70 line-clamp-2 leading-relaxed drop-shadow">
            {video.description}
          </p>
        )}
        <div className="flex items-center gap-4 mt-3">
          <span className="text-xs text-white/50 font-medium">
            👁 {video.views?.toLocaleString() || 0} views
          </span>
          {video.duration > 0 && (
            <span className="text-xs text-white/50 font-medium">
              ⏱ {Math.floor(video.duration / 60)}:{String(video.duration % 60).padStart(2, '0')}
            </span>
          )}
        </div>
      </div>

      {/* Destination badge top-right */}
      <div className="absolute top-6 right-6 pointer-events-none">
        <span
          className="text-xs font-mono px-2 py-1 rounded"
          style={{ background: 'rgba(0,0,0,0.45)', color: 'rgba(255,255,255,0.5)' }}
        >
          #{video._id.slice(-5)}
        </span>
      </div>
    </div>
  );
};

/* ─── Main page ─── */
const ExplorePage = () => {
  const [videos, setVideos] = useState([]);
  const [feed, setFeed] = useState([]);       // infinite feed (videos repeated)
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [activeVideo, setActiveVideo] = useState(null);
  const [gridMode, setGridMode] = useState(false);  // toggle between reel & grid

  const fetchVideos = useCallback(async (q = '') => {
    try {
      const params = q ? { destination: q } : {};
      const { data } = await api.get('/explore', { params });
      const vids = data.videos || [];
      setVideos(vids);
      // Start feed with 2 repetitions
      if (vids.length > 0) {
        setFeed(buildFeed(vids, 4));
      }
    } catch {
      toast.error('Failed to load videos');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchVideos(); }, [fetchVideos]);

  const handleSearch = (e) => {
    e.preventDefault();
    setLoading(true);
    fetchVideos(search);
  };

  const handleView = (video) => {
    setActiveVideo(video);
    api.put(`/explore/${video._id}/view`).catch(() => {});
  };

  /* Build feed by repeating source array N times, each item gets unique key */
  const buildFeed = (source, reps) => {
    const result = [];
    for (let r = 0; r < reps; r++) {
      source.forEach((v, i) => result.push({ ...v, _feedKey: `${r}-${i}` }));
    }
    return result;
  };

  /* When the last card enters view → append 1 more full round */
  const handleLastEnterView = useCallback(() => {
    if (videos.length === 0) return;
    setFeed(prev => {
      const nextRound = videos.map((v, i) => ({
        ...v,
        _feedKey: `${Date.now()}-${i}`,
      }));
      return [...prev, ...nextRound];
    });
  }, [videos]);

  return (
    <div
      className="min-h-screen"
      style={{ background: 'var(--bg-primary)', fontFamily: "'Inter', 'Outfit', sans-serif" }}
    >
      {/* ─── Header / Search ─── */}
      <div
        className="sticky top-0 z-30 px-4 py-3 flex items-center gap-3"
        style={{
          background: 'var(--navbar-bg)',
          backdropFilter: 'blur(20px)',
          borderBottom: '1px solid var(--border)',
        }}
      >
        <div className="flex-1">
          <form onSubmit={handleSearch} className="flex gap-2">
            <input
              type="text"
              className="input-field flex-1 h-10 text-sm"
              placeholder="Search destinations…"
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
            <button
              type="submit"
              className="btn-primary h-10 px-5 text-sm"
            >
              Search
            </button>
          </form>
        </div>

        {/* View mode toggle */}
        <div
          className="flex rounded-xl overflow-hidden"
          style={{ border: '1px solid var(--border)' }}
        >
          <button
            onClick={() => setGridMode(false)}
            className="w-9 h-10 flex items-center justify-center transition-all text-sm"
            title="Reel view"
            style={{
              background: !gridMode ? `rgb(var(--accent))` : 'var(--bg-glass)',
              color: !gridMode ? '#fff' : 'var(--text-secondary)',
            }}
          >
            ▤
          </button>
          <button
            onClick={() => setGridMode(true)}
            className="w-9 h-10 flex items-center justify-center transition-all text-sm"
            title="Grid view"
            style={{
              background: gridMode ? `rgb(var(--accent))` : 'var(--bg-glass)',
              color: gridMode ? '#fff' : 'var(--text-secondary)',
            }}
          >
            ⊞
          </button>
        </div>
      </div>

      {/* ─── Content ─── */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-4 pt-6">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="aspect-video rounded-2xl shimmer" />
          ))}
        </div>
      ) : videos.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-32 text-center px-4">
          <div className="text-6xl mb-6 opacity-30">📡</div>
          <h3 className="text-2xl font-black mb-3" style={{ color: 'var(--text-primary)' }}>
            No videos found
          </h3>
          <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
            Try a different search term.
          </p>
        </div>
      ) : gridMode ? (
        /* ── Grid Mode ── */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-4 pt-6 max-w-7xl mx-auto">
          {videos.map((video, i) => (
            <motion.div
              key={video._id}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.06 }}
              className="group rounded-2xl overflow-hidden cursor-pointer transition-all duration-300 hover:-translate-y-1"
              style={{
                background: 'var(--bg-card)',
                border: '1px solid var(--border)',
              }}
              onClick={() => handleView(video)}
              onMouseEnter={e => {
                e.currentTarget.style.borderColor = `rgba(var(--accent), 0.4)`;
                e.currentTarget.style.boxShadow = `0 8px 32px rgba(var(--accent), 0.12)`;
              }}
              onMouseLeave={e => {
                e.currentTarget.style.borderColor = 'var(--border)';
                e.currentTarget.style.boxShadow = 'none';
              }}
            >
              {/* Thumbnail */}
              <div className="relative aspect-video overflow-hidden" style={{ background: 'var(--bg-secondary)' }}>
                {video.thumbnail ? (
                  <img
                    src={video.thumbnail}
                    alt={video.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-4xl opacity-20">🎬</div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                {/* Play button */}
                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <div
                    className="w-14 h-14 rounded-full flex items-center justify-center"
                    style={{ background: `rgba(var(--accent), 0.9)` }}
                  >
                    <svg className="w-5 h-5 text-white ml-1" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M8 5v14l11-7z" />
                    </svg>
                  </div>
                </div>
                {video.destination && (
                  <span
                    className="absolute top-3 left-3 text-xs font-semibold px-2.5 py-1 rounded-full"
                    style={{
                      background: `rgba(var(--accent), 0.2)`,
                      color: `rgb(var(--accent))`,
                      border: `1px solid rgba(var(--accent), 0.35)`,
                      backdropFilter: 'blur(8px)',
                    }}
                  >
                    {video.destination}
                  </span>
                )}
                {video.duration > 0 && (
                  <span
                    className="absolute bottom-3 right-3 text-xs font-mono px-2 py-0.5 rounded"
                    style={{ background: 'rgba(0,0,0,0.6)', color: 'rgba(255,255,255,0.8)' }}
                  >
                    {Math.floor(video.duration / 60)}:{String(video.duration % 60).padStart(2, '0')}
                  </span>
                )}
              </div>
              {/* Card info */}
              <div className="p-4">
                <h3
                  className="font-bold text-base mb-1 line-clamp-1 group-hover:opacity-80 transition-opacity"
                  style={{ color: 'var(--text-primary)' }}
                >
                  {video.title}
                </h3>
                {video.description && (
                  <p
                    className="text-xs line-clamp-2 leading-relaxed mb-3"
                    style={{ color: 'var(--text-secondary)' }}
                  >
                    {video.description}
                  </p>
                )}
                <div
                  className="flex items-center justify-between pt-3 text-xs"
                  style={{ borderTop: '1px solid var(--border)', color: 'var(--text-muted)' }}
                >
                  <span>👁 {video.views?.toLocaleString() || 0}</span>
                  <span>{new Date(video.createdAt).getFullYear()}</span>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      ) : (
        /* ── Reel / Infinite Scroll Mode ── */
        <div
          className="relative"
          style={{
            height: '100dvh',
            overflowY: 'scroll',
            scrollSnapType: 'y mandatory',
            WebkitOverflowScrolling: 'touch',
          }}
        >
          {feed.map((video, idx) => (
            <ReelCard
              key={video._feedKey}
              video={video}
              onClick={handleView}
              isLastFetched={idx === feed.length - 1}
              onEnterView={handleLastEnterView}
            />
          ))}

          {/* Scroll hint on very first load */}
          {feed.length > 0 && (
            <div
              className="fixed bottom-8 left-1/2 -translate-x-1/2 z-20 flex flex-col items-center gap-1 animate-bounce pointer-events-none"
              style={{ opacity: 0.6 }}
            >
              <svg className="w-5 h-5 text-white drop-shadow" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
              <span className="text-white text-xs font-semibold drop-shadow">Scroll</span>
            </div>
          )}
        </div>
      )}

      {/* ─── Video Modal ─── */}
      <AnimatePresence>
        {activeVideo && (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            style={{ background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(16px)' }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setActiveVideo(null)}
          >
            <motion.div
              className="relative w-full max-w-4xl rounded-2xl overflow-hidden shadow-2xl"
              style={{ background: 'var(--bg-card)', border: '1px solid var(--border-strong)' }}
              initial={{ scale: 0.94, y: 12 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.94, y: 12 }}
              onClick={e => e.stopPropagation()}
            >
              {/* Close */}
              <button
                onClick={() => setActiveVideo(null)}
                className="absolute top-4 right-4 z-10 w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-200 hover:scale-110"
                style={{
                  background: 'rgba(0,0,0,0.5)',
                  color: '#fff',
                  border: '1px solid rgba(255,255,255,0.2)',
                }}
              >
                ✕
              </button>

              {/* Video */}
              <div className="aspect-video bg-black">
                <video
                  controls
                  autoPlay
                  className="w-full h-full"
                  src={activeVideo.cloudinaryUrl}
                >
                  Your browser does not support video playback.
                </video>
              </div>

              {/* Details */}
              <div className="p-6">
                <h2
                  className="text-2xl font-black mb-2"
                  style={{ color: 'var(--text-primary)' }}
                >
                  {activeVideo.title}
                </h2>
                {activeVideo.description && (
                  <p className="text-sm leading-relaxed mb-4" style={{ color: 'var(--text-secondary)' }}>
                    {activeVideo.description}
                  </p>
                )}
                <div className="flex flex-wrap gap-3 items-center">
                  {activeVideo.destination && (
                    <span
                      className="text-xs font-semibold px-3 py-1 rounded-full"
                      style={{
                        background: `rgba(var(--accent), 0.12)`,
                        color: `rgb(var(--accent))`,
                        border: `1px solid rgba(var(--accent), 0.3)`,
                      }}
                    >
                      📍 {activeVideo.destination}
                    </span>
                  )}
                  <span className="text-xs" style={{ color: 'var(--text-muted)' }}>
                    👁 {activeVideo.views?.toLocaleString() || 0} views
                  </span>
                  {activeVideo.tags?.map(t => (
                    <span
                      key={t}
                      className="text-xs px-2.5 py-1 rounded-lg"
                      style={{ background: 'var(--bg-hover)', color: 'var(--text-secondary)', border: '1px solid var(--border)' }}
                    >
                      #{t}
                    </span>
                  ))}
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ExplorePage;
