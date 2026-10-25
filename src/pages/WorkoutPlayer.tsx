import { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import { useWorkoutSession } from '../hooks/useWorkoutSession'
import { ExerciseSetRow } from '../components/ExerciseSetRow'
import { useAppData } from '../data/db'
import type { PlannedSession } from '../models/entities'

export default function WorkoutPlayer() {
  const { planId } = useParams<{ planId: string }>()
  const [plannedSession, setPlannedSession] = useState<PlannedSession | null>(null)
  const { plannedSessionRepo } = useAppData()

  useEffect(() => {
    const fetchSession = async () => {
      if (planId) {
        const sessions = await plannedSessionRepo.listByDate(new Date().toISOString().slice(0, 10))
        const session = sessions.find((s) => s.planId === planId)
        if (session) setPlannedSession(session)
      }
    }
    fetchSession()
  }, [planId])

  if (!plannedSession) return null
  const session = useWorkoutSession({ plannedSessionId: plannedSession.id!, planId: plannedSession.planId })
  const [kg, setKg] = useState<number>(0)
  const [reps, setReps] = useState<number>(0)
  const [rpe, setRpe] = useState<number | undefined>(undefined)
  const [sessionNotes, setSessionNotes] = useState('')
  const [isClosing, setIsClosing] = useState(false)
  const [planName, setPlanName] = useState<string>('Sessione')

  useEffect(() => {
    session.startSession()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    const loadPlanName = async () => {
      const { trainingPlanRepo } = useAppData()
      if (plannedSession.planId) {
        const plan = await trainingPlanRepo.get(plannedSession.planId)
        if (plan) setPlanName(plan.name)
      }
    }
    loadPlanName()
  }, [plannedSession.planId])

  const handleAddSet = async () => {
    // In a real impl, this would create an ExerciseLog first
    // For now, we just add a set to the first exercise
    const exerciseLogId = `ex-log-${Date.now()}`
    await session.addSet(exerciseLogId, reps, kg, rpe)
    setReps(0)
    setKg(0)
    setRpe(undefined)
  }

  const handleToggleComplete = async (setLog: import('../models/entities').SetLog) => {
    await session.completeSet(setLog)
  }

  const handleCloseSession = async () => {
    setIsClosing(true)
    await session.closeSession(sessionNotes)
  }

  const formatTime = (sec: number): string => {
    const mins = Math.floor(sec / 60)
    const secs = sec % 60
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }

  if (!session.workoutLog) {
    return (
      <div>
        <h1>Avvio sessione...</h1>
      </div>
    )
  }

  return (
    <div>
      <div>
        <h1>{planName}</h1>
        <p className="nums">
          {session.workoutLog.date} • {formatTime(session.timer.elapsedSec)}
        </p>
        <p>{session.isRunning ? 'In corso' : 'In pausa'}</p>
      </div>

      <div className="glass">
        <h2>Esercizi</h2>

        {session.setLogs.length > 0 ? (
          session.setLogs.map((setLog, idx) => (
            <ExerciseSetRow
              key={setLog.id}
              setLog={setLog}
              index={idx}
              onToggleComplete={handleToggleComplete}
              isCompleted={setLog.completed}
            />
          ))
        ) : (
          <p>Nessun set registrato ancora.</p>
        )}

        <input
          type="number"
          className="field"
          value={kg || ''}
          onChange={(e) => setKg(Number(e.target.value))}
          placeholder="kg"
          min={0}
          aria-label="Peso"
        />
        <input
          type="number"
          className="field"
          value={reps || ''}
          onChange={(e) => setReps(Number(e.target.value))}
          placeholder="reps"
          min={0}
          aria-label="Ripetizioni"
        />
        <input
          type="number"
          className="field"
          value={rpe || ''}
          onChange={(e) => setRpe(Number(e.target.value))}
          placeholder="RPE"
          min={1}
          max={10}
          aria-label="RPE"
        />
        <button
          className="btn btn-primary"
          type="button"
          onClick={handleAddSet}
          aria-label="Aggiungi set"
        >
          Aggiungi Set
        </button>
      </div>

      <div className="glass">
        <h2>Timer Recupero</h2>
        <span className="nums">{formatTime(session.remainingSec)}</span>
        <button className="btn" type="button" onClick={() => session.recoveryTimer.start()}>Avvia</button>
        <button className="btn" type="button" onClick={() => session.recoveryTimer.pause()}>Pausa</button>
        <button className="btn" type="button" onClick={() => session.recoveryTimer.stop()}>Stop</button>
      </div>

      <div className="glass">
        <h2>Note di sessione</h2>
        <textarea
          className="field"
          placeholder="Note sulla sessione..."
          value={sessionNotes}
          onChange={(e) => setSessionNotes(e.target.value)}
          aria-label="Note di sessione"
        />
      </div>

      <button
        className="btn"
        type="button"
        onClick={handleCloseSession}
        disabled={isClosing}
        aria-label="Chiudi sessione"
      >
        {isClosing ? 'Salvataggio...' : 'Chiudi Sessione'}
      </button>
    </div>
  )
}
