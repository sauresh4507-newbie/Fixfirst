require('dotenv').config();
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const path = require('path');

const connectDB = require('./config/db');
const errorHandler = require('./middleware/errorHandler');

// Route imports
const authRoutes = require('./routes/authRoutes');
const customerRoutes = require('./routes/customerRoutes');
const repairRoutes = require('./routes/repairRoutes');
const aiRoutes = require('./routes/aiRoutes');
const vendorRoutes = require('./routes/vendorRoutes');
const quotationRoutes = require('./routes/quotationRoutes');
const bookingRoutes = require('./routes/bookingRoutes');
const notificationRoutes = require('./routes/notificationRoutes');
const adminRoutes = require('./routes/adminRoutes');

const app = express();
const server = http.createServer(app);

const allowedOrigins = [
  process.env.CLIENT_URL,
  'http://localhost:5173',
  'http://localhost:5000',
  'http://10.0.2.2:5000',
  'http://localhost',
  'https://localhost',
  'capacitor://localhost',
].filter(Boolean);

const checkCorsOrigin = (origin, callback) => {
  if (!origin || allowedOrigins.includes(origin) || process.env.NODE_ENV === 'development') {
    callback(null, true);
  } else {
    callback(null, true);
  }
};

// Socket.io
const io = new Server(server, {
  cors: {
    origin: checkCorsOrigin,
    methods: ['GET', 'POST'],
    credentials: true,
  },
});

// Make io accessible in controllers
app.set('io', io);

// Connect to MongoDB
connectDB();

// Security middleware
app.use(
  helmet({
    crossOriginResourcePolicy: { policy: 'cross-origin' },
  })
);

// CORS
app.use(
  cors({
    origin: checkCorsOrigin,
    credentials: true,
  })
);

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 200,
  message: { success: false, message: 'Too many requests. Please try again later.' },
  standardHeaders: true,
  legacyHeaders: false,
});
app.use('/api/', limiter);

// Auth routes have stricter rate limiting
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  message: { success: false, message: 'Too many login attempts. Please try again later.' },
});
app.use('/api/auth/', authLimiter);

// Compression
app.use(compression());

// Body parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Logging in development
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// Static uploads folder (local fallback)
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Health check
app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    message: 'FixFirst API is running',
    environment: process.env.NODE_ENV,
    timestamp: new Date().toISOString(),
  });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/customer', customerRoutes);
app.use('/api/repairs', repairRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/vendors', vendorRoutes);
app.use('/api/quotations', quotationRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/admin', adminRoutes);

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Route ${req.originalUrl} not found.`,
  });
});

// Centralized error handler
app.use(errorHandler);

// Socket.io connection
io.on('connection', (socket) => {
  const userId = socket.handshake.auth?.userId;

  if (userId) {
    socket.join(`user_${userId}`);
    console.log(`User ${userId} connected: ${socket.id}`);
  }

  socket.on('join_conversation', (conversationId) => {
    socket.join(`conversation_${conversationId}`);
  });

  socket.on('leave_conversation', (conversationId) => {
    socket.leave(`conversation_${conversationId}`);
  });

  socket.on('disconnect', () => {
    if (userId) {
      console.log(`User ${userId} disconnected: ${socket.id}`);
    }
  });
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`\n🚀 FixFirst Server running on port ${PORT} in ${process.env.NODE_ENV} mode`);
  console.log(`📡 API: http://localhost:${PORT}/api`);
  console.log(`🔧 Health: http://localhost:${PORT}/api/health\n`);
});

module.exports = { app, server, io };
