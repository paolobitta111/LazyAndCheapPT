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

  it('adds the sheet and iOS control classes', () => {
    const css = read('src/styles/glass.css')
    for (const token of [
      '--fill: rgba(118, 118, 128, 0.24)',
      '.sheet .group {',
      '.group .group {',
      'border-radius: var(--r-card) var(--r-card) 0 0',
      'max(1rem, env(safe-area-inset-bottom))',
      '@media (min-width: 48rem)',
    ]) {
      expect(css).toContain(token)
    }

    for (const name of ['seg-item', 'pill', 'grabber']) {
      const block = css.match(new RegExp(`\\.${name}\\s*\\{[^}]*\\}`))
      expect(block).not.toBeNull()
      expect(block?.[0]).not.toContain('transition')
    }
  })

  it('drops Bulma and uses the system font', () => {
    const css = read('src/styles/glass.css')
    expect(css).toContain('-apple-system, BlinkMacSystemFont, system-ui, sans-serif')
    const pkg = JSON.parse(read('package.json')) as { dependencies?: Record<string, string> }
    expect(pkg.dependencies).not.toHaveProperty('bulma')
  })

  it('lays out the glass chrome: fixed capsule bars and centered column', () => {
    const index = read('src/index.css')
    expect(index).not.toContain('bulma')
    expect(index).not.toContain('navbar')
    expect(index).not.toContain('bottom-nav')
    expect(index).toContain('.layout-shell')
    expect(index).toMatch(/header\.glass-bar,\s*nav\.glass-bar\s*\{[^}]*position:\s*fixed/)
    expect(index).toMatch(/\.main-content\s*\{[^}]*width:\s*min\(32rem/)
  })

  it('sets the status bar to pure black', () => {
    const manifest = read('public/manifest.json')
    expect(manifest).toContain('"theme_color": "#000000"')
    expect(manifest).toContain('"background_color": "#000000"')
    const vite = read('vite.config.ts')
    expect(vite).toContain("theme_color: '#000000'")
    expect(vite).toContain("background_color: '#000000'")
    expect(read('index.html')).toContain('<meta name="theme-color" content="#000000" />')
    const css = read('src/styles/glass.css')
    expect(css).not.toContain('--ink')
    expect(css).not.toContain('ink-fallback')
  })

  it('runs content edge-to-edge under the bars with a scroll-aware bar title', () => {
    const index = read('src/index.css')
    expect(index).not.toMatch(/\.layout-shell\s*\{[^}]*padding:\s*5\.25rem/)
    expect(index).toMatch(/\.bar-title\s*\{[^}]*opacity:\s*0/)
    expect(index).toMatch(/\[data-scrolled="true"\][^{]*\.bar-title\s*\{[^}]*opacity:\s*1/)
    expect(index).toMatch(/env\(safe-area-inset-bottom\)/)
    expect(index).not.toMatch(/text-transform:\s*uppercase/)
    expect(index).not.toContain('#0b0b0d')
  })
})
