// client/src/routes/_authenticated/driver/index.jsx   →   /driver
import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { useState, useMemo, useCallback, useEffect } from 'react'
import { useDriverDispatches } from '../../../hooks/useDriverDispatches'
import DispatchCard from './components/DispatchCard'
import PerformanceStats from './components/PerformanceStats'
import SearchBar from '../../../components/ui/SearchBar'
import Pagination from '../../../components/ui/Pagination'

export const Route = createFileRoute('/_authenticated/driver/')({
  validateSearch: (search) => ({
    tab: search.tab === 'history' ? 'history' : 'active',
  }),
  component: DriverDeliveries,
})

const TABS = [
  { key: 'active', label: 'Active', fullLabel: 'Active Deliveries' },
  { key: 'history', label: 'History', fullLabel: 'Delivery History' },
]

const PAGE_SIZE = 5

const card =
  'bg-white p-4 sm:p-6 rounded-xl border-2 border-primary/20 dark:border-primary/30 shadow-2xs dark:bg-slate-900/60 transition-colors'

// Everything a driver might search by. Values are stringified so numbers never throw.
const searchableText = (d) =>
  [
    d.ticketNumber,
    d.vehiclePlateNumber,
    d.originBranchName,
    d.targetStoreName,
    d.requestType,
    ...(d.items ?? []).flatMap((it) => [it.assetTag, it.serialNumber]),
  ]
    .filter((v) => v != null && v !== '')
    .map((v) => String(v).toLowerCase())
    .join(' ')

