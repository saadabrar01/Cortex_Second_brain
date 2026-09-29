'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Brain, LayoutGrid, MessagesSquare, PenLine, Tags as TagsIcon, Plus } from 'lucide-react'

const NAV_ITEMS = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutGrid },
  { href: '/search', label: 'Ask & Search', icon: MessagesSquare },
  { href: '/editor', label: 'Editor', icon: PenLine },
  { href: '/tags', label: 'Tags', icon: TagsIcon },
]

export default function Sidebar() {
  const pathname = usePathname()

  return (
    <aside className="hidden w-[232px] shrink-0 flex-col border-r border-white/[0.06] px-4 py-6 md:flex">
      <div className="mb-8 flex items-center gap-2.5 px-2">
        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-violet/30 to-azure/30 shadow-glow-violet">
          <Brain size={18} className="text-violet-soft" strokeWidth={2} />
        </div>
        <div>
          <p className="font-display text-[15px] font-semibold leading-none text-ink">Cortex</p>
          <p className="mt-1 text-[11px] leading-none text-ink-faint">Second Brain</p>
        </div>
      </div>

      <nav className="flex flex-col gap-1">
        {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
          const active = pathname === href || pathname.startsWith(`${href}/`)
          return (
            <Link
              key={href}
              href={href}
              className={`group flex items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm transition-all ${
                active
                  ? 'glass text-ink shadow-glow-violet'
                  : 'text-ink-muted hover:bg-white/[0.04] hover:text-ink'
              }`}
            >
              <Icon
                size={17}
                strokeWidth={2}
                className={active ? 'text-violet-soft' : 'text-ink-faint group-hover:text-ink-muted'}
              />
              {label}
            </Link>
          )
        })}
      </nav>

      <Link
        href="/editor"
        className="mt-6 flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-violet to-azure px-3 py-2.5 text-sm font-medium text-white shadow-glow-violet transition-transform hover:scale-[1.02] active:scale-[0.98]"
      >
        <Plus size={16} strokeWidth={2.5} />
        New note
      </Link>

      <div className="mt-auto rounded-xl border border-white/[0.06] bg-white/[0.02] p-3 text-[11px] leading-relaxed text-ink-faint">
        Connected to your local knowledge base. Notes stay private and searchable offline.
      </div>
    </aside>
  )
}
