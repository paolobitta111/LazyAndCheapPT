import { render } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { describe, expect, it, vi } from 'vitest'
import App from '../App'

vi.mock('../index.css', () => ({}))
vi.mock('../pages/Today', () => ({ default: () => <div>Today Page</div> }))
vi.mock('../pages/Plans', () => ({ default: () => <div>Plans Page</div> }))
vi.mock('../pages/Calendar', () => ({ default: () => <div>Calendar Page</div> }))
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
  it('shows a quiet header with the gear and three tabs on Oggi', () => {
    const { container } = renderAt('/')
    expect(container.querySelector('header .bar-title')?.textContent).toBe('Oggi')

    const gears = [...container.querySelectorAll('header button[aria-label="Impostazioni"]')]
    expect(gears).toHaveLength(1)
    expect(gears[0]!.querySelector('svg')).not.toBeNull()
    expect(gears[0]!.textContent).not.toContain('LLM')
    expect(container.querySelector('header')?.textContent).not.toContain('LLM')

    expect([...container.querySelectorAll('nav button')].map((button) => button.textContent?.trim())).toEqual([
      'Oggi',
      'Schede',
      'Calendario',
      'Impostazioni',
    ])

    expect(container.querySelector('.glass-bar')).not.toBeNull()
    expect(container.querySelector('header')?.innerHTML).not.toContain('href=')
  })

  it('unknown routes fall back to NotFound', () => {
    const storico = renderAt('/storico')
    expect(storico.container.textContent).toContain('404')
    expect(storico.container.querySelector('button.active')).toBeNull()

    const cardio = renderAt('/cardio')
    expect(cardio.container.textContent).toContain('404')
    expect(cardio.container.querySelector('button.active')).toBeNull()
  })

  it('does not mark a tab active on the LLM route', () => {
    const { container } = renderAt('/llm')
    expect(container.querySelector('header .bar-title')?.textContent).toBe('LLM')
    expect(container.querySelector('button.active')).toBeNull()
  })
})
