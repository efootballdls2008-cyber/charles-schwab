export interface DashNavItem {
  key: string
  label: string
  icon: string
  to: string
  hasChevron?: boolean
  badge?: string
}

export const dashNavItems: DashNavItem[] = [
  { key: 'dashboard',    label: 'Dashboard',     icon: 'fas fa-th-large',     to: '/user/dashboard' },
  { key: 'wallet',       label: 'Account',       icon: 'fas fa-wallet',       to: '/user/account' },
  { key: 'trade',        label: 'Trade',         icon: 'fas fa-chart-line',   to: '/user/trade' },
  { key: 'aibot',        label: 'AI Trade Bot',  icon: 'fas fa-robot',        to: '/user/ai-bot',         badge: 'New' },
  { key: 'history',      label: 'History',       icon: 'fas fa-history',      to: '/user/history' },
  { key: 'positions',    label: 'Open Positions', icon: 'fas fa-chart-area',   to: '/user/positions',      badge: 'Live' },
  { key: 'transactions', label: 'Transactions',  icon: 'fas fa-receipt',      to: '/user/transactions' },
  { key: 'crypto',       label: 'Crypto',        icon: 'fas fa-coins',        to: '/user/crypto' },
  { key: 'exchange',     label: 'Exchange',      icon: 'fas fa-sync-alt',     to: '/user/exchange' },
  { key: 'settings',     label: 'Settings',      icon: 'fas fa-cog',          to: '/user/settings' },
  { key: 'notifications', label: 'Notifications', icon: 'fas fa-bell',         to: '/user/notifications' },
]
