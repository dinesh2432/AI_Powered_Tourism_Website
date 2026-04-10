import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useNotifications } from '../context/NotificationContext';
import api from '../services/api';
import toast from 'react-hot-toast';

const NotificationBell = () => {
  const { notifications, unreadCount, markAllRead, refresh } = useNotifications();
  const [open, setOpen] = useState(false);
  const [actionLoading, setActionLoading] = useState(null);
  const dropdownRef = useRef(null);
  const navigate = useNavigate();

  // Close dropdown when clicking outside
  useEffect(() => {
    const onClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', onClickOutside);
    return () => document.removeEventListener('mousedown', onClickOutside);
  }, []);

  const handleOpen = () => {
    setOpen((prev) => !prev);
    if (!open && unreadCount > 0) markAllRead();
  };

  const handleAccept = async (notification) => {
    setActionLoading(notification._id);
    try {
      const { data } = await api.post(`/invitations/${notification.inviteId}/accept`);
      toast.success(`Joined "${notification.tripName}" trip! 🎉`);
      refresh();
      setOpen(false);
      navigate(`/trips`);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to accept invitation');
    } finally {
      setActionLoading(null);
    }
  };

  const handleDecline = async (notification) => {
    setActionLoading(notification._id + '-decline');
    try {
      await api.post(`/invitations/${notification.inviteId}/decline`);
      toast.success('Invitation declined');
      refresh();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to decline');
    } finally {
      setActionLoading(null);
    }
  };

  const getNotificationIcon = (type) => {
    if (type === 'collaboration_invite') return '✈️';
    if (type === 'invite_accepted') return '✅';
    if (type === 'invite_declined') return '❌';
    return '🔔';
  };

  const getNotificationText = (n) => {
    if (n.type === 'collaboration_invite')
      return `${n.fromName} invited you to collaborate on "${n.tripName}" as ${n.role}`;
    if (n.type === 'invite_accepted')
      return `${n.fromName} accepted your collaboration invite for "${n.tripName}"`;
    if (n.type === 'invite_declined')
      return `${n.fromName} declined your invite for "${n.tripName}"`;
    return 'New notification';
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Bell button */}
      <button
        id="notification-bell-btn"
        onClick={handleOpen}
        title="Notifications"
        className="relative w-9 h-9 rounded-xl flex items-center justify-center transition-all duration-200 hover:scale-110"
        style={{
          background: open ? 'var(--bg-hover)' : 'var(--bg-glass)',
          border: '1px solid var(--border-strong)',
          color: 'var(--text-secondary)',
        }}
      >
        <span className="text-base">🔔</span>
        {/* Unread badge */}
        <AnimatePresence>
          {unreadCount > 0 && (
            <motion.span
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0 }}
              className="absolute -top-1.5 -right-1.5 min-w-[18px] h-[18px] rounded-full flex items-center justify-center text-[10px] font-black text-white"
              style={{ background: 'rgb(239, 68, 68)', padding: '0 4px' }}
            >
              {unreadCount > 9 ? '9+' : unreadCount}
            </motion.span>
          )}
        </AnimatePresence>
      </button>

      {/* Dropdown */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 8, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.96 }}
            transition={{ type: 'spring', stiffness: 400, damping: 30 }}
            className="absolute right-0 mt-2 w-80 rounded-2xl shadow-2xl overflow-hidden z-50"
            style={{
              background: 'var(--bg-secondary)',
              border: '1px solid var(--border-strong)',
            }}
          >
            {/* Header */}
            <div
              className="px-4 py-3 flex items-center justify-between border-b"
              style={{ borderColor: 'var(--border)' }}
            >
              <span className="font-bold text-sm" style={{ color: 'var(--text-primary)' }}>
                Notifications
              </span>
              {unreadCount > 0 && (
                <span
                  className="text-xs px-2 py-0.5 rounded-full font-semibold"
                  style={{ background: 'rgba(239,68,68,0.1)', color: 'rgb(239,68,68)' }}
                >
                  {unreadCount} new
                </span>
              )}
            </div>

            {/* Notification list */}
            <div className="max-h-[380px] overflow-y-auto">
              {notifications.length === 0 ? (
                <div className="py-10 text-center">
                  <div className="text-4xl mb-2">🔔</div>
                  <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
                    No notifications yet
                  </p>
                </div>
              ) : (
                notifications.map((n) => (
                  <div
                    key={n._id}
                    className="px-4 py-3 border-b last:border-0"
                    style={{
                      borderColor: 'var(--border)',
                      background: n.read ? 'transparent' : 'rgba(var(--accent), 0.04)',
                    }}
                  >
                    <div className="flex gap-3">
                      <span className="text-xl shrink-0 mt-0.5">{getNotificationIcon(n.type)}</span>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm leading-snug" style={{ color: 'var(--text-primary)' }}>
                          {getNotificationText(n)}
                        </p>
                        <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>
                          {new Date(n.createdAt).toLocaleDateString('en-US', {
                            month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit',
                          })}
                        </p>

                        {/* Accept / Decline buttons for pending invites */}
                        {n.type === 'collaboration_invite' && n.inviteId && (
                          <div className="flex gap-2 mt-2">
                            <button
                              id={`accept-invite-${n._id}`}
                              onClick={() => handleAccept(n)}
                              disabled={actionLoading === n._id}
                              className="px-3 py-1.5 rounded-lg text-xs font-bold text-white transition-all hover:opacity-90"
                              style={{ background: 'rgb(var(--accent))' }}
                            >
                              {actionLoading === n._id ? '⏳' : '✅ Accept'}
                            </button>
                            <button
                              id={`decline-invite-${n._id}`}
                              onClick={() => handleDecline(n)}
                              disabled={actionLoading === n._id + '-decline'}
                              className="px-3 py-1.5 rounded-lg text-xs font-bold transition-all"
                              style={{
                                background: 'var(--bg-hover)',
                                color: 'var(--text-secondary)',
                                border: '1px solid var(--border)',
                              }}
                            >
                              {actionLoading === n._id + '-decline' ? '⏳' : 'Decline'}
                            </button>
                          </div>
                        )}
                      </div>

                      {/* Unread dot */}
                      {!n.read && (
                        <div
                          className="w-2 h-2 rounded-full shrink-0 mt-1.5"
                          style={{ background: 'rgb(var(--accent))' }}
                        />
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default NotificationBell;
