import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { describe, expect, it } from 'vitest'

const root = resolve(import.meta.dirname, '../..')

function read(path: string): string {
  return readFileSync(resolve(root, path), 'utf8')
}

describe('glass tokens', () => {
  it('pins the ink recipe, fallback, and reduced motion', () => {
    const css = read('src/styles/glass.css')
    for (const token of [
      'rgb(255 255 255 / 0.10)',
      'rgb(255 255 255 / 0.03)',
      'rgb(255 255 255 / 0.16)',
      'inset 0 1px 0 rgb(255 255 255 / 0.28)',
      '0 10px 28px rgb(0 0 0 / 0.45)',
      'blur(20px)',
      'saturate(160%)',
      'rgb(28 28 30 / 0.92)',
      '#f5f5f7',
      '#0b0b0d',
      '@supports not ((-webkit-backdrop-filter: blur(1px)) or (backdrop-filter: blur(1px)))',
    ]) {
      expect(css).toContain(token)
    }

    const motion = css.match(/@media \(prefers-reduced-motion: reduce\)\s*\{([\s\S]*?)\n\}/)
    expect(motion?.[1]).toMatch(/\.glass-pill[\s\S]*?(transition:\s*none|transform:\s*none)/)

    const bar = css.match(/\.glass-bar\s*\{([^}]*)\}/)
    const blur = bar?.[1].match(/blur\((\d+(?:\.\d+)?)px\)/)
    expect(blur).not.toBeNull()
    const px = Number(blur?.[1])
    expect(px).toBeGreaterThanOrEqual(2)
    expect(px).toBeLessThanOrEqual(8)
  })

  it('drops Bulma and uses the system font', () => {
    const index = read('src/index.css')
    expect(index).not.toContain('bulma')
    expect(index).toContain('-apple-system, BlinkMacSystemFont, system-ui, sans-serif')
    const pkg = JSON.parse(read('package.json')) as { dependencies?: Record<string, string> }
    expect(pkg.dependencies).not.toHaveProperty('bulma')
  })

  it('sets the status bar to ink', () => {
    const manifest = read('public/manifest.json')
    expect(manifest).toContain('"theme_color": "#0b0b0d"')
    expect(manifest).toContain('"background_color": "#0b0b0d"')
    const vite = read('vite.config.ts')
    expect(vite).toContain("theme_color: '#0b0b0d'")
    expect(vite).toContain("background_color: '#0b0b0d'")
    expect(read('index.html')).toContain('<meta name="theme-color" content="#0b0b0d" />')
  })
})
