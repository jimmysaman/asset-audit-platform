const express = require('express');
const discrepancyController = require('../controllers/discrepancy.controller');
const { verifyToken, hasRole, hasPermission } = require('../middleware/auth.middleware');
const { auditLogger, capturePreviousState } = require('../middleware/audit.middleware');

const router = express.Router();

// Get all discrepancies with pagination and filtering
router.get('/', verifyToken, discrepancyController.getAllDiscrepancies);

// Get discrepancy by ID
router.get('/:id', verifyToken, discrepancyController.getDiscrepancyById);

// Create a new discrepancy
router.post('/',
  verifyToken,
  hasPermission('create:discrepancies'),
  auditLogger('Discrepancy', 'Create'),
  discrepancyController.createDiscrepancy
);

// Update a discrepancy
router.put('/:id',
  verifyToken,
  hasPermission('update:discrepancies'),
  capturePreviousState(discrepancyController.getDiscrepancyById),
  auditLogger('Discrepancy', 'Update'),
  discrepancyController.updateDiscrepancy
);

// Delete a discrepancy
router.delete('/:id',
  verifyToken,
  hasRole('Admin'),
  capturePreviousState(discrepancyController.getDiscrepancyById),
  auditLogger('Discrepancy', 'Delete'),
  discrepancyController.deleteDiscrepancy
);

// Get discrepancy types
router.get('/types/list', verifyToken, discrepancyController.getDiscrepancyTypes);

module.exports = router;