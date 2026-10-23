'use strict'

// Adds permission rows for the new vehicles / vehicle_types modules WITHOUT
// touching existing rows. Do not re-run the full permissions seeder for this:
// it deletes and recreates every row for all seeded roles, which would wipe
// any changes made through Access Control.
//
// Make sure both keys are also in server constants/permissions.js
// (MODULE_LIST + each role in DEFAULT_PERMISSIONS) and client permissionCatalog.js.

const { v4: uuidv4 } = require('uuid')
const { DEFAULT_PERMISSIONS } = require('../constants/permissions')

const NEW_MODULES = ['vehicles', 'vehicle_types']

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    const now = new Date()

    const [roles] = await queryInterface.sequelize.query(
      'SELECT mr_id, mr_role_name FROM master_role',
    )

    const [existing] = await queryInterface.sequelize.query(
      'SELECT mp_role_id, mp_module FROM master_permission WHERE mp_module IN (:mods)',
      { replacements: { mods: NEW_MODULES } },
    )
    const have = new Set(existing.map((r) => `${r.mp_role_id}:${r.mp_module}`))

    const rows = []
    roles.forEach((role) => {
      const defaults = DEFAULT_PERMISSIONS[role.mr_role_name] || {}
      NEW_MODULES.forEach((mod) => {
        if (have.has(`${role.mr_id}:${mod}`)) return
        const f = defaults[mod] || { read: false, write: false, update: false }
        rows.push({
          mp_id: uuidv4(),
          mp_role_id: role.mr_id,
          mp_module: mod,
          mp_can_read: Boolean(f.read),
          mp_can_write: Boolean(f.write),
          mp_can_update: Boolean(f.update),
          mp_createdAt: now,
          mp_updatedAt: now,
        })
      })
    })

    if (rows.length) await queryInterface.bulkInsert('master_permission', rows)
    console.log(`Added ${rows.length} permission row(s) for ${NEW_MODULES.join(', ')}.`)
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('master_permission', {
      mp_module: { [Sequelize.Op.in]: NEW_MODULES },
    })
  },
}
