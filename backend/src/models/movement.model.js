'use strict';

module.exports = (sequelize, DataTypes) => {
  const Movement = sequelize.define('Movement', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    type: {
      type: DataTypes.ENUM('Transfer', 'Checkout', 'Return', 'Maintenance', 'Disposal'),
      allowNull: false
    },
    fromLocation: {
      type: DataTypes.STRING,
      allowNull: true,
      comment: 'Legacy location field - use fromSiteId and fromLocationId for new records'
    },
    toLocation: {
      type: DataTypes.STRING,
      allowNull: true,
      comment: 'Legacy location field - use toSiteId and toLocationId for new records'
    },
    fromSiteId: {
      type: DataTypes.UUID,
      allowNull: true,
      references: {
        model: 'Sites',
        key: 'id'
      }
    },
    toSiteId: {
      type: DataTypes.UUID,
      allowNull: true,
      references: {
        model: 'Sites',
        key: 'id'
      }
    },
    fromLocationId: {
      type: DataTypes.UUID,
      allowNull: true,
      references: {
        model: 'Locations',
        key: 'id'
      }
    },
    toLocationId: {
      type: DataTypes.UUID,
      allowNull: true,
      references: {
        model: 'Locations',
        key: 'id'
      }
    },
    fromCustodian: {
      type: DataTypes.STRING,
      allowNull: true
    },
    toCustodian: {
      type: DataTypes.STRING,
      allowNull: true
    },
    requestDate: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW
    },
    approvalDate: {
      type: DataTypes.DATE,
      allowNull: true
    },
    completionDate: {
      type: DataTypes.DATE,
      allowNull: true
    },
    status: {
      type: DataTypes.ENUM('Requested', 'Approved', 'Rejected', 'Completed', 'Cancelled'),
      allowNull: false,
      defaultValue: 'Requested'
    },
    reason: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    notes: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    hasDiscrepancy: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    metadata: {
      type: DataTypes.JSON,
      allowNull: true,
      defaultValue: {}
    }
  }, {
    timestamps: true
  });

  Movement.associate = (models) => {
    Movement.belongsTo(models.Asset, {
      foreignKey: 'assetId',
      as: 'asset'
    });
    Movement.belongsTo(models.User, {
      foreignKey: 'requestedBy',
      as: 'requester'
    });
    Movement.belongsTo(models.User, {
      foreignKey: 'approvedBy',
      as: 'approver'
    });
    Movement.hasMany(models.Photo, {
      foreignKey: 'movementId',
      as: 'photos'
    });
    Movement.hasMany(models.Discrepancy, {
      foreignKey: 'movementId',
      as: 'discrepancies'
    });
    Movement.belongsTo(models.Site, {
      foreignKey: 'fromSiteId',
      as: 'fromSite'
    });
    Movement.belongsTo(models.Site, {
      foreignKey: 'toSiteId',
      as: 'toSite'
    });
    Movement.belongsTo(models.Location, {
      foreignKey: 'fromLocationId',
      as: 'fromLocationDetail'
    });
    Movement.belongsTo(models.Location, {
      foreignKey: 'toLocationId',
      as: 'toLocationDetail'
    });
  };

  return Movement;
};