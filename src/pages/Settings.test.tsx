import { fireEvent, render } from '@testing-library/react'
import { MemoryRouter, useLocation } from 'react-router-dom'
import { describe, expect, it } from 'vitest'
import Settings from './Settings'

function PathProbe() {
  const location = useLocation()
  return <p data-testid="probe-path">{location.pathname}</p>
}

function renderSettings() {
  return render(
    <MemoryRouter initialEntries={['/impostazioni']}>
      <Settings />
      <PathProbe />
    </MemoryRouter>,
  )
}

describe('Settings', () => {
  it('navigates to the LLM bridge from the Scambio LLM row', () => {
    const view = renderSettings()
    fireEvent.click(view.getByRole('button', { name: 'Scambio LLM' }))
    expect(view.getByTestId('probe-path').textContent).toBe('/llm')
  })

  it('renders the Scambio LLM row as the first group with a chevron', () => {
    const { container } = renderSettings()
    const row = container.querySelector('button.group-row[aria-label="Scambio LLM"]')
    expect(row).not.toBeNull()
    expect(row?.textContent).toContain('Scambio LLM')
    expect(row?.textContent).toContain('›')
    expect(container.querySelector('.group')).toBe(row?.parentElement)
  })
})
