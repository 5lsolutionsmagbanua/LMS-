import { useState } from 'react'
import Button from '@/components/ui/Button'
import Alert from '@/components/ui/Alert'
import { useUpsertVehicle } from '@/hooks/useMasterVehicles'
import { Upload, X } from 'lucide-react'

const REQUIRED_FIELDS = ['plate_number']

const inputClass =
  'w-full rounded-lg border border-slate-300 px-3.5 py-2.5 text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-shadow'

const labelClass = 'block text-xs font-semibold uppercase tracking-wide text-slate-500 mb-1.5'

export default function VehicleEditForm({ vehicle, onSuccess }) {
  const [form, setForm] = useState({
    id: vehicle?.id ?? vehicle?.vehicle_id ?? '',
    plate_number: vehicle?.plate_number ?? '',
    vehicleImage: vehicle?.vehicleImage ?? '',
    brand: vehicle?.brand ?? '',
    model: vehicle?.model ?? '',
    capacity: vehicle?.capacity ?? '',
    color: vehicle?.color ?? '',
    fuel_type: vehicle?.fuel_type ?? '',
    odometer: vehicle?.odometer ?? '',
    file_number: vehicle?.file_number ?? '',
    or_number: vehicle?.or_number ?? '',
    cr_number: vehicle?.cr_number ?? '',
    registration_expiry: vehicle?.registration_expiry
      ? vehicle.registration_expiry.split('T')[0]
      : '',
    remarks: vehicle?.remarks ?? '',
    status: vehicle?.status ?? 'Available',
  })

  const [validationError, setValidationError] = useState(null)
  const upsertVehicle = useUpsertVehicle()

  const handleChange = (field) => (e) => {
    setForm((prev) => ({ ...prev, [field]: e.target.value }))
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

  const validate = () => !REQUIRED_FIELDS.some((field) => !form[field]?.toString().trim())

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!validate()) {
      setValidationError('Please fill out all required fields (Plate Number).')
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
    <div className="w-full relative">
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
          Vehicle updated successfully.
        </Alert>
      )}

      <form onSubmit={handleSubmit} className="space-y-6" noValidate>
        {/* Vehicle Information */}
        <section>
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">
            Vehicle Information
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label htmlFor="plate_number" className={labelClass}>
                Plate Number <span className="text-primary">*</span>
              </label>
              <input
                id="plate_number"
                type="text"
                value={form.plate_number}
                onChange={handleChange('plate_number')}
                className={inputClass}
                placeholder="Enter Plate Number"
              />
            </div>

            <div>
              <label htmlFor="brand" className={labelClass}>
                Brand
              </label>
              <input
                id="brand"
                type="text"
                value={form.brand}
                onChange={handleChange('brand')}
                className={inputClass}
                placeholder="e.g. Toyota"
              />
            </div>

            <div>
              <label htmlFor="model" className={labelClass}>
                Model
              </label>
              <input
                id="model"
                type="text"
                value={form.model}
                onChange={handleChange('model')}
                className={inputClass}
                placeholder="e.g. HiAce"
              />
            </div>

            <div>
              <label htmlFor="capacity" className={labelClass}>
                Capacity
              </label>
              <input
                id="capacity"
                type="text"
                value={form.capacity}
                onChange={handleChange('capacity')}
                className={inputClass}
                placeholder="Enter Capacity"
              />
            </div>

            <div>
              <label htmlFor="color" className={labelClass}>
                Color
              </label>
              <input
                id="color"
                type="text"
                value={form.color}
                onChange={handleChange('color')}
                className={inputClass}
                placeholder="Enter Color"
              />
            </div>

            <div>
              <label htmlFor="fuel_type" className={labelClass}>
                Fuel Type
              </label>
              <input
                id="fuel_type"
                type="text"
                value={form.fuel_type}
                onChange={handleChange('fuel_type')}
                className={inputClass}
                placeholder="Diesel / Gasoline"
              />
            </div>

            <div>
              <label htmlFor="odometer" className={labelClass}>
                Odometer
              </label>
              <input
                id="odometer"
                type="number"
                value={form.odometer}
                onChange={handleChange('odometer')}
                className={inputClass}
                placeholder="0"
              />
            </div>

            <div>
              <label htmlFor="status" className={labelClass}>
                Status
              </label>
              <select
                id="status"
                value={form.status}
                onChange={handleChange('status')}
                className={inputClass}
              >
                <option value="Available">Available</option>
                <option value="Assigned">Assigned</option>
                <option value="In Transit">In Transit</option>
                <option value="In Use">In Use</option>
                <option value="Maintenance">Maintenance</option>
                <option value="Out of Service">Out of Service</option>
                <option value="Inactive">Inactive</option>
              </select>
            </div>

            {/* Vehicle Image Base64 Upload Section */}
            <div className="sm:col-span-2">
              <label className={labelClass}>Vehicle Image</label>
              {form.vehicleImage ? (
                <div className="flex items-center gap-4 p-3 rounded-xl border border-slate-200 bg-slate-50">
                  <img
                    src={form.vehicleImage}
                    alt="Vehicle preview"
                    className="w-16 h-16 object-cover rounded-lg border border-slate-300"
                  />
                  <div className="flex-1 truncate">
                    <p className="text-xs font-medium text-slate-700">Image loaded successfully</p>
                    <p className="text-[10px] text-slate-400 truncate">
                      Base64 encoded string ready
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={handleRemoveImage}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                    title="Remove Image"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-slate-300 rounded-xl cursor-pointer bg-slate-50 hover:bg-slate-100 transition-colors">
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
        </section>

        <hr className="border-slate-100" />

        {/* Registration & Documentation */}
        <section>
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">
            Registration & Documentation
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label htmlFor="file_number" className={labelClass}>
                File Number
              </label>
              <input
                id="file_number"
                type="text"
                value={form.file_number}
                onChange={handleChange('file_number')}
                className={inputClass}
                placeholder="Enter File Number"
              />
            </div>

            <div>
              <label htmlFor="or_number" className={labelClass}>
                OR Number
              </label>
              <input
                id="or_number"
                type="text"
                value={form.or_number}
                onChange={handleChange('or_number')}
                className={inputClass}
                placeholder="Enter OR Number"
              />
            </div>

            <div>
              <label htmlFor="cr_number" className={labelClass}>
                CR Number
              </label>
              <input
                id="cr_number"
                type="text"
                value={form.cr_number}
                onChange={handleChange('cr_number')}
                className={inputClass}
                placeholder="Enter CR Number"
              />
            </div>

            <div>
              <label htmlFor="registration_expiry" className={labelClass}>
                Registration Expiry
              </label>
              <input
                id="registration_expiry"
                type="date"
                value={form.registration_expiry}
                onChange={handleChange('registration_expiry')}
                className={inputClass}
              />
            </div>

            <div className="sm:col-span-2">
              <label htmlFor="remarks" className={labelClass}>
                Remarks
              </label>
              <textarea
                id="remarks"
                rows="3"
                value={form.remarks}
                onChange={handleChange('remarks')}
                className={inputClass}
                placeholder="Enter any additional notes..."
              />
            </div>
          </div>
        </section>

        <Button type="submit" loading={upsertVehicle.isPending} className="w-full">
          Update Vehicle
        </Button>
      </form>
    </div>
  )
}
