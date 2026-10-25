# Design — Oggi e calendario, solo grafica

Data: 2026-10-25. Disegno chiuso in conversazione il 2026-10-25, sui mockup del visual companion. L’utente ha scelto l’approccio «pagine esistenti, pezzi nuovi staccati, dati ancora finti».

Questo passo non collega Dexie, non chiama meteo, Salute o un modello, e non persiste skip o sostituzioni. Il passo successivo toglie i mock. Qui i tap devono però cambiare lo stato locale dello schermo, altrimenti la grafica non si può giudicare.

## Intent

Chi apre l’app vuole sapere subito se oggi c’è un allenamento, saltarlo o scambiarlo con un’altra scheda, e chiedere un parere all’AI senza uscire dalla pagina. Gli allenamenti già fatti si rivedono dal mese, non da una lista a parte.

## Goals

- Oggi mostra solo il giorno corrente: scheda prevista, oppure Riposo dopo Salta.
- Dal box si salta, si sceglie un’altra scheda registrata, si apre il check-in.
- Sotto il box, meteo e salute sono due rettangoli con icone e numeri, ancora finti.
- Calendario è un mese a schermo intero. Un pallino segna un giorno in cui una sessione c’è stata. Il tap apre una modale di riepilogo.
- Storico esce dalla tab bar. Il mese lo sostituisce.
- Check-in è una chat. Senza modello, l’invio offre esporta, condividi e importa.

## Non-goals

- Nessuna lettura o scrittura di Dexie, repo o servizi esistenti.
- Nessuna chiamata a un endpoint LLM, a meteo o a Apple Salute.
- Nessun persistenza di skip, sostituzione o chat oltre il refresh.
- Nessuna modifica a schema, backup, `llm-prompts.ts`, `local-llm.ts` o alla pagina `/llm`.
- Nessuna libreria di calendari e nessun framework CSS nuovo.
- La route `/storico` e `History.tsx` restano. Non sono un tab e non vanno riscritte in questo passo.
- Schede, player, cardio e impostazioni non cambiano contenuto.

## Constraints

- PWA, HashRouter, vetro già in `src/styles/glass.css`. Token esistenti: inchiostro `#0b0b0d`, testo `#f5f5f7`, classi `.glass`, `.glass-bar`, `.btn`, `.btn-primary`.
- TypeScript strict. Niente `any`.
- Minimo 375px. Con quattro tab le label intere devono entrare; si abbrevia solo se il test o il viewport lo smentisce.
- Icone SVG nostre. Non path di SF Symbols. Non emoji nella tab bar.
- I mockup approvati stanno in `.superpowers/brainstorm/` e non sono la specifica. Se un mock e questo documento divergono, vale il documento.
- I test esistenti di `BottomNav` si aspettano cinque tab. Vanno aggiornati, non cancellati.

## Approaches

1. **Pagine esistenti, pezzi nuovi staccati, mock locali. Scelto.** `Today.tsx` e `Calendar.tsx` compongono componenti presentazionali. I dati finti stanno in un modulo di mock. Il passo dopo sostituisce quel modulo, non il disegno. È come sono fatte le altre pagine, senza un guscio scollegato.
2. **Guscio visivo sopra le pagine attuali.** Scartato. Quando si tolgono i mock si rifà il disegno.
3. **Libreria calendario, o collegare già Dexie.** Scartati. La libreria litiga col vetro. I dati veri sono il passo successivo, detto dall’utente.

## Come è stato deciso

### Barra

Quattro tab, in ordine: Oggi `/`, Schede `/schede`, Calendario `/calendario`, Impostazioni `/impostazioni`. Storico non c’è. `tabIds` in `src/App.tsx` perde `/storico`. La route `/storico` resta montata, così un vecchio link non finisce in 404.

Il bottone LLM già nell’header resta. I mockup lo omettevano per guardare il contenuto. La spec del vetro lo vuole raggiungibile da Oggi. Chiamata: non toglierlo.

