// ============================================================================
// Dexie Database — IndexedDB schema with versioned tables and indexes
// ============================================================================

import Dexie, { type Table } from 'dexie'
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
