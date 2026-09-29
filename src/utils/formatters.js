export function timeAgo(isoDate) {
  const then = new Date(isoDate).getTime()
  const now = Date.now()
  const diffSec = Math.max(1, Math.floor((now - then) / 1000))

  const units = [
    ['year', 31536000],
    ['month', 2592000],
    ['day', 86400],
    ['hour', 3600],
    ['minute', 60],
  ]

  for (const [label, secs] of units) {
    const value = Math.floor(diffSec / secs)
    if (value >= 1) return `${value} ${label}${value > 1 ? 's' : ''} ago`
  }
  return 'just now'
}

export function initialsFromTitle(title = '') {
  return title
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase())
    .join('')
}

export function truncate(text = '', max = 140) {
  const str = String(text ?? '')
  if (str.length <= max) return str
  return `${str.slice(0, max).trim()}…`
}
