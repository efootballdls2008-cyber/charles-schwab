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
  isDefault: boolean
  status: string
}

interface PlatformLimits {
  minDepositAmount: number
  maxDepositAmount: number
  minWithdrawalAmount: number
  maxWithdrawalAmount: number
}

const METHODS = [
  { value: 'Bank Transfer', icon: 'fas fa-university',   label: 'Bank Transfer' },
  { value: 'Credit Card',   icon: 'fas fa-credit-card',  label: 'Credit Card'   },
  { value: 'Wire Transfer', icon: 'fas fa-exchange-alt', label: 'Wire Transfer' },
  { value: 'Crypto',        icon: 'fas fa-coins',        label: 'Crypto'        },
]

const QUICK_AMOUNTS = [500, 1000, 5000, 10000]
const fmt = (n: number) =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(n)

export default function DepositWithdrawModal({ mode, onClose, onSuccess }: DepositWithdrawModalProps) {
  const { user } = useAuth()
  const [step, setStep] = useState<'form' | 'confirm' | 'success'>('form')
  const [amount, setAmount] = useState('')
  const [method, setMethod] = useState(METHODS[0].value)
  const [note, setNote] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [platformAccount, setPlatformAccount] = useState<PlatformAccount | null>(null)
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

  // Load default platform account and limits
  const loadPlatformData = useCallback(async () => {
    try {
      const [accounts, settingsArr] = await Promise.all([
        get<PlatformAccount[]>('/platformAccounts'),
        get<PlatformLimits[]>(ENDPOINTS.platformSettings),
      ])
      const def = accounts.find(a => a.isDefault && a.status === 'active')
      if (def) setPlatformAccount(def)
      if (settingsArr?.[0]) {
        const s = settingsArr[0]
        setLimits({
          minDepositAmount: s.minDepositAmount,
          maxDepositAmount: s.maxDepositAmount,
          minWithdrawalAmount: s.minWithdrawalAmount,
          maxWithdrawalAmount: s.maxWithdrawalAmount,
        })
      }
    } catch { /* silent — not critical */ }
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

  const canProceed = numAmount >= minAmount && numAmount <= maxAmount && !amountError

  async function handleConfirm() {
    if (!user?.id) return
    setLoading(true)
    setError('')
    try {
      const result = isDeposit
        ? await createDeposit(user.id, numAmount, method, note)
        : await createWithdraw(user.id, numAmount, method, note)

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
          }}
        >
          {/* Top accent line */}
          <div
            className="absolute top-0 left-0 right-0 h-0.5"
            style={{ background: `linear-gradient(90deg, transparent, ${accentColor}, transparent)` }}
          />

          {/* Header */}
          <div className="flex items-center justify-between px-6 pt-6 pb-4">
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

          <div style={{ borderTop: '1px solid rgba(255,255,255,0.07)' }} />

          <div className="px-6 py-5">

            {/* ── STEP: FORM ── */}
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
                  {/* Min / Max range hint */}
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
                    Payment Method
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

                {/* Note */}
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

                {error && (
                  <p className="text-xs px-3 py-2 rounded-lg" style={{ background: 'rgba(248,113,113,0.1)', color: '#f87171', border: '1px solid rgba(248,113,113,0.2)' }}>
                    <i className="fas fa-exclamation-triangle mr-1.5" />{error}
                  </p>
                )}

                <button
                  onClick={() => setStep('confirm')}
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
                  {[
                    { label: 'Type',   value: isDeposit ? 'Deposit' : 'Withdrawal' },
                    { label: 'Amount', value: fmt(numAmount) },
                    { label: 'Method', value: method },
                    { label: 'Note',   value: note || '—' },
                  ].map(row => (
                    <div key={row.label} className="flex items-center justify-between">
                      <span className="text-xs" style={{ color: '#9ca3af' }}>{row.label}</span>
                      <span className="text-sm font-semibold text-white">{row.value}</span>
                    </div>
                  ))}
                  {/* Pending notice on confirm */}
                  <div
                    className="flex items-start gap-2 pt-2 mt-2"
                    style={{ borderTop: '1px solid rgba(255,255,255,0.07)' }}
                  >
                    <i className="fas fa-info-circle text-xs mt-0.5 flex-shrink-0" style={{ color: '#fbbf24' }} />
                    <p className="text-xs" style={{ color: '#9ca3af' }}>
                      {isDeposit
                        ? 'Your request will be reviewed by our team. Balance is credited after approval.'
                        : 'Your request will be reviewed. Funds are sent after admin approval.'}
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
                    onClick={() => setStep('form')}
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
                {isDeposit && platformAccount && (
                  <div
                    className="w-full rounded-xl p-4 space-y-2 text-left"
                    style={{ background: 'rgba(74,222,128,0.06)', border: '1px solid rgba(74,222,128,0.2)' }}
                  >
                    <p className="text-xs font-bold mb-2" style={{ color: '#4ade80' }}>
                      <i className="fas fa-university mr-1.5" />
                      Transfer funds to this account
                    </p>
                    {[
                      ['Bank',         platformAccount.bankName],
                      ['Account Name', platformAccount.accountName],
                      ['Account No.',  platformAccount.accountNumber],
                      ['Routing No.',  platformAccount.routingNumber],
                      ['Reference',    submittedTxId],
                    ].map(([label, value]) => (
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
                )}

                {/* Withdrawal: show what happens next */}
                {!isDeposit && (
                  <div
                    className="w-full rounded-xl p-4 text-left"
                    style={{ background: 'rgba(167,139,250,0.06)', border: '1px solid rgba(167,139,250,0.2)' }}
                  >
                    <p className="text-xs font-bold mb-2" style={{ color: '#a78bfa' }}>
                      <i className="fas fa-info-circle mr-1.5" />
                      What happens next
                    </p>
                    <ul className="space-y-1.5">
                      {[
                        'Our team will review your withdrawal request',
                        'Funds will be sent to your registered bank account',
                        'You will be notified once processed',
                        'Processing time: 1–3 business days',
                      ].map(item => (
                        <li key={item} className="flex items-start gap-2">
                          <i className="fas fa-check text-xs mt-0.5 flex-shrink-0" style={{ color: '#a78bfa' }} />
                          <span className="text-xs" style={{ color: '#9ca3af' }}>{item}</span>
                        </li>
                      ))}
                    </ul>
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
