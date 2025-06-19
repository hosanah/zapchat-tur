const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const SalePayment = sequelize.define('SalePayment', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  sale_id: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'sales',
      key: 'id'
    },
    onUpdate: 'CASCADE',
    onDelete: 'CASCADE'
  },
  amount: {
    type: DataTypes.DECIMAL(10,2),
    allowNull: false,
    validate: {
      min: 0.01
    }
  },
  payment_method: {
    type: DataTypes.ENUM('dinheiro','cartao_credito','cartao_debito','pix','transferencia','boleto','cheque','outro'),
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false
  },
  payment_method: {
    type: DataTypes.ENUM('dinheiro', 'cartao_credito', 'cartao_debito', 'pix', 'transferencia', 'boleto', 'cheque', 'outro'),
    allowNull: false
  },
  payment_date: {
    type: DataTypes.DATEONLY,
    allowNull: false,
    defaultValue: DataTypes.NOW
  },
  notes: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  tableName: 'sale_payments',
  indexes: [
    { fields: ['sale_id'] },
    { fields: ['payment_method'] }
  ]
});

module.exports = SalePayment;
