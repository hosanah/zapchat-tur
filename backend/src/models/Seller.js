const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Seller = sequelize.define('Seller', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  firstName: {
    type: DataTypes.STRING(50),
    allowNull: false,
    validate: {
      notEmpty: { msg: 'Nome é obrigatório' },
      len: { args: [2, 50], msg: 'Nome deve ter entre 2 e 50 caracteres' }
    }
  },
  lastName: {
    type: DataTypes.STRING(50),
    allowNull: false,
    validate: {
      notEmpty: { msg: 'Sobrenome é obrigatório' },
      len: { args: [2, 50], msg: 'Sobrenome deve ter entre 2 e 50 caracteres' }
    }
  },
  company_id: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'companies',
      key: 'id'
    },
    onUpdate: 'CASCADE',
    onDelete: 'CASCADE'
  },
  created_by: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'users',
      key: 'id'
    },
    onUpdate: 'CASCADE',
    onDelete: 'SET NULL'
  }
}, {
  tableName: 'sellers',
  indexes: [
    { fields: ['company_id'] },
    { fields: ['created_by'] }
  ]
});

Seller.prototype.toJSON = function() {
  return { ...this.get() };
};

module.exports = Seller;
