# LazyCheapCoach — Fase 0: Bootstrap PWA Design

## Intent

Trasformare il repo vuoto in un progetto React 19 + Vite 7 + TypeScript strict funzionante, con Bulma CSS, PWA manifest, service worker, layout responsive mobile e baseline build/test.

**Perché:** La Fase 0 è il fondamento di tutto il resto. Senza un progetto funzionante, le fasi successive (dati, UI, GPX, LLM) non hanno dove atterrare.

## Goals

- Repo con struttura cartelle coerente: `src/pages/`, `src/components/`, `src/models/`, `src/data/`, `src/providers/`, `src/hooks/`, `src/lib/`.
- Build di produzione funzionante (`npm run build`).
- Vite PWA configurato: manifest, service worker, icon, cache strategy.
- Bulma CSS integrato con layout responsive mobile-first.
- TypeScript strict abilitato (`noImplicitAny`, `strictNullChecks`, `strictFunctionTypes`, etc.).
- Test di snapshot su componente root.
- Script di deploy per GitHub Pages (con hash routing, fallback 404).
- Repo pubblico (accessibile al proprietario).

## Non-Goals

- Nessuna logica di training (quella viene in fasi successive).
- Nessuna autenticazione.
- Nessuna sincronizzazione cloud.
- Nessuna integrazione LLM automatica (solo bridge manuale).
- Nessuna configurazione di Vercel (il repo è su GitHub).

## Anti-Goals

- Il progetto non deve essere un boilerplate generico: deve seguire la struttura della specifica.
- Non deve introdurre dipendenze non necessarie (ogni lib deve giustificare il peso).
- Non deve rompere l'offline-first: il service worker deve funzionare senza internet.

## Constraints

- **Stack:** React 19, Vite 7, TypeScript strict, Bulma CSS, Vite PWA, Dexie (IndexedDB), Valtio (state).
- **Routing:** hash routing (`react-router` con `createHashRouter`).
- **Stato client:** Valtio (proxy-based, reactivity fine-grained).
- **Persistenza:** Dexie (IndexedDB wrapper).
- **PWA:** Vite PWA plugin con manifest dinamico e service worker strategy.
- **Nessun backend.**
- **Single-device, single-user.**
- **Mobile-first, Chrome iOS/Android (WKWebView su iOS).**
- **Deploy:** GitHub Pages, hash routing, repo pubblico.

## Approaches

### Approccio A — Starter kit + configurazione manuale
Usare `create-vite` come base, poi aggiungere manualmente Bulma, PWA, manifest, routing.

**Pro:** familiare, pochissimo boilerplate.
**Contro:** configurazione manuale per ogni aspetto.

### Approccio B — Vite PWA template completo (SCELTO)
Partire dal template ufficiale `vite-plugin-pwa` che include già manifest, service worker, e configurazione react. Aggiungere Bulma, routing, struttura cartelle.

**Pro:** PWA configurato out-of-the-box, service worker e cache strategici già funzionanti, template maturo e ben mantenuto.
**Contro:** boilerplate del template da adattare.

### Approccio C — Template Vite + script di setup personalizzato
Vite base + script npm (`npm run setup`) che genera struttura, configurazione, dipendenze.

**Pro:** automazione totale.
**Contro:** complesso da mantenere, debugging più difficile.

**Scelta: Approccio B.** Il template `vite-plugin-pwa` è maturo e risolve le decisioni PWA più complesse. Non stiamo reinventando la ruota.

## How — Decisioni prese

1. **Bundler:** Vite 7 (specificato).
2. **PWA:** `vite-plugin-pwa` (template react).
3. **Routing:** `react-router-dom` v7 con hash routing (`createHashRouter`).
4. **State:** Valtio per state management reattivo.
5. **DB:** Dexie per IndexedDB.
6. **CSS:** Bulma via npm + import in CSS.
7. **Icon:** `<link rel="icon" type="image/svg+xml" href="/favicon.svg" />` + PWA icon generation.
8. **Manifest:** dinamico, con `injectManifest` o `injectRoute` dal template.
9. **Service Worker:** `strategy: 'workbox'` con cache strategies standard.
10. **Deploy:** `gh-pages` npm package con `npm run deploy`.
11. **Struttura cartelle:** come da specifica.

## What's left to the builder

- Eseguire tutti i passi di setup: `npm create vite@latest`, installare dipendenze, configurare PWA, Bulma, routing, struttura cartelle.
- Verificare build di produzione funzionante.
- Verificare PWA funziona offline.
- Verificare responsive su mobile (Chrome Android e WKWebView iOS).
- Commit e push su main.
- Configurare GitHub Pages deploy (script + action).

## Builder Notes

- Non introdurre codice di prodotto (nessuna logica di training).
- Non modificare la struttura cartelle rispetto alla specifica.
- TypeScript strict deve essere abilitato e senza `any`.
- Il service worker deve funzionare in produzione (non solo dev).
- Il progetto deve essere deployabile su GitHub Pages con hash routing.
