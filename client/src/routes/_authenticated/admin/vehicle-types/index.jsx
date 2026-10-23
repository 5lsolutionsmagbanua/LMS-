// client/src/routes/_authenticated/admin/vehicle-types/index.jsx
import { createFileRoute } from '@tanstack/react-router'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { useVehicleTypes } from '../../../../hooks/useVehicleTypes'
import { usePermissionCheck } from '../../../../hooks/usePermissionCheck'
import Button from '../../../../components/ui/Button'
import Modal from '../../../../components/ui/Modal'
import ActionButtons from '../../../../components/ui/ActionButtons'
import EditLink from '../../../../components/ui/EditLink'
import SearchBar from '../../../../components/ui/SearchBar'
import Pagination from '../../../../components/ui/Pagination'
import Table from '../../../../components/ui/Table'
import Alert from '../../../../components/ui/Alert'
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
      const activeVal = item.vt_isActive ?? item.is_active ?? item.isActive ?? item.status ?? 1

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
      render: (row) => (
        <span className="font-medium text-slate-900 dark:text-slate-100">{row.name}</span>
      ),
    },
    {
      key: 'description',
      label: 'Description',
      sortable: true,
      render: (row) => (
        <span className="text-slate-600 dark:text-slate-400 max-w-xs truncate block">
          {row.description || '—'}
        </span>
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
                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200/60 dark:bg-emerald-950/40 dark:text-emerald-400 dark:border-emerald-800/50'
                : 'bg-slate-100 text-slate-600 border border-slate-200 dark:bg-slate-800 dark:text-slate-400 dark:border-slate-700'
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
      {/* Outer Container with Thicker Theme-Adaptive Border */}
      <div className="bg-slate-50/60 dark:bg-slate-900/40 border-2 border-primary/20 dark:border-primary/30 rounded-2xl p-4 sm:p-6 shadow-2xs space-y-6 w-full backdrop-blur-sm transition-colors">
        {successMessage && (
          <Alert variant="success" title="Success" onDismiss={() => setSuccessMessage(null)}>
            {successMessage}
          </Alert>
        )}

        {/* Unified Liquify Gradient Header Card */}
        <div className="bg-gradient-to-r from-primary via-primary/90 to-primary/80 p-6 rounded-xl border border-white/10 shadow-md backdrop-blur-md text-on-primary">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold tracking-tight h1 drop-shadow-2xs">
                Vehicle Types
              </h1>
              <p className="text-sm opacity-75 mt-0.5">
                Manage categories and types of vehicles in your fleet.
              </p>
            </div>

            {(can('vehicle_types', 'write') || can('vehicle_types', 'create')) && (
              <Button
                variant="liquid"
                size="md"
                icon={<span className="text-lg leading-none">+</span>}
                onClick={handleOpenCreate}
              >
                Add Vehicle Type
              </Button>
            )}
          </div>
        </div>

        {/* Data Table Card Container with Thicker Theme-Adaptive Border */}
        <div className="bg-white dark:bg-slate-900/60 rounded-xl border-2 border-primary/20 dark:border-primary/30 shadow-2xs overflow-hidden w-full transition-colors">
          <Table
            columns={columns}
            rows={paginatedVehicleTypes}
            rowKey="id"
            loading={dataLoading}
            emptyMessage="No vehicle types found matching your criteria."
            minRows={pageSize}
          />

          {/* Merged Footer: Search Bar, Total Vehicle Types & Pagination in a Row */}
          <div className="p-4 border-t-2 border-primary/20 dark:border-primary/30 bg-slate-50/50 dark:bg-slate-900/40 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-4 w-full sm:w-auto">
              <div className="w-full sm:w-72">
                <SearchBar
                  value={search}
                  onSearch={handleSearch}
                  placeholder="Search by name, description..."
                />
              </div>
              <div className="text-xs font-medium text-slate-500 dark:text-slate-400 whitespace-nowrap hidden sm:block">
                Total Vehicle Types:{' '}
                <span className="font-semibold text-slate-700 dark:text-slate-200">
                  {filteredVehicleTypes.length}
                </span>
              </div>
            </div>

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
