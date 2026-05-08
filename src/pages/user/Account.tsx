import { useEffect, useState, useCallback } from 'react'
import { useAuth } from '../../hooks/useAuth'
import DashboardLayout from '../../components/dashboard/DashboardLayout'
import { get, patch } from '../../api/client'
import { ENDPOINTS } from '../../api/endpoints'
import Toast from '../../components/ui/Toast'
import { usePnlToast } from '../../hooks/usePnlToast'

// ─── Types ────────────────────────────────────────────────────────────────────

interface NotificationPrefs {
  id: number
  userId: number
  emailNotifications: boolean
  pushNotifications: boolean
  tradeAlerts: boolean
  priceAlerts: boolean
  securityAlerts: boolean
}

// ─── Toggle switch ─────────────────────────────────────────────────────────────

function Toggle({ on, onToggle }: { on: boolean; onToggle: () => void }) {
  return (
    <div
      onClick={onToggle}
      className="w-10 h-5 rounded-full flex items-center px-0.5 cursor-pointer transition-all"
      style={{ background: on ? '#4ade80' : 'rgba(255,255,255,0.1)' }}
    >
      <div
        className="w-4 h-4 rounded-full bg-white shadow transition-transform"
        style={{ transform: on ? 'translateX(20px)' : 'translateX(0)' }}
      />
    </div>
  )
}

// ─── Main component ────────────────────────────────────────────────────────────

