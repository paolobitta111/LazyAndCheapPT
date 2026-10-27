# Liquid Glass UI Fidelity Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Riscrivere l'UI di LazyCheapCoach secondo la direzione B "Vetro reale" (`docs/superpowers/specs/2026-10-27-liquid-glass-fidelity-design.md`): vetro solo sugli strati funzionali, contenuti su materiali opachi, type scale iOS, raggi concentrici, tint interattivo, contenuto che scorre sotto le barre.

**Architecture:** Un riscrittura di `src/styles/glass.css` (token + classi condivise) a cascata su shell (`src/index.css`, `src/App.tsx`), chrome (`BottomNav`), e i componenti con stili inline (`SessionBox`, `MetricCubes`, `SubstituteCombo`, `CheckInModal`, `MonthCalendar`) e superfici lista (`.glass` → `.group`). Nessun nuovo framework; unica dipendenza nuova: `@playwright/test` (devDependency, approvata) per la verifica visiva.

**Tech Stack:** React 19 + TypeScript, Vite 7, plain CSS, Vitest + Testing Library, Playwright (solo screenshot).

**Spec:** `docs/superpowers/specs/2026-10-27-liquid-glass-fidelity-design.md` (visivo: `2026-10-27-liquid-glass-fidelity-mockups.html`)

## Global Constraints

- Dark-only. Nessun light mode.
- Font: solo system stack `-apple-system, BlinkMacSystemFont, system-ui, sans-serif`. Nessun font file.
- Nessun nuovo framework UI o CSS engine. Unica dipendenza nuova: `@playwright/test` (devDependencies).
- Copy italiano invariato; HashRouter; 4 tab (`/`, `/schede`, `/calendario`, `/impostazioni`).
- Min width 375px; `env(safe-area-inset-*)` rispettata; PWA standalone.
- Niente glass su glass: `backdrop-filter` solo su `.glass-bar`, `.sheet`, `.menu`, `.glass` (controllo flottante Timer).
- Header di sezione in title case (niente `text-transform: uppercase`).
- `font-variant-numeric: tabular-nums` su ogni dato numerico.
- Contrasto: corpo ≥ 4.5:1, secondario ≥ 3:1.
- Fallbenti obbligatori: `@supports not (backdrop-filter…)`, `@media (prefers-reduced-motion: reduce)`.
- Nessuna dimensione font fuori scala (scale del §2 della spec); raggi solo da `--r-card/--r-inner/--r-pill`.

## Review Focus

1. **Testo secondario sui glow ambientali** — su 375px il glow caldo in basso non deve ridurre il contrasto di `--label-2` su `--surface`: aspettativa, contrasto ≥ 3:1 ovunque. *Pinned da:* verifica visiva del Task 7 (screenshot 375×812).
2. **Riga azioni di SessionBox con nomi scheda lunghi** (es. "Full Body A · oggi" nel combo) su 375px: i bottoni-testo non devono sovrapporsi. *Pinned da:* assertion presenza `.session-actions` nel test Task 4 + verifica visiva del Task 7 (screenshot 375×812).
3. **Menu Sostituisci aperto sopra contenuto**: z-index del popover resta sopra il contenuto ma sotto le barre. *Pinned da:* assertion CSS `z-index` (Task 4).
4. **Fallback no-backdrop** (browser datati): le superfici restano leggibili con `--glass-fallback`. *Pinned da:* string assertion `@supports not` (Task 1).
5. **Reduced motion / reduced transparency**: nessuna transizione di pill (rimossa), modali senza animazioni intrusive. *Pinned da:* string assertion media query (Task 1).

---

### Task 1: Token system e classi condivise (`glass.css` rewrite)

**Files:**
- Modify: `src/styles/glass.css` (riscrittura completa)
- Modify: `src/styles/glass.css.test.ts`

