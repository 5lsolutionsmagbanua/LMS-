// client/src/routes/authenticated/developer/permissions/ModuleCard.jsx
import PermissionRow from './PermissionRow'

/**
 * One module's permissions, in a card styled to adapt dynamically to the primary theme.
 */
export default function ModuleCard({
  module,
  mode = 'editable',
  flags = {},
  allSelected = false,
  onToggle,
  onToggleAll,
}) {
  return (
    <div className="overflow-hidden rounded-xl border border-slate-200/80 bg-white shadow-sm">
      <div className="flex items-center justify-between gap-3 bg-primary px-4 py-3">
        <div className="min-w-0">
          <h3 className="truncate text-sm font-bold tracking-wide text-white">{module.label}</h3>
          {module.blurb && (
            <p className="mt-0.5 truncate text-[11px] text-white/80">{module.blurb}</p>
          )}
        </div>

        {mode === 'editable' && (
          <button
            type="button"
            onClick={() => onToggleAll?.(module.key, !allSelected)}
            className="shrink-0 rounded-md bg-white px-2.5 py-1 text-[11px] font-bold tracking-wide text-primary transition-colors hover:bg-slate-100 focus:outline-none focus:ring-2 focus:ring-white/60"
          >
            {allSelected ? 'Clear all' : 'Select all'}
          </button>
        )}
      </div>

      <div>
        {module.permissions.map((permission) => (
          <PermissionRow
            key={`${module.key}-${permission.action}`}
            moduleKey={module.key}
            action={permission.action}
            description={permission.description}
            mode={mode}
            checked={Boolean(flags[permission.action])}
            onToggle={() => onToggle?.(module.key, permission.action)}
          />
        ))}
      </div>
    </div>
  )
}
