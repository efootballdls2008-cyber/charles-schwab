import { Link } from 'react-router-dom'
import FooterLink from '../ui/FooterLink'
import Icon from '../ui/Icon'
import GlowLine from '../ui/GlowLine'

// ─── Data ─────────────────────────────────────────────────────────────────────

const quickLinks = [
  { to: '/about',       label: 'About Us' },
  { to: '/why-us',      label: 'Why Choose Us' },
  { to: '/for-traders', label: 'Education' },
  { to: '/contacts',    label: 'Contact' },
]

const tradingLinks = [
  { to: '/cryptocurrencies', label: 'Cryptocurrencies' },
  { to: '/forex',            label: 'Forex' },
  { to: '/shares',           label: 'Shares' },
  { to: '/indices',          label: 'Indices' },
]

const accountLinks = [
  { to: '/login',    label: 'Log In' },
  { to: '/register', label: 'Create Account' },
  { to: '/login',    label: 'Demo Account' },
  { to: '/contacts', label: 'Help Center' },
]

const platforms = [
  { icon: 'fas fa-desktop', label: 'Web' },
  { icon: 'fab fa-windows', label: 'Windows' },
  { icon: 'fab fa-android', label: 'Android' },
  { icon: 'fab fa-apple',   label: 'iOS' },
]

const socialLinks = [
  { icon: 'fab fa-twitter',  label: 'Twitter',  href: '#' },
  { icon: 'fab fa-linkedin', label: 'LinkedIn', href: '#' },
  { icon: 'fas fa-envelope', label: 'Email',    href: 'mailto:info@charlesschwab.com' },
]

const legalLinks = [
  { to: '/regulation', label: 'Terms & Conditions' },
  { to: '/regulation', label: 'Privacy Policy' },
  { to: '/regulation', label: 'Legal Documents' },
]

// ─── Sub-components ───────────────────────────────────────────────────────────

function FooterColumn({ title, links }: { title: string; links: { to: string; label: string }[] }) {
  return (
    <div>
      <h3 className="text-sm font-semibold text-white uppercase tracking-wider mb-4">{title}</h3>
      <ul className="space-y-3">
        {links.map((l) => (
          <li key={l.label}>
            <FooterLink to={l.to}>{l.label}</FooterLink>
          </li>
        ))}
      </ul>
    </div>
  )
}

// ─── Footer ───────────────────────────────────────────────────────────────────

export default function Footer() {
  const year = new Date().getFullYear()

  return (
    <footer className="text-gray-300" style={{ backgroundColor: '#0d0824' }}>

      {/* Upper footer — 4-col grid */}
      <div className="border-t" style={{ borderColor: 'rgba(162,133,57,0.3)' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">

            {/* Company info */}
            <div>
              <div className="flex items-center mb-6">
                <Link to="/" className="flex items-center">
                  <img className="h-8 w-auto" src="/img/logo.png" alt="Charles Schwab" />
                </Link>
              </div>
              <p className="text-sm text-gray-400 mb-6 leading-relaxed">
                Charles Schwab offers CFD trading on stocks, forex, indices, commodities, and
                cryptocurrencies with competitive spreads and advanced trading tools.
              </p>
              <div className="flex space-x-4">
                {socialLinks.map(({ icon, label, href }) => (
                  <a
                    key={label}
                    href={href}
                    className="text-gray-400 hover:text-white transition-colors"
                    aria-label={label}
                  >
                    <Icon name={icon} />
                  </a>
                ))}
              </div>
            </div>

            <FooterColumn title="Quick Links"   links={quickLinks} />
            <FooterColumn title="Trading"       links={tradingLinks} />
            <FooterColumn title="Your Account"  links={accountLinks} />
          </div>
        </div>
      </div>

      {/* Platform availability bar */}
      <div className="border-t border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <h4 className="text-sm font-semibold text-white">Available On</h4>
            <div className="flex items-center gap-6">
              {platforms.map(({ icon, label }) => (
                <a
                  key={label}
                  href="#"
                  className="flex items-center text-gray-400 hover:text-white transition-colors"
                  aria-label={`${label} platform`}
                >
                  <Icon name={`${icon} mr-2`} />
                  <span className="text-sm">{label}</span>
                </a>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Disclaimer & legal */}
      <div
        className="border-t"
        style={{ backgroundColor: '#08051a', borderColor: 'rgba(162,133,57,0.2)' }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="text-xs text-gray-400 space-y-4">
            <p className="leading-relaxed">
              <span className="font-semibold text-gray-300">RISK WARNING:</span>{' '}
              The Financial Products offered by the company include Contracts for Difference ('CFDs') and
              other complex financial products. Trading CFDs carries a high level of risk since leverage can
              work both to your advantage and disadvantage. As a result, CFDs may not be suitable for all
              investors because it is possible to lose all of your invested capital. You should never invest
              money that you cannot afford to lose. Before trading in the complex financial products offered,
              please ensure you understand the risks involved.
            </p>

            <div className="flex flex-wrap gap-4">
              {legalLinks.map(({ to, label }) => (
                <Link
                  key={label}
                  to={to}
                  className="text-blue-400 hover:text-blue-300 transition-colors"
                >
                  {label}
                </Link>
              ))}
            </div>

            <GlowLine variant="bottom" className="opacity-30" />

            <p>© {year} Charles Schwab. All Rights Reserved.</p>
          </div>
        </div>
      </div>
    </footer>
  )
}
