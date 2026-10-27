# Real Data Foundation Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace every mock with real data: schede with weekday/date assignment, a planning resolver, real Oggi/Calendario pages, live check-in, real weather, hand-entered health, and a fixed player.

**Architecture:** The recurrence rule lives on `TrainingPlan` (`plannedSessions[].dayOfWeek` + `dates[]`); `PlannedSession` rows become the per-date exception registry (cancelled/planned). One new `PlanningService` owns resolution and all writes (skip/substitute/assign/ensurePlanned). Pages keep their approved components and get wired to it through `useAppData()`. No Dexie migration: new fields are un-indexed.

**Tech Stack:** React 19, TypeScript strict, Dexie 4, Vitest, Testing Library, fake-indexeddb (page tests use the real repos), Open-Meteo (no key), localStorage for health.

**Spec:** `docs/superpowers/specs/2026-10-27-real-data-foundation-design.md` — the plan argues from it; executors read both.

## Global Constraints

- No Dexie schema change: `version(1)` stays, new fields (`TrainingPlan.plannedSessions`, `TrainingPlan.dates`, `CardioLog.planId`) are un-indexed. No `indexedDB` deletion of existing data.
- `schemaVersion` stays `"1.0.0"` in `src/data/schemas/training-plan.json`; `dates` is added as an optional property (pattern `^\\d{4}-\\d{2}-\\d{2}$`); `additionalProperties: false` means every new serialized field must appear in the schema.
- Scheda edit is in place via `repo.update` (same `id`), never via `TrainingPlanService.update` (which creates a new id/version — that path is only for LLM import).
- All date keys are local-time `YYYY-MM-DD` via one helper. Never `toISOString().slice(0, 10)` (UTC): evening off-by-one is the main use case.
- No new dependencies. No `any`. No sync (Fase 13 out). `src/pages/History.tsx` and `src/services/history.service.ts` untouched.
- Suite (`npx vitest run`) green + `npx tsc -b` clean at every commit. Minimum viewport 375px.
- Weather needs geolocation: works on localhost and HTTPS; on failure show `—`, never fake values.
- `local-llm.ts` config (`enabled`, `endpoint`, `model`) already exists in Impostazioni; check-in only adds the chat call. No API keys, no other providers.
- Work in a worktree off `main`; do not touch the uncommitted CSS files in the main checkout.

## Review Focus

- **Timezone off-by-one:** a 23:30 local workout must key to the same local day. Task 2 pins `dateKey(new Date(2026, 9, 27, 23, 30)) === '2026-10-27'`; Task 7 pins the player using it.
- **Cancelled beats rule, only for that date:** skipping Tuesday's Corsa hides it on the 27th but not on the next Tuesday. Task 2 pins both dates resolving differently.
- **Exception survives archive:** an assigned `planned` row keeps resolving after its scheda is archived. Task 2 pins it.
- **Un-skip:** `ensurePlanned` on a `cancelled` row flips it back to `planned` (tap on Today after Salta must work). Task 2 pins the flip, Task 4 pins the box returning.
- **LLM down does not eat the message:** a rejected chat call leaves the user bubble in the thread and shows the offline block. Task 6 pins both.
- Empty-day choice is `assign` (not `substitute` with null) — Task 4 pins it.

---

### Task 1: Model — rules on the scheda

**Files:**
- Modify: `src/models/entities.ts`
- Modify: `src/data/schemas/training-plan.json`
- Modify: `src/services/training-plan.service.ts`
- Modify: `src/data/repositories.dexie.ts` (`duplicate`)
- Test: `src/services/training-plan.service.test.ts`

**Interfaces:**
- Produces:
  - `export interface PlannedSessionRule { dayOfWeek: number; order: number }` (Monday=1…Sunday=7)
  - `TrainingPlan.plannedSessions?: PlannedSessionRule[]`, `TrainingPlan.dates?: string[]`
  - `CardioLog.planId?: string`
  - `TrainingPlanService.normalize` and `update` carry the new fields.

