const { Role, User } = require('../models');

/**
 * Get all roles
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const getAllRoles = async (req, res) => {
  try {
    const roles = await Role.findAll({
      order: [['name', 'ASC']]
    });
    
    return res.status(200).json(roles);
  } catch (error) {
    console.error('Error getting roles:', error);
    return res.status(500).json({
      message: 'Error retrieving roles',
      error: error.message
    });
  }
};

/**
 * Get role by ID
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const getRoleById = async (req, res) => {
  try {
    const { id } = req.params;
    
    const role = await Role.findByPk(id);
    
    if (!role) {
      return res.status(404).json({
        message: 'Role not found'
      });
    }
    
    return res.status(200).json(role);
  } catch (error) {
    console.error('Error getting role:', error);
    return res.status(500).json({
      message: 'Error retrieving role',
      error: error.message
    });
  }
};

/**
 * Create a new role
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const createRole = async (req, res) => {
  try {
    const { name, description, permissions } = req.body;
    
    // Check if role with same name already exists
    const existingRole = await Role.findOne({ where: { name } });
    if (existingRole) {
      return res.status(400).json({
        message: 'Role with this name already exists'
      });
    }
    
    // Create role
    const role = await Role.create({
      name,
      description,
      permissions
    });
    
    return res.status(201).json({
      message: 'Role created successfully',
      role
    });
  } catch (error) {
    console.error('Error creating role:', error);
    return res.status(500).json({
      message: 'Error creating role',
      error: error.message
    });
  }
};

/**
 * Update a role
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const updateRole = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, permissions } = req.body;
    
    // Find role
    const role = await Role.findByPk(id);
    if (!role) {
      return res.status(404).json({
        message: 'Role not found'
      });
    }
    
    // Check if updating to a name that already exists
    if (name && name !== role.name) {
      const existingRole = await Role.findOne({ where: { name } });
      if (existingRole) {
        return res.status(400).json({
          message: 'Role with this name already exists'
        });
      }
    }
    
    // Update role
    await role.update({
      name,
      description,
      permissions
    });
    
    return res.status(200).json({
      message: 'Role updated successfully',
      role
    });
  } catch (error) {
    console.error('Error updating role:', error);
    return res.status(500).json({
      message: 'Error updating role',
      error: error.message
    });
  }
};

/**
 * Delete a role
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const deleteRole = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Find role
    const role = await Role.findByPk(id);
    if (!role) {
      return res.status(404).json({
        message: 'Role not found'
      });
    }
    
    // Check if role is assigned to any users
    const usersWithRole = await User.count({ where: { roleId: id } });
    if (usersWithRole > 0) {
      return res.status(400).json({
        message: `Cannot delete role: it is assigned to ${usersWithRole} user(s)`,
        usersCount: usersWithRole
      });
    }
    
    // Delete role
    await role.destroy();
    
    return res.status(200).json({
      message: 'Role deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting role:', error);
    return res.status(500).json({
      message: 'Error deleting role',
      error: error.message
    });
  }
};

module.exports = {
  getAllRoles,
  getRoleById,
  createRole,
  updateRole,
  deleteRole
};