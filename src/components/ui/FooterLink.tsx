import { Link } from 'react-router-dom'

interface FooterLinkProps {
  to: string
  children: React.ReactNode
  external?: boolean
}

/** Consistent footer nav link — internal uses React Router, external uses <a>. */
export default function FooterLink({ to, children, external = false }: FooterLinkProps) {
  const cls = 'text-sm text-gray-400 hover:text-white transition-colors'

  if (external || to.startsWith('http') || to.startsWith('mailto')) {
    return (
      <a href={to} className={cls} target={to.startsWith('http') ? '_blank' : undefined} rel="noopener noreferrer">
        {children}
      </a>
    )
  }

  return <Link to={to} className={cls}>{children}</Link>
}
