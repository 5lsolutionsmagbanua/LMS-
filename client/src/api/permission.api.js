// client/src/api/permission.api.js
import { apiClient } from './axios'

export const permissionApi = {
  /** Every role with its matrix — one call powers the whole bulk screen. */
  getAll: async () => {
    console.log('[API] GET /master-permission')
    const res = await apiClient.get('/master-permission')
    console.log('[API] GET /master-permission Response:', res.data)
    return res.data
  },

  /** One role's matrix. */
  getByRole: async (roleId) => {
    console.log(`[API] GET /master-permission/${roleId}`)
    const res = await apiClient.get(`/master-permission/${roleId}`)
    console.log(`[API] GET /master-permission/${roleId} Response:`, res.data)
    return res.data
  },

  /** The signed-in user's own matrix, used to hide nav and action buttons. */
  getMine: async () => {
    console.log('[API] GET /master-permission/me')
    const res = await apiClient.get('/master-permission/me')
    console.log('[API] GET /master-permission/me Response:', res.data)
    return res.data
  },

  /**
   * Replaces a role's entire matrix. The server always writes a row per module,
   * so send the complete state of every checkbox — omitting a module means
   * "no access", not "leave it alone".
   */
  bulkUpdate: async ({ roleId, permissions }) => {
    console.log(`[API] POST /master-permission/bulk Payload for roleId ${roleId}:`, permissions)
    const res = await apiClient.post('/master-permission/bulk', { roleId, permissions })
    console.log('[API] POST /master-permission/bulk Response:', res.data)
    return res.data
  },
}
