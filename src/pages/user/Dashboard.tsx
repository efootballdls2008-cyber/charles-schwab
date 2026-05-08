import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useAuth } from '../../hooks/useAuth'
import DashboardLayout from '../../components/dashboard/DashboardLayout'
import BalanceCard from '../../components/dashboard/BalanceCard'
import QuickActions, { DEFAULT_STOCK, DEFAULT_CRYPTO } from '../../components/dashboard/QuickActions'
import ProfitOverviewChart from '../../components/dashboard/ProfitOverviewChart'
import AlgoBotPanel from '../../components/dashboard/AlgoBotPanel'
import MarketOverviewTable from '../../components/dashboard/MarketOverviewTable'
import RecentActivity from '../../components/dashboard/RecentActivity'
import DepositWithdrawModal, { type ModalMode } from '../../components/dashboard/DepositWithdrawModal'
import BuyModal, { type BuyAsset } from '../../components/dashboard/BuyModal'
import { useAlgorithmEngine, type AlgoState, type StrategyName, type RiskLevel } from '../../hooks/useAlgorithmEngine'
import { useLiveTicker } from '../../hooks/useLiveTicker'

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.07, delayChildren: 0.1 },
  },
}

const rowVariants = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.45, ease: [0.22, 1, 0.36, 1] } },
}

// ─── Bot Settings Modal ───────────────────────────────────────────────────────

interface SelectFieldProps {
  label: string
  value: string
  onChange: (v: string) => void
  options: string[]
}

function SelectField({ label, value, onChange, options }: SelectFieldProps) {
  return (
    <div>
      <label className="text-xs mb-1.5 block" style={{ color: '#9ca3af' }}>{label}</label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full px-3 py-2.5 rounded-xl text-sm font-medium text-white outline-none transition-all"
        style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(139,92,246,0.25)' }}
      >
        {options.map((opt) => (
          <option key={opt} value={opt} style={{ background: '#0d0b24' }}>{opt}</option>
        ))}
      </select>
    </div>
  )
}

