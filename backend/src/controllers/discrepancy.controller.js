const { Discrepancy, Asset, Movement, User, sequelize } = require('../models');

/**
 * Get all discrepancies with pagination and filtering
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const getAllDiscrepancies = async (req, res) => {
  try {
    // Pagination parameters
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;
    
    // Filtering parameters
    const { type, status, priority, assetId, movementId, detectedById, resolvedById } = req.query;
    
    // Build where clause
    const whereClause = {};
    if (type) whereClause.type = type;
    if (status) whereClause.status = status;
    if (priority) whereClause.priority = priority;
    if (assetId) whereClause.assetId = assetId;
    if (movementId) whereClause.movementId = movementId;
    if (detectedById) whereClause.detectedBy = detectedById;
    if (resolvedById) whereClause.resolvedBy = resolvedById;
    
    // Get discrepancies with pagination and filtering
    const { count, rows: discrepancies } = await Discrepancy.findAndCountAll({
      where: whereClause,
      include: [
        {
          model: Asset,
          as: 'asset',
          attributes: ['id', 'assetTag', 'name', 'category']
        },
        {
          model: Movement,
          as: 'movement',
          attributes: ['id', 'type', 'status']
        },
        {
          model: User,
          as: 'detector',
          attributes: ['id', 'username', 'firstName', 'lastName']
        },
        {
          model: User,
          as: 'resolver',
          attributes: ['id', 'username', 'firstName', 'lastName']
        }
      ],
      limit,
      offset,
      order: [['detectedAt', 'DESC']]
    });
    
    return res.status(200).json({
      discrepancies,
      totalItems: count,
      totalPages: Math.ceil(count / limit),
      currentPage: page
    });
  } catch (error) {
    console.error('Error getting discrepancies:', error);
    return res.status(500).json({
      message: 'Error retrieving discrepancies',
      error: error.message
    });
  }
};

/**
 * Get discrepancy by ID
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const getDiscrepancyById = async (req, res) => {
  try {
    const { id } = req.params;
    
    const discrepancy = await Discrepancy.findByPk(id, {
      include: [
        {
          model: Asset,
          as: 'asset',
          attributes: ['id', 'assetTag', 'name', 'category', 'location', 'custodian']
        },
        {
          model: Movement,
          as: 'movement',
          attributes: ['id', 'type', 'status', 'fromLocation', 'toLocation']
        },
        {
          model: User,
          as: 'detector',
          attributes: ['id', 'username', 'firstName', 'lastName']
        },
        {
          model: User,
          as: 'resolver',
          attributes: ['id', 'username', 'firstName', 'lastName']
        }
      ]
    });
    
    if (!discrepancy) {
      return res.status(404).json({
        message: 'Discrepancy not found'
      });
    }
    
    return res.status(200).json(discrepancy);
  } catch (error) {
    console.error('Error getting discrepancy:', error);
    return res.status(500).json({
      message: 'Error retrieving discrepancy',
      error: error.message
    });
  }
};

/**
 * Create a new discrepancy
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const createDiscrepancy = async (req, res) => {
  const transaction = await sequelize.transaction();
  
  try {
    const {
      assetId,
      movementId,
      type,
      description,
      expectedValue,
      actualValue,
      priority,
      notes,
      metadata
    } = req.body;
    
    // Validate that either assetId or movementId is provided
    if (!assetId && !movementId) {
      await transaction.rollback();
      return res.status(400).json({
        message: 'Either assetId or movementId must be provided'
      });
    }
    
    // If assetId is provided, validate it exists
    if (assetId) {
      const asset = await Asset.findByPk(assetId);
      if (!asset) {
        await transaction.rollback();
        return res.status(404).json({
          message: 'Asset not found'
        });
      }
      
      // Update asset hasDiscrepancy flag
      await asset.update({ hasDiscrepancy: true }, { transaction });
    }
    
    // If movementId is provided, validate it exists
    if (movementId) {
      const movement = await Movement.findByPk(movementId);
      if (!movement) {
        await transaction.rollback();
        return res.status(404).json({
          message: 'Movement not found'
        });
      }
      
      // Update movement hasDiscrepancy flag
      await movement.update({ hasDiscrepancy: true }, { transaction });
    }
    
    // Create discrepancy
    const discrepancy = await Discrepancy.create({
      assetId: assetId || null,
      movementId: movementId || null,
      type,
      description,
      expectedValue,
      actualValue,
      status: 'Open',
      priority: priority || 'Medium',
      detectedAt: new Date(),
      detectedBy: req.user.id,
      notes,
      metadata
    }, { transaction });
    
    await transaction.commit();
    
    // Get created discrepancy with associations
    const createdDiscrepancy = await Discrepancy.findByPk(discrepancy.id, {
      include: [
        {
          model: Asset,
          as: 'asset',
          attributes: ['id', 'assetTag', 'name', 'category']
        },
        {
          model: Movement,
          as: 'movement',
          attributes: ['id', 'type', 'status']
        },
        {
          model: User,
          as: 'detector',
          attributes: ['id', 'username', 'firstName', 'lastName']
        }
      ]
    });
    
    return res.status(201).json({
      message: 'Discrepancy created successfully',
      discrepancy: createdDiscrepancy
    });
  } catch (error) {
    await transaction.rollback();
    console.error('Error creating discrepancy:', error);
    return res.status(500).json({
      message: 'Error creating discrepancy',
      error: error.message
    });
  }
};

/**
 * Update a discrepancy
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const updateDiscrepancy = async (req, res) => {
  const transaction = await sequelize.transaction();
  
  try {
    const { id } = req.params;
    const {
      type,
      description,
      expectedValue,
      actualValue,
      status,
      priority,
      resolution,
      notes,
      metadata
    } = req.body;
    
    // Find discrepancy
    const discrepancy = await Discrepancy.findByPk(id, {
      include: [
        { model: Asset, as: 'asset' },
        { model: Movement, as: 'movement' }
      ]
    });
    
    if (!discrepancy) {
      await transaction.rollback();
      return res.status(404).json({
        message: 'Discrepancy not found'
      });
    }
    
    // Handle resolution
    let resolvedAt = discrepancy.resolvedAt;
    let resolvedBy = discrepancy.resolvedBy;
    
    if (status && status !== discrepancy.status) {
      if (status === 'Closed' || status === 'Resolved') {
        resolvedAt = new Date();
        resolvedBy = req.user.id;
        
        // Check if all discrepancies for this asset are resolved
        if (discrepancy.assetId) {
          const openDiscrepancies = await Discrepancy.count({
            where: {
              assetId: discrepancy.assetId,
              id: { [sequelize.Op.ne]: id },
              status: { [sequelize.Op.notIn]: ['Closed', 'Resolved'] }
            }
          });
          
          // If no other open discrepancies, update asset hasDiscrepancy flag
          if (openDiscrepancies === 0) {
            await discrepancy.asset.update({ hasDiscrepancy: false }, { transaction });
          }
        }
        
        // Check if all discrepancies for this movement are resolved
        if (discrepancy.movementId) {
          const openDiscrepancies = await Discrepancy.count({
            where: {
              movementId: discrepancy.movementId,
              id: { [sequelize.Op.ne]: id },
              status: { [sequelize.Op.notIn]: ['Closed', 'Resolved'] }
            }
          });
          
          // If no other open discrepancies, update movement hasDiscrepancy flag
          if (openDiscrepancies === 0) {
            await discrepancy.movement.update({ hasDiscrepancy: false }, { transaction });
          }
        }
      }
    }
    
    // Update discrepancy
    await discrepancy.update({
      type: type || discrepancy.type,
      description: description || discrepancy.description,
      expectedValue: expectedValue || discrepancy.expectedValue,
      actualValue: actualValue || discrepancy.actualValue,
      status: status || discrepancy.status,
      priority: priority || discrepancy.priority,
      resolvedAt,
      resolvedBy,
      resolution: resolution || discrepancy.resolution,
      notes: notes || discrepancy.notes,
      metadata: metadata || discrepancy.metadata
    }, { transaction });
    
    await transaction.commit();
    
    // Get updated discrepancy
    const updatedDiscrepancy = await Discrepancy.findByPk(id, {
      include: [
        {
          model: Asset,
          as: 'asset',
          attributes: ['id', 'assetTag', 'name', 'category']
        },
        {
          model: Movement,
          as: 'movement',
          attributes: ['id', 'type', 'status']
        },
        {
          model: User,
          as: 'detector',
          attributes: ['id', 'username', 'firstName', 'lastName']
        },
        {
          model: User,
          as: 'resolver',
          attributes: ['id', 'username', 'firstName', 'lastName']
        }
      ]
    });
    
    return res.status(200).json({
      message: 'Discrepancy updated successfully',
      discrepancy: updatedDiscrepancy
    });
  } catch (error) {
    await transaction.rollback();
    console.error('Error updating discrepancy:', error);
    return res.status(500).json({
      message: 'Error updating discrepancy',
      error: error.message
    });
  }
};

/**
 * Delete a discrepancy
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const deleteDiscrepancy = async (req, res) => {
  const transaction = await sequelize.transaction();
  
  try {
    const { id } = req.params;
    
    // Find discrepancy
    const discrepancy = await Discrepancy.findByPk(id, {
      include: [
        { model: Asset, as: 'asset' },
        { model: Movement, as: 'movement' }
      ]
    });
    
    if (!discrepancy) {
      await transaction.rollback();
      return res.status(404).json({
        message: 'Discrepancy not found'
      });
    }
    
    // Check if this is the only discrepancy for the asset
    if (discrepancy.assetId) {
      const otherDiscrepancies = await Discrepancy.count({
        where: {
          assetId: discrepancy.assetId,
          id: { [sequelize.Op.ne]: id }
        }
      });
      
      // If no other discrepancies, update asset hasDiscrepancy flag
      if (otherDiscrepancies === 0 && discrepancy.asset) {
        await discrepancy.asset.update({ hasDiscrepancy: false }, { transaction });
      }
    }
    
    // Check if this is the only discrepancy for the movement
    if (discrepancy.movementId) {
      const otherDiscrepancies = await Discrepancy.count({
        where: {
          movementId: discrepancy.movementId,
          id: { [sequelize.Op.ne]: id }
        }
      });
      
      // If no other discrepancies, update movement hasDiscrepancy flag
      if (otherDiscrepancies === 0 && discrepancy.movement) {
        await discrepancy.movement.update({ hasDiscrepancy: false }, { transaction });
      }
    }
    
    // Delete discrepancy (soft delete due to paranoid option)
    await discrepancy.destroy({ transaction });
    
    await transaction.commit();
    
    return res.status(200).json({
      message: 'Discrepancy deleted successfully'
    });
  } catch (error) {
    await transaction.rollback();
    console.error('Error deleting discrepancy:', error);
    return res.status(500).json({
      message: 'Error deleting discrepancy',
      error: error.message
    });
  }
};

/**
 * Get discrepancy types (distinct values)
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const getDiscrepancyTypes = async (req, res) => {
  try {
    const types = await Discrepancy.findAll({
      attributes: [[sequelize.fn('DISTINCT', sequelize.col('type')), 'type']],
      order: [['type', 'ASC']]
    });
    
    return res.status(200).json(
      types.map(t => t.type)
    );
  } catch (error) {
    console.error('Error getting discrepancy types:', error);
    return res.status(500).json({
      message: 'Error retrieving discrepancy types',
      error: error.message
    });
  }
};

module.exports = {
  getAllDiscrepancies,
  getDiscrepancyById,
  createDiscrepancy,
  updateDiscrepancy,
  deleteDiscrepancy,
  getDiscrepancyTypes
};