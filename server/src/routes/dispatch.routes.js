// server/src/routes/dispatch.routes.js
// `auth` is applied where this router is mounted (routes.startup.js).
const express = require('express')
const { requirePermission, requireRole } = require('../middlewares/auth.middleware')
const { ACTIONS } = require('../database/constants/permissions')
const {
  assignDriverAndVehicle,
  getDispatchMonitoring,
  getDispatchDrivers,
  getDispatchVehicles,
} = require('../controllers/dispatchAssignment.controller')
const {
  getMyDispatches,
  updateDispatchStatus,
} = require('../controllers/driverDispatch.controller')
const {
  getDriverPerformance,
  getMyPerformance,
} = require('../controllers/driverPerformance.controller')

const dispatchRouter = express.Router()

// ── Admin / manager side: gated by the permission matrix ───────────────
dispatchRouter.get('/', requirePermission('dispatch', ACTIONS.READ), getDispatchMonitoring)
dispatchRouter.get('/drivers', requirePermission('dispatch', ACTIONS.READ), getDispatchDrivers)
dispatchRouter.get('/vehicles', requirePermission('dispatch', ACTIONS.READ), getDispatchVehicles)
dispatchRouter.post('/assign', requirePermission('dispatch', ACTIONS.WRITE), assignDriverAndVehicle)
dispatchRouter.get(
  '/performance',
  requirePermission('driver_performance', ACTIONS.READ),
  getDriverPerformance,
)

// ── Driver side: role gate; every query is already scoped to req.user.id ─
dispatchRouter.get('/my', requireRole('Driver'), getMyDispatches)
dispatchRouter.get('/performance/me', requireRole('Driver'), getMyPerformance)
dispatchRouter.patch('/:id/status', requireRole('Driver'), updateDispatchStatus)

module.exports = { dispatchRouter }
