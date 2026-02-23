import React, { useState, useEffect } from 'react'
import { Shield, Search, Download, Filter, RefreshCw } from 'lucide-react'
import Layout from '../../components/layout/Layout'
import LoadingSpinner from '../../components/common/LoadingSpinner'
import Pagination from '../../components/common/Pagination'
import auditService from '../../services/auditService'
import toast from 'react-hot-toast'

// ─── AUDIT LOGS PAGE ──────────────────────────────────────────────────────────
// ADMIN ONLY — System audit trail for compliance and security
// Every action in the system is recorded here.
//
// APIs Used:
//   GET  /api/v1/audit-logs?userId=&action=&startDt=&endDt=&page=&size=
//   POST /api/v1/audit-logs/export
// ─────────────────────────────────────────────────────────────────────────────

// Color coding for different action types
const ACTION_COLORS = {
  LOGIN:           'bg-green-100 text-green-700',
  LOGOUT:          'bg-gray-100 text-gray-600',
  CREATE:          'bg-blue-100 text-blue-700',
  UPDATE:          'bg-yellow-100 text-yellow-700',
  DELETE:          'bg-red-100 text-red-700',
  APPROVE:         'bg-green-100 text-green-700',
  REJECT:          'bg-red-100 text-red-700',
  PASSWORD_CHANGE: 'bg-purple-100 text-purple-700',
}

const ACTION_TYPE_OPTIONS = [
  '', 'LOGIN', 'LOGOUT', 'CREATE', 'UPDATE', 'DELETE',
  'APPROVE', 'REJECT', 'PASSWORD_CHANGE',
]

function getActionColor(action) {
  const key = Object.keys(ACTION_COLORS).find(k => action?.toUpperCase().includes(k))
  return key ? ACTION_COLORS[key] : 'bg-gray-100 text-gray-600'
}

