// client/src/routes/_authenticated/manager/index.jsx
import { createFileRoute } from '@tanstack/react-router'
import { usePendingRequests } from '@/hooks/usePendingRequestWithItems'

export const Route = createFileRoute('/_authenticated/manager/')({
  component: ManagerDashboard,
})

const STATUS_STYLES = {
  pending: 'bg-amber-50 text-amber-700 border-amber-200/60',
  confirmed: 'bg-blue-50 text-blue-700 border-blue-200/60',
  ready_for_dispatch: 'bg-indigo-50 text-indigo-700 border-indigo-200/60',
  dispatched: 'bg-emerald-50 text-emerald-700 border-emerald-200/60',
  failed: 'bg-rose-50 text-rose-700 border-rose-200/60',
  cancelled: 'bg-slate-100 text-slate-600 border-slate-200',
}

function StatusBadge({ status }) {
  const style = STATUS_STYLES[status?.toLowerCase()] || STATUS_STYLES.pending
  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border ${style}`}
    >
      {status ? status.replace(/_/g, ' ') : '—'}
    </span>
  )
}

function ManagerDashboard() {
  const { user } = Route.useRouteContext()
  const { data: rawRequests, isLoading } = usePendingRequests()

  const requests = rawRequests ?? []
  const pendingCount = requests.filter((r) => r.status?.toLowerCase() === 'pending').length
  const confirmedCount = requests.filter((r) => r.status?.toLowerCase() === 'confirmed').length
  const dispatchedCount = requests.filter((r) => r.status?.toLowerCase() === 'dispatched').length
  const recentRequests = requests.slice(0, 5)

  return (
    <div className="w-full pb-12">
      <div className="bg-slate-50/50 border border-slate-200/80 rounded-2xl p-4 sm:p-6 shadow-xs space-y-6 w-full">
        {/* Header */}
        <div className="bg-white p-6 rounded-xl border border-slate-100 shadow-xs">
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            Welcome back{user?.first_name ? `, ${user.first_name}` : ''}
          </h1>
          <p className="text-sm text-slate-500 mt-0.5">
            A snapshot of your branch&apos;s stock requests and dispatch activity.
          </p>
        </div>

        {/* Stat Cards */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div className="bg-white p-5 rounded-xl border border-slate-100 shadow-xs">
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              Pending Approval
            </p>
            <p className="mt-2 text-3xl font-bold tracking-tight text-amber-600">
              {isLoading ? '—' : pendingCount}
            </p>
          </div>
          <div className="bg-white p-5 rounded-xl border border-slate-100 shadow-xs">
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              Confirmed
            </p>
            <p className="mt-2 text-3xl font-bold tracking-tight text-blue-600">
              {isLoading ? '—' : confirmedCount}
            </p>
          </div>
          <div className="bg-white p-5 rounded-xl border border-slate-100 shadow-xs">
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              Dispatched
            </p>
            <p className="mt-2 text-3xl font-bold tracking-tight text-emerald-600">
              {isLoading ? '—' : dispatchedCount}
            </p>
          </div>
        </div>

        {/* Recent requests */}
        <div className="bg-white rounded-xl border border-slate-100 shadow-xs overflow-hidden">
          <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4">
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Recent Stock Requests
            </h2>
            <a
              href="/developer/pending-requests"
              className="text-xs font-semibold text-primary hover:opacity-80"
            >
              View all
            </a>
          </div>

          {isLoading ? (
            <div className="px-6 py-12 text-center">
              <p className="text-sm text-slate-500">Loading requests…</p>
            </div>
          ) : recentRequests.length === 0 ? (
            <div className="px-6 py-12 text-center">
              <p className="text-sm font-medium text-slate-600">No stock requests yet.</p>
              <p className="text-xs text-slate-400 mt-1">
                New requests from your branch will show up here.
              </p>
            </div>
          ) : (
            <ul className="divide-y divide-slate-100">
              {recentRequests.map((req) => (
                <li
                  key={req.requestId}
                  className="flex items-center justify-between px-6 py-4"
                >
                  <div>
                    <p className="text-sm font-semibold text-slate-900">
                      {req.ticketNumber || req.requestId}
                    </p>
                    <p className="text-xs text-slate-500 mt-0.5">
                      {req.storeName || req.branchName || '—'}
                    </p>
                  </div>
                  <StatusBadge status={req.status} />
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  )
}