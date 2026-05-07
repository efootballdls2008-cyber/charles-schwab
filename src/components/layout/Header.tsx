import { useState, useRef, useEffect } from 'react'
import { Link, NavLink } from 'react-router-dom'
import Button from '../ui/Button'
import ChevronIcon from '../ui/ChevronIcon'
import GlowLine from '../ui/GlowLine'
import Icon from '../ui/Icon'

// ─── Types ────────────────────────────────────────────────────────────────────

export interface NavItem {
  to: string
  icon: string
  label: string
}

interface NavDropdownProps {
  label: string
  items: NavItem[]
}

// ─── Nav data ─────────────────────────────────────────────────────────────────

export const tradingItems: NavItem[] = [
  { to: '/cryptocurrencies', icon: 'fas fa-coins',        label: 'Cryptocurrencies' },
  { to: '/forex',            icon: 'fas fa-exchange-alt', label: 'Forex' },
  { to: '/shares',           icon: 'fas fa-chart-bar',    label: 'Shares' },
  { to: '/indices',          icon: 'fas fa-globe',        label: 'Indices' },
  { to: '/etfs',             icon: 'fas fa-layer-group',  label: 'ETFs' },
]

export const systemItems: NavItem[] = [
  { to: '/trade',    icon: 'fas fa-chart-line', label: 'Trade' },
  { to: '/copy',     icon: 'fas fa-copy',       label: 'Copy Trading' },
  { to: '/automate', icon: 'fas fa-robot',      label: 'Automated Trading' },
]

export const companyItems: NavItem[] = [
  { to: '/about',      icon: 'fas fa-building',        label: 'About Us' },
  { to: '/why-us',     icon: 'fas fa-star',             label: 'Why Us' },
  { to: '/faq',        icon: 'fas fa-question-circle',  label: 'FAQ' },
  { to: '/regulation', icon: 'fas fa-shield-alt',       label: 'Legal & Regulation' },
]

const platformIcons = [
  { icon: 'fas fa-desktop', label: 'Desktop' },
  { icon: 'fab fa-windows', label: 'Windows' },
  { icon: 'fab fa-android', label: 'Android' },
  { icon: 'fab fa-apple',   label: 'iOS' },
]

// ─── Desktop dropdown ─────────────────────────────────────────────────────────

