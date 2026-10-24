import '@testing-library/jest-dom/vitest'
import { IDBFactory, IDBKeyRange, IDBCursor } from 'fake-indexeddb'
import { JSDOM } from 'jsdom'

// Configure JSDOM for a browser-like environment
const dom = new JSDOM('<!DOCTYPE html><html><body></body></html>', {
  url: 'http://localhost',
})

const window_ = dom.window as any
const document_ = window_.document as any
const navigator_ = window_.navigator as any

// Attach fake-indexeddb to window (Dexie checks window.indexedDB, not globalThis)
const idbFactory = new IDBFactory()
;(window_ as any).indexedDB = idbFactory
;(window_ as any).IDBKeyRange = IDBKeyRange
;(window_ as any).IDBCursor = IDBCursor

// Sync globals (document is getter-only in vitest — use defineProperty)
Object.defineProperty(globalThis, 'window', { value: window_, writable: true, configurable: true })
Object.defineProperty(globalThis, 'document', { value: document_, writable: true, configurable: true })
Object.defineProperty(globalThis, 'navigator', { value: navigator_, writable: true, configurable: true })
Object.defineProperty(globalThis, 'indexedDB', { value: idbFactory, writable: true, configurable: true })
Object.defineProperty(globalThis, 'IDBKeyRange', { value: IDBKeyRange, writable: true, configurable: true })
