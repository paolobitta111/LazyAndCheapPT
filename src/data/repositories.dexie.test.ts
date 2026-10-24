import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import { TrainingLogDB } from './db'
import { BackupServiceImpl, type BackupService } from './repositories.dexie'
import type { TrainingPlan, PlannedSession, CalendarEntry, WorkoutLog, ExerciseLog, SetLog, CardioLog, GpxAttachment, UserSettings } from '../models/entities'

let db: TrainingLogDB
let backupService: BackupService

beforeEach(async () => {
  db = new TrainingLogDB()
  await db.open()
  backupService = new BackupServiceImpl(db)
})

afterEach(async () => {
  await db.delete()
})

// Helper to clear all tables
const clearAll = async () => {
  const tables = [
    'trainingPlans', 'plannedSessions', 'calendarEntries', 'workoutLogs',
    'exerciseLogs', 'setLogs', 'cardioLogs', 'gpxAttachments', 'userSettings',
  ] as const
  for (const table of tables) {
    await (db as any)[table].clear()
  }
}

// ──────────────────────────────────────────────
// TrainingPlan
// ──────────────────────────────────────────────
describe('TrainingPlan', () => {
  beforeEach(clearAll)

  it('creates and retrieves a training plan', async () => {
    const plan: TrainingPlan = {
      id: 'plan-1',
      name: 'Test Plan',
      description: 'Test description',
      exercises: [{ id: 'ex-1', name: 'Bench Press', defaultSets: 3, defaultReps: 10, defaultKg: 60 }],
      createdAt: new Date('2024-01-01'),
      updatedAt: new Date('2024-01-01'),
    }
    await db.trainingPlans.add(plan)
    const retrieved = await db.trainingPlans.get('plan-1')
    expect(retrieved).toBeDefined()
    expect(retrieved?.name).toBe('Test Plan')
  })

  it('lists all training plans', async () => {
    await db.trainingPlans.add({ id: 'plan-1', name: 'Plan 1', description: '', exercises: [], createdAt: new Date(), updatedAt: new Date() })
    await db.trainingPlans.add({ id: 'plan-2', name: 'Plan 2', description: '', exercises: [], createdAt: new Date(), updatedAt: new Date() })
    const all = await db.trainingPlans.toArray()
    expect(all.length).toBe(2)
  })

  it('updates a training plan', async () => {
    await db.trainingPlans.add({ id: 'plan-1', name: 'Old', description: '', exercises: [], createdAt: new Date(), updatedAt: new Date() })
    await db.trainingPlans.update('plan-1', { name: 'New' })
    const updated = await db.trainingPlans.get('plan-1')
    expect(updated?.name).toBe('New')
  })
})

// ──────────────────────────────────────────────
// PlannedSession
// ──────────────────────────────────────────────
describe('PlannedSession', () => {
  beforeEach(clearAll)

  it('creates and retrieves a planned session', async () => {
    const session: PlannedSession = {
      id: 'session-1',
      planId: 'plan-1',
      date: '2024-01-01',
      status: 'planned',
      createdAt: new Date(),
      updatedAt: new Date(),
    }
    await db.plannedSessions.add(session)
    const retrieved = await db.plannedSessions.get('session-1')
    expect(retrieved).toBeDefined()
    expect(retrieved?.status).toBe('planned')
  })

  it('lists sessions by date', async () => {
    await db.plannedSessions.add({ id: 's-1', planId: 'plan-1', date: '2024-01-01', status: 'planned', createdAt: new Date(), updatedAt: new Date() })
    await db.plannedSessions.add({ id: 's-2', planId: 'plan-1', date: '2024-01-02', status: 'planned', createdAt: new Date(), updatedAt: new Date() })
    const list = await db.plannedSessions.where('date').equals('2024-01-01').toArray()
    expect(list.length).toBe(1)
  })
})

// ──────────────────────────────────────────────
// CalendarEntry
// ──────────────────────────────────────────────
describe('CalendarEntry', () => {
  beforeEach(clearAll)

  it('creates and retrieves a calendar entry', async () => {
    const entry: CalendarEntry = {
      id: 'entry-1',
      date: '2024-01-01',
      type: 'workout',
      referenceId: 'workout-1',
      title: 'Bench Day',
      createdAt: new Date(),
      updatedAt: new Date(),
    }
    await db.calendarEntries.add(entry)
    const retrieved = await db.calendarEntries.get('entry-1')
    expect(retrieved).toBeDefined()
    expect(retrieved?.title).toBe('Bench Day')
  })

  it('lists entries by date range', async () => {
    await db.calendarEntries.add({ id: 'e-1', date: '2024-01-01', type: 'workout', referenceId: 'w-1', title: 'Day 1', createdAt: new Date(), updatedAt: new Date() })
    await db.calendarEntries.add({ id: 'e-2', date: '2024-01-02', type: 'cardio', referenceId: 'c-1', title: 'Day 2', createdAt: new Date(), updatedAt: new Date() })
    const list = await db.calendarEntries.where('date').between('2024-01-01', '2024-01-02', true, true).toArray()
    expect(list.length).toBe(2)
  })
})

