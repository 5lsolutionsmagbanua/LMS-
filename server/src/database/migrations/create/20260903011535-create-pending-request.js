'use strict'

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('pending_request', {
      pr_id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        allowNull: false,
        primaryKey: true,
      },
      pr_requestId: {
        type: Sequelize.UUID,
        allowNull: true,
      },
      pr_ticketNumber: {
        type: Sequelize.STRING(100),
        allowNull: true,
      },
      pr_branchId: {
        type: Sequelize.UUID,
        allowNull: true,
      },
      pr_storeId: {
        type: Sequelize.UUID,
        allowNull: true,
      },
      pr_requestType: {
        type: Sequelize.STRING(100),
        allowNull: true,
      },
      pr_status: {
        type: Sequelize.STRING(50),
        allowNull: true,
      },
      pr_createdDate: {
        type: Sequelize.DATE,
        allowNull: true,
      },
      pr_createdBy: {
        type: Sequelize.STRING(100),
        allowNull: true,
      },
      pr_notes: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
      pr_createdAt: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      },
      pr_updatedAt: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP'),
      },
    })
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('pending_request')
  },
}