function NavDropdown({ label, items }: NavDropdownProps) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  // Close when clicking outside
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    if (open) {
      document.addEventListener('mousedown', handleClickOutside)
    }
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [open])

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen((o) => !o)}
        className="nav-link"
        aria-expanded={open}
        aria-haspopup="true"
      >
        {label}
        <ChevronIcon open={open} className="ml-1.5 h-3.5 w-3.5" />
      </button>

      {open && (
        <div className="nav-dropdown">
          {items.map((item) => (
            <Link
              key={item.to}
              to={item.to}
              className="nav-dropdown-item"
              onClick={() => setOpen(false)}
            >
              <Icon name={item.icon} className="nav-icon" />
              {item.label}
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}

// ─── Mobile accordion section ─────────────────────────────────────────────────

interface MobileNavSectionProps {
  sectionKey: string
  label: string
  items: NavItem[]
  expanded: string | null
  onToggle: (key: string) => void
  onNavigate: () => void
}

function MobileNavSection({
  sectionKey,
  label,
  items,
  expanded,
  onToggle,
  onNavigate,
}: MobileNavSectionProps) {
  const isOpen = expanded === sectionKey

  return (
    <div>
      <button
        onClick={() => onToggle(sectionKey)}
        className="w-full flex justify-between items-center px-4 py-3 text-sm font-medium"
        style={{ color: '#c8c8d8' }}
        aria-expanded={isOpen}
      >
        <span>{label}</span>
        <ChevronIcon open={isOpen} className="h-4 w-4" style={{ color: '#a28539' }} />
      </button>

      {isOpen && (
        <div className="pl-4 pb-1">
          {items.map((item) => (
            <Link
              key={item.to}
              to={item.to}
              className="block px-4 py-2 text-sm"
              style={{ color: '#a0a0b8' }}
              onClick={onNavigate}
            >
              {item.label}
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}

// ─── Header ───────────────────────────────────────────────────────────────────

export default function Header() {
  const [mobileOpen, setMobileOpen] = useState(false)
  const [mobileExpanded, setMobileExpanded] = useState<string | null>(null)

  const closeMobile = () => setMobileOpen(false)
  const toggleSection = (key: string) =>
    setMobileExpanded((prev) => (prev === key ? null : key))

  const mobileSections = [
    { key: 'trading', label: 'Trading', items: tradingItems },
    { key: 'system',  label: 'System',  items: systemItems },
    { key: 'company', label: 'Company', items: companyItems },
  ]

  return (
    <header
      className="relative z-50"
      style={{ backgroundColor: '#0d0824', borderBottom: '1px solid rgba(162,133,57,0.25)' }}
    >
      <GlowLine variant="divider" />

      <div className="max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">

          {/* Logo */}
          <div className="flex-shrink-0">
            <Link to="/" className="flex items-center">
              <img className="h-9 w-auto" src="/img/logo.png" alt="Charles Schwab" />
            </Link>
          </div>

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center space-x-1" aria-label="Main navigation">
            <NavDropdown label="Trading" items={tradingItems} />
            <NavDropdown label="System"  items={systemItems} />
            <NavDropdown label="Company" items={companyItems} />
            <NavLink to="/for-traders" className="nav-link">Education</NavLink>
            <NavLink to="/contacts"    className="nav-link">Contact</NavLink>
          </nav>

          {/* Desktop right */}
          <div className="hidden md:flex items-center gap-5">
            {/* Platform icons */}
            <div
              className="flex items-center gap-2 pr-5"
              style={{ borderRight: '1px solid rgba(162,133,57,0.2)' }}
            >
              {platformIcons.map(({ icon, label }) => (
                <a key={label} href="#" className="platform-icon-link" aria-label={label}>
                  <Icon name={`${icon} text-sm`} />
                </a>
              ))}
            </div>

            {/* Auth */}
            <div className="flex items-center gap-3">
              <Button variant="login" to="/login">
                <Icon name="fas fa-sign-in-alt text-xs" /> Log In
              </Button>
              <Button variant="start-trading" to="/register">
                <Icon name="fas fa-rocket text-xs" /> Start Trading
              </Button>
            </div>
          </div>

          {/* Mobile hamburger */}
          <div className="flex md:hidden">
            <button
              onClick={() => setMobileOpen((o) => !o)}
              type="button"
              className="inline-flex items-center justify-center p-2 rounded-lg"
              style={{ color: '#a28539', border: '1.5px solid rgba(162,133,57,0.4)' }}
              aria-controls="mobile-menu"
              aria-expanded={mobileOpen}
              aria-label="Toggle menu"
            >
              {mobileOpen ? (
                <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              ) : (
                <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              )}
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        {mobileOpen && (
          <div
            id="mobile-menu"
            className="md:hidden border-t"
            style={{ borderColor: 'rgba(162,133,57,0.2)' }}
          >
            <div className="py-3 space-y-1">
              {mobileSections.map((section) => (
                <MobileNavSection
                  key={section.key}
                  sectionKey={section.key}
                  label={section.label}
                  items={section.items}
                  expanded={mobileExpanded}
                  onToggle={toggleSection}
                  onNavigate={closeMobile}
                />
              ))}

              <Link to="/for-traders" className="block px-4 py-3 text-sm font-medium" style={{ color: '#c8c8d8' }} onClick={closeMobile}>
                Education
              </Link>
              <Link to="/contacts" className="block px-4 py-3 text-sm font-medium" style={{ color: '#c8c8d8' }} onClick={closeMobile}>
                Contact
              </Link>

              {/* Mobile auth */}
              <div
                className="pt-3 pb-2 border-t mx-4 mt-2 flex gap-3"
                style={{ borderColor: 'rgba(162,133,57,0.2)' }}
              >
                <Button variant="mobile-login" to="/login" onClick={closeMobile}>
                  <Icon name="fas fa-sign-in-alt mr-1" /> Log In
                </Button>
                <Button variant="mobile-signup" to="/register" onClick={closeMobile}>
                  <Icon name="fas fa-user-plus mr-1" /> Sign Up
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </header>
  )
}
