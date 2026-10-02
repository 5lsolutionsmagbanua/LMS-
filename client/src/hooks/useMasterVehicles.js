// client/src/hooks/useMasterVehicles.js
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { apiClient } from '../api/axios'

export const useMasterVehicles = () =>
  useQuery({
    queryKey: ['master-vehicles'],
    queryFn: async () => {
      const res = await apiClient.get('/master-vehicles') // Matches backend route prefix
      return res.data
    },
    staleTime: 1000 * 60 * 5,
  })

export const useUpsertVehicle = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (form) => {
      // Backend uses a single upsertMasterVehicles endpoint handling both insert (no id) and update (with id)
      const res = await apiClient.post('/master-vehicles', form)
      return res.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['master-vehicles'] })
    },
  })
}
