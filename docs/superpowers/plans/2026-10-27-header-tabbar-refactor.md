# Header: large title + ingranaggio, tab bar a 3 — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** A riposo nessuna capsula vuota in alto: large title di pagina + glifo ⚙ sulla stessa riga; allo scroll la capsula di vetro si attiva col titolo compatto; tab bar a 3 tab (Oggi, Schede, Calendario); Impostazioni solo dal ⚙; LLM come riga dentro Impostazioni; rotte orfane `/storico` e `/cardio` eliminate.

**Architecture:** L'header resta un unico `header.glass-bar` fisso che cambia stile con `data-scrolled` (già in `App.tsx`): lo stato a riposo diventa trasparente via CSS, il bottone LLM diventa il glifo `impostazioni` di `NavIcon` → `/impostazioni`. BottomNav perde la quarta tab. Settings guadagna una riga `.group-row` "Scambio LLM" → `/llm`. Le pagine History e Cardio (e `CardioLogService`) si eliminano; il modello dati cardio resta (Calendario e backup lo usano).

**Tech Stack:** React 19 + TypeScript strict, plain CSS, Vitest + Testing Library, Playwright (solo screenshot).

**Spec:** `docs/superpowers/specs/2026-10-27-header-tabbar-refactor-design.md` (approvata dall'utente il 27/10/2026, assetto A3)

## Global Constraints

- Dark-only; system font; nessuna nuova dipendenza.
- Raggi solo da `--r-card/--r-inner/--r-pill`; font-size solo dalla type scale `.t-*`.
- Vetro solo per strati funzionali: lo stato a riposo dell'header è trasparente, quello scrollato resta capsula di vetro.
- Un solo glifo ⚙ nell'header in entrambi gli stati; mai due.
- Nessuna transizione nuova (quella esistente su `.bar-title` resta).
- Il modello dati cardio non cambia: `cardioLogs`/`gpxAttachments` in `db.tsx`, `backup-zip`, `planning.service` invariati.

## Review Focus

1. **Il ⚙ resta presente anche a scroll** e non esiste in doppio. *Pinned da:* `App.test.tsx` (Task 2): esattamente un bottone `aria-label="Impostazioni"` nell'header e nessun secondo nel DOM.
2. **Stato a riposo trasparente anche con fallback/reduced-transparency** (i media `@supports` e `prefers-reduced-transparency` di glass.css riempiono `.glass-bar`): la regola rest-state deve vincere per specificità. *Pinned da:* pin stringa in `glass.css.test.ts` (Task 1).
3. **Allineamento h1/⚙ sulla stessa riga visiva**: il padding-top del contenuto porta il centro dell'`h1` sul centro del ⚙. *Pinned da:* pin stringa `calc(env(safe-area-inset-top) + 1.1rem)` (Task 1).
4. **I pallini cardio del Calendario sopravvivono alla rimozione della pagina Cardio.** *Pinned da:* test esistente `Calendar.page.test.tsx` `shows done and planned marks…` con sport `cycling` — non si modifica; la suite verde lo prova a ogni task.
5. **`/llm` raggiungibile da Impostazioni.** *Pinned da:* test navigazione in `Settings.test.tsx` (Task 4).

---

### Task 1: CSS stato a riposo dell'header (`index.css`)

**Files:**
- Modify: `src/index.css` (dopo il blocco `header.glass-bar` e del `.bar-title`)
- Modify: `src/styles/glass.css.test.ts` (pin in `adds the sheet and iOS control classes`)

**Interfaces:**
- Consumes: `data-scrolled` già impostato su `.layout-shell` da `App.tsx`; classi `glass-bar`/`bar-title` esistenti.
- Produces (Task 2–5 si affidano a questo): a `data-scrolled="false"` l'header è trasparente (nessun gradiente, nessun bordo, nessuna ombra, nessun blur); a `"true"` torna capsula di vetro com'è oggi. `main-content` padding-top `calc(env(safe-area-inset-top) + 1.1rem)` così il centro dell'`h1` (2.125rem, line-height ~1.2) cade sul centro del ⚙ nella barra (top `0.75rem`, altezza 3.25rem).

- [ ] **Step 1 (RED):** in `glass.css.test.ts` nel test `adds the sheet and iOS control classes` aggiungi i pin: `'.layout-shell[data-scrolled="false"] header.glass-bar'`, `'calc(env(safe-area-inset-top) + 1.1rem)'`, e (regex sul blocco `[data-scrolled="false"] header.glass-bar\s*\{[^}]*\}`) `toContain('background-image: none')`, `toContain('box-shadow: none')`, `toContain('border-color: transparent')`, `toContain('backdrop-filter: none')`.

- [ ] **Step 2:** Run `npx vitest run src/styles/glass.css.test.ts` — Expected: FAIL.

- [ ] **Step 3 (GREEN):** in `index.css` dopo la regola `[data-scrolled="true"] .bar-title` aggiungi:

```css
/* a riposo l'header è trasparente: solo large title + glifo (pattern iOS) */
.layout-shell[data-scrolled="false"] header.glass-bar {
  background-image: none;
  border-color: transparent;
  box-shadow: none;
  -webkit-backdrop-filter: none;
  backdrop-filter: none;
}
```

e in `.main-content` cambia `padding: calc(env(safe-area-inset-top) + 4.5rem) …` in `padding: calc(env(safe-area-inset-top) + 1.1rem) …` (gli altri valori invariati).

- [ ] **Step 4:** Run `npx vitest run src/styles/glass.css.test.ts` — Expected: PASS.

- [ ] **Step 5:** Commit: `feat(ui): header trasparente a riposo, contenuto allineato al glifo`

### Task 2: Header → glifo Impostazioni, via le rotte orfane

**Files:**
- Modify: `src/App.tsx` (import `NavIcon`; bottone LLM → glifo; rotte e `pageTitle` senza `/storico`, `/cardio`)
- Modify: `src/pages/App.test.tsx` (riscrittura)
- Delete: `src/pages/History.tsx`, `src/pages/Cardio.tsx`, `src/pages/Cardio.test.tsx`
- Delete: `src/services/cardio-log.service.ts`, `src/services/cardio-log.service.test.ts`

**Interfaces:**
- Consumes: `NavIcon` (`name="impostazioni"`), `data-scrolled` esistente, regole CSS del Task 1.
- Produces: header = `header.glass-bar` > `.bar-title` + `<button className="btn btn-gear" aria-label="Impostazioni">` (icona `impostazioni`, `filled={false}`) → `navigate('/impostazioni')`. Rotte: `/`, `/schede`, `/calendario`, `/workout/:planId`, `/llm`, `/impostazioni`, `*`. `pageTitle`: via le voci `/storico` e `/cardio`. `tabIds` invariato (contiene già solo le 4 reali tab + `/impostazioni`).

- [ ] **Step 1 (RED):** riscrivi `App.test.tsx`:
  - test 1 `shows a quiet header with the gear and three tabs on Oggi`: header `.bar-title` testo `Oggi`; header contiene esattamente un bottone con `aria-label="Impostazioni"` (`container.querySelectorAll('header button[aria-label="Impostazioni"]')` length 1, e nessun testo `LLM` nell'header); il bottone contiene un `svg`; `nav button` = `['Oggi','Schede','Calendario','Impostazioni']` (questa parte cambia nel Task 3, per ora resta 4); nessun `href` nell'header.
  - test 2 `unknown routes fall back to NotFound`: `renderAt('/storico')` e `renderAt('/cardio')` mostrano il mock NotFound (`vi.mock` di History e Cardio rimossi dal file).
  - test 3 `does not mark a tab active on the LLM route`: invariato (senza l'assert sul testo `LLM` nell'header: ora contiene solo il glifo; assert `button.active` null).
- [ ] **Step 2:** Run `npx vitest run src/pages/App.test.tsx` — Expected: FAIL.
- [ ] **Step 3 (GREEN):** aggiorna `App.tsx` come da Interfaces (rimuovi import History/Cardio, rotte, voci pageTitle; sostituisci il bottone LLM con il glifo). Il glifo riusa la regola `header.glass-bar .btn` esistente: nessun CSS nuovo. Elimina i 5 file in Delete.
- [ ] **Step 4:** Run `npx vitest run` — Expected: PASS (BottomNav.test e screenshot non toccati qui).
- [ ] **Step 5:** Commit: `feat(ui): glifo impostazioni nell'header, rotte storico e cardio rimosse`

### Task 3: Tab bar a 3

**Files:**
- Modify: `src/components/BottomNav.tsx`
- Modify: `src/components/BottomNav.test.tsx`

**Interfaces:**
- Consumes: niente.
- Produces: `navItems` = 3 voci (Oggi, Schede, Calendario). Impostazioni NON è più navigabile dalla barra.

- [ ] **Step 1 (RED):** in `BottomNav.test.tsx` cambia l'array atteso in `['Oggi','Schede','Calendario']` e il nome del test in `shows three tabs with a tinted active state`; aggiungi assertion `expect(container.textContent).not.toContain('Impostazioni')`.
- [ ] **Step 2:** Run `npx vitest run src/components/BottomNav.test.tsx` — Expected: FAIL.
- [ ] **Step 3 (GREEN):** togli la voce `impostazioni` da `navItems`.
- [ ] **Step 4:** Run `npx vitest run` — Expected: PASS.
- [ ] **Step 5:** Commit: `feat(ui): tab bar a tre sezioni tra pari`

### Task 4: Riga "Scambio LLM" in Impostazioni

**Files:**
- Modify: `src/pages/Settings.tsx`
- Create: `src/pages/Settings.test.tsx`

**Interfaces:**
- Consumes: `useNavigate` (react-router-dom), `.group`, `.group-row`, `.t-body`, `.nums`.
- Produces: in cima alla pagina (prima del gruppo stato rete), un gruppo `<div className="group">` con `<button className="group-row" aria-label="Scambio LLM">` che naviga a `/llm`; contenuto: `<span>` testo `Scambio LLM` + `<span className="nums">›</span>` (chevron `--label-2`).

- [ ] **Step 1 (RED):** crea `Settings.test.tsx`: render con `MemoryRouter` (route iniziale `/impostazioni`), click sul bottone `Scambio LLM`; assertion: la navigazione avviene (`routes`/`useLocation` via un componente `Probe` che registra il pathname, oppure assert su `window.history` — scelto: `MemoryRouter` + probe che renderizza il pathname corrente; il click deve portare a `/llm`).
- [ ] **Step 2:** Run `npx vitest run src/pages/Settings.test.tsx` — Expected: FAIL.
- [ ] **Step 3 (GREEN):** aggiungi il gruppo come da Interfaces (import `useNavigate`).
- [ ] **Step 4:** Run `npx vitest run` — Expected: PASS.
- [ ] **Step 5:** Commit: `feat(ui): riga scambio llm dentro impostazioni`

### Task 5: Screenshot e verifica finale

**Files:**
- Modify: `scripts/screenshots.spec.mjs`

**Interfaces:**
- Consumes: app completata dai Task 1–4.
- Produces: catture aggiornate senza `storico`/`cardio`; aggiunta `oggi-riposo.png` (viewport-only, `data-scrolled="false"`, nessuna capsula visibile).

- [ ] **Step 1:** in `scripts/screenshots.spec.mjs` togli le rotte `/storico` e `/cardio` dall'array `routes`; aggiungi il test `screenshot header at rest (viewport only)` su `/` con `page.screenshot` viewport-only in `oggi-riposo.png` (stesso pattern degli altri at-rest: `waitForTimeout(600)`).
- [ ] **Step 2:** Run `npm run shots` — Expected: 7 PNG (5 rotte: oggi, schede, calendario, llm, impostazioni + 2 at-rest: oggi-at-rest, oggi-riposo).
- [ ] **Step 3:** osserva con il tool di lettura `oggi-riposo.png`, `oggi-at-rest.png`, `impostazioni.png`, `llm.png`; registra i difetti nel ledger; fix e re-cattura se necessario.
- [ ] **Step 4:** Run `npx vitest run` e `npx tsc -b` — Expected: PASS/clean.
- [ ] **Step 5:** Commit: `test(visual): catture header a riposo e pulizia rotte orfane`
