// client/src/hooks/usePermissionCheck.js
import { useCallback, useMemo } from 'react'
import { useMyPermissions } from './useMasterPermissions'
import { emptyMatrix } from '../constants/permissionCatalog'
import { useAuthContext } from './useAuth'

/**
 * Yes/no checks for the signed-in user, for hiding controls they can't use.
 *
 * This is about not showing dead buttons. It is not a security boundary — the
 * same checks run in requirePermission on every endpoint, so a user who works
 * around the UI still gets a 403.
 *
 * While the query is loading, every check returns false. Defaulting to false
 * means a brief flash of missing buttons on first paint rather than buttons
 * that appear and then vanish, which is the more confusing of the two.
 *
 * @example
 *   const { can, isLoading } = usePermissionCheck()
 *   {can('stores', 'write') && <button>Add store</button>}
 */
export const usePermissionCheck = () => {
  const { user } = useAuthContext()
  const { data, isLoading, isError } = useMyPermissions({ enabled: Boolean(user) })

  const matrix = useMemo(() => data?.permissions ?? emptyMatrix(), [data])

  const can = useCallback((moduleKey, action) => Boolean(matrix?.[moduleKey]?.[action]), [matrix])

  const canSeeModule = useCallback(
    (moduleKey) => {
      const flags = matrix?.[moduleKey]
      return Boolean(flags && (flags.read || flags.write || flags.update))
    },
    [matrix],
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
