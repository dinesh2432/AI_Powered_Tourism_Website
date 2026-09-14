/**
 * useTripSocket.js
 *
 * Custom hook that manages the Socket.io connection for a single trip room.
 * Usage:
 *   const { onlineUsers, emitUpdate, emitEditing } = useTripSocket(tripId, onTripUpdate);
 */
import { useEffect, useRef, useCallback } from 'react';
import { io } from 'socket.io-client';

const SOCKET_URL = import.meta.env.VITE_API_URL
  ? import.meta.env.VITE_API_URL.replace('/api', '')
  : 'http://localhost:5000';

/**
 * @param {string}   tripId       - MongoDB trip ID (the socket room key)
 * @param {function} onTripUpdate - Called with { trip, editedBy } when a remote user saves changes
 * @param {function} onPresence   - Called with { users } when someone joins/leaves
 * @param {function} onEditing    - Called with { field, userName } when remote user is typing
 * @param {string}   userName     - Current user's display name (sent to presence)
 */
const useTripSocket = (tripId, { onTripUpdate, onPresence, onEditing, userName } = {}) => {
  const socketRef = useRef(null);

  useEffect(() => {
    if (!tripId) return;

    const token = localStorage.getItem('token');
    if (!token) return;

    // Create socket connection — auth token sent in handshake
    const socket = io(SOCKET_URL, {
      auth: { token },
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 2000,
    });

    socketRef.current = socket;

    // ── Join the trip room once connected ─────────────────────────────────
    socket.on('connect', () => {
      socket.emit('trip:join', { tripId, userName });
    });

    // ── Listen for remote trip updates ────────────────────────────────────
    if (onTripUpdate) {
      socket.on('trip:updated', onTripUpdate);
    }

    // ── Listen for presence changes ───────────────────────────────────────
    if (onPresence) {
      socket.on('trip:presence', onPresence);
    }

    // ── Listen for typing/editing signals ────────────────────────────────
    if (onEditing) {
      socket.on('trip:editing', onEditing);
    }

    socket.on('connect_error', (err) => {
      console.warn('[Socket.io] Connection error:', err.message);
    });

    // ── Cleanup: leave room and disconnect ────────────────────────────────
    return () => {
      socket.emit('trip:leave', { tripId });
      socket.disconnect();
      socketRef.current = null;
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tripId]);

  /**
   * Emit a trip update to all other collaborators in the room.
   * Call this AFTER successfully saving via the REST API.
   */
  const emitUpdate = useCallback((trip, editedBy) => {
    socketRef.current?.emit('trip:updated', { tripId, trip, editedBy });
  }, [tripId]);

  /**
   * Signal that the current user is editing a specific field.
   * (Used to show "Alex is editing..." indicators to other users)
   */
  const emitEditing = useCallback((field) => {
    socketRef.current?.emit('trip:editing', { tripId, field, userName });
  }, [tripId, userName]);

  return { emitUpdate, emitEditing };
};

export default useTripSocket;
