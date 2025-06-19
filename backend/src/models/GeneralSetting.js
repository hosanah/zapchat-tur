const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const GeneralSetting = sequelize.define('GeneralSetting', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  company_id: {
    type: DataTypes.UUID,
    allowNull: false,
    references: { model: 'companies', key: 'id' },
    onUpdate: 'CASCADE',
    onDelete: 'CASCADE'
  },
  logo: {
    type: DataTypes.BLOB('long'),
    allowNull: true
  },
  guidelines: {
    type: DataTypes.TEXT,
    allowNull: true
  }
}, {
  tableName: 'general_settings',
  indexes: [
    { unique: true, fields: ['company_id'] }
  ]
});

module.exports = GeneralSetting;
