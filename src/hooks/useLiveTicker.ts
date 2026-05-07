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

const BINANCE_WS = 'wss://stream.binance.com:9443/ws'
const BINANCE_REST = 'https://api.binance.com/api/v3/ticker/24hr'

/** Fetch ticker via REST as a fallback / initial load */
async function fetchTickerRest(baseSymbol: string): Promise<TickerData | null> {
  try {
    const res = await fetch(`${BINANCE_REST}?symbol=${baseSymbol.toUpperCase()}USDT`)
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

export function useLiveTicker(baseSymbol: string): TickerData | null {
  const [ticker, setTicker] = useState<TickerData | null>(null)
  const wsRef = useRef<WebSocket | null>(null)
  const restIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const wsFailedRef = useRef(false)

  // REST polling fallback
  const startRestPolling = useCallback((sym: string) => {
    if (restIntervalRef.current) clearInterval(restIntervalRef.current)
    // Fetch immediately
    fetchTickerRest(sym).then((t) => { if (t) setTicker(t) })
    // Then poll every 5 seconds
    restIntervalRef.current = setInterval(() => {
      fetchTickerRest(sym).then((t) => { if (t) setTicker(t) })
    }, 5000)
  }, [])

  const connect = useCallback((sym: string) => {
    // Close any existing WS
    if (wsRef.current) {
      wsRef.current.onmessage = null
      wsRef.current.onerror = null
      wsRef.current.onclose = null
      wsRef.current.close()
      wsRef.current = null
    }

    wsFailedRef.current = false
    const stream = `${sym.toLowerCase()}usdt@ticker`
    const ws = new WebSocket(`${BINANCE_WS}/${stream}`)
    wsRef.current = ws

    // Timeout: if no message in 4s, fall back to REST
    const timeout = setTimeout(() => {
      if (!wsFailedRef.current) {
        wsFailedRef.current = true
        ws.close()
        startRestPolling(sym)
      }
    }, 4000)

    ws.onmessage = (e) => {
      clearTimeout(timeout)
      try {
        const d = JSON.parse(e.data as string) as {
          c: string; P: string; p: string; h: string; l: string; q: string
        }
        setTicker({
          symbol: `${sym}/USDT`,
          price: parseFloat(d.c),
          changePct24h: parseFloat(d.P),
          change24h: parseFloat(d.p),
          high24h: parseFloat(d.h),
          low24h: parseFloat(d.l),
          volume24h: parseFloat(d.q),
        })
      } catch {
        // ignore parse errors
      }
    }

    ws.onerror = () => {
      clearTimeout(timeout)
      if (!wsFailedRef.current) {
        wsFailedRef.current = true
        ws.close()
        startRestPolling(sym)
      }
    }

    ws.onclose = () => {
      clearTimeout(timeout)
    }
  }, [startRestPolling])

  useEffect(() => {
    setTicker(null)
    // Always fetch REST immediately for instant data
    fetchTickerRest(baseSymbol).then((t) => { if (t) setTicker(t) })
    // Also try WebSocket for live updates
    connect(baseSymbol)

    return () => {
      if (wsRef.current) {
        wsRef.current.onmessage = null
        wsRef.current.onerror = null
        wsRef.current.onclose = null
        wsRef.current.close()
        wsRef.current = null
      }
      if (restIntervalRef.current) {
        clearInterval(restIntervalRef.current)
        restIntervalRef.current = null
      }
    }
  }, [baseSymbol, connect])

  return ticker
}
