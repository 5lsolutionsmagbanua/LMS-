// server/src/routes/pending-request-approval.routes.js
const express = require('express')
const { auth, requirePermission } = require('../middlewares/auth.middleware')
const { ACTIONS } = require('../database/constants/permissions')
const {
  approvePendingRequest,
  dispatchPendingRequest,
} = require('../controllers/pendingRequestApproval.controller')

const pendingRequestApprovalRouter = express.Router()
const MODULE = 'pending_request_approval'

pendingRequestApprovalRouter.post(
  '/approve',
  auth,
  requirePermission(MODULE, ACTIONS.UPDATE),
  approvePendingRequest,
)
pendingRequestApprovalRouter.post(
  '/dispatch',
  auth,
  requirePermission(MODULE, ACTIONS.UPDATE),
  dispatchPendingRequest,
)

module.exports = { pendingRequestApprovalRouter }
