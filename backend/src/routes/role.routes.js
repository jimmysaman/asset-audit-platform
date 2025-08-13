const express = require('express');
const router = express.Router();
const roleController = require('../controllers/role.controller');
const { verifyToken, hasRole } = require('../middleware/auth.middleware');
const { auditLogger, capturePreviousState } = require('../middleware/audit.middleware');
const { Role } = require('../models');

/**
 * @route GET /api/roles
 * @desc Get all roles
 * @access Private - Admin and Auditor
 */
router.get('/', 
  verifyToken, 
  hasRole(['Admin', 'Auditor']), 
  roleController.getAllRoles
);

/**
 * @route GET /api/roles/:id
 * @desc Get role by ID
 * @access Private - Admin and Auditor
 */
router.get('/:id', 
  verifyToken, 
  hasRole(['Admin', 'Auditor']), 
  roleController.getRoleById
);

/**
 * @route POST /api/roles
 * @desc Create a new role
 * @access Private - Admin only
 */
router.post('/', 
  verifyToken, 
  hasRole(['Admin']), 
  auditLogger('create', 'Role'),
  roleController.createRole
);

/**
 * @route PUT /api/roles/:id
 * @desc Update a role
 * @access Private - Admin only
 */
router.put('/:id', 
  verifyToken, 
  hasRole(['Admin']), 
  capturePreviousState(Role),
  auditLogger('update', 'Role'),
  roleController.updateRole
);

/**
 * @route DELETE /api/roles/:id
 * @desc Delete a role
 * @access Private - Admin only
 */
router.delete('/:id', 
  verifyToken, 
  hasRole(['Admin']), 
  capturePreviousState(Role),
  auditLogger('delete', 'Role'),
  roleController.deleteRole
);

module.exports = router;