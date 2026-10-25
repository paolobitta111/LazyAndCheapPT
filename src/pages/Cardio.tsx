import { useState } from 'react'
import { useAppData } from '../data/db'
import { CardioLogService } from '../services/cardio-log.service'
import type { CardioSegment } from '../models/entities'

type Sport = 'running' | 'cycling' | 'other'
type SegmentType = CardioSegment['type']

const emptySegment = (): CardioSegment => ({
  type: 'interval',
  startTime: new Date(),
  endTime: new Date(),
  durationSec: 0,
  distanceKm: 0,
})

export default function Cardio() {
  const { cardioLogRepo } = useAppData()
  const service = new CardioLogService(cardioLogRepo)
  const [sport, setSport] = useState<Sport>('running')
  const [notes, setNotes] = useState('')
  const [durationMin, setDurationMin] = useState(20)
  const [distanceKm, setDistanceKm] = useState(3)
  const [segments, setSegments] = useState<CardioSegment[]>([])
  const [savedId, setSavedId] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const date = new Date().toISOString().slice(0, 10)

  async function saveFree() {
    setError(null)
    const log = await service.createFreeSession({
      date,
      type: sport,
      durationSec: Math.round(durationMin * 60),
      distanceKm,
      notes: notes || undefined,
    })
    setSavedId(log.id ?? null)
  }

  async function saveSegments() {
    setError(null)
    if (segments.length === 0) {
      setError('Aggiungi almeno un segmento')
      return
    }
    const log = await service.createWithSegments(
      { date, type: sport, notes: notes || undefined },
      segments,
    )
    setSavedId(log.id ?? null)
  }

  function updateSegment(index: number, patch: Partial<CardioSegment>) {
    setSegments((current) => current.map((segment, i) => (i === index ? { ...segment, ...patch } : segment)))
  }

  return (
    <div className="container">
      <h1 className="title is-4">Cardio</h1>
      <div className="field">
        <label className="label">Sport</label>
        <div className="select">
          <select value={sport} onChange={(event) => setSport(event.target.value as Sport)}>
            <option value="running">Corsa</option>
            <option value="cycling">Bici</option>
            <option value="other">Altro</option>
          </select>
        </div>
      </div>

      <div className="columns">
        <div className="column">
          <label className="label">Durata (min)</label>
          <input className="input" type="number" min={0} value={durationMin} onChange={(event) => setDurationMin(Number(event.target.value))} />
        </div>
        <div className="column">
          <label className="label">Distanza (km)</label>
          <input className="input" type="number" min={0} step={0.1} value={distanceKm} onChange={(event) => setDistanceKm(Number(event.target.value))} />
        </div>
      </div>

      <div className="field">
        <label className="label">Note</label>
        <textarea className="textarea" value={notes} onChange={(event) => setNotes(event.target.value)} />
      </div>

      <button className="button is-primary mb-5" type="button" onClick={saveFree}>Salva sessione libera</button>

      <h2 className="title is-5">Segmenti</h2>
      {segments.map((segment, index) => (
        <div className="box" key={index}>
          <div className="select mb-2">
            <select
              value={segment.type}
              onChange={(event) => updateSegment(index, { type: event.target.value as SegmentType })}
            >
              <option value="warmup">Riscaldamento</option>
              <option value="interval">Intervallo</option>
              <option value="recovery">Recupero</option>
              <option value="main">Principale</option>
            </select>
          </div>
          <div className="columns">
            <div className="column">
              <input
                className="input"
                type="number"
                min={0}
                value={segment.durationSec}
                onChange={(event) => updateSegment(index, { durationSec: Number(event.target.value) })}
                aria-label={`Durata segmento ${index + 1}`}
              />
            </div>
            <div className="column">
              <input
                className="input"
                type="number"
                min={0}
                step={0.1}
                value={segment.distanceKm ?? 0}
                onChange={(event) => updateSegment(index, { distanceKm: Number(event.target.value) })}
                aria-label={`Distanza segmento ${index + 1}`}
              />
            </div>
          </div>
        </div>
      ))}
      <div className="buttons">
        <button className="button" type="button" onClick={() => setSegments((current) => [...current, emptySegment()])}>Aggiungi segmento</button>
        <button className="button is-link" type="button" onClick={saveSegments}>Salva con segmenti</button>
      </div>
      {error && <p className="has-text-danger">{error}</p>}
      {savedId && <p className="has-text-success">Salvato: {savedId}</p>}
    </div>
  )
}
