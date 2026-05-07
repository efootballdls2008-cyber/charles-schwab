import { useState, useEffect, useCallback } from 'react'
import { botEngine } from '../engine/botEngine'
import type { TradeCloseEvent } from '../engine/botEngine'

// Re-export types from botEngine
export type {
  SignalType,
  StrategyName,
  RiskLevel,
  BotTrade,
  AlgoSignal,
  AlgoState,
  AlgoPerformance,
  TradeCloseEvent,
} from '../engine/botEngine'

// ─── React Hook (connects to persistent engine) ──────────────────────────────

export function useAlgorithmEngine(
  livePrice: number,
  userId: number,
  availableBalance: number,
  onTradeClose?: (event: TradeCloseEvent) => void,
) {
  const [, forceUpdate] = useState(0)

  // Initialize engine on mount
  useEffect(() => {
    botEngine.init(userId, availableBalance)
  }, [userId, availableBalance])

  // Subscribe to engine updates
  useEffect(() => {
    const unsub = botEngine.subscribe(() => forceUpdate((n) => n + 1))
    return () => { unsub() }
  }, [])

  // Feed live price to engine
  useEffect(() => {
    botEngine.updatePrice(livePrice)
  }, [livePrice])

  // Update balance
  useEffect(() => {
    botEngine.updateBalance(availableBalance)
  }, [availableBalance])

  // Subscribe to trade close events
  useEffect(() => {
    if (!onTradeClose) return
    const unsub = botEngine.onTradeClose(onTradeClose)
    return () => { unsub() }
  }, [onTradeClose])

  // Wrap start/stop/updateSettings
  const start = useCallback(() => {
    botEngine.start()
  }, [])

  const stop = useCallback(async () => {
    return await botEngine.stop()
  }, [])

  const updateSettings = useCallback((updates: Partial<ReturnType<typeof botEngine.getState>>) => {
    botEngine.updateSettings(updates)
  }, [])

  return {
    state: botEngine.getState(),
    signal: botEngine.getSignal(),
    trades: botEngine.getTrades(),
    performance: botEngine.getPerformance(),
    scanStatus: botEngine.getScanStatus(),
    elapsed: botEngine.getElapsed(),
    openTrade: botEngine.getOpenTrade(),
    start,
    stop,
    updateSettings,
  }
}
