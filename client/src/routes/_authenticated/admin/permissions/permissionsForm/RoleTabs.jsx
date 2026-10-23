// client/src/routes/authenticated/developer/permissions/RoleTabs.jsx

/**
 * Role selector tabs for bulk permissions setup.
 */
export default function RoleTabs({ roles = [], activeRoleId, onChange, dirtyRoleIds = [] }) {
  if (!roles.length) {
    return (
      <div className="rounded-2xl border border-dashed border-slate-300 dark:border-white/15 bg-white/80 dark:bg-slate-900/40 px-4 py-6 text-center backdrop-blur-sm shadow-2xs">
        <p className="text-sm font-medium text-slate-600 dark:text-slate-300">No roles yet.</p>
        <p className="mt-1 text-xs text-slate-400 dark:text-slate-500">
          Add a role on the Roles screen, then come back to set its access.
        </p>
      </div>
    )
  }

  return (
    <div>
      <div className="mb-3 flex items-center gap-2">
        <UserGroupIcon className="h-4 w-4 text-[var(--theme-primary)]" />
        <h2 className="text-sm font-semibold text-[var(--theme-primary)]">Select a role</h2>
      </div>

      <div className="flex flex-wrap gap-3">
        {roles.map((role) => {
          const isActive = activeRoleId === role.roleId
          const isDirty = dirtyRoleIds.includes(role.roleId)

          return (
            <button
              key={role.roleId}
              type="button"
              onClick={() => onChange?.(role.roleId)}
              aria-pressed={isActive}
              style={
                isActive
                  ? {
                      backgroundColor: 'var(--theme-primary)',
                      color: 'var(--theme-on-primary)',
                    }
                  : undefined
              }
              className={`relative rounded-xl px-5 py-2.5 text-sm font-bold tracking-wide transition-all focus:outline-none focus:ring-2 focus:ring-[var(--theme-primary)]/40 cursor-pointer ${
                isActive
                  ? 'shadow-sm shadow-[var(--theme-primary)]/25'
                  : 'bg-white dark:bg-slate-900/60 border border-slate-200/80 dark:border-white/10 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              {role.roleName}

              {isActive && (
                <span className="absolute -right-1.5 -top-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-emerald-500 ring-2 ring-white dark:ring-slate-900">
                  <CheckIcon className="h-2.5 w-2.5 text-white" />
                </span>
              )}

              {isDirty && !isActive && (
                <span
                  title="Unsaved changes"
                  className="absolute -right-1 -top-1 h-2.5 w-2.5 rounded-full bg-amber-400 ring-2 ring-white dark:ring-slate-900"
                />
              )}
            </button>
          )
        })}
      </div>
    </div>
  )
}

function UserGroupIcon(props) {
  return (
    <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.6" {...props}>
      <circle cx="7" cy="7" r="2.5" />
      <path d="M2.5 16c.5-3 2.2-4.5 4.5-4.5s4 1.5 4.5 4.5" strokeLinecap="round" />
      <circle cx="14.5" cy="7.5" r="2" />
      <path d="M12.8 11.7c1.9.2 3.2 1.6 3.7 4.3" strokeLinecap="round" />
    </svg>
  )
}

function CheckIcon(props) {
  return (
    <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2.6" {...props}>
      <path d="M4 10l4 4l8-8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}
