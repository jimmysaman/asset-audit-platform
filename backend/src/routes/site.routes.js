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
const { verifyToken } = require('../middleware/auth.middleware');
const { checkPermission } = require('../middleware/permission.middleware');

// Get all sites
router.get('/',
  verifyToken,
  checkPermission('sites', 'read'),
  getSites
);

// Get site types
router.get('/types',
  verifyToken,
  checkPermission('sites', 'read'),
  getSiteTypes
);

// Get site by ID
router.get('/:id',
  verifyToken,
  checkPermission('sites', 'read'),
  getSiteById
);

// Create new site
router.post('/',
  verifyToken,
  checkPermission('sites', 'write'),
  createSite
);

// Update site
router.put('/:id',
  verifyToken,
  checkPermission('sites', 'write'),
  updateSite
);

// Delete site
router.delete('/:id',
  verifyToken,
  checkPermission('sites', 'delete'),
  deleteSite
);

module.exports = router;