**Interfaces:**
- Consumes: nulla (primo task).
- Produces (tutti i task successivi usano questi nomi esatti):
  - Token: `--bg: #000`, `--surface: #1c1c1e`, `--surface-2: #2c2c2e`, `--sep: rgba(84, 84, 88, 0.55)`, `--label: #f5f5f7`, `--label-2: rgba(235, 235, 245, 0.6)`, `--label-3: rgba(235, 235, 245, 0.3)`, `--tint: #ff6b4a`, `--tint-press: rgba(255, 107, 74, 0.75)`, `--green: #30d158`, `--red: #ff453a`, `--glass-blur: blur(18px) saturate(180%)`, `--glass-tint: linear-gradient(180deg, rgb(255 255 255 / 0.13), rgb(255 255 255 / 0.05))`, `--glass-border: rgb(255 255 255 / 0.14)`, `--glass-edge: rgb(255 255 255 / 0.32)`, `--glass-highlight: inset 0 1px 0 rgb(255 255 255 / 0.30)`, `--glass-shadow: 0 12px 30px rgb(0 0 0 / 0.45)`, `--r-card: 26px`, `--r-inner: 12px`, `--r-pill: 999px`, `--glass-fallback: rgb(28 28 30 / 0.92)`
  - Classi: `.group` (gruppo contenuto opaco: `background: var(--surface)`, `border-radius: var(--r-card)`, `padding: 1rem`, flex column, gap `0.75rem`), `.group-row` (riga in gruppo: background `transparent`, `border: 0`, `border-top: 1px solid var(--sep)` tranne la prima riga, padding `0.75rem 0`), `.sheet` (vetro modale: `--glass-tint`, `border: 1px solid var(--glass-border)`, `border-top-color: var(--glass-edge)`, `box-shadow: var(--glass-highlight), var(--glass-shadow)`, `--glass-blur`, `border-radius: var(--r-card)`), `.menu` (vetro popover: come `.sheet` ma `border-radius: var(--r-inner)`, blur e ombra), `.glass-bar` (chrome: come `.sheet` ma `border-radius: var(--r-card)`), `.glass` (solo controllo flottante: come `.sheet`), `.badge` (`background: rgba(255,107,74,.16)`, `color: #ff8f73`, `font-size: 0.75rem`, `padding: 3px 9px`, `border-radius: var(--r-pill)`), `.btn` (`background: var(--surface-2)`, `border: 1px solid var(--glass-border)`, `border-radius: var(--r-pill)`, `padding: 0.55rem 1rem`, `color: var(--label)`; `:active { background: #3a3a3c }`), `.btn-tint` (`background: var(--tint)`, `color: #160b07`, `border-color: transparent`, `font-weight: 600`; `:active { background: var(--tint-press) }`), `.btn-quiet` (`background: none`, `border: 0`, `color: var(--tint)`, `font-weight: 500`), `.field` (`background: var(--surface-2)`, `border: 1px solid var(--glass-border)`, `border-radius: var(--r-inner)`, `padding: 0.6rem 0.75rem`, `color: var(--label)`; `:focus-visible { outline: 2px solid var(--tint); outline-offset: 2px }`), type scale: `.t-large { font-size: 2.125rem; font-weight: 700; letter-spacing: -0.02em }`, `.t-title { font-size: 1.375rem; font-weight: 600; letter-spacing: -0.01em }`, `.t-head { font-size: 1.0625rem; font-weight: 600 }`, `.t-body { font-size: 1.0625rem }`, `.t-sub { font-size: 0.9375rem }`, `.t-foot { font-size: 0.8125rem }`, `.t-cap { font-size: 0.75rem }` (tutte `line-height: 1.2`), `.nums { font-variant-numeric: tabular-nums }`, `.fallback` (ErrorBoundary: `background: var(--bg)`, `color: var(--label)`)
  - Rimozioni obbligatorie: `.glass .glass`, `.glass-pill`, regola `@supports (backdrop-filter: url("#liquid-glass"))`, `--ink`, `--ink-text`, `.ink-fallback`, vecchi valori `blur(20px)`, `saturate(160%)`, `0 10px 28px`, `rgb(255 255 255 / 0.10)`, `--ink`/`#0b0b0d` dai token
  - Su `body` (via `glass.css :root` o nuovo seletto `body` nel file): `background: var(--bg)` + due radiali fisse: `background-image: radial-gradient(340px 340px at 110% -10%, rgba(10,132,255,.14), transparent 65%), radial-gradient(360px 360px at -15% 105%, rgba(255,107,74,.12), transparent 62%)`, `background-attachment: fixed`

