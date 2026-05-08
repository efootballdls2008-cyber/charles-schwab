import { get, post } from '../api/client'

export interface User {
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

export async function register(  firstName: string,
  lastName: string,
  email: string,
  password: string,
): Promise<User | null> {
  let response: RegisterResponse
  try {
    response = await post<RegisterResponse>('/auth/register', {
      firstName,
      lastName,
      email,
      password,
    })
  } catch (err) {
    const status = (err as { status?: number }).status
    const message = err instanceof Error ? err.message : ''

    if (status === 429) {
      throw new Error('Too many registration attempts. Please wait a few minutes and try again.')
    }
    if (status === 409 || message.toLowerCase().includes('already')) {
      throw new Error('An account with this email already exists.')
    }
    if (status === 403) {
      throw new Error('Registration is currently disabled.')
    }
    throw new Error('Unable to reach the server. Please check your connection and try again.')
  }

  if (!response.success || !response.token) {
    throw new Error('Registration failed. Please try again.')
  }

  localStorage.setItem('cs_token', response.token)
  return await fetchUser()
}
