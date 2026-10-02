// client/src/hooks/useMasterRoles.js
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { apiClient } from '../api/axios'

export const useMasterRoles = () => {
  return useQuery({
    queryKey: ['masterRoles'],
    queryFn: async () => {
      const response = await apiClient.get('/master-role')
      return response.data
    },
  })
}

// Single upsert endpoint (POST) handles both create and update for roles
export const useUpsertRole = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (payload) => {
      const response = await apiClient.post('/master-role', payload)
      return response.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['masterRoles'] })
    },
  })
}
