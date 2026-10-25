import type { FC } from 'react'

interface BottomNavProps {
  activeTab: string
  onNavigate: (tab: string) => void
}

const navItems = [
  { id: '/', icon: '🏠', label: 'Oggi' },
  { id: '/schede', icon: '📋', label: 'Schede' },
  { id: '/calendario', icon: '📅', label: 'Cal' },
  { id: '/storico', icon: '📊', label: 'Storico' },
] as const

export const BottomNav: FC<BottomNavProps> = ({ activeTab, onNavigate }) => (
  <nav className="bottom-nav">
    <div className="bottom-nav-inner">
      {navItems.map((item) => (
        <button
          key={item.id}
          className={`bottom-nav-item${activeTab === item.id ? ' active' : ''}`}
          onClick={() => onNavigate(item.id)}
          type="button"
        >
          <span className="bottom-nav-icon">{item.icon}</span>
          <span className="bottom-nav-label">{item.label}</span>
        </button>
      ))}
    </div>
  </nav>
)
