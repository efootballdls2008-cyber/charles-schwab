import { Link } from 'react-router-dom'

type ButtonVariant =
  | 'primary'
  | 'ghost-gold'
  | 'login'
  | 'start-trading'
  | 'mobile-login'
  | 'mobile-signup'

interface ButtonProps {
  variant?: ButtonVariant
  to?: string          // renders as <Link> when provided
  href?: string        // renders as <a> when provided
  type?: 'button' | 'submit' | 'reset'
  onClick?: () => void
  className?: string
  children: React.ReactNode
  fullWidth?: boolean
  disabled?: boolean
}

const variantClass: Record<ButtonVariant, string> = {
  primary: 'btn-primary',
  'ghost-gold': 'btn-ghost-gold',
  login: 'btn-login',
  'start-trading': 'btn-start-trading',
  'mobile-login': [
    'flex-1 text-center py-2.5 text-sm font-semibold rounded-lg no-underline',
  ].join(' '),
  'mobile-signup': [
    'flex-1 text-center py-2.5 text-sm font-semibold rounded-lg no-underline',
  ].join(' '),
}

const variantStyle: Partial<Record<ButtonVariant, React.CSSProperties>> = {
  'mobile-login': {
    color: '#a28539',
    border: '1.5px solid rgba(162,133,57,0.45)',
    background: 'transparent',
  },
  'mobile-signup': {
    background: '#a28539',
    color: '#110b2d',
  },
}

export default function Button({
  variant = 'primary',
  to,
  href,
  type = 'button',
  onClick,
  className = '',
  children,
  fullWidth = false,
  disabled = false,
}: ButtonProps) {
  const cls = `${variantClass[variant]}${fullWidth ? ' w-full' : ''}${className ? ` ${className}` : ''}`
  const style = variantStyle[variant]

  if (to) {
    return (
      <Link to={to} className={cls} style={style}>
        {children}
      </Link>
    )
  }

  if (href) {
    return (
      <a href={href} className={cls} style={style}>
        {children}
      </a>
    )
  }

  return (
    <button type={type} onClick={onClick} className={cls} style={style} disabled={disabled}>
      {children}
    </button>
  )
}
