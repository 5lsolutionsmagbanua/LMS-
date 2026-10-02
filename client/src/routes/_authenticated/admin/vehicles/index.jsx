// client/src/routes/_authenticated/admin/vehicles/index.jsx
import { createFileRoute } from '@tanstack/react-router'
import { useCallback, useEffect, useMemo, useState } from 'react'
import Button from '@/components/ui/Button'
import Modal from '@/components/ui/Modal'
import ActionButtons from '@/components/ui/ActionButtons'
import EditLink from '@/components/ui/EditLink'
import SearchBar from '@/components/ui/SearchBar'
import Pagination from '@/components/ui/Pagination'
import Table from '@/components/ui/Table'
import VehicleCreateForm from './vehiclesForm/vehicleCreateForm'
import VehicleEditForm from './vehiclesForm/vehicleEditForm'
import { useMasterVehicles } from '@/hooks/useMasterVehicles'
import { usePermissionCheck } from '@/hooks/usePermissionCheck'
import {
  Truck,
  Plus,
  CheckCircle2,
  Clock,
  Wrench,
  SlidersHorizontal,
  Car,
  AlertCircle,
} from 'lucide-react'

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

  // Map raw data safely
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

  // Computed summary counts for quick filters
  const stats = useMemo(() => {
    const total = vehicles.length
    const available = vehicles.filter((v) => v.status === 'Available').length
    const inUse = vehicles.filter((v) => v.status === 'In Use').length
    const maintenance = vehicles.filter((v) => v.status === 'Maintenance').length
    return { total, available, inUse, maintenance }
  }, [vehicles])

  // Filter by search query & status filter tab
  const filteredVehicles = useMemo(() => {
    if (!vehicles) return []

    let result = vehicles

    // Status filter
    if (statusFilter !== 'ALL') {
      result = result.filter((v) => v.status === statusFilter)
    }

    // Search query filter
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
          <div className="w-9 h-9 rounded-xl bg-slate-100 border border-slate-200/80 flex items-center justify-center text-slate-600 shadow-2xs">
            <Car className="w-4 h-4" />
          </div>
          <div>
            <span className="font-bold font-mono tracking-wide text-slate-900">
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
          <span className="font-medium text-slate-800">{row.brand || '—'}</span>
          {row.model && (
            <span className="text-slate-500 text-sm ml-1.5 font-normal">/ {row.model}</span>
          )}
        </div>
      ),
    },
    {
      key: 'capacity',
      label: 'Capacity',
      sortable: true,
      render: (row) => (
        <span className="inline-flex items-center px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 text-xs font-medium">
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
            badge: 'bg-emerald-50 text-emerald-700 border-emerald-200/80',
            dot: 'bg-emerald-500',
            icon: CheckCircle2,
          },
          'In Use': {
            badge: 'bg-blue-50 text-blue-700 border-blue-200/80',
            dot: 'bg-blue-500',
            icon: Clock,
          },
          Maintenance: {
            badge: 'bg-amber-50 text-amber-700 border-amber-200/80',
            dot: 'bg-amber-500',
            icon: Wrench,
          },
        }

        const config = statusConfig[row.status] || {
          badge: 'bg-slate-100 text-slate-600 border-slate-200',
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
      <div className="bg-slate-50/50 border border-slate-200/80 rounded-2xl p-4 sm:p-6 shadow-xs space-y-6 w-full">
        {/* Top Header Card */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white p-6 rounded-xl border border-slate-100 shadow-xs">
          <div>
            <div className="flex items-center gap-2.5">
              <div className="p-2 bg-indigo-50 border border-indigo-100 rounded-xl text-indigo-600 shadow-2xs">
                <Truck className="w-5 h-5" />
              </div>
              <h1 className="text-2xl font-bold tracking-tight text-slate-900">
                Vehicle Management
              </h1>
            </div>
            <p className="text-sm text-slate-500 mt-0.5 pl-9">
              {/* Seamlessly monitor fleet health, registration records, and active vehicle assignments. */}
            </p>
          </div>

          {can('vehicles', 'write') && (
            <Button
              variant="primary"
              size="md"
              icon={<Plus className="w-4 h-4" />}
              onClick={handleOpenCreate}
            >
              Add New Vehicle
            </Button>
          )}
        </div>

        {/* Quick Summary Metrics Bar */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            {
              label: 'Total Fleet',
              count: stats.total,
              filter: 'ALL',
              color: 'text-slate-900 bg-white border-slate-200',
            },
            {
              label: 'Available',
              count: stats.available,
              filter: 'Available',
              color: 'text-emerald-700 bg-emerald-50/50 border-emerald-100',
            },
            {
              label: 'In Use',
              count: stats.inUse,
              filter: 'In Use',
              color: 'text-blue-700 bg-blue-50/50 border-blue-100',
            },
            {
              label: 'Maintenance',
              count: stats.maintenance,
              filter: 'Maintenance',
              color: 'text-amber-700 bg-amber-50/50 border-amber-100',
            },
          ].map((item, idx) => (
            <button
              key={idx}
              onClick={() => setStatusFilter(item.filter)}
              className={`p-4 rounded-xl border text-left transition-all shadow-2xs hover:shadow-xs cursor-pointer ${
                statusFilter === item.filter
                  ? 'ring-2 ring-indigo-600/25 border-indigo-500 bg-white'
                  : item.color
              }`}
            >
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                {item.label}
              </p>
              <p className="text-2xl font-bold mt-1 tracking-tight">{item.count}</p>
            </button>
          ))}
        </div>

        {/* Filter and Search Bar Section */}
        <div className="bg-white p-4 rounded-xl border border-slate-100 shadow-xs flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
          <div className="w-full md:w-96">
            <SearchBar
              value={search}
              onSearch={handleSearch}
              placeholder="Search by plate number, brand, model..."
            />
          </div>

          <div className="flex items-center justify-between md:justify-end gap-3 px-1 text-xs text-slate-500">
            <div className="flex items-center gap-1.5 font-medium">
              <SlidersHorizontal className="w-3.5 h-3.5 text-slate-400" />
              Showing <span className="text-slate-800 font-bold">
                {filteredVehicles.length}
              </span> of {vehicles.length} entries
            </div>
            {statusFilter !== 'ALL' && (
              <button
                onClick={() => setStatusFilter('ALL')}
                className="text-indigo-600 font-semibold hover:underline"
              >
                Clear filter
              </button>
            )}
          </div>
        </div>

        {/* Table Section */}
        <div className="bg-white rounded-xl border border-slate-100 shadow-xs overflow-hidden w-full">
          <Table
            columns={columns}
            rows={paginatedVehicles}
            rowKey="id"
            emptyMessage={
              <div className="py-12 flex flex-col items-center justify-center text-center">
                <div className="w-12 h-12 rounded-full bg-slate-50 border border-slate-200 flex items-center justify-center text-slate-400 mb-3 shadow-2xs">
                  <Car className="w-6 h-6" />
                </div>
                <p className="text-slate-800 font-medium">
                  {dataLoading ? 'Loading vehicles data...' : 'No vehicles found'}
                </p>
                <p className="text-xs text-slate-400 mt-1 max-w-xs">
                  {dataLoading
                    ? 'Please wait while we fetch the latest records.'
                    : 'Try adjusting your search query or filter options to find what you are looking for.'}
                </p>
              </div>
            }
            minRows={pageSize}
          />

          <div className="p-4 border-t border-slate-100 bg-slate-50/50">
            <Pagination
              page={page}
              totalItems={filteredVehicles.length}
              pageSize={pageSize}
              onPageChange={setPage}
            />
          </div>
        </div>
      </div>

      {/* Create / Edit Modal */}
      <Modal
        open={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={selectedVehicle ? 'Edit Vehicle Record' : 'Register New Vfast and furious diedehicle'}
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
