'use strict'

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('master_vehicles', {
      mv_id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        allowNull: false,
        primaryKey: true,
      },
      mv_plate_number: {
        type: Sequelize.STRING(50),
        allowNull: false,
        unique: true,
      },
      mv_vehicleTypeId: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'vehicle_types',
          key: 'vt_id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'RESTRICT',
      },
      mv_vehicleImage: {
        type: Sequelize.TEXT, // Optimized for Base64 string storage
        allowNull: true,
      },
      mv_brand: {
        type: Sequelize.STRING(50),
        allowNull: true,
      },
      mv_model: {
        type: Sequelize.STRING(50),
        allowNull: true,
      },
      mv_capacity: {
        type: Sequelize.STRING(50),
        allowNull: true,
      },
      mv_color: {
        type: Sequelize.STRING(50),
        allowNull: true,
      },
      mv_fuel_type: {
        type: Sequelize.STRING(50),
        allowNull: true,
      },
      mv_odometer: {
        type: Sequelize.INTEGER,
        allowNull: true,
        defaultValue: 0,
      },
      // --- Core Registration Info ---
      mv_file_number: {
        type: Sequelize.STRING(50),
        allowNull: true,
      },
      mv_or_number: {
        type: Sequelize.STRING(50),
        allowNull: true,
      },
      mv_cr_number: {
        type: Sequelize.STRING(50),
        allowNull: true,
      },
      mv_registration_expiry: {
        type: Sequelize.DATEONLY,
        allowNull: true,
      },
      // -----------------------------
      mv_remarks: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
      mv_status: {
        type: Sequelize.ENUM(
          'Available',
          'Assigned',
          'In Transit',
          'In Use',
          'Maintenance',
          'Out of Service',
          'Inactive',
        ),
        defaultValue: 'Available',
        allowNull: false,
      },
      mv_created_at: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.NOW,
      },
      mv_updated_at: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.NOW,
      },
    })
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('master_vehicles')
  },
}
