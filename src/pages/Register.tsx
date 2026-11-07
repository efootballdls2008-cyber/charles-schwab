import { useState, useCallback } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import Select, { type SingleValue, type StylesConfig } from 'react-select'
import SectionBackground from '../components/ui/SectionBackground'
import PasswordInput from '../components/ui/PasswordInput'
import Toast, { type ToastType } from '../components/ui/Toast'
import { register, type RegisterConflictError } from '../services/authService'
import { useAuth } from '../hooks/useAuth'

// ─── Types ────────────────────────────────────────────────────────────────────

interface FormData {
  username: string
  firstName: string
  lastName: string
  email: string
  phone: string
  country: string
  currency: string
  currencySymbol: string
  password: string
  confirmPassword: string
  captchaInput: string
  agreedToTerms: boolean
}

interface FieldErrors {
  username?: string
  firstName?: string
  lastName?: string
  email?: string
  phone?: string
  country?: string
  password?: string
  confirmPassword?: string
  captchaInput?: string
  agreedToTerms?: string
}

interface ToastState {
  message: string
  type: ToastType
}

// ─── CAPTCHA helper ───────────────────────────────────────────────────────────

const CAPTCHA_CHARS = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'

function generateCaptcha(length = 6): string {
  return Array.from({ length }, () =>
    CAPTCHA_CHARS[Math.floor(Math.random() * CAPTCHA_CHARS.length)]
  ).join('')
}

// ─── Country list ─────────────────────────────────────────────────────────────

// ─── Country option list (ISO code + flag emoji + name) ──────────────────────
// Force HMR update

interface CountryOption { value: string; label: string; flag: string; currency: string; currencySymbol: string }

