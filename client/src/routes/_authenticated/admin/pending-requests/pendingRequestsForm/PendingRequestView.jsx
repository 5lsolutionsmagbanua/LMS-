// routes/_authenticated/authenticated/developer/pending-requests/pendingRequestsForm/-PendingRequestView.jsx
import Button from '@/components/ui/Button'

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
      className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold border shadow-sm ${style}`}
    >
      {status ? status.replace(/_/g, ' ') : '—'}
    </span>
  )
}

export default function PendingRequestView({ request, onClose }) {
  if (!request) return null

  return (
    <div className="space-y-6 text-sm text-slate-600 w-full">
      {/* Request Overview Card */}
      <div className="bg-gradient-to-br from-slate-50/80 to-white p-5 rounded-2xl border border-slate-200/80 shadow-sm space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div>
            <span className="text-xs font-semibold tracking-wider text-slate-400 uppercase">
              Request Overview
            </span>
            <h4 className="font-mono font-bold text-slate-900 text-base">{request.requestId}</h4>
          </div>
          <StatusBadge status={request.status} />
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4 pt-1">
          <div>
            <span className="block text-xs font-medium text-slate-400 mb-0.5">Ticket Number</span>
            <span className="font-semibold text-slate-800">{request.ticketNumber || '—'}</span>
          </div>
          <div>
            <span className="block text-xs font-medium text-slate-400 mb-0.5">Branch</span>
            <span className="font-semibold text-slate-800">{request.branchName || '—'}</span>
          </div>
          <div>
            <span className="block text-xs font-medium text-slate-400 mb-0.5">Store</span>
            <span className="font-semibold text-slate-800">{request.storeName || '—'}</span>
          </div>
          <div>
            <span className="block text-xs font-medium text-slate-400 mb-0.5">Request Type</span>
            <span className="font-semibold text-slate-800">{request.requestType || '—'}</span>
          </div>
        </div>

        {request.notes && (
          <div className="bg-amber-50/40 border border-amber-100/80 rounded-xl p-3.5 mt-2">
            <span className="block text-xs font-semibold text-amber-800 mb-1">
              Notes & Instructions
            </span>
            <p className="text-slate-700 text-xs leading-relaxed">{request.notes}</p>
          </div>
        )}
      </div>

      {/* Line Items Section */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-bold text-slate-900 tracking-wide uppercase">
            Request Line Items
          </h3>
          <span className="text-xs bg-slate-100 text-slate-600 px-2.5 py-0.5 rounded-full font-medium">
            {request.items?.length || 0} {request.items?.length === 1 ? 'item' : 'items'}
          </span>
        </div>

        {!request.items || request.items.length === 0 ? (
          <div className="p-8 text-center border border-dashed border-slate-200 rounded-2xl bg-slate-50/50 text-slate-400">
            <p className="font-medium text-sm text-slate-500">
              No line items found for this request.
            </p>
            <p className="text-xs text-slate-400 mt-1">
              This request doesn&apos;t have any attached assets or inventory items yet.
            </p>
          </div>
        ) : (
          <div className="border border-slate-200 rounded-2xl overflow-hidden shadow-sm bg-white">
            <table className="w-full text-left border-collapse">
              <thead className="bg-slate-50 text-xs uppercase font-semibold text-slate-500 border-b border-slate-200">
                <tr>
                  <th className="py-3 px-4">Stock ID</th>
                  <th className="py-3 px-4">Qty</th>
                  <th className="py-3 px-4">Serialized</th>
                  <th className="py-3 px-4">Asset Tag</th>
                  <th className="py-3 px-4">Serial #</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs">
                {request.items.map((item, idx) => (
                  <tr key={item.id ?? idx} className="hover:bg-slate-50/60 transition-colors">
                    <td className="py-3.5 px-4 font-mono font-medium text-slate-700">
                      {item.stockId}
                    </td>
                    <td className="py-3.5 px-4 font-semibold text-slate-900">{item.stockQty}</td>
                    <td className="py-3.5 px-4">
                      <span
                        className={`px-2.5 py-1 rounded-md font-medium inline-block ${
                          item.isSerialized
                            ? 'bg-purple-50 text-purple-700 border border-purple-100'
                            : 'bg-slate-100 text-slate-600'
                        }`}
                      >
                        {item.isSerialized ? 'Yes' : 'No'}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-slate-600">{item.assetTag || '—'}</td>
                    <td className="py-3.5 px-4 font-mono text-slate-600">
                      {item.serialNumber || '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Footer Button */}
      <div className="flex justify-end pt-4 border-t border-slate-100">
        <Button variant="outline" onClick={onClose} className="px-5">
          Close
        </Button>
      </div>
    </div>
  )
}
