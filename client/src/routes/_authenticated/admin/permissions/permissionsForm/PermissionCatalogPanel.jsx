// client/src/routes/authenticated/developer/permissions/PermissionCatalogPanel.jsx
import ModuleCard from './ModuleCard'
import { PERMISSION_MODULES } from '@/constants/permissionCatalog'

/**
 * Read-only reference of every permission the system defines.
 */
export default function PermissionCatalogPanel() {
  return (
    <div className="space-y-6">
      {/* Intro Box with subtle theme accent */}
      <div className="flex items-start gap-3 rounded-2xl border border-slate-200/80 dark:border-white/10 bg-slate-50/60 dark:bg-slate-900/40 p-4 backdrop-blur-sm shadow-2xs">
        <div
          style={{
            backgroundColor: 'color-mix(in srgb, var(--theme-primary) 12%, transparent)',
            color: 'var(--theme-primary)',
          }}
          className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-xl"
        >
          <BookOpenIcon className="h-4 w-4" />
        </div>
        <div>
          <p className="text-sm font-semibold text-slate-800 dark:text-slate-100">
            Permission Reference Catalog
          </p>
          <p className="mt-0.5 max-w-2xl text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
            Every permission in the system, grouped by the part of the app it controls. Copy a code
            to use it in a route guard. To give a role access, switch to Assign by role.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
        {PERMISSION_MODULES.map((module) => (
          <ModuleCard key={module.key} module={module} mode="catalog" />
        ))}
      </div>
    </div>
  )
}

function BookOpenIcon(props) {
  return (
    <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.6" {...props}>
      <path d="M2.5 4.5A2 2 0 014.5 2.5H10v13H4.5a2 2 0 00-2 2v-13z" strokeLinejoin="round" />
      <path d="M17.5 4.5A2 2 0 0015.5 2.5H10v13h5.5a2 2 0 012 2v-13z" strokeLinejoin="round" />
    </svg>
  )
}
