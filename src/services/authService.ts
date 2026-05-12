import { get, post } from '../api/client'
import { getCurrencySymbol } from '../utils/currency'

export interface User {
  id: number
  email: string
  firstName: string
  lastName: string
  role: string
  avatar: string | null
  balance: number
  currency: string
  currencySymbol: string
  phone?: string
  dateOfBirth?: string
  country?: string
  address?: string
  memberSince?: string
  accountStatus?: string
  // Banking — deposit account (where user sends FROM)
  depositBankName?: string
  depositAccountName?: string
  depositAccountNumber?: string
  depositRoutingNumber?: string
  depositAccountType?: string
  // Banking — withdrawal account (where platform sends TO)
  withdrawBankName?: string
  withdrawAccountName?: string
  withdrawAccountNumber?: string
  withdrawRoutingNumber?: string
  withdrawAccountType?: string
  withdrawSwiftCode?: string
}

// Shape returned by POST /auth/login (no { success, data } wrapper)
interface LoginResponse {
  success: boolean
  token: string
  user: {
    id: number
    email: string
    firstName: string
    lastName: string
    role: string
  }
}

// Shape returned by POST /auth/register (no { success, data } wrapper)
interface RegisterResponse {
  success: boolean
  token: string
  userId: number
}

// GET /auth/me returns { success, data: User } — unwrap() strips the envelope
// so we receive the User object directly (camelCase after backend transformer)
interface MeUser {
  id: number
  email: string
  firstName: string
  lastName: string
  role: string
  avatar: string | null
  balance: number
  currency: string
  phone?: string
  dateOfBirth?: string
  country?: string
  address?: string
  memberSince?: string
  accountStatus?: string
}

export async function fetchUser(): Promise<User | null> {
  try {
    const data = await get<MeUser>('/auth/me')
    if (!data?.id) return null
    return {
      id: data.id,
      email: data.email,
      firstName: data.firstName,
      lastName: data.lastName,
      role: data.role,
      avatar: data.avatar,
      balance: data.balance,
      currency: data.currency,
      currencySymbol: getCurrencySymbol(data.currency),
      phone: data.phone,
      dateOfBirth: data.dateOfBirth,
      country: data.country,
      address: data.address,
      memberSince: data.memberSince,
      accountStatus: data.accountStatus,
    }
  } catch {
    return null
  }
}

export async function login(email: string, password: string): Promise<User | null> {
  let response: LoginResponse
  try {
    response = await post<LoginResponse>('/auth/login', { email, password })
  } catch (err) {
    // Check the status code attached by unwrap() — never log or expose the path
    const status = (err as { status?: number }).status
    if (status === 429) {
      throw new Error('Too many login attempts. Please wait a few minutes and try again.')
    }
    if (status === 401) {
      throw new Error('Invalid email or password.')
    }
    // Network-level failure (ERR_EMPTY_RESPONSE, no internet, CORS, etc.)
    throw new Error('Unable to reach the server. Please check your connection and try again.')
  }

  if (!response.success || !response.token) {
    throw new Error('Login failed. Please try again.')
  }

  localStorage.setItem('cs_token', response.token)
  return await fetchUser()
}

/**
 * Refresh the current JWT token before it expires.
 * Returns the new token string, or null if the refresh failed.
 */
export async function refreshToken(): Promise<string | null> {
  try {
    const response = await post<{ success: boolean; token: string }>('/auth/refresh', {})
    if (response?.token) {
      localStorage.setItem('cs_token', response.token)
      return response.token
    }
    return null
  } catch {
    return null
  }
}

export interface RegisterPayload {
  username: string
  firstName: string
  lastName: string
  email: string
  phone: string
  country: string
  currency: string
  password: string
  confirmPassword: string
}

/** Shape of a field-level conflict error returned by the backend (HTTP 409) */
export interface RegisterConflictError extends Error {
  field?: 'email' | 'username'
}

export async function register(payload: RegisterPayload): Promise<User | null> {
  let response: RegisterResponse
  try {
    // Remove username from payload since backend doesn't support it yet
    const { username, ...registrationData } = payload
    response = await post<RegisterResponse>('/auth/register', registrationData)  } catch (err) {
    const status  = (err as { status?: number }).status
    const body    = (err as { body?: { field?: string; message?: string } }).body
    const message = err instanceof Error ? err.message : ''

    if (status === 429) {
      throw new Error('Too many registration attempts. Please wait a few minutes and try again.')
    }
    if (status === 409) {
      // Backend tells us which field caused the conflict
      const conflict: RegisterConflictError = new Error(
        body?.message ?? 'An account with this email already exists.'
      )
      conflict.field = (body?.field as 'email' | 'username') ?? 'email'
      throw conflict
    }
    if (status === 403) {
      throw new Error('Registration is currently disabled. Please try again later.')
    }
    if (message.toLowerCase().includes('already')) {
      throw new Error('An account with this email already exists.')
    }
    throw new Error('Unable to reach the server. Please check your connection and try again.')
  }

  if (!response.success || !response.token) {
    throw new Error('Registration failed. Please try again.')
  }

  localStorage.setItem('cs_token', response.token)
  return await fetchUser()
}

/** Check whether a username is available without submitting the full form. */
export async function checkUsername(username: string): Promise<boolean> {
  try {
    const data = await post<{ success: boolean; available: boolean }>(
      '/auth/check-username',
      { username }
    )
    return data?.available ?? false
  } catch {
    // Network error — optimistically allow; server will reject on submit if taken
    return true
  }
}
