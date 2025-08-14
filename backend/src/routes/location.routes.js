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
const { verifyToken } = require('../middleware/auth.middleware');
const { checkPermission } = require('../middleware/permission.middleware');

// Get all locations
router.get('/',
  verifyToken,
  checkPermission('locations', 'read'),
  getLocations
);

// Get location types
router.get('/types',
  verifyToken,
  checkPermission('locations', 'read'),
  getLocationTypes
);

// Get locations by site
router.get('/site/:siteId',
  verifyToken,
  checkPermission('locations', 'read'),
  getLocationsBySite
);

// Get location by ID
router.get('/:id',
  verifyToken,
  checkPermission('locations', 'read'),
  getLocationById
);

// Create new location
router.post('/',
  verifyToken,
  checkPermission('locations', 'write'),
  createLocation
);

// Update location
router.put('/:id',
  verifyToken,
  checkPermission('locations', 'write'),
  updateLocation
);

// Delete location
router.delete('/:id',
  verifyToken,
  checkPermission('locations', 'delete'),
  deleteLocation
);

module.exports = router;
