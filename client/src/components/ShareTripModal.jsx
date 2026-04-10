import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../services/api';
import toast from 'react-hot-toast';

const ShareTripModal = ({ tripId, isOpen, onClose }) => {
  const [shareUrl, setShareUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [revoking, setRevoking] = useState(false);
  const [copied, setCopied] = useState(false);

  const generateLink = async () => {
    setLoading(true);
    try {
      const { data } = await api.post(`/trips/${tripId}/share`);
      setShareUrl(data.shareUrl);
      toast.success('Share link generated');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to generate link');
    } finally {
      setLoading(false);
    }
  };

  const copyLink = async () => {
    await navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    toast.success('Link copied to clipboard');
    setTimeout(() => setCopied(false), 2000);
  };

  const revokeLink = async () => {
    setRevoking(true);
    try {
      await api.delete(`/trips/${tripId}/share`);
      setShareUrl('');
      toast.success('Share link revoked');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to revoke link');
    } finally {
      setRevoking(false);
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center p-4"
        style={{ background: 'rgba(2,6,23,0.85)', backdropFilter: 'blur(8px)' }}
        onClick={onClose}
      >
        <motion.div
          initial={{ opacity: 0, y: 20, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 20, scale: 0.95 }}
          transition={{ duration: 0.25 }}
          className="w-full max-w-lg rounded-3xl p-8 relative shadow-2xl"
          style={{
            background: 'var(--bg-secondary)',
            border: '1px solid var(--border-strong)',
          }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between mb-10">
            <div>
              <p className="text-xs font-bold uppercase tracking-widest mb-2" style={{ color: 'rgb(var(--accent))' }}>
                Collaboration
              </p>
              <h2 className="text-2xl font-black tracking-tight" style={{ color: 'var(--text-primary)' }}>
                Share Trip
              </h2>
            </div>
            <button
              onClick={onClose}
              className="w-9 h-9 rounded-xl flex items-center justify-center text-lg transition-all hover:scale-110"
              style={{
                background: 'var(--bg-hover)',
                border: '1px solid var(--border)',
                color: 'var(--text-muted)',
              }}
            >
              ×
            </button>
          </div>

          {!shareUrl ? (
            <div className="space-y-8">
              <p className="text-sm font-medium leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
                Generate a public share link. Anyone with the link can view this trip without logging in.
              </p>
              <button
                onClick={generateLink}
                disabled={loading}
                className="btn-primary w-full h-14"
              >
                {loading ? 'Generating...' : '🔗 Generate Share Link'}
              </button>
            </div>
          ) : (
            <div className="space-y-8">
              <div className="space-y-3">
                <p className="text-xs font-semibold uppercase tracking-widest mb-2" style={{ color: 'var(--text-muted)' }}>Share URL</p>
                <div className="flex gap-3">
                  <input
                    readOnly
                    value={shareUrl}
                    className="flex-1 rounded-xl px-4 py-3 text-xs font-mono focus:outline-none"
                    style={{
                      background: 'var(--bg-hover)',
                      border: '1px solid var(--border)',
                      color: 'var(--text-secondary)',
                    }}
                  />
                  <button
                    onClick={copyLink}
                    className="px-6 bg-white text-slate-950 font-black text-[10px] uppercase tracking-widest hover:bg-primary-500 hover:text-white transition-all"
                  >
                    {copied ? '✓' : 'Copy'}
                  </button>
                </div>
              </div>
              <button
                onClick={revokeLink}
                disabled={revoking}
                className="w-full h-12 bg-red-500/10 border border-red-500/30 text-red-400 font-black text-[10px] uppercase tracking-widest hover:bg-red-500/20 transition-all"
              >
                {revoking ? 'Revoking...' : '🗑 Revoke Share Link'}
              </button>
            </div>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default ShareTripModal;
