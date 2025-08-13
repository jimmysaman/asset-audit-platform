const { Movement, Asset, User, Photo, Discrepancy, sequelize } = require('../models');

/**
 * Get all movements with pagination and filtering
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const getAllMovements = async (req, res) => {
  try {
    // Pagination parameters
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;
    
    // Filtering parameters
    const { type, status, assetId, requesterId, approverId, hasDiscrepancy, search } = req.query;
    
    // Build where clause
    const whereClause = {};
    if (type) whereClause.type = type;
    if (status) whereClause.status = status;
    if (assetId) whereClause.assetId = assetId;
    if (requesterId) whereClause.requesterId = requesterId;
    if (approverId) whereClause.approverId = approverId;
    if (hasDiscrepancy === 'true') whereClause.hasDiscrepancy = true;
    
    // Get movements with pagination and filtering
    const { count, rows: movements } = await Movement.findAndCountAll({
      where: whereClause,
      include: [
        {
          model: Asset,
          as: 'asset',
          attributes: ['id', 'assetTag', 'name', 'category']
        },
        {
          model: User,
          as: 'requester',
          attributes: ['id', 'username', 'firstName', 'lastName']
        },
        {
          model: User,
          as: 'approver',
          attributes: ['id', 'username', 'firstName', 'lastName']
        }
      ],
      limit,
      offset,
      order: [['createdAt', 'DESC']]
    });
    
    return res.status(200).json({
      movements,
      totalItems: count,
      totalPages: Math.ceil(count / limit),
      currentPage: page
    });
  } catch (error) {
    console.error('Error getting movements:', error);
    return res.status(500).json({
      message: 'Error retrieving movements',
      error: error.message
    });
  }
};

/**
 * Get movement by ID
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const getMovementById = async (req, res) => {
  try {
    const { id } = req.params;
    
    const movement = await Movement.findByPk(id, {
      include: [
        {
          model: Asset,
          as: 'asset',
          attributes: ['id', 'assetTag', 'name', 'category', 'location', 'custodian']
        },
        {
          model: User,
          as: 'requester',
          attributes: ['id', 'username', 'firstName', 'lastName']
        },
        {
          model: User,
          as: 'approver',
          attributes: ['id', 'username', 'firstName', 'lastName']
        },
        {
          model: Photo,
          as: 'photos',
          attributes: ['id', 'filename', 'filepath', 'description', 'capturedAt']
        },
        {
          model: Discrepancy,
          as: 'discrepancies',
          where: { status: { [sequelize.Op.ne]: 'Closed' } },
          required: false
        }
      ]
    });
    
    if (!movement) {
      return res.status(404).json({
        message: 'Movement not found'
      });
    }
    
    return res.status(200).json(movement);
  } catch (error) {
    console.error('Error getting movement:', error);
    return res.status(500).json({
      message: 'Error retrieving movement',
      error: error.message
    });
  }
};

/**
 * Create a new movement request
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const createMovement = async (req, res) => {
  const transaction = await sequelize.transaction();
  
  try {
    const {
      assetId,
      type,
      fromLocation,
      toLocation,
      fromCustodian,
      toCustodian,
      reason,
      notes,
      metadata
    } = req.body;
    
    // Validate asset exists
    const asset = await Asset.findByPk(assetId);
    if (!asset) {
      await transaction.rollback();
      return res.status(404).json({
        message: 'Asset not found'
      });
    }
    
    // Create movement request
    const movement = await Movement.create({
      assetId,
      type,
      fromLocation: fromLocation || asset.location,
      toLocation,
      fromCustodian: fromCustodian || asset.custodian,
      toCustodian,
      requestDate: new Date(),
      status: 'Pending',
      reason,
      notes,
      metadata,
      requesterId: req.user.id
    }, { transaction });
    
    await transaction.commit();
    
    // Get created movement with associations
    const createdMovement = await Movement.findByPk(movement.id, {
      include: [
        {
          model: Asset,
          as: 'asset',
          attributes: ['id', 'assetTag', 'name', 'category']
        },
        {
          model: User,
          as: 'requester',
          attributes: ['id', 'username', 'firstName', 'lastName']
        }
      ]
    });
    
    return res.status(201).json({
      message: 'Movement request created successfully',
      movement: createdMovement
    });
  } catch (error) {
    await transaction.rollback();
    console.error('Error creating movement:', error);
    return res.status(500).json({
      message: 'Error creating movement request',
      error: error.message
    });
  }
};

/**
 * Update a movement
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const updateMovement = async (req, res) => {
  const transaction = await sequelize.transaction();
  
  try {
    const { id } = req.params;
    const {
      type,
      fromLocation,
      toLocation,
      fromCustodian,
      toCustodian,
      status,
      reason,
      notes,
      metadata
    } = req.body;
    
    // Find movement
    const movement = await Movement.findByPk(id, { include: [{ model: Asset, as: 'asset' }] });
    if (!movement) {
      await transaction.rollback();
      return res.status(404).json({
        message: 'Movement not found'
      });
    }
    
    // Check if user is authorized to update
    const isRequester = movement.requesterId === req.user.id;
    const isAdmin = req.user.role === 'Admin';
    const isApprover = req.user.permissions && req.user.permissions.includes('approve:movements');
    
    if (!isRequester && !isAdmin && !isApprover) {
      await transaction.rollback();
      return res.status(403).json({
        message: 'Not authorized to update this movement'
      });
    }
    
    // Handle approval
    let approvalDate = movement.approvalDate;
    let approverId = movement.approverId;
    let completionDate = movement.completionDate;
    let assetUpdated = false;
    
    if (status && status !== movement.status) {
      if (status === 'Approved' && (!isAdmin && !isApprover)) {
        await transaction.rollback();
        return res.status(403).json({
          message: 'Not authorized to approve movements'
        });
      }
      
      if (status === 'Approved') {
        approvalDate = new Date();
        approverId = req.user.id;
      }
      
      if (status === 'Completed') {
        completionDate = new Date();
        assetUpdated = true;
        
        // Update asset location and custodian
        await movement.asset.update({
          location: toLocation || movement.asset.location,
          custodian: toCustodian || movement.asset.custodian,
          lastUpdatedBy: req.user.id
        }, { transaction });
      }
    }
    
    // Update movement
    await movement.update({
      type: type || movement.type,
      fromLocation: fromLocation || movement.fromLocation,
      toLocation: toLocation || movement.toLocation,
      fromCustodian: fromCustodian || movement.fromCustodian,
      toCustodian: toCustodian || movement.toCustodian,
      status: status || movement.status,
      reason: reason || movement.reason,
      notes: notes || movement.notes,
      metadata: metadata || movement.metadata,
      approvalDate,
      approverId,
      completionDate
    }, { transaction });
    
    await transaction.commit();
    
    // Get updated movement
    const updatedMovement = await Movement.findByPk(id, {
      include: [
        {
          model: Asset,
          as: 'asset',
          attributes: ['id', 'assetTag', 'name', 'category', 'location', 'custodian']
        },
        {
          model: User,
          as: 'requester',
          attributes: ['id', 'username', 'firstName', 'lastName']
        },
        {
          model: User,
          as: 'approver',
          attributes: ['id', 'username', 'firstName', 'lastName']
        }
      ]
    });
    
    return res.status(200).json({
      message: 'Movement updated successfully',
      movement: updatedMovement,
      assetUpdated
    });
  } catch (error) {
    await transaction.rollback();
    console.error('Error updating movement:', error);
    return res.status(500).json({
      message: 'Error updating movement',
      error: error.message
    });
  }
};

/**
 * Delete a movement
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const deleteMovement = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Find movement
    const movement = await Movement.findByPk(id);
    if (!movement) {
      return res.status(404).json({
        message: 'Movement not found'
      });
    }
    
    // Only allow deletion of pending movements
    if (movement.status !== 'Pending') {
      return res.status(400).json({
        message: 'Only pending movements can be deleted'
      });
    }
    
    // Check if user is authorized to delete
    const isRequester = movement.requesterId === req.user.id;
    const isAdmin = req.user.role === 'Admin';
    
    if (!isRequester && !isAdmin) {
      return res.status(403).json({
        message: 'Not authorized to delete this movement'
      });
    }
    
    // Delete movement (soft delete due to paranoid option)
    await movement.destroy();
    
    return res.status(200).json({
      message: 'Movement deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting movement:', error);
    return res.status(500).json({
      message: 'Error deleting movement',
      error: error.message
    });
  }
};

/**
 * Get movement types (distinct values)
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const getMovementTypes = async (req, res) => {
  try {
    const types = await Movement.findAll({
      attributes: [[sequelize.fn('DISTINCT', sequelize.col('type')), 'type']],
      order: [['type', 'ASC']]
    });
    
    return res.status(200).json(
      types.map(t => t.type)
    );
  } catch (error) {
    console.error('Error getting movement types:', error);
    return res.status(500).json({
      message: 'Error retrieving movement types',
      error: error.message
    });
  }
};

module.exports = {
  getAllMovements,
  getMovementById,
  createMovement,
  updateMovement,
  deleteMovement,
  getMovementTypes
};