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



function Navbar() {
  return (
    <nav className="navbar is-fixed-top is-white" role="navigation" aria-label="LazyCheapCoach">
      <div className="navbar-brand">
        <a className="navbar-item" href="/">
          <span className="icon is-medium mr-2">
            <svg width="32" height="32" viewBox="0 0 64 32" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
              <rect x="0" y="12" width="8" height="16" rx="2" fill="#2577b9" />
              <rect x="56" y="12" width="8" height="16" rx="2" fill="#2577b9" />
              <rect x="8" y="14" width="48" height="4" rx="2" fill="#434343" />
            </svg>
          </span>
          <span className="is-size-5 has-text-weight-bold">LazyCheapCoach</span>
        </a>
      </div>
      <div className="navbar-menu">
        <div className="navbar-end">
          <a className="navbar-item" href="#/impostazioni">Impostazioni</a>
          <a className="navbar-item" href="#/llm">LLM</a>
        </div>
      </div>
    </nav>
  )
}

function LayoutShell() {
  const location = useLocation()
  const navigate = useNavigate()

  const handleNavigate = useCallback((tab: string) => {
    navigate(tab)
  }, [navigate])

  return (
    <div className="layout-shell">
      <Navbar />
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
      <BottomNav activeTab={location.pathname} onNavigate={handleNavigate} />
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
