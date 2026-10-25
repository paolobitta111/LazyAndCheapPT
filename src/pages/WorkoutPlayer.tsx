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
  const session = useWorkoutSession({ plannedSessionId: plannedSession.id! })
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
      <div className="container has-text-centered">
        <h1 className="title is-4">Avvio sessione...</h1>
      </div>
    )
  }

  return (
    <div className="container">
      {/* Header */}
      <div className="columns is-vcentered mb-5">
        <div className="column">
          <h1 className="title is-5">{planName}</h1>
          <p className="has-text-grey">
            {session.workoutLog.date} • {formatTime(session.timer.elapsedSec)}
          </p>
        </div>
        <div className="column has-text-right">
          <span className={`tag is-large ${session.isRunning ? 'is-success' : 'is-warning'}`}>
            {session.isRunning ? '⏸ In corso' : '⏸ In pausa'}
          </span>
        </div>
      </div>

      {/* Exercise sets */}
      <div className="box mb-4">
        <h2 className="title is-6">Esercizi</h2>

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
          <p className="has-text-grey">Nessun set registrato ancora.</p>
        )}

        {/* Add set form */}
        <div className="columns is-vcentered">
          <div className="column is-3">
            <input
              type="number"
              className="input is-medium"
              value={kg || ''}
              onChange={(e) => setKg(Number(e.target.value))}
              placeholder="kg"
              min={0}
              aria-label="Peso"
            />
          </div>
          <div className="column is-3">
            <input
              type="number"
              className="input is-medium"
              value={reps || ''}
              onChange={(e) => setReps(Number(e.target.value))}
              placeholder="reps"
              min={0}
              aria-label="Ripetizioni"
            />
          </div>
          <div className="column is-3">
            <input
              type="number"
              className="input is-medium"
              value={rpe || ''}
              onChange={(e) => setRpe(Number(e.target.value))}
              placeholder="RPE"
              min={1}
              max={10}
              aria-label="RPE"
            />
          </div>
          <div className="column is-3">
            <button
              className="button is-primary is-fullwidth is-medium"
              onClick={handleAddSet}
              aria-label="Aggiungi set"
            >
              ➕ Aggiungi Set
            </button>
          </div>
        </div>
      </div>

      {/* Recovery timer */}
      <div className="box mb-4">
        <h2 className="title is-6">⏱ Timer Recupero</h2>
        <div className="columns is-vcentered">
          <div className="column">
            <span className="tag is-info is-medium">
              {formatTime(session.remainingSec)}
            </span>
          </div>
          <div className="column">
            <div className="buttons">
              <button
                className="button is-info"
                onClick={() => {
                  session.recoveryTimer.start()
                }}
              >
                ▶️ Avvia
              </button>
              <button
                className="button is-warning"
                onClick={() => session.recoveryTimer.pause()}
              >
                ⏸ Pausa
              </button>
              <button
                className="button is-danger"
                onClick={() => session.recoveryTimer.stop()}
              >
                ⏹ Stop
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Session notes */}
      <div className="box mb-4">
        <h2 className="title is-6">📝 Note di sessione</h2>
        <textarea
          className="textarea"
          placeholder="Note sulla sessione..."
          value={sessionNotes}
          onChange={(e) => setSessionNotes(e.target.value)}
          aria-label="Note di sessione"
        />
      </div>

      {/* Close session */}
      <div className="has-text-centered mb-5">
        <button
          className="button is-danger is-medium is-fullwidth"
          onClick={handleCloseSession}
          disabled={isClosing}
          aria-label="Chiudi sessione"
        >
          {isClosing ? 'Salvataggio...' : '🏁 Chiudi Sessione'}
        </button>
      </div>
    </div>
  )
}
