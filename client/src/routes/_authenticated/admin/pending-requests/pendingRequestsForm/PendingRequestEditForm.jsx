// client/src/routes/_authenticated/admin/pending-requests/pendingRequestsForm/PendingRequestEditForm.jsx
import { useMemo, useState, useEffect } from 'react'
import { useMasterBranches } from '@/hooks/useMasterBranches'
import { useMasterStores } from '@/hooks/useMasterStores'
import { useUpdatePendingRequest } from '@/hooks/usePendingRequestWithItems'
import { REQUEST_STATUSES, REQUEST_TYPES, emptyItem } from '@/constants/pendingRequest'
import RequestItemRow from './RequestItemRow'
import Alert from '@/components/ui/Alert'
import Button from '@/components/ui/Button'

export default function PendingRequestEditForm({ requestId, initialData, onUpdated }) {
  const [form, setForm] = useState({
    ticketNumber: '',
    branchId: '',
    storeId: '',
    requestType: '',
    status: '',
    notes: '',
  })
  const [items, setItems] = useState([])
  const [errors, setErrors] = useState({})

  const { data: rawBranches, isLoading: branchesLoading } = useMasterBranches()
  const { data: rawStores, isLoading: storesLoading } = useMasterStores()
  const updateRequest = useUpdatePendingRequest()

  const branches = rawBranches ?? []
  const stores = rawStores ?? []

  useEffect(() => {
    if (initialData) {
      setForm({
        ticketNumber: initialData.ticketNumber ?? initialData.ticket_number ?? '',
        branchId: initialData.branchId ?? initialData.branch_id ?? '',
        storeId: initialData.storeId ?? initialData.store_id ?? '',
        requestType: initialData.requestType ?? initialData.request_type ?? '',
        status: initialData.status ?? '',
        notes: initialData.notes ?? '',
      })

      const formattedItems = (initialData.items ?? []).map((item, idx) => ({
        ...item,
        _key: item._key || item.id || `item-${idx}-${Date.now()}`,
      }))
      setItems(formattedItems)
    }
  }, [initialData])

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

    const hasFormErrors = Object.keys(next).length > 0
    const hasItemErrors = Object.keys(itemErrors).length > 0

    return !hasFormErrors && !hasItemErrors
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!validate()) return

    const payload = {
      ...form,
      items: items.map(({ _key, ...item }) => item),
    }

    updateRequest.mutate(
      { id: requestId, ...payload },
      {
        onSuccess: () => {
          if (onUpdated) {
            onUpdated()
          }
        },
      },
    )
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="w-full space-y-6 text-slate-600 dark:text-slate-300 pb-2"
      noValidate
    >
      {updateRequest.isError && (
        <Alert variant="error" title="Update Failed" onDismiss={() => updateRequest.reset()}>
          {updateRequest.error?.response?.data?.message || 'Something went wrong'}
        </Alert>
      )}

      {/* Details Section Card */}
      <div className="bg-slate-50/60 dark:bg-slate-900/40 p-5 sm:p-6 rounded-2xl border border-slate-200/80 dark:border-white/10 shadow-2xs space-y-5 backdrop-blur-sm">
        <div className="border-b border-slate-200/60 dark:border-white/10 pb-3 flex items-center justify-between">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            Edit Request Details
          </h3>
          <span className="text-[11px] font-mono bg-white dark:bg-slate-800 px-2.5 py-1 rounded-md border border-slate-200 dark:border-white/10 text-slate-600 dark:text-slate-300 shadow-2xs">
            REQUEST ID: {requestId}
          </span>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Field label="Ticket Number">
            <input
              type="text"
              value={form.ticketNumber}
              onChange={setField('ticketNumber')}
              placeholder="Optional ticket reference"
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

          <Field label="Request Type" required error={errors.requestType}>
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

          <Field label="Status" className="lg:col-span-2">
            <select value={form.status} onChange={setField('status')} className={inputClass()}>
              {REQUEST_STATUSES.map((s) => (
                <option key={s.value} value={s.value}>
                  {s.label}
                </option>
              ))}
            </select>
          </Field>

          <Field label="Notes & Context" className="sm:col-span-2 lg:col-span-2">
            <textarea
              value={form.notes}
              onChange={setField('notes')}
              rows={1}
              placeholder="Add optional notes..."
              className={`${inputClass()} resize-none`}
            />
          </Field>
        </div>
      </div>

      {/* Line Items Section Card */}
      <div className="bg-slate-50/60 dark:bg-slate-900/40 p-5 sm:p-6 rounded-2xl border border-slate-200/80 dark:border-white/10 shadow-2xs space-y-4 backdrop-blur-sm">
        <div className="flex items-center justify-between border-b border-slate-200/60 dark:border-white/10 pb-3">
          <div className="flex items-center gap-2">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Request Line Items
            </h3>
            <span className="bg-primary/10 text-primary px-2 py-0.5 rounded-full text-xs font-bold">
              {items.length}
            </span>
          </div>
          <button
            type="button"
            onClick={addItem}
            className="inline-flex items-center gap-1 text-xs font-semibold bg-white dark:bg-slate-800 text-primary border border-slate-200 dark:border-white/10 hover:bg-slate-50 dark:hover:bg-slate-700 px-3 py-1.5 rounded-xl shadow-2xs transition-all cursor-pointer"
          >
            <span className="text-sm font-bold leading-none">+</span> Add Line Item
          </button>
        </div>

        {items.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-300 dark:border-white/15 bg-white/80 dark:bg-slate-900/40 px-4 py-8 text-center backdrop-blur-sm">
            <p className="text-sm font-medium text-slate-600 dark:text-slate-300">
              No items attached to this request yet.
            </p>
            <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">
              Click &quot;+ Add Line Item&quot; above to get started.
            </p>
            {errors.items && (
              <p className="mt-2 text-xs font-semibold text-rose-600 dark:text-rose-400">
                {errors.items}
              </p>
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

      {/* Form Footer Action */}
      <div className="flex justify-end gap-3 pt-4 border-t border-slate-200/80 dark:border-white/10">
        <Button
          type="submit"
          variant="liquid"
          loading={updateRequest.isPending}
          className="w-full sm:w-auto min-w-[140px]"
        >
          Save Changes
        </Button>
      </div>
    </form>
  )
}

const Field = ({ label, required, error, className = '', children }) => (
  <div className={className}>
    <label className="mb-1.5 flex items-baseline gap-1 text-xs font-semibold uppercase tracking-wide text-slate-600 dark:text-slate-400">
      {label}
      {required && <span className="text-rose-500">*</span>}
    </label>
    {children}
    {error && (
      <p className="mt-1.5 text-xs font-medium text-rose-600 dark:text-rose-400">{error}</p>
    )}
  </div>
)

const inputClass = (error) =>
  `w-full rounded-xl border bg-white px-3.5 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all shadow-2xs dark:bg-slate-900/50 dark:text-slate-100 dark:border-white/10 dark:placeholder:text-slate-500 dark:[&>option]:bg-slate-900 dark:[&>option]:text-white ${
    error ? 'border-rose-500 bg-rose-50/10 dark:bg-rose-950/20' : 'border-slate-200/90'
  }`
