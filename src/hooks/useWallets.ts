import { useState, useEffect } from 'react'
import { getWallets } from '../services/walletService'
import type { Wallet } from '../services/walletService'

interface UseWalletsResult {
  wallets: Wallet[]
  loading: boolean
  error: string | null
}

export function useWallets(userId: number | undefined): UseWalletsResult {
  const [wallets, setWallets] = useState<Wallet[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!userId) {
      setLoading(false)
      return
    }
    setLoading(true)
    getWallets(userId)
      .then((data) => {
        setWallets(data)
        setError(null)
      })
      .catch((err: unknown) => {
        setError(err instanceof Error ? err.message : 'Failed to load wallets')
      })
      .finally(() => setLoading(false))
  }, [userId])

  return { wallets, loading, error }
}
