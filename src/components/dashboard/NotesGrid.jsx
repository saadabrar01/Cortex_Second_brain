'use client'

import Link from 'next/link'
import { NotebookText } from 'lucide-react'
import NoteCard from './NoteCard.jsx'
import EmptyState from '../common/EmptyState.jsx'

export default function NotesGrid({ notes, loading }) {
  if (loading) {
    return (
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="glass h-[168px] animate-pulse rounded-2xl" />
        ))}
      </div>
    )
  }

  if (!notes.length) {
    return (
      <EmptyState
        icon={NotebookText}
        title="No notes match yet"
        description="Try a different search term, or capture a new note to start building this thread of your second brain."
        action={
          <Link
            href="/editor"
            className="mt-1 inline-block rounded-xl bg-gradient-to-r from-violet to-azure px-4 py-2 text-xs font-medium text-white shadow-glow-violet"
          >
            Write a new note
          </Link>
        }
      />
    )
  }

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
      {notes.map((note) => (
        <NoteCard key={note.id} note={note} />
      ))}
    </div>
  )
}
