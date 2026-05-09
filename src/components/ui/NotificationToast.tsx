/**
 * Mobile-optimized notification toast component
 * Shows brief notification previews that auto-dismiss
 */
import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useNotifications, type Notification } from '../../hooks/useNotifications'

interface NotificationToastProps {
  userId?: number   // kept for API compatibility, no longer used
  position?: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left' | 'top-center'
  maxVisible?: number
}

function getNotificationIcon(type: string) {
  const iconMap: Record<string, { icon: string; color: string; bg: string }> = {
    deposit: { icon: 'fa-arrow-down-to-line', color: '#4ade80', bg: 'rgba(74,222,128,0.15)' },
    withdrawal: { icon: 'fa-arrow-up-from-line', color: '#f87171', bg: 'rgba(248,113,113,0.15)' },
    trade: { icon: 'fa-chart-line', color: '#60a5fa', bg: 'rgba(96,165,250,0.15)' },
    order: { icon: 'fa-bag-shopping', color: '#f59e0b', bg: 'rgba(245,158,11,0.15)' },
    bot_open: { icon: 'fa-robot', color: '#a78bfa', bg: 'rgba(167,139,250,0.15)' },
    bot_close: { icon: 'fa-robot', color: '#a78bfa', bg: 'rgba(167,139,250,0.15)' },
    bot_activity: { icon: 'fa-robot', color: '#a78bfa', bg: 'rgba(167,139,250,0.15)' },
    take_profit: { icon: 'fa-circle-check', color: '#4ade80', bg: 'rgba(74,222,128,0.15)' },
    stop_loss: { icon: 'fa-circle-xmark', color: '#f87171', bg: 'rgba(248,113,113,0.15)' },
    profit_loss: { icon: 'fa-chart-pie', color: '#f59e0b', bg: 'rgba(245,158,11,0.15)' },
    security: { icon: 'fa-shield-halved', color: '#f43f5e', bg: 'rgba(244,63,94,0.15)' },
    price_alert: { icon: 'fa-bell', color: '#f97316', bg: 'rgba(249,115,22,0.15)' },
    system: { icon: 'fa-gear', color: '#6b7280', bg: 'rgba(107,114,128,0.15)' },
  }
  
  return iconMap[type] || { icon: 'fa-circle-info', color: '#9ca3af', bg: 'rgba(156,163,175,0.15)' }
}

interface ToastItemProps {
  notification: Notification
  onDismiss: (id: number) => void
  index: number
}

function ToastItem({ notification, onDismiss, index }: ToastItemProps) {
  const { icon, color, bg } = getNotificationIcon(notification.type)
  const [isVisible, setIsVisible] = useState(true)

  const handleDismiss = () => {
    setIsVisible(false)
    setTimeout(() => onDismiss(notification.id), 300)
  }

  // Auto-dismiss after duration
  useEffect(() => {
    const timer = setTimeout(handleDismiss, 5000)
    return () => clearTimeout(timer)
  }, [])

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, x: 300, scale: 0.9 }}
          animate={{ opacity: 1, x: 0, scale: 1 }}
          exit={{ opacity: 0, x: 300, scale: 0.9 }}
          transition={{ 
            type: "spring", 
            stiffness: 300, 
            damping: 30,
            delay: index * 0.1
          }}
          className="flex items-start gap-3 p-4 rounded-2xl shadow-2xl backdrop-blur-xl cursor-pointer group max-w-sm"
          style={{
            background: 'linear-gradient(145deg, rgba(13,8,36,0.95) 0%, rgba(26,16,64,0.95) 100%)',
            border: '1px solid rgba(167,139,250,0.2)',
            marginBottom: '12px'
          }}
          onClick={handleDismiss}
        >
          {/* Icon */}
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 relative"
            style={{ background: bg }}
          >
            <i className={`fas ${icon} text-sm`} style={{ color }} />
            {notification.priority === 'urgent' && (
              <div 
                className="absolute -top-1 -right-1 w-3 h-3 rounded-full border-2"
                style={{ 
                  background: '#ef4444',
                  borderColor: 'rgba(13,8,36,0.95)'
                }}
              />
            )}
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <p className="text-sm font-semibold text-white leading-snug">
                {notification.title}
              </p>
              <button
                onClick={(e) => { e.stopPropagation(); handleDismiss() }}
                className="text-gray-400 hover:text-white transition-colors p-1 rounded opacity-0 group-hover:opacity-100"
              >
                <i className="fas fa-times text-xs" />
              </button>
            </div>
            <p className="text-xs mt-1 text-gray-300 line-clamp-2">
              {notification.message}
            </p>
            
            {/* Priority indicator */}
            {notification.priority && notification.priority !== 'low' && (
              <div className="flex items-center gap-1 mt-2">
                <div 
                  className="w-1.5 h-1.5 rounded-full"
                  style={{ 
                    background: notification.priority === 'urgent' ? '#ef4444' 
                      : notification.priority === 'high' ? '#f97316' 
                      : '#60a5fa'
                  }}
                />
                <span 
                  className="text-xs font-medium capitalize"
                  style={{ 
                    color: notification.priority === 'urgent' ? '#ef4444' 
                      : notification.priority === 'high' ? '#f97316' 
                      : '#60a5fa'
                  }}
                >
                  {notification.priority}
                </span>
              </div>
            )}
          </div>

          {/* Progress bar */}
          <motion.div
            className="absolute bottom-0 left-0 h-1 rounded-b-2xl"
            style={{ background: color }}
            initial={{ width: '100%' }}
            animate={{ width: '0%' }}
            transition={{ duration: 5, ease: 'linear' }}
          />
        </motion.div>
      )}
    </AnimatePresence>
  )
}

export default function NotificationToast({ 
  position = 'top-right', 
  maxVisible = 3 
}: NotificationToastProps) {
  const { notifications } = useNotifications()
  const [visibleToasts, setVisibleToasts] = useState<Notification[]>([])
  const [lastNotificationId, setLastNotificationId] = useState<number | null>(null)

  // Track new notifications and show as toasts
  useEffect(() => {
    if (notifications.length === 0) return

    const latestNotification = notifications[0]
    
    // Only show toast for truly new notifications
    if (lastNotificationId === null) {
      setLastNotificationId(latestNotification.id)
      return
    }

    if (latestNotification.id !== lastNotificationId && !latestNotification.read) {
      setVisibleToasts(prev => {
        const newToasts = [latestNotification, ...prev.slice(0, maxVisible - 1)]
        return newToasts
      })
      setLastNotificationId(latestNotification.id)
    }
  }, [notifications, lastNotificationId, maxVisible])

  const handleDismiss = (id: number) => {
    setVisibleToasts(prev => prev.filter(toast => toast.id !== id))
  }

  const getPositionClasses = () => {
    switch (position) {
      case 'top-left':
        return 'top-4 left-4'
      case 'top-center':
        return 'top-4 left-1/2 transform -translate-x-1/2'
      case 'top-right':
        return 'top-4 right-4'
      case 'bottom-left':
        return 'bottom-4 left-4'
      case 'bottom-right':
        return 'bottom-4 right-4'
      default:
        return 'top-4 right-4'
    }
  }

  if (visibleToasts.length === 0) return null

  return (
    <div 
      className={`fixed z-[9999] pointer-events-none ${getPositionClasses()}`}
      style={{ maxWidth: 'calc(100vw - 32px)' }}
    >
      <div className="pointer-events-auto">
        {visibleToasts.map((toast, index) => (
          <ToastItem
            key={toast.id}
            notification={toast}
            onDismiss={handleDismiss}
            index={index}
          />
        ))}
      </div>
    </div>
  )
}