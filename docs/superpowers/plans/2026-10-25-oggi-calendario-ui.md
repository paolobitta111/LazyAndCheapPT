# Oggi and Month Calendar UI Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the Today page and the week list calendar with the approved graphical screens, still fed by local mocks.

**Architecture:** A mock module owns schede, October dots, metric numbers, and the check-in prompt string. Presentational components own the session box, combobox, metric rectangles, check-in modal, and month grid. `Today` and `Calendar` only hold React state. Dexie stays unwired. `useCalendarWeek` stays exported and unused by the page.

**Tech Stack:** React 19, TypeScript strict, Vite, Vitest, Testing Library. No new dependencies. Existing glass classes in `src/styles/glass.css`.

**Spec:** `docs/superpowers/specs/2026-10-25-oggi-calendario-ui-design.md`

## Global Constraints

- This step does not read or write Dexie, repos, or existing services. No weather, Apple Health, or LLM endpoint calls. Skip, substitution, and chat die on refresh.
- Do not edit schema, backup, `src/services/llm-prompts.ts`, `src/services/local-llm.ts`, or `src/pages/LlmBridge.tsx`.
- Do not rewrite `History.tsx`. Route `/storico` stays mounted. No new link to it.
- No calendar library. No new CSS framework. No `any`. No SF Symbol paths. No emoji in the tab bar.
- Ink `#0b0b0d`, primary text `#f5f5f7`. Use existing `.glass`, `.glass-bar`, `.btn`, `.btn-primary`.
- Minimum width 375px. Four tabs, full labels: Oggi, Schede, Calendario, Impostazioni.
- The header LLM button stays: `<button className="btn" type="button" onClick={() => navigate('/llm')}>LLM</button>`.
- Work on the current working tree. Do not revert unrelated dirty files in `src/index.css`, `src/styles/glass.css`, `src/pages/Settings.tsx`, or `src/pages/no-bulma.test.ts`.
- Initial mock after refresh: scheda Corsa prevista, October 2026, empty chat.
- Monday is the first weekday. Other months have no dots.
- A day without a dot does nothing. The 23 October modal copy is `32 min · 5,1 km` and `Ginocchio ok. Ritmo comodo.`
- Prompt string is exactly `Check-in di oggi.\nScheda: ${label}\nMessaggio: ${message}`.
- `noUnusedLocals` is on. Do not leave `formatToday` unused.

## Review Focus

- A tap on a calendar day with no dot must not open the summary. Task 6 asserts day 1 has no dialog and day 23 does.
- Sending an empty check-in must not add a bubble or the offline block. Task 5 asserts the composer stays and `Nessun modello collegato` is absent.
- If `navigator.share` rejects, the user still gets the prompt and is told sharing failed. Task 5 asserts `Condivisione non disponibile. Prompt copiato.`
- After Salta, picking a scheda must bring back `Previsto` and `Salta`. Task 3 asserts both return.
- Leaving October and coming back must show the same dots. Task 6 asserts day 23 still has a dot after next then prev.

---

### Task 1: Four tabs and an Oggi title

**Files:**
- Modify: `src/components/BottomNav.tsx`
- Modify: `src/components/BottomNav.test.tsx`
- Modify: `src/App.tsx`
- Modify: `src/pages/App.test.tsx`
- Create: `src/pages/today-mock.ts`
- Modify: `src/pages/Today.tsx`
- Test: `src/pages/App.test.tsx`

**Interfaces:**
- Consumes: `pageTitle(pathname: string): string` already in `src/App.tsx`.
- Produces: `formatToday(date?: Date): string` moves to `src/pages/today-mock.ts`. Header `h1` is `pageTitle(location.pathname)` on every route, including `/`.

- [ ] **Step 1: Write the failing test**

In `src/pages/App.test.tsx`, change the five-tab test so it asserts:

```tsx
expect(container.querySelector('header h1')?.textContent).toBe('Oggi')
expect(container.querySelector('header button')?.textContent).toBe('LLM')
expect([...container.querySelectorAll('nav button')].map((button) => button.textContent?.trim())).toEqual([
  'Oggi',
  'Schede',
  'Calendario',
  'Impostazioni',
])
```

