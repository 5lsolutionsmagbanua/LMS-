// client/src/routes/_authenticated/admin/driver-performance/index.jsx
import { useEffect, useState } from 'react'
import { createFileRoute } from '@tanstack/react-router'
import { getDriverPerformance } from '../../../../api/driverDispatch.api'
import { fmtMinutes } from '../../../../utils/formatDuration'

export const Route = createFileRoute('/_authenticated/admin/driver-performance/')({
  component: DriverPerformancePage,
})

const iso = (d) => d.toISOString().slice(0, 10)

const dateInputClass =
  'rounded-lg border border-primary/30 bg-white px-2.5 py-1.5 text-sm text-slate-900 shadow-2xs transition-all focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 dark:bg-slate-900/50 dark:text-slate-100 dark:[color-scheme:dark]'

function DriverPerformancePage() {
  const today = new Date()
  const [from, setFrom] = useState(iso(new Date(today.getTime() - 30 * 86400000)))
  const [to, setTo] = useState(iso(today))
  const [rows, setRows] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    getDriverPerformance({ from, to })
      .then((data) => !cancelled && (setRows(data), setError('')))
      .catch(
        (e) => !cancelled && setError(e?.response?.data?.message || 'Could not load performance'),
      )
      .finally(() => !cancelled && setLoading(false))
    return () => {
      cancelled = true
    }
  }, [from, to])

  return (
    <div className="w-full pb-12">
      <div className="bg-slate-50/60 dark:bg-slate-900/40 border-2 border-primary/20 dark:border-primary/30 rounded-2xl p-4 sm:p-6 shadow-2xs space-y-6 w-full backdrop-blur-sm transition-colors">
        <div className="bg-gradient-to-r from-primary via-primary/90 to-primary/80 p-6 rounded-xl border border-white/10 shadow-md backdrop-blur-md text-on-primary">
          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold tracking-tight h1 drop-shadow-2xs">
                Driver performance
              </h1>
              <p className="text-sm opacity-75 mt-0.5">
                Dispatch completion and timing for each driver.
              </p>
            </div>

            <div className="flex flex-wrap gap-3">
              <label className="flex flex-col gap-1 text-xs font-semibold uppercase tracking-wide text-on-primary/90">
                From
                <input
                  type="date"
                  value={from}
                  max={to}
                  onChange={(e) => setFrom(e.target.value)}
                  className={dateInputClass}
                />
              </label>
              <label className="flex flex-col gap-1 text-xs font-semibold uppercase tracking-wide text-on-primary/90">
                To
                <input
                  type="date"
                  value={to}
                  min={from}
                  onChange={(e) => setTo(e.target.value)}
                  className={dateInputClass}
                />
              </label>
            </div>
          </div>
        </div>

        {error && (
          <div
            role="alert"
            className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700 dark:border-rose-800/50 dark:bg-rose-950/40 dark:text-rose-400"
          >
            {error}
          </div>
        )}

        <div className="bg-white dark:bg-slate-900/60 rounded-xl border-2 border-primary/20 dark:border-primary/30 shadow-2xs overflow-hidden w-full transition-colors">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[820px] text-left text-sm">
              <thead className="border-b-2 border-primary/20 bg-primary/10 text-slate-700 dark:border-primary/30 dark:bg-primary/20 dark:text-slate-200">
                <tr>
                  <th className="px-3 py-3 font-semibold">Driver</th>
                  <th className="px-3 py-3 text-right font-semibold">Assigned</th>
                  <th className="px-3 py-3 text-right font-semibold">Delivered</th>
                  <th className="px-3 py-3 text-right font-semibold">Cancelled</th>
                  <th className="px-3 py-3 text-right font-semibold">In progress</th>
                  <th className="px-3 py-3 text-right font-semibold">Completion</th>
                  <th className="px-3 py-3 text-right font-semibold">Time to start</th>
                  <th className="px-3 py-3 text-right font-semibold">Trip</th>
                  <th className="px-3 py-3 text-right font-semibold">Unloading</th>
                  <th className="px-3 py-3 text-right font-semibold">Total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-primary/10 tabular-nums text-slate-600 dark:divide-white/5 dark:text-slate-400">
                {loading ? (
                  <tr>
                    <td
                      colSpan={10}
                      className="px-3 py-8 text-center text-slate-500 dark:text-slate-400"
                    >
                      Loading…
                    </td>
                  </tr>
                ) : rows.length === 0 ? (
                  <tr>
                    <td
                      colSpan={10}
                      className="px-3 py-8 text-center text-slate-500 dark:text-slate-400"
                    >
                      No dispatches in this date range.
                    </td>
                  </tr>
                ) : (
                  rows.map((r) => (
                    <tr key={r.driverId} className="transition-colors hover:bg-primary/5">
                      <td className="px-3 py-3 font-medium text-slate-900 dark:text-slate-100">
                        {r.driverName}
                      </td>
                      <td className="px-3 py-3 text-right">{r.totalAssigned}</td>
                      <td className="px-3 py-3 text-right">{r.completed}</td>
                      <td className="px-3 py-3 text-right">{r.cancelled}</td>
                      <td className="px-3 py-3 text-right">{r.inProgress}</td>
                      <td className="px-3 py-3 text-right">
                        {r.completionRate == null ? '–' : `${r.completionRate}%`}
                      </td>
                      <td className="px-3 py-3 text-right">{fmtMinutes(r.avgResponseMin)}</td>
                      <td className="px-3 py-3 text-right">{fmtMinutes(r.avgTransitMin)}</td>
                      <td className="px-3 py-3 text-right">{fmtMinutes(r.avgUnloadMin)}</td>
                      <td className="px-3 py-3 text-right font-semibold text-slate-900 dark:text-white">
                        {fmtMinutes(r.avgTotalMin)}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
}
