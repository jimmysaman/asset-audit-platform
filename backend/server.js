require('dotenv').config();
const fs = require('fs');
const path = require('path');
const app = require('./src/app');
const db = require('./src/models');

// Set port
const PORT = process.env.PORT || 5000;

// Create uploads directory if it doesn't exist
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Root route (not defined in app.js)
app.get('/', (req, res) => {
  res.json({ message: 'Welcome to SmartAsset Audit & Reconciliation Platform API' });
});

// Error handling middleware is now in error.middleware.js

// Database connection and server start
console.log('Starting server...');
console.log('Database config:', process.env.NODE_ENV);

db.sequelize.sync({ force: false })
  .then(() => {
    console.log('Database connected successfully');
    // Initialize roles and admin user
    require('./src/utils/initDb')();

    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
      console.log(`Environment: ${process.env.NODE_ENV}`);
      console.log(`Database: SQLite`);
    });
  })
  .catch(err => {
    console.error('Failed to connect to the database:', err);
  });

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  console.error('Unhandled Rejection:', err);
});

module.exports = app; // For testing purposes