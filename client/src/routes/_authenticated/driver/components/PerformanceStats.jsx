// routes/_authenticated/driver/components/PerformanceStats.jsx
import { fmtMinutes } from '../../../../utils/formatDuration'

export default function PerformanceStats({ stats }) {
  if (!stats) return null
  const items = [
    { label: 'Delivered (30d)', value: stats.completed ?? 0 },
    { label: 'Completion', value: stats.completionRate == null ? '–' : `${stats.completionRate}%` },
    { label: 'Avg Start', value: fmtMinutes(stats.avgResponseMin) },
    { label: 'Avg Trip', value: fmtMinutes(stats.avgTransitMin) },
  ]
  return (
    <div className="w-full overflow-x-auto pb-1 no-scrollbar">
      <dl
        aria-label="Your performance"
        className="flex gap-3 sm:grid sm:grid-cols-2 lg:grid-cols-4"
      >
        {items.map((it) => (
          <div
            key={it.label}
            className="min-w-[130px] flex-1 rounded-xl border border-slate-100 bg-white p-3.5 shadow-xs dark:border-slate-800 dark:bg-slate-900"
          >
            <dt className="text-[11px] font-medium leading-snug text-slate-400 uppercase tracking-wide">
              {it.label}
            </dt>
            <dd className="mt-1 text-xl font-bold tabular-nums text-slate-900 dark:text-white">
              {it.value}
            </dd>
          </div>
        ))}
      </dl>
    </div>
  )
}
