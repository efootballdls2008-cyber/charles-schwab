import { useState, useEffect, useRef, useCallback } from 'react'
import { useAuth } from '../../hooks/useAuth'
import DashboardSidebar from '../../components/dashboard/DashboardSidebar'
import DashboardHeader from '../../components/dashboard/DashboardHeader'
import { ENDPOINTS } from '../../api/endpoints'

const BASE_URL = (import.meta as any).env.VITE_API_URL || 'http://localhost:3001'

type IdType = 'passport' | 'drivers_license' | 'national_id'
type KycStatus = 'pending' | 'approved' | 'rejected'

interface KycSubmission {
  id: number
  userId: number
  status: KycStatus
  fullName: string
  dateOfBirth: string
  country: string
  idType: IdType
  idNumber: string
  frontImage: string
  backImage: string | null
  selfieImage: string
  rejectionReason: string | null
  submittedAt: string
}

const ID_TYPES: { value: IdType; label: string; icon: string; needsBack: boolean }[] = [
  { value: 'passport',        label: 'Passport',          icon: 'fas fa-passport',  needsBack: false },
  { value: 'drivers_license', label: "Driver's License",  icon: 'fas fa-car',       needsBack: true  },
  { value: 'national_id',     label: 'National ID',       icon: 'fas fa-id-card',   needsBack: true  },
]

const STEPS = ['ID Type', 'Personal Info', 'Documents', 'Review']

// ── Step progress bar ─────────────────────────────────────────
function StepBar({ current }: { current: number }) {
  return (
    <div className="flex items-center mb-8">
      {STEPS.map((label, i) => {
        const done   = i < current
        const active = i === current
        const last   = i === STEPS.length - 1
        return (
          <div key={label} className="flex items-center flex-1 last:flex-none">
            <div className="flex flex-col items-center gap-1.5">
              <div
                className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all"
                style={{
                  background: done ? '#4ade80' : active ? 'rgba(74,222,128,0.15)' : 'rgba(255,255,255,0.05)',
                  border: `2px solid ${done || active ? '#4ade80' : 'rgba(255,255,255,0.1)'}`,
                  color: done ? '#0d0824' : active ? '#4ade80' : '#6b7280',
                }}
              >
                {done ? <i className="fas fa-check text-xs" /> : i + 1}
              </div>
              <span className="text-xs whitespace-nowrap" style={{ color: active ? '#fff' : done ? '#4ade80' : '#6b7280' }}>
                {label}
              </span>
            </div>
            {!last && (
              <div className="flex-1 h-0.5 mx-2 mb-5 rounded" style={{ background: done ? '#4ade80' : 'rgba(255,255,255,0.08)' }} />
            )}
          </div>
        )
      })}
    </div>
  )
}

// ── File drop zone ────────────────────────────────────────────
function FileDropZone({ label, hint, file, onChange, required = true }: {
  label: string; hint: string; file: File | null
  onChange: (f: File | null) => void; required?: boolean
}) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [drag, setDrag] = useState(false)
  const preview = file ? URL.createObjectURL(file) : null

  return (
    <div>
      <label className="block text-xs font-medium mb-1.5" style={{ color: '#9ca3af' }}>
        {label} {required && <span style={{ color: '#f87171' }}>*</span>}
      </label>
      <div
        className="relative rounded-xl border-2 border-dashed transition-all cursor-pointer overflow-hidden"
        style={{
          borderColor: drag ? '#4ade80' : file ? 'rgba(74,222,128,0.4)' : 'rgba(255,255,255,0.12)',
          background: drag ? 'rgba(74,222,128,0.04)' : 'rgba(255,255,255,0.02)',
          minHeight: '120px',
        }}
        onClick={() => inputRef.current?.click()}
        onDragOver={e => { e.preventDefault(); setDrag(true) }}
        onDragLeave={() => setDrag(false)}
        onDrop={e => { e.preventDefault(); setDrag(false); const f = e.dataTransfer.files[0]; if (f) onChange(f) }}
      >
        {preview ? (
          <div className="relative">
            <img src={preview} alt="preview" className="w-full h-32 object-cover" />
            <button
              type="button"
              onClick={e => { e.stopPropagation(); onChange(null) }}
              className="absolute top-2 right-2 w-6 h-6 rounded-full flex items-center justify-center"
              style={{ background: 'rgba(248,113,113,0.9)' }}
            >
              <i className="fas fa-times text-xs text-white" />
            </button>
            <div className="absolute bottom-0 left-0 right-0 px-3 py-1.5" style={{ background: 'rgba(0,0,0,0.6)' }}>
              <p className="text-xs text-white truncate">{file?.name}</p>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-8 gap-2">
            <i className="fas fa-cloud-upload-alt text-2xl" style={{ color: '#4b5563' }} />
            <p className="text-xs font-medium" style={{ color: '#9ca3af' }}>Click or drag to upload</p>
            <p className="text-xs" style={{ color: '#6b7280' }}>{hint}</p>
          </div>
        )}
        <input
          ref={inputRef}
          type="file"
          accept="image/jpeg,image/jpg,image/png,image/webp"
          className="hidden"
          onChange={e => onChange(e.target.files?.[0] ?? null)}
        />
      </div>
    </div>
  )
}

