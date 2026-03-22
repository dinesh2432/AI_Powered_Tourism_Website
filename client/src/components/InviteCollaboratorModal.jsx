import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../services/api';
import toast from 'react-hot-toast';

const InviteCollaboratorModal = ({ tripId, isOpen, onClose, onCollaboratorAdded }) => {
  const [email, setEmail] = useState('');
  const [role, setRole] = useState('editor');
  const [loading, setLoading] = useState(false);

  const handleInvite = async (e) => {
    e.preventDefault();
    if (!email.trim()) return;

    setLoading(true);
    try {
      const { data } = await api.post(`/trips/${tripId}/collaborators`, { email: email.trim(), role });
      toast.success(`${data.collaborator.user.name} added as ${role}`);
      onCollaboratorAdded?.(data.collaborator);
      setEmail('');
      onClose();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to add collaborator');
    } finally {
      setLoading(false);
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
                Personnel Access
              </div>
              <h2 className="text-2xl font-black text-white tracking-tighter uppercase italic">
                Invite Collaborator
              </h2>
            </div>
            <button
              onClick={onClose}
              className="w-10 h-10 bg-white/5 border border-white/10 text-slate-400 hover:text-white hover:bg-white/10 transition-all flex items-center justify-center text-lg"
            >
              ×
            </button>
          </div>

          <form onSubmit={handleInvite} className="space-y-8">
            {/* Email input */}
            <div className="space-y-3">
              <label className="text-[9px] font-black text-slate-500 uppercase tracking-[0.3em]">
                User Email
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="collaborator@email.com"
                className="w-full bg-white/5 border border-white/10 px-5 py-4 text-white text-sm font-mono placeholder-slate-600 focus:outline-none focus:border-primary-500/50 transition-all"
              />
            </div>

            {/* Role selector */}
            <div className="space-y-3">
              <label className="text-[9px] font-black text-slate-500 uppercase tracking-[0.3em]">
                Access Role
              </label>
              <div className="flex gap-4">
                {['editor', 'viewer'].map((r) => (
                  <button
                    key={r}
                    type="button"
                    onClick={() => setRole(r)}
                    className={`flex-1 h-12 font-black text-[10px] uppercase tracking-widest border transition-all ${
                      role === r
                        ? 'bg-white text-slate-950 border-white'
                        : 'bg-white/5 border-white/10 text-slate-400 hover:border-white/20'
                    }`}
                  >
                    {r === 'editor' ? '✏️ Editor' : '👁 Viewer'}
                  </button>
                ))}
              </div>
              <p className="text-[9px] text-slate-600 uppercase tracking-widest">
                {role === 'editor'
                  ? 'Can add comments and suggest changes'
                  : 'Can only view the trip (read-only)'}
              </p>
            </div>

            <button
              type="submit"
              disabled={loading || !email.trim()}
              className="btn-primary w-full h-14"
            >
              {loading ? 'Adding...' : '➕ Add Collaborator'}
            </button>
          </form>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default InviteCollaboratorModal;
