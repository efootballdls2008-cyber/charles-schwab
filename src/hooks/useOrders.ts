import { useState, useEffect } from 'react'
import { getOrders } from '../services/orderService'
import type { Order } from '../services/orderService'

interface UseOrdersResult {
  orders: Order[]
  loading: boolean
  error: string | null
}

export function useOrders(userId: number | undefined, type: 'sell' | 'buy'): UseOrdersResult {
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!userId) {
      setLoading(false)
      return
    }
    setLoading(true)
    getOrders(userId, type)
      .then((data) => {
        setOrders(data)
        setError(null)
      })
      .catch((err: unknown) => {
        setError(err instanceof Error ? err.message : 'Failed to load orders')
      })
      .finally(() => setLoading(false))
  }, [userId, type])

  return { orders, loading, error }
}
