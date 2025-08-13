'use strict';

module.exports = (sequelize, DataTypes) => {
  const Photo = sequelize.define('Photo', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    filename: {
      type: DataTypes.STRING,
      allowNull: false
    },
    filepath: {
      type: DataTypes.STRING,
      allowNull: false
    },
    filesize: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    mimetype: {
      type: DataTypes.STRING,
      allowNull: false
    },
    description: {
      type: DataTypes.TEXT,
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
    capturedAt: {
      type: DataTypes.DATE,
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

  Photo.associate = (models) => {
    Photo.belongsTo(models.Asset, {
      foreignKey: 'assetId',
      as: 'asset'
    });
    Photo.belongsTo(models.Movement, {
      foreignKey: 'movementId',
      as: 'movement'
    });
    Photo.belongsTo(models.User, {
      foreignKey: 'uploadedBy',
      as: 'uploader'
    });
  };

  return Photo;
};