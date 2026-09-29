'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Link2, Waypoints } from 'lucide-react'
import { notesService } from '../../services/notesService'
import { truncate } from '../../utils/formatters'

export default function RelatedNotesSidebar({ noteId }) {
  const [related, setRelated] = useState([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!noteId) {
      setRelated([])
      return
    }
    let cancelled = false
    setLoading(true)
    notesService.related(noteId, 4).then((result) => {
      if (!cancelled) {
        setRelated(result)
        setLoading(false)
      }
    })
    return () => {
      cancelled = true
    }
  }, [noteId])

  return (
    <div className="glass flex h-full flex-col rounded-2xl p-4">
      <div className="mb-3 flex items-center gap-2 text-ink-muted">
        <Waypoints size={15} className="text-violet-soft" />
        <h3 className="font-display text-[13px] font-semibold text-ink">Related notes</h3>
      </div>

      {!noteId && (
        <p className="text-xs leading-relaxed text-ink-faint">
          Save this note to see suggestions linked by shared tags and topics.
        </p>
      )}

      {noteId && loading && (
        <div className="space-y-2">
          {[0, 1, 2].map((i) => (
            <div key={i} className="h-14 animate-pulse rounded-xl bg-white/[0.04]" />
          ))}
        </div>
      )}

      {noteId && !loading && related.length === 0 && (
        <p className="text-xs leading-relaxed text-ink-faint">
          No strongly related notes yet — add a shared tag to connect this note to others.
        </p>
      )}

      <div className="flex flex-col gap-2">
        {related.map((note) => (
          <Link
            key={note.id}
            href={`/editor/${note.id}`}
            className="group rounded-xl border border-white/[0.06] bg-white/[0.02] p-3 text-left transition-colors hover:border-violet/25 hover:bg-white/[0.05]"
          >
            <p className="flex items-start gap-1.5 text-[13px] font-medium leading-snug text-ink group-hover:text-white">
              <Link2 size={12} className="mt-1 shrink-0 text-ink-faint" />
              {note.title}
            </p>
            <p className="mt-1 pl-[18px] text-[11px] leading-relaxed text-ink-faint">
              {truncate(note.excerpt || note.content, 70)}
            </p>
          </Link>
        ))}
      </div>
    </div>
  )
}
