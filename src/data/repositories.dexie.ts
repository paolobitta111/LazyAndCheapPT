// ============================================================================
// Dexie Repository Implementations
// ============================================================================

import type {
  TrainingPlan,
  CreateTrainingPlanInput,
  PlannedSession,
  CreatePlannedSessionInput,
  CalendarEntry,
  CreateCalendarEntryInput,
  WorkoutLog,
  CreateWorkoutLogInput,
  ExerciseLog,
  CreateExerciseLogInput,
  SetLog,
  CreateSetLogInput,
  CardioLog,
  CreateCardioLogInput,
  GpxAttachment,
  CreateGpxAttachmentInput,
  UserSettings,
  UpdateUserSettingsInput,
  BackupExport,
} from '../models/entities'
import type {
  TrainingPlanRepo,
  PlannedSessionRepo,
  CalendarEntryRepo,
  WorkoutLogRepo,
  ExerciseLogRepo,
  SetLogRepo,
  CardioLogRepo,
  GpxAttachmentRepo,
  UserSettingsRepo,
  BackupService,
} from './repositories'
import { db, type TrainingLogDB } from './db'

const now = () => new Date().toISOString()

// ---------------------------------------------------------------------------
// TrainingPlan Repository
// ---------------------------------------------------------------------------

export class TrainingPlanRepoImpl implements TrainingPlanRepo {
  async create(input: CreateTrainingPlanInput): Promise<TrainingPlan> {
    // SAFETY: Dexie returns string keys; entity schema requires Date (see entities.ts)
    const entity = {
      ...input,
      version: 1,
      status: 'active',
      // SAFETY: Dexie stores ISO strings; entity interface declares Date (coerced in persistence layer)
      createdAt: now() as unknown as Date,
      updatedAt: now() as unknown as Date,
    } as TrainingPlan
    const key = await db.trainingPlans.add(entity)
    return { ...entity, id: key as string }
  }

  async get(id: string): Promise<TrainingPlan | null> {
    return (await db.trainingPlans.get(id)) ?? null
  }

  async update(id: string, input: Partial<Omit<TrainingPlan, 'id' | 'createdAt' | 'updatedAt' | 'version' | 'status'>>): Promise<TrainingPlan> {
    const existing = await this.get(id)
    if (!existing) throw new Error(`TrainingPlan ${id} not found`)
    // SAFETY: Dexie returns string keys; entity schema requires Date (see entities.ts)
    const updated: TrainingPlan = { ...existing, ...input, id, updatedAt: now() as unknown as Date }
    await db.trainingPlans.put(updated)
    return updated
  }

  async delete(id: string): Promise<void> {
    await db.trainingPlans.delete(id)
  }

  async list(): Promise<TrainingPlan[]> {
    return db.trainingPlans.toArray()
  }

  async listByStatus(status: 'draft' | 'active' | 'archived'): Promise<TrainingPlan[]> {
    const all = await db.trainingPlans.toArray()
    return all.filter(p => p.status === status)
  }

  async getByVersion(planId: string, version: number): Promise<TrainingPlan | null> {
    const all = await db.trainingPlans.toArray()
    return all.find(p => p.id === planId && p.version === version) ?? null
  }

  async duplicate(planId: string): Promise<TrainingPlan> {
    const existing = await this.get(planId)
    if (!existing) throw new Error(`TrainingPlan ${planId} not found`)
    const duplicate: CreateTrainingPlanInput = {
      name: `${existing.name} (Copy)`,
      description: existing.description,
      exercises: existing.exercises,
      sport: existing.sport,
      objective: existing.objective,
      notes: existing.notes,
    }
    return this.create(duplicate)
  }

  async archive(planId: string): Promise<TrainingPlan> {
    const existing = await this.get(planId)
    if (!existing) throw new Error(`TrainingPlan ${planId} not found`)
    // SAFETY: Dexie returns string keys; entity schema requires Date (see entities.ts)
    const archived: TrainingPlan = { ...existing, status: 'archived', archivedAt: new Date(), updatedAt: now() as unknown as Date }
    await db.trainingPlans.put(archived)
    return archived
  }

