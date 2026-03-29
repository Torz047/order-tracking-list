import { useState, useEffect, useRef } from 'react'
import { useOrders }   from '../hooks/useOrders'
import { useAccounts } from '../hooks/useAccounts'
import { editableFields, ROLE_COLORS, TYPE_MAP, CLASS_MAP, ALL_FIELDS } from '../lib/constants'
import OrderModal    from './OrderModal'
import AccountsModal from './AccountsModal'
import Toast         from './Toast'
import s from './AppShell.module.css'

// ── tiny helpers ──────────────────────────────────────────
function Dash() { return <span className={s.dash}>—</span> }

function DateChip({ value, warn }) {
  if (!value) return <Dash />
  const today = new Date().toISOString().slice(0, 10)
  const cls = warn
    ? (value < today ? s.overdue : value === today ? s.today : s.dateOk)
    : s.dateOk
  return <span className={`${s.dateChip} ${cls}`}>{warn && value < today ? `⚠ ${value}` : value}</span>
}

function TypeBadge({ value }) {
  if (!value) return <Dash />
  const cls = { New: s.badgeNew, Repeat: s.badgeRepeat, Return: s.badgeReturn }
  return <span className={`${s.badge} ${cls[value] || ''}`}>{value}</span>
}

function ClassBadge({ value }) {
  if (!value) return <Dash />
  const cls = { Pin:s.badgePin,Assy:s.badgeAssy,Rework:s.badgeRework,Jig:s.badgeJig,Device:s.badgeDevice,Part:s.badgePart }
  return <span className={`${s.badge} ${cls[value] || ''}`}>{value}</span>
}

const ROLE_CHIP_CLS = { Admin:s.roleAdmin, Planner:s.rolePlanner, Logistics:s.roleLogistics, Inventory:s.roleInventory }

// ── column definitions ────────────────────────────────────
const COL_KEYS = [
  'apo','cpo','prd','prs','qty','type','classification',
  'partNumber','drawingNumber','revision','partsIssuanceDate',
  'partsETA','cpoRDD','ardd','etd','awb','shipmentInvoice',
]

const BADGE_COLS = [
  { label:'APO',            cls:s.cgbPo },
  { label:'CPO',            cls:s.cgbPo },
  { label:'PRD',            cls:s.cgbPo },
  { label:'PRS',            cls:s.cgbPo },
  { label:'Qty',            cls:s.cgbPo },
  { label:'Type',           cls:s.cgbPo },
  { label:'Class',          cls:s.cgbPart },
  { label:'Part No.',       cls:s.cgbPart },
  { label:'Drawing No.',    cls:s.cgbPart },
  { label:'Rev',            cls:s.cgbPart },
  { label:'Parts Issuance', cls:s.cgbInv },
  { label:'Parts ETA',      cls:s.cgbSched },
  { label:'CPO RDD',        cls:s.cgbSched },
  { label:'ARDD',           cls:s.cgbSched },
  { label:'ETD',            cls:s.cgbSched },
  { label:'AWB',            cls:s.cgbLogi },
  { label:'Shipment Inv.',  cls:s.cgbLogi },
]

const SORT_LABELS = [
  'APO','CPO','PRD','PRS','Qty','Type','Class',
  'Part No.','Drawing No.','Rev','Parts Issuance',
  'Parts ETA','CPO RDD','ARDD','ETD','AWB','Shipment Invoice',
]

