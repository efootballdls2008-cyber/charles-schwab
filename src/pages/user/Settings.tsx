import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth'
import DashboardSidebar from '../../components/dashboard/DashboardSidebar'
import DashboardHeader from '../../components/dashboard/DashboardHeader'
import { patch } from '../../api/client'

type SettingsTab = 'security' | 'banking'

function Toggle({ value, onChange }: { value: boolean; onChange: () => void }) {
  return (
    <div
      className="w-11 h-6 rounded-full flex items-center px-0.5 cursor-pointer transition-all flex-shrink-0"
      style={{ background: value ? '#4ade80' : 'rgba(255,255,255,0.1)' }}
      onClick={onChange}
    >
      <div
        className="w-5 h-5 rounded-full bg-white shadow transition-transform"
        style={{ transform: value ? 'translateX(20px)' : 'translateX(0)' }}
      />
    </div>
  )
}

function BankField({ label, value, onChange, placeholder }: {
  label: string; value: string; onChange: (v: string) => void; placeholder: string
}) {
  return (
    <div>
      <label className="block text-xs font-medium mb-1.5" style={{ color: '#9ca3af' }}>{label}</label>
      <input
        type="text"
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full px-4 py-2.5 rounded-xl text-sm text-white outline-none transition-all"
        style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }}
      />
    </div>
  )
}

