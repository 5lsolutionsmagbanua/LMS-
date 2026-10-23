import { apiClient } from './axios'

export const getLiveLocations = async () => {
  const { data } = await apiClient.get('/live-location')
  return data.data
}

export const getLiveUsers = async (since = 0) => {
  const { data } = await apiClient.get('/live-location/users', {
    params: since ? { since } : {},
  })
  return data
}

export const getUserLiveLocation = async (userId) => {
  const { data } = await apiClient.get(`/live-location/user/${encodeURIComponent(userId)}`)
  return data.data
}

export const sendHeartbeat = () => apiClient.post('/live-location/heartbeat')

export const sendLiveLocation = (fix) => apiClient.post('/live-location', fix)

export const clearLiveLocation = (deviceId) =>
  apiClient.delete('/live-location', {
    params: deviceId ? { deviceId } : {},
    skipAuthRedirect: true,
  })

  
