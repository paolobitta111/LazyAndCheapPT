import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { describe, expect, it } from 'vitest'

const root = resolve(import.meta.dirname, '../..')
const banned = [
  'is-primary',
  'is-info',
  'is-success',
  'is-warning',
  'is-danger',
  'is-light',
  'navbar',
  'class="box"',
  'class="card"',
  'title is-',
]

const pages = [
  'src/pages/Today.tsx',
  'src/pages/Plans.tsx',
  'src/pages/Calendar.tsx',
  'src/pages/WorkoutPlayer.tsx',
  'src/pages/LlmBridge.tsx',
  'src/pages/Settings.tsx',
  'src/pages/NotFound.tsx',
]

describe('content pages', () => {
  it('drops Bulma class tokens', () => {
    for (const page of pages) {
      const source = readFileSync(resolve(root, page), 'utf8')
      for (const token of banned) {
        expect(source, `${page} still has ${token}`).not.toContain(token)
      }
    }
  })

  it('does not leave a loose LLM link in the page body', () => {
    const today = readFileSync(resolve(root, 'src/pages/Today.tsx'), 'utf8')
    const settings = readFileSync(resolve(root, 'src/pages/Settings.tsx'), 'utf8')
    const app = readFileSync(resolve(root, 'src/App.tsx'), 'utf8')
    expect(today).not.toContain('href="#/llm"')
    expect(settings).not.toContain('href="#/llm"')
    expect(app).not.toContain('href="#/llm"')
  })
})
