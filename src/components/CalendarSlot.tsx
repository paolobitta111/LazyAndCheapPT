import type { FC } from 'react'

interface CalendarSlotProps {
  day: string
  time: string
  planName?: string
  hasPlan?: boolean
}

export const CalendarSlot: FC<CalendarSlotProps> = ({ day, time, planName, hasPlan }) => (
  <div className="glass">
    <p>{day}</p>
    <p>{time}</p>
    <p>{hasPlan ? planName : 'Nessun piano'}</p>
  </div>
)
