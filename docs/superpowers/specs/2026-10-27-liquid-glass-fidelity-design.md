# Liquid Glass UI Fidelity — Design Direction (approved: B "Vetro reale")

**Data:** 2026-10-27
**Status:** approvato come direzione visiva; l'implementazione passa da `writing-plans` dopo l'approvazione di questo doc.
**Sostituisce in parte:** `docs/superpowers/specs/2026-10-25-liquid-glass-ui-design.md` (token e principi; i vincoli tecnici di quel doc restano validi salvo dove qui modificati).

## Intento e perché

L'UI attuale sembra "dashboard generica con blur" non per mancanza di effetti CSS, ma per decisioni di design sbagliate: lo stesso materiale (vetro traslucido) è applicato a tutto — chrome, card, righe annidate, modali — su uno sfondo piatto che nulla rifrange, con tipografia ad hoc, raggi arbitrari e nessun colore con un ruolo. Risultato: sfocatura invisibile, gerarchia appiattita, estetica da dashboard.

Direzione scelta (dopo confronto visivo A/B/C del 2026-10-27, sessione visual companion `.superpowers/brainstorm/22-1793125756`): **B "Vetro reale"** — la disciplina strutturale di A (separazione strato funzionale / strato contenuto) più il materialismo visivo che rende il Liquid Glass riconoscibile (luce ambientale, rifrazione reale, bordo speculare, scroll edge).

**Riferimento visivo commitato:** `docs/superpowers/specs/2026-10-27-liquid-glass-fidelity-mockups.html` — la pagina di confronto A/B/C approvata (apribile nel browser; il telefono "B — Vetro reale" è lo stato visivo di riferimento). Questo documento è la specifica completa; i mockup sono il supporto visivo.

Obiettivo finale: l'app deve sembrare *deliberatamente progettata*, coerente e raffinata — non "più glassy".

## Obiettivi

- Separazione netta tra **strato funzionale** (navigazione, controlli flottanti, overlay — vetro) e **strato contenuto** (dati, liste, form — materiali opachi stratificati).
- Tipografia su scale iOS mappate in rem; intestazioni in title case; numeri tabulari.
- Geometria concentrica e una sola scala raggi.
- Un tint (arancio di marca) con ruolo interattivo, non decorativo.
- Contenuto che scorre sotto le barre con scroll-edge treatment.
- Stati di interazione reali (pressed/hover/focus) sui controlli.

## Non-obiettivi / anti-obiettivi

- Niente light mode (resta dark-only, vincolo dello spec precedente).
- Niente nuovi framework UI o CSS engine; niente font file (system stack: SF Pro su iPhone).
- Niente copia meccanica di componenti iOS: si preservano le convenzioni web/PWA esistenti (HashRouter, 4 tab, copy italiano invariato).
- Anti-obiettivi (failure anche se funziona): glass su glass; blur applicato come decorazione; glow decorativo o animazioni gratuite; raggi oversize uniformi; ombre pesanti ovunque; intestazioni uppercase.
- Non si tocca `Home.tsx` (non routato) né si rifattorizza nulla di non-UI.

## Vincoli

- Stack: React 19 + Vite 7 + plain CSS (`src/index.css` → `src/styles/glass.css`). Nessun Tailwind o component library.
- Min width 375px; PWA standalone portrait; `viewport-fit=cover` già impostato.
- `src/styles/glass.css.test.ts` asserisce stringhe di token esatte: va aggiornato in parallelo ai token.
- Dipendenza nuova approvata dall'utente: **Playwright (devDependency)** per screenshot di accettazione visiva (375×812 + larghezza desktop). Unica dipendenza nuova.
- Contrasto WCAG: corpo testo ≥ 4.5:1, testo secondario ≥ 3:1.

## Approcci considerati