function BotSettingsModal({
  open,
  onClose,
  algoState,
  onSave,
}: {
  open: boolean
  onClose: () => void
  algoState: AlgoState
  onSave: (updates: Partial<AlgoState>) => void
}) {
  const [local, setLocal] = useState<AlgoState>(algoState)
  const [saved, setSaved] = useState(false)

  // Sync when modal opens
  useEffect(() => { if (open) setLocal(algoState) }, [open, algoState])

  const set = <K extends keyof AlgoState>(key: K, value: AlgoState[K]) =>
    setLocal((prev) => ({ ...prev, [key]: value }))

  const handleSave = () => {
    onSave(local)
    setSaved(true)
    setTimeout(() => { setSaved(false); onClose() }, 1200)
  }

  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [onClose])

  const riskPct = local.riskLevel === 'Conservative' ? 30 : local.riskLevel === 'Moderate' ? 70 : 90

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            className="fixed inset-0 z-50"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={onClose}
            style={{ background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(6px)' }}
          />
          <motion.div className="fixed z-50 inset-0 flex items-center justify-center p-4 pointer-events-none">
            <motion.div
              className="w-full max-w-sm pointer-events-auto flex flex-col rounded-2xl overflow-hidden"
              style={{
                background: 'linear-gradient(160deg, #0f0c2a 0%, #0d0b24 100%)',
                border: '1px solid rgba(139,92,246,0.3)',
                boxShadow: '0 0 60px rgba(139,92,246,0.15), 0 24px 48px rgba(0,0,0,0.6)',
                maxHeight: '90vh',
              }}
              initial={{ opacity: 0, scale: 0.92, y: 24 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.92, y: 24 }}
              transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="flex items-center justify-between px-5 py-4 flex-shrink-0" style={{ borderBottom: '1px solid rgba(139,92,246,0.15)' }}>
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ background: 'rgba(139,92,246,0.2)', border: '1px solid rgba(139,92,246,0.3)' }}>
                    <i className="fas fa-robot text-sm" style={{ color: '#a78bfa' }} />
                  </div>
                  <span className="text-base font-bold text-white">Algorithm Settings</span>
                </div>
                <div className="flex items-center gap-3">
                  {algoState.running && (
                    <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full" style={{ background: 'rgba(74,222,128,0.1)', border: '1px solid rgba(74,222,128,0.2)' }}>
                      <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: '#4ade80' }} />
                      <span className="text-xs font-semibold" style={{ color: '#4ade80' }}>Running</span>
                    </div>
                  )}
                  <button onClick={onClose} className="w-7 h-7 rounded-lg flex items-center justify-center hover:bg-white/10" style={{ color: '#6b7280' }}>
                    <i className="fas fa-times text-sm" />
                  </button>
                </div>
              </div>

              {/* Body */}
              <div className="overflow-y-auto flex-1 px-5 py-4 space-y-4">

                {/* Strategy */}
                <SelectField
                  label="Strategy"
                  value={local.strategy}
                  onChange={(v) => set('strategy', v as StrategyName)}
                  options={['AI Scalper Pro', 'Trend Follower', 'Mean Reversion', 'Grid Bot', 'DCA Strategy']}
                />

                {/* Strategy description */}
                <div className="rounded-xl p-3" style={{ background: 'rgba(139,92,246,0.06)', border: '1px solid rgba(139,92,246,0.15)' }}>
                  <p className="text-xs leading-relaxed" style={{ color: '#9ca3af' }}>
                    {local.strategy === 'AI Scalper Pro' && 'Combines RSI, MACD crossover, and EMA alignment for high-frequency scalping with tight risk controls.'}
                    {local.strategy === 'Trend Follower' && 'Rides strong directional trends using EMA9/EMA21 crossovers and MACD momentum confirmation.'}
                    {local.strategy === 'Mean Reversion' && 'Buys oversold dips and sells overbought peaks using Bollinger Bands and RSI divergence.'}
                    {local.strategy === 'Grid Bot' && 'Places buy/sell orders at fixed price intervals within Bollinger Band range for range-bound markets.'}
                    {local.strategy === 'DCA Strategy' && 'Dollar-cost averages into positions on dips and takes profit on significant price recoveries.'}
                  </p>
                </div>

                {/* Risk Level */}
                <div>
                  <label className="text-xs mb-1.5 block" style={{ color: '#9ca3af' }}>Risk Level</label>
                  <div className="grid grid-cols-3 gap-2">
                    {(['Conservative', 'Moderate', 'Aggressive'] as RiskLevel[]).map((r) => (
                      <button
                        key={r}
                        onClick={() => set('riskLevel', r)}
                        className="py-2 rounded-xl text-xs font-semibold transition-all"
                        style={local.riskLevel === r
                          ? { background: r === 'Conservative' ? 'rgba(74,222,128,0.2)' : r === 'Moderate' ? 'rgba(245,158,11,0.2)' : 'rgba(248,113,113,0.2)', color: r === 'Conservative' ? '#4ade80' : r === 'Moderate' ? '#f59e0b' : '#f87171', border: `1px solid ${r === 'Conservative' ? 'rgba(74,222,128,0.4)' : r === 'Moderate' ? 'rgba(245,158,11,0.4)' : 'rgba(248,113,113,0.4)'}` }
                          : { background: 'rgba(255,255,255,0.04)', color: '#6b7280', border: '1px solid rgba(255,255,255,0.08)' }
                        }
                      >
                        {r}
                      </button>
                    ))}
                  </div>
                  {/* Risk indicator bar */}
                  <div className="mt-2.5 w-full h-1.5 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.06)' }}>
                    <motion.div
                      className="h-full rounded-full"
                      style={{ background: local.riskLevel === 'Conservative' ? '#4ade80' : local.riskLevel === 'Moderate' ? '#f59e0b' : '#f87171' }}
                      initial={{ width: 0 }}
                      animate={{ width: `${riskPct}%` }}
                      transition={{ duration: 0.5 }}
                    />
                  </div>
                </div>

                {/* Timeframe */}
                <SelectField
                  label="Timeframe"
                  value={local.timeframe}
                  onChange={(v) => set('timeframe', v)}
                  options={['1m', '5m', '15m', '1h', '4h']}
                />

                {/* Pair */}
                <SelectField
                  label="Trading Pair"
                  value={local.pair}
                  onChange={(v) => set('pair', v)}
                  options={['BTC/USDT', 'ETH/USDT', 'SOL/USDT', 'BNB/USDT']}
                />

              </div>

              {/* Footer */}
              <div className="flex-shrink-0 px-5 py-4 flex gap-3" style={{ borderTop: '1px solid rgba(139,92,246,0.15)' }}>
                <motion.button
                  onClick={onClose}
                  className="flex-1 py-2.5 rounded-xl text-sm font-semibold"
                  style={{ background: 'rgba(255,255,255,0.06)', color: '#9ca3af', border: '1px solid rgba(255,255,255,0.08)' }}
                  whileHover={{ background: 'rgba(255,255,255,0.1)' }}
                  whileTap={{ scale: 0.97 }}
                >
                  Cancel
                </motion.button>
                <motion.button
                  onClick={handleSave}
                  className="flex-1 py-2.5 rounded-xl text-sm font-bold flex items-center justify-center gap-2"
                  style={{
                    background: saved ? 'rgba(74,222,128,0.2)' : 'linear-gradient(135deg, rgba(139,92,246,0.4), rgba(99,102,241,0.4))',
                    color: saved ? '#4ade80' : '#c4b5fd',
                    border: `1px solid ${saved ? 'rgba(74,222,128,0.4)' : 'rgba(139,92,246,0.5)'}`,
                  }}
                  whileHover={{ background: saved ? undefined : 'linear-gradient(135deg, rgba(139,92,246,0.5), rgba(99,102,241,0.5))' }}
                  whileTap={{ scale: 0.97 }}
                  disabled={saved}
                >
                  {saved ? (
                    <>
                      <i className="fas fa-check-circle" />
                      Saved!
                    </>
                  ) : (
                    <>
                      <i className="fas fa-save" />
                      Save Settings
                    </>
                  )}
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}

