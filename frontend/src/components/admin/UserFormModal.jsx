import React from 'react'
import Modal from '../common/Modal'

const ROLES = ['ADMIN', 'MANAGER', 'EMPLOYEE']

/**
 * UserFormModal — Create or Edit a user account.
 *
 * Props:
 *   isOpen       {boolean}
 *   onClose      {() => void}
 *   editUser     {object|null}   — null when creating
 *   form         {object}        — { name, email, password, role, department, managerId, status }
 *   setForm      {fn}
 *   managers     {array}         — list of manager/admin users for the dropdown
 *   onSubmit     {(e) => void}
 *   submitting   {boolean}
 */
export default function UserFormModal({
  isOpen, onClose, editUser,
  form, setForm, managers,
  onSubmit, submitting,
}) {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={editUser ? `Edit User: ${editUser.name}` : 'Create New User'}
      size="lg"
    >
      <form onSubmit={onSubmit} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="form-label">Full Name *</label>
            <input
              className="input-field"
              value={form.name}
              onChange={e => setForm({ ...form, name: e.target.value })}
              placeholder="John Doe"
            />
          </div>
          <div>
            <label className="form-label">Email Address *</label>
            <input
              type="email"
              className="input-field"
              value={form.email}
              onChange={e => setForm({ ...form, email: e.target.value })}
              placeholder="john@company.com"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="form-label">
              {editUser ? 'New Password (leave blank to keep)' : 'Password *'}
            </label>
            <input
              type="password"
              className="input-field"
              value={form.password}
              onChange={e => setForm({ ...form, password: e.target.value })}
              placeholder={editUser ? 'Leave blank to keep current' : 'Min 8 characters'}
            />
          </div>
          <div>
            <label className="form-label">Department</label>
            <input
              className="input-field"
              value={form.department}
              onChange={e => setForm({ ...form, department: e.target.value })}
              placeholder="e.g., Engineering, Marketing"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="form-label">Role *</label>
            <select
              className="input-field"
              value={form.role}
              onChange={e => setForm({ ...form, role: e.target.value })}
            >
              {ROLES.map(r => <option key={r}>{r}</option>)}
            </select>
          </div>
          <div>
            <label className="form-label">Status</label>
            <select
              className="input-field"
              value={form.status}
              onChange={e => setForm({ ...form, status: e.target.value })}
            >
              <option value="ACTIVE">Active</option>
              <option value="INACTIVE">Inactive</option>
            </select>
          </div>
        </div>

        {form.role === 'EMPLOYEE' && (
          <div>
            <label className="form-label">Assign Manager</label>
            <select
              className="input-field"
              value={form.managerId}
              onChange={e => setForm({ ...form, managerId: e.target.value })}
            >
              <option value="">No manager assigned</option>
              {managers.map(m => (
                <option key={m.userId} value={m.userId}>{m.name} — {m.department}</option>
              ))}
            </select>
          </div>
        )}

        <div className="flex gap-3 pt-2">
          <button type="button" onClick={onClose} className="btn-secondary flex-1">
            Cancel
          </button>
          <button type="submit" disabled={submitting} className="btn-primary flex-1">
            {submitting ? 'Saving...' : editUser ? 'Update User' : 'Create User'}
          </button>
        </div>
      </form>
    </Modal>
  )
}
