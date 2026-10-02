// client/src/routes/authenticated/developer/permissions/BulkPermissionsPanel.jsx
import { useEffect, useMemo, useState } from 'react'
import RoleTabs from './RoleTabs'
import ModuleCard from './ModuleCard'
import Alert from '@/components/ui/Alert'
import { useAllPermissions } from '@/hooks/useMasterPermissions'
import { useBulkPermissions } from '@/hooks/useBulkPermissions'
import { useAuthContext } from '@/hooks/useAuth'
import { PERMISSION_MODULES } from '@/constants/permissionCatalog'

export default function BulkPermissionsPanel() {
  const { data: roles, isLoading, isError, error } = useAllPermissions()
  const { user } = useAuthContext()
  const [activeRoleId, setActiveRoleId] = useState(null)

  const roleList = useMemo(() => roles ?? [], [roles])

  // Land on the signed-in user's own role once data arrives, so an admin
  // opening this screen sees "Administrator" selected and a developer sees
  // "Developer" — not whichever role happens to be first in the list.
  // Falls back to roleList[0] only if the user's own role isn't in the
  // list for some reason (e.g. it was deleted after they logged in).
  useEffect(() => {
    if (activeRoleId || !roleList.length) return

    const ownRole = user?.roleId && roleList.find((r) => r.roleId === user.roleId)
    setActiveRoleId(ownRole ? ownRole.roleId : roleList[0].roleId)
  }, [roleList, activeRoleId, user?.roleId])

  const activeRole = roleList.find((r) => r.roleId === activeRoleId)

  const {
    matrix,
    toggle,
    toggleModule,
    isModuleFullySelected,
    reset,
    save,
    grantCount,
    isDirty,
    isSaving,
    isError: saveFailed,
    isSuccess,
    error: saveError,
    clearStatus,
  } = useBulkPermissions(activeRoleId, activeRole?.permissions)

  if (isLoading) {
    return (
      <div className="space-y-5">
        <div className="h-10 w-72 animate-pulse rounded-lg bg-slate-200" />
        <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-52 animate-pulse rounded-xl bg-slate-100" />
          ))}
        </div>
      </div>
    )
  }

  if (isError) {
    return (
      <div className="rounded-xl border border-rose-200 bg-rose-50/60 px-5 py-6 text-center">
        <p className="text-sm font-semibold text-rose-700">Couldn't load permissions.</p>
        <p className="mt-1 text-xs text-rose-600">
          {error?.response?.data?.message || 'Check your connection and reload the page.'}
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <RoleTabs
        roles={roleList}
        activeRoleId={activeRoleId}
        onChange={setActiveRoleId}
        dirtyRoleIds={isDirty && activeRoleId ? [activeRoleId] : []}
      />

      {isSuccess && (
        <Alert variant="success" title="Saved" onDismiss={clearStatus}>
          {activeRole?.roleName} permissions updated.
        </Alert>
      )}

      {saveFailed && (
        <Alert variant="error" title="Save failed" onDismiss={clearStatus}>
          {saveError?.response?.data?.message || 'The permissions were not saved. Try again.'}
        </Alert>
      )}

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2 text-sm font-semibold text-primary">
          <ShieldIcon className="h-4 w-4" />
          {activeRole ? `What ${activeRole.roleName} can do` : 'Permissions'}
          {isDirty && (
            <span className="rounded-full bg-amber-50 px-2 py-0.5 text-[11px] font-semibold text-amber-700">
              Unsaved
            </span>
          )}
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={reset}
            disabled={!isDirty || isSaving}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 transition-colors hover:text-slate-800 disabled:cursor-not-allowed disabled:opacity-40"
          >
            <ResetIcon className="h-3.5 w-3.5" />
            Undo changes
          </button>

          <button
            type="button"
            onClick={save}
            disabled={!isDirty || isSaving}
            className="inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-white shadow-sm shadow-primary/25 transition-all hover:opacity-90 active:scale-[0.98] focus:outline-none focus:ring-2 focus:ring-primary/40 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <SaveIcon className="h-4 w-4" />
            {isSaving ? 'Saving…' : `Save permissions (${grantCount})`}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
        {PERMISSION_MODULES.map((module) => (
          <ModuleCard
            key={module.key}
            module={module}
            mode="editable"
            flags={matrix?.[module.key] ?? {}}
            allSelected={isModuleFullySelected(module.key)}
            onToggle={toggle}
            onToggleAll={toggleModule}
          />
        ))}
      </div>

      {grantCount === 0 && (
        <div className="rounded-xl border border-dashed border-slate-300 bg-white/80 px-4 py-6 text-center">
          <p className="text-sm font-medium text-slate-600">
            {activeRole?.roleName} has no access to anything.
          </p>
          <p className="mt-1 text-xs text-slate-400">
            Anyone signed in with this role will see an empty dashboard. Tick at least one box
            before saving.
          </p>
        </div>
      )}
    </div>
  )
}

function ShieldIcon(props) {
  return (
    <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.6" {...props}>
      <path
        d="M10 2.5l6 2.2v4.8c0 4-2.6 6.8-6 8-3.4-1.2-6-4-6-8V4.7l6-2.2z"
        strokeLinejoin="round"
      />
      <path d="M7.5 10l1.8 1.8 3.2-3.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function ResetIcon(props) {
  return (
    <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.7" {...props}>
      <path d="M4 10a6 6 0 1 1 1.8 4.3" strokeLinecap="round" />
      <path d="M4 14v-4h4" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function SaveIcon(props) {
  return (
    <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.7" {...props}>
      <path d="M4 4h9l3 3v9a1 1 0 01-1 1H4a1 1 0 01-1-1V5a1 1 0 011-1z" strokeLinejoin="round" />
      <path d="M6 4v4h6V4" strokeLinejoin="round" />
    </svg>
  )
}
