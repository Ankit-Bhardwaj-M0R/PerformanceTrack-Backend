import React, { useState, useEffect } from 'react'
import { Plus, Search, Users, Edit2 } from 'lucide-react'
import Layout from '../../components/layout/Layout'
import LoadingSpinner from '../../components/common/LoadingSpinner'
import StatusBadge from '../../components/common/StatusBadge'
import Pagination from '../../components/common/Pagination'
import UserFormModal from '../../components/admin/UserFormModal'
import { useAuth } from '../../context/AuthContext'
import userService from '../../services/userService'
import toast from 'react-hot-toast'

export default function UsersPage() {
  const { user: currentUser } = useAuth()

  const [users, setUsers] = useState([])
  const [managers, setManagers] = useState([])
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(0)
  const [totalPages, setTotalPages] = useState(0)
  const [totalElements, setTotalElements] = useState(0)
  const [searchTerm, setSearchTerm] = useState('')
  const [showModal, setShowModal] = useState(false)
  const [editUser, setEditUser] = useState(null)
  const [submitting, setSubmitting] = useState(false)

  const [form, setForm] = useState({
    name: '', email: '', password: '', role: 'EMPLOYEE',
    department: '', managerId: '', status: 'ACTIVE'
  })

  useEffect(() => { loadUsers() }, [page])

  const loadUsers = async () => {
    setLoading(true)
    try {
      const data = await userService.getAllUsers(page, 15)
      const list = data?.content || data || []
      setUsers(list)
      setTotalPages(data?.totalPages || 1)
      setTotalElements(data?.totalElements || list.length)
      // Extract managers for the "assign manager" dropdown
      setManagers(list.filter(u => u.role === 'MANAGER' || u.role === 'ADMIN'))
    } catch {
      toast.error('Failed to load users')
    } finally {
      setLoading(false)
    }
  }

  const openCreate = () => {
    setEditUser(null)
    setForm({ name: '', email: '', password: '', role: 'EMPLOYEE', department: '', managerId: '', status: 'ACTIVE' })
    setShowModal(true)
  }

  const openEdit = (u) => {
    setEditUser(u)
    setForm({ name: u.name, email: u.email, password: '', role: u.role, department: u.department || '', managerId: u.manager?.userId || '', status: u.status || 'ACTIVE' })
    setShowModal(true)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.name || !form.email || (!editUser && !form.password)) {
      toast.error('Name, email, and password are required for new users')
      return
    }
    setSubmitting(true)
    try {
      if (editUser) {
        const updateData = { ...form }
        if (!updateData.password) delete updateData.password
        await userService.updateUser(editUser.userId, updateData)
        toast.success('User updated!')
      } else {
        await userService.createUser(form)
        toast.success('User created!')
      }
      setShowModal(false)
      loadUsers()
    } catch (err) {
      toast.error(err.response?.data?.msg || 'Operation failed')
    } finally {
      setSubmitting(false)
    }
  }

  const filtered = users.filter(u =>
    u.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    u.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    u.department?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <Layout title="User Management">
      {/* Toolbar */}
      <div className="flex gap-3 mb-6">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input type="text" placeholder="Search by name, email, or department..."
            value={searchTerm} onChange={e => setSearchTerm(e.target.value)}
            className="input-field pl-9" />
        </div>
        <button onClick={openCreate} className="btn-primary flex items-center gap-2">
          <Plus size={18} /> Add User
        </button>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        {['ADMIN', 'MANAGER', 'EMPLOYEE'].map(role => (
          <div key={role} className="card text-center py-4">
            <p className="text-2xl font-bold text-gray-800">
              {users.filter(u => u.role === role).length}
            </p>
            <StatusBadge status={role} />
          </div>
        ))}
      </div>

      {/* Users Table */}
      {loading ? (
        <LoadingSpinner />
      ) : (
        <div className="card p-0 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  {['Name', 'Email', 'Role', 'Department', 'Status', 'Actions'].map(h => (
                    <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filtered.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="text-center py-12 text-gray-400">
                      <Users size={32} className="mx-auto mb-2 opacity-50" />
                      <p>No users found</p>
                    </td>
                  </tr>
                ) : filtered.map(u => (
                  <tr key={u.userId} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-blue-100 text-blue-700 rounded-full flex items-center justify-center font-semibold text-sm">
                          {u.name?.charAt(0)}
                        </div>
                        <span className="font-medium text-gray-800">{u.name}</span>
                        {u.userId === currentUser?.userId && (
                          <span className="text-xs bg-blue-100 text-blue-600 px-1.5 py-0.5 rounded">You</span>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-gray-600">{u.email}</td>
                    <td className="px-4 py-3"><StatusBadge status={u.role} /></td>
                    <td className="px-4 py-3 text-gray-600">{u.department || '—'}</td>
                    <td className="px-4 py-3"><StatusBadge status={u.status || 'ACTIVE'} /></td>
                    <td className="px-4 py-3">
                      <button onClick={() => openEdit(u)}
                        className="text-blue-600 hover:text-blue-800 p-1.5 rounded-lg hover:bg-blue-50 transition-colors">
                        <Edit2 size={15} />
                      </button>
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

      <UserFormModal
        isOpen={showModal} onClose={() => setShowModal(false)}
        editUser={editUser}
        form={form} setForm={setForm}
        managers={managers}
        onSubmit={handleSubmit} submitting={submitting}
      />
    </Layout>
  )
}
