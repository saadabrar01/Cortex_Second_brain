import { apiClient } from './apiClient'
import { USE_MOCK_FALLBACK } from '../config'
import { MOCK_TAGS, mockSearchNotes } from '../utils/mockData'
import { normalizeNote } from './notesService'

// Expected FastAPI surface:
//   GET /api/tags               -> { name, count }[]
//   GET /api/tags/{tag}/notes   -> Note[]

export const tagsService = {
  async list() {
    try {
      const res = await apiClient.get('/tags')
      return Array.isArray(res) ? res : []
    } catch (err) {
      if (USE_MOCK_FALLBACK) {
        console.warn('[tagsService] falling back to mock data:', err.message)
        return MOCK_TAGS
      }
      throw err
    }
  },

  async notesForTag(tag) {
    try {
      const res = await apiClient.get(`/tags/${tag}/notes`)
      return Array.isArray(res) ? res.map(normalizeNote) : []
    } catch (err) {
      if (USE_MOCK_FALLBACK) {
        return mockSearchNotes(tag).map(normalizeNote)
      }
      throw err
    }
  },
}

