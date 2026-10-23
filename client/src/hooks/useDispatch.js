import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { dispatchApi } from '../api/dispatch.api.js'
import { useWsEvents } from './useWsEvents.js'

const asList = (data) => (Array.isArray(data) ? data : data?.data || [])

// Everything that changes when a dispatch is assigned, reassigned or advanced.
// Adjust the last three keys to match your own query keys.
const DISPATCH_RELATED_KEYS = [
  'dispatch-monitoring',
  'dispatch-drivers',
  'dispatch-vehicles',
  'pending-requests',
  'vehicles',
  'driver-performance',
]

const invalidateDispatchRelated = (queryClient) =>
  DISPATCH_RELATED_KEYS.forEach((key) => queryClient.invalidateQueries({ queryKey: [key] }))

export const useDispatchMonitoring = (filters = {}, enabled = true) =>
  useQuery({
    queryKey: ['dispatch-monitoring', filters],
    queryFn: () => dispatchApi.getAll(filters),
    select: asList,
    enabled,
  })

export const useDispatchDrivers = (requestId, enabled = true) =>
  useQuery({
    queryKey: ['dispatch-drivers', requestId ?? null],
    queryFn: () => dispatchApi.getDrivers(requestId),
    select: asList,
    enabled,
  })

export const useDispatchVehicles = (requestId, enabled = true) =>
  useQuery({
    queryKey: ['dispatch-vehicles', requestId ?? null],
    queryFn: () => dispatchApi.getVehicles(requestId),
    select: asList,
    enabled,
  })

export const useAssignDispatch = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: dispatchApi.assign,
    onSuccess: () => invalidateDispatchRelated(queryClient),
  })
}

/**
 * Staff-side live refresh. Mount ONCE (PortalLayout). When a driver advances a
 * delivery or someone assigns one, the monitor, pickers, pending requests,
 * vehicles and performance pages refetch themselves. No-op while the socket is
 * null, so it is safe with WS_ENABLED = false.
 */
export const useDispatchRealtime = () => {
  const queryClient = useQueryClient()

  useWsEvents(['dispatch:assigned', 'dispatch:unassigned', 'dispatch:status'], () =>
    invalidateDispatchRelated(queryClient),
  )
}