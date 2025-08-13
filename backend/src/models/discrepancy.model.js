'use strict';

module.exports = (sequelize, DataTypes) => {
  const Discrepancy = sequelize.define('Discrepancy', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    type: {
      type: DataTypes.ENUM('Location', 'Custodian', 'Condition', 'Missing', 'Duplicate', 'Other'),
      allowNull: false
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    expectedValue: {
      type: DataTypes.STRING,
      allowNull: true
    },
    actualValue: {
      type: DataTypes.STRING,
      allowNull: true
    },
    status: {
      type: DataTypes.ENUM('Open', 'In Progress', 'Resolved', 'Closed'),
      allowNull: false,
      defaultValue: 'Open'
    },
    priority: {
      type: DataTypes.ENUM('Low', 'Medium', 'High', 'Critical'),
      allowNull: false,
      defaultValue: 'Medium'
    },
    detectedAt: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW
    },
    resolvedAt: {
      type: DataTypes.DATE,
      allowNull: true
    },
    resolution: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    notes: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    metadata: {
      type: DataTypes.JSON,
      allowNull: true,
      defaultValue: {}
    }
  }, {
    timestamps: true
  });

  Discrepancy.associate = (models) => {
    Discrepancy.belongsTo(models.Asset, {
      foreignKey: 'assetId',
      as: 'asset'
    });
    Discrepancy.belongsTo(models.Movement, {
      foreignKey: 'movementId',
      as: 'movement'
    });
    Discrepancy.belongsTo(models.User, {
      foreignKey: 'detectedBy',
      as: 'detector'
    });
    Discrepancy.belongsTo(models.User, {
      foreignKey: 'resolvedBy',
      as: 'resolver'
    });
  };

  return Discrepancy;
};