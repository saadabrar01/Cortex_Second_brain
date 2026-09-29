import { apiClient } from './apiClient'
import { USE_MOCK_FALLBACK } from '../config'
import { MOCK_NOTES, mockSearchNotes, mockRelatedNotes } from '../utils/mockData'

// Expected FastAPI surface (adapt paths to match your backend router):
//   GET    /api/notes?query=&tag=        -> Note[]
//   GET    /api/notes/{id}               -> Note
//   POST   /api/notes                    -> Note
//   PUT    /api/notes/{id}                -> Note
//   DELETE /api/notes/{id}                -> 204
//   GET    /api/notes/{id}/related?limit= -> Note[]

async function withFallback(fn, fallbackFn) {
  try {
    return await fn()
  } catch (err) {
    if (USE_MOCK_FALLBACK) {
      console.warn('[notesService] falling back to mock data:', err.message)
      return fallbackFn()
    }
    throw err
  }
}

export function normalizeNote(note) {
  if (!note) return null
  const content = note.content || ''
  const excerpt =
    note.excerpt ||
    content
      .replace(/^#.*\n/, '')
      .replace(/[#*`>-]/g, '')
      .trim()
      .slice(0, 140)

  return {
    ...note,
    id: String(note.id),
    title: note.title || 'Untitled note',
    content,
    excerpt,
    tags: Array.isArray(note.tags) ? note.tags : [],
    createdAt: note.createdAt || note.created_at || new Date().toISOString(),
    updatedAt: note.updatedAt || note.updated_at || new Date().toISOString(),
    created_at: note.created_at || note.createdAt || new Date().toISOString(),
    updated_at: note.updated_at || note.updatedAt || new Date().toISOString(),
  }
}

export const notesService = {
  list({ query = '', tag = '' } = {}) {
    const params = new URLSearchParams()
    if (query) params.set('query', query)
    if (tag) params.set('tag', tag)
    return withFallback(
      async () => {
        const res = await apiClient.get(`/notes?${params.toString()}`)
        return Array.isArray(res) ? res.map(normalizeNote) : []
      },
      () => (tag ? mockSearchNotes(tag).map(normalizeNote) : mockSearchNotes(query).map(normalizeNote)),
    )
  },

  get(id) {
    return withFallback(
      async () => {
        const res = await apiClient.get(`/notes/${id}`)
        return normalizeNote(res)
      },
      () => normalizeNote(MOCK_NOTES.find((n) => n.id === id) || null),
    )
  },

  create(note) {
    return withFallback(
      async () => {
        const res = await apiClient.post('/notes', note)
        return normalizeNote(res)
      },
      () => normalizeNote({ id: `local-${Date.now()}`, updatedAt: new Date().toISOString(), ...note }),
    )
  },

  update(id, patch) {
    return withFallback(
      async () => {
        const res = await apiClient.put(`/notes/${id}`, patch)
        return normalizeNote(res)
      },
      () => normalizeNote({ ...(MOCK_NOTES.find((n) => n.id === id) || {}), ...patch, id }),
    )
  },

  remove(id) {
    return withFallback(
      () => apiClient.delete(`/notes/${id}`),
      () => true,
    )
  },

  related(id, limit = 3) {
    return withFallback(
      async () => {
        const res = await apiClient.get(`/notes/${id}/related?limit=${limit}`)
        return Array.isArray(res) ? res.map(normalizeNote) : []
      },
      () => mockRelatedNotes(id, limit).map(normalizeNote),
    )
  },
}

