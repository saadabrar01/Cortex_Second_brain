export default function PillBadge({ label, count, active = false, onClick, size = 'md' }) {
  const isInteractive = typeof onClick === 'function'
  const sizeCls = size === 'sm' ? 'px-2.5 py-1 text-[11px]' : 'px-3.5 py-1.5 text-xs'

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={!isInteractive}
      className={`inline-flex items-center gap-1.5 rounded-full border transition-all ${sizeCls} ${
        active
          ? 'border-violet/60 bg-violet/15 text-violet-soft shadow-glow-violet'
          : 'border-white/[0.09] bg-white/[0.03] text-ink-muted shadow-[0_0_16px_-8px_rgba(139,124,246,0.4)] hover:border-violet/30 hover:text-ink'
      } ${isInteractive ? 'cursor-pointer' : 'cursor-default'}`}
    >
      <span className={`h-1.5 w-1.5 rounded-full ${active ? 'bg-violet-soft' : 'bg-ink-faint'}`} />
      #{label}
      {typeof count === 'number' && (
        <span className={active ? 'text-violet-soft/70' : 'text-ink-faint'}>{count}</span>
      )}
    </button>
  )
}
