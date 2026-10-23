// routes/_authenticated/driver/components/StatusStepper.jsx
import { DELIVERY_STEPS } from '../../../../constants/dispatchStatus'

const fmtTime = (v) =>
  v ? new Date(v).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''

const FAILED_STATUSES = ['cancelled', 'failed']

function Check() {
  return (
    <svg className="h-3.5 w-3.5" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
      <path
        fillRule="evenodd"
        d="M16.7 5.3a1 1 0 010 1.4l-7.5 7.5a1 1 0 01-1.4 0L3.3 9.7a1 1 0 111.4-1.4l3.8 3.8 6.8-6.8a1 1 0 011.4 0z"
        clipRule="evenodd"
      />
    </svg>
  )
}

export default function StatusStepper({ dispatch }) {
  const failed = FAILED_STATUSES.includes(dispatch.status)
  const completed = dispatch.status === 'completed'
  const currentIndex = Math.max(
    0,
    DELIVERY_STEPS.findIndex((s) => s.key === dispatch.status),
  )

  return (
    <ol className="flex sm:max-w-xl" aria-label="Delivery progress">
      {DELIVERY_STEPS.map((step, i) => {
        const done = !failed && (i < currentIndex || completed)
        const current = !failed && !completed && i === currentIndex
        const lineFilled = !failed && (i <= currentIndex || completed)

        const circle = failed
          ? 'bg-red-100 text-red-700 ring-red-200 dark:bg-red-950 dark:text-red-300 dark:ring-red-900'
          : done
            ? 'bg-emerald-500 text-white ring-emerald-500'
            : current
              ? 'bg-primary text-white ring-slate-200 dark:ring-slate-700'
              : 'bg-white text-slate-400 ring-slate-300 dark:bg-slate-900 dark:ring-slate-600'

        return (
          <li
            key={step.key}
            className="relative min-w-0 flex-1 px-0.5 text-center"
            aria-current={current ? 'step' : undefined}
          >
            {i > 0 && (
              <span
                aria-hidden="true"
                className={`absolute left-[-50%] right-[50%] top-3 h-0.5 -translate-y-1/2 ${
                  failed
                    ? 'bg-red-200 dark:bg-red-900'
                    : lineFilled
                      ? 'bg-emerald-500'
                      : 'bg-slate-200 dark:bg-slate-700'
                }`}
              />
            )}
            <span
              className={`relative z-10 mx-auto flex h-6 w-6 items-center justify-center rounded-full text-xs font-semibold ring-2 ${circle}`}
            >
              {done ? <Check /> : i + 1}
            </span>
            <p
              className={`mt-2 text-[11px] font-medium leading-tight sm:text-xs ${
                done || current
                  ? 'text-slate-900 dark:text-slate-100'
                  : 'text-slate-500 dark:text-slate-400'
              }`}
            >
              {step.label}
            </p>
            <p className="mt-0.5 h-4 text-[11px] tabular-nums text-slate-500 sm:text-xs">
              {fmtTime(dispatch[step.at])}
            </p>
          </li>
        )
      })}
    </ol>
  )
}