const COUNTRY_DATA: CountryOption[] = [
  { value: 'AF', flag: '🇦🇫', label: 'Afghanistan', currency: 'AFN', currencySymbol: '؋' },
  { value: 'AL', flag: '🇦🇱', label: 'Albania', currency: 'ALL', currencySymbol: 'L' },
  { value: 'DZ', flag: '🇩🇿', label: 'Algeria', currency: 'DZD', currencySymbol: 'DA' },
  { value: 'AD', flag: '🇦🇩', label: 'Andorra', currency: 'EUR', currencySymbol: '€' },
  { value: 'AO', flag: '🇦🇴', label: 'Angola', currency: 'AOA', currencySymbol: 'Kz' },
  { value: 'AR', flag: '🇦🇷', label: 'Argentina', currency: 'ARS', currencySymbol: 'AR$' },
  { value: 'AM', flag: '🇦🇲', label: 'Armenia', currency: 'AMD', currencySymbol: '֏' },
  { value: 'AU', flag: '🇦🇺', label: 'Australia', currency: 'AUD', currencySymbol: 'A$' },
  { value: 'AT', flag: '🇦🇹', label: 'Austria', currency: 'EUR', currencySymbol: '€' },
  { value: 'AZ', flag: '🇦🇿', label: 'Azerbaijan', currency: 'AZN', currencySymbol: '₼' },
  { value: 'BS', flag: '🇧🇸', label: 'Bahamas', currency: 'BSD', currencySymbol: 'B$' },
  { value: 'BH', flag: '🇧🇭', label: 'Bahrain', currency: 'BHD', currencySymbol: 'BD' },
  { value: 'BD', flag: '🇧🇩', label: 'Bangladesh', currency: 'BDT', currencySymbol: '৳' },
  { value: 'BY', flag: '🇧🇾', label: 'Belarus', currency: 'BYN', currencySymbol: 'Br' },
  { value: 'BE', flag: '🇧🇪', label: 'Belgium', currency: 'EUR', currencySymbol: '€' },
  { value: 'BZ', flag: '🇧🇿', label: 'Belize', currency: 'BZD', currencySymbol: 'BZ$' },
  { value: 'BJ', flag: '🇧🇯', label: 'Benin', currency: 'XOF', currencySymbol: 'CFA' },
  { value: 'BT', flag: '🇧🇹', label: 'Bhutan', currency: 'BTN', currencySymbol: 'Nu' },
  { value: 'BO', flag: '🇧🇴', label: 'Bolivia', currency: 'BOB', currencySymbol: 'Bs' },
  { value: 'BA', flag: '🇧🇦', label: 'Bosnia and Herzegovina', currency: 'BAM', currencySymbol: 'KM' },
  { value: 'BW', flag: '🇧🇼', label: 'Botswana', currency: 'BWP', currencySymbol: 'P' },
  { value: 'BR', flag: '🇧🇷', label: 'Brazil', currency: 'BRL', currencySymbol: 'R$' },
  { value: 'BN', flag: '🇧🇳', label: 'Brunei', currency: 'BND', currencySymbol: 'B$' },
  { value: 'BG', flag: '🇧🇬', label: 'Bulgaria', currency: 'BGN', currencySymbol: 'лв' },
  { value: 'BF', flag: '🇧🇫', label: 'Burkina Faso', currency: 'XOF', currencySymbol: 'CFA' },
  { value: 'BI', flag: '🇧🇮', label: 'Burundi', currency: 'BIF', currencySymbol: 'Fr' },
  { value: 'KH', flag: '🇰🇭', label: 'Cambodia', currency: 'KHR', currencySymbol: '៛' },
  { value: 'CM', flag: '🇨🇲', label: 'Cameroon', currency: 'XAF', currencySymbol: 'CFA' },
  { value: 'CA', flag: '🇨🇦', label: 'Canada', currency: 'CAD', currencySymbol: 'CA$' },
  { value: 'TD', flag: '🇹🇩', label: 'Chad', currency: 'XAF', currencySymbol: 'CFA' },
  { value: 'CL', flag: '🇨🇱', label: 'Chile', currency: 'CLP', currencySymbol: 'CL$' },
  { value: 'CN', flag: '🇨🇳', label: 'China', currency: 'CNY', currencySymbol: '¥' },
  { value: 'CO', flag: '🇨🇴', label: 'Colombia', currency: 'COP', currencySymbol: 'CO$' },
  { value: 'CG', flag: '🇨🇬', label: 'Congo', currency: 'XAF', currencySymbol: 'CFA' },
  { value: 'CR', flag: '🇨🇷', label: 'Costa Rica', currency: 'CRC', currencySymbol: '₡' },
  { value: 'HR', flag: '🇭🇷', label: 'Croatia', currency: 'EUR', currencySymbol: '€' },
  { value: 'CU', flag: '🇨🇺', label: 'Cuba', currency: 'CUP', currencySymbol: '₱' },
  { value: 'CY', flag: '🇨🇾', label: 'Cyprus', currency: 'EUR', currencySymbol: '€' },
  { value: 'CZ', flag: '🇨🇿', label: 'Czech Republic', currency: 'CZK', currencySymbol: 'Kč' },
  { value: 'DK', flag: '🇩🇰', label: 'Denmark', currency: 'DKK', currencySymbol: 'kr' },
  { value: 'DO', flag: '🇩🇴', label: 'Dominican Republic', currency: 'DOP', currencySymbol: 'RD$' },
  { value: 'EC', flag: '🇪🇨', label: 'Ecuador', currency: 'USD', currencySymbol: '$' },
  { value: 'EG', flag: '🇪🇬', label: 'Egypt', currency: 'EGP', currencySymbol: 'E£' },
  { value: 'SV', flag: '🇸🇻', label: 'El Salvador', currency: 'USD', currencySymbol: '$' },
  { value: 'EE', flag: '🇪🇪', label: 'Estonia', currency: 'EUR', currencySymbol: '€' },
  { value: 'ET', flag: '🇪🇹', label: 'Ethiopia', currency: 'ETB', currencySymbol: 'Br' },
  { value: 'FI', flag: '🇫🇮', label: 'Finland', currency: 'EUR', currencySymbol: '€' },
  { value: 'FR', flag: '🇫🇷', label: 'France', currency: 'EUR', currencySymbol: '€' },
  { value: 'GA', flag: '🇬🇦', label: 'Gabon', currency: 'XAF', currencySymbol: 'CFA' },
  { value: 'GE', flag: '🇬🇪', label: 'Georgia', currency: 'GEL', currencySymbol: '₾' },
  { value: 'DE', flag: '🇩🇪', label: 'Germany', currency: 'EUR', currencySymbol: '€' },
  { value: 'GH', flag: '🇬🇭', label: 'Ghana', currency: 'GHS', currencySymbol: '₵' },
  { value: 'GR', flag: '🇬🇷', label: 'Greece', currency: 'EUR', currencySymbol: '€' },
  { value: 'GT', flag: '🇬🇹', label: 'Guatemala', currency: 'GTQ', currencySymbol: 'Q' },
  { value: 'GN', flag: '🇬🇳', label: 'Guinea', currency: 'GNF', currencySymbol: 'FG' },
  { value: 'HT', flag: '🇭🇹', label: 'Haiti', currency: 'HTG', currencySymbol: 'G' },
  { value: 'HN', flag: '🇭🇳', label: 'Honduras', currency: 'HNL', currencySymbol: 'L' },
  { value: 'HU', flag: '🇭🇺', label: 'Hungary', currency: 'HUF', currencySymbol: 'Ft' },
  { value: 'IS', flag: '🇮🇸', label: 'Iceland', currency: 'ISK', currencySymbol: 'kr' },
  { value: 'IN', flag: '🇮🇳', label: 'India', currency: 'INR', currencySymbol: '₹' },
  { value: 'ID', flag: '🇮🇩', label: 'Indonesia', currency: 'IDR', currencySymbol: 'Rp' },
  { value: 'IR', flag: '🇮🇷', label: 'Iran', currency: 'IRR', currencySymbol: '﷼' },
  { value: 'IQ', flag: '🇮🇶', label: 'Iraq', currency: 'IQD', currencySymbol: 'IQD' },
  { value: 'IE', flag: '🇮🇪', label: 'Ireland', currency: 'EUR', currencySymbol: '€' },
  { value: 'IL', flag: '🇮🇱', label: 'Israel', currency: 'ILS', currencySymbol: '₪' },
  { value: 'IT', flag: '🇮🇹', label: 'Italy', currency: 'EUR', currencySymbol: '€' },
  { value: 'JM', flag: '🇯🇲', label: 'Jamaica', currency: 'JMD', currencySymbol: 'J$' },
  { value: 'JP', flag: '🇯🇵', label: 'Japan', currency: 'JPY', currencySymbol: '¥' },
  { value: 'JO', flag: '🇯🇴', label: 'Jordan', currency: 'JOD', currencySymbol: 'JD' },
  { value: 'KZ', flag: '🇰🇿', label: 'Kazakhstan', currency: 'KZT', currencySymbol: '₸' },
  { value: 'KE', flag: '🇰🇪', label: 'Kenya', currency: 'KES', currencySymbol: 'KSh' },
  { value: 'KW', flag: '🇰🇼', label: 'Kuwait', currency: 'KWD', currencySymbol: 'KD' },
  { value: 'KG', flag: '🇰🇬', label: 'Kyrgyzstan', currency: 'KGS', currencySymbol: 'лв' },
  { value: 'LA', flag: '🇱🇦', label: 'Laos', currency: 'LAK', currencySymbol: '₭' },
  { value: 'LV', flag: '🇱🇻', label: 'Latvia', currency: 'EUR', currencySymbol: '€' },
  { value: 'LB', flag: '🇱🇧', label: 'Lebanon', currency: 'LBP', currencySymbol: 'L£' },
  { value: 'LY', flag: '🇱🇾', label: 'Libya', currency: 'LYD', currencySymbol: 'LD' },
  { value: 'LT', flag: '🇱🇹', label: 'Lithuania', currency: 'EUR', currencySymbol: '€' },
  { value: 'LU', flag: '🇱🇺', label: 'Luxembourg', currency: 'EUR', currencySymbol: '€' },
  { value: 'MG', flag: '🇲🇬', label: 'Madagascar', currency: 'MGA', currencySymbol: 'Ar' },
  { value: 'MY', flag: '🇲🇾', label: 'Malaysia', currency: 'MYR', currencySymbol: 'RM' },
  { value: 'MV', flag: '🇲🇻', label: 'Maldives', currency: 'MVR', currencySymbol: 'Rf' },
  { value: 'ML', flag: '🇲🇱', label: 'Mali', currency: 'XOF', currencySymbol: 'CFA' },
  { value: 'MT', flag: '🇲🇹', label: 'Malta', currency: 'EUR', currencySymbol: '€' },
  { value: 'MX', flag: '🇲🇽', label: 'Mexico', currency: 'MXN', currencySymbol: 'MX$' },
  { value: 'MD', flag: '🇲🇩', label: 'Moldova', currency: 'MDL', currencySymbol: 'L' },
  { value: 'MC', flag: '🇲🇨', label: 'Monaco', currency: 'EUR', currencySymbol: '€' },
  { value: 'MN', flag: '🇲🇳', label: 'Mongolia', currency: 'MNT', currencySymbol: '₮' },
  { value: 'ME', flag: '🇲🇪', label: 'Montenegro', currency: 'EUR', currencySymbol: '€' },
  { value: 'MA', flag: '🇲🇦', label: 'Morocco', currency: 'MAD', currencySymbol: 'MAD' },
  { value: 'MZ', flag: '🇲🇿', label: 'Mozambique', currency: 'MZN', currencySymbol: 'MT' },
  { value: 'MM', flag: '🇲🇲', label: 'Myanmar', currency: 'MMK', currencySymbol: 'K' },
  { value: 'NA', flag: '🇳🇦', label: 'Namibia', currency: 'NAD', currencySymbol: 'N$' },
  { value: 'NP', flag: '🇳🇵', label: 'Nepal', currency: 'NPR', currencySymbol: '₨' },
  { value: 'NL', flag: '🇳🇱', label: 'Netherlands', currency: 'EUR', currencySymbol: '€' },
  { value: 'NZ', flag: '🇳🇿', label: 'New Zealand', currency: 'NZD', currencySymbol: 'NZ$' },
  { value: 'NI', flag: '🇳🇮', label: 'Nicaragua', currency: 'NIO', currencySymbol: 'C$' },
  { value: 'NE', flag: '🇳🇪', label: 'Niger', currency: 'XOF', currencySymbol: 'CFA' },
  { value: 'NG', flag: '🇳🇬', label: 'Nigeria', currency: 'NGN', currencySymbol: '₦' },
  { value: 'KP', flag: '🇰🇵', label: 'North Korea', currency: 'KPW', currencySymbol: '₩' },
  { value: 'NO', flag: '🇳🇴', label: 'Norway', currency: 'NOK', currencySymbol: 'kr' },
  { value: 'OM', flag: '🇴🇲', label: 'Oman', currency: 'OMR', currencySymbol: '﷼' },
  { value: 'PK', flag: '🇵🇰', label: 'Pakistan', currency: 'PKR', currencySymbol: '₨' },
  { value: 'PA', flag: '🇵🇦', label: 'Panama', currency: 'PAB', currencySymbol: 'B/.' },
  { value: 'PY', flag: '🇵🇾', label: 'Paraguay', currency: 'PYG', currencySymbol: '₲' },
  { value: 'PE', flag: '🇵🇪', label: 'Peru', currency: 'PEN', currencySymbol: 'S/' },
  { value: 'PH', flag: '🇵🇭', label: 'Philippines', currency: 'PHP', currencySymbol: '₱' },
  { value: 'PL', flag: '🇵🇱', label: 'Poland', currency: 'PLN', currencySymbol: 'zł' },
  { value: 'PT', flag: '🇵🇹', label: 'Portugal', currency: 'EUR', currencySymbol: '€' },
  { value: 'QA', flag: '🇶🇦', label: 'Qatar', currency: 'QAR', currencySymbol: '﷼' },
  { value: 'RO', flag: '🇷🇴', label: 'Romania', currency: 'RON', currencySymbol: 'lei' },
  { value: 'RU', flag: '🇷🇺', label: 'Russia', currency: 'RUB', currencySymbol: '₽' },
  { value: 'RW', flag: '🇷🇼', label: 'Rwanda', currency: 'RWF', currencySymbol: 'RF' },
  { value: 'SA', flag: '🇸🇦', label: 'Saudi Arabia', currency: 'SAR', currencySymbol: '﷼' },
  { value: 'SN', flag: '🇸🇳', label: 'Senegal', currency: 'XOF', currencySymbol: 'CFA' },
  { value: 'RS', flag: '🇷🇸', label: 'Serbia', currency: 'RSD', currencySymbol: 'din' },
  { value: 'SL', flag: '🇸🇱', label: 'Sierra Leone', currency: 'SLL', currencySymbol: 'Le' },
  { value: 'SG', flag: '🇸🇬', label: 'Singapore', currency: 'SGD', currencySymbol: 'S$' },
  { value: 'SK', flag: '🇸🇰', label: 'Slovakia', currency: 'EUR', currencySymbol: '€' },
  { value: 'SI', flag: '🇸🇮', label: 'Slovenia', currency: 'EUR', currencySymbol: '€' },
  { value: 'SO', flag: '🇸🇴', label: 'Somalia', currency: 'SOS', currencySymbol: 'Sh' },
  { value: 'ZA', flag: '🇿🇦', label: 'South Africa', currency: 'ZAR', currencySymbol: 'R' },
  { value: 'KR', flag: '🇰🇷', label: 'South Korea', currency: 'KRW', currencySymbol: '₩' },
  { value: 'ES', flag: '🇪🇸', label: 'Spain', currency: 'EUR', currencySymbol: '€' },
  { value: 'LK', flag: '🇱🇰', label: 'Sri Lanka', currency: 'LKR', currencySymbol: '₨' },
  { value: 'SD', flag: '🇸🇩', label: 'Sudan', currency: 'SDG', currencySymbol: 'SDG' },
  { value: 'SE', flag: '🇸🇪', label: 'Sweden', currency: 'SEK', currencySymbol: 'kr' },
  { value: 'CH', flag: '🇨🇭', label: 'Switzerland', currency: 'CHF', currencySymbol: 'Fr' },
  { value: 'SY', flag: '🇸🇾', label: 'Syria', currency: 'SYP', currencySymbol: '£' },
  { value: 'TW', flag: '🇹🇼', label: 'Taiwan', currency: 'TWD', currencySymbol: 'NT$' },
  { value: 'TJ', flag: '🇹🇯', label: 'Tajikistan', currency: 'TJS', currencySymbol: 'SM' },
  { value: 'TZ', flag: '🇹🇿', label: 'Tanzania', currency: 'TZS', currencySymbol: 'TSh' },
  { value: 'TH', flag: '🇹🇭', label: 'Thailand', currency: 'THB', currencySymbol: '฿' },
  { value: 'TG', flag: '🇹🇬', label: 'Togo', currency: 'XOF', currencySymbol: 'CFA' },
  { value: 'TN', flag: '🇹🇳', label: 'Tunisia', currency: 'TND', currencySymbol: 'DT' },
  { value: 'TR', flag: '🇹🇷', label: 'Turkey', currency: 'TRY', currencySymbol: '₺' },
  { value: 'TM', flag: '🇹🇲', label: 'Turkmenistan', currency: 'TMT', currencySymbol: 'T' },
  { value: 'UG', flag: '🇺🇬', label: 'Uganda', currency: 'UGX', currencySymbol: 'USh' },
  { value: 'UA', flag: '🇺🇦', label: 'Ukraine', currency: 'UAH', currencySymbol: '₴' },
  { value: 'AE', flag: '🇦🇪', label: 'United Arab Emirates', currency: 'AED', currencySymbol: 'د.إ' },
  { value: 'GB', flag: '🇬🇧', label: 'United Kingdom', currency: 'GBP', currencySymbol: '£' },
  { value: 'US', flag: '🇺🇸', label: 'United States', currency: 'USD', currencySymbol: '$' },
  { value: 'UY', flag: '🇺🇾', label: 'Uruguay', currency: 'UYU', currencySymbol: '$U' },
  { value: 'UZ', flag: '🇺🇿', label: 'Uzbekistan', currency: 'UZS', currencySymbol: 'лв' },
  { value: 'VE', flag: '🇻🇪', label: 'Venezuela', currency: 'VES', currencySymbol: 'Bs.S' },
  { value: 'VN', flag: '🇻🇳', label: 'Vietnam', currency: 'VND', currencySymbol: '₫' },
  { value: 'YE', flag: '🇾🇪', label: 'Yemen', currency: 'YER', currencySymbol: '﷼' },
  { value: 'ZM', flag: '🇿🇲', label: 'Zambia', currency: 'ZMW', currencySymbol: 'ZK' },
  { value: 'ZW', flag: '🇿🇼', label: 'Zimbabwe', currency: 'ZWL', currencySymbol: 'Z$' },
]

