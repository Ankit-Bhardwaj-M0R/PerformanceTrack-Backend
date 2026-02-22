import React, { useState, useEffect } from 'react'
import { Shield, Search, Download, Filter } from 'lucide-react'
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
//   GET  /api/v1/audit-logs
//   POST /api/v1/audit-logs/export
// ─────────────────────────────────────────────────────────────────────────────

// Color coding for different action types
const ACTION_COLORS = {
  LOGIN:              'bg-green-100 text-green-700',
  LOGOUT:             'bg-gray-100 text-gray-600',
  CREATE:             'bg-blue-100 text-blue-700',
  UPDATE:             'bg-yellow-100 text-yellow-700',
  DELETE:             'bg-red-100 text-red-700',
  APPROVE:            'bg-green-100 text-green-700',
  REJECT:             'bg-red-100 text-red-700',
  PASSWORD_CHANGE:    'bg-purple-100 text-purple-700',
}

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
  const [filters, setFilters] = useState({ search: '', dateFrom: '', dateTo: '' })

  useEffect(() => { loadLogs() }, [page])

  const loadLogs = async () => {
    setLoading(true)
    try {
      const apiFilters = {}
      if (filters.dateFrom) apiFilters.dateFrom = filters.dateFrom
      if (filters.dateTo) apiFilters.dateTo = filters.dateTo

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

  // Client-side search filter
  const filtered = logs.filter(log =>
    !filters.search ||
    log.action?.toLowerCase().includes(filters.search.toLowerCase()) ||
    log.details?.toLowerCase().includes(filters.search.toLowerCase()) ||
    String(log.userId).includes(filters.search)
  )

  function formatDate(dateString) {
    if (!dateString) return '—'
    try { return new Date(dateString).toLocaleString() }
    catch { return dateString }
  }

  return (
    <Layout title="Audit Logs">
      {/* Filters Toolbar */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input type="text" placeholder="Search by action, details, user ID..."
            value={filters.search}
            onChange={e => setFilters({ ...filters, search: e.target.value })}
            className="input-field pl-9" />
        </div>
        <input type="date" className="input-field w-auto" value={filters.dateFrom}
          onChange={e => setFilters({ ...filters, dateFrom: e.target.value })}
          title="From date" />
        <input type="date" className="input-field w-auto" value={filters.dateTo}
          onChange={e => setFilters({ ...filters, dateTo: e.target.value })}
          title="To date" />
        <button onClick={loadLogs} className="btn-primary px-4">
          <Filter size={16} />
        </button>
        <button onClick={handleExport} disabled={exporting}
          className="btn-secondary flex items-center gap-2">
          <Download size={16} />
          {exporting ? 'Exporting...' : 'Export'}
        </button>
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
                  {['Timestamp', 'User ID', 'Action', 'Details', 'Entity', 'IP Address', 'Status'].map(h => (
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
                ) : filtered.map((log, idx) => (
                  <tr key={log.auditId || idx} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3 text-xs text-gray-500 whitespace-nowrap">
                      {formatDate(log.timestamp)}
                    </td>
                    <td className="px-4 py-3 text-gray-700 font-mono text-xs">{log.userId || '—'}</td>
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
                ))}
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