export default function AuditLogsPage() {
  const [logs, setLogs] = useState([])
  const [loading, setLoading] = useState(true)
  const [exporting, setExporting] = useState(false)
  const [page, setPage] = useState(0)
  const [totalPages, setTotalPages] = useState(0)
  const [totalElements, setTotalElements] = useState(0)

  // Filters — dateFrom/dateTo are date-picker strings (YYYY-MM-DD)
  const [filters, setFilters] = useState({
    search: '',
    userId: '',
    action: '',
    dateFrom: '',
    dateTo: '',
  })

  useEffect(() => { loadLogs() }, [page])

  const loadLogs = async () => {
    setLoading(true)
    try {
      const apiFilters = {}
      // Backend params: userId (Integer), action (String), startDt/endDt (ISO DateTime)
      if (filters.userId)   apiFilters.userId  = parseInt(filters.userId)
      if (filters.action)   apiFilters.action  = filters.action
      if (filters.dateFrom) apiFilters.startDt = filters.dateFrom + 'T00:00:00'
      if (filters.dateTo)   apiFilters.endDt   = filters.dateTo   + 'T23:59:59'

      const data = await auditService.getAuditLogs(page, 20, apiFilters)
      const list = data?.content || data || []
      setLogs(list)
      setTotalPages(data?.totalPages || 1)
      setTotalElements(data?.totalElements || list.length)
    } catch {
      toast.error('Failed to load audit logs')
    } finally {
      setLoading(false)
    }
  }

  const handleApplyFilters = () => {
    setPage(0)
    loadLogs()
  }

  const handleClearFilters = () => {
    setFilters({ search: '', userId: '', action: '', dateFrom: '', dateTo: '' })
    setPage(0)
  }

  const handleExport = async () => {
    setExporting(true)
    try {
      await auditService.exportAuditLogs(filters)
      toast.success('Audit logs exported!')
    } catch (err) {
      toast.error(err.response?.data?.msg || 'Export failed')
    } finally {
      setExporting(false)
    }
  }

  // Client-side text search on the server-filtered results
  // AuditLog entity serializes as nested 'user' object: log.user.userId, log.user.name
  const filtered = logs.filter(log => {
    if (!filters.search) return true
    const q = filters.search.toLowerCase()
    const userId = log.user?.userId ?? log.userId
    return (
      log.action?.toLowerCase().includes(q) ||
      log.details?.toLowerCase().includes(q) ||
      String(userId ?? '').includes(q) ||
      log.user?.name?.toLowerCase().includes(q)
    )
  })

  function formatDate(dateString) {
    if (!dateString) return '—'
    try { return new Date(dateString).toLocaleString() }
    catch { return dateString }
  }

  const hasActiveFilters = filters.userId || filters.action || filters.dateFrom || filters.dateTo

  return (
    <Layout title="Audit Logs">
      {/* Filters Toolbar */}
      <div className="card mb-6 space-y-3">
        {/* Row 1: text search + action buttons */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input type="text" placeholder="Search by action, details, user name or ID..."
              value={filters.search}
              onChange={e => setFilters({ ...filters, search: e.target.value })}
              onKeyDown={e => e.key === 'Enter' && handleApplyFilters()}
              className="input-field pl-9" />
          </div>
          <button onClick={handleApplyFilters} className="btn-primary px-4 flex items-center gap-2 whitespace-nowrap">
            <Filter size={16} /> Apply Filters
          </button>
          <button onClick={handleExport} disabled={exporting}
            className="btn-secondary flex items-center gap-2 whitespace-nowrap">
            <Download size={16} />
            {exporting ? 'Exporting...' : 'Export'}
          </button>
          <button onClick={loadLogs} className="btn-secondary p-2" title="Refresh">
            <RefreshCw size={16} />
          </button>
        </div>

        {/* Row 2: advanced filters */}
        <div className="flex flex-col sm:flex-row gap-3 flex-wrap">
          <input
            type="number"
            placeholder="Filter by User ID..."
            value={filters.userId}
            onChange={e => setFilters({ ...filters, userId: e.target.value })}
            className="input-field w-40"
          />
          <select
            value={filters.action}
            onChange={e => setFilters({ ...filters, action: e.target.value })}
            className="input-field w-auto"
          >
            <option value="">All Action Types</option>
            {ACTION_TYPE_OPTIONS.filter(Boolean).map(a => (
              <option key={a} value={a}>{a}</option>
            ))}
          </select>
          <div className="flex items-center gap-2">
            <label className="text-xs text-gray-500 whitespace-nowrap">From:</label>
            <input type="date" className="input-field w-auto" value={filters.dateFrom}
              onChange={e => setFilters({ ...filters, dateFrom: e.target.value })} />
          </div>
          <div className="flex items-center gap-2">
            <label className="text-xs text-gray-500 whitespace-nowrap">To:</label>
            <input type="date" className="input-field w-auto" value={filters.dateTo}
              onChange={e => setFilters({ ...filters, dateTo: e.target.value })} />
          </div>
          {hasActiveFilters && (
            <button onClick={handleClearFilters} className="btn-secondary text-xs px-3">
              Clear Filters
            </button>
          )}
        </div>

        {/* Active filter chips */}
        {hasActiveFilters && (
          <div className="flex flex-wrap gap-2 pt-1 text-xs">
            {filters.userId   && <span className="bg-blue-100 text-blue-700 px-2 py-1 rounded-full">User ID: {filters.userId}</span>}
            {filters.action   && <span className="bg-yellow-100 text-yellow-700 px-2 py-1 rounded-full">Action: {filters.action}</span>}
            {filters.dateFrom && <span className="bg-green-100 text-green-700 px-2 py-1 rounded-full">From: {filters.dateFrom}</span>}
            {filters.dateTo   && <span className="bg-green-100 text-green-700 px-2 py-1 rounded-full">To: {filters.dateTo}</span>}
          </div>
        )}
      </div>

      {/* Stats */}
      <div className="flex items-center gap-4 mb-4">
        <div className="flex items-center gap-2 text-sm text-gray-500">
          <Shield size={16} className="text-blue-500" />
          <span>{totalElements} total log entries</span>
        </div>
        <div className="w-2 h-2 bg-gray-300 rounded-full" />
        <span className="text-sm text-gray-500">Page {page + 1} of {totalPages}</span>
      </div>

      {/* Table */}
      {loading ? (
        <LoadingSpinner message="Loading audit logs..." />
      ) : (
        <div className="card p-0 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  {['Timestamp', 'User', 'Action', 'Details', 'Entity', 'IP Address', 'Status'].map(h => (
                    <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-gray-600 uppercase tracking-wider whitespace-nowrap">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filtered.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="text-center py-16 text-gray-400">
                      <Shield size={40} className="mx-auto mb-2 opacity-30" />
                      <p>No audit logs found</p>
                    </td>
                  </tr>
                ) : filtered.map((log, idx) => {
                  // Support both nested user object (log.user.userId) and flat userId
                  const userId   = log.user?.userId ?? log.userId
                  const userName = log.user?.name

                  return (
                    <tr key={log.auditId || idx} className="hover:bg-gray-50 transition-colors">
                      <td className="px-4 py-3 text-xs text-gray-500 whitespace-nowrap">
                        {formatDate(log.timestamp)}
                      </td>
                      <td className="px-4 py-3">
                        <p className="text-gray-800 font-medium text-xs">{userName || '—'}</p>
                        <p className="text-xs text-gray-400 font-mono">ID: {userId ?? '—'}</p>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${getActionColor(log.action)}`}>
                          {log.action}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-gray-600 max-w-xs">
                        <p className="truncate" title={log.details}>{log.details || '—'}</p>
                      </td>
                      <td className="px-4 py-3 text-xs text-gray-500">
                        {log.relatedEntityType && (
                          <span className="bg-gray-100 px-1.5 py-0.5 rounded">
                            {log.relatedEntityType} #{log.relatedEntityId}
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-xs text-gray-500 font-mono">{log.ipAddress || '—'}</td>
                      <td className="px-4 py-3">
                        <span className={`text-xs px-2 py-0.5 rounded-full ${
                          log.status === 'SUCCESS' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                        }`}>
                          {log.status || 'SUCCESS'}
                        </span>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
          <div className="px-4">
            <Pagination currentPage={page} totalPages={totalPages}
              totalElements={totalElements} onPageChange={setPage} />
          </div>
        </div>
      )}
    </Layout>
  )
}