- [ ] **Step 1: Write the failing tests** in `training-plan.service.test.ts`:

```ts
it('maps plannedSessions and dates from raw JSON', /* createFromJson with plannedSessions: [{ dayOfWeek: 2, order: 1 }],
    dates: ['2026-11-03'] → created.plannedSessions/dates equal the input */)
it('update preserves plannedSessions and dates not in updates', /* create, then service.update(planId, { name: 'X' })
    → returned plan keeps plannedSessions and dates */)
it('rejects a date that is not YYYY-MM-DD', /* createFromJson with dates: ['3 nov'] throws Validation failed */)
```

- [ ] **Step 2: Run to verify they fail** — `npx vitest run src/services/training-plan.service.test.ts`; Expected: FAIL, missing fields.
- [ ] **Step 3: Implement.** Add `PlannedSessionRule` + the two optional fields to `TrainingPlan`, `planId?: string` to `CardioLog` in `entities.ts`. Add `dates` to the schema (optional array, item pattern `^\\d{4}-\\d{2}-\\d{2}$`). In `normalize`: `plannedSessions: (raw.plannedSessions as PlannedSessionRule[]) ?? undefined`, same for `dates`. In `TrainingPlanService.update`: carry `updates.plannedSessions ?? existing.plannedSessions` and `updates.dates ?? existing.dates` into the create input. In `TrainingPlanRepoImpl.duplicate`: copy both fields.
- [ ] **Step 4: Run to verify they pass** — same command; Expected: PASS.
- [ ] **Step 5: Commit** — `feat: rules and dates on the scheda model`.

### Task 2: PlanningService

**Files:**
- Create: `src/services/planning.service.ts`
- Test: `src/services/planning.service.test.ts`

**Interfaces:**
- Produces (consumed by Tasks 4, 7, 8):

```ts
export function dateKey(date: Date): string            // local YYYY-MM-DD
export function weekdayIndex(date: Date): number      // 1..7, Monday=1
export interface ResolvedSession { planId: string; name: string; description: string
  sport?: string; order: number; done: boolean }
export interface MonthDay { day: number; sessions: ResolvedSession[] }
export class PlanningService {
  constructor(trainingPlanRepo: TrainingPlanRepo, plannedSessionRepo: PlannedSessionRepo,
    workoutLogRepo: WorkoutLogRepo, cardioLogRepo: CardioLogRepo)
  resolveDay(date: string): Promise<ResolvedSession[]>
  resolveMonth(year: number, monthIndex: number): Promise<MonthDay[]>
  skip(planId: string, date: string): Promise<void>
  substitute(oldPlanId: string, newPlanId: string, date: string): Promise<void>
  assign(planId: string, date: string): Promise<void>
  ensurePlanned(planId: string, date: string): Promise<PlannedSession>
}
```

- [ ] **Step 1: Write the failing tests** with in-memory fakes implementing the four repo interfaces. Cover, in this order:
  - `dateKey(new Date(2026, 9, 27, 23, 30)) === '2026-10-27'`; `weekdayIndex(new Date(2026, 9, 27)) === 2`.
  - `resolveDay('2026-10-27')` includes: an active scheda with `plannedSessions: [{ dayOfWeek: 2, order: 2 }]`; a scheda with `dates: ['2026-10-27']`; a scheda with a `planned` row for that date; excludes an archived scheda's rule; includes an archived scheda's `planned` row.
  - A `cancelled` row for plan P on '2026-10-27' hides P's rule on that date but not on '2026-11-03' (same weekday next month, use `dates` or a rule on both).
  - Dedup: plan P with both a rule and a `planned` row resolves once.
  - `done: true` when a `WorkoutLog` exists with matching `planId` + `date`; and when a `CardioLog` has matching `planId`, or has no `planId` but `type` matches the plan's sport (`running`/`cycling`).
  - `skip` creates a `cancelled` row; skipping when a `planned` row exists updates that row (count stays 1).
  - `substitute` leaves old cancelled + new planned.
  - `assign` writes a `planned` row.
  - `ensurePlanned`: reuses existing `planned`, flips `cancelled` → `planned`, creates when absent.
  - `resolveMonth(2026, 9)` has 31 `MonthDay`, day 27 carrying the rule session.
