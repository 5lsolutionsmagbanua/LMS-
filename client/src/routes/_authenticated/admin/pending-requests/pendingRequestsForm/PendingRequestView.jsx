// client/src/routes/_authenticated/admin/pending-requests/pendingRequestsForm/PendingRequestView.jsx
import Button from '@/components/ui/Button'

const STATUS_STYLES = {
  pending:
    'bg-amber-50 text-amber-700 border-amber-200/60 dark:bg-amber-950/40 dark:text-amber-400 dark:border-amber-800/50',
  confirmed:
    'bg-blue-50 text-blue-700 border-blue-200/60 dark:bg-blue-950/40 dark:text-blue-400 dark:border-blue-800/50',
  ready_for_dispatch:
    'bg-indigo-50 text-indigo-700 border-indigo-200/60 dark:bg-indigo-950/40 dark:text-indigo-400 dark:border-indigo-800/50',
  dispatched:
    'bg-emerald-50 text-emerald-700 border-emerald-200/60 dark:bg-emerald-950/40 dark:text-emerald-400 dark:border-emerald-800/50',
  failed:
    'bg-rose-50 text-rose-700 border-rose-200/60 dark:bg-rose-950/40 dark:text-rose-400 dark:border-rose-800/50',
  cancelled:
    'bg-slate-100 text-slate-600 border-slate-200 dark:bg-slate-800 dark:text-slate-400 dark:border-slate-700',
}

const DISPATCH_STATUS_STYLES = {
  assigned:
    'bg-indigo-50 text-indigo-700 border-indigo-200/60 dark:bg-indigo-950/40 dark:text-indigo-400 dark:border-indigo-800/50',
  en_route:
    'bg-blue-50 text-blue-700 border-blue-200/60 dark:bg-blue-950/40 dark:text-blue-400 dark:border-blue-800/50',
  arrived:
    'bg-amber-50 text-amber-700 border-amber-200/60 dark:bg-amber-950/40 dark:text-amber-400 dark:border-amber-800/50',
  completed:
    'bg-emerald-50 text-emerald-700 border-emerald-200/60 dark:bg-emerald-950/40 dark:text-emerald-400 dark:border-emerald-800/50',
  cancelled:
    'bg-slate-100 text-slate-600 border-slate-200 dark:bg-slate-800 dark:text-slate-400 dark:border-slate-700',
}

const TIMELINE = [
  { key: 'assigned', label: 'Assigned', at: 'assignedAt' },
  { key: 'en_route', label: 'En route', at: 'departedAt' },
  { key: 'arrived', label: 'Arrived', at: 'arrivedAt' },
  { key: 'completed', label: 'Completed', at: 'completedAt' },
]

const readable = (value) => (value ? String(value).replace(/_/g, ' ') : '—')

const formatDateTime = (value) => {
  if (!value) return null
  const d = new Date(value)
  if (Number.isNaN(d.getTime())) return null
  return d.toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' })
}

const initials = (name) =>
  String(name || '?')
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0].toUpperCase())
    .join('')

function Badge({ status, styles, size = 'md' }) {
  const style = styles[status?.toLowerCase()] || styles.pending || styles.assigned
  const pad = size === 'sm' ? 'px-2.5 py-0.5' : 'px-3 py-1'
  return (
    <span
      className={`inline-flex items-center ${pad} rounded-full text-xs font-semibold border capitalize shadow-2xs ${style}`}
    >
      {readable(status)}
    </span>
  )
}

const Detail = ({ label, children, mono = false }) => (
  <div className="min-w-0">
    <span className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-0.5">
      {label}
    </span>
    <span
      className={`block font-semibold text-slate-900 dark:text-slate-100 truncate ${mono ? 'font-mono' : ''}`}
    >
      {children || '—'}
    </span>
  </div>
)

const SectionTitle = ({ children, aside }) => (
  <div className="flex items-center justify-between mb-3">
    <h3 className="text-sm font-bold text-slate-900 dark:text-white tracking-wide uppercase">
      {children}
    </h3>
    {aside}
  </div>
)