Add:

```tsx
it('still renders History at /storico', () => {
  const { container } = renderAt('/storico')
  expect(container.textContent).toContain('History Page')
  expect(container.querySelector('button.active')).toBeNull()
})
```

In `src/components/BottomNav.test.tsx`, expect four labels in that same order, and rename the test so it no longer says five. Keep the assertions that the nav has no emoji and no LLM label.

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run src/pages/App.test.tsx src/components/BottomNav.test.tsx`
Expected: FAIL because the header shows a date and the nav still has Storico.

- [ ] **Step 3: Implement the chrome change**

Remove `{ id: '/storico', icon: 'storico', label: 'Storico' }` from `navItems`. Remove `'/storico'` from `tabIds`. Set the header `h1` to `{pageTitle(location.pathname)}`. Keep the LLM button.

Move `formatToday` into `src/pages/today-mock.ts` with the same body. In `Today.tsx`, import it and render `<p className="today-date">{formatToday()}</p>` as the first child. Do not yet remove the old session mock.

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run src/pages/App.test.tsx src/components/BottomNav.test.tsx`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add src/components/BottomNav.tsx src/components/BottomNav.test.tsx src/App.tsx src/pages/App.test.tsx src/pages/today-mock.ts src/pages/Today.tsx
git commit -m "feat: drop Storico tab and title Oggi"
```

### Task 2: Mock schede, dots, and prompt

**Files:**
- Modify: `src/pages/today-mock.ts`
- Test: `src/pages/today-mock.test.ts`

**Interfaces:**
- Consumes: `formatToday` from Task 1.
- Produces:

```ts
export type MockSport = 'running' | 'strength' | 'cycling'

export interface MockScheda {
  id: string
  name: string
  subtitle: string
  sport: MockSport
}

export const mockSchede: MockScheda[]
export const initialSchedaId = 'corsa'

export interface MockDaySession {
  day: number
  schedaId: string
  summary: string
  notes: string
}

export const octoberYear = 2026
export const octoberMonthIndex = 9
export const octoberSessions: MockDaySession[]

export const mockMetrics = {
  tempC: 14,
  wind: 8,
  sleep: '7h 12',
  restingHr: 52,
  steps: '3.240',
}

export function buildCheckInPrompt(label: string, message: string): string
```

`mockSchede` ids, in order: `corsa`, `palestra-1`, `bici`, `petto`, `schiena`, `gambe`, `corsa-intervalli`. Names: `Corsa`, `Palestra giorno 1`, `Bici`, `Petto + tricipiti`, `Schiena + bicipiti`, `Gambe + addome`, `Corsa intervalli`. Sports: running, strength, cycling, strength, strength, strength, running. Corsa subtitle is exactly `Fondo lento · 40 min · zona 2`. Other subtitles are `Sessione registrata`.

`octoberSessions` days and sports via schedaId: 2 palestra-1, 4 corsa, 6 bici, 8 palestra-1, 11 corsa, 13 palestra-1, 15 bici, 18 corsa, 20 palestra-1, 22 bici, 23 corsa. Day 23 summary `32 min · 5,1 km`, notes `Ginocchio ok. Ritmo comodo.` Other days: summary `Sessione registrata`, notes `''`.

- [ ] **Step 1: Write the failing test**

Assert `mockSchede` length 7, `mockSchede[0]` is Corsa with that subtitle, `buildCheckInPrompt('Corsa', 'ho le gambe pesanti')` equals `Check-in di oggi.\nScheda: Corsa\nMessaggio: ho le gambe pesanti`, and `octoberSessions` has a day 23 entry with that summary and notes. Assert no session has `day === 25`.

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run src/pages/today-mock.test.ts`
Expected: FAIL with cannot find module or missing export.

- [ ] **Step 3: Add the exports to `src/pages/today-mock.ts`**

