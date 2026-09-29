import { API_BASE_URL } from '../config'

export class ApiError extends Error {
  constructor(message, status, payload) {
    super(message)
    this.name = 'ApiError'
    this.status = status
    this.payload = payload
  }
}

async function request(path, { method = 'GET', body, signal } = {}) {
  const res = await fetch(`${API_BASE_URL}${path}`, {
    method,
    headers: { 'Content-Type': 'application/json' },
    body: body ? JSON.stringify(body) : undefined,
    signal,
  })

  if (!res.ok) {
    let payload = null
    try {
      payload = await res.json()
    } catch {
      /* response had no JSON body */
    }
    throw new ApiError(payload?.detail || `Request failed with ${res.status}`, res.status, payload)
  }

  if (res.status === 204) return null
  return res.json()
}

// Thin verb helpers — every service in this app builds on these instead of
// calling fetch directly, so auth headers / retries can be added in one place.
export const apiClient = {
  get: (path, opts) => request(path, { ...opts, method: 'GET' }),
  post: (path, body, opts) => request(path, { ...opts, method: 'POST', body }),
  put: (path, body, opts) => request(path, { ...opts, method: 'PUT', body }),
  patch: (path, body, opts) => request(path, { ...opts, method: 'PATCH', body }),
  delete: (path, opts) => request(path, { ...opts, method: 'DELETE' }),
}
