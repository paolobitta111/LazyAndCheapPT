# Design Doc — Fase 2: UI Pages (Oggi, Schede, Calendario, Storico)

## Goals

1. **Struttura pagine** — Creare le 4 pagine core (Oggi, Schede, Calendario, Storico) con layout responsive mobile-first
2. **Navigazione** — Bottom tab bar mobile (Oggi/Schede/Calendario/Storico) + top navbar con logo
3. **Componenti riutilizzabili** — SessionCard, ExerciseRow, CalendarSlot, HistoryItem come skeleton UI
4. **Routing funzionante** — Hash-based routing con 4 route + fallback 404
5. **Stato vuoto** — Ogni pagina mostra placeholder/mock per "nessun dato" (no backend reale)

## Non-goals (esclusi esplicitamente)

- ❌ Nessuna logica CRUD (le repo sono già pronte in Fase 1)
- ❌ Nessuno stato reale da IndexedDB (mock/finti dati per ora)
- ❌ Nessuna animazione o transizione
- ❌ Nessuna validazione form (solo placeholder UI)
- ❌ Nessuna pagina Impostazioni (Fase 4)
- ❌ Nessuna integrazione LLM (Fase 3)

## Constraints

- **Mobile-first**: iPhone SE (375px) → layout deve funzionare da 375px a 768px
- **Bulma CSS**: Tutti i componenti usano classi Bulma esistenti (no CSS custom per layout)
- **TypeScript strict**: Nessuna `any`, nessun `as any`
- **Zero dipendenze nuove**: Solo react-router-dom (già installato)
- **Routing**: HashRouter con route: `/` → Oggi, `/schede` → Schede, `/calendario` → Calendario, `/storico` → Storico
- **Navigazione**: Bottom tab bar HTML pura (non componente Bulma) + Bulma navbar top

## Architecture Decision

### Layout Shell (App.tsx)

```
App (HashRouter)
├── Navbar (Bulma fixed-top, logo + titolo)
├── Main Content (padding-top 60px, padding-bottom 80px)
│   ├── / → OggiPage
│   ├── /schede → SchedePage
│   ├── /calendario → CalendarioPage
│   ├── /storico → StoricoPage
│   └── * → NotFound
└── BottomNav (fixed-bottom, 4 tab icons + labels)
```

### File Structure

```
src/
├── components/
│   ├── SessionCard.tsx       # Card per sessione (placeholder)
│   ├── ExerciseRow.tsx       # Riga esercizio (placeholder)
│   ├── CalendarSlot.tsx      # Slot settimanale (placeholder)
│   ├── HistoryItem.tsx       # Item storico (placeholder)
│   └── BottomNav.tsx         # Navigazione bottom bar
├── pages/
│   ├── Today.tsx              # Pagina Oggi
│   ├── Plans.tsx              # Pagina Schede
│   ├── Calendar.tsx           # Pagina Calendario
│   └── History.tsx            # Pagina Storico
├── App.tsx                    # Layout shell + routing
└── main.tsx                   # Entry point (invariato)
```

### Componenti

| Componente | Props | Descrizione |
|------------|-------|-------------|
| `SessionCard` | `title: string`, `status: 'active' \| 'finished'`, `duration?: string` | Card con header, stato badge, durata, lista esercizio |
| `ExerciseRow` | `name: string`, `sets: number`, `reps: number`, `weight?: string` | Riga con nome, serie, ripetizioni, peso |
| `CalendarSlot` | `day: string`, `time: string`, `planName?: string`, `hasPlan?: boolean` | Slot settimanale con orario e nome piano |
| `HistoryItem` | `date: string`, `type: 'workout' \| 'cardio'`, `duration: string`, `planName?: string` | Item con data, tipo, durata, piano |
| `BottomNav` | `activeTab: string` | Barra con 4 icone + labels (Oggi/Schede/Calendario/Storico) |

### Styling Strategy

- **Bulma per**: Cards, badges, buttons, tables, typography
- **Custom minimal per**: Bottom nav positioning, navbar fixed layout
- **CSS custom file**: `src/index.css` estende Bulma con:
  - `.navbar { position: fixed; top: 0; z-index: 100; }`
  - `.bottom-nav { position: fixed; bottom: 0; z-index: 100; }`
  - `.main-content { padding-top: 70px; padding-bottom: 80px; }`
  - `.container { padding-left: 16px; padding-right: 16px; }`

### Navigazione

**Bottom tab bar** (HTML puro, non Bulma component):
```
[🏠 Oggi] [📋 Schede] [📅 Calendario] [📊 Storico]
  icon     icon          icon           icon
  label    label         label          label
```
- Attivo: icon + label in colore primario Bulma (`$primary`)
- Inattivo: icon + label in grigio
- Icone: emoji unicode (✅ per zero dipendenze nuove)

### Mock Data Strategy

Per ogni pagina, usare dati mock hardcoded in-componente per simulare "dati esistenti":

- **Oggi**: 1 sessione attiva fittizia
- **Schede**: 2 piani di allenamento fittizi
- **Calendario**: 3 slots con piani per la settimana corrente
- **Storico**: 5 sessioni passate con date diverse

---

**Approccio scelto: Modularità per pagina** — ogni pagina è un componente separato con import dei propri sotto-componenti. File autonomi, zero accoppiamento cross-pagina.
