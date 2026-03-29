import { useState } from 'react'
import { ROLE_COLORS } from '../lib/constants'
import s from './Modal.module.css'

const ROLE_CLS = {
  Admin:     s.roleAdmin,
  Planner:   s.rolePlanner,
  Logistics: s.roleLogistics,
  Inventory: s.roleInventory,
}

export default function AccountsModal({ accounts, onSave, onClose, toast }) {
  const [editId, setEditId] = useState(null)
  const [form,   setForm]   = useState({ username:'', password:'', role:'Planner' })
  const [saving, setSaving] = useState(false)

  function set(k, v) { setForm(f => ({ ...f, [k]: v })) }

  function startEdit(a) {
    setEditId(a.id)
    setForm({ username: a.username, password: a.password, role: a.role })
  }

  function cancel() {
    setEditId(null)
    setForm({ username:'', password:'', role:'Planner' })
  }

  async function save() {
    const { username, password, role } = form
    if (!username || !password) { alert('Username and password required.'); return }
    setSaving(true)
    try {
      await onSave(editId, { username, password, role })
      toast(editId ? 'Account updated ✓' : 'Account created ✓')
      cancel()
    } catch (e) { alert('Error: ' + e.message) }
    finally { setSaving(false) }
  }

  async function del(id) {
    const a = accounts.find(x => x.id === id)
    if (a.role === 'Admin') { alert('Cannot delete Admin account.'); return }
    if (!confirm(`Delete account "${a.username}"?`)) return
    try {
      await onSave(id, null) // null signals delete
      toast('Account deleted')
    } catch (e) { alert('Error: ' + e.message) }
  }

  return (
    <div className={s.overlay} onClick={e => e.target === e.currentTarget && onClose()}>
      <div className={`${s.modal} ${s.modalSm}`}>
        <div className={s.header}>
          <div className={s.title}>Account Management</div>
          <button className={s.closeBtn} onClick={onClose}>✕</button>
        </div>

        <div className={s.accountsList}>
          {accounts.map(a => (
            <div key={a.id} className={s.accountRow}>
              <div className={s.accountAvatar} style={{ background: ROLE_COLORS[a.role] || '#888' }}>
                {a.username.slice(0,2).toUpperCase()}
              </div>
              <div className={s.accountInfo}>
                <div className={s.accountName}>
                  {a.username}
                  <span className={`${s.roleChip} ${ROLE_CLS[a.role] || ''}`}>{a.role}</span>
                </div>
                <div className={s.accountPw}>
                  Password: <span className={s.accountPwVal}>{a.password}</span>
                </div>
              </div>
              <div className={s.accountActions}>
                {a.role !== 'Admin' ? (
                  <>
                    <button className={s.btnSmGhost} onClick={() => startEdit(a)}>✎ Edit</button>
                    <button className={s.btnSmDanger} onClick={() => del(a.id)}>✕</button>
                  </>
                ) : (
                  <span className={s.protected}>Protected</span>
                )}
              </div>
            </div>
          ))}
        </div>

        <hr className={s.divider} />
        <div className={s.subTitle}>{editId ? 'Edit Account' : 'Create New Account'}</div>

        <div className={s.grid}>
          <div className={s.group}>
            <label className={s.label}>Username <span className={s.req}>*</span></label>
            <input className={s.input} placeholder="username" value={form.username} onChange={e => set('username', e.target.value)} />
          </div>
          <div className={s.group}>
            <label className={s.label}>Password <span className={s.req}>*</span></label>
            <input className={s.input} placeholder="password" value={form.password} onChange={e => set('password', e.target.value)} />
          </div>
          <div className={s.group}>
            <label className={s.label}>Role</label>
            <select className={s.input} value={form.role} onChange={e => set('role', e.target.value)}>
              <option>Planner</option>
              <option>Logistics</option>
              <option>Inventory</option>
            </select>
          </div>
        </div>

        <div className={s.footer}>
          <button className={`${s.btn} ${s.btnGhost}`} onClick={cancel}>Cancel</button>
          <button className={`${s.btn} ${s.btnPrimary}`} onClick={save} disabled={saving}>
            {saving ? 'Saving…' : editId ? 'Save Changes' : 'Create Account'}
          </button>
        </div>
      </div>
    </div>
  )
}
