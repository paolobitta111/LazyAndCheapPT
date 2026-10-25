# Liquid Glass UI Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the Bulma chrome with a dark ink Liquid Glass UI: glass cards on every page, a floating capsule tab bar with a droplet selection, and the system font.

**Architecture:** One CSS token file owns the glass recipe, fallback, and motion. `BottomNav` and `App` own chrome. Pages and cards drop Bulma class names and use those tokens. Data, routes, and services stay.

**Tech Stack:** React, TypeScript strict, Vite, Vitest, Testing Library. No Bulma. No Tailwind. No bundled SF Pro.

**Spec:** `docs/superpowers/specs/2026-10-25-liquid-glass-ui-design.md`

## Global Constraints

- Background `#0b0b0d`. No blue or copper blobs.
- Font stack exactly: `-apple-system, BlinkMacSystemFont, system-ui, sans-serif`. Do not add a font file.
- Glass tint `linear-gradient(180deg, rgb(255 255 255 / 0.10), rgb(255 255 255 / 0.03))`, border `rgb(255 255 255 / 0.16)`, highlight `inset 0 1px 0 rgb(255 255 255 / 0.28)`, shadow `0 10px 28px rgb(0 0 0 / 0.45)`, card blur `20px`, saturation `160%`.
- No `backdrop-filter` support: background `rgb(28 28 30 / 0.92)`.
- Tab bar blur stays in the 2–8px range. SVG displacement only on the tab bar, and only inside `@supports (backdrop-filter: url("#liquid-glass"))`.
- Selected tab icon is filled white. Inactive icons are stroke `rgb(255 255 255 / 0.55)`. No system blue.
- Tabs, in order: Oggi `/`, Schede `/schede`, Calendario `/calendario`, Storico `/storico`, Impostazioni `/impostazioni`. LLM is not a tab. Route `/llm` stays.
- `prefers-reduced-motion: reduce` disables swell and sheen.
- Do not delete `src/pages/Home.tsx`. Do not change Dexie, services, or schema. No Fase 13.
- Primary text `#f5f5f7`. Primary button is a light capsule with dark text, not Bulma blue.
- `theme_color` and PWA `background_color` become `#0b0b0d` in both `public/manifest.json` and `vite.config.ts`.

## Review Focus

- A browser with no `backdrop-filter` still shows dark panels, not white text on a missing background. Task 1 asserts the `@supports not` fallback color.
- `prefers-reduced-motion: reduce` must not leave a swell transition on `.glass-pill`. Task 1 asserts that media query.
- `/workout/:planId`, `/cardio`, and `/llm` must not mark Oggi active just because the path is not a tab. Task 3 asserts no `.active` tab on `/llm`.
- Oggi and Impostazioni must still reach `/llm` after the top navbar links are removed. Task 3 and Task 6 assert `href="#/llm"`.
- Five labels stay in the tab bar; Impostazioni is not dropped to fit 375px in the markup. Task 2 asserts all five accessible names. Shortening is a CSS overflow check, not a removed node.

---

### Task 1: Glass tokens and Bulma removal

**Files:**
- Create: `src/styles/glass.css`
- Create: `src/styles/glass.css.test.ts`
- Modify: `src/index.css`
- Modify: `package.json`
- Modify: `public/manifest.json`
- Modify: `vite.config.ts`
- Modify: `index.html`

**Interfaces:**
- Consumes: nothing
- Produces: classes `.glass`, `.glass-bar`, `.glass-pill`, `.field`, `.btn`, `.btn-primary`. Body uses the font stack and background `#0b0b0d`. `.glass-bar` blur is between 2px and 8px. `.glass` blur is `20px`.

- [ ] **Step 1: Write the failing test**

`src/styles/glass.css.test.ts` reads `src/styles/glass.css`, `src/index.css`, `public/manifest.json`, `vite.config.ts`, `index.html`, and `package.json` as text.

