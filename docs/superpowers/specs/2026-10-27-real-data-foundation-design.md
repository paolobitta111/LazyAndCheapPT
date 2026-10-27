# Design — LazyCheapCoach vera: via i mock, dentro i dati veri

Data: 2026-10-27. Approccio A scelto in conversazione il 2026-10-27: la regola di ricorrenza sta sulla scheda, le eccezioni per-data stanno su `PlannedSession`.

Sostituisce, per il wiring dei dati, il passo grafico del 2026-10-25 (`2026-10-25-oggi-calendario-ui-design.md`). La grafica approvata non cambia forma: i componenti restano, cambia da dove vengono i dati.

## Intent

L’app deve funzionare davvero sul telefono in palestra: crei una scheda, le associ i giorni (della settimana o date del mese), e Oggi e il calendario mostrano quello che c’è davvero. Salta e Sostituisci devono scrivere. Il check-in deve parlare con l’endpoint locale configurato. Il meteo arriva da un servizio vero. I mock muoiono.

## Goals

- **Scheda con assegnamento**: pagina Schede vera: crea e modifica una scheda (nome, esercizi, sport) e associa giorni della settimana e/o date del mese, alla creazione o dopo.
- **Oggi vero**: legge l’assegnamento della data corrente; più schede sullo stesso giorno diventano più box; Salta e Sostituisci scrivono su `PlannedSession`.
- **Calendario vero**: risolve il mese dalle regole + eccezioni; tap su giorno assegnato apre il riepilogo vero; tap su giorno vuoto permette di assegnarci una scheda.
- **Stato reale nel pallino**: pallino pieno se la sessione c’è stata (log esiste), pallino a bordo se è solo prevista.
- **Check-in vivo**: se l’endpoint locale (`local-llm.ts`, già configurabile in Impostazioni) è attivo, l’invio chatta davvero (OpenAI-compatible `/chat/completions`); altrimenti resta il blocco Esporta/Condividi/Importa già approvato.
- **Meteo vero**: Open-Meteo (gratis, senza chiave) con posizione del browser; se la posizione è negata, il cubo mostra `—`.
- **Salute a mano**: i valori di sonno/battiti/passi si scrivono a mano (tap sul cubo), Apple Salute non è raggiungibile da una PWA.

## Non-goals

- Nessuna sincronizzazione remota (Fase 13 resta fuori).
- Nessun cambiamento a Dexie che richieda migrazione: i campi nuovi sulle schede non sono indicizzati, `version(1)` resta.
- Nessuna app nativa, nessun ponte HealthKit.
- Nessuna grafica nuova: i componenti approvati restano, cambia solo il wiring.
- La chat non applica automaticamente modifiche alla scheda suggerite dall’AI; resta solo testo (il design di quel passo verrà dopo, se servirà).
- Lo storico (`/storico`, `History.tsx`) non si tocca: funziona già.

## Constraints

- PWA locale, HashRouter, TypeScript strict, niente `any`.
- `PlannedSession` ha già `planId + date + status ('planned'|'done'|'cancelled')` e l’indice composto `[planId+date]`: niente migrazione.
- La schema JSON `training-plan/v1.0.0` ha già `plannedSessions[].dayOfWeek` (Lunedì=1..Domenica=7) e `order`: si riusa, non si reinventa.
- `additionalProperties: false` nella schema: ogni campo aggiunto all’entità va aggiunto alla schema o l’import da LLM lo rifiuta.
- Il player (`WorkoutPlayer.tsx`) ha un bug: `useAppData()` chiamato dentro un `useEffect` (hook fuori regole). Va fixato in questo passo, fa parte del «funzionante».
- Minimo 375px. Suite `vitest` verde + `tsc -b` pulito a ogni commit.

## Approaches

1. **La regola sta sulla scheda, le eccezioni per-data. Scelto.** Ogni scheda porta i suoi giorni (`plannedSessions[].dayOfWeek`, riusando la schema esistente) e le sue date (`dates: string[]`). `PlannedSession` diventa il registro delle eccezioni: Salta = riga `cancelled`, Sostituisci = `cancelled` per la vecchia + `planned` per la nuova, assegnare dal calendario su un giorno fuori regola = riga `planned`. La lettura di una data = regole attive ∪ righe `planned`, meno le `cancelled`, dedup per scheda. Nessuna finestra da materializzare, la storia non diverge, niente migrazione.
2. **Assegnare materializza le sessioni fino a un orizzonte.** Scartato: quando l’orizzonte finisce il calendario è vuoto, e cambiare una regola riscrive righe a mano a mano.
3. **Solo date specifiche, senza ricorrenza.** Scartato: l’utente ha chiesto proprio l’assegnamento ai giorni della settimana.

