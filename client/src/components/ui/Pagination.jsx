// client/src/components/ui/Pagination.jsx
export default function Pagination({ page, totalItems, pageSize = 4, onPageChange }) {
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize))

  const goTo = (p) => {
    if (p < 1 || p > totalPages) return
    onPageChange(p)
  }

  // Sliding window of up to 4 page numbers
  const getVisiblePages = () => {
    let start = Math.max(1, page - 1)
    let end = start + 3
    if (end > totalPages) {
      end = totalPages
      start = Math.max(1, end - 3)
    }
    return Array.from({ length: end - start + 1 }, (_, i) => start + i)
  }

  const visiblePages = getVisiblePages()

  return (
    <div className="flex items-center justify-center gap-1.5 px-1 py-2 sm:justify-end">
      <IconButton onClick={() => goTo(1)} disabled={page === 1} label="First page">
        <ChevronsLeft />
      </IconButton>
      <IconButton onClick={() => goTo(page - 1)} disabled={page === 1} label="Previous page">
        <ChevronLeft />
      </IconButton>

      {visiblePages.map((p) => {
        const isActive = p === page
        return (
          <button
            key={p}
            onClick={() => goTo(p)}
            aria-current={isActive ? 'page' : undefined}
            className={`h-9 w-9 rounded-xl border text-sm font-semibold transition-all duration-300 ${
              isActive
                ? 'scale-105 border-primary bg-primary text-on-primary shadow-[inset_0_1px_0_rgb(255_255_255/0.35),0_8px_20px_-6px] shadow-primary/50 ring-1 ring-slate-900/10 dark:ring-white/20'
                : 'border-transparent text-slate-600 hover:border-slate-200/80 hover:bg-slate-900/5 hover:text-slate-900 dark:text-slate-300 dark:hover:border-white/10 dark:hover:bg-white/10 dark:hover:text-white'
            }`}
          >
            {p}
          </button>
        )
      })}

      <IconButton
        onClick={() => goTo(page + 1)}
        disabled={page === totalPages}
        label="Next page"
      >
        <ChevronRight />
      </IconButton>
      <IconButton
        onClick={() => goTo(totalPages)}
        disabled={page === totalPages}
        label="Last page"
      >
        <ChevronsRight />
      </IconButton>
    </div>
  )
}

function IconButton({ onClick, disabled, label, children }) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      aria-label={label}
      className="flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200/80 bg-white/70 text-slate-600 shadow-[inset_0_1px_0_rgb(255_255_255/0.7)] backdrop-blur transition-all duration-300 hover:bg-white hover:text-slate-900 disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:bg-white/70 dark:border-white/10 dark:bg-white/10 dark:text-slate-300 dark:shadow-[inset_0_1px_0_rgb(255_255_255/0.08)] dark:hover:bg-white/15 dark:hover:text-white dark:disabled:hover:bg-white/10"
    >
      {children}
    </button>
  )
}

const iconProps = {
  viewBox: '0 0 20 20',
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 1.8,
  className: 'w-4 h-4',
}

const ChevronLeft = () => (
  <svg {...iconProps}>
    <path d="M12 15l-5-5 5-5" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
)

const ChevronRight = () => (
  <svg {...iconProps}>
    <path d="M8 5l5 5-5 5" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
)

const ChevronsLeft = () => (
  <svg {...iconProps}>
    <path d="M13 15l-5-5 5-5M7 15l-5-5 5-5" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
)

const ChevronsRight = () => (
  <svg {...iconProps}>
    <path d="M7 5l5 5-5 5M13 5l5 5-5 5" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
)