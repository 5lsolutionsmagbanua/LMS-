// client/src/constants/permissionsMap.js
import { ROLES } from './roles'
import { getPortalForPath } from '../components/layout/portalConfig'

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
}

/**
 * Normalizes raw backend permission data into a standard lookup dictionary:
 * { branches: { read: true, write: false }, ... }
 */
function normalizePermissions(rawPermissions) {
  if (!rawPermissions) return {}

  if (!Array.isArray(rawPermissions)) {
    return rawPermissions
  }

  const normalized = {}
  rawPermissions.forEach((p) => {
    const mod = p.module || p.module_name || p.name
    if (mod) {
      normalized[mod] = {
        read: Boolean(p.read ?? p.can_read ?? p.is_read ?? false),
        write: Boolean(p.write ?? p.can_write ?? p.is_write ?? false),
        update: Boolean(p.update ?? p.can_update ?? p.is_update ?? false),
        delete: Boolean(p.delete ?? p.can_delete ?? p.is_delete ?? false),
      }
    }
  })
  return normalized
}

/**
 * Evaluates whether user permissions grant access to a specific path.
 *
 * Order: super-role bypass -> is this role even allowed on this portal
 * (allowedRoles) -> is the specific module/action granted in the matrix.
 * Unknown paths outside any portal fail closed; unknown sub-routes inside
 * a portal the role is allowed on fall back to the portal-level gate.
 */
// client/src/constants/permissionsMap.js — replace hasRoutePermission
export function hasRoutePermission(userRole, rawPermissionsMatrix, path) {
  const cleanRole = userRole ? String(userRole).trim().toLowerCase() : ''

  // client/src/constants/permissionsMap.js — inside hasRoutePermission
  const isSuperRole =
    cleanRole === 'admin' ||
    cleanRole === 'administrator' ||
    cleanRole === 'super admin' ||
    cleanRole === ROLES.ADMIN?.toLowerCase()

  if (isSuperRole) return true

  const portal = getPortalForPath(path)
  if (!portal) return false // outside any known portal: fail closed

  const suffix = path.slice(portal.path.length)
  const routeConfig = ROUTE_MODULE_MAP[suffix]

  // A mapped module screen: the matrix is the sole gate. A role doesn't
  // need to be in the portal's allowedRoles to reach a screen it's been
  // explicitly granted — that's the whole point of the shared /admin
  // screens now serving every role.
  if (routeConfig) {
    const matrix = normalizePermissions(rawPermissionsMatrix)
    return Boolean(matrix?.[routeConfig.module]?.[routeConfig.action])
  }

  // Portal root, or a page with no matrix mapping yet: fall back to the
  // portal-level role gate.
  const allowedLower = (portal.allowedRoles || []).map((r) => r.toLowerCase().trim())
  return allowedLower.includes(cleanRole)
}

