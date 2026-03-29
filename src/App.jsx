import { useState } from 'react'
import LoginScreen from './components/LoginScreen'
import AppShell from './components/AppShell'

export default function App() {
  const [currentUser, setCurrentUser] = useState(null)

  return currentUser
    ? <AppShell currentUser={currentUser} onLogout={() => setCurrentUser(null)} />
    : <LoginScreen onLogin={setCurrentUser} />
}
