import { useState, useEffect } from 'react'
import Button from '@/components/ui/Button'
import Alert from '@/components/ui/Alert'
import { useUpdateVehicleType } from '@/hooks/useVehicleTypes'

const inputClass =
  'w-full rounded-xl border border-slate-200/80 bg-white px-3.5 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent shadow-2xs transition-all duration-200'

const labelClass = 'block text-xs font-semibold uppercase tracking-wide text-slate-500 mb-1.5'

export default function EditVehicleTypeForm({ vehicleType, onSuccess }) {
  const getInitialStatus = (val) => {
    if (val === true || val === 1 || val === '1') return 1
    if (val === false || val === 0 || val === '0') return 0
    return 1
  }

  const [form, setForm] = useState({
    id: vehicleType?.id ?? vehicleType?.vt_id ?? '',
    name: vehicleType?.name ?? vehicleType?.vt_name ?? '',
    description: vehicleType?.description ?? vehicleType?.vt_description ?? '',
    is_active: getInitialStatus(vehicleType?.is_active ?? vehicleType?.vt_isActive),
  })

  useEffect(() => {
    if (vehicleType) {
      setForm({
        id: vehicleType.id ?? vehicleType.vt_id ?? '',
        name: vehicleType.name ?? vehicleType.vt_name ?? '',
        description: vehicleType.description ?? vehicleType.vt_description ?? '',
        is_active: getInitialStatus(vehicleType.is_active ?? vehicleType.vt_isActive),
      })
    }
  }, [vehicleType])

  const [validationError, setValidationError] = useState(null)
  const updateMutation = useUpdateVehicleType()

  const handleChange = (field) => (e) => {
    let value = e.target.value
    if (field === 'is_active') {
      value = Number(value)
    }
    setForm((prev) => ({ ...prev, [field]: value }))
  }

  const handleSubmit = (e) => {
    e.preventDefault()

    if (!form.name?.toString().trim()) {
      setValidationError('Please fill out the required field (Type Name).')
      return
    }
    setValidationError(null)

    // Ensure the payload matches what your backend API expects (e.g., id + fields)
    updateMutation.mutate(form, {
      onSuccess: () => {
        onSuccess?.()
      },
    })
  }

  return (
    <div className="w-full">
      {validationError && (
        <Alert
          variant="warning"
          title="Validation Error"
          onDismiss={() => setValidationError(null)}
          className="mb-4"
        >
          {validationError}
        </Alert>
      )}

      {updateMutation.isError && (
        <Alert variant="error" onDismiss={() => updateMutation.reset()} className="mb-4">
          {updateMutation.error?.response?.data?.message ||
            'Something went wrong updating the vehicle type.'}
        </Alert>
      )}

      <form onSubmit={handleSubmit} className="space-y-6" noValidate>
        <div className="grid grid-cols-1 gap-4">
          <div>
            <label htmlFor="name" className={labelClass}>
              Type Name <span className="text-[#E31837]">*</span>
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
            <label htmlFor="description" className={labelClass}>
              Description
            </label>
            <textarea
              id="description"
              rows="3"
              value={form.description}
              onChange={handleChange('description')}
              className={inputClass}
              placeholder="Enter description"
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

        <div className="pt-2 flex justify-end gap-3">
          <Button
            type="submit"
            loading={updateMutation.isPending}
            className="w-full sm:w-auto px-6"
          >
            Save changes
          </Button>
        </div>
      </form>
    </div>
  )
}
