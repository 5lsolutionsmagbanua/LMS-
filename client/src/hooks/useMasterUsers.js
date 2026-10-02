// client/src/hooks/useMasterUsers.js
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { apiClient } from '../api/axios'

export const useMasterUsers = () => {
  return useQuery({
    queryKey: ['masterUsers'],
    queryFn: async () => {
      const response = await apiClient.get('/master-users')
      return response.data
    },
  })
}

export const useUpsertUser = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (payload) => {
      const response = await apiClient.post('/master-users', payload)
      return response.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['masterUsers'] })
    },
  })
}
