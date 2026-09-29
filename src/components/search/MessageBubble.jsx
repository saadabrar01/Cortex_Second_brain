import { Brain } from 'lucide-react'
import SourceCitationChip from './SourceCitationChip.jsx'
import LoadingDots from '../common/LoadingDots.jsx'

export default function MessageBubble({ role, content, sources, pending }) {
  const isUser = role === 'user'

  if (isUser) {
    return (
      <div className="flex justify-end">
        <div className="max-w-[80%] rounded-2xl rounded-tr-sm bg-white/[0.07] px-4 py-2.5 text-sm text-ink sm:max-w-[65%]">
          {content}
        </div>
      </div>
    )
  }

  return (
    <div className="flex items-start gap-3">
      <div className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-violet/40 to-azure/40">
        <Brain size={13} className="text-violet-soft" />
      </div>
      <div className="glass max-w-[85%] rounded-2xl rounded-tl-sm px-4 py-3 sm:max-w-[75%]">
        {pending ? (
          <LoadingDots label="Reading your notes…" />
        ) : (
          <>
            <p className="text-sm leading-relaxed text-ink-muted">{content}</p>
            {sources?.length > 0 && (
              <div className="mt-3 flex flex-wrap gap-1.5 border-t border-white/[0.06] pt-2.5">
                {sources.map((s) => (
                  <SourceCitationChip key={s.id} source={s} />
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}
