'use strict'

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    /**
     * Dispatch monitoring: one row per approved pending request that has been
     * assigned a driver + vehicle and a target store.
     *
     * Requires: master_branch, master_users, master_stores, master_vehicles,
     * pending_request.
     */
    await queryInterface.createTable('dispatch_monitoring', {
      dm_id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        allowNull: false,
        primaryKey: true,
      },
      // Internal PK of the request (pending_request.pr_id), not pr_requestId.
      // UNIQUE: one dispatch record per request; reassignment updates this row.
      dm_pendingRequestId: {
        type: Sequelize.UUID,
        allowNull: false,
        unique: true,
        references: {
          model: 'pending_request',
          key: 'pr_id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      dm_vehicleId: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'master_vehicles',
          key: 'mv_id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'RESTRICT',
      },
      // A master_users row whose role is Driver (master_role.mr_role_name)
      dm_driverId: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'master_users',
          key: 'mu_id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'RESTRICT',
      },
      // Destination store for this dispatch
      dm_targetStoreId: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'master_stores',
          key: 'ms_id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'RESTRICT',
      },
      // Branch of the user who CREATED the dispatch (set once, kept on reassign)
      dm_branchId: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'master_branch',
          key: 'mb_id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'RESTRICT',
      },
      dm_status: {
        type: Sequelize.ENUM('assigned', 'en_route', 'arrived', 'completed', 'cancelled'),
        defaultValue: 'assigned',
        allowNull: false,
      },
      // Last user who assigned / reassigned
      dm_assignedBy: {
        type: Sequelize.UUID,
        allowNull: true,
        references: {
          model: 'master_users',
          key: 'mu_id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL',
      },
      dm_assignedAt: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      },
      dm_departedAt: {
        type: Sequelize.DATE,
        allowNull: true,
      },
      dm_arrivedAt: {
        type: Sequelize.DATE,
        allowNull: true,
      },
      dm_completedAt: {
        type: Sequelize.DATE,
        allowNull: true,
      },
      dm_cancelledAt: {
        type: Sequelize.DATE,
        allowNull: true,
      },
      dm_remarks: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
      dm_createdAt: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      },
      dm_updatedAt: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP'),
      },
    })

    // FK columns are indexed automatically; this one is for status filtering.
    await queryInterface.addIndex('dispatch_monitoring', ['dm_status'], {
      name: 'idx_dm_status',
    })

    // DB-level guard against double-booking: a vehicle or driver can only be on
    // ONE active dispatch at a time. The generated columns become NULL once the
    // dispatch is completed/cancelled, and UNIQUE ignores NULLs.
    // CHAR(36) BINARY matches what Sequelize.UUID creates on MySQL.
    await queryInterface.sequelize.query(`
      ALTER TABLE dispatch_monitoring
        ADD COLUMN dm_activeVehicleId CHAR(36) BINARY
          GENERATED ALWAYS AS (
            IF(dm_status IN ('assigned','en_route','arrived'), dm_vehicleId, NULL)
          ) VIRTUAL,
        ADD COLUMN dm_activeDriverId CHAR(36) BINARY
          GENERATED ALWAYS AS (
            IF(dm_status IN ('assigned','en_route','arrived'), dm_driverId, NULL)
          ) VIRTUAL
    `)
    await queryInterface.sequelize.query(
      'ALTER TABLE dispatch_monitoring ADD UNIQUE INDEX uq_dm_active_vehicle (dm_activeVehicleId)',
    )
    await queryInterface.sequelize.query(
      'ALTER TABLE dispatch_monitoring ADD UNIQUE INDEX uq_dm_active_driver (dm_activeDriverId)',
    )
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('dispatch_monitoring')
  },
}
