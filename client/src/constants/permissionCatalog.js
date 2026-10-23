// client/src/constants/permissionCatalog.js
//
// Mirrors server/src/database/constants/permissions.js. Module keys and action
// keys travel over the wire on every bulk save, so if you add a module here it
// has to exist there too or the save is rejected with "Unknown module".

export const ACTION_META = {
  read: { label: 'READ', badge: 'bg-blue-50 text-blue-700 border-blue-200/70' },
  write: { label: 'WRITE', badge: 'bg-emerald-50 text-emerald-700 border-emerald-200/70' },
  update: { label: 'UPDATE', badge: 'bg-amber-50 text-amber-700 border-amber-200/70' },
}

export const ACTIONS = Object.keys(ACTION_META)

export const PERMISSION_MODULES = [
  {
    key: 'branches',
    label: 'Branches',
    blurb: 'Company locations and their contact details.',
    permissions: [
      { action: 'read', description: 'View branches' },
      { action: 'write', description: 'Add a branch' },
      { action: 'update', description: 'Edit branch details' },
    ],
  },
  {
    key: 'stores',
    label: 'Stores',
    blurb: 'Stock-holding locations.',
    permissions: [
      { action: 'read', description: 'View stores' },
      { action: 'write', description: 'Add a store' },
      { action: 'update', description: 'Edit store details' },
    ],
  },
  {
    key: 'users',
    label: 'Users',
    blurb: 'Accounts, branch assignments, and role assignments.',
    permissions: [
      { action: 'read', description: 'View users' },
      { action: 'write', description: 'Create a user' },
      { action: 'update', description: 'Edit a user' },
    ],
  },
  {
    key: 'roles',
    label: 'Roles',
    blurb: 'Role definitions used across the system.',
    permissions: [
      { action: 'read', description: 'View roles' },
      { action: 'write', description: 'Create a role' },
      { action: 'update', description: 'Edit a role' },
    ],
  },
  {
    key: 'pending_requests',
    label: 'Stock Requests',
    blurb: 'Requests and their line items.',
    permissions: [
      { action: 'read', description: 'View stock requests' },
      { action: 'write', description: 'Raise a stock request' },
      { action: 'update', description: 'Edit a stock request' },
    ],
  },
  {
    key: 'pending_request_approval',
    label: 'Approvals',
    blurb: 'Moving requests forward to dispatch.',
    permissions: [
      { action: 'read', description: 'View the approval queue' },
      { action: 'update', description: 'Approve and dispatch requests' },
    ],
  },
  {
    key: 'dispatch',
    label: 'Dispatch',
    blurb: 'Driver and vehicle assignment for approved requests.',
    permissions: [
      { action: 'read', description: 'View dispatch assignments' },
      { action: 'write', description: 'Assign a driver and vehicle' },
      { action: 'update', description: 'Update dispatch progress' },
    ],
  },
  {
    key: 'vehicles',
    label: 'Vehicles',
    blurb: 'Fleet vehicles and their details.',
    permissions: [
      { action: 'read', description: 'View vehicles' },
      { action: 'write', description: 'Add a vehicle' },
      { action: 'update', description: 'Edit vehicle details' },
    ],
  },
  {
    key: 'vehicle_types',
    label: 'Vehicle Types',
    blurb: 'Categories of vehicles used in the fleet.',
    permissions: [
      { action: 'read', description: 'View vehicle types' },
      { action: 'write', description: 'Add a vehicle type' },
      { action: 'update', description: 'Edit a vehicle type' },
    ],
  },
  {
    key: 'live_map',
    label: 'Live Map',
    blurb: 'See staff locations on the live map.',
    permissions: [
      { action: 'read', description: 'View the live map' },
      { action: 'write', description: 'Share own location' },
    ],
  },
  {
    key: 'access_control',
    label: 'Access Control',
    blurb: 'Role permission matrix.',
    permissions: [
      { action: 'read', description: 'View permissions' },
      { action: 'write', description: 'Create permission rows' },
      { action: 'update', description: 'Edit the permission matrix' },
    ],
  },
]

export const MODULE_KEYS = PERMISSION_MODULES.map((m) => m.key)

export const findModule = (key) => PERMISSION_MODULES.find((m) => m.key === key)

export const emptyMatrix = () =>
  PERMISSION_MODULES.reduce((acc, module) => {
    acc[module.key] = module.permissions.reduce((flags, permission) => {
      flags[permission.action] = false
      return flags
    }, {})
    return acc
  }, {})

export const countGrants = (matrix) =>
  PERMISSION_MODULES.reduce((total, module) => {
    const flags = matrix?.[module.key] ?? {}
    return total + module.permissions.filter((p) => flags[p.action]).length
  }, 0)
