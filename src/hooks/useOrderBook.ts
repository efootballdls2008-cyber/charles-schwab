import { useState, useEffect, useCallback } from 'react'

export interface OrderBookEntry {
  price: number
  amount: number
  total: number
}

export interface OrderBookData {
  asks: OrderBookEntry[] // sell side (red)
  bids: OrderBookEntry[] // buy side (green)
  lastPrice: number
  lastChange: number
}

// Generates a realistic order book around a mid price
function generateBook(mid: number): OrderBookData {
  const spread = mid * 0.0002
  const asks: OrderBookEntry[] = []
  const bids: OrderBookEntry[] = []

  for (let i = 0; i < 8; i++) {
    const price = mid + spread + i * mid * 0.00015 + Math.random() * mid * 0.00005
    const amount = parseFloat((Math.random() * 0.15 + 0.005).toFixed(4))
    asks.push({ price: parseFloat(price.toFixed(2)), amount, total: parseFloat((price * amount).toFixed(2)) })
  }

  for (let i = 0; i < 8; i++) {
    const price = mid - spread - i * mid * 0.00015 - Math.random() * mid * 0.00005
    const amount = parseFloat((Math.random() * 0.15 + 0.005).toFixed(4))
    bids.push({ price: parseFloat(price.toFixed(2)), amount, total: parseFloat((price * amount).toFixed(2)) })
  }

  return { asks, bids, lastPrice: mid, lastChange: 0.12 }
}

export function useOrderBook(midPrice: number) {
  const [book, setBook] = useState<OrderBookData>(() => generateBook(midPrice))

  const refresh = useCallback(() => {
    setBook(generateBook(midPrice + (Math.random() - 0.5) * midPrice * 0.001))
  }, [midPrice])

  useEffect(() => {
    const id = setInterval(refresh, 1500)
    return () => clearInterval(id)
  }, [refresh])

  return book
}

export interface RecentTrade {
  price: number
  amount: number
  time: string
  side: 'buy' | 'sell'
}

function nowTime() {
  return new Date().toLocaleTimeString('en-US', { hour12: false })
}

function generateTrades(mid: number): RecentTrade[] {
  return Array.from({ length: 10 }, (_, i) => {
    const side: 'buy' | 'sell' = Math.random() > 0.5 ? 'buy' : 'sell'
    const price = mid + (Math.random() - 0.5) * mid * 0.001
    const amount = parseFloat((Math.random() * 0.06 + 0.001).toFixed(4))
    const d = new Date()
    d.setSeconds(d.getSeconds() - i * 10)
    return {
      price: parseFloat(price.toFixed(2)),
      amount,
      time: d.toLocaleTimeString('en-US', { hour12: false }),
      side,
    }
  })
}

export function useRecentTrades(midPrice: number) {
  const [trades, setTrades] = useState<RecentTrade[]>(() => generateTrades(midPrice))

  useEffect(() => {
    const id = setInterval(() => {
      const side: 'buy' | 'sell' = Math.random() > 0.5 ? 'buy' : 'sell'
      const price = midPrice + (Math.random() - 0.5) * midPrice * 0.001
      const amount = parseFloat((Math.random() * 0.06 + 0.001).toFixed(4))
      setTrades((prev) => [
        { price: parseFloat(price.toFixed(2)), amount, time: nowTime(), side },
        ...prev.slice(0, 9),
      ])
    }, 2000)
    return () => clearInterval(id)
  }, [midPrice])

  return trades
}
