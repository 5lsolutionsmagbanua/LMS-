// client/src/constants/roles.js

export const ROLES = {
  DEVELOPER: 'Developer',
  ADMIN: 'Administrator',
  MANAGER: 'Manager',
  DRIVER: 'Driver',
  PRESIDENT: 'President',
}

export const ROLE_NAV_ACCESS = {
  [ROLES.DEVELOPER]: [
    '/developer',
    '/developer/pending-requests',
    '/developer/branches',
    '/developer/stores',
    '/developer/users',
    '/developer/roles',
    '/developer/vehicles',
    '/developer/vehicle-types',
    '/developer/permissions',
  ],
  [ROLES.ADMIN]: [
    '/admin',
    '/admin/pending-requests',
    '/admin/branches',
    '/admin/stores',
    '/admin/users',
    '/admin/roles',
    '/admin/vehicles',
    '/admin/vehicle-types',
    '/admin/permissions',
  ],
  [ROLES.MANAGER]: [
    '/manager',
    '/manager/pending-requests',
    '/manager/branches',
    '/manager/stores',
    '/manager/vehicles',
  ],
  [ROLES.DRIVER]: ['/driver', '/driver/pending-requests', '/driver/vehicles'],
  [ROLES.PRESIDENT]: ['/president', '/president/pending-requests', '/president/vehicles'],
}

/**
 * Maps a role name to its portal home path.
 * This is the single source of truth for "where does this role land".
 */
const ROLE_HOME = {
  [ROLES.DEVELOPER]: '/developer',
  [ROLES.ADMIN]: '/admin',
  [ROLES.MANAGER]: '/manager',
  [ROLES.DRIVER]: '/driver',
  [ROLES.PRESIDENT]: '/president',
}

export const pathsForRole = (roleName) => ROLE_NAV_ACCESS[roleName] ?? []

export const homeForRole = (roleName) => ROLE_HOME[roleName] ?? '/unauthorized'

export const canAccessPath = (roleName, path) => pathsForRole(roleName).includes(path)
