import { Suspense } from 'react'
import Dashboard from '../../components/dashboard/Dashboard.jsx'

export const metadata = { title: 'Dashboard — Cortex' }

export default function DashboardPage() {
  // Dashboard reads the ?tag= filter via useSearchParams, which requires a
  // Suspense boundary so the rest of the route can still prerender.
  return (
    <Suspense fallback={null}>
      <Dashboard />
    </Suspense>
  )
}
