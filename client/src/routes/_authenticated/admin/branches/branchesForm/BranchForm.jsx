// client/src/pages/.../branchesForm/BranchForm.jsx
import { useState } from 'react'
import Button from '@/components/ui/Button'

const inputClass = (error) =>
  `w-full rounded-xl border bg-white px-3.5 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all shadow-2xs dark:bg-slate-900/50 dark:text-slate-100 dark:border-white/10 dark:placeholder:text-slate-500 ${
    error ? 'border-rose-500 bg-rose-50/10 dark:bg-rose-950/20' : 'border-slate-200/90'
  }`

export default function BranchForm({ initialData = {}, onSubmit, onCancel, loading = false }) {
  const [formData, setFormData] = useState({
    id: initialData?.id ?? initialData?.mb_id ?? '',
    branch_name: initialData?.branch_name ?? initialData?.name ?? '',
    company_name: initialData?.company_name ?? initialData?.mb_company_name ?? '',
    address: initialData?.address ?? initialData?.mb_address ?? '',
    email: initialData?.email ?? initialData?.mb_email ?? '',
    contact_number: initialData?.contact_number ?? initialData?.mb_contact_number ?? '',
  })

  const [errors, setErrors] = useState({})

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: null }))
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!formData.branch_name?.trim()) {
      setErrors({ branch_name: 'Branch Name is required' })
      return
    }
    onSubmit(formData)
  }

  return (
    <form onSubmit={handleSubmit} className="w-full space-y-6 pb-2" noValidate>
      {/* Form Card Container */}
      <div className="bg-slate-50/60 dark:bg-slate-900/40 border border-slate-200/80 dark:border-white/10 rounded-2xl p-5 sm:p-6 shadow-2xs space-y-4 backdrop-blur-sm">
        <div className="flex items-center justify-between border-b border-slate-200/60 dark:border-white/10 pb-3">
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            Branch Information
          </h2>
          <span className="text-[11px] font-medium text-slate-400 dark:text-slate-500 bg-slate-200/50 dark:bg-white/5 px-2 py-0.5 rounded-md">
            Required fields marked with *
          </span>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Field label="Branch Name" required error={errors.branch_name}>
            <input
              id="branch_name"
              type="text"
              name="branch_name"
              value={formData.branch_name}
              onChange={handleChange}
              placeholder="Enter Branch Name"
              className={inputClass(errors.branch_name)}
            />
          </Field>

          <Field label="Company Name">
            <input
              id="company_name"
              type="text"
              name="company_name"
              value={formData.company_name}
              onChange={handleChange}
              placeholder="Enter Company Name"
              className={inputClass()}
            />
          </Field>

          <Field label="Email">
            <input
              id="email"
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="Enter e-mail"
              className={inputClass()}
            />
          </Field>

          <Field label="Contact Number">
            <input
              id="contact_number"
              type="text"
              name="contact_number"
              value={formData.contact_number}
              onChange={handleChange}
              placeholder="Enter Contact Number"
              className={inputClass()}
            />
          </Field>

          <Field label="Address" className="sm:col-span-2">
            <textarea
              id="address"
              name="address"
              value={formData.address}
              onChange={handleChange}
              rows="3"
              placeholder="Enter complete branch address..."
              className={inputClass() + ' resize-none'}
            />
          </Field>
        </div>
      </div>

      {/* Action Footer */}
      <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-200/80 dark:border-white/10">
        {onCancel && (
          <Button type="button" variant="secondary" onClick={onCancel} disabled={loading}>
            Cancel
          </Button>
        )}
        <Button type="submit" variant="liquid" loading={loading} className="min-w-[120px]">
          {formData.id ? 'Save Changes' : 'Create Branch'}
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
    {error && <p className="mt-1.5 text-xs font-medium text-rose-600">{error}</p>}
  </div>
)