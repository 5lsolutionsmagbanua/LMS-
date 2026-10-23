import { useCallback, useMemo } from 'react'
import { useMyPermissions } from './useMasterPermissions'
import { emptyMatrix } from '../constants/permissionCatalog'
import { normalizePermissions } from '../constants/permissionsMap'
import { useAuthContext } from './useAuth'
import { getUserRoles, isSuperUserRole } from '../utils/roleRouting'

/**
 * Yes/no checks for the signed-in user, used to hide controls they can't use.
 * This is not a security boundary: the server checks every request again.
 *
 * Super roles get every permission, matching the server bypass and the route guard.
 * Other roles read their matrix through normalizePermissions, the same helper the
 * route guard uses, so every response shape is read the same way.
 */
export const usePermissionCheck = () => {
  const { user } = useAuthContext()
  const { data, isLoading, isError } = useMyPermissions({ enabled: Boolean(user) })

  const isSuper = useMemo(() => isSuperUserRole(getUserRoles(user)), [user])

  const matrix = useMemo(() => {
    const raw = data?.permissions ?? data
    if (!raw) return emptyMatrix()
    return normalizePermissions(raw)
  }, [data])

  const can = useCallback(
    (moduleKey, action) => {
      if (isSuper) return true
      return Boolean(matrix?.[moduleKey]?.[action])
    },
    [matrix, isSuper],
  )

  const canSeeModule = useCallback(
    (moduleKey) => {
      if (isSuper) return true
      const flags = matrix?.[moduleKey]
      return Boolean(flags && (flags.read || flags.write || flags.update))
    },
    [matrix, isSuper],
  )

  return {
    can,
    canSeeModule,
    matrix,
    roleName: data?.roleName,
    isLoading,
    isError,
  }
}
