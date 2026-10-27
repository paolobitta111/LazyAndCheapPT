# 🏋️ LazyCheapCoach

Il tuo allenatore personale, **offline e gratuito**.

Gestisci i tuoi allenamenti, monitora i progressi e pianifica le sessioni — tutto direttamente nel browser, senza server e senza abbonamenti.

## 🚀 Funzionalità (MVP)

- 📝 Schede di allenamento con ripetizioni e carichi
- 🏃‍♂️ Tracciamento corsa/bici con import GPX
- 📅 Calendario settimanale
- ⚡ PWA offline-first (funziona senza connessione)
- 📱 Responsive mobile-first
- 🧠 Bridge manuale con LLM (copia/incolla)

## 🛠️ Stack

- **React 19** + **TypeScript strict**
- **Vite 7** (build + dev server)
- **React Router 7** (hash routing)
- **Plain CSS design tokens** (glass/material system, Vite)
- **Vite PWA** (service worker + manifest)
- **Vitest** + **Testing Library**

## 📦 Scripts

```bash
# Sviluppo
npm run dev

# Build produzione
npm run build

# Preview build
npm run preview

# Test
npm test
```

## 📁 Struttura

```text
src/
├── models/        # Interfacce dati (Workout, Session, Plan)
├── data/          # Dexie DB (persistenza locale)
├── hooks/         # Hook (useWorkouts, useCalendar)
├── lib/           # Utility (date formatting, GPX parse)
├── components/    # Componenti UI riutilizzabili
├── pages/         # Pagine (Home, NotFound)
├── test/          # Setup test
└── utils/         # Helper vari
```

## 📋 Roadmap

Vedi i task di sviluppo nel piano di evoluzione del progetto.

## 📄 Licenza

Proprietario. Tutti i diritti riservati.
