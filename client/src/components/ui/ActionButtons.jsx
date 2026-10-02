// client/src/components/ui/ActionButtons.jsx
export default function ActionButtons({ onView, onEdit, onApprove, onDelete }) {
  return (
    <div className="flex items-center gap-1.5">
      {onView && (
        <button
          onClick={onView}
          aria-label="View"
          className="p-1.5 rounded-xl bg-slate-100 text-slate-600 hover:bg-slate-200 hover:text-slate-900 transition-colors"
        >
          <EyeIcon className="w-4 h-4" />
        </button>
      )}
      {onEdit && (
        <button
          onClick={onEdit}
          aria-label="Edit"
          className="p-1.5 rounded-xl bg-primary/10 text-primary hover:bg-primary/20 transition-colors"
        >
          <PencilIcon className="w-4 h-4" />
        </button>
      )}
      {onApprove && (
        <button
          onClick={onApprove}
          aria-label="Approve"
          className="p-1.5 rounded-xl bg-emerald-50 text-emerald-600 hover:bg-emerald-100 transition-colors"
        >
          <CheckIcon className="w-4 h-4" />
        </button>
      )}
      {onDelete && (
        <button
          onClick={onDelete}
          aria-label="Delete"
          className="p-1.5 rounded-xl bg-rose-50 text-rose-600 hover:bg-rose-100 transition-colors"
        >
          <TrashIcon className="w-4 h-4" />
        </button>
      )}
    </div>
  )
}

function EyeIcon(props) {
  return (
    <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.6" {...props}>
      <path d="M1 10s3-6 9-6 9 6 9 6-3 6-9 6-9-6-9-6z" strokeLinejoin="round" />
      <circle cx="10" cy="10" r="2.5" />
    </svg>
  )
}

function PencilIcon(props) {
  return (
    <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.6" {...props}>
      <path d="M13.5 2.5l4 4L6 18H2v-4L13.5 2.5z" strokeLinejoin="round" strokeLinecap="round" />
    </svg>
  )
}

function CheckIcon(props) {
  return (
    <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.6" {...props}>
      <path d="M4 10l4 4l8-8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function TrashIcon(props) {
  return (
    <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.6" {...props}>
      <path
        d="M3 5h14M8 5V3.5a1 1 0 011-1h2a1 1 0 011 1V5M6 5v11a1 1 0 001 1h6a1 1 0 001-1V5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}