// react-select dark theme styles
const countrySelectStyles: StylesConfig<CountryOption> = {
  control: (base, state) => ({
    ...base,
    background: 'rgba(255,255,255,0.06)',
    border: state.isFocused
      ? '1px solid rgba(162,133,57,0.5)'
      : '1px solid rgba(162,133,57,0.2)',
    borderRadius: '0.75rem',
    boxShadow: state.isFocused ? '0 0 0 3px rgba(162,133,57,0.08)' : 'none',
    minHeight: '48px',
    cursor: 'pointer',
    '&:hover': { borderColor: 'rgba(162,133,57,0.4)' },
  }),
  valueContainer: (base) => ({ ...base, padding: '0 12px' }),
  singleValue: (base) => ({ ...base, color: '#f3f4f6', display: 'flex', alignItems: 'center', gap: 8 }),
  placeholder: (base) => ({ ...base, color: '#6b7280', fontSize: 14 }),
  input: (base) => ({ ...base, color: '#f3f4f6', fontSize: 14 }),
  menu: (base) => ({
    ...base,
    background: '#1a1040',
    border: '1px solid rgba(162,133,57,0.2)',
    borderRadius: '0.75rem',
    overflow: 'hidden',
    zIndex: 50,
  }),
  menuList: (base) => ({ ...base, padding: 4, maxHeight: 260 }),
  option: (base, state) => ({
    ...base,
    background: state.isSelected
      ? 'rgba(162,133,57,0.2)'
      : state.isFocused
      ? 'rgba(255,255,255,0.06)'
      : 'transparent',
    color: state.isSelected ? '#c9a84c' : '#d1d5db',
    borderRadius: '0.5rem',
    fontSize: 14,
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    gap: 10,
    padding: '8px 12px',
  }),
  indicatorSeparator: () => ({ display: 'none' }),
  dropdownIndicator: (base) => ({ ...base, color: '#6b7280', padding: '0 10px' }),
  clearIndicator: (base) => ({ ...base, color: '#6b7280' }),
  noOptionsMessage: (base) => ({ ...base, color: '#6b7280', fontSize: 13 }),
}

