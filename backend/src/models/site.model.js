'use strict';

module.exports = (sequelize, DataTypes) => {
  const Site = sequelize.define('Site', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notEmpty: true,
        len: [1, 255]
      }
    },
    code: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      validate: {
        notEmpty: true,
        len: [1, 50]
      }
    },
    type: {
      type: DataTypes.ENUM('Office', 'Warehouse', 'Factory', 'Store', 'Branch', 'Data Center', 'Other'),
      allowNull: false,
      defaultValue: 'Office'
    },
    address: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    city: {
      type: DataTypes.STRING,
      allowNull: true
    },
    state: {
      type: DataTypes.STRING,
      allowNull: true
    },
    country: {
      type: DataTypes.STRING,
      allowNull: true
    },
    postalCode: {
      type: DataTypes.STRING,
      allowNull: true
    },
    latitude: {
      type: DataTypes.DECIMAL(10, 8),
      allowNull: true,
      validate: {
        min: -90,
        max: 90
      }
    },
    longitude: {
      type: DataTypes.DECIMAL(11, 8),
      allowNull: true,
      validate: {
        min: -180,
        max: 180
      }
    },
    contactPerson: {
      type: DataTypes.STRING,
      allowNull: true
    },
    contactPhone: {
      type: DataTypes.STRING,
      allowNull: true
    },
    contactEmail: {
      type: DataTypes.STRING,
      allowNull: true,
      validate: {
        isEmail: true
      }
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true
    },
    timezone: {
      type: DataTypes.STRING,
      allowNull: true,
      defaultValue: 'UTC'
    },
    operatingHours: {
      type: DataTypes.JSON,
      allowNull: true,
      defaultValue: {
        monday: { open: '09:00', close: '17:00', closed: false },
        tuesday: { open: '09:00', close: '17:00', closed: false },
        wednesday: { open: '09:00', close: '17:00', closed: false },
        thursday: { open: '09:00', close: '17:00', closed: false },
        friday: { open: '09:00', close: '17:00', closed: false },
        saturday: { open: '09:00', close: '17:00', closed: true },
        sunday: { open: '09:00', close: '17:00', closed: true }
      }
    },
    metadata: {
      type: DataTypes.JSON,
      allowNull: true,
      defaultValue: {}
    }
  }, {
    timestamps: true,
    indexes: [
      {
        fields: ['code'],
        unique: true
      },
      {
        fields: ['name']
      },
      {
        fields: ['type']
      },
      {
        fields: ['city', 'state', 'country']
      },
      {
        fields: ['latitude', 'longitude']
      }
    ]
  });

  Site.associate = (models) => {
    Site.hasMany(models.Asset, {
      foreignKey: 'siteId',
      as: 'assets'
    });
    Site.hasMany(models.Movement, {
      foreignKey: 'fromSiteId',
      as: 'outgoingMovements'
    });
    Site.hasMany(models.Movement, {
      foreignKey: 'toSiteId',
      as: 'incomingMovements'
    });
    Site.belongsTo(models.User, {
      foreignKey: 'createdBy',
      as: 'creator'
    });
    Site.belongsTo(models.User, {
      foreignKey: 'updatedBy',
      as: 'updater'
    });
  };

  return Site;
};
