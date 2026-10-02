import { useState } from 'react'
import Button from '@/components/ui/Button'
import Alert from '@/components/ui/Alert'
import { useUpsertStore } from '@/hooks/useMasterStores'

const REQUIRED_FIELDS = ['store_name', 'store_code']

const inputClass =
  'w-full rounded-lg border border-slate-300 px-3.5 py-2.5 text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#E31837] focus:border-transparent transition-shadow'

const labelClass = 'block text-xs font-semibold uppercase tracking-wide text-slate-500 mb-1.5'

export default function StoreEditForm({ store, onSuccess }) {
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
        <section>
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">
            Store Information
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label htmlFor="store_name" className={labelClass}>
                Store Name <span className="text-[#E31837]">*</span>
              </label>
              <input
                id="store_name"
                type="text"
                value={form.store_name}
                onChange={handleChange('store_name')}
                className={inputClass}
                placeholder="e.g. Downtown Warehouse"
              />
            </div>
            <div>
              <label htmlFor="store_code" className={labelClass}>
                Store Code <span className="text-[#E31837]">*</span>
              </label>
              <input
                id="store_code"
                type="text"
                value={form.store_code}
                onChange={handleChange('store_code')}
                className={inputClass}
                placeholder="e.g. STR-001"
              />
            </div>
            <div>
              <label htmlFor="is_active" className={labelClass}>
                Status
              </label>
              <select
                id="is_active"
                value={form.is_active}
                onChange={handleChange('is_active')}
                className={inputClass}
              >
                <option value={1}>Active</option>
                <option value={0}>Inactive</option>
              </select>
            </div>
          </div>
        </section>

        <hr className="border-slate-100" />

        <section>
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">
            Contact Details
          </h3>
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
                className={inputClass}
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
                className={inputClass}
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
                className={inputClass}
                placeholder="Enter complete store address..."
              />
            </div>
          </div>
        </section>

        <Button type="submit" loading={upsertStore.isPending} className="w-full">
          Save changes
        </Button>
      </form>
    </div>
  )
}
