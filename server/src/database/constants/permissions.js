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
  DISPATCH: 'dispatch',
  DRIVER_PERFORMANCE: 'driver_performance',
  APPROVAL: 'pending_request_approval',
  VEHICLES: 'vehicles',
  VEHICLE_TYPES: 'vehicle_types',
  ACCESS_CONTROL: 'access_control',
  LIVE_MAP: 'live_map',
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
//
// Note on dispatch: assigning a driver/vehicle is a WRITE on `dispatch`.
// Drivers do NOT get dispatch/driver_performance here — their endpoints
// (/dispatch/my, /dispatch/performance/me, PATCH /dispatch/:id/status) are
// gated by requireRole('Driver') and scoped to their own user id.
//
// Note on live_map: `write` lets a user share their own position. Viewing
// others' positions only needs `read`.
const ALL = { read: true, write: true, update: true }
const NONE = { read: false, write: false, update: false }
const READ_ONLY = { read: true, write: false, update: false }
const LIVE_SHARER = { read: true, write: true, update: false }

const DEFAULT_PERMISSIONS = {
  [ROLES.ADMIN]: {
    [MODULES.BRANCHES]: ALL,
    [MODULES.STORES]: ALL,
    [MODULES.USERS]: ALL,
    [MODULES.ROLES]: ALL,
    [MODULES.PENDING_REQUESTS]: ALL,
    [MODULES.DISPATCH]: ALL,
    [MODULES.DRIVER_PERFORMANCE]: ALL,
    [MODULES.APPROVAL]: { read: true, write: false, update: true },
    [MODULES.VEHICLES]: ALL,
    [MODULES.VEHICLE_TYPES]: ALL,
    [MODULES.ACCESS_CONTROL]: ALL,
    [MODULES.LIVE_MAP]: ALL,
  },
  [ROLES.DEVELOPER]: {
    [MODULES.BRANCHES]: ALL,
    [MODULES.STORES]: ALL,
    [MODULES.USERS]: ALL,
    [MODULES.ROLES]: ALL,
    [MODULES.PENDING_REQUESTS]: ALL,
    [MODULES.DISPATCH]: ALL,
    [MODULES.DRIVER_PERFORMANCE]: ALL,
    [MODULES.APPROVAL]: ALL,
    [MODULES.VEHICLES]: ALL,
    [MODULES.VEHICLE_TYPES]: ALL,
    [MODULES.ACCESS_CONTROL]: ALL,
    [MODULES.LIVE_MAP]: ALL,
  },
  [ROLES.MANAGER]: {
    [MODULES.BRANCHES]: { read: true, write: false, update: true },
    [MODULES.STORES]: ALL,
    [MODULES.USERS]: NONE,
    [MODULES.ROLES]: NONE,
    [MODULES.PENDING_REQUESTS]: ALL,
    [MODULES.DISPATCH]: ALL,
    [MODULES.DRIVER_PERFORMANCE]: READ_ONLY,
    [MODULES.APPROVAL]: { read: true, write: false, update: true },
    [MODULES.VEHICLES]: { read: true, write: false, update: true },
    [MODULES.VEHICLE_TYPES]: READ_ONLY,
    [MODULES.ACCESS_CONTROL]: NONE,
    [MODULES.LIVE_MAP]: LIVE_SHARER,
  },
  [ROLES.DRIVER]: {
    [MODULES.BRANCHES]: NONE,
    [MODULES.STORES]: NONE,
    [MODULES.USERS]: NONE,
    [MODULES.ROLES]: NONE,
    [MODULES.PENDING_REQUESTS]: READ_ONLY,
    [MODULES.DISPATCH]: NONE,
    [MODULES.DRIVER_PERFORMANCE]: NONE,
    [MODULES.APPROVAL]: READ_ONLY,
    [MODULES.VEHICLES]: READ_ONLY,
    [MODULES.VEHICLE_TYPES]: READ_ONLY,
    [MODULES.ACCESS_CONTROL]: NONE,
    [MODULES.LIVE_MAP]: LIVE_SHARER,
  },
  [ROLES.PRESIDENT]: {
    [MODULES.BRANCHES]: NONE,
    [MODULES.STORES]: NONE,
    [MODULES.USERS]: NONE,
    [MODULES.ROLES]: NONE,
    [MODULES.PENDING_REQUESTS]: READ_ONLY,
    [MODULES.DISPATCH]: READ_ONLY,
    [MODULES.DRIVER_PERFORMANCE]: READ_ONLY,
    [MODULES.APPROVAL]: READ_ONLY,
    [MODULES.VEHICLES]: READ_ONLY,
    [MODULES.VEHICLE_TYPES]: READ_ONLY,
    [MODULES.ACCESS_CONTROL]: NONE,
    [MODULES.LIVE_MAP]: READ_ONLY,
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
