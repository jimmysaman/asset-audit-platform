const express = require('express');
const router = express.Router();
const {
  getLocations,
  getLocationById,
  createLocation,
  updateLocation,
  deleteLocation,
  getLocationTypes,
  getLocationsBySite
} = require('../controllers/location.controller');
const { authenticateToken } = require('../middleware/auth.middleware');
const { checkPermission } = require('../middleware/permission.middleware');

// Get all locations
router.get('/', 
  authenticateToken, 
  checkPermission('locations', 'read'),
  getLocations
);

// Get location types
router.get('/types', 
  authenticateToken, 
  checkPermission('locations', 'read'),
  getLocationTypes
);

// Get locations by site
router.get('/site/:siteId', 
  authenticateToken, 
  checkPermission('locations', 'read'),
  getLocationsBySite
);

// Get location by ID
router.get('/:id', 
  authenticateToken, 
  checkPermission('locations', 'read'),
  getLocationById
);

// Create new location
router.post('/', 
  authenticateToken, 
  checkPermission('locations', 'write'),
  createLocation
);

// Update location
router.put('/:id', 
  authenticateToken, 
  checkPermission('locations', 'write'),
  updateLocation
);

// Delete location
router.delete('/:id', 
  authenticateToken, 
  checkPermission('locations', 'delete'),
  deleteLocation
);

module.exports = router;
