// client/src/routes/_authenticated/admin/index.jsx
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_authenticated/admin/')({
  component: AdminDashboard,
})

const STAT_CARDS = [
  { key: 'users', label: 'Total Users', value: '—', accent: 'text-ink' },
  {
    key: 'drivers',
    label: 'Active Driver',
    value: '—',
    accent: 'text-emerald-600 dark:text-emerald-400',
  },
  {
    key: 'complete',
    label: 'Active Stores',
    value: '—',
    accent: 'text-indigo-600 dark:text-indigo-400',
  },
  {
    key: 'pending',
    label: 'Pending Requests',
    value: '—',
    accent: 'text-amber-600 dark:text-amber-400',
  },
]

function AdminDashboard() {
  const { user } = Route.useRouteContext()

  return (
    <div className="w-full pb-12">
      <div className="bg-slate-50/60 dark:bg-slate-900/40 border-2 border-primary/20 dark:border-primary/30 rounded-2xl p-4 sm:p-6 shadow-2xs space-y-6 w-full backdrop-blur-sm transition-colors">
        <div className="bg-gradient-to-r from-primary via-primary/90 to-primary/80 p-6 rounded-xl border border-white/10 shadow-md backdrop-blur-md text-on-primary">
          <h1 className="text-2xl font-bold tracking-tight h1 drop-shadow-2xs">
            Welcome back{user?.first_name ? `, ${user.first_name}` : ''}
          </h1>
          <p className="text-sm opacity-75 mt-0.5">
            Here&apos;s an overview of the system. Use the navigation to access management screens.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {STAT_CARDS.map((stat) => (
            <div
              key={stat.key}
              className="bg-white dark:bg-slate-900/60 p-5 rounded-xl border-2 border-primary/20 dark:border-primary/30 shadow-2xs transition-colors hover:border-primary/40 dark:hover:border-primary/50"
            >
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                {stat.label}
              </p>
              <p className={`mt-2 text-3xl font-bold tracking-tight ${stat.accent}`}>
                {stat.value}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