function DispatchTimeline({ dispatch }) {
  const cancelled = dispatch.status === 'cancelled'
  const currentIdx = TIMELINE.findIndex((s) => s.key === dispatch.status)

  return (
    <ol className="grid grid-cols-4 gap-2">
      {TIMELINE.map((step, i) => {
        const reached = !cancelled && i <= currentIdx
        const isCurrent = !cancelled && i === currentIdx && dispatch.status !== 'completed'
        const when = formatDateTime(dispatch[step.at])

        const circle = cancelled
          ? 'border-slate-200 dark:border-white/10 bg-white dark:bg-slate-800 text-slate-300 dark:text-slate-600'
          : isCurrent
            ? 'border-primary bg-white dark:bg-slate-900 text-primary ring-4 ring-primary/15'
            : reached
              ? 'border-emerald-500 bg-emerald-500 text-white'
              : 'border-slate-200 dark:border-white/10 bg-white dark:bg-slate-800 text-slate-300 dark:text-slate-600'

        return (
          <li key={step.key} className="relative flex flex-col items-center text-center">
            {i > 0 && (
              <span
                className={`absolute top-3 right-1/2 h-0.5 w-full ${
                  reached && !isCurrent
                    ? 'bg-emerald-400'
                    : reached
                      ? 'bg-primary/40'
                      : 'bg-slate-200 dark:bg-white/10'
                }`}
              />
            )}
            <span
              className={`relative z-10 flex h-6 w-6 items-center justify-center rounded-full border-2 text-[11px] font-bold ${circle}`}
            >
              {reached && !isCurrent ? '✓' : i + 1}
            </span>
            <span
              className={`mt-1.5 text-[11px] font-semibold ${
                reached
                  ? 'text-slate-800 dark:text-slate-200'
                  : 'text-slate-400 dark:text-slate-500'
              }`}
            >
              {step.label}
            </span>
            <span className="text-[10px] leading-tight text-slate-500 dark:text-slate-400">
              {when || '—'}
            </span>
          </li>
        )
      })}
    </ol>
  )
}

function DispatchCard({ dispatch }) {
  const cancelledAt = formatDateTime(dispatch.cancelledAt)

  return (
    <div className="rounded-2xl border-2 border-primary/20 dark:border-primary/30 bg-gradient-to-br from-primary/5 to-white dark:from-primary/10 dark:to-slate-900/40 p-5 shadow-2xs space-y-5 backdrop-blur-sm">
      <div className="flex items-center justify-between border-b border-primary/15 dark:border-primary/20 pb-3">
        <div>
          <span className="text-xs font-semibold tracking-wider text-primary uppercase">
            Dispatch Details
          </span>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Assigned {formatDateTime(dispatch.assignedAt) || '—'}
          </p>
        </div>
        <Badge status={dispatch.status} styles={DISPATCH_STATUS_STYLES} />
      </div>

      {dispatch.status === 'cancelled' && (
        <div className="rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-slate-900/50 px-3.5 py-2.5 text-xs text-slate-600 dark:text-slate-300">
          This dispatch was cancelled{cancelledAt ? ` on ${cancelledAt}` : ''}. It can be
          reassigned.
        </div>
      )}

      <DispatchTimeline dispatch={dispatch} />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 pt-1">
        {/* Driver */}
        <div className="flex items-center gap-3 rounded-xl border border-slate-200/80 dark:border-white/10 bg-white dark:bg-slate-900/60 p-3.5 shadow-2xs">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10 dark:bg-primary/20 text-sm font-bold text-primary">
            {initials(dispatch.driverName)}
          </span>
          <div className="min-w-0">
            <span className="block text-xs font-medium text-slate-500 dark:text-slate-400">
              Driver
            </span>
            <span className="block truncate font-semibold text-slate-900 dark:text-slate-100">
              {dispatch.driverName || '—'}
            </span>
          </div>
        </div>

        {/* Vehicle */}
        <div className="flex items-center gap-3 rounded-xl border border-slate-200/80 dark:border-white/10 bg-white dark:bg-slate-900/60 p-3.5 shadow-2xs">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10 dark:bg-primary/20 text-lg">
            🚚
          </span>
          <div className="min-w-0">
            <span className="block text-xs font-medium text-slate-500 dark:text-slate-400">
              Vehicle
            </span>
            <span className="block truncate font-mono font-semibold text-slate-900 dark:text-slate-100">
              {dispatch.vehiclePlateNumber || '—'}
            </span>
            {dispatch.vehicleStatus && (
              <span className="block text-[11px] text-slate-500 dark:text-slate-400">
                {dispatch.vehicleStatus}
              </span>
            )}
          </div>
        </div>

        <Detail label="Target Store">{dispatch.targetStoreName}</Detail>
        <Detail label="Dispatched by Branch">{dispatch.createdByBranchName}</Detail>
      </div>

      {dispatch.remarks && (
        <div className="bg-amber-50/60 dark:bg-amber-950/20 border border-amber-200/70 dark:border-amber-900/50 rounded-xl p-3.5">
          <span className="block text-xs font-semibold text-amber-800 dark:text-amber-400 mb-1">
            Dispatch Remarks
          </span>
          <p className="text-slate-700 dark:text-slate-300 text-xs leading-relaxed">
            {dispatch.remarks}
          </p>
        </div>
      )}
    </div>
  )
}