// Format option with flag emoji
const formatCountryOption = (option: CountryOption) => (
  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
    <span style={{ fontSize: 20, lineHeight: 1 }}>{option.flag}</span>
    <span>{option.label}</span>
  </div>
)



// ─── Shared input style helpers ───────────────────────────────────────────────

const baseInput: React.CSSProperties = {
  background: 'rgba(255,255,255,0.06)',
  border: '1px solid rgba(162,133,57,0.2)',
}

function onFocus(e: React.FocusEvent<HTMLInputElement | HTMLSelectElement>) {
  e.currentTarget.style.borderColor = 'rgba(162,133,57,0.5)'
  e.currentTarget.style.boxShadow   = '0 0 0 3px rgba(162,133,57,0.08)'
}
function onBlur(e: React.FocusEvent<HTMLInputElement | HTMLSelectElement>) {
  e.currentTarget.style.borderColor = 'rgba(162,133,57,0.2)'
  e.currentTarget.style.boxShadow   = 'none'
}

const errorInput: React.CSSProperties = {
  background: 'rgba(255,255,255,0.06)',
  border: '1px solid rgba(248,113,113,0.5)',
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function FieldError({ msg }: { msg?: string }) {
  if (!msg) return null
  return (
    <p className="mt-1 text-xs flex items-center gap-1" style={{ color: '#f87171' }}>
      <i className="fas fa-circle-exclamation" aria-hidden="true" />
      {msg}
    </p>
  )
}

function Label({ htmlFor, children }: { htmlFor: string; children: React.ReactNode }) {
  return (
    <label htmlFor={htmlFor} className="block text-sm font-medium mb-1" style={{ color: '#d1d5db' }}>
      {children}
    </label>
  )
}

// Step indicator pill
function StepIndicator({ current }: { current: number }) {
  const steps = [
    { label: 'Personal Info', sub: 'Basic details' },
    { label: 'Location',      sub: 'Regional settings' },
    { label: 'Security',      sub: 'Account protection' },
  ]
  return (
    <div className="flex items-start justify-center gap-2 mb-6">
      {steps.map((s, i) => {
        const n       = i + 1
        const done    = n < current
        const active  = n === current
        return (
          <div key={n} className="flex flex-col items-center" style={{ minWidth: 72 }}>
            <div
              className="w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold mb-1 transition-all"
              style={{
                background: done
                  ? 'linear-gradient(135deg,#4ade80,#22c55e)'
                  : active
                  ? 'linear-gradient(135deg,#a28539,#c9a84c)'
                  : 'rgba(255,255,255,0.08)',
                color: done || active ? '#0d0824' : '#6b7280',
                border: done || active ? 'none' : '1px solid rgba(255,255,255,0.12)',
              }}
            >
              {done ? <i className="fas fa-check text-xs" aria-hidden="true" /> : n}
            </div>
            <span
              className="text-xs font-semibold text-center leading-tight"
              style={{ color: active ? '#c9a84c' : done ? '#4ade80' : '#6b7280' }}
            >
              {s.label}
            </span>
            <span className="text-xs text-center" style={{ color: '#4b5563' }}>
              {s.sub}
            </span>
          </div>
        )
      })}
    </div>
  )
}

// ─── Password strength checker ────────────────────────────────────────────────

interface PwdRule { label: string; ok: boolean }

function passwordRules(pw: string): PwdRule[] {
  return [
    { label: 'At least 8 characters long',                ok: pw.length >= 8 },
    { label: 'Contains uppercase and lowercase letters',  ok: /[A-Z]/.test(pw) && /[a-z]/.test(pw) },
    { label: 'Includes at least one number or special character', ok: /[\d\W]/.test(pw) },
  ]
}

function PasswordStrength({ password, confirmPassword }: { password: string; confirmPassword: string }) {
  const rules = passwordRules(password)
  const allMatch = password.length > 0 && password === confirmPassword
  return (
    <div
      className="rounded-xl p-3 mt-1"
      style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)' }}
    >
      <p className="text-xs font-semibold mb-2" style={{ color: '#9ca3af' }}>Password Requirements:</p>
      <ul className="space-y-1">
        {rules.map((r) => (
          <li key={r.label} className="flex items-center gap-2 text-xs">
            <i
              className={r.ok ? 'fas fa-check-circle' : 'fas fa-times-circle'}
              style={{ color: r.ok ? '#4ade80' : '#f87171', fontSize: 11 }}
              aria-hidden="true"
            />
            <span style={{ color: r.ok ? '#d1d5db' : '#9ca3af' }}>{r.label}</span>
          </li>
        ))}
        <li className="flex items-center gap-2 text-xs">
          <i
            className={allMatch ? 'fas fa-check-circle' : 'fas fa-times-circle'}
            style={{ color: allMatch ? '#4ade80' : '#f87171', fontSize: 11 }}
            aria-hidden="true"
          />
          <span style={{ color: allMatch ? '#d1d5db' : '#9ca3af' }}>Passwords match</span>
        </li>
      </ul>
    </div>
  )
}

