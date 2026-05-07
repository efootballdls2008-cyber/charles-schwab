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

export async function fetchUser(_id?: number): Promise<User | null> {
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
  try {
    const response = await post<LoginResponse>('/auth/login', { email, password })
    if (!response.success || !response.token) return null

    localStorage.setItem('cs_token', response.token)
    return await fetchUser(response.user.id)
  } catch {
    return null
  }
}

export async function register(
  firstName: string,
  lastName: string,
  email: string,
  password: string,
): Promise<User | null> {
  try {
    const response = await post<RegisterResponse>('/auth/register', {
      firstName,
      lastName,
      email,
      password,
    })

    if (!response.success || !response.token) return null

    localStorage.setItem('cs_token', response.token)
    return await fetchUser(response.userId)
  } catch {
    return null
  }
}
