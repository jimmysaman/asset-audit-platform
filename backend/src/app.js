const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const path = require('path');
const { notFound, errorHandler } = require('./middleware/error.middleware');

// Import routes
const authRoutes = require('./routes/auth.routes');
const userRoutes = require('./routes/user.routes');
const roleRoutes = require('./routes/role.routes');
const assetRoutes = require('./routes/asset.routes');
const movementRoutes = require('./routes/movement.routes');
const photoRoutes = require('./routes/photo.routes');
const discrepancyRoutes = require('./routes/discrepancy.routes');
const auditLogRoutes = require('./routes/auditLog.routes');
const siteRoutes = require('./routes/site.routes');
const locationRoutes = require('./routes/location.routes');

// Create Express app
const app = express();

// Set up middleware
app.use(helmet()); // Security headers
app.use(cors()); // Enable CORS for all routes
app.use(express.json()); // Parse JSON request bodies
app.use(express.urlencoded({ extended: true })); // Parse URL-encoded request bodies
app.use(morgan('dev')); // HTTP request logger

// Serve static files from the uploads directory
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Set up routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/roles', roleRoutes);
app.use('/api/assets', assetRoutes);
app.use('/api/movements', movementRoutes);
app.use('/api/photos', photoRoutes);
app.use('/api/discrepancies', discrepancyRoutes);
app.use('/api/audit-logs', auditLogRoutes);
app.use('/api/sites', siteRoutes);
app.use('/api/locations', locationRoutes);

// Basic route for API health check
app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'ok',
    message: 'API is running',
    timestamp: new Date().toISOString()
  });
});

// Error handling middleware
app.use(notFound);
app.use(errorHandler);

module.exports = app;