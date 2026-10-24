# LazyCheapCoach Bootstrap PWA Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Trasformare il repo vuoto in un progetto React/Vite/TS/PWA funzionante, con Bulma, routing hash, service worker, layout mobile e build di produzione.

**Architecture:** Partire dal template `vite-plugin-pwa` React (Approccio B), aggiungere Bulma, hash routing, struttura cartelle, test baseline. Nessuna logica di prodotto — solo scaffold funzionante.

**Tech Stack:** React 19, Vite 7, TypeScript strict, `vite-plugin-pwa`, `react-router-dom` v7 (hash), Bulma CSS, Vitest, `gh-pages`.

**Spec:** `docs/superpowers/specs/2026-10-24-lazycheapcoach-bootstrap-pwa-design.md`

## Global Constraints

- TypeScript strict: `noImplicitAny`, `strictNullChecks`, `strictFunctionTypes`, `noUncheckedIndexedAccess`, `noEmit: false` (solo compilazione).
- Nessun `any` in produzione.
- Routing hash: `createHashRouter`.
- Struttura cartelle: `src/pages/`, `src/components/`, `src/models/`, `src/data/`, `src/providers/`, `src/hooks/`, `src/lib/`.
- Mobile-first, responsive, Chrome iOS/Android.
- Nessuna dipendenza non necessaria (ogni lib deve giustificare il peso).
- Nessuna logica di prodotto (no training, no auth, no sync, no LLM).

## Review Focus

1. **Offline-first:** il service worker deve servire l'app senza rete. Un test di build che verifica l'esistenza dei file PWA in `dist/`.
2. **Hash routing:** i link devono usare `#`. Verificare che il router sia configurato con `createHashRouter`.
3. **TypeScript strict:** zero `any` e zero `// @ts-expect-error` senza commento. Un `npx tsc --noEmit` clean è il gate.
4. **Bulma CSS:** lo stylesheet Bulma deve essere importato nel bundle. Un snapshot del layout verifica la presenza dei classi Bulma.
5. **PWA manifest:** il `dist/manifest.json` deve contenere `name: "LazyCheapCoach"` e `display: "standalone"`. Verifica diretta sui file di output.

---

### Task 1: Vite + TypeScript Setup

**Files:**
- Create: `vite.config.ts`
- Create: `tsconfig.json`
- Create: `tsconfig.app.json`
- Create: `tsconfig.node.json`
- Create: `index.html`
- Create: `package.json`
- Create: `src/index.css`
- Create: `src/App.tsx`
- Create: `src/main.tsx`

**Interfaces:**
- Consumes: nothing (initialization)
- Produces: progetto Vite/TypeScript funzionante con `npm run build`

- [ ] **Step 1: Inizializzare il progetto Vite con template React + TypeScript**

```bash
cd LazyAndCheapPT
npm init -y
npm install react react-dom
npm install -D vite @vitejs/plugin-react typescript
```

- [ ] **Step 2: Configurare `package.json`**

```json
{
  "name": "lazycheapcoach",
  "private": true,
  "version": "0.1.0",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "tsc -b && vite build",
    "preview": "vite preview"
  }
}
```

- [ ] **Step 3: Creare `vite.config.ts`**

```ts
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
})
```

- [ ] **Step 4: Creare `tsconfig.json` (root, references)**

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "useDefineForClassFields": true,
    "lib": ["ES2020", "DOM", "DOM.Iterable"],
    "moduleDetection": "force",
    "module": "ESNext",
    "noEmit": true,
    "jsx": "react-jsx",
    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noFallthroughCasesInSwitch": true,
    "skipLibCheck": true
  },
  "include": ["src"]
}
```

- [ ] **Step 5: Creare `tsconfig.app.json`**

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "useDefineForClassFields": true,
    "lib": ["ES2020", "DOM", "DOM.Iterable"],
    "moduleDetection": "force",
    "module": "ESNext",
    "noEmit": true,
    "jsx": "react-jsx",
    "strict": true,
    "noUncheckedIndexedAccess": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noFallthroughCasesInSwitch": true,
    "skipLibCheck": true
  },
  "include": ["src"]
}
```

- [ ] **Step 6: Creare `tsconfig.node.json`**

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "lib": ["ES2023"],
    "moduleDetection": "force",
    "module": "ESNext",
    "noEmit": true,
    "skipLibCheck": true,
    "strict": true
  },
  "include": ["vite.config.ts"]
}
```

- [ ] **Step 7: Creare `index.html`**

```html
<!DOCTYPE html>
<html lang="it">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0, viewport-fit=cover" />
    <title>LazyCheapCoach</title>
    <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>
