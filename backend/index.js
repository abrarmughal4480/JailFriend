const dotenv = require('dotenv');
// Load environment variables first
dotenv.config();

const express = require('express');
const http = require('http');
const connectDB = require('./config/db');
const socketService = require('./services/socketService');
const authRoutes = require('./routes/authRoutes');
const postRoutes = require('./routes/postRoutes');
const albumRoutes = require('./routes/albumRoutes');
const videoRoutes = require('./routes/videoRoutes');
const reelRoutes = require('./routes/reelRoutes');
const eventRoutes = require('./routes/eventRoutes');
const groupRoutes = require('./routes/groupRoutes');
const orderRoutes = require('./routes/orderRoutes');
const productRoutes = require('./routes/productRoutes');
const pageRoutes = require('./routes/pageRoutes');
const jobRoutes = require('./routes/jobRoutes');
const profileRoutes = require('./routes/profileRoutes');
const userRoutes = require('./routes/userRoutes');
const userImageRoutes = require('./routes/userImageRoutes');
const upgradeRoutes = require('./routes/upgradeRoutes');
const fileMonitorRoutes = require('./routes/fileMonitorRoutes');
const movieRoutes = require('./routes/movieRoutes');
const storyRoutes = require('./routes/storyRoutes');
const uploadRoutes = require('./routes/uploadRoutes');
const privacyRoutes = require('./routes/privacyRoutes');
const passwordRoutes = require('./routes/passwordRoutes');
const notificationRoutes = require('./routes/notificationRoutes');
const socialLinksRoutes = require('./routes/socialLinksRoutes');
const verificationRoutes = require('./routes/verificationRoutes');
const adminRoutes = require('./routes/adminRoutes');
const websiteSettingsRoutes = require('./routes/websiteSettingsRoutes');
const fileRoutes = require('./routes/fileRoutes');
const searchRoutes = require('./routes/searchRoutes');
const messageRoutes = require('./routes/messageRoutes');
const locationRoutes = require('./routes/locationRoutes');
const audioCallRoutes = require('./routes/audioCallRoutes');
const p2pRoutes = require('./routes/p2pRoutes');
const bookingRoutes = require('./routes/bookingRoutes');
const videoCallRoutes = require('./routes/videoCallRoutes');
const session = require('express-session');
const fs = require('fs');
const path = require('path');
const walletRoutes = require('./routes/walletRoutes');
const advertisementRoutes = require('./routes/advertisementRoutes');
const categoryRoutes = require('./routes/categoryRoutes');
// Temporarily comment out passport to fix route loading
const passport = require('passport');
require('./config/passport'); // Passport strategies config (to be created)

// Set fallback JWT_SECRET if not provided
if (!process.env.JWT_SECRET) {
  process.env.JWT_SECRET = 'jaifriend-secure-jwt-secret-key-2024-production';
  if (process.env.NODE_ENV === 'development') {
    console.log('Using fallback JWT_SECRET. Set JWT_SECRET in .env for production.');
  }
}

// Connect to database (optional for now)
if (process.env.MONGO_URI) {
  connectDB();
} else if (process.env.NODE_ENV === 'development') {
  console.log('No MONGO_URI provided. Database features will not work.');
}

// Create uploads directories if they don't exist
const uploadsDir = path.join(__dirname, 'uploads');
const profilePhotosDir = path.join(uploadsDir, 'profile-photos');
const coverPhotosDir = path.join(uploadsDir, 'cover-photos');
const postMediaDir = path.join(uploadsDir, 'post-media');

[uploadsDir, profilePhotosDir, coverPhotosDir, postMediaDir].forEach(dir => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
});

const app = express();

//Force HTTPS in production - Commented out for Railway deployment
//Railway handles HTTPS automatically, so we don't need this redirect
if (process.env.NODE_ENV === 'production') {
  app.use((req, res, next) => {
    // Skip HTTPS redirect for preflight OPTIONS requests to avoid CORS issues
    if (req.method === 'OPTIONS') {
      return next();
    }
    if (req.headers['x-forwarded-proto'] !== 'https') {
      return res.redirect(`https://${req.headers.host}${req.url}`);
    }
    next();
  });
}

// CORS configuration - must come before other middleware
const cors = require('cors');

// Define allowed origins
const allowedOrigins = [
  'http://localhost:3000',
  'http://localhost:3001',
  'https://jaifriend.hgdjlive.com',
  'http://192.168.43.120:3000',
  'https://jaifriend-backend.hgdjlive.com'
];

// Add any additional origins from environment variables
if (process.env.FRONTEND_URL) {
  allowedOrigins.push(process.env.FRONTEND_URL);
}
if (process.env.API_URL) {
  allowedOrigins.push(process.env.API_URL);
}

// CORS options
const corsOptions = {
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);

    // In development, allow all localhost origins
    if (process.env.NODE_ENV === 'development') {
      if (origin.includes('localhost') || origin.includes('127.0.0.1')) {
        return callback(null, true);
      }
    }

    if (allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      console.log('CORS blocked origin:', origin);
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept', 'Origin', 'X-Forwarded-Proto'],
  optionsSuccessStatus: 200 // Some legacy browsers (IE11, various SmartTVs) choke on 204
};

app.use(cors(corsOptions));

// Handle preflight requests explicitly
app.options('*', cors(corsOptions));

// Debug CORS in development
if (process.env.NODE_ENV === 'development') {
  app.use((req, res, next) => {
    console.log(`CORS Debug - ${req.method} ${req.url} - Origin: ${req.headers.origin}`);
    next();
  });
}

