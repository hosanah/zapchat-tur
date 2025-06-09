const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Trip = sequelize.define('Trip', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  title: {
    type: DataTypes.STRING(100),
    allowNull: false,
    validate: {
      notEmpty: { msg: 'Título é obrigatório' },
      len: { args: [3, 100], msg: 'Título deve ter entre 3 e 100 caracteres' },
    },
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  maxPassengers: {
    type: DataTypes.INTEGER,
    allowNull: false,
    validate: {
      min: { args: 1, msg: 'Número máximo de passageiros deve ser maior que zero' },
    },
  },
  priceTrips: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    validate: {
      min: { 
        args: [0], 
        msg: 'Preço não pode ser negativo' 
      },
    },
  },
  type: {
    type: DataTypes.ENUM('turismo', 'transfer', 'excursao', 'fretamento', 'outros'),
    allowNull: false,
    defaultValue: 'turismo',
  },
  status: {
    type: DataTypes.ENUM('ativo', 'inativo', 'cancelado'),
    allowNull: false,
    defaultValue: 'ativo',
    validate: {
      isIn: {
        args: [['ativo', 'inativo', 'cancelado']],
        msg: 'Status deve ser: planejado, confirmado, em_andamento, concluido ou cancelado'
      }
    }
  },
  company_id: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'companies',
      key: 'id',
    },
    onUpdate: 'CASCADE',
    onDelete: 'CASCADE',
  },
}, {
  tableName: 'trips',
  indexes: [
    { fields: ['company_id'] },
    { fields: ['type'] },
    { fields: ['status'] },
  ],
});

module.exports = Trip;
