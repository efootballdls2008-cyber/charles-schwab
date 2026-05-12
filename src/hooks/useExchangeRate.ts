import { useState, useEffect, useRef } from 'react'
import { get } from '../api/client'

interface ExchangeRateResponse {
  success: boolean
  base: string
  rates: Record<string, number>
  cached: boolean
}

// Module-level cache so all hook instances share the same data
let _rates: Record<string, number> | null = null
let _fetchedAt = 0
const CACHE_TTL_MS = 60 * 60 * 1000 // 1 hour

/**
 * Returns the exchange rate from USD to the given currency code.
 * e.g. useExchangeRate('NGN') → ~1580  (1 USD = 1580 NGN)
 *
 * Returns 1 while loading or if the currency is USD.
 */
export function useExchangeRate(currencyCode: string): {
  rate: number
  loading: boolean
} {
  const [rate, setRate] = useState<number>(1)
  const [loading, setLoading] = useState(true)
  const mountedRef = useRef(true)

  useEffect(() => {
    mountedRef.current = true
    return () => { mountedRef.current = false }
  }, [])

  useEffect(() => {
    const code = (currencyCode ?? 'USD').toUpperCase()

    // USD → USD is always 1, no fetch needed
    if (code === 'USD') {
      setRate(1)
      setLoading(false)
      return
    }

    const applyRate = (rates: Record<string, number>) => {
      const r = rates[code] ?? 1
      if (mountedRef.current) {
        setRate(r)
        setLoading(false)
      }
    }

    // Serve from module-level cache if still fresh
    const now = Date.now()
    if (_rates && (now - _fetchedAt) < CACHE_TTL_MS) {
      applyRate(_rates)
      return
    }

    // Fetch fresh rates
    setLoading(true)
    get<ExchangeRateResponse>('/exchange-rates')
      .then((data) => {
        if (data?.rates) {
          _rates = data.rates
          _fetchedAt = Date.now()
          applyRate(data.rates)
        } else {
          if (mountedRef.current) setLoading(false)
        }
      })
      .catch(() => {
        // On error, fall back to 1 (show USD value)
        if (mountedRef.current) {
          setRate(1)
          setLoading(false)
        }
      })
  }, [currencyCode])

  return { rate, loading }
}

/**
 * Converts a USD amount to the user's local currency.
 */
export function convertFromUSD(usdAmount: number, rate: number): number {
  return usdAmount * rate
}

/**
 * Converts a local currency amount back to USD.
 */
export function convertToUSD(localAmount: number, rate: number): number {
  if (rate === 0) return localAmount
  return localAmount / rate
}
