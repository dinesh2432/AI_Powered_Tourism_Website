import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

const Avatar = ({ user }) => {
  if (user?.profileImage) {
    return (
      <img
        src={user.profileImage}
        alt={user.name}
        className="w-8 h-8 rounded-full object-cover flex-shrink-0"
        style={{ border: '2px solid var(--border-strong)' }}
      />
    );
  }
  return (
    <div
      className="w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs flex-shrink-0"
      style={{
        background: 'rgba(var(--accent), 0.15)',
        color: 'rgb(var(--accent))',
        border: '1px solid rgba(var(--accent), 0.3)',
      }}
    >
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
  const containerRef = useRef(null);
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
    pollRef.current = setInterval(fetchComments, 10000);
    return () => clearInterval(pollRef.current);
  }, [tripId]);

  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.scrollTop = containerRef.current.scrollHeight;
    }
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
    return (
      d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) +
      ' · ' +
      d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true })
    );
  };

  return (
    <div className="card p-5 md:p-8 space-y-6">
      {/* Header */}
      <div>
        <p className="text-xs font-bold uppercase tracking-widest mb-1" style={{ color: 'rgb(var(--accent))' }}>
          Mission Log
        </p>
        <h3 className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>
          Comments
        </h3>
      </div>

      {/* Comment list */}
      <div ref={containerRef} className="space-y-5 max-h-[420px] overflow-y-auto pr-1">
        {loading ? (
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-14 rounded-xl shimmer" />
            ))}
          </div>
        ) : comments.length === 0 ? (
          <div className="py-10 text-center rounded-2xl" style={{ border: '1px dashed var(--border)' }}>
            <div className="text-3xl mb-3">💬</div>
            <p className="text-sm font-semibold" style={{ color: 'var(--text-muted)' }}>
              No comments yet
            </p>
            <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>
              Be the first to add a note
            </p>
          </div>
        ) : (
          comments.map((c, i) => {
            const isMe = c.user?._id === user?._id;
            return (
              <motion.div
                key={c._id || i}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.03 }}
                className={`flex gap-3 ${isMe ? 'flex-row-reverse' : ''}`}
              >
                <Avatar user={c.user} />
                <div className={`flex-1 max-w-[80%] flex flex-col gap-1 ${isMe ? 'items-end' : 'items-start'}`}>
                  <p
                    className="text-xs font-semibold"
                    style={{ color: isMe ? 'rgb(var(--accent))' : 'var(--text-muted)' }}
                  >
                    {c.user?.name || 'Unknown'}{' '}
                    <span style={{ color: 'var(--text-muted)', fontWeight: 400 }}>
                      · {formatTime(c.createdAt)}
                    </span>
                  </p>
                  <div
                    className="px-4 py-3 rounded-2xl text-sm leading-relaxed"
                    style={{
                      background: isMe ? 'rgba(var(--accent), 0.12)' : 'var(--bg-hover)',
                      border: `1px solid ${isMe ? 'rgba(var(--accent), 0.25)' : 'var(--border)'}`,
                      color: 'var(--text-secondary)',
                    }}
                  >
                    {c.message}
                  </div>
                </div>
              </motion.div>
            );
          })
        )}
      </div>

      {/* Post comment form */}
      <form
        onSubmit={handlePost}
        className="flex gap-3 pt-5"
        style={{ borderTop: '1px solid var(--border)' }}
      >
        <Avatar user={user} />
        <div className="flex flex-1 gap-2 min-w-0">
          <input
            type="text"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Add a mission note..."
            className="input-field flex-1 min-w-0 text-sm"
            disabled={posting}
          />
          <button
            type="submit"
            disabled={posting || !message.trim()}
            className="btn-primary px-5 text-sm disabled:opacity-40 disabled:cursor-not-allowed shrink-0"
          >
            {posting ? '…' : 'Post'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default CommentsSection;
