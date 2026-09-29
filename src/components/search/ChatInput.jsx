'use client'

import { useState, useRef, useEffect } from 'react'
import { ArrowUp, Search, X } from 'lucide-react'

export default function ChatInput({ 
  onSend, 
  disabled, 
  onSearch,
  onSearchSubmit,
  searchQuery = '' 
}) {
  const [value, setValue] = useState(searchQuery)
  const [mode, setMode] = useState('chat')
  const inputRef = useRef(null)

  useEffect(() => {
    inputRef.current?.focus()
  }, [])

  useEffect(() => {
    setValue(searchQuery)
  }, [searchQuery])

  const handleSubmit = (e) => {
    e.preventDefault()
    const trimmed = value.trim()
    if (!trimmed || disabled) return
    
    if (mode === 'search') {
      onSearchSubmit?.(trimmed)
    } else {
      onSend(trimmed)
    }
    setValue('')
  }

  const handleChange = (e) => {
    const newValue = e.target.value
    setValue(newValue)
    onSearch?.(newValue)
  }

  return (
    <div className="glow-ring glass-raised rounded-2xl p-2">
      <div className="flex items-center gap-2 mb-2">
        <button
          type="button"
          onClick={() => setMode('chat')}
          className={`flex-1 py-1.5 rounded-xl text-sm font-medium transition-colors ${
            mode === 'chat'
              ? 'bg-gradient-to-r from-violet to-azure text-white shadow-glow-violet'
              : 'text-ink-muted hover:text-ink hover:bg-white/[0.03]'
          }`}
        >
          Ask AI
        </button>
        <button
          type="button"
          onClick={() => setMode('search')}
          className={`flex-1 py-1.5 rounded-xl text-sm font-medium transition-colors ${
            mode === 'search'
              ? 'bg-gradient-to-r from-violet to-azure text-white shadow-glow-violet'
              : 'text-ink-muted hover:text-ink hover:bg-white/[0.03]'
          }`}
        >
          Search Notes
        </button>
      </div>
      
      <form onSubmit={handleSubmit} className="flex items-center gap-2">
        <div className="flex-1 relative">
          <input
            ref={inputRef}
            value={value}
            onChange={handleChange}
            placeholder={mode === 'chat' ? 'Ask a question about your notes…' : 'Search your notes…'}
            className="flex-1 bg-transparent px-3 py-2.5 text-sm text-ink placeholder:text-ink-faint focus:outline-none pr-10"
          />
          {value && (
            <button
              type="button"
              onClick={() => setValue('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-ink-faint hover:text-ink"
            >
              <X size={16} />
            </button>
          )}
        </div>
        <button
          type="submit"
          disabled={disabled || !value.trim()}
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-r from-violet to-azure text-white shadow-glow-violet transition-transform enabled:hover:scale-105 disabled:opacity-40"
        >
          {mode === 'search' ? <Search size={16} strokeWidth={2.5} /> : <ArrowUp size={16} strokeWidth={2.5} />}
        </button>
      </form>
    </div>
  )
}