// ─── CAPTCHA display ──────────────────────────────────────────────────────────

function CaptchaBox({ code, onRefresh }: { code: string; onRefresh: () => void }) {
  return (
    <div
      className="rounded-xl p-4 flex flex-col items-center gap-3"
      style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)' }}
    >
      <p className="text-xs" style={{ color: '#9ca3af' }}>Enter the code below:</p>
      <div
        className="px-6 py-3 rounded-lg select-none tracking-[0.35em] text-2xl font-extrabold"
        style={{
          background: 'linear-gradient(135deg,#1e1060,#2d1b8e)',
          color: '#f5c842',
          fontFamily: 'monospace',
          letterSpacing: '0.35em',
          userSelect: 'none',
          border: '1px solid rgba(162,133,57,0.3)',
        }}
        aria-label={`Security code: ${code.split('').join(' ')}`}
      >
        {code}
      </div>
      <button
        type="button"
        onClick={onRefresh}
        className="text-xs flex items-center gap-1 transition-opacity hover:opacity-70"
        style={{ color: '#6b7280' }}
        aria-label="Refresh security code"
      >
        <i className="fas fa-rotate-right text-xs" aria-hidden="true" />
        Refresh code
      </button>
    </div>
  )
}

// ─── Main component ───────────────────────────────────────────────────────────

