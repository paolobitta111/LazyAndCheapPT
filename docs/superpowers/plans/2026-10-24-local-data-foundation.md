# Local Data Foundation Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Create local data foundation — TypeScript models, repository interfaces, Dexie DB with versioned schema, and JSON export/import service. Zero UI.

**Architecture:** Modular by responsibility. Separate interfaces (contracts) from Dexie implementations. Models define types, repositories define contracts, db.ts implements Dexie, dexie-repositories.ts wires contracts to Dexie, backup-service.ts handles export/import.

**Tech Stack:** TypeScript (strict), Dexie (IndexedDB), Vitest + jsdom, Vitest Dexie Adapter

**Spec:** `C:\Users\filippo\Downloads\Specifica_Training_Log_OpenSpec.md`

## Global Constraints

- Dexie >= 4.x (already in package.json as `dexie`)
- TypeScript strict — zero `any`, no implicit `any`
- Vitest + jsdom — IndexedDB must be mocked in tests via `dexie-test` or manual mock
- No additional dependencies beyond what's already installed or the bootstrap (add `vitest-dexie` if needed for Dexie mocking)
- Backup/restore: `JSON.stringify`/`JSON.parse` with field presence validation only (no Ajv yet)
- Export includes ALL tables; import overwrites everything (no merge strategy)
- All model `Date` fields serialized as ISO strings for Dexie compatibility, deserialized back to Date for consumers

## Review Focus

1. **Date serialization** — Dates stored as ISO strings in IndexedDB, returned as Date objects to consumers. Test roundtrip: `new Date(input) → DB → Date(output)` equality.
2. **String ID generation** — `crypto.randomUUID()` for all IDs; test that generated IDs are valid UUID v4.
3. **Import overwrites all data** — Import test verifies old data is cleared and new data is present; no stale records remain.
4. **Index queries** — Each indexed field (`date`, `status`, `planId`, `workoutLogId`, `cardioLogId`) tested with filter queries.
5. **Base64 encoding for GpxAttachment** — Verify base64 encode/decode roundtrip without corruption.

---

### Task 1: Models + Repository Interfaces

**Files:**
- Create: `src/models/index.ts` — barrel export
- Create: `src/models/entities.ts` — all entity interfaces + DTOs
- Create: `src/data/repositories.ts` — all repository interfaces + BackupService
- Modify: `src/models/index.ts` — barrel export (after entities.ts)

