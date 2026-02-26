import React, { useState, useEffect } from 'react'
import { Users, Search, Eye, Mail, Briefcase, Target, ClipboardList } from 'lucide-react'
import Layout from '../../components/layout/Layout'
import LoadingSpinner from '../../components/common/LoadingSpinner'
import Modal from '../../components/common/Modal'
import StatusBadge from '../../components/common/StatusBadge'
import MetricChip from '../../components/common/MetricChip'
import Avatar from '../../components/common/Avatar'
import EmptyState from '../../components/common/EmptyState'
import { useAuth } from '../../context/AuthContext'
import userService from '../../services/userService'
import goalService from '../../services/goalService'
import { performanceReviewService } from '../../services/reviewService'
import toast from 'react-hot-toast'

export default function TeamMembersPage() {
  const { user } = useAuth()

  const [members, setMembers]     = useState([])
  const [loading, setLoading]     = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [deptFilter, setDeptFilter] = useState('')

  const [selectedMember, setSelectedMember] = useState(null)
  const [memberGoals, setMemberGoals]       = useState([])
  const [memberReviews, setMemberReviews]   = useState([])
  const [detailLoading, setDetailLoading]   = useState(false)
  const [showDetailModal, setShowDetailModal] = useState(false)

  useEffect(() => { loadTeam() }, [])

  const loadTeam = async () => {
    setLoading(true)
    try {
      const data = await userService.getTeam(user.userId)
      const list = data?.content || data || []
      setMembers(Array.isArray(list) ? list : [])
    } catch {
      // fallback: try getAllUsers and filter
      try {
        const data = await userService.getAllUsers(0, 100)
        const list = data?.content || data || []
        setMembers(list.filter(u => u.role === 'EMPLOYEE'))
      } catch {
        toast.error('Failed to load team members')
      }
    } finally {
      setLoading(false)
    }
  }

  const openDetail = async (member) => {
    setSelectedMember(member)
    setShowDetailModal(true)
    setDetailLoading(true)
    try {
      const [goalsRes, reviewsRes] = await Promise.allSettled([
        goalService.getGoals(0, 50),
        performanceReviewService.getReviews(0, 20),
      ])
      if (goalsRes.status === 'fulfilled') {
        const all = goalsRes.value?.content || goalsRes.value || []
        setMemberGoals(all.filter(g => g.assignedToUserId === member.userId || g.userId === member.userId))
      }
      if (reviewsRes.status === 'fulfilled') {
        const all = reviewsRes.value?.content || reviewsRes.value || []
        setMemberReviews(all.filter(r => r.userId === member.userId))
      }
    } catch {
      // silently fail
    } finally {
      setDetailLoading(false)
    }
  }

  const departments = [...new Set(members.map(m => m.department).filter(Boolean))]

  const filtered = members.filter(m => {
    const matchSearch = !searchTerm ||
      m.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      m.email?.toLowerCase().includes(searchTerm.toLowerCase())
    const matchDept = !deptFilter || m.department === deptFilter
    return matchSearch && matchDept
  })

  // Metrics
  const activeMembers   = members.filter(m => m.status === 'ACTIVE' || !m.status).length
  const departments_cnt = [...new Set(members.map(m => m.department).filter(Boolean))].length

  return (
    <Layout title="Team Members">
      {/* Metrics */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
        <MetricChip label="Total Members"   value={members.length}  color="bg-purple-50 text-purple-700" />
        <MetricChip label="Active Members"  value={activeMembers}   color="bg-green-50 text-green-700" />
        <MetricChip label="Departments"     value={departments_cnt} color="bg-blue-50 text-blue-700" />
        <MetricChip label="Inactive"        value={members.length - activeMembers} color="bg-gray-50 text-gray-600" />
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input type="text" placeholder="Search by name or email..."
            value={searchTerm} onChange={e => setSearchTerm(e.target.value)}
            className="input-field pl-9" />
        </div>
        {departments.length > 0 && (
          <select value={deptFilter} onChange={e => setDeptFilter(e.target.value)} className="input-field w-auto">
            <option value="">All Departments</option>
            {departments.map(d => <option key={d}>{d}</option>)}
          </select>
        )}
      </div>

      {/* Member Cards Grid */}
      {loading ? (
        <LoadingSpinner message="Loading team members..." />
      ) : filtered.length === 0 ? (
        <EmptyState icon={Users} title="No team members found" subtitle="Try adjusting your search or filters." />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map(member => (
            <div
              key={member.userId}
              className="card hover:shadow-md transition-all cursor-pointer border-l-4 border-l-purple-400"
              onClick={() => openDetail(member)}
            >
              <div className="flex items-start gap-3">
                <Avatar name={member.name} />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <h3 className="font-semibold text-gray-900 truncate">{member.name}</h3>
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium flex-shrink-0
                      ${member.status === 'ACTIVE' || !member.status ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                      {member.status || 'ACTIVE'}
                    </span>
                  </div>
                  <div className="flex items-center gap-1 mt-1 text-xs text-gray-500">
                    <Mail size={12} />
                    <span className="truncate">{member.email}</span>
                  </div>
                  {member.department && (
                    <div className="flex items-center gap-1 mt-1 text-xs text-gray-500">
                      <Briefcase size={12} />
                      <span>{member.department}</span>
                    </div>
                  )}
                </div>
              </div>
              <div className="mt-3 pt-3 border-t border-gray-100 flex items-center justify-between">
                <span className="text-xs text-gray-400">ID: {member.userId}</span>
                <button className="text-xs text-purple-600 hover:text-purple-800 flex items-center gap-1">
                  <Eye size={12} /> View Details
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Member Detail Modal */}
      <Modal isOpen={showDetailModal} onClose={() => setShowDetailModal(false)} title="Team Member Details" size="lg">
        {selectedMember && (
          <div className="space-y-5">
            {/* Profile Header */}
            <div className="flex items-center gap-4 p-4 bg-purple-50 rounded-xl">
              <Avatar name={selectedMember.name} size="lg" />
              <div>
                <h3 className="text-xl font-bold text-gray-900">{selectedMember.name}</h3>
                <p className="text-sm text-gray-500">{selectedMember.email}</p>
                <div className="flex gap-2 mt-2 flex-wrap">
                  <span className="text-xs bg-purple-100 text-purple-700 px-2 py-0.5 rounded-full font-medium">
                    {selectedMember.role}
                  </span>
                  {selectedMember.department && (
                    <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">
                      {selectedMember.department}
                    </span>
                  )}
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium
                    ${selectedMember.status === 'ACTIVE' || !selectedMember.status ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                    {selectedMember.status || 'ACTIVE'}
                  </span>
                </div>
              </div>
            </div>

            {detailLoading ? (
              <LoadingSpinner message="Loading member details..." />
            ) : (
              <>
                {/* Goals Summary */}
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <Target size={16} className="text-blue-600" />
                    <h4 className="font-semibold text-gray-800">Goals ({memberGoals.length})</h4>
                  </div>
                  {memberGoals.length === 0 ? (
                    <p className="text-sm text-gray-400 italic">No goals found for this member</p>
                  ) : (
                    <div className="space-y-2 max-h-40 overflow-y-auto">
                      {memberGoals.map(g => (
                        <div key={g.goalId} className="flex items-center justify-between p-2 bg-gray-50 rounded-lg">
                          <div className="min-w-0">
                            <p className="text-sm font-medium text-gray-700 truncate">{g.title}</p>
                            <p className="text-xs text-gray-400">{g.category} · {g.priority}</p>
                          </div>
                          <StatusBadge status={g.status} />
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Reviews Summary */}
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <ClipboardList size={16} className="text-green-600" />
                    <h4 className="font-semibold text-gray-800">Reviews ({memberReviews.length})</h4>
                  </div>
                  {memberReviews.length === 0 ? (
                    <p className="text-sm text-gray-400 italic">No reviews found for this member</p>
                  ) : (
                    <div className="space-y-2 max-h-40 overflow-y-auto">
                      {memberReviews.map(r => (
                        <div key={r.reviewId} className="flex items-center justify-between p-2 bg-gray-50 rounded-lg">
                          <div>
                            <p className="text-xs text-gray-500">Review #{r.reviewId}</p>
                            {r.managerRating && <p className="text-xs text-gray-400">Rating: {r.managerRating}/5</p>}
                          </div>
                          <StatusBadge status={r.status} />
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </>
            )}

            <button onClick={() => setShowDetailModal(false)} className="btn-secondary w-full">Close</button>
          </div>
        )}
      </Modal>
    </Layout>
  )
}
