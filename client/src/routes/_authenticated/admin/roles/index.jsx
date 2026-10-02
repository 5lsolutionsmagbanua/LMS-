import { createFileRoute } from '@tanstack/react-router'
import { useCallback, useEffect, useMemo, useState } from 'react'
import Button from '@/components/ui/Button'
import Modal from '@/components/ui/Modal'
import ActionButtons from '@/components/ui/ActionButtons'
import EditLink from '@/components/ui/EditLink'
import SearchBar from '@/components/ui/SearchBar'
import Pagination from '@/components/ui/Pagination'
import Table from '@/components/ui/Table'
import Alert from '@/components/ui/Alert'
import { useMasterRoles, useUpsertRole } from '@/hooks/useMasterRoles'
import { usePermissionCheck } from '@/hooks/usePermissionCheck'

export const Route = createFileRoute('/_authenticated/admin/roles/')({
  component: RolesRoute,
})

const REQUIRED_FIELDS = ['role_name']
const inputClass =
  'w-full rounded-lg border border-slate-300 px-3.5 py-2.5 text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-shadow'
const labelClass = 'block text-xs font-semibold uppercase tracking-wide text-slate-500 mb-1.5'

function RoleEditForm({ role, onSuccess }) {
  const [form, setForm] = useState({
    id: role?.id ?? role?.role_id,
    role_name: role?.role_name ?? '',
    description: role?.description ?? '',
    is_active: role?.is_active !== undefined ? role.is_active : 1,
  })
  const [validationError, setValidationError] = useState(null)
  const upsertRole = useUpsertRole()

  const handleChange = (field) => (e) => {
    const value = field === 'is_active' ? parseInt(e.target.value, 10) : e.target.value
    setForm((prev) => ({ ...prev, [field]: value }))
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
      onSuccess: () => setTimeout(() => onSuccess?.(), 1000),
    })
  }

  return (
    <div className="w-full relative">
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
        <section>
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">
            Role Information
          </h3>
          <div className="space-y-4">
            <div>
              <label htmlFor="role_name" className={labelClass}>
                Role Name <span className="text-primary">*</span>
              </label>
              <input
                id="role_name"
                type="text"
                value={form.role_name}
                onChange={handleChange('role_name')}
                className={inputClass}
                placeholder="Enter Role Name"
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
                className={inputClass}
                placeholder="Enter Description"
              />
            </div>
          </div>
        </section>
        <Button type="submit" loading={upsertRole.isPending} className="w-full">
          Save changes
        </Button>
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
      role_name: item.role_name,
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
      render: (row) => <span className="font-mono text-xs text-slate-500">{row.id}</span>,
    },
    {
      key: 'role_name',
      label: 'Role Name',
      sortable: true,
      render: (row) => <span className="font-medium text-slate-900">{row.role_name}</span>,
    },
    {
      key: 'description',
      label: 'Description',
      sortable: true,
      render: (row) => <span className="text-slate-600">{row.description || '—'}</span>,
    },
    {
      key: 'is_active',
      label: 'Status',
      sortable: true,
      render: (row) => (
        <span
          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${
            row.is_active === 1
              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200/60'
              : 'bg-slate-100 text-slate-600 border border-slate-200'
          }`}
        >
          {row.is_active === 1 ? 'Active' : 'Inactive'}
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
      <div className="bg-slate-50/50 border border-slate-200/80 rounded-2xl p-4 sm:p-6 shadow-xs space-y-6 w-full">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white p-6 rounded-xl border border-slate-100 shadow-xs">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">Role Management</h1>
            <p className="text-sm text-slate-500 mt-0.5">
              {/* Manage system permissions, access levels, and security definitions. */}
            </p>
          </div>

          {can('roles', 'write') && (
            <Button
              variant="primary"
              size="md"
              icon={<span className="text-lg leading-none">+</span>}
              onClick={handleOpenCreate}
            >
              Add New Role
            </Button>
          )}
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-100 shadow-xs flex items-center justify-between gap-4">
          <div className="w-full md:w-96">
            <SearchBar
              value={search}
              onSearch={handleSearch}
              placeholder="Search by ID, role name, or description…"
            />
          </div>
          <div className="hidden md:block text-xs font-medium text-slate-400 pr-2">
            Total Roles:{' '}
            <span className="text-slate-700 font-semibold">{filteredRoles.length}</span>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-slate-100 shadow-xs overflow-hidden w-full">
          <Table
            columns={columns}
            rows={paginatedRoles}
            rowKey="id"
            emptyMessage={
              dataLoading ? 'Loading roles...' : 'No roles found matching your criteria.'
            }
            minRows={pageSize}
          />
          <div className="p-4 border-t border-slate-100 bg-slate-50/50">
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
        <RoleEditForm role={selectedRole} onSuccess={() => setIsModalOpen(false)} />
      </Modal>
    </div>
  )
}
