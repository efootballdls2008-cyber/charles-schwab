import { useState, FormEvent } from 'react'
import { post } from '../../api/client'
import { ENDPOINTS } from '../../api/endpoints'

interface SupportModalProps {
  isOpen: boolean
  onClose: () => void
}

const SUBJECT_OPTIONS = [
  'Account Issue',
  'Deposit / Withdrawal',
  'Trading Problem',
  'KYC Verification',
  'Technical Issue',
  'Billing',
  'Other'
]

export default function SupportModal({ isOpen, onClose }: SupportModalProps) {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
    priority: 'medium' as 'low' | 'medium' | 'high'
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle')
  const [errorMessage, setErrorMessage] = useState('')
  const [ticketRef, setTicketRef] = useState('')

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setSubmitStatus('idle')
    setErrorMessage('')

    try {
      const payload = {
        name: formData.name.trim(),
        email: formData.email.trim(),
        subject: formData.subject,
        message: formData.message.trim(),
        priority: formData.priority
      }

      const response = await post<{ success: boolean; message: string; ticketRef: string }>(
        ENDPOINTS.support,
        payload
      )

      setSubmitStatus('success')
      setTicketRef(response.ticketRef || '')
      // Reset form
      setFormData({ name: '', email: '', subject: '', message: '', priority: 'medium' })
      
      // Auto close after 3 seconds on success
      setTimeout(() => {
        onClose()
        setSubmitStatus('idle')
        setTicketRef('')
      }, 3000)
    } catch (error) {
      console.error('Failed to send support message:', error)
      setSubmitStatus('error')
      setErrorMessage(error instanceof Error ? error.message : 'Failed to send message. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleClose = () => {
    if (!isSubmitting) {
      onClose()
      setSubmitStatus('idle')
      setErrorMessage('')
      setTicketRef('')
    }
  }

  if (!isOpen) return null

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
      onClick={handleClose}
    >
      <div 
        className="bg-gradient-to-br from-gray-900 via-purple-900/20 to-gray-900 rounded-2xl shadow-2xl max-w-lg w-full border border-purple-500/20 transform transition-all max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-700/50 sticky top-0 bg-gradient-to-br from-gray-900 via-purple-900/20 to-gray-900 z-10">
          <div className="flex items-center gap-3">
            <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-full p-3">
              <i className="fas fa-headset text-white text-xl"></i>
            </div>
            <div>
              <h2 className="text-2xl font-bold text-white">Contact Support</h2>
              <p className="text-sm text-gray-400 mt-0.5">We're here to help you 24/7</p>
            </div>
          </div>
          <button
            onClick={handleClose}
            disabled={isSubmitting}
            className="text-gray-400 hover:text-white transition-colors p-2 hover:bg-gray-800 rounded-full disabled:opacity-50"
            aria-label="Close support modal"
          >
            <i className="fas fa-times text-xl"></i>
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {/* Success Message */}
          {submitStatus === 'success' && (
            <div className="bg-green-500/10 border border-green-500/50 rounded-lg p-4 flex items-start gap-3">
              <i className="fas fa-check-circle text-green-500 text-xl mt-0.5"></i>
              <div>
                <p className="text-green-400 font-semibold">Support request submitted!</p>
                <p className="text-green-300/80 text-sm mt-1">
                  Reference: <span className="font-mono font-bold">{ticketRef}</span>
                </p>
                <p className="text-green-300/80 text-sm mt-1">
                  Our support team will respond to your email shortly.
                </p>
              </div>
            </div>
          )}

          {/* Error Message */}
          {submitStatus === 'error' && (
            <div className="bg-red-500/10 border border-red-500/50 rounded-lg p-4 flex items-start gap-3">
              <i className="fas fa-exclamation-circle text-red-500 text-xl mt-0.5"></i>
              <div>
                <p className="text-red-400 font-semibold">Failed to send message</p>
                <p className="text-red-300/80 text-sm mt-1">{errorMessage}</p>
              </div>
            </div>
          )}

          {/* Name Field */}
          <div>
            <label htmlFor="support-name" className="block text-sm font-medium text-gray-300 mb-2">
              Your Name <span className="text-red-400">*</span>
            </label>
            <input
              type="text"
              id="support-name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-4 py-3 bg-gray-800/50 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              placeholder="Enter your full name"
              required
              minLength={1}
              maxLength={100}
              disabled={isSubmitting}
            />
          </div>

          {/* Email Field */}
          <div>
            <label htmlFor="support-email" className="block text-sm font-medium text-gray-300 mb-2">
              Email Address <span className="text-red-400">*</span>
            </label>
            <input
              type="email"
              id="support-email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="w-full px-4 py-3 bg-gray-800/50 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              placeholder="your.email@example.com"
              required
              disabled={isSubmitting}
            />
          </div>

          {/* Subject Field */}
          <div>
            <label htmlFor="support-subject" className="block text-sm font-medium text-gray-300 mb-2">
              Subject Category <span className="text-red-400">*</span>
            </label>
            <select
              id="support-subject"
              value={formData.subject}
              onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
              className="w-full px-4 py-3 bg-gray-800/50 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              required
              disabled={isSubmitting}
            >
              <option value="">Select a category...</option>
              {SUBJECT_OPTIONS.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </div>

          {/* Priority Field */}
          <div>
            <label htmlFor="support-priority" className="block text-sm font-medium text-gray-300 mb-2">
              Priority Level
            </label>
            <div className="flex gap-3">
              {(['low', 'medium', 'high'] as const).map((priority) => (
                <button
                  key={priority}
                  type="button"
                  onClick={() => setFormData({ ...formData, priority })}
                  disabled={isSubmitting}
                  className={`flex-1 px-4 py-2 rounded-lg font-medium transition-all ${
                    formData.priority === priority
                      ? priority === 'high'
                        ? 'bg-red-600 text-white border-2 border-red-500'
                        : priority === 'medium'
                        ? 'bg-yellow-600 text-white border-2 border-yellow-500'
                        : 'bg-green-600 text-white border-2 border-green-500'
                      : 'bg-gray-800/50 text-gray-400 border-2 border-gray-700 hover:border-gray-600'
                  } disabled:opacity-50 disabled:cursor-not-allowed`}
                >
                  <i
                    className={`fas ${
                      priority === 'high'
                        ? 'fa-exclamation-triangle'
                        : priority === 'medium'
                        ? 'fa-circle-info'
                        : 'fa-check-circle'
                    } mr-1.5`}
                  ></i>
                  {priority.charAt(0).toUpperCase() + priority.slice(1)}
                </button>
              ))}
            </div>
          </div>

          {/* Message Field */}
          <div>
            <label htmlFor="support-message" className="block text-sm font-medium text-gray-300 mb-2">
              Message <span className="text-red-400">*</span>
            </label>
            <textarea
              id="support-message"
              value={formData.message}
              onChange={(e) => setFormData({ ...formData, message: e.target.value })}
              rows={5}
              minLength={10}
              maxLength={2000}
              className="w-full px-4 py-3 bg-gray-800/50 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all resize-none"
              placeholder="Describe your issue or question in detail (10-2000 characters)..."
              required
              disabled={isSubmitting}
            />
            <div className="flex justify-between items-center mt-2">
              <p className="text-xs text-gray-500">
                <i className="fas fa-info-circle mr-1"></i>
                Be as detailed as possible to help us assist you better
              </p>
              <p className="text-xs text-gray-500">
                {formData.message.length} / 2000
              </p>
            </div>
          </div>

          {/* Submit Button */}
          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={handleClose}
              disabled={isSubmitting}
              className="flex-1 px-6 py-3 bg-gray-800 hover:bg-gray-700 text-white font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting || formData.message.length < 10}
              className="flex-1 px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-medium rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <i className="fas fa-spinner fa-spin"></i>
                  Sending...
                </>
              ) : (
                <>
                  <i className="fas fa-paper-plane"></i>
                  Send Message
                </>
              )}
            </button>
          </div>
        </form>

        {/* Footer */}
        <div className="px-6 pb-6">
          <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <i className="fas fa-clock text-blue-400 text-lg mt-0.5"></i>
              <div className="text-sm text-gray-300">
                <p className="font-medium text-blue-300">Average Response Time: 2-4 hours</p>
                <p className="text-gray-400 mt-1">Our support team typically responds within a few hours during business days. You'll receive a response via email.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
