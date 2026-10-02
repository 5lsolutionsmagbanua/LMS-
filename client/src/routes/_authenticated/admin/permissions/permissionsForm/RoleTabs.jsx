// client/src/routes/authenticated/developer/permissions/RoleTabs.jsx

/**
 * Role selector tabs for bulk permissions setup.
 */
export default function RoleTabs({ roles = [], activeRoleId, onChange, dirtyRoleIds = [] }) {
  if (!roles.length) {
    return (
      <div className="rounded-xl border border-dashed border-slate-300 bg-white/80 px-4 py-6 text-center">
        <p className="text-sm font-medium text-slate-600">No roles yet.</p>
        <p className="mt-1 text-xs text-slate-400">
          Add a role on the Roles screen, then come back to set its access.
        </p>
      </div>
    )
  }

  return (
    <div>
      <div className="mb-3 flex items-center gap-2">
        <UserGroupIcon className="h-4 w-4 text-primary" />
        <h2 className="text-sm font-semibold text-primary">Select a role</h2>
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
              className={`relative rounded-xl px-5 py-2.5 text-sm font-bold tracking-wide transition-all focus:outline-none focus:ring-2 focus:ring-primary/40 ${
                isActive
                  ? 'bg-primary text-white shadow-sm shadow-primary/25'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200/70 hover:text-slate-900'
              }`}
            >
              {role.roleName}

              {isActive && (
                <span className="absolute -right-1.5 -top-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-emerald-500 ring-2 ring-white">
                  <CheckIcon className="h-2.5 w-2.5 text-white" />
                </span>
              )}

              {isDirty && !isActive && (
                <span
                  title="Unsaved changes"
                  className="absolute -right-1 -top-1 h-2.5 w-2.5 rounded-full bg-amber-400 ring-2 ring-white"
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
