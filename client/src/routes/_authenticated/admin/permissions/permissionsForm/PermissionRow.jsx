// client/src/routes/authenticated/developer/permissions/PermissionRow.jsx
import { useState } from 'react'
import { ACTION_META } from '@/constants/permissionCatalog'

/**
 * One permission line: action badge, plain-language description, and a control on the right.
 */
export default function PermissionRow({
  moduleKey,
  action,
  description,
  mode = 'editable',
  checked = false,
  onToggle,
}) {
  const [copied, setCopied] = useState(false)
  const meta = ACTION_META[action]

  if (!meta) return null

  const code = `${moduleKey}_${action}`.toUpperCase()

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(code)
      setCopied(true)
      setTimeout(() => setCopied(false), 1200)
    } catch {
      // Clipboard fallback handled gracefully
    }
  }

  const badge = (
    <span
      className={`inline-flex shrink-0 items-center justify-center rounded-md border px-2.5 py-1 text-[11px] font-bold tracking-wide ${meta.badge}`}
    >
      {meta.label}
    </span>
  )

  if (mode === 'catalog') {
    return (
      <div className="flex items-center justify-between gap-3 border-b border-slate-100 px-5 py-3.5 last:border-0">
        <div className="flex min-w-0 items-center gap-3">
          {badge}
          <span className="truncate text-sm font-medium text-slate-700">{description}</span>
        </div>

        <button
          type="button"
          onClick={handleCopy}
          aria-label={`Copy permission code ${code}`}
          title={copied ? 'Copied' : code}
          className="shrink-0 rounded-md p-1 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-700 focus:outline-none focus:ring-2 focus:ring-primary/40"
        >
          {copied ? (
            <CheckIcon className="h-4 w-4 text-primary" />
          ) : (
            <CopyIcon className="h-4 w-4" />
          )}
        </button>
      </div>
    )
  }

  return (
    <button
      type="button"
      role="checkbox"
      aria-checked={checked}
      onClick={onToggle}
      className={`flex w-full items-center justify-between gap-3 border-b border-slate-100 px-4 py-3 text-left transition-colors last:border-0 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-primary/40 ${
        checked ? 'bg-primary/5' : 'bg-white hover:bg-slate-50'
      }`}
    >
      <span className="flex min-w-0 items-center gap-3">
        {badge}
        <span className="truncate text-sm font-medium text-slate-700">{description}</span>
      </span>

      <span
        aria-hidden="true"
        className={`flex h-5 w-5 shrink-0 items-center justify-center rounded border transition-colors ${
          checked ? 'border-primary bg-primary' : 'border-slate-300 bg-white'
        }`}
      >
        {checked && <CheckIcon className="h-3.5 w-3.5 text-white" />}
      </span>
    </button>
  )
}

function CopyIcon(props) {
  return (
    <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.6" {...props}>
      <rect x="7" y="7" width="10" height="10" rx="1.5" />
      <path d="M4.5 13H4a1 1 0 01-1-1V4a1 1 0 011-1h8a1 1 0 011 1v.5" strokeLinecap="round" />
    </svg>
  )
}

function CheckIcon(props) {
  return (
    <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2.4" {...props}>
      <path d="M4 10l4 4l8-8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}
