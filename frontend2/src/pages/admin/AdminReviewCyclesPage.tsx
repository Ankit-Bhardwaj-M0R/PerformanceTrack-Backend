import React, { useState, useEffect } from 'react'
import { Plus, RefreshCw, Calendar, Edit2 } from 'lucide-react'
import Layout from '../../components/layout/Layout'
import Modal from '../../components/common/Modal'
import LoadingSpinner from '../../components/common/LoadingSpinner'
import StatusBadge from '../../components/common/StatusBadge'
import { useAuth } from '../../context/AuthContext'
import { reviewCycleService } from '../../services/reviewService'
import toast from 'react-hot-toast'
import type { ReviewCycle, ReviewCycleFormState } from '../../types'

export default function AdminReviewCyclesPage(): JSX.Element {
  const { isAdmin } = useAuth()

  const [cycles, setCycles]         = useState<ReviewCycle[]>([])
  const [loading, setLoading]       = useState<boolean>(true)
  const [showModal, setShowModal]   = useState<boolean>(false)
  const [editCycle, setEditCycle]   = useState<ReviewCycle | null>(null)
  const [submitting, setSubmitting] = useState<boolean>(false)

  const [form, setForm] = useState<ReviewCycleFormState>({
    title: '',
    startDate: '',
    endDate: '',
    requiresCompletionApproval: true,
    evidenceRequired: true,
  })

  useEffect(() => { loadCycles() }, [])

  const loadCycles = async (): Promise<void> => {
    setLoading(true)
    try {
      const data = await reviewCycleService.getAllCycles()
      const list = (data as { content?: ReviewCycle[] }).content ?? (data as ReviewCycle[]) ?? []
      setCycles(list)
    } catch {
      toast.error('Failed to load review cycles')
    } finally {
      setLoading(false)
    }
  }

  const openCreate = (): void => {
    setEditCycle(null)
    setForm({ title: '', startDate: '', endDate: '', requiresCompletionApproval: true, evidenceRequired: true })
    setShowModal(true)
  }

  const openEdit = (cycle: ReviewCycle): void => {
    setEditCycle(cycle)
    setForm({
      title: cycle.title,
      startDate: cycle.startDate ?? '',
      endDate: cycle.endDate ?? '',
      requiresCompletionApproval: cycle.requiresCompletionApproval ?? true,
      evidenceRequired: cycle.evidenceRequired ?? true,
    })
    setShowModal(true)
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>): Promise<void> => {
    e.preventDefault()
    if (!form.title || !form.startDate || !form.endDate) {
      toast.error('Title, start date, and end date are required')
      return
    }
    setSubmitting(true)
    try {
      if (editCycle) {
        await reviewCycleService.updateCycle(editCycle.cycleId, form, editCycle.status ?? '')
        toast.success('Review cycle updated!')
      } else {
        await reviewCycleService.createCycle(form)
        toast.success('Review cycle created!')
      }
      setShowModal(false)
      loadCycles()
    } catch (err: unknown) {
      const axiosError = err as { response?: { data?: { msg?: string } } }
      toast.error(axiosError.response?.data?.msg || 'Operation failed')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Layout title="Review Cycles">
      <div className="flex justify-between items-center mb-6">
        <p className="text-sm text-gray-500">
          Manage performance review periods. Create cycles to trigger employee self-assessments.
        </p>
        {isAdmin() && (
          <button onClick={openCreate} className="btn-primary flex items-center gap-2">
            <Plus size={18} /> New Cycle
          </button>
        )}
      </div>

      {loading ? (
        <LoadingSpinner />
      ) : cycles.length === 0 ? (
        <div className="card text-center py-16">
          <RefreshCw size={48} className="mx-auto mb-3 text-gray-300" />
          <p className="text-gray-500">No review cycles created yet</p>
          {isAdmin() && (
            <button onClick={openCreate} className="btn-primary mt-4">Create First Cycle</button>
          )}
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {cycles.map((cycle) => (
            <div key={cycle.cycleId} className="card hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between mb-3">
                <StatusBadge status={cycle.status ?? 'UPCOMING'} />
                {isAdmin() && (
                  <button onClick={() => openEdit(cycle)}
                    className="text-gray-400 hover:text-gray-600 p-1">
                    <Edit2 size={16} />
                  </button>
                )}
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">{cycle.title}</h3>
              <div className="space-y-1.5 text-sm text-gray-600">
                <div className="flex items-center gap-2">
                  <Calendar size={14} className="text-gray-400" />
                  <span>{cycle.startDate} → {cycle.endDate}</span>
                </div>
                <div className="flex gap-3 mt-3">
                  <span className={`text-xs px-2 py-0.5 rounded-full ${cycle.requiresCompletionApproval ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-500'}`}>
                    {cycle.requiresCompletionApproval ? 'Approval Required' : 'No Approval'}
                  </span>
                  <span className={`text-xs px-2 py-0.5 rounded-full ${cycle.evidenceRequired ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                    {cycle.evidenceRequired ? 'Evidence Required' : 'No Evidence'}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create/Edit Modal */}
      <Modal isOpen={showModal} onClose={() => setShowModal(false)}
        title={editCycle ? 'Edit Review Cycle' : 'Create Review Cycle'}>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="form-label">Cycle Title *</label>
            <input className="input-field" value={form.title}
              onChange={e => setForm({ ...form, title: e.target.value })}
              placeholder="e.g., Q1 2026 Performance Review" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="form-label">Start Date *</label>
              <input type="date" className="input-field" value={form.startDate}
                onChange={e => setForm({ ...form, startDate: e.target.value })} />
            </div>
            <div>
              <label className="form-label">End Date *</label>
              <input type="date" className="input-field" value={form.endDate}
                onChange={e => setForm({ ...form, endDate: e.target.value })} />
            </div>
          </div>
          <div className="space-y-3">
            <label className="flex items-center gap-3 cursor-pointer">
              <input type="checkbox" checked={form.requiresCompletionApproval}
                onChange={e => setForm({ ...form, requiresCompletionApproval: e.target.checked })}
                className="w-4 h-4 text-blue-600" />
              <span className="text-sm text-gray-700">Requires completion approval from manager</span>
            </label>
            <label className="flex items-center gap-3 cursor-pointer">
              <input type="checkbox" checked={form.evidenceRequired}
                onChange={e => setForm({ ...form, evidenceRequired: e.target.checked })}
                className="w-4 h-4 text-blue-600" />
              <span className="text-sm text-gray-700">Evidence link required for goal completion</span>
            </label>
          </div>
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={() => setShowModal(false)} className="btn-secondary flex-1">Cancel</button>
            <button type="submit" disabled={submitting} className="btn-primary flex-1">
              {submitting ? 'Saving...' : editCycle ? 'Update Cycle' : 'Create Cycle'}
            </button>
          </div>
        </form>
      </Modal>
    </Layout>
  )
}
