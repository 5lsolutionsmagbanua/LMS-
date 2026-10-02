import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_authenticated/driver/')({
  component: DriverDashboard,
})

function DriverDashboard() {
  const { user } = Route.useRouteContext()

  return (
    <div className="w-full pb-12">
      <div className="bg-slate-50/50 border border-slate-200/80 rounded-2xl p-4 sm:p-6 shadow-xs space-y-6 w-full">
        <div className="bg-white p-6 rounded-xl border border-slate-100 shadow-xs">
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            Welcome back{user?.first_name ? `, ${user.first_name}` : ''}
          </h1>
          <p className="text-sm text-slate-500 mt-0.5">
            View your assigned routes, delivery updates, and dispatch information.
          </p>
        </div>

        <div className="bg-white p-6 rounded-xl border border-slate-100 shadow-xs">
          <p className="text-sm text-slate-500">No active runs assigned yet.</p>
        </div>
      </div>
    </div>
  )
}
