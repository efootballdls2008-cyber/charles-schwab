import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useAuth } from '../../hooks/useAuth'
import DashboardLayout from '../../components/dashboard/DashboardLayout'
import BalanceCard from '../../components/dashboard/BalanceCard'
import QuickActions, { DEFAULT_STOCK, DEFAULT_CRYPTO } from '../../components/dashboard/QuickActions'
import ProfitOverviewChart from '../../components/dashboard/ProfitOverviewChart'
import BalanceBreakdown from '../../components/dashboard/BalanceBreakdown'
import MarketOverviewTable from '../../components/dashboard/MarketOverviewTable'
import RecentActivity from '../../components/dashboard/RecentActivity'
import DepositWithdrawModal, { type ModalMode } from '../../components/dashboard/DepositWithdrawModal'
import BuyModal, { type BuyAsset } from '../../components/dashboard/BuyModal'

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

export default function Dashboard() {
  const { user, isAuthenticated } = useAuth()
  const navigate = useNavigate()
  const [modal, setModal] = useState<ModalMode | null>(null)
  const [buyAsset, setBuyAsset] = useState<BuyAsset | null>(null)

  useEffect(() => {
    if (!isAuthenticated) navigate('/login', { replace: true })
  }, [isAuthenticated, navigate])

  if (!isAuthenticated) return null

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
                Tablet:  Market | Recent Activity (2 cols), Breakdown below full-width
                Desktop: Market | Recent Activity | Balance Breakdown (3 cols)
            ─────────────────────────────────────────────────────────────── */}
            <motion.div
              className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 lg:gap-5"
              variants={rowVariants}
            >
              <MarketOverviewTable />
              <RecentActivity userId={user?.id} />
              {/* On tablet: spans full width. On xl: normal 1-col */}
              <div className="md:col-span-2 xl:col-span-1">
                <BalanceBreakdown />
              </div>
            </motion.div>

          </motion.div>
        </div>
      </main>
    </DashboardLayout>
  )
}