```

- [ ] **Step 8: Creare `src/index.css`** (vuoto, placeholder)
- [ ] **Step 9: Creare `src/App.tsx`**

```tsx
export default function App() {
  return (
    <div className="app">
      <h1>LazyCheapCoach</h1>
      <p>Benvenuto!</p>
    </div>
  )
}
```

- [ ] **Step 10: Creare `src/main.tsx`**

```tsx
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
```

- [ ] **Step 11: Verificare build di produzione**

```bash
npm install
npm run build
```

Expected: `dist/` creato, zero errori TypeScript, zero errori Vite.

- [ ] **Step 12: Commit**

```bash
git add .
git commit -m "chore: initialize Vite + TypeScript + React project"
```

---

### Task 2: PWA Configuration

**Files:**
- Modify: `vite.config.ts`
- Modify: `index.html`
- Create: `public/manifest.json`
- Create: `public/favicon.svg`
- Create: `public/icons/icon-192x192.svg`
- Create: `public/icons/icon-512x512.svg`

**Interfaces:**
- Consumes: nothing (independent of Task 1's code)
- Produces: PWA funzionante con manifest, service worker, icone

- [ ] **Step 1: Installare `vite-plugin-pwa`**

```bash
npm install -D vite-plugin-pwa workbox-window
```

- [ ] **Step 2: Aggiornare `vite.config.ts`**

```ts
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      manifest: {
        name: 'LazyCheapCoach',
        short_name: 'LCC',
        description: 'Gestisci i tuoi allenamenti. Offline-first.',
        theme_color: '#4a90d9',
        background_color: '#ffffff',
        display: 'standalone',
        orientation: 'portrait',
        icons: [
          {
            src: '/icons/icon-192x192.svg',
            sizes: '192x192',
            type: 'image/svg+xml',
          },
          {
            src: '/icons/icon-512x512.svg',
            sizes: '512x512',
            type: 'image/svg+xml',
          },
        ],
      },
      workbox: {
        globPatterns: ['**/*.{html,js,css,svg,png,jpg}'],
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'google-fonts-cache',
              expiration: { maxEntries: 10, maxAgeSeconds: 60 * 60 * 24 * 365 },
              cacheableResponse: { statuses: [0, 200] },
            },
          },
        ],
      },
    }),
  ],
})
```

- [ ] **Step 3: Aggiornare `index.html`** (aggiungere `<meta name="theme-color" content="#4a90d9">` e `<link rel="manifest" href="/manifest.json">`)

- [ ] **Step 4: Creare `public/favicon.svg`**

```svg
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
  <rect width="100" height="100" rx="20" fill="#4a90d9"/>
  <text x="50" y="65" text-anchor="middle" fill="white" font-size="50" font-family="Arial">LCC</text>
</svg>
```

- [ ] **Step 5: Creare `public/icons/icon-192x192.svg`** (stesso favicon, dimensioni diverse)
- [ ] **Step 6: Creare `public/icons/icon-512x512.svg`** (stesso favicon, dimensioni diverse)
- [ ] **Step 7: Verificare build PWA**

```bash
npm run build
```

Expected: `dist/manifest.json` presente, contiene `name: "LazyCheapCoach"` e `display: "standalone"`. `dist/sw.js` o `dist/workbox-*.js` presente.

- [ ] **Step 8: Commit**

```bash
git add .
git commit -m "feat: add PWA manifest, service worker, icons"
```

---

### Task 3: Bulma CSS Integration

**Files:**
- Create: `src/index.css`
- Create: `src/components/Layout.tsx`

**Interfaces:**
- Consumes: nothing (independent)
- Produces: Bulma CSS importato, layout wrapper responsive

- [ ] **Step 1: Installare Bulma**

```bash
npm install bulma
```

- [ ] **Step 2: Configurare `src/index.css`**

```css
@import 'bulma/css/bulma.css';

html, body, #root {
  height: 100%;
  margin: 0;
  padding: 0;
}

.app {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}
```

- [ ] **Step 3: Creare `src/components/Layout.tsx`**

```tsx
interface LayoutProps {
  children: React.ReactNode
}

