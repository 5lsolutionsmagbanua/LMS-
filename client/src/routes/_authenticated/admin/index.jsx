// client/src/routes/_authenticated/admin/index.jsx
import { createFileRoute, Link } from '@tanstack/react-router'

export const Route = createFileRoute('/_authenticated/admin/')({
  component: AdminDashboard,
})

const STAT_CARDS = [
  { key: 'users', label: 'Total Users', value: '—', accent: 'text-primary' },
  { key: 'branches', label: 'Active Branches', value: '—', accent: 'text-emerald-600' },
  { key: 'stores', label: 'Active Stores', value: '—', accent: 'text-indigo-600' },
  { key: 'pending', label: 'Pending Requests', value: '—', accent: 'text-amber-600' },
]

const QUICK_LINKS = [
  {
    key: 'users',
    title: 'User Management',
    description: 'Create accounts, assign roles and branches.',
    to: '/admin/users',
  },
  {
    key: 'roles',
    title: 'Roles & Permissions',
    description: 'Control what each role can see and do.',
    to: '/admin/permissions',
  },
  {
    key: 'branches',
    title: 'Branches',
    description: 'Manage company locations and facilities.',
    to: '/admin/branches',
  },
  {
    key: 'stores',
    title: 'Stores',
    description: 'Manage stock-holding locations.',
    to: '/admin/stores',
  },
]

function AdminDashboard() {
  const { user } = Route.useRouteContext()

  return (
    <div className="w-full pb-12">
      <div className="bg-slate-50/50 border border-slate-200/80 rounded-2xl p-4 sm:p-6 shadow-xs space-y-6 w-full">
        <div className="bg-white p-6 rounded-xl border border-slate-100 shadow-xs">
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            Welcome back{user?.first_name ? `, ${user.first_name}` : ''}
          </h1>
          <p className="text-sm text-slate-500 mt-0.5">
            Here&apos;s an overview of the system. Use the shortcuts below to jump into management
            screens.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {STAT_CARDS.map((stat) => (
            <div
              key={stat.key}
              className="bg-white p-5 rounded-xl border border-slate-100 shadow-xs"
            >
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                {stat.label}
              </p>
              <p className={`mt-2 text-3xl font-bold tracking-tight ${stat.accent}`}>
                {stat.value}
              </p>
            </div>
          ))}
        </div>

        <div className="bg-white p-6 rounded-xl border border-slate-100 shadow-xs">
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-4">
            Quick Actions
          </h2>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {QUICK_LINKS.map((link) => (
              <Link
                key={link.key}
                to={link.to}
                className="group rounded-xl border border-slate-200/80 p-4 transition-all hover:border-primary/40 hover:shadow-sm"
              >
                <h3 className="text-sm font-bold text-slate-900 group-hover:text-primary">
                  {link.title}
                </h3>
                <p className="mt-1 text-xs text-slate-500 leading-relaxed">{link.description}</p>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
