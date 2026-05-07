import { get } from '../api/client'
import { ENDPOINTS } from '../api/endpoints'

export interface Wallet {
  id: number
  userId: number
  coin: string
  symbol: string
  balance: number
  valueUsd: number
  change30d: number
  color: string
}

export async function getWallets(userId: number): Promise<Wallet[]> {
  return get<Wallet[]>(ENDPOINTS.wallets(userId))
}
