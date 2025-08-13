const { Asset, User, Photo, Discrepancy, sequelize } = require('../models');

/**
 * Get all assets with pagination and filtering
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const getAllAssets = async (req, res) => {
  try {
    // Pagination parameters
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;
    
    // Filtering parameters
    const { category, location, status, condition, hasDiscrepancy, search } = req.query;
    
    // Build where clause
    const whereClause = {};
    if (category) whereClause.category = category;
    if (location) whereClause.location = location;
    if (status) whereClause.status = status;
    if (condition) whereClause.condition = condition;
    if (hasDiscrepancy === 'true') whereClause.hasDiscrepancy = true;
    
    // Search by name, assetTag, or serialNumber
    if (search) {
      whereClause[sequelize.Op.or] = [
        { name: { [sequelize.Op.iLike]: `%${search}%` } },
        { assetTag: { [sequelize.Op.iLike]: `%${search}%` } },
        { serialNumber: { [sequelize.Op.iLike]: `%${search}%` } }
      ];
    }
    
    // Get assets with pagination and filtering
    const { count, rows: assets } = await Asset.findAndCountAll({
      where: whereClause,
      include: [
        {
          model: User,
          as: 'creator',
          attributes: ['id', 'username', 'firstName', 'lastName']
        },
        {
          model: Photo,
          as: 'photos',
          attributes: ['id', 'filename', 'filepath'],
          limit: 1,
          separate: true
        }
      ],
      limit,
      offset,
      order: [['createdAt', 'DESC']]
    });
    
    return res.status(200).json({
      assets,
      totalItems: count,
      totalPages: Math.ceil(count / limit),
      currentPage: page
    });
  } catch (error) {
    console.error('Error getting assets:', error);
    return res.status(500).json({
      message: 'Error retrieving assets',
      error: error.message
    });
  }
};

/**
 * Get asset by ID
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const getAssetById = async (req, res) => {
  try {
    const { id } = req.params;
    
    const asset = await Asset.findByPk(id, {
      include: [
        {
          model: User,
          as: 'creator',
          attributes: ['id', 'username', 'firstName', 'lastName']
        },
        {
          model: User,
          as: 'updater',
          attributes: ['id', 'username', 'firstName', 'lastName']
        },
        {
          model: Photo,
          as: 'photos',
          attributes: ['id', 'filename', 'filepath', 'description', 'gpsLatitude', 'gpsLongitude', 'capturedAt']
        },
        {
          model: Discrepancy,
          as: 'discrepancies',
          where: { status: { [sequelize.Op.ne]: 'Closed' } },
          required: false
        }
      ]
    });
    
    if (!asset) {
      return res.status(404).json({
        message: 'Asset not found'
      });
    }
    
    return res.status(200).json(asset);
  } catch (error) {
    console.error('Error getting asset:', error);
    return res.status(500).json({
      message: 'Error retrieving asset',
      error: error.message
    });
  }
};

/**
 * Create a new asset
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const createAsset = async (req, res) => {
  try {
    const {
      assetTag,
      serialNumber,
      name,
      description,
      category,
      model,
      manufacturer,
      purchaseDate,
      purchasePrice,
      currentValue,
      location,
      department,
      custodian,
      status,
      condition,
      notes,
      metadata,
      barcode,
      rfidTag,
      nfcTag
    } = req.body;
    
    // Check if asset with same tag or serial already exists
    if (assetTag) {
      const existingAssetTag = await Asset.findOne({ where: { assetTag } });
      if (existingAssetTag) {
        return res.status(400).json({
          message: 'Asset with this tag already exists'
        });
      }
    }
    
    if (serialNumber) {
      const existingSerialNumber = await Asset.findOne({ where: { serialNumber } });
      if (existingSerialNumber) {
        return res.status(400).json({
          message: 'Asset with this serial number already exists'
        });
      }
    }
    
    // Create asset
    const asset = await Asset.create({
      assetTag,
      serialNumber,
      name,
      description,
      category,
      model,
      manufacturer,
      purchaseDate,
      purchasePrice,
      currentValue,
      location,
      department,
      custodian,
      status,
      condition,
      notes,
      metadata,
      barcode,
      rfidTag,
      nfcTag,
      createdBy: req.user.id,
      lastUpdatedBy: req.user.id
    });
    
    return res.status(201).json({
      message: 'Asset created successfully',
      asset
    });
  } catch (error) {
    console.error('Error creating asset:', error);
    return res.status(500).json({
      message: 'Error creating asset',
      error: error.message
    });
  }
};

/**
 * Update an asset
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const updateAsset = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      assetTag,
      serialNumber,
      name,
      description,
      category,
      model,
      manufacturer,
      purchaseDate,
      purchasePrice,
      currentValue,
      location,
      department,
      custodian,
      status,
      condition,
      notes,
      metadata,
      barcode,
      rfidTag,
      nfcTag,
      lastAuditDate,
      nextAuditDate
    } = req.body;
    
    // Find asset
    const asset = await Asset.findByPk(id);
    if (!asset) {
      return res.status(404).json({
        message: 'Asset not found'
      });
    }
    
    // Check if updating to a tag or serial that already exists
    if (assetTag && assetTag !== asset.assetTag) {
      const existingAssetTag = await Asset.findOne({ where: { assetTag } });
      if (existingAssetTag) {
        return res.status(400).json({
          message: 'Asset with this tag already exists'
        });
      }
    }
    
    if (serialNumber && serialNumber !== asset.serialNumber) {
      const existingSerialNumber = await Asset.findOne({ where: { serialNumber } });
      if (existingSerialNumber) {
        return res.status(400).json({
          message: 'Asset with this serial number already exists'
        });
      }
    }
    
    // Check for discrepancies
    let hasDiscrepancy = false;
    
    // Location discrepancy
    if (location && location !== asset.location) {
      hasDiscrepancy = true;
      // Create discrepancy record
      await Discrepancy.create({
        assetId: id,
        type: 'Location',
        description: 'Asset location has changed',
        expectedValue: asset.location,
        actualValue: location,
        detectedBy: req.user.id
      });
    }
    
    // Custodian discrepancy
    if (custodian && custodian !== asset.custodian) {
      hasDiscrepancy = true;
      // Create discrepancy record
      await Discrepancy.create({
        assetId: id,
        type: 'Custodian',
        description: 'Asset custodian has changed',
        expectedValue: asset.custodian || 'None',
        actualValue: custodian,
        detectedBy: req.user.id
      });
    }
    
    // Condition discrepancy
    if (condition && condition !== asset.condition) {
      hasDiscrepancy = true;
      // Create discrepancy record
      await Discrepancy.create({
        assetId: id,
        type: 'Condition',
        description: 'Asset condition has changed',
        expectedValue: asset.condition,
        actualValue: condition,
        detectedBy: req.user.id
      });
    }
    
    // Update asset
    await asset.update({
      assetTag,
      serialNumber,
      name,
      description,
      category,
      model,
      manufacturer,
      purchaseDate,
      purchasePrice,
      currentValue,
      location,
      department,
      custodian,
      status,
      condition,
      notes,
      metadata,
      barcode,
      rfidTag,
      nfcTag,
      lastAuditDate,
      nextAuditDate,
      lastUpdatedBy: req.user.id,
      hasDiscrepancy: hasDiscrepancy || asset.hasDiscrepancy
    });
    
    // Get updated asset
    const updatedAsset = await Asset.findByPk(id, {
      include: [
        {
          model: User,
          as: 'creator',
          attributes: ['id', 'username', 'firstName', 'lastName']
        },
        {
          model: User,
          as: 'updater',
          attributes: ['id', 'username', 'firstName', 'lastName']
        }
      ]
    });
    
    return res.status(200).json({
      message: 'Asset updated successfully',
      asset: updatedAsset,
      discrepanciesDetected: hasDiscrepancy
    });
  } catch (error) {
    console.error('Error updating asset:', error);
    return res.status(500).json({
      message: 'Error updating asset',
      error: error.message
    });
  }
};

/**
 * Delete an asset
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const deleteAsset = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Find asset
    const asset = await Asset.findByPk(id);
    if (!asset) {
      return res.status(404).json({
        message: 'Asset not found'
      });
    }
    
    // Delete asset (soft delete due to paranoid option)
    await asset.destroy();
    
    return res.status(200).json({
      message: 'Asset deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting asset:', error);
    return res.status(500).json({
      message: 'Error deleting asset',
      error: error.message
    });
  }
};

/**
 * Scan an asset (update location and last scanned time)
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const scanAsset = async (req, res) => {
  try {
    const { assetTag } = req.params;
    const { location, gpsLatitude, gpsLongitude } = req.body;
    
    // Find asset by tag
    const asset = await Asset.findOne({ where: { assetTag } });
    if (!asset) {
      return res.status(404).json({
        message: 'Asset not found'
      });
    }
    
    // Check for location discrepancy
    let hasDiscrepancy = false;
    if (location && location !== asset.location) {
      hasDiscrepancy = true;
      // Create discrepancy record
      await Discrepancy.create({
        assetId: asset.id,
        type: 'Location',
        description: 'Asset location discrepancy detected during scan',
        expectedValue: asset.location,
        actualValue: location,
        detectedBy: req.user.id
      });
    }
    
    // Update asset with scan information
    await asset.update({
      location: location || asset.location,
      gpsLatitude: gpsLatitude || asset.gpsLatitude,
      gpsLongitude: gpsLongitude || asset.gpsLongitude,
      lastScannedAt: new Date(),
      lastUpdatedBy: req.user.id,
      hasDiscrepancy: hasDiscrepancy || asset.hasDiscrepancy
    });
    
    return res.status(200).json({
      message: 'Asset scanned successfully',
      asset,
      discrepancyDetected: hasDiscrepancy
    });
  } catch (error) {
    console.error('Error scanning asset:', error);
    return res.status(500).json({
      message: 'Error scanning asset',
      error: error.message
    });
  }
};

/**
 * Get asset categories (distinct values)
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const getAssetCategories = async (req, res) => {
  try {
    const categories = await Asset.findAll({
      attributes: [[sequelize.fn('DISTINCT', sequelize.col('category')), 'category']],
      order: [['category', 'ASC']]
    });
    
    return res.status(200).json(
      categories.map(c => c.category)
    );
  } catch (error) {
    console.error('Error getting asset categories:', error);
    return res.status(500).json({
      message: 'Error retrieving asset categories',
      error: error.message
    });
  }
};

/**
 * Get asset locations (distinct values)
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const getAssetLocations = async (req, res) => {
  try {
    const locations = await Asset.findAll({
      attributes: [[sequelize.fn('DISTINCT', sequelize.col('location')), 'location']],
      order: [['location', 'ASC']]
    });
    
    return res.status(200).json(
      locations.map(l => l.location)
    );
  } catch (error) {
    console.error('Error getting asset locations:', error);
    return res.status(500).json({
      message: 'Error retrieving asset locations',
      error: error.message
    });
  }
};

module.exports = {
  getAllAssets,
  getAssetById,
  createAsset,
  updateAsset,
  deleteAsset,
  scanAsset,
  getAssetCategories,
  getAssetLocations
};