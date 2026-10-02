import axios from 'axios'

export const apiClient = axios.create({
  baseURL: '/api',
  withCredentials: true,
})

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response?.status
    const url = error.config?.url ?? ''
    const isLoginRequest = url.includes('/auth/login')

    const isSessionCheck = url.includes('/auth/me') || url.includes('/master-permission/me')
    const alreadyOnLogin = window.location.pathname.startsWith('/login')

    if (status === 401 && !isLoginRequest && !isSessionCheck && !alreadyOnLogin) {
      const returnTo = encodeURIComponent(window.location.pathname + window.location.search)
      window.location.assign(`/login?notice=session-expired&redirect=${returnTo}`)
    }

    return Promise.reject(error)
  },
)
