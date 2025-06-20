const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const SaleAccessory = sequelize.define('SaleAccessory', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  sale_id: {
    type: DataTypes.UUID,
    allowNull: false,
    references: { model: 'sales', key: 'id' },
    onUpdate: 'CASCADE',
    onDelete: 'CASCADE'
  },
  accessory_id: {
    type: DataTypes.UUID,
    allowNull: false,
    references: { model: 'accessories', key: 'id' },
    onUpdate: 'CASCADE',
    onDelete: 'CASCADE'
  },
  quantity: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 1,
    validate: { min: 1 }
  }
}, {
  tableName: 'sale_accessories',
  indexes: [
    { fields: ['sale_id'] },
    { fields: ['accessory_id'] }
  ]
});

module.exports = SaleAccessory;
