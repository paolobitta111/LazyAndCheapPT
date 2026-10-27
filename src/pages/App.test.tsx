import { render } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { describe, expect, it, vi } from 'vitest'
import App from '../App'

vi.mock('../index.css', () => ({}))
vi.mock('../pages/Today', () => ({ default: () => <div>Today Page</div> }))
vi.mock('../pages/Plans', () => ({ default: () => <div>Plans Page</div> }))
vi.mock('../pages/Calendar', () => ({ default: () => <div>Calendar Page</div> }))
vi.mock('../pages/History', () => ({ default: () => <div>History Page</div> }))
vi.mock('../pages/NotFound', () => ({ default: () => <div>404</div> }))
vi.mock('../pages/LlmBridge', () => ({ default: () => <div>LLM Page</div> }))

function renderAt(path: string) {
  return render(
    <MemoryRouter initialEntries={[path]}>
      <App />
    </MemoryRouter>,
  )
}

describe('App chrome', () => {
  it('shows an ink title capsule and four tabs on Oggi', () => {
    const { container } = renderAt('/')
    const title = container.querySelector('header.glass-bar')
    expect(container.querySelector('header .bar-title')?.textContent).toBe('Oggi')
    expect(container.querySelector('header button')?.textContent).toBe('LLM')
    expect([...container.querySelectorAll('nav button')].map((button) => button.textContent?.trim())).toEqual([
      'Oggi',
      'Schede',
      'Calendario',
      'Impostazioni',
    ])
    expect(title?.querySelector('button')?.textContent).toBe('LLM')
    expect(container.textContent).toContain('Oggi')
    expect(container.textContent).toContain('Impostazioni')
    expect(container.querySelector('.glass-bar')).not.toBeNull()
    expect(container.innerHTML).not.toContain('navbar')
    expect(container.innerHTML).not.toContain('bottom-nav')
    expect(title?.innerHTML ?? '').not.toContain('href=')
  })

  it('still renders History at /storico', () => {
    const { container } = renderAt('/storico')
    expect(container.textContent).toContain('History Page')
    expect(container.querySelector('button.active')).toBeNull()
  })

  it('does not mark a tab active on the LLM route', () => {
    const { container } = renderAt('/llm')
    expect(container.querySelector('header.glass-bar')?.textContent).toContain('LLM')
    expect(container.querySelector('button.active')).toBeNull()
  })
})
