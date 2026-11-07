/**
 * Notification Preferences Component
 * Allows users to customize notification settings including sounds, toasts, and email preferences
 */
import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useNotificationSettings } from '../../hooks/useNotificationSettings'
import { useAuth } from '../../hooks/useAuth'

interface NotificationPreferencesProps {
  className?: string
}

interface ToggleSwitchProps {
  enabled: boolean
  onChange: (enabled: boolean) => void
  label: string
  description?: string
  icon?: string
  color?: string
  disabled?: boolean
}

function ToggleSwitch({ enabled, onChange, label, description, icon, color = '#a78bfa', disabled = false }: ToggleSwitchProps) {
  return (
    <div className={`flex items-center justify-between p-4 rounded-xl transition-all ${disabled ? 'opacity-50' : 'hover:bg-white/5'}`}
         style={{ background: 'rgba(22,15,53,0.5)', border: '1px solid rgba(255,255,255,0.05)' }}>
      <div className="flex items-center gap-3">
        {icon && (
          <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
               style={{ background: `${color}15`, color }}>
            <i className={`fas ${icon} text-sm`} />
          </div>
        )}
        <div>
          <p className="text-sm font-medium text-white">{label}</p>
          {description && <p className="text-xs text-gray-400 mt-0.5">{description}</p>}
        </div>
      </div>
      
      <button
        onClick={() => !disabled && onChange(!enabled)}
        disabled={disabled}
        className="relative w-12 h-6 rounded-full transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500/50 disabled:cursor-not-allowed"
        style={{ 
          background: enabled ? color : 'rgba(255,255,255,0.1)',
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

interface VolumeSliderProps {
  volume: number
  onChange: (volume: number) => void
  label: string
  icon?: string
  color?: string
  disabled?: boolean
}

function VolumeSlider({ volume, onChange, label, icon, color = '#a78bfa', disabled = false }: VolumeSliderProps) {
  return (
    <div className={`p-4 rounded-xl transition-all ${disabled ? 'opacity-50' : ''}`}
         style={{ background: 'rgba(22,15,53,0.5)', border: '1px solid rgba(255,255,255,0.05)' }}>
      <div className="flex items-center gap-3 mb-3">
        {icon && (
          <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
               style={{ background: `${color}15`, color }}>
            <i className={`fas ${icon} text-xs`} />
          </div>
        )}
        <div className="flex-1">
          <p className="text-sm font-medium text-white">{label}</p>
          <p className="text-xs text-gray-400">{Math.round(volume * 100)}%</p>
        </div>
      </div>
      
      <div className="relative">
        <input
          type="range"
          min="0"
          max="1"
          step="0.1"
          value={volume}
          onChange={(e) => !disabled && onChange(parseFloat(e.target.value))}
          disabled={disabled}
          className="w-full h-2 rounded-lg appearance-none cursor-pointer disabled:cursor-not-allowed"
          style={{
            background: `linear-gradient(to right, ${color} 0%, ${color} ${volume * 100}%, rgba(255,255,255,0.1) ${volume * 100}%, rgba(255,255,255,0.1) 100%)`
          }}
        />
      </div>
    </div>
  )
}

export default function NotificationPreferences({ className = '' }: NotificationPreferencesProps) {
  const { user } = useAuth()
  const { settings, loading, error, updateSettings } = useNotificationSettings(user?.id)
  const [localSettings, setLocalSettings] = useState({
    soundEnabled: true,
    soundVolume: 0.5,
    toastEnabled: true,
    toastPosition: 'top-right' as const,
    vibrationEnabled: true,
  })

  // Load settings from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('notificationPreferences')
    if (saved) {
      try {
        const parsed = JSON.parse(saved)
        setLocalSettings(prev => ({ ...prev, ...parsed }))
      } catch (e) {
        console.warn('Failed to parse notification preferences')
      }
    }
  }, [])

  // Save settings to localStorage
  const saveLocalSettings = (newSettings: Partial<typeof localSettings>) => {
    const updated = { ...localSettings, ...newSettings }
    setLocalSettings(updated)
    localStorage.setItem('notificationPreferences', JSON.stringify(updated))
  }

  const handleServerSettingChange = async (field: string, value: boolean) => {
    if (!settings) return
    
    try {
      await updateSettings({ [field]: value })
    } catch (err) {
      console.error('Failed to update server settings:', err)
    }
  }

  if (loading) {
    return (
      <div className={`flex items-center justify-center py-20 ${className}`}>
        <i className="fas fa-spinner fa-spin text-gray-500 mr-2" />
        <span className="text-sm text-gray-500">Loading preferences...</span>
      </div>
    )
  }

  if (error || !settings) {
    return (
      <div className={`flex flex-col items-center justify-center py-20 text-center ${className}`}>
        <i className="fas fa-triangle-exclamation text-2xl text-red-400 mb-3" />
        <p className="text-sm text-gray-400">{error || 'Failed to load preferences'}</p>
      </div>
    )
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div>
        <h3 className="text-lg font-bold text-white">Notification Preferences</h3>
        <p className="text-sm text-gray-400 mt-1">Customize how you receive and interact with notifications</p>
      </div>

      {/* Client-side preferences */}
      <div className="space-y-4">
        <h4 className="text-md font-semibold text-white flex items-center gap-2">
          <i className="fas fa-desktop text-sm" style={{ color: '#60a5fa' }} />
          App Experience
        </h4>
        
        <div className="grid gap-3">
          <ToggleSwitch
            enabled={localSettings.soundEnabled}
            onChange={(enabled) => saveLocalSettings({ soundEnabled: enabled })}
            label="Sound Notifications"
            description="Play sounds when new notifications arrive"
            icon="fa-volume-up"
            color="#f59e0b"
          />
          
          <VolumeSlider
            volume={localSettings.soundVolume}
            onChange={(volume) => saveLocalSettings({ soundVolume: volume })}
            label="Notification Volume"
            icon="fa-volume-high"
            color="#f59e0b"
            disabled={!localSettings.soundEnabled}
          />
          
          <ToggleSwitch
            enabled={localSettings.toastEnabled}
            onChange={(enabled) => saveLocalSettings({ toastEnabled: enabled })}
            label="Toast Notifications"
            description="Show popup notifications in the corner"
            icon="fa-comment"
            color="#a78bfa"
          />
          
          <ToggleSwitch
            enabled={localSettings.vibrationEnabled}
            onChange={(enabled) => saveLocalSettings({ vibrationEnabled: enabled })}
            label="Vibration (Mobile)"
            description="Vibrate device for important notifications"
            icon="fa-mobile-screen"
            color="#06b6d4"
          />
        </div>
      </div>

      {/* Server-side preferences */}
      <div className="space-y-4">
        <h4 className="text-md font-semibold text-white flex items-center gap-2">
          <i className="fas fa-server text-sm" style={{ color: '#4ade80' }} />
          Delivery Channels
        </h4>
        
        <div className="grid gap-3">
          <ToggleSwitch
            enabled={settings.inAppEnabled}
            onChange={(enabled) => handleServerSettingChange('inAppEnabled', enabled)}
            label="In-App Notifications"
            description="Show notifications within the application"
            icon="fa-bell"
            color="#a78bfa"
          />
          
          <ToggleSwitch
            enabled={settings.emailEnabled}
            onChange={(enabled) => handleServerSettingChange('emailEnabled', enabled)}
            label="Email Notifications"
            description="Receive notifications via email"
            icon="fa-envelope"
            color="#60a5fa"
          />
        </div>
      </div>

      {/* Category preferences */}
      <div className="space-y-4">
        <h4 className="text-md font-semibold text-white flex items-center gap-2">
          <i className="fas fa-tags text-sm" style={{ color: '#f97316' }} />
          Notification Categories
        </h4>
        
        <div className="grid gap-3">
          <ToggleSwitch
            enabled={settings.appTrades}
            onChange={(enabled) => handleServerSettingChange('appTrades', enabled)}
            label="Trading Notifications"
            description="Order executions, trade confirmations"
            icon="fa-chart-line"
            color="#60a5fa"
          />
          
          <ToggleSwitch
            enabled={settings.appDeposits}
            onChange={(enabled) => handleServerSettingChange('appDeposits', enabled)}
            label="Wallet Notifications"
            description="Deposits, withdrawals, balance changes"
            icon="fa-wallet"
            color="#4ade80"
          />
          
          <ToggleSwitch
            enabled={settings.appBotActivity}
            onChange={(enabled) => handleServerSettingChange('appBotActivity', enabled)}
            label="Bot Activity"
            description="Automated trading bot updates"
            icon="fa-robot"
            color="#a78bfa"
          />
          
          <ToggleSwitch
            enabled={settings.appProfitLoss}
            onChange={(enabled) => handleServerSettingChange('appProfitLoss', enabled)}
            label="Profit & Loss"
            description="P&L updates, take profit, stop loss"
            icon="fa-chart-pie"
            color="#f59e0b"
          />
          
          <ToggleSwitch
            enabled={settings.appSecurity}
            onChange={(enabled) => handleServerSettingChange('appSecurity', enabled)}
            label="Security Alerts"
            description="Login attempts, security notifications"
            icon="fa-shield-halved"
            color="#f43f5e"
          />
          
          <ToggleSwitch
            enabled={settings.appSystem}
            onChange={(enabled) => handleServerSettingChange('appSystem', enabled)}
            label="System Notifications"
            description="Maintenance, updates, announcements"
            icon="fa-gear"
            color="#6b7280"
          />
        </div>
      </div>

      {/* Test notification */}
      <div className="pt-4 border-t border-white/10">
        <button
          onClick={() => {
            // Trigger a test notification
            if (localSettings.soundEnabled) {
              try {
                const oscillator = new (window.AudioContext || (window as any).webkitAudioContext)()
                // Simple test beep
                const osc = oscillator.createOscillator()
                const gain = oscillator.createGain()
                osc.connect(gain)
                gain.connect(oscillator.destination)
                osc.frequency.setValueAtTime(800, oscillator.currentTime)
                gain.gain.setValueAtTime(localSettings.soundVolume * 0.3, oscillator.currentTime)
                osc.start()
                osc.stop(oscillator.currentTime + 0.2)
              } catch (e) {
                console.warn('Could not play test sound:', e)
              }
            }
          }}
          className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all hover:scale-105"
          style={{ 
            background: 'rgba(167,139,250,0.1)', 
            color: '#a78bfa', 
            border: '1px solid rgba(167,139,250,0.2)' 
          }}
        >
          <i className="fas fa-play text-xs" />
          Test Notification Sound
        </button>
      </div>
    </div>
  )
}