import { useState, useCallback } from 'react'
import type { ToastType } from '../components/ui/Toast'

export interface PnlToastPayload {
  type: ToastType
  message: string
  pnl?: number
  pnlPct?: number
  pair?: string
  source?: 'bot' | 'manual'
  duration?: number
}

/**
 * Manages a single-slot toast queue.
 * New toasts replace the current one immediately so the user always sees
 * the latest trade result without stacking.
 */
export function usePnlToast() {
  const [toast, setToast] = useState<(PnlToastPayload & { id: number }) | null>(null)

  const showToast = useCallback((payload: PnlToastPayload) => {
    setToast({ ...payload, id: Date.now() })
  }, [])

  const showPnl = useCallback(
    (
      pnl: number,
      pnlPct: number,
      pair: string,
      source: 'bot' | 'manual',
      reason?: string,
    ) => {
      const isProfit = pnl >= 0
      showToast({
        type: isProfit ? 'pnl-profit' : 'pnl-loss',
        message: reason ?? (isProfit ? 'Take-profit reached' : 'Stop-loss triggered'),
        pnl,
        pnlPct,
        pair,
        source,
        duration: 5000,
      })
    },
    [showToast],
  )

  const showSuccess = useCallback((message: string) => {
    showToast({ type: 'success', message })
  }, [showToast])

  const showError = useCallback((message: string) => {
    showToast({ type: 'error', message })
  }, [showToast])

  const dismiss = useCallback(() => setToast(null), [])

  return { toast, showPnl, showSuccess, showError, dismiss }
}
