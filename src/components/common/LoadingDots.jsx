export default function LoadingDots({ label }) {
  return (
    <div className="flex items-center gap-2 text-xs text-ink-faint">
      <span className="flex gap-1">
        {[0, 1, 2].map((i) => (
          <span
            key={i}
            className="h-1.5 w-1.5 rounded-full bg-violet-soft animate-pulse-glow"
            style={{ animationDelay: `${i * 0.15}s` }}
          />
        ))}
      </span>
      {label}
    </div>
  )
}
