import { SessionCard } from '../components/SessionCard'
import { ExerciseRow } from '../components/ExerciseRow'

const mockSession = {
  title: 'Petto + Tricipiti',
  startTime: '08:00',
  duration: '45 min',
}

const mockExercises = [
  { name: 'Panca Piana', sets: 4, reps: 10, weight: '60 kg' },
  { name: 'Croci ai Cavi', sets: 3, reps: 12, weight: '20 kg' },
  { name: 'Push-up', sets: 3, reps: 15, weight: 'bodyweight' },
]

export default function Today() {
  return (
    <div className="container">
      <h1 className="title is-4">📅 Oggi</h1>

      <section className="mb-5">
        <h2 className="title is-6">Sessione in corso</h2>
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

      <section className="mb-5">
        <h2 className="title is-6">Quick Add</h2>
        <div className="box has-background-light">
          <p className="has-text-centered has-text-grey">
            Aggiungi un esercizio o una cardio
          </p>
        </div>
      </section>

      <section>
        <h2 className="title is-6">Riepilogo della giornata</h2>
        <div className="columns">
          <div className="column">
            <div className="has-background-primary-dark p-3 has-text-centered">
              <p className="is-size-3 has-text-white">{mockExercises.length}</p>
              <p className="has-text-white has-text-small">Esercizi</p>
            </div>
          </div>
          <div className="column">
            <div className="has-background-primary p-3 has-text-centered">
              <p className="is-size-3 has-text-white">{mockSession.duration}</p>
              <p className="has-text-white has-text-small">Durata</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
