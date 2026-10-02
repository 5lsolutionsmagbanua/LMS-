'use strict'

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('master_users', {
      mu_id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        allowNull: false,
        primaryKey: true,
      },
      mu_branch_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'master_branch',
          key: 'mb_id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'RESTRICT',
      },
      mu_role_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'master_role',
          key: 'mr_id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'RESTRICT',
      },
      mu_first_name: {
        type: Sequelize.STRING(100),
        allowNull: false,
      },
      mu_last_name: {
        type: Sequelize.STRING(100),
        allowNull: false,
      },
      mu_email: {
        type: Sequelize.STRING(150),
        allowNull: false,
        unique: true,
      },
      mu_username: {
        type: Sequelize.STRING(100),
        allowNull: false,
        unique: true,
      },
      mu_password: {
        type: Sequelize.STRING(255),
        allowNull: false,
      },
      mu_isActive: {
        type: Sequelize.BOOLEAN,
        defaultValue: true,
        allowNull: false,
      },
      mu_createdAt: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      },
      mu_updatedAt: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP'),
      },
    })
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('master_users')
  },
}