export default function Account() {
  const { user, updateUser } = useAuth()
  const [activeTab, setActiveTab] = useState<'Profile' | 'Security' | 'Notifications' | 'Billing'>('Profile')
  const { toast, showSuccess, showError, dismiss } = usePnlToast()

  // ── Profile state ──────────────────────────────────────────────────────────
  const [profile, setProfile] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    dateOfBirth: '',
    country: '',
    address: '',
  })
  const [profileSaving, setProfileSaving] = useState(false)

  // ── Security state ─────────────────────────────────────────────────────────
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showCurrent, setShowCurrent] = useState(false)
  const [showNew, setShowNew] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [passwordSaving, setPasswordSaving] = useState(false)

  // ── Notifications state ────────────────────────────────────────────────────
  const [notifPrefs, setNotifPrefs] = useState<NotificationPrefs | null>(null)
  const [notifSaving, setNotifSaving] = useState(false)

  // ─── Auth guard ────────────────────────────────────────────────────────────

  // ─── Seed profile from user context ───────────────────────────────────────
  useEffect(() => {
    if (user) {
      setProfile({
        firstName: user.firstName ?? '',
        lastName: user.lastName ?? '',
        email: user.email ?? '',
        phone: user.phone ?? '',
        dateOfBirth: user.dateOfBirth ?? '',
        country: user.country ?? '',
        address: user.address ?? '',
      })
    }
  }, [user])

  // ─── Load notification prefs ───────────────────────────────────────────────
  const loadNotifPrefs = useCallback(async () => {
    if (!user) return
    try {
      const data = await get<NotificationPrefs[]>(ENDPOINTS.userNotifications(user.id))
      if (data.length > 0) setNotifPrefs(data[0])
    } catch {
      // silently ignore
    }
  }, [user])

  useEffect(() => {
    if (activeTab === 'Notifications') loadNotifPrefs()
  }, [activeTab, loadNotifPrefs])

  const showToast = (message: string, type: 'success' | 'error') => {
    if (type === 'success') showSuccess(message)
    else showError(message)
  }

  // ─── Save profile ──────────────────────────────────────────────────────────
  const handleSaveProfile = async () => {
    if (!user) return
    setProfileSaving(true)
    try {
      const updated = await patch(ENDPOINTS.user(user.id), {
        firstName: profile.firstName,
        lastName: profile.lastName,
        email: profile.email,
        phone: profile.phone,
        dateOfBirth: profile.dateOfBirth,
        country: profile.country,
        address: profile.address,
      })
      updateUser(updated as Parameters<typeof updateUser>[0])
      showToast('Profile updated successfully', 'success')
    } catch {
      showToast('Failed to update profile', 'error')
    } finally {
      setProfileSaving(false)
    }
  }

  // ─── Change password ───────────────────────────────────────────────────────
  const handleChangePassword = async () => {
    if (!user) return
    if (!currentPassword || !newPassword || !confirmPassword) {
      showToast('Please fill in all password fields', 'error')
      return
    }
    if (newPassword !== confirmPassword) {
      showToast('New passwords do not match', 'error')
      return
    }
    if (newPassword.length < 6) {
      showToast('Password must be at least 6 characters', 'error')
      return
    }

    setPasswordSaving(true)
    try {
      // Fetch the full user record to verify current password
      const dbUser = await get<{ id: number; password: string }>(ENDPOINTS.user(user.id))
      if (dbUser.password !== currentPassword) {
        showToast('Current password is incorrect', 'error')
        setPasswordSaving(false)
        return
      }
      await patch(ENDPOINTS.user(user.id), { password: newPassword })
      setCurrentPassword('')
      setNewPassword('')
      setConfirmPassword('')
      showToast('Password updated successfully', 'success')
    } catch {
      showToast('Failed to update password', 'error')
    } finally {
      setPasswordSaving(false)
    }
  }

  // ─── Toggle notification ───────────────────────────────────────────────────
  const handleToggleNotif = async (key: keyof Omit<NotificationPrefs, 'id' | 'userId'>) => {
    if (!notifPrefs) return
    const updated = { ...notifPrefs, [key]: !notifPrefs[key] }
    setNotifPrefs(updated)
    setNotifSaving(true)
    try {
      await patch(ENDPOINTS.userNotificationById(notifPrefs.id), { [key]: updated[key] })
    } catch {
      // Revert on failure
      setNotifPrefs(notifPrefs)
      showToast('Failed to save notification preference', 'error')
    } finally {
      setNotifSaving(false)
    }
  }

  // ─── Shared input style ────────────────────────────────────────────────────
  const inputClass = 'w-full px-3 py-2.5 rounded-xl text-sm text-white outline-none transition-all'
  const inputStyle = { background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }
  const onFocus = (e: React.FocusEvent<HTMLInputElement>) => (e.currentTarget.style.borderColor = 'rgba(74,222,128,0.4)')
  const onBlur = (e: React.FocusEvent<HTMLInputElement>) => (e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)')

  return (
    <DashboardLayout>
      {toast && (
        <Toast
          key={toast.id}
          type={toast.type}
          message={toast.message}
          onClose={dismiss}
          duration={toast.duration ?? 3500}
        />
      )}
      <main className="flex-1 overflow-y-auto p-6" style={{ backgroundColor: '#110b2d' }}>
          {/* Page heading */}
          <div className="mb-6">
            <h2 className="text-xl font-bold text-white">Account</h2>
            <p className="text-sm text-gray-500 mt-1">Manage your profile and preferences</p>
          </div>

          {/* Tabs */}
          <div
            className="flex items-center gap-1 mb-6 p-1 rounded-xl w-fit"
            style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)' }}
          >
            {(['Profile', 'Security', 'Notifications', 'Billing'] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className="px-4 py-2 rounded-lg text-sm font-medium transition-all"
                style={
                  activeTab === tab
                    ? { background: 'rgba(74,222,128,0.12)', color: '#fff' }
                    : { color: '#6b7280' }
                }
              >
                {tab}
              </button>
            ))}
          </div>

          {/* ── Profile Tab ─────────────────────────────────────────────────── */}
          {activeTab === 'Profile' && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Avatar card */}
              <div
                className="rounded-2xl p-6 flex flex-col items-center text-center"
                style={{ background: 'rgba(22,15,53,0.9)', border: '1px solid rgba(255,255,255,0.07)' }}
              >
                <div
                  className="w-20 h-20 rounded-full flex items-center justify-center text-2xl font-bold mb-4"
                  style={{ background: 'rgba(162,133,57,0.2)', color: '#c9a84c' }}
                >
                  {user ? `${user.firstName[0]}${user.lastName[0]}` : 'JS'}
                </div>
                <h3 className="text-base font-semibold text-white">
                  {user ? `${user.firstName} ${user.lastName}` : 'Jonathan Smith'}
                </h3>
                <p className="text-sm text-gray-500 mt-1">{user?.role ?? 'Member'}</p>
                <p className="text-xs text-gray-600 mt-1">{user?.email ?? 'demo@schwab.com'}</p>

                <button
                  className="mt-5 w-full py-2 rounded-xl text-sm font-medium transition-all hover:opacity-90"
                  style={{ background: 'rgba(162,133,57,0.15)', color: '#c9a84c', border: '1px solid rgba(162,133,57,0.3)' }}
                >
                  <i className="fas fa-camera mr-2 text-xs" />
                  Change Photo
                </button>

                <div className="w-full mt-6 space-y-3">
                  {[
                    { label: 'Account Balance', value: `$${(user?.balance ?? 0).toLocaleString()}`, icon: 'fa-wallet', color: '#4ade80' },
                    { label: 'Currency', value: user?.currency ?? 'USD', icon: 'fa-dollar-sign', color: '#a78bfa' },
                    { label: 'Member Since', value: user?.memberSince ?? 'Jan 2024', icon: 'fa-calendar', color: '#60a5fa' },
                  ].map((stat) => (
                    <div
                      key={stat.label}
                      className="flex items-center justify-between px-3 py-2.5 rounded-xl"
                      style={{ background: 'rgba(255,255,255,0.04)' }}
                    >
                      <div className="flex items-center gap-2.5">
                        <div
                          className="w-7 h-7 rounded-lg flex items-center justify-center"
                          style={{ background: `${stat.color}18` }}
                        >
                          <i className={`fas ${stat.icon} text-xs`} style={{ color: stat.color }} />
                        </div>
                        <span className="text-xs text-gray-400">{stat.label}</span>
                      </div>
                      <span className="text-xs font-semibold text-white">{stat.value}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Profile form */}
              <div
                className="lg:col-span-2 rounded-2xl p-6"
                style={{ background: 'rgba(22,15,53,0.9)', border: '1px solid rgba(255,255,255,0.07)' }}
              >
                <h3 className="text-base font-semibold text-white mb-5">Personal Information</h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {[
                    { label: 'First Name', key: 'firstName' as const, type: 'text' },
                    { label: 'Last Name', key: 'lastName' as const, type: 'text' },
                    { label: 'Email Address', key: 'email' as const, type: 'email' },
                    { label: 'Phone Number', key: 'phone' as const, type: 'tel' },
                    { label: 'Date of Birth', key: 'dateOfBirth' as const, type: 'date' },
                    { label: 'Country', key: 'country' as const, type: 'text' },
                  ].map((field) => (
                    <div key={field.label}>
                      <label className="block text-xs text-gray-500 mb-1.5">{field.label}</label>
                      <input
                        type={field.type}
                        value={profile[field.key]}
                        onChange={(e) => setProfile((p) => ({ ...p, [field.key]: e.target.value }))}
                        className={inputClass}
                        style={inputStyle}
                        onFocus={onFocus}
                        onBlur={onBlur}
                      />
                    </div>
                  ))}

                  <div className="sm:col-span-2">
                    <label className="block text-xs text-gray-500 mb-1.5">Address</label>
                    <input
                      type="text"
                      value={profile.address}
                      onChange={(e) => setProfile((p) => ({ ...p, address: e.target.value }))}
                      className={inputClass}
                      style={inputStyle}
                      onFocus={onFocus}
                      onBlur={onBlur}
                    />
                  </div>
                </div>

                <div className="flex items-center justify-end gap-3 mt-6">
                  <button
                    onClick={() => {
                      if (user) {
                        setProfile({
                          firstName: user.firstName ?? '',
                          lastName: user.lastName ?? '',
                          email: user.email ?? '',
                          phone: user.phone ?? '',
                          dateOfBirth: user.dateOfBirth ?? '',
                          country: user.country ?? '',
                          address: user.address ?? '',
                        })
                      }
                    }}
                    className="px-5 py-2 rounded-xl text-sm font-medium transition-all hover:bg-white/10"
                    style={{ color: '#6b7280', border: '1px solid rgba(255,255,255,0.08)' }}
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSaveProfile}
                    disabled={profileSaving}
                    className="px-5 py-2 rounded-xl text-sm font-semibold transition-all hover:opacity-90 disabled:opacity-60"
                    style={{ background: '#4ade80', color: '#0d0824' }}
                  >
                    {profileSaving ? (
                      <span className="flex items-center gap-2">
                        <i className="fas fa-spinner fa-spin text-xs" /> Saving…
                      </span>
                    ) : (
                      'Save Changes'
                    )}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* ── Security Tab ─────────────────────────────────────────────────── */}
          {activeTab === 'Security' && (
            <div
              className="max-w-xl rounded-2xl p-6"
              style={{ background: 'rgba(22,15,53,0.9)', border: '1px solid rgba(255,255,255,0.07)' }}
            >
              <h3 className="text-base font-semibold text-white mb-5">Change Password</h3>
              <div className="space-y-4">
                {/* Current password */}
                {[
                  { label: 'Current Password', value: currentPassword, setter: setCurrentPassword, show: showCurrent, toggleShow: () => setShowCurrent((v) => !v) },
                  { label: 'New Password', value: newPassword, setter: setNewPassword, show: showNew, toggleShow: () => setShowNew((v) => !v) },
                  { label: 'Confirm New Password', value: confirmPassword, setter: setConfirmPassword, show: showConfirm, toggleShow: () => setShowConfirm((v) => !v) },
                ].map((field) => (
                  <div key={field.label}>
                    <label className="block text-xs text-gray-500 mb-1.5">{field.label}</label>
                    <div className="relative">
                      <input
                        type={field.show ? 'text' : 'password'}
                        placeholder="••••••••"
                        value={field.value}
                        onChange={(e) => field.setter(e.target.value)}
                        className={inputClass + ' pr-10'}
                        style={inputStyle}
                        onFocus={onFocus}
                        onBlur={onBlur}
                      />
                      <button
                        type="button"
                        onClick={field.toggleShow}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300 transition-colors"
                      >
                        <i className={`fas ${field.show ? 'fa-eye-slash' : 'fa-eye'} text-xs`} />
                      </button>
                    </div>
                  </div>
                ))}

                <button
                  onClick={handleChangePassword}
                  disabled={passwordSaving}
                  className="w-full py-2.5 rounded-xl text-sm font-semibold transition-all hover:opacity-90 mt-2 disabled:opacity-60"
                  style={{ background: '#4ade80', color: '#0d0824' }}
                >
                  {passwordSaving ? (
                    <span className="flex items-center justify-center gap-2">
                      <i className="fas fa-spinner fa-spin text-xs" /> Updating…
                    </span>
                  ) : (
                    'Update Password'
                  )}
                </button>
              </div>
            </div>
          )}

          {/* ── Notifications Tab ─────────────────────────────────────────────── */}
          {activeTab === 'Notifications' && (
            <div
              className="max-w-xl rounded-2xl p-6"
              style={{ background: 'rgba(22,15,53,0.9)', border: '1px solid rgba(255,255,255,0.07)' }}
            >
              <div className="flex items-center justify-between mb-5">
                <h3 className="text-base font-semibold text-white">Notification Preferences</h3>
                {notifSaving && (
                  <span className="text-xs text-gray-500 flex items-center gap-1.5">
                    <i className="fas fa-spinner fa-spin text-xs" /> Saving…
                  </span>
                )}
              </div>

              {notifPrefs === null ? (
                <div className="flex items-center justify-center py-8">
                  <i className="fas fa-spinner fa-spin text-gray-500 mr-2" />
                  <span className="text-sm text-gray-500">Loading preferences…</span>
                </div>
              ) : (
                <div className="space-y-4">
                  {(
                    [
                      { key: 'emailNotifications' as const, label: 'Email Notifications', desc: 'Receive updates via email' },
                      { key: 'pushNotifications' as const, label: 'Push Notifications', desc: 'Browser push alerts' },
                      { key: 'tradeAlerts' as const, label: 'Trade Alerts', desc: 'Notify on order fills' },
                      { key: 'priceAlerts' as const, label: 'Price Alerts', desc: 'Notify on price targets' },
                      { key: 'securityAlerts' as const, label: 'Security Alerts', desc: 'Login and account changes' },
                    ] as const
                  ).map((item) => (
                    <div
                      key={item.key}
                      className="flex items-center justify-between py-3"
                      style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}
                    >
                      <div>
                        <p className="text-sm font-medium text-white">{item.label}</p>
                        <p className="text-xs text-gray-500 mt-0.5">{item.desc}</p>
                      </div>
                      <Toggle
                        on={notifPrefs[item.key]}
                        onToggle={() => handleToggleNotif(item.key)}
                      />
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ── Billing Tab ───────────────────────────────────────────────────── */}
          {activeTab === 'Billing' && (
            <div
              className="max-w-xl rounded-2xl p-6"
              style={{ background: 'rgba(22,15,53,0.9)', border: '1px solid rgba(255,255,255,0.07)' }}
            >
              <h3 className="text-base font-semibold text-white mb-5">Billing Information</h3>
              <div
                className="flex items-center gap-4 p-4 rounded-xl mb-5"
                style={{ background: 'rgba(74,222,128,0.06)', border: '1px solid rgba(74,222,128,0.15)' }}
              >
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                  style={{ background: 'rgba(74,222,128,0.15)' }}
                >
                  <i className="fas fa-check text-sm" style={{ color: '#4ade80' }} />
                </div>
                <div>
                  <p className="text-sm font-semibold text-white">Free Plan</p>
                  <p className="text-xs text-gray-500 mt-0.5">You are currently on the free plan</p>
                </div>
                <button
                  className="ml-auto px-4 py-1.5 rounded-lg text-xs font-semibold transition-all hover:opacity-90"
                  style={{ background: '#a28539', color: '#0d0824' }}
                >
                  Upgrade
                </button>
              </div>
              <p className="text-xs text-gray-500">No payment methods on file.</p>
            </div>
          )}
        </main>
    </DashboardLayout>
  )
}
