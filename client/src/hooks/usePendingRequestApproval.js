import { useMutation, useQueryClient } from '@tanstack/react-query'
import { apiClient } from '../api/axios'

export const useApprovePendingRequest = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (requestId) => {
      const res = await apiClient.post('/pending-request-approval/approve', { requestId })
      return res.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pending-requests'] })
    },
  })
}
