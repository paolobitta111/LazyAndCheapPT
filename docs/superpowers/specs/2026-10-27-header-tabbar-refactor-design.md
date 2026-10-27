# Design — Header: large title + ingranaggio, tab bar a 3

Data: 2026-10-27 · Stato: approvato dall'utente (assetto A3, mockup sessione companion 745-1793137087) · Base: `main` (post-merge schede-sheet-calendario)

## Intento e perché

L'header odierno è una capsula di vetro fissa in alto che a riposo appare vuota (titolo nascosto, solo bottone `LLM` — uno strumento di configurazione che non ha senso lì). In più la tab bar ha 4 tab tra cui Impostazioni, che nelle app Apple di salute/fitness vive invece nel glifo in alto a destra. Infine le rotte `/storico` e `/cardio` sono orfane: nessun bottone porta lì (refusi confermati dall'utente).

Direzione scelta: **A3** — a riposo nessuna barra vuota: il large title (già presente nell'`h1` di ogni pagina) e il glifo ⚙ **sulla stessa riga**; allo scroll la capsula di vetro si attiva con il titolo compatto e il glifo resta.

## Obiettivi

- **A riposo**: la barra in alto diventa trasparente (nessun bordo, nessuna ombra, nessun materiale vetro): si vedono solo l'`h1` di pagina e l'ingranaggio a destra, allineati sulla stessa riga.
- **Allo scroll** (>40px, meccanismo `data-scrolled` esistente): la capsula di vetro appare con il titolo compatto (`.bar-title` visibile) e il glifo resta a destra.
- **Un solo glifo**: lo stesso bottone ⚙ vive nell'header in entrambi gli stati; vietato il doppio elemento.
- **Tab bar a 3**: Oggi, Schede, Calendario. Impostazioni esce dalla barra, raggiungibile solo dal ⚙.
- **LLM**: riga "Scambio LLM" (`.group-row` chevron `›`) dentro la pagina Impostazioni → rotta `/llm` invariata.
- **Rimozione rotte orfane**: eliminate la pagina Storico (`/storico`) e Cardio (`/cardio`) con i loro test e la voce da `pageTitle`. Eliminato anche `CardioLogService` (usato solo dalla pagina Cardio). **Il modello dati cardio resta** (tabella `cardioLogs`, pallini e riepilogo del Calendario, backup ZIP continuano a usarlo).

## Non-obiettivi e anti-obiettivi

- Nessun cambiamento al modello dati, nessuna nuova dipendenza.
- Non si toccano i contenuti delle pagine esistenti oltre al necessario.
- Anti-obiettivo: un secondo ingranaggio flottante o dentro la tab bar (doppioni vietati).
- Anti-obiettivo: nascondere l'ingranaggio allo scroll (deve restare sempre raggiungibile).

## Vincoli

- Design system invariato: vetro solo per strati funzionali (la barra scrollata lo resta; lo stato a riposo è trasparente), raggi da `--r-card/--r-inner/--r-pill`, font-size solo dalla type scale `.t-*`, dark-only, niente nuove transizioni.
- Il glifo ⚙ è un `.btn` (pill circolare, materiale opaco `--surface-2`, come i bottoni tondi del calendario) — non vetro, non tint: azione di configurazione, non primaria.
- Copertura: suite verde dopo ogni task (TDD string-pin su CSS, test struttura su BottomNav/Settings/App).

## Approcci considerati

- **A (glifo nell'header capsula, sempre visibile)**: l'header a riposo resta una capsula vuota con solo il glifo — non risolve la sensazione di "barra vuota". Scartato dall'utente.
- **B (solo togliere LLM, Impostazioni resta tab)**: minimo intervento ma lascia entrambi i dubbi dell'utente irrisolti. Scartato.
- **A3 (scelto)**: barra trasparente a riposo, large title + ⚙ stessa riga, tab bar a 3.

## Parti decise (non rimandate al builder)

- Il container header resta un unico elemento fisso: cambia stile con `data-scrolled` (trasparente → capsula vetro). La `.bar-title` a riposo resta `opacity: 0` com'è oggi.
- Il glifo ⚙ usa l'icona `impostazioni` esistente (`NavIcon`), non un nuovo asset.
- `main-content` mantiene lo scorrere edge-to-edge sotto la barra; il padding-top si adatta perché l'`h1` e il ⚙ risultino allineati sulla stessa riga visiva.
- `tabIds` e `pageTitle` perdono `/storico` e `/cardio`; la rotta `*` (NotFound) resta.
- Lo screenshot spec perde le catture `storico` e `cardio`; `llm` raggiungibile via Settings.

## Cosa resta al builder

- CSS esatto dello stato a riposo (trasparenza) e allineamento h1/⚙; markup dell'header.
- Righe/gruppi nuovi in Settings per "Scambio LLM" e relativo test.
- Aggiornamento test: BottomNav (3 tab), App.test (rotte rimosse), glass.css.test (pin stile a riposo), screenshot spec.
- Ordine dei task e commit.

## Criteri di accettazione

1. A riposo non c'è capsula visibile: h1 + ⚙ sulla stessa riga; scorrendo appare la capsula con titolo e ⚙.
2. La tab bar ha 3 tab; Impostazioni si apre solo dal ⚙.
3. Da Impostazioni si raggiunge Scambio LLM; `/llm` funziona.
4. `/storico` e `/cardio` non esistono più (NotFound su entrambe); il Calendario mostra ancora i pallini cardio.
5. Suite verde + screenshot osservati dei nuovi stati.
