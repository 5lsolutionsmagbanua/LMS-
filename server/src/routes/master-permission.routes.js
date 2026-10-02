// server/src/routes/master-permission.routes.js
const express = require('express')
const { auth, requireRole } = require('../middlewares/auth.middleware')
const { ROLES } = require('../database/constants/roles')
const {
  getRolePermissions,
  getAllPermissions,
  bulkUpsertPermissions,
  getMyPermissions,
} = require('../controllers/master-permission.controller')

const masterPermissionRouter = express.Router()

// Any signed-in user can read their own matrix — the client needs it to decide
// which nav items and action buttons to render. It exposes nothing about other
// roles.
masterPermissionRouter.get('/me', auth, getMyPermissions)

// Everything below edits or exposes the whole access model, so it's admin-only
// by role rather than by permission. Gating the permission editor on a
// permission would let an admin accidentally grant a role the ability to
// escalate itself.
masterPermissionRouter.get('/', auth, requireRole(ROLES.ADMIN, ROLES.DEVELOPER), getAllPermissions)
masterPermissionRouter.get('/:roleId', auth, requireRole(ROLES.ADMIN, ROLES.DEVELOPER), getRolePermissions)
masterPermissionRouter.post('/bulk', auth, requireRole(ROLES.ADMIN, ROLES.DEVELOPER), bulkUpsertPermissions)

module.exports = { masterPermissionRouter }
