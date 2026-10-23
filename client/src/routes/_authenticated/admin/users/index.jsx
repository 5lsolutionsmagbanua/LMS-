// client/src/routes/_authenticated/admin/users/index.jsx
import { createFileRoute } from '@tanstack/react-router'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { useMasterBranches } from '../../../../hooks/useMasterBranches'
import { useMasterRoles } from '../../../../hooks/useMasterRoles'
import { useMasterUsers } from '../../../../hooks/useMasterUsers'
import { usePermissionCheck } from '../../../../hooks/usePermissionCheck'
import Button from '../../../../components/ui/Button'
import Table from '../../../../components/ui/Table'
import ActionButtons from '../../../../components/ui/ActionButtons'
import EditLink from '../../../../components/ui/EditLink'
import Modal from '../../../../components/ui/Modal'
import SearchBar from '../../../../components/ui/SearchBar'
import Pagination from '../../../../components/ui/Pagination'
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
    {
      key: 'id',
      label: 'User ID',
      sortable: true,
      truncate: true,
      render: (row) => (
        <span className="font-mono text-xs text-slate-500 dark:text-slate-400">{row.id}</span>
      ),
    },
    {
      key: 'branch_id',
      label: 'Branch ID',
      sortable: true,
      truncate: true,
      render: (row) => (
        <span className="font-mono text-xs text-slate-500 dark:text-slate-400">
          {row.branch_id}
        </span>
      ),
    },
    {
      key: 'role_id',
      label: 'Role ID',
      sortable: true,
      truncate: true,
      render: (row) => (
        <span className="font-mono text-xs text-slate-500 dark:text-slate-400">{row.role_id}</span>
      ),
    },
    {
      key: 'first_name',
      label: 'First Name',
      sortable: true,
      render: (row) => (
        <span className="font-medium text-slate-900 dark:text-slate-100">{row.first_name}</span>
      ),
    },
    {
      key: 'last_name',
      label: 'Last Name',
      sortable: true,
      render: (row) => (
        <span className="font-medium text-slate-900 dark:text-slate-100">{row.last_name}</span>
      ),
    },
    {
      key: 'email',
      label: 'Email Address',
      sortable: true,
      render: (row) => (
        <span className="text-slate-600 dark:text-slate-400">{row.email || '—'}</span>
      ),
    },
    {
      key: 'username',
      label: 'Username',
      sortable: true,
      render: (row) => (
        <span className="text-slate-600 dark:text-slate-300 font-semibold">{row.username}</span>
      ),
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
      {/* Outer Container with Thicker Theme-Adaptive Border */}
      <div className="bg-slate-50/60 dark:bg-slate-900/40 border-2 border-primary/20 dark:border-primary/30 rounded-2xl p-4 sm:p-6 shadow-2xs space-y-6 w-full backdrop-blur-sm transition-colors">
        {/* Unified Liquify Gradient Header Card */}
        <div className="bg-gradient-to-r from-primary via-primary/90 to-primary/80 p-6 rounded-xl border border-white/10 shadow-md backdrop-blur-md text-on-primary">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold tracking-tight h1 drop-shadow-2xs">
                User Management
              </h1>
              <p className="text-sm opacity-75 mt-0.5">
                Manage system users, access roles, and branch assignments.
              </p>
            </div>

            {can('users', 'write') && (
              <Button
                variant="liquid"
                size="md"
                icon={<span className="text-lg leading-none">+</span>}
                onClick={openCreateModal}
              >
                Add New User
              </Button>
            )}
          </div>
        </div>

        {/* Data Table Card Container with Thicker Theme-Adaptive Border */}
        <div className="bg-white dark:bg-slate-900/60 rounded-xl border-2 border-primary/20 dark:border-primary/30 shadow-2xs overflow-hidden w-full transition-colors">
          <Table
            columns={columns}
            rows={paginatedUsers}
            rowKey="id"
            loading={isLoading}
            emptyMessage="No users found matching your criteria."
            minRows={pageSize}
          />

          {/* Merged Footer: Search Bar, Total Users & Pagination in a Row */}
          <div className="p-4 border-t-2 border-primary/20 dark:border-primary/30 bg-slate-50/50 dark:bg-slate-900/40 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-4 w-full sm:w-auto">
              <div className="w-full sm:w-72">
                <SearchBar
                  value={search}
                  onSearch={handleSearch}
                  placeholder="Search by name, email, or username…"
                />
              </div>
              <div className="text-xs font-medium text-slate-500 dark:text-slate-400 whitespace-nowrap hidden sm:block">
                Total Users:{' '}
                <span className="font-semibold text-slate-700 dark:text-slate-200">
                  {filteredUsers.length}
                </span>
              </div>
            </div>

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
