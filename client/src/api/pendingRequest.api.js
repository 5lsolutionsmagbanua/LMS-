// client/src/api/pendingRequest.api.js
import { apiClient } from './axios'

export const pendingRequestApi = {
  getAll: async () => {
    console.log('[API] GET /pending-request')
    const res = await apiClient.get('/pending-request')
    console.log('[API] GET /pending-request Response:', res.data)
    return res.data
  },

  getItems: async (requestId) => {
    console.log(`[API] GET /pending-request/${requestId}/items`)
    const res = await apiClient.get(`/pending-request/${requestId}/items`)
    console.log(`[API] GET /pending-request/${requestId}/items Response:`, res.data)
    return res.data
  },

  create: async (payload) => {
    console.log('[API] POST /pending-request Payload:', payload)
    const res = await apiClient.post('/pending-request', payload)
    console.log('[API] POST /pending-request Response:', res.data)
    return res.data
  },

  update: async ({ id, ...payload }) => {
    console.log(`[API] PUT /pending-request/${id} Payload:`, payload)
    const res = await apiClient.put(`/pending-request/${id}`, payload)
    console.log(`[API] PUT /pending-request/${id} Response:`, res.data)
    return res.data
  },
}