// ──────────────────────────────────────────────
// WorkoutLog
// ──────────────────────────────────────────────
describe('WorkoutLog', () => {
  beforeEach(clearAll)

  it('creates and retrieves a workout log', async () => {
    const log: WorkoutLog = {
      id: 'workout-1',
      plannedSessionId: 'session-1',
      date: '2024-01-01',
      durationSec: 3600,
      notes: 'Great session',
      createdAt: new Date(),
      updatedAt: new Date(),
    }
    await db.workoutLogs.add(log)
    const retrieved = await db.workoutLogs.get('workout-1')
    expect(retrieved).toBeDefined()
    expect(retrieved?.durationSec).toBe(3600)
  })

  it('lists workouts by date', async () => {
    await db.workoutLogs.add({ id: 'w-1', plannedSessionId: 's-1', date: '2024-01-01', createdAt: new Date(), updatedAt: new Date() })
    const list = await db.workoutLogs.where('date').equals('2024-01-01').toArray()
    expect(list.length).toBe(1)
  })
})

// ──────────────────────────────────────────────
// ExerciseLog
// ──────────────────────────────────────────────
describe('ExerciseLog', () => {
  beforeEach(clearAll)

  it('creates and retrieves an exercise log', async () => {
    const log: ExerciseLog = {
      id: 'exercise-1',
      workoutLogId: 'workout-1',
      exerciseId: 'bench-press',
      exerciseName: 'Bench Press',
      sets: [],
      createdAt: new Date(),
      updatedAt: new Date(),
    }
    await db.exerciseLogs.add(log)
    const retrieved = await db.exerciseLogs.get('exercise-1')
    expect(retrieved).toBeDefined()
    expect(retrieved?.exerciseName).toBe('Bench Press')
  })

  it('lists exercises by workout log', async () => {
    await db.exerciseLogs.add({ id: 'ex-1', workoutLogId: 'w-1', exerciseId: 'bp', exerciseName: 'Bench Press', sets: [], createdAt: new Date(), updatedAt: new Date() })
    await db.exerciseLogs.add({ id: 'ex-2', workoutLogId: 'w-1', exerciseId: 'sq', exerciseName: 'Squat', sets: [], createdAt: new Date(), updatedAt: new Date() })
    const list = await db.exerciseLogs.where('workoutLogId').equals('w-1').toArray()
    expect(list.length).toBe(2)
  })
})

// ──────────────────────────────────────────────
// SetLog
// ──────────────────────────────────────────────
describe('SetLog', () => {
  beforeEach(clearAll)

  it('creates and retrieves a set log', async () => {
    const log: SetLog = {
      id: 'set-1',
      exerciseLogId: 'exercise-1',
      repCount: 10,
      kg: 100,
      rpe: 8,
      completed: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    }
    await db.setLogs.add(log)
    const retrieved = await db.setLogs.get('set-1')
    expect(retrieved).toBeDefined()
    expect(retrieved?.kg).toBe(100)
    expect(retrieved?.repCount).toBe(10)
  })

  it('lists sets by exercise log', async () => {
    await db.setLogs.add({ id: 'set-1', exerciseLogId: 'ex-1', repCount: 10, kg: 100, completed: true, createdAt: new Date(), updatedAt: new Date() })
    const list = await db.setLogs.where('exerciseLogId').equals('ex-1').toArray()
    expect(list.length).toBe(1)
  })
})

// ──────────────────────────────────────────────
// CardioLog
// ──────────────────────────────────────────────
describe('CardioLog', () => {
  beforeEach(clearAll)

  it('creates and retrieves a cardio log', async () => {
    const log: CardioLog = {
      id: 'cardio-1',
      date: '2024-01-01',
      type: 'running',
      durationSec: 1800,
      distanceKm: 5,
      calories: 300,
      createdAt: new Date(),
      updatedAt: new Date(),
    }
    await db.cardioLogs.add(log)
    const retrieved = await db.cardioLogs.get('cardio-1')
    expect(retrieved).toBeDefined()
    expect(retrieved?.type).toBe('running')
    expect(retrieved?.distanceKm).toBe(5)
  })

  it('lists cardio by date', async () => {
    await db.cardioLogs.add({ id: 'c-1', date: '2024-01-01', type: 'running', durationSec: 1800, createdAt: new Date(), updatedAt: new Date() })
    const list = await db.cardioLogs.where('date').equals('2024-01-01').toArray()
    expect(list.length).toBe(1)
  })
})

