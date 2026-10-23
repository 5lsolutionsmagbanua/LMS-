'use strict'

/**
 * driver_performance: one row per dispatch (1:1 with dispatch_monitoring).
 * Written in the SAME transaction as every dispatch status change, so it can
 * never drift from dispatch_monitoring. Durations are stored in seconds.
 *
 * No foreign keys on purpose: this is an analytics/audit table and must keep
 * its history even if a dispatch/user row is later changed. Add FKs only if
 * your column charset/collation matches exactly (otherwise MySQL errno 150).
 */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('driver_performance', {
      dp_id: { type: Sequelize.UUID, primaryKey: true, allowNull: false },
      dp_dispatchId: { type: Sequelize.UUID, allowNull: false, unique: true },
      dp_driverId: { type: Sequelize.UUID, allowNull: false },
      dp_vehicleId: { type: Sequelize.UUID, allowNull: true },
      dp_branchId: { type: Sequelize.UUID, allowNull: true },

      // status timestamps
      dp_assignedAt: { type: Sequelize.DATE, allowNull: false },
      dp_departedAt: { type: Sequelize.DATE, allowNull: true },
      dp_arrivedAt: { type: Sequelize.DATE, allowNull: true },
      dp_completedAt: { type: Sequelize.DATE, allowNull: true },
      dp_cancelledAt: { type: Sequelize.DATE, allowNull: true },

      // derived durations (seconds)
      dp_responseSeconds: { type: Sequelize.INTEGER, allowNull: true }, // assigned -> en_route
      dp_transitSeconds: { type: Sequelize.INTEGER, allowNull: true }, // en_route -> arrived
      dp_unloadSeconds: { type: Sequelize.INTEGER, allowNull: true }, // arrived -> completed
      dp_totalSeconds: { type: Sequelize.INTEGER, allowNull: true }, // assigned -> completed

      dp_finalStatus: {
        type: Sequelize.STRING(20),
        allowNull: false,
        defaultValue: 'assigned',
      }, // assigned | en_route | arrived | completed | cancelled

      dp_createdAt: { type: Sequelize.DATE, allowNull: false },
      dp_updatedAt: { type: Sequelize.DATE, allowNull: false },
    })

    await queryInterface.addIndex('driver_performance', ['dp_driverId', 'dp_assignedAt'], {
      name: 'idx_dp_driver_assigned',
    })
    await queryInterface.addIndex('driver_performance', ['dp_finalStatus'], {
      name: 'idx_dp_final_status',
    })
    await queryInterface.addIndex('driver_performance', ['dp_branchId'], {
      name: 'idx_dp_branch',
    })
  },

  async down(queryInterface) {
    await queryInterface.dropTable('driver_performance')
  },
}
