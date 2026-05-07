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

interface RegisterResponse {
  success: boolean
  token: string
  userId: number
}

interface UserResponse {
  success: boolean
  data: {
    id: number
    email: string
    first_name: string
    last_name: string
    role: string
    avatar: string | null
    balance: number
    currency: string
    phone?: string
    date_of_birth?: string
    country?: string
    address?: string
    member_since?: string
    account_status?: string
  }
}

export async function fetchUser(id: number): Promise<User | null> {
  try {
    const response = await get<UserResponse>('/auth/me')
    if (!response.success) return null
    
    const data = response.data
    return {
      id: data.id,
      email: data.email,
      firstName: data.first_name,
      lastName: data.last_name,
      role: data.role,
      avatar: data.avatar,
      balance: data.balance,
      currency: data.currency,
      phone: data.phone,
      dateOfBirth: data.date_of_birth,
      country: data.country,
      address: data.address,
      memberSince: data.member_since,
      accountStatus: data.account_status,
    }
  } catch {
    return null
  }
}

export async function login(email: string, password: string): Promise<User | null> {
  try {
    const response = await post<LoginResponse>('/auth/login', { email, password })
    if (!response.success || !response.token) return null
    
    // Store the JWT token
    localStorage.setItem('cs_token', response.token)
    
    // Fetch full user details
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
    
    // Store the JWT token
    localStorage.setItem('cs_token', response.token)
    
    // Fetch full user details
    return await fetchUser(response.userId)
  } catch {
    return null
  }
}