Assertions:
- `glass.css` contains `rgb(255 255 255 / 0.10)`, `rgb(255 255 255 / 0.03)`, `rgb(255 255 255 / 0.16)`, `inset 0 1px 0 rgb(255 255 255 / 0.28)`, `0 10px 28px rgb(0 0 0 / 0.45)`, `blur(20px)`, `saturate(160%)`, `rgb(28 28 30 / 0.92)`, `#f5f5f7`, `#0b0b0d`
- `glass.css` contains `@supports not ((-webkit-backdrop-filter: blur(1px)) or (backdrop-filter: blur(1px)))`
- `glass.css` contains `@media (prefers-reduced-motion: reduce)` and, in that block, `.glass-pill` has `transition: none` or `transform: none`
- a regex finds the `.glass-bar` blur value and it is `>= 2` and `<= 8`
- `index.css` does not contain `bulma`
- `index.css` contains `-apple-system, BlinkMacSystemFont, system-ui, sans-serif`
- `package.json` dependencies do not have `bulma`
- both manifest files contain `"theme_color": "#0b0b0d"` and `"background_color": "#0b0b0d"` (`vite.config.ts` uses the same string values)
- `index.html` contains `<meta name="theme-color" content="#0b0b0d" />`

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run src/styles/glass.css.test.ts`
Expected: FAIL because `src/styles/glass.css` does not exist.

- [ ] **Step 3: Add the stylesheet and remove Bulma**

Create `src/styles/glass.css` with the classes in Interfaces and the exact values in Global Constraints. Include `-webkit-backdrop-filter` next to `backdrop-filter`. Put the SVG displacement rule only inside `@supports (backdrop-filter: url("#liquid-glass"))` on `.glass-bar`, not on `.glass`.

Replace the Bulma import in `src/index.css` with `@import './styles/glass.css';` and set `body` font and background from the tokens.

Remove `bulma` from `package.json` and run `npm uninstall bulma`.

Set `theme_color` and `background_color` to `#0b0b0d` in `public/manifest.json` and `vite.config.ts`. Set the `theme-color` meta in `index.html` to `#0b0b0d`.

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run src/styles/glass.css.test.ts`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add src/styles/glass.css src/styles/glass.css.test.ts src/index.css package.json package-lock.json public/manifest.json vite.config.ts index.html
git commit -m "feat: add ink glass tokens and remove Bulma"
```

### Task 2: Tab bar droplet and icons

**Files:**
- Create: `src/components/NavIcon.tsx`
- Create: `src/components/BottomNav.test.tsx`
- Modify: `src/components/BottomNav.tsx`

**Interfaces:**
- Consumes: `.glass-bar`, `.glass-pill` from Task 1
- Produces: `NavIcon({ name, filled }: { name: 'oggi' | 'schede' | 'calendario' | 'storico' | 'impostazioni'; filled: boolean })`. `BottomNav` props stay `{ activeTab: string; onNavigate: (tab: string) => void }`. Active item has class `active` and a child with class `glass-pill`. The nav has class `glass-bar`. No emoji in the five labels.

- [ ] **Step 1: Write the failing test**

Render `BottomNav` with `activeTab="/"` and `onNavigate` as `vi.fn()`.

Assertions:
- accessible names include `Oggi`, `Schede`, `Calendario`, `Storico`, `Impostazioni`, in that document order
- the Oggi button has class `active` and contains `.glass-pill`
- Schede does not contain `.glass-pill`
- the nav has class `glass-bar`
- inner text does not match `/[\u{1F300}-\u{1FAFF}]/u`
- clicking Schede calls `onNavigate` with `'/schede'`
- there is no button named `LLM`

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run src/components/BottomNav.test.tsx`
Expected: FAIL because Impostazioni and `glass-pill` are absent.

- [ ] **Step 3: Implement icons and the five-tab bar**

`NavIcon` draws original stroke SVGs, `strokeWidth` about `1.7`, `fill="currentColor"` and `stroke="none"` when `filled` is true. Inactive color comes from CSS `rgb(255 255 255 / 0.55)`. Active color is `#fff`.

`BottomNav` maps the five routes in Interfaces. The pill is a sibling behind the icon and label, not a disc around the icon only. Do not copy SF Symbol paths.

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run src/components/BottomNav.test.tsx`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add src/components/NavIcon.tsx src/components/BottomNav.tsx src/components/BottomNav.test.tsx
git commit -m "feat: glass tab bar with droplet selection"
```

### Task 3: App chrome

**Files:**
- Modify: `src/App.tsx`
- Modify: `src/pages/App.test.tsx`
- Delete if present and unused: `src/pages/__snapshots__/App.test.tsx.snap`

