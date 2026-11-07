import { useState } from 'react'

interface PasswordInputProps {
  id: string
  label: string
  value: string
  onChange: (val: string) => void
  placeholder?: string
  autoComplete?: string
  required?: boolean
  variant?: 'gold' | 'green'
}

/** Password input with show/hide toggle eye icon */
export default function PasswordInput({
  id,
  label,
  value,
  onChange,
  placeholder = '••••••••',
  autoComplete = 'current-password',
  required = false,
  variant = 'gold',
}: PasswordInputProps) {
  const [show, setShow] = useState(false)

  const borderDefault = variant === 'green' ? 'rgba(255,255,255,0.08)' : 'rgba(162,133,57,0.2)'
  const borderFocus   = variant === 'green' ? 'rgba(74,222,128,0.4)'   : 'rgba(162,133,57,0.5)'
  const shadowFocus   = variant === 'green' ? '0 0 0 3px rgba(74,222,128,0.08)' : '0 0 0 3px rgba(162,133,57,0.08)'

  return (
    <div>
      <label htmlFor={id} className="block text-xs text-gray-500 mb-1.5">
        {label}
      </label>
      <div className="relative">
        <input
          id={id}
          type={show ? 'text' : 'password'}
          placeholder={placeholder}
          autoComplete={autoComplete}
          required={required}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-full px-3 py-2.5 pr-11 rounded-xl text-sm text-white outline-none transition-all"
          style={{
            background: 'rgba(255,255,255,0.05)',
            border: `1px solid ${borderDefault}`,
          }}
          onFocus={(e) => {
            e.currentTarget.style.borderColor = borderFocus
            e.currentTarget.style.boxShadow = shadowFocus
          }}
          onBlur={(e) => {
            e.currentTarget.style.borderColor = borderDefault
            e.currentTarget.style.boxShadow = 'none'
          }}
        />
        <button
          type="button"
          onClick={() => setShow((s) => !s)}
          className="absolute right-3 top-1/2 -translate-y-1/2 w-7 h-7 flex items-center justify-center rounded-md transition-all hover:bg-white/10"
          aria-label={show ? 'Hide password' : 'Show password'}
          tabIndex={-1}
        >
          <i
            className={show ? 'fas fa-eye-slash' : 'fas fa-eye'}
            style={{ color: '#6b7280', fontSize: 14 }}
            aria-hidden="true"
          />
        </button>
      </div>
    </div>
  )
}
