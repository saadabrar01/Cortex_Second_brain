// Central place for environment-driven configuration.
// Next.js exposes any NEXT_PUBLIC_-prefixed variable from a .env file on
// process.env, inlined at build time for client-side code.

export const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000/api'

// When true, services fall back to local mock data instead of throwing when
// the FastAPI backend is unreachable. Handy for building the UI standalone.
export const USE_MOCK_FALLBACK = process.env.NEXT_PUBLIC_USE_MOCK_FALLBACK !== 'false'
