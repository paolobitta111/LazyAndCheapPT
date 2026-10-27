import { fireEvent, render } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import Calendar from './Calendar'
import { buildMonthCells } from '../components/MonthCalendar'

function renderCalendar() {
  return render(<Calendar />)
}

describe('Calendar page', () => {
  it('shows the full October 2026 month without a data provider', () => {
    const { getByText } = renderCalendar()
    expect(getByText('Ottobre 2026')).toBeTruthy()
    for (const legend of ['Palestra', 'Corsa', 'Bici']) {
      expect(getByText(legend)).toBeTruthy()
    }
  })

  it('builds a Monday-first month grid', () => {
    const cells = buildMonthCells(2026, 9)
    expect(cells[0]).toBeNull()
    expect(cells[1]).toBeNull()
    expect(cells[2]).toBeNull()
    expect(cells[3]).toBe(1)
    expect(cells[33]).toBe(31)
  })

  it('opens a summary only for days with a session', () => {
    const { container, getByRole, getByText, queryByRole } = renderCalendar()

    const day23 = getByRole('button', { name: '23 ottobre' })
    const dot = day23.querySelector('span[data-sport="running"]')
    expect(dot).toBeTruthy()

    const day25 = getByRole('button', { name: '25 ottobre' })
    expect(day25.getAttribute('data-today')).toBe('true')
    expect(day25.querySelector('span[data-sport]')).toBeNull()

    fireEvent.click(getByRole('button', { name: '1 ottobre' }))
    expect(queryByRole('dialog')).toBeNull()

    fireEvent.click(day23)
    expect(getByRole('dialog').textContent).toContain('32 min · 5,1 km')
    expect(getByText('Ginocchio ok. Ritmo comodo.')).toBeTruthy()
    expect(getByText('Venerdì 23 ottobre')).toBeTruthy()
    expect(day23.style.background).not.toBe('transparent')

    const backdrop = container.querySelector('.day-modal-backdrop') as HTMLElement
    fireEvent.click(backdrop)
    expect(queryByRole('dialog')).toBeNull()
    expect(day23.style.background).toBe('transparent')
  })

  it('keeps the October dots after month navigation', () => {
    const { getByRole } = renderCalendar()
    fireEvent.click(getByRole('button', { name: 'Mese successivo' }))
    fireEvent.click(getByRole('button', { name: 'Mese precedente' }))
    const day23 = getByRole('button', { name: '23 ottobre' })
    expect(day23.querySelector('span[data-sport="running"]')).toBeTruthy()
  })
})