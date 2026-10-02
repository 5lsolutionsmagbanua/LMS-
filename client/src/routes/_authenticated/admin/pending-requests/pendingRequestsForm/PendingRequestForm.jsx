import { useMemo, useState } from 'react'
import { useMasterBranches } from '@/hooks/useMasterBranches'
import { useMasterStores } from '@/hooks/useMasterStores'
import { useCreatePendingRequest } from '@/hooks/usePendingRequestWithItems'
import {
  REQUEST_STATUSES,
  REQUEST_TYPES,
  DEFAULT_STATUS,
  emptyItem,
} from '@/constants/pendingRequest'
import RequestItemRow from './RequestItemRow'
import Alert from '@/components/ui/Alert'
import Button from '@/components/ui/Button'

const initialForm = {
  ticketNumber: '',
  branchId: '',
  storeId: '',
  requestType: '',
  status: DEFAULT_STATUS,
  notes: '',
}

export default function PendingRequestForm({ onCreated }) {
  const [form, setForm] = useState(initialForm)
  const [items, setItems] = useState([])
  const [errors, setErrors] = useState({})

  const { data: rawBranches, isLoading: branchesLoading } = useMasterBranches()
  const { data: rawStores, isLoading: storesLoading } = useMasterStores()
  const createRequest = useCreatePendingRequest()

  const branches = rawBranches ?? []
  const stores = rawStores ?? []

  const setField = (field) => (e) => setForm((f) => ({ ...f, [field]: e.target.value }))

  const addItem = () => setItems((prev) => [...prev, emptyItem()])
  const removeItem = (key) => setItems((prev) => prev.filter((it) => it._key !== key))
  const updateItem = (key, field, value) =>
    setItems((prev) => prev.map((it) => (it._key === key ? { ...it, [field]: value } : it)))

  const itemErrors = useMemo(() => {
    const map = {}
    items.forEach((item) => {
      const e = {}
      if (!item.stockId) e.stockId = 'Required'
      if (item.isSerialized && !item.serialNumber) e.serialNumber = 'Required for serialized items'
      if (!item.isSerialized && (!item.stockQty || item.stockQty < 1))
        e.stockQty = 'Enter a quantity of at least 1'
      if (Object.keys(e).length) map[item._key] = e
    })
    return map
  }, [items])

  const validate = () => {
    const next = {}
    if (!form.branchId) next.branchId = 'Required'
    if (!form.requestType) next.requestType = 'Required'
    if (items.length === 0) next.items = 'Add at least one item'
    setErrors(next)
    return Object.keys(next).length === 0 && Object.keys(itemErrors).length === 0
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!validate()) return

    const payload = { ...form, items: items.map(({ _key, ...item }) => item) }

    createRequest.mutate(payload, {
      onSuccess: () => {
        setForm(initialForm)
        setItems([])
        if (onCreated) {
          onCreated()
        }
      },
    })
  }

  return (
    <form onSubmit={handleSubmit} className="w-full space-y-6 pb-2">
      {createRequest.isError && (
        <Alert variant="error" title="Request Failed" onDismiss={() => createRequest.reset()}>
          {createRequest.error?.response?.data?.message || 'Something went wrong'}
        </Alert>
      )}

      {/* Request Details Section Card (Wider 3-Column Layout) */}
      <div className="bg-slate-50/60 border border-slate-200/80 rounded-2xl p-5 sm:p-6 shadow-2xs space-y-4">
        <div className="flex items-center justify-between border-b border-slate-200/60 pb-3">
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-500">
            Request Information
          </h2>
          <span className="text-[11px] font-medium text-slate-400 bg-slate-200/50 px-2 py-0.5 rounded-md">
            Required fields marked with *
          </span>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <Field label="Ticket number">
            <input
              type="text"
              value={form.ticketNumber}
              onChange={setField('ticketNumber')}
              placeholder="Enter Ticket Number"
              className={inputClass()}
            />
          </Field>

          <Field label="Branch" required error={errors.branchId}>
            <select
              value={form.branchId}
              onChange={setField('branchId')}
              className={inputClass(errors.branchId)}
              disabled={branchesLoading}
            >
              <option value="">{branchesLoading ? 'Loading…' : 'Select branch…'}</option>
              {branches.map((b) => (
                <option key={b.id ?? b.mb_id} value={b.id ?? b.mb_id}>
                  {b.branch_name ?? b.mb_branch_name ?? b.name}
                </option>
              ))}
            </select>
          </Field>

          <Field label="Store">
            <select
              value={form.storeId}
              onChange={setField('storeId')}
              className={inputClass()}
              disabled={storesLoading}
            >
              <option value="">{storesLoading ? 'Loading…' : 'Select store…'}</option>
              {stores.map((s) => (
                <option key={s.id ?? s.ms_id} value={s.id ?? s.ms_id}>
                  {s.store_name ?? s.ms_store_name}
                </option>
              ))}
            </select>
          </Field>

          <Field label="Request type" required error={errors.requestType}>
            <select
              value={form.requestType}
              onChange={setField('requestType')}
              className={inputClass(errors.requestType)}
            >
              <option value="">Select type…</option>
              {REQUEST_TYPES.map((t) => (
                <option key={t.value} value={t.value}>
                  {t.label}
                </option>
              ))}
            </select>
          </Field>

          <Field label="Initial Status">
            <select value={form.status} onChange={setField('status')} className={inputClass()}>
              {REQUEST_STATUSES.map((s) => (
                <option key={s.value} value={s.value}>
                  {s.label}
                </option>
              ))}
            </select>
          </Field>

          <Field label="Notes" className="sm:col-span-3">
            <textarea
              value={form.notes}
              onChange={setField('notes')}
              rows={2}
              placeholder="Add any extra context or instructions..."
              className={inputClass() + ' resize-none'}
            />
          </Field>
        </div>
      </div>

      {/* Items Section Container */}
      <div className="bg-slate-50/60 border border-slate-200/80 rounded-2xl p-5 sm:p-6 shadow-2xs space-y-4">
        <div className="flex items-center justify-between border-b border-slate-200/60 pb-3">
          <div className="flex items-center gap-2">
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Request Items
            </h2>
            <span className="bg-primary/10 text-primary px-2 py-0.5 rounded-full text-xs font-bold">
              {items.length}
            </span>
          </div>
          <button
            type="button"
            onClick={addItem}
            className="inline-flex items-center gap-1 text-xs font-semibold bg-white text-primary border border-slate-200 hover:bg-slate-50 px-3 py-1.5 rounded-xl shadow-2xs transition-all cursor-pointer"
          >
            <span className="text-sm font-bold leading-none">+</span> Add Item
          </button>
        </div>

        {items.length === 0 ? (
          <div className="rounded-xl border border-dashed border-slate-300 bg-white/80 px-4 py-8 text-center">
            <p className="text-sm text-slate-500 font-medium">
              No items added to this request yet.
            </p>
            <p className="text-xs text-slate-400 mt-0.5">
              Click &quot;+ Add Item&quot; above to begin building lines.
            </p>
            {errors.items && (
              <p className="mt-2 text-xs font-semibold text-rose-600">{errors.items}</p>
            )}
          </div>
        ) : (
          <div className="space-y-3">
            {items.map((item, index) => (
              <RequestItemRow
                key={item._key}
                index={index}
                item={item}
                errors={itemErrors[item._key] ?? {}}
                onChange={(field, value) => updateItem(item._key, field, value)}
                onRemove={() => removeItem(item._key)}
              />
            ))}
          </div>
        )}
      </div>

      {/* Action Footer */}
      <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-200/80">
        <Button
          type="submit"
          loading={createRequest.isPending}
          className="w-full sm:w-auto bg-primary text-white font-semibold px-6 py-2.5 rounded-xl shadow-sm hover:opacity-95"
        >
          Submit Request
        </Button>
      </div>
    </form>
  )
}

const Field = ({ label, required, error, className = '', children }) => (
  <div className={className}>
    <label className="mb-1.5 flex items-baseline gap-1 text-xs font-semibold uppercase tracking-wide text-slate-600">
      {label}
      {required && <span className="text-rose-500">*</span>}
    </label>
    {children}
    {error && <p className="mt-1.5 text-xs font-medium text-rose-600">{error}</p>}
  </div>
)

const inputClass = (error) =>
  `w-full rounded-xl border bg-white px-3.5 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all shadow-2xs ${
    error ? 'border-rose-500 bg-rose-50/10' : 'border-slate-200/90'
  }`
