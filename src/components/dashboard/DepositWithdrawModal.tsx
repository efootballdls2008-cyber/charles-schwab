import { useState, useEffect, useRef, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { createDeposit, createWithdraw } from '../../services/depositService'
import { useAuth } from '../../hooks/useAuth'
import { get } from '../../api/client'
import { ENDPOINTS } from '../../api/endpoints'

export type ModalMode = 'deposit' | 'withdraw'

interface DepositWithdrawModalProps {
  mode: ModalMode
  onClose: () => void
  onSuccess?: (newBalance: number) => void
}

interface PlatformAccount {
  id: number
  accountName: string
  bankName: string
  accountNumber: string
  routingNumber: string
  accountType: string
  swiftCode: string
  paymentMethod: string
  walletAddress: string
  network: string
  isDefault: boolean
  status: string
}

interface PlatformLimits {
  minDepositAmount: number
  maxDepositAmount: number
  minWithdrawalAmount: number
  maxWithdrawalAmount: number
}

// Recipient detail field definitions per withdrawal method
interface RecipientField {
  key: string
  label: string
  placeholder: string
  type?: string
}

const RECIPIENT_FIELDS: Record<string, RecipientField[]> = {
  'Bank Transfer': [
    { key: 'bankName',       label: 'Bank Name',           placeholder: 'e.g. Chase Bank' },
    { key: 'accountName',    label: 'Account Holder Name', placeholder: 'Full name on account' },
    { key: 'accountNumber',  label: 'Account Number',      placeholder: 'e.g. 000123456789' },
    { key: 'routingNumber',  label: 'Routing Number',      placeholder: 'e.g. 021000021' },
    { key: 'accountType',    label: 'Account Type',        placeholder: 'Checking or Savings' },
  ],
  'Wire Transfer': [
    { key: 'bankName',       label: 'Bank Name',           placeholder: 'e.g. Bank of America' },
    { key: 'accountName',    label: 'Account Holder Name', placeholder: 'Full name on account' },
    { key: 'accountNumber',  label: 'Account Number',      placeholder: 'e.g. 000123456789' },
    { key: 'routingNumber',  label: 'Routing / ABA Number', placeholder: 'e.g. 026009593' },
    { key: 'swiftCode',      label: 'SWIFT / BIC Code',    placeholder: 'e.g. BOFAUS3N' },
    { key: 'bankAddress',    label: 'Bank Address',        placeholder: 'Full bank branch address' },
  ],
  'Credit Card': [
    { key: 'cardHolderName', label: 'Cardholder Name',     placeholder: 'Name on card' },
    { key: 'cardNumber',     label: 'Card Number',         placeholder: 'Last 4 digits only', type: 'text' },
    { key: 'billingAddress', label: 'Billing Address',     placeholder: 'Street, City, State, ZIP' },
  ],
  'Crypto': [
    { key: 'walletAddress',  label: 'Wallet Address',      placeholder: 'Your crypto wallet address' },
    { key: 'network',        label: 'Network / Chain',     placeholder: 'e.g. ERC-20, BEP-20, TRC-20' },
    { key: 'coinSymbol',     label: 'Coin / Token',        placeholder: 'e.g. USDT, BTC, ETH' },
  ],
}

const METHODS = [
  { value: 'Bank Transfer', icon: 'fas fa-university',   label: 'Bank Transfer' },
  { value: 'Wire Transfer', icon: 'fas fa-exchange-alt', label: 'Wire Transfer' },
  { value: 'Credit Card',   icon: 'fas fa-credit-card',  label: 'Credit Card'   },
  { value: 'Crypto',        icon: 'fas fa-coins',        label: 'Crypto'        },
]

const QUICK_AMOUNTS = [500, 1000, 5000, 10000]
const fmt = (n: number) =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(n)

// Component to display platform account details
function PlatformAccountDetails({ account, method, accentColor, accentBg, accentBorder }: {
  account: PlatformAccount
  method: string
  accentColor: string
  accentBg: string
  accentBorder: string
}) {
  const renderAccountInfo = () => {
    switch (method) {
      case 'Bank Transfer':
        return (
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-xs" style={{ color: '#9ca3af' }}>Bank Name</span>
              <span className="text-xs font-semibold text-white">{account.bankName}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-xs" style={{ color: '#9ca3af' }}>Account Number</span>
              <span className="text-xs font-mono font-semibold text-white">{account.accountNumber}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-xs" style={{ color: '#9ca3af' }}>Routing Number</span>
              <span className="text-xs font-mono font-semibold text-white">{account.routingNumber}</span>
            </div>
            {account.accountType && (
              <div className="flex justify-between">
                <span className="text-xs" style={{ color: '#9ca3af' }}>Account Type</span>
                <span className="text-xs font-semibold text-white">{account.accountType}</span>
              </div>
            )}
          </div>
        )
      
      case 'Wire Transfer':
        return (
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-xs" style={{ color: '#9ca3af' }}>Bank Name</span>
              <span className="text-xs font-semibold text-white">{account.bankName}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-xs" style={{ color: '#9ca3af' }}>Account Number</span>
              <span className="text-xs font-mono font-semibold text-white">{account.accountNumber}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-xs" style={{ color: '#9ca3af' }}>Routing Number</span>
              <span className="text-xs font-mono font-semibold text-white">{account.routingNumber}</span>
            </div>
            {account.swiftCode && (
              <div className="flex justify-between">
                <span className="text-xs" style={{ color: '#9ca3af' }}>SWIFT Code</span>
                <span className="text-xs font-mono font-semibold text-white">{account.swiftCode}</span>
              </div>
            )}
          </div>
        )
      
      case 'Crypto':
        return (
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-xs" style={{ color: '#9ca3af' }}>Wallet Address</span>
              <span className="text-xs font-mono font-semibold text-white break-all">{account.walletAddress}</span>
            </div>
            {account.network && (
              <div className="flex justify-between">
                <span className="text-xs" style={{ color: '#9ca3af' }}>Network</span>
                <span className="text-xs font-semibold text-white">{account.network}</span>
              </div>
            )}
          </div>
        )
      
      default:
        return (
          <div className="text-xs" style={{ color: '#9ca3af' }}>
            Account details will be provided after selection.
          </div>
        )
    }
  }

  return (
    <div
      className="rounded-xl p-4 space-y-3"
      style={{ background: accentBg, border: `1px solid ${accentBorder}` }}
    >
      <div className="flex items-center gap-2">
        <i className="fas fa-building text-sm" style={{ color: accentColor }} />
        <div>
          <p className="text-xs font-bold" style={{ color: accentColor }}>
            {account.accountName}
          </p>
          <p className="text-xs" style={{ color: '#6b7280' }}>
            Send your {method.toLowerCase()} payment to:
          </p>
        </div>
      </div>
      
      {renderAccountInfo()}
      
      <div
        className="flex items-start gap-2 pt-2 mt-2"
        style={{ borderTop: '1px solid rgba(255,255,255,0.1)' }}
      >
        <i className="fas fa-info-circle text-xs mt-0.5 flex-shrink-0" style={{ color: '#fbbf24' }} />
        <p className="text-xs" style={{ color: '#9ca3af' }}>
          Use the exact details above for your payment. Include your name in the transfer reference.
        </p>
      </div>
    </div>
  )
}

export default function DepositWithdrawModal({ mode, onClose, onSuccess }: DepositWithdrawModalProps) {
  const { user } = useAuth()
  const [step, setStep] = useState<'form' | 'recipient' | 'confirm' | 'success'>('form')
  const [amount, setAmount] = useState('')
  const [method, setMethod] = useState(METHODS[0].value)
  const [note, setNote] = useState('')
  const [recipientDetails, setRecipientDetails] = useState<Record<string, string>>({})
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [platformAccounts, setPlatformAccounts] = useState<PlatformAccount[]>([])
  const [selectedPlatformAccount, setSelectedPlatformAccount] = useState<PlatformAccount | null>(null)
  const [submittedTxId, setSubmittedTxId] = useState('')
  const [limits, setLimits] = useState<PlatformLimits>({
    minDepositAmount: 10,
    maxDepositAmount: 1_000_000,
    minWithdrawalAmount: 10,
    maxWithdrawalAmount: 500_000,
  })
  const inputRef = useRef<HTMLInputElement>(null)

  const isDeposit = mode === 'deposit'
  const numAmount = parseFloat(amount) || 0
  const balance = user?.balance ?? 0

  const minAmount = isDeposit ? limits.minDepositAmount : limits.minWithdrawalAmount
  const maxAmount = isDeposit ? limits.maxDepositAmount : limits.maxWithdrawalAmount

  const currentFields = RECIPIENT_FIELDS[method] ?? []

  // Reset recipient fields when method changes and find matching platform account
  useEffect(() => {
    setRecipientDetails({})
    
    // Find platform account that matches the selected method
    const methodMapping: Record<string, string> = {
      'Bank Transfer': 'bank_transfer',
      'Wire Transfer': 'wire_transfer', 
      'Credit Card': 'credit_card',
      'Crypto': 'crypto'
    }
    
    const matchingAccount = platformAccounts.find(account => 
      account.paymentMethod === methodMapping[method]
    )
    setSelectedPlatformAccount(matchingAccount || null)
  }, [method, platformAccounts])

  const loadPlatformData = useCallback(async () => {
    try {
      // ?context=deposit returns accounts assigned to 'deposit' or 'all',
      // ordered by is_default DESC — first active result is the right one.
      const [accounts, settingsArr] = await Promise.all([
        get<PlatformAccount[]>('/platformAccounts?context=deposit'),
        get<PlatformLimits[]>(ENDPOINTS.platformSettings),
      ])
      const activeAccounts = accounts.filter(a => a.status === 'active')
      setPlatformAccounts(activeAccounts)
      
      if (settingsArr?.[0]) {
        const s = settingsArr[0]
        setLimits({
          minDepositAmount: s.minDepositAmount,
          maxDepositAmount: s.maxDepositAmount,
          minWithdrawalAmount: s.minWithdrawalAmount,
          maxWithdrawalAmount: s.maxWithdrawalAmount,
        })
      }
    } catch { /* silent */ }
  }, [])

  useEffect(() => {
    setTimeout(() => inputRef.current?.focus(), 100)
    loadPlatformData()
  }, [loadPlatformData])

  const amountError = (() => {
    if (numAmount <= 0) return ''
    if (numAmount < minAmount) return `Minimum amount is ${fmt(minAmount)}`
    if (numAmount > maxAmount) return `Maximum amount is ${fmt(maxAmount)}`
    if (!isDeposit && numAmount > balance) return 'Insufficient balance'
    return ''
  })()

  const canProceed = numAmount >= minAmount && numAmount <= maxAmount && !amountError && 
    (isDeposit ? selectedPlatformAccount !== null : true)

  // All required recipient fields must be filled
  const recipientComplete = currentFields.every(f => (recipientDetails[f.key] ?? '').trim() !== '')

  function handleFormContinue() {
    if (!canProceed) return
    if (!isDeposit) {
      setStep('recipient')
    } else {
      setStep('confirm')
    }
  }

  async function handleConfirm() {
    if (!user?.id) return
    setLoading(true)
    setError('')
    try {
      const result = isDeposit
        ? await createDeposit(user.id, numAmount, method, note)
        : await createWithdraw(user.id, numAmount, method, note, recipientDetails)

      setSubmittedTxId(result.deposit.txId)
      onSuccess?.(result.newBalance)
      setStep('success')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Transaction failed. Please try again.')
      setStep('form')
    } finally {
      setLoading(false)
    }
  }

  const accentColor  = isDeposit ? '#4ade80' : '#a78bfa'
  const accentBg     = isDeposit ? 'rgba(74,222,128,0.12)'  : 'rgba(167,139,250,0.12)'
  const accentBorder = isDeposit ? 'rgba(74,222,128,0.3)'   : 'rgba(167,139,250,0.3)'
  const gradientBtn  = isDeposit
    ? 'linear-gradient(135deg, #16a34a, #4ade80)'
    : 'linear-gradient(135deg, #7c3aed, #a78bfa)'

  // Shared input style
  const inputStyle = {
    background: 'rgba(255,255,255,0.05)',
    border: '1px solid rgba(255,255,255,0.1)',
    color: '#fff',
  }

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 z-50 flex items-center justify-center p-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        style={{ background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(4px)' }}
      >
        <motion.div
          className="relative w-full max-w-md rounded-2xl overflow-hidden"
          initial={{ opacity: 0, scale: 0.94, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.94, y: 20 }}
          transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
          onClick={e => e.stopPropagation()}
          style={{
            background: 'linear-gradient(145deg, #130d35 0%, #1a1040 100%)',
            border: '1px solid rgba(255,255,255,0.1)',
            maxHeight: '92vh',
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          {/* Top accent line */}
          <div
            className="absolute top-0 left-0 right-0 h-0.5 flex-shrink-0"
            style={{ background: `linear-gradient(90deg, transparent, ${accentColor}, transparent)` }}
          />

          {/* Header */}
          <div className="flex items-center justify-between px-6 pt-6 pb-4 flex-shrink-0">
            <div className="flex items-center gap-3">
              <div
                className="w-9 h-9 rounded-xl flex items-center justify-center"
                style={{ background: accentBg, border: `1px solid ${accentBorder}` }}
              >
                <i
                  className={`fas ${isDeposit ? 'fa-arrow-down' : 'fa-arrow-up'} text-sm`}
                  style={{ color: accentColor }}
                />
              </div>
              <div>
                <h2 className="text-base font-bold text-white">
                  {isDeposit ? 'Deposit Funds' : 'Withdraw Funds'}
                </h2>
                <p className="text-xs" style={{ color: '#6b7280' }}>
                  {isDeposit ? 'Add money to your account' : 'Transfer money out'}
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-lg flex items-center justify-center transition-colors hover:bg-white/10"
              style={{ color: '#6b7280' }}
            >
              <i className="fas fa-times text-sm" />
            </button>
          </div>

          <div className="flex-shrink-0" style={{ borderTop: '1px solid rgba(255,255,255,0.07)' }} />

          {/* Step indicator — only for withdraw (3 steps) */}
          {!isDeposit && step !== 'success' && (
            <div className="flex items-center gap-2 px-6 pt-4 flex-shrink-0">
              {(['form', 'recipient', 'confirm'] as const).map((s, i) => {
                const labels = ['Amount', 'Recipient', 'Confirm']
                const idx = ['form', 'recipient', 'confirm'].indexOf(step)
                const done = i < idx
                const active = s === step
                return (
                  <div key={s} className="flex items-center gap-2 flex-1">
                    <div className="flex items-center gap-1.5">
                      <div
                        className="w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0"
                        style={{
                          background: done ? accentBg : active ? accentBg : 'rgba(255,255,255,0.06)',
                          border: `1px solid ${done || active ? accentBorder : 'rgba(255,255,255,0.1)'}`,
                          color: done || active ? accentColor : '#4b5563',
                        }}
                      >
                        {done ? <i className="fas fa-check" style={{ fontSize: '8px' }} /> : i + 1}
                      </div>
                      <span
                        className="text-xs font-medium"
                        style={{ color: active ? accentColor : done ? '#6b7280' : '#4b5563' }}
                      >
                        {labels[i]}
                      </span>
                    </div>
                    {i < 2 && (
                      <div
                        className="flex-1 h-px"
                        style={{ background: done ? accentBorder : 'rgba(255,255,255,0.08)' }}
                      />
                    )}
                  </div>
                )
              })}
            </div>
          )}

          {/* Scrollable body */}
          <div className="px-6 py-5 overflow-y-auto flex-1">

            {/* ── STEP: FORM (amount + method) ── */}
            {step === 'form' && (
              <div className="space-y-5">
                {/* Balance pill */}
                <div
                  className="flex items-center justify-between px-4 py-3 rounded-xl"
                  style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)' }}
                >
                  <span className="text-xs" style={{ color: '#9ca3af' }}>Available Balance</span>
                  <span className="text-sm font-bold text-white">{fmt(balance)}</span>
                </div>

                {/* Amount */}
                <div>
                  <label className="block text-xs font-medium mb-2" style={{ color: '#9ca3af' }}>
                    Amount (USD)
                  </label>
                  <div className="relative">
                    <span
                      className="absolute left-4 top-1/2 -translate-y-1/2 text-lg font-bold"
                      style={{ color: '#6b7280' }}
                    >
                      $
                    </span>
                    <input
                      ref={inputRef}
                      type="number"
                      min={minAmount}
                      max={maxAmount}
                      step="0.01"
                      placeholder="0.00"
                      value={amount}
                      onChange={e => { setAmount(e.target.value); setError('') }}
                      className="w-full pl-8 pr-4 py-3.5 rounded-xl text-xl font-bold text-white outline-none transition-all"
                      style={{
                        background: 'rgba(255,255,255,0.05)',
                        border: `1px solid ${amountError ? '#f87171' : 'rgba(255,255,255,0.1)'}`,
                      }}
                    />
                  </div>
                  <div className="flex items-center justify-between mt-1.5">
                    <span className="text-xs" style={{ color: '#6b7280' }}>
                      Min: <span style={{ color: '#9ca3af' }}>{fmt(minAmount)}</span>
                    </span>
                    <span className="text-xs" style={{ color: '#6b7280' }}>
                      Max: <span style={{ color: '#9ca3af' }}>{fmt(maxAmount)}</span>
                    </span>
                  </div>
                  {amountError && (
                    <p className="mt-1 text-xs" style={{ color: '#f87171' }}>
                      <i className="fas fa-exclamation-circle mr-1" />{amountError}
                    </p>
                  )}
                </div>

                {/* Quick amounts */}
                <div className="flex gap-2">
                  {QUICK_AMOUNTS.map(q => (
                    <button
                      key={q}
                      onClick={() => setAmount(String(q))}
                      className="flex-1 py-1.5 rounded-lg text-xs font-semibold transition-all hover:opacity-90"
                      style={{
                        background: amount === String(q) ? accentBg : 'rgba(255,255,255,0.05)',
                        color: amount === String(q) ? accentColor : '#9ca3af',
                        border: `1px solid ${amount === String(q) ? accentBorder : 'rgba(255,255,255,0.08)'}`,
                      }}
                    >
                      ${q.toLocaleString()}
                    </button>
                  ))}
                </div>

                {/* Method */}
                <div>
                  <label className="block text-xs font-medium mb-2" style={{ color: '#9ca3af' }}>
                    {isDeposit ? 'Payment Method' : 'Withdrawal Method'}
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {METHODS.map(m => (
                      <button
                        key={m.value}
                        onClick={() => setMethod(m.value)}
                        className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm font-medium transition-all"
                        style={{
                          background: method === m.value ? accentBg : 'rgba(255,255,255,0.04)',
                          color: method === m.value ? accentColor : '#9ca3af',
                          border: `1px solid ${method === m.value ? accentBorder : 'rgba(255,255,255,0.07)'}`,
                        }}
                      >
                        <i className={`${m.icon} text-xs`} />
                        <span className="text-xs">{m.label}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Note — deposit only (withdraw note is auto-built from recipient fields) */}
                {isDeposit && (
                  <div>
                    <label className="block text-xs font-medium mb-2" style={{ color: '#9ca3af' }}>
                      Note <span style={{ color: '#4b5563' }}>(optional)</span>
                    </label>
                    <input
                      type="text"
                      placeholder="Add a note…"
                      value={note}
                      onChange={e => setNote(e.target.value)}
                      maxLength={80}
                      className="w-full px-4 py-2.5 rounded-xl text-sm text-white outline-none"
                      style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }}
                    />
                  </div>
                )}

                {/* Platform Account Details for Deposits */}
                {isDeposit && selectedPlatformAccount && (
                  <PlatformAccountDetails
                    account={selectedPlatformAccount}
                    method={method}
                    accentColor={accentColor}
                    accentBg={accentBg}
                    accentBorder={accentBorder}
                  />
                )}

                {/* No account available warning */}
                {isDeposit && !selectedPlatformAccount && (
                  <div
                    className="flex items-start gap-2 px-3 py-2.5 rounded-xl"
                    style={{ background: 'rgba(248,113,113,0.06)', border: '1px solid rgba(248,113,113,0.15)' }}
                  >
                    <i className="fas fa-exclamation-triangle text-xs mt-0.5 flex-shrink-0" style={{ color: '#f87171' }} />
                    <p className="text-xs" style={{ color: '#f87171' }}>
                      No account configured for {method}. Please contact support or try a different payment method.
                    </p>
                  </div>
                )}

                {error && (
                  <p className="text-xs px-3 py-2 rounded-lg" style={{ background: 'rgba(248,113,113,0.1)', color: '#f87171', border: '1px solid rgba(248,113,113,0.2)' }}>
                    <i className="fas fa-exclamation-triangle mr-1.5" />{error}
                  </p>
                )}

                <button
                  onClick={handleFormContinue}
                  disabled={!canProceed}
                  className="w-full py-3.5 rounded-xl text-sm font-bold transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                  style={{
                    background: canProceed ? gradientBtn : 'rgba(255,255,255,0.08)',
                    color: canProceed ? '#fff' : '#6b7280',
                  }}
                >
                  Continue →
                </button>
              </div>
            )}

            {/* ── STEP: RECIPIENT DETAILS (withdraw only) ── */}
            {step === 'recipient' && (
              <div className="space-y-5">
                {/* Method badge */}
                <div
                  className="flex items-center gap-2 px-4 py-3 rounded-xl"
                  style={{ background: accentBg, border: `1px solid ${accentBorder}` }}
                >
                  <i
                    className={`${METHODS.find(m => m.value === method)?.icon ?? 'fas fa-university'} text-sm`}
                    style={{ color: accentColor }}
                  />
                  <div>
                    <p className="text-xs font-bold" style={{ color: accentColor }}>{method}</p>
                    <p className="text-xs" style={{ color: '#6b7280' }}>
                      Enter the details where you want to receive your funds
                    </p>
                  </div>
                </div>

                {/* Dynamic fields */}
                <div className="space-y-3">
                  {currentFields.map(field => (
                    <div key={field.key}>
                      <label className="block text-xs font-medium mb-1.5" style={{ color: '#9ca3af' }}>
                        {field.label}
                        <span className="ml-1" style={{ color: '#f87171' }}>*</span>
                      </label>
                      <input
                        type={field.type ?? 'text'}
                        placeholder={field.placeholder}
                        value={recipientDetails[field.key] ?? ''}
                        onChange={e =>
                          setRecipientDetails(prev => ({ ...prev, [field.key]: e.target.value }))
                        }
                        className="w-full px-4 py-2.5 rounded-xl text-sm outline-none transition-all"
                        style={{
                          ...inputStyle,
                          border: `1px solid ${
                            recipientDetails[field.key]?.trim()
                              ? accentBorder
                              : 'rgba(255,255,255,0.1)'
                          }`,
                        }}
                      />
                    </div>
                  ))}
                </div>

                {/* Optional note */}
                <div>
                  <label className="block text-xs font-medium mb-1.5" style={{ color: '#9ca3af' }}>
                    Additional Note <span style={{ color: '#4b5563' }}>(optional)</span>
                  </label>
                  <input
                    type="text"
                    placeholder="Any extra instructions for the transfer…"
                    value={note}
                    onChange={e => setNote(e.target.value)}
                    maxLength={120}
                    className="w-full px-4 py-2.5 rounded-xl text-sm text-white outline-none"
                    style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }}
                  />
                </div>

                {/* Privacy note */}
                <div
                  className="flex items-start gap-2 px-3 py-2.5 rounded-xl"
                  style={{ background: 'rgba(251,191,36,0.06)', border: '1px solid rgba(251,191,36,0.15)' }}
                >
                  <i className="fas fa-lock text-xs mt-0.5 flex-shrink-0" style={{ color: '#fbbf24' }} />
                  <p className="text-xs" style={{ color: '#9ca3af' }}>
                    Your banking details are encrypted and only used to process this withdrawal.
                  </p>
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={() => setStep('form')}
                    className="flex-1 py-3 rounded-xl text-sm font-semibold transition-all hover:bg-white/10"
                    style={{ background: 'rgba(255,255,255,0.05)', color: '#9ca3af', border: '1px solid rgba(255,255,255,0.08)' }}
                  >
                    Back
                  </button>
                  <button
                    onClick={() => setStep('confirm')}
                    disabled={!recipientComplete}
                    className="flex-1 py-3 rounded-xl text-sm font-bold transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                    style={{
                      background: recipientComplete ? gradientBtn : 'rgba(255,255,255,0.08)',
                      color: recipientComplete ? '#fff' : '#6b7280',
                    }}
                  >
                    Review →
                  </button>
                </div>
              </div>
            )}

            {/* ── STEP: CONFIRM ── */}
            {step === 'confirm' && (
              <div className="space-y-5">
                <div
                  className="rounded-xl p-5 space-y-3"
                  style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)' }}
                >
                  <p className="text-xs font-semibold uppercase tracking-widest" style={{ color: '#6b7280' }}>
                    Review Transaction
                  </p>

                  {/* Core details */}
                  {[
                    { label: 'Type',   value: isDeposit ? 'Deposit' : 'Withdrawal' },
                    { label: 'Amount', value: fmt(numAmount) },
                    { label: 'Method', value: method },
                  ].map(row => (
                    <div key={row.label} className="flex items-center justify-between">
                      <span className="text-xs" style={{ color: '#9ca3af' }}>{row.label}</span>
                      <span className="text-sm font-semibold text-white">{row.value}</span>
                    </div>
                  ))}

                  {/* Recipient details summary (withdraw only) */}
                  {!isDeposit && currentFields.length > 0 && (
                    <>
                      <div
                        className="pt-2 mt-1"
                        style={{ borderTop: '1px solid rgba(255,255,255,0.07)' }}
                      >
                        <p className="text-xs font-semibold mb-2" style={{ color: accentColor }}>
                          <i className="fas fa-paper-plane mr-1.5" />
                          Recipient Details
                        </p>
                        <div className="space-y-2">
                          {currentFields.map(field => {
                            const val = recipientDetails[field.key]
                            if (!val?.trim()) return null
                            return (
                              <div key={field.key} className="flex items-start justify-between gap-3">
                                <span className="text-xs flex-shrink-0" style={{ color: '#6b7280' }}>
                                  {field.label}
                                </span>
                                <span
                                  className="text-xs font-mono font-semibold text-right break-all"
                                  style={{ color: '#e5e7eb' }}
                                >
                                  {val}
                                </span>
                              </div>
                            )
                          })}
                        </div>
                      </div>
                    </>
                  )}

                  {/* Note */}
                  {note && (
                    <div className="flex items-center justify-between">
                      <span className="text-xs" style={{ color: '#9ca3af' }}>Note</span>
                      <span className="text-xs font-semibold text-white">{note}</span>
                    </div>
                  )}

                  {/* Platform Account Details for Deposits */}
                  {isDeposit && selectedPlatformAccount && (
                    <>
                      <div
                        className="pt-2 mt-1"
                        style={{ borderTop: '1px solid rgba(255,255,255,0.07)' }}
                      >
                        <p className="text-xs font-semibold mb-2" style={{ color: accentColor }}>
                          <i className="fas fa-building mr-1.5" />
                          Send Payment To
                        </p>
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="text-xs" style={{ color: '#6b7280' }}>Account Name</span>
                            <span className="text-xs font-semibold text-white">{selectedPlatformAccount.accountName}</span>
                          </div>
                          {method === 'Bank Transfer' && (
                            <>
                              <div className="flex items-center justify-between">
                                <span className="text-xs" style={{ color: '#6b7280' }}>Bank</span>
                                <span className="text-xs font-semibold text-white">{selectedPlatformAccount.bankName}</span>
                              </div>
                              <div className="flex items-center justify-between">
                                <span className="text-xs" style={{ color: '#6b7280' }}>Account #</span>
                                <span className="text-xs font-mono font-semibold text-white">{selectedPlatformAccount.accountNumber}</span>
                              </div>
                              <div className="flex items-center justify-between">
                                <span className="text-xs" style={{ color: '#6b7280' }}>Routing #</span>
                                <span className="text-xs font-mono font-semibold text-white">{selectedPlatformAccount.routingNumber}</span>
                              </div>
                            </>
                          )}
                          {method === 'Wire Transfer' && (
                            <>
                              <div className="flex items-center justify-between">
                                <span className="text-xs" style={{ color: '#6b7280' }}>Bank</span>
                                <span className="text-xs font-semibold text-white">{selectedPlatformAccount.bankName}</span>
                              </div>
                              <div className="flex items-center justify-between">
                                <span className="text-xs" style={{ color: '#6b7280' }}>Account #</span>
                                <span className="text-xs font-mono font-semibold text-white">{selectedPlatformAccount.accountNumber}</span>
                              </div>
                              {selectedPlatformAccount.swiftCode && (
                                <div className="flex items-center justify-between">
                                  <span className="text-xs" style={{ color: '#6b7280' }}>SWIFT</span>
                                  <span className="text-xs font-mono font-semibold text-white">{selectedPlatformAccount.swiftCode}</span>
                                </div>
                              )}
                            </>
                          )}
                          {method === 'Crypto' && (
                            <>
                              <div className="flex items-start justify-between gap-3">
                                <span className="text-xs flex-shrink-0" style={{ color: '#6b7280' }}>Wallet</span>
                                <span className="text-xs font-mono font-semibold text-right break-all text-white">{selectedPlatformAccount.walletAddress}</span>
                              </div>
                              {selectedPlatformAccount.network && (
                                <div className="flex items-center justify-between">
                                  <span className="text-xs" style={{ color: '#6b7280' }}>Network</span>
                                  <span className="text-xs font-semibold text-white">{selectedPlatformAccount.network}</span>
                                </div>
                              )}
                            </>
                          )}
                        </div>
                      </div>
                    </>
                  )}

                  {/* Pending notice */}
                  <div
                    className="flex items-start gap-2 pt-2 mt-1"
                    style={{ borderTop: '1px solid rgba(255,255,255,0.07)' }}
                  >
                    <i className="fas fa-info-circle text-xs mt-0.5 flex-shrink-0" style={{ color: '#fbbf24' }} />
                    <p className="text-xs" style={{ color: '#9ca3af' }}>
                      {isDeposit
                        ? 'Your request will be reviewed by our team. Balance is credited after approval.'
                        : 'Your funds will be sent to the account above after admin approval. Processing: 1–3 business days.'}
                    </p>
                  </div>
                </div>

                {error && (
                  <p className="text-xs px-3 py-2 rounded-lg" style={{ background: 'rgba(248,113,113,0.1)', color: '#f87171', border: '1px solid rgba(248,113,113,0.2)' }}>
                    <i className="fas fa-exclamation-triangle mr-1.5" />{error}
                  </p>
                )}

                <div className="flex gap-3">
                  <button
                    onClick={() => setStep(isDeposit ? 'form' : 'recipient')}
                    className="flex-1 py-3 rounded-xl text-sm font-semibold transition-all hover:bg-white/10"
                    style={{ background: 'rgba(255,255,255,0.05)', color: '#9ca3af', border: '1px solid rgba(255,255,255,0.08)' }}
                  >
                    Back
                  </button>
                  <button
                    onClick={handleConfirm}
                    disabled={loading}
                    className="flex-1 py-3 rounded-xl text-sm font-bold transition-all disabled:opacity-60"
                    style={{ background: gradientBtn, color: '#fff' }}
                  >
                    {loading ? (
                      <span className="flex items-center justify-center gap-2">
                        <i className="fas fa-spinner fa-spin text-xs" />
                        Processing…
                      </span>
                    ) : (
                      `Submit ${isDeposit ? 'Deposit' : 'Withdrawal'}`
                    )}
                  </button>
                </div>
              </div>
            )}

            {/* ── STEP: SUCCESS ── */}
            {step === 'success' && (
              <div className="flex flex-col items-center text-center py-2 space-y-4">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                  className="w-14 h-14 rounded-full flex items-center justify-center"
                  style={{ background: 'rgba(251,191,36,0.12)', border: '2px solid #fbbf24' }}
                >
                  <i className="fas fa-clock text-2xl" style={{ color: '#fbbf24' }} />
                </motion.div>

                <div>
                  <h3 className="text-base font-bold text-white mb-1">
                    {isDeposit ? 'Deposit Request Submitted' : 'Withdrawal Request Submitted'}
                  </h3>
                  <p className="text-xs" style={{ color: '#9ca3af' }}>
                    Your request is pending admin approval.
                  </p>
                </div>

                {/* Reference ID */}
                <div
                  className="w-full flex items-center justify-between px-4 py-2.5 rounded-xl"
                  style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)' }}
                >
                  <span className="text-xs" style={{ color: '#9ca3af' }}>Reference ID</span>
                  <span className="text-xs font-mono font-bold" style={{ color: '#fbbf24' }}>{submittedTxId}</span>
                </div>

                {/* Deposit: show platform account to send TO */}
                {isDeposit && (
                  selectedPlatformAccount ? (
                    <div
                      className="w-full rounded-xl p-4 space-y-2 text-left"
                      style={{ background: 'rgba(74,222,128,0.06)', border: '1px solid rgba(74,222,128,0.2)' }}
                    >
                      <p className="text-xs font-bold mb-2" style={{ color: '#4ade80' }}>
                        <i className="fas fa-university mr-1.5" />
                        Transfer funds to this account
                      </p>
                      {(selectedPlatformAccount.paymentMethod === 'crypto'
                        ? [
                            ['Network',        selectedPlatformAccount.network],
                            ['Wallet Address', selectedPlatformAccount.walletAddress],
                            ['Reference',      submittedTxId],
                          ]
                        : [
                            ['Bank',         selectedPlatformAccount.bankName],
                            ['Account Name', selectedPlatformAccount.accountName],
                            ['Account No.',  selectedPlatformAccount.accountNumber],
                            ['Routing No.',  selectedPlatformAccount.routingNumber],
                            ['Reference',    submittedTxId],
                          ]
                      ).map(([label, value]) => (
                        <div key={label} className="flex items-center justify-between">
                          <span className="text-xs" style={{ color: '#9ca3af' }}>{label}</span>
                          <span
                            className="text-xs font-mono font-semibold"
                            style={{ color: label === 'Reference' ? '#fbbf24' : '#fff' }}
                          >
                            {value}
                          </span>
                        </div>
                      ))}
                      <p className="text-xs pt-1" style={{ color: '#6b7280' }}>
                        Use the Reference ID in your transfer description so we can match your payment.
                      </p>
                    </div>
                  ) : (
                    <div
                      className="w-full rounded-xl p-4 flex items-start gap-3 text-left"
                      style={{ background: 'rgba(251,191,36,0.08)', border: '1px solid rgba(251,191,36,0.2)' }}
                    >
                      <i className="fas fa-exclamation-triangle text-sm mt-0.5 flex-shrink-0" style={{ color: '#fbbf24' }} />
                      <div>
                        <p className="text-xs font-semibold" style={{ color: '#fbbf24' }}>Payment instructions unavailable</p>
                        <p className="text-xs mt-0.5" style={{ color: '#9ca3af' }}>
                          No deposit account is currently configured. Please contact support with your Reference ID and we will provide payment details.
                        </p>
                      </div>
                    </div>
                  )
                )}

                {/* Withdrawal: confirm where funds are going */}
                {!isDeposit && (
                  <div
                    className="w-full rounded-xl p-4 text-left space-y-2"
                    style={{ background: 'rgba(167,139,250,0.06)', border: '1px solid rgba(167,139,250,0.2)' }}
                  >
                    <p className="text-xs font-bold" style={{ color: '#a78bfa' }}>
                      <i className="fas fa-paper-plane mr-1.5" />
                      Funds will be sent to
                    </p>
                    {currentFields.map(field => {
                      const val = recipientDetails[field.key]
                      if (!val?.trim()) return null
                      return (
                        <div key={field.key} className="flex items-start justify-between gap-3">
                          <span className="text-xs flex-shrink-0" style={{ color: '#6b7280' }}>
                            {field.label}
                          </span>
                          <span
                            className="text-xs font-mono font-semibold text-right break-all"
                            style={{ color: '#e5e7eb' }}
                          >
                            {val}
                          </span>
                        </div>
                      )
                    })}
                    <p className="text-xs pt-1" style={{ color: '#6b7280' }}>
                      Processing time: 1–3 business days. You will be notified once processed.
                    </p>
                  </div>
                )}

                <button
                  onClick={onClose}
                  className="w-full py-3 rounded-xl text-sm font-bold transition-all hover:opacity-90"
                  style={{ background: gradientBtn, color: '#fff' }}
                >
                  Done
                </button>
              </div>
            )}

          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}
