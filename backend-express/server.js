// ============================================
// CampusMarket Express - Main Server Entry Point
// ============================================
// This replaces NestJS main.ts and AppModule.
// Sets up Express with middleware, routes, and static file serving.

// Load environment variables first (like NestJS ConfigModule)
require('dotenv').config();

const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');

// Import database initialization/connection
const { initDatabase, testConnection } = require('./config/db');

// Import routes
const authRoutes = require('./routes/auth.routes');
const productsRoutes = require('./routes/products.routes');
const adminRoutes = require('./routes/admin.routes');

// Create Express app
const app = express();

// ============================================
// Middleware Setup
// ============================================

// Enable CORS for mobile app (same as NestJS app.enableCors())
app.use(cors({
  origin: true, // Allow all origins in development
  credentials: true,
}));

// Parse JSON request bodies (replaces NestJS automatic body parsing)
app.use(express.json());

// Parse URL-encoded bodies (for form submissions)
app.use(express.urlencoded({ extended: true }));

// ============================================
// Static File Serving
// ============================================

// Ensure uploads directories exist (same as NestJS main.ts)
const uploadsDir = path.join(__dirname, 'uploads');
const profilesDir = path.join(uploadsDir, 'profiles');
const productsDir = path.join(uploadsDir, 'products');

if (!fs.existsSync(profilesDir)) {
  fs.mkdirSync(profilesDir, { recursive: true });
}
if (!fs.existsSync(productsDir)) {
  fs.mkdirSync(productsDir, { recursive: true });
}

// Serve static files from uploads directory (same as NestJS app.useStaticAssets())
// Files will be accessible at /uploads/profiles/filename.jpg
app.use('/uploads', express.static(uploadsDir));

// ============================================
// API Routes
// ============================================

// Health check endpoint (like NestJS AppController.getHello())
app.get('/', (req, res) => {
  res.json({
    message: 'CampusMarket API - Express.js',
    version: '1.0.0',
    endpoints: {
      auth: '/auth',
      products: '/products',
      admin: '/admin',
    }
  });
});

// Mount route modules
app.use('/auth', authRoutes);
app.use('/products', productsRoutes);
app.use('/admin', adminRoutes);

// ============================================
// Error Handling
// ============================================

// 404 handler for undefined routes
app.use((req, res) => {
  res.status(404).json({
    message: `Cannot ${req.method} ${req.path}`,
    statusCode: 404
  });
});

// Global error handler (catches unhandled errors)
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({
    message: 'Internal server error',
    statusCode: 500
  });
});

// ============================================
// Start Server
// ============================================

const PORT = process.env.PORT || 3000;

// Keep the process alive
process.on('SIGINT', () => {
  console.log('\n👋 Shutting down server...');
  process.exit(0);
});

async function bootstrap() {
  // Initialize database schema (non-fatal)
  await initDatabase();

  // Test connection (non-fatal)
  await testConnection();

  // Start server regardless of DB state, so health endpoint works
  const server = app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 CampusMarket API (Express) running on http://localhost:${PORT}`);
  });

  server.on('error', (err) => {
    console.error('Server error:', err);
    process.exit(1);
  });
}

bootstrap().catch((err) => {
  console.error('Failed to start server:', err);
  // Do not exit; allow process to stay up to inspect errors
});
