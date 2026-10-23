// client/src/components/ui/Table.jsx
import { useMemo, useState } from 'react'

const GLASS_SURFACE =
  'border border-white/50 bg-white/50 backdrop-blur-2xl backdrop-saturate-150 ' +
  'shadow-[0_12px_40px_-12px_rgb(0_0_0/0.2),inset_0_1px_0_rgb(255_255_255/0.7)] ' +
  'dark:border-white/10 dark:bg-slate-900/40 ' +
  'dark:shadow-[0_12px_40px_-12px_rgb(0_0_0/0.6),inset_0_1px_0_rgb(255_255_255/0.06)]'

export default function Table({
  columns,
  rows,
  rowKey = 'id',
  loading = false,
  emptyMessage = 'No records found.',
  minRows = 4,
}) {
  const [sortKey, setSortKey] = useState(null)
  const [sortDir, setSortDir] = useState('asc')

  const sortedRows = useMemo(() => {
    if (!rows || !sortKey) return rows
    const col = columns.find((c) => c.key === sortKey)
    const getValue = col?.sortValue ?? ((row) => row[sortKey])

    return [...rows].sort((a, b) => {
      const av = getValue(a) ?? ''
      const bv = getValue(b) ?? ''
      const cmp = String(av).localeCompare(String(bv), undefined, { numeric: true })
      return sortDir === 'asc' ? cmp : -cmp
    })
  }, [rows, sortKey, sortDir, columns])

  const toggleSort = (key) => {
    if (sortKey !== key) {
      setSortKey(key)
      setSortDir('asc')
    } else {
      setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'))
    }
  }

  return (
    <div
      className={`relative w-full overflow-hidden rounded-3xl transition-colors ${GLASS_SURFACE}`}
    >
      {/* Liquid background blobs (theme-colored, decorative only) */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 overflow-hidden opacity-30 dark:opacity-20"
      >
        <div className="liquid-blob-a absolute -top-12 -left-12 h-64 w-64 rounded-full bg-primary/40 blur-3xl" />
        <div className="liquid-blob-b absolute -bottom-12 -right-12 h-64 w-64 rounded-full bg-primary/30 blur-3xl" />
      </div>

      {/* Desktop table */}
      <div className="relative hidden min-h-[320px] w-full flex-col justify-between overflow-x-auto p-3 md:block">
        <table className="w-full border-separate border-spacing-0 text-sm">
          <thead>
            <tr>
              {columns.map((col, index) => (
              <th
  key={col.key}
  onClick={col.sortable ? () => toggleSort(col.key) : undefined}
  className={`table-head whitespace-nowrap px-4 py-3.5 text-left text-xs font-semibold uppercase tracking-wide border-b-2 border-primary/20 dark:border-primary/30 ${
    index === 0 ? 'rounded-l-2xl' : ''
  } ${index === columns.length - 1 ? 'rounded-r-2xl' : ''} ${
    col.sortable ? 'cursor-pointer select-none hover:brightness-95 dark:hover:brightness-110' : ''
  } ${col.className || ''}`}
>
                  <span className="inline-flex items-center gap-1">
                    {col.label}
                    {col.sortable && (
                      <SortIcon
                        direction={sortKey === col.key ? sortDir : null}
                        className="h-3 w-3"
                      />
                    )}
                  </span>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading && (
              <tr>
                <td
                  colSpan={columns.length}
                  className="px-4 py-16 text-center text-slate-500 dark:text-slate-400"
                >
                  <span className="inline-flex items-center gap-2">
                    <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-primary/30 border-t-primary" />
                    Loading…
                  </span>
                </td>
              </tr>
            )}

            {!loading && (!sortedRows || sortedRows.length === 0) && (
              <tr>
                <td
                  colSpan={columns.length}
                  className="px-4 py-16 text-center text-slate-500 dark:text-slate-400"
                >
                  {emptyMessage}
                </td>
              </tr>
            )}

            {!loading &&
              sortedRows?.map((row, i) => (
                <tr
                  key={row[rowKey]}
                  className={`transition-colors duration-200 hover:bg-primary/10 dark:hover:bg-primary/15 ${
                    i % 2 === 1 ? 'bg-white/40 dark:bg-white/[0.04]' : ''
                  }`}
                >
                  {columns.map((col) => (
                    <td
                      key={col.key}
                      className={`border-b border-slate-200/60 px-4 py-3.5 text-slate-700 dark:border-white/5 dark:text-slate-300 ${col.className || ''}`}
                    >
                      {col.truncate ? (
                        <span
                          className="inline-block w-full truncate align-bottom"
                          title={row[col.key]}
                        >
                          {col.render ? col.render(row) : row[col.key]}
                        </span>
                      ) : col.render ? (
                        col.render(row)
                      ) : (
                        row[col.key]
                      )}
                    </td>
                  ))}
                </tr>
              ))}
          </tbody>
        </table>
      </div>

      {/* Mobile card view */}
      <div className="relative min-h-[250px] space-y-3 p-3 md:hidden">
        {loading && (
          <div className="px-4 py-8 text-center text-sm text-slate-500 dark:text-slate-400">
            Loading…
          </div>
        )}

        {!loading && (!sortedRows || sortedRows.length === 0) && (
          <div className="px-4 py-8 text-center text-sm text-slate-500 dark:text-slate-400">
            {emptyMessage}
          </div>
        )}

        {!loading &&
          sortedRows?.map((row) => {
            const actionCol = columns.find((c) => c.key === 'actions')
            return (
              <div
                key={row[rowKey]}
                className="space-y-2.5 rounded-2xl border border-slate-200/70 bg-white/80 p-4 shadow-[inset_0_1px_0_rgb(255_255_255/0.8),0_8px_20px_-6px_rgb(0_0_0/0.05)] backdrop-blur-xl transition-all dark:border-white/10 dark:bg-slate-900/60 dark:shadow-[inset_0_1px_0_rgb(255_255_255/0.08)]"
              >
                {columns
                  .filter((col) => col.key !== 'actions')
                  .map((col) => (
                    <div key={col.key} className="flex items-center justify-between gap-3 text-sm">
                      <span className="shrink-0 font-semibold text-slate-600 dark:text-slate-400">
                        {col.label}:
                      </span>
                      <span className="max-w-[60%] truncate text-right text-slate-800 dark:text-slate-200">
                        {col.render ? col.render(row) : row[col.key] || '-'}
                      </span>
                    </div>
                  ))}

                {actionCol && (
                  <div className="mt-1 flex justify-center border-t border-slate-200/70 pt-2.5 dark:border-white/10">
                    {actionCol.mobileRender ? actionCol.mobileRender(row) : actionCol.render(row)}
                  </div>
                )}
              </div>
            )
          })}
      </div>
    </div>
  )
}

function SortIcon({ direction, ...props }) {
  // Arrows use currentColor, so they follow the header text color in every theme.
  const upOpacity = direction === 'asc' ? 1 : direction ? 0.35 : 0.6
  const downOpacity = direction === 'desc' ? 1 : direction ? 0.35 : 0.6

  return (
    <svg viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.5" {...props}>
      <path d="M3 5l3-3 3 3" opacity={upOpacity} />
      <path d="M3 7l3 3 3-3" opacity={downOpacity} />
    </svg>
  )
}
