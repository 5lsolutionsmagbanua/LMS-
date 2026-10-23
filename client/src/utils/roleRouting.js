// client/src/utils/roleRouting.js
import { ROLES, homeForRole } from '../constants/roles'

// 🛡️ CENTRALIZED ROLE EXTRACTOR (Use this everywhere!)
export function getUserRoles(user) {
  if (!user) return []
  const rawRoles = user.roles || user.roleName || user.role
  if (!rawRoles) return []

  return (Array.isArray(rawRoles) ? rawRoles : [rawRoles])
    .map((r) => {
      if (typeof r === 'string') return r.toLowerCase().trim()
      if (typeof r === 'object' && r !== null) {
        return (r.name || r.roleName || r.slug || '').toLowerCase().trim()
        
      }
      return ''
    })
    .filter(Boolean)
}

// Exact role names only. Do NOT switch this to `.includes('admin')` /
// `.includes('super')` substring checks — that previously matched
// "supervisor" (contains "super") and silently granted it developer/admin
// access on the client, causing a redirect loop once route guards actually
// enforced permissions.


const SUPER_ROLES = new Set(['admin', 'administrator', 'super admin'])

export function isSuperUserRole(userRoleKeys) {
  return userRoleKeys.some((r) => SUPER_ROLES.has(r))
}

export function getLandingPortalForUser(user) {
  if (!user) return '/login'

  const userRoleKeys = getUserRoles(user)
  if (userRoleKeys.length === 0) return '/unauthorized'

  // Get the raw roleName string from the server response
  const rawRole = user.roleName || user.role_name || user.role || ''

  // Match case-insensitively against our known ROLES constants
  // e.g. "Administrator" → ROLES.ADMIN → '/admin'
  const matchedRole = Object.values(ROLES).find(
    (r) => r.toLowerCase() === rawRole.toLowerCase().trim(),
  )

  if (matchedRole) return homeForRole(matchedRole)

  // Super users who don't match a known role name fall back to /admin
  if (isSuperUserRole(userRoleKeys)) return '/admin'

  return '/unauthorized'
}
