const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Accessory = sequelize.define('Accessory', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  name: {
    type: DataTypes.STRING(100),
    allowNull: false,
    validate: {
      notEmpty: { msg: 'Nome é obrigatório' }
    }
  },
  value: {
    type: DataTypes.DECIMAL(10,2),
    allowNull: false,
    defaultValue: 0,
    validate: {
      min: { args: [0], msg: 'Valor deve ser positivo' }
    }
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  company_id: {
    type: DataTypes.UUID,
    allowNull: false,
    references: { model: 'companies', key: 'id' },
    onUpdate: 'CASCADE',
    onDelete: 'CASCADE'
  }
}, {
  tableName: 'accessories',
  indexes: [
    { fields: ['company_id'] },
    { fields: ['name'] }
  ]
});

module.exports = Accessory;