export default function Register() {
  const { login } = useAuth()
  const navigate  = useNavigate()

  const [step, setStep]       = useState<1 | 2 | 3>(1)
  const [loading, setLoading] = useState(false)
  const [toast, setToast]     = useState<ToastState | null>(null)
  const [captcha, setCaptcha] = useState(() => generateCaptcha())

  // username availability removed - using email as unique identifier

  const [form, setForm] = useState<FormData>({
    username: '', firstName: '', lastName: '',
    email: '', phone: '', country: '',
    currency: 'USD', currencySymbol: '$',
    password: '', confirmPassword: '',
    captchaInput: '', agreedToTerms: false,
  })

  const [errors, setErrors] = useState<FieldErrors>({})

  const showToast  = (message: string, type: ToastType) => setToast({ message, type })
  const clearToast = () => setToast(null)

  const set = (field: keyof FormData) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
      const value = e.target.type === 'checkbox'
        ? (e.target as HTMLInputElement).checked
        : e.target.value
      setForm((prev) => ({ ...prev, [field]: value }))
      // clear field error on change
      if (errors[field as keyof FieldErrors]) {
        setErrors((prev) => ({ ...prev, [field]: undefined }))
      }
    }

  // ── Username availability check (debounced 600 ms) ──────────
  // Removed - using email as unique identifier

  const refreshCaptcha = useCallback(() => {
    setCaptcha(generateCaptcha())
    setForm((prev) => ({ ...prev, captchaInput: '' }))
    setErrors((prev) => ({ ...prev, captchaInput: undefined }))
  }, [])

  // ── Step 1 validation ────────────────────────────────────────
  function validateStep1(): boolean {
    const e: FieldErrors = {}

    if (!form.username.trim()) {
      e.username = 'Username is required.'
    } else if (form.username.trim().length < 3) {
      e.username = 'Username must be at least 3 characters.'
    } else if (!/^[a-zA-Z0-9_.-]+$/.test(form.username.trim())) {
      e.username = 'Username can only contain letters, numbers, dots, dashes, and underscores.'
    }

    if (!form.firstName.trim()) e.firstName = 'First name is required.'
    if (!form.lastName.trim())  e.lastName  = 'Last name is required.'

    if (!form.email.trim()) {
      e.email = 'Email is required.'
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) {
      e.email = 'Enter a valid email address.'
    }

    if (!form.phone.trim()) {
      e.phone = 'Phone number is required.'
    } else if (!/^\+?[\d\s\-().]{7,20}$/.test(form.phone.trim())) {
      e.phone = 'Enter a valid phone number.'
    }

    setErrors(e)
    return Object.keys(e).length === 0
  }

  // ── Step 2 validation ────────────────────────────────────────
  function validateStep2(): boolean {
    const e: FieldErrors = {}
    if (!form.country.trim()) e.country = 'Please select your country.'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  // ── Step 3 validation ────────────────────────────────────────
  function validateStep3(): boolean {
    const e: FieldErrors = {}
    const rules = passwordRules(form.password)

    if (!form.password) {
      e.password = 'Password is required.'
    } else if (!rules.every((r) => r.ok)) {
      e.password = 'Password does not meet all requirements.'
    }

    if (!form.confirmPassword) {
      e.confirmPassword = 'Please confirm your password.'
    } else if (form.password !== form.confirmPassword) {
      e.confirmPassword = 'Passwords do not match.'
    }

    if (!form.captchaInput.trim()) {
      e.captchaInput = 'Please enter the security code.'
    } else if (form.captchaInput.trim().toUpperCase() !== captcha) {
      e.captchaInput = 'Incorrect code. Please try again.'
      refreshCaptcha()
    }

    if (!form.agreedToTerms) {
      e.agreedToTerms = 'You must agree to the Terms and Conditions.'
    }

    setErrors(e)
    return Object.keys(e).length === 0
  }

  // ── Continue button ──────────────────────────────────────────
  function handleContinue() {
    if (step === 1 && validateStep1()) setStep(2)
    if (step === 2 && validateStep2()) setStep(3)
  }

  // ── Final submit ─────────────────────────────────────────────
  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!validateStep3()) return

    setLoading(true)
    clearToast()

    try {
      const user = await register({
        username:        form.username.trim(),
        firstName:       form.firstName.trim(),
        lastName:        form.lastName.trim(),
        email:           form.email.trim(),
        phone:           form.phone.trim(),
        country:         form.country,
        currency:        form.currency,
        password:        form.password,
        confirmPassword: form.confirmPassword,
      })

      if (user) {
        showToast('Account created! Signing you in…', 'success')
        await login(form.email.trim(), form.password)
        setTimeout(() => navigate('/user/dashboard'), 1400)
      } else {
        showToast('Registration failed. Please try again.', 'error')
      }
    } catch (err) {
      const conflict = err as RegisterConflictError
      if (conflict.field === 'email') {
        setStep(1)
        setErrors({ email: conflict.message })
        showToast(conflict.message, 'error')
      } else {
        const msg = err instanceof Error ? err.message : 'Registration failed. Please try again.'
        showToast(msg, 'error')
      }
    } finally {
      setLoading(false)
    }
  }

  // ── Shared input class ───────────────────────────────────────
  const inputCls = 'w-full px-4 py-3 rounded-xl text-gray-100 text-sm outline-none transition-all'

  // ── Render ───────────────────────────────────────────────────
  return (
    <>
      {toast && <Toast message={toast.message} type={toast.type} onClose={clearToast} />}

      <SectionBackground minHeight="100vh" className="flex items-center justify-center px-4 py-12">
        <div
          className="w-full max-w-md rounded-2xl p-8 space-y-5"
          style={{
            background: 'rgba(255,255,255,0.03)',
            border: '1px solid rgba(162,133,57,0.25)',
          }}
        >
          {/* Header */}
          <div className="text-center space-y-1">
            <img src="/img/logo.png" alt="Charles Schwab" className="h-10 mx-auto mb-2" />
            <h1 className="text-2xl font-bold text-white">
              Join <span style={{ color: '#c9a84c' }}>Charles Schwab</span>
            </h1>
            <p className="text-sm" style={{ color: '#9ca3af' }}>Start your professional trading journey</p>
          </div>

          {/* Community badge */}
          <div className="flex justify-center">
            <div
              className="flex items-center gap-2 px-4 py-2 rounded-full text-xs font-semibold"
              style={{
                background: 'linear-gradient(135deg, rgba(162,133,57,0.15), rgba(201,168,76,0.08))',
                border: '1px solid rgba(162,133,57,0.3)',
                color: '#c9a84c',
              }}
            >
              <i className="fas fa-users text-xs" aria-hidden="true" />
              1M+ Traders Community
            </div>
          </div>

          {/* Step indicator */}
          <StepIndicator current={step} />

          <form onSubmit={handleSubmit} noValidate>

            {/* ══ STEP 1 — Personal Info ══════════════════════════ */}
            {step === 1 && (
              <div className="space-y-4">
                {/* Section header */}
                <div
                  className="flex items-center gap-3 p-3 rounded-xl"
                  style={{ background: 'rgba(162,133,57,0.08)', border: '1px solid rgba(162,133,57,0.15)' }}
                >
                  <div
                    className="w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0"
                    style={{ background: 'rgba(162,133,57,0.15)' }}
                  >
                    <i className="fas fa-user text-sm" style={{ color: '#c9a84c' }} aria-hidden="true" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-white">Personal Information</p>
                    <p className="text-xs" style={{ color: '#9ca3af' }}>Create your trading profile</p>
                  </div>
                </div>

                {/* First + Last name */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label htmlFor="reg-first">First Name *</Label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2">
                        <i className="fas fa-user text-xs" style={{ color: '#6b7280' }} aria-hidden="true" />
                      </span>
                      <input
                        id="reg-first"
                        type="text"
                        placeholder="First name"
                        autoComplete="given-name"
                        value={form.firstName}
                        onChange={set('firstName')}
                        className={inputCls + ' pl-9'}
                        style={errors.firstName ? errorInput : baseInput}
                        onFocus={onFocus}
                        onBlur={onBlur}
                        aria-invalid={!!errors.firstName}
                      />
                    </div>
                    <FieldError msg={errors.firstName} />
                  </div>
                  <div>
                    <Label htmlFor="reg-last">Last Name *</Label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2">
                        <i className="fas fa-user text-xs" style={{ color: '#6b7280' }} aria-hidden="true" />
                      </span>
                      <input
                        id="reg-last"
                        type="text"
                        placeholder="Last name"
                        autoComplete="family-name"
                        value={form.lastName}
                        onChange={set('lastName')}
                        className={inputCls + ' pl-9'}
                        style={errors.lastName ? errorInput : baseInput}
                        onFocus={onFocus}
                        onBlur={onBlur}
                        aria-invalid={!!errors.lastName}
                      />
                    </div>
                    <FieldError msg={errors.lastName} />
                  </div>
                </div>

                {/* Username */}
                <div>
                  <Label htmlFor="reg-username">Username *</Label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2">
                      <i className="fas fa-at text-xs" style={{ color: '#6b7280' }} aria-hidden="true" />
                    </span>
                    <input
                      id="reg-username"
                      type="text"
                      placeholder="Choose a unique username"
                      autoComplete="username"
                      value={form.username}
                      onChange={set('username')}
                      className={inputCls + ' pl-9'}
                      style={errors.username ? errorInput : baseInput}
                      onFocus={onFocus}
                      onBlur={onBlur}
                      aria-invalid={!!errors.username}
                    />
                  </div>
                  <FieldError msg={errors.username} />
                </div>

                {/* Email */}
                <div>
                  <Label htmlFor="reg-email">Email Address *</Label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2">
                      <i className="fas fa-envelope text-xs" style={{ color: '#6b7280' }} aria-hidden="true" />
                    </span>
                    <input
                      id="reg-email"
                      type="email"
                      placeholder="your.email@example.com"
                      autoComplete="email"
                      value={form.email}
                      onChange={set('email')}
                      className={inputCls + ' pl-9'}
                      style={errors.email ? errorInput : baseInput}
                      onFocus={onFocus}
                      onBlur={onBlur}
                      aria-invalid={!!errors.email}
                    />
                  </div>
                  <FieldError msg={errors.email} />
                </div>

                {/* Phone */}
                <div>
                  <Label htmlFor="reg-phone">Phone Number *</Label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2">
                      <i className="fas fa-phone text-xs" style={{ color: '#6b7280' }} aria-hidden="true" />
                    </span>
                    <input
                      id="reg-phone"
                      type="tel"
                      placeholder="+1 (555) 123-4567"
                      autoComplete="tel"
                      value={form.phone}
                      onChange={set('phone')}
                      className={inputCls + ' pl-9'}
                      style={errors.phone ? errorInput : baseInput}
                      onFocus={onFocus}
                      onBlur={onBlur}
                      aria-invalid={!!errors.phone}
                    />
                  </div>
                  <FieldError msg={errors.phone} />
                </div>
              </div>
            )}

            {/* STEP 2 - Location */}
            {step === 2 && (
              <div className="space-y-4">
                <div
                  className="flex items-center gap-3 p-3 rounded-xl"
                  style={{ background: 'rgba(99,102,241,0.08)', border: '1px solid rgba(99,102,241,0.2)' }}
                >
                  <div
                    className="w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0"
                    style={{ background: 'rgba(99,102,241,0.15)' }}
                  >
                    <i className="fas fa-globe text-sm" style={{ color: '#818cf8' }} aria-hidden="true" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-white">Location</p>
                    <p className="text-xs" style={{ color: '#9ca3af' }}>Set your regional trading preferences</p>
                  </div>
                </div>

                <div>
                  <Label htmlFor="reg-country">Country *</Label>
                  <Select<CountryOption>
                    inputId="reg-country"
                    options={COUNTRY_DATA}
                    value={COUNTRY_DATA.find(c => c.label === form.country) ?? null}
                    onChange={(opt: SingleValue<CountryOption>) =>
                      setForm(prev => ({
                        ...prev,
                        country:        opt?.label ?? '',
                        currency:       opt?.currency ?? 'USD',
                        currencySymbol: opt?.currencySymbol ?? '$',
                      }))
                    }
                    placeholder="Select your country"
                    styles={countrySelectStyles}
                    formatOptionLabel={formatCountryOption}
                    isSearchable
                    aria-invalid={!!errors.country}
                  />
                  {errors.country && (
                    <p className="mt-1 text-xs flex items-center gap-1" style={{ color: '#f87171' }}>
                      <i className="fas fa-circle-exclamation" aria-hidden="true" />
                      {errors.country}
                    </p>
                  )}
                </div>

                <div
                  className="flex gap-3 p-3 rounded-xl"
                  style={{ background: 'rgba(96,165,250,0.06)', border: '1px solid rgba(96,165,250,0.15)' }}
                >
                  <i className="fas fa-circle-info text-sm mt-0.5 flex-shrink-0" style={{ color: '#60a5fa' }} aria-hidden="true" />
                  <div>
                    <p className="text-xs font-semibold mb-0.5" style={{ color: '#93c5fd' }}>Regional Trading Information</p>
                    <p className="text-xs leading-relaxed" style={{ color: '#6b7280' }}>
                      Your location helps us provide region-specific features, compliance, and
                      optimal server connections for faster trading execution.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* STEP 3 - Security */}
            {step === 3 && (
              <div className="space-y-4">
                <div
                  className="flex items-center gap-3 p-3 rounded-xl"
                  style={{ background: 'rgba(74,222,128,0.06)', border: '1px solid rgba(74,222,128,0.15)' }}
                >
                  <div
                    className="w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0"
                    style={{ background: 'rgba(74,222,128,0.12)' }}
                  >
                    <i className="fas fa-shield-halved text-sm" style={{ color: '#4ade80' }} aria-hidden="true" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-white">Account Security</p>
                    <p className="text-xs" style={{ color: '#9ca3af' }}>Secure your trading account</p>
                  </div>
                </div>

                <div>
                  <PasswordInput
                    id="reg-password"
                    label="Password *"
                    value={form.password}
                    onChange={(v) => {
                      setForm((p) => ({ ...p, password: v }))
                      if (errors.password) setErrors((p) => ({ ...p, password: undefined }))
                    }}
                    autoComplete="new-password"
                    placeholder="Create strong password"
                    required
                  />
                  <FieldError msg={errors.password} />
                </div>

                <div>
                  <PasswordInput
                    id="reg-confirm"
                    label="Confirm Password *"
                    value={form.confirmPassword}
                    onChange={(v) => {
                      setForm((p) => ({ ...p, confirmPassword: v }))
                      if (errors.confirmPassword) setErrors((p) => ({ ...p, confirmPassword: undefined }))
                    }}
                    autoComplete="new-password"
                    placeholder="Confirm your password"
                    required
                  />
                  <FieldError msg={errors.confirmPassword} />
                </div>

                <div>
                  <Label htmlFor="reg-captcha">Security Verification *</Label>
                  <CaptchaBox code={captcha} onRefresh={refreshCaptcha} />
                  <div className="relative mt-2">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2">
                      <i className="fas fa-shield text-xs" style={{ color: '#6b7280' }} aria-hidden="true" />
                    </span>
                    <input
                      id="reg-captcha"
                      type="text"
                      placeholder="ENTER THE CODE ABOVE"
                      maxLength={6}
                      value={form.captchaInput}
                      onChange={(e) => {
                        setForm((p) => ({ ...p, captchaInput: e.target.value.toUpperCase() }))
                        if (errors.captchaInput) setErrors((p) => ({ ...p, captchaInput: undefined }))
                      }}
                      className="w-full pl-9 py-3 rounded-xl text-gray-100 text-sm outline-none transition-all tracking-widest uppercase"
                      style={errors.captchaInput ? errorInput : baseInput}
                      onFocus={onFocus}
                      onBlur={onBlur}
                      aria-invalid={!!errors.captchaInput}
                      aria-describedby="captcha-hint"
                    />
                  </div>
                  <p id="captcha-hint" className="mt-1 text-xs" style={{ color: '#4b5563' }}>
                    <i className="fas fa-circle-info mr-1" aria-hidden="true" />
                    This helps us verify that you are a real person and protects against automated registrations.
                  </p>
                  <FieldError msg={errors.captchaInput} />
                </div>

                <PasswordStrength password={form.password} confirmPassword={form.confirmPassword} />

                <div>
                  <label className="flex items-start gap-3 cursor-pointer">
                    <div className="relative mt-0.5 flex-shrink-0">
                      <input
                        type="checkbox"
                        checked={form.agreedToTerms}
                        onChange={(e) => {
                          setForm((p) => ({ ...p, agreedToTerms: e.target.checked }))
                          if (errors.agreedToTerms) setErrors((p) => ({ ...p, agreedToTerms: undefined }))
                        }}
                        className="sr-only"
                        aria-label="Agree to Terms and Conditions"
                      />
                      <div
                        className="w-4 h-4 rounded flex items-center justify-center transition-all"
                        style={{
                          background: form.agreedToTerms
                            ? 'linear-gradient(135deg,#a28539,#c9a84c)'
                            : 'rgba(255,255,255,0.06)',
                          border: errors.agreedToTerms
                            ? '1px solid rgba(248,113,113,0.5)'
                            : form.agreedToTerms
                            ? 'none'
                            : '1px solid rgba(162,133,57,0.3)',
                        }}
                      >
                        {form.agreedToTerms && (
                          <i className="fas fa-check" style={{ color: '#0d0824', fontSize: 9 }} aria-hidden="true" />
                        )}
                      </div>
                    </div>
                    <div>
                      <p className="text-xs leading-relaxed" style={{ color: '#9ca3af' }}>
                        I agree to Charles Schwab's{' '}
                        <a href="/terms" className="underline" style={{ color: '#c9a84c' }} target="_blank" rel="noopener noreferrer">
                          Terms and Conditions
                        </a>{' '}
                        and acknowledge that I have read and understood the{' '}
                        <a href="/privacy" className="underline" style={{ color: '#60a5fa' }} target="_blank" rel="noopener noreferrer">
                          Privacy Policy
                        </a>
                      </p>
                      <p className="text-xs mt-1" style={{ color: '#4b5563' }}>
                        By creating an account, you confirm that you are at least 18 years old and agree to
                        receive trading updates and market insights.
                      </p>
                    </div>
                  </label>
                  <FieldError msg={errors.agreedToTerms} />
                </div>
              </div>
            )}

            {/* Navigation */}
            <div className="mt-6 space-y-3">
              {/* Step label */}
              <p className="text-center text-xs" style={{ color: '#6b7280' }}>
                Step {step} of 3
              </p>

              {/* Buttons row */}
              <div className={`flex gap-3 ${step === 1 ? '' : ''}`}>
                {step > 1 && (
                  <button
                    type="button"
                    onClick={() => setStep((s) => (s - 1) as 1 | 2 | 3)}
                    className="flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-sm font-medium transition-all hover:bg-white/5 flex-shrink-0"
                    style={{ color: '#9ca3af', border: '1px solid rgba(255,255,255,0.1)' }}
                  >
                    <i className="fas fa-arrow-left text-xs" aria-hidden="true" />
                    Back
                  </button>
                )}

                {step < 3 ? (
                  <button
                    type="button"
                    onClick={handleContinue}
                    className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-bold transition-all hover:opacity-90"
                    style={{
                      background: 'linear-gradient(135deg,#a28539 0%,#c9a84c 50%,#a28539 100%)',
                      color: '#0d0824',
                      boxShadow: '0 4px 24px rgba(162,133,57,0.35)',
                    }}
                  >
                    Continue
                    <i className="fas fa-arrow-right text-xs" aria-hidden="true" />
                  </button>
                ) : (
                  <button
                    type="submit"
                    disabled={loading}
                    className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-bold transition-all"
                    style={{
                      background: loading
                        ? 'rgba(162,133,57,0.4)'
                        : 'linear-gradient(135deg,#a28539 0%,#c9a84c 50%,#a28539 100%)',
                      color: '#0d0824',
                      cursor: loading ? 'not-allowed' : 'pointer',
                      boxShadow: loading ? 'none' : '0 4px 24px rgba(162,133,57,0.35)',
                    }}
                  >
                    {loading ? (
                      <>
                        <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                        </svg>
                        Creating account...
                      </>
                    ) : (
                      <>
                        <i className="fas fa-user-plus text-xs" aria-hidden="true" />
                        Create Trading Account
                      </>
                    )}
                  </button>
                )}
              </div>
            </div>
          </form>

          <p className="text-center text-sm" style={{ color: '#6b7280' }}>
            Already have an account?{' '}
            <Link to="/login" className="font-semibold" style={{ color: '#c9a84c' }}>
              Sign in here
            </Link>
          </p>

          <div className="flex items-center justify-center gap-3 pt-2">
            {[
              { icon: 'fa-lock',         label: 'SSL Secured',         color: '#4ade80', bg: 'rgba(74,222,128,0.08)',  border: 'rgba(74,222,128,0.2)'  },
              { icon: 'fa-shield-halved', label: '256-bit Encryption', color: '#60a5fa', bg: 'rgba(96,165,250,0.08)',  border: 'rgba(96,165,250,0.2)'  },
              { icon: 'fa-certificate',  label: 'Regulated Platform',  color: '#c9a84c', bg: 'rgba(201,168,76,0.08)', border: 'rgba(201,168,76,0.2)'  },
            ].map(({ icon, label, color, bg, border }) => (
              <div
                key={label}
                className="flex flex-col items-center gap-1.5 px-3 py-2 rounded-xl flex-1"
                style={{ background: bg, border: `1px solid ${border}` }}
              >
                <i className={`fas ${icon} text-sm`} style={{ color }} aria-hidden="true" />
                <span className="text-[10px] font-semibold text-center leading-tight" style={{ color }}>
                  {label}
                </span>
              </div>
            ))}
          </div>

          <p className="text-center text-xs" style={{ color: '#374151' }}>
            2026 Charles Schwab. All rights reserved. Licensed and regulated trading platform.
          </p>
        </div>
      </SectionBackground>
    </>
  )
}
