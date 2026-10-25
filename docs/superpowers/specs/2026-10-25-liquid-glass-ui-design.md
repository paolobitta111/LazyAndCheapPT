# Design — Liquid Glass scuro per LazyCheapCoach

Data: 2026-10-25. Approvato in conversazione il 2026-10-25, dopo i mockup nel visual companion.

Questo documento sostituisce, solo per la UI, il vincolo «Bulma obbligatorio» di `Specifica_Training_Log_OpenSpec.md` (punti su Bulma come base di layout, form, card e bottoni) e di `docs/superpowers/specs/2026-10-24-ui-pages-design.md`. Dati, routing e fasi di prodotto non cambiano. Fase 13 (sync) resta fuori.

## Intent

L’app va usata in palestra, di sera, sul telefono. L’utente vuole la stessa sensazione di iOS 26 Liquid Glass: lastre che lasciano vedere il contenuto sotto, bordo chiaro, highlight, tab bar flottante. Non un’app nativa finta, e non un blur piatto chiamato vetro.

## Goals

- Sfondo inchiostro su tutte le schermate.
- Vetro CSS su topbar, tab bar e card di ogni pagina.
- Tab bar a capsula con selezione a goccia, icona piena e label.
- Font di sistema Apple sul dispositivo Apple, senza file di font nel repo.
- Togliere Bulma, che impone barre bianche e card opache.

## Non-goals

- Nessuno switch chiaro/scuro. L’app resta scura.
- Nessun file SF Pro, New York o SF Symbols nel bundle.
- Nessuna copia dei path SVG di SF Symbols.
- Nessuna rifrazione SVG su ogni riga di lista.
- Nessun nuovo framework CSS (niente Tailwind, niente Bulma sostitutivo).
- Nessun cambiamento a Dexie, servizi, schema, backup, LLM o sync.
- Nessuna Fase 13.

## Constraints

- PWA locale, HashRouter già in `src/main.tsx`. Le route in `src/App.tsx` restano: `/`, `/schede`, `/calendario`, `/storico`, `/workout/:planId`, `/cardio`, `/llm`, `/impostazioni`.
- TypeScript strict. Niente `any`.
- iPhone SE, 375px, è il minimo. Il footer con 5 label deve restare usabile lì.
- `backdrop-filter: url()` non piega i pixel su Safari/iOS. Lì la ricetta CSS è il prodotto, non un degrado vergognoso.
- Contrasto: testo primario `#f5f5f7` su fondo `#0b0b0d`. Il vetro non deve schiarire il testo fino a farlo sparire.
- `prefers-reduced-motion: reduce` ferma gonfiaggio e scia. Il vetro statico resta.
- Licenza SF Pro (forum Apple, thread 733267): il file si usa solo per mockup di UI Apple. In prodotto si usa lo stack di sistema.

## Approaches

1. **Tenere Bulma e sovrascriverlo.** Scartato. Navbar bianca, `.box` e bottoni riscrivono il vetro. L’utente ha autorizzato a cambiare specifica e framework se Bulma è un limite.
2. **Tailwind o un kit Liquid Glass di terze parti.** Scartato. Aggiunge un sistema di classi e, nei kit con displacement, una dipendenza che su iPhone non fa la rifrazione vera.
3. **CSS nostro, scelto.** Un file di token e classi vetro. Bulma esce da `package.json` e da `src/index.css`. Form e bottoni sono controlli nostri, scuriti, non un secondo framework.

## Come è stato deciso

### Sfondo

Inchiostro: `#0b0b0d`, sfumatura verso `#1c1c1e` solo se serve a non avere un nero piatto morto. Vietate le macchie blu e rame del mockup intermedio.

### Materiale

Classe `.glass`, token:

- `--glass-blur: 20px` sulle card; sulla tab bar il blur resta basso (circa 2–8px), altrimenti la goccia interna non ha niente da piegare.
- `--glass-sat: 160%` sul nero. Non 180%: sul scuro satura troppo.
- Tinta `linear-gradient(180deg, rgb(255 255 255 / 0.10), rgb(255 255 255 / 0.03))`.
- Bordo `rgb(255 255 255 / 0.16)`.
- Highlight `inset 0 1px 0 rgb(255 255 255 / 0.28)`.
- Ombra `0 10px 28px rgb(0 0 0 / 0.45)`.
- Prefisso `-webkit-backdrop-filter`.
- `@supports not (backdrop-filter: blur(1px))`: fondo `rgb(28 28 30 / 0.92)`.

