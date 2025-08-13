'use strict';

module.exports = (sequelize, DataTypes) => {
  const Asset = sequelize.define('Asset', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    assetTag: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      validate: {
        notEmpty: true
      }
    },
    serialNumber: {
      type: DataTypes.STRING,
      allowNull: true,
      unique: true
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notEmpty: true
      }
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    category: {
      type: DataTypes.STRING,
      allowNull: false
    },
    model: {
      type: DataTypes.STRING,
      allowNull: true
    },
    manufacturer: {
      type: DataTypes.STRING,
      allowNull: true
    },
    location: {
      type: DataTypes.STRING,
      allowNull: true,
      comment: 'Legacy location field - use siteId and locationId for new records'
    },
    siteId: {
      type: DataTypes.UUID,
      allowNull: true,
      references: {
        model: 'Sites',
        key: 'id'
      }
    },
    locationId: {
      type: DataTypes.UUID,
      allowNull: true,
      references: {
        model: 'Locations',
        key: 'id'
      }
    },
    department: {
      type: DataTypes.STRING,
      allowNull: true
    },
    purchaseDate: {
      type: DataTypes.DATEONLY,
      allowNull: true
    },
    purchasePrice: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: true
    },
    condition: {
      type: DataTypes.ENUM('New', 'Good', 'Fair', 'Poor', 'Damaged', 'Retired'),
      allowNull: false,
      defaultValue: 'Good'
    },
    status: {
      type: DataTypes.ENUM('Available', 'In Use', 'In Maintenance', 'Reserved', 'Retired'),
      allowNull: false,
      defaultValue: 'Available'
    },
    custodian: {
      type: DataTypes.STRING,
      allowNull: true
    },
    notes: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    lastAuditDate: {
      type: DataTypes.DATE,
      allowNull: true
    },
    nextAuditDate: {
      type: DataTypes.DATE,
      allowNull: true
    },
    gpsLatitude: {
      type: DataTypes.DECIMAL(10, 8),
      allowNull: true
    },
    gpsLongitude: {
      type: DataTypes.DECIMAL(11, 8),
      allowNull: true
    },
    lastScannedAt: {
      type: DataTypes.DATE,
      allowNull: true
    },
    hasDiscrepancy: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    metadata: {
      type: DataTypes.JSON,
      allowNull: true
    }
  }, {
    timestamps: true,
    paranoid: true // Soft delete
  });

  Asset.associate = (models) => {
    Asset.belongsTo(models.User, {
      foreignKey: 'createdBy',
      as: 'creator'
    });
    Asset.belongsTo(models.User, {
      foreignKey: 'lastUpdatedBy',
      as: 'updater'
    });
    Asset.hasMany(models.Movement, {
      foreignKey: 'assetId',
      as: 'movements'
    });
    Asset.hasMany(models.Photo, {
      foreignKey: 'assetId',
      as: 'photos'
    });
    Asset.hasMany(models.Discrepancy, {
      foreignKey: 'assetId',
      as: 'discrepancies'
    });
    Asset.hasMany(models.AuditLog, {
      foreignKey: 'assetId',
      as: 'auditLogs'
    });
    Asset.belongsTo(models.Site, {
      foreignKey: 'siteId',
      as: 'site'
    });
    Asset.belongsTo(models.Location, {
      foreignKey: 'locationId',
      as: 'assetLocation'
    });
  };

  return Asset;
};