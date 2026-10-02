// client/src/components/users/UserForm.jsx
import { useState } from 'react'
import { useMasterBranches } from '@/hooks/useMasterBranches'
import { useMasterRoles } from '@/hooks/useMasterRoles'
import { useUpsertUser } from '@/hooks/useMasterUsers'
import Alert from '@/components/ui/Alert'
import Button from '@/components/ui/Button'

const EMPTY_FORM = {
  id: undefined,
  branch_id: '',
  role_id: '',
  first_name: '',
  last_name: '',
  email: '',
  username: '',
  password: '',
}

const REQUIRED_FIELDS = ['first_name', 'last_name', 'username', 'branch_id', 'role_id']

const inputClass =
  'w-full rounded-xl border border-slate-200/80 bg-white px-3.5 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent shadow-sm transition-all duration-200'

const labelClass = 'block text-xs font-semibold uppercase tracking-wide text-slate-500 mb-1.5'

export default function UserForm({ user, onSuccess }) {
  const isEditMode = Boolean(user)

  const [form, setForm] = useState(() =>
    user
      ? {
          id: user.id,
          branch_id: user.branch_id ?? '',
          role_id: user.role_id ?? '',
          first_name: user.first_name ?? '',
          last_name: user.last_name ?? '',
          email: user.email ?? '',
          username: user.username ?? '',
          password: '',
        }
      : EMPTY_FORM,
  )

  const [validationError, setValidationError] = useState(null)

  const { data: branches, isLoading: branchesLoading } = useMasterBranches()
  const { data: roles, isLoading: rolesLoading } = useMasterRoles()
  const upsertUser = useUpsertUser()

  const referenceDataLoading = branchesLoading || rolesLoading

  const handleChange = (field) => (e) => {
    setForm((prev) => ({ ...prev, [field]: e.target.value }))
  }

  const validate = () => {
    const hasMissingField = REQUIRED_FIELDS.some((field) => !form[field])
    const missingPassword = !isEditMode && !form.password
    return !(hasMissingField || missingPassword)
  }

  const handleSubmit = (e) => {
    e.preventDefault()

    if (!validate()) {
      setValidationError('Please fill out all required fields.')
      return
    }
    setValidationError(null)

    const payload = { ...form }
    if (isEditMode && !payload.password) {
      delete payload.password
    }

    upsertUser.mutate(payload, {
      onSuccess: () => {
        if (!isEditMode) setForm(EMPTY_FORM)
        onSuccess?.()
      },
    })
  }

  if (referenceDataLoading) {
    return (
      <div className="space-y-4 animate-pulse">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="space-y-1.5">
            <div className="h-3 w-20 bg-slate-200 rounded" />
            <div className="h-10 w-full bg-slate-100 rounded-xl" />
          </div>
        ))}
      </div>
    )
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

      {upsertUser.isError && (
        <Alert variant="error" onDismiss={() => upsertUser.reset()} className="mb-4">
          {upsertUser.error?.response?.data?.message || 'Something went wrong'}
        </Alert>
      )}
      {upsertUser.isSuccess && (
        <Alert variant="success" onDismiss={() => upsertUser.reset()} className="mb-4">
          {isEditMode ? 'User updated successfully.' : 'User created successfully.'}
        </Alert>
      )}

      <form onSubmit={handleSubmit} className="space-y-6" noValidate>
        {/* Personal info */}
        <section>
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">
            Personal information
          </h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="first_name" className={labelClass}>
                First name
              </label>
              <input
                id="first_name"
                type="text"
                value={form.first_name}
                onChange={handleChange('first_name')}
                className={inputClass}
                placeholder="Juan"
              />
            </div>
            <div>
              <label htmlFor="last_name" className={labelClass}>
                Last name
              </label>
              <input
                id="last_name"
                type="text"
                value={form.last_name}
                onChange={handleChange('last_name')}
                className={inputClass}
                placeholder="Dela Cruz"
              />
            </div>
            <div className="col-span-2">
              <label htmlFor="email" className={labelClass}>
                Email
              </label>
              <input
                id="email"
                type="email"
                value={form.email}
                onChange={handleChange('email')}
                className={inputClass}
                placeholder="jdelacruz@company.com"
              />
            </div>
          </div>
        </section>

        <hr className="border-slate-100" />

        {/* Account credentials */}
        <section>
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">
            Account credentials
          </h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="username" className={labelClass}>
                Username
              </label>
              <input
                id="username"
                type="text"
                value={form.username}
                onChange={handleChange('username')}
                className={inputClass}
                placeholder="jdelacruz"
              />
            </div>

            {!isEditMode && (
              <div>
                <label htmlFor="password" className={labelClass}>
                  Password
                </label>
                <input
                  id="password"
                  type="password"
                  value={form.password}
                  onChange={handleChange('password')}
                  className={inputClass}
                  placeholder="••••••••"
                />
              </div>
            )}
          </div>
        </section>

        <hr className="border-slate-100" />

        {/* Assignment */}
        <section>
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">
            Assignment
          </h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="branch_id" className={labelClass}>
                Branch
              </label>
              <select
                id="branch_id"
                value={form.branch_id}
                onChange={handleChange('branch_id')}
                className={inputClass}
              >
                <option value="">Select branch</option>
                {branches?.map((branch) => (
                  <option key={branch.id} value={branch.id}>
                    {branch.branch_name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label htmlFor="role_id" className={labelClass}>
                Role
              </label>
              <select
                id="role_id"
                value={form.role_id}
                onChange={handleChange('role_id')}
                className={inputClass}
              >
                <option value="">Select role</option>
                {roles?.map((role) => (
                  <option key={role.id} value={role.id}>
                    {role.role_name}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </section>

        <div className="pt-2">
          <Button type="submit" loading={upsertUser.isPending} className="w-full">
            {isEditMode ? 'Save changes' : 'Create user'}
          </Button>
        </div>
      </form>
    </div>
  )
}
