const { sequelize } = require('../../config/database');
const { DataTypes } = require('sequelize');

module.exports = {
  up: async () => {
    const queryInterface = sequelize.getQueryInterface();
    await queryInterface.addColumn('sales', 'seller_id', {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'users',
        key: 'id'
      },
      onUpdate: 'CASCADE',
      onDelete: 'RESTRICT'
    });
    await queryInterface.addIndex('sales', ['seller_id']);
  },

  down: async () => {
    const queryInterface = sequelize.getQueryInterface();
    await queryInterface.removeIndex('sales', ['seller_id']);
    await queryInterface.removeColumn('sales', 'seller_id');
  }
};
