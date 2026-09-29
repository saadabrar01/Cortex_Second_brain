'use client'

import { useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Tags as TagsIcon } from 'lucide-react'
import PillBadge from '../common/PillBadge.jsx'
import NotesGrid from '../dashboard/NotesGrid.jsx'
import EmptyState from '../common/EmptyState.jsx'
import { tagsService } from '../../services/tagsService'
import { notesService } from '../../services/notesService'

export default function TagsView() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const selected = searchParams.get('tag')

  const [tags, setTags] = useState([])
  const [notes, setNotes] = useState([])
  const [loadingTags, setLoadingTags] = useState(true)
  const [loadingNotes, setLoadingNotes] = useState(false)

  useEffect(() => {
    tagsService.list().then((result) => {
      setTags([...result].sort((a, b) => b.count - a.count))
      setLoadingTags(false)
    })
  }, [])

  useEffect(() => {
    if (!selected) {
      setNotes([])
      return
    }
    let cancelled = false
    setLoadingNotes(true)
    const cleanTag = selected.trim()
    notesService.list({ tag: cleanTag }).then((result) => {
      if (!cancelled) {
        setNotes(result)
        setLoadingNotes(false)
      }
    })
    return () => {
      cancelled = true
    }
  }, [selected])

  // Selection lives in the URL (?tag=react) rather than component state, so
  // a filtered tag view is a real, shareable, back-button-friendly address.
  const toggleTag = (tagName) => {
    const isCurrentlyActive = selected?.toLowerCase() === tagName.toLowerCase()
    router.push(isCurrentlyActive ? '/tags' : `/tags?tag=${encodeURIComponent(tagName)}`)
  }

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="font-display text-xl font-semibold text-ink">Tags & topics</h1>
        <p className="mt-1 text-sm text-ink-muted">
          Every thread running through your notes, sized by how often you return to it.
        </p>
      </div>

      <div className="glass rounded-2xl p-5">
        {loadingTags ? (
          <div className="flex flex-wrap gap-2">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="h-7 w-20 animate-pulse rounded-full bg-white/[0.05]" />
            ))}
          </div>
        ) : (
          <div className="flex flex-wrap gap-2.5">
            {tags.map((tag) => (
              <PillBadge
                key={tag.name}
                label={tag.name}
                count={tag.count}
                active={selected?.toLowerCase() === tag.name.toLowerCase()}
                size={tag.count >= 6 ? 'md' : 'sm'}
                onClick={() => toggleTag(tag.name)}
              />
            ))}
          </div>
        )}
      </div>

      {selected ? (
        <div>
          <h2 className="mb-4 font-display text-base font-semibold text-ink">
            Notes tagged #{selected}
          </h2>
          <NotesGrid notes={notes} loading={loadingNotes} />
        </div>
      ) : (
        !loadingTags && (
          <EmptyState
            icon={TagsIcon}
            title="Pick a tag to filter your notes"
            description="Select any pill above to see every note connected to that topic."
          />
        )
      )}
    </div>
  )
}
