// client/src/components/ui/Table.jsx
import { useMemo, useState } from 'react'

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
    <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden w-full transition-colors">
      {/* Desktop table container */}
      <div className="hidden md:block overflow-x-auto w-full min-h-[320px] flex flex-col justify-between">
        <table className="w-full text-sm border-separate border-spacing-0">
          <thead>
            <tr>
              {columns.map((col, index) => (
                <th
                  key={col.key}
                  onClick={col.sortable ? () => toggleSort(col.key) : undefined}
                  className={`bg-primary text-white text-left font-semibold uppercase text-xs tracking-wide px-4 py-3 whitespace-nowrap ${
                    index === 0 ? 'rounded-l-xl' : ''
                  } ${index === columns.length - 1 ? 'rounded-r-xl' : ''} ${
                    col.sortable ? 'cursor-pointer select-none hover:bg-primary-hover' : ''
                  } ${col.className || ''}`}
                >
                  <span className="inline-flex items-center gap-1">
                    {col.label}
                    {col.sortable && (
                      <SortIcon
                        direction={sortKey === col.key ? sortDir : null}
                        className="w-3 h-3 opacity-70"
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
                  className="px-4 py-16 text-center text-slate-400 dark:text-slate-500"
                >
                  Loading…
                </td>
              </tr>
            )}

            {!loading && (!sortedRows || sortedRows.length === 0) && (
              <tr>
                <td
                  colSpan={columns.length}
                  className="px-4 py-16 text-center text-slate-400 dark:text-slate-500"
                >
                  {emptyMessage}
                </td>
              </tr>
            )}

            {/* Standard Neutral Table Body Rows */}
            {!loading &&
              sortedRows?.map((row, i) => (
                <tr
                  key={row[rowKey]}
                  className={`border-b border-slate-100 dark:border-slate-800 last:border-0 hover:bg-slate-50 dark:hover:bg-slate-800/50 ${
                    i % 2 === 1 ? 'bg-slate-50/50 dark:bg-slate-800/30' : ''
                  }`}
                >
                  {columns.map((col) => (
                    <td
                      key={col.key}
                      className={`px-4 py-3.5 text-slate-700 dark:text-slate-300 ${col.className || ''}`}
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
      <div className="md:hidden p-3 space-y-3 min-h-[250px]">
        {loading && (
          <div className="px-4 py-8 text-center text-slate-400 dark:text-slate-500 text-sm">
            Loading…
          </div>
        )}

        {!loading && (!sortedRows || sortedRows.length === 0) && (
          <div className="px-4 py-8 text-center text-slate-400 dark:text-slate-500 text-sm">
            {emptyMessage}
          </div>
        )}

        {!loading &&
          sortedRows?.map((row) => {
            const actionCol = columns.find((c) => c.key === 'actions')
            return (
              <div
                key={row[rowKey]}
                className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-4 space-y-2.5 transition-colors"
              >
                {columns
                  .filter((col) => col.key !== 'actions')
                  .map((col) => (
                    <div key={col.key} className="flex items-center justify-between gap-3 text-sm">
                      <span className="text-slate-700 dark:text-slate-300 font-medium shrink-0">
                        {col.label}:
                      </span>
                      <span className="text-slate-600 dark:text-slate-400 text-right truncate max-w-[60%]">
                        {col.render ? col.render(row) : row[col.key] || '-'}
                      </span>
                    </div>
                  ))}

                {actionCol && (
                  <div className="pt-2.5 mt-1 border-t border-slate-100 dark:border-slate-800 flex justify-center">
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
  return (
    <svg viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.5" {...props}>
      <path
        d="M3 5l3-3 3 3M3 7l3 3 3-3"
        opacity={direction ? 1 : 0.5}
        stroke={direction === 'asc' ? 'white' : direction === 'desc' ? 'white' : 'currentColor'}
      />
    </svg>
  )
}
