// client/src/routes/authenticated/developer/permissions/ModuleCard.jsx
import PermissionRow from './PermissionRow'

/**
 * One module's permissions, in a card styled with the liquify gradient header.
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
    <div className="overflow-hidden rounded-2xl border border-slate-200/80 dark:border-white/10 bg-white dark:bg-slate-900/60 shadow-2xs backdrop-blur-sm">
      {/* Liquify Gradient Header using your theme variables & btn-liquid-flow class */}
      <div className="flex items-center justify-between gap-3 btn-liquid-flow px-4 py-3.5 border-b border-white/10 shadow-inner backdrop-blur-md">
        <div className="min-w-0">
          <h3
            style={{ color: 'var(--theme-on-primary)' }}
            className="truncate text-sm font-bold tracking-wide drop-shadow-2xs"
          >
            {module.label}
          </h3>
          {module.blurb && (
            <p
              style={{ color: 'color-mix(in srgb, var(--theme-on-primary) 80%, transparent)' }}
              className="mt-0.5 truncate text-[11px]"
            >
              {module.blurb}
            </p>
          )}
        </div>

        {mode === 'editable' && (
          <button
            type="button"
            onClick={() => onToggleAll?.(module.key, !allSelected)}
            style={{ color: 'var(--theme-primary)' }}
            className="shrink-0 rounded-lg bg-white/90 dark:bg-slate-900/90 px-2.5 py-1 text-[11px] font-bold tracking-wide transition-all hover:bg-white dark:hover:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-white/60 cursor-pointer shadow-2xs backdrop-blur-sm"
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
