const express = require('express');
const router = express.Router();
const userController = require('../controllers/user.controller');
const { verifyToken, hasRole, hasPermission } = require('../middleware/auth.middleware');
const { auditLogger, capturePreviousState } = require('../middleware/audit.middleware');
const { User } = require('../models');

/**
 * @route GET /api/users
 * @desc Get all users with pagination
 * @access Private - Admin only
 */
router.get('/', 
  verifyToken, 
  hasRole(['Admin']), 
  userController.getAllUsers
);

/**
 * @route GET /api/users/:id
 * @desc Get user by ID
 * @access Private - Admin or self
 */
router.get('/:id', 
  verifyToken, 
  (req, res, next) => {
    // Allow users to access their own profile
    if (req.user.id === req.params.id) {
      return next();
    }
    // Otherwise, check for admin role
    return hasRole(['Admin'])(req, res, next);
  },
  userController.getUserById
);

/**
 * @route POST /api/users
 * @desc Create a new user
 * @access Private - Admin only
 */
router.post('/', 
  verifyToken, 
  hasRole(['Admin']), 
  auditLogger('create', 'User'),
  userController.createUser
);

/**
 * @route PUT /api/users/:id
 * @desc Update a user
 * @access Private - Admin or self (with restrictions)
 */
router.put('/:id', 
  verifyToken, 
  (req, res, next) => {
    // Allow users to update their own profile, but not role or status
    if (req.user.id === req.params.id) {
      // Remove sensitive fields that users shouldn't change about themselves
      delete req.body.roleId;
      delete req.body.isActive;
      return next();
    }
    // Otherwise, check for admin role
    return hasRole(['Admin'])(req, res, next);
  },
  capturePreviousState(User),
  auditLogger('update', 'User'),
  userController.updateUser
);

/**
 * @route DELETE /api/users/:id
 * @desc Delete a user
 * @access Private - Admin only
 */
router.delete('/:id', 
  verifyToken, 
  hasRole(['Admin']), 
  capturePreviousState(User),
  auditLogger('delete', 'User'),
  userController.deleteUser
);

module.exports = router;