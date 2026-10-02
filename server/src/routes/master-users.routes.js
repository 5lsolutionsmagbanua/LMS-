const express = require('express')
const {
  auth,
  requirePermission,
  requireUpsertPermission,
} = require('../middlewares/auth.middleware')
const { ACTIONS } = require('../database/constants/permissions')
const { getMasterUsers, upsertMasterUsers } = require('../controllers/master-users.controller')

const masterUsersRouter = express.Router()

masterUsersRouter.get('/', auth, requirePermission('users', ACTIONS.READ), getMasterUsers)
masterUsersRouter.post('/', auth, requireUpsertPermission('users'), upsertMasterUsers)

module.exports = {
  masterUsersRouter,
}
