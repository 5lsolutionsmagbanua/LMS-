// routes/_authenticated/driver/components/DispatchCard.jsx
import { useState } from 'react'
import { updateDispatchStatus } from '../../../../api/driverDispatch.api'
import { REQUEST_STATUSES } from '../../../../constants/pendingRequest'
import {
  NEXT_ACTION,
  CAN_REPORT_FAILED,
  DISPATCH_STATUS_LABEL,
} from '../../../../constants/dispatchStatus'
import StatusStepper from './StatusStepper'

const requestLabel = (v) => REQUEST_STATUSES.find((s) => s.value === v)?.label ?? v

const FAILED_STATUSES = ['cancelled', 'failed']

const statusLabel = (status) =>
  DISPATCH_STATUS_LABEL[status] ?? String(status ?? '').replace(/_/g, ' ')

const badgeTone = (status) => {
  if (FAILED_STATUSES.includes(status))
    return 'bg-red-50 text-red-700 ring-red-600/20 dark:bg-red-950 dark:text-red-300'
  if (status === 'completed')
    return 'bg-emerald-50 text-emerald-700 ring-emerald-600/20 dark:bg-emerald-950 dark:text-emerald-300'
  return 'bg-sky-50 text-sky-700 ring-sky-600/20 dark:bg-sky-950 dark:text-sky-300'
}

const field =
  'w-full rounded-lg border border-slate-300 bg-white p-3 text-base text-slate-900 placeholder:text-slate-400 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-primary sm:text-sm dark:border-slate-600 dark:bg-slate-900 dark:text-slate-100'

