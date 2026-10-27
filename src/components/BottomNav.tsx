import type { FC } from 'react'
import { NavIcon, type NavIconName } from './NavIcon'

interface BottomNavProps {
  activeTab: string
  onNavigate: (tab: string) => void
}

const navItems: { id: string; icon: NavIconName; label: string }[] = [
  { id: '/', icon: 'oggi', label: 'Oggi' },
  { id: '/schede', icon: 'schede', label: 'Schede' },
  { id: '/calendario', icon: 'calendario', label: 'Calendario' },
]

export const BottomNav: FC<BottomNavProps> = ({ activeTab, onNavigate }) => (
  <nav className="glass-bar" aria-label="Principale">
    {navItems.map((item) => {
      const active = activeTab === item.id
      return (
        <button
          key={item.id}
          className={active ? 'active' : undefined}
          onClick={() => onNavigate(item.id)}
          type="button"
        >
          <NavIcon name={item.icon} filled={active} />
          <span>{item.label}</span>
        </button>
      )
    })}
  </nav>
)