// Ensure CORS headers are always set, even for error responses
app.use((req, res, next) => {
  const origin = req.headers.origin;

  // Set CORS headers for all responses
  if (origin && (allowedOrigins.includes(origin) || process.env.NODE_ENV === 'development')) {
    res.header('Access-Control-Allow-Origin', origin);
  } else if (process.env.NODE_ENV === 'development') {
    res.header('Access-Control-Allow-Origin', '*');
  }

  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS, PATCH');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With, Accept, Origin, X-Forwarded-Proto');
  res.header('Access-Control-Allow-Credentials', 'true');

  next();
});

// Trust proxy for proper IP detection (important for IP-based geolocation)
app.set('trust proxy', true);

// Request logging middleware (only in development)
if (process.env.NODE_ENV === 'development') {
  app.use((req, res, next) => {
    console.log(`${req.method} ${req.originalUrl} - IP: ${req.ip}`);
    next();
  });
}



// IMPORTANT: Middleware for parsing JSON
app.use(express.json({ limit: '100mb' }));
app.use(express.urlencoded({ extended: true, limit: '100mb' }));

app.use(session({
  secret: process.env.SESSION_SECRET || 'your_secret',
  resave: false,
  saveUninitialized: false,
}));
// Temporarily comment out passport middleware
app.use(passport.initialize());
app.use(passport.session());

// Mount auth routes FIRST, before other routes
try {
  app.use('/api/auth', authRoutes);
} catch (error) {
  if (process.env.NODE_ENV === 'development') {
    console.error('Error loading auth routes:', error);
  }
}

// Mount all other routes AFTER auth routes
app.use('/api/users', userRoutes);
app.use('/api/userimages', userImageRoutes);
app.use('/api/posts', postRoutes);
app.use('/api/albums', albumRoutes);
app.use('/api/videos', videoRoutes);
try {
  app.use('/api/reels', reelRoutes);
} catch (error) {
  if (process.env.NODE_ENV === 'development') {
    console.error('Error loading reels routes:', error);
  }
}
app.use('/api/events', eventRoutes);
app.use('/api/groups', groupRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/products', productRoutes);
app.use('/api/pages', pageRoutes);
app.use('/api/jobs', jobRoutes);
app.use('/api/profile', profileRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/privacy', privacyRoutes);
app.use('/api/password', passwordRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/upgrade', upgradeRoutes);
app.use('/api/filemonitor', fileMonitorRoutes);
app.use('/api/movies', movieRoutes);
app.use('/api/stories', storyRoutes);
app.use('/api/social-links', socialLinksRoutes);
app.use('/api/verification', verificationRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/website-settings', websiteSettingsRoutes);
const proSystemRoutes = require('./routes/proSystemRoutes');
app.use('/api/admin/pro-system', proSystemRoutes);
app.use('/admin/pro-system', proSystemRoutes); // Fallback for clients missing /api prefix
app.use('/api/files', fileRoutes);
app.use('/api/search', searchRoutes);
app.use('/api/messages', messageRoutes);
app.use('/api/location', locationRoutes);
app.use('/api/audio-calls', audioCallRoutes);
app.use('/api/p2p', p2pRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/video-calls', videoCallRoutes);
app.use('/api/wallet', walletRoutes);
app.use('/api/advertisements', advertisementRoutes);
app.use('/api/categories', categoryRoutes);
// Static file serving for uploads and avatars
app.use('/uploads', express.static(require('path').join(__dirname, 'uploads')));
app.use('/avatars', express.static(require('path').join(__dirname, '../frontend/public/avatars')));

app.get('/', (req, res) => {
  res.send('API is running 🚀');
});

// Test routes removed - no longer needed





// Global error handler for multer and other errors
app.use((error, req, res, next) => {
  // Handle multer errors
  if (error.code === 'LIMIT_FILE_SIZE') {
    return res.status(400).json({
      message: 'File too large',
      error: 'File size exceeds the 100MB limit'
    });
  }

  if (error.code === 'LIMIT_FILE_COUNT') {
    return res.status(400).json({
      message: 'Too many files',
      error: 'Maximum 10 files allowed per upload'
    });
  }

  if (error.message && error.message.includes('File type not supported')) {
    return res.status(400).json({
      message: 'Unsupported file type',
      error: error.message
    });
  }

  // Handle other errors
  if (process.env.NODE_ENV === 'development') {
    console.error('Unhandled error:', error);
  }
  res.status(500).json({
    message: 'Internal server error',
    error: process.env.NODE_ENV === 'development' ? error.message : 'Something went wrong'
  });
});

// Health check route
app.get('/api/health', (req, res) => {
  res.json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    jwtSecret: process.env.JWT_SECRET ? 'Set' : 'Not set',
    environment: process.env.NODE_ENV || 'development'
  });
});

// Add 404 handler
app.use('*', (req, res) => {
  if (process.env.NODE_ENV === 'development') {
    console.log('404 - Route not found:', req.method, req.originalUrl);
  }
  res.status(404).json({
    message: 'Route not found',
    method: req.method,
    url: req.originalUrl
  });
});

const PORT = process.env.PORT || 5000;

// Create HTTP server
const server = http.createServer(app);

// Initialize Socket.IO
socketService.initialize(server);

server.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`🔌 Socket.IO initialized`);

  const fileMonitor = require('./utils/fileMonitor');
  const storyCleanup = require('./utils/storyCleanup');

  setTimeout(() => {
    fileMonitor.startWatching();
    storyCleanup.startCleanupScheduler();
  }, 2000); // Start after 2 seconds to ensure everything is loaded
});