const express = require('express')
const {
  auth,
  requirePermission,
  requireUpsertPermission,
} = require('../middlewares/auth.middleware')
const { ACTIONS } = require('../database/constants/permissions')
const {
  getMasterVehicles,
  upsertMasterVehicles,
} = require('../controllers/master-vehicles.controller')

const masterVehiclesRouter = express.Router()

masterVehiclesRouter.get('/', auth, requirePermission('vehicles', ACTIONS.READ), getMasterVehicles)
masterVehiclesRouter.post('/', auth, requireUpsertPermission('vehicles'), upsertMasterVehicles)

module.exports = {
  masterVehiclesRouter,
}
