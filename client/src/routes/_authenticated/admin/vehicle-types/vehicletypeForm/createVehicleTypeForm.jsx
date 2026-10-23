// client/src/components/vehicleTypes/CreateVehicleTypeForm.jsx
import { useState } from 'react'
import Button from '@/components/ui/Button'
import Alert from '@/components/ui/Alert'
import { useCreateVehicleType } from '@/hooks/useVehicleTypes'

const EMPTY_FORM = {
  name: '',
  description: '',
  is_active: 1,
}

const inputClass =
  'w-full rounded-xl border border-slate-200/90 bg-white px-3.5 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 ' +
  'focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all shadow-2xs ' +
  'dark:bg-slate-900/50 dark:text-slate-100 dark:border-white/10 dark:placeholder:text-slate-500 ' +
  'dark:[&>option]:bg-slate-900 dark:[&>option]:text-white'

const labelClass =
  'mb-1.5 block text-xs font-semibold uppercase tracking-wide text-slate-600 dark:text-slate-400'

const sectionTitleClass = 'text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400'

export default function CreateVehicleTypeForm({ onSuccess }) {
  const [form, setForm] = useState(EMPTY_FORM)
  const [validationError, setValidationError] = useState(null)
  const createMutation = useCreateVehicleType()

  const handleChange = (field) => (e) => {
    const value = field === 'is_active' ? parseInt(e.target.value, 10) : e.target.value
    setForm((prev) => ({ ...prev, [field]: value }))
    if (validationError) setValidationError(null)
  }

  const handleSubmit = (e) => {
    e.preventDefault()

    if (!form.name?.toString().trim()) {
      setValidationError('Please fill out the required field (Type Name).')
      return
    }
    setValidationError(null)

    createMutation.mutate(form, {
      onSuccess: () => {
        setForm(EMPTY_FORM)
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

      {createMutation.isError && (
        <Alert variant="error" title="Operation Failed" onDismiss={() => createMutation.reset()}>
          {createMutation.error?.response?.data?.message ||
            'Something went wrong creating the vehicle type.'}
        </Alert>
      )}

      {createMutation.isSuccess && (
        <Alert variant="success" title="Success" onDismiss={() => createMutation.reset()}>
          Vehicle type created successfully.
        </Alert>
      )}

      <form onSubmit={handleSubmit} className="space-y-6" noValidate>
        {/* Type Information Card */}
        <div className="bg-slate-50/60 dark:bg-slate-900/40 border border-slate-200/80 dark:border-white/10 rounded-2xl p-5 sm:p-6 shadow-2xs space-y-4 backdrop-blur-sm">
          <div className="flex items-center justify-between border-b border-slate-200/60 dark:border-white/10 pb-3">
            <h3 className={sectionTitleClass}>Vehicle Type Information</h3>
            <span className="text-[11px] font-medium text-slate-400 dark:text-slate-500 bg-slate-200/50 dark:bg-white/5 px-2 py-0.5 rounded-md">
              Required fields marked with *
            </span>
          </div>

          <div className="grid grid-cols-1 gap-4">
            <div>
              <label htmlFor="name" className={labelClass}>
                Type Name <span className="text-rose-500">*</span>
              </label>
              <input
                id="name"
                type="text"
                value={form.name}
                onChange={handleChange('name')}
                className={inputClass}
                placeholder="Enter Vehicle Type Name"
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
                placeholder="Enter description..."
              />
            </div>
          </div>
        </div>

        <div className="flex items-center justify-end pt-2">
          <Button
            type="submit"
            variant="liquid"
            loading={createMutation.isPending}
            className="w-full sm:w-auto min-w-[140px]"
          >
            Create vehicle type
          </Button>
        </div>
      </form>
    </div>
  )
}