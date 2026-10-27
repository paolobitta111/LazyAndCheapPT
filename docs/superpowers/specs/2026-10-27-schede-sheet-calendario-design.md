# Design — Sheet "Scheda" e Calendario iOS

Data: 2026-10-27 · Stato: bozza per approvazione · Base: branch `feature/liquid-glass-fidelity` (post refactor liquid glass, task 1–7 completi)

## Intento e perché

Dopo il refactor "vetro reale" due superfici restano fuori dal linguaggio della app:

1. **Il form Nuova/Modifica scheda (`PlanForm`)** renderizza inline, con materiale vetro (`.glass` — vietato per i contenuti), usa `btn-primary` e `.label`, due classi che **non esistono più** nel CSS (rendering di default del browser), e stipa 4 input per riga su 375px.
2. **Il Calendario** mette la griglia a nudo su nero, con navigazione mese fatta di due bottoni tondi orfani; i due modali (assegna, riepilogo) sono sheet centrati, non bottom sheet.

Direzione scelta dall'utente (mockup interattivi, sessione companion 421-1793130539):
- Form → **A**: sheet modale "Impostazioni iOS" (righe inset, giorni pill, esercizi righe con `›`, modifica esercizio in sotto-vista).
- Calendario → **A**: griglia nel gruppo inset, intestazione mese fuori dal gruppo, tap giorno → **bottom sheet con grabber**.

## Obiettivi

