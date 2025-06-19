const { sequelize } = require('../../config/database');
const { DataTypes } = require('sequelize');

module.exports = {
  up: async () => {
    const queryInterface = sequelize.getQueryInterface();
    await queryInterface.createTable('sale_payments', {
      id: {
        type: DataTypes.UUID,
        primaryKey: true,
        defaultValue: DataTypes.UUIDV4
      },
      sale_id: {
        type: DataTypes.UUID,
        allowNull: false,
        references: { model: 'sales', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      amount: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false
      },
      payment_method: {
        type: DataTypes.ENUM('dinheiro', 'cartao_credito', 'cartao_debito', 'pix', 'transferencia', 'boleto', 'cheque', 'outro'),
        allowNull: false
      },
      payment_date: {
        type: DataTypes.DATEONLY,
        allowNull: false
      },
      notes: {
        type: DataTypes.TEXT,
        allowNull: true
      },
      created_at: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: sequelize.literal('CURRENT_TIMESTAMP')
      },
      updated_at: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: sequelize.literal('CURRENT_TIMESTAMP')
      }
    });
    await queryInterface.addIndex('sale_payments', ['sale_id']);
    await queryInterface.addIndex('sale_payments', ['payment_method']);
  },

  down: async () => {
    const queryInterface = sequelize.getQueryInterface();
    await queryInterface.dropTable('sale_payments');
  }
};