// ── Status banner (after submission) ─────────────────────────
function StatusBanner({ submission, onResubmit }: { submission: KycSubmission; onResubmit: () => void }) {
  const cfg = {
    pending:  { icon: 'fas fa-clock',        color: '#f59e0b', bg: 'rgba(245,158,11,0.08)',  border: 'rgba(245,158,11,0.25)',  title: 'Under Review',  msg: 'Your documents are being reviewed. This usually takes 1–2 business days.' },
    approved: { icon: 'fas fa-check-circle', color: '#4ade80', bg: 'rgba(74,222,128,0.08)',  border: 'rgba(74,222,128,0.25)',  title: 'KYC Approved',  msg: 'Your identity has been verified. You have full access to all platform features.' },
    rejected: { icon: 'fas fa-times-circle', color: '#f87171', bg: 'rgba(248,113,113,0.08)', border: 'rgba(248,113,113,0.25)', title: 'KYC Rejected',  msg: submission.rejectionReason ?? 'Your submission was rejected. Please resubmit with correct documents.' },
  }[submission.status]

  const idLabel = ID_TYPES.find(t => t.value === submission.idType)?.label ?? submission.idType

  return (
    <div className="space-y-5 max-w-2xl">
      {/* Status card */}
      <div className="rounded-2xl p-5" style={{ background: cfg.bg, border: `1px solid ${cfg.border}` }}>
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: `${cfg.color}18` }}>
            <i className={`${cfg.icon} text-xl`} style={{ color: cfg.color }} />
          </div>
          <div className="flex-1">
            <h3 className="text-base font-bold text-white">{cfg.title}</h3>
            <p className="text-sm mt-1" style={{ color: '#9ca3af' }}>{cfg.msg}</p>
            {submission.status === 'rejected' && (
              <button
                onClick={onResubmit}
                className="mt-3 px-4 py-2 rounded-xl text-xs font-bold transition-all hover:opacity-90"
                style={{ background: 'rgba(74,222,128,0.15)', color: '#4ade80', border: '1px solid rgba(74,222,128,0.3)' }}
              >
                <i className="fas fa-redo mr-1.5" />Resubmit KYC
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Submission details */}
      <div className="rounded-2xl p-5" style={{ background: 'rgba(22,15,53,0.9)', border: '1px solid rgba(255,255,255,0.07)' }}>
        <h4 className="text-sm font-bold text-white mb-4">Submission Details</h4>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mb-4">
          {[
            { label: 'Full Name',     value: submission.fullName },
            { label: 'Date of Birth', value: submission.dateOfBirth },
            { label: 'Country',       value: submission.country },
            { label: 'ID Type',       value: idLabel },
            { label: 'ID Number',     value: submission.idNumber },
            { label: 'Submitted',     value: new Date(submission.submittedAt).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }) },
          ].map(row => (
            <div key={row.label} className="flex items-center justify-between px-3 py-2.5 rounded-xl" style={{ background: 'rgba(255,255,255,0.03)' }}>
              <span className="text-xs" style={{ color: '#6b7280' }}>{row.label}</span>
              <span className="text-xs font-semibold text-white">{row.value}</span>
            </div>
          ))}
        </div>

        {/* Document thumbnails */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {[
            { label: 'Front of ID',  url: submission.frontImage },
            ...(submission.backImage ? [{ label: 'Back of ID', url: submission.backImage }] : []),
            { label: 'Selfie with ID', url: submission.selfieImage },
          ].map(img => (
            <div key={img.label}>
              <p className="text-xs mb-1.5" style={{ color: '#6b7280' }}>{img.label}</p>
              <a href={`${BASE_URL}${img.url}`} target="_blank" rel="noreferrer">
                <img
                  src={`${BASE_URL}${img.url}`}
                  alt={img.label}
                  className="w-full h-24 object-cover rounded-xl"
                  style={{ border: '1px solid rgba(255,255,255,0.08)' }}
                />
              </a>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

// ── Main page ─────────────────────────────────────────────────
export default function KYCPage() {
  const { user } = useAuth()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [step, setStep] = useState(0)
  const [pageLoading, setPageLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [submission, setSubmission] = useState<KycSubmission | null>(null)
  const [showForm, setShowForm] = useState(false)

  // Form fields
  const [idType,     setIdType]     = useState<IdType>('passport')
  const [fullName,   setFullName]   = useState('')
  const [dob,        setDob]        = useState('')
  const [country,    setCountry]    = useState('')
  const [idNumber,   setIdNumber]   = useState('')
  const [frontFile,  setFrontFile]  = useState<File | null>(null)
  const [backFile,   setBackFile]   = useState<File | null>(null)
  const [selfieFile, setSelfieFile] = useState<File | null>(null)

  const needsBack = ID_TYPES.find(t => t.value === idType)?.needsBack ?? false

  // Pre-fill name from user profile
  useEffect(() => {
    if (user) setFullName(`${user.firstName} ${user.lastName}`)
  }, [user])

  const loadSubmission = useCallback(async () => {
    if (!user) return
    setPageLoading(true)
    try {
      const token = localStorage.getItem('cs_token')
      const res = await fetch(`${BASE_URL}${ENDPOINTS.kycMe}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      const json = await res.json()
      setSubmission(json.data ?? null)
    } catch { /* no submission yet */ }
    finally { setPageLoading(false) }
  }, [user])

  useEffect(() => { loadSubmission() }, [loadSubmission])

  async function handleSubmit() {
    setError(null)
    if (!fullName.trim()) return setError('Full name is required')
    if (!dob)             return setError('Date of birth is required')
    if (!country.trim())  return setError('Country is required')
    if (!idNumber.trim()) return setError('ID number is required')
    if (!frontFile)       return setError('Front image of ID is required')
    if (needsBack && !backFile) return setError('Back image of ID is required for this document type')
    if (!selfieFile)      return setError('Selfie image is required')

    setSubmitting(true)
    try {
      const token = localStorage.getItem('cs_token')
      const fd = new FormData()
      fd.append('fullName',    fullName)
      fd.append('dateOfBirth', dob)
      fd.append('country',     country)
      fd.append('idType',      idType)
      fd.append('idNumber',    idNumber)
      fd.append('frontImage',  frontFile)
      if (backFile) fd.append('backImage', backFile)
      fd.append('selfieImage', selfieFile)

      const res = await fetch(`${BASE_URL}${ENDPOINTS.kyc}`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: fd,
      })
      const json = await res.json()
      if (!res.ok) throw new Error(json.message ?? 'Submission failed')
      setSubmission(json.data)
      setShowForm(false)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Submission failed')
    } finally {
      setSubmitting(false)
    }
  }

  function canProceed() {
    if (step === 0) return !!idType
    if (step === 1) return !!fullName.trim() && !!dob && !!country.trim() && !!idNumber.trim()
    if (step === 2) return !!frontFile && (!needsBack || !!backFile) && !!selfieFile
    return true
  }

  const inputCls = 'w-full px-3 py-2.5 rounded-xl text-sm text-white outline-none'
  const inputSty = { background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }

  return (
    <div className="flex h-screen overflow-hidden" style={{ backgroundColor: '#0d0824' }}>
      <DashboardSidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="flex-1 flex flex-col overflow-hidden">
        <DashboardHeader onMenuClick={() => setSidebarOpen(true)} />
        <main className="flex-1 overflow-y-auto p-6" style={{ backgroundColor: '#110b2d' }}>

          {/* Page header */}
          <div className="mb-6">
            <h2 className="text-xl font-bold text-white flex items-center gap-2.5">
              <i className="fas fa-id-card" style={{ color: '#4ade80' }} />
              Identity Verification (KYC)
            </h2>
            <p className="text-sm text-gray-500 mt-1">Verify your identity to unlock full platform access</p>
          </div>

          {pageLoading ? (
            <div className="flex items-center justify-center py-24">
              <i className="fas fa-spinner fa-spin text-gray-500 mr-2" />
              <span className="text-sm text-gray-500">Loading…</span>
            </div>
          ) : submission && !showForm ? (
            <StatusBanner
              submission={submission}
              onResubmit={() => { setShowForm(true); setStep(0); setError(null) }}
            />
          ) : (
            <div className="max-w-2xl">
              {/* Info banner */}
              <div className="mb-6 rounded-2xl p-4 flex items-start gap-3" style={{ background: 'rgba(96,165,250,0.07)', border: '1px solid rgba(96,165,250,0.2)' }}>
                <i className="fas fa-info-circle mt-0.5 flex-shrink-0" style={{ color: '#60a5fa' }} />
                <div>
                  <p className="text-xs font-semibold mb-1" style={{ color: '#93c5fd' }}>What you'll need</p>
                  <ul className="text-xs space-y-0.5 list-disc list-inside" style={{ color: '#9ca3af' }}>
                    <li>A valid government-issued ID (passport, driver's license, or national ID)</li>
                    <li>A clear photo of the front (and back for non-passport IDs)</li>
                    <li>A selfie holding your ID next to your face</li>
                  </ul>
                </div>
              </div>

              <div className="rounded-2xl p-6" style={{ background: 'rgba(22,15,53,0.9)', border: '1px solid rgba(255,255,255,0.07)' }}>
                <StepBar current={step} />

                {/* Step 0 — ID Type */}
                {step === 0 && (
                  <div className="space-y-3">
                    <h3 className="text-sm font-bold text-white mb-4">Select your ID type</h3>
                    {ID_TYPES.map(t => (
                      <button
                        key={t.value}
                        onClick={() => setIdType(t.value)}
                        className="w-full flex items-center gap-4 px-4 py-4 rounded-xl transition-all text-left"
                        style={{
                          background: idType === t.value ? 'rgba(74,222,128,0.08)' : 'rgba(255,255,255,0.03)',
                          border: `1.5px solid ${idType === t.value ? 'rgba(74,222,128,0.4)' : 'rgba(255,255,255,0.07)'}`,
                        }}
                      >
                        <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                          style={{ background: idType === t.value ? 'rgba(74,222,128,0.15)' : 'rgba(255,255,255,0.05)' }}>
                          <i className={`${t.icon} text-sm`} style={{ color: idType === t.value ? '#4ade80' : '#6b7280' }} />
                        </div>
                        <div className="flex-1">
                          <p className="text-sm font-semibold" style={{ color: idType === t.value ? '#fff' : '#d1d5db' }}>{t.label}</p>
                          <p className="text-xs mt-0.5" style={{ color: '#6b7280' }}>
                            {t.needsBack ? 'Front + back photo required' : 'Front photo only required'}
                          </p>
                        </div>
                        {idType === t.value && <i className="fas fa-check-circle" style={{ color: '#4ade80' }} />}
                      </button>
                    ))}
                  </div>
                )}

                {/* Step 1 — Personal Info */}
                {step === 1 && (
                  <div className="space-y-4">
                    <h3 className="text-sm font-bold text-white mb-4">Personal Information</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="sm:col-span-2">
                        <label className="block text-xs font-medium mb-1.5" style={{ color: '#9ca3af' }}>
                          Full Name <span style={{ color: '#f87171' }}>*</span>
                        </label>
                        <input type="text" value={fullName} onChange={e => setFullName(e.target.value)}
                          placeholder="As it appears on your ID" className={inputCls} style={inputSty} />
                      </div>
                      <div>
                        <label className="block text-xs font-medium mb-1.5" style={{ color: '#9ca3af' }}>
                          Date of Birth <span style={{ color: '#f87171' }}>*</span>
                        </label>
                        <input type="date" value={dob} onChange={e => setDob(e.target.value)} className={inputCls} style={inputSty} />
                      </div>
                      <div>
                        <label className="block text-xs font-medium mb-1.5" style={{ color: '#9ca3af' }}>
                          Country <span style={{ color: '#f87171' }}>*</span>
                        </label>
                        <input type="text" value={country} onChange={e => setCountry(e.target.value)}
                          placeholder="e.g. United States" className={inputCls} style={inputSty} />
                      </div>
                      <div className="sm:col-span-2">
                        <label className="block text-xs font-medium mb-1.5" style={{ color: '#9ca3af' }}>
                          {ID_TYPES.find(t => t.value === idType)?.label} Number <span style={{ color: '#f87171' }}>*</span>
                        </label>
                        <input type="text" value={idNumber} onChange={e => setIdNumber(e.target.value)}
                          placeholder="Enter your ID number" className={inputCls} style={inputSty} />
                      </div>
                    </div>
                  </div>
                )}

                {/* Step 2 — Documents */}
                {step === 2 && (
                  <div className="space-y-4">
                    <h3 className="text-sm font-bold text-white mb-1">Upload Documents</h3>
                    <p className="text-xs mb-4" style={{ color: '#6b7280' }}>JPEG, PNG or WebP · Max 5 MB each · Ensure all text is clearly visible</p>
                    <FileDropZone label="Front of ID" hint="Clear photo of the front side" file={frontFile} onChange={setFrontFile} />
                    {needsBack && (
                      <FileDropZone label="Back of ID" hint="Clear photo of the back side" file={backFile} onChange={setBackFile} />
                    )}
                    <FileDropZone
                      label="Selfie with ID"
                      hint="Hold your ID next to your face — both clearly visible"
                      file={selfieFile}
                      onChange={setSelfieFile}
                    />
                  </div>
                )}

                {/* Step 3 — Review */}
                {step === 3 && (
                  <div className="space-y-4">
                    <h3 className="text-sm font-bold text-white mb-4">Review & Submit</h3>
                    <div className="space-y-2">
                      {[
                        { label: 'ID Type',       value: ID_TYPES.find(t => t.value === idType)?.label ?? idType },
                        { label: 'Full Name',     value: fullName },
                        { label: 'Date of Birth', value: dob },
                        { label: 'Country',       value: country },
                        { label: 'ID Number',     value: idNumber },
                        { label: 'Front Image',   value: frontFile?.name ?? '—' },
                        ...(needsBack ? [{ label: 'Back Image', value: backFile?.name ?? '—' }] : []),
                        { label: 'Selfie',        value: selfieFile?.name ?? '—' },
                      ].map(row => (
                        <div key={row.label} className="flex items-center justify-between px-3 py-2.5 rounded-xl"
                          style={{ background: 'rgba(255,255,255,0.03)' }}>
                          <span className="text-xs" style={{ color: '#6b7280' }}>{row.label}</span>
                          <span className="text-xs font-semibold text-white truncate max-w-[55%] text-right">{row.value}</span>
                        </div>
                      ))}
                    </div>
                    <div className="p-3 rounded-xl" style={{ background: 'rgba(74,222,128,0.05)', border: '1px solid rgba(74,222,128,0.15)' }}>
                      <p className="text-xs" style={{ color: '#9ca3af' }}>
                        By submitting, you confirm all information is accurate and the documents belong to you.
                        False submissions may result in account suspension.
                      </p>
                    </div>
                  </div>
                )}

                {/* Error */}
                {error && (
                  <div className="mt-4 flex items-center gap-2 px-3 py-2.5 rounded-xl"
                    style={{ background: 'rgba(248,113,113,0.08)', border: '1px solid rgba(248,113,113,0.2)' }}>
                    <i className="fas fa-exclamation-circle text-xs flex-shrink-0" style={{ color: '#f87171' }} />
                    <p className="text-xs" style={{ color: '#fca5a5' }}>{error}</p>
                  </div>
                )}

                {/* Navigation */}
                <div className="flex items-center justify-between mt-6 pt-5" style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}>
                  <button
                    onClick={() => setStep(s => Math.max(s - 1, 0))}
                    disabled={step === 0}
                    className="px-5 py-2.5 rounded-xl text-sm font-semibold transition-all disabled:opacity-30"
                    style={{ background: 'rgba(255,255,255,0.05)', color: '#9ca3af', border: '1px solid rgba(255,255,255,0.08)' }}
                  >
                    <i className="fas fa-arrow-left mr-2 text-xs" />Back
                  </button>

                  {step < STEPS.length - 1 ? (
                    <button
                      onClick={() => setStep(s => s + 1)}
                      disabled={!canProceed()}
                      className="px-6 py-2.5 rounded-xl text-sm font-bold transition-all hover:opacity-90 disabled:opacity-40"
                      style={{ background: 'linear-gradient(135deg,#22c55e,#4ade80)', color: '#0d0824' }}
                    >
                      Continue <i className="fas fa-arrow-right ml-2 text-xs" />
                    </button>
                  ) : (
                    <button
                      onClick={handleSubmit}
                      disabled={submitting}
                      className="px-6 py-2.5 rounded-xl text-sm font-bold transition-all hover:opacity-90 disabled:opacity-60"
                      style={{ background: 'linear-gradient(135deg,#22c55e,#4ade80)', color: '#0d0824' }}
                    >
                      {submitting
                        ? <><i className="fas fa-spinner fa-spin mr-2" />Submitting…</>
                        : <><i className="fas fa-paper-plane mr-2" />Submit KYC</>}
                    </button>
                  )}
                </div>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  )
}