## Come è stato deciso

### Modello

`TrainingPlan` (in `src/models/entities.ts`) prende:

```ts
plannedSessions?: PlannedSessionRule[]   // regola settimanale
dates?: string[]                        // date specifiche 'YYYY-MM-DD'
```

con `PlannedSessionRule = { dayOfWeek: number /* 1..7, lunedì=1 */; order: number }`.

La schema JSON (`src/data/schemas/training-plan.json`) prende `dates` come array opzionale di stringhe con pattern `^\\d{4}-\\d{2}-\\d{2}$`. `schemaVersion` resta `1.0.0`: aggiungere un campo opzionale non invalida i documenti vecchi, e una 1.1.0 con `const` rifiuterebbe tutti gli export fatti finora. Chiamata mia.

`CreateTrainingPlanInput` eredita i campi nuovi via `Omit`. `training-plan.service.ts` (`normalize`, `update`) e `repositories.dexie.ts` (create/update, dove i campi sono elencati a mano attorno a `sport: existing.sport`) li portano.

### Risoluzione: `src/services/planning.service.ts` (nuovo)

- `resolveDay(date)`: schede attive dove `dayOfWeek === weekday(date)` o `date ∈ dates` ∪ righe `planned` di quella data; meno i `planId` con riga `cancelled`; dedup per `planId`. Ordine: `order` della regola, poi nome.
- `resolveMonth(year, month)`: per ogni giorno del mese, `resolveDay` (una query per giorno è accettabile: 31 letture indexed su un DB locale; niente premature optimization).
- `skip(planId, date)`: `create` riga `{ planId, date, status: 'cancelled' }` (se esiste già una riga `planned` o `done` per quel giorno, aggiorna quella a `cancelled`).
- `substitute(oldPlanId, newPlanId, date)`: `skip` della vecchia + `create` riga `planned` per la nuova.
- `assign(planId, date)`: `create` riga `planned` (è l’eccezione che aggiunge un giorno fuori regola).
- `isDone(planId, date)`: esiste un `WorkoutLog` (o `CardioLog` per sport cardio) con `plannedSessionId`/`planId`+`date`? Il pallino pieno nasce da qui.

### Superfici di assegnamento (tre, come chiesto)

- **Schede** (`src/pages/Plans.tsx`, riscritta): elenco vero dal repo; «Nuova scheda» apre il form (nome, sport, esercizi con sets/reps/kg, toggle dei 7 giorni, lista di date con aggiunta); modifica dopo la creazione dallo stesso form. Niente più «Lun, Mer, Ven» finti.
- **Oggi**: il combobox Sostituisci (già approvato) elenca le schede vere e chiama `substitute`; Salta chiama `skip`. Più box, uno per scheda risolta, con i tre controlli nel primo box o in ogni box — in ogni box: ogni scheda è indipendente (chiamata mia, coerente con «più allenamenti nello stesso giorno»).
- **Calendario**: tap su giorno con risoluzione → riepilogo vero (come approvato); tap su giorno vuoto → modale di assegnamento: elenco schede, scegliere crea la riga `planned`. Chiamata mia: la stessa modale è raggiungibile dal riepilogo di un giorno, per aggiungere un secondo allenamento a un giorno già pieno.

### Pallino

Pallino pieno = `isDone`; pallino a bordo (`border` + fondo trasparente) = prevista e non fatta. Colore dal `sport` della scheda: `strength → #7eb6ff`, `running → #ff6b4a`, `cycling → #5ee0a0`, altro sport → bianco spento. `MonthCalendar` riceve per ogni giorno una lista di `{ planId, sport, done }`.

### Check-in

`CheckInModal` (già approvato) cambia solo l’invio: se `loadLocalLlmConfig().enabled && endpoint`, `POST {endpoint}/chat/completions` con `{ model, messages: [system, ...thread] }`, system = `buildCheckInPrompt` con la scheda di oggi vera + metriche. Risposta → bolla assistant. Errore o disabilitato → il blocco Esporta/Condividi/Importa resta esattamente com’è. Nessuna gestione di API key (endpoint locale), nessun altro provider.

