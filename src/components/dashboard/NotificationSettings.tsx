/**
 * NotificationSettings — Modern notification preferences panel
 */
import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useAuthContext } from '../../context/AuthContext'
import { useNotificationSettings } from '../../hooks/useNotificationSettings'

interface SettingToggleProps {
  label: string
  description: string
  enabled: boolean
  onChange: (enabled: boolean) => void
  icon: string
  color: string
}

function SettingToggle({ label, description, enabled, onChange, icon, color }: SettingToggleProps) {
  return (
    <div className="flex items-center justify-between p-4 rounded-xl transition-all hover:bg-white/5"
         style={{ background: 'rgba(22,15,53,0.5)', border: '1px solid rgba(255,255,255,0.05)' }}>
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
             style={{ background: `${color}15`, color }}>
          <i className={`fas ${icon} text-sm`} />
        </div>
        <div>
          <p className="text-sm font-medium text-white">{label}</p>
          <p className="text-xs text-gray-400 mt-0.5">{description}</p>
        </div>
      </div>
      
      <button
        onClick={() => onChange(!enabled)}
        className="relative w-12 h-6 rounded-full transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
        style={{ 
          background: enabled ? '#4ade80' : 'rgba(255,255,255,0.1)',
        }}
      >
        <motion.div
          className="absolute top-0.5 w-5 h-5 bg-white rounded-full shadow-sm"
          animate={{ x: enabled ? 26 : 2 }}
          transition={{ type: 'spring', stiffness: 500, damping: 30 }}
        />
      </button>
    </div>
  )
}

interface SettingSectionProps {
  title: string
  description: string
  icon: string
  color: string
  children: React.ReactNode
}

