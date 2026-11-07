import { useState, useEffect, useRef, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { buyAsset } from '../../services/holdingService'
import { useAuth } from '../../hooks/useAuth'
import { get } from '../../api/client'
import { useExchangeRate, convertFromUSD } from '../../hooks/useExchangeRate'

interface PlatformAccount {
  id: number
  accountName: string
  bankName: string
  accountNumber: string
  routingNumber: string
  paymentMethod: string
  walletAddress: string
  network: string
  status: string
}

export interface BuyAsset {
  type: 'stock' | 'crypto'
  symbol: string
  name: string
  color: string
  price: number
  change24h: number
}

interface BuyModalProps {
  asset: BuyAsset
  onClose: () => void
  onSuccess?: (newBalance: number) => void
}

const fmt = (n: number, currencySymbol = '$', decimals = 2) =>
  `${currencySymbol}${new Intl.NumberFormat('en-US', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(n)}`

export default function BuyModal({ asset, onClose, onSuccess }: BuyModalProps) {
  const { user } = useAuth()
  const sym = user?.currencySymbol ?? '$'
  const currencyCode = user?.currency ?? 'USD'

  // Live exchange rate: USD → user's currency
  const { rate, loading: rateLoading } = useExchangeRate(currencyCode)

  // All prices are stored in USD — convert to local currency for display only
  const localPrice   = convertFromUSD(asset.price, rate)
  const localBalance = convertFromUSD(user?.balance ?? 0, rate)

  const [step, setStep] = useState<'form' | 'confirm' | 'success'>('form')
  const [quantityStr, setQuantityStr] = useState('')
  const [localAmountStr, setLocalAmountStr] = useState('')  // user's currency input
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [platformAccount, setPlatformAccount] = useState<PlatformAccount | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const localAmountRef = useRef<HTMLInputElement>(null)

  const balance = user?.balance ?? 0
  const quantity = parseFloat(quantityStr) || 0
  // totalCost stays in USD for backend submission; localTotalCost is for display
  const totalCost      = quantity * asset.price
  const localTotalCost = convertFromUSD(totalCost, rate)
  const maxQty = balance / asset.price
  const isPositive = asset.change24h >= 0

  // Quick amounts in local currency (equivalent of $100, $500, $1000, $5000 USD)
  const QUICK_USD = [100, 500, 1000, 5000]

  // ── Sync: quantity → local amount (when user types in quantity field) ────────
  const handleQuantityChange = (val: string) => {
    setQuantityStr(val)
    setError('')
    const qty = parseFloat(val)
    if (!isNaN(qty) && qty > 0 && rate > 0) {
      const local = convertFromUSD(qty * asset.price, rate)
      setLocalAmountStr(local.toFixed(2))
    } else if (val === '' || val === '0') {
      setLocalAmountStr('')
    }
  }

  // ── Sync: local amount → quantity (when user types in local currency field) ──
  const handleLocalAmountChange = (val: string) => {
    setLocalAmountStr(val)
    setError('')
    const local = parseFloat(val)
    if (!isNaN(local) && local > 0 && rate > 0 && asset.price > 0) {
      const usdAmount = local / rate
      const qty = usdAmount / asset.price
      setQuantityStr(qty.toFixed(asset.type === 'crypto' ? 6 : 4))
    } else if (val === '' || val === '0') {
      setQuantityStr('')
    }
  }

  // ── Quick buy: set both fields from a USD preset ─────────────────────────────
  const handleQuickBuy = (usdAmount: number) => {
    const qty = usdAmount / asset.price
    const local = convertFromUSD(usdAmount, rate)
    setQuantityStr(qty.toFixed(asset.type === 'crypto' ? 6 : 4))
    setLocalAmountStr(local.toFixed(2))
    setError('')
  }

  // Fetch the platform account assigned for this asset type
  const loadPlatformAccount = useCallback(async () => {
    try {
      const context = asset.type === 'crypto' ? 'buy_crypto' : 'buy_stock'
      const accounts = await get<PlatformAccount[]>(`/platformAccounts?context=${context}`)
      const active = accounts.find(a => a.status === 'active')
      if (active) setPlatformAccount(active)
    } catch { /* silent */ }
  }, [asset.type])

  useEffect(() => {
    setTimeout(() => inputRef.current?.focus(), 100)
    loadPlatformAccount()
  }, [loadPlatformAccount])

  const quantityError = (() => {
    if (quantity <= 0) return ''
    if (totalCost > balance) return 'Insufficient balance'
    if (totalCost < 1) return `Minimum order is ${sym}${convertFromUSD(1, rate).toFixed(2)}`
    return ''
  })()

  const canProceed = quantity > 0 && !quantityError

  async function handleConfirm() {
    if (!user?.id) return
    setLoading(true)
    setError('')
    try {
      const result = await buyAsset(
        user.id,
        asset.type,
        asset.symbol,
        asset.name,
        asset.color,
        quantity,
        asset.price
      )
      // Balance stays the same until admin approves
      onSuccess?.(result.newBalance)
      setStep('success')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Purchase failed. Please try again.')
      setStep('form')
    } finally {
      setLoading(false)
    }
  }

  const accentColor = asset.type === 'crypto' ? '#f59e0b' : '#60a5fa'
  const accentBg    = asset.type === 'crypto' ? 'rgba(245,158,11,0.12)' : 'rgba(96,165,250,0.12)'
  const accentBorder = asset.type === 'crypto' ? 'rgba(245,158,11,0.3)' : 'rgba(96,165,250,0.3)'
  const gradientBtn = asset.type === 'crypto'
    ? 'linear-gradient(135deg, #d97706, #f59e0b)'
    : 'linear-gradient(135deg, #2563eb, #60a5fa)'

  return (
    <AnimatePresence>
      {/* Backdrop */}
      <motion.div
        className="fixed inset-0 z-50 flex items-center justify-center p-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        style={{ background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(4px)' }}
      >
        {/* Panel */}
        <motion.div
          className="relative w-full max-w-md rounded-2xl overflow-hidden"
          initial={{ opacity: 0, scale: 0.94, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.94, y: 20 }}
          transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
          onClick={(e) => e.stopPropagation()}
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

          {/* ── Header ── */}
          <div className="flex items-center justify-between px-6 pt-6 pb-4">
            <div className="flex items-center gap-3">
              {/* Asset icon */}
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center font-bold text-sm flex-shrink-0"
                style={{ background: accentBg, border: `1px solid ${accentBorder}`, color: accentColor }}
              >
                {asset.symbol.slice(0, 2)}
              </div>
              <div>
                <h2 className="text-base font-bold text-white">
                  Buy {asset.name}
                </h2>
                <div className="flex items-center gap-2 mt-0.5">
                  <span className="text-xs font-mono" style={{ color: '#9ca3af' }}>{asset.symbol}</span>
                  <span
                    className="text-xs font-semibold"
                    style={{ color: isPositive ? '#4ade80' : '#f87171' }}
                  >
                    {isPositive ? '+' : ''}{asset.change24h.toFixed(2)}%
                  </span>
                </div>
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

          {/* ── Body ── */}
          <div className="px-6 py-5">

            {/* ── STEP: FORM ── */}
            {step === 'form' && (
              <div className="space-y-5">

                {/* Price + balance row */}
                <div className="grid grid-cols-2 gap-3">
                  <div
                    className="rounded-xl px-4 py-3"
                    style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)' }}
                  >
                    <p className="text-xs mb-1" style={{ color: '#9ca3af' }}>Current Price</p>
                    <p className="text-sm font-bold text-white">
                      {rateLoading ? '…' : fmt(localPrice, sym)}
                    </p>
                    {currencyCode !== 'USD' && (
                      <p className="text-xs mt-0.5" style={{ color: '#4b5563' }}>
                        ${asset.price.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} USD
                      </p>
                    )}
                  </div>
                  <div
                    className="rounded-xl px-4 py-3"
                    style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)' }}
                  >
                    <p className="text-xs mb-1" style={{ color: '#9ca3af' }}>Available</p>
                    <p className="text-sm font-bold text-white">
                      {rateLoading ? '…' : fmt(localBalance, sym, 0)}
                    </p>
                  </div>
                </div>

                {/* Quantity + Local Amount dual inputs */}
                <div className="space-y-3">
                  {/* Row label */}
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-medium" style={{ color: '#9ca3af' }}>
                      Enter amount to buy
                    </span>
                    <button
                      onClick={() => {
                        const maxLocal = convertFromUSD(maxQty * asset.price, rate)
                        setQuantityStr(maxQty.toFixed(asset.type === 'crypto' ? 6 : 4))
                        setLocalAmountStr(maxLocal.toFixed(2))
                      }}
                      className="text-xs font-semibold px-2 py-0.5 rounded-md transition-all hover:opacity-80"
                      style={{ background: accentBg, color: accentColor, border: `1px solid ${accentBorder}` }}
                    >
                      Max
                    </button>
                  </div>

                  {/* Local currency amount input */}
                  <div>
                    <label className="block text-xs mb-1.5" style={{ color: '#6b7280' }}>
                      Amount ({currencyCode})
                    </label>
                    <div className="relative">
                      <span
                        className="absolute left-4 top-1/2 -translate-y-1/2 text-base font-bold select-none"
                        style={{ color: '#6b7280' }}
                      >
                        {sym}
                      </span>
                      <input
                        ref={localAmountRef}
                        type="number"
                        min="0"
                        step="0.01"
                        placeholder="0.00"
                        value={localAmountStr}
                        onChange={(e) => handleLocalAmountChange(e.target.value)}
                        className="w-full pl-8 pr-4 py-3 rounded-xl text-lg font-bold text-white outline-none transition-all"
                        style={{
                          background: 'rgba(255,255,255,0.05)',
                          border: `1px solid ${quantityError ? '#f87171' : accentBorder}`,
                        }}
                      />
                    </div>
                  </div>

                  {/* Divider with swap icon */}
                  <div className="flex items-center gap-3">
                    <div className="flex-1 h-px" style={{ background: 'rgba(255,255,255,0.07)' }} />
                    <div
                      className="w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0"
                      style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)' }}
                    >
                      <i className="fas fa-arrows-up-down text-xs" style={{ color: '#6b7280' }} />
                    </div>
                    <div className="flex-1 h-px" style={{ background: 'rgba(255,255,255,0.07)' }} />
                  </div>

                  {/* Quantity input */}
                  <div>
                    <label className="block text-xs mb-1.5" style={{ color: '#6b7280' }}>
                      Quantity ({asset.symbol})
                    </label>
                    <input
                      ref={inputRef}
                      type="number"
                      min="0"
                      step={asset.type === 'crypto' ? '0.000001' : '0.0001'}
                      placeholder={asset.type === 'crypto' ? '0.000000' : '0.0000'}
                      value={quantityStr}
                      onChange={(e) => handleQuantityChange(e.target.value)}
                      className="w-full px-4 py-3 rounded-xl text-lg font-bold text-white outline-none transition-all"
                      style={{
                        background: 'rgba(255,255,255,0.05)',
                        border: `1px solid ${quantityError ? '#f87171' : 'rgba(255,255,255,0.1)'}`,
                      }}
                    />
                  </div>

                  {quantityError && (
                    <p className="text-xs" style={{ color: '#f87171' }}>
                      <i className="fas fa-exclamation-circle mr-1" />
                      {quantityError}
                    </p>
                  )}
                </div>

                {/* Quick amounts */}
                <div>
                  <p className="text-xs mb-2" style={{ color: '#6b7280' }}>
                    Quick buy ({currencyCode})
                  </p>
                  <div className="flex gap-2">
                    {QUICK_USD.map((usd) => {
                      const localAmt = convertFromUSD(usd, rate)
                      const active = Math.abs(quantity * asset.price - usd) < 0.01
                      return (
                        <button
                          key={usd}
                          onClick={() => handleQuickBuy(usd)}
                          className="flex-1 py-1.5 rounded-lg text-xs font-semibold transition-all hover:opacity-90"
                          style={{
                            background: active ? accentBg : 'rgba(255,255,255,0.05)',
                            color: active ? accentColor : '#9ca3af',
                            border: `1px solid ${active ? accentBorder : 'rgba(255,255,255,0.08)'}`,
                          }}
                        >
                          {sym}{localAmt >= 1000 ? `${(localAmt / 1000).toFixed(0)}k` : localAmt.toFixed(0)}
                        </button>
                      )
                    })}
                  </div>
                </div>

                {/* Total cost preview */}
                {quantity > 0 && (
                  <motion.div
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="rounded-xl px-4 py-3 flex items-center justify-between"
                    style={{ background: accentBg, border: `1px solid ${accentBorder}` }}
                  >
                    <span className="text-xs" style={{ color: '#9ca3af' }}>Total Cost</span>
                    <div className="text-right">
                      <span className="text-base font-bold" style={{ color: accentColor }}>
                        {fmt(localTotalCost, sym)}
                      </span>
                      {currencyCode !== 'USD' && (
                        <p className="text-xs" style={{ color: '#4b5563' }}>
                          ${totalCost.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} USD
                        </p>
                      )}
                    </div>
                  </motion.div>
                )}

                {/* Error */}
                {error && (
                  <p className="text-xs px-3 py-2 rounded-lg" style={{ background: 'rgba(248,113,113,0.1)', color: '#f87171', border: '1px solid rgba(248,113,113,0.2)' }}>
                    <i className="fas fa-exclamation-triangle mr-1.5" />
                    {error}
                  </p>
                )}

                {/* CTA */}
                <button
                  onClick={() => setStep('confirm')}
                  disabled={!canProceed}
                  className="w-full py-3.5 rounded-xl text-sm font-bold transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                  style={{
                    background: canProceed ? gradientBtn : 'rgba(255,255,255,0.08)',
                    color: canProceed ? '#fff' : '#6b7280',
                  }}
                >
                  Review Order →
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
                    Order Summary
                  </p>

                  {[
                    { label: 'Asset',       value: `${asset.name} (${asset.symbol})` },
                    { label: 'Type',        value: asset.type === 'crypto' ? 'Cryptocurrency' : 'Stock' },
                    { label: 'Quantity',    value: `${quantity} ${asset.symbol}` },
                    { label: 'Price',       value: fmt(localPrice, sym) },
                    { label: 'Total Cost',  value: fmt(localTotalCost, sym), highlight: true },
                    { label: 'New Balance', value: fmt(convertFromUSD(balance - totalCost, rate), sym), highlight: true },
                  ].map((row) => (
                    <div key={row.label} className="flex items-center justify-between">
                      <span className="text-xs" style={{ color: '#9ca3af' }}>{row.label}</span>
                      <span
                        className="text-sm font-semibold"
                        style={{ color: row.highlight ? accentColor : '#fff' }}
                      >
                        {row.value}
                      </span>
                    </div>
                  ))}
                </div>

                {error && (
                  <p className="text-xs px-3 py-2 rounded-lg" style={{ background: 'rgba(248,113,113,0.1)', color: '#f87171', border: '1px solid rgba(248,113,113,0.2)' }}>
                    <i className="fas fa-exclamation-triangle mr-1.5" />
                    {error}
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
                      `Confirm Buy`
                    )}
                  </button>
                </div>
              </div>
            )}

            {/* ── STEP: SUCCESS ── */}
            {step === 'success' && (
              <div className="flex flex-col items-center text-center py-4 space-y-4">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                  className="w-16 h-16 rounded-full flex items-center justify-center"
                  style={{ background: accentBg, border: `2px solid ${accentColor}` }}
                >
                  <i className="fas fa-clock text-2xl" style={{ color: accentColor }} />
                </motion.div>

                <div>
                  <h3 className="text-lg font-bold text-white mb-1">Order Submitted!</h3>
                  <p className="text-sm" style={{ color: '#9ca3af' }}>
                    Your order for{' '}
                    <span className="font-semibold text-white">{quantity} {asset.symbol}</span>{' '}
                    worth{' '}
                    <span className="font-semibold" style={{ color: accentColor }}>{fmt(localTotalCost, sym)}</span>{' '}
                    is pending admin approval.
                  </p>
                </div>

                {/* Pending notice */}
                <div
                  className="w-full px-4 py-3 rounded-xl flex items-start gap-3"
                  style={{ background: 'rgba(251,191,36,0.08)', border: '1px solid rgba(251,191,36,0.2)' }}
                >
                  <i className="fas fa-info-circle text-sm mt-0.5 flex-shrink-0" style={{ color: '#fbbf24' }} />
                  <div className="text-left">
                    <p className="text-xs font-semibold" style={{ color: '#fbbf24' }}>Awaiting Approval</p>
                    <p className="text-xs mt-0.5" style={{ color: '#9ca3af' }}>
                      Your balance will be deducted and the asset added to your portfolio once an admin approves this order. You can track it in Transactions.
                    </p>
                  </div>
                </div>

                {/* Payment destination for this asset type */}
                {platformAccount ? (
                  <div
                    className="w-full rounded-xl p-4 space-y-2 text-left"
                    style={{ background: accentBg, border: `1px solid ${accentBorder}` }}
                  >
                    <p className="text-xs font-bold mb-2" style={{ color: accentColor }}>
                      <i className={`fas ${platformAccount.paymentMethod === 'crypto' ? 'fa-coins' : 'fa-university'} mr-1.5`} />
                      {asset.type === 'crypto' ? 'Send payment to' : 'Payment account'}
                    </p>
                    {(platformAccount.paymentMethod === 'crypto'
                      ? [
                          ['Network',        platformAccount.network],
                          ['Wallet Address', platformAccount.walletAddress],
                        ]
                      : [
                          ['Bank',         platformAccount.bankName],
                          ['Account Name', platformAccount.accountName],
                          ['Account No.',  platformAccount.accountNumber],
                          ['Routing No.',  platformAccount.routingNumber],
                        ]
                    ).map(([label, value]) => value ? (
                      <div key={label} className="flex items-center justify-between">
                        <span className="text-xs" style={{ color: '#9ca3af' }}>{label}</span>
                        <span className="text-xs font-mono font-semibold text-white">{value}</span>
                      </div>
                    ) : null)}
                  </div>
                ) : (
                  <div
                    className="w-full rounded-xl p-3 flex items-start gap-2 text-left"
                    style={{ background: 'rgba(107,114,128,0.08)', border: '1px solid rgba(107,114,128,0.2)' }}
                  >
                    <i className="fas fa-info-circle text-xs mt-0.5 flex-shrink-0" style={{ color: '#6b7280' }} />
                    <p className="text-xs" style={{ color: '#6b7280' }}>
                      Payment instructions will be provided by support. Contact us if you need assistance.
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
