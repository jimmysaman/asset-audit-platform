const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { v4: uuidv4 } = require('uuid');

// Ensure upload directory exists
const uploadDir = process.env.UPLOAD_DIR || 'uploads';
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Configure storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    // Create asset-specific directory if assetId is provided
    let destPath = uploadDir;
    if (req.params.assetId) {
      destPath = path.join(uploadDir, req.params.assetId);
      if (!fs.existsSync(destPath)) {
        fs.mkdirSync(destPath, { recursive: true });
      }
    }
    cb(null, destPath);
  },
  filename: (req, file, cb) => {
    // Generate unique filename with original extension
    const fileExt = path.extname(file.originalname);
    const fileName = `${uuidv4()}${fileExt}`;
    cb(null, fileName);
  }
});

// File filter to allow only images
const fileFilter = (req, file, cb) => {
  const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
  
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type. Only JPEG, PNG, GIF, and WebP images are allowed.'), false);
  }
};

// Create multer upload instance
const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: parseInt(process.env.MAX_FILE_SIZE) || 5 * 1024 * 1024 // 5MB default
  }
});

// Middleware to extract GPS data from EXIF if available
const extractMetadata = (req, res, next) => {
  if (!req.file) return next();
  
  try {
    // Here you would use a library like 'exif-parser' to extract metadata
    // For now, we'll just add placeholder data
    req.file.metadata = {
      capturedAt: new Date(),
      gpsLatitude: req.body.latitude || null,
      gpsLongitude: req.body.longitude || null
    };
    next();
  } catch (error) {
    console.error('Error extracting metadata:', error);
    next();
  }
};

module.exports = {
  upload,
  extractMetadata
};