- [ ] **Step 1: Riscrivi il test dei token con i nuovi valori esatti**

In `src/styles/glass.css.test.ts`, sostituisci l'assertione di stringhe con (nomi test a piacere, valori pinnati esatti):

```ts
const css = read('src/styles/glass.css')
for (const token of [
  'blur(18px) saturate(180%)',
  'rgb(255 255 255 / 0.13)',
  'rgb(255 255 255 / 0.05)',
  'rgb(255 255 255 / 0.14)',
  'rgb(255 255 255 / 0.32)',
  'inset 0 1px 0 rgb(255 255 255 / 0.30)',
  '0 12px 30px rgb(0 0 0 / 0.45)',
  'rgb(28 28 30 / 0.92)',
  '--tint: #ff6b4a',
  '--surface: #1c1c1e',
  '--surface-2: #2c2c2e',
  '--r-card: 26px',
  '--r-inner: 12px',
  '@supports not ((-webkit-backdrop-filter: blur(1px)) or (backdrop-filter: blur(1px)))',
  '@media (prefers-reduced-motion: reduce)',
]) {
  expect(css).toContain(token)
}
expect(css).not.toContain('blur(20px)')
expect(css).not.toContain('.glass .glass')
expect(css).not.toContain('glass-pill')
expect(css).not.toContain('url("#liquid-glass")')
expect(css).not.toContain('#0b0b0d')
expect(css).toMatch(/\.group\s*\{[^}]*background:\s*var\(--surface\)/)
expect(css).not.toMatch(/\.group\s*\{[^}]*backdrop-filter/)
```

Mantieni invariati i test esistenti su font system stack (index.css) e `min(32rem` — tornano nel Task 2.

- [ ] **Step 2: Run per verificare il fallimento**

Run: `npx vitest run src/styles/glass.css.test.ts`
Expected: FAIL (i valori attuali non combaciano).

- [ ] **Step 3: Riscrivi `src/styles/glass.css`** con i token e le classi della sezione Interfaces. Niente altro: le regole shell/bars restano in `index.css` (Task 2).

- [ ] **Step 4: Run per verificare il pass**

Run: `npx vitest run src/styles/glass.css.test.ts`
Expected: PASS. (Altri test UI possono fallire in questo stato — accettabile solo per questo task; dai Task 2 in poi la suite è verde a ogni commit.)

- [ ] **Step 5: Commit**

```bash
git add src/styles/glass.css src/styles/glass.css.test.ts
git commit -m "feat(ui): token system B - materiali opachi, vetro funzionale, type scale iOS"
```

### Task 2: Shell edge-to-edge, barra superiore, large title

**Files:**
- Modify: `src/index.css`
- Modify: `src/App.tsx`
- Modify: `src/pages/Today.tsx` (aggiunge `<h1>Oggi</h1>` e stila `.today-date`)
- Modify: `src/pages/Calendar.tsx` (aggiunge `<h1>Calendario</h1>`)
- Modify: `src/styles/glass.css.test.ts` (assertioni layout)

**Interfaces:**
- Consumes: token/classi del Task 1.
- Produces: `App.tsx` renderizza `.layout-shell[data-scrolled="true|false"]`; la barra mostra `<p className="bar-title">{pageTitle(pathname)}</p>` (sostituisce `<h1>`); `pageTitle()` resta esportata invariata. Ogni pagina principale ha il proprio `<h1>` (large title) nel contenuto: Today "Oggi", Calendar "Calendario" (le altre già li hanno: Plans, History, Cardio, LlmBridge, Settings, NotFound). WorkoutPlayer mantiene i propri `<h1>` esistenti.