- [ ] **Step 2: Run to verify they fail** — `npx vitest run src/services/planning.service.test.ts`; Expected: FAIL, module missing.
- [ ] **Step 3: Implement.** Resolution algorithm: rules from active plans (`dayOfWeek` or `dates`) ∪ `planned` rows (any plan status), minus `cancelled` planIds for that date, dedup by planId, order = rule `order` (else 99) then name. `done` per plan via log lookup (workoutLogs by `planId`+`date`; cardioLogs by `planId`+`date` or un-owned log with `type === plan.sport` and same `date`). All writes go through `plannedSessionRepo.create/update`; find the existing row with `listByDate(date).find(r => r.planId === planId)`.
- [ ] **Step 4: Run to verify they pass** — same command; Expected: PASS.
- [ ] **Step 5: Commit** — `feat: planning resolver and exception writes`.

### Task 3: Schede page

**Files:**
- Create: `src/components/PlanForm.tsx`
- Modify: `src/pages/Plans.tsx`
- Test: `src/pages/Plans.test.tsx` (new; render inside `DataProvider` + `MemoryRouter`, real repos on fake-indexeddb, `beforeEach` clears all tables via `db.table.clear()`)

**Interfaces:**
- Consumes: Task 1 fields; `TrainingPlanRepo.create/update/list`.
- Produces: `export function PlanForm(props: { plan?: TrainingPlan; onDone: () => void }): JSX.Element` — modal form; gets `trainingPlanRepo` from `useAppData()` itself (same pattern as `Cardio.tsx` owning its service). Create with `plan === undefined` → `repo.create`; edit → `repo.update(plan.id, …)` in place; both end with `onDone()`. Modal fields: name, sport select (`running|cycling|strength|other`), exercise rows (name, sets, reps, weight), 7 weekday toggles (`L M M G V S D`, values 1..7), date list (add via `input type="date"`, remove per item).

- [ ] **Step 1: Write the failing tests:**
  - Create flow: «Nuova scheda» → fill name `Corsa`, toggle `M` (dayOfWeek 2), add date `2026-11-03`, add exercise `Corsa 1×1 bodyweight`, «Salva» → list shows `Corsa`, the `M` badge, `2026-11-03`, `1 esercizio`.
  - Edit in place: open the created scheda, rename to `Corsa veloce`, save → list still has exactly 1 scheda (no duplicate), name updated, `M` and date preserved.
- [ ] **Step 2: Run to verify they fail** — `npx vitest run src/pages/Plans.test.tsx`; Expected: FAIL, still mock page.
- [ ] **Step 3: Implement.** `Plans.tsx`: list from `trainingPlanRepo.list()` in an effect; each card shows name, sport, exercise count, weekday badges (only assigned days), dates; «Nuova scheda» and «Modifica» open `PlanForm`. Create → `repo.create(input)`; edit → `repo.update(plan.id, patch)` (in place). One exercise row is rendered by default so a scheda is always schema-valid (`exercises` min 1).
- [ ] **Step 4: Run to verify they pass** — same command; Expected: PASS.
- [ ] **Step 5: Commit** — `feat: real schede page with weekday and date assignment`.

### Task 4: Oggi on real data

**Files:**
- Modify: `src/pages/Today.tsx`
- Modify: `src/components/SessionBox.tsx`, `src/components/SubstituteCombo.tsx` (props: `schede: TrainingPlan[]`, label from plan name)
- Test: `src/pages/Today.test.tsx` (rewrite; DataProvider + fake-indexeddb, `beforeEach` clears tables, seed via repos)

