// client/src/components/ui/Pagination.jsx
export default function Pagination({ page, totalItems, pageSize = 4, onPageChange }) {
  // Automatically defaults to 4 items per page if pageSize is omitted
  const totalPages = Math.ceil(totalItems / pageSize)

  const goTo = (p) => {
    if (p < 1 || p > totalPages) return
    onPageChange(p)
  }

  // Calculate a sliding window of up to 4 page numbers
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
    <div className="flex items-center justify-center sm:justify-end gap-1.5 py-2 px-1">
      <IconButton onClick={() => goTo(1)} disabled={page === 1} label="First page">
        <ChevronsLeft />
      </IconButton>
      <IconButton onClick={() => goTo(page - 1)} disabled={page === 1} label="Previous page">
        <ChevronLeft />
      </IconButton>

      {visiblePages.map((p) => (
        <button
          key={p}
          onClick={() => goTo(p)}
          className={`w-9 h-9 rounded-xl text-sm font-semibold transition-all duration-200 ${
            p === page
              ? 'bg-primary text-white shadow-md shadow-primary/25 scale-105'
              : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
          }`}
        >
          {p}
        </button>
      ))}

      <IconButton onClick={() => goTo(page + 1)} disabled={page === totalPages} label="Next page">
        <ChevronRight />
      </IconButton>
      <IconButton onClick={() => goTo(totalPages)} disabled={page === totalPages} label="Last page">
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
      className="w-9 h-9 flex items-center justify-center rounded-xl border border-slate-200/80 bg-white text-slate-500 hover:bg-slate-100 hover:text-slate-900 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-transparent transition-all duration-200 shadow-sm"
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
