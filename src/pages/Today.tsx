import { useState } from 'react'
import { SessionBox } from '../components/SessionBox'
import { MetricCubes } from '../components/MetricCubes'
import { CheckInModal } from '../components/CheckInModal'
import { formatToday, initialSchedaId, mockSchede } from './today-mock'

export default function Today() {
  const [schedaId, setSchedaId] = useState<string | null>(initialSchedaId)
  const [checkInOpen, setCheckInOpen] = useState(false)
  const scheda = mockSchede.find((item) => item.id === schedaId) ?? null

  return (
    <div>
      <p className="today-date">{formatToday()}</p>
      <SessionBox
        scheda={scheda}
        schede={mockSchede}
        onSkip={() => setSchedaId(null)}
        onSelect={setSchedaId}
        onCheckIn={() => setCheckInOpen(true)}
      />
      <MetricCubes />
      <CheckInModal
        open={checkInOpen}
        label={scheda ? `${scheda.name} di oggi` : 'Riposo'}
        promptLabel={scheda?.name ?? 'Riposo'}
        onClose={() => setCheckInOpen(false)}
      />
    </div>
  )
}
