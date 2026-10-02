// client/src/hooks/useBulkPermissions.js
import { useCallback, useEffect, useMemo, useState } from 'react'
import { useBulkUpdatePermissions } from './useMasterPermissions'
import { PERMISSION_MODULES, countGrants, emptyMatrix } from '../constants/permissionCatalog'

/**
 * Edit state for the bulk permission screen.
 *
 * Draft edits are kept per role. Switching tabs mid-edit and coming back keeps
 * your unsaved changes instead of silently discarding them — and `isDirty`
 * lets the screen warn you before you navigate away with work outstanding.
 *
 * @param roleId       which role is being edited
 * @param savedMatrix  the matrix as it exists on the server, from the query
 */
export const useBulkPermissions = (roleId, savedMatrix) => {
  const [draftsByRole, setDraftsByRole] = useState({})
  const updateMutation = useBulkUpdatePermissions()

  const baseline = useMemo(() => savedMatrix ?? emptyMatrix(), [savedMatrix])

  // Seed the draft the first time we see a role's saved data. The guard matters:
  // without it, every refetch would blow away edits in progress.
  useEffect(() => {
    if (!roleId || !savedMatrix) return

    setDraftsByRole((prev) => {
      if (prev[roleId]) return prev
      return { ...prev, [roleId]: cloneMatrix(savedMatrix) }
    })
  }, [roleId, savedMatrix])

  const matrix = draftsByRole[roleId] ?? baseline

  const setMatrix = useCallback(
    (updater) => {
      if (!roleId) return

      setDraftsByRole((prev) => {
        const current = prev[roleId] ?? cloneMatrix(baseline)
        const next = typeof updater === 'function' ? updater(current) : updater
        return { ...prev, [roleId]: next }
      })
    },
    [roleId, baseline],
  )

  /** Flips one checkbox. */
  const toggle = useCallback(
    (moduleKey, action) => {
      setMatrix((current) => ({
        ...current,
        [moduleKey]: {
          ...(current[moduleKey] ?? {}),
          [action]: !current[moduleKey]?.[action],
        },
      }))
    },
    [setMatrix],
  )

  /**
   * Select-all / deselect-all for one module. Only touches the actions that
   * module actually declares, so approvals never get a stray `write: true`.
   */
  const toggleModule = useCallback(
    (moduleKey, value) => {
      const module = PERMISSION_MODULES.find((m) => m.key === moduleKey)
      if (!module) return

      setMatrix((current) => {
        const flags = { ...(current[moduleKey] ?? {}) }
        module.permissions.forEach((p) => {
          flags[p.action] = value
        })
        return { ...current, [moduleKey]: flags }
      })
    },
    [setMatrix],
  )

  /** Discards edits and snaps back to what's saved on the server. */
  const reset = useCallback(() => {
    if (!roleId) return
    setDraftsByRole((prev) => ({ ...prev, [roleId]: cloneMatrix(baseline) }))
    updateMutation.reset()
  }, [roleId, baseline, updateMutation])

  /** True if every action of every module is ticked. */
  const isModuleFullySelected = useCallback(
    (moduleKey) => {
      const module = PERMISSION_MODULES.find((m) => m.key === moduleKey)
      if (!module) return false
      const flags = matrix?.[moduleKey] ?? {}
      return module.permissions.every((p) => Boolean(flags[p.action]))
    },
    [matrix],
  )

  const grantCount = useMemo(() => countGrants(matrix), [matrix])

  const isDirty = useMemo(() => !matricesEqual(matrix, baseline), [matrix, baseline])

  const save = useCallback(() => {
    if (!roleId || !savedMatrix) return
    updateMutation.mutate(
      { roleId, permissions: matrix },
      {
        onSuccess: () => {
          // Clear the draft so the refetched server state becomes the new
          // baseline — otherwise isDirty would stay true after a successful save.
          setDraftsByRole((prev) => {
            const next = { ...prev }
            delete next[roleId]
            return next
          })
        },
      },
    )
  }, [roleId, matrix, updateMutation])

  return {
    matrix,
    toggle,
    toggleModule,
    isModuleFullySelected,
    reset,
    save,
    grantCount,
    isDirty,
    isSaving: updateMutation.isPending,
    isError: updateMutation.isError,
    isSuccess: updateMutation.isSuccess,
    error: updateMutation.error,
    clearStatus: updateMutation.reset,
  }
}

const cloneMatrix = (matrix) =>
  Object.entries(matrix ?? {}).reduce((acc, [key, flags]) => {
    acc[key] = { ...flags }
    return acc
  }, {})

const matricesEqual = (a, b) =>
  PERMISSION_MODULES.every((module) =>
    module.permissions.every(
      (p) => Boolean(a?.[module.key]?.[p.action]) === Boolean(b?.[module.key]?.[p.action]),
    ),
  )
