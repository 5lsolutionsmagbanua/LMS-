// client/src/components/ui/Alert.jsx
import { useEffect, useState } from 'react'

// Status colors stay semantic (blue/green/red/amber) so meaning never changes with the theme.
const VARIANTS = {
  info: {
    border: 'border-l-blue-500',
    tint: 'bg-blue-500/10 dark:bg-blue-400/10',
    glow: 'shadow-blue-500/30',
    icon: 'text-blue-500 dark:text-blue-400',
    title: 'text-blue-700 dark:text-blue-300',
    bar: 'bg-blue-500',
  },
  success: {
    border: 'border-l-green-500',
    tint: 'bg-green-500/10 dark:bg-green-400/10',
    glow: 'shadow-green-500/30',
    icon: 'text-green-500 dark:text-green-400',
    title: 'text-green-700 dark:text-green-300',
    bar: 'bg-green-500',
  },
  error: {
    border: 'border-l-[#E31837]',
    tint: 'bg-[#E31837]/10 dark:bg-[#E31837]/15',
    glow: 'shadow-[#E31837]/30',
    icon: 'text-[#E31837]',
    title: 'text-[#E31837] dark:text-rose-300',
    bar: 'bg-[#E31837]',
  },
  warning: {
    border: 'border-l-amber-500',
    tint: 'bg-amber-500/10 dark:bg-amber-400/10',
    glow: 'shadow-amber-500/30',
    icon: 'text-amber-500 dark:text-amber-400',
    title: 'text-amber-600 dark:text-amber-300',
    bar: 'bg-amber-500',
  },
}

const ICONS = {
  info: (
    <svg viewBox="0 0 20 20" fill="currentColor" className="h-5 w-5">
      <path
        fillRule="evenodd"
        d="M18 10A8 8 0 11 2 10a8 8 0 0116 0zM9 9a1 1 0 012 0v4a1 1 0 11-2 0V9zm1-4a1 1 0 100 2 1 1 0 000-2z"
        clipRule="evenodd"
      />
    </svg>
  ),
  success: (
    <svg viewBox="0 0 20 20" fill="currentColor" className="h-5 w-5">
      <path
        fillRule="evenodd"
        d="M16.7 5.3a1 1 0 010 1.4l-7.5 7.5a1 1 0 01-1.4 0l-3.5-3.5a1 1 0 111.4-1.4l2.8 2.8 6.8-6.8a1 1 0 011.4 0z"
        clipRule="evenodd"
      />
    </svg>
  ),
  error: (
    <svg viewBox="0 0 20 20" fill="currentColor" className="h-5 w-5">
      <path
        fillRule="evenodd"
        d="M18 10A8 8 0 11 2 10a8 8 0 0116 0zm-7-4a1 1 0 10-2 0v4a1 1 0 102 0V6zm-1 8a1 1 0 100 2 1 1 0 000-2z"
        clipRule="evenodd"
      />
    </svg>
  ),
  warning: (
    <svg viewBox="0 0 20 20" fill="currentColor" className="h-5 w-5">
      <path
        fillRule="evenodd"
        d="M18 10A8 8 0 11 2 10a8 8 0 0116 0zM10 5a1 1 0 011 1v4.5a1 1 0 11-2 0V6a1 1 0 011-1zm0 9a1.1 1.1 0 100 2.2 1.1 1.1 0 000-2.2z"
        clipRule="evenodd"
      />
    </svg>
  ),
}

export default function Alert({ variant = 'info', title, children, onDismiss, duration = 5000 }) {
  const [visible, setVisible] = useState(false)
  const { border, tint, glow, icon, title: titleColor, bar } = VARIANTS[variant]

  useEffect(() => {
    const raf = requestAnimationFrame(() => setVisible(true))
    return () => cancelAnimationFrame(raf)
  }, [])

  useEffect(() => {
    if (!duration || !onDismiss) return
    const timer = setTimeout(onDismiss, duration)
    return () => clearTimeout(timer)
  }, [duration, onDismiss])

  return (
    <div className="pointer-events-none fixed right-4 top-4 z-50 w-full max-w-sm">
      <div
        role="alert"
        className={`pointer-events-auto relative overflow-hidden rounded-2xl border border-l-4 border-white/50 bg-white/70 ${border}
          shadow-[0_16px_40px_-12px] ${glow}
          backdrop-blur-2xl backdrop-saturate-150
          dark:border-white/10 dark:bg-slate-900/70
          transition-all duration-300 ease-out
          ${visible ? 'translate-x-0 opacity-100' : 'translate-x-4 opacity-0'}`}
      >
        {/* Status tint + glossy sheen */}
        <div aria-hidden="true" className={`pointer-events-none absolute inset-0 ${tint}`} />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 bg-gradient-to-b from-white/50 via-transparent to-transparent dark:from-white/[0.06]"
        />

        <div className="relative flex items-start gap-3 px-4 py-3.5">
          <span className={`mt-0.5 shrink-0 ${icon}`}>{ICONS[variant]}</span>

          <div className="min-w-0 flex-1">
            {title && <p className={`text-sm font-semibold ${titleColor}`}>{title}</p>}
            <p className="text-sm leading-snug text-slate-600 dark:text-slate-300">{children}</p>
          </div>

          {onDismiss && (
            <button
              type="button"
              onClick={onDismiss}
              aria-label="Dismiss"
              className={`-mt-0.5 shrink-0 text-lg leading-none opacity-70 transition-opacity hover:opacity-100 ${titleColor}`}
            >
              ×
            </button>
          )}
        </div>

        {duration > 0 && (
          <div
            className={`absolute bottom-0 left-0 h-0.5 ${bar}`}
            style={{ animation: `alert-shrink ${duration}ms linear forwards` }}
          />
        )}
      </div>

      <style>{`
        @keyframes alert-shrink {
          from { width: 100%; }
          to { width: 0%; }
        }
      `}</style>
    </div>
  )
}
