import { useState, useEffect, useCallback, useRef } from 'react'

export interface TickerData {
  symbol: string        // e.g. "BTC/USDT"
  price: number
  change24h: number     // absolute
  changePct24h: number  // percent
  high24h: number
  low24h: number
  volume24h: number     // in USDT
}

// Route all market data through our own backend to avoid CORS and geo-restrictions.
const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3001'

/** Fetch ticker via the backend proxy */
async function fetchTickerRest(baseSymbol: string): Promise<TickerData | null> {
  try {
    const res = await fetch(`${API_BASE}/ticker/${baseSymbol.toUpperCase()}USDT`)
    if (!res.ok) return null
    const d = await res.json() as {
      lastPrice: string; priceChange: string; priceChangePercent: string
      highPrice: string; lowPrice: string; quoteVolume: string
    }
    return {
      symbol: `${baseSymbol}/USDT`,
      price: parseFloat(d.lastPrice),
      change24h: parseFloat(d.priceChange),
      changePct24h: parseFloat(d.priceChangePercent),
      high24h: parseFloat(d.highPrice),
      low24h: parseFloat(d.lowPrice),
      volume24h: parseFloat(d.quoteVolume),
    }
  } catch {
    return null
  }
}

// Poll every 15 seconds — the backend caches Binance responses for 8s,
// so polling faster than that just wastes requests.
const POLL_INTERVAL_MS = 15_000

export function useLiveTicker(baseSymbol: string): TickerData | null {
  const [ticker, setTicker] = useState<TickerData | null>(null)
  const restIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null)
  // Prevent a second in-flight fetch while one is already running
  const fetchingRef = useRef(false)

  const fetchOnce = useCallback(async (sym: string) => {
    if (fetchingRef.current) return
    fetchingRef.current = true
    try {
      const t = await fetchTickerRest(sym)
      if (t) setTicker(t)
    } finally {
      fetchingRef.current = false
    }
  }, [])

  useEffect(() => {
    setTicker(null)

    // Debounce the initial fetch by 50ms to absorb React StrictMode
    // double-invoke — the second effect run cancels the first timer.
    const debounceTimer = setTimeout(() => {
      void fetchOnce(baseSymbol)
      restIntervalRef.current = setInterval(() => {
        void fetchOnce(baseSymbol)
      }, POLL_INTERVAL_MS)
    }, 50)

    return () => {
      clearTimeout(debounceTimer)
      if (restIntervalRef.current) {
        clearInterval(restIntervalRef.current)
        restIntervalRef.current = null
      }
    }
  }, [baseSymbol, fetchOnce])

  return ticker
}