export default function Settings() {
  const { isAuthenticated, user, updateUser } = useAuth()
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState<SettingsTab>('security')

  // ── Security state ──
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(true)
  const [smsAuthEnabled, setSmsAuthEnabled] = useState(false)
  const [emailAuthEnabled, setEmailAuthEnabled] = useState(true)
  const [identityVerificationEnabled, setIdentityVerificationEnabled] = useState(true)
  const [antiPhishingEnabled, setAntiPhishingEnabled] = useState(true)
  const [withdrawalWhitelistEnabled, setWithdrawalWhitelistEnabled] = useState(false)

  // ── Banking state — deposit account (where user sends FROM) ──
  const [depositBankName, setDepositBankName] = useState('')
  const [depositAccountName, setDepositAccountName] = useState('')
  const [depositAccountNumber, setDepositAccountNumber] = useState('')
  const [depositRoutingNumber, setDepositRoutingNumber] = useState('')
  const [depositAccountType, setDepositAccountType] = useState('')

  // ── Banking state — withdrawal account (where we send TO) ──
  const [withdrawBankName, setWithdrawBankName] = useState('')
  const [withdrawAccountName, setWithdrawAccountName] = useState('')
  const [withdrawAccountNumber, setWithdrawAccountNumber] = useState('')
  const [withdrawRoutingNumber, setWithdrawRoutingNumber] = useState('')
  const [withdrawAccountType, setWithdrawAccountType] = useState('')
  const [withdrawSwiftCode, setWithdrawSwiftCode] = useState('')

  const [bankingSaving, setBankingSaving] = useState(false)
  const [bankingToast, setBankingToast] = useState<'saved' | 'error' | null>(null)

  useEffect(() => {
    if (!isAuthenticated) navigate('/login', { replace: true })
  }, [isAuthenticated, navigate])

  // Sync banking fields when user object loads
  useEffect(() => {
    if (!user) return
    setDepositBankName(user.depositBankName ?? '')
    setDepositAccountName(user.depositAccountName ?? '')
    setDepositAccountNumber(user.depositAccountNumber ?? '')
    setDepositRoutingNumber(user.depositRoutingNumber ?? '')
    setDepositAccountType(user.depositAccountType ?? '')
    setWithdrawBankName(user.withdrawBankName ?? '')
    setWithdrawAccountName(user.withdrawAccountName ?? '')
    setWithdrawAccountNumber(user.withdrawAccountNumber ?? '')
    setWithdrawRoutingNumber(user.withdrawRoutingNumber ?? '')
    setWithdrawAccountType(user.withdrawAccountType ?? '')
    setWithdrawSwiftCode(user.withdrawSwiftCode ?? '')
  }, [user])

  if (!isAuthenticated) return null

  async function handleSaveBanking() {
    if (!user?.id) return
    setBankingSaving(true)
    try {
      const fields = {
        depositBankName, depositAccountName, depositAccountNumber,
        depositRoutingNumber, depositAccountType,
        withdrawBankName, withdrawAccountName, withdrawAccountNumber,
        withdrawRoutingNumber, withdrawAccountType, withdrawSwiftCode,
      }
      await patch(`/users/${user.id}`, fields)
      updateUser(fields as Parameters<typeof updateUser>[0])
      setBankingToast('saved')
    } catch {
      setBankingToast('error')
    } finally {
      setBankingSaving(false)
      setTimeout(() => setBankingToast(null), 3000)
    }
  }

  return (
    <div className="flex h-screen overflow-hidden" style={{ backgroundColor: '#0d0824' }}>
      <DashboardSidebar open={false} onClose={() => {}} />

      <div className="flex-1 flex flex-col overflow-hidden">
        <DashboardHeader onMenuClick={() => {}} />

        <main className="flex-1 overflow-y-auto p-6" style={{ backgroundColor: '#110b2d' }}>

          {/* Page heading */}
          <div className="mb-5">
            <h2 className="text-xl font-bold text-white">Settings</h2>
            <p className="text-sm text-gray-400 mt-1">Manage your account security and banking information</p>
          </div>

          {/* Tab switcher */}
          <div
            className="flex items-center gap-1 mb-6 p-1 rounded-xl w-fit"
            style={{ background: 'rgba(22,15,53,0.9)', border: '1px solid rgba(255,255,255,0.08)' }}
          >
            {([
              { key: 'security', label: 'Security', icon: 'fas fa-shield-alt' },
              { key: 'banking',  label: 'Banking',  icon: 'fas fa-university' },
            ] as { key: SettingsTab; label: string; icon: string }[]).map(t => (
              <button
                key={t.key}
                onClick={() => setActiveTab(t.key)}
                className="flex items-center gap-2 px-5 py-2 rounded-lg text-sm font-semibold transition-all"
                style={activeTab === t.key
                  ? { background: 'linear-gradient(135deg,#a28539,#c9a84c)', color: '#0d0824' }
                  : { color: '#9ca3af' }
                }
              >
                <i className={`${t.icon} text-xs`} />
                {t.label}
              </button>
            ))}
          </div>

          {/* ── SECURITY TAB ── */}
          {activeTab === 'security' && (
            <>
              {/* Status badges */}
              <div className="flex flex-wrap gap-3 mb-8">
                {[
                  { label: '2FA',                  color: '#ef4444', bg: 'rgba(239,68,68,0.1)',   border: 'rgba(239,68,68,0.3)',   icon: 'fa-times-circle'       },
                  { label: 'Identity Verification', color: '#fb923c', bg: 'rgba(251,146,60,0.1)',  border: 'rgba(251,146,60,0.3)',  icon: 'fa-exclamation-circle' },
                  { label: 'Anti-phishing Code',    color: '#4ade80', bg: 'rgba(74,222,128,0.1)',  border: 'rgba(74,222,128,0.3)',  icon: 'fa-check-circle'       },
                  { label: 'Withdrawal Whitelist',  color: '#ef4444', bg: 'rgba(239,68,68,0.1)',   border: 'rgba(239,68,68,0.3)',   icon: 'fa-times-circle'       },
                ].map(b => (
                  <div key={b.label} className="flex items-center gap-2 px-4 py-2 rounded-lg" style={{ background: b.bg, border: `1px solid ${b.border}` }}>
                    <i className={`fas ${b.icon} text-sm`} style={{ color: b.color }} />
                    <span className="text-sm font-medium" style={{ color: b.color }}>{b.label}</span>
                  </div>
                ))}
              </div>

              {/* 2FA */}
              <div className="rounded-2xl p-6 mb-6" style={{ background: 'rgba(22,15,53,0.9)', border: '1px solid rgba(255,255,255,0.07)' }}>
                <h3 className="text-lg font-semibold text-white mb-2">2 Factor Authentication</h3>
                <p className="text-sm text-gray-400 mb-6">Once enabled, you'll be required to give two types of identification when you log in.</p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {[
                    { icon: 'fab fa-google',  label: 'Google Authentication', desc: 'Used for withdrawal & security verification', value: twoFactorEnabled,  set: () => setTwoFactorEnabled(v => !v)  },
                    { icon: 'fas fa-sms',     label: 'SMS Authentication',    desc: 'Used for withdrawal & security verification', value: smsAuthEnabled,    set: () => setSmsAuthEnabled(v => !v)    },
                    { icon: 'fas fa-envelope',label: 'Email Authentication',  desc: 'Used for withdrawal & security verification', value: emailAuthEnabled,  set: () => setEmailAuthEnabled(v => !v)  },
                  ].map(item => (
                    <div key={item.label} className="p-5 rounded-xl flex items-center justify-between" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.05)' }}>
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ background: 'rgba(162,133,57,0.15)' }}>
                          <i className={`${item.icon} text-lg`} style={{ color: '#a28539' }} />
                        </div>
                        <div>
                          <h4 className="text-sm font-semibold text-white">{item.label}</h4>
                          <p className="text-xs text-gray-500 mt-0.5">{item.desc}</p>
                        </div>
                      </div>
                      <Toggle value={item.value} onChange={item.set} />
                    </div>
                  ))}
                  {[
                    { icon: 'fas fa-mobile-alt',    label: 'Device Management',  action: 'Manage' },
                    { icon: 'fas fa-key',            label: 'Login Password',     action: 'Reset'  },
                    { icon: 'fas fa-map-marker-alt', label: 'Address Management', action: 'Manage' },
                  ].map(item => (
                    <div key={item.label} className="p-5 rounded-xl flex items-center justify-between" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.05)' }}>
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ background: 'rgba(162,133,57,0.15)' }}>
                          <i className={`${item.icon} text-lg`} style={{ color: '#a28539' }} />
                        </div>
                        <h4 className="text-sm font-semibold text-white">{item.label}</h4>
                      </div>
                      <button className="px-4 py-1.5 rounded-lg text-xs font-medium" style={{ background: 'rgba(162,133,57,0.15)', color: '#a28539', border: '1px solid rgba(162,133,57,0.3)' }}>
                        {item.action}
                      </button>
                    </div>
                  ))}
                  <div className="p-5 rounded-xl flex items-center justify-between md:col-span-2" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.05)' }}>
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ background: 'rgba(162,133,57,0.15)' }}>
                        <i className="fas fa-list-alt text-lg" style={{ color: '#a28539' }} />
                      </div>
                      <h4 className="text-sm font-semibold text-white">Withdrawal Whitelist</h4>
                    </div>
                    <Toggle value={withdrawalWhitelistEnabled} onChange={() => setWithdrawalWhitelistEnabled(v => !v)} />
                  </div>
                </div>
              </div>

              {/* Identity Verification */}
              <div className="rounded-2xl p-6 mb-6" style={{ background: 'rgba(22,15,53,0.9)', border: '1px solid rgba(255,255,255,0.07)' }}>
                <h3 className="text-lg font-semibold text-white mb-2">Identity Verification</h3>
                <p className="text-sm text-gray-400 mb-4">Verify your identity to unlock full platform features.</p>
                <div className="p-5 rounded-xl flex items-center justify-between" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.05)' }}>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ background: 'rgba(162,133,57,0.15)' }}>
                      <i className="fas fa-id-card text-lg" style={{ color: '#a28539' }} />
                    </div>
                    <div>
                      <h4 className="text-sm font-semibold text-white">Manage Identity Verification</h4>
                      <p className="text-xs text-gray-500 mt-0.5">Used for withdrawal & security verification</p>
                    </div>
                  </div>
                  <Toggle value={identityVerificationEnabled} onChange={() => setIdentityVerificationEnabled(v => !v)} />
                </div>
              </div>

              {/* Anti-phishing */}
              <div className="rounded-2xl p-6" style={{ background: 'rgba(22,15,53,0.9)', border: '1px solid rgba(255,255,255,0.07)' }}>
                <h3 className="text-lg font-semibold text-white mb-2">Anti-phishing Code</h3>
                <p className="text-sm text-gray-400 mb-4">Add an extra layer of protection against phishing attacks.</p>
                <div className="p-5 rounded-xl flex items-center justify-between" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.05)' }}>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ background: 'rgba(162,133,57,0.15)' }}>
                      <i className="fas fa-shield-alt text-lg" style={{ color: '#a28539' }} />
                    </div>
                    <div>
                      <h4 className="text-sm font-semibold text-white">Enable Anti-phishing Code</h4>
                      <p className="text-xs text-gray-500 mt-0.5">Enable Anti-phishing Code & security verification</p>
                    </div>
                  </div>
                  <Toggle value={antiPhishingEnabled} onChange={() => setAntiPhishingEnabled(v => !v)} />
                </div>
              </div>
            </>
          )}

          {/* ── BANKING TAB ── */}
          {activeTab === 'banking' && (
            <div className="space-y-5 max-w-2xl">

              {/* Toast */}
              {bankingToast && (
                <div
                  className="flex items-center gap-2 px-4 py-3 rounded-xl text-sm font-semibold"
                  style={{
                    background: bankingToast === 'saved' ? 'rgba(74,222,128,0.12)' : 'rgba(248,113,113,0.12)',
                    color: bankingToast === 'saved' ? '#4ade80' : '#f87171',
                    border: `1px solid ${bankingToast === 'saved' ? 'rgba(74,222,128,0.3)' : 'rgba(248,113,113,0.3)'}`,
                  }}
                >
                  <i className={`fas ${bankingToast === 'saved' ? 'fa-check-circle' : 'fa-exclamation-circle'} mr-2`} />
                  {bankingToast === 'saved' ? 'Banking information saved successfully.' : 'Failed to save. Please try again.'}
                </div>
              )}

              {/* Info banner */}
              <div
                className="flex items-start gap-3 px-4 py-3 rounded-xl"
                style={{ background: 'rgba(251,191,36,0.08)', border: '1px solid rgba(251,191,36,0.2)' }}
              >
                <i className="fas fa-info-circle text-sm mt-0.5 flex-shrink-0" style={{ color: '#fbbf24' }} />
                <p className="text-xs" style={{ color: '#9ca3af' }}>
                  Your banking information is used by our team to process deposits and withdrawals.
                  The <strong className="text-white">Deposit Account</strong> is where you send funds from.
                  The <strong className="text-white">Withdrawal Account</strong> is where we send your funds to.
                </p>
              </div>

              {/* Deposit account */}
              <div className="rounded-2xl p-5" style={{ background: 'rgba(22,15,53,0.9)', border: '1px solid rgba(74,222,128,0.2)' }}>
                <h3 className="text-sm font-bold mb-4 flex items-center gap-2" style={{ color: '#4ade80' }}>
                  <i className="fas fa-arrow-down text-xs" />
                  Deposit Account
                  <span className="text-xs font-normal ml-1" style={{ color: '#6b7280' }}>(where you send funds FROM)</span>
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <BankField label="Bank Name"      value={depositBankName}      onChange={setDepositBankName}      placeholder="e.g. Chase Bank" />
                  <BankField label="Account Name"   value={depositAccountName}   onChange={setDepositAccountName}   placeholder="e.g. John Smith" />
                  <BankField label="Account Number" value={depositAccountNumber} onChange={setDepositAccountNumber} placeholder="e.g. ****1234" />
                  <BankField label="Routing Number" value={depositRoutingNumber} onChange={setDepositRoutingNumber} placeholder="e.g. 021000021" />
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-medium mb-1.5" style={{ color: '#9ca3af' }}>Account Type</label>
                    <select
                      value={depositAccountType}
                      onChange={e => setDepositAccountType(e.target.value)}
                      className="w-full px-4 py-2.5 rounded-xl text-sm text-white outline-none"
                      style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }}
                    >
                      <option value="">Select type…</option>
                      <option value="Checking">Checking</option>
                      <option value="Savings">Savings</option>
                      <option value="Business Checking">Business Checking</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Withdrawal account */}
              <div className="rounded-2xl p-5" style={{ background: 'rgba(22,15,53,0.9)', border: '1px solid rgba(167,139,250,0.2)' }}>
                <h3 className="text-sm font-bold mb-4 flex items-center gap-2" style={{ color: '#a78bfa' }}>
                  <i className="fas fa-arrow-up text-xs" />
                  Withdrawal Account
                  <span className="text-xs font-normal ml-1" style={{ color: '#6b7280' }}>(where we send funds TO)</span>
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <BankField label="Bank Name"      value={withdrawBankName}      onChange={setWithdrawBankName}      placeholder="e.g. Bank of America" />
                  <BankField label="Account Name"   value={withdrawAccountName}   onChange={setWithdrawAccountName}   placeholder="e.g. John Smith" />
                  <BankField label="Account Number" value={withdrawAccountNumber} onChange={setWithdrawAccountNumber} placeholder="e.g. ****5678" />
                  <BankField label="Routing Number" value={withdrawRoutingNumber} onChange={setWithdrawRoutingNumber} placeholder="e.g. 026009593" />
                  <BankField label="SWIFT Code"     value={withdrawSwiftCode}     onChange={setWithdrawSwiftCode}     placeholder="e.g. BOFAUS3N (international)" />
                  <div>
                    <label className="block text-xs font-medium mb-1.5" style={{ color: '#9ca3af' }}>Account Type</label>
                    <select
                      value={withdrawAccountType}
                      onChange={e => setWithdrawAccountType(e.target.value)}
                      className="w-full px-4 py-2.5 rounded-xl text-sm text-white outline-none"
                      style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }}
                    >
                      <option value="">Select type…</option>
                      <option value="Checking">Checking</option>
                      <option value="Savings">Savings</option>
                      <option value="Business Checking">Business Checking</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Save */}
              <button
                onClick={handleSaveBanking}
                disabled={bankingSaving}
                className="w-full py-3.5 rounded-xl text-sm font-bold transition-all hover:opacity-90 disabled:opacity-60"
                style={{ background: 'linear-gradient(135deg,#a28539,#c9a84c)', color: '#0d0824' }}
              >
                {bankingSaving
                  ? <span><i className="fas fa-spinner fa-spin mr-2" />Saving…</span>
                  : <span><i className="fas fa-save mr-2" />Save Banking Information</span>
                }
              </button>
            </div>
          )}

        </main>
      </div>
    </div>
  )
}