- [ ] **Step 1: Aggiorna `glass.css.test.ts` con le nuove assert di layout**

```ts
const index = read('src/index.css')
expect(index).not.toContain('bulma')
expect(index).toContain('-apple-system, BlinkMacSystemFont, system-ui, sans-serif')
expect(index).toMatch(/\.main-content\s*\{[^}]*width:\s*min\(32rem/)
expect(index).not.toMatch(/\.layout-shell\s*\{[^}]*padding:\s*5\.25rem/)
expect(index).toMatch(/header\.glass-bar,\s*nav\.glass-bar\s*\{[^}]*position:\s*fixed/)
expect(index).toMatch(/\.bar-title\s*\{[^}]*opacity:\s*0/)
expect(index).toMatch(/\[data-scrolled="true"\][^{]*\.bar-title\s*\{[^}]*opacity:\s*1/)
expect(index).toMatch(/env\(safe-area-inset-bottom\)/)
expect(index).not.toMatch(/text-transform:\s*uppercase/)
```

- [ ] **Step 2: Run** `npx vitest run src/styles/glass.css.test.ts` — Expected: FAIL.

- [ ] **Step 3: Implementa in `index.css`**

- `.layout-shell`: niente padding-barriera (`5.25rem … 6.5rem` eliminato); `min-height: 100dvh`.
- `body { background: var(--bg); color: var(--label); }` (via token, niente hex).
- `.main-content`: `width: min(32rem, 100%); margin-inline: auto; padding: calc(env(safe-area-inset-top) + 4.5rem) 1rem calc(env(safe-area-inset-bottom) + 6.5rem);` (il contenuto parte sotto la barra ma il resto scorre sotto; la coda lascia passare il contenuto sotto la tab bar). Gap colonna invariato `1.25rem`.
- `.main-content h1 { margin: 0; font-size: 2.125rem; font-weight: 700; letter-spacing: -0.02em; }` (large title; la classe `.t-large` resta per usi espliciti).
- `.main-content h2 { margin: 0.75rem 0 0; font-size: 0.8125rem; font-weight: 600; color: var(--label-2); }` (title case, niente uppercase).
- `.today-date { font-size: 0.9375rem; color: var(--label-2); }`.
- `header.glass-bar, nav.glass-bar`: fixed come oggi, ma `width: min(32rem, calc(100% - 1.5rem))` resta, e aggiungi `padding-top: max(0.5rem, env(safe-area-inset-top))` rispettivamente `padding-bottom: max(0.5rem, env(safe-area-inset-bottom))` dove serve; `.bar-title { opacity: 0; transition: opacity 200ms ease; margin: 0; font-size: 1.0625rem; font-weight: 600; }`; `[data-scrolled="true"] .bar-title { opacity: 1 }`; scroll-edge: implementare lo shade come gradiente nel `background` composito delle barre (`linear-gradient(180deg, rgba(0,0,0,.35), transparent 60%)` sotto il tint, via doppio background).
- Togli le regole h1 1.35rem e h2 uppercase esistenti.

- [ ] **Step 4: `App.tsx`** — hook scroll nel `LayoutShell`:

```tsx
const [scrolled, setScrolled] = useState(false)
useEffect(() => {
  const onScroll = () => setScrolled(window.scrollY > 40)
  window.addEventListener('scroll', onScroll, { passive: true })
  onScroll()
  return () => window.removeEventListener('scroll', onScroll)
}, [])
```

Render: `<div className="layout-shell" data-scrolled={scrolled ? 'true' : 'false'}>` e nella barra `<p className="bar-title">{pageTitle(location.pathname)}</p>` + bottone LLM invariato. Aggiorna `src/pages/App.test.tsx`: l'assert `header h1` diventa `header .bar-title` (stesso testo atteso).