Keep `formatToday`. Add the types and constants above. `buildCheckInPrompt` returns the exact template in the interface block.

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run src/pages/today-mock.test.ts`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add src/pages/today-mock.ts src/pages/today-mock.test.ts
git commit -m "feat: add Today and October mocks"
```

### Task 3: Session box, skip, and combobox

**Files:**
- Create: `src/components/SubstituteCombo.tsx`
- Create: `src/components/SessionBox.tsx`
- Create: `src/pages/Today.test.tsx`
- Modify: `src/pages/Today.tsx`
- Test: `src/pages/Today.test.tsx`

**Interfaces:**
- Consumes: `MockScheda`, `mockSchede`, `initialSchedaId`, `formatToday` from `src/pages/today-mock.ts`.
- Produces:

```tsx
export function SubstituteCombo(props: {
  schede: MockScheda[]
  currentId: string | null
  open: boolean
  onToggle: () => void
  onSelect: (id: string) => void
}): JSX.Element

export function SessionBox(props: {
  scheda: MockScheda | null
  schede: MockScheda[]
  onSkip: () => void
  onSelect: (id: string) => void
  onCheckIn: () => void
}): JSX.Element
```

Closed face is `{name} · oggi`, or `Scegli scheda` when `currentId` is null. Open list excludes `currentId`. Open root has class `substitute-combo`, `position: absolute`, `style.maxHeight` `132px`, and the list has `style.overflowY` `auto`. The closed face stays in normal flow so the card height does not change when the list opens. Selecting calls `onSelect` and the parent closes the list. `SessionBox` shows `Previsto` only when `scheda` is non-null, `Salta` only then, title `Riposo` and subtitle `Nessuna sessione` when null.

- [ ] **Step 1: Write the failing test**

Render `Today` inside a `MemoryRouter`. Assert the date paragraph exists, the title is `Corsa`, the badge is `Previsto`, the subtitle is `Fondo lento · 40 min · zona 2`, and buttons `Salta` and `AI Check-In` exist. The combobox face is `Corsa · oggi`.

Click the face. Assert `Palestra giorno 1` is present and `Corsa · oggi` is not a second choice in the list (the face remains). Assert the open combo has `maxHeight` `132px` and `position` `absolute`.

Click `Palestra giorno 1`. Assert the title is `Palestra giorno 1`, the face is `Palestra giorno 1 · oggi`, and `Bici` is gone.

Click `Salta`. Assert title `Riposo`, subtitle `Nessuna sessione`, no `Previsto`, no button named `Salta`, face `Scegli scheda`.

Click the face, then `Bici`. Assert title `Bici`, badge `Previsto`, and button `Salta` is back.

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run src/pages/Today.test.tsx`
Expected: FAIL because Today still shows the old mock session.

- [ ] **Step 3: Implement the box and wire Today**

`Today` state: `schedaId` starts as `initialSchedaId`, `comboOpen` starts false. `onSkip` sets `schedaId` to null and closes the combo. `onSelect` sets `schedaId` and closes the combo. `onCheckIn` can be a no-op until Task 5.

Replace the old session, timer, cardio, and quick-add sections. Keep the `today-date` paragraph. Do not render metric cubes yet.

Title is 22px, weight 400, color `#f5f5f7`. Badge uses the coral tint from the spec. Buttons sit on one row. `AI Check-In` uses `btn btn-primary`. `Salta` uses `btn`.

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run src/pages/Today.test.tsx`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add src/components/SubstituteCombo.tsx src/components/SessionBox.tsx src/pages/Today.tsx src/pages/Today.test.tsx
git commit -m "feat: add Today session box and substitute combo"
```

### Task 4: Metric rectangles

**Files:**
- Create: `src/components/MetricCubes.tsx`
- Modify: `src/pages/Today.tsx`
- Modify: `src/pages/Today.test.tsx`
- Test: `src/pages/Today.test.tsx`

**Interfaces:**
- Consumes: `mockMetrics` from `src/pages/today-mock.ts`.
- Produces: `export function MetricCubes(): JSX.Element`. Two elements with class `metric-cube`. No words `Sonno`, `Meteo`, `Passi`, `vento`, or `nuvoloso`.

