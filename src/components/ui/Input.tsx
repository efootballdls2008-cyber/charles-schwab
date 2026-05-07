interface InputProps {
  label: string
  type?: string
  placeholder?: string
  id?: string
  required?: boolean
  autoComplete?: string
}

/** Labeled dark-themed input field */
export default function Input({
  label,
  type = 'text',
  placeholder,
  id,
  required,
  autoComplete,
}: InputProps) {
  const inputId = id ?? label.toLowerCase().replace(/\s+/g, '-')

  return (
    <div>
      <label htmlFor={inputId} className="block text-sm font-medium text-gray-300 mb-1">
        {label}
      </label>
      <input
        id={inputId}
        type={type}
        placeholder={placeholder}
        required={required}
        autoComplete={autoComplete}
        className="w-full px-4 py-3 rounded-lg text-gray-100 text-sm outline-none focus:ring-2 focus:ring-primary transition-all"
        style={{
          background: 'rgba(255,255,255,0.06)',
          border: '1px solid rgba(162,133,57,0.2)',
        }}
      />
    </div>
  )
}
