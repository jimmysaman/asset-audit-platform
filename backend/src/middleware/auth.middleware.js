const jwt = require('jsonwebtoken');
const { User, Role } = require('../models');

/**
 * Middleware to verify JWT token and attach user to request
 */
const verifyToken = async (req, res, next) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN format
    
    if (!token) {
      return res.status(401).json({ message: 'No token provided' });
    }
    
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Find user with role
    const user = await User.findByPk(decoded.id, {
      include: [{
        model: Role,
        as: 'role',
        attributes: ['name', 'permissions']
      }],
      attributes: { exclude: ['password'] }
    });
    
    if (!user) {
      return res.status(401).json({ message: 'User not found' });
    }
    
    if (!user.isActive) {
      return res.status(403).json({ message: 'User account is inactive' });
    }
    
    // Attach user to request object
    req.user = user;
    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ message: 'Token expired' });
    }
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ message: 'Invalid token' });
    }
    console.error('Auth middleware error:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

/**
 * Middleware to check if user has required role
 * @param {string[]} roles - Array of role names that are allowed
 */
const hasRole = (roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ message: 'User not authenticated' });
    }
    
    if (!req.user.role) {
      return res.status(403).json({ message: 'User has no assigned role' });
    }
    
    if (roles.includes(req.user.role.name)) {
      return next();
    }
    
    return res.status(403).json({ message: 'Access denied: insufficient permissions' });
  };
};

/**
 * Middleware to check if user has specific permission
 * @param {string} permission - Permission required
 */
const hasPermission = (permission) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ message: 'User not authenticated' });
    }
    
    if (!req.user.role || !req.user.role.permissions) {
      return res.status(403).json({ message: 'User has no permissions' });
    }
    
    // Check if user has the required permission
    if (req.user.role.permissions[permission]) {
      return next();
    }
    
    return res.status(403).json({ message: `Access denied: missing ${permission} permission` });
  };
};

module.exports = {
  verifyToken,
  hasRole,
  hasPermission
};