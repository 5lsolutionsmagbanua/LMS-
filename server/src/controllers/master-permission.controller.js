// server/src/controllers/master-permission.controller.js
const { v4: uuidv4 } = require('uuid')
const { Query, Transaction, SQLQueryBuilder } = require('../database/utilities/queries.util')
const { Master } = require('../database/models/Master')
const {
  MODULE_LIST,
  ACTION_LIST,
  isValidModule,
  isValidAction,
} = require('../database/constants/permissions')
const { getPermissionsForRole, invalidateRole } = require('../services/permission.service')
const { logger } = require('../utilities/logger.util')

const SQL = new SQLQueryBuilder()

// These endpoints return per-user / per-role data at a URL that never
// changes (especially /me). Without this, the browser's own HTTP cache can
// serve a 304 + a previously cached body for someone else's session after
// switching accounts in the same tab — a caching layer entirely separate
// from (and in addition to) the server-side NodeCache and the client's
// React Query cache, both already handled elsewhere. This has to be set on
// every response, success or failure, so it's applied unconditionally up
// front rather than only on the 200 path.
const noStore = (res) => res.set('Cache-Control', 'no-store')

/**
 * @name getRolePermissions
 * @description Returns the permission matrix for one role, with every module
 *              present so the bulk screen can render a full grid without
 *              filling gaps itself.
 */
const getRolePermissions = async (req, res) => {
  // #swagger.tags = ['Permission']
  // #swagger.description = 'Get the permission matrix for a single role'
  noStore(res)

  const { roleId } = req.params

  if (!roleId) {
    return res.status(400).json({ message: 'Missing roleId' })
  }

  try {
    const roleQuery = SQL.model(Master.Role)
      .select([
        { col: Master.Role.cols.id, as: 'id' },
        { col: Master.Role.cols.role_name, as: 'roleName' },
      ])
      .where(Master.Role.pk, roleId)
      .build()

    const [role] = await Query(roleQuery.sql, roleQuery.bindings)

    if (!role) {
      return res.status(404).json({ message: 'Role not found' })
    }

    const permissions = await getPermissionsForRole(roleId)

    return res.status(200).json({
      roleId: role.id,
      roleName: role.roleName,
      permissions,
    })
  } catch (error) {
    logger.error('Error retrieving role permissions', error)
    return res.status(500).json({ message: 'Error retrieving role permissions' })
  }
}

/**
 * @name getAllPermissions
 * @description Every role with its matrix, so the bulk screen can load once
 *              and switch between role tabs without refetching.
 */
const getAllPermissions = async (req, res) => {
  // #swagger.tags = ['Permission']
  // #swagger.description = 'Get permission matrices for every role'
  noStore(res)

  try {
    const { sql, bindings } = SQL.model(Master.Role)
      .select([
        { col: Master.Role.cols.id, as: 'id' },
        { col: Master.Role.cols.role_name, as: 'roleName' },
        { col: Master.Role.cols.is_active, as: 'isActive' },
      ])
      .build()

    const roles = await Query(sql, bindings)

    const result = await Promise.all(
      (roles || []).map(async (role) => ({
        roleId: role.id,
        roleName: role.roleName,
        isActive: role.isActive,
        permissions: await getPermissionsForRole(role.id),
      })),
    )

    return res.status(200).json(result)
  } catch (error) {
    logger.error('Error retrieving permissions', error)
    return res.status(500).json({ message: 'Error retrieving permissions' })
  }
}

/**
 * @name bulkUpsertPermissions
 * @description Replaces the whole matrix for one role in a single transaction.
 *
 *              Replace rather than merge is deliberate: the bulk screen always
 *              submits the complete state of every checkbox, so a partial merge
 *              would make unticking a box a no-op — the row would still be
 *              there with the old value.
 *
 *              Expected body:
 *                {
 *                  roleId: '<uuid>',
 *                  permissions: {
 *                    branches: { read: true, write: false, update: true },
 *                    ...
 *                  }
 *                }
 */
