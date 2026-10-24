# Design Doc — Fase 1: local-data-foundation

> **Spec:** `C:\Users\filippo\Downloads\Specifica_Training_Log_OpenSpec.md`

## Obiettivo

Creare il foundation dati locale: modelli TypeScript, repository interfaces, e implementazione Dexie con schema versionato. Zero UI.

## Architetture Considerate

### A — Monolitico (un solo file Dexie)
- Un `db.ts` con tutte le tabelle + un `repositories.ts` con tutti i repo
- **Pro:** semplice, pochi file
- **Contro:** file grande, difficile da revieware, violate best practices del progetto

### B — Modular by Responsibility (Raccomandato)
- `src/models/` → interfacce TypeScript (una per entità)
- `src/data/repositories.ts` → contratti astratti (interfaces)
- `src/data/db.ts` → classe Dexie con tutte le tabelle
- `src/data/repositories/dexie-repositories.ts` → implementazioni concrete
- **Pro:** separazione chiara tra astrazione e implementazione, testabili indipendentemente
- **Contro:** più file

### C — Per-subsystem
- Separare workout e cardio in moduli diversi
- **Contro:** YAGNI, sono entità correlate (stesso calendario, stessa sessione)

**Scelto: B** — separa contratti da implementazione, ogni file ha responsabilità singola, facilita il test unitario dei contratti.

## Vincoli

- Dexie >= 4.x (già installato come `@types/dexie` + `dexie`)
- TypeScript strict — zero `any`
- Vitest + jsdom — no IndexedDB reale in ambiente di test
- Nessuna dipendenza aggiuntiva per il GPX (schema solo, parsing viene dopo)
- Backup restore: JSON.stringify/parse con validazione minima (field presence)
- Export include TUTTE le tabelle; import sovrascrive tutto (no merge)

## Interfacce (Contratti)

### `Entity` (base)
```typescript
interface Entity { id: string; createdAt: Date; updatedAt: Date }
```

### `TrainingPlan`
- `id, name, description, exercises[]`
- `exercises[]` → `{ id, name, defaultSets: number, defaultReps: number, defaultKg: number }`

### `PlannedSession`
- `id, planId, date: string (YYYY-MM-DD), status: 'planned'|'done'|'cancelled'`

### `CalendarEntry`
- `id, date: string, type: 'workout'|'cardio', referenceId: string, title: string`

### `WorkoutLog`
- `id, plannedSessionId?, date, durationSec?, notes?`

### `ExerciseLog`
- `id, workoutLogId, exerciseId, exerciseName, sets[]`

### `SetLog`
- `id, exerciseLogId, repCount, kg, rpe?, completed: boolean`

### `CardioLog`
- `id, date, type: 'running'|'cycling'|'other', durationSec, distanceKm?, calories?, notes?`

### `GpxAttachment`
- `id, cardioLogId?, workoutLogId?, fileName, fileData (string base64), uploadedAt`

### `UserSettings`
- `id: 'global', preferredView: 'week'|'list', firstDayOfWeek: 0..6, distanceUnit: 'km'|'mi', weightUnit: 'kg'|'lbs`

### Repository Interfaces
```typescript
interface TrainingPlanRepo {
  create(data: CreateTrainingPlanInput): Promise<TrainingPlan>
  update(id: string, data: Partial<TrainingPlanInput>): Promise<TrainingPlan>
  get(id: string): Promise<TrainingPlan | null>
  list(): Promise<TrainingPlan[]>
  delete(id: string): Promise<void>
}
```
(Stesso pattern per PlannedSessionRepo, CalendarEntryRepo, WorkoutLogRepo, CardioLogRepo)

```typescript
interface BackupService {
  exportAll(): Promise<BackupExport>
  importAll(data: BackupExport): Promise<void>
}
```

## Non-scope (per questa fase)

- UI per nessuna pagina
- Cloud sync / backup remoto
- Validazione JSON Schema / Ajv
- GPX parsing (schema pronto, import solo come stringa base64)
- Timer / session tracking (viene nella Fase 2)
- LLM bridge

## Dipendenze tra Tasks

1. **Models** → nessun dependency (definisce i contratti)
2. **Dexie DB Schema** → dipende da Models
3. **Repository Interfaces** → dipende da Models
4. **Dexie Repository Impl** → dipende da Dexie DB Schema + Repo Interfaces
5. **Backup Service** → dipende da tutte le repo interfaces
6. **Integration Tests** → dipende da tutto
