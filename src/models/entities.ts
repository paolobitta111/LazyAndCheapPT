// ============================================================================
// Entities — Core domain interfaces for Training Log
// ============================================================================

// ---------------------------------------------------------------------------
// Base
// ---------------------------------------------------------------------------

/** All persisted entities share these fields. */
export interface Entity {
  id?: string
  createdAt: Date
  updatedAt: Date
}

// ---------------------------------------------------------------------------
// TrainingPlan
// ---------------------------------------------------------------------------

export interface TrainingExercise {
  id: string
  name: string
  defaultSets: number
  defaultReps: number
  defaultKg: number
}

export interface TrainingPlan extends Entity {
  name: string
  description: string
  exercises: TrainingExercise[]
}

export type CreateTrainingPlanInput = Omit<TrainingPlan, 'id' | 'createdAt' | 'updatedAt'>

// ---------------------------------------------------------------------------
// PlannedSession
// ---------------------------------------------------------------------------

export interface PlannedSession extends Entity {
  planId: string
  date: string            // YYYY-MM-DD
  status: 'planned' | 'done' | 'cancelled'
}

export type CreatePlannedSessionInput = Omit<PlannedSession, 'id' | 'createdAt' | 'updatedAt'>

// ---------------------------------------------------------------------------
// CalendarEntry
// ---------------------------------------------------------------------------

export interface CalendarEntry extends Entity {
  date: string            // YYYY-MM-DD
  type: 'workout' | 'cardio'
  referenceId: string     // links to workoutLog or cardioLog id
  title: string
}

export type CreateCalendarEntryInput = Omit<CalendarEntry, 'id' | 'createdAt' | 'updatedAt'>

// ---------------------------------------------------------------------------
// WorkoutLog
// ---------------------------------------------------------------------------

export interface WorkoutLog extends Entity {
  plannedSessionId?: string
  date: string            // YYYY-MM-DD
  durationSec?: number
  notes?: string
}

export type CreateWorkoutLogInput = Omit<WorkoutLog, 'id' | 'createdAt' | 'updatedAt'>

// ---------------------------------------------------------------------------
// ExerciseLog
// ---------------------------------------------------------------------------

export interface SetLog extends Entity {
  exerciseLogId: string
  repCount: number
  kg: number
  rpe?: number
  completed: boolean
}

export type CreateSetLogInput = Omit<SetLog, 'id' | 'createdAt' | 'updatedAt'>

export interface ExerciseLog extends Entity {
  workoutLogId: string
  exerciseId: string
  exerciseName: string
  sets: SetLog[]
}

export type CreateExerciseLogInput = Omit<ExerciseLog, 'id' | 'createdAt' | 'updatedAt'>

// ---------------------------------------------------------------------------
// CardioLog
// ---------------------------------------------------------------------------

export interface CardioLog extends Entity {
  date: string            // YYYY-MM-DD
  type: 'running' | 'cycling' | 'other'
  durationSec: number
  distanceKm?: number
  calories?: number
  notes?: string
}

export type CreateCardioLogInput = Omit<CardioLog, 'id' | 'createdAt' | 'updatedAt'>

// ---------------------------------------------------------------------------
// GpxAttachment
// ---------------------------------------------------------------------------

export interface GpxAttachment extends Entity {
  cardioLogId?: string
  workoutLogId?: string
  fileName: string
  fileData: string        // base64-encoded GPX content
  uploadedAt: Date
}

export type CreateGpxAttachmentInput = Omit<GpxAttachment, 'id' | 'createdAt' | 'updatedAt'>

// ---------------------------------------------------------------------------
// UserSettings
// ---------------------------------------------------------------------------

export interface UserSettings extends Entity {
  preferredView: 'week' | 'list'
  firstDayOfWeek: number  // 0=Sunday … 6=Saturday
  distanceUnit: 'km' | 'mi'
  weightUnit: 'kg' | 'lbs'
}

export type UpdateUserSettingsInput = Partial<Omit<UserSettings, 'id' | 'createdAt' | 'updatedAt'>>

// ---------------------------------------------------------------------------
// BackupExport (used by BackupService)
// ---------------------------------------------------------------------------

export interface BackupExport {
  timestamp: string       // ISO-8601 timestamp of export
  version: string         // schema version string
  trainingPlans: TrainingPlan[]
  plannedSessions: PlannedSession[]
  calendarEntries: CalendarEntry[]
  workoutLogs: WorkoutLog[]
  exerciseLogs: ExerciseLog[]
  setLogs: SetLog[]
  cardioLogs: CardioLog[]
  gpxAttachments: GpxAttachment[]
  userSettings?: UserSettings[]
}

export type CreateBackupExportInput = Omit<BackupExport, 'timestamp' | 'version'>
