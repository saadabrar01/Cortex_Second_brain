'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Clock } from 'lucide-react'
import { timeAgo, truncate } from '../../utils/formatters'

export default function NoteCard({ note }) {
  const router = useRouter()

  const handleTagClick = (e, tag) => {
    e.preventDefault()
    e.stopPropagation()
    router.push(`/tags?tag=${encodeURIComponent(tag)}`)
  }

  return (
    <Link
      href={`/editor/${note.id}`}
      className="glass group flex h-full flex-col rounded-2xl p-5 text-left transition-all hover:border-violet/30 hover:bg-white/[0.055]"
    >
      <h3 className="font-display text-[15px] font-semibold leading-snug text-ink group-hover:text-white">
        {note.title}
      </h3>
      <p className="mt-2 flex-1 text-[13px] leading-relaxed text-ink-muted">
        {truncate(note.excerpt || note.content, 118)}
      </p>

      <div className="mt-4 flex flex-wrap gap-1.5">
        {note.tags?.slice(0, 3).map((tag) => (
          <button
            type="button"
            key={tag}
            onClick={(e) => handleTagClick(e, tag)}
            className="z-10 rounded-full border border-white/[0.08] bg-white/[0.03] px-2 py-0.5 text-[10.5px] text-ink-faint transition-colors hover:border-violet/40 hover:bg-violet/10 hover:text-violet-soft"
          >
            #{tag}
          </button>
        ))}
      </div>

      <div className="mt-4 flex items-center gap-1.5 border-t border-white/[0.06] pt-3 text-[11px] text-ink-faint">
        <Clock size={12} />
        {timeAgo(note.updatedAt || note.updated_at)}
      </div>
    </Link>
  )
}