function DriverDeliveries() {
  const navigate = useNavigate()
  const { tab } = Route.useSearch()
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)

  const { dispatches, stats, loading, error, newAssignment, dismissNewAssignment, reload } =
    useDriverDispatches(tab)

  const handleTabChange = (newTab) => {
    navigate({ search: { tab: newTab }, replace: true })
  }

  const handleSearch = useCallback((value) => {
    setSearch(value)
  }, [])

  const filteredDispatches = useMemo(() => {
    if (!dispatches) return []
    const q = search.trim().toLowerCase()
    if (!q) return dispatches
    return dispatches.filter((d) => searchableText(d).includes(q))
  }, [dispatches, search])

  const totalPages = Math.max(1, Math.ceil(filteredDispatches.length / PAGE_SIZE))

  const paginatedDispatches = useMemo(() => {
    const start = (page - 1) * PAGE_SIZE
    return filteredDispatches.slice(start, start + PAGE_SIZE)
  }, [filteredDispatches, page])

  // Back to page 1 when the search or tab changes.
  useEffect(() => {
    setPage(1)
  }, [search, tab])

  // If a reload shrinks the list (e.g. a job moved to history), don't strand the user on an empty page.
  useEffect(() => {
    if (page > totalPages) setPage(totalPages)
  }, [page, totalPages])

  const emptyTitle = search
    ? 'No deliveries match your search'
    : tab === 'active'
      ? 'No active deliveries right now'
      : 'No delivery history yet'
  const emptyHint = search
    ? 'Check for typos or try a different ticket, plate or store.'
    : tab === 'active'
      ? 'New assignments appear here automatically when dispatched.'
      : 'Completed and cancelled jobs will be listed here.'

  return (
    <div className="w-full pb-12">
      {/* Outer Container with Thicker Theme-Adaptive Border */}
      <div className="bg-slate-50/60 dark:bg-slate-900/40 border-2 border-primary/20 dark:border-primary/30 rounded-2xl p-4 sm:p-6 shadow-2xs space-y-6 w-full backdrop-blur-sm transition-colors">
        <div className="w-full space-y-6">
          {/* Header Banner Card + Live Assignment Alert */}
          <div className="space-y-4">
            <div className="bg-gradient-to-r from-primary via-primary/90 to-primary/80 p-6 rounded-xl border border-white/10 shadow-md backdrop-blur-md text-on-primary">
              <h1 className="text-2xl font-bold tracking-tight text-white drop-shadow-2xs">
                My Deliveries
              </h1>
              <p className="text-sm text-white/80 mt-0.5">
                Review and update the jobs assigned to you.
              </p>
            </div>

            {newAssignment && (
              <div
                role="status"
                className="flex flex-col gap-3 rounded-xl border-2 border-sky-500/30 bg-sky-500/10 p-4 text-sm text-sky-900 sm:flex-row sm:items-center sm:justify-between dark:text-sky-100 backdrop-blur-sm"
              >
                <div className="flex items-center gap-2.5">
                  <span className="relative flex h-2.5 w-2.5 shrink-0">
                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-sky-400 opacity-75" />
                    <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-sky-500" />
                  </span>
                  <span className="font-medium">A new delivery has been assigned to you.</span>
                </div>
                <button
                  type="button"
                  onClick={dismissNewAssignment}
                  className="h-10 rounded-lg bg-primary px-4 text-sm font-semibold text-white transition hover:opacity-90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary sm:h-9 cursor-pointer"
                >
                  Dismiss
                </button>
              </div>
            )}
          </div>

          <PerformanceStats stats={stats} />

          {/* Page-Fitted Tabs + Search Toolbar */}
          <div className={`${card} space-y-4`}>
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              {/* Tab Selector Fitted to Content Width */}
              <div
                className="inline-flex items-center rounded-xl bg-slate-100 p-1 dark:bg-slate-800/80 border border-slate-200/60 dark:border-white/5 w-full sm:w-auto"
                role="tablist"
                aria-label="Delivery lists"
              >
                {TABS.map((t) => {
                  const isActive = tab === t.key
                  return (
                    <button
                      key={t.key}
                      role="tab"
                      type="button"
                      id={`tab-${t.key}`}
                      aria-selected={isActive}
                      aria-controls="deliveries-panel"
                      onClick={() => handleTabChange(t.key)}
                      className={`flex-1 sm:flex-none h-10 px-5 rounded-lg text-sm font-semibold transition-all focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary cursor-pointer whitespace-nowrap ${
                        isActive
                          ? 'bg-white text-slate-900 shadow-xs dark:bg-slate-900 dark:text-white'
                          : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'
                      }`}
                    >
                      <span className="sm:hidden">{t.label}</span>
                      <span className="hidden sm:inline">{t.fullLabel}</span>
                    </button>
                  )
                })}
              </div>

              {/* Search Bar + Delivery Count */}
              <div className="flex items-center gap-4 w-full sm:w-auto">
                <div className="w-full sm:w-80">
                  <SearchBar
                    value={search}
                    onSearch={handleSearch}
                    placeholder="Search ticket, plate, branch or store…"
                  />
                </div>
                <div className="text-xs font-medium text-slate-500 dark:text-slate-400 whitespace-nowrap hidden md:block">
                  Total Deliveries:{' '}
                  <span className="font-semibold text-slate-700 dark:text-slate-200">
                    {filteredDispatches.length}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {error && (
            <div
              role="alert"
              className="rounded-xl border-2 border-red-500/30 bg-red-500/10 p-4 text-sm text-red-700 dark:text-red-400"
            >
              {error}
            </div>
          )}

          {/* List Panel */}
          <div
            id="deliveries-panel"
            role="tabpanel"
            aria-labelledby={`tab-${tab}`}
            className="min-h-[250px] space-y-4"
          >
            {loading ? (
              <div
                className={`${card} flex flex-col items-center justify-center space-y-3 py-16`}
                aria-live="polite"
              >
                <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                <p className="text-sm text-slate-500">Loading your deliveries…</p>
              </div>
            ) : filteredDispatches.length === 0 ? (
              <div
                className={`${card} flex flex-col items-center justify-center py-14 text-center`}
              >
                <p className="text-base font-semibold text-slate-700 dark:text-slate-200">
                  {emptyTitle}
                </p>
                <p className="mt-1 max-w-xs text-sm text-slate-500 dark:text-slate-400">
                  {emptyHint}
                </p>
              </div>
            ) : (
              <>
                {paginatedDispatches.map((d) => (
                  <DispatchCard key={d.id} dispatch={d} onChanged={reload} />
                ))}

                {filteredDispatches.length > PAGE_SIZE && (
                  <div className={card}>
                    <Pagination
                      page={page}
                      totalItems={filteredDispatches.length}
                      pageSize={PAGE_SIZE}
                      onPageChange={setPage}
                    />
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
