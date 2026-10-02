// client/src/routes/_authenticated/admin/users/index.jsx
import { createFileRoute } from '@tanstack/react-router'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { useMasterBranches } from '@/hooks/useMasterBranches'
import { useMasterRoles } from '@/hooks/useMasterRoles'
import { useMasterUsers } from '@/hooks/useMasterUsers'
import { usePermissionCheck } from '@/hooks/usePermissionCheck'
import Button from '@/components/ui/Button'
import Table from '@/components/ui/Table'
import ActionButtons from '@/components/ui/ActionButtons'
import EditLink from '@/components/ui/EditLink'
import Modal from '@/components/ui/Modal'
import SearchBar from '@/components/ui/SearchBar'
import Pagination from '@/components/ui/Pagination'
import UserForm from './usersForm/UserForm'
import UserEditForm from './usersForm/UserEditForm'

export const Route = createFileRoute('/_authenticated/admin/users/')({
  component: UsersPage,
})

function UsersPage() {
  const { can } = usePermissionCheck()
  const [modalOpen, setModalOpen] = useState(false)
  const [editingUser, setEditingUser] = useState(null)
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const pageSize = 4

  const { data: users, isLoading } = useMasterUsers()
  useMasterBranches()
  useMasterRoles()

  const filteredUsers = useMemo(() => {
    if (!users) return []
    const q = search.trim().toLowerCase()
    if (!q) return users
    return users.filter((u) =>
      [u.first_name, u.last_name, u.username, u.email, u.id, u.branch_id, u.role_id].some((f) =>
        f?.toLowerCase().includes(q),
      ),
    )
  }, [users, search])

  const paginatedUsers = useMemo(() => {
    const start = (page - 1) * pageSize
    return filteredUsers.slice(start, start + pageSize)
  }, [filteredUsers, page, pageSize])

  const handleSearch = useCallback((value) => {
    setSearch(value)
  }, [])

  useEffect(() => {
    setPage(1)
  }, [search])

  const openCreateModal = () => {
    setEditingUser(null)
    setModalOpen(true)
  }

  const openEditModal = (user) => {
    setEditingUser(user)
    setModalOpen(true)
  }

  const columns = [
    { key: 'id', label: 'User ID', sortable: true, truncate: true },
    { key: 'branch_id', label: 'Branch ID', sortable: true, truncate: true },
    { key: 'role_id', label: 'Role ID', sortable: true, truncate: true },
    {
      key: 'first_name',
      label: 'First Name',
      sortable: true,
      render: (row) => <span className="font-medium text-slate-900">{row.first_name}</span>,
    },
    {
      key: 'last_name',
      label: 'Last Name',
      sortable: true,
      render: (row) => <span className="font-medium text-slate-900">{row.last_name}</span>,
    },
    { key: 'email', label: 'Email Address', sortable: true },
    {
      key: 'username',
      label: 'Username',
      sortable: true,
      render: (row) => <span className="text-slate-600">{row.username}</span>,
    },
    {
      key: 'actions',
      label: 'Actions',
      render: (row) =>
        can('users', 'update') ? <ActionButtons onEdit={() => openEditModal(row)} /> : null,
      mobileRender: (row) =>
        can('users', 'update') ? <EditLink onClick={() => openEditModal(row)} /> : null,
    },
  ]

  return (
    <div className="w-full pb-12">
      <div className="bg-slate-50/50 border border-slate-200/80 rounded-2xl p-4 sm:p-6 shadow-xs space-y-6 w-full">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white p-6 rounded-xl border border-slate-100 shadow-xs">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">User Management</h1>
            <p className="text-sm text-slate-500 mt-0.5">
              {/* Manage system users, access roles, and branch assignments. */}
            </p>
          </div>

          {can('users', 'write') && (
            <Button
              variant="primary"
              size="md"
              icon={<span className="text-lg leading-none">+</span>}
              onClick={openCreateModal}
            >
              Add New User
            </Button>
          )}
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-100 shadow-xs flex items-center justify-between gap-4">
          <div className="w-full md:w-96">
            <SearchBar
              value={search}
              onSearch={handleSearch}
              placeholder="Search by name, email, or username…"
            />
          </div>
          <div className="hidden md:block text-xs font-medium text-slate-400 pr-2">
            Total Users:{' '}
            <span className="text-slate-700 font-semibold">{filteredUsers.length}</span>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-slate-100 shadow-xs overflow-hidden w-full">
          <Table
            columns={columns}
            rows={paginatedUsers}
            rowKey="id"
            loading={isLoading}
            emptyMessage="No users found matching your criteria."
            minRows={pageSize}
          />

          <div className="p-4 border-t border-slate-100 bg-slate-50/50">
            <Pagination
              page={page}
              totalItems={filteredUsers.length}
              pageSize={pageSize}
              onPageChange={setPage}
            />
          </div>
        </div>
      </div>

      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editingUser ? 'Edit User Profile' : 'Create New User'}
        size="lg"
      >
        {editingUser ? (
          <UserEditForm user={editingUser} onSuccess={() => setModalOpen(false)} />
        ) : (
          <UserForm onSuccess={() => setModalOpen(false)} />
        )}
      </Modal>
    </div>
  )
}
