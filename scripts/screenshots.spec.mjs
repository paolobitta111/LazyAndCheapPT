// Screenshot capture for visual acceptance (design doc 2026-10-27, Task 7).
// Run: npx playwright test scripts/screenshots.mjs  (webServer auto-starts)
// Output: .superpowers/screenshots/<name>.png (git-ignored)
import { test } from '@playwright/test'
import { mkdirSync } from 'node:fs'
import { resolve } from 'node:path'

const OUT = resolve(import.meta.dirname, '../.superpowers/screenshots')
mkdirSync(OUT, { recursive: true })

const routes = [
  ['/', 'oggi'],
  ['/schede', 'schede'],
  ['/calendario', 'calendario'],
  ['/storico', 'storico'],
  ['/cardio', 'cardio'],
  ['/llm', 'llm'],
  ['/impostazioni', 'impostazioni'],
]

for (const [path, name] of routes) {
  test(`screenshot ${name}`, async ({ page }) => {
    await page.goto(`http://localhost:5173/#${path}`)
    await page.waitForTimeout(600)
    await page.screenshot({ fullPage: true, path: resolve(OUT, `${name}.png`) })
  })
}

// at-rest viewport capture: verifies the bar-title stays hidden at scrollY=0
// (fullPage captures scroll the page and flip data-scrolled=true)
test('screenshot oggi at rest (viewport only)', async ({ page }) => {
  await page.goto('http://localhost:5173/#/')
  await page.waitForTimeout(600)
  await page.screenshot({ path: resolve(OUT, 'oggi-at-rest.png') })
})
