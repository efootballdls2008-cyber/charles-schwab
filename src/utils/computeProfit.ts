/**
 * computeProfit
 *
 * Utility functions for computing profit data from bot trades and trade history.
 * Provides period-based profit calculations (Today, This Week, This Month, All Time)
 * and formatting helpers for displaying profit values.
 */

import type { BotTrade } from '../hooks/useAlgorithmEngine'

// ─── Types ────────────────────────────────────────────────────────────────────

export type ProfitPeriod = 'Today' | 'This Week' | 'This Month' | 'This Year' | 'All Time'

export interface ProfitDataPoint {
  day: string
  profit: number
}

export interface ComputedProfitOverview {
  userId: number
  period: ProfitPeriod
  data: ProfitDataPoint[]
}

export interface ProfitTradeHistoryRow {
  id: number
  userId: number
  date: string | null
  time?: string | null
  assetSymbol?: string | null
  pair?: string | null
  profitLoss: number | null
  status?: string
  [key: string]: any
}

// ─── Period Filtering ─────────────────────────────────────────────────────────

function getDateKey(dateStr: string | null | undefined): string | null {
  if (!dateStr) return null
  try {
    const d = new Date(dateStr)
    if (isNaN(d.getTime())) return null
    return d.toISOString().split('T')[0]
  } catch {
    return null
  }
}

function isInPeriod(dateStr: string | null | undefined, period: ProfitPeriod): boolean {
  if (!dateStr) return false
  try {
    const d = new Date(dateStr)
    if (isNaN(d.getTime())) return false
    
    const now = new Date()
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())

    switch (period) {
      case 'Today': {
        const itemDate = new Date(d.getFullYear(), d.getMonth(), d.getDate())
        return itemDate.getTime() === today.getTime()
      }
      case 'This Week': {
        const weekStart = new Date(today)
        weekStart.setDate(today.getDate() - today.getDay())
        return d >= weekStart
      }
      case 'This Month': {
        return d.getFullYear() === now.getFullYear() && d.getMonth() === now.getMonth()
      }
      case 'This Year': {
        return d.getFullYear() === now.getFullYear()
      }
      case 'All Time': {
        return true
      }
      default:
        return false
    }
  } catch {
    return false
  }
}

// ─── Profit Calculation ───────────────────────────────────────────────────────

export function sumPeriodProfit(
  period: ProfitPeriod,
  botTrades: BotTrade[],
  tradeHistory: ProfitTradeHistoryRow[]
): { total: number; hasActivity: boolean } {
  let total = 0
  let hasActivity = false

  // Sum from bot trades
  for (const trade of botTrades) {
    if (trade.status !== 'closed') continue
    const dateStr = trade.closedAt ?? trade.openedAt
    if (!isInPeriod(dateStr, period)) continue
    
    const pnl = trade.finalPnl ?? trade.pnl ?? 0
    total += pnl
    hasActivity = true
  }

  // Sum from trade history
  for (const trade of tradeHistory) {
    if (trade.status && trade.status !== 'completed') continue
    const dateStr = trade.date ? `${trade.date} ${trade.time ?? ''}`.trim() : null
    if (!isInPeriod(dateStr, period)) continue
    
    const pnl = trade.profitLoss ?? 0
    total += pnl
    hasActivity = true
  }

  return { total, hasActivity }
}

export function computeAllPeriodProfit(
  botTrades: BotTrade[],
  tradeHistory: ProfitTradeHistoryRow[]
): ComputedProfitOverview[] {
  const periods: ProfitPeriod[] = ['Today', 'This Week', 'This Month', 'This Year', 'All Time']
  const userId = botTrades[0]?.userId ?? tradeHistory[0]?.userId ?? 0

  return periods.map(period => {
    const dataMap = new Map<string, number>()

    // Process bot trades
    for (const trade of botTrades) {
      if (trade.status !== 'closed') continue
      const dateStr = trade.closedAt ?? trade.openedAt
      if (!isInPeriod(dateStr, period)) continue
      
      const day = getDateKey(dateStr)
      if (!day) continue
      
      const pnl = trade.finalPnl ?? trade.pnl ?? 0
      dataMap.set(day, (dataMap.get(day) ?? 0) + pnl)
    }

    // Process trade history
    for (const trade of tradeHistory) {
      if (trade.status && trade.status !== 'completed') continue
      const dateStr = trade.date ? `${trade.date} ${trade.time ?? ''}`.trim() : null
      if (!isInPeriod(dateStr, period)) continue
      
      const day = getDateKey(dateStr)
      if (!day) continue
      
      const pnl = trade.profitLoss ?? 0
      dataMap.set(day, (dataMap.get(day) ?? 0) + pnl)
    }

    // Convert to sorted array
    const data: ProfitDataPoint[] = Array.from(dataMap.entries())
      .map(([day, profit]) => ({ day, profit }))
      .sort((a, b) => a.day.localeCompare(b.day))

    return {
      userId,
      period,
      data
    }
  })
}

// ─── Formatting Helpers ───────────────────────────────────────────────────────

export function formatSignedAmount(
  amount: number, 
  currencySymbol = '$',
  options?: { includePct?: number }
): string {
  const abs = Math.abs(amount)
  const formatted = abs.toLocaleString('en-US', { 
    minimumFractionDigits: 2, 
    maximumFractionDigits: 2 
  })
  
  let result = ''
  if (amount > 0) {
    result = `+${currencySymbol}${formatted}`
  } else if (amount < 0) {
    result = `-${currencySymbol}${formatted}`
  } else {
    result = `${currencySymbol}${formatted}`
  }

  // Append percentage if provided
  if (options?.includePct !== undefined) {
    const pctFormatted = options.includePct.toFixed(2)
    result += ` (${options.includePct >= 0 ? '+' : ''}${pctFormatted}%)`
  }

  return result
}

export function formatPnlPct(pnl: number, balance: number): number {
  if (balance === 0) return 0
  return parseFloat(((pnl / balance) * 100).toFixed(2))
}
