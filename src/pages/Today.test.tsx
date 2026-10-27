import { fireEvent, render, waitFor } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import Today from './Today'
import { DataProvider, db } from '../data/db'
import { dateKey, weekdayIndex } from '../services/planning.service'
import type { TrainingPlan } from '../models/entities'

const today = dateKey(new Date())
const rule = [{ dayOfWeek: weekdayIndex(new Date()), order: 1 }]

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

function renderToday() {
  return render(
    <DataProvider>
      <MemoryRouter>
        <Today />
      </MemoryRouter>
    </DataProvider>,
  )
}

beforeEach(async () => {
  await Promise.all(db.tables.map((table) => table.clear()))
  localStorage.clear()
  vi.unstubAllGlobals()
})

afterEach(() => {
  vi.unstubAllGlobals()
})

describe('Today on real data', () => {
  it('renders one box per resolved scheda', async () => {
    await seedPlan({ id: 'a', name: 'Corsa', plannedSessions: rule })
    await seedPlan({ id: 'b', name: 'Palestra', dates: [today] })
    const view = renderToday()

    await waitFor(() => expect(view.getAllByText('Previsto')).toHaveLength(2))
    expect(view.getByRole('heading', { name: 'Corsa' })).toBeTruthy()
    expect(view.getByRole('heading', { name: 'Palestra' })).toBeTruthy()
    expect(view.getByRole('button', { name: 'Corsa · oggi' })).toBeTruthy()
    expect(view.getByRole('button', { name: 'Palestra · oggi' })).toBeTruthy()
  })

  it('skips only the skipped scheda', async () => {
    await seedPlan({ id: 'a', name: 'Corsa', plannedSessions: rule })
    await seedPlan({ id: 'b', name: 'Palestra', dates: [today] })
    const view = renderToday()

    await waitFor(() => expect(view.getAllByText('Previsto')).toHaveLength(2))
    fireEvent.click(view.getAllByRole('button', { name: 'Salta' })[0])

    await waitFor(() => expect(view.queryByRole('heading', { name: 'Corsa' })).toBeNull())
    expect(view.getByRole('heading', { name: 'Palestra' })).toBeTruthy()
  })

  it('substitutes via the combo and writes the rows', async () => {
    await seedPlan({ id: 'a', name: 'Corsa', plannedSessions: rule })
    await seedPlan({ id: 'c', name: 'Bici' })
    const view = renderToday()

    await waitFor(() => expect(view.getByRole('heading', { name: 'Corsa' })).toBeTruthy())
    fireEvent.click(view.getByRole('button', { name: 'Corsa · oggi' }))
    fireEvent.click(view.getByRole('button', { name: 'Bici' }))

    await waitFor(() => expect(view.getByRole('heading', { name: 'Bici' })).toBeTruthy())
    await waitFor(async () => {
      const rows = await db.plannedSessions.where('date').equals(today).toArray()
      expect(rows.find((row) => row.planId === 'a')?.status).toBe('cancelled')
      expect(rows.find((row) => row.planId === 'c')?.status).toBe('planned')
    })
  })

  it('assigns from an empty day and un-skips a skipped one', async () => {
    await seedPlan({ id: 'c', name: 'Bici' })
    const view = renderToday()

    await waitFor(() => expect(view.getByRole('heading', { name: 'Riposo' })).toBeTruthy())
    fireEvent.click(view.getByRole('button', { name: 'Scegli scheda' }))
    fireEvent.click(view.getByRole('button', { name: 'Bici' }))
    await waitFor(() => expect(view.getByRole('heading', { name: 'Bici' })).toBeTruthy())
    expect(view.getByText('Previsto')).toBeTruthy()

    fireEvent.click(view.getByRole('button', { name: 'Salta' }))
    await waitFor(() => expect(view.getByRole('heading', { name: 'Riposo' })).toBeTruthy())
    fireEvent.click(view.getByRole('button', { name: 'Scegli scheda' }))
    fireEvent.click(view.getByRole('button', { name: 'Bici' }))
    await waitFor(() => expect(view.getByRole('heading', { name: 'Bici' })).toBeTruthy())
  })

  it('materializes the planned row when a box is tapped', async () => {
    await seedPlan({ id: 'a', name: 'Corsa', plannedSessions: rule })
    const view = renderToday()

    await waitFor(() => expect(view.getByRole('heading', { name: 'Corsa' })).toBeTruthy())
    fireEvent.click(view.getByRole('heading', { name: 'Corsa' }))

    await waitFor(async () => {
      const rows = await db.plannedSessions.where('date').equals(today).toArray()
      expect(rows.find((row) => row.planId === 'a')?.status).toBe('planned')
    })
  })

  it('chats with the local model when configured', async () => {
    await seedPlan({ id: 'a', name: 'Corsa', plannedSessions: rule })
    localStorage.setItem('lcc.localLlm', JSON.stringify({ enabled: true, endpoint: 'http://x/v1', model: 'm' }))
    const fetchImpl = vi.fn(async () =>
      new Response(JSON.stringify({ choices: [{ message: { content: 'Accorcia pure' } }] }), { status: 200 }),
    )
    vi.stubGlobal('fetch', fetchImpl)
    const view = renderToday()

    await waitFor(() => expect(view.getByRole('heading', { name: 'Corsa' })).toBeTruthy())
    fireEvent.click(view.getByRole('button', { name: 'AI Check-In' }))
    fireEvent.change(view.getByPlaceholderText('Scrivi…'), { target: { value: 'gambe pesanti' } })
    fireEvent.click(view.getByRole('button', { name: 'Invia' }))

    await waitFor(() => expect(view.getByText('Accorcia pure')).toBeTruthy())
    expect(String((fetchImpl.mock.calls[0] as unknown[])[0])).toContain('/chat/completions')
  })

  it('falls back to offline when the model is unreachable', async () => {
    await seedPlan({ id: 'a', name: 'Corsa', plannedSessions: rule })
    localStorage.setItem('lcc.localLlm', JSON.stringify({ enabled: true, endpoint: 'http://x/v1', model: 'm' }))
    vi.stubGlobal(
      'fetch',
      vi.fn(async () => {
        throw new Error('down')
      }),
    )
    const view = renderToday()

    await waitFor(() => expect(view.getByRole('heading', { name: 'Corsa' })).toBeTruthy())
    fireEvent.click(view.getByRole('button', { name: 'AI Check-In' }))
    fireEvent.change(view.getByPlaceholderText('Scrivi…'), { target: { value: 'posso correre?' } })
    fireEvent.click(view.getByRole('button', { name: 'Invia' }))

    await waitFor(() => expect(view.getByText('Nessun modello collegato')).toBeTruthy())
    expect(view.getByText('posso correre?')).toBeTruthy()
  })
})