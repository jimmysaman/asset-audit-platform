const express = require('express');
const photoController = require('../controllers/photo.controller');
const { verifyToken, hasRole, hasPermission } = require('../middleware/auth.middleware');
const { auditLogger, capturePreviousState } = require('../middleware/audit.middleware');
const { upload } = require('../middleware/upload.middleware');

const router = express.Router();

// Upload a photo
router.post('/upload',
  verifyToken,
  upload.single('photo'),
  auditLogger('Photo', 'Upload'),
  photoController.uploadPhoto
);

// Get photos for an asset
router.get('/asset/:assetId',
  verifyToken,
  photoController.getAssetPhotos
);

// Get photos for a movement
router.get('/movement/:movementId',
  verifyToken,
  photoController.getMovementPhotos
);

// Get a photo by ID
router.get('/:id',
  verifyToken,
  photoController.getPhotoById
);

// Update a photo's description
router.put('/:id',
  verifyToken,
  capturePreviousState(photoController.getPhotoById),
  auditLogger('Photo', 'Update'),
  photoController.updatePhoto
);

// Delete a photo
router.delete('/:id',
  verifyToken,
  hasPermission('delete:photos'),
  capturePreviousState(photoController.getPhotoById),
  auditLogger('Photo', 'Delete'),
  photoController.deletePhoto
);

// Serve a photo file
router.get('/file/:id',
  verifyToken,
  photoController.servePhoto
);

module.exports = router;