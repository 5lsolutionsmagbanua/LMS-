// client/src/constants/permissionsMap.js
import { ROLES } from './roles'
import { getPortalForPath } from '../components/layout/portalConfig'
import { isSuperUserRole } from '../utils/roleRouting'

// Keyed by the suffix after the portal prefix, so the same module check
// applies under any portal: '/branches' covers /developer/branches,
// /admin/branches, and /manager/branches alike.
export const ROUTE_MODULE_MAP = {
  '/branches': { module: 'branches', action: 'read' },
  '/stores': { module: 'stores', action: 'read' },
  '/pending-requests': { module: 'pending_requests', action: 'read' },
  '/users': { module: 'users', action: 'read' },
  '/roles': { module: 'roles', action: 'read' },
  '/permissions': { module: 'access_control', action: 'read' },
  '/deliveryStatus': { module: 'delivery_status', action: 'read' },
  '/vehicles': { module: 'vehicles', action: 'read' },
  '/vehicle-types': { module: 'vehicle_types', action: 'read' },
  '/live-map': { module: 'live_map', action: 'read' },
}

/**
 * Normalizes raw backend permission data into a lookup dictionary:
 * { branches: { read: true, write: false, update: false, delete: false }, ... }
 *
 * Accepts every shape the API might return:
 *  - an array of rows            [{ module, read }, { mp_module, mp_can_read }, ...]
 *  - { permissions: [ ...rows ] }
 *  - an object keyed by module   { vehicles: { read: true } | { can_read: true } }
 * Exported so the Sidebar and the route guard read the matrix identically.
 */
const pick = (obj, keys) => {
  for (const k of keys) {
    if (obj?.[k] !== undefined && obj?.[k] !== null) return obj[k]
  }
  return false
}

const toFlags = (p) => ({
  read: Boolean(pick(p, ['read', 'can_read', 'is_read', 'mp_can_read'])),
  write: Boolean(pick(p, ['write', 'can_write', 'is_write', 'mp_can_write'])),
  update: Boolean(pick(p, ['update', 'can_update', 'is_update', 'mp_can_update'])),
  delete: Boolean(pick(p, ['delete', 'can_delete', 'is_delete', 'mp_can_delete'])),
})

export function normalizePermissions(rawPermissions) {
  if (!rawPermissions) return {}

  const rows = Array.isArray(rawPermissions)
    ? rawPermissions
    : Array.isArray(rawPermissions.permissions)
      ? rawPermissions.permissions
      : null

  const normalized = {}

  if (rows) {
    rows.forEach((p) => {
      const mod = p?.module || p?.module_name || p?.mp_module || p?.name
      if (mod) normalized[mod] = toFlags(p)
    })
    return normalized
  }

  Object.entries(rawPermissions).forEach(([mod, p]) => {
    if (p && typeof p === 'object') normalized[mod] = toFlags(p)
  })
  return normalized
}

/**
 * Looks up the module/action for a path suffix.
 * Handles trailing slashes, query strings, and nested routes
 * ('/vehicles/new', '/vehicles/123' -> '/vehicles').
 */
export function resolveRouteConfig(suffix) {
  const clean = String(suffix || '')
    .split(/[?#]/)[0]
    .replace(/\/+$/, '')
  if (!clean) return undefined
  if (ROUTE_MODULE_MAP[clean]) return ROUTE_MODULE_MAP[clean]
  const first = clean.split('/').filter(Boolean)[0]
  return first ? ROUTE_MODULE_MAP['/' + first] : undefined
}

/**
 * Matrix check for one nav suffix. Used by the Sidebar (non-super users).
 */
export function canAccessSuffix(rawPermissionsMatrix, suffix) {
  const cfg = resolveRouteConfig(suffix)
  if (!cfg) return false
  const matrix = normalizePermissions(rawPermissionsMatrix)
  return Boolean(matrix?.[cfg.module]?.[cfg.action])
}

/**
 * Evaluates whether a user may open a path.
 *
 * Order: super-role bypass -> known portal (else fail closed) ->
 * mapped module screen (matrix is the sole gate) -> portal-level role gate
 * for the portal root / unmapped pages.
 *
 * `userRoles` may be the full lowercase role array or a single role string.
 * Using the whole array keeps this consistent with the Sidebar, which also
 * treats a user as super if ANY of their roles is a super role.
 */
export function hasRoutePermission(userRoles, rawPermissionsMatrix, path) {
  const roles = (Array.isArray(userRoles) ? userRoles : [userRoles])
    .filter(Boolean)
    .map((r) => String(r).trim().toLowerCase())

  if (isSuperUserRole(roles) || roles.includes(ROLES.ADMIN?.toLowerCase())) return true

  const cleanPath = String(path || '')
    .split(/[?#]/)[0]
    .replace(/\/+$/, '')

  const portal = getPortalForPath(cleanPath)
  if (!portal) return false // outside any known portal: fail closed

  const suffix = cleanPath.slice(portal.path.length)
  const routeConfig = resolveRouteConfig(suffix)

  // FIX: `matrix` and `allowedLower` were used here without being defined
  // (allowedLower was declared further down, so it threw a ReferenceError).
  const matrix = normalizePermissions(rawPermissionsMatrix)
  const allowedLower = (portal.allowedRoles || []).map((r) => r.toLowerCase().trim())

  // A mapped module screen: the matrix is the sole gate. A role doesn't need
  // to be in the portal's allowedRoles to reach a screen it was granted.
  if (routeConfig) {
    return Boolean(matrix?.[routeConfig.module]?.[routeConfig.action])
  }

  // Portal root, or a page with no matrix mapping yet: portal-level gate.
  return roles.some((r) => allowedLower.includes(r))
}
