import { useNavigate } from 'react-router-dom'
import { formatToday } from './today-mock'
import { SessionCard } from '../components/SessionCard'
import { ExerciseRow } from '../components/ExerciseRow'
import { Timer } from '../components/Timer'

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
  const navigate = useNavigate()

  return (
    <div>
      <p className="today-date">{formatToday()}</p>
      <section>
        <h2>Sessione</h2>
        <SessionCard title={mockSession.title} status="active" duration={mockSession.duration}>
          <ul>
            {mockExercises.map((exercise) => (
              <li key={exercise.name}>
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

      <section>
        <h2>Timer</h2>
        <Timer startedAt="2026-10-24T08:00:00Z" targetEndAt="2026-10-24T09:00:00Z" />
      </section>

      <section className="glass">
        <h2>Cardio</h2>
        <p>{mockCardio.type}</p>
        <p className="nums">
          {mockCardio.duration} · {mockCardio.distance} · {mockCardio.avgPace}
        </p>
        <button className="btn" type="button" onClick={() => navigate('/cardio')}>Registra cardio</button>
      </section>

      <section className="glass">
        <h2>Quick Add</h2>
        <input className="field" type="text" placeholder="Aggiungi esercizio..." />
        <button className="btn btn-primary" type="button">Aggiungi</button>
        <button className="btn" type="button">+ Esercizio</button>
        <button className="btn" type="button">+ Cardio</button>
      </section>

      <section className="glass metrics">
        <h2>Riepilogo</h2>
        <p className="nums">{mockExercises.length} esercizi</p>
        <p className="nums">{mockSession.duration}</p>
        <p className="nums">{mockCardio.distance}</p>
      </section>
    </div>
  )
}
