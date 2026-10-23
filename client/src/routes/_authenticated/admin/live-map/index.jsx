import { createFileRoute } from '@tanstack/react-router'
import LiveLocationMapPage from './components/LiveLocationMapPage'

export const Route = createFileRoute('/_authenticated/admin/live-map/')({
  component: LiveLocationMapPage,
})