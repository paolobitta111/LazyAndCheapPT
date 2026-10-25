// ============================================================================
// Repository Interfaces — Abstract contracts for data persistence
// ============================================================================

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
  BackupExport,
  CreateTrainingPlanInput,
  CreatePlannedSessionInput,
  CreateCalendarEntryInput,
  CreateWorkoutLogInput,
  CreateExerciseLogInput,
  CreateSetLogInput,
  CreateCardioLogInput,
  CreateGpxAttachmentInput,
  UpdateUserSettingsInput,
} from '../models/entities.ts'

// ---------------------------------------------------------------------------
// TrainingPlanRepo
// ---------------------------------------------------------------------------

export interface TrainingPlanRepo {
  create(data: CreateTrainingPlanInput): Promise<TrainingPlan>
  update(id: string, data: Partial<Omit<TrainingPlan, 'id' | 'createdAt' | 'version' | 'status'>>): Promise<TrainingPlan>
  get(id: string): Promise<TrainingPlan | null>
  list(): Promise<TrainingPlan[]>
  listByStatus(status: 'draft' | 'active' | 'archived'): Promise<TrainingPlan[]>
  getByVersion(planId: string, version: number): Promise<TrainingPlan | null>
  duplicate(planId: string): Promise<TrainingPlan>
  archive(planId: string): Promise<TrainingPlan>
  delete(id: string): Promise<void>
  getByExerciseName(name: string): Promise<TrainingPlan[]>
}

// ---------------------------------------------------------------------------
// PlannedSessionRepo
// ---------------------------------------------------------------------------

export interface PlannedSessionRepo {
  create(data: CreatePlannedSessionInput): Promise<PlannedSession>
  update(id: string, data: Partial<Omit<PlannedSession, 'id' | 'createdAt'>>): Promise<PlannedSession>
  get(id: string): Promise<PlannedSession | null>
  list(): Promise<PlannedSession[]>
  listByDate(date: string): Promise<PlannedSession[]>
  delete(id: string): Promise<void>
}

// ---------------------------------------------------------------------------
// CalendarEntryRepo
// ---------------------------------------------------------------------------

export interface CalendarEntryRepo {
  create(data: CreateCalendarEntryInput): Promise<CalendarEntry>
  update(id: string, data: Partial<Omit<CalendarEntry, 'id' | 'createdAt'>>): Promise<CalendarEntry>
  get(id: string): Promise<CalendarEntry | null>
  list(): Promise<CalendarEntry[]>
  listByDate(date: string): Promise<CalendarEntry[]>
  listByDateRange(start: string, end: string): Promise<CalendarEntry[]>
  delete(id: string): Promise<void>
}

// ---------------------------------------------------------------------------
// WorkoutLogRepo
// ---------------------------------------------------------------------------

export interface WorkoutLogRepo {
  create(data: CreateWorkoutLogInput): Promise<WorkoutLog>
  update(id: string, data: Partial<Omit<WorkoutLog, 'id' | 'createdAt'>>): Promise<WorkoutLog>
  get(id: string): Promise<WorkoutLog | null>
  list(): Promise<WorkoutLog[]>
  listByDate(date: string): Promise<WorkoutLog[]>
  listByPlan(planId: string): Promise<WorkoutLog[]>
  delete(id: string): Promise<void>
}

// ---------------------------------------------------------------------------
// ExerciseLogRepo
// ---------------------------------------------------------------------------

export interface ExerciseLogRepo {
  create(data: CreateExerciseLogInput): Promise<ExerciseLog>
  update(id: string, data: Partial<Omit<ExerciseLog, 'id' | 'createdAt'>>): Promise<ExerciseLog>
  get(id: string): Promise<ExerciseLog | null>
  list(): Promise<ExerciseLog[]>
  listByWorkoutLog(workoutLogId: string): Promise<ExerciseLog[]>
  delete(id: string): Promise<void>
}

// ---------------------------------------------------------------------------
// SetLogRepo
// ---------------------------------------------------------------------------

export interface SetLogRepo {
  create(data: CreateSetLogInput): Promise<SetLog>
  update(id: string, data: Partial<Omit<SetLog, 'id' | 'createdAt'>>): Promise<SetLog>
  get(id: string): Promise<SetLog | null>
  list(): Promise<SetLog[]>
  listByExerciseLog(exerciseLogId: string): Promise<SetLog[]>
  delete(id: string): Promise<void>
}

// ---------------------------------------------------------------------------
// CardioLogRepo
// ---------------------------------------------------------------------------

export interface CardioLogRepo {
  create(data: CreateCardioLogInput): Promise<CardioLog>
  update(id: string, data: Partial<Omit<CardioLog, 'id' | 'createdAt'>>): Promise<CardioLog>
  get(id: string): Promise<CardioLog | null>
  list(): Promise<CardioLog[]>
  listByDate(date: string): Promise<CardioLog[]>
  delete(id: string): Promise<void>
}

// ---------------------------------------------------------------------------
// GpxAttachmentRepo
// ---------------------------------------------------------------------------

export interface GpxAttachmentRepo {
  create(data: CreateGpxAttachmentInput): Promise<GpxAttachment>
  get(id: string): Promise<GpxAttachment | null>
  list(): Promise<GpxAttachment[]>
  listByCardioLog(cardioLogId: string): Promise<GpxAttachment[]>
  listByWorkoutLog(workoutLogId: string): Promise<GpxAttachment[]>
  delete(id: string): Promise<void>
}

// ---------------------------------------------------------------------------
// UserSettingsRepo
// ---------------------------------------------------------------------------

export interface UserSettingsRepo {
  get(): Promise<UserSettings | null>
  update(data: UpdateUserSettingsInput): Promise<UserSettings>
}

// ---------------------------------------------------------------------------
// BackupService
// ---------------------------------------------------------------------------

export interface BackupService {
  exportAll(): Promise<BackupExport>
  importAll(data: BackupExport): Promise<void>
}
