'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Search, Sparkles } from 'lucide-react'

export default function SearchBar({ onSearch }) {
  const [value, setValue] = useState('')
  const router = useRouter()

  const submit = (e) => {
    e.preventDefault()
    onSearch?.(value)
  }

  const askAI = () => {
    const trimmed = value.trim()
    if (!trimmed) return
    router.push(`/search?q=${encodeURIComponent(trimmed)}`)
  }

  return (
    <form onSubmit={submit} className="glow-ring glass-raised flex items-center gap-2 rounded-2xl p-2 sm:p-2.5">
      <div className="flex flex-1 items-center gap-3 px-2.5">
        <Search size={18} className="shrink-0 text-ink-faint" />
        <input
          value={value}
          onChange={(e) => {
            setValue(e.target.value)
            onSearch?.(e.target.value)
          }}
          placeholder="Ask your second brain anything, or search your notes…"
          className="w-full bg-transparent py-2.5 text-sm text-ink placeholder:text-ink-faint focus:outline-none sm:text-base"
        />
      </div>
      <button
        type="button"
        onClick={askAI}
        className="flex shrink-0 items-center gap-1.5 rounded-xl bg-gradient-to-r from-violet to-azure px-3.5 py-2.5 text-xs font-medium text-white shadow-glow-violet transition-transform hover:scale-[1.02] active:scale-[0.98] sm:text-sm"
      >
        <Sparkles size={15} strokeWidth={2.2} />
        <span className="hidden sm:inline">Ask AI</span>
      </button>
    </form>
  )
}
