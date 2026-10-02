import { useState } from 'react'
import { useUpsertBranch } from '@/hooks/useMasterBranches'
import Alert from '@/components/ui/Alert'
import BranchForm from './-BranchForm'

export default function BranchEditForm({ branch, onSuccess }) {
  const [validationError, setValidationError] = useState(null)
  const upsertBranch = useUpsertBranch()

  const handleSubmit = (formData) => {
    if (!formData.branch_name?.trim()) {
      setValidationError('Please fill out all required fields.')
      return
    }
    setValidationError(null)

    upsertBranch.mutate(formData, {
      onSuccess: () => {
        setTimeout(() => {
          onSuccess?.()
        }, 1000)
      },
    })
  }

  return (
    <div className="w-full relative space-y-4">
      {validationError && (
        <Alert
          variant="warning"
          title="Validation Error"
          onDismiss={() => setValidationError(null)}
        >
          {validationError}
        </Alert>
      )}

      {upsertBranch.isError && (
        <Alert variant="error" title="Update Failed" onDismiss={() => upsertBranch.reset()}>
          {upsertBranch.error?.response?.data?.message || 'Something went wrong'}
        </Alert>
      )}

      {upsertBranch.isSuccess && (
        <Alert variant="success" title="Success" onDismiss={() => upsertBranch.reset()}>
          Branch saved successfully.
        </Alert>
      )}

      <BranchForm
        initialData={branch}
        onSubmit={handleSubmit}
        onCancel={onSuccess}
        loading={upsertBranch.isPending}
      />
    </div>
  )
}
