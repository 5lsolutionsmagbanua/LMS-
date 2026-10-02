// server/src/routes/pending-request.routes.js
const express = require('express')
const { auth, requirePermission } = require('../middlewares/auth.middleware')
const { apiKeyAuth } = require('../middlewares/api-key.middleware')
const { ACTIONS } = require('../database/constants/permissions')
const {
  getPendingRequests,
  getPendingRequestItems,
  createPendingRequest,
  upsertPendingRequestWithItems,
  updatePendingRequest,
} = require('../controllers/PendingRequestWithItems.controller')

const pendingRequestRouter = express.Router()
const MODULE = 'pending_requests'

// Dashboard: session-authenticated, permission-gated
pendingRequestRouter.get('/', auth, requirePermission(MODULE, ACTIONS.READ), getPendingRequests)
pendingRequestRouter.get(
  '/:id/items',
  auth,
  requirePermission(MODULE, ACTIONS.READ),
  getPendingRequestItems,
)
pendingRequestRouter.post('/', auth, requirePermission(MODULE, ACTIONS.WRITE), createPendingRequest)
pendingRequestRouter.put(
  '/:id',
  auth,
  requirePermission(MODULE, ACTIONS.UPDATE),
  updatePendingRequest,
)

// External system: x-api-key authenticated, never called from the browser
pendingRequestRouter.post('/external', apiKeyAuth, upsertPendingRequestWithItems)

module.exports = { pendingRequestRouter }
