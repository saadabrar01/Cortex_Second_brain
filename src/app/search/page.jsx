import { Suspense } from 'react'
import SearchView from '../../components/search/SearchView.jsx'

export const metadata = { title: 'Ask & Search — Cortex' }

export default function SearchPage() {
  // SearchView reads an optional ?q= seed query via useSearchParams.
  return (
    <Suspense fallback={null}>
      <SearchView />
    </Suspense>
  )
}
