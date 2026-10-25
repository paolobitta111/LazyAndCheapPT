import type { FC } from 'react'

interface HistoryItemProps {
  date: string
  type: 'workout' | 'cardio'
  duration: string
  planName?: string
  notes?: string
}

export const HistoryItem: FC<HistoryItemProps> = ({ date, type, duration, planName, notes }) => {
  const icon = type === 'workout' ? '🏋️' : '🏃'
  const tagClass = type === 'workout' ? 'is-primary' : 'is-info'

  return (
    <div className="card mb-3">
      <div className="card-content">
        <div className="media">
          <div className="media-left">
            <span className={`tag ${tagClass} is-medium`}>
              {icon} {type === 'workout' ? 'Workout' : 'Cardio'}
            </span>
          </div>
          <div className="media-content">
            <p className="title is-6 mb-0">{date}</p>
            {planName && <p className="has-text-grey is-size-7">{planName}</p>}
            <p className="has-text-grey is-size-7">{duration}</p>
            {notes && <p className="is-size-7">{notes}</p>}
          </div>
          <div className="media-right">
            <span className="icon has-text-grey">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M9 5l7 7-7 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}
