import { fireEvent, render, waitFor } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { describe, expect, it, vi } from 'vitest'
import Today from './Today'
import { buildCheckInPrompt } from './today-mock'

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
    expect(openCombo.style.border).not.toBe('')
    expect(openCombo.style.borderRadius).not.toBe('')
    expect(openCombo.style.background).not.toBe('')
    const choiceButton = getByRole('button', { name: 'Palestra giorno 1' }) as HTMLElement
    expect(choiceButton.style.background).not.toBe('')
    expect(choiceButton.style.color).not.toBe('')

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

  it('chats a check-in without a model and imports a reply', async () => {
    const writeText = vi.fn(async () => undefined)
    Object.defineProperty(window.navigator, 'clipboard', { value: { writeText }, configurable: true })
    const share = vi.fn(async () => {
      throw new Error('no share')
    })
    Object.defineProperty(window.navigator, 'share', { value: share, configurable: true })

    const { container, getByRole, getByText, queryByText } = renderToday()

    fireEvent.click(getByRole('button', { name: 'AI Check-In' }))
    const dialog = getByRole('dialog')
    expect(dialog.textContent).toContain('Check-in · Corsa di oggi')
    expect(getByRole('heading', { name: 'Chat' })).toBeTruthy()
    const eyebrow = container.querySelector('.checkin-eyebrow') as HTMLElement
    expect(eyebrow.style.textTransform).not.toBe('uppercase')

    fireEvent.click(getByRole('button', { name: 'Invia' }))
    expect(queryByText('Nessun modello collegato')).toBeNull()
    expect(container.querySelectorAll('[data-role="user"]')).toHaveLength(0)

    const composer = getByRole('textbox') as HTMLInputElement
    fireEvent.change(composer, { target: { value: 'ho le gambe pesanti' } })
    fireEvent.click(getByRole('button', { name: 'Invia' }))
    expect(container.querySelectorAll('[data-role="user"]')).toHaveLength(1)
    expect(getByText('ho le gambe pesanti')).toBeTruthy()
    expect(getByText('Nessun modello collegato')).toBeTruthy()

    fireEvent.click(getByRole('button', { name: 'Condividi' }))
    await waitFor(() => {
      expect(getByText('Condivisione non disponibile. Prompt copiato.')).toBeTruthy()
    })
    expect(writeText).toHaveBeenCalledWith(buildCheckInPrompt('Corsa', 'ho le gambe pesanti'))

    fireEvent.click(getByRole('button', { name: 'Importa risposta' }))
    const textareas = container.querySelectorAll('textarea')
    expect(textareas).toHaveLength(1)
    fireEvent.click(getByRole('button', { name: 'Aggiungi' }))
    expect(container.querySelectorAll('[data-role="assistant"]')).toHaveLength(0)

    fireEvent.change(textareas[0], { target: { value: 'Accorcia a 25 minuti' } })
    fireEvent.click(getByRole('button', { name: 'Aggiungi' }))
    expect(container.querySelectorAll('[data-role="assistant"]')).toHaveLength(1)
    expect(getByText('Accorcia a 25 minuti')).toBeTruthy()
    expect(getByRole('heading', { name: 'Corsa' })).toBeTruthy()

    fireEvent.click(getByRole('button', { name: 'Chiudi' }))
    expect(container.querySelector('[role="dialog"]')).toBeNull()
    fireEvent.click(getByRole('button', { name: 'AI Check-In' }))
    expect(container.querySelectorAll('[data-role="user"]')).toHaveLength(1)
    expect(container.querySelectorAll('[data-role="assistant"]')).toHaveLength(1)

    fireEvent.click(getByRole('button', { name: 'Salta' }))
    fireEvent.click(getByRole('button', { name: 'AI Check-In' }))
    expect(getByRole('dialog').textContent).toContain('Check-in · Riposo')
  })
})
