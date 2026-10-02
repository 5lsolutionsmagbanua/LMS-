// client/src/components/ui/Alert.jsx
import { useEffect, useState } from 'react'

const VARIANTS = {
  info: {
    border: 'border-l-blue-500',
    icon: 'text-blue-500',
    title: 'text-blue-700',
    bar: 'bg-blue-500',
  },
  success: {
    border: 'border-l-green-500',
    icon: 'text-green-500',
    title: 'text-green-700',
    bar: 'bg-green-500',
  },
  error: {
    border: 'border-l-[#E31837]',
    icon: 'text-[#E31837]',
    title: 'text-[#E31837]',
    bar: 'bg-[#E31837]',
  },
  warning: {
    border: 'border-l-amber-500',
    icon: 'text-amber-500',
    title: 'text-amber-600',
    bar: 'bg-amber-500',
  },
}

const ICONS = {
  info: (
    <svg viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5">
      <path
        fillRule="evenodd"
        d="M18 10A8 8 0 11 2 10a8 8 0 0116 0zM9 9a1 1 0 012 0v4a1 1 0 11-2 0V9zm1-4a1 1 0 100 2 1 1 0 000-2z"
        clipRule="evenodd"
      />
    </svg>
  ),
  success: (
    <svg viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5">
      <path
        fillRule="evenodd"
        d="M16.7 5.3a1 1 0 010 1.4l-7.5 7.5a1 1 0 01-1.4 0l-3.5-3.5a1 1 0 111.4-1.4l2.8 2.8 6.8-6.8a1 1 0 011.4 0z"
        clipRule="evenodd"
      />
    </svg>
  ),
  error: (
    <svg viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5">
      <path
        fillRule="evenodd"
        d="M18 10A8 8 0 11 2 10a8 8 0 0116 0zm-7-4a1 1 0 10-2 0v4a1 1 0 102 0V6zm-1 8a1 1 0 100 2 1 1 0 000-2z"
        clipRule="evenodd"
      />
    </svg>
  ),
  warning: (
    <svg viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5">
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
  const { border, icon, title: titleColor, bar } = VARIANTS[variant]

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
    <div className="fixed top-4 right-4 z-50 w-full max-w-sm pointer-events-none">
      <div
        role="alert"
        className={`relative overflow-hidden pointer-events-auto bg-white rounded-xl shadow-lg border border-slate-200 border-l-4 ${border}
          transition-all duration-300 ease-out
          ${visible ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-4'}`}
      >
        <div className="flex items-start gap-3 px-4 py-3.5">
          <span className={`shrink-0 mt-0.5 ${icon}`}>{ICONS[variant]}</span>

          <div className="flex-1 min-w-0">
            {title && <p className={`text-sm font-semibold ${titleColor}`}>{title}</p>}
            <p className="text-sm text-slate-600 leading-snug">{children}</p>
          </div>

          {onDismiss && (
            <button
              type="button"
              onClick={onDismiss}
              aria-label="Dismiss"
              className={`shrink-0 ${titleColor} opacity-70 hover:opacity-100 transition-opacity leading-none text-lg -mt-0.5`}
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