  async getByExerciseName(name: string): Promise<TrainingPlan[]> {
    const all = await db.trainingPlans.toArray()
    return all.filter(p => p.exercises.some(e => e.name.toLowerCase().includes(name.toLowerCase())))
  }
}

// ---------------------------------------------------------------------------
// PlannedSession Repository
// ---------------------------------------------------------------------------

export class PlannedSessionRepoImpl implements PlannedSessionRepo {
  async create(input: CreatePlannedSessionInput): Promise<PlannedSession> {
    // SAFETY: Dexie returns string keys; entity schema requires Date (see entities.ts)
    const entity = { ...input, createdAt: now() as unknown as Date, updatedAt: now() as unknown as Date }
    const key = await db.plannedSessions.add(entity)
    return { ...entity, id: key as string }
  }

  async get(id: string): Promise<PlannedSession | null> {
    return (await db.plannedSessions.get(id)) ?? null
  }

  async update(id: string, input: Partial<Omit<PlannedSession, 'id' | 'createdAt' | 'updatedAt'>>): Promise<PlannedSession> {
    const existing = await this.get(id)
    if (!existing) throw new Error(`PlannedSession ${id} not found`)
    // SAFETY: Dexie returns string keys; entity schema requires Date (see entities.ts)
    const updated: PlannedSession = { ...existing, ...input, id, updatedAt: now() as unknown as Date }
    await db.plannedSessions.put(updated)
    return updated
  }

  async delete(id: string): Promise<void> {
    await db.plannedSessions.delete(id)
  }

  async list(): Promise<PlannedSession[]> {
    return db.plannedSessions.toArray()
  }

  async getByPlanId(planId: string): Promise<PlannedSession[]> {
    return db.plannedSessions.where('planId').equals(planId).toArray()
  }

  async listByDate(date: string): Promise<PlannedSession[]> {
    return db.plannedSessions.where('date').equals(date).toArray()
  }
}

// ---------------------------------------------------------------------------
// CalendarEntry Repository
// ---------------------------------------------------------------------------

export class CalendarEntryRepoImpl implements CalendarEntryRepo {
  async create(input: CreateCalendarEntryInput): Promise<CalendarEntry> {
    // SAFETY: Dexie returns string keys; entity schema requires Date (see entities.ts)
    const entity = { ...input, createdAt: now() as unknown as Date, updatedAt: now() as unknown as Date }
    const key = await db.calendarEntries.add(entity)
    return { ...entity, id: key as string }
  }

  async get(id: string): Promise<CalendarEntry | null> {
    return (await db.calendarEntries.get(id)) ?? null
  }

  async update(id: string, input: Partial<Omit<CalendarEntry, 'id' | 'createdAt' | 'updatedAt'>>): Promise<CalendarEntry> {
    const existing = await this.get(id)
    if (!existing) throw new Error(`CalendarEntry ${id} not found`)
    // SAFETY: Dexie returns string keys; entity schema requires Date (see entities.ts)
    const updated: CalendarEntry = { ...existing, ...input, id, updatedAt: now() as unknown as Date }
    await db.calendarEntries.put(updated)
    return updated
  }

  async delete(id: string): Promise<void> {
    await db.calendarEntries.delete(id)
  }

  async list(): Promise<CalendarEntry[]> {
    return db.calendarEntries.toArray()
  }

  async listByDate(date: string): Promise<CalendarEntry[]> {
    return db.calendarEntries.where('date').equals(date).toArray()
  }

  async listByDateRange(start: string, end: string): Promise<CalendarEntry[]> {
    return db.calendarEntries.where('date').between(start, end, true, true).toArray()
  }
}

// ---------------------------------------------------------------------------
// WorkoutLog Repository
// ---------------------------------------------------------------------------

export class WorkoutLogRepoImpl implements WorkoutLogRepo {
  async create(input: CreateWorkoutLogInput): Promise<WorkoutLog> {
    // SAFETY: Dexie returns string keys; entity schema requires Date (see entities.ts)
    const entity = { ...input, createdAt: now() as unknown as Date, updatedAt: now() as unknown as Date }
    const key = await db.workoutLogs.add(entity)
    return { ...entity, id: key as string }
  }