function SettingSection({ title, description, icon, color, children }: SettingSectionProps) {
  const [expanded, setExpanded] = useState(true)

  return (
    <div className="rounded-2xl overflow-hidden"
         style={{ background: 'rgba(22,15,53,0.9)', border: '1px solid rgba(255,255,255,0.07)' }}>
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center justify-between p-6 text-left transition-all hover:bg-white/5"
      >
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl flex items-center justify-center"
               style={{ background: `${color}15`, color }}>
            <i className={`fas ${icon} text-lg`} />
          </div>
          <div>
            <h3 className="text-lg font-bold text-white">{title}</h3>
            <p className="text-sm text-gray-400 mt-1">{description}</p>
          </div>
        </div>
        
        <motion.i
          className="fas fa-chevron-down text-gray-400"
          animate={{ rotate: expanded ? 180 : 0 }}
          transition={{ duration: 0.2 }}
        />
      </button>
      
      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="px-6 pb-6 space-y-3"
                 style={{ borderTop: '1px solid rgba(255,255,255,0.05)' }}>
              {children}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default function NotificationSettings() {
  const { user } = useAuthContext()
  const { settings, loading, error, updateSettings, resetToDefaults } = useNotificationSettings(user?.id)
  const [saving, setSaving] = useState(false)

  const showToast = (message: string, type: 'success' | 'error') => {
    // Simple toast implementation - you can replace with your preferred toast library
    console.log(`${type.toUpperCase()}: ${message}`)
  }

  const handleToggle = async (field: string, value: boolean) => {
    if (!settings) return
    
    setSaving(true)
    try {
      await updateSettings({ [field]: value })
      showToast('Settings updated', 'success')
    } catch (err) {
      showToast('Failed to update settings', 'error')
    } finally {
      setSaving(false)
    }
  }

  const handleReset = async () => {
    if (!confirm('Reset all notification settings to defaults?')) return
    
    setSaving(true)
    try {
      await resetToDefaults()
      showToast('Settings reset to defaults', 'success')
    } catch (err) {
      showToast('Failed to reset settings', 'error')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <i className="fas fa-spinner fa-spin text-gray-500 mr-2" />
        <span className="text-sm text-gray-500">Loading settings...</span>
      </div>
    )
  }

  if (error || !settings) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <i className="fas fa-triangle-exclamation text-2xl text-red-400 mb-3" />
        <p className="text-sm text-gray-400">{error || 'Failed to load settings'}</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-white">Notification Settings</h2>
          <p className="text-sm text-gray-400 mt-1">Customize how you receive notifications</p>
        </div>
        
        <button
          onClick={handleReset}
          disabled={saving}
          className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all hover:opacity-90 disabled:opacity-50"
          style={{ background: 'rgba(248,113,113,0.1)', color: '#f87171', border: '1px solid rgba(248,113,113,0.2)' }}
        >
          <i className="fas fa-rotate-left text-xs" />
          Reset to Defaults
        </button>
      </div>

      {/* Master Controls */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <SettingToggle
          label="Email Notifications"
          description="Receive notifications via email"
          enabled={settings.emailEnabled}
          onChange={(value) => handleToggle('emailEnabled', value)}
          icon="fa-envelope"
          color="#60a5fa"
        />
        
        <SettingToggle
          label="In-App Notifications"
          description="Show notifications in the dashboard"
          enabled={settings.inAppEnabled}
          onChange={(value) => handleToggle('inAppEnabled', value)}
          icon="fa-bell"
          color="#a78bfa"
        />
      </div>

      {/* Email Settings */}
      <SettingSection
        title="Email Preferences"
        description="Choose which notifications to receive via email"
        icon="fa-envelope"
        color="#60a5fa"
      >
        <SettingToggle
          label="Deposits & Withdrawals"
          description="Get notified about wallet transactions"
          enabled={settings.emailDeposits && settings.emailWithdrawals}
          onChange={(value) => {
            handleToggle('emailDeposits', value)
            handleToggle('emailWithdrawals', value)
          }}
          icon="fa-wallet"
          color="#4ade80"
        />
        
        <SettingToggle
          label="Trading Activity"
          description="Notifications for buy/sell orders and trades"
          enabled={settings.emailTrades}
          onChange={(value) => handleToggle('emailTrades', value)}
          icon="fa-chart-line"
          color="#60a5fa"
        />
        
        <SettingToggle
          label="Bot Trading"
          description="Updates on bot positions and activity"
          enabled={settings.emailBotActivity}
          onChange={(value) => handleToggle('emailBotActivity', value)}
          icon="fa-robot"
          color="#a78bfa"
        />
        
        <SettingToggle
          label="Profit & Loss"
          description="P&L updates and performance reports"
          enabled={settings.emailProfitLoss}
          onChange={(value) => handleToggle('emailProfitLoss', value)}
          icon="fa-chart-pie"
          color="#f59e0b"
        />
        
        <SettingToggle
          label="Security Alerts"
          description="Important security and account notifications"
          enabled={settings.emailSecurity}
          onChange={(value) => handleToggle('emailSecurity', value)}
          icon="fa-shield-halved"
          color="#f43f5e"
        />
        
        <SettingToggle
          label="System Updates"
          description="Platform maintenance and system notifications"
          enabled={settings.emailSystem}
          onChange={(value) => handleToggle('emailSystem', value)}
          icon="fa-gear"
          color="#6b7280"
        />
      </SettingSection>

      {/* In-App Settings */}
      <SettingSection
        title="In-App Preferences"
        description="Control which notifications appear in your dashboard"
        icon="fa-bell"
        color="#a78bfa"
      >
        <SettingToggle
          label="Deposits & Withdrawals"
          description="Wallet transaction notifications"
          enabled={settings.appDeposits && settings.appWithdrawals}
          onChange={(value) => {
            handleToggle('appDeposits', value)
            handleToggle('appWithdrawals', value)
          }}
          icon="fa-wallet"
          color="#4ade80"
        />
        
        <SettingToggle
          label="Trading Activity"
          description="Buy/sell orders and trade notifications"
          enabled={settings.appTrades}
          onChange={(value) => handleToggle('appTrades', value)}
          icon="fa-chart-line"
          color="#60a5fa"
        />
        
        <SettingToggle
          label="Bot Trading"
          description="Bot positions and trading activity"
          enabled={settings.appBotActivity}
          onChange={(value) => handleToggle('appBotActivity', value)}
          icon="fa-robot"
          color="#a78bfa"
        />
        
        <SettingToggle
          label="Profit & Loss"
          description="P&L updates and performance metrics"
          enabled={settings.appProfitLoss}
          onChange={(value) => handleToggle('appProfitLoss', value)}
          icon="fa-chart-pie"
          color="#f59e0b"
        />
        
        <SettingToggle
          label="Price Alerts"
          description="Market price and volatility alerts"
          enabled={settings.appPriceAlerts}
          onChange={(value) => handleToggle('appPriceAlerts', value)}
          icon="fa-bell"
          color="#f97316"
        />
        
        <SettingToggle
          label="Security Alerts"
          description="Security and account notifications"
          enabled={settings.appSecurity}
          onChange={(value) => handleToggle('appSecurity', value)}
          icon="fa-shield-halved"
          color="#f43f5e"
        />
        
        <SettingToggle
          label="System Updates"
          description="Platform and system notifications"
          enabled={settings.appSystem}
          onChange={(value) => handleToggle('appSystem', value)}
          icon="fa-gear"
          color="#6b7280"
        />
      </SettingSection>

      {/* Save Indicator */}
      <AnimatePresence>
        {saving && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed bottom-6 right-6 flex items-center gap-2 px-4 py-3 rounded-xl shadow-lg"
            style={{ background: 'rgba(74,222,128,0.9)', color: '#0d0824' }}
          >
            <i className="fas fa-spinner fa-spin" />
            <span className="text-sm font-medium">Saving...</span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}