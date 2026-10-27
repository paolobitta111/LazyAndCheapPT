import { useState } from 'react'
import { SessionBox } from '../components/SessionBox'
import { formatToday, initialSchedaId, mockSchede } from './today-mock'

export default function Today() {
  const [schedaId, setSchedaId] = useState<string | null>(initialSchedaId)
  const scheda = mockSchede.find((item) => item.id === schedaId) ?? null

  return (
    <div>
      <p className="today-date">{formatToday()}</p>
      <SessionBox
        scheda={scheda}
        schede={mockSchede}
        onSkip={() => setSchedaId(null)}
        onSelect={setSchedaId}
        onCheckIn={() => undefined}
      />
    </div>
  )
}
