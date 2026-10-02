import { useContext } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useNavigate } from '@tanstack/react-router'
import { apiClient } from '../api/axios'
import { AuthContext } from '../context/AuthContext'
import { permissionApi } from '../api/permission.api'
import { getLandingPortalForUser } from '../utils/roleRouting'

export const useAuthContext = () => {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuthContext must be used within an AuthProvider')
  return ctx
}

export { useAuthContext as useAuth }

/**
 * Login. Pass the optional destination as a mutation variable:
 *   login.mutate({ username, password, redirectTo })
 * With no redirectTo, the user lands on their own portal.
 */
export const useLogin = () => {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const { refetch } = useAuthContext()

  return useMutation({
    mutationFn: async ({ username, password }) => {
      const response = await apiClient.post('/auth/login', { username, password })
      return response.data
    },
    onSuccess: async (_data, vars) => {
      queryClient.clear()
      try {
        await queryClient.fetchQuery({
          queryKey: ['permissions', 'me'],
          queryFn: permissionApi.getMine,
        })
      } catch {
        /* AuthContext retries once the user is set */
      }
      const freshUser = await refetch() // fetchSession returns the user
      navigate({
        to: vars?.redirectTo || getLandingPortalForUser(freshUser),
        replace: true,
      })
    },
  })
}

/** Logout goes through AuthContext so its state and the query cache are both reset. */
export const useLogout = () => {
  const navigate = useNavigate()
  const { logout } = useAuthContext()

  return useMutation({
    mutationFn: logout, // never throws
    onSettled: () => navigate({ to: '/login', search: { notice: 'logged-out' }, replace: true }),
  })
}

export const useCurrentUser = () => {
  const { user, isLoading } = useAuthContext()
  return { data: user, isLoading }
}
