const express = require('express')
const {
  auth,
  requirePermission,
  requireUpsertPermission,
} = require('../middlewares/auth.middleware')
const { ACTIONS } = require('../database/constants/permissions')
const { getMasterBranch, upsertMasterBranch } = require('../controllers/master-branch.controller')

const masterBranchRouter = express.Router()

masterBranchRouter.get('/', auth, requirePermission('branches', ACTIONS.READ), getMasterBranch)
masterBranchRouter.post('/', auth, requireUpsertPermission('branches'), upsertMasterBranch)

module.exports = {
  masterBranchRouter,
}
