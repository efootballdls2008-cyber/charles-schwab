import { get, post } from '../api/client'
import { ENDPOINTS } from '../api/endpoints'

export interface Deposit {
  id: number
  userId: number
  type: 'deposit' | 'withdraw'
  method: string
  amount: number
  currency: string
  status: 'completed' | 'pending' | 'cancelled'
  date: string
  time: string
  txId: string
  note: string
}

export async function getDeposits(userId: number): Promise<Deposit[]> {
  return get<Deposit[]>(ENDPOINTS.deposits(userId))
}

export async function createDeposit(
  userId: number,
  amount: number,
  method: string,
  note: string = ''
): Promise<{ deposit: Deposit; newBalance: number }> {
  // Get current user balance (unchanged until admin approves)
  const user = await get<{ balance: number }>(`/users/${userId}`)

  // Create deposit record with PENDING status — balance is credited after admin approval
  const now = new Date()
  const deposit: Omit<Deposit, 'id'> = {
    userId,
    type: 'deposit',
    method,
    amount,
    currency: 'USD',
    status: 'pending',
    date: now.toISOString().split('T')[0],
    time: now.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true }),
    txId: `#DEP-${String(Date.now()).slice(-5)}`,
    note,
  }

  const created = await post<Deposit>(ENDPOINTS.depositsAll, deposit)

  // Return current balance unchanged — it will update when admin approves
  return { deposit: created, newBalance: user.balance }
}

export async function createWithdraw(
  userId: number,
  amount: number,
  method: string,
  note: string = ''
): Promise<{ deposit: Deposit; newBalance: number }> {
  // Get current user balance
  const user = await get<{ balance: number }>(`/users/${userId}`)

  if (user.balance < amount) {
    throw new Error('Insufficient balance')
  }

  // Create withdraw record with PENDING status — balance is deducted after admin approval
  const now = new Date()
  const withdraw: Omit<Deposit, 'id'> = {
    userId,
    type: 'withdraw',
    method,
    amount,
    currency: 'USD',
    status: 'pending',
    date: now.toISOString().split('T')[0],
    time: now.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true }),
    txId: `#WTH-${String(Date.now()).slice(-5)}`,
    note,
  }

  const created = await post<Deposit>(ENDPOINTS.depositsAll, withdraw)

  // Return current balance unchanged — it will update when admin approves
  return { deposit: created, newBalance: user.balance }
}
