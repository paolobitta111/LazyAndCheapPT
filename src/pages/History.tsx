import { useEffect, useMemo, useState } from 'react'
import { HistoryItem } from '../components/HistoryItem'
import { useAppData } from '../data/db'
import { buildHistory, filterHistory, formatDuration, type HistoryEntry } from '../services/history.service'

export default function History() {
  const { workoutLogRepo, cardioLogRepo, trainingPlanRepo } = useAppData()
  const [entries, setEntries] = useState<HistoryEntry[]>([])
  const [type, setType] = useState<'all' | 'workout' | 'cardio'>('all')
  const [days, setDays] = useState<number | null>(7)
  const [query, setQuery] = useState('')
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    Promise.all([workoutLogRepo.list(), cardioLogRepo.list(), trainingPlanRepo.list()])
      .then(([workouts, cardios, plans]) => {
        if (!cancelled) setEntries(buildHistory(workouts, cardios, plans))
      })
      .catch(() => {
        if (!cancelled) setError('Impossibile leggere lo storico locale')
      })
    return () => {
      cancelled = true
    }
  }, [workoutLogRepo, cardioLogRepo, trainingPlanRepo])

  const visible = useMemo(
    () => filterHistory(entries, { type, days, query }),
    [entries, type, days, query],
  )

  return (
    <div className="container">
      <h1 className="title is-4">Storico</h1>
      <p className="help mb-3">Dati salvati solo su questo dispositivo.</p>
      <div className="field">
        <div className="select is-fullwidth">
          <select value={String(days ?? 'all')} onChange={(event) => setDays(event.target.value === 'all' ? null : Number(event.target.value))}>
            <option value="7">Ultima settimana</option>
            <option value="30">Ultimo mese</option>
            <option value="90">Ultimi 3 mesi</option>
            <option value="all">Tutto</option>
          </select>
        </div>
      </div>
      <div className="field">
        <div className="select is-fullwidth">
          <select value={type} onChange={(event) => setType(event.target.value as 'all' | 'workout' | 'cardio')}>
            <option value="all">Tutti</option>
            <option value="workout">Workout</option>
            <option value="cardio">Cardio</option>
          </select>
        </div>
      </div>
      <div className="field">
        <input className="input" value={query} placeholder="Cerca note o scheda" onChange={(event) => setQuery(event.target.value)} />
      </div>
      {error && <p className="has-text-danger">{error}</p>}
      {visible.length === 0 && <p className="has-text-grey">Nessun log nel filtro.</p>}
      {visible.map((item) => (
        <HistoryItem
          key={item.id}
          date={item.date}
          type={item.type}
          duration={formatDuration(item.durationSec)}
          planName={item.planVersion ? `${item.title} v${item.planVersion}` : item.title}
          notes={item.notes}
        />
      ))}
    </div>
  )
}