- [ ] **Step 1: Write the failing test**

Assert Today contains `14°`, `8`, `Zzz`, `7h 12`, `52`, and `3.240`. Assert two `.metric-cube` nodes. Assert the text does not contain `Sonno` or `Meteo`. Assert the cubes remain after `Salta`.

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run src/pages/Today.test.tsx`
Expected: FAIL because the cubes are absent.

- [ ] **Step 3: Implement `MetricCubes` and render it under `SessionBox`**

Weather cube: cloud SVG plus `14°`, wind SVG plus `8`. Health cube: text `Zzz`, heart SVG plus `52`, shoe SVG plus `3.240`. Stroke about 1.7, original paths, not emoji. Layout is a row; each cube is shorter than the session box.

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run src/pages/Today.test.tsx`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add src/components/MetricCubes.tsx src/pages/Today.tsx src/pages/Today.test.tsx
git commit -m "feat: add mock weather and health cubes"
```

### Task 5: Check-in chat

**Files:**
- Create: `src/components/CheckInModal.tsx`
- Modify: `src/pages/Today.tsx`
- Modify: `src/pages/Today.test.tsx`
- Test: `src/pages/Today.test.tsx`

**Interfaces:**
- Consumes: `buildCheckInPrompt(label: string, message: string): string`.
- Produces:

```tsx
export function CheckInModal(props: {
  label: string
  onClose: () => void
}): JSX.Element
```

Heading text is `Check-in · ${label}` with no CSS uppercase transform. Dialog has `role="dialog"`. Send control has `aria-label` `Invia` and no text `Invia`. User bubbles have `data-role="user"`. Imported bubbles have `data-role="assistant"`.

- [ ] **Step 1: Write the failing test**

Click `AI Check-In`. Assert dialog text `Check-in · Corsa di oggi` and a heading `Chat`. The eyebrow element must not have `text-transform` `uppercase`.

Click `Invia` with an empty field. Assert no `Nessun modello collegato` and no `[data-role="user"]`.

Type `ho le gambe pesanti`, click `Invia`. Assert one user bubble with that text and `Nessun modello collegato`.

Stub `navigator.clipboard.writeText` to resolve, and `navigator.share` to reject. Click `Condividi`. Assert the status is `Condivisione non disponibile. Prompt copiato.` and `writeText` was called with `buildCheckInPrompt('Corsa', 'ho le gambe pesanti')`.

Click `Importa risposta`, leave the field empty, confirm. Assert no assistant bubble. Type `Accorcia a 25 minuti`, confirm. Assert one `[data-role="assistant"]` with that text, and the session title is still `Corsa`.

Close the dialog and open it again. Assert the user bubble and the assistant bubble are still there.

Click `Salta`, open check-in. Assert `Check-in · Riposo`.

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run src/pages/Today.test.tsx`
Expected: FAIL because the dialog is missing.

- [ ] **Step 3: Implement `CheckInModal` and open it from Today**

`Today` holds `checkInOpen`. Label is `${scheda.name} di oggi` or `Riposo`.

Empty send returns. Non-empty send appends the user message and shows the offline block with buttons `Esporta`, `Condividi`, and `Importa risposta`.

`Esporta` copies `buildCheckInPrompt`. On success set status `Prompt copiato.` On clipboard failure render `<pre className="checkin-prompt">` with the prompt.

`Condividi` calls `navigator.share({ text: prompt })`. On missing API or rejection, copy as export does and set status `Condivisione non disponibile. Prompt copiato.` If that copy also fails, status is `Condivisione non disponibile. Seleziona il testo.` and the pre is shown.

`Importa risposta` reveals a textarea and `Aggiungi`. Empty confirm does nothing. Otherwise append an assistant message. Do not parse JSON. Do not change `schedaId`.

Send is a 40px round button, glass styles, an up-arrow SVG, `aria-label="Invia"`. Closing the dialog keeps the messages in modal state until Today unmounts.

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run src/pages/Today.test.tsx`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add src/components/CheckInModal.tsx src/pages/Today.tsx src/pages/Today.test.tsx
git commit -m "feat: add graphical check-in chat"
```

