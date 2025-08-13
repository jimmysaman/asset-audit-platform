const { Site, Location, Asset, User, sequelize } = require('../models');
const { Op } = require('sequelize');

/**
 * Get all sites with pagination and filtering
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const getSites = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      search = '',
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
        { city: { [Op.iLike]: `%${search}%` } },
        { address: { [Op.iLike]: `%${search}%` } }
      ];
    }

    // Type filter
    if (type) {
      whereClause.type = type;
    }

    // Active status filter
    if (isActive !== '') {
      whereClause.isActive = isActive === 'true';
    }

    const { count, rows: sites } = await Site.findAndCountAll({
      where: whereClause,
      include: [
        {
          model: User,
          as: 'creator',
          attributes: ['id', 'firstName', 'lastName']
        },
        {
          model: Asset,
          as: 'assets',
          attributes: ['id'],
          required: false
        },

      ],
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [[sortBy, sortOrder.toUpperCase()]],
      distinct: true
    });

    // Add asset count to each site
    const sitesWithCounts = sites.map(site => {
      const siteData = site.toJSON();
      siteData.assetCount = siteData.assets ? siteData.assets.length : 0;
      siteData.locationCount = siteData.locations ? siteData.locations.length : 0;
      delete siteData.assets; // Remove the full assets array
      return siteData;
    });

    return res.status(200).json({
      sites: sitesWithCounts,
      total: count,
      page: parseInt(page),
      limit: parseInt(limit),
      totalPages: Math.ceil(count / limit)
    });
  } catch (error) {
    console.error('Error fetching sites:', error);
    return res.status(500).json({
      message: 'Error fetching sites',
      error: error.message
    });
  }
};

/**
 * Get site by ID
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const getSiteById = async (req, res) => {
  try {
    const { id } = req.params;

    const site = await Site.findByPk(id, {
      include: [
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
          as: 'locations',
          include: [
            {
              model: Asset,
              as: 'assets',
              attributes: ['id', 'name', 'assetTag', 'status']
            }
          ]
        }
      ]
    });

    if (!site) {
      return res.status(404).json({
        message: 'Site not found'
      });
    }

    return res.status(200).json(site);
  } catch (error) {
    console.error('Error fetching site:', error);
    return res.status(500).json({
      message: 'Error fetching site',
      error: error.message
    });
  }
};

/**
 * Create a new site
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const createSite = async (req, res) => {
  try {
    const {
      name,
      code,
      type,
      address,
      city,
      state,
      country,
      postalCode,
      latitude,
      longitude,
      contactPerson,
      contactPhone,
      contactEmail,
      description,
      timezone,
      operatingHours,
      metadata
    } = req.body;

    // Check if site code already exists
    const existingSite = await Site.findOne({ where: { code } });
    if (existingSite) {
      return res.status(400).json({
        message: 'Site code already exists'
      });
    }

    const site = await Site.create({
      name,
      code,
      type,
      address,
      city,
      state,
      country,
      postalCode,
      latitude,
      longitude,
      contactPerson,
      contactPhone,
      contactEmail,
      description,
      timezone,
      operatingHours,
      metadata,
      createdBy: req.user.id
    });

    return res.status(201).json({
      message: 'Site created successfully',
      site
    });
  } catch (error) {
    console.error('Error creating site:', error);
    return res.status(500).json({
      message: 'Error creating site',
      error: error.message
    });
  }
};

/**
 * Update site
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const updateSite = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = { ...req.body, updatedBy: req.user.id };

    const site = await Site.findByPk(id);
    if (!site) {
      return res.status(404).json({
        message: 'Site not found'
      });
    }

    // Check if code is being changed and if it already exists
    if (updateData.code && updateData.code !== site.code) {
      const existingSite = await Site.findOne({ 
        where: { 
          code: updateData.code,
          id: { [Op.ne]: id }
        } 
      });
      if (existingSite) {
        return res.status(400).json({
          message: 'Site code already exists'
        });
      }
    }

    await site.update(updateData);

    return res.status(200).json({
      message: 'Site updated successfully',
      site
    });
  } catch (error) {
    console.error('Error updating site:', error);
    return res.status(500).json({
      message: 'Error updating site',
      error: error.message
    });
  }
};

/**
 * Delete site
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const deleteSite = async (req, res) => {
  try {
    const { id } = req.params;

    const site = await Site.findByPk(id);
    if (!site) {
      return res.status(404).json({
        message: 'Site not found'
      });
    }

    // Check if site has assets
    const assetCount = await Asset.count({ where: { siteId: id } });
    if (assetCount > 0) {
      return res.status(400).json({
        message: `Cannot delete site. It has ${assetCount} assets assigned to it.`
      });
    }

    // Check if site has locations
    const locationCount = await Location.count({ where: { siteId: id } });
    if (locationCount > 0) {
      return res.status(400).json({
        message: `Cannot delete site. It has ${locationCount} locations.`
      });
    }

    await site.destroy();

    return res.status(200).json({
      message: 'Site deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting site:', error);
    return res.status(500).json({
      message: 'Error deleting site',
      error: error.message
    });
  }
};

/**
 * Get site types
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const getSiteTypes = async (req, res) => {
  try {
    const types = ['Office', 'Warehouse', 'Factory', 'Store', 'Branch', 'Data Center', 'Other'];
    return res.status(200).json({ types });
  } catch (error) {
    console.error('Error fetching site types:', error);
    return res.status(500).json({
      message: 'Error fetching site types',
      error: error.message
    });
  }
};

module.exports = {
  getSites,
  getSiteById,
  createSite,
  updateSite,
  deleteSite,
  getSiteTypes
};
