/**
 * TripEditPanel.jsx
 *
 * Collaborative editing panel shown inside TripDetailPage for owners + editors.
 * Features:
 *  - Edit trip overview (notes), daily activity descriptions
 *  - Save via REST PATCH → emit via Socket.io for real-time sync
 *  - Audit trail: shows "Last edited by X at Y"
 *  - Live presence: shows who else is online in this trip
 *  - Typing indicators: "Alex is editing Day 1..."
 */
import { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../services/api';
import useTripSocket from '../services/useTripSocket';
import toast from 'react-hot-toast';

// ── Presence Avatar ─────────────────────────────────────────────────────────
const PresenceAvatar = ({ name, isMe }) => (
  <div
    title={isMe ? `${name} (You)` : name}
    className="relative"
  >
    <div
      className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold border-2 transition-transform hover:scale-110"
      style={{
        background: isMe ? 'rgba(var(--accent), 0.2)' : 'rgba(59,130,246,0.2)',
        color: isMe ? 'rgb(var(--accent))' : '#60a5fa',
        borderColor: isMe ? 'rgb(var(--accent))' : '#60a5fa',
      }}
    >
      {name?.[0]?.toUpperCase() || '?'}
    </div>
    {/* Green dot = online */}
    <span
      className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full border-2"
      style={{ background: '#22c55e', borderColor: 'var(--bg-card)' }}
    />
  </div>
);

// ── Inline editable text field ──────────────────────────────────────────────
const EditableText = ({ value, onChange, onBlur, placeholder, multiline = false, className = '', disabled = false }) => {
  if (multiline) {
    return (
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onBlur={onBlur}
        placeholder={placeholder}
        disabled={disabled}
        rows={4}
        className={`w-full bg-transparent border rounded-xl px-3 py-2 text-sm resize-none outline-none transition-all focus:ring-2 ${className}`}
        style={{
          border: '1px solid var(--border-strong)',
          color: 'var(--text-primary)',
          background: 'var(--bg-hover)',
        }}
        onFocus={(e) => { e.target.style.borderColor = 'rgb(var(--accent))'; }}
      />
    );
  }
  return (
    <input
      type="text"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      onBlur={onBlur}
      placeholder={placeholder}
      disabled={disabled}
      className={`w-full bg-transparent border rounded-xl px-3 py-2 text-sm outline-none transition-all ${className}`}
      style={{
        border: '1px solid var(--border-strong)',
        color: 'var(--text-primary)',
        background: 'var(--bg-hover)',
      }}
      onFocus={(e) => { e.target.style.borderColor = 'rgb(var(--accent))'; }}
    />
  );
};

// ── Main Component ──────────────────────────────────────────────────────────
const TripEditPanel = ({ trip: initialTrip, isOwner, isEditor, currentUser, onTripUpdate }) => {
  const canEdit = isOwner || isEditor;

  const [trip, setTrip] = useState(initialTrip);
  const [editMode, setEditMode] = useState(false);
  const [saving, setSaving] = useState(false);
  const [onlineUsers, setOnlineUsers] = useState([]);
  const [typingInfo, setTypingInfo] = useState(null); // { field, userName }
  const typingTimer = useRef(null);

  // Local edit state — mirrors trip fields we allow editing
  const [draft, setDraft] = useState({
    notes: initialTrip?.notes || '',
    overview: initialTrip?.aiResponse?.overview || '',
  });

  // Sync if parent passes a new trip (e.g., after remote update)
  useEffect(() => {
    setTrip(initialTrip);
    setDraft({
      notes: initialTrip?.notes || '',
      overview: initialTrip?.aiResponse?.overview || '',
    });
  }, [initialTrip]);

  // ── Socket.io handlers ────────────────────────────────────────────────────
  const handleRemoteUpdate = useCallback(({ trip: updatedTrip, editedBy }) => {
    setTrip(updatedTrip);
    setDraft({
      notes: updatedTrip?.notes || '',
      overview: updatedTrip?.aiResponse?.overview || '',
    });
    onTripUpdate?.(updatedTrip);
    toast(`✏️ ${editedBy?.name || 'A collaborator'} made changes`, {
      icon: '🔄',
      duration: 3000,
    });
  }, [onTripUpdate]);

  const handlePresence = useCallback(({ users }) => {
    setOnlineUsers(users || []);
  }, []);

  const handleEditing = useCallback(({ field, userName }) => {
    setTypingInfo({ field, userName });
    clearTimeout(typingTimer.current);
    typingTimer.current = setTimeout(() => setTypingInfo(null), 3000);
  }, []);

  const { emitUpdate, emitEditing } = useTripSocket(trip?._id, {
    onTripUpdate: handleRemoteUpdate,
    onPresence: handlePresence,
    onEditing: handleEditing,
    userName: currentUser?.name,
  });

  // ── Save Changes ──────────────────────────────────────────────────────────
  const handleSave = async () => {
    if (!canEdit) return;
    setSaving(true);
    try {
      const payload = {
        notes: draft.notes,
        aiResponse: {
          ...trip.aiResponse,
          overview: draft.overview,
        },
      };

      const { data } = await api.patch(`/trips/${trip._id}`, payload);
      const updatedTrip = data.trip;

      setTrip(updatedTrip);
      onTripUpdate?.(updatedTrip);
      setEditMode(false);

      // Broadcast to other collaborators via Socket.io
      emitUpdate(updatedTrip, { name: currentUser?.name, id: currentUser?._id });

      toast.success('Changes saved and synced with collaborators ✅');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Save failed. Try again.');
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    setDraft({
      notes: trip?.notes || '',
      overview: trip?.aiResponse?.overview || '',
    });
    setEditMode(false);
  };

  // Signal typing to other collaborators
  const handleFieldFocus = (field) => emitEditing(field);

  // ── Render ────────────────────────────────────────────────────────────────
  if (!trip) return null;

  const lastEditor = trip.lastEditedBy;
  const lastAt = trip.lastEditedAt;

  return (
    <div className="space-y-4">

      {/* ── Header: Edit toggle + Online presence ── */}
      <div
        className="card flex flex-col sm:flex-row items-start sm:items-center gap-4 justify-between"
      >
        <div>
          <h2 className="font-bold text-base" style={{ color: 'var(--text-primary)' }}>
            ✏️ Collaborative Editing
          </h2>
          {lastEditor && lastAt ? (
            <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>
              Last edited by <strong>{typeof lastEditor === 'object' ? lastEditor.name : 'a collaborator'}</strong>{' '}
              · {new Date(lastAt).toLocaleString()}
            </p>
          ) : (
            <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>
              No edits yet — be the first to add notes!
            </p>
          )}
        </div>

        <div className="flex items-center gap-3 flex-wrap">
          {/* Online presence avatars */}
          {onlineUsers.length > 0 && (
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-medium mr-1" style={{ color: 'var(--text-muted)' }}>Online:</span>
              <div className="flex -space-x-1">
                {onlineUsers.slice(0, 6).map((u, i) => (
                  <PresenceAvatar
                    key={u.socketId || i}
                    name={u.userName}
                    isMe={u.userId === currentUser?._id}
                  />
                ))}
                {onlineUsers.length > 6 && (
                  <div
                    className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold border-2"
                    style={{ background: 'var(--bg-hover)', color: 'var(--text-muted)', borderColor: 'var(--border)' }}
                  >
                    +{onlineUsers.length - 6}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Role badge */}
          <span
            className="text-xs font-bold px-2.5 py-1 rounded-lg"
            style={{
              background: isOwner
                ? 'rgba(var(--accent),0.15)'
                : isEditor
                ? 'rgba(59,130,246,0.12)'
                : 'var(--bg-hover)',
              color: isOwner ? 'rgb(var(--accent))' : isEditor ? '#60a5fa' : 'var(--text-muted)',
              border: isOwner
                ? '1px solid rgba(var(--accent),0.3)'
                : isEditor
                ? '1px solid rgba(59,130,246,0.3)'
                : '1px solid var(--border)',
            }}
          >
            {isOwner ? '👑 Owner' : isEditor ? '✏️ Editor' : '👁 Viewer'}
          </span>

          {canEdit && !editMode && (
            <button
              onClick={() => setEditMode(true)}
              className="btn-primary h-9 px-4 text-sm"
            >
              ✏️ Edit Trip
            </button>
          )}
        </div>
      </div>

      {/* ── Typing indicator ── */}
      <AnimatePresence>
        {typingInfo && (
          <motion.div
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs"
            style={{ background: 'rgba(59,130,246,0.08)', border: '1px solid rgba(59,130,246,0.2)', color: '#60a5fa' }}
          >
            <span className="flex gap-0.5">
              {[0, 1, 2].map(i => (
                <span
                  key={i}
                  className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-bounce"
                  style={{ animationDelay: `${i * 0.15}s` }}
                />
              ))}
            </span>
            <strong>{typingInfo.userName}</strong> is editing {typingInfo.field}...
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Edit Form ── */}
      <AnimatePresence>
        {editMode && canEdit && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className="card space-y-5"
          >
            <div
              className="flex items-center gap-2 pb-3"
              style={{ borderBottom: '1px solid var(--border)' }}
            >
              <span className="text-base">✏️</span>
              <h3 className="font-bold text-sm" style={{ color: 'var(--text-primary)' }}>
                Edit Trip Content
              </h3>
              <span
                className="ml-auto text-xs px-2 py-0.5 rounded-full animate-pulse"
                style={{ background: 'rgba(239,68,68,0.1)', color: '#f87171', border: '1px solid rgba(239,68,68,0.2)' }}
              >
                🔴 Editing
              </span>
            </div>

            {/* Trip Overview */}
            <div>
              <label className="text-xs font-semibold mb-2 block" style={{ color: 'var(--text-muted)' }}>
                📋 Trip Overview
              </label>
              <EditableText
                value={draft.overview}
                onChange={(v) => setDraft(d => ({ ...d, overview: v }))}
                onBlur={() => handleFieldFocus('overview')}
                placeholder="Describe this trip..."
                multiline
              />
            </div>

            {/* Collaborative Notes */}
            <div>
              <label className="text-xs font-semibold mb-2 block" style={{ color: 'var(--text-muted)' }}>
                📝 Collaborative Notes
                <span className="ml-2 font-normal opacity-60">(visible to all collaborators)</span>
              </label>
              <EditableText
                value={draft.notes}
                onChange={(v) => setDraft(d => ({ ...d, notes: v }))}
                onBlur={() => handleFieldFocus('notes')}
                placeholder="Add shared notes, reminders, or ideas for the trip..."
                multiline
              />
              <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>
                {draft.notes.length}/5000 characters
              </p>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3 pt-2" style={{ borderTop: '1px solid var(--border)' }}>
              <button
                onClick={handleSave}
                disabled={saving}
                className="btn-primary h-10 px-6 text-sm font-bold disabled:opacity-50"
              >
                {saving ? (
                  <span className="flex items-center gap-2">
                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Saving & Syncing...
                  </span>
                ) : '💾 Save & Sync'}
              </button>
              <button
                onClick={handleCancel}
                disabled={saving}
                className="btn-secondary h-10 px-5 text-sm"
              >
                Cancel
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Shared Notes Display (read mode) ── */}
      {!editMode && trip.notes && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="card"
        >
          <h3 className="text-sm font-bold mb-3 flex items-center gap-2" style={{ color: 'var(--text-primary)' }}>
            📝 Shared Notes
            {lastEditor && (
              <span className="text-xs font-normal ml-auto" style={{ color: 'var(--text-muted)' }}>
                by {typeof lastEditor === 'object' ? lastEditor.name : 'collaborator'}
              </span>
            )}
          </h3>
          <p
            className="text-sm leading-relaxed whitespace-pre-wrap"
            style={{ color: 'var(--text-secondary)' }}
          >
            {trip.notes}
          </p>
          {canEdit && (
            <button
              onClick={() => setEditMode(true)}
              className="mt-3 text-xs font-semibold hover:underline"
              style={{ color: 'rgb(var(--accent))' }}
            >
              ✏️ Edit notes
            </button>
          )}
        </motion.div>
      )}

      {/* Viewer message */}
      {!canEdit && (
        <div
          className="flex items-center gap-3 p-4 rounded-xl text-sm"
          style={{ background: 'var(--bg-hover)', border: '1px solid var(--border)', color: 'var(--text-muted)' }}
        >
          <span className="text-xl">👁</span>
          <div>
            <p className="font-medium" style={{ color: 'var(--text-secondary)' }}>View-only access</p>
            <p className="text-xs">You have been added as a viewer. Only editors and the trip owner can make changes.</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default TripEditPanel;
