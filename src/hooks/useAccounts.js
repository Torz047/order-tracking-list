import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../lib/supabase'

function uid() { return '_' + Math.random().toString(36).slice(2, 10) }

const SEED_ACCOUNTS = [
  { username: 'admin',      password: 'admin123', role: 'Admin' },
  { username: 'planner1',   password: 'plan123',  role: 'Planner' },
  { username: 'logistics1', password: 'logi123',  role: 'Logistics' },
  { username: 'inventory1', password: 'inv123',   role: 'Inventory' },
]

function lsGet()    { return JSON.parse(localStorage.getItem('ap_accounts') || 'null') }
function lsSet(arr) { localStorage.setItem('ap_accounts', JSON.stringify(arr)) }

export function useAccounts() {
  const [accounts, setAccounts] = useState([])
  const useSupabase = !!supabase

  const load = useCallback(async () => {
    if (useSupabase) {
      const { data } = await supabase.from('accounts').select('*').order('created_at')
      if (!data || !data.length) {
        const { data: seeded } = await supabase.from('accounts').insert(SEED_ACCOUNTS).select()
        setAccounts(seeded || [])
      } else {
        setAccounts(data)
      }
    } else {
      let local = lsGet()
      if (!local) {
        local = SEED_ACCOUNTS.map(a => ({ id: uid(), ...a }))
        lsSet(local)
      }
      setAccounts(local)
    }
  }, [useSupabase])

  useEffect(() => { load() }, [load])

  async function addAccount(data) {
    if (useSupabase) {
      const { data: rows, error } = await supabase.from('accounts').insert([data]).select()
      if (error) throw new Error(error.message)
      setAccounts(prev => [...prev, rows[0]])
    } else {
      const a = { id: uid(), ...data }
      const next = [...accounts, a]
      lsSet(next); setAccounts(next)
    }
  }

  async function updateAccount(id, data) {
    if (useSupabase) {
      const { error } = await supabase.from('accounts').update(data).eq('id', id)
      if (error) throw new Error(error.message)
    }
    const next = accounts.map(a => a.id === id ? { ...a, ...data } : a)
    if (!useSupabase) lsSet(next)
    setAccounts(next)
  }

  async function deleteAccount(id) {
    if (useSupabase) {
      const { error } = await supabase.from('accounts').delete().eq('id', id)
      if (error) throw new Error(error.message)
    }
    const next = accounts.filter(a => a.id !== id)
    if (!useSupabase) lsSet(next)
    setAccounts(next)
  }

  async function login(username, password) {
    let list = accounts
    if (!list.length) {
      // accounts may not be loaded yet
      if (useSupabase) {
        const { data } = await supabase.from('accounts').select('*')
        list = data || []
      } else {
        list = lsGet() || []
      }
    }
    return list.find(a => a.username === username && a.password === password) || null
  }

  return { accounts, addAccount, updateAccount, deleteAccount, login }
}