- [ ] **Step 5: Pagine** — `Today.tsx`: dentro il div di ritorno, prima della data, `<h1>Oggi</h1>`; `Calendar.tsx`: `<h1>Calendario</h1>` in cima al div di ritorno. Le altre pagine hanno già h1.

- [ ] **Step 6: Run** `npx vitest run` — Expected: PASS (dopo eventuali fix ai selettori test come sopra).

- [ ] **Step 7: Commit**

```bash
git add src/index.css src/App.tsx src/pages/Today.tsx src/pages/Calendar.tsx src/styles/glass.css.test.ts src/pages/App.test.tsx
git commit -m "feat(ui): shell edge-to-edge, large title, barra con titolo contestuale"
```

### Task 3: BottomNav tint (niente droplet)

**Files:**
- Modify: `src/components/BottomNav.tsx`
- Modify: `src/components/BottomNav.test.tsx`
- (CSS già in Task 1/2: `nav.glass-bar button.active { color: var(--tint) }` — se non già presente nel rewrite del Task 2, aggiungerla qui a `glass.css` o `index.css` dove risulta più coerente col codice circostante.)

**Interfaces:**
- Consumes: token `--tint`, classe `.glass-bar`.
- Produces: `BottomNav` senza `.glass-pill`; bottone attivo `className="active"` con `color: var(--tint)` via CSS.

- [ ] **Step 1: Aggiorna `BottomNav.test.tsx`**

Sostituisci le assert droplet con:

```ts
expect(oggi).toHaveClass('active')
expect(oggi.querySelector('.glass-pill')).toBeNull()
```

(test name aggiornato: 'shows four tabs with a tinted active state').

- [ ] **Step 2: Run** `npx vitest run src/components/BottomNav.test.tsx` — Expected: FAIL (`.glass-pill` ancora renderizzato).

- [ ] **Step 3: Implementa** — rimuovi da `BottomNav.tsx` la riga `{active ? <span className="glass-pill" ... /> : null}` e lo span import inutilizzato se presente. Assicurati che il CSS abbia `nav.glass-bar button.active { color: var(--tint); }` e `nav.glass-bar button { color: var(--label-2); background: none; border: 0; }`.

- [ ] **Step 4: Run** `npx vitest run src/components/BottomNav.test.tsx` — Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/components/BottomNav.tsx src/components/BottomNav.test.tsx
git commit -m "feat(ui): tab attiva con tint, rimozione droplet glass-on-glass"
```

### Task 4: Componenti con stili inline → classi condivise

**Files:**
- Modify: `src/components/SessionBox.tsx`, `src/components/MetricCubes.tsx`, `src/components/SubstituteCombo.tsx`, `src/components/CheckInModal.tsx`, `src/components/MonthCalendar.tsx`, `src/components/AssignModal.tsx`, `src/components/DaySummaryModal.tsx`, `src/pages/Today.tsx` (pannello salute)
- Modify: `src/styles/glass.css` (classi `.group-half`, `.hairline-v` se serve, `.checkin-*` migrate)

**Interfaces:**
- Consumes: `.group`, `.group-row`, `.sheet`, `.menu`, `.btn-tint`, `.btn-quiet`, `.badge`, `.t-*`, `.nums`.
- Produces: 
  - `MetricCubes`: markup = `<div className="metrics-row">` con due `<div className="group group-half">` separati da bordo sinistro `1px solid var(--sep)` sul secondo; righe metrica `.t-sub .nums` con icone 17px.
  - `SessionBox`: root `<section className="group">`; titolo `h3.t-title`; badge `span.badge`; descrizione `p.t-sub` color `var(--label-2)`; azioni: `<div className="session-actions">` con `flex-wrap: wrap`, `Salta`/`SubstituteCombo` come `.btn` (combo resta dropdown), `AI Check-In` come `.btn-tint`.
  - `SubstituteCombo`: popover root `className="menu substitute-menu"` con `position: absolute; bottom: 100%; max-height: 132px; overflow: hidden; z-index: 3;` e item `button.menu-item` (`border-bottom: 1px solid var(--sep)`, `font-size: 0.8125rem`, `font-weight: 600`).
  - `CheckInModal`/`AssignModal`/`DaySummaryModal`: backdrop `rgba(0,0,0,.6)` invariato, dialog root `className="sheet"` (+ classi esistenti `checkin-dialog`/`day-modal`), eyebrow `p.t-foot` `var(--label-2)`, h3 `t-title`, bubble utente `background: var(--tint); color: #160b07`, bubble assistant `background: var(--surface-2); color: var(--label)`, send button `.btn-tint` circolare 40px, pannello offline `background: var(--surface-2); border-radius: var(--r-inner)` senza bordo.
  - `MonthCalendar`: cella oggi `boxShadow: inset 0 0 0 1.5px var(--tint)`, selezionata `background: rgba(255,107,74,.14)`, resto invariato (pallini sport: unica eccezione decorativa, colori invariati); legenda e giorni settimana `font-size: 0.75rem; color: var(--label-2)`.
  - `Today.tsx` pannello salute: `className="group"` (tutto il resto invariato).