### Task 6: Month grid and day modal

**Files:**
- Create: `src/components/MonthCalendar.tsx`
- Create: `src/components/DaySummaryModal.tsx`
- Modify: `src/pages/Calendar.tsx`
- Create: `src/pages/Calendar.page.test.tsx`
- Test: `src/pages/Calendar.page.test.tsx`
- Test: `src/pages/Calendar.test.tsx` (existing `useCalendarWeek` tests must still pass)

**Interfaces:**
- Consumes: `octoberSessions`, `octoberYear`, `octoberMonthIndex`, `mockSchede` from `src/pages/today-mock.ts`.
- Produces:

```ts
export function buildMonthCells(year: number, monthIndex: number): Array<number | null>

export function MonthCalendar(props: {
  year: number
  monthIndex: number
  sessions: MockDaySession[]
  today: { year: number; monthIndex: number; day: number } | null
  onSelectDay: (day: number) => void
  onPrev: () => void
  onNext: () => void
}): JSX.Element

export function DaySummaryModal(props: {
  dateLabel: string
  title: string
  summary: string
  notes: string
  onClose: () => void
}): JSX.Element
```

`buildMonthCells(2026, 9)` starts with three `null`s, then 1 through 31. Sport colors: running `#ff6b4a`, strength `#7eb6ff`, cycling `#5ee0a0`. Dot is a span with `data-sport`. Today cell has `data-today="true"`. Day buttons use `aria-label` `${day} ottobre` only when the visible month is October; otherwise `${day}` plus the Italian month name. Empty leading cells are not buttons.

- [ ] **Step 1: Write the failing test**

Render `Calendar` without `DataProvider`. Assert text `Ottobre 2026`, legend words `Palestra`, `Corsa`, `Bici`, and no `useAppData` crash.

Assert `buildMonthCells(2026, 9)[0]` is null and `[3]` is 1.

Day button `23 ottobre` contains a dot with `data-sport="running"`. Day button `25 ottobre` has `data-today="true"` and no dot. Click `1 ottobre`. Assert no `role="dialog"`. Click `23 ottobre`. Assert dialog text `32 min · 5,1 km` and `Ginocchio ok. Ritmo comodo.` Click the backdrop. Assert the dialog is gone.

Click the next-month button, then the previous-month button. Assert `23 ottobre` still has the running dot.

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run src/pages/Calendar.page.test.tsx`
Expected: FAIL because Calendar still renders the week list and calls `useAppData`.

- [ ] **Step 3: Implement the month page**

Keep `useCalendarWeek` exported from `src/pages/Calendar.tsx`. The default export must not call `useAppData`.

State: `year` and `monthIndex` start at `octoberYear` and `octoberMonthIndex`. `selectedDay` starts null. Sessions passed to `MonthCalendar` are `octoberSessions` only when the view is October 2026, otherwise `[]`. `today` is `{ year: 2026, monthIndex: 9, day: 25 }` only in that same month, otherwise null. `onSelectDay` sets `selectedDay` only if that day is in the passed sessions.

`DaySummaryModal` is centered, with `Chiudi` and a backdrop button that also closes. Date label for 23 October is `Venerdì 23 ottobre`. Title is the scheda name.

Header row has the month label and buttons named `Mese precedente` and `Mese successivo`. Weekday letters are `L M M G V S D`.

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run src/pages/Calendar.page.test.tsx src/pages/Calendar.test.tsx`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add src/components/MonthCalendar.tsx src/components/DaySummaryModal.tsx src/pages/Calendar.tsx src/pages/Calendar.page.test.tsx
git commit -m "feat: add month calendar and day summary modal"
```

### Task 7: Full check

**Files:**
- Test: the suite

- [ ] **Step 1: Run the suite**

Run: `npx vitest run`
Expected: PASS

- [ ] **Step 2: Commit only if a test fix was required**

If Step 1 passes with no edits, do not make an empty commit. If a test fix was required, commit those files with message `test: align suite with graphical Oggi`.
