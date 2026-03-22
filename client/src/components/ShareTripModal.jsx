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
          className="w-full max-w-lg bg-slate-900 border border-white/10 p-10 relative"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between mb-10">
            <div>
              <div className="text-[9px] font-black text-primary-500 uppercase tracking-[0.4em] mb-2">
                Collaboration Protocol
              </div>
              <h2 className="text-2xl font-black text-white tracking-tighter uppercase italic">
                Share Mission
              </h2>
            </div>
            <button
              onClick={onClose}
              className="w-10 h-10 bg-white/5 border border-white/10 text-slate-400 hover:text-white hover:bg-white/10 transition-all flex items-center justify-center text-lg"
            >
              ×
            </button>
          </div>

          {!shareUrl ? (
            <div className="space-y-8">
              <p className="text-slate-400 text-xs font-bold uppercase tracking-widest leading-relaxed">
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
                <div className="text-[9px] font-black text-slate-500 uppercase tracking-[0.3em]">Share URL</div>
                <div className="flex gap-3">
                  <input
                    readOnly
                    value={shareUrl}
                    className="flex-1 bg-white/5 border border-white/10 px-4 py-3 text-slate-300 text-xs font-mono focus:outline-none"
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
