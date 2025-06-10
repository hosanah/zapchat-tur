const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const SaleCustomer = sequelize.define('SaleCustomer', {
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
    onDelete: 'CASCADE',
    comment: 'ID da venda'
  },
  
  customer_id: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'customers',
      key: 'id'
    },
    onUpdate: 'CASCADE',
    onDelete: 'CASCADE',
    comment: 'ID do cliente'
  },
  
  is_responsible: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: false,
    comment: 'Indica se é o cliente responsável pela venda'
  },
  
  notes: {
    type: DataTypes.TEXT,
    allowNull: true,
    comment: 'Observações específicas sobre este cliente na venda'
  }
}, {
  tableName: 'sale_customers',
  indexes: [
    {
      unique: true,
      fields: ['sale_id', 'customer_id']
    },
    {
      fields: ['sale_id']
    },
    {
      fields: ['customer_id']
    },
    {
      fields: ['is_responsible']
    }
  ],
  validate: {
    // Garantir que apenas um cliente seja responsável por venda
    onlyOneResponsible() {
      if (this.is_responsible) {
        return SaleCustomer.findOne({
          where: {
            sale_id: this.sale_id,
            is_responsible: true,
            id: { [DataTypes.Op.ne]: this.id }
          }
        }).then(existingResponsible => {
          if (existingResponsible) {
            throw new Error('Já existe um cliente responsável para esta venda');
          }
        });
      }
    }
  }
});

module.exports = SaleCustomer;

