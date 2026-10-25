import { CalendarSlot } from '../components/CalendarSlot'

const weekDays = [
  { day: 'Lunedì', time: '08:00', plan: 'Petto + Tricipiti', hasPlan: true },
  { day: 'Martedì', time: '18:00', plan: 'Schiena + Bicipiti', hasPlan: true },
  { day: 'Mercoledì', time: '08:00', plan: 'Petto + Tricipiti', hasPlan: true },
  { day: 'Giovedì', time: '', plan: '', hasPlan: false },
  { day: 'Venerdì', time: '08:00', plan: 'Petto + Tricipiti', hasPlan: true },
  { day: 'Sabato', time: '', plan: '', hasPlan: false },
  { day: 'Domenica', time: '', plan: '', hasPlan: false },
] as const

export default function Calendar() {
  return (
    <div className="container">
      <h1 className="title is-4">📅 Calendario</h1>

      <div className="tabs is-boxed mb-4">
        <ul>
          <li className="is-active"><a>Settimana</a></li>
          <li><a>Mese</a></li>
        </ul>
      </div>

      <section>
        {weekDays.map((slot, idx) => (
          <CalendarSlot
            key={idx}
            day={slot.day}
            time={slot.time}
            planName={slot.plan}
            hasPlan={slot.hasPlan}
          />
        ))}
      </section>
    </div>
  )
}
