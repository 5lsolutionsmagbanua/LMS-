import { useState } from 'react'
import Button from '@/components/ui/Button'

const inputClass =
  'w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#E31837]/25 focus:border-[#E31837] transition-all'

const labelClass = 'block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1'

export default function BranchForm({ initialData = {}, onSubmit, onCancel, loading = false }) {
  const [formData, setFormData] = useState({
    id: initialData?.id ?? initialData?.mb_id ?? '',
    branch_name: initialData?.branch_name ?? initialData?.name ?? '',
    company_name: initialData?.company_name ?? initialData?.mb_company_name ?? '',
    address: initialData?.address ?? initialData?.mb_address ?? '',
    email: initialData?.email ?? initialData?.mb_email ?? '',
    contact_number: initialData?.contact_number ?? initialData?.mb_contact_number ?? '',
  })

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    onSubmit(formData)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6" noValidate>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label htmlFor="branch_name" className={labelClass}>
            Branch Name <span className="text-[#E31837]">*</span>
          </label>
          <input
            id="branch_name"
            type="text"
            name="branch_name"
            value={formData.branch_name}
            onChange={handleChange}
            required
            placeholder="Enter Branch"
            className={inputClass}
          />
        </div>
        <div>
          <label htmlFor="company_name" className={labelClass}>
            Company Name
          </label>
          <input
            id="company_name"
            type="text"
            name="company_name"
            value={formData.company_name}
            onChange={handleChange}
            placeholder="Enter Company Name"
            className={inputClass}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label htmlFor="email" className={labelClass}>
            Email
          </label>
          <input
            id="email"
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            placeholder="Enter e-mail"
            className={inputClass}
          />
        </div>
        <div>
          <label htmlFor="contact_number" className={labelClass}>
            Contact Number
          </label>
          <input
            id="contact_number"
            type="text"
            name="contact_number"
            value={formData.contact_number}
            onChange={handleChange}
            placeholder="Enter Contact Number"
            className={inputClass}
          />
        </div>
        <div className="sm:col-span-2">
          <label htmlFor="address" className={labelClass}>
            Address
          </label>
          <textarea
            id="address"
            name="address"
            value={formData.address}
            onChange={handleChange}
            rows="3"
            placeholder="Enter complete branch address..."
            className={inputClass}
          />
        </div>
      </div>

      <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
        {onCancel && (
          <Button type="button" variant="secondary" onClick={onCancel} disabled={loading}>
            Cancel
          </Button>
        )}
        <Button type="submit" variant="primary" loading={loading} className="min-w-[120px]">
          {formData.id ? 'Save Changes' : 'Create Branch'}
        </Button>
      </div>
    </form>
  )
}
