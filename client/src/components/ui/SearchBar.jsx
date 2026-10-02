// client/src/components/ui/SearchBar.jsx
import { useEffect, useState } from 'react'

export default function SearchBar({ value, onSearch, placeholder = 'Search…', debounceMs = 300 }) {
  const [query, setQuery] = useState(value ?? '')

  useEffect(() => {
    if (value !== undefined) setQuery(value)
  }, [value])

  useEffect(() => {
    const timer = setTimeout(() => onSearch(query), debounceMs)
    return () => clearTimeout(timer)
  }, [query, debounceMs, onSearch])

  return (
    <div className="relative w-full">
      <SearchIcon className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
      <input
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder={placeholder}
        className="w-full rounded-xl border border-slate-200/80 bg-white pl-10 pr-9 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent shadow-sm transition-all duration-200"
      />
      {query && (
        <button
          onClick={() => setQuery('')}
          aria-label="Clear search"
          className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 flex items-center justify-center rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors text-xs font-bold"
        >
          ×
        </button>
      )}
    </div>
  )
}

function SearchIcon(props) {
  return (
    <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.8" {...props}>
      <circle cx="8.5" cy="8.5" r="5.5" />
      <path d="M17 17l-4-4" strokeLinecap="round" />
    </svg>
  )
}