**Interfaces:**
- Consumes: nothing (first task)
- Produces:
  - `interface Entity { id: string; createdAt: Date; updatedAt: Date }`
  - `interface TrainingPlan extends Entity { name: string; description: string; exercises: TrainingExercise[] }`
  - `interface TrainingExercise { id: string; name: string; defaultSets: number; defaultReps: number; defaultKg: number }`
  - `interface PlannedSession extends Entity { planId: string; date: string; status: 'planned' | 'done' | 'cancelled' }`
  - `interface CalendarEntry extends Entity { date: string; type: 'workout' | 'cardio'; referenceId: string; title: string }`
  - `interface WorkoutLog extends Entity { plannedSessionId?: string; date: string; durationSec?: number; notes?: string }`
  - `interface ExerciseLog extends Entity { workoutLogId: string; exerciseId: string; exerciseName: string; sets: SetLog[] }`
  - `interface SetLog extends Entity { exerciseLogId: string; repCount: number; kg: number; rpe?: number; completed: boolean }`
  - `interface CardioLog extends Entity { date: string; type: 'running' | 'cycling' | 'other'; durationSec: number; distanceKm?: number; calories?: number; notes?: string }`
  - `interface GpxAttachment extends Entity { cardioLogId?: string; workoutLogId?: string; fileName: string; fileData: string; uploadedAt: Date }`
  - `interface UserSettings extends Entity { preferredView: 'week' | 'list'; firstDayOfWeek: number; distanceUnit: 'km' | 'mi'; weightUnit: 'kg' | 'lbs' }`
  - `interface BackupExport { timestamp: string; version: string; trainingPlans: TrainingPlan[]; plannedSessions: PlannedSession[]; calendarEntries: CalendarEntry[]; workoutLogs: WorkoutLog[]; exerciseLogs: ExerciseLog[]; setLogs: SetLog[]; cardioLogs: CardioLog[]; gpxAttachments: GpxAttachment[]; userSettings: UserSettings }`
  - `interface TrainingPlanRepo { create(data: { name: string; description: string; exercises: { name: string; defaultSets: number; defaultReps: number; defaultKg: number }[] }): Promise<TrainingPlan>; update(id: string, data: Partial<Omit<TrainingPlan, 'id' | 'createdAt'>>): Promise<TrainingPlan>; get(id: string): Promise<TrainingPlan | null>; list(): Promise<TrainingPlan[]>; delete(id: string): Promise<void>; getByExerciseName(name: string): Promise<TrainingPlan[]> }`
  - `interface PlannedSessionRepo { create(data: { planId: string; date: string; status?: 'planned' | 'done' | 'cancelled' }): Promise<PlannedSession>; update(id: string, data: Partial<Omit<PlannedSession, 'id' | 'createdAt'>>): Promise<PlannedSession>; get(id: string): Promise<PlannedSession | null>; list(): Promise<PlannedSession[]>; listByDate(date: string): Promise<PlannedSession[]>; delete(id: string): Promise<void> }`
  - `interface CalendarEntryRepo { create(data: { date: string; type: 'workout' | 'cardio'; referenceId: string; title: string }): Promise<CalendarEntry>; update(id: string, data: Partial<Omit<CalendarEntry, 'id' | 'createdAt'>>): Promise<CalendarEntry>; get(id: string): Promise<CalendarEntry | null>; list(): Promise<CalendarEntry[]>; listByDate(date: string): Promise<CalendarEntry[]>; listByDateRange(start: string, end: string): Promise<CalendarEntry[]>; delete(id: string): Promise<void> }`
  - `interface WorkoutLogRepo { create(data: { plannedSessionId?: string; date: string; durationSec?: number; notes?: string }): Promise<WorkoutLog>; update(id: string, data: Partial<Omit<WorkoutLog, 'id' | 'createdAt'>>): Promise<WorkoutLog>; get(id: string): Promise<WorkoutLog | null>; list(): Promise<WorkoutLog[]>; listByDate(date: string): Promise<WorkoutLog[]>; listByPlan(planId: string): Promise<WorkoutLog[]>; delete(id: string): Promise<void> }`
  - `interface ExerciseLogRepo { create(data: { workoutLogId: string; exerciseId: string; exerciseName: string; sets: { repCount: number; kg: number; rpe?: number; completed: boolean }[] }): Promise<ExerciseLog>; update(id: string, data: Partial<Omit<ExerciseLog, 'id' | 'createdAt'>>): Promise<ExerciseLog>; get(id: string): Promise<ExerciseLog | null>; list(): Promise<ExerciseLog[]>; listByWorkoutLog(workoutLogId: string): Promise<ExerciseLog[]>; delete(id: string): Promise<void> }`
  - `interface SetLogRepo { create(data: { exerciseLogId: string; repCount: number; kg: number; rpe?: number; completed: boolean }): Promise<SetLog>; update(id: string, data: Partial<Omit<SetLog, 'id' | 'createdAt'>>): Promise<SetLog>; get(id: string): Promise<SetLog | null>; list(): Promise<SetLog[]>; listByExerciseLog(exerciseLogId: string): Promise<SetLog[]>; delete(id: string): Promise<void> }`
  - `interface CardioLogRepo { create(data: { date: string; type: 'running' | 'cycling' | 'other'; durationSec: number; distanceKm?: number; calories?: number; notes?: string }): Promise<CardioLog>; update(id: string, data: Partial<Omit<CardioLog, 'id' | 'createdAt'>>): Promise<CardioLog>; get(id: string): Promise<CardioLog | null>; list(): Promise<CardioLog[]>; listByDate(date: string): Promise<CardioLog[]>; listByType(type: 'running' | 'cycling' | 'other'): Promise<CardioLog[]>; delete(id: string): Promise<void> }`
  - `interface GpxAttachmentRepo { create(data: { cardioLogId?: string; workoutLogId?: string; fileName: string; fileData: string }): Promise<GpxAttachment>; get(id: string): Promise<GpxAttachment | null>; list(): Promise<GpxAttachment[]>; listByCardioLog(cardioLogId: string): Promise<GpxAttachment[]>; listByWorkoutLog(workoutLogId: string): Promise<GpxAttachment[]>; delete(id: string): Promise<void> }`
  - `interface UserSettingsRepo { get(): Promise<UserSettings | null>; update(data: Partial<Omit<UserSettings, 'id' | 'createdAt'>>): Promise<UserSettings> }`
  - `interface BackupService { exportAll(): Promise<BackupExport>; importAll(data: BackupExport): Promise<void> }`

- [ ] **Step 1: Create `src/models/entities.ts` with all entity interfaces**

Create `src/models/entities.ts` with:
1. `Entity` base interface: `id: string; createdAt: Date; updatedAt: Date`
2. All entity interfaces extending Entity (TrainingPlan, TrainingExercise, PlannedSession, CalendarEntry, WorkoutLog, ExerciseLog, SetLog, CardioLog, GpxAttachment, UserSettings)
3. `BackupExport` interface with all entity arrays
4. Export all interfaces as named exports

Test: verify all interfaces compile without errors (`tsc --noEmit --project tsconfig.app.json`)

- [ ] **Step 2: Create `src/models/index.ts` barrel export**

Create `src/models/index.ts` re-exporting everything from `entities.ts`:
```typescript
export * from './entities'
```

- [ ] **Step 3: Create `src/data/repositories.ts` with all repository interfaces**

Create `src/data/repositories.ts` with all repository interfaces (TrainingPlanRepo, PlannedSessionRepo, CalendarEntryRepo, WorkoutLogRepo, ExerciseLogRepo, SetLogRepo, CardioLogRepo, GpxAttachmentRepo, UserSettingsRepo, BackupService). Use exact signatures defined in the Interfaces section above.

- [ ] **Step 4: Compile check**

Run: `npx tsc -b --noEmit`
Expected: zero errors, all interfaces compile clean.

- [ ] **Step 5: Commit**

```bash
git add src/models/ src/data/repositories.ts
git commit -m "feat: add all entity models and repository interfaces"
```
