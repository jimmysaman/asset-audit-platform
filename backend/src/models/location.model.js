'use strict';

module.exports = (sequelize, DataTypes) => {
  const Location = sequelize.define('Location', {
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
      validate: {
        notEmpty: true,
        len: [1, 50]
      }
    },
    type: {
      type: DataTypes.ENUM('Room', 'Floor', 'Building', 'Zone', 'Rack', 'Shelf', 'Desk', 'Storage', 'Other'),
      allowNull: false,
      defaultValue: 'Room'
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    floor: {
      type: DataTypes.STRING,
      allowNull: true
    },
    room: {
      type: DataTypes.STRING,
      allowNull: true
    },
    zone: {
      type: DataTypes.STRING,
      allowNull: true
    },
    coordinates: {
      type: DataTypes.STRING,
      allowNull: true,
      comment: 'Internal coordinates like "A1-B2" or "Rack 5, Shelf 3"'
    },
    capacity: {
      type: DataTypes.INTEGER,
      allowNull: true,
      comment: 'Maximum number of assets this location can hold'
    },
    currentCount: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
      comment: 'Current number of assets in this location'
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true
    },
    accessLevel: {
      type: DataTypes.ENUM('Public', 'Restricted', 'Secure', 'Classified'),
      allowNull: false,
      defaultValue: 'Public'
    },
    environmentalConditions: {
      type: DataTypes.JSON,
      allowNull: true,
      defaultValue: {},
      comment: 'Temperature, humidity, etc.'
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
        fields: ['siteId', 'code'],
        unique: true
      },
      {
        fields: ['name']
      },
      {
        fields: ['type']
      },
      {
        fields: ['floor', 'room']
      }
    ]
  });

  Location.associate = (models) => {
    Location.belongsTo(models.Site, {
      foreignKey: 'siteId',
      as: 'site',
      allowNull: false
    });
    Location.belongsTo(models.Location, {
      foreignKey: 'parentLocationId',
      as: 'parentLocation'
    });
    Location.hasMany(models.Location, {
      foreignKey: 'parentLocationId',
      as: 'childLocations'
    });
    Location.hasMany(models.Asset, {
      foreignKey: 'locationId',
      as: 'assets'
    });
    Location.belongsTo(models.User, {
      foreignKey: 'createdBy',
      as: 'creator'
    });
    Location.belongsTo(models.User, {
      foreignKey: 'updatedBy',
      as: 'updater'
    });
  };

  return Location;
};
