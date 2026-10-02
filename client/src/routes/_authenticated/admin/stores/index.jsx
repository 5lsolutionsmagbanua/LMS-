// client/src/routes/_authenticated/admin/stores/index.jsx
import { createFileRoute } from '@tanstack/react-router'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { useMasterStores } from '@/hooks/useMasterStores'
import { usePermissionCheck } from '@/hooks/usePermissionCheck'
import Button from '@/components/ui/Button'
import Modal from '@/components/ui/Modal'
import ActionButtons from '@/components/ui/ActionButtons'
import EditLink from '@/components/ui/EditLink'
import SearchBar from '@/components/ui/SearchBar'
import Pagination from '@/components/ui/Pagination'
import Table from '@/components/ui/Table'
import StoreForm from './storesForm/StoreForm'
import Alert from '@/components/ui/Alert'

export const Route = createFileRoute('/_authenticated/admin/stores/')({
  component: StoresRoute,
})

function StoresRoute() {
  const { can } = usePermissionCheck()
  const { data: rawStores, isLoading: dataLoading } = useMasterStores()

  const [isModalOpen, setIsModalOpen] = useState(false)
  const [selectedStore, setSelectedStore] = useState(null)
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const [successMessage, setSuccessMessage] = useState(null)
  const pageSize = 4

  const stores = useMemo(() => {
    if (!rawStores) return []
    return rawStores.map((item) => ({
      id: item.id || item.ms_id,
      store_name: item.store_name || item.ms_store_name,
      store_code: item.store_code || item.ms_store_code,
      store_address: item.store_address || item.ms_store_address,
      contact_person: item.contact_person || item.ms_contact_person,
      contact_number: item.contact_number || item.ms_contact_number,
      is_active: item.is_active !== undefined ? item.is_active : item.ms_is_active,
    }))
  }, [rawStores])

  const filteredStores = useMemo(() => {
    if (!stores) return []
    const q = search.trim().toLowerCase()
    if (!q) return stores
    return stores.filter((s) =>
      [s.store_name, s.store_code, s.id, s.contact_person, s.contact_number].some((f) =>
        f?.toString().toLowerCase().includes(q),
      ),
    )
  }, [stores, search])

  const paginatedStores = useMemo(() => {
    const start = (page - 1) * pageSize
    return filteredStores.slice(start, start + pageSize)
  }, [filteredStores, page, pageSize])

  const handleSearch = useCallback((value) => {
    setSearch(value)
  }, [])

  useEffect(() => {
    setPage(1)
  }, [search])

  const handleOpenCreate = () => {
    setSelectedStore(null)
    setIsModalOpen(true)
  }

  const handleOpenEdit = (store) => {
    setSelectedStore(store)
    setIsModalOpen(true)
  }

  const handleFormSuccess = () => {
    setIsModalOpen(false)
    const actionText = selectedStore ? 'updated' : 'created'
    setSuccessMessage(`Store successfully ${actionText}!`)

    setTimeout(() => {
      setSuccessMessage(null)
    }, 4000)
  }

  const columns = [
    {
      key: 'id',
      label: 'Store ID',
      sortable: true,
      truncate: true,
    },
    {
      key: 'store_name',
      label: 'Store Name',
      sortable: true,
      render: (row) => <span className="font-medium text-slate-900">{row.store_name}</span>,
    },
    {
      key: 'store_code',
      label: 'Store Code',
      sortable: true,
      render: (row) => <span className="text-slate-600 font-semibold">{row.store_code}</span>,
    },
    {
      key: 'contact_person',
      label: 'Contact Person',
      sortable: true,
      render: (row) => <span className="text-slate-600">{row.contact_person || '—'}</span>,
    },
    {
      key: 'contact_number',
      label: 'Contact Number',
      sortable: true,
      render: (row) => <span className="text-slate-600">{row.contact_number || '—'}</span>,
    },
    {
      key: 'is_active',
      label: 'Status',
      sortable: true,
      render: (row) => (
        <span
          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${
            row.is_active === 1 || row.is_active === true
              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200/60'
              : 'bg-slate-100 text-slate-600 border border-slate-200'
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
        can('stores', 'update') ? <ActionButtons onEdit={() => handleOpenEdit(row)} /> : null,
      mobileRender: (row) =>
        can('stores', 'update') ? <EditLink onClick={() => handleOpenEdit(row)} /> : null,
    },
  ]

  return (
    <div className="w-full pb-12 space-y-4">
      {successMessage && (
        <Alert variant="success" title="Success" onDismiss={() => setSuccessMessage(null)}>
          {successMessage}
        </Alert>
      )}

      {/* Professional Outer Container Border */}
      <div className="bg-slate-50/50 border border-slate-200/80 rounded-2xl p-4 sm:p-6 shadow-xs space-y-6 w-full">
        {/* Header Section */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white p-6 rounded-xl border border-slate-100 shadow-xs">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">Store Management</h1>
            <p className="text-sm text-slate-500 mt-0.5">
              {/* Manage stock-holding locations and their contact details. */}
            </p>
          </div>

          {can('stores', 'write') && (
            <Button
              variant="primary"
              size="md"
              icon={<span className="text-lg leading-none">+</span>}
              onClick={handleOpenCreate}
            >
              Add New Store
            </Button>
          )}
        </div>

        {/* Toolbar / Search Section */}
        <div className="bg-white p-4 rounded-xl border border-slate-100 shadow-xs flex items-center justify-between gap-4">
          <div className="w-full md:w-96">
            <SearchBar
              value={search}
              onSearch={handleSearch}
              onChange={handleSearch}
              placeholder="Search by ID, name, code..."
            />
          </div>
          <div className="hidden md:block text-xs font-medium text-slate-400 pr-2">
            Total Stores:{' '}
            <span className="text-slate-700 font-semibold">{filteredStores.length}</span>
          </div>
        </div>

        {/* Data Table Card Container */}
        <div className="bg-white rounded-xl border border-slate-100 shadow-xs overflow-hidden w-full">
          <Table
            columns={columns}
            rows={paginatedStores}
            rowKey="id"
            loading={dataLoading}
            emptyMessage="No stores found matching your criteria."
            minRows={pageSize}
          />

          <div className="p-4 border-t border-slate-100 bg-slate-50/50">
            <Pagination
              page={page}
              totalItems={filteredStores.length}
              pageSize={pageSize}
              onPageChange={setPage}
            />
          </div>
        </div>
      </div>

      {/* Modal Component */}
      <Modal
        open={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={selectedStore ? 'Edit Store' : 'Add New Store'}
        size="lg"
      >
        <StoreForm store={selectedStore} onSuccess={handleFormSuccess} />
      </Modal>
    </div>
  )
}