**Interfaces:**
- Consumes: `BottomNav` from Task 2
- Produces: `pageTitle(pathname: string): string` in `src/App.tsx`, returning `Oggi`, `Schede`, `Calendario`, `Storico`, `Impostazioni`, `LLM`, `Cardio`, `Sessione` for `/workout/...`, otherwise `Pagina`. The top capsule has class `glass-bar` and that title. No element with class `navbar`. `BottomNav` `activeTab` is `location.pathname` only when it is one of the five tab ids; otherwise `''`.

- [ ] **Step 1: Write the failing test**

Update `src/pages/App.test.tsx`. Keep the page mocks. Add a `/llm` mock if the route renders `LlmBridge`.

Assertions, using `MemoryRouter` `initialEntries`:
- `/` shows title `Oggi`, a tab named `Impostazioni`, class `glass-bar`, and no class `navbar` or `bottom-nav`
- `/llm` shows title `LLM` and no `.bottom-nav-item.active`
- the document does not contain `href="#/llm"` inside the top capsule; the LLM tab absence is already covered in Task 2

Do not assert `LazyCheapCoach` in the top capsule.

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run src/pages/App.test.tsx`
Expected: FAIL because the white navbar is still there and Impostazioni is not a tab.

- [ ] **Step 3: Replace the navbar**

Remove the fixed white navbar and its Impostazioni/LLM links. Render the title capsule from `pageTitle`. Pass `activeTab` as specified. Delete the stale snapshot if no test calls `toMatchSnapshot`.

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run src/pages/App.test.tsx`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add src/App.tsx src/pages/App.test.tsx
git add -u src/pages/__snapshots__/App.test.tsx.snap
git commit -m "feat: floating glass title and five-tab shell"
```

### Task 4: Cards use glass

**Files:**
- Create: `src/components/glass-cards.test.tsx`
- Modify: `src/components/SessionCard.tsx`
- Modify: `src/components/CalendarSlot.tsx`
- Modify: `src/components/HistoryItem.tsx`
- Modify: `src/components/ExerciseSetRow.tsx`
- Modify: `src/components/Timer.tsx`
- Modify: `src/components/ExerciseRow.tsx`
- Modify: `src/components/ErrorBoundary.tsx`

**Interfaces:**
- Consumes: `.glass`, `.field`, `.btn` from Task 1
- Produces: each listed card root has class `glass`. Inputs in `ExerciseSetRow` and `Timer` buttons use `.field` and `.btn`, not `is-primary` or `is-success`. `ErrorBoundary` fallback root has background `#0b0b0d` via class `ink-fallback` defined in `glass.css`.

- [ ] **Step 1: Write the failing test**

Render each component with:
- `SessionCard` `title="Panca"`, `status="active"`
- `CalendarSlot` `day="Lunedì"`, `time="08:00"`, `planName="Petto"`, `hasPlan`
- `HistoryItem` `date="25 ott"`, `type="workout"`, `duration="45 min"`
- `ExerciseSetRow` with a `SetLog` `{ id: 's', exerciseLogId: 'e', repCount: 10, kg: 60, completed: false, createdAt: new Date(), updatedAt: new Date() }`, `index={0}`, `isCompleted={false}`, `onToggleComplete` resolving
- `Timer` `startedAt` and `targetEndAt` as ISO strings one hour apart
- `ExerciseRow` `name="Panca"`, `sets={4}`, `reps={10}`, `weight="60 kg"`

