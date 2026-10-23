// client/src/routes/_authenticated/admin/vehicles/index.jsx
import { createFileRoute } from '@tanstack/react-router'
import { useCallback, useEffect, useMemo, useState } from 'react'
import Button from '../../../../components/ui/Button'
import Modal from '../../../../components/ui/Modal'
import ActionButtons from '../../../../components/ui/ActionButtons'
import EditLink from '../../../../components/ui/EditLink'
import SearchBar from '../../../../components/ui/SearchBar'
import Pagination from '../../../../components/ui/Pagination'
import Table from '../../../../components/ui/Table'
import VehicleCreateForm from './vehiclesForm/vehicleCreateForm'
import VehicleEditForm from './vehiclesForm/vehicleEditForm'
import { useMasterVehicles } from '../../../../hooks/useMasterVehicles'
import { usePermissionCheck } from '../../../../hooks/usePermissionCheck'
import { Car, CheckCircle2, Clock, Wrench, AlertCircle } from 'lucide-react'

export const Route = createFileRoute('/_authenticated/admin/vehicles/')({
  component: VehiclesRoute,
})

function VehiclesRoute() {
  const { can } = usePermissionCheck()
  const { data: rawVehicles, isLoading: dataLoading } = useMasterVehicles()

  const [isModalOpen, setIsModalOpen] = useState(false)
  const [selectedVehicle, setSelectedVehicle] = useState(null)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('ALL')
  const [page, setPage] = useState(1)
  const pageSize = 5

  const vehicles = useMemo(() => {
    if (!rawVehicles) return []
    return rawVehicles.map((item) => ({
      id: item.id || item.vehicle_id,
      plate_number: item.plate_number,
      vehicleTypeId: item.vehicleTypeId,
      vehicleImage: item.vehicleImage,
      brand: item.brand,
      model: item.model,
      capacity: item.capacity,
      color: item.color,
      fuel_type: item.fuel_type,
      odometer: item.odometer,
      file_number: item.file_number,
      or_number: item.or_number,
      cr_number: item.cr_number,
      registration_expiry: item.registration_expiry,
      remarks: item.remarks,
      status: item.status || 'Available',
    }))
  }, [rawVehicles])

  const filteredVehicles = useMemo(() => {
    if (!vehicles) return []

    let result = vehicles

    if (statusFilter !== 'ALL') {
      result = result.filter((v) => v.status === statusFilter)
    }

    const q = search.trim().toLowerCase()
    if (q) {
      result = result.filter((v) =>
        [v.plate_number, v.brand, v.model, v.color, v.status, v.id].some((f) =>
          f?.toString().toLowerCase().includes(q),
        ),
      )
    }

    return result
  }, [vehicles, search, statusFilter])

  const paginatedVehicles = useMemo(() => {
    const start = (page - 1) * pageSize
    return filteredVehicles.slice(start, start + pageSize)
  }, [filteredVehicles, page, pageSize])

  const handleSearch = useCallback((value) => setSearch(value), [])

  useEffect(() => {
    setPage(1)
  }, [search, statusFilter])

  const handleOpenCreate = () => {
    setSelectedVehicle(null)
    setIsModalOpen(true)
  }

  const handleOpenEdit = (vehicle) => {
    setSelectedVehicle(vehicle)
    setIsModalOpen(true)
  }

  const columns = [
    {
      key: 'plate_number',
      label: 'Plate Number',
      sortable: true,
      render: (row) => (
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200/80 dark:border-white/10 flex items-center justify-center text-slate-600 dark:text-slate-300 shadow-2xs">
            <Car className="w-4 h-4" />
          </div>
          <div>
            <span className="font-bold font-mono tracking-wide text-slate-900 dark:text-slate-100">
              {row.plate_number}
            </span>
            {row.color && <p className="text-xs text-slate-400 capitalize">{row.color}</p>}
          </div>
        </div>
      ),
    },
    {
      key: 'brand_model',
      label: 'Brand / Model',
      sortable: true,
      render: (row) => (
        <div>
          <span className="font-medium text-slate-800 dark:text-slate-200">{row.brand || '—'}</span>
          {row.model && (
            <span className="text-slate-500 dark:text-slate-400 text-sm ml-1.5 font-normal">
              / {row.model}
            </span>
          )}
        </div>
      ),
    },
    {
      key: 'capacity',
      label: 'Capacity',
      sortable: true,
      render: (row) => (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-medium border border-slate-200/60 dark:border-white/10">
          {row.capacity ? `${row.capacity} Seats` : '—'}
        </span>
      ),
    },
    {
      key: 'status',
      label: 'Status',
      sortable: true,
      render: (row) => {
        const statusConfig = {
          Available: {
            badge:
              'bg-emerald-50 text-emerald-700 border-emerald-200/80 dark:bg-emerald-950/40 dark:text-emerald-400 dark:border-emerald-800/50',
            dot: 'bg-emerald-500',
            icon: CheckCircle2,
          },
          'In Use': {
            badge:
              'bg-blue-50 text-blue-700 border-blue-200/80 dark:bg-blue-950/40 dark:text-blue-400 dark:border-blue-800/50',
            dot: 'bg-blue-500',
            icon: Clock,
          },
          Maintenance: {
            badge:
              'bg-amber-50 text-amber-700 border-amber-200/80 dark:bg-amber-950/40 dark:text-amber-400 dark:border-amber-800/50',
            dot: 'bg-amber-500',
            icon: Wrench,
          },
        }

        const config = statusConfig[row.status] || {
          badge:
            'bg-slate-100 text-slate-600 border-slate-200 dark:bg-slate-800 dark:text-slate-400 dark:border-slate-700',
          dot: 'bg-slate-400',
          icon: AlertCircle,
        }

        return (
          <span
            className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border shadow-2xs ${config.badge}`}
          >
            <span className={`w-1.5 h-1.5 rounded-full ${config.dot}`} />
            {row.status}
          </span>
        )
      },
    },
    {
      key: 'actions',
      label: 'Actions',
      render: (row) =>
        can('vehicles', 'update') ? <ActionButtons onEdit={() => handleOpenEdit(row)} /> : null,
      mobileRender: (row) =>
        can('vehicles', 'update') ? <EditLink onClick={() => handleOpenEdit(row)} /> : null,
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
                Vehicle Management
              </h1>
              <p className="text-sm opacity-75 mt-0.5">
                Manage fleet vehicles, documentation, and operational statuses.
              </p>
            </div>

            {can('vehicles', 'write') && (
              <Button
                variant="liquid"
                size="md"
                icon={<span className="text-lg leading-none">+</span>}
                onClick={handleOpenCreate}
              >
                Add New Vehicle
              </Button>
            )}
          </div>
        </div>

        {/* Data Table Card Container with Thicker Theme-Adaptive Border */}
        <div className="bg-white dark:bg-slate-900/60 rounded-xl border-2 border-primary/20 dark:border-primary/30 shadow-2xs overflow-hidden w-full transition-colors">
          <Table
            columns={columns}
            rows={paginatedVehicles}
            rowKey="id"
            loading={dataLoading}
            emptyMessage="No vehicles found matching your criteria."
            minRows={pageSize}
          />

          {/* Merged Footer: Search Bar, Total Vehicles & Pagination in a Row */}
          <div className="p-4 border-t-2 border-primary/20 dark:border-primary/30 bg-slate-50/50 dark:bg-slate-900/40 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-4 w-full sm:w-auto">
              <div className="w-full sm:w-72">
                <SearchBar
                  value={search}
                  onSearch={handleSearch}
                  placeholder="Search by plate, brand, model..."
                />
              </div>
              <div className="text-xs font-medium text-slate-500 dark:text-slate-400 whitespace-nowrap hidden sm:block">
                Total Vehicles:{' '}
                <span className="font-semibold text-slate-700 dark:text-slate-200">
                  {filteredVehicles.length}
                </span>
              </div>
            </div>

            <Pagination
              page={page}
              totalItems={filteredVehicles.length}
              pageSize={pageSize}
              onPageChange={setPage}
            />
          </div>
        </div>
      </div>

      <Modal
        open={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={selectedVehicle ? 'Edit Vehicle' : 'Add New Vehicle'}
        size="lg"
      >
        {selectedVehicle ? (
          <VehicleEditForm vehicle={selectedVehicle} onSuccess={() => setIsModalOpen(false)} />
        ) : (
          <VehicleCreateForm onSuccess={() => setIsModalOpen(false)} />
        )}
      </Modal>
    </div>
  )
}
