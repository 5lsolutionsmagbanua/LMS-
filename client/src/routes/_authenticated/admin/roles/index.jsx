// client/src/routes/_authenticated/admin/roles/index.jsx
import { createFileRoute } from '@tanstack/react-router'
import { useCallback, useEffect, useMemo, useState } from 'react'
import Button from '../../../../components/ui/Button'
import Modal from '../../../../components/ui/Modal'
import ActionButtons from '../../../../components/ui/ActionButtons'
import EditLink from '../../../../components/ui/EditLink'
import SearchBar from '../../../../components/ui/SearchBar'
import Pagination from '../../../../components/ui/Pagination'
import Table from '../../../../components/ui/Table'
import Alert from '../../../../components/ui/Alert'
import { useMasterRoles, useUpsertRole } from '../../../../hooks/useMasterRoles'
import { usePermissionCheck } from '../../../../hooks/usePermissionCheck'

export const Route = createFileRoute('/_authenticated/admin/roles/')({
  component: RolesRoute,
})

const REQUIRED_FIELDS = ['role_name']

const inputClass =
  'w-full rounded-xl border border-slate-200/90 bg-white px-3.5 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 ' +
  'focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all shadow-2xs ' +
  'dark:bg-slate-900/50 dark:text-slate-100 dark:border-white/10 dark:placeholder:text-slate-500 ' +
  'dark:[&>option]:bg-slate-900 dark:[&>option]:text-white'

const labelClass =
  'mb-1.5 block text-xs font-semibold uppercase tracking-wide text-slate-600 dark:text-slate-400'

const sectionTitleClass = 'text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400'

