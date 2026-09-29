import { Suspense } from 'react'
import TagsView from '../../components/tags/TagsView.jsx'

export const metadata = { title: 'Tags — Cortex' }

export default function TagsPage() {
  // TagsView reads/writes the selected tag via ?tag= so filtered views are
  // shareable links, which also requires a Suspense boundary.
  return (
    <Suspense fallback={null}>
      <TagsView />
    </Suspense>
  )
}
