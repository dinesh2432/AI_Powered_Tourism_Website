import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../../services/api';
import toast from 'react-hot-toast';

const ExplorePage = () => {
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [activeVideo, setActiveVideo] = useState(null);

  const fetchVideos = async (q = '') => {
    try {
      const params = q ? { destination: q } : {};
      const { data } = await api.get('/explore', { params });
      setVideos(data.videos || []);
    } catch {
      toast.error('Uplink Interrupted');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchVideos(); }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    setLoading(true);
    fetchVideos(search);
  };

  const handleView = (video) => {
    setActiveVideo(video);
    api.put(`/explore/${video._id}/view`).catch(() => {});
  };

  return (
    <div className="min-h-screen bg-slate-950 grid-bg pb-20 overflow-hidden">
      {/* Header Area */}
      <div className="relative h-[40vh] min-h-[350px] overflow-hidden">
        <img
          src="https://images.unsplash.com/photo-1493375366761-d6eDc5de-5084?w=1600&q=80"
          alt="Explore"
          className="w-full h-full object-cover opacity-30"
          onError={(e) => { e.target.src = 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=1600&q=80'; }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-slate-950 via-slate-950/40 to-slate-950" />
        <div className="absolute inset-0 flex flex-col items-center justify-center px-4">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-center space-y-8"
            >
                {/* <div className="inline-flex items-center gap-3 px-6 py-2 border border-white/10 bg-white/5 backdrop-blur-md">
                    <div className="w-1.5 h-1.5 bg-primary-500 animate-pulse" />
                    <span className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-400">Global Reconnaissance // Discovery Protocol</span>
                </div> */}
                <h1 className="text-6xl md:text-8xl font-black text-white uppercase italic tracking-tighter mix-blend-difference">
                    EXPLORE<span className="text-primary-500">.</span>
                </h1>
                
                <form onSubmit={handleSearch} className="flex gap-0 w-full max-w-2xl mx-auto shadow-2xl">
                    <input
                        type="text"
                        className="flex-1 bg-white/5 border border-white/10 h-16 px-8 text-[11px] font-black uppercase tracking-widest text-white focus:outline-none focus:border-white focus:bg-white/10 transition-all placeholder:text-slate-700"
                        placeholder="SEARCH HERE....."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                    <button type="submit" className="bg-white text-slate-950 px-8 font-black text-[10px] uppercase tracking-widest hover:bg-primary-500 hover:text-white transition-all">
                        SEARCH
                    </button>
                </form>
            </motion.div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 md:px-12 lg:px-24">
        <div className="border-l border-white/5">
            {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-0 border-t border-white/5">
                {[...Array(6)].map((_, i) => (
                <div key={i} className="aspect-video border-r border-b border-white/5 bg-white/5 animate-pulse" />
                ))}
            </div>
            ) : videos.length === 0 ? (
            <div className="py-32 text-center border-t border-r border-b border-white/5">
                <div className="text-5xl mb-8 opacity-20">📡</div>
                <h3 className="text-3xl font-black text-white mb-4 uppercase italic tracking-tighter">Negative Signal.</h3>
                <p className="text-slate-600 font-bold uppercase tracking-widest text-[10px]">No sector data matching your inquiry found in the global archive.</p>
            </div>
            ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-0 border-t border-white/5">
                {videos.map((video, i) => (
                <motion.div
                    key={video._id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: i * 0.05 }}
                    className="group border-r border-b border-white/5 bg-slate-950 hover:bg-white/5 cursor-pointer transition-all duration-700 overflow-hidden"
                    onClick={() => handleView(video)}
                >
                    <div className="relative aspect-video overflow-hidden bg-slate-900 border-b border-white/5">
                    {video.thumbnail ? (
                        <img src={video.thumbnail} alt={video.title} className="w-full h-full object-cover grayscale opacity-40 group-hover:grayscale-0 group-hover:opacity-100 group-hover:scale-110 transition-all duration-1000" />
                    ) : (
                        <div className="w-full h-full flex items-center justify-center text-3xl font-black bg-white/5 text-white/5">RECON_ID_{video._id.slice(-4)}</div>
                    )}
                    
                    <div className="absolute inset-0 bg-slate-950/40 group-hover:bg-transparent transition-colors flex items-center justify-center">
                        <div className="w-16 h-16 border border-white/20 flex items-center justify-center group-hover:scale-110 group-hover:border-primary-500 transition-all duration-500">
                        <span className="text-xs text-white font-black group-hover:text-primary-500">PLAY</span>
                        </div>
                    </div>

                    <div className="absolute top-4 left-4 flex gap-2">
                        <span className="px-3 py-1 bg-white/5 backdrop-blur-md border border-white/10 text-[9px] font-black text-white uppercase tracking-widest">
                            {video.destination || 'SEC_UNKWN'}
                        </span>
                    </div>

                    {video.duration > 0 && (
                        <span className="absolute bottom-4 right-4 text-[9px] font-black text-white/40 group-hover:text-white transition-colors">
                        {Math.floor(video.duration / 60)}:{String(video.duration % 60).padStart(2, '0')}_TC
                        </span>
                    )}
                    </div>
                    
                    <div className="p-8 space-y-4">
                        <h3 className="text-xl font-black text-white uppercase italic tracking-tighter line-clamp-1 group-hover:text-primary-500 transition-colors">
                            {video.title}
                        </h3>
                        {video.description && (
                            <p className="text-slate-500 text-[10px] font-bold uppercase tracking-tight line-clamp-2 leading-relaxed">
                                {video.description}
                            </p>
                        )}
                        <div className="flex items-center justify-between pt-4 border-t border-white/5">
                            <span className="text-[9px] font-black text-slate-600 uppercase tracking-widest">VIEWS: {video.views}</span>
                            <span className="text-[9px] font-black text-slate-600 uppercase tracking-widest font-mono">STMP: {new Date(video.createdAt).getFullYear()}</span>
                        </div>
                    </div>
                </motion.div>
                ))}
            </div>
            )}
        </div>
      </div>

      {/* Video modal */}
      <AnimatePresence>
        {activeVideo && (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/90 backdrop-blur-xl"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setActiveVideo(null)}
          >
            <motion.div
              className="relative w-full max-w-5xl bg-slate-950 border border-white/10 shadow-2xl overflow-hidden"
              initial={{ scale: 0.95 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.95 }}
              onClick={(e) => e.stopPropagation()}
            >
              <button 
                onClick={() => setActiveVideo(null)}
                className="absolute top-6 right-6 z-10 w-12 h-12 bg-white text-slate-950 flex items-center justify-center text-xl font-light hover:bg-primary-500 hover:text-white transition-all shadow-xl"
              >
                ✕
              </button>
              
              <div className="aspect-video bg-black relative">
                <video controls autoPlay className="w-full h-full" src={activeVideo.cloudinaryUrl}>
                  Uplink Failure: Browser unable to render stream.
                </video>
                <div className="absolute top-6 left-6 pointer-events-none opacity-40">
                    <div className="text-[10px] font-black text-white uppercase tracking-[0.4em] mb-2">Streaming Reconnaissance Data...</div>
                    <div className="w-32 h-1 bg-white/20 overflow-hidden">
                        <div className="w-1/2 h-full bg-primary-500 animate-[shimmer_2s_infinite]" />
                    </div>
                </div>
              </div>

              <div className="p-10 border-t border-white/10">
                <h2 className="text-3xl font-black text-white uppercase italic tracking-tighter mb-4">{activeVideo.title}</h2>
                {activeVideo.description && (
                    <p className="text-slate-500 text-xs font-bold uppercase tracking-tight leading-relaxed mb-6 max-w-2xl">
                        {activeVideo.description}
                    </p>
                )}
                <div className="flex gap-4 items-center">
                    <div className="flex items-center gap-2">
                        <div className="w-1.5 h-1.5 bg-primary-500 animate-pulse" />
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">SECURE STREAM ACTIVE</span>
                    </div>
                    {activeVideo.tags?.length > 0 && (
                        <div className="flex gap-2">
                            {activeVideo.tags.map((t) => (
                                <span key={t} className="text-[9px] font-black text-slate-600 uppercase tracking-widest border border-white/5 px-3 py-1">
                                    {t}
                                </span>
                            ))}
                        </div>
                    )}
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
