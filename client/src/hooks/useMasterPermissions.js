// client/src/hooks/useMasterPermissions.js
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { permissionApi } from '../api/permission.api'

/** Every role plus its matrix. Admin-only on the server. */
export const useAllPermissions = () =>
  useQuery({
    queryKey: ['permissions'],
    queryFn: permissionApi.getAll,
  })

/** A single role's matrix. */
export const useRolePermissions = (roleId) =>
  useQuery({
    queryKey: ['permissions', roleId],
    queryFn: () => permissionApi.getByRole(roleId),
    enabled: Boolean(roleId),
  })

/**
 * The signed-in user's own matrix.
 *
 * Longer staleTime than the admin queries because this drives nav rendering on
 * every page — refetching it constantly would be wasted traffic, and a change
 * to your own permissions mid-session is rare enough that picking it up on the
 * next reload is fine.
 */
// useMasterPermissions.js
export const useMyPermissions = ({ enabled = true } = {}) =>
  useQuery({
    queryKey: ['permissions', 'me'],
    queryFn: permissionApi.getMine,
    enabled,
    retry: false,
    staleTime: 30_000,
    refetchOnWindowFocus: true,
  })

export const useBulkUpdatePermissions = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: permissionApi.bulkUpdate,
    onSuccess: (_data, variables) => {
      // Invalidate the list, the role that changed, and 'me' — an admin
      // editing their own role should see their nav update without a reload.
      queryClient.invalidateQueries({ queryKey: ['permissions'] })
      queryClient.invalidateQueries({ queryKey: ['permissions', variables.roleId] })
      queryClient.invalidateQueries({ queryKey: ['permissions', 'me'] })
    },
  })
}
