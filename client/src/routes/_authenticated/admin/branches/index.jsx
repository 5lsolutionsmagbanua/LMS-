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
import { useMasterBranches, useUpsertBranch } from '@/hooks/useMasterBranches'
import { usePermissionCheck } from '@/hooks/usePermissionCheck'
import BranchForm from './branchesForm/BranchForm'

export const Route = createFileRoute('/_authenticated/admin/branches/')({
  component: BranchesRoute,
})

function BranchesRoute() {
  const { can } = usePermissionCheck()
  const { data: rawBranches, isLoading: dataLoading } = useMasterBranches()
  const upsertBranch = useUpsertBranch()

  const [isModalOpen, setIsModalOpen] = useState(false)
  const [selectedBranch, setSelectedBranch] = useState(null)
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const pageSize = 6

  const branches = useMemo(() => {
    if (!rawBranches) return []
    return rawBranches.map((item) => ({
      id: item.id || item.mb_id,
      name: item.branch_name || item.mb_branch_name,
      address: item.address || item.mb_address,
      company_name: item.company_name || item.mb_company_name,
      email: item.email || item.mb_email,
      contact_number: item.contact_number || item.mb_contact_number,
    }))
  }, [rawBranches])

  const filteredBranches = useMemo(() => {
    if (!branches) return []
    const q = search.trim().toLowerCase()
    if (!q) return branches
    return branches.filter((b) =>
      [b.name, b.address, b.id, b.email, b.contact_number, b.company_name].some((f) =>
        f?.toLowerCase().includes(q),
      ),
    )
  }, [branches, search])

  const paginatedBranches = useMemo(() => {
    const start = (page - 1) * pageSize
    return filteredBranches.slice(start, start + pageSize)
  }, [filteredBranches, page, pageSize])

  const handleSearch = useCallback((value) => {
    setSearch(value)
  }, [])

  useEffect(() => {
    setPage(1)
  }, [search])

  const handleOpenCreate = () => {
    setSelectedBranch(null)
    setIsModalOpen(true)
  }

  const handleOpenEdit = (branch) => {
    setSelectedBranch(branch)
    setIsModalOpen(true)
  }

  const handleFormSubmit = (formData) => {
    upsertBranch.mutate(formData, {
      onSuccess: () => {
        setTimeout(() => {
          setIsModalOpen(false)
        }, 800)
      },
    })
  }

  const columns = [
    {
      key: 'id',
      label: 'Branch ID',
      sortable: true,
      truncate: true,
      render: (row) => <span className="font-mono text-xs text-slate-500">{row.id}</span>,
    },
    {
      key: 'name',
      label: 'Branch Name',
      sortable: true,
      render: (row) => <span className="font-medium text-slate-900">{row.name}</span>,
    },
    {
      key: 'company_name',
      label: 'Company Name',
      sortable: true,
      render: (row) => <span className="text-slate-600">{row.company_name || '—'}</span>,
    },
    {
      key: 'email',
      label: 'Email',
      sortable: true,
      render: (row) => <span className="text-slate-600">{row.email || '—'}</span>,
    },
    {
      key: 'contact_number',
      label: 'Contact Number',
      sortable: true,
      render: (row) => <span className="text-slate-600">{row.contact_number || '—'}</span>,
    },
    {
      key: 'address',
      label: 'Address',
      sortable: true,
      render: (row) => (
        <span className="text-slate-600 truncate max-w-xs block">{row.address || '—'}</span>
      ),
    },
    {
      key: 'actions',
      label: 'Actions',
      render: (row) =>
        can('branches', 'update') ? <ActionButtons onEdit={() => handleOpenEdit(row)} /> : null,
      mobileRender: (row) =>
        can('branches', 'update') ? <EditLink onClick={() => handleOpenEdit(row)} /> : null,
    },
  ]

  return (
    <div className="w-full pb-12">
      <div className="bg-slate-50/50 border border-slate-200/80 rounded-2xl p-4 sm:p-6 shadow-xs space-y-6 w-full">
        {upsertBranch.isError && (
          <Alert variant="error" title="Operation Failed" onDismiss={() => upsertBranch.reset()}>
            {upsertBranch.error?.response?.data?.message || 'Something went wrong while saving.'}
          </Alert>
        )}

        {upsertBranch.isSuccess && !isModalOpen && (
          <Alert variant="success" title="Success" onDismiss={() => upsertBranch.reset()}>
            Branch saved successfully.
          </Alert>
        )}

        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white p-6 rounded-xl border border-slate-100 shadow-xs">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">Branch Management</h1>
            <p className="text-sm text-slate-500 mt-0.5">
              {/* Manage company locations, facilities, and branch setups. */}
            </p>
          </div>

          {can('branches', 'write') && (
            <Button
              variant="primary"
              size="md"
              icon={<span className="text-lg leading-none">+</span>}
              onClick={handleOpenCreate}
            >
              Add New Branch
            </Button>
          )}
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-100 shadow-xs flex items-center justify-between gap-4">
          <div className="w-full md:w-96">
            <SearchBar
              value={search}
              onSearch={handleSearch}
              placeholder="Search by ID, name, email..."
            />
          </div>
          <div className="hidden md:block text-xs font-medium text-slate-400 pr-2">
            Total Branches:{' '}
            <span className="text-slate-700 font-semibold">{filteredBranches.length}</span>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-slate-100 shadow-xs overflow-hidden w-full">
          <Table
            columns={columns}
            rows={paginatedBranches}
            rowKey="id"
            emptyMessage={
              dataLoading ? 'Loading branches...' : 'No branches found matching your criteria.'
            }
            minRows={pageSize}
          />

          <div className="p-4 border-t border-slate-100 bg-slate-50/50">
            <Pagination
              page={page}
              totalItems={filteredBranches.length}
              pageSize={pageSize}
              onPageChange={setPage}
            />
          </div>
        </div>
      </div>

      <Modal
        open={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={selectedBranch ? 'Edit Branch' : 'Add New Branch'}
        size="lg"
      >
        <BranchForm
          initialData={selectedBranch}
          onSubmit={handleFormSubmit}
          onCancel={() => setIsModalOpen(false)}
          loading={upsertBranch.isPending}
        />
      </Modal>
    </div>
  )
}
