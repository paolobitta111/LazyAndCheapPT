# Sheet "Scheda" e Calendario iOS — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Il form Nuova/Modifica scheda diventa una sheet modale iOS (righe inset, segmented control, sotto-vista esercizi) e il Calendario guadagna gruppo inset + bottom sheet con grabber, secondo `docs/superpowers/specs/2026-10-27-schede-sheet-calendario-design.md`.

**Architecture:** Estensione di `src/styles/glass.css` (nuovi controlli: segmented, pill toggle, sheet-nav, grabber, sheet-bottom, backdrop condiviso, gruppi annidati) + riscrittura di `PlanForm.tsx` come sheet modale con sotto-vista, riorganizzazione di `MonthCalendar` (griglia nel gruppo, nav fuori), conversione di `AssignModal`/`DaySummaryModal` a bottom sheet. Nessun nuovo modello dati, nessuna dipendenza.

**Tech Stack:** React 19 + TypeScript strict, plain CSS, Vitest + Testing Library, Playwright (solo screenshot).

**Spec:** `docs/superpowers/specs/2026-10-27-schede-sheet-calendario-design.md` (approvata dall'utente il 27/10/2026)

## Global Constraints

- Dark-only; system font; nessuna nuova dipendenza.
- Raggi solo da `--r-card (26px)/--r-inner (12px)/--r-pill`; font-size solo dalla type scale `.t-*`.
- Copy italiano nei dati; etichette UI nuove ammesse: Annulla, Salva, Dettaglio/Esercizi, Aggiungi esercizio, Aggiungi data, Aggiungi, Rimuovi, Forza, Altro.
- Nessuna transizione/animazione nuova (reduced-motion per costruzione).
- `env(safe-area-inset-bottom)` rispettata nelle bottom sheet.
- Z-index sheet modali: 60. Barre restano a 20.
- Branch: si continua su `feature/liquid-glass-fidelity` (l'utente ha chiesto di completare questo PRIMA del merge).

## Review Focus

1. **Salva disabilitato senza nome**: aperto il form su una scheda nuova, Salva deve essere `disabled` finché il nome è vuoto. *Pinned da:* assertion `disabled` in `Plans.test.tsx` (Task 2).
2. **Sotto-vista esercizio non perde la bozza**: modificare il nome nel dettaglio, tornare con "‹ Esercizi" e salvare deve persistere il valore; solo "Annulla" scarta. *Pinned da:* flusso di test in `Plans.test.tsx` (Task 2).
3. **Bottom sheet e safe-area**: la sheet ancorata in basso ha `padding-bottom: max(1rem, env(safe-area-inset-bottom))` e angoli inferiori vivi. *Pinned da:* string test su `.sheet-bottom` (Task 1).
4. **Stacking**: le sheet modali devono stare sopra barre (z 20) e menu (z 3). *Pinned da:* assertion `zIndex` '60' sul backdrop (Task 4).
5. **Zero transizioni nuove**: `.seg-item`, `.pill`, `.grabber` non portano `transition`. *Pinned da:* regex not-contains sui blocchi (Task 1).

---

### Task 1: Controlli e materiali sheet (`glass.css`)

**Files:**
- Modify: `src/styles/glass.css`
- Modify: `src/styles/glass.css.test.ts`

**Interfaces:**
- Consumes: token esistenti (`--r-inner`, `--r-pill`, `--surface-2`, `--label-2`, `--tint`, `#160b07` recipe di `.btn-tint`).
- Produces (Task 2–4 usano questi nomi esatti):
  - token `--fill: rgba(118, 118, 128, 0.24)` (traccia dei controlli iOS)
  - `.sheet .group { border-radius: var(--r-inner) }` — gruppi dentro le sheet
  - `.group .group { border-radius: var(--r-inner) }` — gruppi annidati nelle pagine (chiude F-6: Settings preview, LlmBridge pre)
  - `.sheet-backdrop { position: fixed; inset: 0; background: rgba(0,0,0,.6); display: flex; align-items: flex-end; justify-content: center; z-index: 60; }` + `@media (min-width: 48rem) { .sheet-backdrop { align-items: center } }`
  - `.sheet-nav { display: flex; align-items: center; gap: 0.5rem; } .sheet-nav .t-head { flex: 1; text-align: center; }`
  - `.grabber { width: 34px; height: 4px; border-radius: var(--r-pill); background: var(--label-3); margin: 0 auto 0.5rem; flex: none; }`
  - `.sheet-bottom { border-radius: var(--r-card) var(--r-card) 0 0; padding-bottom: max(1rem, env(safe-area-inset-bottom)); }` + `@media (min-width: 48rem) { .sheet-bottom { border-radius: var(--r-card); padding-bottom: 1rem; } .sheet-bottom .grabber { display: none } }`
  - `.seg { display: flex; background: var(--fill); border-radius: var(--r-inner); padding: 2px; gap: 2px; }`
  - `.seg-item { flex: 1; text-align: center; padding: 0.35rem 0; font: inherit; font-size: 0.8125rem; color: var(--label-2); background: none; border: 0; border-radius: 9px; cursor: pointer; }` e `.seg-item[aria-pressed='true'] { background: var(--surface-2); color: var(--label); font-weight: 600; }`
  - `.pill { min-width: 2rem; flex: 1; padding: 0.35rem 0; font-size: 0.8125rem; }` e `.pill[aria-pressed='true'] { background: var(--tint); color: #160b07; border-color: transparent; font-weight: 700; }`

- [ ] **Step 1 (RED):** in `glass.css.test.ts` aggiungi un test `adds the sheet and iOS control classes` con string-pin di: `--fill: rgba(118, 118, 128, 0.24)`, `.sheet .group {`, `.group .group {`, `border-radius: var(--r-card) var(--r-card) 0 0`, `max(1rem, env(safe-area-inset-bottom))`, `@media (min-width: 48rem)`, e per ognuno dei blocchi `.seg-item {`, `.pill {`, `.grabber {` (estratti con `/\.nome\s*\{[^}]*\}/`) `not.toContain('transition')`.

- [ ] **Step 2:** Run `npx vitest run src/styles/glass.css.test.ts` — Expected: FAIL.

- [ ] **Step 3 (GREEN):** implementa le regole della sezione Interfaces in `glass.css` (sezione `/* ---- controlli iOS ---- */` dopo `.badge`).

- [ ] **Step 4:** Run `npx vitest run src/styles/glass.css.test.ts` — Expected: PASS.

- [ ] **Step 5:** Commit: `feat(ui): controlli iOS e materiali sheet - seg, pill, grabber, sheet-bottom`

### Task 2: PlanForm → sheet modale con sotto-vista

**Files:**
- Modify: `src/components/PlanForm.tsx` (riscrittura)
- Modify: `src/pages/Plans.test.tsx` (flusso nuovo)
- Modify: `src/pages/Today.tsx` (residui `btn-primary`/`.label` alle righe 127 e 155)

**Interfaces:**
- Consumes: `.sheet-backdrop`, `.sheet`, `.sheet-nav`, `.t-head`, `.group`, `.group-row`, `.seg`/`.seg-item`, `.pill`, `.btn`, `.btn-quiet`, `.field`, `.nums`.
- Produces: `PlanForm(props: { plan?: TrainingPlan; onDone: () => void })` invariata nella firma. Markup: backdrop `div.sheet-backdrop` (onClick chiusura) > `div[role="dialog"][aria-label="Nuova scheda"|"Modifica scheda"].sheet` (`width: min(92vw, 420px)`, `maxHeight: 80vh`, `overflowY: auto`, padding 16px, `onClick` stopPropagation) > `.sheet-nav` (`Annulla` = `.btn-quiet`; titolo `.t-head`; `Salva` = `.btn-quiet` con `disabled={!name.trim()}`) > gruppi:
  1. `.group`: riga Nome (`.group-row` con `<label>` `Nome` + input `.field` senza bordo? NO — input `.field` dentro la riga, aria-label `Nome`), riga Sport: `.seg` con 4 `.seg-item[aria-pressed]` (Forza=strength, Corsa=running, Bici=cycling, Altro=other).
  2. `.group`: `.group-row` con riga di 7 bottoni `.pill[aria-pressed]` (aria-label = nome giorno esteso, testo = lettera L/M/M/G/V/S/D).
  3. `.group`: cap "Esercizi · N" (`.t-cap`, `--label-2`), righe-esercizio = `button.group-row` aria-label `Esercizio N`, contenuto: nome (o `Esercizio N` se vuoto), `S×R`, `Kg` in `.nums`, chevron `›`; ultima riga `+ Aggiungi esercizio` (`.group-row`, testo tint) che aggiunge e apre la sotto-vista.
  4. `.group`: cap "Date specifiche · N"; righe `data .nums` con bottone `×` aria-label `Rimuovi {date}`; riga `+ Aggiungi data` (`.btn-quiet`) che rivela una `.group-row` con input `type="date"` aria-label `Nuova data` + bottone `Aggiungi`.
  - Sotto-vista (stato `editing: number | null`): sostituisce il contenuto sotto la `.sheet-nav`; nav left diventa `‹ Esercizi` (chiamata mia: la convenzione iOS etichetta il back col titolo della schermata precedente, il doc la lasciava "‹ Dettaglio"); titolo `.t-head` = nome esercizio (o `Esercizio N`); Salva resta (inerte, la bozza è già aggiornata); contenuto: `.group` con 4 `.field` (aria-label `Esercizio N nome`, `serie`, `ripetizioni`, `kg`) e bottone `Rimuovi` aria-label `Rimuovi esercizio N` (rimuove e torna alla lista).
  - Nessun `btn-primary`, `.glass`, `.label` residui nel file.

- [ ] **Step 1 (RED):** riscrivi `Plans.test.tsx`:
  - test 1 `creates a scheda via the sheet`: click `Nuova scheda`; `const dialog = view.getByRole('dialog', { name: 'Nuova scheda' })`; Salva `disabled` true; `fireEvent.change(within(dialog).getByLabelText('Nome'), …'Corsa')`; Salva `disabled` false; click `Martedì` (pill); click `+ Aggiungi data`; change `Nuova data` '2026-11-03'; click `Aggiungi`; click `Esercizio 1`; change `Esercizio 1 nome` 'Corsa'; click `‹ Esercizi`; click `Salva`; `await waitFor(() => expect(view.getByText('Corsa')).toBeTruthy())`; `expect(view.getByText('2026-11-03')).toBeTruthy()`; `expect(view.getByText('1 esercizio')).toBeTruthy()`; `expect(view.getByText('M')).toBeTruthy()`.
  - test 2 `edits in place without duplicating the scheda`: come il 1 poi click `Modifica` → dialog `Modifica scheda`, input Nome precompilato 'Corsa', cambia in 'Corsa veloce', Salva, stesse assertion esistenti.
- [ ] **Step 2:** Run `npx vitest run src/pages/Plans.test.tsx` — Expected: FAIL (markup vecchio).
- [ ] **Step 3 (GREEN):** riscrivi `PlanForm.tsx` secondo Interfaces. Mantieni la logica `save()` esistente (mapping rules/exercises invariata).
- [ ] **Step 4:** `src/pages/Today.tsx`: riga 127 `className="label"` → `className="t-cap"` + `style={{ color: 'var(--label-2)' }}`; riga 155 `btn btn-primary` → `btn btn-tint`. Nessun altro tocco a Today.
- [ ] **Step 5:** Run `npx vitest run` — Expected: PASS (aggiorna anche eventuali selettori rotti da dentro-out: solo Plans.test).
- [ ] **Step 6:** Commit: `feat(ui): PlanForm come sheet modale iOS con sotto-vista esercizi`

### Task 3: Calendario nel gruppo

**Files:**
- Modify: `src/components/MonthCalendar.tsx`
- Modify: `src/pages/Calendar.page.test.tsx` (solo aggiunta assertion struttura)

**Interfaces:**
- Consumes: `.group`, `.t-cap`, `.t-foot`, token `--label-2`.
- Produces: `MonthCalendar` renderizza: header mese (`.t-head`, testata `${monthName} ${year}`, bottoni `Mese precedente`/`Mese successivo` invariati) FUORI dal gruppo, poi `<div className="month-group">` con classe `group` contenente griglia + legenda. Props invariate. `fontSize: '12px'` → classi `.t-cap`, `fontSize: '13px'` → `.t-foot` (nelle celle e nella legenda); nessun px residuo nel file.

- [ ] **Step 1 (RED):** in `Calendar.page.test.tsx` test `builds a Monday-first month grid` aggiungi dopo il render di un caso a pagina: assertion `view.container.querySelector('.month-group')` esiste, ha classe `group`, e contiene la griglia (`querySelectorAll('[data-mark]')` vuoto ok ma il nodo griglia `style` con `gridTemplateColumns` dentro il gruppo). Semplice: `const grp = view.container.querySelector('.month-group'); expect(grp).not.toBeNull(); expect(grp).toHaveClass('group'); expect(grp?.querySelector('button[aria-label^="1 "], span')).toBeTruthy()`.
- [ ] **Step 2:** Run `npx vitest run src/pages/Calendar.page.test.tsx` — Expected: FAIL.
- [ ] **Step 3 (GREEN):** riorganizza `MonthCalendar` come da Interfaces (la cella-oggi, selezione, `data-mark` restano identici: i test esistenti sui pallini non devono cambiare).
- [ ] **Step 4:** Run `npx vitest run` — Expected: PASS.
- [ ] **Step 5:** Commit: `feat(ui): griglia calendario nel gruppo inset, nav mese fuori`

### Task 4: Bottom sheet per Assegna e Riepilogo

**Files:**
- Modify: `src/components/AssignModal.tsx`
- Modify: `src/components/DaySummaryModal.tsx`
- Modify: `src/pages/Calendar.page.test.tsx` (solo se un selettore si rompe; i ruoli ARIA non cambiano)

**Interfaces:**
- Consumes: `.sheet-backdrop`, `.sheet-bottom`, `.grabber`, `.t-foot`, `.t-title`, `.btn`, `.btn-tint`.
- Produces: entrambi i modali: root `<div className="sheet-backdrop" onClick={onClose}>` (z-index 60 via classe, niente inline zIndex); sheet `<div role="dialog" aria-label=… className="sheet sheet-bottom" style={{ width: 'min(92vw, 380px)', overflowY: 'auto' }} onClick={stopPropagation}>` con `<div className="grabber" aria-hidden="true" />` in cima. Eyebrow `p.t-foot` (`--label-2`), titolo `h3.t-title`, contenuto invariato; `DaySummaryModal` mantiene bottone `Aggiungi allenamento` (btn-tint) e `Chiudi`.

- [ ] **Step 1 (RED):** in `Calendar.page.test.tsx` aggiungi al test `assigns a scheda to an empty day`: dopo l'apertura, `expect(view.getByRole('dialog', { name: 'Assegna scheda' }).parentElement).toHaveClass('sheet-backdrop')` e `toHaveStyle({ zIndex: '60' })`; e la presenza di `.grabber` dentro il dialog (`dialog.querySelector('.grabber')` truthy). Nota: `getByRole('dialog').parentElement` è il backdrop.
- [ ] **Step 2:** Run `npx vitest run src/pages/Calendar.page.test.tsx` — Expected: FAIL.
- [ ] **Step 3 (GREEN):** converti i due modali come da Interfaces.
- [ ] **Step 4:** Run `npx vitest run` — Expected: PASS.
- [ ] **Step 5:** Commit: `feat(ui): assegna e riepilogo come bottom sheet con grabber`

### Task 5: Screenshot e verifica visiva

**Files:**
- Modify: `scripts/screenshots.spec.mjs`

**Interfaces:**
- Consumes: app completata dai Task 1–4; `playwright.config.ts` esistente.
- Produces: nuove catture `.superpowers/screenshots/`: `scheda-form.png` (dopo click su `Nuova scheda`), `scheda-form-dettaglio.png` (dopo click su `Esercizio 1`), `calendario-assegna.png` (dopo click su un giorno libero), oltre alle 8 esistenti.

- [ ] **Step 1:** estendi `scripts/screenshots.spec.mjs` con i 3 test sopra (stesso pattern: `page.goto`, `waitForTimeout(600)`, interazione via `page.getByRole`, screenshot viewport-only).
- [ ] **Step 2:** Run `npm run shots` — Expected: 11 PNG.
- [ ] **Step 3:** osserva con il tool di lettura le 3 nuove PNG + `schede.png` + `calendario.png`; registra nel ledger i difetti trovati; fix e re-cattura se necessario.
- [ ] **Step 4:** Run `npx vitest run` e `npx tsc -b` — Expected: PASS/clean.
- [ ] **Step 5:** Commit: `test(visual): catture del form sheet e delle bottom sheet del calendario`
