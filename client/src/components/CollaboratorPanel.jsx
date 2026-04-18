import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import InviteCollaboratorModal from './InviteCollaboratorModal';
import ShareTripModal from './ShareTripModal';
import toast from 'react-hot-toast';

// ── Role badge — theme-aware ──────────────────────────────────────────────────
const RoleBadge = ({ role }) => {
  const styles = {
    owner:  { background: 'rgba(var(--accent), 0.15)', color: 'rgb(var(--accent))',  border: '1px solid rgba(var(--accent), 0.3)' },
    editor: { background: 'rgba(59,130,246,0.12)', color: '#60a5fa',                 border: '1px solid rgba(59,130,246,0.3)' },
    viewer: { background: 'var(--bg-hover)',        color: 'var(--text-muted)',       border: '1px solid var(--border)' },
  };
  const icons = { owner: '👑', editor: '✏️', viewer: '👁' };
  const s = styles[role] || styles.viewer;
  return (
    <span
      className="text-xs font-bold px-2.5 py-1 rounded-lg flex items-center gap-1"
      style={s}
    >
      <span>{icons[role]}</span>
      {role}
    </span>
  );
};

// ── Avatar — theme-aware ──────────────────────────────────────────────────────
const Avatar = ({ user }) => {
  if (user?.profileImage) {
    return (
      <img
        src={user.profileImage}
        alt={user?.name}
        className="w-10 h-10 rounded-full object-cover"
        style={{ border: '2px solid var(--border-strong)' }}
      />
    );
  }
  return (
    <div
      className="w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm"
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

// ── Confirmation dialog ───────────────────────────────────────────────────────
const ConfirmDialog = ({ name, onConfirm, onCancel, loading }) => (
  <motion.div
    initial={{ opacity: 0, scale: 0.95, y: -4 }}
    animate={{ opacity: 1, scale: 1, y: 0 }}
    exit={{ opacity: 0, scale: 0.95, y: -4 }}
    transition={{ duration: 0.15 }}
    className="mt-3 p-3 rounded-xl"
    style={{ background: 'rgba(239,68,68,0.06)', border: '1px solid rgba(239,68,68,0.2)' }}
  >
    <p className="text-xs mb-3" style={{ color: 'var(--text-secondary)' }}>
      Remove <strong style={{ color: 'var(--text-primary)' }}>{name}</strong> from this trip?
    </p>
    <div className="flex gap-2">
      <button
        onClick={onConfirm}
        disabled={loading}
        className="px-3 py-1.5 rounded-lg text-xs font-bold text-white transition-all hover:opacity-90"
        style={{ background: 'rgb(239,68,68)' }}
      >
        {loading ? '…' : 'Yes, Remove'}
      </button>
      <button
        onClick={onCancel}
        className="px-3 py-1.5 rounded-lg text-xs font-bold transition-all"
        style={{ background: 'var(--bg-hover)', color: 'var(--text-secondary)', border: '1px solid var(--border)' }}
      >
        Cancel
      </button>
    </div>
  </motion.div>
);

// ── Status badge for invitations ──────────────────────────────────────────────
const StatusBadge = ({ status }) => {
  const map = {
    pending:  { bg: 'rgba(245,158,11,0.1)', color: '#f59e0b', label: '⏳ Pending' },
    accepted: { bg: 'rgba(16,185,129,0.1)', color: '#10b981', label: '✅ Accepted' },
    declined: { bg: 'rgba(239,68,68,0.1)',  color: '#ef4444', label: '❌ Declined' },
  };
  const s = map[status] || map.pending;
  return (
    <span className="text-xs font-semibold px-2 py-1 rounded-lg" style={{ background: s.bg, color: s.color }}>
      {s.label}
    </span>
  );
};

// ── Main component ────────────────────────────────────────────────────────────
const CollaboratorPanel = ({ tripId, isOwner }) => {
  const { user, effectivePlan } = useAuth(); // BUG-08 FIX: need effectivePlan for invite gate
  const [collaborators, setCollaborators] = useState([]);
  const [invitations, setInvitations] = useState([]);
  const [owner, setOwner] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [removing, setRemoving] = useState(null);
  const [confirmId, setConfirmId] = useState(null); // ID of collaborator awaiting delete confirmation
  const [activeTab, setActiveTab] = useState('members');

  useEffect(() => {
    fetchAll();
  }, [tripId]);

  const fetchAll = async () => {
    try {
      const requests = [api.get(`/trips/${tripId}/collaborators`)];
      if (isOwner) requests.push(api.get(`/trips/${tripId}/invitations`));
      const results = await Promise.allSettled(requests);

      if (results[0].status === 'fulfilled') {
        setOwner(results[0].value.data.owner);
        setCollaborators(results[0].value.data.collaborators);
      }
      if (isOwner && results[1]?.status === 'fulfilled') {
        setInvitations(results[1].value.data.invitations || []);
      }
    } catch {
      toast.error('Failed to load collaborators');
    } finally {
      setLoading(false);
    }
  };

  const handleRemove = async (collaboratorUserId) => {
    setRemoving(collaboratorUserId);
    try {
      await api.delete(`/trips/${tripId}/collaborators/${collaboratorUserId}`);
      setCollaborators((prev) => prev.filter((c) => c.user._id !== collaboratorUserId));
      toast.success('Collaborator removed');
      setConfirmId(null);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to remove');
    } finally {
      setRemoving(null);
    }
  };

  if (loading) {
    return (
      <div className="card p-10 space-y-4">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="h-14 rounded-xl shimmer" />
        ))}
      </div>
    );
  }

  const tabs = [
    { id: 'members', label: `Members (${collaborators.length + (owner ? 1 : 0)})` },
    ...(isOwner ? [{ id: 'invitations', label: `Invitations (${invitations.length})` }] : []),
  ];

  return (
    <>
      <InviteCollaboratorModal
        tripId={tripId}
        isOpen={showInviteModal}
        onClose={() => setShowInviteModal(false)}
        onInviteSent={(inv) => setInvitations((prev) => [inv, ...prev])}
      />
      <ShareTripModal
        tripId={tripId}
        isOpen={showShareModal}
        onClose={() => setShowShareModal(false)}
      />

      <div className="card p-5 md:p-8 space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <p className="text-xs font-semibold mb-1" style={{ color: 'rgb(var(--accent))' }}>
              Mission Team
            </p>
            <h3 className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>
              Collaborators
            </h3>
          </div>
          {isOwner && (
            <div className="flex gap-3">
              <button
                onClick={() => setShowShareModal(true)}
                className="h-10 px-5 text-xs font-bold rounded-xl transition-all"
                style={{
                  background: 'var(--bg-hover)',
                  border: '1px solid var(--border-strong)',
                  color: 'var(--text-secondary)',
                }}
              >
                🔗 Share
              </button>

              {/* BUG-08 FIX: Gate the invite button based on effective plan */}
              {effectivePlan === 'FREE' ? (
                <Link
                  to="/pricing"
                  title="Upgrade to PRO to invite collaborators"
                  className="h-10 px-5 text-xs font-bold rounded-xl flex items-center gap-1.5 transition-all hover:opacity-90"
                  style={{
                    background: 'rgba(var(--accent), 0.08)',
                    border: '1px dashed rgba(var(--accent), 0.4)',
                    color: 'rgb(var(--accent))',
                  }}
                >
                  🔒 Invite (PRO)
                </Link>
              ) : (
                <button
                  id="invite-collaborator-btn"
                  onClick={() => setShowInviteModal(true)}
                  className="btn-primary h-10 px-5 text-xs"
                >
                  + Invite
                </button>
              )}
            </div>
          )}
        </div>

        {/* Tab navigation */}
        {tabs.length > 1 && (
          <div className="flex gap-2">
            {tabs.map((t) => (
              <button
                key={t.id}
                onClick={() => setActiveTab(t.id)}
                className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
                  activeTab === t.id ? 'tab-btn-active' : 'tab-btn'
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>
        )}

        <AnimatePresence mode="wait">

          {/* ── Members Tab ── */}
          {activeTab === 'members' && (
            <motion.div
              key="members"
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              className="space-y-3"
            >
              {/* Owner row */}
              {owner && (
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: 'var(--text-muted)' }}>
                    Owner
                  </p>
                  <div
                    className="flex items-center gap-4 p-4 rounded-2xl"
                    style={{ background: 'var(--bg-hover)', border: '1px solid var(--border)' }}
                  >
                    <Avatar user={owner} />
                    <div className="flex-1 min-w-0">
                      {/* BUG 3 FIX: use CSS variable, not hardcoded text-white */}
                      <p className="font-bold text-sm truncate" style={{ color: 'var(--text-primary)' }}>
                        {owner.name}
                      </p>
                      <p className="text-xs font-mono truncate mt-0.5" style={{ color: 'var(--text-muted)' }}>
                        {owner.email}
                      </p>
                    </div>
                    <RoleBadge role="owner" />
                  </div>
                </div>
              )}

              {/* Collaborators */}
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider mb-2 mt-2" style={{ color: 'var(--text-muted)' }}>
                  Team Members ({collaborators.length})
                </p>

                {collaborators.length === 0 ? (
                  <div className="py-10 text-center rounded-2xl" style={{ border: '1px dashed var(--border)' }}>
                    <div className="text-4xl mb-3">👥</div>
                    <p className="text-sm font-semibold" style={{ color: 'var(--text-muted)' }}>No collaborators yet</p>
                    {isOwner && (
                      <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>
                        Click "Invite" to send invitations
                      </p>
                    )}
                  </div>
                ) : (
                  <div className="space-y-2">
                    {collaborators.map((c, i) => (
                      <motion.div
                        key={c.user._id || i}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.05 }}
                      >
                        <div
                          className="flex items-center gap-4 p-4 rounded-2xl"
                          style={{ background: 'var(--bg-hover)', border: '1px solid var(--border)' }}
                        >
                          <Avatar user={c.user} />
                          <div className="flex-1 min-w-0">
                            {/* BUG 3 FIX: CSS variable */}
                            <p className="font-bold text-sm truncate" style={{ color: 'var(--text-primary)' }}>
                              {c.user.name}
                            </p>
                            <p className="text-xs font-mono truncate mt-0.5" style={{ color: 'var(--text-muted)' }}>
                              {c.user.email}
                            </p>
                          </div>
                          <RoleBadge role={c.role} />

                          {/* BUG 4 FIX: always-visible delete button with confirm flow */}
                          {isOwner && (
                            <button
                              id={`remove-collaborator-${c.user._id}`}
                              onClick={() => setConfirmId(confirmId === c.user._id ? null : c.user._id)}
                              className="w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold transition-all shrink-0"
                              style={{
                                background: confirmId === c.user._id ? 'rgba(239,68,68,0.2)' : 'rgba(239,68,68,0.08)',
                                border: '1px solid rgba(239,68,68,0.25)',
                                color: 'rgb(239,68,68)',
                              }}
                            >
                              ✕
                            </button>
                          )}
                        </div>

                        {/* Inline confirmation dialog */}
                        <AnimatePresence>
                          {confirmId === c.user._id && isOwner && (
                            <ConfirmDialog
                              name={c.user.name}
                              loading={removing === c.user._id}
                              onConfirm={() => handleRemove(c.user._id)}
                              onCancel={() => setConfirmId(null)}
                            />
                          )}
                        </AnimatePresence>
                      </motion.div>
                    ))}
                  </div>
                )}
              </div>
            </motion.div>
          )}

          {/* ── Invitations Tab ── */}
          {activeTab === 'invitations' && isOwner && (
            <motion.div
              key="invitations"
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              className="space-y-3"
            >
              {invitations.length === 0 ? (
                <div className="py-10 text-center rounded-2xl" style={{ border: '1px dashed var(--border)' }}>
                  <div className="text-4xl mb-3">📩</div>
                  <p className="text-sm font-semibold" style={{ color: 'var(--text-muted)' }}>No invitations sent yet</p>
                </div>
              ) : (
                invitations.map((inv) => (
                  <div
                    key={inv._id}
                    className="flex items-center gap-4 p-4 rounded-2xl"
                    style={{ background: 'var(--bg-hover)', border: '1px solid var(--border)' }}
                  >
                    <Avatar user={inv.toUser} />
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-sm truncate" style={{ color: 'var(--text-primary)' }}>
                        {inv.toUser?.name || inv.toEmail}
                      </p>
                      <p className="text-xs font-mono truncate mt-0.5" style={{ color: 'var(--text-muted)' }}>
                        {inv.toEmail}
                      </p>
                    </div>
                    <RoleBadge role={inv.role} />
                    <StatusBadge status={inv.status} />
                  </div>
                ))
              )}
            </motion.div>
          )}

        </AnimatePresence>
      </div>
    </>
  );
};

export default CollaboratorPanel;
