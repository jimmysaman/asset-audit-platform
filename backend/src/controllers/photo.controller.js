const fs = require('fs');
const path = require('path');
const { Photo, Asset, Movement, User, sequelize } = require('../models');

/**
 * Upload a photo for an asset or movement
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const uploadPhoto = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        message: 'No file uploaded'
      });
    }
    
    const { assetId, movementId, description } = req.body;
    
    // Validate that either assetId or movementId is provided
    if (!assetId && !movementId) {
      // Remove uploaded file if no valid association
      fs.unlinkSync(req.file.path);
      
      return res.status(400).json({
        message: 'Either assetId or movementId must be provided'
      });
    }
    
    // If assetId is provided, validate it exists
    if (assetId) {
      const asset = await Asset.findByPk(assetId);
      if (!asset) {
        // Remove uploaded file if asset not found
        fs.unlinkSync(req.file.path);
        
        return res.status(404).json({
          message: 'Asset not found'
        });
      }
    }
    
    // If movementId is provided, validate it exists
    if (movementId) {
      const movement = await Movement.findByPk(movementId);
      if (!movement) {
        // Remove uploaded file if movement not found
        fs.unlinkSync(req.file.path);
        
        return res.status(404).json({
          message: 'Movement not found'
        });
      }
    }
    
    // Extract GPS data from image if available
    let gpsLatitude = null;
    let gpsLongitude = null;
    
    if (req.metadata && req.metadata.gps) {
      gpsLatitude = req.metadata.gps.latitude;
      gpsLongitude = req.metadata.gps.longitude;
    }
    
    // Create photo record
    const photo = await Photo.create({
      filename: req.file.filename,
      filepath: req.file.path,
      filesize: req.file.size,
      mimetype: req.file.mimetype,
      description,
      assetId: assetId || null,
      movementId: movementId || null,
      userId: req.user.id,
      gpsLatitude,
      gpsLongitude,
      capturedAt: new Date()
    });
    
    return res.status(201).json({
      message: 'Photo uploaded successfully',
      photo
    });
  } catch (error) {
    console.error('Error uploading photo:', error);
    
    // Clean up file if it was uploaded
    if (req.file && req.file.path) {
      try {
        fs.unlinkSync(req.file.path);
      } catch (unlinkError) {
        console.error('Error removing file after failed upload:', unlinkError);
      }
    }
    
    return res.status(500).json({
      message: 'Error uploading photo',
      error: error.message
    });
  }
};

/**
 * Get photos for an asset
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const getAssetPhotos = async (req, res) => {
  try {
    const { assetId } = req.params;
    
    // Validate asset exists
    const asset = await Asset.findByPk(assetId);
    if (!asset) {
      return res.status(404).json({
        message: 'Asset not found'
      });
    }
    
    // Get photos for the asset
    const photos = await Photo.findAll({
      where: { assetId },
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['id', 'username', 'firstName', 'lastName']
        }
      ],
      order: [['capturedAt', 'DESC']]
    });
    
    return res.status(200).json(photos);
  } catch (error) {
    console.error('Error getting asset photos:', error);
    return res.status(500).json({
      message: 'Error retrieving asset photos',
      error: error.message
    });
  }
};

/**
 * Get photos for a movement
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const getMovementPhotos = async (req, res) => {
  try {
    const { movementId } = req.params;
    
    // Validate movement exists
    const movement = await Movement.findByPk(movementId);
    if (!movement) {
      return res.status(404).json({
        message: 'Movement not found'
      });
    }
    
    // Get photos for the movement
    const photos = await Photo.findAll({
      where: { movementId },
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['id', 'username', 'firstName', 'lastName']
        }
      ],
      order: [['capturedAt', 'DESC']]
    });
    
    return res.status(200).json(photos);
  } catch (error) {
    console.error('Error getting movement photos:', error);
    return res.status(500).json({
      message: 'Error retrieving movement photos',
      error: error.message
    });
  }
};

/**
 * Get a photo by ID
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const getPhotoById = async (req, res) => {
  try {
    const { id } = req.params;
    
    const photo = await Photo.findByPk(id, {
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['id', 'username', 'firstName', 'lastName']
        },
        {
          model: Asset,
          as: 'asset',
          attributes: ['id', 'assetTag', 'name']
        },
        {
          model: Movement,
          as: 'movement',
          attributes: ['id', 'type', 'status']
        }
      ]
    });
    
    if (!photo) {
      return res.status(404).json({
        message: 'Photo not found'
      });
    }
    
    return res.status(200).json(photo);
  } catch (error) {
    console.error('Error getting photo:', error);
    return res.status(500).json({
      message: 'Error retrieving photo',
      error: error.message
    });
  }
};

/**
 * Update a photo's description
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const updatePhoto = async (req, res) => {
  try {
    const { id } = req.params;
    const { description } = req.body;
    
    const photo = await Photo.findByPk(id);
    if (!photo) {
      return res.status(404).json({
        message: 'Photo not found'
      });
    }
    
    // Update photo description
    await photo.update({ description });
    
    return res.status(200).json({
      message: 'Photo updated successfully',
      photo
    });
  } catch (error) {
    console.error('Error updating photo:', error);
    return res.status(500).json({
      message: 'Error updating photo',
      error: error.message
    });
  }
};

/**
 * Delete a photo
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const deletePhoto = async (req, res) => {
  try {
    const { id } = req.params;
    
    const photo = await Photo.findByPk(id);
    if (!photo) {
      return res.status(404).json({
        message: 'Photo not found'
      });
    }
    
    // Get file path
    const filePath = photo.filepath;
    
    // Delete photo record
    await photo.destroy();
    
    // Delete file from disk
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }
    
    return res.status(200).json({
      message: 'Photo deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting photo:', error);
    return res.status(500).json({
      message: 'Error deleting photo',
      error: error.message
    });
  }
};

/**
 * Serve a photo file
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const servePhoto = async (req, res) => {
  try {
    const { id } = req.params;
    
    const photo = await Photo.findByPk(id);
    if (!photo) {
      return res.status(404).json({
        message: 'Photo not found'
      });
    }
    
    // Check if file exists
    if (!fs.existsSync(photo.filepath)) {
      return res.status(404).json({
        message: 'Photo file not found on disk'
      });
    }
    
    // Serve the file
    res.setHeader('Content-Type', photo.mimetype);
    res.setHeader('Content-Disposition', `inline; filename="${photo.filename}"`);
    
    const fileStream = fs.createReadStream(photo.filepath);
    fileStream.pipe(res);
  } catch (error) {
    console.error('Error serving photo:', error);
    return res.status(500).json({
      message: 'Error serving photo',
      error: error.message
    });
  }
};

module.exports = {
  uploadPhoto,
  getAssetPhotos,
  getMovementPhotos,
  getPhotoById,
  updatePhoto,
  deletePhoto,
  servePhoto
};