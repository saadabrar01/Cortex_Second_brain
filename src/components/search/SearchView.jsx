'use client'

import { useEffect, useRef, useState } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { Sparkles, Search, Loader2 } from 'lucide-react'
import MessageBubble from './MessageBubble.jsx'
import ChatInput from './ChatInput.jsx'
import { chatService } from '../../services/chatService'
import { searchService } from '../../services/searchService'
import { notesService } from '../../services/notesService'
import NotesGrid from '../dashboard/NotesGrid.jsx'

const SUGGESTIONS = [
  'Summarize what I know about system design',
  'What have I written about career growth?',
  'Compare my notes on databases and infra',
]

export default function SearchView() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const seedQuery = searchParams.get('q') || ''

  const [messages, setMessages] = useState([])
  const [pending, setPending] = useState(false)
  const [searchResults, setSearchResults] = useState(null)
  const [searchQuery, setSearchQuery] = useState(seedQuery)
  const [searchLoading, setSearchLoading] = useState(false)
  const scrollRef = useRef(null)
  const seededRef = useRef(false)
  const searchDebounceRef = useRef(null)

  const send = async (query) => {
    const history = messages.map(({ role, content }) => ({ role, content }))
    setMessages((prev) => [...prev, { role: 'user', content: query }])
    setPending(true)
    try {
      const { answer, sources } = await chatService.ask(query, history)
      setMessages((prev) => [...prev, { role: 'assistant', content: answer, sources }])
    } finally {
      setPending(false)
    }
  }

  const handleSearch = async (query) => {
    setSearchQuery(query)
    if (searchDebounceRef.current) {
      clearTimeout(searchDebounceRef.current)
    }
    searchDebounceRef.current = setTimeout(async () => {
      if (!query.trim()) {
        setSearchResults(null)
        return
      }
      setSearchLoading(true)
      try {
        const results = await searchService.search(query)
        setSearchResults(results)
      } finally {
        setSearchLoading(false)
      }
    }, 250)
  }

  const handleSearchSubmit = (query) => {
    router.push(`/search?q=${encodeURIComponent(query)}`)
  }

  useEffect(() => {
    if (seedQuery && !seededRef.current) {
      seededRef.current = true
      send(seedQuery)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [seedQuery])

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' })
  }, [messages, pending, searchResults])

  useEffect(() => {
    return () => {
      if (searchDebounceRef.current) clearTimeout(searchDebounceRef.current)
    }
  }, [])

  return (
    <div className="flex h-[calc(100vh-88px)] flex-col sm:h-[calc(100vh-64px)]">
      <div className="mb-4">
        <h1 className="font-display text-xl font-semibold text-ink">Ask & Search</h1>
        <p className="mt-1 text-sm text-ink-muted">
          Conversational answers, grounded in the notes you've already written.
        </p>
      </div>

      <div ref={scrollRef} className="flex-1 space-y-4 overflow-y-auto rounded-2xl px-1 py-2">
        {(messages.length === 0 && !pending && !searchResults) && (
          <div className="glass flex flex-col items-center gap-4 rounded-2xl px-6 py-12 text-center">
            <div className="flex h-11 w-11 items-center justify-center rounded-full bg-gradient-to-br from-violet/30 to-azure/30">
              <Sparkles size={18} className="text-violet-soft" />
            </div>
            <p className="font-display text-sm font-medium text-ink">Ask anything about your notes</p>
            <div className="flex flex-wrap justify-center gap-2">
              {SUGGESTIONS.map((s) => (
                <button
                  key={s}
                  onClick={() => send(s)}
                  className="rounded-full border border-white/[0.08] bg-white/[0.03] px-3 py-1.5 text-xs text-ink-muted hover:border-violet/30 hover:text-ink"
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        )}

        {messages.map((m, i) => (
          <MessageBubble key={i} role={m.role} content={m.content} sources={m.sources} />
        ))}
        {pending && <MessageBubble role="assistant" pending />}

        {searchResults !== null && (
          <div className="glass rounded-2xl p-4">
            <div className="mb-3 flex items-center gap-2">
              <Search size={16} className="text-ink-muted" />
              <span className="font-display text-sm font-medium text-ink">
                Search results for &ldquo;{searchQuery}&rdquo;
                {searchLoading && <Loader2 size={14} className="animate-spin text-violet-soft ml-2" />}
              </span>
            </div>
            {searchResults.results.length === 0 ? (
              <p className="text-sm text-ink-muted">No notes found matching your query.</p>
            ) : (
              <NotesGrid notes={searchResults.results} loading={searchLoading} />
            )}
          </div>
        )}
      </div>

      <div className="mt-4">
        <ChatInput 
          onSend={send} 
          onSearch={handleSearch}
          onSearchSubmit={handleSearchSubmit}
          disabled={pending}
          searchQuery={searchQuery}
        />
      </div>
    </div>
  )
}
