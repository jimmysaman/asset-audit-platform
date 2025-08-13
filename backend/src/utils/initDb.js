const { Role, User } = require('../models');

/**
 * Initialize database with default roles and admin user
 */
const initializeDatabase = async () => {
  try {
    console.log('Initializing database with default data...');
    
    // Create default roles if they don't exist
    const roles = [
      {
        name: 'Admin',
        description: 'System administrator with full access',
        permissions: {
          users: { create: true, read: true, update: true, delete: true },
          roles: { create: true, read: true, update: true, delete: true },
          assets: { create: true, read: true, update: true, delete: true },
          movements: { create: true, read: true, update: true, delete: true, approve: true },
          photos: { create: true, read: true, update: true, delete: true },
          discrepancies: { create: true, read: true, update: true, delete: true, resolve: true },
          reports: { create: true, read: true, export: true }
        }
      },
      {
        name: 'Auditor',
        description: 'Auditor with read access and discrepancy management',
        permissions: {
          users: { read: true },
          roles: { read: true },
          assets: { read: true, update: true },
          movements: { read: true, approve: true },
          photos: { create: true, read: true },
          discrepancies: { create: true, read: true, update: true, resolve: true },
          reports: { create: true, read: true, export: true }
        }
      },
      {
        name: 'Field Agent',
        description: 'Field agent for asset scanning and data collection',
        permissions: {
          assets: { read: true },
          movements: { create: true, read: true },
          photos: { create: true, read: true },
          discrepancies: { create: true, read: true }
        }
      }
    ];
    
    for (const roleData of roles) {
      const [role, created] = await Role.findOrCreate({
        where: { name: roleData.name },
        defaults: roleData
      });
      
      if (created) {
        console.log(`Created role: ${role.name}`);
      } else {
        console.log(`Role already exists: ${role.name}`);
      }
    }
    
    // Create admin user if it doesn't exist
    const adminRole = await Role.findOne({ where: { name: 'Admin' } });
    
    if (adminRole) {
      const [adminUser, created] = await User.findOrCreate({
        where: { username: 'admin' },
        defaults: {
          username: 'admin',
          email: 'admin@saarp.com',
          password: 'Admin123!', // Will be hashed by model hook
          firstName: 'System',
          lastName: 'Administrator',
          roleId: adminRole.id,
          isActive: true
        }
      });
      
      if (created) {
        console.log('Created admin user');
      } else {
        console.log('Admin user already exists');
      }
    }
    
    console.log('Database initialization completed');
  } catch (error) {
    console.error('Error initializing database:', error);
  }
};

module.exports = initializeDatabase;