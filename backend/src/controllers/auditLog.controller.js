const { AuditLog, User, Asset, sequelize } = require('../models');

/**
 * Get all audit logs with pagination and filtering
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const getAllAuditLogs = async (req, res) => {
  try {
    // Pagination parameters
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const offset = (page - 1) * limit;
    
    // Filtering parameters
    const { action, entityType, entityId, userId, startDate, endDate } = req.query;
    
    // Build where clause
    const whereClause = {};
    if (action) whereClause.action = action;
    if (entityType) whereClause.entityType = entityType;
    if (entityId) whereClause.entityId = entityId;
    if (userId) whereClause.userId = userId;
    
    // Date range filter
    if (startDate || endDate) {
      whereClause.timestamp = {};
      if (startDate) {
        whereClause.timestamp[sequelize.Op.gte] = new Date(startDate);
      }
      if (endDate) {
        whereClause.timestamp[sequelize.Op.lte] = new Date(endDate);
      }
    }
    
    // Get audit logs with pagination and filtering
    const { count, rows: auditLogs } = await AuditLog.findAndCountAll({
      where: whereClause,
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['id', 'username', 'firstName', 'lastName']
        },
        {
          model: Asset,
          as: 'asset',
          attributes: ['id', 'assetTag', 'name', 'category'],
          required: false
        }
      ],
      limit,
      offset,
      order: [['timestamp', 'DESC']]
    });
    
    return res.status(200).json({
      auditLogs,
      totalItems: count,
      totalPages: Math.ceil(count / limit),
      currentPage: page
    });
  } catch (error) {
    console.error('Error getting audit logs:', error);
    return res.status(500).json({
      message: 'Error retrieving audit logs',
      error: error.message
    });
  }
};

/**
 * Get audit log by ID
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const getAuditLogById = async (req, res) => {
  try {
    const { id } = req.params;
    
    const auditLog = await AuditLog.findByPk(id, {
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['id', 'username', 'firstName', 'lastName']
        },
        {
          model: Asset,
          as: 'asset',
          attributes: ['id', 'assetTag', 'name', 'category'],
          required: false
        }
      ]
    });
    
    if (!auditLog) {
      return res.status(404).json({
        message: 'Audit log not found'
      });
    }
    
    return res.status(200).json(auditLog);
  } catch (error) {
    console.error('Error getting audit log:', error);
    return res.status(500).json({
      message: 'Error retrieving audit log',
      error: error.message
    });
  }
};

/**
 * Get audit logs for a specific entity
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const getEntityAuditLogs = async (req, res) => {
  try {
    const { entityType, entityId } = req.params;
    
    // Pagination parameters
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;
    
    // Get audit logs for the entity
    const { count, rows: auditLogs } = await AuditLog.findAndCountAll({
      where: {
        entityType,
        entityId
      },
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['id', 'username', 'firstName', 'lastName']
        }
      ],
      limit,
      offset,
      order: [['timestamp', 'DESC']]
    });
    
    return res.status(200).json({
      auditLogs,
      totalItems: count,
      totalPages: Math.ceil(count / limit),
      currentPage: page
    });
  } catch (error) {
    console.error('Error getting entity audit logs:', error);
    return res.status(500).json({
      message: 'Error retrieving entity audit logs',
      error: error.message
    });
  }
};

/**
 * Get audit logs for a specific user
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const getUserAuditLogs = async (req, res) => {
  try {
    const { userId } = req.params;
    
    // Pagination parameters
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;
    
    // Get audit logs for the user
    const { count, rows: auditLogs } = await AuditLog.findAndCountAll({
      where: {
        userId
      },
      include: [
        {
          model: Asset,
          as: 'asset',
          attributes: ['id', 'assetTag', 'name', 'category'],
          required: false
        }
      ],
      limit,
      offset,
      order: [['timestamp', 'DESC']]
    });
    
    return res.status(200).json({
      auditLogs,
      totalItems: count,
      totalPages: Math.ceil(count / limit),
      currentPage: page
    });
  } catch (error) {
    console.error('Error getting user audit logs:', error);
    return res.status(500).json({
      message: 'Error retrieving user audit logs',
      error: error.message
    });
  }
};

/**
 * Get audit log actions (distinct values)
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const getAuditLogActions = async (req, res) => {
  try {
    const actions = await AuditLog.findAll({
      attributes: [[sequelize.fn('DISTINCT', sequelize.col('action')), 'action']],
      order: [['action', 'ASC']]
    });
    
    return res.status(200).json(
      actions.map(a => a.action)
    );
  } catch (error) {
    console.error('Error getting audit log actions:', error);
    return res.status(500).json({
      message: 'Error retrieving audit log actions',
      error: error.message
    });
  }
};

/**
 * Get audit log entity types (distinct values)
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const getAuditLogEntityTypes = async (req, res) => {
  try {
    const entityTypes = await AuditLog.findAll({
      attributes: [[sequelize.fn('DISTINCT', sequelize.col('entityType')), 'entityType']],
      order: [['entityType', 'ASC']]
    });
    
    return res.status(200).json(
      entityTypes.map(et => et.entityType)
    );
  } catch (error) {
    console.error('Error getting audit log entity types:', error);
    return res.status(500).json({
      message: 'Error retrieving audit log entity types',
      error: error.message
    });
  }
};

module.exports = {
  getAllAuditLogs,
  getAuditLogById,
  getEntityAuditLogs,
  getUserAuditLogs,
  getAuditLogActions,
  getAuditLogEntityTypes
};