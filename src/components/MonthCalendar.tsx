import type { MockDaySession } from '../pages/today-mock'
import { mockSchede } from '../pages/today-mock'

export const monthNames = [
  'gennaio',
  'febbraio',
  'marzo',
  'aprile',
  'maggio',
  'giugno',
  'luglio',
  'agosto',
  'settembre',
  'ottobre',
  'novembre',
  'dicembre',
]

export const sportDotColors: Record<string, string> = {
  running: '#ff6b4a',
  strength: '#7eb6ff',
  cycling: '#5ee0a0',
}

const weekdayLetters = ['L', 'M', 'M', 'G', 'V', 'S', 'D']

const dotStyle = (color: string) => ({
  position: 'absolute',
  right: '5px',
  bottom: '5px',
  width: '7px',
  height: '7px',
  borderRadius: '50%',
  background: color,
}) as const

export function buildMonthCells(year: number, monthIndex: number): Array<number | null> {
  const firstWeekday = new Date(year, monthIndex, 1).getDay()
  const leading = (firstWeekday + 6) % 7
  const daysInMonth = new Date(year, monthIndex + 1, 0).getDate()
  const cells: Array<number | null> = Array<number | null>(leading).fill(null)
  for (let day = 1; day <= daysInMonth; day++) cells.push(day)
  const trailing = (7 - (cells.length % 7)) % 7
  for (let index = 0; index < trailing; index++) cells.push(null)
  return cells
}

export function MonthCalendar(props: {
  year: number
  monthIndex: number
  sessions: MockDaySession[]
  today: { year: number; monthIndex: number; day: number } | null
  onSelectDay: (day: number) => void
  onPrev: () => void
  onNext: () => void
}) {
  const cells = buildMonthCells(props.year, props.monthIndex)
  const monthName = monthNames[props.monthIndex]
  const monthLabel = `${monthName.charAt(0).toUpperCase()}${monthName.slice(1)} ${props.year}`

  return (
    <div className="month-calendar" style={{ display: 'flex', flexDirection: 'column', gap: '10px', height: '100%' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <button className="btn" type="button" aria-label="Mese precedente" onClick={props.onPrev}>‹</button>
        <strong>{monthLabel}</strong>
        <button className="btn" type="button" aria-label="Mese successivo" onClick={props.onNext}>›</button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '4px', textAlign: 'center', fontSize: '11px', color: 'rgba(255,255,255,.45)' }}>
        {weekdayLetters.map((letter, index) => (
          <span key={index}>{letter}</span>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '4px', flex: 1 }}>
        {cells.map((day, index) => {
          if (day === null) {
            return <div key={`empty-${index}`} className="month-cell month-cell-empty" />
          }
          const session = props.sessions.find((item) => item.day === day)
          const sport = session
            ? mockSchede.find((scheda) => scheda.id === session.schedaId)?.sport
            : undefined
          const isToday =
            props.today !== null &&
            props.today.year === props.year &&
            props.today.monthIndex === props.monthIndex &&
            props.today.day === day
          return (
            <button
              key={day}
              type="button"
              className="month-cell"
              aria-label={`${day} ${monthName}`}
              data-today={isToday ? 'true' : undefined}
              onClick={() => props.onSelectDay(day)}
              style={{
                position: 'relative',
                aspectRatio: '1',
                borderRadius: '12px',
                border: 0,
                background: 'transparent',
                color: '#f5f5f7',
                font: 'inherit',
                fontSize: '13px',
                fontVariantNumeric: 'tabular-nums',
                boxShadow: isToday ? 'inset 0 0 0 1.5px rgba(255,255,255,.7)' : undefined,
              }}
            >
              <span style={{ position: 'absolute', top: '6px', left: '8px' }}>{day}</span>
              {sport ? <span data-sport={sport} style={dotStyle(sportDotColors[sport])} /> : null}
            </button>
          )
        })}
      </div>

      <div style={{ display: 'flex', gap: '12px', fontSize: '11px', color: 'rgba(255,255,255,.62)' }}>
        <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
          <i style={{ width: '7px', height: '7px', borderRadius: '50%', background: sportDotColors.strength }} />
          Palestra
        </span>
        <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
          <i style={{ width: '7px', height: '7px', borderRadius: '50%', background: sportDotColors.running }} />
          Corsa
        </span>
        <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
          <i style={{ width: '7px', height: '7px', borderRadius: '50%', background: sportDotColors.cycling }} />
          Bici
        </span>
      </div>
    </div>
  )
}