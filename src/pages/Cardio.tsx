import { useState } from 'react'
import { useAppData } from '../data/db'
import { CardioLogService } from '../services/cardio-log.service'
import { inspectGpx } from '../services/gpx'
import { dateKey } from '../services/planning.service'
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
  const { cardioLogRepo, gpxAttachmentRepo } = useAppData()
  const service = new CardioLogService(cardioLogRepo)
  const [sport, setSport] = useState<Sport>('running')
  const [notes, setNotes] = useState('')
  const [durationMin, setDurationMin] = useState(20)
  const [distanceKm, setDistanceKm] = useState(3)
  const [segments, setSegments] = useState<CardioSegment[]>([])
  const [savedId, setSavedId] = useState<string | null>(null)
  const [gpxSummary, setGpxSummary] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const date = dateKey(new Date())

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
    <div>
      <h1>Cardio</h1>
      <label>Sport</label>
      <select className="field" value={sport} onChange={(event) => setSport(event.target.value as Sport)}>
        <option value="running">Corsa</option>
        <option value="cycling">Bici</option>
        <option value="other">Altro</option>
      </select>

      <label>Durata (min)</label>
      <input className="field" type="number" min={0} value={durationMin} onChange={(event) => setDurationMin(Number(event.target.value))} />
      <label>Distanza (km)</label>
      <input className="field" type="number" min={0} step={0.1} value={distanceKm} onChange={(event) => setDistanceKm(Number(event.target.value))} />

      <label>Note</label>
      <textarea className="field" value={notes} onChange={(event) => setNotes(event.target.value)} />

      <button className="btn btn-primary" type="button" onClick={saveFree}>Salva sessione libera</button>

      <h2>Segmenti</h2>
      {segments.map((segment, index) => (
        <div className="glass" key={index}>
          <select
            className="field"
            value={segment.type}
            onChange={(event) => updateSegment(index, { type: event.target.value as SegmentType })}
          >
            <option value="warmup">Riscaldamento</option>
            <option value="interval">Intervallo</option>
            <option value="recovery">Recupero</option>
            <option value="main">Principale</option>
          </select>
          <input
            className="field"
            type="number"
            min={0}
            value={segment.durationSec}
            onChange={(event) => updateSegment(index, { durationSec: Number(event.target.value) })}
            aria-label={`Durata segmento ${index + 1}`}
          />
          <input
            className="field"
            type="number"
            min={0}
            step={0.1}
            value={segment.distanceKm ?? 0}
            onChange={(event) => updateSegment(index, { distanceKm: Number(event.target.value) })}
            aria-label={`Distanza segmento ${index + 1}`}
          />
        </div>
      ))}
      <button className="btn" type="button" onClick={() => setSegments((current) => [...current, emptySegment()])}>Aggiungi segmento</button>
      <button className="btn" type="button" onClick={saveSegments}>Salva con segmenti</button>
      <h2>GPX</h2>
      <p>Il file resta sul dispositivo. Nessuna mappa.</p>
      <input
        className="mb-3"
        type="file"
        accept=".gpx,application/gpx+xml,text/xml"
        onChange={async (event) => {
          const file = event.target.files?.[0]
          if (!file) return
          const xml = await file.text()
          const inspection = inspectGpx(xml)
          if (!inspection.valid) {
            setError(inspection.errors.join('; '))
            return
          }
          const attachment = await gpxAttachmentRepo.create({
            cardioLogId: savedId ?? undefined,
            fileName: file.name,
            fileData: xml,
            uploadedAt: new Date(),
          })
          setGpxSummary(`${attachment.fileName}: ${inspection.pointCount} punti, ${inspection.distanceKm.toFixed(2)} km`)
          setError(null)
        }}
      />
      {gpxSummary && <p>{gpxSummary}</p>}
      {error && <p className="has-text-danger">{error}</p>}
      {savedId && <p className="has-text-success">Salvato: {savedId}</p>}
    </div>
  )
}
