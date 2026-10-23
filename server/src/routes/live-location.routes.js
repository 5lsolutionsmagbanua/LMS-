const { Router } = require('express')
const { auth, requirePermission } = require('../middlewares/auth.middleware')
const {
  getLiveLocations,
  heartbeat,
  listUsers,
  getUserLocation,
  updateLocation,
  clearLocation,
} = require('../controllers/live-location.controller')

const liveLocationRoutes = Router()

// Presence is open to any signed-in user, so every active account is detected
liveLocationRoutes.post('/heartbeat', auth, heartbeat)

liveLocationRoutes.get('/', auth, requirePermission('live_map', 'read'), getLiveLocations)
liveLocationRoutes.get('/users', auth, requirePermission('live_map', 'read'), listUsers)
liveLocationRoutes.get(
  '/user/:userId',
  auth,
  requirePermission('live_map', 'read'),
  getUserLocation,
)
liveLocationRoutes.post('/', auth, requirePermission('live_map', 'write'), updateLocation)
liveLocationRoutes.delete('/', auth, requirePermission('live_map', 'write'), clearLocation)

module.exports = { liveLocationRoutes }
