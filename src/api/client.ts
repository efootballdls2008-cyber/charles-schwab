const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001'

function getAuthHeaders(): HeadersInit {
  const token = localStorage.getItem('cs_token')
  const headers: HeadersInit = { 'Content-Type': 'application/json' }
  if (token) {
    headers['Authorization'] = `Bearer ${token}`
  }
  return headers
}

/** Unwrap the server's `{ success, data }` envelope. */
async function unwrap<T>(res: Response, path: string): Promise<T> {
  if (!res.ok) {
    const body = await res.json().catch(() => ({})) as { message?: string }
    throw new Error(body.message ?? `REQUEST ${path} failed: ${res.status}`)
  }
  const json = await res.json() as { success: boolean; data: T } | T
  // If the server wraps in { success, data }, return data; otherwise return as-is.
  if (json !== null && typeof json === 'object' && 'data' in (json as object)) {
    return (json as { success: boolean; data: T }).data
  }
  return json as T
}

export async function get<T>(path: string): Promise<T> {
  const res = await fetch(`${BASE_URL}${path}`, {
    headers: getAuthHeaders(),
  })
  return unwrap<T>(res, path)
}

export async function post<T>(path: string, body: unknown): Promise<T> {
  const res = await fetch(`${BASE_URL}${path}`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(body),
  })
  return unwrap<T>(res, path)
}

export async function patch<T>(path: string, body: unknown): Promise<T> {
  const res = await fetch(`${BASE_URL}${path}`, {
    method: 'PATCH',
    headers: getAuthHeaders(),
    body: JSON.stringify(body),
  })
  return unwrap<T>(res, path)
}

export async function put<T>(path: string, body: unknown): Promise<T> {
  const res = await fetch(`${BASE_URL}${path}`, {
    method: 'PUT',
    headers: getAuthHeaders(),
    body: JSON.stringify(body),
  })
  return unwrap<T>(res, path)
}

export async function del<T>(path: string): Promise<T> {
  const res = await fetch(`${BASE_URL}${path}`, {
    method: 'DELETE',
    headers: getAuthHeaders(),
  })
  return unwrap<T>(res, path)
}
