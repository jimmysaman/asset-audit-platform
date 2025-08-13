const express = require('express');
const assetController = require('../controllers/asset.controller');
const { verifyToken, hasRole, hasPermission } = require('../middleware/auth.middleware');
const { auditLogger, capturePreviousState } = require('../middleware/audit.middleware');
const { upload } = require('../middleware/upload.middleware');

const router = express.Router();

// Get all assets with pagination and filtering
router.get('/', verifyToken, assetController.getAllAssets);

// Get asset by ID
router.get('/:id', verifyToken, assetController.getAssetById);

// Create a new asset
router.post('/',
  verifyToken,
  hasPermission('create:assets'),
  auditLogger('Asset', 'Create'),
  assetController.createAsset
);

// Update an asset
router.put('/:id',
  verifyToken,
  hasPermission('update:assets'),
  capturePreviousState(assetController.getAssetById),
  auditLogger('Asset', 'Update'),
  assetController.updateAsset
);

// Delete an asset
router.delete('/:id',
  verifyToken,
  hasRole('Admin'),
  capturePreviousState(assetController.getAssetById),
  auditLogger('Asset', 'Delete'),
  assetController.deleteAsset
);

// Scan an asset
router.post('/scan/:assetTag',
  verifyToken,
  auditLogger('Asset', 'Scan'),
  assetController.scanAsset
);

// Get asset categories
router.get('/categories/list', verifyToken, assetController.getAssetCategories);

// Get asset locations
router.get('/locations/list', verifyToken, assetController.getAssetLocations);

module.exports = router;