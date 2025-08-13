const express = require('express');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Test route
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    message: 'Server is running',
    timestamp: new Date().toISOString()
  });
});

// Test auth route
app.post('/api/auth/login', (req, res) => {
  const { username, password } = req.body;
  
  if (username === 'admin' && password === 'admin123') {
    res.json({
      token: 'test-token-123',
      user: {
        id: 1,
        username: 'admin',
        firstName: 'Admin',
        lastName: 'User',
        email: 'admin@example.com',
        role: { name: 'Admin' }
      }
    });
  } else {
    res.status(401).json({ message: 'Invalid credentials' });
  }
});

// Test assets route
app.get('/api/assets', (req, res) => {
  res.json({
    assets: [
      {
        id: '1',
        name: 'Test Asset 1',
        assetTag: 'TAG001',
        category: 'Equipment',
        location: 'Office A',
        status: 'Active'
      },
      {
        id: '2',
        name: 'Test Asset 2',
        assetTag: 'TAG002',
        category: 'Furniture',
        location: 'Office B',
        status: 'Active'
      }
    ],
    total: 2
  });
});

app.listen(PORT, () => {
  console.log(`Test server is running on port ${PORT}`);
  console.log(`Health check: http://localhost:${PORT}/api/health`);
});
