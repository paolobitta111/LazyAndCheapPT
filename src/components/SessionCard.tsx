import type { FC } from 'react'

interface SessionCardProps {
  title: string
  status: 'active' | 'finished'
  duration?: string
  children?: React.ReactNode
}

export const SessionCard: FC<SessionCardProps> = ({ title, status, duration, children }) => {
  const statusClass = status === 'active' ? 'is-success' : 'is-info'
  const statusLabel = status === 'active' ? '🔴 In corso' : '✅ Completata'

  return (
    <div className="card">
      <div className="card-content">
        <div className="media">
          <div className="media-left">
            <span className={`tag ${statusClass} is-medium`}>{statusLabel}</span>
          </div>
          <div className="media-content">
            <p className="title is-5 mb-0">{title}</p>
            {duration && <p className="has-text-grey is-size-7 mt-1">{duration}</p>}
          </div>
        </div>
        {children && <div className="mt-3">{children}</div>}
      </div>
    </div>
  )
}
