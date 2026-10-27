import { useState } from 'react'
import { useAppData } from '../data/db'
import type { PlannedSessionRule, TrainingExercise, TrainingPlan } from '../models/entities'

const weekdayOptions: { day: number; letter: string; name: string }[] = [
  { day: 1, letter: 'L', name: 'Lunedì' },
  { day: 2, letter: 'M', name: 'Martedì' },
  { day: 3, letter: 'M', name: 'Mercoledì' },
  { day: 4, letter: 'G', name: 'Giovedì' },
  { day: 5, letter: 'V', name: 'Venerdì' },
  { day: 6, letter: 'S', name: 'Sabato' },
  { day: 7, letter: 'D', name: 'Domenica' },
]

const sportOptions: { value: NonNullable<TrainingPlan['sport']>; label: string }[] = [
  { value: 'strength', label: 'Forza' },
  { value: 'running', label: 'Corsa' },
  { value: 'cycling', label: 'Bici' },
  { value: 'other', label: 'Altro' },
]

interface ExerciseDraft {
  id: string
  name: string
  defaultSets: number
  defaultReps: number
  defaultKg: number
}

function emptyExercise(index: number): ExerciseDraft {
  return { id: `ex-${index + 1}`, name: '', defaultSets: 3, defaultReps: 10, defaultKg: 0 }
}

