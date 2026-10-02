// routes/_authenticated/authenticated/developer/pending-requests/pendingRequestsForm/-RequestItemRow.jsx
/**
 * One line item within the request. Serialized items (individually tracked
 * assets) ask for a serial number and lock quantity to 1; bulk stock asks
 * for a quantity instead — mirrors pending_request_item's columns exactly
 * (pri_stockId, pri_isSerialized, pri_stockQty, pri_assetTag, pri_serialNumber).
 */
export default function RequestItemRow({
  index,
  item,
  stockOptions,
  errors = {},
  onChange,
  onRemove,
}) {
  const set = (field) => (e) => {
    const value = e.target.type === 'checkbox' ? e.target.checked : e.target.value
    onChange(field, value)
  }

  const handleSerializedToggle = (e) => {
    const checked = e.target.checked
    onChange('isSerialized', checked)
    if (checked) {
      onChange('stockQty', 1)
    } else {
      onChange('serialNumber', '')
    }
  }

  return (
    <div className="rounded-2xl border border-slate-200/80 bg-white shadow-2xs overflow-hidden transition-all">
      <div className="flex items-center justify-between border-b border-slate-100 bg-slate-50/50 px-4 py-2.5">
        <div className="flex items-center gap-2.5">
          <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary/10 text-xs font-semibold text-primary">
            {index + 1}
          </span>
          <label className="flex items-center gap-2 text-xs font-semibold text-slate-600 cursor-pointer">
            <input
              type="checkbox"
              checked={item.isSerialized}
              onChange={handleSerializedToggle}
              className="h-4 w-4 rounded border-slate-300 text-primary focus:ring-primary/20 accent-primary"
            />
            Serialized item
            {item.isSerialized && (
              <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-semibold bg-purple-50 text-purple-700 border border-purple-100">
                Tracked by serial
              </span>
            )}
          </label>
        </div>
        <button
          type="button"
          onClick={onRemove}
          className="text-xs font-semibold text-slate-400 transition-colors hover:text-rose-600 cursor-pointer"
        >
          Remove
        </button>
      </div>

      <div className="grid grid-cols-1 gap-4 p-4 sm:grid-cols-12">
        <div className="sm:col-span-5">
          <label className={labelClass}>
            Stock item <span className="text-rose-500">*</span>
          </label>
          {stockOptions?.length ? (
            <select
              value={item.stockId}
              onChange={set('stockId')}
              className={inputClass(errors.stockId)}
            >
              <option value="">Select stock…</option>
              {stockOptions.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          ) : (
            <input
              type="text"
              value={item.stockId}
              onChange={set('stockId')}
              placeholder="Stock ID or SKU"
              className={inputClass(errors.stockId)}
            />
          )}
          {errors.stockId && (
            <p className="mt-1 text-xs font-medium text-rose-600">{errors.stockId}</p>
          )}
        </div>

        <div className="sm:col-span-3">
          <label className={labelClass}>Asset tag</label>
          <input
            type="text"
            value={item.assetTag || ''}
            onChange={set('assetTag')}
            placeholder="AT-0001"
            className={inputClass(errors.assetTag)}
          />
          {errors.assetTag && (
            <p className="mt-1 text-xs font-medium text-rose-600">{errors.assetTag}</p>
          )}
        </div>

        {item.isSerialized ? (
          <div className="sm:col-span-4">
            <label className={labelClass}>
              Serial number <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              value={item.serialNumber || ''}
              onChange={set('serialNumber')}
              placeholder="SN-ABC123"
              className={inputClass(errors.serialNumber)}
            />
            {errors.serialNumber && (
              <p className="mt-1 text-xs font-medium text-rose-600">{errors.serialNumber}</p>
            )}
          </div>
        ) : (
          <div className="sm:col-span-4">
            <label className={labelClass}>
              Quantity <span className="text-rose-500">*</span>
            </label>
            <input
              type="number"
              min="1"
              value={item.stockQty ?? 1}
              onChange={set('stockQty')}
              className={inputClass(errors.stockQty)}
            />
            {errors.stockQty && (
              <p className="mt-1 text-xs font-medium text-rose-600">{errors.stockQty}</p>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

const labelClass =
  'mb-1.5 flex items-baseline gap-1 text-xs font-semibold uppercase tracking-wide text-slate-600'

const inputClass = (error) =>
  `w-full rounded-xl border bg-white px-3.5 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all shadow-2xs ${
    error ? 'border-rose-500 bg-rose-50/10' : 'border-slate-200/90'
  }`