- Il form "Nuova scheda" e "Modifica scheda" è una **sheet modale** con header alla iOS: `Annulla` (a sinistra, quiet tint), titolo al centro, `Salva` (a destra, tint semibold).
- Il corpo della sheet è fatto di **gruppi inset** (`.group`, raggio `--r-inner` dentro la sheet) con righe separate da hairline `--sep`.
- Uno **sport segmented control** (Forza / Corsa / Bici / Altro) al posto della select.
- **Giorni della settimana**: 7 toggle pill (`.btn` pill, attivo = tint), `aria-pressed`.
- **Esercizi**: righe compatte `nome · 4×10 · 60kg · ›`; il tocco apre la **sotto-vista di dettaglio** dentro la stessa sheet (nome, serie, rip, kg, rimuovi), con "‹ Dettaglio" per tornare. "+ Aggiungi esercizio" come riga tint in coda al gruppo.
- **Date specifiche**: righe `data · ×` nel gruppo, aggiunta via riga con input date nativo (nascosto finché non serve; riutilizzo del pattern label-btn dell'import ZIP).
- `Salva` disabilitato se il nome è vuoto.
- **Calendario**: griglia dentro un `.group`; intestazione mese (‹ Ottobre 2026 ›) fuori dal gruppo con i due bottoni tondi `.btn`; legenda dentro il gruppo in fondo.
- **AssignModal e DaySummaryModal diventano bottom sheet**: ancorate in basso, raggio `--r-card` in alto, grabber, backdrop `rgba(0,0,0,.6)`; chiusura con tocco sul backdrop (come gli altri modali).

## Non-obiettivi e anti-obiettivi

- Non si tocca `Home.tsx` (fuori dal perimetro, come nel design doc precedente).
- Nessun nuovo modello dati: `TrainingPlan`, `PlannedSessionRule`, `TrainingExercise` restano identici.
- Nessuna nuova dipendenza. Nessuna libreria di animazione: transizioni CSS semplici, e `prefers-reduced-motion` le spegne.
- Copy italiano invariato nei dati (etichette nuove ammesse: Annulla, Salva, Dettaglio, Aggiungi esercizio, Aggiungi data, Rimuovi).
- Anti-obiettivo: ricreare il look "vetro" dentro la sheet — la sheet è vetro, il suo contenuto è materiale opaco inset (stessa regola del design doc del 2026-10-27).

## Vincoli

- Stessi vincoli del design doc approvato: dark-only, system font, niente uppercase nelle intestazioni, `tabular-nums` sui numeri, min 375px, raggi solo da `--r-card/--r-inner/--r-pill`, font-size solo dalla type scale `.t-*`.
- Vitest resta l'unico framework di test per il codice; Playwright solo screenshot.

## Approcci considerati (e perché li abbiamo scartati)

- **Form B "tutto in pagina"** (mini-celle Serie/Rip/Kg subito modificabili): più rapido ma denso e più lontano dagli pattern iOS; l'utente ha scelto A.
- **Form C "Salva flottante in basso"**: economia di tocchi ma il Salva in header è più riconoscibile come pattern iOS; scartato.
- **Calendario B "griglia aerea + lista giorno inline"** (stile app Calendario nativa): più fedele a iOS ma cambia il modello di interazione (niente modale di riepilogo); l'utente ha preferito tenere il flusso modale con materiali corretti → A.
- **Calendario C "griglia + agenda mese"**: aggiunge una vista nuova non richiesta; scartato per YAGNI.

## Parti decise (non rimandate al builder)

- La sheet del form è **centrata su schermi larghi** (come i modali attuali, `width: min(92vw, 420px)`) ma a fine 2026 l'app gira solo su mobile/PWA: si usa lo stesso box dei modali attuali, non un bottom sheet full-width. (Chiamata mia: coerenza con CheckInModal esistente.)
- Grabber e bottom-anchoring valgono per **tutti e tre** i modali (form, assegna, riepilogo): un solo pattern. (Chiamata mia: A per il calendario mostrava bottom sheet per assegna e riepilogo; estenderlo al form uniforma il sistema. A schermo largo il box resta centrato come sopra.) **Il grabber appare solo quando la sheet è ancorata in basso (mobile); nella variante centrata su schermo largo non c'è grabber** — su una card flottante "trascinami" non ha senso. *Approvato dall'utente (27/10).*
- Le sotto-viste dentro la sheet (dettaglio esercizio) sostituiscono il contenuto della sheet senza animazioni di push: swap secco, come il resto dell'app senza motion. (Chiamata mia: zero animazioni = zero rischi con reduced-motion.)
- Le modifiche della sotto-vista scrivono direttamente nella bozza locale; "‹ Dettaglio" torna indietro senza scartare nulla; solo `Annulla` scarta tutto (comportamento esistente per unmount).
- Sport: etichette italiane (Forza/Corsa/Bici/Altro) mappate sui valori dati esistenti `strength/running/cycling/other`.
- Intestazioni di riga nel form via `.group-row` + hairline esistente (`.group-row + .group-row`), non classi nuove.
- Il form aperto come sheet usa box `min(92vw, 420px)`; assegna e riepilogo convertiti a bottom sheet mantengono `min(92vw, 380px)`.
- Bottom sheet ancorate in basso: `padding-bottom: max(1rem, env(safe-area-inset-bottom))`, angoli inferiori vivi (raggio `--r-card` solo in alto).
- Z-index delle sheet modali: 60 (sopra i 50 attuali); barre restano a 20.
- Breakpoint wide-screen per il passaggio bottom-anchored → centrato: `min-width: 48rem`.
- MonthCalendar, toccandolo per la riorganizzazione, migra i `fontSize` px residui sulla type scale `.t-cap`/`.t-foot` (precedente: ruling Cardio nel ledger).
- **Risoluzione di F-6 (gruppi annidati), scelta dell'utente: a)** si aggiunge ora la regola `.group .group { border-radius: var(--r-inner) }` — corregge anche i due gruppi annidati nelle pagine Impostazioni (preview backup) e Scambio LLM (`pre` risposta); il review precedente lo teneva come minore rimandato.
- Nomi classi nuovi (in `glass.css`): `.seg`/`.seg-item`, `.pill` (toggle giorno: larghezza/flex per 7 pillole a 375px, attivo = tint + testo scuro `#160b07`, chiave `aria-pressed`), `.sheet-nav`, `.grabber`, `.sheet-bottom`. Le righe inset dentro le sheet sono `.group-row` in `.group` con `--r-inner` (nessuna classe `list-chev`: chevron come carattere `›`).
- `Annulla` usa `.btn-quiet` (già nel sistema, oggi inutilizzato — chiude F-8 per quanto riguarda la classe).
- Etichette nuove ammesse anche per lo segmented control: Forza, Altro (Corsa/Bici esistono già).

## Cosa resta al builder

- Markup esatto e ordine dei gruppi nella sheet; struttura della sotto-vista esercizio.
- Come ottenere il grabber (pseudo-elemento vs elemento).
- Z-index e stacking delle bottom sheet (sopra contenuto, sotto niente: sono il layer più alto).
- Test: string-pin dei token/classi nuovi in `glass.css.test.ts`, test di struttura per la sheet del form e per i bottom sheet, aggiornamento dei test esistenti (Plans, Calendar) che indicano il markup vecchio.
- Screenshot Playwright per la verifica visiva (nuove rotte di cattura: form aperto, sheet assegna aperta).

## Criteri di accettazione

1. Da "Nuova scheda" si apre una sheet modale con Annulla/titolo/Salva; Salva è disabilitato senza nome; nessun `btn-primary`/`.label` residuo nel form.
2. La modifica di un esercizio avviene nella sotto-vista dentro la sheet; Annulla scarta le modifiche (stato locale come oggi).
3. Il calendario ha la griglia nel gruppo, intestazione mese fuori, legenda nel gruppo.
4. Assegna e riepilogo sono bottom sheet con grabber; il backdrop chiude.
5. Suite verde + screenshot osservati (non solo generati) delle nuove schermate.
