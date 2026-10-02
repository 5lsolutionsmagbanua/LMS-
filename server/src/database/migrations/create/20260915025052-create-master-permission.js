'use strict'

/**
 * master_permission — one row per (role, module) pair holding the three
 * action flags.
 *
 * The mp_ prefix matters: generate-models.util.js derives the model prefix
 * from the column names, so every column has to carry it for Master.Permission
 * to come out with the right cols map.
 *
 * The unique index on (mp_role_id, mp_module) is what makes the bulk save
 * safe to re-run — the controller deletes and reinserts per role inside a
 * transaction, and this index stops a partial failure leaving two rows for
 * the same module.
 *
 * @type {import('sequelize-cli').Migration}
 */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('master_permission', {
      mp_id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        allowNull: false,
        primaryKey: true,
      },
      mp_role_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'master_role',
          key: 'mr_id',
        },
        onUpdate: 'CASCADE',
        // Deleting a role takes its permission rows with it — leaving
        // orphans would let a recycled role_id inherit stale access.
        onDelete: 'CASCADE',
      },
      mp_module: {
        type: Sequelize.STRING(50),
        allowNull: false,
      },
      mp_can_read: {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
        allowNull: false,
      },
      mp_can_write: {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
        allowNull: false,
      },
      mp_can_update: {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
        allowNull: false,
      },
      mp_createdAt: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      },
      mp_updatedAt: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP'),
      },
    })

    await queryInterface.addIndex('master_permission', ['mp_role_id', 'mp_module'], {
      unique: true,
      name: 'ux_master_permission_role_module',
    })

    // Every permission check filters on role_id alone, so this covers the
    // hot path even when the cache misses.
    await queryInterface.addIndex('master_permission', ['mp_role_id'], {
      name: 'ix_master_permission_role',
    })
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeIndex('master_permission', 'ux_master_permission_role_module')
    await queryInterface.removeIndex('master_permission', 'ix_master_permission_role')
    await queryInterface.dropTable('master_permission')
  },
}
