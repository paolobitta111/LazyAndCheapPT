import { useState, useEffect, useCallback, useRef } from 'react'
import type { WorkoutLog, SetLog, ExerciseLog } from '../models/entities'

import { useAppData } from '../data/db'

interface UseWorkoutSessionOpts {
  plannedSessionId: string
}

interface UseWorkoutSessionReturn {
  workoutLog: WorkoutLog | null
  exerciseLogs: ExerciseLog[]
  setLogs: SetLog[]
  addSet: (exerciseLogId: string, repCount: number, kg: number, rpe?: number) => Promise<SetLog>
  completeSet: (setLog: SetLog) => Promise<void>
  startSession: () => Promise<void>
  closeSession: (notes: string) => Promise<void>
  timer: { elapsedSec: number; remainingSec: number }
  isRunning: boolean
  setRemainingSec: (seconds: number) => void
  remainingSec: number
  recoveryTimer: {
    running: boolean
    start: () => void
    stop: () => void
    pause: () => void
    setDuration: (seconds: number) => void
  }
}

export function useWorkoutSession({
  plannedSessionId,
}: UseWorkoutSessionOpts): UseWorkoutSessionReturn {
  const { workoutLogRepo, setLogRepo } = useAppData()
  const [workoutLog, setWorkoutLog] = useState<WorkoutLog | null>(null)
  const [setLogs, setSetLogs] = useState<SetLog[]>([])
  const [elapsedSec, setElapsedSec] = useState(0)
  const [exerciseLogs] = useState<ExerciseLog[]>([])
  const [isRunning, setIsRunning] = useState(false)
  const [remainingSec, setRemainingSec] = useState(0)
  const [recoveryRunning, setRecoveryRunning] = useState(false)

  const startedAtRef = useRef<number | null>(null)
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const recoveryRef = useRef<ReturnType<typeof setInterval> | null>(null)

  // Timer tick
  useEffect(() => {
    if (isRunning && startedAtRef.current) {
      intervalRef.current = setInterval(() => {
        const now = Date.now()
        const elapsed = Math.floor((now - startedAtRef.current!) / 1000)
        setElapsedSec(elapsed)
      }, 1000)
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current)
    }
  }, [isRunning])

  // Recovery timer tick
  useEffect(() => {
    if (recoveryRunning && remainingSec > 0) {
      recoveryRef.current = setInterval(() => {
        setRemainingSec((prev) => {
          if (prev <= 1) {
            setRecoveryRunning(false)
            return 0
          }
          return prev - 1
        })
      }, 1000)
    }
    return () => {
      if (recoveryRef.current) clearInterval(recoveryRef.current)
    }
  }, [recoveryRunning, remainingSec])

  const startSession = useCallback(async () => {
    // SAFETY: Dexie returns string keys; entity schema requires Date (see entities.ts)
    const log: WorkoutLog = {
      id: `wl-${Date.now()}`,
      plannedSessionId,
      date: new Date().toISOString().split('T')[0],
      notes: '',
    } as unknown as WorkoutLog
    await workoutLogRepo.create(log)
    setWorkoutLog(log)
    setIsRunning(true)
    startedAtRef.current = Date.now()
  }, [plannedSessionId, workoutLogRepo])

  const addSet = useCallback(
    async (exerciseLogId: string, repCount: number, kg: number, rpe?: number): Promise<SetLog> => {
      // SAFETY: Dexie returns string keys; entity schema requires Date (see entities.ts)
      const setLog: SetLog = {
        id: `set-${Date.now()}`,
        exerciseLogId,
        repCount,
        kg,
        rpe,
        completed: true,
      } as unknown as SetLog
      await setLogRepo.create(setLog)
      setSetLogs((prev) => [...prev, setLog])
      return setLog
    },
    [setLogRepo],
  )

  const completeSet = useCallback(async (setLog: SetLog) => {
    await setLogRepo.update(setLog.id!, { completed: true })
  }, [])

  const closeSession = useCallback(
    async (notes: string) => {
      const durationSec = elapsedSec
      if (workoutLog) {
        await workoutLogRepo.update(workoutLog.id!, { durationSec, notes })
      }
      setIsRunning(false)
      setElapsedSec(0)
      startedAtRef.current = null
    },
    [workoutLog, elapsedSec, workoutLogRepo],
  )

  const startRecovery = useCallback(() => {
    setRecoveryRunning(true)
  }, [])

  const stopRecovery = useCallback(() => {
    setRecoveryRunning(false)
    setRemainingSec(0)
  }, [])

  const pauseRecovery = useCallback(() => {
    setRecoveryRunning(false)
  }, [])

  const setRecoveryDuration = useCallback((seconds: number) => {
    setRemainingSec(seconds)
  }, [])

  const recoveryTimer = {
    running: recoveryRunning,
    start: startRecovery,
    stop: stopRecovery,
    pause: pauseRecovery,
    setDuration: setRecoveryDuration,
  }

  return {
    workoutLog,
    exerciseLogs,
    setLogs,
    addSet,
    completeSet,
    startSession,
    closeSession,
    timer: { elapsedSec, remainingSec },
    isRunning,
    remainingSec,
    setRemainingSec,
    recoveryTimer,
  }
}
