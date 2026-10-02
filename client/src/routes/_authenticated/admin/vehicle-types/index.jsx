import { createFileRoute } from '@tanstack/react-router'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { useVehicleTypes } from '@/hooks/useVehicleTypes'
import { usePermissionCheck } from '@/hooks/usePermissionCheck'
import Button from '@/components/ui/Button'
import Modal from '@/components/ui/Modal'
import ActionButtons from '@/components/ui/ActionButtons'
import EditLink from '@/components/ui/EditLink'
import SearchBar from '@/components/ui/SearchBar'
import Pagination from '@/components/ui/Pagination'
import Table from '@/components/ui/Table'
import Alert from '@/components/ui/Alert'
import CreateVehicleTypeForm from './vehicletypeForm/createVehicleTypeForm'
import EditVehicleTypeForm from './vehicletypeForm/editVehicleTypeForm'

export const Route = createFileRoute('/_authenticated/admin/vehicle-types/')({
  component: VehicleTypesPage,
})

function VehicleTypesPage() {
  const { can } = usePermissionCheck()
  const { data: rawVehicleTypes, isLoading: dataLoading, refetch } = useVehicleTypes()

  const [isModalOpen, setIsModalOpen] = useState(false)
  const [selectedType, setSelectedType] = useState(null)
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const [successMessage, setSuccessMessage] = useState(null)
  const pageSize = 6

  const vehicleTypes = useMemo(() => {
    if (!rawVehicleTypes) return []
    return rawVehicleTypes.map((item) => {
      // Check all possible variations returned by the backend/database
      const activeVal = item.vt_isActive ?? item.is_active ?? item.isActive ?? item.status ?? 1 // Default to active if undefined

      return {
        id: item.vt_id || item.id,
        name: item.vt_name || item.name,
        description: item.vt_description || item.description,
        is_active: Number(activeVal),
      }
    })
  }, [rawVehicleTypes])

  const filteredVehicleTypes = useMemo(() => {
    if (!vehicleTypes) return []
    const q = search.trim().toLowerCase()
    if (!q) return vehicleTypes
    return vehicleTypes.filter((t) =>
      [t.id, t.name, t.description].some((f) => f?.toString().toLowerCase().includes(q)),
    )
  }, [vehicleTypes, search])

  const paginatedVehicleTypes = useMemo(() => {
    const start = (page - 1) * pageSize
    return filteredVehicleTypes.slice(start, start + pageSize)
  }, [filteredVehicleTypes, page, pageSize])

  const handleSearch = useCallback((value) => {
    setSearch(value)
  }, [])

  useEffect(() => {
    setPage(1)
  }, [search])

  const handleOpenCreate = () => {
    setSelectedType(null)
    setIsModalOpen(true)
  }

  const handleOpenEdit = (type) => {
    setSelectedType(type)
    setIsModalOpen(true)
  }

  const handleFormSuccess = () => {
    setIsModalOpen(false)
    const actionText = selectedType ? 'updated' : 'created'
    setSuccessMessage(`Vehicle type successfully ${actionText}!`)
    refetch()

    setTimeout(() => {
      setSuccessMessage(null)
    }, 4000)
  }

  const columns = [
    {
      key: 'name',
      label: 'Type Name',
      sortable: true,
      render: (row) => <span className="font-medium text-slate-900">{row.name}</span>,
    },
    {
      key: 'description',
      label: 'Description',
      sortable: true,
      render: (row) => (
        <span className="text-slate-600 max-w-xs truncate block">{row.description || '—'}</span>
      ),
    },
    {
      key: 'is_active',
      label: 'Status',
      sortable: true,
      render: (row) => {
        const isActive = row.is_active === 1 || row.is_active === true || row.is_active === '1'
        return (
          <span
            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${
              isActive
                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200/60'
                : 'bg-slate-100 text-slate-600 border border-slate-200'
            }`}
          >
            {isActive ? 'Active' : 'Inactive'}
          </span>
        )
      },
    },
    {
      key: 'actions',
      label: 'Actions',
      render: (row) =>
        can('vehicle_types', 'update') ? (
          <ActionButtons onEdit={() => handleOpenEdit(row)} />
        ) : null,
      mobileRender: (row) =>
        can('vehicle_types', 'update') ? <EditLink onClick={() => handleOpenEdit(row)} /> : null,
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
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">Vehicle Types</h1>
            <p className="text-sm text-slate-500 mt-0.5">
              Manage categories and types of vehicles in your fleet
            </p>
          </div>

          {(can('vehicle_types', 'write') || can('vehicle_types', 'create')) && (
            <Button
              variant="primary"
              size="md"
              icon={<span className="text-lg leading-none">+</span>}
              onClick={handleOpenCreate}
            >
              Add Vehicle Type
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
              placeholder="Search by name, description..."
            />
          </div>
          <div className="hidden md:block text-xs font-medium text-slate-400 pr-2">
            Total Vehicle Types:{' '}
            <span className="text-slate-700 font-semibold">{filteredVehicleTypes.length}</span>
          </div>
        </div>

        {/* Data Table Card Container */}
        <div className="bg-white rounded-xl border border-slate-100 shadow-xs overflow-hidden w-full">
          <Table
            columns={columns}
            rows={paginatedVehicleTypes}
            rowKey="id"
            loading={dataLoading}
            emptyMessage="No vehicle types found matching your criteria."
            minRows={pageSize}
          />

          <div className="p-4 border-t border-slate-100 bg-slate-50/50">
            <Pagination
              page={page}
              totalItems={filteredVehicleTypes.length}
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
        title={selectedType ? 'Edit Vehicle Type' : 'Add Vehicle Type'}
        size="lg"
      >
        {selectedType ? (
          <EditVehicleTypeForm vehicleType={selectedType} onSuccess={handleFormSuccess} />
        ) : (
          <CreateVehicleTypeForm onSuccess={handleFormSuccess} />
        )}
      </Modal>
    </div>
  )
}
