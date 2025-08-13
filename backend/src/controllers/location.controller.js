const { Location, Site, Asset, User, sequelize } = require('../models');
const { Op } = require('sequelize');

/**
 * Get all locations with pagination and filtering
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const getLocations = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      search = '',
      siteId = '',
      type = '',
      isActive = '',
      sortBy = 'name',
      sortOrder = 'ASC'
    } = req.query;

    const offset = (page - 1) * limit;
    const whereClause = {};

    // Search filter
    if (search) {
      whereClause[Op.or] = [
        { name: { [Op.iLike]: `%${search}%` } },
        { code: { [Op.iLike]: `%${search}%` } },
        { room: { [Op.iLike]: `%${search}%` } },
        { floor: { [Op.iLike]: `%${search}%` } }
      ];
    }

    // Site filter
    if (siteId) {
      whereClause.siteId = siteId;
    }

    // Type filter
    if (type) {
      whereClause.type = type;
    }

    // Active status filter
    if (isActive !== '') {
      whereClause.isActive = isActive === 'true';
    }

    const { count, rows: locations } = await Location.findAndCountAll({
      where: whereClause,
      include: [
        {
          model: Site,
          as: 'site',
          attributes: ['id', 'name', 'code', 'type']
        },
        {
          model: User,
          as: 'creator',
          attributes: ['id', 'firstName', 'lastName']
        },
        {
          model: Location,
          as: 'parentLocation',
          attributes: ['id', 'name', 'code']
        },
        {
          model: Asset,
          as: 'assets',
          attributes: ['id'],
          required: false
        }
      ],
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [[sortBy, sortOrder.toUpperCase()]],
      distinct: true
    });

    // Add asset count to each location
    const locationsWithCounts = locations.map(location => {
      const locationData = location.toJSON();
      locationData.assetCount = locationData.assets ? locationData.assets.length : 0;
      delete locationData.assets; // Remove the full assets array
      return locationData;
    });

    return res.status(200).json({
      locations: locationsWithCounts,
      total: count,
      page: parseInt(page),
      limit: parseInt(limit),
      totalPages: Math.ceil(count / limit)
    });
  } catch (error) {
    console.error('Error fetching locations:', error);
    return res.status(500).json({
      message: 'Error fetching locations',
      error: error.message
    });
  }
};

/**
 * Get location by ID
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const getLocationById = async (req, res) => {
  try {
    const { id } = req.params;

    const location = await Location.findByPk(id, {
      include: [
        {
          model: Site,
          as: 'site',
          attributes: ['id', 'name', 'code', 'type', 'address', 'city']
        },
        {
          model: User,
          as: 'creator',
          attributes: ['id', 'firstName', 'lastName']
        },
        {
          model: User,
          as: 'updater',
          attributes: ['id', 'firstName', 'lastName']
        },
        {
          model: Location,
          as: 'parentLocation',
          attributes: ['id', 'name', 'code', 'type']
        },
        {
          model: Location,
          as: 'childLocations',
          attributes: ['id', 'name', 'code', 'type']
        },
        {
          model: Asset,
          as: 'assets',
          attributes: ['id', 'name', 'assetTag', 'status', 'condition']
        }
      ]
    });

    if (!location) {
      return res.status(404).json({
        message: 'Location not found'
      });
    }

    return res.status(200).json(location);
  } catch (error) {
    console.error('Error fetching location:', error);
    return res.status(500).json({
      message: 'Error fetching location',
      error: error.message
    });
  }
};

/**
 * Create a new location
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const createLocation = async (req, res) => {
  try {
    const {
      name,
      code,
      siteId,
      type,
      description,
      floor,
      room,
      zone,
      coordinates,
      capacity,
      accessLevel,
      parentLocationId,
      environmentalConditions,
      metadata
    } = req.body;

    // Validate site exists
    const site = await Site.findByPk(siteId);
    if (!site) {
      return res.status(404).json({
        message: 'Site not found'
      });
    }

    // Check if location code already exists within the site
    const existingLocation = await Location.findOne({ 
      where: { 
        code,
        siteId
      } 
    });
    if (existingLocation) {
      return res.status(400).json({
        message: 'Location code already exists in this site'
      });
    }

    // Validate parent location if provided
    if (parentLocationId) {
      const parentLocation = await Location.findByPk(parentLocationId);
      if (!parentLocation || parentLocation.siteId !== siteId) {
        return res.status(400).json({
          message: 'Parent location not found or not in the same site'
        });
      }
    }

    const location = await Location.create({
      name,
      code,
      siteId,
      type,
      description,
      floor,
      room,
      zone,
      coordinates,
      capacity,
      accessLevel,
      parentLocationId,
      environmentalConditions,
      metadata,
      createdBy: req.user.id
    });

    return res.status(201).json({
      message: 'Location created successfully',
      location
    });
  } catch (error) {
    console.error('Error creating location:', error);
    return res.status(500).json({
      message: 'Error creating location',
      error: error.message
    });
  }
};

/**
 * Update location
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const updateLocation = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = { ...req.body, updatedBy: req.user.id };

    const location = await Location.findByPk(id);
    if (!location) {
      return res.status(404).json({
        message: 'Location not found'
      });
    }

    // Check if code is being changed and if it already exists
    if (updateData.code && updateData.code !== location.code) {
      const existingLocation = await Location.findOne({ 
        where: { 
          code: updateData.code,
          siteId: updateData.siteId || location.siteId,
          id: { [Op.ne]: id }
        } 
      });
      if (existingLocation) {
        return res.status(400).json({
          message: 'Location code already exists in this site'
        });
      }
    }

    await location.update(updateData);

    return res.status(200).json({
      message: 'Location updated successfully',
      location
    });
  } catch (error) {
    console.error('Error updating location:', error);
    return res.status(500).json({
      message: 'Error updating location',
      error: error.message
    });
  }
};

/**
 * Delete location
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const deleteLocation = async (req, res) => {
  try {
    const { id } = req.params;

    const location = await Location.findByPk(id);
    if (!location) {
      return res.status(404).json({
        message: 'Location not found'
      });
    }

    // Check if location has assets
    const assetCount = await Asset.count({ where: { locationId: id } });
    if (assetCount > 0) {
      return res.status(400).json({
        message: `Cannot delete location. It has ${assetCount} assets assigned to it.`
      });
    }

    // Check if location has child locations
    const childCount = await Location.count({ where: { parentLocationId: id } });
    if (childCount > 0) {
      return res.status(400).json({
        message: `Cannot delete location. It has ${childCount} child locations.`
      });
    }

    await location.destroy();

    return res.status(200).json({
      message: 'Location deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting location:', error);
    return res.status(500).json({
      message: 'Error deleting location',
      error: error.message
    });
  }
};

/**
 * Get location types
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const getLocationTypes = async (req, res) => {
  try {
    const types = ['Room', 'Floor', 'Building', 'Zone', 'Rack', 'Shelf', 'Desk', 'Storage', 'Other'];
    return res.status(200).json({ types });
  } catch (error) {
    console.error('Error fetching location types:', error);
    return res.status(500).json({
      message: 'Error fetching location types',
      error: error.message
    });
  }
};

/**
 * Get locations by site
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const getLocationsBySite = async (req, res) => {
  try {
    const { siteId } = req.params;

    const locations = await Location.findAll({
      where: { 
        siteId,
        isActive: true
      },
      attributes: ['id', 'name', 'code', 'type', 'floor', 'room', 'currentCount', 'capacity'],
      order: [['name', 'ASC']]
    });

    return res.status(200).json({ locations });
  } catch (error) {
    console.error('Error fetching locations by site:', error);
    return res.status(500).json({
      message: 'Error fetching locations by site',
      error: error.message
    });
  }
};

module.exports = {
  getLocations,
  getLocationById,
  createLocation,
  updateLocation,
  deleteLocation,
  getLocationTypes,
  getLocationsBySite
};
