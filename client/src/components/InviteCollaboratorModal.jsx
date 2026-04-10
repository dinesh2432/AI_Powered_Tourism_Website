import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../services/api';
import toast from 'react-hot-toast';

// ── Invite Modal — fully theme-aware, new invitation flow ────────────────────
const InviteCollaboratorModal = ({ tripId, isOpen, onClose, onInviteSent }) => {
  const [email, setEmail] = useState('');
  const [role, setRole] = useState('editor');
  const [loading, setLoading] = useState(false);

  const handleInvite = async (e) => {
    e.preventDefault();
    if (!email.trim()) return;

    setLoading(true);
    try {
      // BUG 2 FIX: Use /invite endpoint with explicit Content-Type
      // This sends a proper invitation (not direct-add) — works for both viewer & editor
      const { data } = await api.post(
        `/trips/${tripId}/invite`,
        { email: email.trim(), role },
        { headers: { 'Content-Type': 'application/json' } }
      );

      toast.success(`Invitation sent! 📩 ${data.message}`);
      onInviteSent?.(data.invitation);
      setEmail('');
      setRole('editor');
      onClose();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to send invitation');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    if (loading) return;
    setEmail('');
    setRole('editor');
    onClose();
  };

  if (!isOpen) return null;

  const roles = [
    { value: 'editor', icon: '✏️', label: 'Editor',  desc: 'Can view, comment & suggest changes' },
    { value: 'viewer', icon: '👁',  label: 'Viewer',  desc: 'Read-only access to the trip' },
  ];

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center p-4"
        style={{ background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(8px)' }}
        onClick={handleClose}
      >
        {/* BUG 1 FIX: Use CSS variables instead of hardcoded bg-slate-900 */}
        <motion.div
          initial={{ opacity: 0, y: 24, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 24, scale: 0.95 }}
          transition={{ type: 'spring', stiffness: 320, damping: 28 }}
          className="w-full max-w-md rounded-3xl p-8 relative shadow-2xl"
          style={{
            background: 'var(--bg-secondary)',  // ← theme-aware
            border: '1px solid var(--border-strong)',
          }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-start justify-between mb-8">
            <div>
              <p className="text-xs font-bold uppercase tracking-widest mb-2" style={{ color: 'rgb(var(--accent))' }}>
                Trip Collaboration
              </p>
              <h2 className="text-2xl font-black tracking-tight" style={{ color: 'var(--text-primary)' }}>
                Send Invitation
              </h2>
              <p className="text-sm mt-1" style={{ color: 'var(--text-secondary)' }}>
                The user will receive a notification to accept.
              </p>
            </div>
            <button
              onClick={handleClose}
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

          <form onSubmit={handleInvite} className="space-y-6">
            {/* Email input */}
            <div>
              <label
                className="block text-xs font-bold uppercase tracking-widest mb-2"
                style={{ color: 'var(--text-muted)' }}
              >
                Their Email Address
              </label>
              <input
                type="email"
                required
                id="invite-email-input"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="collaborator@email.com"
                className="input-field w-full"
                disabled={loading}
              />
            </div>

            {/* Role selector — BUG 2 FIX: both viewer and editor use same endpoint */}
            <div>
              <label
                className="block text-xs font-bold uppercase tracking-widest mb-3"
                style={{ color: 'var(--text-muted)' }}
              >
                Access Level
              </label>
              <div className="grid grid-cols-2 gap-3">
                {roles.map((r) => {
                  const isActive = role === r.value;
                  return (
                    <button
                      key={r.value}
                      type="button"
                      id={`role-btn-${r.value}`}
                      onClick={() => setRole(r.value)}
                      className="p-4 rounded-2xl text-left transition-all"
                      style={{
                        background: isActive ? 'rgba(var(--accent), 0.1)' : 'var(--bg-hover)',
                        border: `2px solid ${isActive ? 'rgb(var(--accent))' : 'var(--border)'}`,
                      }}
                    >
                      <div className="text-2xl mb-1">{r.icon}</div>
                      <p className="font-bold text-sm" style={{ color: 'var(--text-primary)' }}>
                        {r.label}
                      </p>
                      <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>
                        {r.desc}
                      </p>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Invite flow explanation */}
            <div
              className="px-4 py-3 rounded-xl text-xs leading-relaxed"
              style={{
                background: 'rgba(var(--accent), 0.06)',
                border: '1px solid rgba(var(--accent), 0.2)',
                color: 'var(--text-secondary)',
              }}
            >
              📩 <strong style={{ color: 'var(--text-primary)' }}>How it works:</strong> The user will receive
              a notification bell alert and must <strong>Accept</strong> before they can access the trip.
            </div>

            <button
              type="submit"
              id="send-invite-submit"
              disabled={loading || !email.trim()}
              className="btn-primary w-full h-14 text-sm disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                  Sending Invitation…
                </span>
              ) : (
                '📩 Send Invitation'
              )}
            </button>
          </form>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default InviteCollaboratorModal;
