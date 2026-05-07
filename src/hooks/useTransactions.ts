import { useState, useEffect } from 'react'
import { getTransactions } from '../services/transactionService'
import type { Transaction } from '../services/transactionService'

interface UseTransactionsResult {
  transactions: Transaction[]
  loading: boolean
  error: string | null
}

export function useTransactions(userId: number | undefined): UseTransactionsResult {
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!userId) {
      setLoading(false)
      return
    }
    setLoading(true)
    getTransactions(userId)
      .then((data) => {
        setTransactions(data)
        setError(null)
      })
      .catch((err: unknown) => {
        setError(err instanceof Error ? err.message : 'Failed to load transactions')
      })
      .finally(() => setLoading(false))
  }, [userId])

  return { transactions, loading, error }
}
