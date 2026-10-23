const KEY = 'lms.liveLocation.deviceId'

// One stable id per browser, so each device's fix is stored separately on the server
export const getLiveLocationDeviceId = () => {
  try {
    let id = localStorage.getItem(KEY)
    if (!id) {
      id =
        typeof crypto !== 'undefined' && crypto.randomUUID
          ? crypto.randomUUID()
          : `${Date.now().toString(36)}${Math.random().toString(36).slice(2, 12)}`
      localStorage.setItem(KEY, id)
    }
    return id
  } catch {
    return `session${Math.random().toString(36).slice(2, 12)}`
  }
}