// ──────────────────────────────────────────────
// GpxAttachment
// ──────────────────────────────────────────────
describe('GpxAttachment', () => {
  beforeEach(clearAll)

  it('creates and retrieves a GPX attachment', async () => {
    const gpx: GpxAttachment = {
      id: 'gpx-1',
      cardioLogId: 'cardio-1',
      workoutLogId: undefined,
      fileName: 'run.gpx',
      fileData: 'PD94bWwgdmVyc2lvbj0iMS4wIj8+', // minimal base64
      uploadedAt: new Date(),
      createdAt: new Date(),
      updatedAt: new Date(),
    }
    await db.gpxAttachments.add(gpx)
    const retrieved = await db.gpxAttachments.get('gpx-1')
    expect(retrieved).toBeDefined()
    expect(retrieved?.fileName).toBe('run.gpx')
  })

  it('lists attachments by cardio log', async () => {
    await db.gpxAttachments.add({ id: 'gpx-1', cardioLogId: 'c-1', fileName: 'run.gpx', fileData: 'base64', uploadedAt: new Date(), createdAt: new Date(), updatedAt: new Date() })
    const list = await db.gpxAttachments.where('cardioLogId').equals('c-1').toArray()
    expect(list.length).toBe(1)
  })
})

// ──────────────────────────────────────────────
// UserSettings
// ──────────────────────────────────────────────
describe('UserSettings', () => {
  beforeEach(clearAll)

  it('creates and retrieves user settings', async () => {
    const settings: UserSettings = {
      id: 'user-1',
      preferredView: 'list',
      firstDayOfWeek: 1,
      distanceUnit: 'km',
      weightUnit: 'kg',
      createdAt: new Date(),
      updatedAt: new Date(),
    }
    await db.userSettings.add(settings)
    const retrieved = await db.userSettings.get('user-1')
    expect(retrieved).toBeDefined()
    expect(retrieved?.weightUnit).toBe('kg')
  })

  it('updates user settings', async () => {
    await db.userSettings.add({ id: 'user-1', preferredView: 'list', firstDayOfWeek: 1, distanceUnit: 'km', weightUnit: 'kg', createdAt: new Date(), updatedAt: new Date() })
    await db.userSettings.update('user-1', { weightUnit: 'lbs' })
    const retrieved = await db.userSettings.get('user-1')
    expect(retrieved?.weightUnit).toBe('lbs')
  })
})

// ──────────────────────────────────────────────
// BackupService — export & import
// ──────────────────────────────────────────────
describe('BackupService', () => {
  beforeEach(clearAll)

  it('exports all data', async () => {
    await db.trainingPlans.add({ id: 'plan-1', name: 'Plan 1', description: '', exercises: [], createdAt: new Date(), updatedAt: new Date() })
    await db.userSettings.add({ id: 'user-1', preferredView: 'list', firstDayOfWeek: 1, distanceUnit: 'km', weightUnit: 'kg', createdAt: new Date(), updatedAt: new Date() })

    const exportData = await backupService.exportAll()
    expect(exportData).toBeDefined()
    expect(exportData.timestamp).toBeDefined()
    expect(exportData.version).toBeDefined()
    expect(exportData.trainingPlans.length).toBe(1)
    expect(exportData.userSettings!.length).toBe(1)
  })

  it('imports all data', async () => {
    const exportData = {
      timestamp: new Date().toISOString(),
      version: '1.0.0',
      trainingPlans: [{ id: 'plan-1', name: 'Imported', description: '', exercises: [], createdAt: new Date(), updatedAt: new Date() }],
      plannedSessions: [],
      calendarEntries: [],
      workoutLogs: [],
      exerciseLogs: [],
      setLogs: [],
      cardioLogs: [],
      gpxAttachments: [],
      userSettings: [{ id: 'user-1', preferredView: 'list' as const, firstDayOfWeek: 1, distanceUnit: 'km' as const, weightUnit: 'kg' as const, createdAt: new Date(), updatedAt: new Date() }],
    }

    await backupService.importAll(exportData)
    const plan = await db.trainingPlans.get('plan-1')
    const settings = await db.userSettings.get('user-1')
    expect(plan).toBeDefined()
    expect(plan?.name).toBe('Imported')
    expect(settings).toBeDefined()
  })

  it('import overwrites existing data', async () => {
    // Add existing data
    await db.trainingPlans.add({ id: 'plan-1', name: 'Existing', description: '', exercises: [], createdAt: new Date(), updatedAt: new Date() })
    expect((await db.trainingPlans.get('plan-1'))?.name).toBe('Existing')

    // Import with different data
    const exportData = {
      timestamp: new Date().toISOString(),
      version: '1.0.0',
      trainingPlans: [{ id: 'plan-1', name: 'Overwritten', description: '', exercises: [], createdAt: new Date(), updatedAt: new Date() }],
      plannedSessions: [],
      calendarEntries: [],
      workoutLogs: [],
      exerciseLogs: [],
      setLogs: [],
      cardioLogs: [],
      gpxAttachments: [],
      userSettings: [],
    }
    await backupService.importAll(exportData)

    // Verify overwrite
    const plan = await db.trainingPlans.get('plan-1')
    expect(plan?.name).toBe('Overwritten')
  })
})
