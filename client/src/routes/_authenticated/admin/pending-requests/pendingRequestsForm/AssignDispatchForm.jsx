// client/src/routes/_authenticated/admin/pending-requests/pendingRequestsForm/AssignDispatchForm.jsx
import { useState } from 'react'
import { useMasterStores } from '@/hooks/useMasterStores'
import { useDispatchDrivers, useDispatchVehicles, useAssignDispatch } from '@/hooks/useDispatch'
import Alert from '@/components/ui/Alert'
import Button from '@/components/ui/Button'

/**
 * Assign a driver + vehicle + target store to an APPROVED request.
 */
export default function AssignDispatchForm({ request, dispatch, onAssigned, onCancel }) {
  const requestId = request.requestId
  const isReassign = Boolean(dispatch)

  const [form, setForm] = useState({
    driverId: dispatch?.driverId ?? '',
    vehicleId: dispatch?.vehicleId ?? '',
    storeId: dispatch?.targetStoreId ?? request.storeId ?? '',
    remarks: dispatch?.remarks ?? '',
  })
  const [errors, setErrors] = useState({})

  const { data: rawStores, isLoading: storesLoading } = useMasterStores()
  const { data: drivers = [], isLoading: driversLoading } = useDispatchDrivers(requestId)
  const { data: vehicles = [], isLoading: vehiclesLoading } = useDispatchVehicles(requestId)
  const assign = useAssignDispatch()

  const stores = rawStores ?? []

  const setField = (field) => (e) => setForm((f) => ({ ...f, [field]: e.target.value }))

  const validate = () => {
    const next = {}
    if (!form.driverId) next.driverId = 'Required'
    if (!form.vehicleId) next.vehicleId = 'Required'
    if (!form.storeId) next.storeId = 'Required'
    setErrors(next)
    return Object.keys(next).length === 0
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!validate()) return

    assign.mutate(
      {
        requestId,
        driverId: form.driverId,
        vehicleId: form.vehicleId,
        storeId: form.storeId,
        remarks: form.remarks.trim() || undefined,
      },
      { onSuccess: () => onAssigned?.(isReassign) },
    )
  }

  return (
    <form onSubmit={handleSubmit} className="w-full space-y-5 pb-2" noValidate>
      {assign.isError && (
        <Alert variant="error" title="Assignment Failed" onDismiss={() => assign.reset()}>
          {assign.error?.response?.data?.message || 'Something went wrong'}
        </Alert>
      )}

      {/* Request summary */}
      <div className="bg-slate-50/60 dark:bg-slate-900/40 border border-slate-200/80 dark:border-white/10 rounded-2xl p-4 space-y-1 shadow-2xs backdrop-blur-sm">
        <span className="text-xs font-semibold tracking-wider text-slate-400 dark:text-slate-500 uppercase">
          Approved Request
        </span>
        <p className="font-mono text-sm font-bold text-slate-900 dark:text-white">
          {request.requestId}
        </p>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          {request.ticketNumber ? `Ticket ${request.ticketNumber} · ` : ''}
          {request.branchName || '—'}
          {request.storeName ? ` → ${request.storeName}` : ''}
        </p>
      </div>

      <div className="bg-slate-50/60 dark:bg-slate-900/40 border border-slate-200/80 dark:border-white/10 rounded-2xl p-5 space-y-4 shadow-2xs backdrop-blur-sm">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Field label="Driver" required error={errors.driverId}>
            <select
              value={form.driverId}
              onChange={setField('driverId')}
              className={inputClass(errors.driverId)}
              disabled={driversLoading}
            >
              <option value="">{driversLoading ? 'Loading…' : 'Select driver…'}</option>
              {drivers.map((d) => (
                <option key={d.id} value={d.id} disabled={d.isBusy}>
                  {d.name}
                  {d.isBusy ? ' (on another dispatch)' : ''}
                </option>
              ))}
            </select>
          </Field>

          <Field label="Vehicle" required error={errors.vehicleId}>
            <select
              value={form.vehicleId}
              onChange={setField('vehicleId')}
              className={inputClass(errors.vehicleId)}
              disabled={vehiclesLoading}
            >
              <option value="">{vehiclesLoading ? 'Loading…' : 'Select vehicle…'}</option>
              {vehicles.map((v) => {
                const desc = [v.brand, v.model].filter(Boolean).join(' ')
                return (
                  <option key={v.id} value={v.id}>
                    {v.plateNumber}
                    {desc ? ` — ${desc}` : ''}
                  </option>
                )
              })}
            </select>
            {!vehiclesLoading && vehicles.length === 0 && (
              <p className="mt-1.5 text-xs font-medium text-amber-600 dark:text-amber-400">
                No available vehicles right now.
              </p>
            )}
          </Field>

          <Field label="Target Store" required error={errors.storeId} className="sm:col-span-2">
            <select
              value={form.storeId}
              onChange={setField('storeId')}
              className={inputClass(errors.storeId)}
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

          <Field label="Remarks" className="sm:col-span-2">
            <textarea
              value={form.remarks}
              onChange={setField('remarks')}
              rows={2}
              placeholder="Optional dispatch instructions..."
              className={`${inputClass()} resize-none`}
            />
          </Field>
        </div>

        <p className="text-[11px] text-slate-400 dark:text-slate-500">
          This dispatch will be recorded under your branch.
        </p>
      </div>

      <div className="flex justify-end gap-3 pt-4 border-t border-slate-200/80 dark:border-white/10">
        <Button type="button" variant="secondary" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" variant="liquid" loading={assign.isPending} className="min-w-[140px]">
          {isReassign ? 'Save Reassignment' : 'Assign'}
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
