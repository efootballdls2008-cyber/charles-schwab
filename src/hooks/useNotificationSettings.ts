/**
 * useNotificationSettings — manages user notification preferences
 */
import { useState, useEffect, useCallback } from 'react'
import { get, put, post } from '../api/client'

// ── Types ─────────────────────────────────────────────────────────────────────

export interface NotificationSettings {
  id: number
  userId: number
  emailEnabled: boolean
  inAppEnabled: boolean
  
  // Email preferences
  emailDeposits: boolean
  emailWithdrawals: boolean
  emailTrades: boolean
  emailBotActivity: boolean
  emailProfitLoss: boolean
  emailSecurity: boolean
  emailSystem: boolean
  
  // In-app preferences
  appDeposits: boolean
  appWithdrawals: boolean
  appTrades: boolean
  appBotActivity: boolean
  appProfitLoss: boolean
  appSecurity: boolean
  appSystem: boolean
  appPriceAlerts: boolean
  
  createdAt: string
  updatedAt: string
}

export interface UseNotificationSettingsResult {
  settings: NotificationSettings | null
  loading: boolean
  error: string | null
  updateSettings: (updates: Partial<NotificationSettings>) => Promise<void>
  resetToDefaults: () => Promise<void>
  refresh: () => Promise<void>
}

// ── Hook ──────────────────────────────────────────────────────────────────────

export function useNotificationSettings(userId: number | undefined): UseNotificationSettingsResult {
  const [settings, setSettings] = useState<NotificationSettings | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // ── Load settings ────────────────────────────────────────────────────────────
  const loadSettings = useCallback(async () => {
    if (!userId) {
      setLoading(false)
      return
    }

    setLoading(true)
    try {
      const response = await get<NotificationSettings>(`/notificationSettings/user/${userId}`)
      setSettings(response)
      setError(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load notification settings')
    } finally {
      setLoading(false)
    }
  }, [userId])

  useEffect(() => {
    void loadSettings()
  }, [loadSettings])

  // ── Update settings ──────────────────────────────────────────────────────────
  const updateSettings = useCallback(async (updates: Partial<NotificationSettings>) => {
    if (!userId || !settings) return

    try {
      const response = await put<NotificationSettings>(`/notificationSettings/user/${userId}`, updates)
      setSettings(response)
      setError(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update notification settings')
      throw err
    }
  }, [userId, settings])

  // ── Reset to defaults ────────────────────────────────────────────────────────
  const resetToDefaults = useCallback(async () => {
    if (!userId) return

    try {
      const response = await post<NotificationSettings>(`/notificationSettings/user/${userId}/reset`, {})
      setSettings(response)
      setError(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to reset notification settings')
      throw err
    }
  }, [userId])

  return {
    settings,
    loading,
    error,
    updateSettings,
    resetToDefaults,
    refresh: loadSettings
  }
}