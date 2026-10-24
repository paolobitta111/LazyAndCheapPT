import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { describe, expect, it } from 'vitest'
import App from '../App'

describe('App', () => {
  it('renders the welcome heading', () => {
    render(
      <MemoryRouter>
        <App />
      </MemoryRouter>,
    )
    expect(screen.getByRole('heading', { name: /Benvenuto/i })).toBeInTheDocument()
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
