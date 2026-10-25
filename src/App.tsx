import { useCallback } from 'react'
import { Route, Routes, useNavigate, useLocation } from 'react-router-dom'
import { BottomNav } from './components/BottomNav'
import Today from './pages/Today'
import Plans from './pages/Plans'
import Calendar from './pages/Calendar'
import History from './pages/History'
import NotFound from './pages/NotFound'
import WorkoutPlayer from './pages/WorkoutPlayer'
import Cardio from './pages/Cardio'
import LlmBridge from './pages/LlmBridge'
import Settings from './pages/Settings'
import { DataProvider } from './data/db'

const tabIds = new Set(['/', '/schede', '/calendario', '/storico', '/impostazioni'])

export function pageTitle(pathname: string): string {
  if (pathname === '/') return 'Oggi'
  if (pathname === '/schede') return 'Schede'
  if (pathname === '/calendario') return 'Calendario'
  if (pathname === '/storico') return 'Storico'
  if (pathname === '/impostazioni') return 'Impostazioni'
  if (pathname === '/llm') return 'LLM'
  if (pathname === '/cardio') return 'Cardio'
  if (pathname.startsWith('/workout/')) return 'Sessione'
  return 'Pagina'
}

function LayoutShell() {
  const location = useLocation()
  const navigate = useNavigate()

  const handleNavigate = useCallback((tab: string) => {
    navigate(tab)
  }, [navigate])

  const activeTab = tabIds.has(location.pathname) ? location.pathname : ''

  return (
    <div className="layout-shell">
      <header className="glass-bar">
        <h1>{pageTitle(location.pathname)}</h1>
      </header>
      <main className="main-content" role="main">
        <Routes>
          <Route path="/" element={<Today />} />
          <Route path="/schede" element={<Plans />} />
          <Route path="/calendario" element={<Calendar />} />
          <Route path="/storico" element={<History />} />
          <Route path="/workout/:planId" element={<WorkoutPlayer />} />
          <Route path="/cardio" element={<Cardio />} />
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
