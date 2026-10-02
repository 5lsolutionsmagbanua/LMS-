// server/src/services/permission.service.js
const NodeCache = require('node-cache')
const { Query, SQLQueryBuilder } = require('../database/utilities/queries.util')
const { Master } = require('../database/models/Master')
const { ACTION_COLUMN, MODULE_LIST } = require('../database/constants/permissions')
const { logger } = require('../utilities/logger.util')

const SQL = new SQLQueryBuilder()

// Permissions change when an admin saves the bulk screen — rare. Without a
// cache every single API call costs an extra round-trip to master_permission,
// which is a real cost on list endpoints. 5 minutes is a compromise: a stale
// grant expires on its own even if an invalidation is somehow missed.
const permissionCache = new NodeCache({ stdTTL: 300, checkperiod: 60 })

const cacheKey = (roleId) => `perm:${roleId}`

/**
 * Loads the full permission map for a role, shaped as:
 *   { branches: { read: true, write: false, update: true }, ... }
 *
 * Modules with no row in the table come back as all-false rather than being
 * absent, so callers never have to guard against undefined.
 */
const getPermissionsForRole = async (roleId) => {
  console.log(
    '[read] key:',
    cacheKey(roleId),
    '| cache hit:',
    Boolean(permissionCache.get(cacheKey(roleId))),
  )
  if (!roleId) return emptyMap()

  const cached = permissionCache.get(cacheKey(roleId))
  if (cached) return cached

  const { sql, bindings } = SQL.model(Master.Permission)
    .select([
      { col: Master.Permission.cols.module, as: 'module' },
      { col: Master.Permission.cols.can_read, as: 'can_read' },
      { col: Master.Permission.cols.can_write, as: 'can_write' },
      { col: Master.Permission.cols.can_update, as: 'can_update' },
    ])
    .where(Master.Permission.cols.role_id, roleId)
    .build()

  const rows = await Query(sql, bindings)

  const map = emptyMap()
  ;(rows || []).forEach((row) => {
    map[row.module] = {
      read: toBool(row.can_read),
      write: toBool(row.can_write),
      update: toBool(row.can_update),
    }
  })

  permissionCache.set(cacheKey(roleId), map)
  return map
}

/**
 * Single yes/no check. Returns false for unknown modules/actions rather than
 * throwing — a typo in a route guard should lock the door, not open it.
 */
const roleCan = async (roleId, moduleKey, action) => {
  if (!ACTION_COLUMN[action]) return false

  const map = await getPermissionsForRole(roleId)
  return Boolean(map[moduleKey] && map[moduleKey][action])
}

/**
 * Called by the permission controller after a successful bulk save. Without
 * this, an admin's changes wouldn't take effect until the TTL expired.
 */
const invalidateRole = (roleId) => {
  console.log('[invalidate] key:', cacheKey(roleId))
  permissionCache.del(cacheKey(roleId))
  logger.info(`Permission cache cleared for role ${roleId}`)
}

const invalidateAll = () => {
  permissionCache.flushAll()
  logger.info('Permission cache cleared for all roles')
}

const emptyMap = () => {
  const map = {}
  MODULE_LIST.forEach((moduleKey) => {
    map[moduleKey] = { read: false, write: false, update: false }
  })
  return map
}

// MySQL hands tinyint(1) back as 0/1, but a driver or a JSON round-trip can
// turn it into '0'/'1'. '0' is truthy in JS, so coerce explicitly.
const toBool = (value) => value === true || value === 1 || value === '1'

module.exports = {
  getPermissionsForRole,
  roleCan,
  invalidateRole,
  invalidateAll,
}
