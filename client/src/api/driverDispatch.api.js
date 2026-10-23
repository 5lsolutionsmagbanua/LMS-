// client/src/api/driverDispatch.api.js
import { apiClient as api } from './axios'

export const getMyDispatches = (status = 'active') =>
  api.get('/dispatch/my', { params: { status } }).then((r) => r.data)

export const updateDispatchStatus = (id, status, remarks) =>
  api.patch(`/dispatch/${id}/status`, { status, remarks }).then((r) => r.data)

export const getMyPerformance = (params) =>
  api.get('/dispatch/performance/me', { params }).then((r) => r.data)

export const getDriverPerformance = (params) =>
  api.get('/dispatch/performance', { params }).then((r) => r.data)