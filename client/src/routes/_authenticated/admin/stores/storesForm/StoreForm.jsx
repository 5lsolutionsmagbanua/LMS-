// client/src/routes/_authenticated/admin/stores/storesForm/StoreForm.jsx
import { useState } from 'react'
import Button from '@/components/ui/Button'
import Alert from '@/components/ui/Alert'
import { useUpsertStore } from '@/hooks/useMasterStores'

const REQUIRED_FIELDS = ['store_name', 'store_code']

const inputClass = (error) =>
  `w-full rounded-xl border bg-white px-3.5 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all shadow-2xs dark:bg-slate-900/50 dark:text-slate-100 dark:border-white/10 dark:placeholder:text-slate-500 ${
    error ? 'border-rose-500 bg-rose-50/10 dark:bg-rose-950/20' : 'border-slate-200/90'
  }`

const labelClass = 'block text-xs font-semibold uppercase tracking-wide text-slate-600 dark:text-slate-400 mb-1.5'

export default function StoreForm({ store, onSuccess }) {
  const [form, setForm] = useState({
    id: store?.id ?? store?.ms_id ?? '',
    store_name: store?.store_name ?? store?.ms_store_name ?? '',
    store_code: store?.store_code ?? store?.ms_store_code ?? '',
    store_address: store?.store_address ?? store?.ms_store_address ?? '',
    contact_person: store?.contact_person ?? store?.ms_contact_person ?? '',
    contact_number: store?.contact_number ?? store?.ms_contact_number ?? '',
    is_active: store?.is_active !== undefined ? Number(store.is_active) : 1,
  })

  const [validationError, setValidationError] = useState(null)
  const upsertStore = useUpsertStore()

  const handleChange = (field) => (e) => {
    const value = field === 'is_active' ? parseInt(e.target.value, 10) : e.target.value
    setForm((prev) => ({ ...prev, [field]: value }))
    if (validationError) setValidationError(null)
  }

  const validate = () => {
    return REQUIRED_FIELDS.every((field) => form[field]?.toString().trim())
  }

  const handleSubmit = (e) => {
    e.preventDefault()

    if (!validate()) {
      setValidationError('Please fill out all required fields (Store Name and Code).')
      return
    }
    setValidationError(null)

    upsertStore.mutate(form, {
      onSuccess: () => {
        setTimeout(() => {
          onSuccess?.()
        }, 600)
      },
    })
  }

  return (
    <div className="w-full relative space-y-4">
      {validationError && (
        <Alert
          variant="warning"
          title="Validation Error"
          onDismiss={() => setValidationError(null)}
        >
          {validationError}
        </Alert>
      )}

      {upsertStore.isError && (
        <Alert variant="error" title="Update Failed" onDismiss={() => upsertStore.reset()}>
          {upsertStore.error?.response?.data?.message || 'Something went wrong saving the store.'}
        </Alert>
      )}

      <form onSubmit={handleSubmit} className="space-y-6" noValidate>
        {/* Store Information Container Card */}
        <div className="bg-slate-50/60 dark:bg-slate-900/40 border border-slate-200/80 dark:border-white/10 rounded-2xl p-5 sm:p-6 shadow-2xs space-y-4 backdrop-blur-sm">
          <div className="flex items-center justify-between border-b border-slate-200/60 dark:border-white/10 pb-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Store Information
            </h3>
            <span className="text-[11px] font-medium text-slate-400 dark:text-slate-500 bg-slate-200/50 dark:bg-white/5 px-2 py-0.5 rounded-md">
              Required fields marked with *
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label htmlFor="store_name" className={labelClass}>
                Store Name <span className="text-rose-500">*</span>
              </label>
              <input
                id="store_name"
                type="text"
                value={form.store_name}
                onChange={handleChange('store_name')}
                className={inputClass()}
                placeholder="e.g. Downtown Warehouse"
              />
            </div>
            <div>
              <label htmlFor="store_code" className={labelClass}>
                Store Code <span className="text-rose-500">*</span>
              </label>
              <input
                id="store_code"
                type="text"
                value={form.store_code}
                onChange={handleChange('store_code')}
                className={inputClass()}
                placeholder="e.g. STR-001"
              />
            </div>
            <div className="sm:col-span-2">
              <label htmlFor="is_active" className={labelClass}>
                Status
              </label>
              <select
                id="is_active"
                value={form.is_active}
                onChange={handleChange('is_active')}
                className={inputClass()}
              >
                <option value={1}>Active</option>
                <option value={0}>Inactive</option>
              </select>
            </div>
          </div>
        </div>

        {/* Contact Details Container Card */}
        <div className="bg-slate-50/60 dark:bg-slate-900/40 border border-slate-200/80 dark:border-white/10 rounded-2xl p-5 sm:p-6 shadow-2xs space-y-4 backdrop-blur-sm">
          <div className="border-b border-slate-200/60 dark:border-white/10 pb-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Contact Details
            </h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label htmlFor="contact_person" className={labelClass}>
                Contact Person
              </label>
              <input
                id="contact_person"
                type="text"
                value={form.contact_person}
                onChange={handleChange('contact_person')}
                className={inputClass()}
                placeholder="e.g. Jane Cruz"
              />
            </div>
            <div>
              <label htmlFor="contact_number" className={labelClass}>
                Contact Number
              </label>
              <input
                id="contact_number"
                type="text"
                value={form.contact_number}
                onChange={handleChange('contact_number')}
                className={inputClass()}
                placeholder="+63 900 000 0000"
              />
            </div>
            <div className="sm:col-span-2">
              <label htmlFor="store_address" className={labelClass}>
                Address
              </label>
              <textarea
                id="store_address"
                rows="3"
                value={form.store_address}
                onChange={handleChange('store_address')}
                className={inputClass() + ' resize-none'}
                placeholder="Enter complete store address..."
              />
            </div>
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 pt-2">
          <Button type="submit" variant="liquid" loading={upsertStore.isPending} className="w-full sm:w-auto min-w-[140px]">
            {form.id ? 'Save Changes' : 'Create Store'}
          </Button>
        </div>
      </form>
    </div>
  )
}