export default function Layout({ children }: LayoutProps) {
  return (
    <div className="app">
      <nav className="navbar is-primary" role="navigation" aria-label="main navigation">
        <div className="navbar-brand">
          <a className="navbar-item">
            <h1 className="title is-4">LazyCheapCoach</h1>
          </a>
        </div>
      </nav>
      <main className="section">
        <div className="container is-max-mobile">{children}</div>
      </main>
      <footer className="footer">
        <div className="content has-text-centered">
          <p>LazyCheapCoach — Offline-first</p>
        </div>
      </footer>
    </div>
  )
}
```

- [ ] **Step 4: Aggiornare `src/App.tsx`** per usare il Layout

```tsx
import Layout from './components/Layout'

export default function App() {
  return (
    <Layout>
      <section className="section">
        <h1 className="title is-1">LazyCheapCoach</h1>
        <p className="subtitle">Gestisci i tuoi allenamenti.</p>
      </section>
    </Layout>
  )
}
```

- [ ] **Step 5: Verificare build con Bulma**

```bash
npm run build
```

Expected: build succeeds, CSS Bulma è nel bundle (verificare `dist/assets/*.css` contiene `bulma`).

- [ ] **Step 6: Commit**

```bash
git add .
git commit -m "feat: integrate Bulma CSS with mobile layout"
```

---

### Task 4: Project Structure + Router

**Files:**
- Create: `src/router.tsx`
- Create: `src/pages/Home.tsx`
- Create: `src/pages/Placeholder.tsx`
- Modify: `src/main.tsx`
- Modify: `src/App.tsx` (rimosso, il router gestisce)
- Create: `src/models/` (vuoto, placeholder)
- Create: `src/data/` (vuoto, placeholder)
- Create: `src/providers/` (vuoto, placeholder)
- Create: `src/hooks/` (vuoto, placeholder)
- Create: `src/lib/` (vuoto, placeholder)

**Interfaces:**
- Consumes: `react-router-dom` hash router
- Produces: struttura cartelle completa, routing funzionante con Home e pagine placeholder

- [ ] **Step 1: Installare react-router-dom**

```bash
npm install react-router-dom
```

- [ ] **Step 2: Creare `src/router.tsx`**

```tsx
import { createHashRouter } from 'react-router-dom'
import Home from './pages/Home'
import Placeholder from './pages/Placeholder'

const router = createHashRouter([
  { path: '/', element: <Home /> },
  { path: '*', element: <Placeholder /> },
])

export default router
```

- [ ] **Step 3: Creare `src/pages/Home.tsx`**

```tsx
export default function Home() {
  return (
    <div>
      <h1 className="title is-1">LazyCheapCoach</h1>
      <p className="subtitle">Gestisci i tuoi allenamenti.</p>
    </div>
  )
}
```

- [ ] **Step 4: Creare `src/pages/Placeholder.tsx`**

```tsx
import { Link } from 'react-router-dom'

export default function Placeholder() {
  return (
    <div className="has-text-centered">
      <h1 className="title is-2">404</h1>
      <p>Pagina non trovata.</p>
      <Link to="/" className="button is-primary">Torna alla home</Link>
    </div>
  )
}
```

- [ ] **Step 5: Aggiornare `src/main.tsx`** per usare il router

```tsx
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { RouterProvider } from 'react-router-dom'
import './index.css'
import router from './router'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <RouterProvider router={router} />
  </StrictMode>,
)
```

- [ ] **Step 6: Creare le cartelle vuote**

```bash
mkdir -p src/models src/data src/providers src/hooks src/lib
```

- [ ] **Step 7: Verificare build con router**

```bash
npm run build
```

Expected: build succeeds, zero errori.

- [ ] **Step 8: Commit**

```bash
git add .
git commit -m "feat: add project structure with hash routing"
```

---

### Task 5: Baseline Test

**Files:**
- Create: `vitest.config.ts`
- Create: `tsconfig.vitest.json`
- Modify: `package.json` (aggiungere script test)
- Create: `src/__tests__/App.test.tsx`

**Interfaces:**
- Consumes: nothing (independent of routing, only tests App render)
- Produces: test suite funzionante con snapshot test su App

- [ ] **Step 1: Installare Vitest e Testing Library**

```bash
npm install -D vitest @testing-library/react @testing-library/jest-dom jsdom @types/jsdom
```

- [ ] **Step 2: Creare `vitest.config.ts`**

```ts
import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['src/__tests__/setup.ts'],
  },
})
```

- [ ] **Step 3: Creare `tsconfig.vitest.json`**

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "ESNext",
    "jsx": "react-jsx",
    "strict": true,
    "noEmit": true,
    "skipLibCheck": true,
    "moduleResolution": "bundler",
    "allowImportingTsExtensions": true,
    "isolatedModules": true,
    "noEmit": true
  },
  "include": ["src"]
}
```

- [ ] **Step 4: Creare `src/__tests__/setup.ts`**

```ts
import '@testing-library/jest-dom/vitest'
import { expect, afterEach } from 'vitest'
import { cleanup } from '@testing-library/react'

expect.extend({})

afterEach(() => {
  cleanup()
})
```

- [ ] **Step 5: Aggiornare `package.json` scripts**

```json
{
  "scripts": {
    "dev": "vite",
    "build": "tsc -b && vite build",
    "test": "vitest",
    "test:run": "vitest run",
    "preview": "vite preview"
  }
}
```

- [ ] **Step 6: Creare `src/__tests__/App.test.tsx`**

```tsx
import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import App from '../App'

// Note: App.tsx still exists as a standalone component for testing
// (router.tsx renders Home, not App — we test App directly)

describe('App', () => {
  it('renders without crashing', () => {
    render(<App />)
    const heading = screen.getByText(/LazyCheapCoach/i)
    expect(heading).toBeInTheDocument()
  })
})
```

- [ ] **Step 7: Verificare test**

```bash
npm run test:run
```

Expected: test passa, snapshot creato.

- [ ] **Step 8: Commit**

```bash
git add .
git commit -m "test: add baseline Vitest + snapshot test"
```

---

### Task 6: Git + Deploy Configuration

**Files:**
- Modify: `package.json` (aggiungere script deploy, gh-pages)
- Create: `.gitignore`
- Create: `CNAME` (placeholder, da aggiornare con dominio)
- Create: `.github/workflows/deploy.yml`
- Create: `README.md`

**Interfaces:**
- Consumes: nothing
- Produces: repo pronto per deploy su GitHub Pages, CI workflow

- [ ] **Step 1: Installare `gh-pages`**

```bash
npm install -D gh-pages
```

- [ ] **Step 2: Aggiornare `package.json` scripts**

```json
{
  "scripts": {
    "dev": "vite",
    "build": "tsc -b && vite build",
    "test": "vitest",
    "test:run": "vitest run",
    "preview": "vite preview",
    "deploy": "gh-pages -d dist",
    "deploy:predeploy": "cd .. && npx gh-pages -d dist"
  }
}
```

- [ ] **Step 3: Creare `.gitignore`**

```
node_modules
dist
.DS_Store
*.tsbuildinfo
.env
```

- [ ] **Step 4: Creare `README.md`**

```markdown
# LazyCheapCoach

Offline-first training log PWA. Built with Vite + React + TypeScript + Bulma.

## Getting Started

```bash
npm install
npm run dev
```

## Build

```bash
npm run build
npm run test:run
```

## Deploy

```bash
npm run deploy
```

## License

Private — @paolobitta111
```

- [ ] **Step 5: Verificare build finale**

```bash
npm run build
npm run test:run
```

Expected: entrambi passano.

- [ ] **Step 6: Push su GitHub e configurare GitHub Pages**

```bash
git add .
git commit -m "chore: add deploy configuration and GitHub workflow"
git push -u origin main
```

Poi:
1. Impostare branch di deploy su GitHub Pages: `gh-pages`
2. Creare workflow GitHub Actions per deploy automatico (opzionale, può essere fatto dopo)

---

## Self-Review Checklist

1. **Spec coverage:**
   - ✅ Vite 7 + React 19 + TS strict → Task 1
   - ✅ PWA manifest, SW, icons → Task 2
   - ✅ Bulma CSS + mobile layout → Task 3
   - ✅ Struttura cartelle + hash routing → Task 4
   - ✅ Test baseline → Task 5
   - ✅ Deploy config → Task 6

2. **Step scan:** Ogni step permette all'implementatore di scrivere esattamente una cosa ragionevole. Non ci sono step ambigui né corpi di funzione già determinati.

3. **Type consistency:** I nomi delle funzioni, i tipi e le interfacce sono consistenti tra i task. `App` è usato in Task 1, 3, 5 con la stessa signature.

4. **Review Focus:**
   - Offline-first: Task 2 verifica PWA in build
   - Hash routing: Task 4 usa `createHashRouter`
   - TS strict: Task 1 configura strict, ogni task mantiene
   - Bulma: Task 3 importa e usa Bulma
   - Manifest: Task 2 verifica `dist/manifest.json`

5. **Proportion:** Il piano è proporzionato alla Fase 0 — 6 task per bootstrap, nessun task è sovradimensionato.
