import { useState } from 'react'
import { ALL_FIELDS, editableFields } from '../lib/constants'
import s from './Modal.module.css'

const FORM_META = [
  { section: 'Purchase Order Info', color: 'accent' },
  { id:'apo',              label:'APO',                    required:true,  type:'text',   placeholder:'e.g. APO-2024-001' },
  { id:'cpo',              label:'CPO',                    required:true,  type:'text',   placeholder:'e.g. CPO-0045' },
  { id:'prs',              label:'PRS',                    required:false, type:'text',   placeholder:'e.g. PRS-001' },
  { id:'prd',              label:'PRD – PO Received Date', required:false, type:'date' },
  { id:'qty',              label:'Quantity',               required:false, type:'number', placeholder:'0' },
  { id:'type',             label:'Type',                   required:false, type:'select', options:['New','Repeat','Return'] },

  { section: 'Part Details', color: 'accent' },
  { id:'classification',   label:'Classification', required:false, type:'select', options:['Pin','Assy','Rework','Jig','Device','Part'] },
  { id:'partNumber',       label:'Part Number',    required:false, type:'text', placeholder:'e.g. PN-88340-A' },
  { id:'drawingNumber',    label:'Drawing Number', required:false, type:'text', placeholder:'e.g. DWG-2024-011' },
  { id:'revision',         label:'Revision',       required:false, type:'text', placeholder:'e.g. Rev C' },

  { section: 'Schedule & Dates', color: 'accent' },
  { id:'partsETA',         label:'Parts ETA (Arrival)',    required:false, type:'date' },
  { id:'cpoRDD',           label:'CPO RDD',                required:false, type:'date' },
  { id:'ardd',             label:'ARDD',                   required:false, type:'date' },
  { id:'etd',              label:'ETD (Set by Planner)',   required:false, type:'date' },

  { section: 'Inventory', color: 'purple' },
  { id:'partsIssuanceDate', label:'Parts Issuance Date',  required:false, type:'date' },

  { section: 'Logistics', color: 'blue' },
  { id:'awb',              label:'AWB',               required:false, type:'text', placeholder:'Airway Bill No.' },
  { id:'shipmentInvoice',  label:'Shipment Invoice',  required:false, type:'text', placeholder:'Invoice reference', span2:true },
]

export default function OrderModal({ currentUser, editId, orders, onSave, onClose }) {
  const ef = editableFields(currentUser.role)
  const order = editId ? orders.find(o => o.id === editId) : null

  const [form, setForm] = useState(() => {
    const init = {}
    ALL_FIELDS.forEach(f => { init[f] = order?.[f] ?? '' })
    return init
  })
  const [saving, setSaving] = useState(false)

  function set(k, v) { setForm(f => ({ ...f, [k]: v })) }

  async function handleSave() {
    if (!editId && (!form.apo || !form.cpo)) { alert('APO and CPO are required.'); return }
    const data = {}
    ALL_FIELDS.forEach(f => { if (ef.has(f)) data[f] = form[f] })
    setSaving(true)
    try { await onSave(data, editId); onClose() }
    catch (e) { alert('Save failed: ' + e.message) }
    finally { setSaving(false) }
  }

  const SEC_CLS = { accent: s.secAccent, purple: s.secPurple, blue: s.secBlue }

  return (
    <div className={s.overlay} onClick={e => e.target === e.currentTarget && onClose()}>
      <div className={s.modal}>
        <div className={s.header}>
          <div className={s.title}>{editId ? 'Edit Order' : 'New Order'}</div>
          <button className={s.closeBtn} onClick={onClose}>✕</button>
        </div>

        <div className={s.grid}>
          {FORM_META.map((meta, i) => {
            if (meta.section) return (
              <div key={i} className={`${s.sectionLabel} ${SEC_CLS[meta.color]}`}>▸ {meta.section}</div>
            )
            const disabled = !ef.has(meta.id)
            return (
              <div key={meta.id} className={`${s.group} ${meta.span2 ? s.span2 : ''}`}>
                <label className={s.label}>
                  {meta.label}
                  {meta.required && <span className={s.req}>*</span>}
                  {disabled && <span className={s.viewOnly}>(view only)</span>}
                </label>
                {meta.type === 'select'
                  ? <select className={s.input} value={form[meta.id] ?? ''} onChange={e => set(meta.id, e.target.value)} disabled={disabled}>
                      <option value="">-- Select --</option>
                      {meta.options.map(o => <option key={o}>{o}</option>)}
                    </select>
                  : <input className={s.input} type={meta.type} placeholder={meta.placeholder||''}
                      value={form[meta.id] ?? ''} onChange={e => set(meta.id, e.target.value)}
                      disabled={disabled} min={meta.type==='number'?1:undefined} />
                }
              </div>
            )
          })}
        </div>

        <div className={s.footer}>
          <button className={`${s.btn} ${s.btnGhost}`} onClick={onClose}>Cancel</button>
          <button className={`${s.btn} ${s.btnPrimary}`} onClick={handleSave} disabled={saving}>
            {saving ? 'Saving…' : editId ? 'Save Changes' : 'Add Order'}
          </button>
        </div>
      </div>
    </div>
  )
}
