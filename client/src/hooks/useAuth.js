// client/src/hooks/useAuth.js
import { useContext } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useNavigate, useRouter } from '@tanstack/react-router'
import { apiClient } from '../api/axios'
import { AuthContext } from '../context/AuthContext'
import { permissionApi } from '../api/permission.api'
import { getLandingPortalForUser } from '../utils/roleRouting'
import { isSafeRedirect } from '../utils/safeRedirect'

export const useAuthContext = () => {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuthContext must be used within an AuthProvider')
  return ctx
}

export { useAuthContext as useAuth }

/**
 * Login. Pass the optional destination as a mutation variable:
 *   login.mutate({ username, password, redirectTo })
 * redirectTo is validated here too, so any caller is safe.
 * With no valid redirectTo, the user lands on their own portal.
 */
export const useLogin = () => {
  const navigate = useNavigate()
  const router = useRouter()
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

      // Let beforeLoad guards see the new auth state.
      await router.invalidate()

      if (isSafeRedirect(vars?.redirectTo)) {
        // Full path with query string, so use history rather than navigate({ to }).
        router.history.replace(vars.redirectTo)
      } else {
        navigate({ to: getLandingPortalForUser(freshUser) || '/', replace: true })
      }
    },
  })
}

/** Logout goes through AuthContext so its state and the query cache are both reset. */
export const useLogout = () => {
  const navigate = useNavigate()
  const router = useRouter()
  const { logout } = useAuthContext()

  return useMutation({
    mutationFn: logout, // never throws
    onSettled: async () => {
      await router.invalidate()
      navigate({ to: '/login', replace: true })
    },
  })
}

export const useCurrentUser = () => {
  const { user, isLoading } = useAuthContext()
  return { data: user, isLoading }
}
