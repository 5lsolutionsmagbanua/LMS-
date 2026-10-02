'use strict'

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('master_branch', {
      mb_id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        allowNull: false,
        primaryKey: true,
      },
      mb_branch_name: {
        type: Sequelize.STRING(100),
        allowNull: false,
      },
      mb_company_name: {
        type: Sequelize.STRING(150),
        allowNull: true,
      },
      mb_address: {
        type: Sequelize.STRING(255),
        allowNull: true,
      },
      mb_email: {
        type: Sequelize.STRING(150),
        allowNull: true,
      },
      mb_contact_number: {
        type: Sequelize.STRING(50),
        allowNull: true,
      },
      mb_isActive: {
        type: Sequelize.BOOLEAN,
        defaultValue: true,
        allowNull: false,
      },
      mb_createdAt: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      },
      mb_updatedAt: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP'),
      },
    })
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('master_branch')
  },
}
