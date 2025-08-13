const express = require('express');
const movementController = require('../controllers/movement.controller');
const { verifyToken, hasRole, hasPermission } = require('../middleware/auth.middleware');
const { auditLogger, capturePreviousState } = require('../middleware/audit.middleware');

const router = express.Router();

// Get all movements with pagination and filtering
router.get('/', verifyToken, movementController.getAllMovements);

// Get movement by ID
router.get('/:id', verifyToken, movementController.getMovementById);

// Create a new movement request
router.post('/',
  verifyToken,
  hasPermission('create:movements'),
  auditLogger('Movement', 'Create'),
  movementController.createMovement
);

// Update a movement
router.put('/:id',
  verifyToken,
  capturePreviousState(movementController.getMovementById),
  auditLogger('Movement', 'Update'),
  movementController.updateMovement
);

// Delete a movement
router.delete('/:id',
  verifyToken,
  capturePreviousState(movementController.getMovementById),
  auditLogger('Movement', 'Delete'),
  movementController.deleteMovement
);

// Get movement types
router.get('/types/list', verifyToken, movementController.getMovementTypes);

module.exports = router;