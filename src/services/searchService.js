import { apiClient } from './apiClient'
import { USE_MOCK_FALLBACK } from '../config'
import { MOCK_NOTES, mockSearchNotes } from '../utils/mockData'

async function withFallback(fn, fallbackFn) {
  try {
    return await fn()
  } catch (err) {
    if (USE_MOCK_FALLBACK) {
      console.warn('[searchService] falling back to mock data:', err.message)
      return fallbackFn()
    }
    throw err
  }
}

export const searchService = {
  async search(query) {
    return withFallback(
      async () => {
        const data = await apiClient.get(`/search?q=${encodeURIComponent(query)}`)
        return {
          results: (data?.results || []).map((note) => ({
            ...note,
            id: String(note.id),
            title: note.title || 'Untitled note',
            content: note.content || '',
            excerpt: note.content ? note.content.replace(/^#.*\n/, '').replace(/[#*`>-]/g, '').trim().slice(0, 140) : '',
            tags: Array.isArray(note.tags) ? note.tags : [],
            updatedAt: note.updatedAt || note.updated_at || new Date().toISOString(),
            createdAt: note.createdAt || note.created_at || new Date().toISOString(),
          })),
          suggestions: data?.suggestions || [],
        }
      },
      () => ({
        results: mockSearchNotes(query).map((note) => ({
          id: note.id,
          title: note.title,
          content: note.content.slice(0, 300) + (note.content.length > 300 ? '...' : ''),
          excerpt: note.excerpt || note.content.slice(0, 140),
          tags: note.tags || [],
          updatedAt: note.updatedAt,
          match_type: query.toLowerCase() in note.title.toLowerCase() ? 'title' : 'content',
        })),
        suggestions: [],
      }),
    )
  },
}