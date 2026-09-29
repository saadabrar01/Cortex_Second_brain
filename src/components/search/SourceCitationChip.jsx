'use client'

import Link from 'next/link'
import { FileText } from 'lucide-react'

export default function SourceCitationChip({ source }) {
  return (
    <Link
      href={`/editor/${source.id}`}
      className="inline-flex items-center gap-1.5 rounded-lg border border-azure/25 bg-azure/[0.08] px-2.5 py-1 text-[11px] text-azure-soft transition-colors hover:border-azure/50 hover:bg-azure/[0.14]"
    >
      <FileText size={11} />
      {source.title}
    </Link>
  )
}
