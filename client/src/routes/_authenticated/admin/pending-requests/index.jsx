// client/src/routes/_authenticated/admin/pending-requests/index.jsx
import { createFileRoute } from '@tanstack/react-router'
import { useState, useMemo, useCallback, useEffect } from 'react'
import Button from '../../../../components/ui/Button'
import Modal from '../../../../components/ui/Modal'
import SearchBar from '../../../../components/ui/SearchBar'
import Table from '../../../../components/ui/Table'
import Pagination from '../../../../components/ui/Pagination'
import Alert from '../../../../components/ui/Alert'
import ActionButtons from '../../../../components/ui/ActionButtons'
import { usePendingRequests } from '../../../../hooks/usePendingRequestWithItems'
import { useApprovePendingRequest } from '../../../../hooks/usePendingRequestApproval'
import { useDispatchMonitoring } from '../../../../hooks/useDispatch'
import { usePermissionCheck } from '../../../../hooks/usePermissionCheck'
import PendingRequestForm from './pendingRequestsForm/PendingRequestForm'
import PendingRequestEditForm from './pendingRequestsForm/PendingRequestEditForm'
import PendingRequestView from './pendingRequestsForm/PendingRequestView'
import AssignDispatchForm from './pendingRequestsForm/AssignDispatchForm'

export const Route = createFileRoute('/_authenticated/admin/pending-requests/')({
  component: PendingRequestsRoute,
})

const STATUS_STYLES = {
  pending:
    'bg-amber-50 text-amber-700 border-amber-200/60 dark:bg-amber-950/40 dark:text-amber-400 dark:border-amber-800/50',
  confirmed:
    'bg-blue-50 text-blue-700 border-blue-200/60 dark:bg-blue-950/40 dark:text-blue-400 dark:border-blue-800/50',
  ready_for_dispatch:
    'bg-indigo-50 text-indigo-700 border-indigo-200/60 dark:bg-indigo-950/40 dark:text-indigo-400 dark:border-indigo-800/50',
  dispatched:
    'bg-emerald-50 text-emerald-700 border-emerald-200/60 dark:bg-emerald-950/40 dark:text-emerald-400 dark:border-emerald-800/50',
  failed:
    'bg-rose-50 text-rose-700 border-rose-200/60 dark:bg-rose-950/40 dark:text-rose-400 dark:border-rose-800/50',
  cancelled:
    'bg-slate-100 text-slate-600 border-slate-200 dark:bg-slate-800 dark:text-slate-400 dark:border-slate-700',
}

const EDIT_LOCKED_STATUSES = ['ready_for_dispatch', 'dispatched']
const REASSIGNABLE_DISPATCH_STATUSES = ['assigned', 'cancelled']

