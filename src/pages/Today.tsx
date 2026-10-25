import { Link } from 'react-router-dom'
import { SessionCard } from '../components/SessionCard'
import { ExerciseRow } from '../components/ExerciseRow'
import { Timer } from '../components/Timer'

const today = new Date().toLocaleDateString('it-IT', {
  weekday: 'long',
  day: 'numeric',
  month: 'long',
})

const mockSession = {
  title: 'Petto + Tricipiti',
  startTime: '08:00',
  duration: '45 min',
}

const mockExercises = [
  { name: 'Panca Piana', sets: 4, reps: 10, weight: '60 kg' },
  { name: 'Panca Inclinata', sets: 3, reps: 12, weight: '50 kg' },
  { name: 'Croci ai Cavi', sets: 3, reps: 12, weight: '20 kg' },
  { name: 'Push-up', sets: 3, reps: 15, weight: 'bodyweight' },
  { name: 'French Press', sets: 3, reps: 10, weight: '15 kg' },
  { name: 'Push-aperto', sets: 3, reps: 12, weight: '12 kg' },
]

const mockCardio = {
  type: 'Corsa',
  duration: '20 min',
  distance: '3.2 km',
  avgPace: "5'40\"/km",
}

export default function Today() {
  return (
    <div className="container">
      <h1 className="title is-4 mb-0">{today.charAt(0).toUpperCase() + today.slice(1)}</h1>

      {/* Sessione in corso */}
      <section className="mb-5">
        <h2 className="title is-6">🏋️ Sessione</h2>
        <SessionCard title={mockSession.title} status="active" duration={mockSession.duration}>
          <ul className="list">
            {mockExercises.map((exercise, idx) => (
              <li key={idx}>
                <ExerciseRow
                  name={exercise.name}
                  sets={exercise.sets}
                  reps={exercise.reps}
                  weight={exercise.weight}
                />
              </li>
            ))}
          </ul>
        </SessionCard>
      </section>

      {/* Timer */}
      <section className="mb-5">
        <h2 className="title is-6">⏱️ Timer</h2>
        <Timer startedAt="2026-10-24T08:00:00Z" targetEndAt="2026-10-24T09:00:00Z" />
      </section>

      {/* Cardio */}
      <section className="mb-5">
        <h2 className="title is-6">🏃 Cardio</h2>
        <div className="box">
          <p className="title is-5 mb-1">{mockCardio.type}</p>
          <p className="has-text-grey">
            {mockCardio.duration} · {mockCardio.distance} · {mockCardio.avgPace}
          </p>
          <Link className="button is-link is-small mt-3" to="/cardio">Registra cardio</Link>
        </div>
      </section>

      {/* Quick Add */}
      <section className="mb-5">
        <h2 className="title is-6">➕ Quick Add</h2>
        <div className="field has-addons mb-3">
          <div className="control is-expanded">
            <input className="input" type="text" placeholder="Aggiungi esercizio..." />
          </div>
          <div className="control">
            <button className="button is-primary">Aggiungi</button>
          </div>
        </div>
        <div className="buttons">
          <button className="button is-small is-info">+ Esercizio</button>
          <button className="button is-small is-success">+ Cardio</button>
        </div>
      </section>

      {/* Riepilogo */}
      <section>
        <h2 className="title is-6">📊 Riepilogo</h2>
        <div className="columns">
          <div className="column is-one-third">
            <div className="has-background-primary-dark p-3 has-text-centered">
              <p className="is-size-3 has-text-white">{mockExercises.length}</p>
              <p className="has-text-white has-text-small">Esercizi</p>
            </div>
          </div>
          <div className="column is-one-third">
            <div className="has-background-primary p-3 has-text-centered">
              <p className="is-size-3 has-text-white">{mockSession.duration}</p>
              <p className="has-text-white has-text-small">Durata</p>
            </div>
          </div>
          <div className="column is-one-third">
            <div className="has-background-success p-3 has-text-centered">
              <p className="is-size-3 has-text-white">{mockCardio.distance}</p>
              <p className="has-text-white has-text-small">Cardio</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
