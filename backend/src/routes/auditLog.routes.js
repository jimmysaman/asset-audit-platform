const express = require('express');
const auditLogController = require('../controllers/auditLog.controller');
const { verifyToken, hasRole, hasPermission } = require('../middleware/auth.middleware');

const router = express.Router();

// Get all audit logs with pagination and filtering
router.get('/',
  verifyToken,
  hasPermission('view:audit_logs'),
  auditLogController.getAllAuditLogs
);

// Get audit log by ID
router.get('/:id',
  verifyToken,
  hasPermission('view:audit_logs'),
  auditLogController.getAuditLogById
);

// Get audit logs for a specific entity
router.get('/entity/:entityType/:entityId',
  verifyToken,
  hasPermission('view:audit_logs'),
  auditLogController.getEntityAuditLogs
);

// Get audit logs for a specific user
router.get('/user/:userId',
  verifyToken,
  hasPermission('view:audit_logs'),
  auditLogController.getUserAuditLogs
);

// Get audit log actions
router.get('/actions/list',
  verifyToken,
  hasPermission('view:audit_logs'),
  auditLogController.getAuditLogActions
);

// Get audit log entity types
router.get('/entity-types/list',
  verifyToken,
  hasPermission('view:audit_logs'),
  auditLogController.getAuditLogEntityTypes
);

module.exports = router;