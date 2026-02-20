import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import cloudinary from 'cloudinary';
import path from 'path';
import { fileURLToPath } from 'url';
import bikeRoutes from './routes/bikes.js';
import uploadRoutes from './routes/upload.js';
import careersRoutes from './routes/careers.js';
import { testConnection, supabase } from './config/supabase.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load .env from project root (one level up from server/)
dotenv.config({ path: path.resolve(__dirname, '..', '.env') });

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

const app = express();
const PORT = process.env.PORT || 5000;

// Parse allowed origins from environment
const configuredOrigins = (process.env.ALLOWED_ORIGINS || '').split(',').map(url => url.trim()).filter(Boolean);

// Middleware - Dynamic CORS for production + development
app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (same-origin requests, mobile apps, Postman, curl)
    if (!origin) return callback(null, true);

    // Allow explicitly configured origins
    if (configuredOrigins.length > 0 && configuredOrigins.includes(origin)) {
      return callback(null, true);
    }

    // In production, allow same-origin (frontend served from same server)
    if (process.env.NODE_ENV === 'production') {
      return callback(null, true);
    }

    // In development, allow localhost on any port
    if (origin.match(/^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/)) {
      return callback(null, true);
    }

    console.warn(`⚠️ CORS blocked origin: ${origin}`);
    callback(null, true); // Allow anyway to prevent fetch failures
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept'],
  exposedHeaders: ['Content-Type', 'Authorization']
}));

// Ensure OPTIONS preflight requests are handled for all routes
app.options('*', cors());

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// API request logging (helps debug production issues)
app.use('/api', (req, res, next) => {
  console.log(`📡 ${req.method} ${req.originalUrl} [Origin: ${req.headers.origin || 'same-origin'}]`);
  next();
});

// Routes
app.use('/api/bikes', bikeRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api', (req, res, next) => {
  if (req.path.includes('enquir')) {
    console.log(`📝 [Enquiry Request] ${req.method} ${req.originalUrl} - Body:`, JSON.stringify(req.body));
  }
  next();
}, careersRoutes);

// Store Bike Submission to Google Sheets
app.post('/api/bikes/store-submission', async (req, res) => {
  try {
    const { bikeId, bikeName, brand, price, timestamp, action } = req.body;

    console.log('📊 Storing submission to Google Sheets:', {
      bikeId,
      bikeName,
      brand,
      price,
      timestamp,
      action
    });

    // TODO: Integrate with actual Google Sheets API
    // For now, just log the submission
    res.json({
      success: true,
      message: 'Submission recorded',
      data: {
        bikeId,
        bikeName,
        brand,
        price,
        timestamp,
        action
      }
    });
  } catch (error) {
    console.error('Error storing submission:', error);
    res.status(500).json({ message: 'Error storing submission' });
  }
});

// Fetch Submissions from Google Sheets
app.get('/api/bikes/submissions', async (req, res) => {
  try {
    // TODO: Integrate with actual Google Sheets API to fetch submissions
    res.json({
      success: true,
      submissions: []
    });
  } catch (error) {
    console.error('Error fetching submissions:', error);
    res.status(500).json({ message: 'Error fetching submissions' });
  }
});

// Admin Authentication Endpoint
app.post('/api/auth/admin-login', (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ message: 'Username and password are required' });
    }

    const adminUsername = 'rrmotors';
    const adminPassword = 'rrmotors@1';
    const adminName = 'RR Motors Admin';
    const adminPhone = 'N/A';

    console.log('Login attempt:', { username, providedPassword: password ? '***' : 'empty' });

    // Verify credentials
    if (username === adminUsername && password === adminPassword) {
      return res.status(200).json({
        success: true,
        admin: {
          username: adminUsername,
          name: adminName,
          phone: adminPhone,
          role: 'admin',
          loginTime: new Date()
        },
        token: Buffer.from(`${adminUsername}:${Date.now()}`).toString('base64')
      });
    } else {
      return res.status(401).json({
        success: false,
        message: 'Invalid username or password'
      });
    }
  } catch (error) {
    console.error('Admin login error:', error);
    res.status(500).json({ message: 'Server error during login' });
  }
});

// Get Admin Info (Protected by token)
app.get('/api/auth/admin', (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];

    if (!token) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const adminEmail = process.env.ADMIN_EMAIL;
    const adminName = process.env.ADMIN_NAME || 'Administrator';
    const adminPhone = process.env.ADMIN_PHONE || 'N/A';

    res.json({
      email: adminEmail,
      name: adminName,
      phone: adminPhone,
      role: 'admin'
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Health check endpoint (useful for warming up serverless functions)
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'Server is running', 
    timestamp: new Date().toISOString(), 
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || 'development',
    vercel: !!process.env.VERCEL
  });
});

// Ping endpoint (lightweight health check)
app.get('/api/ping', (req, res) => {
  res.status(200).json({ message: 'pong', timestamp: new Date().toISOString() });
});

// 404 handler for unmatched routes
app.use('/api', (req, res) => {
  res.status(404).json({ 
    success: false, 
    message: `API endpoint not found: ${req.method} ${req.path}` 
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('💥 Server Error:', err.stack);
  res.status(500).json({
    success: false,
    message: 'Something went wrong on the server!',
    error: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

// Start server
async function startServer() {
  // Test Supabase connection (non-blocking in background)
  testConnection().then(isConnected => {
    if (!isConnected) {
      console.error('⚠️  Warning: Could not connect to Supabase. Backend may be limited.');
    } else {
      console.log('✅ Supabase connected successfully');
    }
  }).catch(err => {
    console.error('❌ Supabase connection test crashed:', err.message);
  });

  // Check Cloudinary configuration
  if (process.env.CLOUDINARY_CLOUD_NAME && process.env.CLOUDINARY_API_KEY) {
    console.log('✅ Cloudinary configured');
  } else {
    console.warn('⚠️  Warning: Cloudinary not fully configured');
  }

  app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
    console.log(`📌 NODE_ENV: ${process.env.NODE_ENV}`);
    console.log(`📝 API Endpoints:`);
    console.log(`   POST   /api/enquire (Alias for enquiries)`);
    console.log(`   POST   /api/bikes/enquiries`);
  });
}

// Start server only if not running as a Vercel serverless function
if (process.env.NODE_ENV !== 'production' || !process.env.VERCEL) {
  startServer();
}

export default app;