export default function AppShell({ currentUser, onLogout }) {
  const { orders, loading, error, addOrder, updateOrder, deleteOrder, deleteOrders } = useOrders()
  const { accounts, addAccount, updateAccount, deleteAccount } = useAccounts()

  const [search,      setSearch]      = useState('')
  const [filterType,  setFilterType]  = useState('')
  const [filterClass, setFilterClass] = useState('')
  const [sortKey,     setSortKey]     = useState('_idx')
  const [sortDir,     setSortDir]     = useState(1)
  const [selected,    setSelected]    = useState(new Set())
  const [orderModal,  setOrderModal]  = useState({ open:false, editId:null })
  const [acctModal,   setAcctModal]   = useState(false)
  const [userMenu,    setUserMenu]    = useState(false)
  const [toasts,      setToasts]      = useState([])
  const menuRef = useRef(null)

  useEffect(() => {
    function h(e) { if (menuRef.current && !menuRef.current.contains(e.target)) setUserMenu(false) }
    document.addEventListener('mousedown', h)
    return () => document.removeEventListener('mousedown', h)
  }, [])

  function toast(msg) {
    const id = '_' + Math.random().toString(36).slice(2, 8)
    setToasts(t => [...t, { id, msg }])
    setTimeout(() => setToasts(t => t.filter(x => x.id !== id)), 2700)
  }

  const role  = currentUser.role
  const ef    = editableFields(role)
  const canEd = ef.size > 0
  const canDel = role === 'Admin' || role === 'Planner'
  const canAdd = role === 'Admin' || role === 'Planner'
  const today  = new Date().toISOString().slice(0, 10)

  // ── filter + sort ────────────────────────────────────────
  const rows = orders
    .map((o, i) => ({ ...o, _idx: i + 1 }))
    .filter(o => {
      const q = search.toLowerCase()
      const ms = !q || [o.apo,o.cpo,o.prs,o.partNumber,o.drawingNumber,o.revision,o.awb,o.shipmentInvoice]
        .some(v => v && String(v).toLowerCase().includes(q))
      return ms && (!filterType || o.type === filterType) && (!filterClass || o.classification === filterClass)
    })
    .sort((a, b) => {
      let av = a[sortKey] ?? '', bv = b[sortKey] ?? ''
      if (sortKey === 'qty') { av = +av; bv = +bv }
      return av < bv ? -sortDir : av > bv ? sortDir : 0
    })

  function doSort(k) {
    if (sortKey === k) setSortDir(d => d * -1)
    else { setSortKey(k); setSortDir(1) }
  }

  // ── selection ────────────────────────────────────────────
  function toggleRow(id, checked) {
    setSelected(s => { const n = new Set(s); checked ? n.add(id) : n.delete(id); return n })
  }
  function toggleAll(checked) {
    setSelected(checked ? new Set(rows.map(r => r.id)) : new Set())
  }
  const allChecked = rows.length > 0 && rows.every(r => selected.has(r.id))

  // ── order CRUD ───────────────────────────────────────────
  async function handleSaveOrder(data, editId) {
    try {
      if (editId) { await updateOrder(editId, data); toast('Order updated ✓') }
      else        { await addOrder(data);             toast('Order added ✓')   }
    } catch (e) { toast('Error: ' + e.message) }
  }

  async function handleDelete(id) {
    if (!confirm('Delete this order?')) return
    try { await deleteOrder(id); setSelected(s => { const n = new Set(s); n.delete(id); return n }); toast('Order deleted') }
    catch (e) { toast('Error: ' + e.message) }
  }

  async function handleBulkDelete() {
    if (!confirm(`Delete ${selected.size} order(s)?`)) return
    try { await deleteOrders(selected); setSelected(new Set()); toast('Orders deleted') }
    catch (e) { toast('Error: ' + e.message) }
  }

  // ── account CRUD (onSave receives (id, data) — null data = delete) ──
  async function handleAccountSave(id, data) {
    if (data === null) { await deleteAccount(id); return }
    if (id)  await updateAccount(id, data)
    else     await addAccount(data)
  }

  // ── export ───────────────────────────────────────────────
  function exportCSV() {
    const cols  = ['APO','CPO','PRD','PRS','Qty','Type','Classification','Part Number','Drawing Number','Revision','Parts Issuance Date','Parts ETA','CPO RDD','ARDD','ETD','AWB','Shipment Invoice']
    const keys  = ['apo','cpo','prd','prs','qty','type','classification','partNumber','drawingNumber','revision','partsIssuanceDate','partsETA','cpoRDD','ardd','etd','awb','shipmentInvoice']
    const csv   = [cols.join(','), ...orders.map(o => keys.map(k => `"${(o[k]||'').toString().replace(/"/g,'""')}"`).join(','))].join('\n')
    const a = document.createElement('a')
    a.href = 'data:text/csv;charset=utf-8,' + encodeURIComponent(csv)
    a.download = `alliance_orders_${today}.csv`
    a.click()
    toast('CSV exported ✓')
  }

  const overdueCount = orders.filter(o => o.etd && o.etd < today).length
  const newCount     = orders.filter(o => o.type === 'New').length

  return (
    <div className={s.shell}>

      {/* ── HEADER ── */}
      <header className={s.header}>
        <div className={s.headerLeft}>
          <div className={s.logoMark}>AP</div>
          <div>
            <div className={s.headerTitle}>Alliance Order Tracker</div>
            <div className={s.headerSub}>Production Order Management</div>
          </div>
        </div>

        <div className={s.headerStats}>
          <div className={s.statPill}><span className={s.statDot} style={{background:'var(--accent)'}}/>Total<strong>{orders.length}</strong></div>
          <div className={s.statPill}><span className={s.statDot} style={{background:'var(--new)'}}/>New<strong>{newCount}</strong></div>
          {overdueCount > 0 && <div className={s.statPill}><span className={s.statDot} style={{background:'var(--red)'}}/>Overdue<strong>{overdueCount}</strong></div>}
        </div>

        <div className={s.headerRight} ref={menuRef}>
          <button className={s.userBadge} onClick={() => setUserMenu(v => !v)}>
            <div className={s.userAvatar} style={{background: ROLE_COLORS[role] || '#888'}}>
              {currentUser.username.slice(0,2).toUpperCase()}
            </div>
            <div>
              <div className={s.userName}>{currentUser.username}</div>
              <div className={`${s.roleChip} ${ROLE_CHIP_CLS[role] || ''}`}>{role}</div>
            </div>
            <span className={s.chevron}>▾</span>
          </button>

          {userMenu && (
            <div className={s.userMenu}>
              <div className={s.menuHeader}>
                <div className={s.menuUname}>{currentUser.username}</div>
                <div className={s.menuRole}>{role} Account</div>
              </div>
              <button className={s.menuLogout} onClick={() => { setUserMenu(false); onLogout() }}>⎋ Sign Out</button>
            </div>
          )}
        </div>
      </header>

      {/* ── TOOLBAR ── */}
      <div className={s.toolbar}>
        <div className={s.toolbarLeft}>
          {canAdd && <button className={`${s.btn} ${s.btnPrimary}`} onClick={() => setOrderModal({open:true,editId:null})}>＋ Add Order</button>}
          <button className={`${s.btn} ${s.btnGhost}`} onClick={exportCSV}>↓ CSV</button>
          {canDel && selected.size > 0 && (
            <button className={`${s.btn} ${s.btnDanger}`} onClick={handleBulkDelete}>✕ Delete ({selected.size})</button>
          )}
          {role === 'Admin' && (
            <button className={`${s.btn} ${s.btnPurple}`} onClick={() => setAcctModal(true)}>👤 Accounts</button>
          )}
        </div>
        <div className={s.toolbarRight}>
          <div className={s.searchBox}>
            <span className={s.searchIcon}>⌕</span>
            <input className={s.searchInput} placeholder="Search APO, CPO, Part No…" value={search} onChange={e => setSearch(e.target.value)} />
          </div>
          <select className={s.filterSelect} value={filterType}  onChange={e => setFilterType(e.target.value)}>
            <option value="">All Types</option>
            <option>New</option><option>Repeat</option><option>Return</option>
          </select>
          <select className={s.filterSelect} value={filterClass} onChange={e => setFilterClass(e.target.value)}>
            <option value="">All Classes</option>
            <option>Pin</option><option>Assy</option><option>Rework</option>
            <option>Jig</option><option>Device</option><option>Part</option>
          </select>
          <span className={s.rowCount}>{rows.length} order{rows.length !== 1 ? 's' : ''}</span>
        </div>
      </div>

      {/* ── TABLE ── */}
      <div className={s.tableWrap}>
        {loading ? (
          <div className={s.loadingWrap}><div className={s.spinner}/> Loading orders…</div>
        ) : (
          <>
            <table className={s.table}>
              <thead>
                {/* ROW 1 — badge row */}
                <tr className={s.colGroupRow}>
                  <th className={`${s.checkCell} ${s.cgbSpan2}`} rowSpan={2}>
                    <input type="checkbox" checked={allChecked} onChange={e => toggleAll(e.target.checked)} />
                  </th>
                  <th className={`${s.cgbSpan2} ${s.cgbNum}`} rowSpan={2}>#</th>
                  {BADGE_COLS.map((b, i) => (
                    <th key={i}><span className={`${s.cgbBadge} ${b.cls}`}>{b.label}</span></th>
                  ))}
                  <th className={`${s.cgbSpan2} ${s.cgbActions}`} rowSpan={2}>Actions</th>
                </tr>

                {/* ROW 2 — sortable column names */}
                <tr className={s.colSortRow}>
                  {COL_KEYS.map((key, i) => (
                    <th key={key} onClick={() => doSort(key)} className={sortKey === key ? s.sorted : ''}>
                      {SORT_LABELS[i]} <span className={s.sortArrow}>{sortKey===key ? (sortDir===1?'↑':'↓') : '↕'}</span>
                    </th>
                  ))}
                </tr>
              </thead>

              <tbody>
                {rows.map(o => (
                  <tr key={o.id} className={`${s.row} ${selected.has(o.id) ? s.rowSelected : ''}`}>
                    <td className={`${s.td} ${s.checkCell}`}>
                      <input type="checkbox" checked={selected.has(o.id)} onChange={e => toggleRow(o.id, e.target.checked)} />
                    </td>
                    <td className={`${s.td} ${s.rowNum}`}>{o._idx}</td>
                    <td className={`${s.td} ${s.tdPrimary}`}>{o.apo || <Dash/>}</td>
                    <td className={s.td}>{o.cpo || <Dash/>}</td>
                    <td className={s.td}><DateChip value={o.prd} warn={false}/></td>
                    <td className={s.td}>{o.prs || <Dash/>}</td>
                    <td className={s.td}><span className={s.qtyChip}>{o.qty || '—'}</span></td>
                    <td className={s.td}><TypeBadge  value={o.type}/></td>
                    <td className={s.td}><ClassBadge value={o.classification}/></td>
                    <td className={`${s.td} ${s.tdPrimary}`}>{o.partNumber    || <Dash/>}</td>
                    <td className={s.td}>{o.drawingNumber || <Dash/>}</td>
                    <td className={s.td}>{o.revision      || <Dash/>}</td>
                    <td className={s.td}><DateChip value={o.partsIssuanceDate} warn={false}/></td>
                    <td className={s.td}><DateChip value={o.partsETA}  warn={true}/></td>
                    <td className={s.td}><DateChip value={o.cpoRDD}    warn={true}/></td>
                    <td className={s.td}><DateChip value={o.ardd}      warn={true}/></td>
                    <td className={s.td}><DateChip value={o.etd}       warn={true}/></td>
                    <td className={s.td}>{o.awb             || <Dash/>}</td>
                    <td className={s.td}>{o.shipmentInvoice || <Dash/>}</td>
                    <td className={`${s.td} ${s.actionsCell}`}>
                      {canEd  && <button className={s.actionBtn} onClick={() => setOrderModal({open:true,editId:o.id})} title="Edit">✎</button>}
                      {canDel && <button className={`${s.actionBtn} ${s.actionDel}`} onClick={() => handleDelete(o.id)} title="Delete">🗑</button>}
                      {!canEd && !canDel && <Dash/>}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {rows.length === 0 && (
              <div className={s.emptyState}>
                <div className={s.emptyIcon}>📋</div>
                <div className={s.emptyTitle}>No orders found</div>
                <div className={s.emptySub}>Add a new order or adjust your filters</div>
              </div>
            )}
          </>
        )}
      </div>

      {/* ── MODALS ── */}
      {orderModal.open && (
        <OrderModal
          currentUser={currentUser}
          editId={orderModal.editId}
          orders={orders}
          onSave={handleSaveOrder}
          onClose={() => setOrderModal({open:false, editId:null})}
        />
      )}

      {acctModal && (
        <AccountsModal
          accounts={accounts}
          currentUser={currentUser}
          onSave={handleAccountSave}
          onClose={() => setAcctModal(false)}
          toast={toast}
        />
      )}

      {/* ── TOASTS ── */}
      <div className={s.toastContainer}>
        {toasts.map(t => <Toast key={t.id} msg={t.msg}/>)}
      </div>
    </div>
  )
}
