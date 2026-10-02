'use strict'

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('master_stores', {
      ms_id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        allowNull: false,
        primaryKey: true,
      },
      ms_store_name: {
        type: Sequelize.STRING(150),
        allowNull: false,
      },
      ms_store_code: {
        type: Sequelize.STRING(50),
        allowNull: false,
        unique: true,
      },
      ms_store_address: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
      ms_contact_person: {
        type: Sequelize.STRING(100),
        allowNull: true,
      },
      ms_contact_number: {
        type: Sequelize.STRING(30),
        allowNull: true,
      },
      ms_is_active: {
        type: Sequelize.BOOLEAN,
        defaultValue: true,
        allowNull: false,
      },
      created_at: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      },
      updated_at: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP'),
      },
    })
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('master_stores')
  },
}