Rifrazione SVG (`feDisplacementMap`), ispirata a nikdelvin/liquid-glass (MIT, non copiare gli asset), solo sulla tab bar e solo se `backdrop-filter: url()` è supportato. Altrimenti la goccia resta vetro CSS. Fonti di ricetta, non di codice da incollare intero: [UITweak](https://uitweak.com/blog/liquid-glass-css-guide), [design.dev generator](https://design.dev/tools/liquid-glass-generator/), [Aether](https://aethercss.lovable.app/), [Codequest](https://codequest.work/generator/liquid-glass-css-generator/en/).

Il vetro pieno con displacement non va su ogni card. Le card usano la ricetta CSS. È una chiamata di performance, non un ritorno al disco opaco.

### Chrome

- Topbar: capsula flottante con il titolo della pagina. Via la navbar bianca fissa e le voci Impostazioni/LLM in alto (`src/App.tsx`).
- Footer: capsula flottante, 5 tab. Ordine: Oggi, Schede, Calendario, Storico, Impostazioni. Route: `/`, `/schede`, `/calendario`, `/storico`, `/impostazioni`.
- Label sempre visibili. A 375px, se non entrano, si accorciano solo Calendario → Cal e Impostazioni → Impost. Chiamata del builder, da verificare sul viewport, non da abbreviare a priori.
- LLM non è un tab. Resta raggiungibile da Oggi e da Impostazioni. Non togliere la route `/llm`.
- Selezione: pillola di vetro dietro icona + label del tab attivo. Icona attiva piena e bianca. Inattive a tratto, `rgb(255 255 255 / 0.55)`. A riposo la pillola è un highlight. Al tap si sposta sul tab, si gonfia circa 1.16 e il riempimento si assottiglia. Niente disco opaco intorno alla sola icona.
- Icone: SVG nostri in un componente, peso vicino a un Symbol (tratto ~1.7, fill sull’attivo). Non emoji. Non path copiati da SF Symbols.

### Pagine

Stesso vetro e stesso chrome per: Oggi, Schede, Calendario, Storico, player, cardio, LLM, Impostazioni, 404. Le liste restano card separate, non un’unica lastra.

Pagine e pezzi che oggi usano classi Bulma e vanno riscritti nello stile, senza cambiare i dati che mostrano: `src/App.tsx`, `src/pages/Today.tsx`, `Plans.tsx`, `Calendar.tsx`, `History.tsx`, `WorkoutPlayer.tsx`, `Cardio.tsx`, `LlmBridge.tsx`, `Settings.tsx`, `NotFound.tsx`, `Home.tsx` se è ancora montata, `src/components/Timer.tsx`, `ExerciseSetRow.tsx`, `SessionCard.tsx`, `CalendarSlot.tsx`, `HistoryItem.tsx`.

### Font

```css
font-family: -apple-system, BlinkMacSystemFont, system-ui, sans-serif;
```

Su iPhone è SF Pro. Su Windows è Segoe UI. Tracking leggermente negativo sui titoli (`-0.03em` circa). Numeri di kg, ripetizioni e tempi in `tabular-nums`.

### Form

Input, select, textarea e bottoni non usano più `input`, `button`, `is-primary` di Bulma. Controllo scuro: fondo `#1c1c1e`, bordo chiaro sottile, testo `#f5f5f7`, focus con outline visibile. Il bottone primario è una capsula chiara con testo scuro, non il blu Bulma.

## Chiamate del builder, già fissate

- `theme_color` del manifest PWA diventa `#0b0b0d`, così la status bar non resta bianca.
- Dipendenza `bulma` rimossa da `package.json` e l’`@import` da `src/index.css`. I test che cercano classi Bulma si aggiornano al nuovo markup, non si cancellano se coprono comportamento.
- Nessun accento blu di sistema sul tab attivo. Il segnale è la goccia più la icona bianca piena.
- Error boundary, se sta fuori da `LayoutShell`, riceve almeno fondo inchiostro e font di sistema. Non è obbligatorio metterci la tab bar se non c’è un route.
- `src/pages/Home.tsx` non è montata dalle route attuali. Non cancellarla in questo change. Si ridisegna solo se un test la renderizza.
- `src/pages/__snapshots__/App.test.tsx.snap` descrive una navbar Bulma vecchia. Va aggiornata al chrome nuovo, non usata come specifica.

## Cosa resta al builder

- Valori esatti di blur della tab bar, entro il vincolo «basso, così la goccia si legge».
- Se abbreviare le label a 375px, dopo averle misurate.
- Come spezzare il CSS (un file `src/styles/glass.css` importato da `src/index.css` è la forma attesa).
- Quali test di pagina aggiornare, purché `tsc`, i test esistenti di comportamento e la build restino verdi.

## Verifica

- `npx tsc -b --noEmit` pulito.
- Vitest verde, dopo l’aggiornamento dei selettori.
- Build verde.
- A 375px si vedono 5 tab, la goccia sul tab attivo, e il testo di una card di Oggi è leggibile.
- Su un browser senza `backdrop-filter`, le card restano un pannello scuro opaco, non testo bianco su bianco.
