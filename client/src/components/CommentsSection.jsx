import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

const Avatar = ({ user }) => {
  if (user?.profileImage) {
    return <img src={user.profileImage} alt={user.name} className="w-8 h-8 rounded-full object-cover border border-white/10 flex-shrink-0" />;
  }
  return (
    <div className="w-8 h-8 rounded-full bg-primary-500/20 border border-primary-500/30 flex items-center justify-center text-primary-400 font-black text-xs flex-shrink-0">
      {user?.name?.[0]?.toUpperCase() || '?'}
    </div>
  );
};

const CommentsSection = ({ tripId }) => {
  const { user } = useAuth();
  const [comments, setComments] = useState([]);
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [posting, setPosting] = useState(false);
  const bottomRef = useRef(null);
  const pollRef = useRef(null);

  const fetchComments = async () => {
    try {
      const { data } = await api.get(`/trips/${tripId}/comments`);
      setComments(data.comments);
    } catch {
      // Silent fail on poll
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchComments();
    // Poll every 10 seconds for new comments
    pollRef.current = setInterval(fetchComments, 10000);
    return () => clearInterval(pollRef.current);
  }, [tripId]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [comments]);

  const handlePost = async (e) => {
    e.preventDefault();
    if (!message.trim()) return;
    setPosting(true);
    try {
      const { data } = await api.post(`/trips/${tripId}/comments`, { message: message.trim() });
      setComments((prev) => [...prev, data.comment]);
      setMessage('');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to post comment');
    } finally {
      setPosting(false);
    }
  };

  const formatTime = (date) => {
    const d = new Date(date);
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) +
      ' · ' + d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });
  };

  return (
    <div className="card p-10 space-y-10">
      {/* Header */}
      <div>
        <div className="text-[9px] font-black text-primary-500 uppercase tracking-[0.4em] mb-2">
          Mission Log
        </div>
        <h3 className="text-2xl font-black text-white tracking-tighter uppercase italic">
          Comments
        </h3>
      </div>

      {/* Comment list */}
      <div className="space-y-6 max-h-[480px] overflow-y-auto pr-2 no-scrollbar">
        {loading ? (
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-16 bg-white/5 animate-pulse rounded" />
            ))}
          </div>
        ) : comments.length === 0 ? (
          <div className="py-10 text-center">
            <div className="text-3xl mb-4">💬</div>
            <p className="text-slate-600 text-[10px] font-black uppercase tracking-widest">
              No comments yet
            </p>
            <p className="text-slate-700 text-[9px] uppercase tracking-wider mt-2">
              Be the first to add a note
            </p>
          </div>
        ) : (
          comments.map((c, i) => (
            <motion.div
              key={c._id || i}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.03 }}
              className={`flex gap-4 ${c.user?._id === user?._id ? 'flex-row-reverse' : ''}`}
            >
              <Avatar user={c.user} />
              <div className={`flex-1 max-w-[80%] ${c.user?._id === user?._id ? 'items-end' : 'items-start'} flex flex-col gap-1`}>
                <div className={`text-[9px] font-black uppercase tracking-[0.2em] ${c.user?._id === user?._id ? 'text-right text-primary-400' : 'text-slate-500'}`}>
                  {c.user?.name || 'Unknown'} · <span className="text-slate-600 font-bold normal-case">{formatTime(c.createdAt)}</span>
                </div>
                <div className={`px-5 py-3 text-xs font-bold leading-relaxed border ${
                  c.user?._id === user?._id
                    ? 'bg-primary-500/15 border-primary-500/20 text-white'
                    : 'bg-white/5 border-white/5 text-slate-300'
                }`}>
                  {c.message}
                </div>
              </div>
            </motion.div>
          ))
        )}
        <div ref={bottomRef} />
      </div>

      {/* Post comment form */}
      <form onSubmit={handlePost} className="flex gap-4 pt-6 border-t border-white/5">
        <Avatar user={user} />
        <div className="flex-1 flex gap-3">
          <input
            type="text"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Add a mission note..."
            className="flex-1 bg-white/5 border border-white/10 px-5 py-3 text-white text-xs font-mono placeholder-slate-600 focus:outline-none focus:border-primary-500/50 transition-all"
          />
          <button
            type="submit"
            disabled={posting || !message.trim()}
            className="px-8 bg-white text-slate-950 font-black text-[9px] uppercase tracking-widest hover:bg-primary-500 hover:text-white transition-all disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {posting ? '...' : 'Post'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default CommentsSection;
