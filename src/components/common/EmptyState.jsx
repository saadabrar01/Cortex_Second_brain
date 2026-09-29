export default function EmptyState({ icon: Icon, title, description, action }) {
  return (
    <div className="glass flex flex-col items-center gap-3 rounded-2xl px-6 py-14 text-center">
      {Icon && (
        <div className="flex h-11 w-11 items-center justify-center rounded-full bg-white/[0.05]">
          <Icon size={20} className="text-ink-faint" />
        </div>
      )}
      <p className="font-display text-sm font-medium text-ink">{title}</p>
      {description && <p className="max-w-xs text-xs leading-relaxed text-ink-faint">{description}</p>}
      {action}
    </div>
  )
}
