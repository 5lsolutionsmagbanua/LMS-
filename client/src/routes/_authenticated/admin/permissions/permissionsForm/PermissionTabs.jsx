// client/src/routes/authenticated/developer/permissions/PermissionTabs.jsx

/**
 * Permission view switching tabs.
 */
export default function PermissionTabs({ active, onChange }) {
  const tabs = [
    { key: 'bulk', label: 'Assign by role' },
    { key: 'catalog', label: 'Reference catalog' },
  ]

  return (
    <div className="flex border-b border-slate-200 dark:border-white/10">
      {tabs.map((tab) => {
        const isActive = active === tab.key
        return (
          <button
            key={tab.key}
            type="button"
            onClick={() => onChange(tab.key)}
            className={`py-3 px-5 text-sm font-semibold border-b-2 transition-colors cursor-pointer ${
              isActive
                ? 'border-[var(--theme-primary)] text-[var(--theme-primary)]'
                : 'border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 hover:border-slate-300 dark:hover:border-white/20'
            }`}
          >
            {tab.label}
          </button>
        )
      })}
    </div>
  )
}
