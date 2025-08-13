const express = require('express');
const router = express.Router();
const {
  getSites,
  getSiteById,
  createSite,
  updateSite,
  deleteSite,
  getSiteTypes
} = require('../controllers/site.controller');
const { authenticateToken } = require('../middleware/auth.middleware');
const { checkPermission } = require('../middleware/permission.middleware');

// Get all sites
router.get('/', 
  authenticateToken, 
  checkPermission('sites', 'read'),
  getSites
);

// Get site types
router.get('/types', 
  authenticateToken, 
  checkPermission('sites', 'read'),
  getSiteTypes
);

// Get site by ID
router.get('/:id', 
  authenticateToken, 
  checkPermission('sites', 'read'),
  getSiteById
);

// Create new site
router.post('/', 
  authenticateToken, 
  checkPermission('sites', 'write'),
  createSite
);

// Update site
router.put('/:id', 
  authenticateToken, 
  checkPermission('sites', 'write'),
  updateSite
);

// Delete site
router.delete('/:id', 
  authenticateToken, 
  checkPermission('sites', 'delete'),
  deleteSite
);

module.exports = router;
