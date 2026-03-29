import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../lib/supabase'
import { toDbRow, fromDbRow } from '../lib/constants'

function uid() { return '_' + Math.random().toString(36).slice(2, 10) }
function daysFromNow(n = 0) {
  const dt = new Date(); dt.setDate(dt.getDate() + n)
  return dt.toISOString().slice(0, 10)
}

const SEED = [
  { apo:'APO-2024-001',cpo:'CPO-0045',prd:daysFromNow(-10),prs:'PRS-011',qty:50,type:'New',classification:'Pin',partNumber:'PN-88340-A',drawingNumber:'DWG-2024-001',revision:'Rev A',partsIssuanceDate:daysFromNow(-8),partsETA:daysFromNow(2),cpoRDD:daysFromNow(7),ardd:daysFromNow(5),etd:daysFromNow(4),awb:'AWB-001-2024',shipmentInvoice:'INV-0045'},
  { apo:'APO-2024-002',cpo:'CPO-0046',prd:daysFromNow(-5),prs:'PRS-012',qty:12,type:'Repeat',classification:'Assy',partNumber:'PN-55120-B',drawingNumber:'DWG-2024-002',revision:'Rev B',partsIssuanceDate:daysFromNow(-3),partsETA:daysFromNow(0),cpoRDD:daysFromNow(3),ardd:daysFromNow(2),etd:daysFromNow(1),awb:'',shipmentInvoice:''},
  { apo:'APO-2024-003',cpo:'CPO-0047',prd:daysFromNow(-2),prs:'',qty:200,type:'New',classification:'Part',partNumber:'PN-11020-C',drawingNumber:'DWG-2024-003',revision:'Rev C',partsIssuanceDate:'',partsETA:daysFromNow(5),cpoRDD:daysFromNow(10),ardd:daysFromNow(8),etd:daysFromNow(9),awb:'',shipmentInvoice:''},
  { apo:'APO-2024-004',cpo:'CPO-0048',prd:daysFromNow(-15),prs:'PRS-013',qty:8,type:'Return',classification:'Rework',partNumber:'PN-77880-A',drawingNumber:'DWG-2023-040',revision:'Rev A',partsIssuanceDate:daysFromNow(-12),partsETA:daysFromNow(-1),cpoRDD:daysFromNow(-3),ardd:daysFromNow(-4),etd:daysFromNow(-2),awb:'AWB-002-2024',shipmentInvoice:'INV-0048'},
  { apo:'APO-2024-005',cpo:'CPO-0049',prd:daysFromNow(-1),prs:'PRS-014',qty:3,type:'New',classification:'Jig',partNumber:'JIG-00120',drawingNumber:'DWG-2024-010',revision:'Rev D',partsIssuanceDate:'',partsETA:daysFromNow(8),cpoRDD:daysFromNow(14),ardd:daysFromNow(12),etd:daysFromNow(11),awb:'',shipmentInvoice:''},
]

// ── localStorage fallback ──────────────────────────────────
function lsGet()    { return JSON.parse(localStorage.getItem('ap_orders') || 'null') }
function lsSet(arr) { localStorage.setItem('ap_orders', JSON.stringify(arr)) }

export function useOrders() {
  const [orders,  setOrders]  = useState([])
  const [loading, setLoading] = useState(true)
  const [error,   setError]   = useState(null)
  const useSupabase = !!supabase

  // ── LOAD ──────────────────────────────────────────────────
  const load = useCallback(async () => {
    setLoading(true)
    setError(null)

    if (useSupabase) {
      const { data, error } = await supabase
        .from('orders')
        .select('*')
        .order('created_at', { ascending: true })
      if (error) { setError(error.message); setLoading(false); return }
      const mapped = (data || []).map(fromDbRow)
      if (!mapped.length) await seedSupabase()
      else setOrders(mapped)
    } else {
      let local = lsGet()
      if (!local || !local.length) {
        local = SEED.map(o => ({ id: uid(), ...o }))
        lsSet(local)
      }
      setOrders(local)
    }
    setLoading(false)
  }, [useSupabase])

  async function seedSupabase() {
    const rows = SEED.map(o => toDbRow(o))
    const { data } = await supabase.from('orders').insert(rows).select()
    setOrders((data || []).map(fromDbRow))
  }

  useEffect(() => { load() }, [load])

  // ── ADD ───────────────────────────────────────────────────
  async function addOrder(data) {
    if (useSupabase) {
      const { data: rows, error } = await supabase
        .from('orders').insert([toDbRow(data)]).select()
      if (error) throw new Error(error.message)
      setOrders(prev => [...prev, fromDbRow(rows[0])])
    } else {
      const o = { id: uid(), ...data }
      const next = [...orders, o]
      lsSet(next); setOrders(next)
    }
  }

  // ── UPDATE ────────────────────────────────────────────────
  async function updateOrder(id, data) {
    if (useSupabase) {
      const { error } = await supabase
        .from('orders').update(toDbRow(data)).eq('id', id)
      if (error) throw new Error(error.message)
      setOrders(prev => prev.map(o => o.id === id ? { ...o, ...data } : o))
    } else {
      const next = orders.map(o => o.id === id ? { ...o, ...data } : o)
      lsSet(next); setOrders(next)
    }
  }

  // ── DELETE ────────────────────────────────────────────────
  async function deleteOrder(id) {
    if (useSupabase) {
      const { error } = await supabase.from('orders').delete().eq('id', id)
      if (error) throw new Error(error.message)
    }
    const next = orders.filter(o => o.id !== id)
    if (!useSupabase) lsSet(next)
    setOrders(next)
  }

  async function deleteOrders(ids) {
    if (useSupabase) {
      const { error } = await supabase.from('orders').delete().in('id', [...ids])
      if (error) throw new Error(error.message)
    }
    const next = orders.filter(o => !ids.has(o.id))
    if (!useSupabase) lsSet(next)
    setOrders(next)
  }

  return { orders, loading, error, addOrder, updateOrder, deleteOrder, deleteOrders, reload: load }
}