Assertions: each root has class `glass`. `HistoryItem` text does not include `is-primary`. `ExerciseSetRow` query by label `Set 1 peso` has class `field`. Render `ErrorBoundary` around a child that throws and expect the fallback to have class `ink-fallback`.

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run src/components/glass-cards.test.tsx`
Expected: FAIL because roots still use Bulma `card` or `box`.

- [ ] **Step 3: Restyle the components**

Replace Bulma layout classes with `glass` and normal block flow. Keep the same props and the same visible strings, except drop emoji status markers if they fight the glass type; keep the words `In corso`, `Completata`, `Workout`, `Cardio`, `Nessun piano`. Weight and rep text uses `font-variant-numeric: tabular-nums` via class `nums`. Add `.ink-fallback { background: #0b0b0d; color: #f5f5f7; }` to `glass.css`.

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run src/components/glass-cards.test.tsx`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add src/components/glass-cards.test.tsx src/components/SessionCard.tsx src/components/CalendarSlot.tsx src/components/HistoryItem.tsx src/components/ExerciseSetRow.tsx src/components/ExerciseRow.tsx src/components/Timer.tsx src/components/ErrorBoundary.tsx src/styles/glass.css
git commit -m "feat: glass cards and ink error fallback"
```

### Task 5: Content pages

**Files:**
- Create: `src/pages/no-bulma.test.ts`
- Modify: `src/pages/Today.tsx`
- Modify: `src/pages/Plans.tsx`
- Modify: `src/pages/Calendar.tsx`
- Modify: `src/pages/History.tsx`

**Interfaces:**
- Consumes: `.glass`, `.btn`, `.btn-primary` from Task 1
- Produces: those four files contain no Bulma class token from this list: `is-primary`, `is-info`, `is-success`, `is-warning`, `is-danger`, `is-light`, `navbar`, `class="box"`, `class="card"`, `title is-`. `Today.tsx` contains `href="#/llm"`.

- [ ] **Step 1: Write the failing test**

`src/pages/no-bulma.test.ts` reads the four page files and fails if any token in Interfaces appears. It also asserts `Today.tsx` includes `href="#/llm"`.

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run src/pages/no-bulma.test.ts`
Expected: FAIL on existing Bulma classes and the missing LLM link.

- [ ] **Step 3: Restyle the four pages**

Replace Bulma boxes with `glass`. Replace primary actions with `btn btn-primary`. Add one text link `Apri il ponte LLM` with `href="#/llm"` on Oggi. Do not change hooks, repo calls, or route paths.

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run src/pages/no-bulma.test.ts src/pages/Calendar.test.tsx`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add src/pages/no-bulma.test.ts src/pages/Today.tsx src/pages/Plans.tsx src/pages/Calendar.tsx src/pages/History.tsx
git commit -m "feat: ink glass on Oggi, Schede, Calendario, and Storico"
```

### Task 6: Forms, player, and LLM entry

**Files:**
- Modify: `src/pages/no-bulma.test.ts`
- Modify: `src/pages/WorkoutPlayer.tsx`
- Modify: `src/pages/Cardio.tsx`
- Modify: `src/pages/LlmBridge.tsx`
- Modify: `src/pages/Settings.tsx`
- Modify: `src/pages/NotFound.tsx`

**Interfaces:**
- Consumes: `.glass`, `.field`, `.btn`, `.btn-primary` from Task 1
- Produces: the same Bulma-token ban as Task 5, extended to these five files. `Settings.tsx` contains `href="#/llm"`. Inputs use class `field`.

- [ ] **Step 1: Extend the failing test**

Add the five files to the scanner in `no-bulma.test.ts`. Assert `Settings.tsx` includes `href="#/llm"`.

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run src/pages/no-bulma.test.ts`
Expected: FAIL on Bulma classes in Settings, player, or NotFound.

- [ ] **Step 3: Restyle without changing behavior**

Keep save, import, export, set logging, and cardio create handlers. Swap only class names and wrappers to `glass`, `field`, `btn`, and `btn-primary`. Add `Apri il ponte LLM` with `href="#/llm"` on Impostazioni, beside the existing local LLM fields. NotFound link back to `#/` uses `btn btn-primary` and the words `Torna a Oggi`.

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run src/pages/no-bulma.test.ts`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add src/pages/no-bulma.test.ts src/pages/WorkoutPlayer.tsx src/pages/Cardio.tsx src/pages/LlmBridge.tsx src/pages/Settings.tsx src/pages/NotFound.tsx
git commit -m "feat: glass forms, player, and LLM links"
```

### Task 7: Suite

**Files:**
- Modify: only files the suite proves still import Bulma classes. No new feature.

**Interfaces:**
- Consumes: all previous tasks
- Produces: a green typecheck, unit suite, and build

- [ ] **Step 1: Run the gates**

Run: `npx tsc -b --noEmit`
Expected: exit 0

Run: `npx vitest run`
Expected: all tests PASS

Run: `npm run build`
Expected: exit 0 and a `dist/` bundle

- [ ] **Step 2: Fix only what those commands report**

If a test still looks for `navbar`, `bottom-nav-item` without the new classes, or Bulma, update the assertion to the class this plan produced. Do not weaken a Task 1–6 assertion to hide a missing token.

- [ ] **Step 3: Commit if Step 2 changed files**

```bash
git add -u
git commit -m "test: align suite with glass chrome"
```

Skip the commit if Step 2 changed nothing.
