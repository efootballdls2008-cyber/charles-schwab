import { get, post } from '../api/client'
import { ENDPOINTS } from '../api/endpoints'

export interface Holding {
  id: number
  userId: number
  type: 'stock' | 'crypto'
  symbol: string
  name: string
  color: string
  quantity: number
  avgBuyPrice: number
  currentPrice: number
}

export interface Purchase {
  id: number
  userId: number
  type: 'buy_stock' | 'buy_crypto'
  symbol: string
  name: string
  color: string
  quantity: number
  price: number
  totalCost: number
  date: string
  time: string
  txId: string
  status: 'completed' | 'pending' | 'cancelled'
}

export async function getHoldings(userId: number): Promise<Holding[]> {
  return get<Holding[]>(ENDPOINTS.holdings(userId))
}

export async function buyAsset(
  userId: number,
  type: 'stock' | 'crypto',
  symbol: string,
  name: string,
  color: string,
  quantity: number,
  price: number
): Promise<{ purchase: Purchase; newBalance: number }> {
  const totalCost = quantity * price

  // Get current user balance
  const user = await get<{ balance: number }>(`/users/${userId}`)
  
  if (user.balance < totalCost) {
    throw new Error('Insufficient balance')
  }

  // Create purchase record with PENDING status — admin must approve
  // Balance and holdings are NOT updated here — admin does it on approval
  const now = new Date()
  const purchase: Omit<Purchase, 'id'> = {
    userId,
    type: type === 'stock' ? 'buy_stock' : 'buy_crypto',
    symbol,
    name,
    color,
    quantity,
    price,
    totalCost,
    date: now.toISOString().split('T')[0],
    time: now.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true }),
    txId: `#BUY-${String(Date.now()).slice(-5)}`,
    status: 'pending',
  }

  const createdPurchase = await post<Purchase>(ENDPOINTS.purchasesAll, purchase)

  return { purchase: createdPurchase, newBalance: user.balance }
}