export function PlanForm(props: { plan?: TrainingPlan; onDone: () => void }) {
  const { trainingPlanRepo } = useAppData()
  const [name, setName] = useState(props.plan?.name ?? '')
  const [sport, setSport] = useState(props.plan?.sport ?? 'strength')
  const [exercises, setExercises] = useState<ExerciseDraft[]>(
    props.plan?.exercises.map((entry) => ({ ...entry })) ?? [emptyExercise(0)],
  )
  const [days, setDays] = useState<number[]>(
    props.plan?.plannedSessions?.map((rule) => rule.dayOfWeek).sort((a, b) => a - b) ?? [],
  )
  const [dates, setDates] = useState<string[]>(props.plan?.dates ?? [])
  const [newDate, setNewDate] = useState('')
  const [dateAddOpen, setDateAddOpen] = useState(false)
  const [editing, setEditing] = useState<number | null>(null)

  function toggleDay(day: number) {
    setDays((current) =>
      current.includes(day) ? current.filter((entry) => entry !== day) : [...current, day].sort((a, b) => a - b),
    )
  }

  function addDate() {
    if (!newDate || dates.includes(newDate)) return
    setDates((current) => [...current, newDate].sort())
    setNewDate('')
    setDateAddOpen(false)
  }

  function updateExercise(index: number, patch: Partial<ExerciseDraft>) {
    setExercises((current) => current.map((entry, i) => (i === index ? { ...entry, ...patch } : entry)))
  }

  function addExercise() {
    const index = exercises.length
    setExercises((current) => [...current, emptyExercise(current.length)])
    setEditing(index)
  }

  function removeExercise(index: number) {
    setExercises((current) => current.filter((_, i) => i !== index))
    setEditing(null)
  }

  async function save() {
    if (!name.trim()) return
    const rules: PlannedSessionRule[] = [...days]
      .sort((a, b) => a - b)
      .map((dayOfWeek, index) => ({ dayOfWeek, order: index + 1 }))
    const mapped: TrainingExercise[] = exercises.map((entry, index) => ({
      id: entry.id || `ex-${index + 1}`,
      name: entry.name,
      defaultSets: entry.defaultSets,
      defaultReps: entry.defaultReps,
      defaultKg: entry.defaultKg,
    }))
    if (props.plan) {
      await trainingPlanRepo.update(props.plan.id!, {
        name,
        sport: sport || undefined,
        exercises: mapped,
        plannedSessions: rules,
        dates,
      })
    } else {
      await trainingPlanRepo.create({
        name,
        description: '',
        sport: sport || undefined,
        exercises: mapped,
        plannedSessions: rules,
        dates,
      })
    }
    props.onDone()
  }

  const exercise = editing !== null ? exercises[editing] : undefined
  const exerciseIndex = editing !== null ? editing + 1 : 0
  const title = props.plan ? 'Modifica scheda' : 'Nuova scheda'

  return (
    <div className="sheet-backdrop" onClick={props.onDone}>
      <div
        role="dialog"
        aria-label={title}
        className="sheet sheet-bottom"
        style={{ width: 'min(92vw, 420px)', maxHeight: '80vh', overflowY: 'auto' }}
        onClick={(event) => event.stopPropagation()}
      >
        <div className="grabber" aria-hidden="true" />
        <div className="sheet-nav" style={{ marginBottom: '0.75rem' }}>
          {editing === null ? (
            <button className="btn-quiet" type="button" onClick={props.onDone}>Annulla</button>
          ) : (
            <button className="btn-quiet" type="button" onClick={() => setEditing(null)}>‹ Esercizi</button>
          )}
          <h2 className="t-head" style={{ margin: 0 }}>
            {exercise ? exercise.name.trim() || `Esercizio ${exerciseIndex}` : title}
          </h2>
          <button className="btn-quiet" type="button" disabled={!name.trim()} onClick={() => void save()}>
            Salva
          </button>
        </div>

        {editing === null ? (
          <>
            <div className="group">
              <div className="group-row">
                <input
                  className="field"
                  aria-label="Nome"
                  placeholder="Nome"
                  value={name}
                  onChange={(event) => setName(event.target.value)}
                />
              </div>
              <div className="group-row">
                <p className="t-cap" style={{ margin: '0 0 0.5rem', color: 'var(--label-2)' }}>Sport</p>
                <div className="seg">
                  {sportOptions.map((option) => (
                    <button
                      key={option.value}
                      type="button"
                      className="seg-item"
                      aria-pressed={sport === option.value}
                      onClick={() => setSport(option.value)}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="group">
              <div className="group-row">
                <p className="t-cap" style={{ margin: '0 0 0.5rem', color: 'var(--label-2)' }}>Giorni della settimana</p>
                <div style={{ display: 'flex', gap: '4px' }}>
                  {weekdayOptions.map((option) => (
                    <button
                      key={option.day}
                      type="button"
                      className="btn pill"
                      aria-label={option.name}
                      aria-pressed={days.includes(option.day)}
                      onClick={() => toggleDay(option.day)}
                    >
                      {option.letter}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="group">
              <p className="t-cap" style={{ margin: 0, color: 'var(--label-2)' }}>Esercizi · {exercises.length}</p>
              {exercises.map((entry, index) => (
                <button
                  key={entry.id || index}
                  type="button"
                  className="group-row"
                  aria-label={`Esercizio ${index + 1}`}
                  onClick={() => setEditing(index)}
                >
                  <span style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span>{entry.name.trim() || `Esercizio ${index + 1}`}</span>
                    <span className="nums t-foot" style={{ color: 'var(--label-2)' }}>
                      {entry.defaultSets}×{entry.defaultReps} · {entry.defaultKg}kg ›
                    </span>
                  </span>
                </button>
              ))}
              <button className="group-row" type="button" style={{ color: 'var(--tint)' }} onClick={addExercise}>
                + Aggiungi esercizio
              </button>
            </div>

            <div className="group">
              <p className="t-cap" style={{ margin: 0, color: 'var(--label-2)' }}>Date specifiche · {dates.length}</p>
              {dates.map((date) => (
                <div key={date} className="group-row">
                  <span style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span className="nums">{date}</span>
                    <button
                      className="btn-quiet"
                      type="button"
                      aria-label={`Rimuovi ${date}`}
                      onClick={() => setDates((current) => current.filter((entry) => entry !== date))}
                    >
                      ×
                    </button>
                  </span>
                </div>
              ))}
              <button className="btn-quiet" type="button" onClick={() => setDateAddOpen(true)}>
                + Aggiungi data
              </button>
              {dateAddOpen ? (
                <div className="group-row">
                  <span style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                    <input
                      className="field"
                      type="date"
                      aria-label="Nuova data"
                      value={newDate}
                      onChange={(event) => setNewDate(event.target.value)}
                    />
                    <button className="btn-quiet" type="button" onClick={addDate}>Aggiungi</button>
                  </span>
                </div>
              ) : null}
            </div>
          </>
        ) : (
          <div className="group">
            <div className="group-row">
              <input
                className="field"
                aria-label={`Esercizio ${exerciseIndex} nome`}
                placeholder="nome"
                value={exercise!.name}
                onChange={(event) => updateExercise(editing, { name: event.target.value })}
              />
            </div>
            <div className="group-row group-row-controls">
              <input
                className="field"
                type="number"
                aria-label={`Esercizio ${exerciseIndex} serie`}
                value={exercise!.defaultSets}
                onChange={(event) => updateExercise(editing, { defaultSets: Number(event.target.value) })}
              />
              <input
                className="field"
                type="number"
                aria-label={`Esercizio ${exerciseIndex} ripetizioni`}
                value={exercise!.defaultReps}
                onChange={(event) => updateExercise(editing, { defaultReps: Number(event.target.value) })}
              />
              <input
                className="field"
                type="number"
                aria-label={`Esercizio ${exerciseIndex} kg`}
                value={exercise!.defaultKg}
                onChange={(event) => updateExercise(editing, { defaultKg: Number(event.target.value) })}
              />
            </div>
            <button className="group-row" type="button" aria-label={`Rimuovi esercizio ${exerciseIndex}`} style={{ color: 'var(--red)' }} onClick={() => removeExercise(editing)}>
              Rimuovi
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
