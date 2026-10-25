import { HistoryItem } from '../components/HistoryItem'

const mockHistory = [
  { date: '24 Ott 2026', type: 'workout' as const, duration: '45 min', planName: 'Petto + Tricipiti' },
  { date: '22 Ott 2026', type: 'workout' as const, duration: '50 min', planName: 'Schiena + Bicipiti' },
  { date: '20 Ott 2026', type: 'cardio' as const, duration: '30 min', planName: '' },
  { date: '18 Ott 2026', type: 'workout' as const, duration: '55 min', planName: 'Gambe + Addome' },
  { date: '16 Ott 2026', type: 'workout' as const, duration: '40 min', planName: 'Petto + Tricipiti' },
]

export default function History() {
  return (
    <div className="container">
      <h1 className="title is-4">📊 Storico</h1>

      <div className="field mb-4">
        <div className="control">
          <div className="select is-fullwidth">
            <select className="is-fullwidth">
              <option>Ultima settimana</option>
              <option>Ultimo mese</option>
              <option>Ultimi 3 mesi</option>
              <option>Tutto</option>
            </select>
          </div>
        </div>
      </div>

      <section>
        {mockHistory.map((item, idx) => (
          <HistoryItem
            key={idx}
            date={item.date}
            type={item.type}
            duration={item.duration}
            planName={item.planName}
          />
        ))}
      </section>
    </div>
  )
}