export default function Dashboard() {
  const { user } = useAuth()
  const [modal, setModal] = useState<ModalMode | null>(null)
  const [buyAsset, setBuyAsset] = useState<BuyAsset | null>(null)
  const [botSettingsOpen, setBotSettingsOpen] = useState(false)

  // Default to BTC for the bot
  const BASE = 'BTC'
  const ticker = useLiveTicker(BASE)
  const midPrice = ticker?.price || 0

  // Algorithm engine
  const algoEngine = useAlgorithmEngine(
    midPrice,
    user?.id || 0,
    user?.balance || 0
  )

  return (
    <DashboardLayout>
      {/* Deposit / Withdraw modal */}
      {modal && (
        <DepositWithdrawModal
          mode={modal}
          onClose={() => setModal(null)}
        />
      )}
      {/* Buy Stock / Crypto modal */}
      {buyAsset && (
        <BuyModal
          asset={buyAsset}
          onClose={() => setBuyAsset(null)}
        />
      )}
      <main
        className="flex-1 overflow-y-auto"
        style={{ backgroundColor: '#0a0720' }}
      >
        <div className="px-4 py-4 sm:px-5 sm:py-5 lg:px-6 lg:py-6">
          <motion.div
            className="max-w-[1400px] mx-auto space-y-4 lg:space-y-5"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >

            {/* ── Row 1 ──────────────────────────────────────────────────────
                Mobile:  single column stack
                Tablet:  Balance+QuickActions left | ProfitOverview right (2 cols)
                Desktop: same 2-col but wider profit chart
            ─────────────────────────────────────────────────────────────── */}
            <motion.div
              className="grid grid-cols-1 md:grid-cols-3 xl:grid-cols-3 gap-4 lg:gap-5"
              variants={rowVariants}
            >
              {/* Left: Balance Card + Deposit/Withdraw + Quick Actions */}
              <div className="flex flex-col gap-4 md:col-span-1">
                {/* At 780–844px: split BalanceCard (50%) and actions (50%) side by side */}
                <div className="flex flex-col md:flex-row md2:flex-col gap-4">
                  {/* BalanceCard — full width normally, 50% at 780–844px */}
                  <div className="md:w-1/2 md2:w-full">
                    <BalanceCard user={user} />
                  </div>

                  {/* Deposit/Withdraw + QuickActions — full width normally, 50% at 780–844px */}
                  <div className="flex flex-col gap-4 md:w-1/2 md2:w-full">
                    {/* Deposit / Withdraw — lives outside the card */}
                    <div className="flex gap-3">
                      <motion.button
                        onClick={() => setModal('deposit')}
                        className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold"
                        style={{ background: '#16a34a', color: '#fff' }}
                        whileHover={{ scale: 1.03 }}
                        whileTap={{ scale: 0.97 }}
                        transition={{ duration: 0.15 }}
                      >
                        <i className="fas fa-arrow-down text-xs" />
                        Deposit
                      </motion.button>
                      <motion.button
                        onClick={() => setModal('withdraw')}
                        className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold"
                        style={{
                          background: 'rgba(139,92,246,0.3)',
                          color: '#c4b5fd',
                          border: '1px solid rgba(139,92,246,0.4)',
                        }}
                        whileHover={{ scale: 1.03, background: 'rgba(139,92,246,0.5)' }}
                        whileTap={{ scale: 0.97 }}
                        transition={{ duration: 0.15 }}
                      >
                        <i className="fas fa-arrow-up text-xs" />
                        Withdraw
                      </motion.button>
                    </div>

                    <QuickActions
                      onBuyStock={() => setBuyAsset(DEFAULT_STOCK)}
                      onBuyCrypto={() => setBuyAsset(DEFAULT_CRYPTO)}
                    />
                  </div>
                </div>
              </div>

              {/* Right: Profit Overview — spans 2 cols on md+ */}
              <div className="md:col-span-2">
                <ProfitOverviewChart />
              </div>
            </motion.div>

            {/* ── Row 2 ──────────────────────────────────────────────────────
                Mobile:  single column stack
                Tablet:  Market | Recent Activity (2 cols), Bot AI below full-width
                Desktop: Market | Recent Activity | Bot AI Trade (3 cols)
            ─────────────────────────────────────────────────────────────── */}
            <motion.div
              className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 lg:gap-5"
              variants={rowVariants}
            >
              {/* On tablet: spans full width. On xl: normal 1-col — AlgoBot first */}
              <div className="md:col-span-2 xl:col-span-1">
                <div
                  className="rounded-2xl overflow-hidden"
                  style={{
                    background: 'rgba(13,8,36,0.95)',
                    border: '1px solid rgba(255,255,255,0.08)',
                    minHeight: '340px',
                  }}
                >
                  <AlgoBotPanel
                    base={BASE}
                    midPrice={midPrice}
                    state={algoEngine.state}
                    signal={algoEngine.signal}
                    trades={algoEngine.trades}
                    performance={algoEngine.performance}
                    scanStatus={algoEngine.scanStatus}
                    elapsed={algoEngine.elapsed}
                    openTrade={algoEngine.openTrade}
                    onStart={algoEngine.start}
                    onStop={algoEngine.stop}
                    onOpenSettings={() => setBotSettingsOpen(true)}
                  />
                </div>
              </div>
              <MarketOverviewTable />
              <RecentActivity userId={user?.id} />
            </motion.div>

          </motion.div>
        </div>
      </main>

      {/* Bot Settings Modal */}
      <BotSettingsModal
        open={botSettingsOpen}
        onClose={() => setBotSettingsOpen(false)}
        algoState={algoEngine.state}
        onSave={algoEngine.updateSettings}
      />
    </DashboardLayout>
  )
}