function AwaitingAssignment({ onAssign }) {
  return (
    <div className="rounded-2xl border border-dashed border-primary/30 dark:border-primary/40 bg-primary/5 dark:bg-primary/10 p-6 text-center shadow-2xs backdrop-blur-sm">
      <p className="text-sm font-semibold text-primary">Awaiting driver &amp; vehicle assignment</p>
      <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
        This request is approved. Assign a driver, vehicle and target store to start dispatch.
      </p>
      {onAssign && (
        <button
          type="button"
          onClick={onAssign}
          className="mt-3 inline-flex items-center rounded-lg bg-primary px-3 py-1.5 text-xs font-semibold text-on-primary shadow-2xs transition-colors hover:bg-primary-hover cursor-pointer"
        >
          Assign now
        </button>
      )}
    </div>
  )
}

export default function PendingRequestView({ request, dispatch, onAssign, onClose }) {
  if (!request) return null

  const isApproved = request.status?.toLowerCase() === 'ready_for_dispatch'
  const awaitingAssignment = isApproved && !dispatch

  return (
    <div className="space-y-6 text-sm text-slate-600 dark:text-slate-300 w-full">
      {/* Request Overview Card */}
      <div className="bg-gradient-to-br from-slate-50/80 to-white dark:from-slate-900/60 dark:to-slate-900/40 p-5 rounded-2xl border-2 border-primary/20 dark:border-primary/30 shadow-2xs space-y-4 backdrop-blur-sm">
        <div className="flex items-center justify-between border-b border-primary/15 dark:border-primary/20 pb-3">
          <div className="min-w-0">
            <span className="text-xs font-semibold tracking-wider text-slate-500 dark:text-slate-400 uppercase">
              Request Overview
            </span>
            <h4 className="font-mono font-bold text-slate-900 dark:text-white text-base truncate">
              {request.requestId}
            </h4>
          </div>
          <Badge status={request.status} styles={STATUS_STYLES} />
        </div>

        {/* Branch → Store */}
        <div className="flex items-center gap-3 rounded-xl border border-slate-200/70 dark:border-white/10 bg-white dark:bg-slate-900/60 px-4 py-3 shadow-2xs">
          <div className="min-w-0 flex-1">
            <span className="block text-xs font-medium text-slate-500 dark:text-slate-400">
              Branch
            </span>
            <span className="block truncate font-semibold text-slate-900 dark:text-slate-100">
              {request.branchName || '—'}
            </span>
          </div>
          <span className="text-primary text-lg">→</span>
          <div className="min-w-0 flex-1">
            <span className="block text-xs font-medium text-slate-500 dark:text-slate-400">
              Store
            </span>
            <span className="block truncate font-semibold text-slate-900 dark:text-slate-100">
              {request.storeName || '—'}
            </span>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 pt-1">
          <Detail label="Ticket Number">{request.ticketNumber}</Detail>
          <Detail label="Request Type">{request.requestType}</Detail>
        </div>

        {request.notes && (
          <div className="bg-amber-50/60 dark:bg-amber-950/20 border border-amber-200/70 dark:border-amber-900/50 rounded-xl p-3.5 mt-2">
            <span className="block text-xs font-semibold text-amber-800 dark:text-amber-400 mb-1">
              Notes & Instructions
            </span>
            <p className="text-slate-700 dark:text-slate-300 text-xs leading-relaxed">
              {request.notes}
            </p>
          </div>
        )}
      </div>

      {/* Dispatch Section */}
      {dispatch ? (
        <DispatchCard dispatch={dispatch} />
      ) : awaitingAssignment ? (
        <AwaitingAssignment onAssign={onAssign} />
      ) : null}

      {/* Line Items Section */}
      <div>
        <SectionTitle
          aside={
            <span className="text-xs bg-primary/10 text-primary px-2.5 py-0.5 rounded-full font-semibold border border-primary/20">
              {request.items?.length || 0} {request.items?.length === 1 ? 'item' : 'items'}
            </span>
          }
        >
          Request Line Items
        </SectionTitle>

        {!request.items || request.items.length === 0 ? (
          <div className="p-8 text-center border border-dashed border-slate-300 dark:border-white/15 rounded-2xl bg-slate-50/50 dark:bg-slate-900/40 backdrop-blur-sm">
            <p className="font-medium text-sm text-slate-600 dark:text-slate-300">
              No line items found for this request.
            </p>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              This request doesn&apos;t have any attached assets or inventory items yet.
            </p>
          </div>
        ) : (
          <div className="border-2 border-primary/20 dark:border-primary/30 rounded-2xl overflow-hidden shadow-2xs bg-white dark:bg-slate-900/60 backdrop-blur-sm">
            <div className="w-full overflow-x-auto [-webkit-overflow-scrolling:touch]">
              <table className="w-full text-left border-collapse min-w-[500px]">
                <thead className="bg-primary/10 dark:bg-primary/15 text-xs uppercase font-semibold text-slate-700 dark:text-slate-200 border-b-2 border-primary/20 dark:border-primary/30">
                  <tr>
                    <th className="py-3 px-4">Stock ID</th>
                    <th className="py-3 px-4">Qty</th>
                    <th className="py-3 px-4">Serialized</th>
                    <th className="py-3 px-4">Asset Tag</th>
                    <th className="py-3 px-4">Serial #</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-primary/10 dark:divide-white/10 text-xs">
                  {request.items.map((item, idx) => (
                    <tr key={item.id ?? idx} className="hover:bg-primary/5 transition-colors">
                      <td className="py-3.5 px-4 font-mono font-medium text-slate-700 dark:text-slate-300">
                        {item.stockId}
                      </td>
                      <td className="py-3.5 px-4 font-semibold text-slate-900 dark:text-slate-100">
                        {item.stockQty}
                      </td>
                      <td className="py-3.5 px-4">
                        <span
                          className={`px-2.5 py-1 rounded-md font-medium inline-block border ${
                            item.isSerialized
                              ? 'bg-purple-50 text-purple-700 border-purple-100 dark:bg-purple-950/40 dark:text-purple-400 dark:border-purple-800/50'
                              : 'bg-slate-100 text-slate-600 border-slate-200 dark:bg-slate-800 dark:text-slate-400 dark:border-slate-700'
                          }`}
                        >
                          {item.isSerialized ? 'Yes' : 'No'}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-slate-600 dark:text-slate-400">
                        {item.assetTag || '—'}
                      </td>
                      <td className="py-3.5 px-4 font-mono text-slate-600 dark:text-slate-400">
                        {item.serialNumber || '—'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="flex justify-end gap-3 pt-4 border-t border-primary/20 dark:border-primary/30">
        {onAssign && dispatch && (
          <Button variant="secondary" onClick={onAssign} className="px-5">
            Reassign
          </Button>
        )}
        <Button variant="outline" onClick={onClose} className="px-5">
          Close
        </Button>
      </div>
    </div>
  )
}
