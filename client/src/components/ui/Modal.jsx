// client/src/components/ui/Modal.jsx
import { useEffect } from 'react'
import Portal from './Portal'

const SIZES = {
  sm: 'max-w-sm',
  md: 'max-w-xl',
  lg: 'max-w-3xl',
  xl: 'max-w-5xl',
  '2xl': 'max-w-7xl',
}

export default function Modal({ open, onClose, title, children, footer, size = 'md' }) {
  // Close on Escape key
  useEffect(() => {
    if (!open) return
    const handleKey = (e) => {
      if (e.key === 'Escape') onClose?.()
    }
    document.addEventListener('keydown', handleKey)
    return () => document.removeEventListener('keydown', handleKey)
  }, [open, onClose])

  if (!open) return null

  return (
    <Portal>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        {/* Backdrop with smooth blur */}
        <div
          onClick={onClose}
          className="absolute inset-0 bg-slate-900/30 backdrop-blur-sm transition-opacity dark:bg-slate-950/60"
          aria-hidden="true"
        />

        <div
          role="dialog"
          aria-modal="true"
          className={`animate-in fade-in zoom-in-95 relative flex max-h-[90vh] w-full flex-col overflow-hidden rounded-3xl border border-white/50 bg-white/80 shadow-[0_20px_60px_-15px_rgb(0_0_0/0.35),inset_0_1px_0_rgb(255_255_255/0.7)] backdrop-blur-2xl backdrop-saturate-150 duration-200 dark:border-white/10 dark:bg-slate-900/80 dark:shadow-[0_20px_60px_-15px_rgb(0_0_0/0.7),inset_0_1px_0_rgb(255_255_255/0.08)] ${SIZES[size] || SIZES.md}`}
        >
          {/* Liquid glow (theme-colored, decorative only) */}
          <div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10">
            <div className="liquid-blob-a absolute -left-12 -top-16 h-48 w-48 rounded-full bg-primary/25 blur-3xl dark:bg-primary/20" />
            <div className="liquid-blob-b absolute -bottom-16 -right-12 h-48 w-48 rounded-full bg-primary/20 blur-3xl dark:bg-primary/15" />
          </div>

          {/* Glossy sheen */}
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-x-0 top-0 h-24 bg-gradient-to-b from-white/50 to-transparent dark:from-white/[0.06]"
          />

          {title && (
            <div className="relative flex items-center justify-between border-b border-primary/20 bg-gradient-to-r from-primary/15 via-primary/5 to-transparent px-6 py-4 dark:border-primary/30 dark:from-primary/25 dark:via-primary/10">
              <h2 className="text-base font-bold tracking-tight text-slate-900 dark:text-white">
                {title}
              </h2>
              <button
                onClick={onClose}
                aria-label="Close"
                className="flex h-7 w-7 items-center justify-center rounded-full text-lg text-slate-500 transition-colors hover:bg-primary/10 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-white/10 dark:hover:text-white"
              >
                ×
              </button>
            </div>
          )}

          <div className="relative overflow-y-auto px-6 py-5 text-slate-700 dark:text-slate-200">
            {children}
          </div>

          {footer && (
            <div className="relative flex items-center justify-end gap-3 border-t border-primary/20 bg-white/40 px-6 py-4 dark:border-primary/30 dark:bg-white/[0.03]">
              {footer}
            </div>
          )}
        </div>
      </div>
    </Portal>
  )
}
