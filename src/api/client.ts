const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001'

// ── Global 401 handler ────────────────────────────────────────────────────────
// AuthContext registers this callback so the API client can trigger logout
// without creating a circular dependency.
type LogoutFn = () => void
let _onUnauthorized: LogoutFn | null = null

export function registerUnauthorizedHandler(fn: LogoutFn) {
  _onUnauthorized = fn
}

export function clearUnauthorizedHandler() {
  _onUnauthorized = null
}

function getAuthHeaders(): HeadersInit {
  const token = localStorage.getItem('cs_token')
  const headers: HeadersInit = { 'Content-Type': 'application/json' }
  if (token) {
    headers['Authorization'] = `Bearer ${token}`
  }
  return headers
}

/** Unwrap the server's `{ success, data }` envelope. */
async function unwrap<T>(res: Response, statusCode: number): Promise<T> {
  if (!res.ok) {
    const body = await res.json().catch(() => ({})) as { message?: string }
    const message = body.message ?? (statusCode === 401 ? 'Unauthorized' : 'Request failed')
    const err = new Error(message) as Error & { status: number }
    err.status = statusCode

    // Fire global logout on 401 — token expired or revoked
    if (statusCode === 401 && _onUnauthorized) {
      _onUnauthorized()
    }

    throw err
  }
  const json = await res.json() as { success: boolean; data: T } | T
  if (json !== null && typeof json === 'object' && 'data' in (json as object)) {
    return (json as { success: boolean; data: T }).data
  }
  return json as T
}

/**
 * In-flight deduplication for GET requests.
 * Caches the parsed JSON result (not the raw Response) so multiple concurrent
 * callers for the same URL all receive the same data without re-fetching.
 * Cloning a consumed Response body fails — caching the parsed result avoids that.
 */
const inFlightGets = new Map<string, Promise<unknown>>()

async function fetchWithDedup(url: string, options: RequestInit): Promise<Response> {
  const key = url

  if (inFlightGets.has(key)) {
    // Return a synthetic Response wrapping the already-parsed JSON so the
    // rest of the pipeline (unwrap) can process it identically.
    const data = await inFlightGets.get(key)!
    return new Response(JSON.stringify(data), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    })
  }

  // Kick off the real fetch and cache the parsed-JSON promise immediately
  // so concurrent callers attach to it before the first await resolves.
  let resolveParsed!: (v: unknown) => void
  let rejectParsed!: (e: unknown) => void
  const parsedPromise = new Promise<unknown>((res, rej) => {
    resolveParsed = res
    rejectParsed = rej
  })
  inFlightGets.set(key, parsedPromise)

  try {
    const res = await fetch(url, options)
    // Clone before reading so we can still return the original Response
    const clone = res.clone()
    clone.json().then(resolveParsed).catch(rejectParsed)
    return res
  } catch (err) {
    rejectParsed(err)
    throw err
  } finally {
    inFlightGets.delete(key)
  }
}

/**
 * Retry a fetch once after a short delay when the server returns 429.
 * Reads the Retry-After header if present, otherwise waits 2 seconds.
 * Does NOT retry auth endpoints to avoid exhausting rate limits.
 */
async function fetchWithRetry(
  url: string,
  options: RequestInit,
  useDedup = false,
): Promise<Response> {
  const doFetch = useDedup
    ? () => fetchWithDedup(url, options)
    : () => fetch(url, options)

  const res = await doFetch()

  if (res.status === 429) {
    // Don't retry auth endpoints - let the user see the error immediately
    const isAuthEndpoint = url.includes('/auth/login') || url.includes('/auth/register')
    if (isAuthEndpoint) {
      return res
    }

    const retryAfter = res.headers.get('Retry-After')
    const waitMs = retryAfter ? parseFloat(retryAfter) * 1000 : 2000
    await new Promise((r) => setTimeout(r, waitMs))
    return doFetch()
  }

  return res
}

export async function get<T>(path: string): Promise<T> {
  const res = await fetchWithRetry(
    `${BASE_URL}${path}`,
    { headers: getAuthHeaders() },
    true, // use dedup for GETs
  )
  return unwrap<T>(res, res.status)
}

export async function post<T>(path: string, body: unknown): Promise<T> {
  const res = await fetchWithRetry(`${BASE_URL}${path}`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(body),
  })
  return unwrap<T>(res, res.status)
}

export async function patch<T>(path: string, body: unknown): Promise<T> {
  const res = await fetchWithRetry(`${BASE_URL}${path}`, {
    method: 'PATCH',
    headers: getAuthHeaders(),
    body: JSON.stringify(body),
  })
  return unwrap<T>(res, res.status)
}

export async function put<T>(path: string, body: unknown): Promise<T> {
  const res = await fetchWithRetry(`${BASE_URL}${path}`, {
    method: 'PUT',
    headers: getAuthHeaders(),
    body: JSON.stringify(body),
  })
  return unwrap<T>(res, res.status)
}

export async function del<T>(path: string): Promise<T> {
  const res = await fetchWithRetry(`${BASE_URL}${path}`, {
    method: 'DELETE',
    headers: getAuthHeaders(),
  })
  return unwrap<T>(res, res.status)
}
