// client/src/components/ui/Modal.jsx
import { useEffect } from 'react'
import Portal from './Portal' // Adjust path if Portal.jsx is located elsewhere

export default function Modal({ open, onClose, title, children, footer, size = 'md' }) {
  const SIZES = {
    sm: 'max-w-sm',
    md: 'max-w-xl', // Increased from max-w-lg
    lg: 'max-w-3xl', // Increased from max-w-2xl
    xl: 'max-w-5xl', // New extra wide option
    '2xl': 'max-w-7xl', // New ultra wide option
  }

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
          className="absolute inset-0 bg-slate-950/60 backdrop-blur-sm transition-opacity"
          aria-hidden="true"
        />

        <div
          role="dialog"
          aria-modal="true"
          className={`relative bg-white rounded-3xl shadow-2xl shadow-slate-900/20 border border-slate-100 w-full ${SIZES[size] || SIZES.md} max-h-[90vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200`}
        >
          {title && (
            <div className="flex items-center justify-between px-6 py-4.5 border-b border-slate-100 bg-slate-50/50">
              <h2 className="text-base font-semibold text-slate-900 tracking-tight">{title}</h2>
              <button
                onClick={onClose}
                aria-label="Close"
                className="w-7 h-7 flex items-center justify-center rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 transition-colors text-lg"
              >
                ×
              </button>
            </div>
          )}

          <div className="px-6 py-5 overflow-y-auto">{children}</div>

          {footer && (
            <div className="px-6 py-4 border-t border-slate-100 bg-slate-50/50 flex items-center justify-end gap-3">
              {footer}
            </div>
          )}
        </div>
      </div>
    </Portal>
  )
}
