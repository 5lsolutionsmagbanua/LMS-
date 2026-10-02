// client/src/hooks/useMasterBranches.js
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { apiClient } from '../api/axios'

export const useMasterBranches = () => {
  return useQuery({
    queryKey: ['masterBranches'],
    queryFn: async () => {
      const response = await apiClient.get('/master-branch')
      return response.data
    },
  })
}

export const useUpsertBranch = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (payload) => {
      const response = await apiClient.post('/master-branch', payload)
      return response.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['masterBranches'] })
    },
  })
}
