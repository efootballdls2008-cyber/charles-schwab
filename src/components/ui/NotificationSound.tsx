/**
 * Notification Sound Component
 * Plays notification sounds based on notification type and user preferences
 */
import { useEffect, useRef } from 'react'
import { useNotifications, type NotificationType } from '../../hooks/useNotifications'

interface NotificationSoundProps {
  userId?: number
  enabled?: boolean
  volume?: number
}

// Sound mapping for different notification types
const SOUND_MAP: Record<NotificationType, string> = {
  deposit: '/sounds/deposit.mp3',
  withdrawal: '/sounds/withdrawal.mp3',
  trade: '/sounds/trade.mp3',
  order: '/sounds/order.mp3',
  bot_open: '/sounds/bot.mp3',
  bot_close: '/sounds/bot.mp3',
  bot_activity: '/sounds/bot.mp3',
  take_profit: '/sounds/success.mp3',
  stop_loss: '/sounds/alert.mp3',
  profit_loss: '/sounds/notification.mp3',
  security: '/sounds/alert.mp3',
  price_alert: '/sounds/alert.mp3',
  system: '/sounds/notification.mp3',
}

// Fallback to Web Audio API generated sounds if audio files are not available
class NotificationAudio {
  private audioContext: AudioContext | null = null
  private volume: number = 0.5

  constructor(volume: number = 0.5) {
    this.volume = volume
    try {
      this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)()
    } catch (e) {
      console.warn('Web Audio API not supported')
    }
  }

  private async playTone(frequency: number, duration: number, type: OscillatorType = 'sine') {
    if (!this.audioContext) return

    const oscillator = this.audioContext.createOscillator()
    const gainNode = this.audioContext.createGain()

    oscillator.connect(gainNode)
    gainNode.connect(this.audioContext.destination)

    oscillator.frequency.setValueAtTime(frequency, this.audioContext.currentTime)
    oscillator.type = type

    gainNode.gain.setValueAtTime(0, this.audioContext.currentTime)
    gainNode.gain.linearRampToValueAtTime(this.volume * 0.3, this.audioContext.currentTime + 0.01)
    gainNode.gain.exponentialRampToValueAtTime(0.001, this.audioContext.currentTime + duration)

    oscillator.start(this.audioContext.currentTime)
    oscillator.stop(this.audioContext.currentTime + duration)
  }

  async playNotificationSound(type: NotificationType) {
    try {
      // Try to play audio file first
      const audio = new Audio(SOUND_MAP[type] || '/sounds/notification.mp3')
      audio.volume = this.volume
      await audio.play()
    } catch (e) {
      // Fallback to generated tones
      switch (type) {
        case 'deposit':
        case 'take_profit':
          // Success sound - ascending tones
          await this.playTone(523.25, 0.1) // C5
          setTimeout(() => this.playTone(659.25, 0.1), 100) // E5
          setTimeout(() => this.playTone(783.99, 0.15), 200) // G5
          break
        
        case 'withdrawal':
        case 'stop_loss':
          // Alert sound - descending tones
          await this.playTone(783.99, 0.1) // G5
          setTimeout(() => this.playTone(659.25, 0.1), 100) // E5
          setTimeout(() => this.playTone(523.25, 0.15), 200) // C5
          break
        
        case 'trade':
        case 'order':
          // Trade sound - double beep
          await this.playTone(800, 0.1)
          setTimeout(() => this.playTone(800, 0.1), 150)
          break
        
        case 'bot_open':
        case 'bot_close':
        case 'bot_activity':
          // Bot sound - robotic beep
          await this.playTone(440, 0.05, 'square')
          setTimeout(() => this.playTone(880, 0.05, 'square'), 60)
          setTimeout(() => this.playTone(440, 0.05, 'square'), 120)
          break
        
        case 'security':
        case 'price_alert':
          // Alert sound - urgent beeping
          for (let i = 0; i < 3; i++) {
            setTimeout(() => this.playTone(1000, 0.1), i * 150)
          }
          break
        
        default:
          // Default notification sound
          await this.playTone(600, 0.2)
          break
      }
    }
  }

  setVolume(volume: number) {
    this.volume = Math.max(0, Math.min(1, volume))
  }
}

export default function NotificationSound({ userId, enabled = true, volume = 0.5 }: NotificationSoundProps) {
  const { notifications } = useNotifications(userId)
  const audioRef = useRef<NotificationAudio | null>(null)
  const lastNotificationIdRef = useRef<number | null>(null)

  // Initialize audio system
  useEffect(() => {
    if (enabled) {
      audioRef.current = new NotificationAudio(volume)
    }
    return () => {
      audioRef.current = null
    }
  }, [enabled, volume])

  // Play sound for new notifications
  useEffect(() => {
    if (!enabled || !audioRef.current || notifications.length === 0) return

    const latestNotification = notifications[0]
    
    // Only play sound for truly new notifications
    if (lastNotificationIdRef.current === null) {
      lastNotificationIdRef.current = latestNotification.id
      return
    }

    if (latestNotification.id !== lastNotificationIdRef.current && !latestNotification.read) {
      // Play sound based on notification type
      audioRef.current.playNotificationSound(latestNotification.type)
      lastNotificationIdRef.current = latestNotification.id
    }
  }, [notifications, enabled])

  // Update volume
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.setVolume(volume)
    }
  }, [volume])

  return null // This component doesn't render anything
}