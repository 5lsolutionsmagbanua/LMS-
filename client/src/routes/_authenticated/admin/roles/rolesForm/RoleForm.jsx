// client/src/components/roles/RoleForm.jsx
import { useState } from 'react'
import Button from '../../../../../components/ui/Button'

const REQUIRED_FIELDS = ['role_name']

const inputClass =
  'w-full rounded-xl border border-slate-200/90 bg-white px-3.5 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 ' +
  'focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all shadow-2xs ' +
  'dark:bg-slate-900/50 dark:text-slate-100 dark:border-white/10 dark:placeholder:text-slate-500 ' +
  'dark:[&>option]:bg-slate-900 dark:[&>option]:text-white'

const labelClass =
  'mb-1.5 block text-xs font-semibold uppercase tracking-wide text-slate-600 dark:text-slate-400'

const sectionTitleClass =
  'text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400'

export default function RoleForm({ initialData = {}, onSuccess, onCancel, loading = false }) {
  const [form, setForm] = useState({
    id: initialData?.id ?? initialData?.role_id ?? '',
    role_name: initialData?.role_name ?? initialData?.name ?? '',
    description: initialData?.description ?? '',
    is_active: initialData?.is_active !== undefined ? Number(initialData.is_active) : 1,
  })

  const [validationError, setValidationError] = useState(null)
  const upsertRole = useUpsertRole()

  const isPending = loading || upsertRole.isPending

  const handleChange = (field) => (e) => {
    const value = field === 'is_active' ? parseInt(e.target.value, 10) : e.target.value
    setForm((prev) => ({ ...prev, [field]: value }))
    if (validationError) setValidationError(null)
  }

  const validate = () => {
    return !REQUIRED_FIELDS.some((field) => !form[field]?.toString().trim())
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!validate()) {
      setValidationError('Please fill out all required fields.')
      return
    }
    setValidationError(null)

    upsertRole.mutate(form, {
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

      {upsertRole.isError && (
        <Alert variant="error" title="Operation Failed" onDismiss={() => upsertRole.reset()}>
          {upsertRole.error?.response?.data?.message || 'Something went wrong'}
        </Alert>
      )}

      {upsertRole.isSuccess && (
        <Alert variant="success" title="Success" onDismiss={() => upsertRole.reset()}>
          Role saved successfully.
        </Alert>
      )}

      <form onSubmit={handleSubmit} className="space-y-6" noValidate>
        {/* Role Information Card */}
        <div className="bg-slate-50/60 dark:bg-slate-900/40 border border-slate-200/80 dark:border-white/10 rounded-2xl p-5 sm:p-6 shadow-2xs space-y-4 backdrop-blur-sm">
          <div className="flex items-center justify-between border-b border-slate-200/60 dark:border-white/10 pb-3">
            <h3 className={sectionTitleClass}>Role Information</h3>
            <span className="text-[11px] font-medium text-slate-400 dark:text-slate-500 bg-slate-200/50 dark:bg-white/5 px-2 py-0.5 rounded-md">
              Required fields marked with *
            </span>
          </div>

          <div className="space-y-4">
            <div>
              <label htmlFor="role_name" className={labelClass}>
                Role Name <span className="text-rose-500">*</span>
              </label>
              <input
                id="role_name"
                type="text"
                value={form.role_name}
                onChange={handleChange('role_name')}
                className={inputClass}
                placeholder="e.g. Store Manager"
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

            <div>
              <label htmlFor="description" className={labelClass}>
                Description
              </label>
              <textarea
                id="description"
                rows="3"
                value={form.description}
                onChange={handleChange('description')}
                className={inputClass + ' resize-none'}
                placeholder="Describe role responsibilities..."
              />
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-end gap-3 pt-2">
          {onCancel && (
            <Button type="button" variant="secondary" onClick={onCancel} disabled={isPending}>
              Cancel
            </Button>
          )}
          <Button type="submit" variant="liquid" loading={isPending} className="w-full sm:w-auto min-w-[140px]">
            {form.id ? 'Save Changes' : 'Create Role'}
          </Button>
        </div>
      </form>
    </div>
  )
}