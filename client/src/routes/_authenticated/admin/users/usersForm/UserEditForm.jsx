// client/src/components/users/UserEditForm.jsx
import { useState } from 'react'
import { useMasterBranches } from '@/hooks/useMasterBranches'
import { useMasterRoles } from '@/hooks/useMasterRoles'
import { useUpsertUser } from '@/hooks/useMasterUsers'
import Alert from '@/components/ui/Alert'
import Button from '@/components/ui/Button'

const REQUIRED_FIELDS = ['first_name', 'last_name', 'username', 'branch_id', 'role_id']

const inputClass =
  'w-full rounded-xl border border-slate-200/90 bg-white px-3.5 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 ' +
  'focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all shadow-2xs ' +
  'dark:bg-slate-900/50 dark:text-slate-100 dark:border-white/10 dark:placeholder:text-slate-500 ' +
  'dark:[&>option]:bg-slate-900 dark:[&>option]:text-white'

const labelClass =
  'mb-1.5 block text-xs font-semibold uppercase tracking-wide text-slate-600 dark:text-slate-400'

const sectionTitleClass =
  'text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400'

export default function UserEditForm({ user, onSuccess }) {
  const [form, setForm] = useState({
    id: user?.id,
    branch_id: user?.branch_id ?? '',
    role_id: user?.role_id ?? '',
    first_name: user?.first_name ?? '',
    last_name: user?.last_name ?? '',
    email: user?.email ?? '',
    username: user?.username ?? '',
  })

  const [validationError, setValidationError] = useState(null)

  const { data: branches, isLoading: branchesLoading } = useMasterBranches()
  const { data: roles, isLoading: rolesLoading } = useMasterRoles()
  const upsertUser = useUpsertUser()

  const referenceDataLoading = branchesLoading || rolesLoading

  const handleChange = (field) => (e) => {
    setForm((prev) => ({ ...prev, [field]: e.target.value }))
    if (validationError) setValidationError(null)
  }

  const validate = () => {
    return !REQUIRED_FIELDS.some((field) => !form[field])
  }

  const handleSubmit = (e) => {
    e.preventDefault()

    if (!validate()) {
      setValidationError('Please fill out all required fields.')
      return
    }
    setValidationError(null)

    upsertUser.mutate(form, {
      onSuccess: () => {
        setTimeout(() => {
          onSuccess?.()
        }, 600)
      },
    })
  }

  if (referenceDataLoading) {
    return (
      <div className="animate-pulse space-y-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="space-y-1.5">
            <div className="h-3 w-20 rounded bg-white/60 dark:bg-white/10" />
            <div className="h-10 w-full rounded-xl bg-white/40 dark:bg-white/5" />
          </div>
        ))}
      </div>
    )
  }

  return (
    <div className="relative w-full space-y-4">
      {validationError && (
        <Alert
          variant="warning"
          title="Validation Error"
          onDismiss={() => setValidationError(null)}
        >
          {validationError}
        </Alert>
      )}

      {upsertUser.isError && (
        <Alert variant="error" title="Update Failed" onDismiss={() => upsertUser.reset()}>
          {upsertUser.error?.response?.data?.message || 'Something went wrong'}
        </Alert>
      )}

      {upsertUser.isSuccess && (
        <Alert variant="success" title="Success" onDismiss={() => upsertUser.reset()}>
          User updated successfully.
        </Alert>
      )}

      <form onSubmit={handleSubmit} className="space-y-6" noValidate>
        {/* Personal info Card */}
        <div className="bg-slate-50/60 dark:bg-slate-900/40 border border-slate-200/80 dark:border-white/10 rounded-2xl p-5 sm:p-6 shadow-2xs space-y-4 backdrop-blur-sm">
          <div className="border-b border-slate-200/60 dark:border-white/10 pb-3">
            <h3 className={sectionTitleClass}>Personal information</h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label htmlFor="first_name" className={labelClass}>
                First name <span className="text-rose-500">*</span>
              </label>
              <input
                id="first_name"
                type="text"
                value={form.first_name}
                onChange={handleChange('first_name')}
                className={inputClass}
                placeholder="Enter First Name"
              />
            </div>
            <div>
              <label htmlFor="last_name" className={labelClass}>
                Last name <span className="text-rose-500">*</span>
              </label>
              <input
                id="last_name"
                type="text"
                value={form.last_name}
                onChange={handleChange('last_name')}
                className={inputClass}
                placeholder="Enter Last Name"
              />
            </div>
            <div className="sm:col-span-2">
              <label htmlFor="email" className={labelClass}>
                Email
              </label>
              <input
                id="email"
                type="email"
                value={form.email}
                onChange={handleChange('email')}
                className={inputClass}
                placeholder="Enter Email Address"
              />
            </div>
          </div>
        </div>

        {/* Account credentials Card */}
        <div className="bg-slate-50/60 dark:bg-slate-900/40 border border-slate-200/80 dark:border-white/10 rounded-2xl p-5 sm:p-6 shadow-2xs space-y-4 backdrop-blur-sm">
          <div className="border-b border-slate-200/60 dark:border-white/10 pb-3">
            <h3 className={sectionTitleClass}>Account credentials</h3>
          </div>

          <div className="grid grid-cols-1 gap-4">
            <div>
              <label htmlFor="username" className={labelClass}>
                Username <span className="text-rose-500">*</span>
              </label>
              <input
                id="username"
                type="text"
                value={form.username}
                onChange={handleChange('username')}
                className={inputClass}
                placeholder="Enter Username"
              />
            </div>
          </div>
        </div>

        {/* Assignment Card */}
        <div className="bg-slate-50/60 dark:bg-slate-900/40 border border-slate-200/80 dark:border-white/10 rounded-2xl p-5 sm:p-6 shadow-2xs space-y-4 backdrop-blur-sm">
          <div className="border-b border-slate-200/60 dark:border-white/10 pb-3">
            <h3 className={sectionTitleClass}>Assignment</h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label htmlFor="branch_id" className={labelClass}>
                Branch <span className="text-rose-500">*</span>
              </label>
              <select
                id="branch_id"
                value={form.branch_id}
                onChange={handleChange('branch_id')}
                className={inputClass}
              >
                <option value="">Select branch...</option>
                {branches?.map((branch) => (
                  <option key={branch.id} value={branch.id}>
                    {branch.branch_name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label htmlFor="role_id" className={labelClass}>
                Role <span className="text-rose-500">*</span>
              </label>
              <select
                id="role_id"
                value={form.role_id}
                onChange={handleChange('role_id')}
                className={inputClass}
              >
                <option value="">Select role...</option>
                {roles?.map((role) => (
                  <option key={role.id} value={role.id}>
                    {role.role_name}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-end pt-2">
          <Button
            type="submit"
            variant="liquid"
            loading={upsertUser.isPending}
            className="w-full sm:w-auto min-w-[140px]"
          >
            Save Changes
          </Button>
        </div>
      </form>
    </div>
  )
}
