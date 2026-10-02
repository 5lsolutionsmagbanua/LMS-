export default function PermissionTabs({ active, onChange }) {
  const tabs = [
    { key: 'bulk', label: 'Assign by role' },
    { key: 'catalog', label: 'Reference catalog' },
  ]

  return (
    <div className="flex border-b border-slate-200">
      {tabs.map((tab) => {
        const isActive = active === tab.key
        return (
          <button
            key={tab.key}
            type="button"
            onClick={() => onChange(tab.key)}
            className={`py-3 px-5 text-sm font-semibold border-b-2 transition-colors ${
              isActive
                ? 'border-primary text-primary'
                : 'border-transparent text-slate-500 hover:text-slate-800 hover:border-slate-300'
            }`}
          >
            {tab.label}
          </button>
        )
      })}
    </div>
  )
}
