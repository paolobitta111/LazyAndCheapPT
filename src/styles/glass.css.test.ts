import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { describe, expect, it } from 'vitest'

const root = resolve(import.meta.dirname, '../..')

function read(path: string): string {
  return readFileSync(resolve(root, path), 'utf8')
}

describe('glass tokens', () => {
  it('pins the B-direction material, glass, and radius tokens', () => {
    const css = read('src/styles/glass.css')
    for (const token of [
      'blur(18px) saturate(180%)',
      'rgb(255 255 255 / 0.13)',
      'rgb(255 255 255 / 0.05)',
      'rgb(255 255 255 / 0.14)',
      'rgb(255 255 255 / 0.32)',
      'inset 0 1px 0 rgb(255 255 255 / 0.30)',
      '0 12px 30px rgb(0 0 0 / 0.45)',
      'rgb(28 28 30 / 0.92)',
      '--tint: #ff6b4a',
      '--surface: #1c1c1e',
      '--surface-2: #2c2c2e',
      '--r-card: 26px',
      '--r-inner: 12px',
      '@supports not ((-webkit-backdrop-filter: blur(1px)) or (backdrop-filter: blur(1px)))',
      '@media (prefers-reduced-motion: reduce)',
    ]) {
      expect(css).toContain(token)
    }

    expect(css).not.toContain('blur(20px)')
    expect(css).not.toContain('.glass .glass')
    expect(css).not.toContain('glass-pill')
    expect(css).not.toContain('url("#liquid-glass")')
    expect(css).not.toContain('#0b0b0d')
    expect(css).toMatch(/\.group\s*\{[^}]*background:\s*var\(--surface\)/)
    expect(css).not.toMatch(/\.group\s*\{[^}]*backdrop-filter/)
  })

  it('drops Bulma and uses the system font', () => {
    const index = read('src/index.css')
    expect(index).not.toContain('bulma')
    expect(index).toContain('-apple-system, BlinkMacSystemFont, system-ui, sans-serif')
    const pkg = JSON.parse(read('package.json')) as { dependencies?: Record<string, string> }
    expect(pkg.dependencies).not.toHaveProperty('bulma')
  })

  it('lays out the glass chrome: fixed capsule bars and centered column', () => {
    const index = read('src/index.css')
    expect(index).not.toContain('navbar')
    expect(index).not.toContain('bottom-nav')
    expect(index).toContain('.layout-shell')
    expect(index).toMatch(/header\.glass-bar,\s*nav\.glass-bar\s*\{[^}]*position:\s*fixed/)
    expect(index).toMatch(/\.main-content\s*\{[^}]*width:\s*min\(32rem/)
  })
})