Su `/` il titolo della topbar è `Oggi`. La data sta nel corpo della pagina, in italiano, per esempio `Domenica 25 ottobre`. Oggi `formatToday` mette la data nel titolo: quel comportamento cambia solo per `/`.

### Oggi, sessione prevista

Il box dell’allenamento è il blocco più alto. Sotto, due rettangoli sulla stessa riga, più bassi del box.

Nel box:

- Nome della scheda a sinistra, 22px, peso 400, colore `#f5f5f7`. Non grassetto, non colorato.
- Badge `Previsto` a destra, sulla stessa riga. Maiuscoletto piccolo, tinta corallo come nel mock (`rgba(255,107,74,.18)` / `#ffb4a2`).
- Sottotitolo grigio, per esempio `Fondo lento · 40 min · zona 2`.
- Tre controlli piccoli sulla stessa riga: `Salta` (ghost), combobox, `AI Check-In` (pieno, testo scuro). Nessun sottotitolo sotto AI Check-In.

Combobox chiuso: il volto è `{nome} · oggi`, non la parola Sostituisci. Aperto: le altre schede stanno sopra quel volto, stessa larghezza, un solo bordo arrotondato. Diventa un bottone allungato verso l’alto. Altezza massima tale che la card non cresce e i rettangoli non si spostano. Se le voci non ci stanno, si scorre dentro quel bordo. Una sola voce selezionabile. Alla scelta la lista si chiude, il titolo e il sottotitolo del box diventano quelli della scheda scelta, il volto del combobox diventa `{nome} · oggi`. La scheda già in uso è nel volto, non tra le voci riselezionabili.

Mock delle schede, abbastanza da far vedere lo scroll: Corsa, Palestra giorno 1, Bici, Petto + tricipiti, Schiena + bicipiti, Gambe + addome, Corsa intervalli. Ogni scheda ha un sottotitolo finto e uno sport (`running` | `strength` | `cycling`) per il colore del pallino, anche se Oggi non disegna il pallino.

### Oggi, dopo Salta

Il box diventa Riposo. Titolo `Riposo`, stesso peso e colore del nome scheda. Nessun badge. Sottotitolo `Nessuna sessione`. `Salta` sparisce. Restano il combobox, volto `Scegli scheda`, e `AI Check-In`. Scegliere una scheda da Riposo riporta il box allo stato previsto, con badge `Previsto`.

Un giorno senza sessione, in questo passo, si mostra come il Riposo. Non c’è uno stato distinto «non pianificato» finché i dati sono finti. Chiamata, visibile nel mock approvato.

I due rettangoli restano in entrambi gli stati.

### Rettangoli

Stessa riga, più bassi del box, vetro più quieto del box. Icone e numeri, niente etichette testuali.

Meteo: nuvola + `14°`, vento + `8`. Salute: `Zzz` + `7h 12`, cuore + `52`, scarpa + `3.240`. SVG nostri, tratto circa 1.7. `Zzz` può essere testo disegnato come icona, non una parola «Sonno».

### Check-in

`AI Check-In` apre una modale sopra Oggi, vetro scuro, non un foglio ancorato in basso. Etichetta in alto, frase normale, non maiuscolo forzato: `Check-in · Corsa di oggi`, oppure `Check-in · Riposo` se non c’è scheda. Sotto, titolo `Chat`.

Filo di messaggi. L’utente a destra, bolla chiara. La risposta importata entra a sinistra, come messaggio dell’AI. L’utente l’ha accettato non correggendo questa frase quando gli è stata detta, e il flusso di import è nel mock che ha chiamato perfetto a parte il tasto invia.

Composer: campo `Scrivi…` e un cerchio di vetro da 40px con freccia su, senza scritta. `aria-label` `Invia`.

Invia, in questo passo, non chiama un modello. Aggiunge il messaggio al filo e sotto mostra il blocco `Nessun modello collegato`, con `Esporta`, `Condividi` e `Importa risposta`.

