'use strict'

const { v4: uuidv4 } = require('uuid')
const { ROLES, ROLE_LIST } = require('../constants/roles')
const { MODULE_LIST, DEFAULT_PERMISSIONS } = require('../constants/permissions')

const DESCRIPTIONS = {
  [ROLES.ADMIN]: 'Full access to every module, including users, roles, and permissions.',
  [ROLES.MANAGER]: 'Runs branches, stores, and stock requests. No access to user administration.',
  [ROLES.DRIVER]: 'Views assigned stock requests only.',
  [ROLES.DEVELOPER]: 'Full system access for debugging, API testing, and technical maintenance.',
  [ROLES.PRESIDENT]: 'Full system access for debugging, API testing, and technical maintenance.',
}

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    const now = new Date()

    // 1. Make sure the system roles exist, and collect their IDs.
    const [existingRoles] = await queryInterface.sequelize.query(
      'SELECT mr_id, mr_role_name FROM master_role',
    )

    const roleIdByName = {}
    existingRoles.forEach((row) => {
      roleIdByName[row.mr_role_name] = row.mr_id
    })

    const rolesToInsert = []
    ROLE_LIST.forEach((roleName) => {
      if (roleIdByName[roleName]) return

      const id = uuidv4()
      roleIdByName[roleName] = id
      rolesToInsert.push({
        mr_id: id,
        mr_role_name: roleName,
        mr_description: DESCRIPTIONS[roleName],
        mr_is_active: true,
        mr_createdAt: now,
        mr_updatedAt: now,
      })
    })

    if (rolesToInsert.length) {
      await queryInterface.bulkInsert('master_role', rolesToInsert)
    }

    // Refresh roleIdByName map to guarantee new IDs are captured
    const [updatedRoles] = await queryInterface.sequelize.query(
      'SELECT mr_id, mr_role_name FROM master_role',
    )
    updatedRoles.forEach((row) => {
      roleIdByName[row.mr_role_name] = row.mr_id
    })

    // 2. Clear any existing permission rows for these roles only
    const seededRoleIds = ROLE_LIST.map((name) => roleIdByName[name]).filter(Boolean)

    if (seededRoleIds.length) {
      await queryInterface.bulkDelete('master_permission', {
        mp_role_id: { [Sequelize.Op.in]: seededRoleIds },
      })
    }

    // 3. Write the default matrix.
    const permissionRows = []

    ROLE_LIST.forEach((roleName) => {
      const roleId = roleIdByName[roleName]
      if (!roleId) return

      const roleDefaults = DEFAULT_PERMISSIONS[roleName]
      if (!roleDefaults) {
        console.warn(`Warning: No default permissions found for role: "${roleName}"`)
        return
      }

      MODULE_LIST.forEach((moduleKey) => {
        const flags = roleDefaults[moduleKey] || { read: false, write: false, update: false }

        permissionRows.push({
          mp_id: uuidv4(),
          mp_role_id: roleId,
          mp_module: moduleKey,
          mp_can_read: Boolean(flags.read),
          mp_can_write: Boolean(flags.write),
          mp_can_update: Boolean(flags.update),
          mp_createdAt: now,
          mp_updatedAt: now,
        })
      })
    })

    if (permissionRows.length) {
      await queryInterface.bulkInsert('master_permission', permissionRows)
    }

    console.log(
      `Seeded ${rolesToInsert.length} role(s) and ${permissionRows.length} permission row(s).`,
    )
  },

  async down(queryInterface, Sequelize) {
    const [roles] = await queryInterface.sequelize.query(
      'SELECT mr_id, mr_role_name FROM master_role',
    )

    const seededRoleIds = roles
      .filter((row) => ROLE_LIST.includes(row.mr_role_name))
      .map((row) => row.mr_id)

    if (seededRoleIds.length) {
      await queryInterface.bulkDelete('master_permission', {
        mp_role_id: { [Sequelize.Op.in]: seededRoleIds },
      })
    }
  },
}
