import { useCallback, useEffect, useState } from 'react'
import { Route, Routes, useNavigate, useLocation } from 'react-router-dom'
import { BottomNav } from './components/BottomNav'
import { NavIcon } from './components/NavIcon'
import Today from './pages/Today'
import Plans from './pages/Plans'
import Calendar from './pages/Calendar'
import NotFound from './pages/NotFound'
import WorkoutPlayer from './pages/WorkoutPlayer'
import LlmBridge from './pages/LlmBridge'
import Settings from './pages/Settings'
import { DataProvider } from './data/db'

const tabIds = new Set(['/', '/schede', '/calendario', '/impostazioni'])

export function pageTitle(pathname: string): string {
  if (pathname === '/') return 'Oggi'
  if (pathname === '/schede') return 'Schede'
  if (pathname === '/calendario') return 'Calendario'
  if (pathname === '/impostazioni') return 'Impostazioni'
  if (pathname === '/llm') return 'LLM'
  if (pathname.startsWith('/workout/')) return 'Sessione'
  return 'Pagina'
}

function LayoutShell() {
  const location = useLocation()
  const navigate = useNavigate()
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40)
    window.addEventListener('scroll', onScroll, { passive: true })
    onScroll()
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  const handleNavigate = useCallback((tab: string) => {
    navigate(tab)
  }, [navigate])

  const activeTab = tabIds.has(location.pathname) ? location.pathname : ''

  return (
    <div className="layout-shell" data-scrolled={scrolled ? 'true' : 'false'}>
      <header className="glass-bar">
        <p className="bar-title">{pageTitle(location.pathname)}</p>
        <button
          className="btn"
          type="button"
          aria-label="Impostazioni"
          onClick={() => navigate('/impostazioni')}
        >
          <NavIcon name="impostazioni" filled={false} />
        </button>
      </header>
      <main className="main-content" role="main">
        <Routes>
          <Route path="/" element={<Today />} />
          <Route path="/schede" element={<Plans />} />
          <Route path="/calendario" element={<Calendar />} />
          <Route path="/workout/:planId" element={<WorkoutPlayer />} />
          <Route path="/llm" element={<LlmBridge />} />
          <Route path="/impostazioni" element={<Settings />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>
      <BottomNav activeTab={activeTab} onNavigate={handleNavigate} />
    </div>
  )
}

export default function App() {
  return (
    <DataProvider>
      <LayoutShell />
    </DataProvider>
  )
}
