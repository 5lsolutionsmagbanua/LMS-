const express = require('express')
const { getVehicleTypes, upsertVehicleTypes } = require('../controllers/vehicle-types.controller')
const {
  auth,
  requirePermission,
  requireUpsertPermission,
} = require('../middlewares/auth.middleware')
const { ACTIONS } = require('../database/constants/permissions')

const vehicleTypesRouter = express.Router()

// Protect the routes using auth and permissions
// vehicle-types.routes.js
vehicleTypesRouter.get('/', auth, requirePermission('vehicle_types', ACTIONS.READ), getVehicleTypes)
vehicleTypesRouter.post('/', auth, requireUpsertPermission('vehicle_types'), upsertVehicleTypes)

module.exports = {
  vehicleTypesRouter,
}