- [ ] **Step 1: Test di struttura**

In un nuovo `src/components/groups.test.tsx`:

```tsx
import { render } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { MetricCubes } from './MetricCubes'
import { SessionBox } from './SessionBox'

describe('material consolidation', () => {
  it('MetricCubes renders one group with two halves and no inline glass styles', () => {
    const { container } = render(
      <MetricCubes weather={{ tempC: 18, wind: 12 }} health={{}} onEditHealth={() => undefined} />,
    )
    expect(container.querySelector('.metrics-row')).not.toBeNull()
    expect(container.querySelectorAll('.group-half')).toHaveLength(2)
    expect(container.innerHTML).not.toContain('rgba(255,255,255,.10)')
  })

  it('SessionBox uses group, badge and tint CTA', () => {
    const { container } = render(
      <SessionBox plan={{ planId: 'p', name: 'Full Body A', description: 'd' }} schede={[]} onSkip={() => undefined} onSelect={() => undefined} onCheckIn={() => undefined} onOpen={() => undefined} />,
    )
    const root = container.querySelector('section') as HTMLElement
    expect(root).toHaveClass('group')
    expect(root.querySelector('.badge')?.textContent).toBe('Previsto')
    expect(root.querySelector('.btn-tint')?.textContent).toBe('AI Check-In')
    expect(root.querySelector('.session-actions')).not.toBeNull()
    expect(root.innerHTML).not.toContain('fontSize')
  })

  it('SubstituteCombo menu uses the shared menu class', () => {
    const { container } = render(
      <SubstituteCombo schede={[{ planId: 'b', name: 'Upper B', description: '' }]} currentId="a" open onToggle={() => undefined} onSelect={() => undefined} />,
    )
    expect(container.querySelector('.substitute-menu')).toHaveClass('menu')
  })
})
```

(import `SubstituteCombo` dove serve; adatta i props ai tipi esistenti — `SessionBoxPlan` richiede anche `description`).

- [ ] **Step 2: Run** `npx vitest run src/components/groups.test.tsx` — Expected: FAIL.

- [ ] **Step 3: Implementa** i cambiamenti elencati in Interfaces (sostituisci gli oggetti `style` inline con le classi; le uniche style-prop residue ammesse sono layout contestuali senza equivalente di classe, mai materiali/colori/radii/font-size).

- [ ] **Step 4: Run** `npx vitest run src/components/groups.test.tsx src/pages/Today.test.tsx` — Expected: PASS (fix Today.test se asserisce markup rimosso; conserva le asserzioni comportamentali).

- [ ] **Step 5: Commit**

