import { fireEvent, render } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { describe, expect, it } from 'vitest'
import Today from './Today'

function renderToday() {
  return render(
    <MemoryRouter>
      <Today />
    </MemoryRouter>,
  )
}

describe('Today', () => {
  it('skips a session and substitutes another scheda', () => {
    const { container, getByRole, queryByRole, getByText, queryByText } = renderToday()

    expect(container.querySelector('.today-date')?.textContent).toBeTruthy()
    expect(getByRole('heading', { name: 'Corsa' })).toBeTruthy()
    expect(getByText('Previsto')).toBeTruthy()
    expect(getByText('Fondo lento · 40 min · zona 2')).toBeTruthy()
    expect(getByRole('button', { name: 'Salta' })).toBeTruthy()
    expect(getByRole('button', { name: 'AI Check-In' })).toBeTruthy()
    expect(getByRole('button', { name: 'Corsa · oggi' })).toBeTruthy()

    fireEvent.click(getByRole('button', { name: 'Corsa · oggi' }))
    expect(getByRole('button', { name: 'Palestra giorno 1' })).toBeTruthy()
    expect(container.querySelectorAll('button').length).toBeGreaterThan(0)
    const faceMatches = [...container.querySelectorAll('button')].filter((button) => button.textContent === 'Corsa · oggi')
    expect(faceMatches).toHaveLength(1)
    const openCombo = container.querySelector('.substitute-combo') as HTMLElement
    expect(openCombo.style.maxHeight).toBe('132px')
    expect(openCombo.style.position).toBe('absolute')

    fireEvent.click(getByRole('button', { name: 'Palestra giorno 1' }))
    expect(getByRole('heading', { name: 'Palestra giorno 1' })).toBeTruthy()
    expect(getByRole('button', { name: 'Palestra giorno 1 · oggi' })).toBeTruthy()
    expect(queryByRole('button', { name: 'Bici' })).toBeNull()

    fireEvent.click(getByRole('button', { name: 'Salta' }))
    expect(getByRole('heading', { name: 'Riposo' })).toBeTruthy()
    expect(getByText('Nessuna sessione')).toBeTruthy()
    expect(queryByText('Previsto')).toBeNull()
    expect(queryByRole('button', { name: 'Salta' })).toBeNull()
    expect(getByRole('button', { name: 'Scegli scheda' })).toBeTruthy()

    fireEvent.click(getByRole('button', { name: 'Scegli scheda' }))
    fireEvent.click(getByRole('button', { name: 'Bici' }))
    expect(getByRole('heading', { name: 'Bici' })).toBeTruthy()
    expect(getByText('Previsto')).toBeTruthy()
    expect(getByRole('button', { name: 'Salta' })).toBeTruthy()
  })

  it('shows weather and health cubes without labels', () => {
    const { container, getByRole } = renderToday()
    const text = container.textContent ?? ''

    for (const value of ['14°', '8', 'Zzz', '7h 12', '52', '3.240']) {
      expect(text).toContain(value)
    }
    expect(text).not.toContain('Sonno')
    expect(text).not.toContain('Meteo')
    expect(container.querySelectorAll('.metric-cube')).toHaveLength(2)

    fireEvent.click(getByRole('button', { name: 'Salta' }))
    expect(container.querySelectorAll('.metric-cube')).toHaveLength(2)
  })
})
