import { useState, useEffect, useCallback, useRef } from 'react'

export interface LiveCoin {
  id: string
  symbol: string
  name: string
  image: string
  current_price: number
  price_change_percentage_24h: number
  market_cap: number
  sparkline_in_7d?: { price: number[] }
}

// CoinGecko free API — stocks aren't available, so we use top crypto + simulate stocks
const CRYPTO_IDS = 'bitcoin,ethereum,solana,binancecoin,ripple,cardano'

export function useLiveMarket(refreshMs = 60_000) {  // default raised to 60s (was 30s)
  const [coins, setCoins] = useState<LiveCoin[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null)
  const fetchingRef = useRef(false)

  const fetchData = useCallback(async () => {
    // Prevent concurrent fetches (React StrictMode double-invoke guard)
    if (fetchingRef.current) return
    fetchingRef.current = true
    try {
      const res = await fetch(
        `https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&ids=${CRYPTO_IDS}&order=market_cap_desc&per_page=6&page=1&sparkline=true&price_change_percentage=24h`,
      )
      if (!res.ok) throw new Error('Failed to fetch market data')
      const data = await res.json() as LiveCoin[]
      setCoins(data)
      setLastUpdated(new Date())
      setError(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Market data unavailable')
    } finally {
      setLoading(false)
      fetchingRef.current = false
    }
  }, [])

  useEffect(() => {
    // Debounce initial fetch to absorb StrictMode double-invoke
    const debounceTimer = setTimeout(() => void fetchData(), 50)
    const interval = setInterval(() => void fetchData(), refreshMs)
    return () => {
      clearTimeout(debounceTimer)
      clearInterval(interval)
    }
  }, [fetchData, refreshMs])

  return { coins, loading, error, lastUpdated, refetch: fetchData }
}

// Simulated stock data (will be replaced by real backend later)
export interface StockQuote {
  symbol: string
  name: string
  price: number
  change: number
  changePct: number
  logo: string
  sparkline: number[]
}

const BASE_STOCKS: StockQuote[] = [
  { symbol: 'AAPL', name: 'Apple', price: 193.42, change: 4.42, changePct: 2.35, logo: '🍎', sparkline: [188, 190, 189, 191, 192, 193, 193.42] },
  { symbol: 'TSLA', name: 'Tesla', price: 248.75, change: 8.25, changePct: 3.42, logo: '🚗', sparkline: [238, 241, 244, 243, 246, 248, 248.75] },
  { symbol: 'AMZN', name: 'Amazon', price: 187.35, change: -2.38, changePct: -1.25, logo: '📦', sparkline: [192, 191, 190, 189, 188, 187, 187.35] },
  { symbol: 'MSFT', name: 'Microsoft', price: 417.20, change: 6.82, changePct: 1.65, logo: '🪟', sparkline: [408, 410, 412, 413, 415, 416, 417.20] },
]

export function useStockQuotes() {
  const [stocks, setStocks] = useState<StockQuote[]>(BASE_STOCKS)

  useEffect(() => {
    // Simulate live price ticks
    const interval = setInterval(() => {
      setStocks((prev) =>
        prev.map((s) => {
          const tick = (Math.random() - 0.48) * 0.5
          const newPrice = parseFloat((s.price + tick).toFixed(2))
          const newChange = parseFloat((s.change + tick).toFixed(2))
          const newPct = parseFloat(((newChange / (newPrice - newChange)) * 100).toFixed(2))
          return {
            ...s,
            price: newPrice,
            change: newChange,
            changePct: newPct,
            sparkline: [...s.sparkline.slice(1), newPrice],
          }
        }),
      )
    }, 3000)
    return () => clearInterval(interval)
  }, [])

  return stocks
}