export default function DispatchCard({ dispatch, onChanged }) {
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const [notes, setNotes] = useState('')
  const [reporting, setReporting] = useState(false)
  const [showItems, setShowItems] = useState(false)

  const action = NEXT_ACTION[dispatch.status]
  // The server also enforces this: the driver can only act while the pending
  // request is in the status the step expects.
  const requestMatches = action ? dispatch.requestStatus === action.requestStatus : false
  const canFail = CAN_REPORT_FAILED.includes(dispatch.status) && requestMatches
  const isFailed = FAILED_STATUSES.includes(dispatch.status)

  const send = async (status, remarks) => {
    setBusy(true)
    setError('')
    try {
      await updateDispatchStatus(dispatch.id, status, remarks || undefined)
      setNotes('')
      setReporting(false)
      onChanged?.()
    } catch (e) {
      setError(e?.response?.data?.message || 'Could not update the delivery. Try again.')
    } finally {
      setBusy(false)
    }
  }

  return (
    <article className="overflow-hidden rounded-xl border border-slate-100 bg-white shadow-xs dark:border-slate-800 dark:bg-slate-900">
      {/* Header */}
      <header className="space-y-3 p-4 sm:p-6">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="text-xs font-medium uppercase tracking-wide text-slate-500">Ticket</p>
            <h3 className="break-words text-lg font-semibold leading-snug sm:text-base text-slate-900 dark:text-white">
              {dispatch.ticketNumber || 'No ticket number'}
            </h3>
          </div>
          <span
            className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ring-inset ${badgeTone(dispatch.status)}`}
          >
            {statusLabel(dispatch.status)}
          </span>
        </div>

        <div className="flex flex-wrap items-center gap-2 text-sm">
          <span className="rounded-md bg-slate-100 px-2.5 py-1 font-medium text-slate-700 dark:bg-slate-800 dark:text-slate-200">
            {dispatch.requestType || 'Delivery'}
          </span>
          <span className="rounded-md bg-slate-100 px-2.5 py-1 text-slate-600 dark:bg-slate-800 dark:text-slate-300">
            Request: {requestLabel(dispatch.requestStatus)}
          </span>
          <span className="rounded-md border border-slate-200 px-2.5 py-1 font-semibold tracking-wide text-slate-800 dark:border-slate-700 dark:text-slate-100">
            Plate Number: {dispatch.vehiclePlateNumber}
          </span>
        </div>
      </header>

      {/* Route */}
      <section
        aria-label="Route"
        className="border-t border-slate-100 px-4 py-4 sm:px-6 dark:border-slate-800"
      >
        <ol className="relative space-y-4">
          <span
            aria-hidden="true"
            className="absolute bottom-3 left-[5px] top-3 w-px bg-slate-300 dark:bg-slate-600"
          />
          <li className="relative flex gap-3">
            <span
              aria-hidden="true"
              className="relative z-10 mt-1.5 h-[11px] w-[11px] shrink-0 rounded-full border-2 border-slate-400 bg-white dark:border-slate-500 dark:bg-slate-900"
            />
            <div className="min-w-0">
              <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
                Pick up from
              </p>
              <p className="break-words text-base font-medium text-slate-900 sm:text-sm dark:text-slate-100">
                {dispatch.originBranchName}
              </p>
            </div>
          </li>
          <li className="relative flex gap-3">
            <span
              aria-hidden="true"
              className="relative z-10 mt-1.5 h-[11px] w-[11px] shrink-0 rounded-full bg-primary"
            />
            <div className="min-w-0">
              <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
                Deliver to
              </p>
              <p className="break-words text-base font-medium text-slate-900 sm:text-sm dark:text-slate-100">
                {dispatch.targetStoreName}
              </p>
            </div>
          </li>
        </ol>
      </section>

      {/* Progress */}
      <section
        aria-label="Progress"
        className="border-t border-slate-100 px-4 py-4 sm:px-6 dark:border-slate-800"
      >
        <StatusStepper dispatch={dispatch} />
        {isFailed && (
          <p className="mt-3 text-sm font-medium text-red-600 dark:text-red-400">
            {statusLabel(dispatch.status)}
          </p>
        )}
      </section>

      {/* Items + remarks */}
      {(dispatch.items?.length > 0 || dispatch.remarks) && (
        <section className="space-y-3 border-t border-slate-100 px-4 py-4 sm:px-6 dark:border-slate-800">
          {dispatch.items?.length > 0 && (
            <div>
              <button
                type="button"
                onClick={() => setShowItems((v) => !v)}
                aria-expanded={showItems}
                className="flex min-h-11 w-full items-center justify-between rounded-lg bg-slate-50 px-3 text-sm font-medium text-slate-700 hover:bg-slate-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-primary dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
              >
                <span>
                  {showItems ? 'Hide items' : 'Show items'} ({dispatch.items.length})
                </span>
                <svg
                  className={`h-4 w-4 transition-transform ${showItems ? 'rotate-180' : ''}`}
                  viewBox="0 0 20 20"
                  fill="currentColor"
                  aria-hidden="true"
                >
                  <path
                    fillRule="evenodd"
                    d="M5.23 7.21a.75.75 0 011.06.02L10 11.17l3.71-3.94a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z"
                    clipRule="evenodd"
                  />
                </svg>
              </button>
              {showItems && (
                <ul className="mt-2 divide-y divide-slate-100 text-sm dark:divide-slate-800">
                  {dispatch.items.map((it, i) => (
                    <li
                      key={`${it.stockId}-${i}`}
                      className="flex items-start justify-between gap-3 py-2.5"
                    >
                      <div className="min-w-0">
                        <p className="text-xs text-slate-500">Serial number</p>
                        <p className="break-all font-medium text-slate-900 dark:text-slate-100">
                          {it.assetTag || it.serialNumber || String(it.stockId ?? '').slice(0, 8)}
                        </p>
                      </div>
                      <span className="shrink-0 rounded-md bg-slate-100 px-2 py-1 text-xs font-semibold tabular-nums text-slate-700 dark:bg-slate-800 dark:text-slate-200">
                        × {it.stockQty || 1}
                      </span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}

          {dispatch.remarks && (
            <p className="rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm text-amber-900 dark:border-amber-900 dark:bg-amber-950 dark:text-amber-200">
              <span className="font-semibold">Remarks: </span>
              {dispatch.remarks}
            </p>
          )}
        </section>
      )}

      {/* Actions */}
      {(action || reporting || error) && (
        <section className="space-y-3 border-t border-slate-100 bg-slate-50/60 p-4 sm:p-6 dark:border-slate-800 dark:bg-slate-800/40">
          {action && !requestMatches && (
            <p className="rounded-lg bg-white p-3 text-sm text-slate-700 ring-1 ring-slate-200 dark:bg-slate-900 dark:text-slate-300 dark:ring-slate-700">
              This request is now “{requestLabel(dispatch.requestStatus)}”, so the delivery can’t be
              updated. Contact your dispatcher.
            </p>
          )}

          {action && requestMatches && !reporting && (
            <div className="space-y-3">
              {action.askNotes && (
                <div>
                  <label
                    htmlFor={`notes-${dispatch.id}`}
                    className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-200"
                  >
                    Delivery notes <span className="font-normal text-slate-500">(optional)</span>
                  </label>
                  <textarea
                    id={`notes-${dispatch.id}`}
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    rows={2}
                    className={field}
                  />
                </div>
              )}
              <button
                type="button"
                onClick={() => send(action.next, action.askNotes ? notes.trim() : undefined)}
                disabled={busy}
                className="h-12 w-full rounded-lg bg-primary text-base font-semibold text-white shadow-xs transition hover:opacity-90 sm:h-11 sm:text-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary disabled:cursor-not-allowed disabled:opacity-60"
              >
                {busy ? 'Saving…' : action.label}
              </button>
              {canFail && (
                <button
                  type="button"
                  onClick={() => setReporting(true)}
                  className="min-h-11 w-full rounded-lg text-sm font-medium text-red-700 hover:bg-red-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-red-600 dark:text-red-400 dark:hover:bg-red-950"
                >
                  Can’t deliver? Report a problem
                </button>
              )}
            </div>
          )}

          {reporting && (
            <div className="space-y-3">
              <label
                className="block text-sm font-medium text-slate-700 dark:text-slate-200"
                htmlFor={`fail-${dispatch.id}`}
              >
                What went wrong?
              </label>
              <textarea
                id={`fail-${dispatch.id}`}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={3}
                placeholder="e.g. Store closed, vehicle breakdown"
                className={field}
              />
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setReporting(false)}
                  disabled={busy}
                  className="h-12 rounded-lg border border-slate-300 sm:h-11 bg-white text-sm font-semibold text-slate-700 hover:bg-slate-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-primary disabled:opacity-60 dark:border-slate-600 dark:bg-slate-900 dark:text-slate-200"
                >
                  Back
                </button>
                <button
                  type="button"
                  onClick={() => send('failed', notes.trim())}
                  disabled={busy || !notes.trim()}
                  className="h-12 rounded-lg bg-red-600 sm:h-11 text-sm font-semibold text-white hover:bg-red-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-600 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {busy ? 'Saving…' : 'Mark as failed'}
                </button>
              </div>
            </div>
          )}

          {error && (
            <p
              role="alert"
              className="rounded-lg border border-red-500/20 bg-red-500/10 p-3 text-sm text-red-700 dark:text-red-400"
            >
              {error}
            </p>
          )}
        </section>
      )}
    </article>
  )
}
