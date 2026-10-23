// client/src/constants/roles.js

export const ROLES = {
  DEVELOPER: 'Developer',
  ADMIN: 'Administrator',
  MANAGER: 'Manager',
  DRIVER: 'Driver',
  PRESIDENT: 'President',
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

export const homeForRole = (roleName) => ROLE_HOME[roleName] ?? '/unauthorized'