  async get(id: string): Promise<WorkoutLog | null> {
    return (await db.workoutLogs.get(id)) ?? null
  }

  async update(id: string, input: Partial<Omit<WorkoutLog, 'id' | 'createdAt' | 'updatedAt'>>): Promise<WorkoutLog> {
    const existing = await this.get(id)
    if (!existing) throw new Error(`WorkoutLog ${id} not found`)
    // SAFETY: Dexie returns string keys; entity schema requires Date (see entities.ts)
    const updated: WorkoutLog = { ...existing, ...input, id, updatedAt: now() as unknown as Date }
    await db.workoutLogs.put(updated)
    return updated
  }

  async delete(id: string): Promise<void> {
    await db.workoutLogs.delete(id)
  }

  async list(): Promise<WorkoutLog[]> {
    return db.workoutLogs.toArray()
  }

  async listByDate(date: string): Promise<WorkoutLog[]> {
    return db.workoutLogs.where('date').equals(date).toArray()
  }

  async listByPlan(planId: string): Promise<WorkoutLog[]> {
    const sessions = await db.plannedSessions.where('planId').equals(planId).toArray()
    const sessionIds = sessions.map(s => s.id).filter((id): id is string => id != null) as string[]
    return db.workoutLogs.where('plannedSessionId').anyOf(sessionIds).toArray()
  }
}

// ---------------------------------------------------------------------------
// ExerciseLog Repository
// ---------------------------------------------------------------------------

export class ExerciseLogRepoImpl implements ExerciseLogRepo {
  async create(input: CreateExerciseLogInput): Promise<ExerciseLog> {
    // SAFETY: Dexie returns string keys; entity schema requires Date (see entities.ts)
    const entity = { ...input, createdAt: now() as unknown as Date, updatedAt: now() as unknown as Date }
    const key = await db.exerciseLogs.add(entity)
    return { ...entity, id: key as string }
  }

  async get(id: string): Promise<ExerciseLog | null> {
    return (await db.exerciseLogs.get(id)) ?? null
  }

  async update(id: string, input: Partial<Omit<ExerciseLog, 'id' | 'createdAt' | 'updatedAt'>>): Promise<ExerciseLog> {
    const existing = await this.get(id)
    if (!existing) throw new Error(`ExerciseLog ${id} not found`)
    // SAFETY: Dexie returns string keys; entity schema requires Date (see entities.ts)
    const updated: ExerciseLog = { ...existing, ...input, id, updatedAt: now() as unknown as Date }
    await db.exerciseLogs.put(updated)
    return updated
  }

  async delete(id: string): Promise<void> {
    await db.exerciseLogs.delete(id)
  }

  async list(): Promise<ExerciseLog[]> {
    return db.exerciseLogs.toArray()
  }

  async listByWorkoutLog(workoutLogId: string): Promise<ExerciseLog[]> {
    return db.exerciseLogs.where('workoutLogId').equals(workoutLogId).toArray()
  }
}

// ---------------------------------------------------------------------------
// SetLog Repository
// ---------------------------------------------------------------------------

export class SetLogRepoImpl implements SetLogRepo {
  async create(input: CreateSetLogInput): Promise<SetLog> {
    // SAFETY: Dexie returns string keys; entity schema requires Date (see entities.ts)
    const entity = { ...input, createdAt: now() as unknown as Date, updatedAt: now() as unknown as Date }
    const key = await db.setLogs.add(entity)
    return { ...entity, id: key as string }
  }

  async get(id: string): Promise<SetLog | null> {
    return (await db.setLogs.get(id)) ?? null
  }

  async update(id: string, input: Partial<Omit<SetLog, 'id' | 'createdAt' | 'updatedAt'>>): Promise<SetLog> {
    const existing = await this.get(id)
    if (!existing) throw new Error(`SetLog ${id} not found`)
    // SAFETY: Dexie returns string keys; entity schema requires Date (see entities.ts)
    const updated: SetLog = { ...existing, ...input, id, updatedAt: now() as unknown as Date }
    await db.setLogs.put(updated)
    return updated
  }

  async delete(id: string): Promise<void> {
    await db.setLogs.delete(id)
  }

