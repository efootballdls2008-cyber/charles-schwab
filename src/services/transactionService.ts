import { get } from '../api/client'
import { ENDPOINTS } from '../api/endpoints'

export interface Transaction {
  id: number
  userId: number
  txId: string
  from: string
  to: string
  coin: string
  coinSymbol: string
  coinColor: string
  amount: number
  date: string
  time: string
  status: 'completed' | 'pending' | 'cancelled'
}

export interface TradeHistory {
  id: number
  userId: number
  tradeId: string
  date: string
  time: string
  type: 'Spot' | 'Futures'
  executedBy: 'Trade Bot' | 'You'
  asset: string
  assetSymbol: string
  assetColor: string
  pair: string
  side: 'Buy' | 'Sell'
  amount: number
  amountUsd: number
  entryPrice: number
  exitPrice: number
  profitLoss: number
  plPct: number
  status: 'completed' | 'pending' | 'cancelled' | 'processing'
  // Bot-trade extras (only present when executedBy === 'Trade Bot')
  botTradeId?: string
  signal?: string
  strategy?: string
  confidence?: number
}

export async function getTransactions(userId: number): Promise<Transaction[]> {
  return get<Transaction[]>(ENDPOINTS.transactions(userId))
}

export async function getTradeHistory(userId: number): Promise<TradeHistory[]> {
  return get<TradeHistory[]>(ENDPOINTS.tradeHistory(userId))
}