- **A "Strati funzionali"**: separazione materiali + type scale + raggi concentrici, senza effetti di luce. Pro: più sicuro su leggibilità/perf. Contro: il vetro resta poco percepibile su sfondo scuro piatto → l'effetto Liquid Glass si perde.
- **B "Vetro reale"** ✅ *(scelta dell'utente)*: struttura di A + luce ambientale sottile dietro, rifrazione reale delle barre (backdrop-filter su ciò che scorre sotto), bordo speculare, scroll-edge. Contro: qualche punto di attenzione in più su contrasto e performance su device datati — gestito con opacità basse e fallback.
- **C "Rifinitura in loco"**: stessa architettura "tutto vetro", token migliorati. Scartato: il collo di bottiglia è la struttura, non la rifinitura; il risultato resta approssimato (mostrato nei mockup come riferimento del limite).

## Decisioni prese (come costruire)

### 1. Materiali (token da riscrivere in `glass.css`)

```css
:root {
  /* contenuto */
  --bg: #000;
  --surface: #1c1c1e;            /* gruppi: card, liste */
  --surface-2: #2c2c2e;          /* elementi dentro un gruppo */
  --sep: rgba(84, 84, 88, 0.55); /* hairline separatori */
  /* testo */
  --label: #f5f5f7;
  --label-2: rgba(235, 235, 245, 0.6);
  --label-3: rgba(235, 235, 245, 0.3);
  /* tint interattivo */
  --tint: #ff6b4a;
  --tint-press: rgba(255, 107, 74, 0.75);
  /* vetro (solo strato funzionale) */
  --glass-blur: blur(18px) saturate(180%);
  --glass-tint: linear-gradient(180deg, rgb(255 255 255 / 0.13), rgb(255 255 255 / 0.05));
  --glass-border: rgb(255 255 255 / 0.14);
  --glass-edge: rgb(255 255 255 / 0.32);   /* bordo superiore speculare */
  --glass-highlight: inset 0 1px 0 rgb(255 255 255 / 0.30);
  --glass-shadow: 0 12px 30px rgb(0 0 0 / 0.45);
  /* raggi (scala concentrica) */
  --r-card: 26px;   /* gruppi, barre, modali */
  --r-inner: 12px;  /* elementi annidati (≈ raggio − inset, min 10px) */
  --r-pill: 999px;
  /* fallback no-backdrop */
  --glass-fallback: rgb(28 28 30 / 0.92);
}
```

- La luce ambientale: due radial-gradient fisse su `body` (calda in basso-sinistra `rgba(255,107,74,.12)`, fredda in alto-destra `rgba(10,132,255,.14)`), opacità contenute, dietro tutto.
- Scroll-edge: gradiente `transparent → rgba(0,0,0,.55)` dietro le barre, o equivalente, per la leggibilità del contenuto che passa sotto.
- **Colori PWA coerenti col nuovo nero** (`#0b0b0d` → `#000`): `theme_color`/`background_color` in `vite.config.ts` e `public/manifest.json`, `theme-color` in `index.html`, e token `--ink`/`.ink-fallback` (ErrorBoundary) eliminati a favore di `--bg`. `glass.css.test.ts` aggiornato di conseguenza. *Serve a evitare la cucitura visibile status bar/corpo in standalone iOS.*

### 2. Type scale (unica fonte, in `glass.css`)

| Ruolo | rem | peso | note |
|---|---|---|---|
| Large title | 2.125 (34px) | 700 | titolo pagina nel contenuto, tracking −0.02em |
| Title | 1.375 (22px) | 600 | titoli card / modali |
| Headline | 1.0625 (17px) | 600 | etichette forti, bottoni grandi |
| Body | 1.0625 (17px) | 400 | testo principale |
| Subheadline | 0.9375 (15px) | 400 | descrizioni, valori secondari |
| Footnote | 0.8125 (13px) | 400 | etichette di supporto |
| Caption | 0.75 (12px) | 400 | badge, label tab (etichette tab possono restare 0.75rem) |

Regole: nessun `font-size` fuori scala in CSS o inline JSX. Intestazioni di sezione in **title case** (si eliminano le uppercase eyebrows di `index.css:38-45`). `font-variant-numeric: tabular-nums` su tutti i dati numerici.

### 3. Layout / shell

- Fine alla barriera di padding (`5.25rem 0.75rem 6.5rem`): il contenuto scorre edge-to-edge e passa sotto le barre; la spaziatura di rispetto si ottiene con padding interno del contenuto e scroll-edge shade.
- Pattern large-title: ogni pagina principale (Oggi, Schede, Calendario, Impostazioni, Storico, Cardio, LLM) porta il proprio titolo grande nel contenuto. La barra superiore flottante **resta sempre presente** e contiene il bottone LLM (l'accesso LLM non scompare mai); il titolo contestuale compare nella barra solo quando il large title è scrolled-out (piccolo scroll hook JS, compatibile anche con Safari datati; nessuna dipendenza da scroll-driven animations).
- WorkoutPlayer mantiene il proprio header Title-style nel contenuto (non large title), con la barra superiore che lo rispecchia.
- Desktop (~1280px): il contenuto resta in colonna centrata `min(32rem, 100%)` (comportamento attuale, coerente coi test shell). *Chiamata del builder check, non negoziata in mockup.*
- Tab bar flottante in vetro: tab attivo con icona piena + label color tint (niente "droplet pill" glass-on-glass).
- Safe area: `env(safe-area-inset-*)` rispettata su barre e contenuto.

### 4. Controlli

- **CTA primaria**: capsula piena tint, testo scuro ad alto contrasto, pressed = `--tint-press`.
- **Azioni secondarie**: bottoni-testo tint (senza bordi) o capsula `--surface-2` solo dove serve risalto.
- **Chrome-contest** (barre, overlay): capsula vetro con bordo speculare superiore.
- **Field**: `--surface-2`, hairline, focus ring tint; niente outline bianco pieno.
- Stati pressed/hover/focus definiti una volta come classi condivise.

### 5. Consolidamento (punto chiave)

Gli stili glass inline in **`MetricCubes`, `CheckInModal`, `SubstituteCombo`, `MonthCalendar`, `SessionBox`** migrano alle classi condivise; i token diventano l'unica fonte.

- **Le liste diventano gruppi inset**: card separate della stessa lista si fondono in un gruppo `--surface` unico con separatori hairline tra le righe. Vale per le set rows (`ExerciseSetRow`/`ExerciseRow` nel player), `SessionCard`, `HistoryItem` e ogni elenco ripetuto. *Chiamata derivata dai mockup approvati (gruppo metriche a due metà con hairline): è il cambiamento di markup più visibile della direzione.*
- I metric cube "2 cubi vetro" diventano un gruppo `--surface` unico a due metà con hairline (come nei mockup approvati).
- **Timer**: quando è un controllo flottante (player, recovery in corso) resta strato funzionale → **vetro**; le altre superfici di contenuto sono opache.

### 6. Pulizie incluse (piccole, nell'ambito UI)

- Rimuovere la regola `@supports (backdrop-filter: url("#liquid-glass"))` e il riferimento al filtro inesistente (`glass.css:122-126`).
- Le classi Bulma residue in `Cardio.tsx` si sostituiscono quando si tocca quel file (non rifattorizzo dedicato).
- `README.md`: aggiornare la riga "Bulma CSS" con lo stack reale.

### 7. Verifica (Playwright, dipendenza approvata)

- Script screenshot (`scripts/` o `npx playwright`): pagine Oggi, Schede, Calendario, WorkoutPlayer, Storico, Impostazioni, LLM + modali principali, a 375×812 e ~1280 desktop; output in directory ignorata da git.
- Accettazione visiva manuale sulle schermate contro i criteri sotto; i test Vitest esistenti continuano a passare (`glass.css.test.ts` aggiornato ai nuovi token).

## Criteri di accettazione visiva

1. Il vetro appare **solo** su: barra superiore, tab bar, controllo timer flottante, modali/sheet. Verificabile a colpo d'occhio e nel codice (nessun `backdrop-filter` su superfici di contenuto).
2. Il contenuto scorre visivamente sotto le barre; lo scroll-edge shade è presente.
3. Nessun vetro annidato in vetro.
4. Tutte le dimensioni testo derivano dalla scale; niente px ad hoc.
5. Raggi solo dalla scala; annidati concentrici.
6. Il tint è l'unico colore d'interazione; nessun colore decorativo fuori dai pallini sport.
7. Contrasto: corpo ≥ 4.5:1, secondario ≥ 3:1 (verifica sui materiali scelti).
8. Stati pressed/focus visibili sui controlli; fallback `prefers-reduced-*` e no-backdrop funzionanti.
9. 375px intatti: nessuna sovrapposizione, tab leggibili, card non tagliate.
10. Comportamento funzionale invariato: navigazione, player, timer, modali, check-in — test esistenti verdi.

## Lasciato al builder

- Implementazione esatta dello scroll-edge (gradiente vs blur mask) e della barra superiore allo scroll (CSS-only).
- Trattamento del popover `SubstituteCombo` (menu vetro vs sheet) coerente con HIG.
- Stati cella del calendario (oggi/selezionato) sui nuovi materiali.
- Valori esatti di pressed/hover oltre ai token indicati.
- Ordine dei task e dettaglio del refactoring inline→classi.
