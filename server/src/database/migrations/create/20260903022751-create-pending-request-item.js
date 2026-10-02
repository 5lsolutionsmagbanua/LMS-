'use strict'

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('pending_request_item', {
      pri_id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        allowNull: false,
        primaryKey: true,
      },
      pri_pendingRequestId: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'pending_request',
          key: 'pr_id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      pri_stockId: {
        type: Sequelize.UUID,
        allowNull: true,
      },
      pri_isSerialized: {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
        allowNull: false,
      },
      pri_stockQty: {
        type: Sequelize.INTEGER,
        allowNull: true,
      },
      pri_assetTag: {
        type: Sequelize.STRING(100),
        allowNull: true,
      },
      pri_serialNumber: {
        type: Sequelize.STRING(100),
        allowNull: true,
      },
      pri_createdAt: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      },
      pri_updatedAt: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP'),
      },
    })
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('pending_request_item')
  },
}
