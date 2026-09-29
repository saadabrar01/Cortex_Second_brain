'use client'

import { useMemo } from 'react'

// A quiet, slow-drifting node graph — the one deliberately "designed" visual
// moment, meant to evoke synapses without becoming a distraction. Rendered
// once behind the whole app shell at low opacity, and reused at higher
// opacity as the Dashboard hero backdrop.
export default function NeuralBackground({ density = 18, className = '', seed = 1 }) {
  const nodes = useMemo(() => {
    // Deterministic pseudo-random layout so it doesn't reshuffle on re-render.
    let s = seed
    const rand = () => {
      s = (s * 9301 + 49297) % 233280
      return s / 233280
    }
    return Array.from({ length: density }, (_, i) => ({
      id: i,
      x: rand() * 100,
      y: rand() * 100,
      r: 1 + rand() * 1.6,
      delay: rand() * 6,
    }))
  }, [density, seed])

  const links = useMemo(() => {
    const result = []
    nodes.forEach((n, i) => {
      const next = nodes[(i + 1) % nodes.length]
      const dist = Math.hypot(n.x - next.x, n.y - next.y)
      if (dist < 55) result.push([n, next])
    })
    return result
  }, [nodes])

  return (
    <svg
      className={`pointer-events-none absolute inset-0 h-full w-full ${className}`}
      viewBox="0 0 100 100"
      preserveAspectRatio="xMidYMid slice"
      aria-hidden="true"
    >
      {links.map(([a, b], idx) => (
        <line
          key={idx}
          x1={a.x}
          y1={a.y}
          x2={b.x}
          y2={b.y}
          stroke="url(#neuralGradient)"
          strokeWidth="0.15"
          opacity="0.35"
        />
      ))}
      {nodes.map((n) => (
        <circle
          key={n.id}
          cx={n.x}
          cy={n.y}
          r={n.r * 0.35}
          fill="#B3A6FF"
          opacity="0.5"
          className="animate-drift"
          style={{ animationDelay: `${n.delay}s`, transformOrigin: `${n.x}px ${n.y}px` }}
        />
      ))}
      <defs>
        <linearGradient id="neuralGradient" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#8B7CF6" />
          <stop offset="100%" stopColor="#4F8CFF" />
        </linearGradient>
      </defs>
    </svg>
  )
}
