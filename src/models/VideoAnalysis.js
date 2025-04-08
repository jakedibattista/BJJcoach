const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const VideoAnalysis = sequelize.define('VideoAnalysis', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  userId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'Users',
      key: 'id'
    }
  },
  videoUrl: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      isUrl: true
    }
  },
  status: {
    type: DataTypes.ENUM('pending', 'processing', 'completed', 'failed'),
    defaultValue: 'pending'
  },
  analysisResult: {
    type: DataTypes.JSONB,
    allowNull: true
  },
  errorMessage: {
    type: DataTypes.STRING,
    allowNull: true
  },
  videoType: {
    type: DataTypes.ENUM('training', 'competition'),
    allowNull: false
  },
  notes: {
    type: DataTypes.TEXT,
    allowNull: true
  }
}, {
  timestamps: true
});

module.exports = VideoAnalysis; 