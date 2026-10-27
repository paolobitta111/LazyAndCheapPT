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

  function toggleDay(day: number) {
    setDays((current) =>
      current.includes(day) ? current.filter((entry) => entry !== day) : [...current, day].sort((a, b) => a - b),
    )
  }

  function addDate() {
    if (!newDate || dates.includes(newDate)) return
    setDates((current) => [...current, newDate].sort())
    setNewDate('')
  }

  function updateExercise(index: number, patch: Partial<ExerciseDraft>) {
    setExercises((current) => current.map((entry, i) => (i === index ? { ...entry, ...patch } : entry)))
  }

  async function save() {
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

  return (
    <div role="dialog" aria-label={props.plan ? 'Modifica scheda' : 'Nuova scheda'} className="glass">
      <label>
        Nome
        <input className="field" value={name} onChange={(event) => setName(event.target.value)} />
      </label>
      <label>
        Sport
        <select className="field" value={sport} onChange={(event) => setSport(event.target.value)}>
          <option value="running">running</option>
          <option value="cycling">cycling</option>
          <option value="strength">strength</option>
          <option value="other">other</option>
        </select>
      </label>

      <p className="label">Giorni della settimana</p>
      <div style={{ display: 'flex', gap: '4px' }}>
        {weekdayOptions.map((option) => (
          <button
            key={option.day}
            type="button"
            aria-label={option.name}
            aria-pressed={days.includes(option.day)}
            className={days.includes(option.day) ? 'btn btn-primary' : 'btn'}
            style={{ minWidth: '32px' }}
            onClick={() => toggleDay(option.day)}
          >
            {option.letter}
          </button>
        ))}
      </div>

      <p className="label">Date specifiche</p>
      <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
        <input
          className="field"
          type="date"
          aria-label="Nuova data"
          value={newDate}
          onChange={(event) => setNewDate(event.target.value)}
        />
        <button className="btn" type="button" onClick={addDate}>Aggiungi data</button>
      </div>
      {dates.map((date) => (
        <div key={date} style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
          <span>{date}</span>
          <button
            className="btn"
            type="button"
            aria-label={`Rimuovi ${date}`}
            onClick={() => setDates((current) => current.filter((entry) => entry !== date))}
          >
            Rimuovi
          </button>
        </div>
      ))}

      <p className="label">Esercizi</p>
      {exercises.map((entry, index) => (
        <div key={entry.id || index} style={{ display: 'flex', gap: '6px' }}>
          <input
            className="field"
            aria-label={`Esercizio ${index + 1} nome`}
            placeholder="nome"
            value={entry.name}
            onChange={(event) => updateExercise(index, { name: event.target.value })}
          />
          <input
            className="field"
            type="number"
            aria-label={`Esercizio ${index + 1} serie`}
            value={entry.defaultSets}
            onChange={(event) => updateExercise(index, { defaultSets: Number(event.target.value) })}
          />
          <input
            className="field"
            type="number"
            aria-label={`Esercizio ${index + 1} ripetizioni`}
            value={entry.defaultReps}
            onChange={(event) => updateExercise(index, { defaultReps: Number(event.target.value) })}
          />
          <input
            className="field"
            type="number"
            aria-label={`Esercizio ${index + 1} kg`}
            value={entry.defaultKg}
            onChange={(event) => updateExercise(index, { defaultKg: Number(event.target.value) })}
          />
        </div>
      ))}
      <button
        className="btn"
        type="button"
        onClick={() => setExercises((current) => [...current, emptyExercise(current.length)])}
      >
        + Esercizio
      </button>

      <button className="btn btn-primary" type="button" onClick={() => void save()}>Salva</button>
    </div>
  )
}