### Meteo e salute

- `src/services/weather.service.ts` (nuovo): `navigator.geolocation.getCurrentPosition` → `fetch api.open-meteo.com/v1/forecast?latitude=..&longitude=..&current=temperature_2m,weather_code,wind_speed_10m`. CORS ok, niente chiave. Posizione negata o fetch fallita → il cubo mostra `—` e non mente.
- Salute: tap sul cubo → mini form (sonno, battiti a riposo, passi) salvato in `localStorage` (niente schema). Il cubo già disegnato mostra i valori salvati.

### Cosa muore

- `src/pages/today-mock.ts`: `mockSchede`, `octoberSessions`, `mockMetrics`, `octoberYear/MonthIndex` si cancellano; `formatToday` si tiene (fuori dal file mock, in `src/pages/today.ts` o in `App.tsx` dove già stava).
- `useCalendarWeek` e `CalendarSlot` nel calendario: si cancellano con i loro test.
- I test dei mock (`today-mock.test.ts`, parti di `Calendar.page.test.tsx` su ottobre fissa) si riscrivono su repo finti in-memory (i mock nei test restano, nei test è il loro posto).

### Player

Tap su un box di Oggi materializza la riga: `planning.service.ensurePlanned(planId, date)` crea (o riusa) la riga `planned` per quella scheda+data, e il player trova la sessione con la sua lookup esistente (`listByDate` + `planId`). Se la riga era `cancelled` (saltata), il tap la riporta `planned`: ripensare il salto deve funzionare. Serve: senza riga non c’è `plannedSessionId` per il `WorkoutLog`. Chiamata del builder check.

Fix del hook: `useAppData()` va chiamato al top level del componente, non dentro `useEffect`. Il player parte da Oggi (tap su un box → route `/workout/:planId`) con la scheda vera del giorno.

## Chiamate del builder, già fissate

- `schemaVersion` resta `1.0.0`, `dates` è aggiunta opzionale.
- Ogni box di Oggi porta i suoi tre controlli.
- La modale di assegnamento del calendario serve anche per aggiungere un allenamento a un giorno già pieno.
- Una query per giorno in `resolveMonth`, senza cache.
- Salute in `localStorage`, non in Dexie.
- Sport sconosciuto → pallino bianco spento.

### Dal builder check (2026-10-27)

- **Tap sul box = materializza la riga `planned`** (`ensurePlanned`), player invariato nella sua lookup. Il salto si ripensa riportando la riga a `planned`.
- **`done` per il cardio**: un `CardioLog` con `planId` (nuovo campo opzionale su `CardioLog`, non indicizzato, niente migrazione) matching; se manca `planId`, matching per `date` + `type === sport` della scheda (corsa fatta a mano conta come fatta). `WorkoutLog` conta tramite `plannedSessionId`/`planId`+`date`.
- **Modifica scheda = in place**: la pagina Schede usa `repo.update` (stesso `id`, stesso `version`), NON il service versionante — che resta per l’import LLM. Un nuovo `id` a ogni edit orfanizzerebbe tutte le righe di eccezione (`cancelled`/`planned`) e duplicherebbe la scheda in combo e calendario.
- **Giorno vuoto**: «Scegli scheda» chiama `assign`, non `substitute`. Combo e modale calendario elencano solo schede attive. Le righe di eccezione per schede poi archiviate continuano a risolvere: l’eccezione è intenzionale, la regola no.
- **Modale giorno**: se c’è un log → il riepilogo del log (durata, distanza per cardio, note); se è solo prevista → nome scheda + descrizione. Il pallino dice lo stato, la modale dice i dettagli di quello stato.
- **Chiavi data locali**: `dateKey(date)` da componenti locali, formato `YYYY-MM-DD`, ovunque (risoluzione, righe, player, cardio). Mai `toISOString().slice`, è UTC: in palestra di sera l’off-by-one è il caso principale.

## Fuori da questo documento

Applicare le risposte dell’AI alla scheda, storico per scheda, grafici di progressione, esportazione scheda-JSON dalla pagina Schede. Se servono, tornano dal gate di brainstorming.