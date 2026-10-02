const express = require('express')
const {
  auth,
  requirePermission,
  requireUpsertPermission,
} = require('../middlewares/auth.middleware')
const { ACTIONS } = require('../database/constants/permissions')
const { getMasterStores, upsertMasterStores } = require('../controllers/master-stores.controller')

const masterStoresRouter = express.Router()

masterStoresRouter.get('/', auth, requirePermission('stores', ACTIONS.READ), getMasterStores)
masterStoresRouter.post('/', auth, requireUpsertPermission('stores'), upsertMasterStores)

module.exports = {
  masterStoresRouter,
}