function StatusBadge({ status }) {
  const style = STATUS_STYLES[status?.toLowerCase()] || STATUS_STYLES.pending
  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border ${style}`}
    >
      {status ? status.replace(/_/g, ' ') : '—'}
    </span>
  )
}

function PendingRequestsRoute() {
  const { can } = usePermissionCheck()
  const { data: rawRequests, isLoading, refetch } = usePendingRequests()
  const { data: rawDispatches } = useDispatchMonitoring({}, can('dispatch', 'read'))
  const approveMutation = useApprovePendingRequest()

  const [isNewModalOpen, setIsNewModalOpen] = useState(false)
  const [selectedRequest, setSelectedRequest] = useState(null)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [requestToEdit, setRequestToEdit] = useState(null)
  const [requestToApprove, setRequestToApprove] = useState(null)
  const [requestToAssign, setRequestToAssign] = useState(null)

  const [searchQuery, setSearchQuery] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [activeActionId, setActiveActionId] = useState(null)

  const [errorMessage, setErrorMessage] = useState(null)
  const [editErrorMessage, setEditErrorMessage] = useState(null)
  const [successMessage, setSuccessMessage] = useState(null)

  const pageSize = 4

  const requests = rawRequests ?? []

  const dispatchByRequest = useMemo(
    () => new Map((rawDispatches ?? []).map((d) => [d.requestId, d])),
    [rawDispatches],
  )

  const handleApproveConfirm = () => {
    if (!requestToApprove) return
    const reqId = requestToApprove.requestId

    setErrorMessage(null)
    setSuccessMessage(null)
    setActiveActionId(reqId)

    approveMutation.mutate(reqId, {
      onSuccess: () => {
        setActiveActionId(null)
        setRequestToApprove(null)
        setSuccessMessage('Pending request approved successfully.')
        refetch()
      },
      onError: (err) => {
        setActiveActionId(null)
        setRequestToApprove(null)
        setErrorMessage(
          err.response?.data?.message || 'Failed to approve request. Please try again.',
        )
      },
    })
  }

  const handleAssigned = (wasReassign) => {
    setRequestToAssign(null)
    setErrorMessage(null)
    setSuccessMessage(
      wasReassign
        ? 'Dispatch reassigned successfully.'
        : 'Driver and vehicle assigned successfully.',
    )
  }

  const filteredRequests = useMemo(() => {
    const q = searchQuery.trim().toLowerCase()
    if (!q) return requests
    return requests.filter((req) =>
      [req.requestId, req.ticketNumber, req.branchName, req.storeName].some((f) =>
        f?.toString().toLowerCase().includes(q),
      ),
    )
  }, [requests, searchQuery])

  const paginatedData = useMemo(() => {
    const start = (currentPage - 1) * pageSize
    return filteredRequests.slice(start, start + pageSize)
  }, [filteredRequests, currentPage, pageSize])

  const handleSearch = useCallback((value) => {
    setSearchQuery(value)
  }, [])

  useEffect(() => {
    setCurrentPage(1)
  }, [searchQuery])

  const handleRequestCreated = () => {
    setIsNewModalOpen(false)
    setCurrentPage(1)
    setSuccessMessage('New stock request created successfully.')
    setErrorMessage(null)
    setEditErrorMessage(null)
    refetch()
  }

  const handleRequestUpdated = () => {
    setIsEditModalOpen(false)
    setRequestToEdit(null)
    setEditErrorMessage(null)
    setSuccessMessage('Stock request updated successfully.')
    refetch()
  }

  const handleEditError = (err) => {
    setEditErrorMessage(
      err.response?.data?.message || 'Failed to update request. Please try again.',
    )
  }

  const canAssignRow = (row) => {
    const dispatch = dispatchByRequest.get(row.requestId)
    const isApproved = row.status?.toLowerCase() === 'ready_for_dispatch'
    const changeable = !dispatch || REASSIGNABLE_DISPATCH_STATUSES.includes(dispatch.status)
    return can('dispatch', 'write') && isApproved && changeable
  }

  const columns = [
    {
      key: 'requestId',
      label: 'Request ID',
      sortable: true,
      render: (row) => (
        <span className="font-mono text-xs text-slate-500 dark:text-slate-400">
          {row.requestId}
        </span>
      ),
    },
    {
      key: 'ticketNumber',
      label: 'Ticket #',
      sortable: true,
      render: (row) => (
        <span className="text-slate-600 dark:text-slate-400">{row.ticketNumber || '—'}</span>
      ),
    },
    {
      key: 'branchName',
      label: 'Branch',
      sortable: true,
      render: (row) => (
        <span className="font-medium text-slate-900 dark:text-slate-100">
          {row.branchName || '—'}
        </span>
      ),
    },
    {
      key: 'storeName',
      label: 'Store',
      sortable: true,
      render: (row) => (
        <span className="text-slate-600 dark:text-slate-400">{row.storeName || '—'}</span>
      ),
    },
    {
      key: 'requestType',
      label: 'Type',
      sortable: true,
      render: (row) => (
        <span className="text-slate-600 dark:text-slate-400">{row.requestType || '—'}</span>
      ),
    },
    {
      key: 'status',
      label: 'Status',
      sortable: true,
      render: (row) => <StatusBadge status={row.status} />,
    },
    {
      key: 'dispatch',
      label: 'Dispatch',
      sortable: false,
      render: (row) => {
        const d = dispatchByRequest.get(row.requestId)
        if (!d) return <span className="text-slate-400">—</span>
        return (
          <div className="leading-tight">
            <span className="block text-xs font-semibold text-slate-800 dark:text-slate-200">
              {d.vehiclePlateNumber} · {d.driverName}
            </span>
            <span className="block text-[11px] text-slate-500 dark:text-slate-400">
              {d.targetStoreName} · {d.status.replace(/_/g, ' ')}
            </span>
          </div>
        )
      },
    },
    {
      key: 'actions',
      label: 'Actions',
      sortable: false,
      render: (row) => {
        const normalizedStatus = row.status?.toLowerCase()
        const dispatch = dispatchByRequest.get(row.requestId)

        const isEditLocked = EDIT_LOCKED_STATUSES.includes(normalizedStatus)

        const canApprove =
          can('pending_request_approval', 'update') &&
          (normalizedStatus === 'pending' || normalizedStatus === 'confirmed')

        const canEdit = can('pending_requests', 'update') && !isEditLocked

        const canAssign = canAssignRow(row)

        return (
          <div className="flex items-center justify-start gap-2">
            <ActionButtons
              onView={() => setSelectedRequest(row)}
              onEdit={
                canEdit
                  ? () => {
                      setEditErrorMessage(null)
                      setRequestToEdit(row)
                      setIsEditModalOpen(true)
                    }
                  : undefined
              }
              onApprove={canApprove ? () => setRequestToApprove(row) : undefined}
            />
            {canAssign && (
              <button
                type="button"
                onClick={() => {
                  setErrorMessage(null)
                  setSuccessMessage(null)
                  setRequestToAssign(row)
                }}
                className="inline-flex items-center rounded-lg bg-primary px-2.5 py-1 text-xs font-semibold text-on-primary shadow-2xs transition-colors hover:bg-primary-hover cursor-pointer"
              >
                {dispatch ? 'Reassign' : 'Assign'}
              </button>
            )}
          </div>
        )
      },
    },
  ]

  return (
    <div className="w-full pb-12">
      {/* Outer Container with Thicker Theme-Adaptive Border */}
      <div className="bg-slate-50/60 dark:bg-slate-900/40 border-2 border-primary/20 dark:border-primary/30 rounded-2xl p-4 sm:p-6 shadow-2xs space-y-6 w-full backdrop-blur-sm transition-colors">
        {/* Unified Liquify Gradient Header Card with Subtitle */}
        <div className="bg-gradient-to-r from-primary via-primary/90 to-primary/80 p-6 rounded-xl border border-white/10 shadow-md backdrop-blur-md text-on-primary">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold tracking-tight drop-shadow-2xs">Stock Requests</h1>
              <p className="text-sm opacity-75 mt-0.5">
                Manage stock requests, approvals, and dispatch assignments.
              </p>
            </div>

            {can('pending_requests', 'write') && (
              <Button
                variant="liquid"
                size="md"
                className="ring-1 ring-inset ring-slate-900/10 dark:ring-white/20"
                icon={<span className="text-lg leading-none">+</span>}
                onClick={() => {
                  setErrorMessage(null)
                  setEditErrorMessage(null)
                  setIsNewModalOpen(true)
                }}
              >
                New Request
              </Button>
            )}
          </div>
        </div>

        {successMessage && (
          <Alert variant="success" title="Success" onDismiss={() => setSuccessMessage(null)}>
            {successMessage}
          </Alert>
        )}
        {errorMessage && (
          <Alert variant="error" title="Approval Error" onDismiss={() => setErrorMessage(null)}>
            {errorMessage}
          </Alert>
        )}
        {editErrorMessage && (
          <Alert variant="error" title="Edit Error" onDismiss={() => setEditErrorMessage(null)}>
            {editErrorMessage}
          </Alert>
        )}

        {/* Data Table Card Container with Thicker Theme-Adaptive Border */}
        <div className="bg-white dark:bg-slate-900/60 rounded-xl border-2 border-primary/20 dark:border-primary/30 shadow-2xs overflow-hidden w-full transition-colors">
          <Table
            columns={columns}
            rows={paginatedData}
            rowKey="requestId"
            loading={isLoading}
            emptyMessage="No pending requests found matching your criteria."
            minRows={pageSize}
          />

          {/* Merged Footer: Search Bar, Total Requests & Pagination in a Row */}
          <div className="p-4 border-t-2 border-primary/20 dark:border-primary/30 bg-slate-50/50 dark:bg-slate-900/40 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-4 w-full sm:w-auto">
              <div className="w-full sm:w-72">
                <SearchBar
                  value={searchQuery}
                  onSearch={handleSearch}
                  placeholder="Search requests..."
                />
              </div>
              <div className="text-xs font-medium text-slate-500 dark:text-slate-400 whitespace-nowrap hidden sm:block">
                Total Requests:{' '}
                <span className="font-semibold text-slate-700 dark:text-slate-200">
                  {filteredRequests.length}
                </span>
              </div>
            </div>

            <Pagination
              page={currentPage}
              totalItems={filteredRequests.length}
              pageSize={pageSize}
              onPageChange={setCurrentPage}
            />
          </div>
        </div>
      </div>

      <Modal
        open={isNewModalOpen}
        onClose={() => setIsNewModalOpen(false)}
        title="New Stock Request"
        size="lg"
      >
        <div className="max-h-[75vh] overflow-y-auto pr-1">
          <PendingRequestForm onCreated={handleRequestCreated} />
        </div>
      </Modal>

      <Modal
        open={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false)
          setRequestToEdit(null)
        }}
        title="Edit Stock Request"
        size="lg"
      >
        <div className="max-h-[75vh] overflow-y-auto pr-1">
          {requestToEdit && (
            <PendingRequestEditForm
              requestId={requestToEdit.requestId}
              initialData={requestToEdit}
              onUpdated={handleRequestUpdated}
              onError={handleEditError}
            />
          )}
        </div>
      </Modal>

      <Modal
        open={Boolean(selectedRequest)}
        onClose={() => setSelectedRequest(null)}
        title="Stock Request Details"
        size="lg"
      >
        <PendingRequestView
          request={selectedRequest}
          dispatch={selectedRequest ? dispatchByRequest.get(selectedRequest.requestId) : undefined}
          onAssign={
            selectedRequest && canAssignRow(selectedRequest)
              ? () => {
                  setErrorMessage(null)
                  setSuccessMessage(null)
                  setRequestToAssign(selectedRequest)
                  setSelectedRequest(null)
                }
              : undefined
          }
          onClose={() => setSelectedRequest(null)}
        />
      </Modal>

      <Modal
        open={Boolean(requestToApprove)}
        onClose={() => setRequestToApprove(null)}
        title="Approve Stock Request"
        size="sm"
      >
        <div className="space-y-4">
          <p className="text-sm text-slate-600 dark:text-slate-300">
            Are you sure you want to approve request{' '}
            <span className="font-semibold text-slate-900 dark:text-white">
              {requestToApprove?.requestId}
            </span>
            ? This will move it forward in the dispatch workflow.
          </p>
          <div className="flex justify-end gap-3 pt-2">
            <Button variant="secondary" onClick={() => setRequestToApprove(null)}>
              Cancel
            </Button>
            <Button
              variant="liquid"
              loading={activeActionId === requestToApprove?.requestId}
              onClick={handleApproveConfirm}
            >
              Confirm Approval
            </Button>
          </div>
        </div>
      </Modal>

      <Modal
        open={Boolean(requestToAssign)}
        onClose={() => setRequestToAssign(null)}
        title={
          dispatchByRequest.has(requestToAssign?.requestId)
            ? 'Reassign Driver & Vehicle'
            : 'Assign Driver & Vehicle'
        }
        size="lg"
      >
        <div className="max-h-[75vh] overflow-y-auto pr-1">
          {requestToAssign && (
            <AssignDispatchForm
              request={requestToAssign}
              dispatch={dispatchByRequest.get(requestToAssign.requestId)}
              onAssigned={handleAssigned}
              onCancel={() => setRequestToAssign(null)}
            />
          )}
        </div>
      </Modal>
    </div>
  )
}
