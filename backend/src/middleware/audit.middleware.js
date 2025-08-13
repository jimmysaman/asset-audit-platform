const { AuditLog } = require('../models');

/**
 * Middleware to log audit events
 * @param {string} action - The action being performed (create, update, delete, etc.)
 * @param {string} entityType - The type of entity being acted upon (User, Asset, etc.)
 */
const auditLogger = (action, entityType) => {
  return async (req, res, next) => {
    // Store the original send function
    const originalSend = res.send;
    
    // Override the send function to capture the response
    res.send = function(body) {
      // Restore the original send function to avoid recursion
      res.send = originalSend;
      
      // Only log successful operations (2xx status codes)
      if (res.statusCode >= 200 && res.statusCode < 300) {
        try {
          // Parse the response body if it's a string
          const responseBody = typeof body === 'string' ? JSON.parse(body) : body;
          
          // Create audit log entry
          const logEntry = {
            action,
            entityType,
            entityId: responseBody.id || req.params.id,
            userId: req.user ? req.user.id : null,
            description: `${action} ${entityType}`,
            previousValues: req.auditPreviousValues || null,
            newValues: req.method === 'DELETE' ? null : responseBody,
            ipAddress: req.ip,
            userAgent: req.headers['user-agent']
          };
          
          // Asynchronously create the log entry (don't await to avoid delaying response)
          AuditLog.create(logEntry).catch(err => {
            console.error('Error creating audit log:', err);
          });
        } catch (error) {
          console.error('Error in audit logging middleware:', error);
        }
      }
      
      // Call the original send function and return its result
      return res.send(body);
    };
    
    next();
  };
};

/**
 * Middleware to capture previous values before update/delete
 * @param {string} model - The Sequelize model to query
 */
const capturePreviousState = (model) => {
  return async (req, res, next) => {
    try {
      if (req.method === 'PUT' || req.method === 'DELETE') {
        const id = req.params.id;
        if (!id) return next();
        
        const entity = await model.findByPk(id);
        if (entity) {
          // Store previous values for audit logging
          req.auditPreviousValues = entity.toJSON();
        }
      }
      next();
    } catch (error) {
      console.error('Error capturing previous state:', error);
      next();
    }
  };
};

module.exports = {
  auditLogger,
  capturePreviousState
};