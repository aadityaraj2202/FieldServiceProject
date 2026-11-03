const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:7070'

function getStoredToken() {
  return localStorage.getItem('keystone-token') || ''
}

export function setAuthToken(token) {
  if (token) {
    localStorage.setItem('keystone-token', token)
    return
  }

  localStorage.removeItem('keystone-token')
}

export function clearAuthToken() {
  localStorage.removeItem('keystone-token')
}

async function parseResponse(response) {
  const text = await response.text()

  if (!text) {
    return null
  }

  try {
    return JSON.parse(text)
  } catch {
    return text
  }
}

export async function apiRequest(path, options = {}) {
  const { method = 'GET', body, headers = {}, requireAuth = true } = options

  const requestHeaders = {
    ...headers,
    ...(body !== undefined && body !== null && !(body instanceof FormData) ? { 'Content-Type': 'application/json' } : {}),
  }

  if (requireAuth) {
    const token = getStoredToken()
    if (token) {
      requestHeaders.Authorization = `Bearer ${token}`
    }
  }

  const response = await fetch(`${API_BASE_URL}${path}`, {
    method,
    headers: requestHeaders,
    body: body !== undefined && body !== null && !(body instanceof FormData) ? JSON.stringify(body) : body,
  })

  if (response.status === 401) {
    clearAuthToken()
    throw new Error('Your session has expired. Please sign in again.')
  }

  if (response.status === 403) {
    throw new Error('You do not have permission to access this data.')
  }

  if (!response.ok) {
    const data = await parseResponse(response)
    const detail = typeof data === 'string' ? data : data?.message || data?.error || 'Request failed.'
    throw new Error(detail)
  }

  return parseResponse(response)
}

export const api = {
  get: (path, options = {}) => apiRequest(path, { ...options, method: 'GET' }),
  post: (path, body, options = {}) => apiRequest(path, { ...options, method: 'POST', body }),
  put: (path, body, options = {}) => apiRequest(path, { ...options, method: 'PUT', body }),
  patch: (path, body, options = {}) => apiRequest(path, { ...options, method: 'PATCH', body }),
  del: (path, options = {}) => apiRequest(path, { ...options, method: 'DELETE' }),
}
