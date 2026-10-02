// server/src/startup/routes.startup.js
const { auth } = require('../middlewares/auth.middleware')
const { apiKeyAuth } = require('../middlewares/api-key.middleware')
const { healthRouter } = require('../routes/health.routes')
const { masterRoleRouter } = require('../routes/master-role.routes')
const { masterBranchRouter } = require('../routes/master-branch.routes')
const { masterUsersRouter } = require('../routes/master-users.routes')
const { masterPermissionRouter } = require('../routes/master-permission.routes')
const { masterVehiclesRouter } = require('../routes/master-vehicles.routes')
const { authRouter } = require('../routes/auth.routes')
const { pendingRequestRouter } = require('../routes/pending-request.routes')
const { requestCallbackRouter } = require('../routes/request-callback.routes')
const { pendingRequestApprovalRouter } = require('../routes/pending-request-approval.routes')
const { masterStoresRouter } = require('../routes/master-stores.routes')
const { vehicleTypesRouter } = require('../routes/vehicle-types.routes')

const initRoutes = (app) => {
  app.use('/api/health', healthRouter)
  app.use('/api/auth', authRouter)

  app.use('/api/master-role', masterRoleRouter)
  app.use('/api/master-branch', masterBranchRouter)
  app.use('/api/master-users', masterUsersRouter)
  app.use('/api/master-stores', masterStoresRouter)
  app.use('/api/master-vehicles', masterVehiclesRouter)

  app.use('/api/master-permission', masterPermissionRouter)
  app.use('/api/permissions', masterPermissionRouter)

  app.use('/api/pending-request', pendingRequestRouter)
  app.use('/api/request-callback', requestCallbackRouter)
  app.use('/api/pending-request-approval', auth, pendingRequestApprovalRouter)

  app.use('/api/vehicle-types', vehicleTypesRouter)
}

module.exports = { initRoutes }