  async list(): Promise<SetLog[]> {
    return db.setLogs.toArray()
  }

  async listByExerciseLog(exerciseLogId: string): Promise<SetLog[]> {
    return db.setLogs.where('exerciseLogId').equals(exerciseLogId).toArray()
  }
}

// ---------------------------------------------------------------------------
// CardioLog Repository
// ---------------------------------------------------------------------------

export class CardioLogRepoImpl implements CardioLogRepo {
  async create(input: CreateCardioLogInput): Promise<CardioLog> {
    // SAFETY: Dexie returns string keys; entity schema requires Date (see entities.ts)
    const entity = { ...input, createdAt: now() as unknown as Date, updatedAt: now() as unknown as Date }
    const key = await db.cardioLogs.add(entity)
    return { ...entity, id: key as string }
  }

  async get(id: string): Promise<CardioLog | null> {
    return (await db.cardioLogs.get(id)) ?? null
  }

  async update(id: string, input: Partial<Omit<CardioLog, 'id' | 'createdAt' | 'updatedAt'>>): Promise<CardioLog> {
    const existing = await this.get(id)
    if (!existing) throw new Error(`CardioLog ${id} not found`)
    // SAFETY: Dexie returns string keys; entity schema requires Date (see entities.ts)
    const updated: CardioLog = { ...existing, ...input, id, updatedAt: now() as unknown as Date }
    await db.cardioLogs.put(updated)
    return updated
  }

  async delete(id: string): Promise<void> {
    await db.cardioLogs.delete(id)
  }

  async list(): Promise<CardioLog[]> {
    return db.cardioLogs.toArray()
  }

  async listByDate(date: string): Promise<CardioLog[]> {
    return db.cardioLogs.where('date').equals(date).toArray()
  }

  async listByType(type: 'running' | 'cycling' | 'other'): Promise<CardioLog[]> {
    return db.cardioLogs.where('type').equals(type).toArray()
  }
}

// ---------------------------------------------------------------------------
// GpxAttachment Repository
// ---------------------------------------------------------------------------

export class GpxAttachmentRepoImpl implements GpxAttachmentRepo {
  async create(input: CreateGpxAttachmentInput): Promise<GpxAttachment> {
    // SAFETY: Dexie returns string keys; entity schema requires Date (see entities.ts)
    const entity = { ...input, createdAt: now() as unknown as Date, updatedAt: now() as unknown as Date, uploadedAt: now() as unknown as Date }
    const key = await db.gpxAttachments.add(entity)
    return { ...entity, id: key as string }
  }

  async get(id: string): Promise<GpxAttachment | null> {
    return (await db.gpxAttachments.get(id)) ?? null
  }

  async update(id: string, input: Partial<Omit<GpxAttachment, 'id' | 'createdAt' | 'updatedAt' | 'uploadedAt'>>): Promise<GpxAttachment> {
    const existing = await this.get(id)
    if (!existing) throw new Error(`GpxAttachment ${id} not found`)
    // SAFETY: Dexie returns string keys; entity schema requires Date (see entities.ts)
    const updated: GpxAttachment = { ...existing, ...input, id, updatedAt: now() as unknown as Date }
    await db.gpxAttachments.put(updated)
    return updated
  }

  async delete(id: string): Promise<void> {
    await db.gpxAttachments.delete(id)
  }

  async list(): Promise<GpxAttachment[]> {
    return db.gpxAttachments.toArray()
  }

  async listByCardioLog(cardioLogId: string): Promise<GpxAttachment[]> {
    return db.gpxAttachments.where('cardioLogId').equals(cardioLogId).toArray()
  }

  async listByWorkoutLog(workoutLogId: string): Promise<GpxAttachment[]> {
    return db.gpxAttachments.where('workoutLogId').equals(workoutLogId).toArray()
  }
}

// ---------------------------------------------------------------------------
// UserSettings Repository
// ---------------------------------------------------------------------------

export class UserSettingsRepoImpl implements UserSettingsRepo {
  private static readonly SETTINGS_ID = 'user-settings'

  async get(): Promise<UserSettings | null> {
    return (await db.userSettings.get(UserSettingsRepoImpl.SETTINGS_ID)) ?? null
  }

