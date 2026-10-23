import { apiClient } from './axios'

const log = (...args) => import.meta.env.DEV && console.debug('[DispatchAPI]', ...args)

const idParams = (requestId) => (requestId ? { requestId } : {})

export const dispatchApi = {
  // filters: { status, driverId, branchId, storeId }
  getAll: async (filters = {}) => {
    log('getAll', filters)
    const res = await apiClient.get('/dispatch', { params: filters })
    return res.data
  },

  // requestId (optional): keeps the currently assigned driver selectable on reassign
  getDrivers: async (requestId) => {
    log('getDrivers', requestId)
    const res = await apiClient.get('/dispatch/drivers', { params: idParams(requestId) })
    return res.data
  },

  // requestId (optional): keeps the currently assigned vehicle selectable on reassign
  getVehicles: async (requestId) => {
    log('getVehicles', requestId)
    const res = await apiClient.get('/dispatch/vehicles', { params: idParams(requestId) })
    return res.data
  },

  // payload: { requestId, vehicleId, driverId, storeId?, remarks? }
  assign: async (payload) => {
    log('assign', payload)
    const res = await apiClient.post('/dispatch/assign', payload)
    return res.data
  },
}