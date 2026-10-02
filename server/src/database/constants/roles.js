// server/src/database/constants/roles.js
//
// Canonical role names. These must match master_role.mr_role_name exactly —
// the seeder looks roles up by this string, and requireRole() compares
// against req.user.roleName which comes from the same column.
//
// If you rename a role in the Roles screen, update it here too, or the
// hard role gates in routes.startup.js will silently stop matching.

const ROLES = {
  ADMIN: 'Administrator',
  MANAGER: 'Manager',
  DRIVER: 'Driver',
  DEVELOPER: 'Developer',
  PRESIDENT: 'President',
}

// Ordered list used by the seeder and by anything that needs to iterate roles.
const ROLE_LIST = [ROLES.ADMIN, ROLES.MANAGER, ROLES.DRIVER, ROLES.DEVELOPER, ROLES.PRESIDENT]

module.exports = { ROLES, ROLE_LIST }