  async update(input: Partial<UserSettings>): Promise<UserSettings> {
    const existing = await this.get()
    if (!existing) throw new Error('UserSettings not found')
    // SAFETY: Dexie returns string keys; entity schema requires Date (see entities.ts)
    const updated: UserSettings = { ...existing, ...input, id: UserSettingsRepoImpl.SETTINGS_ID, updatedAt: now() as unknown as Date }
    await db.userSettings.put(updated)
    return updated
  }

  async createOrUpdate(input: UpdateUserSettingsInput): Promise<UserSettings> {
    const existing = await this.get()
    if (existing) {
    // SAFETY: Dexie returns string keys; entity schema requires Date (see entities.ts)
      const updated: UserSettings = { ...existing, ...input, id: UserSettingsRepoImpl.SETTINGS_ID, updatedAt: now() as unknown as Date }
      await db.userSettings.put(updated)
      return updated
    }
    // SAFETY: Dexie returns string keys; entity schema requires Date (see entities.ts)
    const entity: UserSettings = { ...input, preferredView: input.preferredView ?? 'week' as const, firstDayOfWeek: input.firstDayOfWeek ?? 1, distanceUnit: input.distanceUnit ?? 'km', weightUnit: input.weightUnit ?? 'kg', id: UserSettingsRepoImpl.SETTINGS_ID, createdAt: now() as unknown as Date, updatedAt: now() as unknown as Date }
    await db.userSettings.add(entity)
    return entity
  }
}

// ---------------------------------------------------------------------------
// BackupService Implementation
// ---------------------------------------------------------------------------

export class BackupServiceImpl implements BackupService {
  private readonly database: TrainingLogDB

  constructor(databaseInstance?: TrainingLogDB) {
    this.database = databaseInstance ?? db
  }

  async exportAll(): Promise<BackupExport> {
    const [trainingPlans, plannedSessions, calendarEntries, workoutLogs, exerciseLogs, setLogs, cardioLogs, gpxAttachments, userSettings] =
      await Promise.all([
        this.database.trainingPlans.toArray(),
        this.database.plannedSessions.toArray(),
        this.database.calendarEntries.toArray(),
        this.database.workoutLogs.toArray(),
        this.database.exerciseLogs.toArray(),
        this.database.setLogs.toArray(),
        this.database.cardioLogs.toArray(),
        this.database.gpxAttachments.toArray(),
        this.database.userSettings.toArray(),
      ])

    return {
      version: '1.0.0',
      timestamp: new Date().toISOString(),
      trainingPlans,
      plannedSessions,
      calendarEntries,
      workoutLogs,
      exerciseLogs,
      setLogs,
      cardioLogs,
      gpxAttachments,
      userSettings,
    }
  }

  private async putAll(data: BackupExport): Promise<void> {
    if (data.trainingPlans) await this.database.trainingPlans.bulkPut(data.trainingPlans)
    if (data.plannedSessions) await this.database.plannedSessions.bulkPut(data.plannedSessions)
    if (data.calendarEntries) await this.database.calendarEntries.bulkPut(data.calendarEntries)
    if (data.workoutLogs) await this.database.workoutLogs.bulkPut(data.workoutLogs)
    if (data.exerciseLogs) await this.database.exerciseLogs.bulkPut(data.exerciseLogs)
    if (data.setLogs) await this.database.setLogs.bulkPut(data.setLogs)
    if (data.cardioLogs) await this.database.cardioLogs.bulkPut(data.cardioLogs)
    if (data.gpxAttachments) await this.database.gpxAttachments.bulkPut(data.gpxAttachments)
    if (data.userSettings) await this.database.userSettings.bulkPut(data.userSettings)
  }

  async replaceAll(data: BackupExport): Promise<void> {
    await this.database.transaction('rw', this.database.tables, async () => {
      await Promise.all(this.database.tables.map((table) => table.clear()))
      await this.putAll(data)
    })
  }

  async importAll(data: BackupExport): Promise<void> {
    await this.database.transaction('rw', this.database.tables, async () => {
      await this.putAll(data)
    })
  }
}

export { type BackupService } from './repositories'
export { type BackupExport } from '../models/entities'
