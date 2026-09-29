import { apiClient } from './apiClient'
import { USE_MOCK_FALLBACK } from '../config'
import { mockChatResponse } from '../utils/mockData'

// Expected FastAPI surface:
//   POST /api/chat  { query: string, history: {role, content}[] }
//        -> { answer: string, sources: { id, title }[] }

export const chatService = {
  async ask(query, history = []) {
    try {
      return await apiClient.post('/chat', { query, history })
    } catch (err) {
      if (USE_MOCK_FALLBACK) {
        console.warn('[chatService] falling back to mock response:', err.message)
        // Small delay so the typing indicator in the UI feels intentional
        // rather than a broken request that resolved instantly.
        await new Promise((r) => setTimeout(r, 500))
        return mockChatResponse(query)
      }
      throw err
    }
  },
}