**Interfaces:**
- Consumes: `PlanningService` (Task 2), `formatToday` (still from `./today-mock` until Task 9), `CheckInModal` unchanged for now.
- Produces: Today renders one `SessionBox` per resolved session; combo lists **active** schede excluding the current; empty day → one `Riposo` box whose combo assigns; box tap → `ensurePlanned` + `navigate(\`/workout/\${planId}\`)`.

- [ ] **Step 1: Write the failing tests:**
  - Seed scheda A (rule on today's weekday) and scheda B (`dates: [today]`) → both boxes render, `Previsto` on each, each combo shows its own name.
  - Two schede on the same day, `Salta` on the first → first box gone, second still there.
  - Combo pick on the first box → first title becomes the picked scheda (substitute wrote rows: repo `listByDate(today)` has old `cancelled` + new `planned`).
  - Empty day → `Riposo`, combo face `Scegli scheda`, pick → box appears (assign), badge `Previsto` back.
  - Salta then tap the (returned) combo choice → box returns (un-skip path).
  - After Salta on the only scheda → `Riposo` box, not a blank page.
- [ ] **Step 2: Run to verify they fail** — `npx vitest run src/pages/Today.test.tsx`; Expected: FAIL.
- [ ] **Step 3: Implement.** `Today` builds `PlanningService` from `useAppData()`; state `resolved: ResolvedSession[]`; effect loads `dateKey(new Date())`; `refresh()` reloads after every write. Empty day: `Riposo` box, combo lists active schede, pick → `assign`. Non-empty: one box per session with skip/substitute; combo lists active schede minus current. Box tap → `ensurePlanned` then navigate. Health/weather cubes stay mock until Task 5.
- [ ] **Step 4: Run to verify they pass** — same command; Expected: PASS.
- [ ] **Step 5: Commit** — `feat: real Oggi with skip, substitute and assign`.

### Task 5: Meteo and salute

**Files:**
- Create: `src/services/weather.service.ts` + `src/services/weather.service.test.ts`
- Create: `src/services/health.service.ts` + `src/services/health.service.test.ts`
- Modify: `src/components/MetricCubes.tsx` (props-driven), `src/pages/Today.tsx` (loads them, health edit on tap)
- Test: `src/components/MetricCubes.test.tsx` (new)

**Interfaces:**
- Produces:

```ts
export interface WeatherNow { tempC: number | null; wind: number | null }
export function getWeatherNow(fetchImpl?: typeof fetch): Promise<WeatherNow>   // geolocation → Open-Meteo; nulls on any failure
export interface HealthValues { sleep?: number; restingHr?: number; steps?: number }
export function loadHealth(): HealthValues   // localStorage key 'lcc.health'
export function saveHealth(values: HealthValues): void
export function MetricCubes(props: { weather: WeatherNow; health: HealthValues; onEditHealth: () => void }): JSX.Element
```

- [ ] **Step 1: Write the failing tests:**
  - `fetchWeatherNow(position, stubFetch)` → `{ tempC: 14.2, wind: 8.4 }` from a stubbed Open-Meteo response (`current.temperature_2m`, `current.wind_speed_10m`).
  - `getWeatherNow()` with geolocation erroring → `{ tempC: null, wind: null }`; with fetch rejecting → nulls too.
  - `saveHealth`/`loadHealth` roundtrip; missing storage → `{}`.
  - `MetricCubes` renders `14°`/`8`/values with data; `—` for both weather fields when nulls; clicking the health cube calls `onEditHealth`.
- [ ] **Step 2: Run to verify they fail** — `npx vitest run src/services/weather.service.test.ts src/services/health.service.test.ts src/components/MetricCubes.test.tsx`; Expected: FAIL.
- [ ] **Step 3: Implement.** Open-Meteo URL: `https://api.open-meteo.com/v1/forecast?latitude&longitude&current=temperature_2m,wind_speed_10m` (no key). `Today` loads weather in an effect (state, nulls first), health from `loadHealth()`; health cube tap → inline mini-form (sonno ore, FC riposo, passi, «Salva» → `saveHealth` + reload cubes). Cubes show `—` for null weather.
- [ ] **Step 4: Run to verify they pass** — same command; Expected: PASS.
- [ ] **Step 5: Commit** — `feat: real weather and hand-entered health`.

### Task 6: Check-in vivo

**Files:**
- Modify: `src/services/llm-prompts.ts` (move `buildCheckInPrompt` here from `src/pages/today-mock.ts`; add `buildCheckInSystemPrompt`)
- Modify: `src/services/local-llm.ts` (add `chatWithLocalLlm`)
- Modify: `src/components/CheckInModal.tsx`, `src/pages/Today.tsx`
- Test: `src/services/local-llm.test.ts`, `src/services/llm-prompts.test.ts` (extend), `src/pages/Today.test.tsx` (extend)

**Interfaces:**
- Produces:

```ts
export interface ChatMessage { role: 'system' | 'user' | 'assistant'; content: string }
export async function chatWithLocalLlm(config: LocalLlmConfig, messages: ChatMessage[],
  fetchImpl?: typeof fetch): Promise<string>   // POST {endpoint}/chat/completions { model, messages } → choices[0].message.content
export function buildCheckInSystemPrompt(label: string, metrics: { sleep?: number; restingHr?: number
  steps?: number; tempC?: number | null; wind?: number | null }): string
```

- [ ] **Step 1: Write the failing tests:**
  - `chatWithLocalLlm` stubs fetch → returns the assistant content; posts to `${endpoint}/chat/completions` with `{ model, messages }`; throws when `enabled` false or endpoint empty or `!response.ok`.
  - `buildCheckInSystemPrompt('Corsa', { sleep: 7, restingHr: 52, steps: 3240, tempC: 14, wind: 8 })` mentions the scheda label and each metric.
  - Today check-in, config enabled via localStorage `lcc.localLlm`, fetch stubbed → assistant bubble appears; fetch rejecting → user bubble stays + `Nessun modello collegato` block appears; disabled config → offline block straight away (existing behavior).
- [ ] **Step 2: Run to verify they fail** — `npx vitest run src/services/local-llm.test.ts src/services/llm-prompts.test.ts src/pages/Today.test.tsx`; Expected: FAIL.
- [ ] **Step 3: Implement.** `CheckInModal` props gain `metrics`. Send: build `[system, ...thread, user]`, call `chatWithLocalLlm(loadLocalLlmConfig(), messages)`; success → assistant bubble; throw → the existing offline block (user bubble already appended). `buildCheckInPrompt` import path changes to `../services/llm-prompts` everywhere (Today.test too).
- [ ] **Step 4: Run to verify they pass** — same command; Expected: PASS.
- [ ] **Step 5: Commit** — `feat: live check-in with offline fallback`.

### Task 7: Player fix

**Files:**
- Modify: `src/pages/WorkoutPlayer.tsx`, `src/hooks/useWorkoutSession.ts`
- Test: `src/pages/WorkoutPlayer.test.tsx` (new; DataProvider + seeded planned row)

**Interfaces:**
- Consumes: `dateKey` (Task 2), `useAppData` at top level.
- Produces: unchanged hook signature.

- [ ] **Step 1: Write the failing test:** seed scheda + `plannedSession` for today (`dateKey(new Date())`); render `/workout/:planId` in `MemoryRouter` + `DataProvider`; the page reaches the session view (plan name visible) — and the created `WorkoutLog.date` equals `dateKey(new Date())`, not a UTC-sliced string.
- [ ] **Step 2: Run to verify it fails** — `npx vitest run src/pages/WorkoutPlayer.test.tsx`; Expected: FAIL (current code calls `useAppData` inside an effect and slices UTC).
- [ ] **Step 3: Implement.** Move `useAppData()` to the top of `WorkoutPlayer` (delete the inner call in the effect); use `dateKey(new Date())` for the `listByDate` lookup and in `startSession`'s log creation.
- [ ] **Step 4: Run to verify it passes** — same command; Expected: PASS.
- [ ] **Step 5: Commit** — `fix: player hooks and local date keys`.

### Task 8: Calendario on real data

**Files:**
- Modify: `src/components/MonthCalendar.tsx` (props: `days: MonthDay[]`-derived per-cell `{ sport?: string; done: boolean }[]`, plus existing today/selectedDay/nav)
- Modify: `src/components/DaySummaryModal.tsx` (optional `onAdd`), `src/pages/Calendar.tsx`
- Create: `src/components/AssignModal.tsx` (list active schede, pick → callback)
- Delete: `useCalendarWeek` export + `src/pages/Calendar.test.tsx`, `src/components/CalendarSlot.tsx` + its line in `src/components/glass-cards.test.tsx`
- Test: `src/pages/Calendar.page.test.tsx` (rewrite on DataProvider + seeds)

**Interfaces:**
- Consumes: `PlanningService.resolveMonth/resolveDay/assign` (Task 2), `MonthDay`, `dateKey`.
- Produces: `MonthCalendar` cell dots from props `{ sport?: string; done: boolean }[]` — full dot when `done`, outline dot when planned, no dot when empty; month starts at the **real current month**.

- [ ] **Step 1: Write the failing tests:**
  - Seed scheda A rule matching the 23rd of the current real month (`weekdayIndex`), scheda B `dates: [that date]` → grid shows a dot on that day (no `data-today` false assertions; compute the real today for the ring).
  - Click that day → summary modal shows scheda name; a day with a `WorkoutLog` shows the duration summary (`45 min`).
  - Click an empty day → `AssignModal`; pick scheda B → modal closes, dot appears on that day (assign wrote a row).
  - `Aggiungi allenamento` inside the summary modal opens `AssignModal` too.
  - Prev/next month: current month label changes (`settembre 2026` style, Italian), days re-resolve (rules follow weekdays), coming back shows the same dots.
- [ ] **Step 2: Run to verify they fail** — `npx vitest run src/pages/Calendar.page.test.tsx`; Expected: FAIL.
- [ ] **Step 3: Implement.** `Calendar`: state `year/monthIndex` from the real now (not the mock October), `selectedDay`; effect loads `resolveMonth` then per-day `resolveDay` for modal content (`done` → log duration/distance summary; planned → `plan.description`); empty-day click → `AssignModal` → `assign` → reload. Delete `useCalendarWeek`, `CalendarSlot`, their tests. Sport→color map stays in `MonthCalendar` (`strength → #7eb6ff`, `running → #ff6b4a`, `cycling → #5ee0a0`, else `#d0d0d4` outline-safe).
- [ ] **Step 4: Run to verify they pass** — `npx vitest run src/pages/Calendar.page.test.tsx src/components/glass-cards.test.tsx`; Expected: PASS.
- [ ] **Step 5: Commit** — `feat: real month calendar with assignment`.

### Task 9: Mock removal and full check

**Files:**
- Delete: `src/pages/today-mock.ts`, `src/pages/today-mock.test.ts`
- Modify: `src/pages/Today.tsx` (local `formatToday`), any remaining import paths
- Test: the suite

- [ ] **Step 1: Move `formatToday` into `src/pages/Today.tsx`, delete the two mock files, fix imports** (`grep -r "today-mock"` empty afterwards).
- [ ] **Step 2: Full suite + types** — `npx vitest run` then `npx tsc -b`; Expected: all green, 0 failures, tsc clean.
- [ ] **Step 3: Commit** — `feat: remove mocks, app runs on real data`.

## Notes for the executor

- Test files that render pages import `{ db }` from `src/data/db` and clear tables in `beforeEach` — fake-indexeddb is wired in `src/test/setup.ts`.
- `Calendar.page.test.tsx`/`Today.test.tsx` rewrite: they currently pin mock October values; every pinned value moves to seeds.
- Do not touch `src/pages/History.tsx`, `src/services/history.service.ts`, `src/services/gpx.ts`, backup, schema-validator.