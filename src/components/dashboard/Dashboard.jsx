'use client'

import { useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { X, FileText, Tag, Clock3 } from 'lucide-react'
import SearchBar from './SearchBar.jsx'
import NotesGrid from './NotesGrid.jsx'
import NeuralBackground from '../layout/NeuralBackground.jsx'
import { notesService } from '../../services/notesService'
import { tagsService } from '../../services/tagsService'
import { useDebounce } from '../../hooks/useDebounce'
import { timeAgo } from '../../utils/formatters'

export default function Dashboard() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const activeTag = searchParams.get('tag')

  const [query, setQuery] = useState('')
  const [notes, setNotes] = useState([])
  const [loading, setLoading] = useState(true)
  const [meta, setMeta] = useState({ tagCount: null, lastUpdated: null })
  const debouncedQuery = useDebounce(query, 250)

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    notesService.list({ query: debouncedQuery, tag: activeTag || '' }).then((result) => {
      if (!cancelled) {
        setNotes(result)
        setLoading(false)
      }
    })
    return () => {
      cancelled = true
    }
  }, [debouncedQuery, activeTag])

  // Separate, unfiltered fetch so the stats row reflects the whole knowledge
  // base rather than whatever the current search/tag filter narrows it to.
  useEffect(() => {
    let cancelled = false
    Promise.all([notesService.list({}), tagsService.list()]).then(([allNotes, allTags]) => {
      if (cancelled) return
      const lastUpdated = allNotes.reduce((latest, n) => {
        const ts = n.updatedAt || n.updated_at
        if (!ts) return latest
        return !latest || new Date(ts) > new Date(latest) ? ts : latest
      }, null)
      setMeta({ tagCount: allTags.length, lastUpdated })
    })
    return () => {
      cancelled = true
    }
  }, [])

  return (
    <div className="flex flex-col gap-8">
      <section className="relative overflow-hidden rounded-3xl px-6 py-10 sm:px-10 sm:py-14">
        <NeuralBackground className="opacity-40" density={16} seed={3} />
        <div className="relative">
          <p className="mb-3 text-xs font-medium tracking-wide text-azure-soft">Good to see you back</p>
          <h1 className="max-w-xl font-display text-[28px] font-semibold leading-tight text-gradient sm:text-[34px]">
            What's on your mind today?
          </h1>
          <p className="mt-3 max-w-md text-sm text-ink-muted">
            Search across every note you've written, or ask a question and let your notes answer for you.
          </p>
          <div className="mt-6 max-w-2xl">
            <SearchBar onSearch={setQuery} />
          </div>
        </div>
      </section>

      <StatsRow notesShown={notes.length} loading={loading} meta={meta} />

      <div>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="font-display text-base font-semibold text-ink">
            {activeTag ? `Notes tagged #${activeTag}` : 'Recent notes'}
          </h2>
          {activeTag && (
            <button
              onClick={() => router.push('/dashboard')}
              className="flex items-center gap-1 rounded-full border border-white/[0.09] bg-white/[0.03] px-3 py-1 text-xs text-ink-muted hover:text-ink"
            >
              <X size={12} />
              Clear filter
            </button>
          )}
        </div>
        <NotesGrid notes={notes} loading={loading} />
      </div>
    </div>
  )
}

function StatsRow({ notesShown, loading, meta }) {
  const items = [
    { icon: FileText, label: 'Notes shown', value: loading ? '–' : notesShown },
    { icon: Tag, label: 'Active topic threads', value: meta.tagCount ?? '–' },
    { icon: Clock3, label: 'Last capture', value: meta.lastUpdated ? timeAgo(meta.lastUpdated) : '–' },
  ]
  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
      {items.map(({ icon: Icon, label, value }) => (
        <div key={label} className="glass flex items-center gap-3 rounded-2xl px-4 py-3.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/[0.05]">
            <Icon size={16} className="text-violet-soft" />
          </div>
          <div>
            <p className="font-display text-lg font-semibold leading-none text-ink">{value}</p>
            <p className="mt-1 text-[11px] leading-none text-ink-faint">{label}</p>
          </div>
        </div>
      ))}
    </div>
  )
}
