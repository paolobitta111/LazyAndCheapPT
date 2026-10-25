export type NavIconName = 'oggi' | 'schede' | 'calendario' | 'storico' | 'impostazioni'

const paths: Record<NavIconName, string> = {
  oggi: 'M12 6.2a5.8 5.8 0 1 0 0 11.6 5.8 5.8 0 0 0 0-11.6z',
  schede: 'M5 5.2h14v3.2H5zM5 10.4h14v3.2H5zM5 15.6h10v3.2H5z',
  calendario: 'M6 7.2h12v12H6zM8 4.4h2.2v3.2H8zM13.8 4.4H16v3.2h-2.2z',
  storico: 'M5 14h3.2v5H5zM10.4 8h3.2v11h-3.2zM15.8 11.2H19V19h-3.2z',
  impostazioni: 'M4 6.2h16v2.2H4zM4 10.9h16v2.2H4zM4 15.6h16v2.2H4zM7.2 5.2h2.4v4.2H7.2zM13.2 9.9h2.4v4.2h-2.4zM9.2 14.6h2.4v4.2H9.2z',
}

export function NavIcon({ name, filled }: { name: NavIconName; filled: boolean }) {
  return (
    <svg viewBox="0 0 24 24" width="22" height="22" aria-hidden="true">
      <path
        d={paths[name]}
        fill={filled ? 'currentColor' : 'none'}
        stroke={filled ? 'none' : 'currentColor'}
        strokeWidth={filled ? undefined : 1.7}
        strokeLinejoin="round"
      />
    </svg>
  )
}
