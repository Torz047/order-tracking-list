import { useState } from 'react'
import { useAccounts } from '../hooks/useAccounts'
import s from './LoginScreen.module.css'

const DEMO_ACCOUNTS = [
  { role: 'Admin',     username: 'admin',      password: 'admin123', cls: s.demoAdmin },
  { role: 'Planner',   username: 'planner1',   password: 'plan123',  cls: s.demoPlanner },
  { role: 'Logistics', username: 'logistics1', password: 'logi123',  cls: s.demoLogi },
  { role: 'Inventory', username: 'inventory1', password: 'inv123',   cls: s.demoInv },
]

export default function LoginScreen({ onLogin }) {
  const { login } = useAccounts()
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError]       = useState('')
  const [loading, setLoading]   = useState(false)

  async function handleLogin(u = username, p = password) {
    setLoading(true); setError('')
    const acct = await login(u, p)
    setLoading(false)
    if (!acct) { setError('Invalid username or password.'); return }
    onLogin(acct)
  }

  function fillDemo(u, p) {
    setUsername(u); setPassword(p); setError('')
    handleLogin(u, p)
  }

  return (
    <div className={s.screen}>
      <div className={s.card}>
        <div className={s.logo}>
          <div className={s.logoMark}>AP</div>
          <div>
            <div className={s.logoText}>Alliance</div>
            <div className={s.logoSub}>Order Tracker System</div>
          </div>
        </div>

        <div className={s.title}>Sign In</div>
        <div className={s.subtitle}>Enter your credentials to access the system</div>

        <div className={s.field}>
          <label className={s.label}>Username</label>
          <input className={s.input} value={username} onChange={e => setUsername(e.target.value)}
            placeholder="username" autoComplete="off" onKeyDown={e => e.key==='Enter' && handleLogin()} />
        </div>
        <div className={s.field}>
          <label className={s.label}>Password</label>
          <input className={s.input} type="password" value={password} onChange={e => setPassword(e.target.value)}
            placeholder="••••••••" onKeyDown={e => e.key==='Enter' && handleLogin()} />
        </div>

        <button className={s.btn} onClick={() => handleLogin()} disabled={loading}>
          {loading ? 'Signing in…' : 'Sign In →'}
        </button>

        {error && <div className={s.error}>{error}</div>}

        <div className={s.demoSection}>
          <div className={s.demoLabel}>Quick access — click to fill</div>
          <div className={s.demoGrid}>
            {DEMO_ACCOUNTS.map(a => (
              <button key={a.role} className={`${s.demoPill} ${a.cls}`} onClick={() => fillDemo(a.username, a.password)}>
                <span className={s.demoDot} />
                <span className={s.demoRole}>{a.role}</span>
                <span className={s.demoUser}>{a.username}</span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
