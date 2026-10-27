import { fireEvent, render, waitFor, within } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { beforeEach, describe, expect, it } from 'vitest'
import Calendar from './Calendar'
import { buildMonthCells, monthNames } from '../components/MonthCalendar'
import { DataProvider, db } from '../data/db'
import { weekdayIndex } from '../services/planning.service'
import type { TrainingPlan } from '../models/entities'

const now = new Date()
const year = now.getFullYear()
const monthIndex = now.getMonth()
const monthLabel = `${monthNames[monthIndex].charAt(0).toUpperCase()}${monthNames[monthIndex].slice(1)} ${year}`
const day23 = `23 ${monthNames[monthIndex]}`
const day5 = `5 ${monthNames[monthIndex]}`
const date23 = `${year}-${String(monthIndex + 1).padStart(2, '0')}-23`

async function seedPlan(over: Partial<TrainingPlan>): Promise<void> {
  const plan: TrainingPlan = {
    id: over.name ?? 'p',
    name: over.name ?? 'p',
    description: '',
    exercises: [],
    version: 1,
    status: 'active',
    createdAt: new Date(),
    updatedAt: new Date(),
    ...over,
  }
  await db.trainingPlans.put(plan)
}

function renderCalendar() {
  return render(
    <DataProvider>
      <MemoryRouter>
        <Calendar />
      </MemoryRouter>
    </DataProvider>,
  )
}

beforeEach(async () => {
  await Promise.all(db.tables.map((table) => table.clear()))
})

describe('Calendar page', () => {
  it('builds a Monday-first month grid', () => {
    const cells = buildMonthCells(2026, 9)
    expect(cells[0]).toBeNull()
    expect(cells[3]).toBe(1)
    expect(cells[33]).toBe(31)
  })

  it('shows done and planned marks on assigned days and opens the summary', async () => {
    const weekday = weekdayIndex(new Date(year, monthIndex, 23))
    await seedPlan({ id: 'a', name: 'Corsa', sport: 'running', plannedSessions: [{ dayOfWeek: weekday, order: 1 }] })
    await seedPlan({ id: 'b', name: 'Bici', sport: 'cycling', dates: [date23] })
    await db.workoutLogs.put({
      id: 'w1',
      planId: 'a',
      date: date23,
      durationSec: 2700,
      notes: 'Ginocchio ok',
      createdAt: new Date(),
      updatedAt: new Date(),
    })

    const view = renderCalendar()
    await waitFor(() => expect(view.getByText(monthLabel)).toBeTruthy())

    const cell23 = view.getByRole('button', { name: day23 })
    await waitFor(() => expect(cell23.querySelectorAll('[data-mark]')).toHaveLength(2), { timeout: 3000 })
    expect(cell23.querySelector('[data-mark="done"]')).toBeTruthy()
    expect(cell23.querySelector('[data-mark="planned"]')).toBeTruthy()
    expect((cell23.querySelector('[data-mark="done"]') as HTMLElement)?.style.background).toContain('255, 107, 74')
    expect((cell23.querySelector('[data-mark="planned"]') as HTMLElement)?.style.background).toBe('transparent')

    fireEvent.click(cell23)
    await waitFor(() => expect(view.getByRole('dialog')).toBeTruthy())
    const modal = within(view.getByRole('dialog'))
    expect(modal.getByRole('heading', { name: 'Corsa' })).toBeTruthy()
    await waitFor(() => expect(modal.getByText('45 min')).toBeTruthy())
    expect(modal.getByText('Ginocchio ok')).toBeTruthy()
  })

  it('assigns a scheda to an empty day', async () => {
    await seedPlan({ id: 'b', name: 'Bici', sport: 'cycling' })
    const view = renderCalendar()
    await waitFor(() => expect(view.getByText(monthLabel)).toBeTruthy())

    const cell5 = view.getByRole('button', { name: day5 })
    expect(cell5.querySelectorAll('[data-mark]')).toHaveLength(0)

    fireEvent.click(cell5)
    await waitFor(() => expect(view.getByRole('dialog', { name: 'Assegna scheda' })).toBeTruthy())
    await waitFor(() => expect(view.getByRole('button', { name: 'Bici' })).toBeTruthy(), { timeout: 3000 })
    fireEvent.click(view.getByRole('button', { name: 'Bici' }))

    await waitFor(() => expect(view.queryByRole('dialog')).toBeNull())
    await waitFor(() => expect(cell5.querySelectorAll('[data-mark="planned"]')).toHaveLength(1))
  })

  it('adds a second workout from the summary modal', async () => {
    const weekday = weekdayIndex(new Date(year, monthIndex, 23))
    await seedPlan({ id: 'a', name: 'Corsa', sport: 'running', plannedSessions: [{ dayOfWeek: weekday, order: 1 }] })
    await seedPlan({ id: 'b', name: 'Bici', sport: 'cycling' })
    const view = renderCalendar()
    await waitFor(() => expect(view.getByText(monthLabel)).toBeTruthy())

    const cell23 = view.getByRole('button', { name: day23 })
    await waitFor(() => expect(cell23.querySelectorAll('[data-mark]')).toHaveLength(1), { timeout: 3000 })

    fireEvent.click(cell23)
    await waitFor(() => expect(view.getByRole('dialog')).toBeTruthy())
    const summary = within(view.getByRole('dialog'))
    await waitFor(() => expect(summary.getByRole('button', { name: 'Aggiungi allenamento' })).toBeTruthy(), { timeout: 3000 })
    fireEvent.click(summary.getByRole('button', { name: 'Aggiungi allenamento' }))
    await waitFor(() => expect(view.getByRole('dialog', { name: 'Assegna scheda' })).toBeTruthy())
    await waitFor(() => expect(view.getByRole('button', { name: 'Bici' })).toBeTruthy(), { timeout: 3000 })
    fireEvent.click(view.getByRole('button', { name: 'Bici' }))

    await waitFor(() => expect(cell23.querySelectorAll('[data-mark]')).toHaveLength(2), { timeout: 3000 })
  })

  it('navigates months and keeps the dots', async () => {
    const weekday = weekdayIndex(new Date(year, monthIndex, 23))
    await seedPlan({ id: 'a', name: 'Corsa', sport: 'running', plannedSessions: [{ dayOfWeek: weekday, order: 1 }] })
    const view = renderCalendar()
    await waitFor(() => expect(view.getByText(monthLabel)).toBeTruthy())

    fireEvent.click(view.getByRole('button', { name: 'Mese successivo' }))
    const nextMonth = (monthIndex + 1) % 12
    await waitFor(() =>
      expect(view.getByText(`${monthNames[nextMonth].charAt(0).toUpperCase()}${monthNames[nextMonth].slice(1)} ${nextMonth === 0 ? year + 1 : year}`)).toBeTruthy(),
    )

    fireEvent.click(view.getByRole('button', { name: 'Mese precedente' }))
    await waitFor(() => expect(view.getByText(monthLabel)).toBeTruthy())
    const cell23 = view.getByRole('button', { name: day23 })
    await waitFor(() => expect(cell23.querySelector('[data-mark="planned"]')).toBeTruthy())
  })
})
