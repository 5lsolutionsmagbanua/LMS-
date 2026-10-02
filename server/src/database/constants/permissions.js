// server/src/database/constants/permissions.js
//
// The permission vocabulary. MODULES map 1:1 to the route groups mounted in
// routes.startup.js; ACTIONS map to the three boolean columns on
// master_permission (mp_can_read / mp_can_write / mp_can_update).
//
// Keep this file in sync with client/src/constants/permissionCatalog.js —
// the module keys are sent over the wire, so a mismatch means the bulk
// permission screen writes rows the middleware will never read.

const { ROLES } = require('./roles')

const MODULES = {
  BRANCHES: 'branches',
  STORES: 'stores',
  USERS: 'users',
  ROLES: 'roles',
  PENDING_REQUESTS: 'pending_requests',
  APPROVAL: 'pending_request_approval',
  VEHICLES: 'vehicles',
  VEHICLE_TYPES: 'vehicle_types',
  ACCESS_CONTROL: 'access_control',
}

const MODULE_LIST = Object.values(MODULES)

const ACTIONS = { READ: 'read', WRITE: 'write', UPDATE: 'update' }
const ACTION_LIST = Object.values(ACTIONS)

const ACTION_COLUMN = {
  [ACTIONS.READ]: 'can_read',
  [ACTIONS.WRITE]: 'can_write',
  [ACTIONS.UPDATE]: 'can_update',
}

// Default matrix applied by the seeder on a fresh database. Admins get
// everything; Manager runs day-to-day operations but can't touch users or
// roles; Driver only sees the request list they act on.
//
// Note on the approval module: approving is an UPDATE on an existing
// request, never a WRITE — there's nothing to create. Driver gets read-only
// visibility so they can see what's coming without being able to approve it.
const ALL = { read: true, write: true, update: true }
const NONE = { read: false, write: false, update: false }
const READ_ONLY = { read: true, write: false, update: false }

const DEFAULT_PERMISSIONS = {
  [ROLES.ADMIN]: {
    [MODULES.BRANCHES]: ALL,
    [MODULES.STORES]: ALL,
    [MODULES.USERS]: ALL,
    [MODULES.ROLES]: ALL,
    [MODULES.PENDING_REQUESTS]: ALL,
    [MODULES.APPROVAL]: { read: true, write: false, update: true },
    [MODULES.VEHICLES]: ALL,
    [MODULES.VEHICLE_TYPES]: ALL,
    [MODULES.ACCESS_CONTROL]: ALL,
  },
  [ROLES.DEVELOPER]: {
    [MODULES.BRANCHES]: ALL,
    [MODULES.STORES]: ALL,
    [MODULES.USERS]: ALL,
    [MODULES.ROLES]: ALL,
    [MODULES.PENDING_REQUESTS]: ALL,
    [MODULES.APPROVAL]: ALL,
    [MODULES.VEHICLES]: ALL,
    [MODULES.VEHICLE_TYPES]: ALL,
    [MODULES.ACCESS_CONTROL]: ALL,
  },
  [ROLES.MANAGER]: {
    [MODULES.BRANCHES]: { read: true, write: false, update: true },
    [MODULES.STORES]: ALL,
    [MODULES.USERS]: NONE,
    [MODULES.ROLES]: NONE,
    [MODULES.PENDING_REQUESTS]: ALL,
    [MODULES.APPROVAL]: { read: true, write: false, update: true },
    [MODULES.VEHICLES]: { read: true, write: false, update: true },
    [MODULES.VEHICLE_TYPES]: READ_ONLY,
    [MODULES.ACCESS_CONTROL]: NONE,
  },
  [ROLES.DRIVER]: {
    [MODULES.BRANCHES]: NONE,
    [MODULES.STORES]: NONE,
    [MODULES.USERS]: NONE,
    [MODULES.ROLES]: NONE,
    [MODULES.PENDING_REQUESTS]: READ_ONLY,
    [MODULES.APPROVAL]: READ_ONLY,
    [MODULES.VEHICLES]: READ_ONLY,
    [MODULES.VEHICLE_TYPES]: READ_ONLY,
    [MODULES.ACCESS_CONTROL]: NONE,
  },
  [ROLES.PRESIDENT]: {
    [MODULES.BRANCHES]: NONE,
    [MODULES.STORES]: NONE,
    [MODULES.USERS]: NONE,
    [MODULES.ROLES]: NONE,
    [MODULES.PENDING_REQUESTS]: READ_ONLY,
    [MODULES.APPROVAL]: READ_ONLY,
    [MODULES.VEHICLES]: READ_ONLY,
    [MODULES.VEHICLE_TYPES]: READ_ONLY,
    [MODULES.ACCESS_CONTROL]: NONE,
  },
}

const isValidModule = (value) => MODULE_LIST.includes(value)
const isValidAction = (value) => ACTION_LIST.includes(value)

module.exports = {
  MODULES,
  MODULE_LIST,
  ACTIONS,
  ACTION_LIST,
  ACTION_COLUMN,
  DEFAULT_PERMISSIONS,
  isValidModule,
  isValidAction,
}
