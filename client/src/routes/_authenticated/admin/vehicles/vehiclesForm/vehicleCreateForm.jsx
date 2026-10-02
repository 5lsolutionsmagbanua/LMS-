import { useState } from 'react'
import Button from '@/components/ui/Button'
import Alert from '@/components/ui/Alert'
import { useUpsertVehicle } from '@/hooks/useMasterVehicles'
import { Upload, X } from 'lucide-react'

const REQUIRED_FIELDS = ['plate_number']

const inputClass = (error) =>
  `w-full rounded-xl border bg-white px-3.5 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all shadow-2xs ${
    error ? 'border-rose-500 bg-rose-50/10' : 'border-slate-200/90'
  }`

export default function VehicleCreateForm({ onSuccess }) {
  const [form, setForm] = useState({
    plate_number: '',
    vehicleImage: '',
    brand: '',
    model: '',
    capacity: '',
    color: '',
    fuel_type: '',
    odometer: '',
    file_number: '',
    or_number: '',
    cr_number: '',
    registration_expiry: '',
    remarks: '',
    status: 'Available',
  })

  const [errors, setErrors] = useState({})
  const [validationError, setValidationError] = useState(null)
  const upsertVehicle = useUpsertVehicle()

  const handleChange = (field) => (e) => {
    setForm((prev) => ({ ...prev, [field]: e.target.value }))
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: null }))
    }
  }

  // Handle image conversion to Base64
  const handleImageChange = (e) => {
    const file = e.target.files[0]
    if (!file) return

    const reader = new FileReader()
    reader.onloadend = () => {
      setForm((prev) => ({ ...prev, vehicleImage: reader.result }))
    }
    reader.readAsDataURL(file)
  }

  const handleRemoveImage = () => {
    setForm((prev) => ({ ...prev, vehicleImage: '' }))
  }

  const validate = () => {
    const next = {}
    REQUIRED_FIELDS.forEach((field) => {
      if (!form[field]?.toString().trim()) {
        next[field] = 'Required'
      }
    })
    setErrors(next)
    return Object.keys(next).length === 0
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!validate()) {
      setValidationError('Please fill out all required fields.')
      return
    }
    setValidationError(null)

    upsertVehicle.mutate(form, {
      onSuccess: () => {
        setTimeout(() => onSuccess?.(), 1000)
      },
    })
  }

  return (
    <form onSubmit={handleSubmit} className="w-full space-y-6 pb-2" noValidate>
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

      {upsertVehicle.isError && (
        <Alert
          variant="error"
          title="Operation Failed"
          onDismiss={() => upsertVehicle.reset()}
          className="mb-4"
        >
          {upsertVehicle.error?.response?.data?.message || 'Something went wrong'}
        </Alert>
      )}

      {upsertVehicle.isSuccess && (
        <Alert
          variant="success"
          title="Success"
          onDismiss={() => upsertVehicle.reset()}
          className="mb-4"
        >
          Vehicle created successfully.
        </Alert>
      )}

      {/* Vehicle Information Section */}
      <div className="bg-slate-50/60 border border-slate-200/80 rounded-2xl p-5 sm:p-6 shadow-2xs space-y-4">
        <div className="flex items-center justify-between border-b border-slate-200/60 pb-3">
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-500">
            Vehicle Information
          </h2>
          <span className="text-[11px] font-medium text-slate-400 bg-slate-200/50 px-2 py-0.5 rounded-md">
            Required fields marked with *
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field label="Plate Number" required error={errors.plate_number}>
            <input
              type="text"
              value={form.plate_number}
              onChange={handleChange('plate_number')}
              placeholder="Enter Plate Number"
              className={inputClass(errors.plate_number)}
            />
          </Field>

          <Field label="Brand">
            <input
              type="text"
              value={form.brand}
              onChange={handleChange('brand')}
              placeholder="e.g. Toyota"
              className={inputClass()}
            />
          </Field>

          <Field label="Model">
            <input
              type="text"
              value={form.model}
              onChange={handleChange('model')}
              placeholder="e.g. HiAce"
              className={inputClass()}
            />
          </Field>

          <Field label="Capacity">
            <input
              type="text"
              value={form.capacity}
              onChange={handleChange('capacity')}
              placeholder="Enter Capacity"
              className={inputClass()}
            />
          </Field>

          <Field label="Color">
            <input
              type="text"
              value={form.color}
              onChange={handleChange('color')}
              placeholder="Enter Color"
              className={inputClass()}
            />
          </Field>

          <Field label="Fuel Type">
            <input
              type="text"
              value={form.fuel_type}
              onChange={handleChange('fuel_type')}
              placeholder="Diesel / Gasoline"
              className={inputClass()}
            />
          </Field>

          <Field label="Odometer">
            <input
              type="number"
              value={form.odometer}
              onChange={handleChange('odometer')}
              placeholder="0"
              className={inputClass()}
            />
          </Field>

          <Field label="Status">
            <select value={form.status} onChange={handleChange('status')} className={inputClass()}>
              <option value="Available">Available</option>
              <option value="Assigned">Assigned</option>
              <option value="In Transit">In Transit</option>
              <option value="In Use">In Use</option>
              <option value="Maintenance">Maintenance</option>
              <option value="Out of Service">Out of Service</option>
              <option value="Inactive">Inactive</option>
            </select>
          </Field>

          {/* Vehicle Image Upload Section */}
          <div className="sm:col-span-2">
            <label className="mb-1.5 flex items-baseline gap-1 text-xs font-semibold uppercase tracking-wide text-slate-600">
              Vehicle Image
            </label>
            {form.vehicleImage ? (
              <div className="flex items-center gap-4 p-3 rounded-xl border border-slate-200 bg-white shadow-2xs">
                <img
                  src={form.vehicleImage}
                  alt="Vehicle preview"
                  className="w-16 h-16 object-cover rounded-lg border border-slate-200"
                />
                <div className="flex-1 truncate">
                  <p className="text-xs font-medium text-slate-700">Image loaded successfully</p>
                  <p className="text-[10px] text-slate-400 truncate">Base64 encoded string ready</p>
                </div>
                <button
                  type="button"
                  onClick={handleRemoveImage}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                  title="Remove Image"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-slate-300 rounded-xl cursor-pointer bg-white hover:bg-slate-50/50 transition-colors shadow-2xs">
                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                  <Upload className="w-6 h-6 text-slate-400 mb-2" />
                  <p className="text-xs text-slate-600 font-medium">
                    Click to upload vehicle image
                  </p>
                  <p className="text-[10px] text-slate-400 mt-0.5">PNG, JPG, or WEBP</p>
                </div>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="hidden"
                />
              </label>
            )}
          </div>
        </div>
      </div>

      {/* Registration & Documentation Section */}
      <div className="bg-slate-50/60 border border-slate-200/80 rounded-2xl p-5 sm:p-6 shadow-2xs space-y-4">
        <div className="flex items-center justify-between border-b border-slate-200/60 pb-3">
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-500">
            Registration & Documentation
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field label="File Number">
            <input
              type="text"
              value={form.file_number}
              onChange={handleChange('file_number')}
              placeholder="Enter File Number"
              className={inputClass()}
            />
          </Field>

          <Field label="OR Number">
            <input
              type="text"
              value={form.or_number}
              onChange={handleChange('or_number')}
              placeholder="Enter OR Number"
              className={inputClass()}
            />
          </Field>

          <Field label="CR Number">
            <input
              type="text"
              value={form.cr_number}
              onChange={handleChange('cr_number')}
              placeholder="Enter CR Number"
              className={inputClass()}
            />
          </Field>

          <Field label="Registration Expiry">
            <input
              type="date"
              value={form.registration_expiry}
              onChange={handleChange('registration_expiry')}
              className={inputClass()}
            />
          </Field>

          <Field label="Remarks" className="sm:col-span-2">
            <textarea
              rows={2}
              value={form.remarks}
              onChange={handleChange('remarks')}
              placeholder="Enter any additional notes..."
              className={inputClass() + ' resize-none'}
            />
          </Field>
        </div>
      </div>

      {/* Action Footer */}
      <div className="flex items-center justify-end gap-3 pt-2">
        <Button
          type="submit"
          loading={upsertVehicle.isPending}
          className="w-full sm:w-auto bg-primary text-white font-semibold px-6 py-2.5 rounded-xl shadow-sm hover:opacity-95"
        >
          Create Vehicle
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