function RoleForm({ role, onSuccess, onCancel }) {
  const [form, setForm] = useState({
    id: role?.id ?? role?.role_id ?? '',
    role_name: role?.role_name ?? role?.name ?? '',
    description: role?.description ?? '',
    is_active: role?.is_active !== undefined ? Number(role.is_active) : 1,
  })
  const [validationError, setValidationError] = useState(null)
  const upsertRole = useUpsertRole()

  const handleChange = (field) => (e) => {
    const value = field === 'is_active' ? parseInt(e.target.value, 10) : e.target.value
    setForm((prev) => ({ ...prev, [field]: value }))
    if (validationError) setValidationError(null)
  }

  const validate = () => !REQUIRED_FIELDS.some((field) => !form[field]?.toString().trim())

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!validate()) {
      setValidationError('Please fill out all required fields.')
      return
    }
    setValidationError(null)
    upsertRole.mutate(form, {
      onSuccess: () => setTimeout(() => onSuccess?.(), 600),
    })
  }

  return (
    <div className="w-full relative space-y-4">
      {validationError && (
        <Alert variant="warning" title="Validation Error" onDismiss={() => setValidationError(null)}>
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

        <div className="flex items-center justify-end gap-3 pt-2">
          {onCancel && (
            <Button type="button" variant="secondary" onClick={onCancel} disabled={upsertRole.isPending}>
              Cancel
            </Button>
          )}
          <Button type="submit" variant="liquid" loading={upsertRole.isPending} className="w-full sm:w-auto min-w-[140px]">
            {form.id ? 'Save Changes' : 'Create Role'}
          </Button>
        </div>
      </form>
    </div>
  )
}

function RolesRoute() {
  const { can } = usePermissionCheck()
  const { data: rawRoles, isLoading: dataLoading } = useMasterRoles()

  const [isModalOpen, setIsModalOpen] = useState(false)
  const [selectedRole, setSelectedRole] = useState(null)
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const pageSize = 4

  const roles = useMemo(() => {
    if (!rawRoles) return []
    return rawRoles.map((item) => ({
      id: item.id || item.role_id,
      role_name: item.role_name || item.name,
      description: item.description,
      is_active: item.is_active,
    }))
  }, [rawRoles])

  const filteredRoles = useMemo(() => {
    if (!roles) return []
    const q = search.trim().toLowerCase()
    if (!q) return roles
    return roles.filter((r) =>
      [r.role_name, r.description, r.id].some((f) => f?.toString().toLowerCase().includes(q)),
    )
  }, [roles, search])

  const paginatedRoles = useMemo(() => {
    const start = (page - 1) * pageSize
    return filteredRoles.slice(start, start + pageSize)
  }, [filteredRoles, page, pageSize])

  const handleSearch = useCallback((value) => setSearch(value), [])

  useEffect(() => {
    setPage(1)
  }, [search])

  const handleOpenCreate = () => {
    setSelectedRole(null)
    setIsModalOpen(true)
  }

  const handleOpenEdit = (role) => {
    setSelectedRole(role)
    setIsModalOpen(true)
  }

  const columns = [
    {
      key: 'id',
      label: 'Role ID',
      sortable: true,
      truncate: true,
      render: (row) => <span className="font-mono text-xs text-slate-500 dark:text-slate-400">{row.id}</span>,
    },
    {
      key: 'role_name',
      label: 'Role Name',
      sortable: true,
      render: (row) => <span className="font-medium text-slate-900 dark:text-slate-100">{row.role_name}</span>,
    },
    {
      key: 'description',
      label: 'Description',
      sortable: true,
      render: (row) => <span className="text-slate-600 dark:text-slate-400">{row.description || '—'}</span>,
    },
    {
      key: 'is_active',
      label: 'Status',
      sortable: true,
      render: (row) => (
        <span
          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${
            row.is_active === 1 || row.is_active === true
              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200/60 dark:bg-emerald-950/40 dark:text-emerald-400 dark:border-emerald-800/50'
              : 'bg-slate-100 text-slate-600 border border-slate-200 dark:bg-slate-800 dark:text-slate-400 dark:border-slate-700'
          }`}
        >
          {row.is_active === 1 || row.is_active === true ? 'Active' : 'Inactive'}
        </span>
      ),
    },
    {
      key: 'actions',
      label: 'Actions',
      render: (row) =>
        can('roles', 'update') ? <ActionButtons onEdit={() => handleOpenEdit(row)} /> : null,
      mobileRender: (row) =>
        can('roles', 'update') ? <EditLink onClick={() => handleOpenEdit(row)} /> : null,
    },
  ]

  return (
    <div className="w-full pb-12">
      {/* Outer Container with Thicker Theme-Adaptive Border */}
      <div className="bg-slate-50/60 dark:bg-slate-900/40 border-2 border-primary/20 dark:border-primary/30 rounded-2xl p-4 sm:p-6 shadow-2xs space-y-6 w-full backdrop-blur-sm transition-colors">
        {/* Unified Liquify Gradient Header Card */}
        <div className="bg-gradient-to-r from-primary via-primary/90 to-primary/80 p-6 rounded-xl border border-white/10 shadow-md backdrop-blur-md text-on-primary">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold tracking-tight h1 drop-shadow-2xs">
                Role Management
              </h1>
              <p className="text-sm opacity-75 mt-0.5">
                Manage system permissions, access levels, and security definitions.
              </p>
            </div>

            {can('roles', 'write') && (
              <Button
                variant="liquid"
                size="md"
                icon={<span className="text-lg leading-none">+</span>}
                onClick={handleOpenCreate}
              >
                Add New Role
              </Button>
            )}
          </div>
        </div>

        {/* Data Table Card Container with Thicker Theme-Adaptive Border */}
        <div className="bg-white dark:bg-slate-900/60 rounded-xl border-2 border-primary/20 dark:border-primary/30 shadow-2xs overflow-hidden w-full transition-colors">
          <Table
            columns={columns}
            rows={paginatedRoles}
            rowKey="id"
            emptyMessage={
              dataLoading ? 'Loading roles...' : 'No roles found matching your criteria.'
            }
            minRows={pageSize}
          />

          {/* Merged Footer: Search Bar, Total Roles & Pagination in a Row */}
          <div className="p-4 border-t-2 border-primary/20 dark:border-primary/30 bg-slate-50/50 dark:bg-slate-900/40 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-4 w-full sm:w-auto">
              <div className="w-full sm:w-72">
                <SearchBar
                  value={search}
                  onSearch={handleSearch}
                  placeholder="Search by ID, role name, or description…"
                />
              </div>
              <div className="text-xs font-medium text-slate-500 dark:text-slate-400 whitespace-nowrap hidden sm:block">
                Total Roles:{' '}
                <span className="font-semibold text-slate-700 dark:text-slate-200">
                  {filteredRoles.length}
                </span>
              </div>
            </div>

            <Pagination
              page={page}
              totalItems={filteredRoles.length}
              pageSize={pageSize}
              onPageChange={setPage}
            />
          </div>
        </div>
      </div>

      <Modal
        open={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={selectedRole ? 'Edit Role' : 'Add New Role'}
        size="lg"
      >
        <RoleForm
          role={selectedRole}
          onSuccess={() => setIsModalOpen(false)}
          onCancel={() => setIsModalOpen(false)}
        />
      </Modal>
    </div>
  )
}