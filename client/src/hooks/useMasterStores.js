import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { apiClient } from '../api/axios'

export const useMasterStores = () =>
  useQuery({
    queryKey: ['master-stores'],
    queryFn: async () => {
      const res = await apiClient.get('/master-stores')
      return res.data
    },
  })

export const useUpsertStore = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (form) => {
      const res = await apiClient.post('/master-stores', form)
      return res.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['master-stores'] })
    },
  })
}
