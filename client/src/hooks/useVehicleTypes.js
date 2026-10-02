import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { apiClient } from '../api/axios'

export const VEHICLE_TYPES_KEY = ['vehicle-types']

export function useVehicleTypes() {
  return useQuery({
    queryKey: VEHICLE_TYPES_KEY,
    queryFn: async () => {
      const { data } = await apiClient.get('/vehicle-types')
      return data
    },
  })
}

export function useCreateVehicleType() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (formData) => {
      const payload = {
        name: formData.name ?? formData.vt_name,
        description: formData.description ?? formData.vt_description,
        is_active: formData.is_active ?? formData.vt_isActive ?? 1,
      }
      const { data } = await apiClient.post('/vehicle-types', payload)
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: VEHICLE_TYPES_KEY })
    },
  })
}

export function useUpdateVehicleType() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (formData) => {
      const payload = {
        id: formData.id || formData.vt_id,
        name: formData.name ?? formData.vt_name,
        description: formData.description ?? formData.vt_description,
        is_active: formData.is_active ?? formData.vt_isActive,
      }

      // Hits the upsert endpoint without an ID in the URL path
      const { data } = await apiClient.post('/vehicle-types', payload)
      // Note: Use apiClient.put('/vehicle-types', payload) if your backend expects PUT for upsert
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: VEHICLE_TYPES_KEY })
    },
  })
}