```bash
git add src/components/SessionBox.tsx src/components/MetricCubes.tsx src/components/SubstituteCombo.tsx src/components/CheckInModal.tsx src/components/MonthCalendar.tsx src/components/AssignModal.tsx src/components/DaySummaryModal.tsx src/components/groups.test.tsx src/pages/Today.tsx src/styles/glass.css
git commit -m "feat(ui): componenti inline su classi condivise; gruppi opachi, menu vetro, tint"
```

### Task 5: Superfici di lista e pagine rimanenti

**Files:**
- Modify: `src/components/ExerciseSetRow.tsx`, `src/components/ExerciseRow.tsx`, `src/components/HistoryItem.tsx`, `src/components/SessionCard.tsx`, `src/components/Timer.tsx`, `src/pages/Plans.tsx`, `src/pages/History.tsx`, `src/pages/Cardio.tsx`, `src/pages/Settings.tsx`, `src/pages/LlmBridge.tsx`, `src/pages/NotFound.tsx`, `src/pages/WorkoutPlayer.tsx`
- Modify: `src/components/glass-cards.test.tsx`

**Interfaces:**
- Consumes: `.group`, `.group-row`, `.glass` (solo Timer), `.t-*`, `--green/--red`.
- Produces: componenti riga con root `className="group-row"` (ExerciseRow, ExerciseSetRow, HistoryItem, SessionCard); le pagine che li elencano li avvolgono in `<div className="group">`. `Timer` root resta `className="glass"` (controllo flottante). Cardio: classi Bulma residue `.mb-3`/`.has-text-danger`/`.has-text-success` → `.text-up` (`color: var(--green)`)/`.text-down` (`color: var(--red)`) + margini con classi `.t-*`/gap.

- [ ] **Step 1: Aggiorna `glass-cards.test.tsx`**

```tsx
describe('content rows and floating controls', () => {
  it('renders list rows inside groups, not glass', () => {
    expect(rootClass(<SessionCard title="Panca" status="active" />)).toContain('group-row')
    expect(rootClass(<HistoryItem date="25 ott" type="workout" duration="45 min" />)).toContain('group-row')
    expect(rootClass(<ExerciseRow name="Panca" sets={4} reps={10} weight="60 kg" />)).toContain('group-row')
  })
  it('keeps the timer as a floating glass control', () => {
    const started = new Date('2026-10-25T08:00:00.000Z')
    const ended = new Date(started.getTime() + 60 * 60 * 1000)
    expect(rootClass(<Timer startedAt={started.toISOString()} targetEndAt={ended.toISOString()} />)).toContain('glass')
  })
})
```

(conserva i test field/aria-label e l'assert ErrorBoundary `.ink-fallback` così com'è — cambia nel Task 6 insieme al componente.)

- [ ] **Step 2: Run** `npx vitest run src/components/glass-cards.test.tsx` — Expected: FAIL.

- [ ] **Step 3: Implementa**: righe → `.group-row` (stessi contenuti); pagine: `.glass` → `.group` (Plans article, Settings, Cardio risultati, LlmBridge reminder/preview `p.glass`/`pre.glass` → `.group .t-foot` / `.group .t-cap .nums` con `overflow-x: auto; white-space: pre-wrap;`, NotFound); avvolgi gli elenchi di righe in `.group`; WorkoutPlayer: i tre blocchi `.glass` (linee 97/152/160) → `.group`, e il blocco con `Timer` (linea 97: verificare a lettura quale contiene il Timer) mantiene il Timer interno in `.glass`. Cardio: sostituisci le classi Bulma.

- [ ] **Step 4: Run** `npx vitest run` — Expected: PASS (fix selettori test che indicavano `.glass` su righe; conserva asserzioni comportamentali).

- [ ] **Step 5: Commit**

```bash
git add -A src/components src/pages
git commit -m "feat(ui): liste come gruppi inset con hairline; timer controllo flottante"
```

