'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Brain, LayoutGrid, MessagesSquare, PenLine, Tags as TagsIcon } from 'lucide-react'
import Sidebar from './Sidebar.jsx'
import NeuralBackground from './NeuralBackground.jsx'

const MOBILE_NAV = [
  { href: '/dashboard', icon: LayoutGrid },
  { href: '/search', icon: MessagesSquare },
  { href: '/editor', icon: PenLine },
  { href: '/tags', icon: TagsIcon },
]

export default function AppShell({ children }) {
  const pathname = usePathname()

  return (
    <div className="relative min-h-screen overflow-hidden bg-void text-ink">
      <div className="pointer-events-none fixed inset-0 bg-aurora" />
      <NeuralBackground className="fixed opacity-[0.12]" density={26} seed={7} />

      <div className="relative z-10 flex min-h-screen">
        <Sidebar />

        <div className="flex min-h-screen flex-1 flex-col">
          {/* Mobile top bar */}
          <div className="flex items-center justify-between border-b border-white/[0.06] px-4 py-3 md:hidden">
            <div className="flex items-center gap-2">
              <Brain size={18} className="text-violet-soft" />
              <span className="font-display text-sm font-semibold">Cortex</span>
            </div>
            <div className="flex gap-1 rounded-full border border-white/[0.07] bg-white/[0.03] p-1">
              {MOBILE_NAV.map(({ href, icon: Icon }) => {
                const active = pathname === href || pathname.startsWith(`${href}/`)
                return (
                  <Link
                    key={href}
                    href={href}
                    className={`rounded-full p-2 ${active ? 'bg-violet/25 text-violet-soft' : 'text-ink-faint'}`}
                  >
                    <Icon size={16} />
                  </Link>
                )
              })}
            </div>
          </div>

          <main className="flex-1 overflow-y-auto px-4 py-6 sm:px-8 sm:py-8">
            <div className="mx-auto w-full max-w-6xl animate-rise">{children}</div>
          </main>
        </div>
      </div>
    </div>
  )
}
