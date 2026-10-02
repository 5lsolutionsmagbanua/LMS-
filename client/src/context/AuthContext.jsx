import { createContext, useEffect, useState, useCallback } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { apiClient } from '../api/axios'
import { useMyPermissions } from '../hooks/useMasterPermissions'

export const AuthContext = createContext(null)

const NO_PERMISSIONS = {}

export function AuthProvider({ children }) {
  const queryClient = useQueryClient()
  const [user, setUser] = useState(null)
  const [sessionLoading, setSessionLoading] = useState(true)

  const { data: permData, isLoading: permLoading } = useMyPermissions({
    enabled: Boolean(user),
  })
  const permissions = permData?.permissions ?? NO_PERMISSIONS
  const isLoading = sessionLoading || (Boolean(user) && permLoading)

  const fetchSession = useCallback(async () => {
    try {
      const { data } = await apiClient.get('/auth/me')
      setUser(data)
      return data // return the user so callers can use it immediately
    } catch {
      setUser(null)
      return null
    } finally {
      setSessionLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchSession()
  }, [fetchSession])

  const logout = useCallback(async () => {
    try {
      await apiClient.post('/auth/logout')
    } catch (err) {
      console.error('Logout request failed', err)
    } finally {
      setUser(null)
      queryClient.clear()
    }
  }, [queryClient])

  return (
    <AuthContext.Provider value={{ user, permissions, isLoading, logout, refetch: fetchSession }}>
      {children}
    </AuthContext.Provider>
  )
}