### Task 6: Colori PWA, ErrorBoundary, README

**Files:**
- Modify: `public/manifest.json`, `vite.config.ts`, `index.html`, `src/components/ErrorBoundary.tsx`, `README.md`, `src/styles/glass.css.test.ts`

**Interfaces:**
- Consumes: `.fallback` (Task 1), `--bg`.
- Produces: theme PWA `#000` ovunque; `.ink-fallback` eliminato.

- [ ] **Step 1: Aggiorna il test** — in `glass.css.test.ts` sostituisci il test "sets the status bar to ink" con:

```ts
expect(manifest).toContain('"theme_color": "#000000"')
expect(manifest).toContain('"background_color": "#000000"')
expect(vite).toContain("theme_color: '#000000'")
expect(vite).toContain("background_color: '#000000'")
expect(read('index.html')).toContain('<meta name="theme-color" content="#000000" />')
expect(css).not.toContain('--ink')
expect(css).not.toContain('ink-fallback')
```

- [ ] **Step 2: Run** — Expected: FAIL.

- [ ] **Step 3: Implementa**: `#0b0b0d` → `#000000` nei tre file PWA; `ErrorBoundary.tsx`: `ink-fallback` → `fallback`; `README.md`: riga stack con "Bulma CSS" → "React 19, plain CSS design tokens (Vite, PWA)".

- [ ] **Step 4: Run** `npx vitest run` — Expected: PASS (intera suite verde).

- [ ] **Step 5: Commit**

```bash
git add public/manifest.json vite.config.ts index.html src/components/ErrorBoundary.tsx README.md src/styles/glass.css.test.ts
git commit -m "chore(ui): pwa/theme su nero puro, fallback rinominato, readme aggiornato"
```

### Task 7: Screenshot Playwright e verifica visiva

**Files:**
- Create: `playwright.config.ts`, `scripts/screenshots.mjs`
- Modify: `package.json` (devDependency `@playwright/test`), `.gitignore` (se `.superpowers/` non ignorato)

**Interfaces:**
- Consumes: app completata dai Task 1–6.
- Produces: `npm run shots` → screenshot PNG in `.superpowers/screenshots/` a 375×812 per le route `/`, `/schede`, `/calendario`, `/storico`, `/cardio`, `/llm`, `/impostazioni` + una pagina `/workout/…` se raggiungibile senza dati (in caso contrario si documenta l'assenza).

- [ ] **Step 1: Installa** `npm install -D @playwright/test` e `npx playwright install chromium` (dipendenza approvata nel design doc).

- [ ] **Step 2: `playwright.config.ts`** — `testDir: './scripts'`, `webServer: { command: 'npm run dev', url: 'http://localhost:5173', reuseExistingServer: true }`, `use: { viewport: { width: 375, height: 812 }, deviceScaleFactor: 2 }`.

- [ ] **Step 3: `scripts/screenshots.mjs`** — naviga le route elencate, `page.screenshot({ fullPage: true, path: '.superpowers/screenshots/<nome>.png' })` per ognuna; script eseguito con `node scripts/screenshots.mjs` dopo `npm run dev &` oppure come test playwright `page.goto`.

- [ ] **Step 4: `.gitignore`** — assicura `node_modules/` e `.superpowers/screenshots/` ignorati.

- [ ] **Step 5: Run** `npm run shots` — Expected: 7+ PNG generati.

- [ ] **Step 6: Commit**

```bash
git add playwright.config.ts scripts/screenshots.mjs package.json package-lock.json .gitignore
git commit -m "test(visual): screenshot playwright delle pagine per accettazione visiva"
```

- [ ] **Step 7: Verifica visiva (umana + review finale)** — il risultato va osservato: avvio `npm run dev` per l'utente, review dell'intero branch con subagent fresco contro i criteri di accettazione del design doc (§ Criteri di accettazione visiva). Nessuna affermazione di successo visivo senza screenshot effettivamente esaminati.