const bulkUpsertPermissions = async (req, res) => {
  // #swagger.tags = ['Permission']
  // #swagger.description = 'Replace the full permission matrix for one role'
  /* #swagger.parameters['obj'] = {
       in: 'body',
       required: true,
       description: 'Role and its complete permission matrix',
       schema: { roleId: 'any', permissions: {} }
  } */
  noStore(res)

  const { roleId, permissions } = req.body

  if (!roleId) {
    return res.status(400).json({ message: 'roleId is required' })
  }

  if (!permissions || typeof permissions !== 'object' || Array.isArray(permissions)) {
    return res.status(400).json({ message: 'permissions must be an object keyed by module' })
  }

  try {
    // Confirm the role exists before writing anything — a bad roleId would
    // otherwise be caught only by the FK, as a 500.
    const roleQuery = SQL.model(Master.Role)
      .select([{ col: Master.Role.cols.id, as: 'id' }])
      .where(Master.Role.pk, roleId)
      .build()

    const [role] = await Query(roleQuery.sql, roleQuery.bindings) 

    if (!role) {
      return res.status(404).json({ message: 'Role not found' })
    }

    // Reject unknown module keys rather than silently dropping them. A typo
    // in the client catalog should surface loudly, not turn into missing access
    // that nobody can explain later.
    const submittedModules = Object.keys(permissions)
    const unknownModules = submittedModules.filter((key) => !isValidModule(key))

    if (unknownModules.length) {
      return res.status(400).json({
        message: `Unknown module(s): ${unknownModules.join(', ')}. Valid modules: ${MODULE_LIST.join(', ')}`,
      })
    }

    for (const moduleKey of submittedModules) {
      const flags = permissions[moduleKey]

      if (!flags || typeof flags !== 'object') {
        return res.status(400).json({ message: `permissions.${moduleKey} must be an object` })
      }

      const unknownActions = Object.keys(flags).filter((key) => !isValidAction(key))
      if (unknownActions.length) {
        return res.status(400).json({
          message: `Unknown action(s) on ${moduleKey}: ${unknownActions.join(', ')}. Valid actions: ${ACTION_LIST.join(', ')}`,
        })
      }
    }

    const queries = []

    queries.push({
      sql: 'DELETE FROM master_permission WHERE mp_role_id = ?',
      values: [roleId],
    })

    // Write a row for every known module, not just the ones submitted. A
    // module the client omitted means "no access", and storing that explicitly
    // keeps the table readable when you're debugging by hand.
    const now = new Date()
    MODULE_LIST.forEach((moduleKey) => {
      const flags = permissions[moduleKey] || {}

      queries.push({
        sql: `
          INSERT INTO master_permission
            (mp_id, mp_role_id, mp_module, mp_can_read, mp_can_write, mp_can_update,
             mp_createdAt, mp_updatedAt)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        `,
        values: [
          uuidv4(),
          roleId,
          moduleKey,
          Boolean(flags.read),
          Boolean(flags.write),
          Boolean(flags.update),
          now,
          now,
        ],
      })
    })

    await Transaction(queries)

    // The cache would otherwise keep serving the old matrix for up to its TTL,
    // which looks exactly like the save having failed.
    invalidateRole(roleId)

    const granted = MODULE_LIST.reduce((count, moduleKey) => {
      const flags = permissions[moduleKey] || {}
      return count + ACTION_LIST.filter((action) => Boolean(flags[action])).length
    }, 0)

    logger.info(`Permissions updated for role ${roleId}: ${granted} grant(s)`)

    return res.status(200).json({
      success: true,
      message: 'Permissions updated successfully',
      roleId,
      granted,
    })
  } catch (error) {
    logger.error('Error updating permissions', error)
    return res.status(500).json({ message: 'Error updating permissions' })
  }
}

/**
 * @name getMyPermissions
 * @description The signed-in user's own matrix. The client uses this to hide
 *              buttons and nav items the user can't act on.
 *
 *              Note this is convenience, not security — the same checks run in
 *              requirePermission on every write endpoint.
 *
 *              Cache-Control: no-store matters most here of all four
 *              handlers — this is the one URL that never changes no matter
 *              who's logged in, so it's the one most at risk of the browser
 *              serving a previous user's cached response after an
 *              in-tab account switch.
 */
const getMyPermissions = async (req, res) => {
  // #swagger.tags = ['Permission']
  // #swagger.description = 'Get the signed-in user permission matrix'
  noStore(res)

  try {
    const permissions = await getPermissionsForRole(req.user.roleId)

    return res.status(200).json({
      roleId: req.user.roleId,
      roleName: req.user.roleName,
      permissions,
    })
  } catch (error) {
    logger.error('Error retrieving current user permissions', error)
    return res.status(500).json({ message: 'Error retrieving your permissions' })
  }
}

module.exports = {
  getRolePermissions,
  getAllPermissions,
  bulkUpsertPermissions,
  getMyPermissions,
}