- Esporta copia il prompt finto (testo più JSON di contesto della scheda di oggi e del messaggio). Se la clipboard fallisce, il testo resta selezionabile.
- Condividi chiama `navigator.share` con lo stesso testo. Se manca o fallisce, si comporta come Esporta e lo dice. Non c’è un elenco fisso di app: ChatGPT e WhatsApp erano solo esempi del foglio di sistema.
- Importa risposta apre un campo in cui incollare. Conferma aggiunge quel testo al filo come messaggio dell’AI. Non interpreta JSON e non cambia la scheda. Applicare una modifica proposta dall’AI è il passo successivo.

Chiudere la modale non cancella il filo finché si resta sulla pagina.

### Calendario

Mese a schermo intero sotto la topbar, sopra la tab bar. Lunedì primo giorno. Chiamata: il mock approvato è lunedì-primo e questo passo non legge `UserSettings`.

Intestazione `Ottobre 2026` con ‹ ›. Le frecce cambiano il mese in stato locale. Solo il mese del mock ha pallini; gli altri sono griglie vuote. Chiamata, così le frecce non sono morte.

Griglia di quadrati. Il numero è in alto a sinistra. Il pallino è in basso a destra, circa 7px.

Colori, come nel mock approvato:

- palestra `#7eb6ff`
- corsa `#ff6b4a`
- bici `#5ee0a0`

Legenda sotto la griglia, con gli stessi pallini. Oggi ha un anello chiaro, anche senza pallino. Il giorno della modale aperta ha un fondo leggermente più chiaro.

Tap su un giorno col pallino: modale al centro, non un foglio in basso. Data, nome, durata e distanza o un riepilogo finto, una riga di note, `Chiudi`. Tap sul fondo scuro chiude. Tap su un giorno senza pallino non fa niente. Chiamata: il calendario approvato apriva la modale sul 23, che aveva il pallino, e l’utente ha detto che il calendario gli piaceva così.

Mock di ottobre 2026, lunedì-primo (il 1 è giovedì): pallini sui giorni 2 palestra, 4 corsa, 6 bici, 8 palestra, 11 corsa, 13 palestra, 15 bici, 18 corsa, 20 palestra, 22 bici, 23 corsa. Il 25 è oggi, anello, senza pallino.

## Chiamate del builder, già fissate

- Route `/storico` resta. Nessun link nuovo verso di essa in questo passo.
- Giorno vuoto del mese: tap inerte.
- Settimana che inizia di lunedì, frecce mese attive, altri mesi vuoti.
- Bottone LLM nell’header resta.
- Skip, sostituzione, chat e mese vivono in stato React. Un refresh torna al mock iniziale: Corsa prevista, ottobre 2026, chat vuota.
- Il prompt esportato è una stringa fissa più il messaggio dell’utente e il nome della scheda corrente. Non è lo schema `training-plan` della pagina `/llm`.
- `useCalendarWeek` può restare nel file se un test lo importa, ma la pagina Calendario non lo usa in questo passo. Non va esteso per finta a leggere Dexie.
- Test da aggiornare: `BottomNav` si aspetta quattro tab, senza Storico, goccia solo sull’attivo. Test nuovi, minimi: Salta mostra Riposo e toglie Salta; scegliere una scheda cambia il titolo e chiude la lista; tap su un giorno col pallino apre la modale; tap su un giorno vuoto no; Invia nel check-in mostra il blocco senza modello; import aggiunge un messaggio al filo.
- Nessun `any`. Icone senza emoji nella tab bar. Contrasto del testo sul vetro come nel design del 2026-10-25 liquid glass.

## Fuori da questo documento

Il passo che toglie i mock: da dove arriva la sessione di oggi, come si persiste uno skip, come il pallino distingue pianificato e fatto, come il check-in parla con un modello vero. Non va anticipato nel codice di questo passo.
