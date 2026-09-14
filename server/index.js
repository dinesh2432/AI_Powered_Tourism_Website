require('dotenv').config();
const http = require('http');
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const { Server } = require('socket.io');
const jwt = require('jsonwebtoken');
const connectDB = require('./config/db');

// Route imports
const authRoutes = require('./routes/authRoutes');
const tripRoutes = require('./routes/tripRoutes');
const guideRoutes = require('./routes/guideRoutes');
const chatRoutes = require('./routes/chatRoutes');
const adminRoutes = require('./routes/adminRoutes');
const weatherRoutes = require('./routes/weatherRoutes');
const exploreRoutes = require('./routes/exploreRoutes');
const paymentRoutes = require('./routes/paymentRoutes');
const bookingRoutes = require('./routes/bookingRoutes');
const invitationRoutes = require('./routes/invitationRoutes');

// Connect to Database
connectDB();

const app = express();

// ── Security Headers (helmet) ────────────────────────────────────────────
app.use(helmet({
  crossOriginEmbedderPolicy: false, // Allow Cloudinary images / external embeds
  contentSecurityPolicy: false,     // Managed separately on the frontend
}));

// ── Rate Limiters ────────────────────────────────────────────────────────
// Strict limiter for sensitive auth endpoints (login, register, forgot-password)
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,  // 15 minutes
  max: 10,                    // max 10 requests per window per IP
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: 'Too many attempts. Please try again after 15 minutes.' },
  skip: (req) => process.env.NODE_ENV === 'test', // skip during automated tests
});

// General API limiter (all other routes)
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 300,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: 'Too many requests. Please slow down.' },
  skip: (req) => process.env.NODE_ENV === 'test',
});

// ── CORS ─────────────────────────────────────────────────────────────────
// BUG-12 FIX: Allow both local dev and production frontend origins
const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:5174',
  'http://localhost:3000',
  process.env.CLIENT_URL,
].filter(Boolean);

app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (e.g. mobile apps, Postman, curl)
    if (!origin) return callback(null, true);
    if (allowedOrigins.includes(origin)) return callback(null, true);
    callback(new Error(`CORS policy does not allow access from ${origin}`));
  },
  credentials: true,
}));

// ── Body Parsers ─────────────────────────────────────────────────────────
// Limit JSON body to 2mb — file uploads go through multer/cloudinary (unaffected)
app.use(express.json({ limit: '2mb' }));
app.use(express.urlencoded({ extended: true, limit: '2mb' }));

// ── Routes ───────────────────────────────────────────────────────────────
// Auth routes get the strict rate limiter
app.use('/api/auth', authLimiter, authRoutes);
// All other API routes get the general limiter
app.use('/api/trips', apiLimiter, tripRoutes);
app.use('/api/guides', apiLimiter, guideRoutes);
app.use('/api/chat', apiLimiter, chatRoutes);
app.use('/api/admin', apiLimiter, adminRoutes);
app.use('/api/weather', apiLimiter, weatherRoutes);
app.use('/api/explore', apiLimiter, exploreRoutes);
app.use('/api/payments', apiLimiter, paymentRoutes);
app.use('/api/bookings', apiLimiter, bookingRoutes);
app.use('/api', apiLimiter, invitationRoutes); // handles /api/notifications, /api/invitations/*, /api/trips/:id/invite

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'AI Tourism API is running 🚀' });
});

// Global Error Handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  const statusCode = err.statusCode || 500;
  res.status(statusCode).json({
    success: false,
    message: err.message || 'Internal Server Error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });
});

// ── Socket.io Setup ───────────────────────────────────────────────────────────
// Wrap Express app in a native HTTP server so Socket.io can share the same port
const httpServer = http.createServer(app);

const io = new Server(httpServer, {
  cors: {
    origin: allowedOrigins,
    methods: ['GET', 'POST', 'PATCH'],
    credentials: true,
  },
});

/**
 * JWT Auth middleware for Socket.io connections.
 * Clients must send { auth: { token: '<jwt>' } } when connecting.
 */
io.use((socket, next) => {
  const token = socket.handshake.auth?.token;
  if (!token) return next(new Error('Authentication required'));
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    socket.userId   = decoded.id;
    socket.userName = decoded.name || 'Collaborator';
    next();
  } catch {
    next(new Error('Invalid or expired token'));
  }
});

// In-memory map of tripId → Set of { socketId, userId, userName }
const tripPresence = new Map();

io.on('connection', (socket) => {
  console.log(`[Socket.io] User ${socket.userId} connected (${socket.id})`);

  // ── Join a trip room ─────────────────────────────────────────────────────
  socket.on('trip:join', ({ tripId, userName }) => {
    socket.join(tripId);

    // Track presence
    if (!tripPresence.has(tripId)) tripPresence.set(tripId, new Map());
    tripPresence.get(tripId).set(socket.id, {
      socketId: socket.id,
      userId: socket.userId,
      userName: userName || socket.userName || 'Collaborator',
    });

    // Broadcast updated presence list to all in the room
    const users = [...(tripPresence.get(tripId)?.values() || [])];
    io.to(tripId).emit('trip:presence', { users });

    console.log(`[Socket.io] User ${socket.userId} joined trip room ${tripId}`);
  });

  // ── Leave a trip room ─────────────────────────────────────────────────────
  socket.on('trip:leave', ({ tripId }) => {
    socket.leave(tripId);
    if (tripPresence.has(tripId)) {
      tripPresence.get(tripId).delete(socket.id);
      const users = [...(tripPresence.get(tripId)?.values() || [])];
      io.to(tripId).emit('trip:presence', { users });
    }
  });

  // ── Broadcast a trip update to all collaborators in real-time ────────────
  // Called by the frontend AFTER a successful PATCH /api/trips/:id response
  socket.on('trip:updated', ({ tripId, trip, editedBy }) => {
    // Broadcast to everyone in the room EXCEPT the sender
    socket.to(tripId).emit('trip:updated', { trip, editedBy });
    console.log(`[Socket.io] Trip ${tripId} updated by ${editedBy?.name}`);
  });

  // ── Typing / cursor presence ──────────────────────────────────────────────
  socket.on('trip:editing', ({ tripId, field, userName }) => {
    socket.to(tripId).emit('trip:editing', { field, userName, userId: socket.userId });
  });

  // ── Cleanup on disconnect ────────────────────────────────────────────────
  socket.on('disconnect', () => {
    console.log(`[Socket.io] User ${socket.userId} disconnected`);
    // Remove from all rooms this socket was in
    tripPresence.forEach((members, tripId) => {
      if (members.has(socket.id)) {
        members.delete(socket.id);
        const users = [...(members.values())];
        io.to(tripId).emit('trip:presence', { users });
      }
    });
  });
});

// Export io so controllers can emit events if needed
module.exports.io = io;

// ── Start reminder scheduler ──────────────────────────────────────────────────
require('./utils/reminderScheduler');

const PORT = process.env.PORT || 5000;
httpServer.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
  console.log(`🔌 Socket.io ready on ws://localhost:${PORT}`);
});
