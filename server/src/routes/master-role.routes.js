const express = require('express')
const {
  auth,
  requirePermission,
  requireUpsertPermission,
} = require('../middlewares/auth.middleware')
const { ACTIONS } = require('../database/constants/permissions')
const { getMasterRole, upsertMasterRole } = require('../controllers/master-role.controller')

const masterRoleRouter = express.Router()

masterRoleRouter.get('/', auth, requirePermission('roles', ACTIONS.READ), getMasterRole)
masterRoleRouter.post('/', auth, requireUpsertPermission('roles'), upsertMasterRole)

module.exports = {
  masterRoleRouter,
}
