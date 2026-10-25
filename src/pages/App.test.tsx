import { render } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { describe, expect, it, vi } from 'vitest'
import App from '../App'

const renderWithRouter = (ui: React.ReactElement) => render(<MemoryRouter>{ui}</MemoryRouter>)

// Mock CSS imports to avoid Bulma parsing issues in jsdom
vi.mock('../index.css', () => ({}))

// Mock all page components to avoid Bulma CSS parsing
vi.mock('../pages/Today', () => ({ default: () => <div data-testid="today-page">Today Page</div> }))
vi.mock('../pages/Plans', () => ({ default: () => <div data-testid="plans-page">Plans Page</div> }))
vi.mock('../pages/Calendar', () => ({ default: () => <div data-testid="calendar-page">Calendar Page</div> }))
vi.mock('../pages/History', () => ({ default: () => <div data-testid="history-page">History Page</div> }))
vi.mock('../pages/NotFound', () => ({ default: () => <div data-testid="not-found-page">404</div> }))

describe('App', () => {
  it('renders the layout shell', () => {
    const { container } = renderWithRouter(<App />)
    const html = container.innerHTML
    // Navbar should be present
    expect(html).toContain('LazyCheapCoach')
    // Today page should be rendered by default
    expect(html).toContain('Today Page')
  })

  it('renders bottom navigation', () => {
    const { container } = renderWithRouter(<App />)
    const html = container.innerHTML
    expect(html).toContain('bottom-nav')
    expect(html).toContain('bottom-nav-item')
  })
})
