import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { pendingRequestApi } from '../api/pendingRequest.api.js'

export const usePendingRequests = () =>
  useQuery({
    queryKey: ['pending-requests'],
    queryFn: pendingRequestApi.getAll,
    // Automatically filter out duplicate records based on requestId
    select: (data) => {
      const list = Array.isArray(data) ? data : data?.data || []
      const map = new Map()
      list.forEach((req) => {
        if (req.requestId && !map.has(req.requestId)) {
          map.set(req.requestId, req)
        }
      })
      return Array.from(map.values())
    },
  })

export const usePendingRequestItems = (requestId) =>
  useQuery({
    queryKey: ['pending-requests', requestId, 'items'],
    queryFn: () => pendingRequestApi.getItems(requestId),
    enabled: !!requestId,
  })

export const useCreatePendingRequest = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: pendingRequestApi.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pending-requests'] })
    },
  })
}

export const useUpdatePendingRequest = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: pendingRequestApi.update,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pending-requests'] })
    },
  })
}
