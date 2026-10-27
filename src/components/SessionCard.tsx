import type { FC, ReactNode } from 'react'

interface SessionCardProps {
  title: string
  status: 'active' | 'finished'
  duration?: string
  children?: ReactNode
}

export const SessionCard: FC<SessionCardProps> = ({ title, status, duration, children }) => {
  const statusLabel = status === 'active' ? 'In corso' : 'Completata'

  return (
    <div className="group-row">
      <p>{statusLabel}</p>
      <p>{title}</p>
      {duration ? <p>{duration}</p> : null}
      {children}
    </div>
  )
}
