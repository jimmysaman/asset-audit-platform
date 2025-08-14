/**
 * Permission middleware for checking user permissions
 * This middleware works with the role-based permission system
 */

/**
 * Middleware to check if user has specific permission for a resource and action
 * @param {string} resource - The resource being accessed (e.g., 'sites', 'assets', 'users')
 * @param {string} action - The action being performed (e.g., 'read', 'write', 'delete')
 */
const checkPermission = (resource, action) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ message: 'User not authenticated' });
    }
    
    if (!req.user.role) {
      return res.status(403).json({ message: 'User has no assigned role' });
    }
    
    // Admin role has all permissions
    if (req.user.role.name === 'Admin') {
      return next();
    }
    
    // Check if user has permissions object
    if (!req.user.role.permissions) {
      return res.status(403).json({ message: 'User has no permissions' });
    }
    
    // Build permission key (e.g., 'sites.read', 'assets.write')
    const permissionKey = `${resource}.${action}`;
    
    // Check if user has the specific permission
    if (req.user.role.permissions[permissionKey] === true) {
      return next();
    }
    
    // Check for wildcard permissions (e.g., 'sites.*' for all site permissions)
    const wildcardKey = `${resource}.*`;
    if (req.user.role.permissions[wildcardKey] === true) {
      return next();
    }
    
    // Check for global permissions (e.g., '*.*' for all permissions)
    if (req.user.role.permissions['*.*'] === true) {
      return next();
    }
    
    return res.status(403).json({ 
      message: `Access denied: missing ${permissionKey} permission` 
    });
  };
};

/**
 * Middleware to check if user can access their own resources or has admin privileges
 * @param {string} userIdParam - The parameter name containing the user ID (default: 'userId')
 */
const checkOwnershipOrAdmin = (userIdParam = 'userId') => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ message: 'User not authenticated' });
    }
    
    // Admin can access any resource
    if (req.user.role && req.user.role.name === 'Admin') {
      return next();
    }
    
    // Check if user is accessing their own resource
    const resourceUserId = req.params[userIdParam] || req.body[userIdParam];
    if (resourceUserId && resourceUserId === req.user.id) {
      return next();
    }
    
    return res.status(403).json({ 
      message: 'Access denied: can only access your own resources' 
    });
  };
};

/**
 * Middleware to check if user has admin role
 */
const requireAdmin = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ message: 'User not authenticated' });
  }
  
  if (!req.user.role || req.user.role.name !== 'Admin') {
    return res.status(403).json({ message: 'Access denied: admin role required' });
  }
  
  next();
};

/**
 * Middleware to check if user has any of the specified roles
 * @param {string[]} roles - Array of role names that are allowed
 */
const hasAnyRole = (roles) => {
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
    
    return res.status(403).json({ 
      message: `Access denied: requires one of these roles: ${roles.join(', ')}` 
    });
  };
};

module.exports = {
  checkPermission,
  checkOwnershipOrAdmin,
  requireAdmin,
  hasAnyRole
};
