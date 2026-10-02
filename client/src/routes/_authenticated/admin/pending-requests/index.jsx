import { createFileRoute } from '@tanstack/react-router'
import { useState, useMemo, useCallback, useEffect } from 'react'
import Button from '@/components/ui/Button'
import Modal from '@/components/ui/Modal'
import SearchBar from '@/components/ui/SearchBar'
import Table from '@/components/ui/Table'
import Pagination from '@/components/ui/Pagination'
import Alert from '@/components/ui/Alert'
import ActionButtons from '@/components/ui/ActionButtons'
import { usePendingRequests } from '@/hooks/usePendingRequestWithItems'
import { useApprovePendingRequest } from '@/hooks/usePendingRequestApproval'
import { usePermissionCheck } from '@/hooks/usePermissionCheck'
import PendingRequestForm from './pendingRequestsForm/PendingRequestForm'
import PendingRequestEditForm from './pendingRequestsForm/PendingRequestEditForm'
import PendingRequestView from './pendingRequestsForm/PendingRequestView'

export const Route = createFileRoute('/_authenticated/admin/pending-requests/')({
  component: PendingRequestsRoute,
})

const STATUS_STYLES = {
  pending: 'bg-amber-50 text-amber-700 border-amber-200/60',
  confirmed: 'bg-blue-50 text-blue-700 border-blue-200/60',
  ready_for_dispatch: 'bg-indigo-50 text-indigo-700 border-indigo-200/60',
  dispatched: 'bg-emerald-50 text-emerald-700 border-emerald-200/60',
  failed: 'bg-rose-50 text-rose-700 border-rose-200/60',
  cancelled: 'bg-slate-100 text-slate-600 border-slate-200',
}

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
  const approveMutation = useApprovePendingRequest()

  const [isNewModalOpen, setIsNewModalOpen] = useState(false)
  const [selectedRequest, setSelectedRequest] = useState(null)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [requestToEdit, setRequestToEdit] = useState(null)
  const [requestToApprove, setRequestToApprove] = useState(null)

  const [searchQuery, setSearchQuery] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [activeActionId, setActiveActionId] = useState(null)

  const [errorMessage, setErrorMessage] = useState(null)
  const [editErrorMessage, setEditErrorMessage] = useState(null)
  const [successMessage, setSuccessMessage] = useState(null)

  const pageSize = 4

  const requests = rawRequests ?? []

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

  const columns = [
    {
      key: 'requestId',
      label: 'Request ID',
      sortable: true,
      render: (row) => <span className="font-mono text-xs text-slate-500">{row.requestId}</span>,
    },
    {
      key: 'ticketNumber',
      label: 'Ticket #',
      sortable: true,
      render: (row) => <span className="text-slate-600">{row.ticketNumber || '—'}</span>,
    },
    {
      key: 'branchName',
      label: 'Branch',
      sortable: true,
      render: (row) => <span className="font-medium text-slate-900">{row.branchName || '—'}</span>,
    },
    {
      key: 'storeName',
      label: 'Store',
      sortable: true,
      render: (row) => <span className="text-slate-600">{row.storeName || '—'}</span>,
    },
    {
      key: 'requestType',
      label: 'Type',
      sortable: true,
      render: (row) => <span className="text-slate-600">{row.requestType || '—'}</span>,
    },
    {
      key: 'status',
      label: 'Status',
      sortable: true,
      render: (row) => <StatusBadge status={row.status} />,
    },
    {
      key: 'actions',
      label: 'Actions',
      sortable: false,
      render: (row) => {
        const normalizedStatus = row.status?.toLowerCase()
        const canApprove =
          can('pending_request_approval', 'update') &&
          (normalizedStatus === 'pending' || normalizedStatus === 'confirmed')

        return (
          <div className="flex items-center justify-start">
            <ActionButtons
              onView={() => setSelectedRequest(row)}
              onEdit={
                can('pending_requests', 'update')
                  ? () => {
                      setEditErrorMessage(null)
                      setRequestToEdit(row)
                      setIsEditModalOpen(true)
                    }
                  : undefined
              }
              onApprove={canApprove ? () => setRequestToApprove(row) : undefined}
            />
          </div>
        )
      },
    },
  ]

  return (
    <div className="w-full pb-12">
      <div className="bg-slate-50/50 border border-slate-200/80 rounded-2xl p-4 sm:p-6 shadow-xs space-y-6 w-full">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white p-6 rounded-xl border border-slate-100 shadow-xs">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">Stock Requests</h1>
            <p className="text-sm text-slate-500 mt-0.5">
              {/* Manage and view pending inventory stock requests. */}
            </p>
          </div>

          {can('pending_requests', 'write') && (
            <Button
              variant="primary"
              size="md"
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

        <div className="bg-white p-4 rounded-xl border border-slate-100 shadow-xs flex items-center justify-between gap-4">
          <div className="w-full md:w-96">
            <SearchBar
              value={searchQuery}
              onSearch={handleSearch}
              placeholder="Search requests..."
            />
          </div>
          <div className="hidden md:block text-xs font-medium text-slate-400 pr-2">
            Total Requests:{' '}
            <span className="text-slate-700 font-semibold">{filteredRequests.length}</span>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-slate-100 shadow-xs overflow-hidden w-full">
          <Table
            columns={columns}
            rows={paginatedData}
            rowKey="requestId"
            loading={isLoading}
            emptyMessage="No pending requests found matching your criteria."
            minRows={pageSize}
          />

          <div className="p-4 border-t border-slate-100 bg-slate-50/50">
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
        <PendingRequestView request={selectedRequest} onClose={() => setSelectedRequest(null)} />
      </Modal>

      <Modal
        open={Boolean(requestToApprove)}
        onClose={() => setRequestToApprove(null)}
        title="Approve Stock Request"
        size="sm"
      >
        <div className="space-y-4">
          <p className="text-sm text-slate-600">
            Are you sure you want to approve request{' '}
            <span className="font-semibold text-slate-900">{requestToApprove?.requestId}</span>?
            This will move it forward in the dispatch workflow.
          </p>
          <div className="flex justify-end gap-3 pt-2">
            <Button variant="secondary" onClick={() => setRequestToApprove(null)}>
              Cancel
            </Button>
            <Button
              variant="primary"
              loading={activeActionId === requestToApprove?.requestId}
              onClick={handleApproveConfirm}
            >
              Confirm Approval
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  )
}
