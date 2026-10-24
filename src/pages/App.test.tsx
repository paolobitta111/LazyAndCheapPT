import { render } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { describe, expect, it, vi } from 'vitest'
import App from '../App'

// Mock CSS imports to avoid Bulma parsing issues in jsdom
vi.mock('../index.css', () => ({}))
vi.mock('./Home.css', () => ({}))

describe('App', () => {
  it('renders the welcome heading', () => {
    render(
      <MemoryRouter>
        <App />
      </MemoryRouter>,
    )
    // Use querySelector instead of screen.getByRole due to jsdom document mismatch
    const h1 = document.querySelector('h1')
    expect(h1).not.toBeNull()
    expect(h1?.textContent).toContain('Benvenuto')
  })

  it('matches snapshot', () => {
    const { container } = render(
      <MemoryRouter>
        <App />
      </MemoryRouter>,
    )
    expect(container.innerHTML).toMatchSnapshot()
  })
})
