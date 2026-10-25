// ============================================================================
// Dexie Database — IndexedDB schema with versioned tables and indexes
// ============================================================================

import Dexie, { type Table } from 'dexie'
import type { ReactNode } from 'react'
import { createContext, useContext } from 'react'
import type {
  TrainingPlan,
  PlannedSession,
  CalendarEntry,
  WorkoutLog,
  ExerciseLog,
  SetLog,
  CardioLog,
  GpxAttachment,
  UserSettings,
} from '../models/entities.ts'
import type {
  TrainingPlanRepo,
  PlannedSessionRepo,
  WorkoutLogRepo,
  ExerciseLogRepo,
  SetLogRepo,
  CardioLogRepo,
} from './repositories.ts'
import {
  TrainingPlanRepoImpl,
  PlannedSessionRepoImpl,
  WorkoutLogRepoImpl,
  ExerciseLogRepoImpl,
  SetLogRepoImpl,
  CardioLogRepoImpl,
} from './repositories.dexie'

// ---------------------------------------------------------------------------
// Database class
// ---------------------------------------------------------------------------

export class TrainingLogDB extends Dexie {
  // Dexie typed tables
  declare readonly trainingPlans: Table<TrainingPlan>
  declare readonly plannedSessions: Table<PlannedSession>
  declare readonly calendarEntries: Table<CalendarEntry>
  declare readonly workoutLogs: Table<WorkoutLog>
  declare readonly exerciseLogs: Table<ExerciseLog>
  declare readonly setLogs: Table<SetLog>
  declare readonly cardioLogs: Table<CardioLog>
  declare readonly gpxAttachments: Table<GpxAttachment>
  declare readonly userSettings: Table<UserSettings>

  constructor() {
    super('LazyCheapCoachDB')

    // Version 1 — initial schema
    this.version(1).stores(
      {
        trainingPlans:    '&id',
        plannedSessions:  '&id, date, [planId+date], status',
        calendarEntries:  '&id, date, [type+referenceId]',
        workoutLogs:      '&id, date, [plannedSessionId+date]',
        exerciseLogs:     '&id, workoutLogId, exerciseId',
        setLogs:          '&id, exerciseLogId',
        cardioLogs:       '&id, date, type',
        gpxAttachments:   '&id, [cardioLogId+fileName], [workoutLogId+fileName]',
        userSettings:     '&id',
      } as const
    )
  }
}

// Singleton instance
export const db = new TrainingLogDB()

// ---------------------------------------------------------------------------
// React context for dependency injection of repo instances
// ---------------------------------------------------------------------------

export interface AppData {
  trainingPlanRepo: TrainingPlanRepo
  plannedSessionRepo: PlannedSessionRepo
  workoutLogRepo: WorkoutLogRepo
  exerciseLogRepo: ExerciseLogRepo
  setLogRepo: SetLogRepo
  cardioLogRepo: CardioLogRepo
}

const AppDataContext = createContext<AppData | null>(null)

export function DataProvider(props: { children: ReactNode }): React.ReactElement {
  // Singleton repos — safe because React renders synchronously
  const trainingPlanRepo = new TrainingPlanRepoImpl()
  const plannedSessionRepo = new PlannedSessionRepoImpl()
  const workoutLogRepo = new WorkoutLogRepoImpl()
  const exerciseLogRepo = new ExerciseLogRepoImpl()
  const setLogRepo = new SetLogRepoImpl()
  const cardioLogRepo = new CardioLogRepoImpl()

  return (
    <AppDataContext.Provider value={{ trainingPlanRepo, plannedSessionRepo, workoutLogRepo, exerciseLogRepo, setLogRepo, cardioLogRepo }}>
      {props.children}
    </AppDataContext.Provider>
  )
}

export function useAppData(): AppData {
  const ctx = useContext(AppDataContext)
  if (!ctx) throw new Error('useAppData must be used within DataProvider')
  return ctx
}
