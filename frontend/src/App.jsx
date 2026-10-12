import { useEffect, useState } from 'react'
import Sidebar from './components/Sidebar.jsx'
import Navbar from './components/Navbar.jsx'
import Dashboard from './pages/Dashboard.jsx'
import Stats from './pages/Stats.jsx'
import Metas from './pages/Goals.jsx'
import History from './pages/History.jsx'
import Settings from './pages/Settings.jsx'
import Profile from './pages/Profile.jsx'
import DeviceStats from './pages/DeviceStats.jsx'
import Register from './pages/Register.jsx'
import Login from './pages/Login.jsx'
import { useAuth } from './hooks/useAuth.js'
import './index.css'

const PAGES = {
  dashboard: Dashboard,
  stats: Stats,
  goals: Metas,
  history: History,
  settings: Settings,
  profile: Profile,
  device: DeviceStats,
}

const PAGE_LABELS = {
  device: 'Dispositivo',
}

function ComingSoon({ page }) {
  return (
    <div className="coming-soon">
      <h2>{PAGE_LABELS[page] ?? page}</h2>
      <p>Esta sección todavía está en construcción.</p>
    </div>
  )
}

// Ruta de registro sin router: se muestra cuando la URL termina en #/registro
const isRegisterHash = () => window.location.hash === '#/registro'

function App() {
  const [activePage, setActivePage] = useState('dashboard')
  const [showRegister, setShowRegister] = useState(isRegisterHash)
  const { isAuthenticated } = useAuth()

  // Cada vez que cambia la sesión (login o logout) se vuelve al Dashboard;
  // si no, App conserva la última página visitada en el estado.
  useEffect(() => {
    setActivePage('dashboard')
  }, [isAuthenticated])

  useEffect(() => {
    const onHashChange = () => setShowRegister(isRegisterHash())
    window.addEventListener('hashchange', onHashChange)
    return () => window.removeEventListener('hashchange', onHashChange)
  }, [])

  if (showRegister) return <Register />
  if (!isAuthenticated) return <Login />

  const Page = PAGES[activePage]

  return (
    <div className="app-shell">

      <Sidebar activePage={activePage} onNavigate={setActivePage} />

      <div className="main-shell">

        <Navbar onNavigate={setActivePage} />

        <main className="page-content">
          {Page ? <Page onNavigate={setActivePage} /> : <ComingSoon page={activePage} />}
        </main>

      </div>

    </div>
  )
}

export default App