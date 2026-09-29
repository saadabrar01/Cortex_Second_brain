const VARIANTS = {
  solid: 'bg-gradient-to-r from-violet to-azure text-white shadow-glow-violet hover:scale-[1.02]',
  ghost: 'glass text-ink-muted hover:text-ink hover:bg-white/[0.06]',
  subtle: 'bg-white/[0.05] text-ink-muted hover:text-ink hover:bg-white/[0.09]',
}

export default function GlowButton({ variant = 'solid', className = '', children, ...rest }) {
  return (
    <button
      className={`inline-flex items-center justify-center gap-2 rounded-xl px-4 py-2 text-sm font-medium transition-all active:scale-[0.98] ${VARIANTS[variant]} ${className}`}
      {...rest}
    >
      {children}
    </button>
  )
}
