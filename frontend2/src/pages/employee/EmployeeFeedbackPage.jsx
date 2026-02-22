import React, { useState, useEffect } from 'react'
import { MessageSquare, Search, RefreshCw, Star, ThumbsUp, Wrench, Info } from 'lucide-react'
import Layout from '../../components/layout/Layout'
import LoadingSpinner from '../../components/common/LoadingSpinner'
import feedbackService from '../../services/feedbackService'
import { formatDistanceToNow } from 'date-fns'
import toast from 'react-hot-toast'

const TYPE_STYLES = {
  POSITIVE:     { bg: 'bg-green-50',  border: 'border-green-200',  icon: ThumbsUp,     color: 'text-green-600',  label: 'Positive' },
  CONSTRUCTIVE: { bg: 'bg-orange-50', border: 'border-orange-200', icon: Wrench,       color: 'text-orange-600', label: 'Constructive' },
  GENERAL:      { bg: 'bg-blue-50',   border: 'border-blue-200',   icon: Info,         color: 'text-blue-600',   label: 'General' },
}

function getTypeStyle(type) {
  return TYPE_STYLES[type] || TYPE_STYLES.GENERAL
}

function timeAgo(dateString) {
  if (!dateString) return ''
  try { return formatDistanceToNow(new Date(dateString), { addSuffix: true }) }
  catch { return dateString }
}

function MetricChip({ label, value, color }) {
  return (
    <div className={`rounded-xl p-4 ${color}`}>
      <p className="text-2xl font-bold">{value ?? '—'}</p>
      <p className="text-xs font-medium mt-0.5 opacity-80">{label}</p>
    </div>
  )
}

export default function EmployeeFeedbackPage() {
  const [feedbacks, setFeedbacks]   = useState([])
  const [loading, setLoading]       = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [typeFilter, setTypeFilter] = useState('')

  useEffect(() => { loadFeedback() }, [])

  const loadFeedback = async () => {
    setLoading(true)
    try {
      const data = await feedbackService.getFeedback()
      const list = Array.isArray(data) ? data : data?.content || data || []
      setFeedbacks(list)
    } catch (err) {
      if (err.response?.status === 403) {
        // Some backends scope feedback to manager — just show empty state
        setFeedbacks([])
      } else {
        toast.error('Failed to load feedback')
      }
    } finally {
      setLoading(false)
    }
  }

  const filtered = feedbacks.filter(fb => {
    const matchType   = !typeFilter || fb.feedbackType === typeFilter
    const matchSearch = !searchTerm ||
      fb.comments?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      fb.fromUserName?.toLowerCase().includes(searchTerm.toLowerCase())
    return matchType && matchSearch
  })

  const positive     = feedbacks.filter(f => f.feedbackType === 'POSITIVE').length
  const constructive = feedbacks.filter(f => f.feedbackType === 'CONSTRUCTIVE').length
  const general      = feedbacks.filter(f => f.feedbackType === 'GENERAL').length

  return (
    <Layout title="My Feedback">
      {/* Metrics */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
        <MetricChip label="Total Feedback"  value={feedbacks.length} color="bg-blue-50 text-blue-700" />
        <MetricChip label="Positive"        value={positive}         color="bg-green-50 text-green-700" />
        <MetricChip label="Constructive"    value={constructive}     color="bg-orange-50 text-orange-700" />
        <MetricChip label="General"         value={general}          color="bg-gray-50 text-gray-700" />
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input type="text" placeholder="Search in feedback..."
            value={searchTerm} onChange={e => setSearchTerm(e.target.value)}
            className="input-field pl-9" />
        </div>
        <select value={typeFilter} onChange={e => setTypeFilter(e.target.value)} className="input-field w-auto">
          <option value="">All Types</option>
          <option value="POSITIVE">Positive</option>
          <option value="CONSTRUCTIVE">Constructive</option>
          <option value="GENERAL">General</option>
        </select>
        <button onClick={loadFeedback} className="btn-secondary p-2"><RefreshCw size={16} /></button>
      </div>

      {/* Feedback List */}
      {loading ? (
        <LoadingSpinner message="Loading feedback..." />
      ) : filtered.length === 0 ? (
        <div className="card text-center py-20">
          <MessageSquare size={48} className="mx-auto mb-3 text-gray-200" />
          <p className="text-gray-500 font-medium">No feedback found</p>
          <p className="text-gray-400 text-sm mt-1">
            Feedback from your manager will appear here after reviews are completed.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((fb, idx) => {
            const style = getTypeStyle(fb.feedbackType)
            const Icon  = style.icon
            return (
              <div
                key={fb.feedbackId || idx}
                className={`rounded-xl border p-5 ${style.bg} ${style.border} transition-all hover:shadow-sm`}
              >
                <div className="flex items-start gap-4">
                  {/* Type icon */}
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 bg-white bg-opacity-60`}>
                    <Icon size={18} className={style.color} />
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <span className={`text-xs font-semibold px-2 py-0.5 rounded-full bg-white bg-opacity-60 ${style.color}`}>
                        {style.label}
                      </span>
                      {fb.goalId && (
                        <span className="text-xs text-gray-500 bg-white bg-opacity-60 px-2 py-0.5 rounded-full">
                          Goal #{fb.goalId}
                        </span>
                      )}
                      {fb.reviewId && (
                        <span className="text-xs text-gray-500 bg-white bg-opacity-60 px-2 py-0.5 rounded-full">
                          Review #{fb.reviewId}
                        </span>
                      )}
                    </div>

                    <p className="text-sm text-gray-800 leading-relaxed">{fb.comments}</p>

                    <div className="flex items-center gap-3 mt-2 text-xs text-gray-500">
                      {fb.fromUserName && <span>From: <strong>{fb.fromUserName}</strong></span>}
                      {fb.createdDate && <span>{timeAgo(fb.createdDate)}</span>}
                    </div>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Info note */}
      <div className="mt-6 bg-blue-50 border border-blue-100 rounded-xl p-4 text-xs text-blue-600 flex items-start gap-2">
        <MessageSquare size={14} className="mt-0.5 flex-shrink-0" />
        <p>Feedback is shared by your manager after goal reviews and performance assessments. It reflects observations on your work quality and professional development.</p>
      </div>
    </Layout>
  )
}
